## Overview

This Quran Web Application uses an **informal, ad-hoc error handling approach** built on native JavaScript/TypeScript mechanisms without any dedicated error framework, custom error types, or centralized error boundary system.

## System and Approach

### Error Creation
Errors are created using plain `new Error()` with hardcoded string messages:
- API layer (`src/api/quranApi.ts`): throws `new Error('Failed to load surah list')` when HTTP responses are not OK
- Audio context (`src/context/AudioContext.tsx`): throws `new Error('Sila log masuk untuk mendengar audio')` for authentication checks
- Context hooks: throw guard errors like `new Error('useAuth must be used inside <AuthProvider>')`

No custom error classes, error codes, or typed error hierarchies exist anywhere in the codebase.

### Error Propagation Pattern
The dominant pattern is **Promise-based catch-and-store**:
1. Async operations (fetch, Firebase SDK calls) return Promises
2. Errors are caught via `.catch()` or `try/catch` blocks
3. Error messages are extracted via `err.message` (with fallback strings)
4. Errors are stored in component/hook local state as `string | null`
5. UI components read the `error` state and render it conditionally

Example from `src/hooks/useSurahDetail.ts`:
```typescript
.catch((err: Error) => {
  if (!cancelled) {
    setError(err.message);
    setLoading(false);
  }
});
```

### Error State Convention
Every data-fetching hook follows the same triad:
- `loading: boolean` — tracks in-flight requests
- `error: string | null` — stores error message or null
- Data state (e.g., `surahData`, `results`) — holds successful response

This pattern appears consistently in: `useSurahList`, `useSurahDetail`, `useSearch`, `useBookmarks`, `useNotes`, and `AuthContext`.

## Key Files

| File | Role |
|------|------|
| `src/api/quranApi.ts` | Throws errors on failed HTTP fetches; no retry logic |
| `src/hooks/useSurahDetail.ts` | Catches API errors, stores message in state |
| `src/hooks/useSearch.ts` | Same catch-and-store pattern for search failures |
| `src/hooks/useBookmarks.ts` | Firestore snapshot error callback + try/catch on write ops |
| `src/hooks/useNotes.ts` | Identical to bookmarks — error callbacks and try/catch |
| `src/context/AuthContext.tsx` | Try/catch around Firebase auth with Malay fallback messages |
| `src/context/AudioContext.tsx` | Most complex error handling — multiple error states, inline catch handlers on audio events |
| `src/utils/audioCache.ts` | Silent failure pattern — catches IndexedDB errors and returns `null` or `0` |

## Architecture and Conventions

### No Error Boundaries
The application does **not** use React Error Boundaries. If a component throws during render, the entire app will crash with no graceful fallback.

### No Centralized Error Service
There is no error logging service, no Sentry integration, no console.error aggregation, and no server-side error reporting. Errors are displayed to users but never persisted or reported externally.

### Mixed Language Messages
Error messages appear in both English and Malay:
- English: `'Failed to load surah'`, `'Gagal memainkan audio'` (actually Malay), `'Failed to cache audio'`
- Malay: `'Sila log masuk untuk mendengar audio'`, `'Ralat penanda'`, `'Log keluar gagal'`

This inconsistency suggests no i18n strategy for error messages.

### Silent Failure in Utilities
`src/utils/audioCache.ts` uses a **fail-silent** pattern:
```typescript
} catch {
  return null;
}
```
IndexedDB errors are swallowed entirely — callers receive `null` and must infer failure. This is intentional for cache misses but provides no visibility into actual storage failures.

### Authentication Guard Pattern
Context consumer hooks (`useAuth`, `useAudio`, `useDownloadConsent`) throw synchronously if called outside their provider:
```typescript
if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
```
This is a standard React pattern for developer-facing errors, not user-facing ones.

### Audio Error Handling
`AudioContext` has the most elaborate error handling:
- Sets `errorMessage` in state on various failure points
- Attaches `onerror` handlers to the HTMLAudioElement
- Catches `audio.play()` Promise rejections
- Displays user-friendly Malay messages like `'Audio tidak dapat dimuat. Sila periksa sambungan internet.'`

However, there is **no retry mechanism** — once an audio load fails, the user must manually retry.

## Rules Developers Should Follow

1. **Always pair async operations with error state**: Every hook that performs async work must expose `error: string | null` in its return value.

2. **Use `err instanceof Error ? err.message : fallback` pattern**: When catching unknown errors, check the type before accessing `.message`. Fallback messages should be in Malay for consistency with the existing UI.

3. **Never throw from event handlers**: Audio `onerror` and Firebase `onSnapshot` error callbacks should set state, not throw.

4. **Silent failures only in non-critical utilities**: Cache utilities may swallow errors, but data-fetching and user-action paths must always surface errors to the UI.

5. **No custom error types**: The codebase has no precedent for custom error classes. Introducing them would be inconsistent with the existing informal approach.

6. **No error boundaries implemented**: Components should be defensive about null/undefined props since there is no safety net from Error Boundaries.

7. **Cancellation safety**: Use the `cancelled` flag pattern (seen in `useSurahDetail`) to prevent state updates on unmounted components.

## Confidence Assessment

Confidence is **medium**. The error handling system is clearly present and consistently applied across hooks and contexts, but it is entirely informal — no dedicated error module, no custom types, no boundaries, no logging infrastructure. The patterns are recognizable and repeated, but they represent conventional React async patterns rather than a designed error-handling architecture.