
# Implementation Plan: Add Expense Via In‑Context Modal

**Branch**: `001-update-adding-new` | **Date**: 2025-09-24 | **Spec**: /Users/fredriklanga/Documents/projects2024/budgetApp/specs/001-update-adding-new/spec.md
**Input**: Feature specification from `/specs/001-update-adding-new/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Replace the standalone expense creation page with an in-context modal launched from the expenses list. The modal preserves list state, enables rapid multi-entry (Save & Add Another), enforces validation (amount > 0, no future date, description ≤ 140 chars, split ratios sum 100%), and logs analytics events. We will leverage existing Express POST /api/expenses endpoint and client state management (current list component) with minimal architecture changes. Optimistic insertion or targeted refetch will update the list; budget remaining is displayed opportunistically using existing summary/budget endpoints if response latency is low.

## Technical Context
**Language/Version**: Node.js 18.x (server), React 18 (client)  
**Primary Dependencies**: Express, Knex (SQLite), React, Tailwind CSS, (design system components migrating toward shadcn/ui)  
**Storage**: SQLite (expenses table as defined in `server/db/setup.js`)  
**Testing**: Jest + React Testing Library (client), ad-hoc Node scripts (server)  
**Target Platform**: Web (desktop + responsive mobile)  
**Project Type**: Web (frontend + backend mono-repo with client/ & server/)  
**Performance Goals**: Modal open <150ms; submit round-trip visible spinner if >300ms; list update without full reload  
**Constraints**: Maintain accessibility (focus trap, ESC handling); no new backend endpoints; no added global state library  
**Scale/Scope**: Feature affects single page (expenses list) and creation flow; low concurrency; expected dozens of modal opens per session max

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principle Alignment:
- User Value & Clarity: Reduces navigation friction; success metrics defined.
- Data Integrity: Reuses server validation; adds client-side guards (date, amount, ratios, description length) consistent with spec.
- Security & Privacy: No new data exposure; relies on existing auth middleware; no logging of sensitive values (only event taxonomy w/o PII).
- Test-Driven: Plan includes new component/unit tests + integration scenario tests (open, validate, submit, multi-entry, error retry).
- Observability: Adds structured analytics events (listed in spec FR-028).
- Performance & Simplicity: Avoids new dependencies; keeps logic within existing expenses page module; simple form state hooks.

Quality & Non-Functional Standards:
- Currency formatting unchanged (central utility preserved).
- ISO date preserved to API.
- Accessibility: Focus trap + labels; color not sole indicator.
- No schema change -> no migration required.

Outcome: PASS (no violations requiring Complexity Tracking)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (web app) already present; we will add only a modal component + related hook under existing `client/src/components/expenses/` (or create if missing) and avoid structural changes.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md (created) summarizing validation rules, insertion strategies (optimistic vs refetch), accessibility patterns, and event logging approach.

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/expense-modal.md (no new API endpoints, but document usage contract), quickstart.md, updated agent context (not executed yet in this plan scope per instructions), plus test outline (not created here).

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach documented (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (spec already finalized)
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
