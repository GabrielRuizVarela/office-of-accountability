# User Summary: Everything You Need to Know

This is the distilled essence of USERS.md -- the minimum you need to understand your users, design for them, and prioritize what to build.

---

## Who Uses This Platform?

You have **4 user archetypes** that matter for design decisions. Everything else is a variation.

### The 4 Core Archetypes

| Archetype | Persona | What they want | How they arrive | Key metric |
|-----------|---------|---------------|-----------------|------------|
| **The Investigator** | Luciana (journalist), Marina (expert), Valentina (NGO) | Graph exploration + investigation documents that cite connected data | Direct search / professional networks | Time-to-insight |
| **The Angry Citizen** | Raul (business owner), Jorge (retiree) | Visual proof of connections (politician -> donor -> vote) | WhatsApp shared link | Time-to-share |
| **The Curious Passerby** | Camila (student) | Engaging visual graph to explore and screenshot | Instagram / social media | Time-to-screenshot |
| **The Political Operative** | Santiago (staffer), Diputada Morales (politician) | Damage control via adding context to the graph | Direct monitoring | Response time |

**The uncomfortable truth:** Your most engaged users (Investigators) are your smallest group. Your largest group (Curious Passerby + Angry Citizen) decides if the platform reaches critical mass. The Operatives are guaranteed to show up -- the question is whether the graph makes their boss's connections visible regardless.

---

## What Each Archetype Actually Does

### Investigators (Luciana, Marina, Valentina)

```
Explore graph -> Find connection pattern -> Build investigation document
-> Share/publish
```

**They are your content engine.** They discover patterns in the graph, document them as investigations, and produce the citable analysis that everyone else consumes and shares. Without them, the platform is a static dataset.

**They need:** Visual graph explorer, query builder, investigation editor, CSV/JSON export, fast data freshness (<24h from Congress vote to platform).

**They churn if:** Data is stale, graph is shallow, export is limited, they can't build an investigation document from what they find.

---

### Angry Citizens (Raul, Jorge)

```
See shared graph view -> Explore connections -> Add their evidence -> Share
```

**They are your distribution engine.** They share graph views on WhatsApp, bring their neighbors, and extend the graph with local knowledge. Without them, the platform has no reach.

**They need:** Simple graph interaction, "add what you know" flow, big "Compartir por WhatsApp" button, visible feedback that their contribution was added to the graph ("Tu conexion fue agregada. 12 personas la respaldaron").

**They churn if:** Nothing happens within 2 weeks. The graph is empty. Their legislator isn't found (wrong spelling, wrong jurisdiction). They share a link and their friend sees a login wall.

---

### Curious Passerby (Camila)

```
See shared graph screenshot -> Tap link -> Explore graph visually
-> Maybe screenshot something -> Maybe sign up -> Probably leave
```

**They are your growth signal.** They don't create investigations. They don't add nodes. But they validate product-market fit: if Camila screenshots a graph view, you have something worth building.

**They need:** Beautiful, interactive graph that works in 30 seconds without registration. Share-optimized cards with Open Graph tags for WhatsApp/Instagram/Twitter previews.

**They churn if:** First screen is data tables. The graph is ugly or confusing. It looks like a government website. They can't find anything about their province in 30 seconds.

---

### Political Operatives (Santiago, Diputada Morales)

```
Monitor graph connections -> Add context nodes -> Respond through the graph
```

**They are your integrity test.** Their engagement is guaranteed -- the question is whether the graph makes connections visible enough that adding context only draws more attention to them.

**They need (from their perspective):** Notifications when new connections appear. Tools to add context and counter-evidence to their node.

**The platform needs (from your perspective):** Public edit history so additions are transparent. Endorsement counts so community-validated connections stand out. Rate limits on edits to prevent flooding.

---

## The 5 Flows That Make or Break the Platform

Everything else is secondary. If these 5 flows don't work, nothing works.

### Flow 1: First Visit -> Graph Discovery (60 seconds)

```
Land on a politician node (via shared link or province search)
-> See connections fan out: donors, votes, legislation, other politicians
-> Tap a connection to explore further
-> Share or continue exploring
```

**No registration required.** This is where 80% of users will spend 80% of their time.

### Flow 2: Explore -> Connect -> Investigate (the investigation loop)

```
User explores graph -> Finds a pattern (politician X voted with donor Y's interests 15 times)
-> Adds evidence (source URL, document) -> Writes investigation document
-> Investigation cites graph nodes and connections as evidence
```

**This is the core product.** If exploring the graph and building investigations from it is clunky, slow, or confusing, the platform is just a static visualization.

### Flow 3: Investigation -> Share -> Discussion (the collaboration loop)

```
User publishes investigation -> Shares on WhatsApp
-> Others view it, explore the cited connections
-> Contributors add evidence, endorse connections, comment
```

**This is the differentiator.** This turns the platform from a database into a collaborative knowledge tool.

### Flow 4: Endorse -> Confidence (the trust mechanism)

```
User sees a connection in the graph -> Endorses it with their own evidence
-> Endorsement count grows -> Connection gains visual weight
-> Highly endorsed connections become hard to dispute
```

**This is what makes the data trustworthy.** Without endorsements, every connection is just one person's claim.

### Flow 5: Share -> Discover -> Explore (the growth loop)

```
Active user shares graph card on WhatsApp
-> Friend sees it, taps link -> Lands on graph view (no login required)
-> Explores connections -> Signs up -> Adds what they know
```

