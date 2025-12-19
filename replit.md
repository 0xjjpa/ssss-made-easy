# SSSS Toolkit

## Overview
A Progressive Web App (PWA) for Shamir's Secret Sharing Scheme (SSSS). Allows users to split secrets into multiple shares and reconstruct them, with secure random generation and verification features.

## Features
- Split secrets into N shares with M required threshold
- Combine shares to reconstruct secrets
- Secure random secret generation using Web Crypto API (Crockford Base32 charset)
- SHA256 hash verification for secrets
- Show/hide toggles for sensitive data
- Offline-capable PWA

## Tech Stack
- SvelteKit with static adapter
- Tailwind CSS + Flowbite Svelte
- shamir-secret-sharing library (audited) for Shamir's Secret Sharing
- Service Worker for offline caching

## Project Structure
```
src/
  routes/
    +page.svelte        - Home page
    +layout.svelte      - Main layout with navbar
    split/+page.svelte  - Split secret page
    combine/+page.svelte - Combine shares page
  lib/
    ssss-util.ts        - SSSS utility functions
static/
  manifest.json         - PWA manifest
  sw.js                 - Service worker for offline support
  favicon.png           - App icon
```

## Running Locally
```bash
npm install
npm run dev
```

## Building
```bash
npm run build           # Standard build
npm run build:singlefile # Build + single-file offline version
```

## PWA / Offline Usage
The app works as a Progressive Web App:
1. Visit the deployed site in a browser
2. The service worker will cache all assets
3. Install the app (browser's "Add to Home Screen" or install button)
4. The app will work offline after first visit

## Recent Changes
- 2024-12: Added PWA support with service worker and manifest
- 2024-12: Secrets hidden by default with show/hide toggles
- 2024-12: Added SHA256 hash verification display
- 2024-12: Removed About/Contact pages
- 2024-12: Uses Crockford-style Base32 for secret generation
