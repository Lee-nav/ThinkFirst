# Implementation Plan: Vercel Deployment & Question Set Creation Fix

## Summary of Problems & Confirmed Decisions
1. **Vite Native ConfigLoader Warning**:
   - Vercel build log warning: `(!) Your Vite config uses features that are unsupported by configLoader: 'native' ... Set VITE_CONFIG_NATIVE_IGNORE_WARNING=true to suppress this warning.`
   - Cause: `vite.config.ts` used CommonJS `__dirname` in an ESM module project (`"type": "module"`).
   - Solution: Modernize `vite.config.ts` with native `import.meta.url` / `fileURLToPath` and set `process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true'` to eliminate the warning on Vercel and local builds.
2. **Question Set Creation & Publishing Failure on Vercel**:
   - Cause: On Vercel, Vite static deployments build and serve the client SPA (`dist/`), but do not execute the Express Node process (`server.ts`). When the educator clicked "Publish Now" or "Save Draft", `fetch('/api/sets')` failed with 404 or returned HTML index, causing `res.json()` parse failures and falling into the `Failed to save set` error toast.
   - Solution: Connect directly to the provisioned Firebase Firestore database (`ai-studio-thinkfirst-24af66b2-636c-40bc-8b81-f002b58fddda`) via a resilient client service (`src/services/firestoreService.ts`) with robust offline localStorage fallback. Ensure `handleCreateNewSet` saves and updates state immediately so creating and publishing question sets succeeds on Vercel, local dev, and AI Studio without server dependency.
3. **Vercel Single-Page App (SPA) Routing**:
   - Add `vercel.json` with SPA rewrite rules (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`) to guarantee direct URLs (e.g., `/?code=CLIM88`) and refreshes resolve without 404 errors.

---

## Technical Architecture & Resilience Flow

```
+-----------------------------------------------------------------------------------------+
|                                    ThinkFirst Client                                    |
|   - Teacher creates & publishes question set in CreateQuestionSetModal                  |
|   - handleCreateNewSet(setData, publishNow)                                             |
+-----------------------------------------------------------------------------------------+
                                             |
                      +----------------------+----------------------+
                      |                                             |
                      v                                             v
        [ Primary: Firestore Service ]               [ Fallback: Local Storage ]
        - Initializes firebase/firestore              - Mirrors active sets & sessions
        - Direct setDoc to /questionSets/{id}         - Provides immediate optimistic write
        - Real-time cloud persistence across devices  - Prevents any publish failures
                      |                                             |
                      +----------------------+----------------------+
                                             |
                                             v
                               [ Instant UI Update & Toast ]
                               - New Set with 6-char code active
                               - Displays in Teacher Dashboard
                               - Accessible to Students by Code
```

---

## Detailed Implementation Steps

### 1. Modernize `vite.config.ts` & Add `vercel.json`
- **`vite.config.ts`**:
  - Replace `path.resolve(__dirname, '.')` with `fileURLToPath(new URL('.', import.meta.url))` to support native ESM.
  - Set `process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true'` in the config header to suppress future warnings.
- **`vercel.json`**:
  - Create `vercel.json` in root:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```

### 2. Direct Firestore Service with Offline Fallback (`src/services/firestoreService.ts`)
- Use existing `firebase-applet-config.json` credentials to initialize Firebase client SDK (`firebase/firestore`).
- Implement helper methods:
  - `saveQuestionSet(set: QuestionSet): Promise<QuestionSet>`
  - `getQuestionSets(): Promise<QuestionSet[]>`
  - `updateQuestionSetStatus(setId: string, status: 'open' | 'closed'): Promise<void>`
  - `regenerateQuestionSetCode(setId: string, newCode: string): Promise<void>`
  - `getQuestionSetByCode(code: string): Promise<QuestionSet | null>`
  - `saveStudentSession(session: StudentSession): Promise<StudentSession>`
  - `getAllStudentSessions(): Promise<StudentSession[]>`
- **Offline / Standalone Fallback**: Wrap all Firestore operations with try/catch and an in-memory / `localStorage` mirror (`thinkfirst_sets_cache`, `thinkfirst_sessions_cache`). If network is down or Firestore is unavailable, local storage stores the set, ensuring 100% reliable execution.

### 3. Update `App.tsx` Handlers
- Update `handleCreateNewSet`:
  - Generate a 6-character uppercase access code (`generateAccessCode()`).
  - Assemble full `QuestionSet` object with UUID and timestamps.
  - Call `firestoreService.saveQuestionSet(newSet)`.
  - Also call `/api/sets` if running in hybrid fullstack mode, but do not throw if `/api` returns 404 (on Vercel).
  - Update `activeQuestionSets` state immediately.
  - Trigger success toast (`Set published! Access code: ${newSet.code}`).
- Update `refreshQuestionSets`:
  - Load from Firestore (or fallback cache if offline), populating the sets on page load.
- Update `handleRegenerateCode`, `handleToggleSetStatus`, and `handleDuplicateSet` to sync with Firestore and local state.

---

## Verification & Testing Plan

1. **Vite Warning Verification**:
   - Run `npm run build` / `compile_applet`.
   - Verify that the `configLoader: 'native'` warning is eliminated.
2. **Question Set Creation & Publishing**:
   - Open Teacher Dashboard -> Click "+ Create Set".
   - Fill in Title, Set Type (Report/Question/Reflection), Prompts, and Time Limit.
   - Click "Publish Now".
   - Verify set is created immediately, assigned a 6-digit access code, rendered on the dashboard, and toast shows `"Set published! Access code: ..."` without failure.
3. **Student Code Entry**:
   - Switch to Student Demo -> Enter the generated access code.
   - Verify the assignment loads seamlessly.
4. **Build & Lint Verification**:
   - Run `lint_applet` and `compile_applet` to confirm zero TypeScript or build errors.
