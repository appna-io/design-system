# apx-ds

> Themable, RTL-ready, fully overridable React component library.

This is the **monorepo** for `apx-ds`. The public package consumers install is `apx-ds`,
which lives in [`packages/apx-ds`](packages/apx-ds). The other `packages/*` are internal
building blocks bundled into the published artifact. A local **renderer** app
([`apps/renderer`](apps/renderer)) is used during development.

## Repository Layout

```
apx-ds/
├── apps/
│   └── renderer/          # local dev / docs preview (NOT published)
├── packages/
│   ├── engine/            # @apx-ds/engine  — primitives, utilities, types
│   ├── tokens/            # @apx-ds/tokens  — design token definitions
│   ├── theme/             # @apx-ds/theme   — ThemeProvider, hooks
│   ├── components/        # @apx-ds/components — the UI library
│   ├── icons/             # @apx-ds/icons   — (future) icon set
│   └── apx-ds/        # apx-ds — published aggregator
└── plans/                 # phased build plan documents
```

## Prerequisites

- **Node** 20 LTS or newer (see `.nvmrc`)
- **pnpm** 9 or newer

## Setup

```bash
pnpm install
```

## Scripts

| Command                 | What it does                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| `pnpm dev`              | Start the renderer at `http://localhost:3000` (watches all packages) |
| `pnpm build:components` | Build all publishable packages (`packages/*`)                        |
| `pnpm build:preview`    | Build the renderer app to a static site                              |
| `pnpm build`            | Run both of the above sequentially                                   |
| `pnpm test`             | Run Vitest across every package                                      |
| `pnpm test:watch`       | Watch mode                                                           |
| `pnpm lint`             | ESLint across every package                                          |
| `pnpm typecheck`        | `tsc --noEmit` across every package                                  |
| `pnpm format`           | Prettier write                                                       |
| `pnpm format:check`     | Prettier check (CI-friendly)                                         |
| `pnpm clean`            | Wipe build artifacts and `node_modules`                              |
| `pnpm changeset`        | Add a release entry (Changesets)                                     |
| `pnpm release`          | Build + publish to npm                                               |

## Project Status

This project is at **Phase 1 — Infrastructure**. See [`plans/`](plans/) for the full phased
roadmap. Components, theme system, and the rich renderer arrive in later phases.

## License

MIT