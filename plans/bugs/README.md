# Bugs

Open visual / behavioural defects observed against shipped components. One file per bug (or per
tight cluster of related defects on the same component). Each file follows the template below so
the fix can be picked up without re-discovering context.

## Lifecycle

```
plans/bugs/                  ← open bugs live here, one file per defect
plans/bugs/fixed/            ← move here once shipped, append an ## Outcome section
plans/bugs/assets/           ← screenshots / recordings referenced by the bug docs
```

## File template

```markdown
# <component> — <one-line summary>

> Status: Open · Reported: YYYY-MM-DD · Component: <package/path> · Severity: <low | med | high>

## Symptom
What the user sees. Include screenshots from `./assets/` when visual.

## Repro
1. Step
2. Step
3. Observed vs expected

## Suspected cause
Short hypothesis with file/line pointers. Leave empty if unknown.

## Acceptance
Bullet list of what "fixed" means — visual, behavioural, and any new test that should exist.
```

## Open

| File                                                                       | Component  | Severity |
| -------------------------------------------------------------------------- | ---------- | -------- |
| [`textarea-active-frame-mismatch.md`](textarea-active-frame-mismatch.md)   | `Textarea` | Medium   |

## Resolved

| File                                             | Component  | Resolved   |
| ------------------------------------------------ | ---------- | ---------- |
| [`input-alignment.md`](input-alignment.md)       | `Input`    | 2026-05-20 |
| [`textarea-alignment.md`](textarea-alignment.md) | `Textarea` | 2026-05-20 |
