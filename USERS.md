# Office of Accountability: Product Analysis Document

## Comprehensive User Personas, Journeys, Workflows, and Interaction Patterns

**Version:** 1.0
**Date:** 2026-03-13
**Purpose:** UX design foundation and feature prioritization input

---

## 1. User Personas

### Persona 1: Luciana Romero — "The Civic Journalist"

**Demographics:** 34 years old, Buenos Aires (CABA). Works as a data journalist at a mid-size digital media outlet. Previously contributed to Chequeado on a freelance basis.

**Role on platform:** Verificador (DNI verified), Coalition Verifier, eventually Experto

**Motivation:** Luciana needs structured, queryable data linking votes to donor relationships for investigative stories. She currently spends days manually cross-referencing HCDN vote records with campaign finance disclosures in PDFs. She wants a single system that does the graph traversal for her.

**Goals:**
- Find patterns between donor networks and legislative votes for stories she is writing
- Submit and verify Findings that she can then cite in published articles
- Build a reputation as a reliable verifier to gain access to expertise-weighted voting
- Export coalition-endorsed findings as source material for her journalism

**Frustrations:**
- Existing tools (Como Voto, HVN) are read-only and siloed; no way to connect votes to promises or money
- Government data portals are slow, broken, or deliberately opaque
- She has spent months building spreadsheets that become outdated the moment Congress votes again
- Fact-checking organizations she respects move slowly and cover only high-profile cases

**Technical comfort:** High. Comfortable with data tools, APIs, spreadsheets. Could use the Query Builder effectively. Would want CSV/JSON export.

**Time available:** 10-15 hours per week on the platform, integrated into her professional workflow.

**What success looks like:** She publishes a major investigative piece citing three coalition-endorsed Findings from the platform. The piece gets picked up nationally. The platform becomes her primary research tool.

---

### Persona 2: Raul "Raulito" Dominguez — "The Angry Citizen"

**Demographics:** 52 years old, Rosario, Santa Fe. Small business owner (ferreteria). Two kids in public school. His street floods every March.

**Role on platform:** Participante (email+phone verified)

**Motivation:** Raul is furious. His neighborhood has flooded for the third consecutive year. He watched his diputado provincial go on TV and blame the budget, but Raul knows the municipality received infrastructure funds that went elsewhere. He wants to "hacer quilombo" -- make noise, hold someone responsible.

**Goals:**
- Find out how his specific legislators voted on flood infrastructure bills
- Submit the flooding as a Problem linked to his jurisdiction
- Join a coalition focused on infrastructure in Santa Fe
- See a concrete accountability score for his diputado that he can share on WhatsApp

**Frustrations:**
- He does not understand how Congress works. He conflates provincial legislature with national Congress
- He is impatient. If the platform does not show him something useful in 3 minutes, he will close the tab
- He has been burned by platforms that "collect your data and nothing happens"
- Political jargon and legislative procedure language alienates him

**Technical comfort:** Low-medium. Uses WhatsApp and Facebook daily. Can fill out a form. Will not read documentation. Will not understand "Finding" or "Mandate" without plain-language framing.

**Time available:** 30 minutes per week, in bursts. Will check when something triggers him (a flood, a news story, a WhatsApp forward).

**What success looks like:** He submits the flooding problem, joins a coalition, and three months later shares a PDF report card on his legislator's WhatsApp group. His neighbors start talking about it.

---

### Persona 3: Dr. Marina Gutierrez — "The Policy Expert"

**Demographics:** 41 years old, Cordoba capital. Environmental engineer, teaches at Universidad Nacional de Cordoba. Has published papers on flood mitigation infrastructure in the Pampa Humeda.

**Role on platform:** Verificador, then Experto (peer-vouched)

**Motivation:** Marina has technical knowledge that is routinely ignored in legislative debates. She has seen politicians claim "there is no viable solution" to problems she has literally written the engineering specification for. She wants a platform where her expertise has weight in civic decision-making.

**Goals:**
- Contribute technical assessments to Proposals on flood infrastructure, water management, environmental policy
- Audit Constraint claims where politicians allege physical or technical impossibility
- Have her expertise recognized through the badge system so her feasibility votes carry appropriate weight
- Connect with coalitions working on environmental issues nationally, not just in Cordoba

**Frustrations:**
- Public debate in Argentina is driven by political alignment, not technical merit
- She has written op-eds that get ignored; she has testified at legislative hearings where nobody listened
- She does not want to be politically branded -- she wants to participate as a technical voice, not a partisan one
- Existing civic tech platforms do not distinguish between an expert opinion and a random social media take

**Technical comfort:** High. Academic. Comfortable with complex interfaces. Will read methodology documentation. Wants to understand the scoring algorithm.

**Time available:** 3-5 hours per week. More during university breaks. Will contribute in focused bursts around topics she knows deeply.

**What success looks like:** Her expertise-weighted vote on a flood mitigation Proposal's feasibility track tips the balance. The resulting Mandate references her technical analysis. A legislator signs it.

---

### Persona 4: Santiago Ibarra — "The Political Operative"

**Demographics:** 28 years old, CABA. Works as a communications staffer for a PRO diputado. Formally, he is "asesor parlamentario." Informally, he manages his boss's digital reputation.

**Role on platform:** Initially Observador (anonymous monitoring), later creates a Participante account. His boss eventually claims a Politico Verificado account.

**Motivation:** Santiago monitors the platform to protect his boss's image. He wants to submit rebuttals to negative Findings, flag inaccurate data, and -- if possible -- coordinate favorable coalition activity. He is not malicious per se, but his incentives are to present his boss in the best possible light.

**Goals:**
- Monitor all Findings and constraint audits related to his boss
- Submit counter-evidence and rebuttals through the politician's verified account
- Identify which coalitions are most critical of his boss and understand their membership
- If coalitions are producing inaccurate or unfair assessments, use the dispute mechanism
- Quietly coordinate supportive users to join coalitions and vote favorably (grey area)

**Frustrations:**
- The platform's "all votes are public" design makes it hard to coordinate without being visible
- Coalition health scores could flag his coordinated activity
- He cannot edit or remove Findings, only respond to them
- The constraint audit process means his boss's excuses actually get fact-checked

**Technical comfort:** High. Digital native. Understands platform mechanics quickly. Will read the rules to find exploitable edges.

**Time available:** This is part of his job. 15-20 hours per week monitoring and responding.

**What success looks like (from his perspective):** His boss has a clean profile with well-argued rebuttals next to every critical Finding. Constraint claims are supported with evidence that survives audit. His boss signs popular Mandates for good optics.

**What the platform should watch for:** Santiago creating multiple accounts, coordinating vote brigades in coalitions, submitting misleading counter-evidence, or using the flag/moderation system to harass legitimate verifiers.

---

### Persona 5: Camila Valdes — "The Overwhelmed Newcomer"

**Demographics:** 22 years old, Mendoza. University student (abogacia, 3rd year). Politically aware but not active. Saw the platform shared on Instagram by an influencer she follows.

**Role on platform:** Observador, then Participante (if onboarding does not lose her)

**Motivation:** Vague civic curiosity. She voted for the first time in 2023 and felt she did not know enough about the candidates. She wants to "be more informed" but does not have a specific issue or politician in mind.

**Goals:**
- Understand what her legislators are doing without reading legislative text
- Find something personally relevant (education funding, university budget cuts, Mendoza water issues)
- Maybe join a coalition if it feels low-commitment and interesting
- Share something on social media that makes her look politically informed

**Frustrations:**
- She does not know where to start. "Politicians" is too broad. She does not remember her diputado's name
- The platform's terminology (Finding, Mandate, Constraint, Verifier) is intimidating
- She does not want to commit to anything -- she is exploring
- If the first thing she sees is a wall of legislative data, she will bounce immediately

**Technical comfort:** High with social media and consumer apps. Low with data-heavy or civic platforms. Expects Instagram/TikTok-level UX polish.

**Time available:** 5 minutes on first visit. Maybe 15 minutes if something hooks her. Unlikely to return unless she gets a notification about something she cares about.

