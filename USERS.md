# Office of Accountability: Product Analysis Document

## Comprehensive User Personas, Journeys, Workflows, and Interaction Patterns

**Version:** 1.1
**Date:** 2026-03-13
**Purpose:** UX design foundation and feature prioritization input

---

## 1. User Personas

### Persona 1: Luciana Romero — "The Civic Journalist"

**Demographics:** 34 years old, Buenos Aires (CABA). Works as a data journalist at a mid-size digital media outlet. Previously contributed to Chequeado on a freelance basis.

**Role on platform:** Verificador (DNI verified), Coalition Editor, eventually Experto

**Motivation:** Luciana needs structured, queryable data linking votes to donor relationships for investigative stories. She currently spends days manually cross-referencing HCDN vote records with campaign finance disclosures in PDFs. She wants a single system that does the graph traversal for her. This platform is her dream tool -- a political knowledge graph she can explore, query, and extend.

**Goals:**
- Explore the graph to find patterns between donor networks and legislative votes for stories she is writing
- Create investigation documents that cite graph connections as evidence
- Add nodes and edges she discovers in her reporting to enrich the graph for others
- Export graph views and investigation summaries as source material for her journalism

**Frustrations:**
- Existing tools (Como Voto, HVN) are read-only and siloed; no way to connect votes to promises or money
- Government data portals are slow, broken, or deliberately opaque
- She has spent months building spreadsheets that become outdated the moment Congress votes again
- Fact-checking organizations she respects move slowly and cover only high-profile cases

**Technical comfort:** High. Comfortable with data tools, APIs, spreadsheets. Could use the Query Builder effectively. Would want CSV/JSON export.

**Time available:** 10-15 hours per week on the platform, integrated into her professional workflow.

**What success looks like:** She publishes a major investigative piece citing graph connections and investigation documents from the platform. The piece gets picked up nationally. The platform becomes her primary research tool.

---

### Persona 2: Raul "Raulito" Dominguez — "The Angry Citizen"

**Demographics:** 52 years old, Rosario, Santa Fe. Small business owner (ferreteria). Two kids in public school. His street floods every March.

**Role on platform:** Participante (email+phone verified)

**Motivation:** Raul is furious. His neighborhood has flooded for the third consecutive year. He watched his diputado provincial go on TV and blame the budget, but Raul knows the municipality received infrastructure funds that went elsewhere. He wants to "hacer quilombo" -- make noise, hold someone responsible.

**Goals:**
- See a visual graph of how his specific legislators connect to flood infrastructure votes, donors, and broken promises
- Add the flooding event as a node and draw edges connecting his diputado to votes against flood infrastructure bills
- Share a graph view on WhatsApp that shows these connections clearly
- Join a coalition focused on infrastructure in Santa Fe to collaborate on investigations

**Frustrations:**
- He does not understand how Congress works. He conflates provincial legislature with national Congress
- He is impatient. If the platform does not show him something useful in 3 minutes, he will close the tab
- He has been burned by platforms that "collect your data and nothing happens"
- Political jargon and legislative procedure language alienates him

**Technical comfort:** Low-medium. Uses WhatsApp and Facebook daily. Can fill out a form. Will not read documentation. Needs plain-language labels on graph nodes and edges.

**Time available:** 30 minutes per week, in bursts. Will check when something triggers him (a flood, a news story, a WhatsApp forward).

**What success looks like:** He adds the flooding event as a node, draws edges to his diputado's votes, and shares that graph view on WhatsApp. His neighbors start exploring the connections. Someone in a coalition picks up his data and builds an investigation around it.

---

### Persona 3: Dr. Marina Gutierrez — "The Policy Expert"

**Demographics:** 41 years old, Cordoba capital. Environmental engineer, teaches at Universidad Nacional de Cordoba. Has published papers on flood mitigation infrastructure in the Pampa Humeda.

**Role on platform:** Verificador, then Experto (peer-vouched)

**Motivation:** Marina has technical knowledge that is routinely ignored in legislative debates. She has seen politicians claim "there is no viable solution" to problems she has literally written the engineering specification for. She wants a platform where her expertise enriches investigations and the graph itself with authoritative evidence.

**Goals:**
- Add evidence nodes with technical assessments on flood infrastructure, water management, and environmental policy
- Create detailed investigation documents that bring her expertise to bear on graph connections
- Enrich existing edges with technical context (e.g., why a specific vote was technically unsound)
- Connect with coalitions working on environmental issues nationally, not just in Cordoba

**Frustrations:**
- Public debate in Argentina is driven by political alignment, not technical merit
- She has written op-eds that get ignored; she has testified at legislative hearings where nobody listened
- She does not want to be politically branded -- she wants to participate as a technical voice, not a partisan one
- Existing civic tech platforms do not distinguish between an expert contribution and a random social media take

**Technical comfort:** High. Academic. Comfortable with complex interfaces. Will read methodology documentation. Wants to understand graph data provenance.

**Time available:** 3-5 hours per week. More during university breaks. Will contribute in focused bursts around topics she knows deeply.

**What success looks like:** Her evidence nodes and investigation documents become the authoritative technical reference on flood mitigation in the graph. Journalists like Luciana cite her contributions. The depth of her graph contributions establishes her as a trusted expert.

---

### Persona 4: Santiago Ibarra — "The Political Operative"

**Demographics:** 28 years old, CABA. Works as a communications staffer for a PRO diputado. Formally, he is "asesor parlamentario." Informally, he manages his boss's digital reputation.

**Role on platform:** Initially Observador (anonymous monitoring), later creates a Participante account. His boss eventually claims a Politico Verificado account.

**Motivation:** Santiago monitors the platform to protect his boss's image. The graph makes connections visible -- every donor relationship, every vote pattern, every broken promise is linked and explorable. He wants to add context nodes that provide his boss's perspective, and flag inaccurate edges. He is not malicious per se, but his incentives are to present his boss in the best possible light.

**Goals:**
- Monitor all graph connections, edges, and investigations related to his boss
- Add context nodes with counter-evidence and explanations through the politician's verified account
- Identify which coalitions are building investigations about his boss and understand their graph contributions
- If edges or investigations contain inaccurate claims, add corrective context (he cannot remove edges, only add context)

**Frustrations:**
- The graph's transparency means every connection is visible and explorable -- he cannot bury unfavorable links
- He cannot remove edges, only add context nodes -- the original connection remains
- Coalition investigations aggregate evidence in ways that are hard to counter piecemeal
- Provenance tracking on every node means his coordination patterns could be visible

**Technical comfort:** High. Digital native. Understands platform mechanics quickly. Will read the rules to find exploitable edges.

**Time available:** This is part of his job. 15-20 hours per week monitoring and responding.

**What success looks like (from his perspective):** His boss's graph neighborhood includes well-argued context nodes next to every critical edge. His boss's own evidence and explanations are part of the permanent graph, providing balance.

**What the platform should watch for:** Santiago creating multiple accounts, coordinating endorsement brigades on favorable edges, submitting misleading context nodes, or using the flag/moderation system to harass legitimate contributors.

---

### Persona 5: Camila Valdes — "The Overwhelmed Newcomer"

**Demographics:** 22 years old, Mendoza. University student (abogacia, 3rd year). Politically aware but not active. Saw the platform shared on Instagram by an influencer she follows.

**Role on platform:** Observador, then Participante (if onboarding does not lose her)

**Motivation:** Vague civic curiosity. She voted for the first time in 2023 and felt she did not know enough about the candidates. She wants to "be more informed" but does not have a specific issue or politician in mind.

**Goals:**
- Explore the visual graph and click through connections without reading legislative text
- Find something personally relevant (education funding, university budget cuts, Mendoza water issues)
- Discover surprising connections by following edges in the graph
- Share a graph view on social media that makes her look politically informed

**Frustrations:**
- She does not know where to start. "Politicians" is too broad. She does not remember her diputado's name
- If the graph is overwhelming or looks like a data visualization for experts, she will bounce
- She does not want to commit to anything -- she is exploring
- If the first thing she sees is a wall of nodes and edges with no guidance, she will leave

**Technical comfort:** High with social media and consumer apps. Low with data-heavy or civic platforms. Expects Instagram/TikTok-level UX polish.

