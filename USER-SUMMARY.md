# User Summary: Everything You Need to Know

This is the distilled essence of USERS.md — the minimum you need to understand your users, design for them, and prioritize what to build.

---

## Who Uses This Platform?

You have **4 user archetypes** that matter for design decisions. Everything else is a variation.

### The 4 Core Archetypes

| Archetype | Persona | What they want | How they arrive | Key metric |
|-----------|---------|---------------|-----------------|------------|
| **The Investigator** | Luciana (journalist), Marina (expert), Valentina (NGO) | Structured data + the power to create citable, endorsed findings | Direct search / professional networks | Time-to-insight |
| **The Angry Citizen** | Raul (business owner), Jorge (retiree) | Visible proof that someone is being held accountable | WhatsApp shared link | Time-to-share |
| **The Curious Passerby** | Camila (student) | Something shareable that makes them look informed | Instagram / social media | Time-to-screenshot |
| **The Political Operative** | Santiago (staffer), Diputada Morales (politician) | Damage control / strategic engagement | Direct monitoring | Response time to Findings |

**The uncomfortable truth:** Your most engaged users (Investigators) are your smallest group. Your largest group (Curious Passerby + Angry Citizen) decides if the platform reaches critical mass. The Operatives are guaranteed to show up — the question is whether your defenses work.

---

## What Each Archetype Actually Does

### Investigators (Luciana, Marina, Valentina)

```
Search politician → Find vote pattern → Submit Finding with evidence
→ Coalition endorses → Export as PDF/citation → Publish externally
```

**They are your content engine.** They create the Findings and verified data that everyone else consumes and shares. Without them, the platform is a static database.

**They need:** Query builder, CSV/JSON export, bulk tools (for NGOs), fast data freshness (<24h from Congress vote to platform), expertise badges that distinguish their work from random opinions.

**They churn if:** Data is stale, export is limited, their expertise isn't recognized (Phase 1 limitation).

---

### Angry Citizens (Raul, Jorge)

```
See shared link → View politician profile → React emotionally
→ Sign up → Submit a Problem or vote on a Finding → Share the result
```

**They are your distribution engine.** They share content on WhatsApp, bring their neighbors, and create the social pressure that makes politicians care. Without them, the platform has no reach.

**They need:** 3-minute path from landing to understanding. Plain Spanish, no jargon. Big "Compartir por WhatsApp" button. Visible feedback that their participation mattered ("Tu voto fue contado. 47 personas opinaron igual").

**They churn if:** Nothing happens within 2 weeks. The interface is confusing. Their legislator isn't found (wrong jurisdiction). They share a link and their friend sees a login wall.

---

### Curious Passerby (Camila)

```
See screenshot on social media → Tap link → Browse one politician
→ Maybe screenshot something → Maybe sign up → Probably leave
```

**They are your growth signal.** They don't create content. They don't join coalitions. But they validate product-market fit: if Camila shares a screenshot, you have something worth building.

**They need:** Visual, self-explanatory content in the first 30 seconds. No registration required to view. Share-optimized cards with Open Graph tags for WhatsApp/Instagram/Twitter previews.

**They churn if:** First screen is data tables. Font is too small. It looks like a government website. They can't find anything about their province in 30 seconds.

---

### Political Operatives (Santiago, Diputada Morales)

```
Monitor politician profile daily → Draft rebuttals → Submit counter-evidence
→ File disputes on negative Findings → Coordinate supportive activity (grey area)
```

**They are your integrity test.** Their engagement is guaranteed — the question is whether the platform handles them correctly. Every design decision about transparency, sybil resistance, and coalition health scores exists because of this archetype.

**They need (from their perspective):** Notification when new Findings appear. Rebuttal tools. Dispute mechanisms. Counter-evidence submission.

**The platform needs (from your perspective):** Public voting records to expose coordination. Coalition health scores to flag capture. Sybil detection to block fake accounts. Rate limits on dispute filing to prevent abuse.

---

## The 5 Flows That Make or Break the Platform

Everything else is secondary. If these 5 flows don't work, nothing works.

### Flow 1: First Visit → Understanding (60 seconds)

```
Land on politician profile (via shared link or province search)
→ See name, photo, party, votes at a glance
→ See Promise Tracker (side-by-side: said vs. did)
→ Share or continue exploring
```

**No registration required.** This is where 80% of users will spend 80% of their time.

### Flow 2: Promise → Finding → Endorsed (the accountability loop)

```
User submits Promise (politician + quote + source URL)
→ 3 Verifiers confirm accuracy → Promise published
→ Verifier proposes Finding (vote X breaks/fulfills promise Y)
→ Coalition votes (72h window, 3+ Verifiers, simple majority)
→ Endorsed Finding appears on politician profile with coalition badge
```

**This is the core product.** If this flow is clunky, slow, or confusing, coalitions die.

### Flow 3: Problem → Proposal → Mandate (the civic R&D loop)

```
User submits Problem (jurisdiction, description, evidence)
→ Coalition adopts it → Opens Proposal workspace
→ 4-week sprint → Community vote → Mandate created
→ Politicians can sign → Score updated
```

**This is the differentiator.** This turns the platform from a scoreboard into a civic laboratory.

### Flow 4: Constraint Audit (the fairness mechanism)

```
Politician claims constraint → Coalition opens audit (5+ Verifiers)
→ 2-week evidence gathering → 1-week vote (Válido/Exagerado/Falso)
→ Verdict published on politician profile
→ Score adjusted contextually
```

**This is what makes the score defensible.** Without it, the platform is just another "gotcha" tool.

### Flow 5: Share → Discover → Participate (the growth loop)

