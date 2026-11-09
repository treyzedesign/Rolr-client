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