**Time available:** 5 minutes on first visit. Maybe 15 minutes if something hooks her. Unlikely to return unless she gets a notification about something she cares about.

**What success looks like:** She searches "Mendoza" and sees a visual graph of her senator's connections. She clicks through edges linking a campaign promise on university funding to a vote against the education budget. She screenshots the graph view and shares it on Instagram stories. She signs up for alerts on education-related connections.

---

### Persona 6: Jorge Ferreyra — "The Retired Civic Warrior"

**Demographics:** 67 years old, La Plata, Buenos Aires province. Retired public school teacher. Active in neighborhood junta vecinal. Has been going to town hall meetings for 30 years.

**Role on platform:** Participante, aspires to Verificador

**Motivation:** Jorge has decades of institutional memory about local politics. He remembers promises made in 2005 that were never fulfilled. He wants a permanent record that outlasts any single news cycle or election. He is tired of politicians "getting away with it" because people forget.

**Goals:**
- Add historical promises as nodes in the graph, with edges connecting them to politicians and outcomes
- Draw edges between old promises and subsequent votes that contradicted them
- Build a long-term graph of political commitments in Buenos Aires province
- See the platform expand to cover provincial and municipal politicians, not just Congress

**Frustrations:**
- His knowledge is in his head, not in linkable URLs. He struggles with the "source URL required" paradigm
- He is not fast with technology. He uses WhatsApp and email but navigates complex web apps slowly
- He fears his contributions will be dismissed because he cannot always provide a digital source
- He watched previous civic tech initiatives (Democracia en Red, etc.) launch and then die

**Technical comfort:** Low. Needs large text, clear navigation, minimal steps. Will call his daughter for help with account verification.

**Time available:** Abundant. He could spend 2-3 hours a day if the platform engages him. The bottleneck is not time, it is technical friction.

**What success looks like:** He adds a promise from 2019 as a node (with a YouTube link his grandson helped him find), draws an edge to the politician, and another edge to the vote that broke it. Three endorsements confirm the edge. His historical knowledge becomes part of the permanent graph. He shows it to his junta vecinal at their next meeting.

---

### Persona 7: "NoCorruptos_AR" — "The Troll / Bad Actor"

**Demographics:** Unknown. Could be a single person with multiple accounts, or a coordinated group. Presents as an anti-corruption crusader but actually aims to weaponize the platform against specific political enemies.

**Role on platform:** Multiple Participante accounts (attempts Verificador)

**Motivation:** Use the platform's knowledge graph to launder partisan attacks as "community-endorsed connections." Flood the graph with misleading nodes and edges targeting opposition politicians. Alternatively: discredit the platform itself by adding obviously false connections and then publicizing "look what this platform says."

**Goals:**
- Create multiple accounts to amplify endorsements on misleading edges
- Add inflammatory nodes and edges with cherry-picked evidence
- Coordinate off-platform (Telegram groups) to brigade edge endorsements
- Exhaust moderator resources with frivolous flags and disputes

**Frustrations (from their perspective):**
- Phone verification per account is annoying but circumventable with multiple SIM cards
- Provenance tracking on every node and edge means their patterns are visible
- Coalition reputation scores could flag their captured coalitions
- The endorsement system requires multiple independent users to confirm connections

**Technical comfort:** High. Understands platform mechanics, API patterns, and social engineering.

**What success looks like for them:** Misleading edges they created get enough endorsements to appear credible. An investigation citing their fabricated connections gets media pickup before it is disputed.

**What success looks like for the platform:** Their coordinated activity is detected by sybil analysis within 48 hours. Their coalition reputation drops visibly. Provenance tracking makes their contributions easy to identify and contextualize. Their accounts are flagged and verification attempts rejected.

---

### Persona 8: Diputada Ana Morales — "The Responsive Politician"

**Demographics:** 45 years old, UCR-aligned diputada from Entre Rios. Second term. Moderate, generally supportive of transparency initiatives. Her staff convinced her to claim a verified account.

**Role on platform:** Politico Verificado

**Motivation:** She believes being responsive on the platform is good politics. She also genuinely wants to explain her votes -- some of which are complex coalition compromises that look bad in isolation. The graph makes connections visible, and she wants her side of those connections to be part of the permanent record.

**Goals:**
- Add context nodes next to edges about her votes, explaining the full picture ("I voted against this bill because of Article 47, which would have...")
- Draw edges from her votes to the real constraints she faced (party discipline, quorum games, amendment trade-offs)
- Monitor what coalitions in Entre Rios are building investigations about and ensure her perspective is represented in the graph
- Respond to investigations with her own evidence nodes

**Frustrations:**
- Some edges strip context from complex legislative situations
- She does not have time to respond to everything -- she needs her staff to manage this
- Investigations can aggregate edges in ways that create misleading narratives without any single edge being wrong
- She wants her responses to be visible alongside the connections, not buried

**Technical comfort:** Low personally (her staff handles it). Her asesores are medium-high.

**Time available:** Personally, 30 minutes per month. Staff: 5 hours per week.

**What success looks like:** Her graph neighborhood includes context nodes that provide balance. Her explanations are part of the graph, visible alongside critical edges. Investigations that cite connections to her also show her responses. Her reelection polling improves in Entre Rios.

---

### Persona 9: Martin Acosta — "The Provincial Watchdog"

**Demographics:** 38 years old, Tucuman capital. High school civics teacher. Active on Twitter commenting on provincial politics.

**Role on platform:** Participante, then Verificador

**Motivation:** Most infrastructure accountability (flooding, roads, schools) is provincial/municipal jurisdiction, not federal. Martin cares about his gobernador and intendente more than about Congress. He wants to add provincial data to the graph even before the platform officially covers provincial legislatures.

**Goals:**
- Add nodes for Tucuman provincial legislators and their promises as user-contributed data
- Draw edges between provincial-level issues (education infrastructure, road maintenance) and federal budget votes
- Build the case for the platform to add provincial legislature data by demonstrating demand through his contributions
- Connect with coalitions working on education in the interior

**Frustrations:**
- Platform only covers Congress at launch -- his representatives are not in the seeded graph
- Confusion between federal and provincial jurisdictions (common in Argentina)
- Buenos Aires-centric civic tech -- feels like the interior is always an afterthought
- Provincial government data is even harder to find than federal

**Technical comfort:** Medium. Uses social media and news sites daily. Can navigate forms.

**Time available:** 5-8 hours per week, concentrated around local political events.

**What success looks like:** He adds provincial politician nodes and edges as user-contributed data. Even without official provincial data ingestion, his graph contributions are visible and explorable. When Phase 3 adds provincial coverage, his submitted data is already integrated and his coalition is ready.

**Churn risk:** High if the platform feels federal-only for too long. Needs clear "Provincial coverage coming -- your data is already part of the graph" messaging.

---

### Persona 10: Valentina Rossi — "The NGO Coalition Manager"

**Demographics:** 30 years old, CABA. Program officer at Poder Ciudadano (anti-corruption NGO). Manages a team of 4 researchers.

**Role on platform:** Verificador, Coalition Admin (on behalf of her organization)

**Motivation:** Her organization is a potential anchor coalition. She sees the platform as a force multiplier for their existing work -- they already track legislative votes manually and publish reports. She wants the platform's graph and investigation tools to formalize and scale what they do.

**Goals:**
- Create and manage a coalition as Poder Ciudadano's official presence and shared investigation workspace
- Produce investigations that her org can cite in official reports and press conferences
- Use bulk tools to add nodes and edges from their existing research databases
- Coordinate her team's investigation work through the platform rather than internal spreadsheets

**Frustrations:**
- She needs bulk tools (import multiple nodes/edges, manage multiple investigations, dashboard for her team)
- Individual-user UX is not designed for institutional workflows
- She is responsible if the coalition publishes an investigation with inaccurate graph connections -- professional stakes are high
- Coalition branding is important: Poder Ciudadano needs visual identity on their curated graph views and investigations

**Technical comfort:** High. Manages digital tools daily. Expects professional-grade interfaces.

**Time available:** 15-20 hours per week (this is her job).

