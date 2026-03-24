# Nuclear Risk Investigation Article — Design Spec

**Date:** 2026-03-24
**Status:** Approved
**Page:** `/caso/riesgo-nuclear/resumen`

## Overview

Bilingual (EN/ES) investigative article for the nuclear risk tracking investigation. Static narrative with embedded data callouts, matching the Caso Libra resumen pattern. Full disclosure of all 31 ETL data sources.

## Page Structure

### 1. Header
- Title: "Global Nuclear Risk Assessment 2026" / "Evaluacion Global de Riesgo Nuclear 2026"
- Subtitle: methodology + findings summary
- Reading time estimate
- Last updated date

### 2. Executive Summary
- 2-3 paragraphs summarizing the current threat landscape
- Overall risk level statement
- Three simultaneous nuclear conflicts identified (Ukraine, Iran, India-Pakistan)
- New START expiration context

### 3. Methodology
- Signal collection: 6 active RSS/API sources (Wave 0), 21 web-enriched signals
- Keyword filtering: nuclear-relevant term matching
- LLM classification: Qwen 3.5 9B via llama.cpp, severity scoring (0-100), escalation levels, theater assignment
- Factchecking: actor name resolution, enum validation, severity/level cross-checks
- Scoring model: 5-factor weighted (source tier 20%, event type 30%, actor status 15%, novelty 15%, corroboration 20%)
- Escalation ladder: routine (0-20), notable (21-40), elevated (41-60), serious (61-80), critical (81-100)

### 4. Findings by Theater (6 sections)

Each theater section includes:
- Signal count and average severity
- Key signals with dates and source links
- Narrative analysis

Theaters ordered by severity:
1. **Korean Peninsula** (avg 87) — 4 DPRK missile tests in 3 months, hypersonic capability, sea-launched cruise missiles, nuclear-capable MLRS
2. **Middle East** (avg 70) — US-Israel strikes on Iran, Natanz damage, IAEA locked out, 440kg HEU stockpile, ongoing negotiations
3. **South Asia** (avg 70) — India-Pakistan armed conflict with nuclear brinkmanship, first drone/missile use, Gabbard Pakistan threat assessment
4. **US-Russia** (avg 53) — New START expired Feb 5 2026, Russia voluntary compliance, Trump calls for new treaty, China inclusion push
5. **Global** (avg 51) — Doomsday Clock, China 600+ warheads tripled in 5 years, covert test allegations, proliferation risk
6. **Europe** (avg 50) — Macron advanced nuclear deterrence, 8 nations join cooperation dialogue, NATO HLG meeting

### 5. Key Signals
Top 10 critical signals with:
- Date, title, summary
- Source URL (linked)
- Severity score and escalation level
- Actors involved

### 6. Data Model
Brief explanation:
- 29 NuclearSignal nodes (classified by severity, type, theater)
- 14 NuclearActor nodes (9 armed + 5 threshold states)
- 29 WeaponSystem nodes
- 8 Treaty nodes
- 28 NuclearFacility nodes with coordinates
- 166 relationships (INVOLVES, ESCALATES, POSSESSES, OPERATES, PARTY_TO, REFERENCES_TREATY, SYNTHESIZES)

### 7. Next Steps
- Wave 1 sources: 10 additional (UNSC, US NRC, OPCW, SIPRI, FAS, UK MoD, France MoD, EU EEAS, wire services, USGS seismic)
- Wave 2 sources: 15 additional (government MFAs, CTBTO, CRS, ADSB, OSINT social)
- Cross-reference engine: entity deduplication across sources
- Pattern detection: automated convergence and anomaly flagging
- Daily automated briefings via cron

### 8. Full Source Disclosure
Table with all 31 sources:

| # | Source | Tier | Method | URL/Endpoint | Status |
|---|--------|------|--------|-------------|--------|
| 1 | IAEA | gold | RSS | iaea.org/feeds/topnews | Active |
| 2 | IAEA Board of Governors | gold | Document scrape | iaea.org | Planned (Wave 2) |
| 3 | CTBTO | gold | Public API | ctbto.org | Planned (Wave 2) |
| 4 | CTBTO Official | gold | Document scrape | ctbto.org | Planned (Wave 2) |
| 5 | UN Security Council | gold | UN Documents API | un.org | Planned (Wave 1) |
| 6 | US DoD | gold | RSS | war.gov | Active |
| 7 | US Congressional Research Service | gold | Document scrape | congress.gov | Planned (Wave 2) |
| 8 | NATO | gold | Google News RSS proxy | news.google.com | Active |
| 9 | OPCW | gold | RSS | opcw.org | Planned (Wave 1) |
| 10 | US NRC | gold | RSS/API | nrc.gov | Planned (Wave 1) |
| 11 | SIPRI | gold | Scrape/CSV | sipri.org | Planned (Wave 1) |
| 12 | US State Dept | silver | RSS | state.gov | Active |
| 13 | Russian MFA | silver | RSS/scrape | mid.ru | Planned (Wave 2) |
| 14 | Chinese MFA | silver | RSS/scrape | mfa.gov.cn | Planned (Wave 2) |
| 15 | DPRK (KCNA) | silver | Scrape | KCNA Watch proxy | Planned (Wave 2) |
| 16 | UK MoD | silver | RSS | gov.uk | Planned (Wave 1) |
| 17 | French MoD | silver | RSS | defense.gouv.fr | Planned (Wave 1) |
| 18 | Indian MEA + DRDO | silver | RSS/scrape | mea.gov.in | Planned (Wave 2) |
| 19 | Pakistan MFA + SPD | silver | RSS/scrape | mofa.gov.pk | Planned (Wave 2) |
| 20 | EU EEAS | silver | RSS | eeas.europa.eu | Planned (Wave 1) |
| 21 | NPT Review Conference | silver | Document scrape | un.org | Planned (Wave 2) |
| 22 | MTCR | silver | Document scrape | mtcr.info | Planned (Wave 2) |
| 23 | Nuclear Suppliers Group | silver | Document scrape | nuclearsuppliersgroup.org | Planned (Wave 2) |
| 24 | Arms Control Association | silver | RSS | armscontrol.org/rss.xml | Active |
| 25 | Bulletin of Atomic Scientists | silver | WP REST API | thebulletin.org/wp-json | Active |
| 26 | Federation of American Scientists | silver | RSS | fas.org | Planned (Wave 1) |
| 27 | ASPI | silver | RSS | aspi.org.au | Planned (Wave 1) |
| 28 | Reuters/AP | silver | News API | newsapi.org | Planned (Wave 1) |
| 29 | ADSB Exchange | bronze | API | adsb.fi | Planned (Wave 2) |
| 30 | OSINT Twitter/X | bronze | Curated feeds | x.com | Planned (Wave 2) |
| 31 | USGS Earthquake | bronze | API | earthquake.usgs.gov | Planned (Wave 1) |

### 9. Footer
- Methodology disclaimer: automated analysis supplemented by human review
- Open-source notice: all data from public sources
- Last updated timestamp
- Link to graph explorer

## Technical Implementation

- File: `webapp/src/app/caso/[slug]/resumen/page.tsx`
- The existing resumen/page.tsx is a Libra-specific client component
- Add slug check: if `riesgo-nuclear`, render `NuclearRiskArticle` component
- New file: `webapp/src/app/caso/[slug]/resumen/NuclearRiskArticle.tsx` — bilingual client component
- No new APIs needed — all data embedded in the component
- Follows existing bilingual pattern: `const t = { title: { en: '...', es: '...' } }`