**What success looks like:** She searches "Mendoza" and sees a clean profile of her senator. She taps "Promise Tracker" and sees a side-by-side of a promise about university funding vs. how they voted. She screenshots it and shares it on Instagram stories. She signs up for alerts on education-related votes.

---

### Persona 6: Jorge Ferreyra — "The Retired Civic Warrior"

**Demographics:** 67 years old, La Plata, Buenos Aires province. Retired public school teacher. Active in neighborhood junta vecinal. Has been going to town hall meetings for 30 years.

**Role on platform:** Participante, aspires to Verificador

**Motivation:** Jorge has decades of institutional memory about local politics. He remembers promises made in 2005 that were never fulfilled. He wants a permanent record that outlasts any single news cycle or election. He is tired of politicians "getting away with it" because people forget.

**Goals:**
- Submit historical promises that he personally witnessed (speeches, campaign events)
- Build a long-term record for politicians in Buenos Aires province
- Participate in a coalition focused on education policy
- See the platform expand to cover provincial and municipal politicians, not just Congress

**Frustrations:**
- His knowledge is in his head, not in linkable URLs. He struggles with the "source URL required" paradigm
- He is not fast with technology. He uses WhatsApp and email but navigates complex web apps slowly
- He fears his contributions will be dismissed because he cannot always provide a digital source
- He watched previous civic tech initiatives (Democracia en Red, etc.) launch and then die

**Technical comfort:** Low. Needs large text, clear navigation, minimal steps. Will call his daughter for help with account verification.

**Time available:** Abundant. He could spend 2-3 hours a day if the platform engages him. The bottleneck is not time, it is technical friction.

**What success looks like:** He successfully submits a promise from 2019 with a YouTube link his grandson helped him find. Three verifiers confirm it. It appears on the politician's profile. He shows his junta vecinal at their next meeting.

---

### Persona 7: "NoCorruptos_AR" — "The Troll / Bad Actor"

**Demographics:** Unknown. Could be a single person with multiple accounts, or a coordinated group. Presents as an anti-corruption crusader but actually aims to weaponize the platform against specific political enemies.

**Role on platform:** Multiple Participante accounts (attempts Verificador)

**Motivation:** Use the platform's legitimacy to launder partisan attacks as "community-endorsed findings." Flood the system with low-quality Findings targeting opposition politicians. Alternatively: discredit the platform itself by submitting obviously false claims and then publicizing "look what this platform says."

**Goals:**
- Create multiple accounts to amplify votes within coalitions
- Submit inflammatory Findings with cherry-picked evidence
- Coordinate off-platform (Telegram groups) to brigade coalition votes
- Exhaust moderator resources with frivolous flags and disputes

**Frustrations (from their perspective):**
- Phone verification per account is annoying but circumventable with multiple SIM cards
- Public voting records mean their coordination patterns are visible
- Coalition health scores could flag their captured coalitions
- The 3-verifier minimum and quorum requirements slow down their attacks

**Technical comfort:** High. Understands platform mechanics, API patterns, and social engineering.

**What success looks like for them:** A coalition they control endorses a misleading Finding that gets media pickup before it is disputed.

**What success looks like for the platform:** Their coordinated activity is detected by sybil analysis within 48 hours. Their coalition health score drops visibly. Cross-coalition dispute resolution overturns their Findings. Their accounts are flagged and verification attempts rejected.

---

### Persona 8: Diputada Ana Morales — "The Responsive Politician"

**Demographics:** 45 years old, UCR-aligned diputada from Entre Rios. Second term. Moderate, generally supportive of transparency initiatives. Her staff convinced her to claim a verified account.

**Role on platform:** Politico Verificado

**Motivation:** She believes being responsive on the platform is good politics. She also genuinely wants to explain her votes -- some of which are complex coalition compromises that look bad in isolation.

**Goals:**
- Respond to Findings with context ("I voted against this bill because of Article 47, which would have...")
- Sign Mandates that align with her platform to build credibility
- Submit legitimate Constraints when she faced real obstacles (party discipline, quorum games)
- Monitor what coalitions in Entre Rios are saying about her

**Frustrations:**
- Some Findings strip context from complex legislative situations
- She does not have time to respond to everything -- she needs her staff to manage this
- She worries that signing a Mandate creates a binding commitment she might not be able to fulfill
- Community audits of her constraints feel adversarial even when she is telling the truth

**Technical comfort:** Low personally (her staff handles it). Her asesores are medium-high.

**Time available:** Personally, 30 minutes per month. Staff: 5 hours per week.

**What success looks like:** Her profile shows a mix of A and B scores with clear reasoning. Her rebuttals are read. She signs two Mandates and follows through on one. Her reelection polling improves in Entre Rios.

---

## 2. User Journey Maps

### Journey: Luciana (Civic Journalist)

**Discovery:** Colleague at Chequeado mentions the platform. She searches "Office of Accountability Argentina" and lands on the homepage.

**First session (45 min):**
1. Sees the search bar. Types a politician she is currently investigating. Finds their full vote history immediately -- this alone is valuable
2. Notices the Promise Tracker. Sees promises linked to votes via Findings. Thinks: "This is what I have been building manually in spreadsheets"
3. Clicks "Money Flow" and sees donor relationships visualized. Realizes this connects to the vote data
4. Creates an account (email + phone). Accepts public transparency terms without hesitation -- she is a journalist, she publishes under her name anyway
5. Browses coalitions. Joins one focused on anti-corruption (e.g., "Transparencia Federal")
6. Bookmarks the Query Builder for later exploration

**Return triggers:**
- Congress votes on a bill she is covering -- she checks how specific legislators voted and whether it aligns with their promises
- A coalition she joined proposes a Finding she can contribute evidence to
- Alert notification: "Legislador X voted on bill tagged #medioambiente" (she set this up)

**Power user evolution:**
- Week 2: Submits her first Finding with primary source evidence
- Month 1: Becomes a coalition Verifier after demonstrating accurate contributions
- Month 3: Applies for Experto badge (peer-vouched by coalition members who know her journalism)
- Month 6: Uses the platform as her primary research tool. Exports Findings as source citations in articles

**Churn risk:** Low, if the data stays current and the Query Builder is powerful enough. High if data ingestion lags behind real votes, or if export functionality is clunky.

---

### Journey: Raul (Angry Citizen)

**Discovery:** His neighbor shares a WhatsApp image -- a politician's profile card showing "Negligente" on flood infrastructure. The image has the platform's URL. Raul taps the link.

**First session (8 min):**
1. Lands on the politician profile from the shared link. Sees the accountability score, the vote breakdown on flood-related legislation. Scrolls
2. Sees "Problemas reportados en tu jurisdiccion" -- recognizes his neighborhood's flooding listed there
3. Wants to add his voice. Taps "Participar." Hits the registration wall
4. **Critical fork:** If registration takes more than 2 minutes (email + phone verification), he is at risk of bouncing. He needs to see immediate value after registering
5. Registers. Selects interests: #inundaciones, #infraestructura, #santafe
6. Sees a suggested coalition: "Vecinos por Santa Fe Segura." Joins with one tap
7. Returns to the politician's profile. Sees he can now vote on existing Findings. Votes on one that matches his experience

**Return triggers:**
- Push notification: "Tu coalicion esta auditando una restriccion presupuestaria del Diputado X"
- WhatsApp share from his coalition's report (PDF or share card)
- Another flood event -- he comes back to check if anything changed

**Power user evolution:** Unlikely to become a power user in the traditional sense. His engagement pattern is event-driven and emotional. But he could become a reliable Problem submitter and vote participant within his coalition if the UX stays simple.

**Churn risk:** High. If nothing visible happens within 2-3 weeks of his first session, he concludes "es al pedo" (it is pointless) and never returns. He needs to see that his vote counted, that the coalition acted, that the politician noticed. Even a small signal -- "Tu coalicion endoso un hallazgo que ahora aparece en el perfil del Diputado X" -- keeps him.

---

### Journey: Camila (Overwhelmed Newcomer)

**Discovery:** Instagram story from a political commentary account. Screenshot of a politician's promise tracker. Caption: "mira lo que prometio vs como voto, jajaja."