**What success looks like:** Poder Ciudadano's coalition has 50+ members, produces monthly investigations with curated graph views, and is cited by journalists (like Luciana) as a primary source. The platform becomes part of their org's workflow.

**Retention risk:** Low if the platform works. She is retained by professional obligation. Risk is if the platform lacks institutional-grade tools (no bulk operations, no team management, no analytics dashboard).

---

## 2. User Journey Maps

### Journey: Luciana (Civic Journalist)

**Discovery:** Colleague at Chequeado mentions the platform. She searches "Office of Accountability Argentina" and lands on the homepage.

**First session (45 min):**
1. Sees the graph explorer. Types a politician she is currently investigating. The graph expands around them -- votes, donors, promises, all connected as nodes and edges. This alone is worth her time
2. Clicks a donor node and sees edges connecting it to multiple politicians. Follows the edges and discovers a voting pattern she had suspected but never had the data to prove
3. Runs a query: "Show all politicians who received donations from [company] AND voted against [bill category]." The graph highlights the results
4. Creates an account (email + phone). Accepts public transparency terms without hesitation -- she is a journalist, she publishes under her name anyway
5. Saves the graph view she built. Bookmarks the investigation workspace for later
6. Joins a coalition focused on anti-corruption (e.g., "Transparencia Federal")

**Return triggers:**
- Congress votes on a bill she is covering -- she checks how the vote connects to existing graph patterns
- A coalition member adds new edges she can use in her investigation
- Alert notification: "New edge added: Legislador X received donation from [company you are tracking]"

**Power user evolution:**
- Week 2: Adds her first nodes and edges from her own reporting (source documents, interview findings)
- Month 1: Creates her first investigation document, citing 15 graph connections as evidence
- Month 3: Her coalition endorses the investigation. She publishes it in her outlet with graph view screenshots
- Month 6: Uses the platform as her primary research tool. The graph is her investigative notebook

**Churn risk:** Low, if the data stays current and the query tools are powerful enough. High if data ingestion lags behind real votes, or if the graph explorer is slow or clunky.

---

### Journey: Raul (Angry Citizen)

**Discovery:** His neighbor shares a WhatsApp image -- a graph view showing his diputado connected to votes against flood infrastructure, with donor edges to a construction company. The image has the platform's URL. Raul taps the link.

**First session (8 min):**
1. Lands on the graph view from the shared link. Sees his diputado at the center, connected to votes, donors, and promises. The visual connections are immediately legible
2. Clicks an edge labeled "Voto en contra: Ley de infraestructura hidrica." Sees the full vote record and related promises
3. Wants to add his experience. Taps "Agregar al grafo." Hits the registration wall
4. **Critical fork:** If registration takes more than 2 minutes (email + phone verification), he is at risk of bouncing. He needs to see immediate value after registering
5. Registers. Adds a node for the flooding event in his neighborhood. Draws an edge: "Diputado X -> Voto en contra -> Ley de infraestructura que habria prevenido esto"
6. Sees a suggested coalition: "Vecinos por Santa Fe Segura." Joins with one tap
7. Returns to the graph view. His node is now visible. He screenshots it and sends it to his WhatsApp group

**Return triggers:**
- Push notification: "Tu nodo sobre inundaciones recibio 5 endorsements"
- WhatsApp share from his coalition's investigation (graph view or share card)
- Another flood event -- he comes back to check if new connections have been added

**Power user evolution:** Unlikely to become a power user in the traditional sense. His engagement pattern is event-driven and emotional. But he could become a reliable node/edge contributor for his jurisdiction if the UX stays simple. Adding a node and drawing an edge is simpler than navigating governance workflows.

**Churn risk:** High. If nothing visible happens within 2-3 weeks of his first session, he concludes "es al pedo" (it is pointless) and never returns. He needs to see that his contribution is part of the graph, that others endorsed it, that a coalition is building an investigation around it. Even a small signal -- "Tu nodo sobre inundaciones fue citado en una investigacion" -- keeps him.

---

### Journey: Camila (Overwhelmed Newcomer)

**Discovery:** Instagram story from a political commentary account. Screenshot of a graph view showing a politician connected to contradictory votes and broken promises. Caption: "mira las conexiones, jajaja."

**First session (4 min):**
1. Taps link. Lands on a graph view. If it looks overwhelming, she needs a guided entry: "Busca a tu legislador por provincia" with a map or dropdown
2. She does not know her diputado's name. She selects "Mendoza" from a province selector. Sees a simplified graph of Mendoza's legislators
3. Taps one she vaguely recognizes. The graph expands around that politician -- promises, votes, donors. The visual nature is engaging, like exploring a map
4. She clicks through edges and discovers a connection between a university funding promise and a vote against the education budget. This is directly relevant to her
5. She wants to share it. Can she share without registering? If yes: she uses a share button that captures the current graph view. Platform gets visibility. If no: friction. She might leave

**Return triggers:**
- If she signed up for alerts on education connections: a notification brings her back
- If she shared a graph view that got engagement from her friends: social validation loop
- University-related political news in mainstream media -- she checks the platform for graph context

**Power user evolution:** Slow. She might remain a casual explorer for months. The path to Participante requires a specific issue to hook her (university budget cuts, water rights in Mendoza). The visual, clickable graph is the hook that data tables could never provide. If a coalition forms around student issues and she is invited, she might start adding edges.

**Churn risk:** Very high on first visit. The graph must deliver a personally relevant, visually clear connection within 60 seconds or she is gone. She will not read instructions, will not browse documentation, will not explore menus. The graph must be engaging and self-explanatory.

---

### Journey: Santiago (Political Operative)

**Discovery:** His boss's press secretary mentions that the platform is being discussed in Argentine political media. Santiago creates an anonymous Observador session to assess the threat.

**First session (60 min, methodical):**
1. Searches his boss. Explores the full graph neighborhood -- every edge, every connected node. Notes what is accurate, what is missing context, what is wrong
2. Maps which coalitions have built investigations citing his boss. Examines their graph contributions
3. Checks the moderation and dispute mechanisms. Reads the platform's content policy thoroughly
4. Assesses whether his boss should claim a verified account (conclusion: yes, to add context nodes)
5. Creates his own Participante account (using a personal phone, not office). Joins a coalition that covers his boss's jurisdiction -- but as a "concerned citizen," not as staff

**Ongoing behavior:**
- Daily monitoring of his boss's graph neighborhood for new edges or investigations
- Adding context nodes through the Politico Verificado account (his boss signs off, he writes)
- Adding counter-evidence nodes connected to disputed edges
- Potentially recruiting sympathetic citizens to join coalitions and endorse favorable context

**The grey zone:** Santiago's individual participation as a citizen is legitimate. Coordinating others to endorse certain edges is where it gets problematic. The platform's defenses (provenance tracking, coalition reputation scores, sybil detection) should make coordination visible and costly. The graph's transparency IS the defense -- he cannot remove connections, only add context.

---

### Journey: Jorge (Retired Civic Warrior)

**Discovery:** His grandson shows him the platform on a tablet at a family asado. "Abuelo, mira -- podes ver todas las conexiones de los diputados."

**First session (20 min, with help):**
1. His grandson navigates to a politician's graph. Jorge sees the connections and is immediately engaged: "Mira, este voto contra la ley de jubilaciones... y aca esta la promesa que hizo en 2019!"
2. He wants to add a promise he heard at a campaign rally in 2019. His grandson helps him find a YouTube clip of the speech
3. They add the promise as a node, draw an edge to the politician, and attach the YouTube link as evidence. Jorge dictates; grandson types
4. They hit the registration wall. Jorge does not have his phone handy for SMS verification. Session pauses
5. Next day, Jorge registers on his own (slowly, with some frustration). Sees his node already in the graph (saved as draft)

**Return triggers:**
- He tells his junta vecinal about the platform. They ask him to add more historical data
- He gets a notification that his node was endorsed by a coalition member
- He discovers graph neighborhoods focused on education or retirement policy

**Power user evolution:**
- Week 3: Has added 4 promise nodes with edges to politicians, all from YouTube clips or news articles his family helped him find
- Month 2: Joins a coalition. His historical knowledge fills gaps in the graph that no one else could fill
- Month 4: Becomes a regular contributor. His institutional memory is woven into the permanent graph
- He never becomes technically proficient, but he becomes a reliable source of historical nodes and edges

