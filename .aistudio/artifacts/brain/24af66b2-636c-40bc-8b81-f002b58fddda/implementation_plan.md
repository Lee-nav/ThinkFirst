# Teacher Tools: Question Set Deletion

Add the ability for instructors to permanently delete question sets, with clear safety confirmations, submission count warnings, and synchronized deletion across Firestore, local storage, and the backend server.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1:**
> - **Cascade Submission Handling**: Deleting a question set permanently removes the question set document and all associated student submissions and focus event logs.
> - **Confirmation UX**: A dedicated modal dialog appears showing the question set title, access code, and the count of student submissions that will be removed.
> - **Placement**: The delete trigger is accessible both on the Question Sets overview card toolbar and in the header action bar when inspecting a specific set's results.

---

### 1. Overview & Core Concept

- **What It Does**: Teachers can delete unused, test, or obsolete question sets directly from their dashboard. Clicking "Delete" opens a confirmation modal detailing the set's title, code, and active student submission count. Confirming permanently purges the set and its submissions from Firestore and local cache, closing out active views cleanly.
- **Target Audience**: Teachers, instructors, and proctors managing multiple classroom assignments.
- **Key Value**: Prevents dashboard clutter, eliminates test artifacts, and guarantees that invalidated codes cannot be submitted by students.

---

### 2. User Experience & Visual Design

- **Delete Trigger Placement**:
  - **Overview Card Action Bar**: Located next to "Duplicate" and "Close/Reopen Set" with a subtle red/danger hover state (`text-[var(--mut)] hover:text-red-500 hover:underline`).
  - **Set Detail View Header**: Positioned beside "Export CSV" and "Regenerate Code" as an icon+text button (`border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20`).
- **Confirmation Modal (`DeleteQuestionSetModal.tsx`)**:
  - Centered dialog with backdrop blur and focus trap.
  - Prominent red warning banner with `AlertTriangle` icon.
  - Clear summary box displaying:
    - Set title and 6-character access code.
    - Total student submissions to be deleted (highlighted in bold with an explicit notice that student grades and focus logs will also be permanently removed).
  - Two action buttons:
    - Secondary: "Cancel" (dismisses modal, no state changes).
    - Primary: "Delete Set & Submissions" (styled with danger red background, loading spinner state during async deletion).
- **Interactive Feedback**:
  - Success toast upon completion: `"Question set and X submissions deleted"`.
  - If viewing the deleted set's detail page, automatically transitions back to the main question sets list tab.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Cascade Deletion vs. Soft Archive**
  - *Chosen Approach*: Cascade deletion removing both the question set and its student sessions.
  - *Why*: Directly aligns with user requirements; avoids orphaned submissions in the submissions table and guarantees access codes are fully freed.
  - *Alternatives Considered*: Soft-archive flag (`status: 'deleted'`). Passed over because instructors want an unambiguous deletion that cleans up database state.
- **Decision 2: Dedicated Modal vs. Inline Confirmation Button**
  - *Chosen Approach*: Modal dialog with detailed submission count warning.
  - *Why*: Deleting submissions is irreversible; a modal prevents accidental clicks and allows space to inform teachers of how many students are affected.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Teacher Dashboard View                     │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │  Question Set Card     │       │ Set Detail Header     │  │
│  │  [Delete Set] button   │       │ [Delete Set] button   │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              └───────────────┬───────────────┘              │
│                              ▼                              │
│               DeleteQuestionSetModal (Confirm)              │
│                              │                              │
│                              ▼                              │
│                   App.tsx: handleDeleteSet                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     firestoreService.ts               server.ts (Proxy)
  • deleteQuestionSet(setId)        • DELETE /api/sets/:id
  • deleteSessionsForSet(setId)     • In-memory purge
  • localStorage cache purge
```

- **Persistence Layer (`src/services/firestoreService.ts`)**:
  - `deleteQuestionSet(setId: string)`: Deletes doc from Firestore `questionSets/{setId}` and removes from local cache.
  - `deleteSessionsForSet(setId: string)`: Deletes matching documents from `studentSessions` and removes from cached sessions.
- **Backend API (`server.ts`)**:
  - `DELETE /api/sets/:id`: Removes the set and associated student sessions from in-memory arrays and sends a 200 OK.
- **Component State Flow (`App.tsx` & `TeacherDashboardView.tsx`)**:
  - `handleDeleteSet(setId: string)`: Executes Firestore and backend deletion, updates `activeQuestionSets`, `allTeacherSessions`, and `teacherSetSessions` states, clears `selectedSetForTeacher` if it matches the deleted set, and displays a confirmation toast.
