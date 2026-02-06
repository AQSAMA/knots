# Plan

## Goal
Ensure the settings panel (equation inputs) is visible without covering the knot, especially on mobile.

## Steps
1. Review the current overlay positioning in `Overlay.svelte` and note where it overlaps the knot.
2. Update the settings panel layout to sit out of the knot's center view and constrain height with scrolling on smaller screens.
3. Capture a UI screenshot demonstrating the updated layout.
4. Run the existing lint/check/build scripts to validate changes.