**Churn risk:** Medium. Technical friction is the primary killer. If the node-adding form is too complex, if verification fails, if he accidentally logs out and cannot get back in -- each incident could be terminal. Accessibility (font size, contrast, clear labels in simple Spanish) is critical for this persona.

---

## 3. Detailed User Workflows

### 3.1 Workflow: Graph Exploration

**Trigger:** User wants to explore connections between politicians, votes, donors, promises, and civic issues.

**Steps:**

1. **Entry point:** User reaches the graph explorer (homepage, navigation bar, or direct URL to a specific graph view).
2. **Starting options:**
   - Type a politician name (autocomplete with fuzzy matching -- handles "Cristina" vs. "Cristina Fernandez de Kirchner")
   - Browse by province (dropdown or map)
   - Browse by topic (education, infrastructure, environment, etc.)
   - Browse by bloc/coalition (PJ, PRO, LLA, OTROS)
   - Open a shared graph view URL
3. **Graph rendering:** The selected entity appears as a central node with edges radiating to connected entities:
   - Politician -> Votes (color-coded: green=afirmativo, red=negativo, grey=abstencion, hollow=ausente)
   - Politician -> Promises (status-coded: En seguimiento/Cumplida/Incumplida/Parcialmente cumplida)
   - Politician -> Donors (with amount and date on the edge)
   - Politician -> Jurisdictions
   - Vote -> Legislation
   - Any entity -> Evidence nodes (user-contributed)
4. **Interaction:**
   - Click any node to expand its connections
   - Hover over edges to see details (date, source, provenance)
   - Filter visible edge types (show only votes, only donors, only promises)
   - Zoom in/out, pan, and rearrange nodes
   - Search within the visible graph
5. **Query Builder:** Advanced users can write structured queries:
   - "Politicians who received donations from [company] AND voted against [bill category]"
   - "All promises about [topic] by [party] with status Incumplida"
   - Results highlight matching subgraphs
6. **Actions available (by role):**
   - Observador: explore, filter, share graph view URL
   - Participante: above + save graph views, add nodes/edges, endorse edges
   - Verificador: above + create investigations, review flagged content
   - Politico Verificado: above + add context nodes to own graph neighborhood

**What can go wrong:**
- Graph is visually overwhelming for new users -- need progressive disclosure (start with key connections, expand on click)
- Politician name has accents/special characters that the search does not handle (e.g., "Pena" vs. "Pena")
- User searches for a provincial legislator not yet in the seeded graph -- needs clear "Not found in official data. You can add this person as a user-contributed node" message
- Graph rendering is slow on mobile or low-end devices -- needs a simplified list view fallback
- Too many edges on popular politicians make the graph unreadable -- need edge bundling or filtering

---

### 3.2 Workflow: Add Nodes and Edges to the Graph

**Trigger:** User has information to contribute -- a promise, an event, a connection, evidence, or a new entity.

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Entry:** From the graph explorer, click "Agregar al grafo" or right-click a node and select "Conectar con..."
2. **Node creation (if adding a new entity):**
   - Node type: Promesa / Evento / Evidencia / Persona / Organizacion / Otro
   - Title (short descriptive label, max 100 characters)
   - Description (max 2000 characters)
   - Source URL (required for most types -- YouTube video, news article, official document)
   - Date (date picker, for time-relevant nodes)
   - Tags (suggested based on text, user can add)
   - For users without a URL (like Jorge): "No tenes link? Describe donde y cuando lo escuchaste y un verificador te ayudara a encontrar la fuente."
3. **Edge creation (connecting two nodes):**
   - Source node (pre-filled if initiated from a specific node)
   - Target node (searchable, with autocomplete, or create new)
   - Relationship type: Prometio / Voto a favor / Voto en contra / Financio / Contradice / Respalda / Relacionado con / custom
   - Description (optional, max 500 characters -- why does this connection exist?)
   - Evidence URL (required)
4. **Duplicate check:** On submission, system searches for existing similar nodes/edges. If match found: "Ya existe algo similar. Queres ver lo existente o enviar de todos modos?"
5. **Submission:** Creates node/edge with provenance metadata: who submitted, when, source URL, tier (user-contributed = Bronze until endorsed).
6. **Endorsement queue:** New user-contributed edges are visible but marked as "Sin verificar" until endorsed. Appears in the endorsement feed for relevant coalitions.

**Feedback to user:**
- Immediate: "Tu contribucion fue agregada al grafo. Sera visible como 'Sin verificar' hasta que otros la endosen."
- On first endorsement: "Tu conexion recibio su primer endorsement!"
- On reaching endorsement threshold: "Tu conexion fue verificada por la comunidad."

**What can go wrong:**
- Source URL is paywalled (La Nacion, Clarin) -- endorsers cannot check it. Needs a note: "If source is paywalled, include a screenshot or transcript excerpt"
- Source URL is a 3-hour YouTube video with no timestamp -- user should be prompted to include timestamp
- User creates a misleading edge (cherry-picked connection) -- the endorsement system and provenance tracking mitigate this
- Flood of low-quality nodes from trolls -- rate limiting per user, reputation-based queue priority
- User creates duplicate nodes for the same entity (same politician, different spelling) -- deduplication and merge tools needed

---

### 3.3 Workflow: Create an Investigation

**Trigger:** A user (typically a coalition Verificador or Experto) has explored graph connections and wants to document their findings in a structured, citable investigation.

**Precondition:** User must be Verificador or higher, OR any Participante within a coalition workspace.

**Steps:**

1. **Entry:** From the graph explorer, click "Crear investigacion" or from a coalition workspace, click "Nueva investigacion."
2. **Investigation form:**
   - Title (max 200 characters)
   - Summary (max 500 characters -- the thesis or key finding)
   - Coalition (if created within a coalition workspace, pre-filled)
3. **Investigation editor:**
   - Rich text editor for long-form writing
   - **Graph citation tool:** Select any node or edge in the graph and insert it as a citation. The citation renders as a clickable reference showing the connection, its provenance, and endorsement count
   - Evidence attachment (PDFs, links, documents)
   - Embedded graph views: capture a specific graph state (nodes, edges, filters) as an interactive embed within the investigation
   - Versioning: every edit saved with author + timestamp
   - Collaborative editing: multiple coalition members can contribute (if created within a coalition)
4. **Review phase (if within a coalition):**
   - Author marks investigation as "ready for review"
   - Coalition members can comment and suggest edits
   - Duration: configurable by coalition Admin (default 1 week)
5. **Publication:**
   - Author (or coalition Admin) publishes the investigation
   - Investigation becomes publicly visible with: author/coalition attribution, all cited graph connections, publication date
   - Linked politician(s) notified (if verified) and can add response nodes
6. **Post-publication:**
   - Any user can endorse the investigation
   - Investigation appears in search results and can be found via the graph (edges link the investigation to all cited entities)
   - Share card generated with key findings and graph visualization thumbnail

**What can go wrong:**
- Investigation cites graph connections that are later disputed or corrected -- investigation should show updated status of cited edges
- Investigation is used to launder misleading claims by wrapping them in legitimate graph data -- coalition review and community endorsement mitigate this
- Collaborative editing becomes chaotic with too many contributors -- coalition Admin should assign a lead author
- Investigation never gets finished -- need "archive without judgment" flow

---

### 3.4 Workflow: Endorse Connections

**Trigger:** A user sees a user-contributed edge in the graph and wants to confirm its accuracy, or sees an investigation and wants to endorse it.

**Precondition:** User must be Participante or higher. Cannot endorse own contributions.

**Steps:**

1. **Entry:** On any user-contributed edge or investigation, click "Endorsar."
2. **Review before endorsing:**
   - Edge: user sees the connection claim, the source URL, who submitted it, and existing endorsements
   - Investigation: user sees the full document with all cited graph connections
3. **Endorsement action:**
   - One-click endorsement (for edges) with optional rationale (max 200 characters)
   - For investigations: endorsement with optional comment
4. **Endorsement thresholds:**
   - Edge endorsed by 3+ independent users: status changes from "Sin verificar" to "Verificado por la comunidad"
   - Edge endorsed by users from 2+ independent coalitions: highest confidence tier
   - Investigation endorsed by coalition: appears with coalition badge