**This is how you grow.** The share card IS the marketing.

---

## The Cold Start Chicken-and-Egg

At launch you have **a rich graph** (329 legislators, full vote history from Como Voto) but no **community** (no user-contributed connections, no investigations, no endorsements). The good news: the graph is already interesting without user contributions -- connections between votes, donors, and legislation are visible from day one.

**The bootstrap sequence:**

1. **Pre-launch:** Seed the graph with all available public data (legislators, votes, party affiliations, committee memberships, donor records)
2. **Pre-launch:** Onboard 3-5 anchor coalitions (Chequeado, Poder Ciudadano, Fundar, university civic groups) to create initial investigations that demonstrate the platform
3. **Launch:** Public users arrive and see a connected, explorable graph with real investigations -- not an empty shell
4. **Week 1-4:** Anchors publish investigations. Share cards from these generate press coverage
5. **Month 2+:** Organic contributors start adding connections and building their own investigations around specific issues (flooding, education, corruption)

**Without rich seed data, the graph is boring at launch.** Importing everything from Como Voto is the single highest priority pre-launch task.

---

## What Users Call Things (Terminology)

The codebase has technical terms. Users speak Argentine Spanish. The mapping:

| Technical Term | User-Facing (UI) | Tooltip Explanation |
|----------------|------------------|---------------------|
| Investigation | Investigacion | "Un documento que analiza conexiones en el grafo con evidencia" |
| Node / Entity | Nodo / Entidad | "Un elemento del grafo: persona, organizacion, ley, voto" |
| Edge / Connection | Conexion | "Una relacion entre dos entidades en el grafo" |
| Endorsement | Respaldo | "Confirmacion de una conexion por otro usuario" |
| Graph view | Vista del grafo | "La visualizacion interactiva de conexiones" |
| Coalition | Coalicion | "Un grupo de ciudadanos organizados para investigar" |
| Query | Consulta | "Una busqueda estructurada en el grafo" |

**Rule:** NEVER show internal English terms in the UI. All labels, buttons, tooltips in conversational Argentine Spanish.

---

## Permission Tiers (Who Can Do What)

| I want to... | I need to be... |
|--------------|----------------|
| Explore the graph, view investigations, search, browse | Anyone -- no account needed |
| Add nodes/edges, create investigations, endorse connections | Participante (email + phone verified) |
| Add context to their own node, respond via the graph | Politico Verificado (identity-verified politician) |
| Flag data errors | Participante or higher |
| Moderate content | Moderador (platform staff) |
| Manage platform, correct data | Admin (two-admin approval for destructive actions) |

---

## The 3 Things That Kill Engagement

**1. The graph is empty or boring.**
The user lands on a politician node and sees two connections. There is nothing to explore, nothing to screenshot, nothing to share.

**Fix:** Rich seed data from Como Voto. Every legislator should have dozens of connections (votes, party, committees, co-sponsors) visible from day one.

**2. They can't find their legislator in the graph.**
Raul searches by name, gets no result (wrong spelling). Camila searches "Mendoza" and gets a wall of names she doesn't recognize. Jorge searches for a provincial legislator who isn't in the system.

**Fix:** Fuzzy search. Province-first browsing. Clear "we only cover Congress for now" messaging with a "notify me" option.

**3. Graph visualization is confusing on mobile.**
Too many nodes, overlapping labels, no clear starting point. The Investigator loves the complexity. Everyone else bounces.

**Fix:** Progressive disclosure. Default view = simple (politician node + top 5 connections, clean layout). Advanced view = full graph, query builder. The user chooses to go deeper.

---

## Design Priority Stack (Ranked)

| # | Priority | Why |
|---|----------|-----|
| 1 | Graph explorer (visual, interactive, mobile-first) | Every user journey starts here -- this IS the product |
| 2 | WhatsApp share card showing graph connections | 3 of 5 non-adversarial personas discover via shared content -- this IS your marketing |
| 3 | Province-first navigation into the graph | Most Argentines think in provinces, not legislator names |
| 4 | Investigation editor | The core output of Investigators, the content everyone else consumes |
| 5 | Coalition workspace | Where organized groups coordinate investigations |
| 6 | Node/edge creation flow | How users extend the graph with what they know |
| 7 | Empty state design | The launch state must feel rich, not empty -- graph seed data is critical |
| 8 | Endorsement flow | How community trust accumulates on connections |

---

## Key Decisions Still Needed

| Decision | Impact | Options |
|----------|--------|---------|
| **Graph visualization library** | Core UX, performance on mobile, developer velocity | D3.js (maximum control, steep learning curve) vs. Cytoscape.js (graph-specific, good mobile) vs. Sigma.js (large graphs, WebGL) |
| **Investigation document format** | How investigations cite graph data, export options | Structured markdown with node references vs. rich text editor vs. notebook-style blocks |
| **Graph editing freedom** | Data quality vs. contributor engagement | Open (anyone can add, community endorses) vs. moderated (submissions reviewed) vs. hybrid (open add, flagging system) |
| **Politician outreach** | Whether politicians claim accounts at launch | Active outreach -> richer data but political entanglement vs. passive -> organic but slower |
| **Monetization** | Sustainability model | Coalition premium features vs. grants (NED, Open Society) vs. donation-based |

---

## One-Sentence Summary

**You're building a knowledge graph where Luciana maps the connections, Raul adds what he knows, Camila shares the picture it paints, and the graph itself makes Santiago's boss's connections impossible to hide.**