**First session (4 min):**
1. Taps link. Lands on... the homepage? Or the politician's profile? If the homepage, she needs immediate orientation. A search bar is not enough -- she needs "Busca a tu legislador por provincia" with a map or dropdown
2. She does not know her diputado's name. She selects "Mendoza" from a province selector. Sees a list of Mendoza's legislators
3. Taps one she vaguely recognizes. Sees their profile. The vote history table is overwhelming. She scrolls past it
4. The Promise Tracker catches her eye -- visual, side-by-side, color-coded. She reads one. It is about university funding (directly relevant to her)
5. She wants to share it. Can she share without registering? If yes: she screenshots or uses a share button. Platform gets visibility. If no: friction. She might leave

**Return triggers:**
- If she signed up for alerts on education votes: a notification brings her back
- If she shared content that got engagement from her friends: social validation loop
- University-related political news in mainstream media -- she checks the platform for context

**Power user evolution:** Slow. She might remain a casual observer for months. The path to Participante requires a specific issue to hook her (university budget cuts, water rights in Mendoza). If a coalition forms around student issues and she is invited, she might engage.

**Churn risk:** Very high on first visit. The platform must deliver a personally relevant, visually clear insight within 60 seconds or she is gone. She will not read instructions, will not browse documentation, will not explore menus.

---

### Journey: Santiago (Political Operative)

**Discovery:** His boss's press secretary mentions that the platform is being discussed in Argentine political media. Santiago creates an anonymous Observador session to assess the threat.

**First session (60 min, methodical):**
1. Searches his boss. Reviews every piece of data on the profile. Notes what is accurate, what is missing context, what is wrong
2. Maps which coalitions have endorsed Findings about his boss. Examines their membership (public)
3. Checks the moderation and dispute mechanisms. Reads the platform's content policy thoroughly
4. Assesses whether his boss should claim a verified account (conclusion: yes, to use the rebuttal mechanism)
5. Creates his own Participante account (using a personal phone, not office). Joins a coalition that covers his boss's jurisdiction -- but as a "concerned citizen," not as staff

**Ongoing behavior:**
- Daily monitoring of his boss's profile for new Findings or constraint audits
- Drafting rebuttals through the Politico Verificado account (his boss signs off, he writes)
- Submitting counter-evidence to disputed Findings
- Potentially recruiting sympathetic citizens to join coalitions and vote favorably on his boss's constraint claims

**The grey zone:** Santiago's individual participation as a citizen is legitimate. Coordinating others to vote a certain way is where it gets problematic. The platform's defenses (public votes, coalition health scores, sybil detection) should make coordination visible and costly.

---

### Journey: Jorge (Retired Civic Warrior)

**Discovery:** His grandson shows him the platform on a tablet at a family asado. "Abuelo, mira -- podes buscar a todos los diputados."

**First session (20 min, with help):**
1. His grandson types a politician's name for him. Jorge sees the vote history and is immediately engaged: "Mira, este voto contra la ley de jubilaciones..."
2. He wants to add a promise he heard at a campaign rally in 2019. His grandson helps him find a YouTube clip of the speech
3. They start the Promise submission form together. Jorge dictates; grandson types
4. They hit the registration wall. Jorge does not have his phone handy for SMS verification. Session pauses
5. Next day, Jorge registers on his own (slowly, with some frustration). Completes the Promise submission

**Return triggers:**
- He tells his junta vecinal about the platform. They ask him to submit more data
- He gets a notification that his Promise submission was verified by a coalition
- He discovers coalitions focused on education or retirement policy

**Power user evolution:**
- Week 3: Has submitted 4 promises, all from YouTube clips or news articles his family helped him find
- Month 2: Joins a coalition. Attends a virtual meeting (his daughter sets up Zoom for him)
- Month 4: Becomes a regular contributor. His institutional memory is genuinely valuable to verifiers
- He never becomes technically proficient, but he becomes a reliable source of historical data

**Churn risk:** Medium. Technical friction is the primary killer. If the form is too complex, if verification fails, if he accidentally logs out and cannot get back in -- each incident could be terminal. Accessibility (font size, contrast, clear labels in simple Spanish) is critical for this persona.

---

## 3. Detailed User Workflows

### 3.1 Workflow: Search and View a Politician Profile

**Trigger:** User wants to know about a specific politician or wants to browse legislators from their province.

**Steps:**

1. **Entry point:** User reaches the search bar (homepage, navigation bar, or direct URL).
2. **Input options:**
   - Type politician name (autocomplete with fuzzy matching -- handles "Cristina" vs. "Cristina Fernandez de Kirchner")
   - Browse by province (dropdown or map)
   - Browse by bloc/coalition (PJ, PRO, LLA, OTROS)
   - Browse by chamber (Diputados, Senado)
3. **Search results:** Cards showing: photo, name, province, bloc, chamber, current term status.
4. **Profile view:** User clicks a result and sees:
   - Header: photo, name, party, bloc, coalition, province, chamber, term dates
   - Tab or section navigation: Votes | Promises | Donors | Findings | Constraints | Score | Responses
   - **Votes tab:** Chronological list of LegislativeVotes with legislation title, date, position (color-coded: green=afirmativo, red=negativo, grey=abstencion, hollow=ausente). Filterable by date range, topic tag, legislation keyword
   - **Promises tab:** Side-by-side: promise text + source link | status (En seguimiento/Cumplida/Incumplida/Parcialmente cumplida/Vencida/Reemplazada) | linked Findings
   - **Donors tab:** List of donors with amount, date, type. Interactive graph visualization available
   - **Findings tab:** Coalition-endorsed findings about this politician. Each shows: claim, coalition badge, endorsement count, evidence links, politician's response (if any)
   - **Constraints tab:** "Argumentos Presentados" -- constraint claims with audit status (Sin verificar / Valido / Exagerado / Falso)
   - **Score tab:** Per-Problem accountability scores. Only shows A/B/C/D where data is sufficient. Shows "Sin mandato" or "Pendiente" otherwise
   - **Responses tab:** All rebuttals posted by the politician's verified account
5. **Actions available (by role):**
   - Observador: view everything, share profile URL
   - Participante: above + vote on existing Findings, submit a Promise, set alerts
   - Verificador: above + propose a Finding, participate in constraint audits
   - Politico Verificado (self only): above + post rebuttals, submit constraints, sign mandates

**What can go wrong:**
- Politician name has accents/special characters that the search does not handle (e.g., "Pena" vs. "Peña")
- User searches for a provincial legislator not yet in the system -- needs clear "Not found. This platform currently covers the National Congress" message with a "Notify me when provincial data is added" option
- Vote history is very long for senior legislators -- pagination or infinite scroll needed, with good filters
- User does not understand legislative vote codes -- needs plain-language labels and tooltip explanations

---

### 3.2 Workflow: Submit a Promise

**Trigger:** User has found a public statement by a politician that constitutes a commitment and wants to add it to the record.

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Entry:** From a politician's profile, click "Agregar Promesa" button (visible only to authenticated users).
2. **Form fields:**
   - Politician (pre-filled if coming from profile)
   - Promise text (free text, max 500 characters -- the actual quote or paraphrase)
   - Source URL (required -- YouTube video, news article, official document)
   - Date of promise (date picker, must be in the past)
   - Context/notes (optional, max 200 characters)
   - Tags (suggested based on text, user can add)
3. **Duplicate check:** On submission, system searches for existing promises with similar text for the same politician. If match found: "Ya existe una promesa similar. Queres ver la existente o enviar de todos modos?"
4. **Submission:** Creates a Promise node with status `SUBMITTED` (user-submitted with source URL), tier `Bronze`, linked to the submitting user. Note: `EXTRACTED` is reserved for AI-parsed promises from speeches/manifestos.
5. **Verification queue:** Promise enters the coalition verification queue for coalitions tagged to the relevant jurisdiction or topic.
6. **Coalition review:** 3 Verifiers must approve. Each Verifier checks: (a) the source URL actually contains the promise, (b) the text accurately represents what was said, (c) it is attributable to the politician.
7. **Outcome:**
   - Approved: Promise status changes to `VERIFIED`, appears on politician profile
   - Rejected: User notified with reason. Can resubmit with corrections
   - No quorum within 14 days: Escalated to Moderator

