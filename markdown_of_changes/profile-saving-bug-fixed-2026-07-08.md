# Profile Saving Bug Fixed - 2026-07-08

## Date
2026-07-08

## Summary
Fixed a bug in the candidate profile edit form where editing and saving any profile section other than the "Basic Information" section would overwrite and empty the user's first name, last name, and location in the database.

## Modifications
- **[page.tsx (Candidate Profile)](file:///c:/Users/User/Desktop/workswipe_client/app/candidate/profile/page.tsx)** (Lines 176-193): Overhauled the `saveSection` logic. Instead of creating a payload with only the specific section's fields (which led the backend to clear the omitted fields), the payload now merges the edits with the existing `candidateProfile` object. Excluded read-only/metadata properties (`_id`, `user_id`, `created_at`, `updated_at`, `identity`, `profile_image_url`, `resume_url`, `voice_intro_url`, `video_intro_url`, `audio_url`) from the payload.

## Commit Draft - Short
`fix: preserve profile fields during section updates`

## Commit Draft - Long
`Updated the profile saveSection logic to merge section edits with the existing candidate profile data. This prevents fields like first name, last name, and location from being cleared by the backend when updating other sections of the profile.`