5. **Provenance:** All endorsements are public (who, when, rationale if provided). Endorsements cannot be anonymous.

**What can go wrong:**
- Endorsement brigading by coordinated accounts -- sybil detection and endorsement pattern analysis
- Users endorse without actually checking the source (rubber-stamping) -- reputation system should track endorsement accuracy
- Low participation makes endorsement thresholds hard to reach -- adaptive thresholds based on platform activity level

---

### 3.5 Workflow: Save and Share Graph Views

**Trigger:** User has configured a graph view (specific nodes, edges, filters) and wants to save it for later or share it with others.

**Precondition:** Saving requires Participante or higher. Sharing a URL is available to all users including Observadores.

**Steps:**

1. **Save:** From the graph explorer, click "Guardar vista." User names the view and optionally adds a description.
2. **Saved views:** Accessible from user profile. Coalition members can save views to the coalition workspace (shared views).
3. **Share:** Click "Compartir" on any graph view (saved or not).
   - Generates a URL that reproduces the exact graph state (nodes, edges, filters, zoom level)
   - Share card preview: shows a static image of the graph with title and key stats
   - "Compartir por WhatsApp" button is first-class (not buried in a share menu)
   - Open Graph tags optimized for WhatsApp link preview rendering
4. **Coalition curated views:** Coalition Admins can create "featured views" -- curated subgraphs that tell a specific story. These appear on the coalition's public page.

**What can go wrong:**
- Shared URL renders differently on mobile vs. desktop -- need responsive graph rendering or static image fallback
- Graph view URL becomes stale as nodes/edges are added or removed -- the URL should show the current state, not a frozen snapshot (with option to pin a snapshot if desired)
- WhatsApp compresses the share card image -- design for low resolution

---

### 3.6 Workflow: Coalition Creation and Management

**Trigger:** A user wants to organize a group around a specific issue, jurisdiction, or investigation focus.

**Precondition:** User must be Participante or higher, with minimum reputation score.

**Steps:**

1. **Entry:** "Crear espacio colaborativo" from the coalitions page.
2. **Creation form:**
   - Name (unique, max 60 characters)
   - Description (max 500 characters)
   - Focus tags (required, at least 1)
   - Join policy: Open (anyone can join) or Invite-only (Admin approves)
3. **Submission:** Creates coalition. Creator becomes Admin.
4. **Member recruitment:** Admin shares invite link. Members join with one click (open) or request-and-approve (invite-only).
5. **Role assignment:**
   - Admin: full management, can promote/demote, configure settings, publish investigations
   - Editor: can create and edit investigations, add nodes/edges on behalf of the coalition, review contributions
   - Viewer: can see coalition workspace, comment on investigations, endorse content
6. **Shared workspace:**
   - Shared saved graph views
   - Collaborative investigation documents
   - Activity feed of coalition members' graph contributions
   - Discussion threads attached to investigations
7. **Ongoing management:**
   - Admin can remove members (action logged)
   - Admin can transfer Admin role
   - Coalition reputation score is computed and displayed publicly

**What can go wrong:**
- User creates a coalition with misleading name (e.g., "Chequeado Oficial" -- impersonating a real org). Moderation flag needed
- Coalition has only 1-2 members and cannot produce meaningful output. Minimum viable coalition guidance needed
- Admin goes inactive. Need succession mechanism (auto-transfer to most active Editor after 90 days of Admin inactivity)
- Coalition is captured by a political party. Reputation score should flag homogeneous endorsement patterns and low geographic diversity

---

### 3.7 Workflow: Data Correction

**Trigger:** A user identifies incorrect data in the graph (wrong vote attribution, inaccurate edge, incorrect node data).

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Flag:** User clicks "Posible error" on any node or edge. A form appears:
   - Error type: Datos incorrectos / Atribucion incorrecta / Fuente invalida / Duplicado
   - Description of error (max 500 characters)
   - Correct information (if known)
   - Supporting evidence URL (optional)
2. **Queue:** Flag creates a review task in the Moderator queue with priority based on: node/edge visibility (high-traffic graph neighborhood = higher priority), data tier (official data error = urgent, user-contributed = standard), and flagger's reputation.
3. **Moderator review:** Moderator compares flagged data against original source URL (in provenance).
   - If source confirms the flag: Moderator creates a corrected version. Old version preserved in audit log with reason for correction.
   - If source does not confirm: Moderator dismisses the flag with explanation to the flagger.
   - If source is unavailable: Moderator marks data as "No verificable" and notifies original submitter.
4. **Notification:** Flagger notified of outcome. If correction made: all investigations citing this node/edge are flagged for review.
5. **Audit trail:** Correction visible in "Ver historial" on the node/edge: who corrected, when, why, and what the previous value was.

**What can go wrong:**
- Malicious flagging to harass contributors or overwhelm moderators (rate-limit flags per user)
- Correction cascading to invalidate investigations (system flags affected investigations but does not auto-revoke; authors must review)
- Original source is paywalled or taken offline -- need to store source snapshots at ingestion time

---

### 3.8 Workflow: Content Moderation

**Trigger:** A user flags content as: spam / desinformacion / acoso / contenido ilegal.

**Precondition:** Any authenticated user (Participante+) can flag.

**Steps:**

1. **Flag:** User clicks "Reportar" on any user-generated content (node, edge, investigation, discussion comment, coalition description). Selects category and adds optional description.
2. **Auto-triage:** System applies automated checks:
   - Obvious spam (URL patterns, repeated text): auto-hidden, queued for moderator confirmation
   - High-reputation flagger + obvious violation: prioritized in queue
   - Multiple independent flags on same content: escalated to urgent
3. **Moderator queue:** Content appears in queue with: flag category, flagger identity and reputation, content in context (what graph neighborhood it belongs to), and the author's profile.
4. **Moderator actions:**
   - **Dismiss:** Flag was incorrect. No action on content. Flagger notified.
   - **Hide pending review:** Content hidden from public view. Author notified: "Tu contenido fue ocultado temporalmente para revision."
   - **Remove + warn:** Content removed (preserved in audit log, not displayed). Author receives warning. Explanation provided.
   - **Remove + ban:** Content removed. Author account suspended. Requires two-moderator approval for bans.
   - **Escalate to Admin:** For content involving legal threats, political pressure, or ambiguous cases.
5. **Appeal:** Author can appeal within 30 days. Appeal goes to a different moderator (not the original). If second moderator upholds, author can escalate to Admin (two-admin review, final decision).
6. **SLA:** All flags reviewed within 48 hours. Content hidden during review does not affect reputation scores of the author until resolution.

**What can go wrong:**
- Coordinated flagging by political operatives to silence critical graph connections (counter: flags from accounts with low reputation or coordinated flag patterns weigh less)
- Moderator bias (counter: rotating moderator assignment, public transparency report on moderation stats)
- Backlog during political crises (counter: community-assisted triage -- high-reputation users can dismiss obvious non-violations)

---

### 3.9 Workflow: Follow a Coalition (Lightweight Engagement)

**Trigger:** User wants to stay informed about a coalition's activity without joining as a member.

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Entry:** From a coalition's profile page, click "Seguir."
2. **Effect:** User receives activity feed updates from this coalition: new investigations, new graph contributions, curated graph views, and published reports.
3. **No editing rights:** Followers cannot create investigations or add to the coalition workspace.
4. **Conversion path:** Activity feed includes a "Unirte a este espacio" CTA for users who want to upgrade to Member.
5. **Unfollow:** One-click unfollow from coalition profile or notification settings.

---

## Future Vision

The following workflows represent governance-heavy features that may be built in later phases once the knowledge graph and investigation tools are established:

**Constraint Audit:** A structured process where coalitions audit politicians' claims about constraints (budgetary, legal, physical, jurisdictional) that prevented them from fulfilling commitments. Requires a mature endorsement ecosystem and sufficient community participation to form audit panels. In the current vision, users can add evidence nodes for and against a politician's constraint claims, and investigations can evaluate those claims.