**Feedback to user:**
- Immediate: "Tu promesa fue enviada. Sera revisada por verificadores de una coalicion."
- On approval: "Tu promesa fue verificada y ahora aparece en el perfil de [Politician]"
- On rejection: "Tu promesa fue rechazada. Motivo: [reason]. Podes corregirla y reenviar."

**What can go wrong:**
- Source URL is paywalled (La Nacion, Clarin) -- verifiers cannot check it. Needs a note: "If source is paywalled, include a screenshot or transcript excerpt"
- Source URL is a 3-hour YouTube video with no timestamp -- user should be prompted to include timestamp
- User paraphrases inaccurately -- verifiers catch this, but UX should encourage exact quotes
- User submits a promise that is actually a policy position, not a commitment ("I believe education is important" vs. "I will increase education spending by 20%") -- verifiers need guidance on what counts as a promise
- Jorge (low-tech user) does not have a URL. His contribution is still valuable but the form blocks him. Consider: "No tenes link? Describe donde y cuando lo escuchaste y un verificador te ayudara a encontrar la fuente."

---

### 3.3 Workflow: Propose and Endorse a Finding

**Trigger:** A coalition Verifier identifies that a legislative vote relates to a promise (breaks it, fulfills it, or partially fulfills it).

**Precondition:** User must be a Verifier in a coalition.

**Steps:**

1. **Entry:** From a LegislativeVote detail page or a Promise detail page, click "Proponer Hallazgo."
2. **Finding form:**
   - Subject: the LegislativeVote (pre-filled if coming from vote page)
   - Claim about: the Promise (searchable, with autocomplete)
   - Claim type: Fulfills / Breaks / Partially Fulfills (radio buttons with clear definitions)
   - Description: free text explanation (max 1000 characters) -- why does this vote relate to this promise?
   - Evidence: attach Evidence nodes (URLs, PDFs, documents). At least one required
3. **Submission:** Creates a Finding node with status `pending`. The submitter cannot vote on their own Finding.
4. **Coalition vote opens:**
   - Default window: 72 hours (configurable by coalition Admin)
   - Notification sent to all Verifiers in the coalition
   - Quorum requirement: minimum 3 Verifiers must vote
   - Each Verifier votes: Endorse / Reject, with optional rationale
5. **During voting:**
   - Verifiers can view the evidence, the vote record, the promise text, and the proposer's rationale
   - Discussion thread available (text only, attached to the Finding)
   - Additional evidence can be attached by any Verifier during voting period
6. **Vote closes:**
   - Simple majority of votes cast: Endorsed or Rejected
   - If quorum not met: voting period extended by 48 hours (once). If still no quorum: Finding expires as `pending`
7. **If Endorsed:**
   - Finding status changes to `endorsed`
   - Finding appears on the politician's profile with the coalition's badge
   - Confidence score calculated based on: number of verifiers, their reputation scores, evidence quality
   - Politician (if verified) notified and can post a rebuttal
   - If the Finding is endorsed by 2+ independent coalitions, it gets highest visibility tier
8. **If Rejected:**
   - Finding status changes to `rejected`
   - Proposer notified. Can revise and resubmit (new Finding, not a re-vote on the same one)

**What can go wrong:**
- Coalition has fewer than 3 active Verifiers -- quorum impossible. Platform should warn coalition Admins when Verifier count is low
- Finding is politically motivated rather than evidence-based -- the evidence requirement and multi-verifier quorum mitigate this, but not perfectly
- Two coalitions endorse contradictory Findings about the same vote-promise pair -- the "Plural Truth" principle kicks in: both are shown with sourcing. If a dispute is filed, cross-coalition jury resolves it
- Verifiers vote without reading the evidence (rubber-stamping) -- reputation system should penalize verifiers whose endorsed Findings are later overturned

---

### 3.4 Workflow: Submit a Problem

**Trigger:** User identifies a civic issue in their jurisdiction that they want tracked and potentially resolved through the platform's civic R&D process.

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Entry:** "Reportar un Problema" button from homepage, jurisdiction page, or navigation.
2. **Form fields:**
   - Title (short descriptive title, max 100 characters)
   - Jurisdiction (dropdown: province, then municipality if applicable)
   - Description (rich text, max 2000 characters)
   - Severity: Baja / Media / Alta / Critica (with description of what each means)
   - Evidence links (optional but encouraged -- news articles, photos, government data)
   - Tags (suggested + custom)
3. **Deduplication:** System checks for similar problems in the same jurisdiction. If found: "Hay un problema similar ya reportado: [title]. Queres sumarte a ese en vez de crear uno nuevo?" User can merge (adds their evidence to existing) or create new.
4. **Submission:** Creates Problem node with status `Abierto`.
5. **Jurisdiction linking:** System automatically identifies which legislators represent this jurisdiction and links the Problem to them.
6. **Coalition adoption:** Any coalition with matching tags or jurisdiction scope can "adopt" the Problem, opening a Proposal workspace.
7. **Status progression:** `Abierto` (new) -> `Investigando` (coalition adopted) -> `Con mandato` (proposal reached consensus) -> `Resuelto` (confirmed resolution) -> `Archivado` (closed without resolution, with reason).

**Feedback to user:**
- Immediate: "Tu problema fue registrado. Lo veran los legisladores de [jurisdiction] y las coaliciones relevantes."
- When adopted: "La coalicion [name] esta investigando tu problema."
- When mandate created: "Se creo un Mandato Ciudadano basado en tu problema. [Link]"

**What can go wrong:**
- User selects wrong jurisdiction (confuses provincial vs. municipal vs. federal)
- Duplicate problems are not caught because they are worded differently
- Problem is too vague ("everything is bad") or too narrow ("the pothole on Calle Rivadavia 3400")
- No coalition adopts the problem -- it languishes. Needs a "Problems without coalitions" visibility mechanism

---

### 3.5 Workflow: Coalition Creation and Management

**Trigger:** A user wants to organize a group around a specific issue, jurisdiction, or accountability focus.

**Precondition:** User must be Participante or higher, with minimum reputation score.

**Steps:**

1. **Entry:** "Crear Coalicion" from the coalitions page.
2. **Creation form:**
   - Name (unique, max 60 characters)
   - Description (max 500 characters)
   - Focus tags (required, at least 1)
   - Join policy: Open (anyone can join) or Invite-only (Admin approves)
   - Governance: Simple majority (Phase 1 only option)
3. **Submission:** Creates Coalition node. Creator becomes Admin.
4. **Member recruitment:** Admin shares invite link. Members join with one click (open) or request-and-approve (invite-only).
5. **Role assignment:** Admin can promote Members to Verifiers. Verifiers can propose Findings and participate in constraint audits.
6. **Ongoing management:**
   - Admin configures voting windows (default 72h)
   - Admin can remove members (action logged)
   - Admin can transfer Admin role
   - Coalition health score is computed and displayed publicly

**What can go wrong:**
- User creates a coalition with misleading name (e.g., "Chequeado Oficial" -- impersonating a real org). Moderation flag needed
- Coalition has only 1-2 members and cannot reach quorum for anything. Minimum viable coalition size guidance needed
- Admin goes inactive. Need succession mechanism (auto-transfer to most active Verifier after 90 days of Admin inactivity)
- Coalition is captured by a political party. Health score should flag homogeneous voting patterns and low geographic diversity

---

### 3.6 Workflow: Constraint Audit

**Trigger:** A politician has claimed a constraint (budgetary, legal, physical, jurisdictional) to explain inaction on a Mandate. A coalition opens an audit.

**Precondition:** Must have at least 5 Verifiers available. Can be from a single coalition or a cross-coalition pool (if no single coalition has 5, Verifiers from multiple coalitions tagged to the same jurisdiction/issue can form a joint audit). Must be tagged to the relevant jurisdiction or issue.

**Steps:**

1. **Audit initiation:** A Verifier in the coalition clicks "Auditar Restriccion" on the Constraint node in the politician's profile.
2. **Minimum check:** System verifies 5+ Verifiers are available. If a single coalition lacks 5: "Tu coalicion no tiene suficientes verificadores. Podes iniciar una auditoría conjunta con otras coaliciones de tu jurisdiccion." System shows eligible coalitions for joint audit.
3. **Evidence gathering period (default 2 weeks):**
   - Verifiers upload counter-evidence (budget documents, land registry data, official records, expert analysis)
   - All evidence attached to the Constraint node as Evidence nodes
   - Discussion thread open for Verifiers
   - AI pre-verification (Phase 2): system scans relevant public data and flags discrepancies for human review
