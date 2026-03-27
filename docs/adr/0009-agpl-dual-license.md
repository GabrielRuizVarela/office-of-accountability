# ADR-0009: AGPL-3.0 with Dual Commercial License

**Status:** Accepted
**Date:** 2026-03-27
**Context:** The platform is going open source. The investigation engine, cross-reference pipeline, and MCP integration represent significant proprietary value. Need to protect against proprietary forks while enabling community contributions.

## Decision

License the project under **AGPL-3.0** with a dual commercial license option.

- **Open source users:** Full AGPL-3.0 -- must share modifications if they deploy a network service.
- **Commercial users:** Separate license available for proprietary use without AGPL obligations.
- **Contributors:** Sign a CLA granting the project the right to sublicense under any license.

## Rationale

- **AGPL > GPL:** The "network use" clause means SaaS deployments must also share source. GPL only triggers on distribution.
- **CLA enables dual licensing:** Without a CLA, contributors retain copyright and the project cannot offer a commercial license for their code.
- **Commercial license protects sustainability:** Revenue from commercial users funds development.

## Consequences

- All contributors must agree to the CLA before their code is merged.
- The project can offer commercial licenses for the investigation engine and advanced features.
- AGPL may discourage some corporate contributors (acceptable tradeoff).
- The LICENSE, NOTICE.md, and CLA.md files must be present in the repository root.
