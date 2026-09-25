# YTNiches

[![CI](https://github.com/whywaris/ytniches/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/whywaris/ytniches/actions/workflows/ci.yml)

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

## Development

Background jobs (TRD.md §4) run on Inngest. Local dev needs a second terminal running the Inngest dev server alongside `pnpm dev`, or scheduled/triggered jobs (channel sync, the sync cron) never fire:

```bash
# terminal 1
pnpm dev

# terminal 2
pnpm dev:inngest
```

The Inngest dev UI runs at [http://localhost:8288](http://localhost:8288) and auto-discovers functions from `app/api/inngest/route.ts`.

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
