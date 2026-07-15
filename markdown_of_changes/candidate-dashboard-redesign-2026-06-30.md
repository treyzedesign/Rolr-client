# Changelog - Candidate Dashboard & Discover Redesign

## Date: 2026-06-30

### Summary
Redesigned the candidate dashboard page, discover jobs page, card swipe board, and layout elements to match the premium design mockup. Replaced the combined swipe-board view on the candidate homepage with a clean profile setup checklist and dynamic statistics panels. Built a high-fidelity card swiping interface under the Jobs/Discover route, including loader matchmaking states, clipboard empty states, card stacking rotation angles, and embedded solid color swipe control triggers.

### Modifications
- **[page.tsx (Candidate Dashboard)](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/page.tsx)** (Lines 1-350): Overhauled the candidate dashboard page. Added top greeting header, notification bell widget, profile status dropdown, five statistic cards, and adaptive profile setup checklist card. Corrected completion conditions for checklist sections to avoid false 100% completion when portfolio links are unset. Programmed checklist items to redirect directly into their corresponding steps in the setup wizard via `?edit=${id}` parameters.
- **[page.tsx (Discover Jobs)](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/discover/page.tsx)** (Lines 1-225): Redesigned the discover page header alignment and rounded filter pills. Added matcher loader screen and clipboard empty state screen. Configured the page title header to hide on mobile screens (`hidden md:flex`). Changed display layout wrapper to top-aligned (`justify-start pt-8`). Integrated `JobDetailsModal` and its states at the page level to prevent relative CSS z-index clipping.
- **[JobSwipeBoard.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/candidate/JobSwipeBoard.tsx)** (Lines 1-345): Overhauled the card swiping layout, stacking depth, and background layers. Programmed the background stack card (Card 2) to display the actual title, company, and location details of the next job. Connected the scale, rotation, translation, and opacity of background layers to the top card's drag displacement in real-time. Configured action controls to remain static at the bottom center of the card stack using absolute positioning. Integrated a `useEffect` hook to reset Framer Motion's `x` value to `0` whenever `topJob._id` changes. Restored the original, non-blocking background `swipeJob` call and `60px` threshold to ensure cards fly off-screen instantly without delay. Forwarded details button and card clicks to page-level `onViewDetails` to guarantee the modal renders correctly.
- **[JobSeekerSidebar.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/candidate/JobSeekerSidebar.tsx)** (Lines 1-135): Redesigned the navigation sidebar. Added modern styled SVG ROLr logo, swipe tagline, active navigation highlights with a vertical blue accent strip on the left, a bottom logout button, and desktop floating card styling.
- **[JobSeekerNavbar.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/candidate/JobSeekerNavbar.tsx)** (Lines 1-70): Completely redesigned the top navbar as the ROLr mobile header. Removed old "WorkSwipe" labels, theme toggles, and candidate badges. Styled the mobile header with a sidebar menu trigger, ROLr logo, bell widget with a red numbered badge ("6"), and green status indicator avatar, keeping it hidden on desktop screens (`md:hidden`).
- **[JobDetailsModal.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/candidate/JobDetailsModal.tsx)** (Lines 1-290): Redesigned the job details overlay modal. Configured a blurry glassmorphic backdrop for both screen layouts. Renders a centered card wrapper (2.5rem corners) on web views and a right-sliding fullscreen drawer on mobile views. Integrated client-side mount state tracking (`mounted`) to eliminate Next.js hydration mismatches. Placed `<AnimatePresence>` at the root of the JSX return tree to resolve state-synchronization unmount bugs and ensure exit animations play.
- **[page.tsx (Applications)](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/applications/page.tsx)** (Lines 1-312): Redesigned candidate applications page. Configured top actions bar, Today/Weekly/Monthly capsule filter pills, grid-card layout for applied jobs with date stamps and outline 'Track Status' trigger buttons. Incorporated clipboard empty states and spin loader states.
- **[ApplicationTimeline.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/candidate/ApplicationTimeline.tsx)** (Lines 1-220): Overhauled the application status timeline modal. Implemented a glassmorphic blurred backdrop (`backdrop-blur-[6px]`) and a progress checklist tracker featuring circle checks and blue dashed connector lines.
- **[page.tsx (Profile)](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/profile/page.tsx)** (Lines 1-720): Redesigned the candidate profile page structure. Incorporated a large layout card containing a circular avatar wrapper with a camera action overlay, tagline, bio details, and social anchor links. Styled the 6 grid sections (Basic Information, Voice waveforms, Education, Professional info, Job Preference, Portfolio & Links) as custom cards containing outlined `[Edit]` buttons that toggle clean inline forms on click. Grouped cards into Left and Right vertical flex column stacks (`flex flex-col gap-6`) to guarantee contiguous stacking, completely resolving empty vertical row space offsets. Implemented Client Onboarding Setup Flow supporting horizontal progress lines and Next navigation. Integrated query parameter listener (`?edit=`) to initialize setup editing form on mount.
- **[layout.tsx](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/layout.tsx)** (Lines 30-32): Removed the restricted `max-w-6xl` limit and `mx-auto` margins on the dashboard page container, widening the layout view to span full width and align with the sidebar.

## Commit Draft - Short
`feat: redesign candidate dashboard, jobs discover route, and card swipe controls`

## Commit Draft - Long
- Overhauled the candidate dashboard landing page and navigation components to match high-fidelity specifications.
- Redesigned the jobs discover router page with a customized search filter pill structure, dynamic matching loader dialogs, and overlapping clipboard empty state boards.
- Upgraded `JobSwipeBoard` card structures with metadata symbol fields, summaries, skill badges, rotatable card stacking, and built-in solid action control groups.
- Configured layout wrapper grids to widen main contents to fluid margins and hidden redundant navigation elements on desktop sizes.

---

## Update - 2026-07-13

### Summary
- Hidden the top-right action toolbar (containing the notification bell, candidate profile badge, and "Discover Jobs" button) in the candidate dashboard on mobile views to reduce clutter.
- Placed the dark/light mode `ThemeToggle` switch right next to the notification bell in both candidate header layouts.

### Modifications
- **[page.tsx (Candidate Dashboard)](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/page.tsx)** (Line 138): Added Tailwind CSS responsive classes `hidden md:flex` to hide the actions container on small screens. Integrated the `ThemeToggle` component beside the notification bell.
- **[JobSeekerNavbar.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/candidate/JobSeekerNavbar.tsx)** (Line 43): Placed the `ThemeToggle` switch next to the notification bell in the mobile navbar.

### Commit Draft - Short
`fix: hide action toolbar on mobile and add theme toggles to candidate headers`

### Commit Draft - Long
- Updated the candidate dashboard header layout to hide the action bar on mobile devices.
- Integrated the ThemeToggle component beside the notification bell on both the main dashboard view and the mobile header navbar.