4. **Voting period (default 1 week):**
   - Each Verifier votes: Valido / Exagerado / Falso, with mandatory rationale (min 100 characters)
   - Simple majority of votes cast determines verdict (Phase 1). Expertise-weighted in Phase 2.
   - Minimum 5 Verifiers must vote for verdict to be valid
5. **Verdict published:**
   - Verdict appears on politician profile under "Argumentos Presentados"
   - Verdict is itself a Finding -- can be disputed
   - Accountability score updated accordingly (if all inputs now available)
6. **Politician response:**
   - Politician (if verified) notified of verdict
   - Can post rebuttal and submit additional counter-evidence
   - Can file a formal dispute (triggers cross-coalition jury review)

**What can go wrong:**
- Evidence is technical (budget PDFs in bureaucratic format) and Verifiers do not understand it -- this is where Experto votes become critical in Phase 2
- Constraint is partially true (budget was tight, but not impossible) -- the "Exagerado" verdict handles this middle ground
- Politician files frivolous disputes to delay score publication -- dispute resolution needs a time-bound process
- Coalition Verifiers have a political bias against this politician -- cross-coalition requirement for highest-tier Findings mitigates this

---

### 3.7 Workflow: Problem-to-Mandate Pipeline

**Trigger:** A coalition has adopted a Problem and wants to research, propose, and build consensus on a solution.

**Steps:**

1. **Adoption:** Coalition Admin clicks "Adoptar Problema" on a Problem node. Coalition appears as investigating.
2. **Proposal workspace opens:**
   - Rich text editor for collaborative drafting
   - Evidence attachment (PDFs, links, expert analysis)
   - Versioning: every edit saved with author + timestamp
   - AI-assisted document summarization available (labeled as AI)
   - Time-boxed sprint: default 4 weeks
3. **Drafting phase (Borrador):**
   - Any coalition member can contribute text
   - Verifiers can attach evidence and technical analysis
   - Experts (Phase 2) can add feasibility assessments
   - Admin sets sprint deadline
4. **Open for comments (Abierto a comentarios):**
   - Proposal published within coalition for feedback
   - Any member can comment
   - Authors can revise based on feedback
   - Duration: 1 week default
5. **Voting phase (Votacion):**
   - Two tracks (Phase 2):
     - Feasibility: expertise-weighted vote
     - Preference: community vote (simple majority Phase 1, quadratic Phase 2)
   - Duration: 1 week
   - All coalition members can vote
6. **Outcome:**
   - Both tracks approve: Proposal becomes a Mandate
   - Either track rejects: Proposal can be revised and re-voted, or archived
   - Sprint expires without vote: Admin can extend or archive
7. **Mandate creation:**
   - Mandate node created, publicly visible
   - AI scans existing legislation for alignment (flagged for human review)
   - Politicians in the relevant jurisdiction are notified
   - Politicians can "Sign" the Mandate (creates SIGNED_MANDATE edge + implicit Promise)
   - Subsequent legislative votes on aligned legislation update accountability scores

**What can go wrong:**
- Proposal workspace becomes a mess -- too many cooks, no clear author. Admin should be able to assign a "lead drafter"
- Sprint expires with an unfinished proposal -- common. Need easy "extend sprint" and "archive without judgment" flows
- Mandate is created but no politician signs it -- this is expected and is itself accountability data ("0 legisladores firmaron este mandato")
- Community votes are low-participation -- quorum requirements need to balance legitimacy with realism. A 10-member coalition should not need 50% turnout
- Proposal is technically infeasible but popular -- the dual-track system is designed for exactly this, but only works in Phase 2 with expertise-weighted voting

---

## 4. User Action Matrix

| Action | Observador | Participante | Verificador | Experto | Politico Verificado | Moderador | Admin |
|--------|:----------:|:------------:|:-----------:|:-------:|:-------------------:|:---------:|:-----:|
| View politician profiles | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View vote history | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View promise tracker | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View donor relationships | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View Findings | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View coalition reports | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View audit trail ("Ver historial") | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Share content (URL/share card) | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Search politicians/legislation | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Use Query Builder | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Account actions** |||||||||
| Create account | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Set up alerts | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Follow coalitions | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| **Content submission** |||||||||
| Submit a Problem | -- | Yes | Yes | Yes | Yes******* | Yes | Yes |
| Submit a Promise | -- | Yes | Yes | Yes | Yes******* | Yes | Yes |
| Flag content for moderation | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| Flag data error ("Posible error") | -- | Yes | Yes | Yes | Yes | Yes | Yes |
| **Coalition participation** |||||||||
| Join a coalition | -- | Yes | Yes | Yes | -- | -- | Yes |
| Create a coalition | -- | Yes* | Yes | Yes | -- | -- | Yes |
| Vote on Findings (as member) | -- | Yes** | Yes | Yes | -- | -- | Yes |
| Vote on Proposals (as member) | -- | Yes** | Yes | Yes | -- | -- | Yes |
| Propose a Finding | -- | -- | Yes*** | Yes*** | -- | -- | Yes |
| Participate in constraint audit | -- | -- | Yes*** | Yes*** | -- | -- | Yes |
| Manage coalition membership | -- | -- | -- | -- | -- | -- | Yes**** |
| **Expertise actions** |||||||||
| Cast expertise-weighted vote | -- | -- | -- | Yes | -- | -- | -- |
| Vouch for another user's expertise | -- | -- | -- | Yes | -- | -- | Yes |
| **Politician actions** |||||||||
| Post rebuttal to a Finding | -- | -- | -- | -- | Yes***** | -- | Yes |
| Submit a Constraint claim | -- | -- | -- | -- | Yes | -- | Yes |
| Sign a Mandate | -- | -- | -- | -- | Yes | -- | Yes |
| File formal dispute | -- | -- | -- | -- | Yes | -- | Yes |
| **Moderation actions** |||||||||
| Review flagged content | -- | -- | -- | -- | -- | Yes | Yes |
| Hide content pending review | -- | -- | -- | -- | -- | Yes | Yes |
| Dismiss flags | -- | -- | -- | -- | -- | Yes | Yes |
| **Admin actions** |||||||||
| User management (ban/unban) | -- | -- | -- | -- | -- | -- | Yes****** |
| Data corrections | -- | -- | -- | -- | -- | -- | Yes****** |
| Score overrides | -- | -- | -- | -- | -- | -- | Yes****** |
| System configuration | -- | -- | -- | -- | -- | -- | Yes |
| Publish ingestion batches | -- | -- | -- | -- | -- | -- | Yes |

**Notes:**
- *Requires minimum reputation score
- **Tier 1 weight (reduced)
- ***Must hold Verifier role within the specific coalition
- ****Only for coalitions where user is coalition Admin
- *****Only for Findings about themselves
- ******Requires two-admin approval + audit log entry
- *******Marked as politician-sourced in provenance

---

## 5. Interaction Patterns

### 5.1 Solo User to Coalition Member

**The typical arc:**

1. **Solo exploration:** User browses politician profiles for 1-3 sessions. No account yet. They are consuming, not participating.
2. **Registration trigger:** They see something they want to react to -- a Finding they agree with, a promise they want to add, a problem they recognize. The "Participar" CTA appears at the moment of emotional engagement.
3. **Interest declaration:** During onboarding, they select tags. This is the critical matchmaking moment -- the system must suggest relevant coalitions immediately.
4. **Passive membership:** User joins a coalition but does not do anything for 1-2 weeks. They receive activity feed notifications. They read, but do not act.
5. **First vote:** A Finding or Proposal comes up that they feel strongly about. They cast their first vote. This is the activation moment. The platform should acknowledge it: "Tu primer voto. Tu voz ahora cuenta en esta coalicion."
6. **First contribution:** They submit a Promise, a Problem, or evidence for a Finding. The validation from Verifiers confirming their contribution is the first social reward.
7. **Social integration:** They start recognizing usernames in their coalition. They read discussion threads. They develop opinions about who is trustworthy and who is not.
8. **Role progression:** Active contributors get promoted to Verifier by coalition Admins. This is a significant trust signal and unlocks new capabilities.

