# Changelog

**Date:** 2026-06-26

### Summary
Redesigned the landing page hero section, floating navbar, features section, how it works section, and FAQ section, and created a new Testimonials section following the UI design mockups in the user requests. Updated brand color to `#2782FF`, branding text to "Rolr", transformed the navbar into a floating card, updated the Hero section to a responsive two-column grid displaying the text and image collage side-by-side, centered and styled the bottom stats, cleaned up the page background, integrated the global font 'Nunito', expanded the maximum layout width constraint to `max-w-7xl` to reduce side space, applied a horizontal navy-to-blue gradient to the primary hero heading, completely overhauled the Features section to use card containers displaying custom visual asset images, redesigned the How It Works section to display slanted cards pinned with a custom red pin asset, built the new Testimonials section, and redesigned and reordered the FAQ section.

## Modifications
- **[SiteNavbar.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/shared/SiteNavbar.tsx)** (Lines 1-50): Overwrote the file to transform the header into a floating rounded card, updated the logo to "Rolr", updated navigation links (adding Testimonials), and styled action buttons. Increased width constraint to `max-w-7xl`.
- **[Hero.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/Hero.tsx)** (Lines 1-112): Overwrote the file to change layout to two-column, styled header with uppercase text and a horizontal text gradient (`from-[#1a365d] to-[#2782FF]`), added brand colors to buttons and stats, and integrated `/Assets/hero_pics.png` as the right-hand collage image. Increased width constraint to `max-w-7xl`.
- **[page.tsx](file:///C:/Users/User/Desktop/workswipe_client/app/page.tsx)** (Lines 11, 16): Replaced `bg-grid-futuristic` background class with clean `bg-[#f5f6f8] dark:bg-slate-950` to match the screenshot background. Imported and rendered the `Testimonials` component inside the main layout. Reordered the FAQ component to render after Testimonials and before CTABanner.
- **[layout.tsx](file:///C:/Users/User/Desktop/workswipe_client/app/layout.tsx)** (Lines 1-45): Replaced `Geist` with `Nunito` from `next/font/google` and injected its variable globally.
- **[globals.css](file:///C:/Users/User/Desktop/workswipe_client/app/globals.css)** (Lines 18-34): Reconfigured `@theme` and `body` selector to apply `var(--font-nunito)` as the default sans-serif font.
- **[Features.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/Features.tsx)** (Lines 1-63): Rewrote the file to render a 2x2 grid of rounded cards containing the centered feature asset images on light-grey background containers, followed by left-aligned bold text titles and description copy.
- **[HowItWorks.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/HowItWorks.tsx)** (Lines 1-59): Rewrote the file to show centered headers and a grid of four tilted card elements with red pin assets (`flow_Pin.png`) absolute positioned on the top-left corner. Applied alternating slants (positive and negative) so the space between card pairs resembles a "V" shape valley.
- **[Testimonials.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/Testimonials.tsx)** (Lines 1-190): Created a new Testimonials component layout with a centered header, two-card stacked outer columns, and a central featured image portrait containing a frosted glass overlay using the requested assets. The section background is set to solid white (`bg-white`), and the card backgrounds are styled as light-grey (`bg-[#f5f6f8]`).
- **[FAQ.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/FAQ.tsx)** (Lines 1-140): Rewrote the file to implement a two-column desktop layout with a titles/helper box on the left (including email drop box with clipboard-copy action), and active interactive accordion list cards on the right.
- **[CTABanner.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/CTABanner.tsx)** (Line 5-6): Increased container max-width to `max-w-7xl` and verified/applied `bg-white` background color to the enclosing section container.

## Commit Draft - Short
`style: redesign landing page sections, floating navbar, testimonials, and faq`

## Commit Draft - Long
- Updated `SiteNavbar` to be a floating card with rounded-2xl corners, soft shadows, and translucent white background.
- Renamed brand logo to "Rolr" and set active navigation link color to brand `#2782FF`.
- Added "Testimonials" to the navigation links.
- Set up responsive two-column layout in `Hero` section on desktop with content on the left and the hero collage image on the right.
- Updated the primary title to use uppercase styling, brand coloring, and a horizontal gradient (`from-[#1a365d] to-[#2782FF]`).
- Pill-shaped brand color buttons implemented for "Start Swiping" (filled) and "Start Hiring" (outlined).
- Centered the stats row (3x, Voice, Live) horizontally below the main grid with `#2782FF` styling.
- Changed main page background to clean light-grey `#f5f6f8` for a premium and cohesive design.
- Integrated `Nunito` as the primary global sans-serif font face.
- Widened page layouts from `max-w-6xl` to `max-w-7xl` (1280px) to decrease side margins on larger desktop viewports.
- Redesigned the `Features` component to render a 2x2 grid of cards featuring custom illustrations (`feat_swipe_match.png`, `feat_voice_screening.png`, `feat_Ai_assessment.png`, `feat_Structure_prof.png`) centered on grey background blocks with clear text below.
- Redesigned `HowItWorks` component to display centered headers and a responsive list of four slanted, pin-decorated cards utilizing the `flow_Pin.png` asset and interactive hover animation. Card rotations are uniformly set to counter-clockwise at slightly varying angles (`-3deg`, `-1.5deg`, etc.) as shown in the mockup design.
- Created `Testimonials` component featuring a 3-column desktop layout that aligns stacked text review cards around a central featured avatar image container with a glassmorphic frosted overlay card, utilizing the `Testimonial_pic.png`, `avatar_pic.png`, and `blue_quote.png` assets. The section background is configured as solid white, with cards styled in contrasting light-grey.
- Overhauled `FAQ` component to feature a two-column desktop grid with a titles section and a still-have-questions card (integrating clipboard copy behavior for `info@rolr.com`) on the left, and a stack of interactive accordions that expand and show brand borders on the right. Reordered the FAQ section to render directly after Testimonials.
- Verified that the background color of the CTA banner section is styled with `bg-white` (with `dark:bg-slate-950` fallback) for appropriate contrast and transition flow.

## Update - 2026-06-27

### Summary
Redesigned the Hero section with background Ellipse decorative outline assets (`Ellipse 13.png`, `Ellipse 14.png`) and updated the layout to render the new collage image `hero_pics_2.png`. Widened the landing page container space by changing the maximum layout width constraint from `max-w-7xl` to `max-w-[1440px]` across all components (floating navbar, footer, and sections) to match the screen layout width of the Figma mockup. Applied vibrant left-to-right background-clipped text gradients to the hero heading text spans and repositioned the decorative background ellipses to be relative to the outer container.

### Modifications
- **[Hero.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/Hero.tsx)** (Lines 5-97): Shifted container padding, updated container width to `max-w-[1440px]`, placed background Ellipse images inside the relative left content column with exact offsets, applied text gradient colors to both heading spans, and rendered the collage image `hero_pics_2.png`.
- **[SiteNavbar.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/shared/SiteNavbar.tsx)** (Line 14): Increased floating card container max-width to `max-w-[1440px]`.
- **[SiteFooter.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/shared/SiteFooter.tsx)** (Line 14): Increased footer layout container max-width to `max-w-[1440px]`.
- **[Features.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/Features.tsx)** (Line 30): Increased features layout container max-width to `max-w-[1440px]`.
- **[HowItWorks.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/HowItWorks.tsx)** (Line 34): Increased how-it-works layout container max-width to `max-w-[1440px]`.
- **[Testimonials.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/Testimonials.tsx)** (Line 7): Increased testimonials layout container max-width to `max-w-[1440px]`.
- **[FAQ.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/FAQ.tsx)** (Line 46): Increased FAQ layout container max-width to `max-w-[1440px]`.
- **[CTABanner.tsx](file:///C:/Users/User/Desktop/workswipe_client/components/landing/CTABanner.tsx)** (Line 6): Increased CTA Banner layout container max-width to `max-w-[1440px]`.

## Commit Draft - Short
`style: widen landing page layout to 1440px and style hero text gradients and background ellipses`

## Commit Draft - Long
- Swapped the landing page container max-width classes from `max-w-7xl` to `max-w-[1440px]` on the Navbar, Hero, Features, How It Works, Testimonials, FAQ, CTABanner, and Footer.
- Applied horizontal text gradients to both spans of the primary Hero heading.
- Positioned the `Ellipse 13` and `Ellipse 14` background assets absolutely relative to the relative left content column to wrap the heading text and CTA buttons perfectly.