**Problem-to-Mandate Pipeline:** A civic R&D process where coalitions adopt community-reported problems, research solutions collaboratively, and produce Citizen Mandates that politicians can sign. Requires coalition maturity, dual-track voting (feasibility + preference), and politician engagement. The current graph already supports problem documentation as nodes and evidence gathering as edges.

---

## 4. User Action Matrix

| Action | Observador | Participante | Verificador | Experto | Politico Verificado | Moderador | Admin |
|--------|:----------:|:------------:|:-----------:|:-------:|:-------------------:|:---------:|:-----:|
| Explore the graph | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View node/edge details | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View investigations | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View coalition pages | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View audit trail ("Ver historial") | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Share graph view (URL/share card) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Search graph (politicians, entities) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Use Query Builder | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Account actions** |||||||||
| Create account | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Set up alerts | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Follow coalitions | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Save graph views | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| **Graph contributions** |||||||||
| Add a node | -- | Yes | Yes | Yes | Yes* | Yes | Yes |
| Draw an edge | -- | Yes | Yes | Yes | Yes* | Yes | Yes |
| Endorse an edge | -- | Yes | Yes | Yes | -- | Yes | Yes |
| Endorse an investigation | -- | Yes | Yes | Yes | -- | Yes | Yes |
| Flag content ("Posible error") | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Flag content for moderation | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| **Coalition participation** |||||||||
| Join a coalition | -- | Yes | Yes | Yes | -- | -- | Yes |
| Create a coalition | -- | Yes** | Yes | Yes | -- | -- | Yes |
| Create an investigation | -- | Yes*** | Yes | Yes | -- | -- | Yes |
| Manage coalition membership | -- | -- | -- | -- | -- | -- | Yes**** |
| **Politician actions** |||||||||
| Add context nodes to own graph | -- | -- | -- | -- | Yes | -- | Yes |
| Respond to investigations | -- | -- | -- | -- | Yes | -- | Yes |
| **Moderation actions** |||||||||
| Review flagged content | -- | -- | -- | -- | -- | Yes | Yes |
| Hide content pending review | -- | -- | -- | -- | -- | Yes | Yes |
| Dismiss flags | -- | -- | -- | -- | -- | Yes | Yes |
| **Admin actions** |||||||||
| User management (ban/unban) | -- | -- | -- | -- | -- | -- | Yes***** |
| Data corrections | -- | -- | -- | -- | -- | -- | Yes***** |
| System configuration | -- | -- | -- | -- | -- | -- | Yes |
| Publish ingestion batches | -- | -- | -- | -- | -- | -- | Yes |

**Notes:**
- *Marked as politician-sourced in provenance
- **Requires minimum reputation score
- ***Must be within a coalition workspace (Participante as Viewer can comment; Editors and above can create)
- ****Only for coalitions where user is coalition Admin
- *****Requires two-admin approval + audit log entry

---

## 5. Interaction Patterns

### 5.1 Solo Explorer to Coalition Contributor

**The typical arc:**

1. **Solo exploration:** User explores the graph for 1-3 sessions. No account yet. They are clicking through connections, following edges, discovering patterns.
2. **Registration trigger:** They discover a connection that excites or angers them -- a promise linked to a contradictory vote, a donor connected to a suspicious pattern. The "Agregar al grafo" or "Guardar vista" CTA appears at the moment of engagement.
3. **Interest declaration:** During onboarding, they select tags. This is the critical matchmaking moment -- the system must suggest relevant coalitions and graph neighborhoods immediately.
4. **First contribution:** They add a node or draw an edge. The system acknowledges it: "Tu primera contribucion al grafo. Sera visible para toda la comunidad."
5. **First endorsement received:** Someone endorses their edge. This is the first social reward -- someone validated their knowledge.
6. **Coalition joining:** They discover a coalition working on the same graph neighborhood. They join to collaborate on investigations.
7. **Investigation participation:** They contribute evidence or context to a coalition investigation. Their graph contributions are cited. They see their knowledge woven into a larger narrative.
8. **Role progression:** Active contributors get promoted to Editor by coalition Admins. This unlocks investigation creation and review capabilities.

### 5.2 User-to-User Interactions

**Within coalitions:**
- **Discussion threads:** Attached to investigations and shared graph views. Text-based, threaded. No direct messaging between users (prevents harassment channels).
- **Endorsement:** Public, with optional rationale. Users see who endorsed what and why. This creates accountability within the knowledge-building platform.
- **Collaborative editing:** Multiple coalition members can contribute to investigations. Versioning tracks who wrote what.
- **Graph contributions:** Members can see each other's graph contributions within the coalition workspace, building shared knowledge.

**Across coalitions:**
- **Independent endorsement:** Two coalitions independently endorse the same edge. This creates the highest confidence tier.
- **Conflicting edges:** Two users or coalitions add contradictory edges about the same connection. The system shows both, with provenance. Either coalition can flag for moderator review.
- **Cross-citation:** An investigation from one coalition cites graph contributions from another. This creates implicit collaboration.

### 5.3 User-to-Politician Interactions

**One-directional (user to politician):**
- Add nodes and edges about their votes, promises, and connections
- Create investigations citing their graph neighborhood
- Endorse or flag edges connected to them

**Politician response (politician to community):**
- Add context nodes alongside existing edges
- Respond to investigations with evidence nodes
- Draw edges that provide their perspective (e.g., connecting a vote to the real constraint)

**There is no direct messaging between users and politicians.** All interaction is mediated through the graph (nodes, edges, evidence, context) and investigations. This prevents harassment in both directions and keeps everything on the public record.

### 5.4 Conflict Resolution Hierarchy

1. **Contradictory edges:** Both displayed with provenance. Community endorsement determines which has higher confidence. Moderator review if flagged.
2. **Investigation disputed by politician:** Politician adds response nodes. Response is linked to the investigation and visible alongside it.
3. **Cross-coalition disagreement:** Contradictory edges displayed with provenance from each coalition. Community endorsement pattern resolves over time. Formal flag triggers moderator review.
4. **Moderation dispute:** User appeals moderator decision to Admin within 30 days. Two-admin review required.
5. **Data accuracy dispute:** Any user can flag "Posible error." Moderator reviews against original source. Corrections are versioned, not deleted.

### 5.5 Power Dynamics and Safeguards

**Risk: Dominant contributors in graph neighborhoods.** A prolific user could effectively shape the narrative around a politician by adding many edges.
- **Mitigation:** Provenance tracking makes contribution patterns visible. Endorsement from diverse users required for highest confidence tier. Coalition reputation scores track whether graph contributions come from diverse sources.

**Risk: Political capture of coalitions.** A political party funnels operatives into a coalition to control its investigations.
- **Mitigation:** Public membership lists, public endorsement records, geographic diversity metrics, sybil detection on account creation patterns.

**Risk: Misleading investigations.** An investigation cites technically accurate edges but arranges them to create a false narrative.
- **Mitigation:** All cited graph connections are clickable and independently verifiable. Community endorsement of the investigation as a whole. Counter-investigations can cite the same edges with different analysis.

---

## 6. Motivation and Retention Loops

### 6.1 Luciana (Civic Journalist)

**Hook:** Immediate utility. The graph explorer replaces her manual spreadsheet workflow on day one.

**Retention loop:**
1. Congress votes on something she covers
2. She opens the graph, expands the vote node, and traces connections to donors and promises
3. She discovers a pattern worth investigating
4. She creates an investigation document citing the graph connections
5. Her coalition endorses it
6. She publishes an article citing the investigation with embedded graph views
7. Article drives traffic to the platform, which drives more graph contributions, which makes the platform more useful to her

**Reward mechanism:** Professional output. The platform is not a hobby; it is a tool that makes her better at her job. Her investigations becoming authoritative sources is the primary reward.

**Retention risk:** If data lags behind real votes by more than 24 hours, the platform is useless for journalism. Real-time or near-real-time ingestion is critical for this persona.

### 6.2 Raul (Angry Citizen)

**Hook:** Visual connections. He can finally SEE how his diputado connects to the things that make him angry.

**Retention loop:**
1. Flood happens (or any triggering event)
2. Raul opens the graph: "What is my diputado connected to on flood infrastructure?"
3. He sees the connections and adds his own experience as a node
4. He shares the graph view on WhatsApp
5. His neighbors explore the connections and some add their own nodes
6. A coalition picks up the graph neighborhood and builds an investigation
7. Raul feels his anger has been converted into documented, visible knowledge

