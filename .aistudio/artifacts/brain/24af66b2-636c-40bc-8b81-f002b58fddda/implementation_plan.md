# Implementation Plan: Strict Role Isolation & Access Code Regeneration Fix

## Summary of Goals & Confirmed Decisions
1. **Fix Access Code Regeneration**:
   - Eliminate `window.confirm()` in `QRCodeModal.tsx` which gets blocked in sandboxed iframe environments.
   - Replace with a two-step in-modal confirmation UI ("Click to Confirm" / "Cancel") with clear warning that previous codes will be invalidated.
   - Ensure `App.tsx` and `server.ts` synchronize code regeneration across `activeQuestionSets`, `qrCodeSet`, and `selectedSetForTeacher` with instant visual toast feedback and copied clipboard utility.
   - Add direct "Regenerate Code" trigger in the Question Set management cards and detail header.
2. **Strict Student vs. Teacher Role Isolation**:
   - **Student Mode**: Completely hide all teacher components, dashboard views, submission logs, CSV export options, and teacher dock tabs. If a student attempts to route to or retain a `teacher` view, automatically redirect them to student views (`home`, `drafts`, or `progress`).
   - **Teacher Mode**: Render a dedicated teacher top navigation bar with direct tabs for **"Question Sets"** and **"Submissions & Integrity"**, along with quick set creation and status toggles. Keep student draft/writing canvas out of the teacher workflow unless actively previewing.
3. **Top Role Pill with One-Click Switcher**:
   - Integrate an elegant, high-visibility role switcher pill in the top header (`🎓 Student Mode` ⇄ `👨‍🏫 Teacher Mode`).
   - Switching roles immediately updates `AuthContext`, adapts the interface in real time, and routes the user to the appropriate role-specific starting view without state pollution.

---

## Technical Architecture & State Flow

```
+-----------------------------------------------------------------------------------------+
|                                    Header / App Shell                                   |
|   - Brand Logo ("ThinkFirst")                                                           |
|   - Top Role Pill Switcher: [ 🎓 Student Demo  |  👨‍🏫 Teacher Demo ] (One-Click Toggle)     |
+-----------------------------------------------------------------------------------------+
                                             |
             +-------------------------------+-------------------------------+
             |                                                               |
    [ Student Mode Active ]                                         [ Teacher Mode Active ]
    - Bottom Dock: Write, Drafts, Progress                          - Dedicated Teacher Top Bar:
    - View: Join Code / Writing Canvas / Receipts                     * "Question Sets"
    - Hidden: Teacher Dashboard, CSV Export, Flagged Log              * "Submissions & Integrity"
    - View Guard: Force `currentView != 'teacher'`                  - Inline "Create Set" Action
                                                                    - Hidden: Student Writing Tools
                                                                             |
                                                            +----------------+----------------+
                                                            | Access Code Regeneration Modal   |
                                                            | - In-modal 2-step confirmation   |
                                                            | - Updates App & Server state     |
                                                            | - Instant code refresh & copy    |
                                                            +---------------------------------+
```

---

## Detailed Implementation Steps

### 1. Fix Access Code Regeneration (`QRCodeModal.tsx`, `TeacherDashboardView.tsx`, `App.tsx`)
- **Root Cause**: `QRCodeModal.tsx` currently invokes `if (!confirm('Are you sure you want to regenerate...')) return;`. In the AI Studio embedded preview environment, browser `window.confirm` is blocked or returns `false`, silently cancelling code regeneration.
- **In-App Modal Confirmation UI**:
  - In `QRCodeModal.tsx`, introduce a local state `isConfirmingRegenerate: boolean`.
  - When clicking "Regenerate Code", show an in-modal warning banner:
    > *"Regenerating will invalidate the previous 6-digit access code. Existing submissions remain safe. Are you sure?"*
    > Buttons: `[ Yes, Generate New Code ]` (accent color) and `[ Cancel ]`.
  - When confirmed, generate a cryptographically solid 6-character alphanumeric code, update the question set in `App.tsx` state (both `activeQuestionSets`, `qrCodeSet`, and `selectedSetForTeacher`), update the backend set records, and show a temporary success badge (`"New Code Generated: ABC-123"`).
- **Inline Teacher Action**:
  - Add a "Regenerate Code" button directly within `TeacherDashboardView.tsx` on each question set card and inside the set detail panel, using the same in-app confirmation popover or opening the updated modal.

### 2. Strict Role Isolation (`App.tsx`, `NavigationDock.tsx`, `Header.tsx`)
- **Navigation Dock Isolation (`NavigationDock.tsx`)**:
  - Filter navigation tabs based on `user.role`:
    - When `user.role === 'student'`, the `"Teacher"` tab and teacher live integrity badge are completely removed from the dock. Students see: `Write`, `Drafts`, `Progress`.
    - When `user.role === 'teacher'`, the dock is either streamlined or hidden in favor of the dedicated Teacher Top Navigation Bar.
- **Route / View Guards in `App.tsx`**:
  - Implement a `useEffect` view guard: If `user.role === 'student'` and `currentView === 'teacher'`, immediately reset `currentView` to `'home'`.
  - Conversely, if `user.role === 'teacher'` and the user lands on `'home'`, provide quick contextual actions to jump to the Teacher Workspace (`'teacher'`) or manage assignments.
  - Guard teacher-only modals (CSV export, question set creation, teacher code distribution) so student accounts cannot trigger them.

### 3. Dedicated Teacher Top Bar Navigation (`Header.tsx` & `TeacherDashboardView.tsx`)
- When `user.role === 'teacher'`:
  - Render a secondary teacher sub-bar directly below the header or integrated into the top bar:
    - Tab 1: **"Question Sets"** (with live active count badge).
    - Tab 2: **"Submissions & Integrity Log"** (with flagged alerts badge).
    - Quick Action: **"+ Create Question Set"**.
- Provide seamless switching between the two views within the teacher dashboard.

### 4. Top Role Pill Switcher (`Header.tsx`)
- Design a high-craft segmented pill in `Header.tsx`:
  - `[ 🎓 Student Demo | 👨‍🏫 Teacher Demo ]`
  - Active segment is highlighted with an elevated contrast badge and clear icon.
  - Clicking either segment instantly switches `user.role` via `setUserRole('student' | 'teacher')`, triggers view redirection, and notifies the user with a subtle toast.
  - Retain login/logout functionality for authenticated persistent sessions while keeping the demo switcher readily available.

---

## Verification & Testing Plan

1. **Access Code Regeneration**:
   - Open a Question Set QR Modal as a Teacher.
   - Click "Regenerate Code" -> Verify in-app confirmation dialog displays cleanly without any `window.confirm` browser dialogs.
   - Confirm generation -> Verify the access code immediately changes, the QR code updates, the set detail reflects the new code, and copying the new code works.
   - Test that students using the new code can successfully enter the assignment.
2. **Student Role Isolation**:
   - Switch to Student Demo mode using the top pill switcher.
   - Verify that no Teacher dashboard, Teacher tabs in navigation dock, or administrative controls are visible or accessible.
   - Verify students only see the assignment joiner, Socratic writing workspace, grammar checklist, and submission receipts.
3. **Teacher Role Isolation & Navigation**:
   - Switch to Teacher Demo mode using the top pill switcher.
   - Verify the dedicated Teacher bar appears with "Question Sets" and "Submissions" tabs.
   - Verify set closure, code regeneration, student submission inspection, and CSV export operate cleanly.
4. **Build & Lint Verification**:
   - Run `npm run lint` and `compile_applet` to ensure zero compilation or TypeScript errors.
