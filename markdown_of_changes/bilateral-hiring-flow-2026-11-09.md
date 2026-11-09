# Changelog: Post-Interview Bilateral Hiring Flow & Rate Isolation

### Date
2026-11-09

### Summary
Built the complete end-to-end post-interview hiring flow across Candidate, Employer, and Admin portals integrated with backend APIs, strictly implementing Rolr's Bilateral Contracting Architecture with rate isolation. Implemented hire offer creation with client-side validation, offer approval/rejection auditing, parallel contract dispatch, candidate offer acceptance/declining, active placements tracking, and administrative engagement termination.

### Modifications
- `c:\Users\User\Desktop\workswipe_client\types\hiring.ts` (Lines 1-155):
  - Created type definitions for `ApplicationStatus`, `OfferStatus`, `ContractStatus`, `EngagementStatus`, `BillingCycle`, `CreateHireOfferRequest`, `Offer`, `Engagement`, and response payloads.
- `c:\Users\User\Desktop\workswipe_client\types\job.ts` (Lines 1-105):
  - Updated `Application` interface to support all 13 extended lifecycle statuses.
- `c:\Users\User\Desktop\workswipe_client\lib\api\hiring.ts` (Lines 1-98):
  - Built API client endpoints for `createHireOffer`, `candidateAcceptOffer`, `candidateDeclineOffer`, `adminApproveOffer`, `adminRejectOffer`, `adminTerminateEngagement`, `getOffers`, and `getEngagements`.
- `c:\Users\User\Desktop\workswipe_client\components\hiring\StatusBadges.tsx` (Lines 1-178):
  - Created status badge components (`ApplicationStatusBadge`, `OfferStatusBadge`, `ContractStatusBadge`, `EngagementStatusBadge`) with standardized styles and labels.
- `c:\Users\User\Desktop\workswipe_client\stores\hiring-store.ts` (Lines 1-220):
  - Built Zustand store `useHiringStore` managing offers, engagements, selected items, mutations, and optimistic state updates.
- `c:\Users\User\Desktop\workswipe_client\components\employer\HireModal.tsx` (Lines 1-320):
  - Built hire offer modal with role, dates, duration, employer billing rate, target candidate pay, currency, billing cycle, scope terms, and validation.
- `c:\Users\User\Desktop\workswipe_client\components\employer\InterviewResultsModal.tsx` (Lines 290-340):
  - Updated actions to replace direct hire prompt with `HireModal` trigger and status awareness.
- `c:\Users\User\Desktop\workswipe_client\app\employer\interviews/page.tsx` (Lines 1-788):
  - Upgraded "Select for Hire" handler to open `HireModal`, integrated `ApplicationStatusBadge`, and connected session refreshes upon offer creation.
- `c:\Users\User\Desktop\workswipe_client\app\employer\engagements\page.tsx` (Lines 1-458):
  - Created employer engagements page displaying active placements, timeline, billing rate (strictly isolated from talent payout), contract status, and client agreement download links.
- `c:\Users\User\Desktop\workswipe_client\components\employer\EmployerSidebar.tsx` (Lines 1-30):
  - Added "Engagements" link to employer sidebar navigation.
- `c:\Users\User\Desktop\workswipe_client\components\candidate\OfferCard.tsx` (Lines 1-355):
  - Created candidate offer card displaying role, company, timeline, candidate payout rate (strictly isolated from employer bill rate), accept offer confirmation modal, and decline modal.
- `c:\Users\User\Desktop\workswipe_client\components\candidate\ApplicationTimeline.tsx` (Lines 60-170):
  - Extended visual progress tracker across all bilateral stages (Applied -> Matched -> Interview Completed -> Offer Pending Rolr Review -> Offer Extended -> Contracts Out -> Hired).
- `c:\Users\User\Desktop\workswipe_client\app\candidate\applications\page.tsx` (Lines 1-320):
  - Integrated active `OfferCard`s display, application status badges, and store hooks.
- `c:\Users\User\Desktop\workswipe_client\app\candidate\interviews\page.tsx` (Lines 1-340):
  - Added prominent `OfferCard`s section when offers are approved or contract pending.
- `c:\Users\User\Desktop\workswipe_client\app\candidate\engagements\page.tsx` (Lines 1-285):
  - Created candidate engagements page showing active roles, compensation, and contractor agreement download links.
- `c:\Users\User\Desktop\workswipe_client\components\candidate\JobSeekerSidebar.tsx` (Lines 1-30):
  - Added "My Engagements" link to candidate sidebar navigation.
- `c:\Users\User\Desktop\workswipe_client\components\admin\OfferDetailDrawer.tsx` (Lines 1-380):
  - Built administrative audit drawer displaying both rates side by side, calculating Rolr margin ($ and %), bilateral contract status, approve action, and reject modal with reason.
