## Project Summary
A comprehensive manga tracking and discovery platform that allows users to track their reading progress across various sources, discover new series, and interact with a social feed.

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL) with Prisma ORM
- Auth: Supabase Auth
- External APIs: MangaDex (primary metadata), AniList (official links/tracking)
- Package Manager: Bun (bun.lock)
- React: 19.2.0 (exact version, no ranges)

## Architecture
- `src/app`: Next.js pages and API routes
- `src/lib`: Core utilities and API clients (MangaDex, AniList, Supabase)
- `src/components`: UI components organized by feature
- `scripts`: Utility scripts for data import and maintenance

## User Preferences
- Always use the provided MangaDex API credentials for rate limiting benefits.
- Use AniList as the primary source for official links (Viz, MangaPlus, etc.).
- Respect rate limits for both MangaDex (5 req/s) and AniList (90 req/min).

## Project Guidelines
- Use functional components with TypeScript.
- Maintain consistent code style mimicking existing patterns.
- Ensure all API calls handle rate limiting and errors gracefully.
- React versions MUST be exact (no ^ or ~) in package.json with matching overrides.
- Use `bun install` for dependency management (not npm).

## Common Patterns
- Upsert logic for series and sources to ensure data consistency.
- Search-based fallbacks when IDs are missing from external APIs.

## Dependency Management (CRITICAL)
- Package manager: Bun (packageManager: bun@1.2.0)
- Lock file: bun.lock (NOT package-lock.json)
- React/React-DOM: MUST be exact versions (19.2.0) with matching overrides
- @types/react: MUST match in devDependencies and overrides
- Run `node scripts/check-react-versions.js` to validate before install

## FORBIDDEN Dependencies (DO NOT ADD)
These packages have incompatible peer dependencies with React 19 and will cause constant reinstalls:
- `@react-three/fiber` (requires react >=18 <19)
- `@react-three/drei` (depends on fiber)
- `three` / `three-globe` / `@types/three` (3D dependencies)
- `cobe` (globe visualization)
- `@number-flow/react` (unused)

## Phantom Dependency Root Cause (CRITICAL)
The recurring phantom dependency issue happens because:
1. **Bun's global cache** at `~/.bun/install/cache/` persists packages even after removal from node_modules
2. **`bun install --force`** re-fetches from cache, reintroducing forbidden deps
3. **Transitive dependencies** can pull in forbidden packages as optionalDependencies

The watchdog now:
- Purges forbidden deps from bun's global cache during repair
- Runs post-install verification to catch any that sneak back
- The postinstall script in package.json also guards against phantom deps

If phantom deps keep appearing, run: `node scripts/watchdog.js repair`

## Phantom Directories (Turbopack Issue Fix)
Phantom directories like `home/`, `tmp/`, `var/` in the project root can cause Turbopack to crash with path resolution errors (trying to read directories as files). The watchdog now:
- Detects and reports phantom directories in health checks
- Automatically removes them during repair
- Use `node scripts/watchdog.js clean-phantoms` to manually remove them

These directories are also added to `.gitignore` to prevent accidental commits.
