# Famboard agent instructions

## Overview
- This repository contains a React 19 + Vite tablet-focused PWA that stores all data locally. Tailwind CSS handles styling and React Router manages navigation.
- State that must persist across sessions is centralized in `src/context/FamboardContext.jsx`. Components should read/write data through the context instead of accessing `localStorage` directly.

## Tooling & commands
- Use Node.js 20.19 or newer with npm.
- After making changes run at least `npm run lint`. Run `npm run build` as well when you touch build tooling, routing, or service worker logic.
- Use `npm run bump:version` only when preparing an intentional version bump; do not run it for routine feature work.

## Code style
- The project is ESM-only (`type: module`). Use `import`/`export` syntax everywhere.
- Match surrounding conventions: React/JSX files in `src/` omit semicolons, prefer single quotes, keep trailing commas in multi-line literals, and use function components + hooks.
- Utility modules in `src/utils` should stay pure, synchronous helpers with explicit exports.
- Keep imports grouped logically (external packages first, then internal modules, then local assets) and remove unused imports.

## React patterns
- New UI belongs under `src/components/` (reusable) or `src/pages/` (route-level screens). Co-locate component-specific helpers instead of expanding the global context unless shared by multiple features.
- Extend the Famboard context carefully: update the `defaultData` shape, read/write helpers, and any recurrence logic when you introduce new persisted fields. Make sure default objects remain serializable.
- Prefer derived values memoized with `useMemo` or `useCallback` when they depend on state collections; follow existing patterns for chore/reward calculations.

## Styling & accessibility
- Styling is Tailwind-first. Compose utility classes inline and reuse the custom color tokens defined in `tailwind.config.js` (e.g., `famboard-primary`, `famboard-accent`). Avoid hard-coding new colors without updating the theme.
- Maintain dark mode support by providing both default and `dark:` variants when introducing new components.
- Follow the existing accessibility practices: supply descriptive `alt` text, use semantic HTML, and add `aria-` attributes or visually hidden labels as needed for interactive controls.

## Service worker & PWA assets
- When changing offline behavior or cached assets, update `public/sw.js` and bump the cache version string so clients pick up the change. Ensure new assets are included in `OFFLINE_URLS` when required.
- Keep `public/manifest.webmanifest`, icons, and other PWA assets in sync if you add new launch icons or change display settings.

## Documentation & UX
- Update `README.md` when user-facing functionality, setup steps, or deployment instructions change.
- When adjusting copy in the UI, keep the warm, family-friendly tone already established in the app.
