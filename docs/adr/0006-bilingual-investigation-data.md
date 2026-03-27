# ADR-0006: Bilingual Investigation Data (ES Primary, EN Secondary)

**Status:** Accepted
**Date:** 2026-03-25
**Context:** The platform investigates Argentine public records (Spanish) but targets an international audience. Investigation data (factchecks, timelines, actors) needs to be available in both languages.

## Decision

Investigation data files use bilingual typed arrays with `_es` and `_en` suffixed fields:

```typescript
{
  claim_es: 'Milei promovio $LIBRA...',
  claim_en: 'Milei promoted $LIBRA...',
  source: 'https://...',
  status: 'confirmed'
}
```

UI localization uses `next-intl` with JSON message files (`messages/es.json`, `messages/en.json`).

## Rationale

- **Spanish primary:** Source documents, legal filings, and government data are in Spanish. Translations must not alter meaning.
- **Inline bilingual:** Investigation data lives in TypeScript files, not in the i18n system, because it contains structured data (dates, amounts, sources) alongside translated text.
- **next-intl for UI:** Separates UI chrome (buttons, labels, navigation) from investigation content.

## Consequences

- Every new investigation data entry requires both `_es` and `_en` fields.
- Language toggle is a client-side context switch (no URL-based locale routing).
- Translation quality is manually verified -- no machine translation.
