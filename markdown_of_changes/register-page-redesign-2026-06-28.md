# Changelog - Register Page Redesign

## Date: 2026-06-28

### Summary
Redesigned the main registration entry page to use a modern split-screen layout. The left column features a rounded brand pane displaying the background illustration pattern `Auth_pic.png`, the `Rolr` logo, an application preview mockup `Auth_Slides.png`, and a bottom glassmorphic block summarizing the platform value. The right column renders the sign-up path selector card allowing users to interactively choose between Job Seeker and Employer registration forms before proceeding.

### Modifications
- **[page.tsx](file:///c:/Users/User/Desktop/workswipe_client/app/register/page.tsx)** (Lines 1-180): Built a custom split-screen layout replacing the previous single-card `AuthShell` wrapper. Integrated state management for the role selection (`job-seeker` vs `employer`), styled option card cards with check indicators, and implemented path redirection upon button click.
- **[layout.tsx](file:///c:/Users/User/Desktop/workswipe_client/app/register/layout.tsx)** (Lines 1-16): Converted to a client-side component, imported `usePathname` from `next/navigation`, and conditionally rendered `AccountNavbar` so that it is completely hidden on the `/register` entry route.
- **[AuthBanner.tsx](file:///c:/Users/User/Desktop/workswipe_client/components/auth/AuthBanner.tsx)** (Lines 1-38): Created a reusable, premium split-screen banner component rendering the background pattern, brand logo, mock slide images, and glassmorphic overview.
- **[page.tsx](file:///c:/Users/User/Desktop/workswipe_client/app/register/job-seeker/page.tsx)** (Lines 1-280): Redesigned the registration screen to render the reusable `AuthBanner` on the left and a unified, premium signup form on the right containing input blocks for Full Name, Email, Password, and Confirm Password matching the design.

## Commit Draft - Short
`feat: redesign job-seeker registration and extract reusable auth banner`

## Commit Draft - Long
- Extracted the left-side brand banner layout into a reusable `AuthBanner` component located in `components/auth/AuthBanner.tsx`.
- Integrated `AuthBanner` inside the entry registration selection page (`app/register/page.tsx`) and the job-seeker registration page (`app/register/job-seeker/page.tsx`).
- Redesigned the job-seeker registration page to render a clean, single-screen signup form with inputs for Full Name, Email, Password, and Confirm Password, custom show/hide toggles, real-time matching checks, and an automated backend default location parameter.
- Upgraded the job-seeker registration success screen block to maintain layout consistency.
- Conditionally hid the `AccountNavbar` header bar on `/register` using route pathname matching in `app/register/layout.tsx`.
