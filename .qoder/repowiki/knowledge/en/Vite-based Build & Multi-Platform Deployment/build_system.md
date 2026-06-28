## Build System Overview
The project uses **Vite** as its primary build tool and development server, orchestrated via **npm scripts**. It is a standard React + TypeScript single-page application (SPA) with no containerization (Docker) or complex CI/CD pipelines defined in the repository.

## Key Tools & Configuration
- **Build Tool**: Vite v8 (`vite.config.ts`) with `@vitejs/plugin-react` and `@tailwindcss/vite` for styling.
- **Language**: TypeScript (~6.0.2) configured in `tsconfig.json` with strict linting rules (`noUnusedLocals`, `noFallthroughCasesInSwitch`).
- **Package Manager**: npm (evidenced by `package-lock.json`).

## Build & Development Scripts
Defined in `package.json`:
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Runs `tsc` for type-checking followed by `vite build` to produce static assets in the `dist/` directory.
- `npm run preview`: Serves the production build locally for verification.
- `npm run download-data`: A custom script (`node download-data.cjs && node build-search-index.cjs`) used to fetch Quran data from external APIs and generate static JSON files in `public/data/`. This acts as a pre-build data generation step.

## Deployment Strategies
The repository supports two distinct deployment targets, configured via static hosting rules:

1. **Firebase Hosting**: 
   - Configured via `firebase.json`, `.firebaserc`, and security rules (`firestore.rules`, `storage.rules`).
   - Likely deployed using the Firebase CLI (`firebase deploy`), though no specific npm script is defined for this.
   - Manages Firestore indexes and Storage rules alongside hosting.

2. **Vercel**:
   - Configured via `vercel.json`.
   - Uses a catch-all rewrite rule (`source: /(.*)` -> `destination: /index.html`) to support client-side routing with React Router.

## Architecture & Conventions
- **Static Site Generation (SSG) Hybrid**: While primarily an SPA, the `download-data` script generates static JSON content at build time, allowing the app to function offline or with minimal API dependency for core text.
- **No Docker**: The project relies on platform-specific hosting services (Firebase/Vercel) rather than containerized deployments.
- **Environment Management**: Uses `.env.local` and `.env.example` for configuration, typical of Vite projects where variables are injected at build time.