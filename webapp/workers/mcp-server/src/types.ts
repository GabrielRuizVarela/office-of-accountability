/**
 * MCP protocol types for the investigation MCP server.
 *
 * Follows the Model Context Protocol specification:
 * - JSON-RPC 2.0 message format
 * - SSE transport for server-to-client streaming
 * - HTTP POST for client-to-server messages
 */

export interface Env {
  API_KEYS: KVNamespace
  NEXTJS_API_URL: string
}

// ---------------------------------------------------------------------------
// JSON-RPC 2.0
// ---------------------------------------------------------------------------

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: JsonRpcError
}

export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
}

export interface JsonRpcNotification {
  jsonrpc: '2.0'
  method: string
  params?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// MCP Protocol — Server Info
// ---------------------------------------------------------------------------

export interface MCPServerInfo {
  name: string
  version: string
}

export interface MCPCapabilities {
  tools?: Record<string, never>
  resources?: Record<string, never>
}

export interface MCPInitializeResult {
  protocolVersion: string
  capabilities: MCPCapabilities
  serverInfo: MCPServerInfo
}

// ---------------------------------------------------------------------------
// MCP Protocol — Tools
// ---------------------------------------------------------------------------

export interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface MCPToolCallParams {
  name: string
  arguments?: Record<string, unknown>
}

export interface MCPToolResult {
  content: MCPContent[]
  isError?: boolean
}

export interface MCPContent {
  type: 'text' | 'image' | 'resource'
  text?: string
  data?: string
  mimeType?: string
  resource?: { uri: string; text: string; mimeType: string }
}

// ---------------------------------------------------------------------------
// MCP Protocol — Resources
// ---------------------------------------------------------------------------

export interface MCPResourceTemplate {
  uriTemplate: string
  name: string
  description: string
  mimeType: string
}

export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
}

export interface MCPResourceContents {
  uri: string
  mimeType: string
  text: string
}

// ---------------------------------------------------------------------------
// Auth Context
// ---------------------------------------------------------------------------

export interface ApiKeyRecord {
  id: string
  key_hash: string
  user_id: string
  name: string
  scopes: string[]
  investigation_ids: string[]
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export interface AuthContext {
  key_id: string
  user_id: string
  scopes: string[]
  investigation_ids: string[]
}

// ---------------------------------------------------------------------------
// Tool Handler
// ---------------------------------------------------------------------------

export type ToolHandler = (
  args: Record<string, unknown>,
  auth: AuthContext,
  env: Env,
) => Promise<MCPToolResult>

// ---------------------------------------------------------------------------
// Resource Handler
// ---------------------------------------------------------------------------

export type ResourceHandler = (
  uri: string,
  auth: AuthContext,
  env: Env,
) => Promise<MCPResourceContents>
