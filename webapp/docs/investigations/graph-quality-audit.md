# Graph Quality Audit - Prioritized Fixes

**Date:** 2026-03-19
**Graph:** 4.33M nodes, 6.22M rels

## P0 - Critical (unblocks investigation)

1. **691K orphan AssetDeclarations** - 96% disconnected. Need name/CUIT matching to Politicians/Appointments
2. **Only 3/4,349 offshore officers matched to Politicians** - re-run matching systematically
3. **33 MAYBE_SAME_AS→GovernmentAppointment** - wrong relationship type, migrate to HAS_APPOINTMENT
4. **26 orphan OffshoreIntermediaries** - 100% disconnected, should link to entities
5. **1,068 Politicians (47%) have ZERO external matches** - half the legislature is an island

## P1 - High Value

6. **Common-name MAYBE_SAME_AS explosion** - Fernandez 192 matches, Lopez 120. Need CUIT/DNI discrimination
7. **3,699 orphan Flights** - passenger data trapped in node properties, not relationships
8. **3,615 mislabeled Locations** - actually flight records, wrong label
9. **998 orphan Documents** - have caso_slug but no FILED_IN edges

## P2 - Data Enrichment

10. **86% Legislation untagged** by sector (3,299/3,827)
11. **92% Companies untagged** by sector (975K/1.06M)
12. **Contractor→Company bridge missing** - 4,476 contractors not linked to registry
13. **Only 50 Politician→Donor matches** for 1,467 donors

## P3 - Schema Cleanup

14. Merge ON_FLIGHT/PASSENGER_ON (redundant)
15. Replace vague ASSOCIATED_WITH/AFFILIATED_WITH with specific types
16. Add confidence to 1M+ SAME_PERSON edges
17. Purge 662K orphan Companies with zero rels