**Reward mechanism:** Visibility and permanence. Raul needs to see that his contribution is part of the graph, that others endorsed it, that it was cited in an investigation. The reward is not reputation points; it is the feeling of "ahora si, quedo registrado."

**Retention risk:** If nothing happens -- no endorsements, no coalition picks up his data, no one explores the connections -- he concludes the platform is just another place where nothing changes.

### 6.3 Camila (Overwhelmed Newcomer)

**Hook:** Visual discovery. Clicking through graph connections is more engaging than reading data tables. The "aha" moment of discovering a surprising connection.

**Retention loop:**
1. She discovers a surprising connection in the graph (university funding promise -> vote against education budget)
2. She screenshots the graph view and shares it on Instagram
3. Her friends engage ("posta? no sabia esto")
4. She goes back to explore more connections
5. Over time, she develops genuine interest in a specific graph neighborhood (Mendoza education policy)
6. She sets up alerts for new edges in that neighborhood
7. She joins a coalition focused on education

**Reward mechanism:** Social capital. Camila's primary motivation is being seen as politically informed among her peers. The graph must produce views that are visually attractive, self-explanatory, and shareable.

**Retention risk:** If the graph looks ugly, overwhelming, or requires explanation to understand, she will never share it. The visual design and share card quality are critical features, not nice-to-haves.

### 6.4 Marina (Policy Expert)

**Hook:** Her expertise enriches the graph in visible, citable ways. Her evidence nodes and investigation contributions carry the weight of her qualifications.

**Retention loop:**
1. An edge or graph neighborhood touches her domain (environmental engineering, flood mitigation)
2. She adds detailed evidence nodes with technical analysis
3. She writes or contributes to an investigation citing her evidence alongside graph data
4. The investigation is endorsed and cited by journalists and other coalitions
5. She publishes about the experience in academic networks
6. Other experts join, enriching the graph's technical depth

**Reward mechanism:** Intellectual recognition and impact. Marina does not care about gamification points. She cares that her technical contributions are distinguishable from casual opinions through their depth, sourcing, and endorsement pattern. The value comes from the quality of her graph contributions, not from a weighted voting mechanism.

**Retention risk:** If the platform makes no distinction between a casual edge and a deeply sourced evidence node backed by an expert's investigation, Marina has no reason to invest her time here over Twitter.

### 6.5 Jorge (Retired Civic Warrior)

**Hook:** Permanent record. His decades of institutional memory finally have a home in the graph that will not disappear.

**Retention loop:**
1. He remembers a promise a politician made years ago
2. He finds the source (with family help) and adds it as a node with edges to the politician
3. The community endorses the edge -- his memory was right
4. The connection appears in the graph, permanently visible
5. He shows it at his junta vecinal meeting
6. His neighbors are impressed -- "Jorge, vos pusiste eso online?"
7. He feels valued and respected. He adds more historical nodes

**Reward mechanism:** Legacy and community respect. Jorge wants to be useful. Every endorsed edge validates that his memory and civic engagement matter. Notification: "Tu conexion fue verificada por la comunidad" is more powerful for him than any badge.

**Retention risk:** Technical friction. Every login that fails, every form that confuses him, every error message in English -- each one could be the last straw. The platform must be accessible in the most basic sense: large text, simple flows, clear Spanish, minimal jargon.

### 6.6 Santiago (Political Operative)

**Hook:** Threat visibility. The graph makes every connection to his boss visible and explorable. He must be there.

**Retention loop (self-sustaining):**
1. New edge or investigation about his boss appears in the graph
2. Santiago monitors, adds context nodes through the Politico Verificado account
3. He adds counter-evidence nodes connected to disputed edges
4. He monitors coalition investigations for emerging narratives
5. Repeat

**Reward mechanism:** His boss's graph neighborhood includes context and counter-evidence. This is his job performance metric.

**Retention risk:** None. He is retained by the graph's existence, not by its features. The question is not "will he stay" but "will the platform handle him correctly."

---

## 7. Five Critical Flows

### 7.1 First Visit to Graph Exploration

**Goal:** 60 seconds from landing to seeing meaningful connections.

**Flow:**
1. User arrives (from shared link, search, or direct navigation)
2. If from shared link: graph view renders immediately with the relevant connections visible
3. If from homepage: province selector or search bar. User picks province or types a name
4. Graph renders around the selected entity within 2 seconds
5. User clicks an edge and discovers a connection they did not know about
6. The "aha" moment. They want to see more. They click another edge

**Success metric:** 70% of first-time visitors click at least 3 edges in their first session.

**Failure mode:** Graph takes too long to load, graph is visually overwhelming, or user cannot find a relevant starting point.

### 7.2 Discover, Connect, Investigate (Knowledge-Building Loop)

**Goal:** Users discover connections, add their own knowledge, and build investigations.

**Flow:**
1. User explores graph and notices a missing connection or has additional evidence
2. They add a node or draw an edge with source evidence
3. The community endorses their contribution
4. A coalition notices the new connection and incorporates it into an investigation
5. The investigation is published and cited
6. The graph grows richer. Other users discover the new connections and add more

**Success metric:** Each investigation cites at least 5 graph connections. 30% of cited edges were user-contributed (not from seeded data).

**Failure mode:** Users add edges but nobody endorses them. Coalitions do not notice new contributions. Investigations cite only seeded data.

### 7.3 Investigation to Share to Discussion (Collaboration Loop)

**Goal:** Investigations drive sharing, which drives discussion, which drives new contributions.

**Flow:**
1. Coalition publishes an investigation
2. Members share it on social media and WhatsApp
3. New users arrive via shared links and explore the cited graph connections
4. Some new users add their own nodes and edges (new evidence, corrections, context)
5. Discussion forms around the investigation (comments, counter-arguments, additional evidence)
6. The investigation is updated or a follow-up investigation is created

**Success metric:** Each published investigation drives 50+ unique graph exploration sessions. 10% of new visitors from shared investigation links create accounts.

**Failure mode:** Investigations are not shared. Share cards are ugly or confusing. New users cannot understand the investigation without context.

### 7.4 Endorse to Confidence (Trust-Building Loop)

**Goal:** Community endorsement builds confidence in graph data over time.

**Flow:**
1. User-contributed edge is added with source evidence
2. First endorser checks the source and endorses
3. More endorsers add their confirmation
4. Edge reaches verified threshold (3+ endorsements)
5. Edge from multiple independent coalitions reaches highest confidence tier
6. High-confidence edges are cited more often in investigations, which drives more endorsements

**Success metric:** 50% of user-contributed edges reach verified status within 2 weeks. Average time to verification decreases as the community grows.

**Failure mode:** Not enough active endorsers. Users endorse without checking sources. Endorsement brigading by coordinated accounts.

### 7.5 Share to Discover to Explore (Growth Loop)

**Goal:** Shared graph views bring new users who explore and eventually contribute.

**Flow:**
1. User saves a compelling graph view and shares it via WhatsApp or social media
2. Share card renders: static graph image, title, key connection highlighted
3. Recipient taps the link and sees the full interactive graph view
4. They explore further, clicking through edges
5. They find something relevant to their life (their province, their issue, their legislator)
6. They register and add their own knowledge to the graph

**Success metric:** 15% of share card recipients tap through to the platform. 5% of those who tap through register within 7 days.

**Failure mode:** Share card looks bad on WhatsApp (compression, missing preview). Link requires registration to view. Graph view is different on mobile than what was shared.

---

## 8. Failure Modes

### 8.1 Platform-Level Failure Modes

**Cold start -- empty graph:**
- Symptoms: Platform launches with Como Voto data but minimal connections beyond votes. Users arrive, see politicians and votes, but no edges connecting votes to promises, donors, or civic issues. It looks like a vote database, not a knowledge graph.
- Cause: Insufficient seeded data beyond legislative votes.
- Mitigation: Pre-seed the graph with Como Voto vote data, campaign finance data (public records), and a curated set of high-profile promises from major media coverage. Partner with Chequeado, Poder Ciudadano, and Fundar to contribute initial edges. Pre-create at least 3 investigations to demonstrate the full workflow.

