<!--
Sync Impact Report
Version change: (none previous) → 1.0.0
Modified principles: (initial adoption)
Added sections: Core Principles; Quality & Non-Functional Standards; Development Workflow & Quality Gates; Governance
Removed sections: None
Templates requiring updates:
 - .specify/templates/plan-template.md ✅ updated (version reference)
 - .specify/templates/spec-template.md ✅ no changes needed
 - .specify/templates/tasks-template.md ✅ no changes needed
 - .specify/templates/agent-file-template.md ✅ no principle drift
Deferred TODOs: None
-->

# Budget App Constitution

## Core Principles

### 1. User Value & Clarity First
The product MUST prioritize features that deliver measurable budgeting, expense tracking,
and financial insight value to end users (couples) over internal optimizations. Every new
feature proposal MUST state the primary user problem, success metric (e.g. reduced manual
entry steps, improved accuracy, faster insight) and how it decreases friction. UI/UX text
MUST be clear, jargon-free, and accessible; unclear or ambiguous copy is rejected in review.
Rationale: Ensures we build what meaningfully improves financial decision making.

### 2. Data Integrity & Accuracy
All persisted financial values (amounts, ratios, settlements, budgets) MUST be validated at
both API boundary and client input layer. Calculations (splits, savings rates, category
totals) MUST have deterministic pure functions covered by unit or behavior tests. Any change
to calculation logic REQUIRES regression tests against historical fixture scenarios. Rounding
rules (currency to 2 decimals) MUST be consistent across server and client utilities.
Rationale: Trust in numbers is existential for a finance tool.

### 3. Security & Privacy by Default
Authentication MUST use JWT with secure secret management (.env not committed). Sensitive
endpoints MUST validate ownership/authorization. No PII or financial aggregates are logged.
Tokens, credentials, and secrets MUST never appear in commits, logs, or client bundle.
Dependencies with known vulnerabilities (per audit) MUST be upgraded before feature merge.
Rationale: Protects users and limits liability surface.

### 4. Test-Driven, Incremental Delivery
New business logic (routes, calculators, analytics aggregations) MUST have failing tests
committed before implementation (Red → Green → Refactor). Critical paths: expense creation,
split calculations, settlement logic, monthly summaries, and optimization insights MUST have
behavior tests. UI components with data transformations (charts, analytics panels) REQUIRE
at least one snapshot or behavior test validating computed props/output structure.
Rationale: Prevents silent regressions and accelerates safe iteration.

### 5. Observability & Transparency
Server MUST log structured events for: auth failures, expense mutations, budget upserts,
analytics batch computations, and optimization runs (excluding sensitive values). Errors MUST
surface actionable context (endpoint, user scope, input class) without leaking secrets.
Client-side silent failures are prohibited; user-visible non-blocking error banners or retry
options MUST exist for analytics + network fetch failures. Rationale: Enables rapid issue
triage and reliability improvements.

### 6. Performance & Simplicity
Client interactive actions (adding expense, toggling tabs, chart rendering) SHOULD complete
within 150ms local dev baseline and MUST alert reviewers if exceeding 300ms. Avoid premature
abstractions: prefer straightforward modules over over-generalized patterns. Remove dead code
within the PR that obsoletes it. Any new dependency MUST justify: (a) capability gap, (b)
maintenance cost, (c) bundle or server impact. Rationale: Keeps system lean and maintainable.

## Quality & Non-Functional Standards

1. Currency handling MUST centralize through a single formatting utility (already `formatCurrency`).
2. All dates MUST use ISO `YYYY-MM-DD` at API boundaries; client formatting is presentation-only.
3. Analytics endpoints MUST return deterministic ordering (by month ascending) and explicit fields.
4. Breaking schema changes REQUIRE migration notes and version bump (see Governance).
5. Accessibility: interactive controls MUST have discernible labels; color usage MUST preserve contrast.
6. Charts MUST degrade gracefully: empty state, loading state, error state with retry.
7. Security scanning (`npm audit --production`) MUST be clean (no high/critical) before release tag.
8. Large data transforms (> O(n log n) or >10ms benchmark) MUST be isolated in pure functions for testability.
9. No direct mutation of shared state objects—immutability patterns enforced in reviews.
10. Secrets (.env) MUST be documented with purpose; unset required vars cause startup failure with clear message.

## Development Workflow & Quality Gates

1. Branch naming: `feature/`, `fix/`, `chore/`, or `refactor/` prefix + concise slug.
2. Conventional Commits enforced; squash merges allowed only if preserving meaningful scopes.
3. Every PR MUST:
	- Link a user-facing outcome or issue
	- Include test evidence (screenshot for UI / test diff / sample JSON)
	- Pass: lint, build (client + server), and tests
4. Reviewers MUST verify: principles adherence, test coverage for new logic, no secret leakage, performance red flags.
5. Feature flags (if introduced) MUST default to off and be documented in README.
6. Rollback readiness: PR description includes which files to revert or toggle to disable feature.
7. Analytics or optimization logic changes MUST add at least one fixture regression scenario.
8. After merge, if production regression detected, fix PR MUST include root cause note + prevention action.

Quality Gate Sequence:
	1. Spec (problem clarity)
	2. Plan (architecture + principle alignment)
	3. Tests (fail first)
	4. Implementation (make green)
	5. Refactor (simplify without behavior change)
	6. Observability review (logs/metrics/error coverage)
	7. Performance spot check (dev timings / bundle size diff if heavy UI)

## Governance

Authority: This Constitution supersedes ad-hoc practices and README statements where conflict
arises. Amendments occur exclusively through a PR labeled `governance` including: (a) diff,
(b) rationale, (c) version bump justification, (d) migration / adoption notes if required.

Semantic Versioning Policy:
 - MAJOR: Removal or redefinition of a principle, or process change invalidating existing workflows.
 - MINOR: Addition of a new principle, new governance section, or materially expanded guidance.
 - PATCH: Non-substantive clarifications, typo fixes, formatting, rewording without changing intent.

Adoption & Compliance:
 - Each plan document MUST cite current constitution version (auto-updated when feasible).
 - PR reviewers MUST block merges that introduce untested calculation changes or violate principles.
 - Quarterly (or every 8 merged feature PRs, whichever first) a lightweight review validates continued relevance.

Breaking Changes Procedure:
 - Draft impact analysis (what breaks, who is affected, mitigation steps)
 - Provide migration steps (scripts / manual tasks)
 - Tag release with version increment and CHANGELOG summary (future enhancement)

Non-Compliance Handling:
 - Minor deviation: document in PR with remediation task.
 - Repeated deviation (same principle 2+ times): open tracking issue with owner + deadline.
 - Critical deviation (security/data integrity): immediate hotfix PR required.

**Version**: 1.0.0 | **Ratified**: 2025-09-24 | **Last Amended**: 2025-09-24