```
Active user shares politician card on WhatsApp
→ Friend sees it, taps link → Lands on profile (no login required)
→ Browses → Signs up → Sets alerts → Eventually joins a coalition
```

**This is how you grow.** The share card IS the marketing.

---

## The Cold Start Chicken-and-Egg

At launch you have **data** (329 legislators, full vote history) but no **community** (no coalitions, no Findings, no Mandates, no scores). The platform looks like a static database.

**The bootstrap sequence:**

1. **Pre-launch:** Onboard 3-5 anchor coalitions (Chequeado, Poder Ciudadano, Fundar, university civic groups)
2. **Pre-launch:** These anchors pre-seed 10+ Findings to demonstrate the verification flow
3. **Launch:** Public users arrive and see a working accountability loop, not an empty shell
4. **Week 1-4:** Anchors produce the first Mandate. Share cards from this generate press coverage
5. **Month 2+:** Organic coalitions form around specific issues (flooding, education, corruption)

**Without anchor coalitions, the platform dies at launch.** This is the single highest priority pre-launch task.

---

## What Users Call Things (Terminology)

The PRD has technical terms. Users speak Argentine Spanish. The mapping:

| PRD Term | User-Facing (UI) | Tooltip Explanation |
|----------|------------------|---------------------|
| Finding | Hallazgo | "Un análisis comunitario que conecta un voto con una promesa" |
| Mandate | Mandato Ciudadano | "Una propuesta aprobada por consenso de la comunidad" |
| Constraint | Argumento / Restricción | "Una limitación que alegó el legislador" |
| Constraint Audit | Auditoría ciudadana | "El proceso donde la comunidad verifica si el argumento es real" |
| Coalition | Coalición | "Un grupo de ciudadanos organizados para verificar datos" |
| Endorsement | Respaldo | "Aprobación de un hallazgo por una coalición" |
| Accountability Score | Puntuación de responsabilidad | "Calificación A-D basada en mandatos y restricciones verificadas" |
| Verifier | Verificador | "Miembro con capacidad de auditar y proponer hallazgos" |

**Rule:** NEVER show internal English terms in the UI. All labels, buttons, tooltips in conversational Argentine Spanish.

---

## Permission Tiers (Who Can Do What)

| I want to... | I need to be... |
|--------------|----------------|
| View everything, search, browse | Anyone (Observador) — no account needed |
| Submit a Problem or Promise | Participante (email + phone verified) |
| Vote on Findings and Proposals | Participante (Tier 1 weight) or Verificador (full weight) |
| Propose a Finding or audit a Constraint | Verificador (DNI verified, Phase 2) with Verifier role in a coalition |
| Cast expertise-weighted vote | Experto (peer-vouched badge) |
| Respond to Findings, sign Mandates | Político Verificado (identity-verified politician) |
| Flag data errors | Participante or higher |
| Moderate content | Moderador (platform staff) |
| Manage platform, correct data | Admin (two-admin approval for destructive actions) |

---

## The 3 Things That Kill Engagement

**1. Nothing happens.**
The user submits something (Problem, Promise, vote) and gets no feedback. No notification, no status update, no visible result. They conclude "esto no sirve para nada" and leave.

**Fix:** Every action gets immediate feedback + a follow-up notification when something changes.

**2. They can't find their legislator.**
Raul searches by name, gets no result (wrong spelling). Camila searches "Mendoza" and gets a wall of names she doesn't recognize. Jorge searches for a provincial legislator who isn't in the system.

**Fix:** Fuzzy search. Province-first browsing. Clear "we only cover Congress for now" messaging with a "notify me" option.

**3. The first screen is overwhelming.**
Data tables, legislative jargon, complex graph visualizations. The Investigator loves this. Everyone else bounces.

**Fix:** Progressive disclosure. Default view = simple (photo, name, party, 3 key promises, shareable card). Advanced view = data tables, graph, query builder. The user chooses to go deeper.

---

## Design Priority Stack (Ranked)

| # | Priority | Why |
|---|----------|-----|
| 1 | Politician profile page (mobile-first) | Every user journey starts and ends here |
| 2 | WhatsApp share card | 3 of 5 non-adversarial personas discover via shared content — this IS your marketing |
| 3 | Province-first search/navigation | Most Argentines think in provinces, not legislator names |
| 4 | Promise Tracker (side-by-side view) | The most immediately understandable and shareable feature |
| 5 | Coalition onboarding flow | The hardest UX problem — if coalitions fail, verification/Findings/Mandates all fail |
| 6 | Finding proposal + voting flow | The core accountability loop |
| 7 | Empty state design | The launch state IS the empty state — it must feel intentional |
| 8 | Problem submission + Proposal workspace | The civic R&D differentiator |

---

## Key Decisions Still Needed

| Decision | Impact | Options |
|----------|--------|---------|
| **Coalition branding** | Visual identity on endorsed Findings | Allow custom logos (Poder Ciudadano wants this) vs. uniform platform UI (prevents partisan look) |
| **Politician outreach** | Whether politicians claim accounts at launch | Active outreach → richer data but political entanglement vs. passive → organic but slower |
| **Score algorithm definition** | Who designs the A/B/C/D formula | Technical team → fast but opaque vs. community vote → slow but legitimate |
| **Monetization** | Sustainability model | Coalition premium features vs. grants (NED, Open Society) vs. donation-based |
| **Anchor coalition partnerships** | Pre-launch partnerships with Chequeado, Poder Ciudadano, Fundar | Formal data-sharing agreement vs. informal invitation |

---

## One-Sentence Summary

**You're building a platform where Luciana creates the evidence, Raul spreads it on WhatsApp, Camila makes it go viral, and Santiago's attempts to game it prove the system works.**