**Data staleness:**
- Symptoms: Users check a politician's graph and the most recent vote node is from two weeks ago. Trust collapses immediately.
- Cause: Ingestion pipeline failure or lag.
- Mitigation: Automated daily sync from HCDN/Senado APIs (via Como Voto pipeline). Prominent "Ultima actualizacion: [date]" timestamp on the graph. Alert to Admin if sync fails.

**Graph data quality:**
- Symptoms: User-contributed edges contain inaccurate claims, misleading connections, or fabricated relationships. The graph becomes unreliable.
- Cause: Insufficient quality control on user contributions.
- Mitigation: All user-contributed edges start as "Sin verificar." Endorsement system raises confidence over time. Provenance tracking on everything. Moderation queue for flagged content. Coalition reputation scores incentivize quality contributions.

**Graph overwhelm:**
- Symptoms: Popular politicians have hundreds of edges. The graph is a visual mess. Users cannot find meaningful connections.
- Cause: Too many edges without effective filtering or progressive disclosure.
- Mitigation: Default view shows only highest-confidence edges. Filters for edge type, date range, topic. "Guided exploration" paths for new users. Simplified list view as fallback.

**Moderation bottleneck:**
- Symptoms: Flags pile up. Misleading edges stay visible. Legitimate content gets flagged by political operatives and stays hidden for days.
- Cause: Too few moderators for the volume.
- Mitigation: Community-first moderation (high-reputation users can dismiss obvious spam flags). Moderator SLA dashboard. Prioritize flags on high-visibility content.

**Legal threat paralysis:**
- Symptoms: A politician's lawyer sends a cease-and-desist. Platform panics and hides all edges about that politician. Other users notice and lose trust.
- Cause: No pre-established legal response protocol.
- Mitigation: Retain Argentine legal counsel pre-launch. Pre-draft response templates for common legal threats. All edges are user-contributed with provenance, not platform assertions. Never hide content in response to legal pressure without legal counsel review.

### 8.2 Per-Persona Failure Modes

**Luciana (Journalist) abandons the platform when:**
- Data is not current (more than 48 hours behind real votes)
- Export functionality is limited (no CSV, no API, no embeddable graph views)
- The Query Builder is too simple to answer her investigative questions
- The graph explorer is slow or clunky compared to her own spreadsheets

**Raul (Angry Citizen) abandons the platform when:**
- He adds a node and nothing visibly happens for 2+ weeks (no endorsements, no citations)
- The graph is overwhelming and he cannot find his legislator's connections
- He cannot find his specific legislator (wrong jurisdiction, name mismatch)
- He shares a link and his friend says "I cannot see anything, it asks me to register"
- Adding a node requires too many fields or steps

**Camila (Newcomer) abandons the platform when:**
- First screen is an overwhelming graph with no guidance
- She cannot find content relevant to her (Mendoza, education) within 30 seconds
- The sharing flow requires registration before she can even see a graph view
- The visual design looks like a government website from 2008

**Marina (Expert) abandons the platform when:**
- Her detailed evidence nodes look the same as a casual user's quick edge
- There is no way to distinguish depth of contribution (a sourced technical analysis vs. a one-line claim)
- Investigations she contributes to get no traction or endorsement
- The platform treats all graph contributions identically regardless of sourcing quality

**Jorge (Retired) abandons the platform when:**
- He forgets his password and the recovery flow is confusing
- The node-adding form has too many required fields he does not understand
- His contributions keep getting flagged or ignored
- The font is too small and the contrast is too low
- Error messages are in English or use technical language

**Santiago (Operative) causes problems when:**
- He creates multiple accounts to brigade edge endorsements (sybil attack)
- He floods moderator queues with frivolous flags on every critical edge
- He submits misleading context nodes that appear legitimate
- He coordinates off-platform endorsement brigades
- He weaponizes the flag system against contributors investigating his boss

**Diputada Morales (Politician) disengages when:**
- Her context nodes are not visible alongside the edges they respond to
- Investigations about her do not include her responses
- Her staff cannot manage the account efficiently (too many notifications, no bulk tools)
- Adding context requires too many steps compared to the ease of adding critical edges

### 8.3 UX Friction Points (Cross-Persona)

**Registration wall:** Every action behind registration is a potential churn point. The platform should maximize what Observadores can see and do (full graph exploration, sharing). The registration wall only appears when a user tries to write (add node, draw edge, endorse, save view). And even then, the prompt should explain what they gain, not what they are blocked from.

**Graph literacy:** Not everyone knows how to read a node-and-edge visualization. The platform needs:
- Plain-language labels on all edges ("Voto en contra de", "Recibio donacion de", "Prometio que")
- Guided exploration for first-time users ("Click on a connection to learn more")
- List view alternative for users who find the graph view confusing
- Tooltip explanations on hover

**Notification overload:** Active coalition members could get dozens of notifications daily. Needs: notification preferences, digest mode (daily/weekly summary), priority levels (your content was acted on vs. general coalition activity).

**Empty graph neighborhoods:** When a politician has only vote data but no user-contributed edges, no investigations, and no evidence -- the graph looks sparse. Every empty state needs: (a) an explanation of what COULD be here, (b) a CTA to help fill it ("Se el primero en agregar una conexion para este legislador"), (c) data that IS available (vote history is always populated from Como Voto).

**Mobile experience:** Raul, Camila, and Jorge will primarily access the platform on mobile (Android, likely mid-range devices). The graph visualization needs a mobile-optimized rendering (simplified layout, touch-friendly node tapping, swipe to explore). A list-based alternative for the graph must be fully functional on a 5.5" screen.

**WhatsApp integration:** This is Argentina. WhatsApp is the dominant communication channel. Share cards must be optimized for WhatsApp: static graph image with key connection highlighted, clean URL, Open Graph tags that render well in the WhatsApp link preview. A "Compartir por WhatsApp" button should be first-class, not buried in a share menu.

---

## Appendix: Priority Implications for UX Design

Based on this analysis, the following UX priorities emerge:

1. **Graph explorer as the atomic unit of value.** This is what every persona arrives at, shares, and returns to. It must be visually engaging, fast to load, and immediately comprehensible on mobile. The graph view IS the platform's identity -- it must feel alive, not like a static database.

2. **Investigation editor as the core creation tool.** The investigation document -- citing graph connections as evidence -- is the primary output of the platform. It must be powerful enough for Luciana and Valentina, simple enough that a coalition member can contribute a paragraph.

3. **Share cards showing graph connections as growth engine.** The WhatsApp-shareable graph view (key connection highlighted, clean visual, platform URL) is the primary user acquisition mechanism. 3 of 5 non-adversarial personas discover the platform through shared visual content. Design the share card before the graph explorer.

4. **Province-first navigation.** Most Argentine users think in terms of their province, not their specific legislator. "Mendoza" should be a first-class entry point into the graph.

5. **Plain-language Spanish throughout.** No jargon in the UI layer. Graph edges need human-readable labels in conversational Argentine Spanish: "Voto en contra de", "Prometio que", "Recibio donacion de." Every node type needs a clear Spanish label.

6. **Progressive disclosure on the graph.** Show the simplest connections first (votes, key promises). Reveal complexity (donor networks, evidence chains, user-contributed edges) as users engage deeper. Do not show 200 edges to Camila on her first visit.

7. **Observador experience must be complete.** 100% read and explore access without registration. The registration wall only appears when a user tries to write (add, endorse, save). And even then, the prompt should explain what they gain, not what they are blocked from.

8. **Empty state design is not optional.** At launch, most politician graph neighborhoods will have vote data but few user-contributed edges and no investigations. The empty state IS the launch state. It must feel purposeful ("Se el primero en agregar conexiones") not broken.

9. **Visual, engaging graph on mobile.** The graph visualization must work on 5.5" Android screens with touch interaction. This is not a desktop-first feature adapted for mobile -- it must be designed for mobile from the start, with a list-based fallback.

---

This analysis is based on the product vision for a collaborative political knowledge graph and the Argentine civic/political context. It should be used as input for UX wireframing, feature prioritization, and user testing recruitment.
