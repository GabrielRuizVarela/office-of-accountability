/**
 * Custom Auth.js adapter for Neo4j.
 *
 * Stores User, Account, and VerificationToken nodes in Neo4j.
 * Uses JWT sessions so no Session node is needed.
 *
 * All queries are parameterized (no Cypher injection).
 * All functions return immutable objects.
 */

import type { Adapter, AdapterUser, AdapterAccount } from '@auth/core/adapters'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery, executeWrite } from '../neo4j/client'

function toAdapterUser(record: Neo4jRecord): AdapterUser {
  const u = record.get('u').properties
  return {
    id: String(u.id),
    email: String(u.email),
    name: u.name ? String(u.name) : null,
    image: u.image ? String(u.image) : null,
    emailVerified: u.emailVerified ? new Date(String(u.emailVerified)) : null,
  }
}

function toAdapterAccount(record: Neo4jRecord): AdapterAccount {
  const a = record.get('a').properties
  return {
    userId: String(a.userId),
    type: String(a.type) as AdapterAccount['type'],
    provider: String(a.provider),
    providerAccountId: String(a.providerAccountId),
    refresh_token: a.refresh_token ? String(a.refresh_token) : undefined,
    access_token: a.access_token ? String(a.access_token) : undefined,
    expires_at: a.expires_at ? Number(a.expires_at) : undefined,
    token_type: a.token_type ? (String(a.token_type) as Lowercase<string>) : undefined,
    scope: a.scope ? String(a.scope) : undefined,
    id_token: a.id_token ? String(a.id_token) : undefined,
  }
}

export function Neo4jAdapter(): Adapter {
  return {
    async createUser(user) {
      const now = new Date().toISOString()
      const id = crypto.randomUUID()

      const result = await writeQuery(
        `CREATE (u:User {
          id: $id,
          email: $email,
          name: $name,
          image: $image,
          emailVerified: $emailVerified,
          verification_tier: 0,
          created_at: $now,
          updated_at: $now
        })
        RETURN u`,
        {
          id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          emailVerified: user.emailVerified?.toISOString() ?? null,
          now,
        },
        toAdapterUser,
      )

      return result.records[0]
    },

    async getUser(id) {
      const result = await readQuery('MATCH (u:User {id: $id}) RETURN u', { id }, toAdapterUser)

      return result.records[0] ?? null
    },

    async getUserByEmail(email) {
      const result = await readQuery(
        'MATCH (u:User {email: $email}) RETURN u',
        { email },
        toAdapterUser,
      )

      return result.records[0] ?? null
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await readQuery(
        `MATCH (a:Account {provider: $provider, providerAccountId: $providerAccountId})
         -[:BELONGS_TO]->(u:User)
         RETURN u`,
        { provider, providerAccountId },
        toAdapterUser,
      )

      return result.records[0] ?? null
    },

    async updateUser(user) {
      const now = new Date().toISOString()

      const result = await writeQuery(
        `MATCH (u:User {id: $id})
         SET u.name = COALESCE($name, u.name),
             u.email = COALESCE($email, u.email),
             u.image = COALESCE($image, u.image),
             u.emailVerified = COALESCE($emailVerified, u.emailVerified),
             u.updated_at = $now
         RETURN u`,
        {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          emailVerified: user.emailVerified?.toISOString() ?? null,
          now,
        },
        toAdapterUser,
      )

      return result.records[0]
    },

    async deleteUser(userId) {
      await executeWrite(
        `MATCH (u:User {id: $userId})
         OPTIONAL MATCH (u)<-[:BELONGS_TO]-(a:Account)
         DETACH DELETE u, a`,
        { userId },
      )
    },

    async linkAccount(account) {
      const result = await writeQuery(
        `MATCH (u:User {id: $userId})
         CREATE (a:Account {
           userId: $userId,
           type: $type,
           provider: $provider,
           providerAccountId: $providerAccountId,
           refresh_token: $refresh_token,
           access_token: $access_token,
           expires_at: $expires_at,
           token_type: $token_type,
           scope: $scope,
           id_token: $id_token
         })-[:BELONGS_TO]->(u)
         RETURN a`,
        {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token ?? null,
          access_token: account.access_token ?? null,
          expires_at: account.expires_at ?? null,
          token_type: account.token_type ?? null,
          scope: account.scope ?? null,
          id_token: account.id_token ?? null,
        },
        toAdapterAccount,
      )

      return result.records[0] ?? undefined
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await executeWrite(
        `MATCH (a:Account {provider: $provider, providerAccountId: $providerAccountId})
         DETACH DELETE a`,
        { provider, providerAccountId },
      )
    },

    async createVerificationToken({ identifier, token, expires }) {
      await executeWrite(
        `CREATE (vt:VerificationToken {
          identifier: $identifier,
          token: $token,
          expires: $expires
        })`,
        {
          identifier,
          token,
          expires: expires.toISOString(),
        },
      )

      return { identifier, token, expires }
    },

    async useVerificationToken({ identifier, token }) {
      const result = await writeQuery(
        `MATCH (vt:VerificationToken {identifier: $identifier, token: $token})
         DELETE vt
         RETURN vt.identifier AS identifier, vt.token AS token, vt.expires AS expires`,
        { identifier, token },
        (record: Neo4jRecord) => ({
          identifier: String(record.get('identifier')),
          token: String(record.get('token')),
          expires: new Date(String(record.get('expires'))),
        }),
      )

      return result.records[0] ?? null
    },
  }
}
