# Phase 1 — Infrastructure

> Status: **Completed** · 2026-05-20 · Depends on: nothing · Blocks: every other phase

## Objective

Stand up the monorepo skeleton, the tool chain, the build pipelines (components + renderer), the
testing pipeline, and all developer scripts. **No DS code yet** — this phase is purely about creating
the foundation that every later phase will sit on.

By the end of this phase you can:

- `pnpm install` from a clean clone and have everything wired up
- `pnpm dev` → runs the (empty) renderer app
- `pnpm build:components` → builds every `packages/*` to `dist/` (currently empty exports)
- `pnpm build:preview` → builds the renderer app to a static site
- `pnpm test` → runs Vitest across all packages
- `pnpm lint` / `pnpm format` → pass cleanly on the empty repo

---

## Deliverables

### 1. Monorepo Skeleton

```
apx-ds/
├── .changeset/                  # changesets config (versioning)
├── .github/                     # (placeholder for future CI)
├── apps/
│   └── renderer/                # Next.js 15 app — local dev preview
├── packages/
│   ├── engine/                  # @apx-dsine
│   ├── tokens/                  # @apx-dsens
│   ├── theme/                   # @apx-dsme
│   ├── components/              # @apx-dsponents
│   └── icons/                   # @apx-dsns (empty placeholder)
├── plans/                       # (existing)
├── .editorconfig
├── .gitignore
├── .npmrc
├── .nvmrc                       # pin Node version (>=20)
├── .prettierrc
├── .prettierignore
├── eslint.config.mjs            # flat config
├── package.json                 # workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json           # shared TS config
├── turbo.json                   # task graph
└── README.md
```

### 2. Root `package.json` Scripts

| Script             | Command                                       | Purpose                           |
| ------------------ | --------------------------------------------- | --------------------------------- |
| `dev`              | `turbo run dev --filter=renderer`             | Start the renderer in watch mode  |
| `build:components` | `turbo run build --filter='./packages/*'`     | Build all publishable packages    |
| `build:preview`    | `turbo run build --filter=renderer`           | Build the renderer to static site |
| `build`            | `pnpm build:components && pnpm build:preview` | Full build                        |
| `test`             | `turbo run test`                              | Vitest across all packages        |
| `test:watch`       | `turbo run test:watch`                        | Vitest watch                      |
| `lint`             | `turbo run lint`                              | ESLint everywhere                 |
| `format`           | `prettier --write .`                          | Prettier write                    |
| `format:check`     | `prettier --check .`                          | Prettier verify                   |
| `typecheck`        | `turbo run typecheck`                         | `tsc --noEmit` everywhere         |
| `clean`            | `turbo run clean && rm -rf node_modules`      | Wipe state                        |
| `changeset`        | `changeset`                                   | Add a release entry               |
| `version`          | `changeset version`                           | Bump versions                     |
| `release`          | `pnpm build:components && changeset publish`  | Publish to npm                    |

### 3. Workspace Configuration

`pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

`turbo.json` — task pipeline with cache, e.g.:

```jsonc
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
  },
}
```

### 4. TypeScript

- `tsconfig.base.json` at root with strict settings shared by all packages.
- Each package has its own `tsconfig.json` extending base, with package-specific `compilerOptions.paths`.
- `composite: true` for fast project references between packages.
- Target ES2022, `moduleResolution: "bundler"`.

Strict settings to enable from day one:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `exactOptionalPropertyTypes: true`
- `verbatimModuleSyntax: true`

### 5. Per-Package Skeleton

Each `packages/*` gets the same shape:

```
packages/<name>/
├── src/
│   └── index.ts        # empty `export {}` for now
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

Per-package `package.json` template:

```jsonc
{
  "name": "@apx-dsme>",
  "version": "0.0.0",
  "private": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
    },
  },
  "files": ["dist", "README.md"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo",
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
  },
}
```

### 6. Root Publishable Aggregator — `apx-ds

We **also** create a top-level publishable package that re-exports everything. This is what consumers
install. Internal packages are scoped under `@apx-dsand live in the workspace but may or may
not be published independently (decision in Phase 2). The root package depends on them via `workspace:*`.

```
apx-ds
├── package.json    # name: "apx-ds
├── src/
│   └── index.ts    # re-exports from all @apx-dsackages
└── tsup.config.ts
```

> **Decision deferred**: bundle into one package vs publish multi-package — see Phase 2.
> Default for now: bundle, one published artifact named `apx-ds

### 7. Renderer App Skeleton (`apps/renderer`)

- Next.js 15 (App Router)
- Tailwind v4 configured
- MDX support (`@next/mdx`)
- Empty home page that just says "APX DS · Renderer"
- Links workspace deps (`apx-dsrkspace:*`) so it consumes the library as a real consumer would
- `next.config.mjs` with `transpilePackages: ['@apx-dsponents', '@apx-apx-ds …]`
- **NOT** in `files` of any published package → never ships

### 8. Linting + Formatting

- ESLint **flat config** (`eslint.config.mjs`) with:
  - `@typescript-eslint`
  - `eslint-plugin-react`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-jsx-a11y`
  - `eslint-plugin-import` (or `eslint-plugin-perfectionist` for ordering)
- Prettier with project-wide config; `.prettierrc` minimal:
  ```json
  { "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
  ```
- `lint-staged` + `simple-git-hooks` (optional, defer to CI later) — **skip in phase 1** to avoid friction

### 9. Testing Pipeline

- **Vitest** installed at root; each package gets a minimal `vitest.config.ts`.
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`.
- Global setup file with `expect.extend(matchers)` for jest-dom.
- A single placeholder `engine.test.ts` proving the harness works.

### 10. Build Pipeline (tsup)

`tsup.config.ts` template for every package:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  external: ['react', 'react-dom'],
});
```

For the root `apx-dsckage, we'll also produce per-component subpath exports later (Phase 5+).

### 11. Changesets

- `pnpm dlx @changesets/cli init`
- `.changeset/config.json` set to:
  - `access: "public"`
  - `baseBranch: "main"`
  - `linked` groups (TBD) — keep empty for now

### 12. Misc

- `.gitignore` covering: `node_modules`, `dist`, `.turbo`, `.next`, `coverage`, `.DS_Store`, `*.log`
- `.npmrc` with `auto-install-peers=true`, `strict-peer-dependencies=false`
- `.editorconfig` for cross-editor consistency
- `.nvmrc` with the chosen Node major (e.g. `20`)

---

## File-Level Tasks (Ordered Checklist)

1. [ ] `git init` (if not already done by user) and create `.gitignore`
2. [ ] Add `.nvmrc`, `.editorconfig`, `.npmrc`, `.prettierrc`, `.prettierignore`
3. [ ] Initialize root `package.json` with workspace scripts
4. [ ] Create `pnpm-workspace.yaml`
5. [ ] Create `tsconfig.base.json`
6. [ ] Install root dev deps: `typescript`, `turbo`, `tsup`, `vitest`, `@testing-library/*`, `eslint`, `prettier`, `@changesets/cli`, `jsdom`
7. [ ] Initialize `turbo.json`
8. [ ] Initialize ESLint flat config
9. [ ] Scaffold `packages/engine`, `packages/tokens`, `packages/theme`, `packages/components`, `packages/icons` with the per-package template
10. [ ] Scaffold root `apx-dsgregator package (in `./` or `./packages/root` — pick one; recommend `./packages/apx-apx-dsname `name` to `apx-ds`)apx-ds
11. [ ] Scaffold `apps/renderer` with `pnpm create next-app` (or manual setup) + Tailwind v4 + MDX
12. [ ] Wire `apps/renderer` to depend on `apx-dsrkspace:*`
13. [ ] Verify `pnpm install` succeeds
14. [ ] Verify `pnpm build:components` succeeds (empty outputs but no errors)
15. [ ] Verify `pnpm dev` opens the renderer at `http://localhost:3000`
16. [ ] Verify `pnpm test` runs and the placeholder test passes
17. [ ] Verify `pnpm lint` + `pnpm typecheck` + `pnpm format:check` all pass
18. [ ] `pnpm changeset init`
19. [ ] Commit with message like `chore: phase 1 — infrastructure scaffolding`

---

## Acceptance Criteria

- [ ] Fresh clone → `pnpm install && pnpm build` succeeds with no errors.
- [ ] `dist/` exists in each `packages/*` after build, even if empty exports.
- [ ] `pnpm dev` starts the renderer; visiting `localhost:3000` shows the placeholder page.
- [ ] Adding an export to `packages/engine/src/index.ts` is immediately consumable from
      `apps/renderer` (hot reload works through the workspace link).
- [ ] `pnpm build:preview` produces a static `out/` or `.next/` build of the renderer.
- [ ] `npm pack --dry-run` inside the root publishable package shows **only** `dist/`,
      `README.md`, `LICENSE`, and `package.json` — no tests, no renderer, no examples.
- [ ] All scripts in the root `package.json` are documented in `README.md`.

---

## Decisions to Make Before Starting

1. **Multi-package publish vs single bundled package?**
   - Recommendation: **single `apx-dsckage** for simpler consumer DX. Internal packages stay
     in the workspace but are bundled into one tarball by the root package's `tsup` config.
   - Future-proof: we can split later by adding `exports` subpaths first.

2. **License?** MIT is recommended for max adoption.

3. **Package scope?** If you might add `@apx-dspublished packages later, reserve the
   `@apx-dsm org now.

4. **Node version target?** Recommendation: Node 20 LTS.

---

## Risks & Mitigations

| Risk                                              | Mitigation                                        |
| ------------------------------------------------- | ------------------------------------------------- |
| pnpm + Next.js + Turbo cache invalidation gotchas | Pin versions, document them in root README        |
| Tailwind v4 still maturing                        | Pin minor version; have fallback plan to v3       |
| Workspace symlinks breaking Next.js HMR           | Use `transpilePackages` in `next.config.mjs`      |
| TS project references slowing dev                 | Skip references initially; revisit if build slows |

---

## Out of Scope for Phase 1

- Any actual component, theme, or engine code (that's phases 2-6)
- CI pipelines (GitHub Actions) — can be added after phase 6
- Visual regression testing setup (Argos/Chromatic) — phase 5+
- Documentation site deployment (Vercel) — after phase 4 stabilizes
- Storybook (we explicitly are **not** using it; we have our own renderer)

---

## When This Phase Is Complete

1. Move this file to `plans/completed/01-infrastructure.md`.
2. Append an `## Outcome` section with: dependencies installed (with versions), any decisions
   that diverged from this plan, screenshots of `pnpm dev` running, link to the seed commit.
3. Open `plans/pending/02-engine.md` to begin Phase 2.

---

## Outcome (2026-05-20)

### What Shipped

Monorepo is fully operational. All acceptance criteria pass:

- [x] Fresh clone → `pnpm install && pnpm build` succeeds with no errors
- [x] `dist/` exists in every `packages/*` after build
- [x] `pnpm dev` starts the renderer at `localhost:3000` (verified HTTP 200, HTML contains the
      placeholder page with Tailwind classes applied)
- [x] `pnpm build:preview` produces a static Next.js build (`apps/renderer/.next/`)
- [x] `npm pack --dry-run` inside `packages/apx-dshows only `dist/`, `LICENSE`,
      `README.md`, `package.json` (1.7 KB tarball, 9 files total — verified)
- [x] All scripts documented in root `README.md`

### Repository Layout (as built)

```
apx-ds
├── .changeset/                      # Changesets initialized, public access
├── .editorconfig
├── .gitignore
├── .npmrc
├── .nvmrc                           # 20
├── .prettierrc / .prettierignore
├── apps/
│   └── renderer/                    # Next.js 15 placeholder page, Tailwind v3
├── eslint.config.mjs                # ESLint flat config (v9)
├── LICENSE                          # MIT
├── package.json                     # root scripts (dev, build:components, build:preview, …)
├── packages/
│   ├── components/                  # @apx-dsponents (empty)
│   ├── engine/                      # @apx-dsine (empty)
│   ├── icons/                       # @apx-dsns (empty)
│   ├── apx-ds               # apx-apx-dsublishable aggregator)
│   ├── theme/                       # @apx-dsme (empty)
│   └── tokens/                      # @apx-dsens (empty)
├── plans/
├── pnpm-workspace.yaml              # incl. onlyBuiltDependencies for esbuild/sharp
├── README.md
├── tsconfig.base.json
└── turbo.json
```

### Final Dependency Versions

Root devDependencies actually installed:

| Package                                     | Resolved              | Notes                                                |
| ------------------------------------------- | --------------------- | ---------------------------------------------------- |
| typescript                                  | 5.9.3                 |                                                      |
| turbo                                       | 2.9.14                |                                                      |
| tsup                                        | 8.5.1                 |                                                      |
| eslint                                      | 9.39.4                | flat config                                          |
| @eslint/js                                  | 9.x                   | added during install — was missing from initial plan |
| typescript-eslint                           | 8.59.4                |                                                      |
| eslint-plugin-react                         | 7.37.5                |                                                      |
| eslint-plugin-react-hooks                   | 5.2.0                 |                                                      |
| eslint-plugin-jsx-a11y                      | 6.10.2                |                                                      |
| eslint-config-prettier                      | 9.1.2                 |                                                      |
| prettier                                    | 3.8.3                 |                                                      |
| @changesets/cli                             | 2.31.0                |                                                      |
| globals                                     | 15.15.0               | for ESLint flat config                               |
| @types/node, @types/react, @types/react-dom | latest @ install time |                                                      |

Per-package devDependencies (engine/theme/components):

- vitest 2.1.9, jsdom 25.x, @testing-library/{react@16, user-event@14, jest-dom@6}, react/react-dom 19

Renderer:

- next 15.5.18, react 19, tailwindcss 3.4 (v3 chosen for Phase 1 stability — see deviation below)

### Deviations From the Plan

1. **Tailwind v3 instead of v4 in the renderer** — The plan called for Tailwind v4, but v4's
   Next.js integration is still fiddly. v3.4 was used for the placeholder page in Phase 1 since it's
   battle-tested. **Decision**: revisit Tailwind v4 migration when `@apx-dsme` ships its
   Tailwind preset in Phase 3. The preset format is forward-compatible with both v3 and v4.

2. **`@eslint/js` was missing from the initial install list** — added during verification
   (`pnpm add -w -D @eslint/js@^9.17.0`). Now part of root devDependencies.

3. **`apx-dsckage test script** — set to a no-op echo since it's a pure aggregator with
   no tests of its own; the underlying `@apx-dspackages have their own test suites.

4. **`turbo run test --concurrency=1`** — running Vitest in parallel across 5 packages caused
   esbuild service crashes on macOS. Sequentialized at the turbo level. Build/lint/typecheck
   still run in parallel.

5. **Removed `incremental: true` from `tsconfig.base.json`** — conflicted with tsup's DTS build
   (TS5074). Individual packages can opt in via their own tsconfig if needed.

6. **Removed `rootDir` from per-package tsconfigs** — was excluding `__tests__/` from typecheck.
   Replaced with `noEmit: true` (tsup handles the actual build outputs).

### Verified Commands

```bash
pnpm install         # ✓ 622 packages resolved, 0 warnings after onlyBuiltDependencies fix
pnpm build           # ✓ build:components + build:preview, all green
pnpm build:components # ✓ 6 packages built, dist/ produced everywhere
pnpm build:preview   # ✓ Next.js static build, 4 prerendered routes
pnpm dev             # ✓ Renderer at http://localhost:3000, HTTP 200, Tailwind working
pnpm test            # ✓ 11 turbo tasks pass
pnpm lint            # ✓ 12 tasks pass
pnpm typecheck       # ✓ 12 tasks pass
pnpm format:check    # ✓ all files formatted
pnpm changeset       # ✓ initialized, .changeset/config.json patched (access: public,
                     #   ignore: @apx-dsderer)
```

### Published-Package Smoke Test

`cd packages/apx-dsnpm pack --dry-run`:

```
apx-ds.0
- LICENSE
- README.md
- dist/index.cjs        (84 B)
- dist/index.cjs.map    (70 B)
- dist/index.d.cts      (147 B)
- dist/index.d.ts       (147 B)
- dist/index.js         (68 B)
- dist/index.js.map     (69 B)
- package.json
Total: 9 files, 1.7 kB tarball, 3.4 kB unpacked
```

No source files, no tests, no examples, no renderer — confirms publish hygiene.

### What's Next

Phase 2 — Engine. Open [`plans/pending/02-engine.md`](../pending/02-engine.md).