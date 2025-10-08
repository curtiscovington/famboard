# Famboard

Famboard is a tablet-friendly Progressive Web App that helps families keep track of chores, points, and rewards without creating user accounts. Everything is stored locally in the browser so the experience works completely offline and can be deployed easily with GitHub Pages.

## Features

- ✨ **Offline-first PWA** – installable with an app manifest, responsive service worker, and custom icons.
- 👨‍👩‍👧‍👦 **Family roster management** – add, rename, and remove family members while tracking their point totals.
- 🧹 **Chore board** – create, assign, and complete chores with celebratory confetti for every win.
- 🎁 **Reward shelf** – design rewards, monitor point costs, and redeem them directly from the tablet.
- 🌓 **Dark mode** – quick toggle available from any screen.
- 🔄 **Data controls** – reset the entire board when it is time for a fresh start.

## Tech stack

- [React](https://react.dev/) with [Vite](https://vite.dev/) for lightning-fast dev/build
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [React Router](https://reactrouter.com/) for client-side navigation
- `localStorage` for all persistent data – no backend required

## Getting started

```bash
npm install
npm run dev
```

The app is optimized for tablets, but it scales down nicely in a regular desktop browser window. You can install it locally by clicking the “Install” option in supported browsers once the dev server is running.

## Building for production

```
npm run build
npm run preview
```

When deploying to GitHub Pages, the configured base path (`/famboard/`) ensures the compiled assets, manifest, and service worker resolve correctly.

## Project structure highlights

- `src/context/FamboardContext.jsx` – central state management with localStorage persistence.
- `src/pages/` – individual screens for Home, Chores, Rewards, and Settings.
- `public/manifest.webmanifest` & `public/sw.js` – installability and offline caching.
- `public/icons/` – pre-generated icons for launchers and maskable icons.

## Resetting data

Use the **Reset Famboard** section in Settings to clear all local data. This is useful for starting a new chore season or testing a fresh experience.

Enjoy celebrating the wins together! 🎉
