# Feature Proposal Plan

This document outlines the proposed 6 features for the next iteration of **Svelte Knots**.

## 1. Functional Features

### A. URL State Sharing (Deep Linking)
**Why:** Essential for a "Showcase" or "Tool" hosted on GitHub Pages.
**How:**
-   Create a utility `urlParams.ts`.
-   On change of `knotState`, update `window.location.hash` (debounced).
-   On load, parse hash and hydrate `knotState`.
-   **Benefit:** Users can bookmark or share their specific knot creations.

### B. Audio Reactivity ("Pulse")
**Why:** Fits the "Endless Tools" creative toy aesthetic perfectly. Adds a "wow" factor.
**How:**
-   Use Web Audio API to get an AnalyzerNode.
-   Map frequency data to `tubeRadius` or a displacement modifier in the geometry.
-   Add a toggle button in the Capsule Bar to "Enable Audio".

### C. Loop Recorder
**Why:** Static screenshots are okay, but knots are about *motion*.
**How:**
-   Use `canvas.captureStream()` and `MediaRecorder` API.
-   Allow capturing a 5-10 second webm/mp4 loop.
-   Download automatically.

## 2. Design/Visual Features

### A. Cinematic Post-Processing
**Why:** The current look is clean but flat. "Bloom" makes neon lines look real.
**How:**
-   Use `@threlte/extras` `<EffectComposer>` with `<Bloom>` and maybe faint `<Noise>`.
-   Gives that "high-end software" feel.

### B. Matcap Materials (Chrome/Liquid)
**Why:** Solid colors are limiting. Knots look amazing in Chrome or Iridescent materials.
**How:**
-   Load a set of standard Matcap textures.
-   Replace `MeshPhysicalMaterial` with `MeshMatcapMaterial`.
-   Add a "Texture" selector in the Customize panel.

### C. Gradient Coloring
**Why:** Visualizing the "flow" of the knot is easier with gradients.
**How:**
-   Map UVs along the tube length.
-   Use a custom shader material or a texture gradient to color the tube from start to end (e.g., Blue -> Purple -> Pink).

## Approval Process
Waiting for user selection. Recommended start: **URL Sharing** (high utility) and **Post-Processing** (high visual impact).