### 5.2 User-to-User Interactions

**Within coalitions:**
- **Discussion threads:** Attached to Findings, Proposals, and constraint audits. Text-based, threaded. No direct messaging between users (prevents harassment channels).
- **Voting:** Public, with optional rationale. Users see how others voted and why. This creates accountability within the accountability platform.
- **Delegation (Phase 2):** A user can delegate their vote to another user they trust. This delegation is public and revocable. It creates a visible trust network.
- **Expertise vouching:** 3 experts must vouch for a new expert. This creates a peer-review social dynamic.

**Across coalitions:**
- **Co-endorsement:** Two coalitions endorse the same Finding independently. This creates implicit alliance.
- **Conflicting findings:** Two coalitions endorse contradictory Findings. The system shows both, with sourcing. Either coalition can file a formal dispute, triggering cross-coalition jury.
- **Cross-coalition jury:** Randomly selected Verifiers from uninvolved coalitions review disputed Findings. This is the highest-stakes inter-user interaction -- jurors must evaluate evidence impartially.

### 5.3 User-to-Politician Interactions

**One-directional (user to politician):**
- Submit Promises about them
- Propose Findings about their votes
- Audit their Constraint claims
- Vote on Mandates that affect their score

**Politician response (politician to community):**
- Post rebuttals alongside Findings
- Submit counter-evidence
- Sign Mandates (public commitment)
- File formal disputes

**There is no direct messaging between users and politicians.** All interaction is mediated through structured data (Findings, Constraints, Mandates, rebuttals). This prevents harassment in both directions and keeps everything on the public record.

### 5.4 Conflict Resolution Hierarchy

1. **Within-coalition disagreement:** Simple majority vote. Losing side can see the rationale of winning side. No appeal within the same coalition.
2. **Finding disputed by politician:** Rebuttal posted alongside Finding. Politician can file formal dispute to Moderation.
3. **Cross-coalition disagreement:** Conflicting Findings displayed with "Plural Truth" framing. Formal dispute triggers cross-coalition jury (randomly selected Verifiers from uninvolved coalitions).
4. **Moderation dispute:** User appeals moderator decision to Admin within 30 days. Two-admin review required.
5. **Data accuracy dispute:** Any verified user can flag "Posible error." Moderator reviews against original source. Corrections are versioned, not deleted.

### 5.5 Power Dynamics and Safeguards

**Risk: Dominant personalities in coalitions.** A vocal, high-reputation user could effectively control a small coalition's output.
- **Mitigation:** Coalition health score tracks voting correlation. If all Verifiers always agree, the score drops. Diverse voting patterns are rewarded.

**Risk: Political capture of coalitions.** A political party funnels operatives into a coalition to control its Findings.
- **Mitigation:** Public membership lists, public voting records, geographic diversity metrics, sybil detection on account creation patterns.

**Risk: Expertise gatekeeping.** Existing Experts could refuse to vouch for qualified newcomers from different political perspectives.
- **Mitigation:** Multiple vouching paths (3 experts from any coalition, not just one). LinkedIn/credential verification as alternative.

---

## 6. Motivation and Retention Loops

### 6.1 Luciana (Civic Journalist)

**Hook:** Immediate utility. The platform replaces her manual spreadsheet workflow on day one.

**Retention loop:**
1. Congress votes on something she covers
2. She checks the platform for the vote record, promise alignment, and donor connections
3. She finds a pattern worth investigating
4. She submits a Finding with evidence
5. Coalition endorses it
6. She cites the endorsed Finding in her published article
7. Article drives traffic to the platform, which drives more data submissions, which makes the platform more useful to her

**Reward mechanism:** Professional output. The platform is not a hobby; it is a tool that makes her better at her job. Reputation and Experto status are secondary rewards that validate her expertise.

**Retention risk:** If data lags behind real votes by more than 24 hours, the platform is useless for journalism. Real-time or near-real-time ingestion is critical for this persona.

### 6.2 Raul (Angry Citizen)

**Hook:** Emotional validation. Someone is finally documenting what he has been yelling about at the bar.

**Retention loop:**
1. Flood happens (or any triggering event)
2. Raul checks the platform: "What is my diputado doing about this?"
3. He sees the accountability score and shares it on WhatsApp
4. His neighbors engage with the shared content
5. Some of them join the platform and his coalition
6. The coalition grows and produces a Mandate
7. Raul feels his anger has been converted into organized action

**Reward mechanism:** Social proof and visible impact. Raul needs to see that his participation led to something concrete -- a published Finding, a Mandate, a politician responding. The reward is not reputation points; it is the feeling of "ahora si, se estan enterando."

**Retention risk:** If nothing happens -- no coalition endorses anything, no politician responds, no one shares his content -- he concludes the platform is just another place where nothing changes.

### 6.3 Camila (Overwhelmed Newcomer)

**Hook:** Shareable content. A visually compelling promise tracker screenshot that gets likes on Instagram.

**Retention loop:**
1. She sees something shareable on the platform
2. She shares it on social media
3. Her friends engage ("wow, I did not know this")
4. She goes back to find more shareable content
5. Over time, she develops genuine interest in a specific issue (university funding)
6. She sets up alerts and starts getting notifications
7. She joins a coalition focused on education

**Reward mechanism:** Social capital. Camila's primary motivation is being seen as politically informed among her peers. The platform must produce content that is visually attractive, self-explanatory, and shareable. PDF reports and share cards are critical for this persona.

**Retention risk:** If the platform looks dated, ugly, or requires explanation to understand, she will never share it. The share card design is a critical feature, not a nice-to-have.

### 6.4 Marina (Policy Expert)

**Hook:** Her expertise finally has weight. The dual-track system gives her feasibility vote more impact than a random opinion.

**Retention loop:**
1. A proposal appears in her domain (environmental engineering)
2. She provides a technical feasibility assessment
3. Her expertise-weighted vote influences the outcome
4. The resulting Mandate references technical analysis she contributed to
5. She publishes about the experience in academic networks
6. Other experts join, enriching the platform's technical capacity

**Reward mechanism:** Intellectual recognition and impact. Marina does not care about gamification points. She cares that her 15 years of hydraulic engineering expertise are distinguished from a random citizen's gut feeling. The Experto badge and expertise-weighted voting are her reward.

**Retention risk:** If the platform treats all opinions equally (Phase 1, before expertise weighting), Marina has no reason to participate over Twitter. The Phase 2 expertise system is critical for retaining this persona.

### 6.5 Jorge (Retired Civic Warrior)

**Hook:** Permanent record. His decades of institutional memory finally have a home that will not disappear.

**Retention loop:**
1. He remembers a promise a politician made years ago
2. He finds the source (with family help) and submits it
3. Verifiers confirm it -- his memory was right
4. The promise appears on the politician's profile
5. He shows it at his junta vecinal meeting
6. His neighbors are impressed -- "Jorge, you put that online?"
7. He feels valued and respected. He submits more

**Reward mechanism:** Legacy and community respect. Jorge wants to be useful. Every confirmed submission validates that his memory and civic engagement matter. Notification: "Tu promesa fue verificada" is more powerful for him than any badge.

**Retention risk:** Technical friction. Every login that fails, every form that confuses him, every error message in English -- each one could be the last straw. The platform must be accessible in the most basic sense: large text, simple flows, clear Spanish, minimal jargon.

### 6.6 Santiago (Political Operative)

**Hook:** Threat mitigation. The platform exists and covers his boss. He must be there.

**Retention loop (self-sustaining):**
1. New Finding posted about his boss
2. Santiago monitors, drafts rebuttal, posts via Politico Verificado account
3. Constraint claim audited -- he submits counter-evidence
4. He monitors coalition activity for coordinated attacks
5. Repeat

**Reward mechanism:** His boss's profile looks fair and responsive. This is his job performance metric.

**Retention risk:** None. He is retained by the platform's existence, not by its features. The question is not "will he stay" but "will the platform handle him correctly."