- `c:\Users\User\Desktop\workswipe_client\app\admin\offers\page.tsx` (Lines 1-310):
  - Created admin offers table with status filtering, rate spreads, and audit drawer trigger.
- `c:\Users\User\Desktop\workswipe_client\app\admin\engagements\page.tsx` (Lines 1-350):
  - Created admin engagements monitoring page with terminate placement action and destructive confirmation modal.
- `c:\Users\User\Desktop\workswipe_client\app\admin\layout.tsx` (Lines 1-65):
  - Added "Offers" and "Engagements" items to admin portal sidebar navigation.
- `c:\Users\User\Desktop\workswipe_client\USER_FLOWS.md` (Lines 280-330):
  - Documented bilateral contracting architecture, rate isolation rules, and lifecycle steps.

### Commit Draft - Short
`feat: build post-interview bilateral hiring flow with strict rate isolation`

### Commit Draft - Long
```git
feat: build post-interview bilateral hiring flow with strict rate isolation

- Implement bilateral contracting model with Rolr as contracting entity on both sides.
- Enforce strict rate isolation: job seekers never see employer billing rates, employers never see contractor payout rates, and admins inspect both side by side with Rolr gross margin calculations.
- Create HireModal in Employer Portal to submit offers for Rolr review.
- Add /employer/engagements to manage active placements and download Client Services Agreements.
- Build OfferCard for Candidate Portal with accept/decline flows and direct e-sign links.
- Extend ApplicationTimeline with 7-step bilateral hiring progression.
- Add /candidate/engagements for active contractor placements and signed agreement downloads.
- Create /admin/offers and OfferDetailDrawer to approve/reject offers with margin auditing.
- Create /admin/engagements with destructive termination action requiring reason.
- Provide Zustand hiring store, API client endpoints, and TypeScript types.
```

---

### Update - 2026-11-09 (Currency Input Prefix Fix)

#### Summary
Resolved a visual overlap bug in `HireModal.tsx` where multi-character currency prefixes (e.g., `CAD`, `USD`) clashed directly with the placeholder text in the rate input fields. Redesigned the rate inputs to use a dedicated prefix group container with dynamic currency symbols (`$ USD`, `$ CAD`, `₦ NGN`, `£ GBP`, `€ EUR`).

#### Modifications
- `c:\Users\User\Desktop\workswipe_client\components\employer\HireModal.tsx` (Lines 41-60, 320-380):
  - Added `getCurrencySymbol` helper for clear currency formatting.
  - Replaced floating absolute `span` and fixed `pl-9` inputs with a clean, segmented input-addon group containing a dedicated currency badge and transparent input field.

#### Commit Draft - Short
`fix(employer): resolve currency prefix and placeholder overlap in HireModal`

#### Commit Draft - Long
```git
fix(employer): resolve currency prefix and placeholder overlap in HireModal

- Replace absolute span and fixed padding with flex input-addon container for rate inputs.
- Add getCurrencySymbol helper to cleanly display currency symbols and ISO codes without overlapping input text or placeholders.
- Ensure consistent borders, focus states, and dark/light mode styles.
```

---

### Update - 2026-11-09 (AnimatePresence Key Fix in OfferDetailDrawer)

#### Summary
Resolved the exact React warning in `OfferDetailDrawer.tsx` line 109 (`Encountered two children with the same key, ''`):
- Removed the invalid outer `<AnimatePresence>` wrapper that was enclosing `<div className="fixed ...">` and the nested reject modal `<AnimatePresence>` without keys as sibling children.
- Replaced it with a standard React fragment `<> ... </>` and provided explicit unique keys (`key="reject-modal"`, `key="accept-confirm-modal"`, `key="decline-modal"`) to all conditionally animated modal children.

#### Modifications
- `c:\Users\User\Desktop\workswipe_client\components\admin\OfferDetailDrawer.tsx` (Lines 105-125, 350-410):
  - Removed outer `<AnimatePresence>`, wrapped drawer and reject modal in fragment.
  - Added `key="reject-modal"` to the reject modal backdrop container.
- `c:\Users\User\Desktop\workswipe_client\components\candidate\OfferCard.tsx` (Lines 245-325):
  - Added explicit keys (`key="accept-confirm-modal"`, `key="decline-modal"`) to Framer Motion modal containers.

#### Commit Draft - Short
`fix(admin): resolve AnimatePresence duplicate empty key in OfferDetailDrawer`

#### Commit Draft - Long
```git
fix(admin): resolve AnimatePresence duplicate empty key in OfferDetailDrawer

- Remove unkeyed outer AnimatePresence wrapping unkeyed drawer and nested modal.
- Provide explicit keys to all conditional Framer Motion modal containers.
```

---

### Update: Dedicated Candidate Job Offers Portal (`/candidate/offers`)

