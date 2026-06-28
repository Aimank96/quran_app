# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [vite.config.ts](file://vite.config.ts)
- [tsconfig.json](file://tsconfig.json)
- [vercel.json](file://vercel.json)
- [.firebaserc](file://.firebaserc)
- [firebase.json](file://firebase.json)
- [src/lib/firebase.ts](file://src/lib/firebase.ts)
- [src/lib/firebaseConfig.ts](file://src/lib/firebaseConfig.ts)
- [src/utils/audioUrl.ts](file://src/utils/audioUrl.ts)
- [src/context/AuthContext.tsx](file://src/context/AuthContext.tsx)
- [src/types/firebase.ts](file://src/types/firebase.ts)
- [index.html](file://index.html)
- [public/manifest.json](file://public/manifest.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Local Development Setup](#local-development-setup)
5. [Environment Variables and Firebase Setup](#environment-variables-and-firebase-setup)
6. [Project Structure Overview](#project-structure-overview)
7. [Development Server and Build Commands](#development-server-and-build-commands)
8. [Production Deployment Preparation](#production-deployment-preparation)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)

## Introduction
Quran Reader is a modern, offline-first web application for reading the Quran with Arabic text, Rumi transliteration, and bilingual translations (Malay/English). It features searchable content, surah navigation, bookmarks, notes, and optional audio playback via Firebase Storage. The project is built with React 19, TypeScript, Vite 8, Tailwind CSS 4, and integrates Firebase for authentication, Firestore, and Cloud Storage.

## Prerequisites
- Node.js and npm: Install a stable LTS version of Node.js. npm is included with Node.js.
- Git: Recommended for cloning the repository and managing updates.
- Text editor or IDE: VS Code is recommended for TypeScript and React support.

## Installation
Follow these steps to set up the project locally:
1. Clone the repository to your machine.
2. Open a terminal in the project root directory.
3. Install dependencies using the package manager:
   - Run: npm install
4. Verify installation by checking that node_modules is created and package-lock.json is updated.

**Section sources**
- [README.md:24-36](file://README.md#L24-L36)
- [package.json:6-11](file://package.json#L6-L11)

## Local Development Setup
After installing dependencies, start the development server:
- Run: npm run dev
- The development server starts at http://localhost:5173 by default (Vite’s default port).

Optional: To preview the production build locally during development:
- Build the project: npm run build
- Preview the build: npm run preview

Tip: The project uses Vite with React and Tailwind CSS plugins. Changes to source files are hot-reloaded automatically.

**Section sources**
- [README.md:28-35](file://README.md#L28-L35)
- [vite.config.ts:1-8](file://vite.config.ts#L1-L8)
- [package.json:6-11](file://package.json#L6-L11)

## Environment Variables and Firebase Setup
The application requires Firebase configuration variables injected at build time. These are accessed via Vite’s import.meta.env and must be provided in a .env file at the project root.

Required environment variables (names shown below; values must match your Firebase project):
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Firebase project configuration:
- The Firebase project identifier is configured in .firebaserc under projects.default.
- Firebase project configuration is loaded from src/lib/firebaseConfig.ts and initialized in src/lib/firebase.ts.
- Authentication uses Firebase Authentication with Google provider.
- Firestore is used for user data such as bookmarks and notes (document ID convention is documented in src/types/firebase.ts).
- Audio playback URLs are generated for Firebase Storage using a fixed bucket constant in src/utils/audioUrl.ts.

Important notes:
- The Firebase config is loaded from environment variables at runtime.
- The Firebase Storage bucket name is embedded in src/utils/audioUrl.ts and must align with your Firebase Storage configuration.
- The application expects Firestore rules and indexes defined in firebase.json and related files.

**Section sources**
- [src/lib/firebaseConfig.ts:1-9](file://src/lib/firebaseConfig.ts#L1-L9)
- [src/lib/firebase.ts:1-11](file://src/lib/firebase.ts#L1-L11)
- [.firebaserc:1-6](file://.firebaserc#L1-L6)
- [firebase.json:1-10](file://firebase.json#L1-L10)
- [src/types/firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [src/utils/audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [src/context/AuthContext.tsx:1-63](file://src/context/AuthContext.tsx#L1-L63)

## Project Structure Overview
High-level layout of key directories and files:
- src/: Application source code
  - api/: Data access and client-side search logic
  - components/: Reusable UI components
  - context/: React contexts (e.g., AuthContext)
  - hooks/: Custom hooks for data fetching and state
  - pages/: Route-level page components
  - types/: TypeScript interfaces
  - utils/: Utility modules (e.g., audio URL helpers)
  - lib/firebase.ts and lib/firebaseConfig.ts: Firebase initialization and configuration
- public/: Static assets and manifest
  - data/: Local JSON datasets for offline reading and search indexes
  - manifest.json: Web app manifest for PWA features
- Root configuration files:
  - vite.config.ts: Vite configuration with React and Tailwind plugins
  - tsconfig.json: TypeScript compiler options
  - vercel.json: SPA routing rewrite for Vercel deployments
  - firebase.json, .firebaserc: Firebase project and service configuration

Key files and roles:
- index.html: Entry HTML with manifest link and root div for React
- public/manifest.json: PWA metadata and icons
- src/main.tsx: Root entry point that wraps the app with AuthProvider
- src/App.tsx: Top-level application component (referenced but not detailed here)

**Section sources**
- [README.md:38-66](file://README.md#L38-L66)
- [index.html:1-16](file://index.html#L1-L16)
- [public/manifest.json:1-27](file://public/manifest.json#L1-L27)
- [src/main.tsx:1-14](file://src/main.tsx#L1-L14)
- [vite.config.ts:1-8](file://vite.config.ts#L1-L8)
- [tsconfig.json:1-25](file://tsconfig.json#L1-L25)
- [vercel.json:1-9](file://vercel.json#L1-L9)
- [firebase.json:1-10](file://firebase.json#L1-L10)
- [.firebaserc:1-6](file://.firebaserc#L1-L6)

## Development Server and Build Commands
Available scripts defined in package.json:
- Development: npm run dev
  - Starts the Vite dev server with React Fast Refresh and Tailwind CSS integration.
- Production build: npm run build
  - Runs TypeScript compilation and builds optimized static assets for production.
- Preview build: npm run preview
  - Serves the production build locally to test bundle output.

Additional script (data refresh):
- npm run download-data
  - Downloads fresh data from the upstream API and rebuilds search indexes into public/data/.

TypeScript configuration:
- tsconfig.json sets module resolution to bundler mode, JSX transform to react-jsx, and enables strict checks.

**Section sources**
- [package.json:6-11](file://package.json#L6-L11)
- [README.md:70-76](file://README.md#L70-L76)
- [tsconfig.json:1-25](file://tsconfig.json#L1-L25)

## Production Deployment Preparation
Prepare your project for hosting:
- Build the project: npm run build
- Test the build locally: npm run preview
- Configure hosting platform routing:
  - For Vercel, SPA rewrites are handled via vercel.json so that client-side routes resolve to index.html.
- Firebase configuration:
  - Ensure all VITE_FIREBASE_* environment variables are set in your hosting environment.
  - Confirm that .firebaserc points to the intended Firebase project.
  - Validate Firestore rules and indexes in firebase.json and related files.

PWA considerations:
- The manifest is linked in index.html and defines app metadata and icons.
- The app is designed to work offline with local data in public/data/.

**Section sources**
- [package.json:6-11](file://package.json#L6-L11)
- [vercel.json:1-9](file://vercel.json#L1-L9)
- [index.html:6](file://index.html#L6)
- [public/manifest.json:1-27](file://public/manifest.json#L1-L27)
- [.firebaserc:1-6](file://.firebaserc#L1-L6)
- [firebase.json:1-10](file://firebase.json#L1-L10)

## Troubleshooting Guide
Common setup and runtime issues:

- Missing environment variables
  - Symptom: Authentication or Firebase features fail at runtime.
  - Cause: VITE_FIREBASE_* variables are not defined.
  - Fix: Add a .env file at the project root with the required keys and restart the dev server.

- Firebase initialization errors
  - Symptom: Errors indicating missing config or invalid credentials.
  - Cause: Mismatched or incorrect Firebase project settings.
  - Fix: Verify .firebaserc project ID matches your Firebase project and that firebaseConfig.ts loads the correct values.

- Storage bucket mismatch
  - Symptom: Audio URLs fail or return 404.
  - Cause: The hardcoded bucket name in src/utils/audioUrl.ts does not match your Firebase Storage configuration.
  - Fix: Align the bucket name in src/utils/audioUrl.ts with your Firebase Storage settings.

- SPA routing issues on deploy
  - Symptom: Refreshing a deep link or direct navigation returns a 404.
  - Cause: Hosting not rewriting all routes to index.html.
  - Fix: Ensure vercel.json (or equivalent) contains a wildcard rewrite to index.html.

- TypeScript or bundler errors
  - Symptom: Build fails with module resolution or JSX errors.
  - Cause: Incorrect tsconfig settings or missing devDependencies.
  - Fix: Confirm tsconfig.json bundler mode and moduleResolution settings; reinstall dependencies if needed.

- Data not loading or search not working
  - Symptom: Surah list empty or search yields no results.
  - Cause: Missing or outdated public/data/ files.
  - Fix: Run npm run download-data to refresh datasets and search indexes.

**Section sources**
- [src/lib/firebaseConfig.ts:1-9](file://src/lib/firebaseConfig.ts#L1-L9)
- [src/lib/firebase.ts:1-11](file://src/lib/firebase.ts#L1-L11)
- [.firebaserc:1-6](file://.firebaserc#L1-L6)
- [src/utils/audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [vercel.json:1-9](file://vercel.json#L1-L9)
- [tsconfig.json:1-25](file://tsconfig.json#L1-L25)
- [README.md:70-76](file://README.md#L70-L76)

## Conclusion
You now have the essentials to install, configure, develop, and deploy the Quran Reader application. Ensure Firebase environment variables are set, verify your Firebase project settings, and use the provided scripts for development and production builds. For hosting, confirm SPA routing rewrites and validate Firebase Storage and Firestore configurations. If issues arise, consult the troubleshooting guide to resolve environment, routing, or data problems.