---

## 7. Failure Modes

### 7.1 Platform-Level Failure Modes

**Cold start death spiral:**
- Symptoms: Platform launches with Congress data but no active coalitions. Users arrive, see data, but nobody is verifying anything. No Findings, no Mandates, no scores. It looks like a static database, not an accountability platform.
- Cause: No pre-launch coalition seeding.
- Mitigation: Onboard 3-5 anchor coalitions before public launch (partner with Chequeado, Poder Ciudadano, Fundar, university civic groups). Pre-seed at least 10 Findings to demonstrate the verification flow.

**Data staleness:**
- Symptoms: Users check a politician's vote record and the most recent vote is from two weeks ago. Trust collapses immediately.
- Cause: Ingestion pipeline failure or lag.
- Mitigation: Automated daily sync from HCDN/Senado APIs (via Como Voto pipeline). Prominent "Ultima actualizacion: [date]" timestamp on every profile. Alert to Admin if sync fails.

**Moderation bottleneck:**
- Symptoms: Flags pile up. Spam stays visible. Legitimate content gets flagged by political operatives and stays hidden for days.
- Cause: Too few moderators for the volume.
- Mitigation: Community-first moderation (high-reputation users can dismiss obvious spam flags). Moderator SLA dashboard. Prioritize flags on high-visibility content.

**Legal threat paralysis:**
- Symptoms: A politician's lawyer sends a cease-and-desist. Platform panics and hides all Findings about that politician. Other users notice and lose trust.
- Cause: No pre-established legal response protocol.
- Mitigation: Retain Argentine legal counsel pre-launch. Pre-draft response templates for common legal threats. All Findings are community opinion with citations, not platform assertions. Never hide content in response to legal pressure without legal counsel review.

### 7.2 Per-Persona Failure Modes

**Luciana (Journalist) abandons the platform when:**
- Data is not current (more than 48 hours behind real votes)
- Export functionality is limited (no CSV, no API, no embeddable widgets)
- The Query Builder is too simple to answer her investigative questions
- Her coalition-endorsed Findings are disputed and the resolution takes weeks

**Raul (Angry Citizen) abandons the platform when:**
- He registers and nothing visibly happens for 2+ weeks
- The interface uses words he does not understand (Finding, Mandate, Constraint)
- He cannot find his specific legislator (wrong jurisdiction, name mismatch)
- He shares a link and his friend says "I cannot see anything, it asks me to register"
- His Problem submission disappears into a queue with no updates

**Camila (Newcomer) abandons the platform when:**
- First screen is a wall of text or data tables
- She cannot find content relevant to her (Mendoza, education) within 30 seconds
- The sharing flow requires registration before she can even copy a URL
- The visual design looks like a government website from 2008

**Marina (Expert) abandons the platform when:**
- Her expertise is not distinguished from general participation (Phase 1 limitation)
- Technical proposals get voted down by non-experts who do not understand them
- The platform treats a random citizen's feasibility objection as equal to her engineering assessment
- The expertise badge process is opaque or takes months

**Jorge (Retired) abandons the platform when:**
- He forgets his password and the recovery flow is confusing
- The form has too many required fields he does not understand
- His Promise submissions keep getting rejected without helpful guidance
- The font is too small and the contrast is too low
- Error messages are in English or use technical language

**Santiago (Operative) causes problems when:**
- He creates multiple accounts to brigade coalition votes (sybil attack)
- He files frivolous disputes on every negative Finding to create backlogs
- He submits misleading counter-evidence that appears legitimate
- He coordinates off-platform vote brigades
- He weaponizes the flag system against verifiers investigating his boss

**Diputada Morales (Politician) disengages when:**
- She signs a Mandate and then faces a political cost she was not warned about
- Her rebuttals are buried below the fold and nobody reads them
- Constraint audits feel adversarial even when her constraints are legitimate
- Her staff cannot manage the account efficiently (too many notifications, no bulk tools)

### 7.3 UX Friction Points (Cross-Persona)

**Registration wall:** Every action behind registration is a potential churn point. The platform should maximize what Observadores can see and do (everything except write actions). Even sharing should work without an account.

**Terminology barrier:** "Finding," "Mandate," "Constraint," "Verifier" are platform jargon. In the UI, these should have plain-language Spanish labels:
- Finding -> "Hallazgo" (with tooltip: "Un analisis comunitario que conecta un voto con una promesa")
- Mandate -> "Mandato Ciudadano" (with tooltip: "Una propuesta que la comunidad aprobo por consenso")
- Constraint -> "Argumento/Restriccion" (with tooltip: "Una limitacion que alego el legislador")
- Verifier -> "Verificador" (already clear in Spanish)

**Notification overload:** Active coalition members could get dozens of notifications daily. Needs: notification preferences, digest mode (daily/weekly summary), priority levels (your content was acted on vs. general coalition activity).

**Empty states:** When a politician has no Findings, no Promises tracked, no accountability score -- the profile looks barren and useless. Every empty state needs: (a) an explanation of why it is empty, (b) a CTA to help fill it ("Se el primero en agregar una promesa de este legislador"), (c) data that IS available (vote history is always populated from Como Voto).

**Mobile experience:** Raul, Camila, and Jorge will primarily access the platform on mobile (Android, likely mid-range devices). The knowledge graph visualizations and query builder need responsive alternatives. The politician profile must be fully functional on a 5.5" screen.

**WhatsApp integration:** This is Argentina. WhatsApp is the dominant communication channel. Share cards must be optimized for WhatsApp: image with text overlay, clean URL, Open Graph tags that render well in the WhatsApp link preview. A "Compartir por WhatsApp" button should be first-class, not buried in a share menu.

---

## Additional Personas (Post-Audit)

### Persona 9: Martín Acosta — "The Provincial Watchdog"

**Demographics:** 38 years old, Tucumán capital. High school civics teacher. Active on Twitter commenting on provincial politics.

**Role on platform:** Participante, then Verificador

**Motivation:** Most infrastructure accountability (flooding, roads, schools) is provincial/municipal jurisdiction, not federal. Martín cares about his gobernador and intendente more than about Congress. He wants the platform to expand beyond federal Congress.

**Goals:**
- Track promises made by Tucumán provincial legislators
- Submit Problems about provincial-level issues (education infrastructure, road maintenance)
- Build the case for the platform to add provincial legislature data
- Connect with coalitions working on education in the interior

**Frustrations:**
- Platform only covers Congress at launch — his representatives are not there
- Confusion between federal and provincial jurisdictions (common in Argentina)
- Buenos Aires-centric civic tech — feels like the interior is always an afterthought
- Provincial government data is even harder to find than federal

**Technical comfort:** Medium. Uses social media and news sites daily. Can navigate forms.

**Time available:** 5-8 hours per week, concentrated around local political events.

**What success looks like:** He submits Problems about Tucumán schools. Even without provincial legislator data, the platform links these to federal education budget votes. When Phase 3 adds provincial coverage, his submitted data is already there and his coalition is ready.

**Churn risk:** High if the platform feels federal-only for too long. Needs clear "Provincial coverage coming — your data is being saved" messaging.

---

### Persona 10: Valentina Rossi — "The NGO Coalition Manager"

**Demographics:** 30 years old, CABA. Program officer at Poder Ciudadano (anti-corruption NGO). Manages a team of 4 researchers.

**Role on platform:** Verificador, Coalition Admin (on behalf of her organization)

**Motivation:** Her organization is a potential anchor coalition. She sees the platform as a force multiplier for their existing work — they already track legislative votes manually and publish reports. She wants the platform to formalize and scale what they do.

**Goals:**
- Create and manage a coalition branded as Poder Ciudadano's official presence
- Produce coalition-endorsed Findings that her org can cite in official reports and press conferences
- Coordinate her team's verification work through the platform rather than internal spreadsheets
- Ensure the coalition's health score stays high to maintain institutional credibility

**Frustrations:**
- She needs bulk tools (import multiple promises, manage multiple audits, dashboard for her team)
- Individual-user UX is not designed for institutional workflows
- She is responsible if the coalition endorses something inaccurate — professional stakes are high
- Coalition branding is important: Poder Ciudadano needs visual identity on their endorsed Findings

