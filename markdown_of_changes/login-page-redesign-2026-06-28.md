# Changelog - Login Page Redesign

## Date: 2026-06-28

### Summary
Redesigned the login screen to match the premium split-screen layout used across the registration screens. Placed the reusable `<AuthBanner />` component on the left, and built a clean, stylized credentials form on the right (Email, Password with a show/hide inline toggle, right-aligned Forgot password link, and a pill Proceed button). Removed the default account navbar from the layout wrapper to ensure a clean view.

### Modifications
- **[page.tsx](file:///c:/Users/User/Desktop/workswipe_client/app/login/page.tsx)** (Lines 1-170): Rebuilt the layout to render the split-screen banner and form pane, integrating local eye toggles, error handlers, and loading spinners.
- **[layout.tsx](file:///c:/Users/User/Desktop/workswipe_client/app/login/layout.tsx)** (Lines 1-10): Removed the `<AccountNavbar />` header element from the login screen context wrapper.

## Commit Draft - Short
`feat: redesign login page with split-screen banner and clean form layout`

## Commit Draft - Long
- Swapped the login page implementation in `app/login/page.tsx` with a custom split-screen layout rendering the reusable `AuthBanner` component on desktop viewports.
- Styled the login credentials card with input fields for Email and Password, and an integrated show/hide password toggle.
- Added a right-aligned link for "Forgot password?" and structured a full-width blue Proceed button.
- Stripped the `AccountNavbar` layout component from the login route page layout wrapper in `app/login/layout.tsx`.