#### Date: 2026-11-09

#### Summary
Extracted Job Offers out of `app/candidate/applications/page.tsx` and `app/candidate/interviews/page.tsx` into a dedicated candidate Job Offers page (`app/candidate/offers/page.tsx`) with its own sidebar navigation entry in `components/candidate/JobSeekerSidebar.tsx`. This keeps the Applications page focused strictly on application tracking and timeline inspection, while providing a dedicated, distraction-free space for reviewing, accepting, or declining bilateral job offers.

#### Modifications
- `c:\Users\User\Desktop\workswipe_client\app\candidate\offers\page.tsx` (Lines 1-205):
  - Created brand new dedicated Job Offers page with header, notification bell, user profile pill, and Bilateral Contracting protection banner.
  - Added filter tabs: `All Offers`, `Action Required` (offers with status `approved` needing candidate review), `Accepted` (contracts dispatched), and `Declined`.
  - Added loading spinner and responsive empty state with "Explore Jobs" call to action.
  - Rendered `OfferCard`s with full bilateral rate protection (`jobSeekerPayoutRate` visible, `employerBillingRate` protected/isolated).
- `c:\Users\User\Desktop\workswipe_client\components\candidate\JobSeekerSidebar.tsx` (Lines 14-28):
  - Imported `Award` from `lucide-react`.
  - Added `{ href: "/candidate/offers", label: "Job Offers", icon: Award }` into `candidateNavItems` between `Interviews` and `My Engagements`.
- `c:\Users\User\Desktop\workswipe_client\app\candidate\applications\page.tsx` (Lines 3-13, 23-35, 125-155):
  - Removed "Pending Action: Job Offers" card block from the top of the applications page.
  - Removed unused `OfferCard` and `useHiringStore` imports and state bindings.
- `c:\Users\User\Desktop\workswipe_client\app\candidate\interviews\page.tsx` (Lines 9-45, 188-215):
  - Removed the prominent "Pending Action: Job Offers" card block from the interviews page to maintain single-responsibility UI.
- `c:\Users\User\Desktop\workswipe_client\USER_FLOWS.md` (Lines 90-105, 150-175):
  - Updated candidate flow mermaid diagram and documented the dedicated `/candidate/offers` portal.

#### Commit Draft - Short
`feat(candidate): extract job offers to dedicated portal page`

#### Commit Draft - Long
```git
feat(candidate): extract job offers to dedicated portal page

- Remove Job Offers card section from /candidate/applications and /candidate/interviews.
- Create dedicated /candidate/offers page with filter tabs (All, Action Required, Accepted, Declined).
- Add "Job Offers" navigation item with Award icon in JobSeekerSidebar.
- Display bilateral contracting protection notice and render OfferCard with rate isolation.
- Update USER_FLOWS.md and bilateral hiring documentation.
```

---

### Update: Fix controls.start unmounted animation error in Applicant & Job Swipe Boards

#### Date: 2026-11-09

#### Summary
Resolved the runtime browser animation error in `ApplicantSwipeBoard.tsx` line 94 (`Animation failed: Error: controls.start() should only be called after a component has mounted`). When an applicant was swiped, `onSwipe` removed the candidate from the list; if it was the last candidate or during the unmount/remount cycle of the `key={topApplicant._id}` motion element, calling `await controls.start(...)` rejected with Framer Motion's unmounted guard. Replaced the unmounted `controls.start` call with synchronous `controls.set(...)` and `x.set(0)`, added resets on `topApplicant` changes, and guarded animation calls.

#### Modifications
- `c:\Users\User\Desktop\workswipe_client\components\employer\ApplicantSwipeBoard.tsx` (Lines 56-118):
  - Reset `x.set(0)` and `controls.set({ x: 0, rotate: 0, opacity: 1 })` inside `useEffect` on `topApplicant` change.
  - Replaced `controls.start` with `controls.set` for resetting the motion values after `onSwipe`.
  - Added safe error filtering for unmounted transition rejections in `handleSwipe` and `handleDragEnd`.
- `c:\Users\User\Desktop\workswipe_client\components\candidate\JobSwipeBoard.tsx` (Lines 75-125):
  - Applied the identical fix on the candidate job swipe board to prevent unmounted animation failures when swiping the final job.

#### Commit Draft - Short
`fix(swipe): resolve Framer Motion controls.start unmounted error in swipe boards`

#### Commit Draft - Long
```git
fix(swipe): resolve Framer Motion controls.start unmounted error in swipe boards

- Replace controls.start with synchronous controls.set and x.set(0) after swiping.
- Reset motion values and controls on topApplicant change in useEffect.
- Guard snap-back controls.start against unmounted component errors in drag end handler.
- Apply matching defensive pattern to JobSwipeBoard.
```