**Technical comfort:** High. Manages digital tools daily. Expects professional-grade interfaces.

**Time available:** 15-20 hours per week (this is her job).

**What success looks like:** Poder Ciudadano's coalition has 50+ verified members, produces monthly endorsed Finding reports, and is cited by journalists (like Luciana) as a primary source. The platform becomes part of their org's workflow.

**Retention risk:** Low if the platform works. She is retained by professional obligation. Risk is if the platform lacks institutional-grade tools (no bulk operations, no team management, no analytics dashboard).

---

## Additional Workflows (Post-Audit)

### 3.8 Workflow: Data Correction

**Trigger:** A user identifies incorrect data in the graph (wrong vote attribution, inaccurate promise text, incorrect donor amount).

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Flag:** User clicks "Posible error" on any node or edge. A form appears:
   - Error type: Datos incorrectos / Atribucion incorrecta / Fuente invalida / Duplicado
   - Description of error (max 500 characters)
   - Correct information (if known)
   - Supporting evidence URL (optional)
2. **Queue:** Flag creates a review task in the Moderator queue with priority based on: node visibility (high-traffic politician profile = higher priority), data tier (Gold-tier error = urgent, Bronze = standard), and flagger's reputation.
3. **Moderator review:** Moderator compares flagged data against original source URL (in provenance).
   - If source confirms the flag: Moderator creates a corrected version. Old version preserved in audit log with reason for correction.
   - If source does not confirm: Moderator dismisses the flag with explanation to the flagger.
   - If source is unavailable: Moderator marks data as "No verificable" and notifies original submitter.
4. **Notification:** Flagger notified of outcome. If correction made: all coalition-endorsed Findings referencing this node are flagged for review.
5. **Audit trail:** Correction visible in "Ver historial" on the node: who corrected, when, why, and what the previous value was.

**What can go wrong:**
- Malicious flagging to harass verifiers or overwhelm moderators (rate-limit flags per user)
- Correction cascading to invalidate endorsed Findings (system flags affected Findings but does not auto-revoke; coalitions must re-review)
- Original source is paywalled or taken offline — need to store source snapshots at ingestion time

---

### 3.9 Workflow: Content Moderation

**Trigger:** A user flags content as: spam / desinformación / acoso / contenido ilegal.

**Precondition:** Any authenticated user (Participante+) can flag.

**Steps:**

1. **Flag:** User clicks "Reportar" on any user-generated content (Promise submission, Finding, Proposal text, discussion thread comment, coalition description). Selects category and adds optional description.
2. **Auto-triage:** System applies automated checks:
   - Obvious spam (URL patterns, repeated text): auto-hidden, queued for moderator confirmation
   - High-reputation flagger + obvious violation: prioritized in queue
   - Multiple independent flags on same content: escalated to urgent
3. **Moderator queue:** Content appears in queue with: flag category, flagger identity and reputation, content in context (what node/coalition it belongs to), and the author's profile.
4. **Moderator actions:**
   - **Dismiss:** Flag was incorrect. No action on content. Flagger notified.
   - **Hide pending review:** Content hidden from public view. Author notified: "Tu contenido fue ocultado temporalmente para revision."
   - **Remove + warn:** Content removed (preserved in audit log, not displayed). Author receives warning. Explanation provided.
   - **Remove + ban:** Content removed. Author account suspended. Requires two-moderator approval for bans.
   - **Escalate to Admin:** For content involving legal threats, political pressure, or ambiguous cases.
5. **Appeal:** Author can appeal within 30 days. Appeal goes to a different moderator (not the original). If second moderator upholds, author can escalate to Admin (two-admin review, final decision).
6. **SLA:** All flags reviewed within 48 hours. Content hidden during review does not affect reputation scores of the author until resolution.

**What can go wrong:**
- Coordinated flagging by political operatives to silence critical Findings (counter: flags from accounts with low reputation or coordinated flag patterns weigh less)
- Moderator bias (counter: rotating moderator assignment, public transparency report on moderation stats)
- Backlog during political crises (counter: community-assisted triage — high-reputation users can dismiss obvious non-violations)

---

### 3.10 Workflow: Follow a Coalition (Lightweight Engagement)

**Trigger:** User wants to stay informed about a coalition's activity without joining as a member.

**Precondition:** User must be Participante or higher.

**Steps:**

1. **Entry:** From a coalition's profile page, click "Seguir."
2. **Effect:** User receives activity feed updates from this coalition: new endorsed Findings, new Proposals, audit verdicts, and published reports.
3. **No voting rights:** Followers cannot vote on Findings or Proposals within the coalition.
4. **Conversion path:** Activity feed includes a "Unirte a esta coalicion" CTA for users who want to upgrade to Member.
5. **Unfollow:** One-click unfollow from coalition profile or notification settings.

---

## Additional Failure Modes (Post-Audit)

### 7.4 Score Gaming

**Symptoms:** Politicians strategically sign popular Mandates they know will never require legislative action (boosting their score without commitment). Or coalitions create low-stakes Mandates that are easy to support, inflating scores.

**Cause:** The scoring algorithm rewards signing Mandates without weighting the difficulty or significance of the commitment.

**Mitigation:**
- Mandate significance weighting: Mandates from larger/higher-reputation coalitions carry more weight
- Score transparency: public breakdown of which Mandates contribute to the score
- Community flagging: "This Mandate is trivial" flag triggers review
- Time-decay: scores degrade if no new meaningful data points are added

### 7.5 Insufficient Data Scores

**Symptoms:** A Mandate exists (created by a 10-member coalition) and a constraint audit passed (5 Verifiers from a single small coalition). Technically the score inputs are met, but the data quality is thin. The A/B/C/D score appears on the politician's profile but is based on minimal community input.

**Cause:** Minimum thresholds are necessary but not sufficient for quality. Meeting the minimum does not mean the score is robust.

**Mitigation:**
- Display confidence indicator alongside the score: "Based on 1 mandate, 1 coalition audit" vs. "Based on 4 mandates, 3 independent coalition audits"
- Highest visibility tier (featured on homepage, included in reports) requires endorsement from ≥2 independent coalitions
- Tooltip: "This score is based on limited community input. More participation will increase confidence."

---

## Appendix: Priority Implications for UX Design

Based on this analysis, the following UX priorities emerge (revised based on persona analysis):

1. **Politician profile as the atomic unit of value.** This is what every persona arrives at, shares, and returns to. It must be excellent on mobile, fast to load, and immediately comprehensible.

2. **Share cards as growth engine.** The WhatsApp-shareable summary card (promise tracker side-by-side, accountability score, Finding summary) is the primary user acquisition mechanism. 3 of 5 non-adversarial personas discover the platform through shared visual content. Design the share card before the profile page.

3. **Province-first navigation.** Most Argentine users think in terms of their province, not their specific legislator. "Mendoza" should be a first-class entry point.

4. **Plain-language Spanish throughout.** No jargon in the UI layer. Platform terminology in the PRD is for internal use. User-facing language should be conversational Argentine Spanish. Key mappings: Finding = "Hallazgo", Mandate = "Mandato Ciudadano", Constraint = "Argumento/Restriccion", Verifier = "Verificador."

5. **Coalition onboarding is the hardest UX problem.** The concept of "join a group of strangers to collectively verify political claims" is foreign to most Argentine internet users. The framing, the first-time experience, and the "what do I do after I join" guidance will determine whether coalitions succeed or fail. This is blocking for all verification-dependent features.

6. **Progressive disclosure.** Show the simplest view first (vote history, promise tracker). Reveal complexity (Findings, constraint audits, coalition workspaces) as users engage deeper. Do not show the full knowledge graph to Camila.

7. **Observador experience must be complete.** 100% read access without registration. The registration wall only appears when a user tries to write (vote, submit, join). And even then, the prompt should explain what they gain, not what they are blocked from.

8. **Empty state design is not optional.** At launch, most politician profiles will have vote data but no Findings, no Mandates, no scores. The empty state IS the launch state. It must feel purposeful, not broken.

---

This analysis is based on the PRD v0.2 and the Argentine civic/political context. It should be used as input for UX wireframing, feature prioritization, and user testing recruitment.