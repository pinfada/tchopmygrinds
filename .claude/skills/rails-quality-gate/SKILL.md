---
name: rails-quality-gate
description: Pre-commit Rails quality gate for tchopmygrinds. Reads the current diff, dispatches to rails-reviewer, rspec-test-engineer, and conditionally security-reviewer, typescript-reviewer, a11y-architect based on the files touched. Produces a consolidated blocking/important/improvement/tests/watchlist report. Modifies nothing, commits nothing. Use before `git commit` on Rails changes.
---

# Rails Quality Gate — tchopmygrinds

Orchestrates a multi-agent quality review on the current diff before commit. Read-only. Never edits files. Never stages or commits.

## When to invoke

- Before a `git commit` on this Rails project
- After a feature branch is "feature-complete" but before opening a PR
- When asked to "review what's about to be committed"

## Inputs

This skill operates on the current diff. No arguments needed. It reads:
- Staged changes: `git diff --cached`
- Unstaged changes: `git diff`
- Untracked files: `git ls-files --others --exclude-standard`

If there is nothing to review, stop and report `No changes detected — nothing to review.`

## Step-by-step

### 1. Collect the diff and classify each touched file

Run all three in parallel (Bash tool):

```bash
git diff --cached --name-only
git diff --name-only
git ls-files --others --exclude-standard
```

Build a list of all touched paths, then classify each path into zero or more buckets:

| Bucket | Pattern | Trigger for agent |
|---|---|---|
| `rails` | `^app/.*\.rb$`, `^lib/.*\.rb$`, `^config/.*\.rb$`, `^db/migrate/.*\.rb$`, `^db/schema\.rb$`, `^Gemfile$`, `^Gemfile\.lock$`, `^spec/.*\.rb$` | rails-reviewer |
| `tests-rails` | `^spec/.*\.rb$`, OR `rails` bucket changes without paired `spec/` change | rspec-test-engineer |
| `sensitive` | `^config/credentials/`, `^config/master\.key$`, `^\.env`, `^Gemfile`, `^config/initializers/`, `^app/controllers/.*auth.*\.rb$`, `^app/models/user\.rb$`, anything touching JWT/Devise/session | security-reviewer |
| `frontend` | `^frontend/.*\.(ts\|tsx\|js\|jsx)$`, `^frontend/.*\.css$`, `^frontend/package(-lock)?\.json$` | typescript-reviewer |
| `ui` | `^app/views/.*\.(erb\|haml\|slim)$`, `^frontend/src/components/.*\.(tsx\|jsx)$`, `^frontend/src/pages/.*\.(tsx\|jsx)$` | a11y-architect |

A file can land in multiple buckets (e.g. `frontend/src/components/Login.tsx` triggers both `frontend` and `ui`).

### 2. Dispatch to agents in parallel

Use the **Agent** tool with these subagent types, **in a single message with parallel calls** (independent work, no shared state):

- **Always**: `rails-reviewer` (if `rails` bucket non-empty) AND `rspec-test-engineer` (if `tests-rails` bucket non-empty)
- **Conditional**: `security-reviewer` if `sensitive` bucket non-empty
- **Conditional**: `typescript-reviewer` if `frontend` bucket non-empty
- **Conditional**: `a11y-architect` if `ui` bucket non-empty

Each agent prompt must:

1. State that this is a **pre-commit review** triggered by `rails-quality-gate`.
2. Give the agent the list of files in its bucket (don't dump unrelated files).
3. Tell the agent to **propose only — modify nothing**.
4. Ask for output in the agent's standard report format.
5. Cap the report — under 400 words for the conditional reviewers, under 800 for the two main ones.

Example prompt for `rails-reviewer`:

```
Pre-commit review for tchopmygrinds. Files in this commit affecting Rails code:
- app/controllers/api/v1/orders_controller.rb
- app/models/order.rb
- db/migrate/20260512_add_status_to_orders.rb

Review per your standard checklist. Classify each finding as BLOCKING / IMPORTANT / IMPROVEMENT. Propose RSpec tests for each non-IMPROVEMENT finding. Do NOT modify any file. Report in under 800 words.
```

### 3. Aggregate the reports

When all agents return, build a **single consolidated report**. Do not just concatenate — deduplicate findings across agents (e.g. rails-reviewer and security-reviewer may both flag a `params.permit!`).

Aggregation rules:
- A finding flagged BLOCKING by any agent stays BLOCKING.
- A finding flagged by multiple agents merges into one entry, listing the agents that flagged it.
- Cross-cutting findings (e.g. "missing N+1 prevention affects 3 controllers") consolidate.

### 4. Produce the final report

Exact format:

```markdown
# Rails Quality Gate — Report

## Scope
- Files reviewed: N
- Buckets triggered: rails, tests-rails, [sensitive], [frontend], [ui]
- Agents invoked: rails-reviewer, rspec-test-engineer[, ...]

## Verdict
- BLOCKING: <count>
- IMPORTANT: <count>
- IMPROVEMENT: <count>
- Tests proposed: <count>
- Recommendation: <SHIP / FIX_BLOCKING_FIRST / RE_ARCHITECT>

## Blocking findings
<For each blocking, one block:>
### 1. <one-line title>
- **File**: path:line
- **Source**: rails-reviewer (and security-reviewer if both flagged it)
- **Issue**: <2-3 lines>
- **Impact**: <what breaks if shipped>
- **Proposed RSpec test (must fail before fix)**:
  ```ruby
  # ...
  ```
- **Fix sketch**: <not applied>

## Important findings
<same format, terser>

## Improvements
<bullet list, one line each>

## Tests to add or run
- New specs proposed: <list with file paths>
- Existing specs that should be run before commit: `bundle exec rspec spec/<...>`
- Coverage gaps highlighted by rspec-test-engineer: <list>

## Files to watch (touched but not deeply covered)
<files where the review surfaced uncertainty — e.g. a service called by many places, a migration whose impact extends beyond schema>

## What this gate did NOT cover
- <Explicit list of bucket triggers that fired no agent, e.g. "No frontend files changed — typescript-reviewer skipped">
- <Any review dimension intentionally out of scope, e.g. "Performance benchmarks not run — they require a populated DB">
```

### 5. Final actions

- **Do not stage, commit, or modify any file.**
- **Do not run RSpec yourself** — propose the commands; let the user run them.
- If the user explicitly asks "fix the blocking issues" after the report, that is a *new* request — switch out of this skill before editing.

## Failure modes

| Symptom | Cause | Recovery |
|---|---|---|
| No diff | User invoked on a clean tree | Report "Nothing to review" and stop |
| All agents return empty findings | Diff is trivial (typo fix, formatting) | Report "No quality concerns found in <N> files" |
| One agent times out | Long-running review on a huge diff | Report partial results, note which agent timed out, suggest re-running on a smaller commit |
| User has unstaged AND staged changes mixed | Report covers both, note which findings come from staged vs unstaged | — |

## Anti-patterns to avoid

- **Don't run the agents serially.** They're independent. Parallel calls cut total time by 2-3x.
- **Don't auto-apply any suggested fix.** This skill is read-only by design.
- **Don't pad the report.** If the diff is 2 lines of typo fixes, the report should be 5 lines. The user trusts the gate more when it's calibrated.
- **Don't run RSpec yourself.** It can be slow and the user may have a specific subset they want to run. Propose the commands.
- **Don't include lower-priority findings if BLOCKING exist** in a way that lets them get lost. Lead with blocking; relegate improvements to a separate section.
