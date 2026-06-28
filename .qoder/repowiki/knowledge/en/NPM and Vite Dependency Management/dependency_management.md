This repository uses **npm** as its primary package manager, managed via `package.json` and locked with `package-lock.json` (lockfileVersion 3). The project is a client-side React application built with **Vite**, which serves as the build tool and development server.

### Key Dependencies
- **Core Framework**: React 19 (`react`, `react-dom`) and React Router 7 (`react-router-dom`).
- **Build & Styling**: Vite 8 (`vite`) with the React plugin (`@vitejs/plugin-react`) and Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/vite`).
- **Backend Services**: Firebase 12 (`firebase`) for client-side authentication and database interactions. `firebase-admin` is included as a dev dependency, likely for local data seeding or administrative scripts.
- **TypeScript**: Used for type safety, configured in `tsconfig.json` with `moduleResolution: "bundler"` to align with Vite's resolution strategy.

### Conventions & Scripts
- **Installation**: Standard `npm install` is used to populate `node_modules`.
- **Development**: `npm run dev` starts the Vite dev server.
- **Data Management**: A custom script `npm run download-data` executes Node.js scripts (`download-data.cjs`, `build-search-index.cjs`) to fetch external Quran data and generate static JSON files in `public/data/`. This indicates a hybrid approach where some "dependencies" (content data) are managed via custom scripts rather than npm packages.
- **Lockfile Strategy**: The presence of `package-lock.json` ensures deterministic builds across environments. Developers should commit this file to maintain version consistency.

### Architecture Decisions
- **Client-Side Focus**: All runtime dependencies are client-side libraries. There is no backend server code in the main application flow, reducing the complexity of dependency management to a single `package.json`.
- **No Vendoring**: The project relies on `node_modules` and does not vendor dependencies.
- **Environment Configuration**: Uses `.env.local` and `.env.example` for environment variables, which are typically loaded by Vite during the build process.