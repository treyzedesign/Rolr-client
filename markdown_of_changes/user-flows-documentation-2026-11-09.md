# Changelog: User Flows Specification & Architecture Documentation

### Date
2026-11-09

### Summary
Created a comprehensive user flows specification document (`USER_FLOWS.md`) for the WorkSwipe (ROLr) platform. It documents the complete user journey and technical state transitions for all four roles (Candidate / Job Seeker, Employer, Administrator, and External Public Booking Invitee), featuring sequence and flowchart diagrams, detailed route and screen breakdowns, interactive swiping mechanics, AI interview sessions, and permissions matrices.

### Modifications
- `c:\Users\User\Desktop\workswipe_client\USER_FLOWS.md` (Lines 1-306):
  - Created complete architectural documentation covering:
    - User Roles & Hierarchy (Job Seeker, Employer, Token Booking Invitee, Admin).
    - Authentication & Onboarding Lifecycle (`/`, `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`).
    - Candidate Workflow (`/candidate`, `/candidate/profile`, `/candidate/discover`, `/candidate/applications`, `/candidate/interviews`, `/candidate/interviews/session`).
    - Employer Workflow (`/employer`, `/employer/jobs`, `/employer/discover`, `/employer/applicants`, `/employer/matches`, `/employer/interviews`, `/employer/bookings`).
    - Public Candidate Booking Workflow (`/book/[token]`).
    - Administrator Control Center Workflow (`/admin`, `/admin/users`, `/admin/jobs`, `/admin/applications`, `/admin/interviews`, `/admin/security`).
    - Route authorization & permission matrix.

### Commit Draft - Short
`docs: add comprehensive user flows and system architecture specification`

### Commit Draft - Long
```git
docs: add comprehensive user flows and system architecture specification

- Create USER_FLOWS.md in project root documenting end-to-end user journeys for WorkSwipe (ROLr).
- Add Mermaid visual diagrams for system role routing, candidate lifecycle, employer pipeline, public slot booking sequence, and admin control center.
- Document swipe deck interactions, profile setup checklists, voice waveform recording, and AI interview session states.
- Detail employer job creation restrictions, rich CKEditor template pre-population, and candidate review pipelines.
- Include complete route access control and permission matrix across all application paths.
```

---

### Update: Comprehensive Completion of USER_FLOWS.md

#### Date
2026-11-09

#### Summary
Completed the comprehensive User Flows specification in `USER_FLOWS.md` to cover all 42 application routes, the bilateral contracting architecture, rate isolation rules, end-to-end e-signature sequences with Documenso, settings pages, and full state machines.

#### Modifications
- `c:\Users\User\Desktop\workswipe_client\USER_FLOWS.md` (Lines 1-440):
  - Updated candidate flow to include dedicated `/candidate/offers`, `/candidate/engagements`, and `/candidate/settings`.
  - Updated employer flow to include `/employer/bookings`, `/employer/engagements`, `/employer/profile`, `/employer/settings`, and `HireModal.tsx` hire offer creation.
  - Updated admin flow to detail `/admin/offers` (with `OfferDetailDrawer.tsx`), `/admin/engagements` (with early termination), `/admin/notifications`, `/admin/bookings`, and `/admin/security`.
  - Added complete Mermaid sequence diagram for the post-interview bilateral hiring lifecycle (Employer -> Rolr Admin Approval -> Candidate Acceptance -> Parallel Documenso E-Sign -> Active Placement).
  - Added complete Mermaid state diagram for application, offer, contract, and engagement statuses.
  - Expanded the Route & Permissions Matrix to exhaustively list all 42 application page routes with their access guards and capabilities.
  - Added strict Bilateral Rate Isolation Matrix detailing visibility across Candidate, Employer, and Admin roles.

#### Commit Draft - Short
`docs: complete end-to-end user flows, bilateral hiring sequence, and route matrix`

#### Commit Draft - Long
```git
docs: complete end-to-end user flows, bilateral hiring sequence, and route matrix

- Fully expand USER_FLOWS.md across candidate, employer, and admin roles.
- Document dedicated candidate offers portal (/candidate/offers) and active engagements.
- Detail employer post-interview hire flow with HireModal and bilateral contract placement.
- Add Mermaid sequence diagram for end-to-end bilateral contract generation via Documenso.
- Add lifecycle status state machine covering applications, offers, contracts, and engagements.
- Expand route matrix to cover all 42 application pages.
- Document strict rate isolation rules between candidate, employer, and admin portals.
```

