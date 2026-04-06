# CI/CD Pipeline

The SDD website uses GitHub Actions for continuous integration. Every push and pull request runs through a sequential pipeline: lint, test, build.

## Workflows

### CI -- Website (`ci-site.yml`)

**Triggers:** Push to any branch or PR to `main` that modifies `site/**` or the workflow file.

**Concurrency:** Cancels in-progress runs for the same branch.

```text
Lint → Test → Build
```

#### Stage 1: Lint

- Runs `npm run format:check` (Prettier formatting validation)
- Fails fast -- no point running tests if code isn't formatted

#### Stage 2: Test (depends on lint)

Sequential test execution:
1. `npm run test:unit` -- State machine logic, timeline filtering
2. `npm run test:integration` -- Component rendering, click handlers
3. `npm run test:a11y` -- WCAG 2.1 AA compliance via axe-core

#### Stage 3: Build (depends on test)

1. `npm run build` -- Astro production build
2. `npm run check:bundle-budget` -- Validates < 30KB critical, < 150KB total
3. Uploads `site/dist/` as build artifact

**Environment:** Ubuntu Latest, Node 22 LTS, npm caching on `package-lock.json`.

### Markdown Lint (`lint.yml`)

Separate workflow for markdown linting across all `.md` files using `markdownlint-cli2`.

## Available Scripts

All scripts run from the `site/` directory:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Astro dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run format:check` | Check Prettier formatting |
| `npm run format:fix` | Fix Prettier formatting |
| `npm run lint:md` | Lint markdown files |
| `npm run lint:css` | Lint CSS with Stylelint |
| `npm run lint:js` | Lint TypeScript/Preact with ESLint |
| `npm run lint:astro` | Check Astro files |
| `npm run lint:a11y` | ESLint accessibility rules |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:a11y` | Run accessibility audit tests |
| `npm run check:bundle-budget` | Validate bundle size limits |
| `npm run sync:content-hashes` | Sync content integrity hashes |

## Quality Gates

Every PR to `main` must pass:

1. Prettier formatting check
2. All unit tests pass
3. All integration tests pass
4. All accessibility tests pass
5. Astro build succeeds
6. Bundle budget within limits (< 30KB critical, < 150KB total)

## Local Development

```bash
cd site
npm install
npm run dev      # Start dev server
npm run build    # Production build
```

Run all checks locally before pushing:

```bash
npm run format:check && npm run test:unit && npm run test:integration && npm run test:a11y && npm run build && npm run check:bundle-budget
```
