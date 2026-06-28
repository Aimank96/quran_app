The application uses a standard Vite-based configuration system for managing runtime settings, primarily focused on Firebase integration.

### Configuration Approach
- **Environment Variables**: The app relies on Vite's built-in environment variable handling. Secrets and API keys are injected via `.env` files, specifically using the `VITE_` prefix to expose them to the client-side bundle.
- **Static JSON Data**: Quranic content (Surahs, search indices) is stored as static JSON files in the `public/data` directory, served directly by the web server without dynamic backend configuration.

### Key Files
- **`.env.example`**: Defines the required environment variables for Firebase connectivity (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.). Developers must copy this to `.env.local` to run the app.
- **`src/lib/firebaseConfig.ts`**: The central configuration loader. It reads `import.meta.env` variables and exports a `firebaseConfig` object. This isolates environment access from the initialization logic.
- **`src/lib/firebase.ts`**: Initializes the Firebase SDK using the config exported from `firebaseConfig.ts`. It sets up Auth, Firestore, and Google Auth provider instances.
- **`vite.config.ts`**: Minimal Vite configuration, enabling React and Tailwind CSS plugins. It relies on Vite defaults for environment loading.
- **`firebase.json`**: Configures Firebase CLI tools for local emulation and deployment rules (Firestore security rules, Storage rules, and indexes).

### Architecture and Conventions
1. **Separation of Concerns**: Configuration loading (`firebaseConfig.ts`) is decoupled from SDK initialization (`firebase.ts`). This allows for easier testing or potential multi-environment setups.
2. **Client-Side Secrets**: All configuration is client-side. The `VITE_` prefix ensures that only explicitly exposed variables are bundled into the final JavaScript output.
3. **No Runtime Feature Flags**: The current system does not implement dynamic feature flags or remote configuration services (like Firebase Remote Config). Behavior is determined at build time via environment variables or hardcoded logic.
4. **Data as Config**: The `public/data` directory acts as a static content repository. Updates to Quran text or search indices require rebuilding or updating these JSON files, rather than fetching from a configured API endpoint.

### Rules for Developers
- **Environment Setup**: Always create a `.env.local` file based on `.env.example` before running `npm run dev`. Never commit `.env.local` to version control.
- **Variable Prefixing**: Any new environment variable intended for use in the frontend code **must** start with `VITE_`. Variables without this prefix will be ignored by Vite and unavailable in `import.meta.env`.
- **Configuration Access**: Do not access `import.meta.env` directly in components or hooks. Instead, add new keys to `src/lib/firebaseConfig.ts` (or a similar dedicated config module) to maintain a single source of truth and type safety.
- **Firebase Rules**: Security rules for Firestore and Storage are managed in `firestore.rules` and `storage.rules` respectively. Deploy changes using the Firebase CLI, which references these files via `firebase.json`.