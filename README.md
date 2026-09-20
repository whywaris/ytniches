# YTNiches

Research + execution loop for YouTube creators. See [`CLAUDE.md`](./CLAUDE.md) for the doc-first workflow and [`docs/`](./docs/) for the full spec set before making any change.

## Setup

Requires Node 22 (see `.nvmrc`) and pnpm 11 (via [Corepack](https://nodejs.org/api/corepack.html), pinned in `package.json#packageManager`).

```bash
corepack enable
pnpm install
cp .env.example .env.local   # fill in real values
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Common commands

| Command          | What it does                        |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack)    |
| `pnpm build`     | Production build                    |
| `pnpm typecheck` | `tsc --noEmit`                      |
| `pnpm lint`      | ESLint                              |
| `pnpm test`      | Test suite (added once tests exist) |

## Pre-commit

Husky runs `lint-staged` (ESLint + Prettier on staged files) on every commit, and `commitlint` enforces [Conventional Commits](https://www.conventionalcommits.org/) on the commit message (see `CLAUDE.md` §2.3 for the format).

Before opening a PR, run the full [pre-ship checklist](./CLAUDE.md#43-pre-ship-checklist).
