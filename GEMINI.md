# Knots Project Context

## Overview
**Knots** is a web-based application built to visualize mathematical knots defined by parametric equations in a 3D space. It allows users to manipulate equations for coordinates (x, y, z), adjust visual properties like thickness and color, and animate the formation of the knot.

## Technology Stack
- **Framework:** [React](https://react.dev/) (v19)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **3D Rendering:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Math Evaluation:** [mathjs](https://mathjs.org/)

## Key Files & Architecture

### Core Components
*   **`src/App.tsx`**: The main application controller. It manages the global state, including:
    *   Parametric equations (`xEq`, `yEq`, `zEq`).
    *   Visual settings (`thickness`, `color`).
    *   Animation state (`growth`, `isPlaying`).
*   **`src/components/Sidebar.tsx`**: The user interface for controlling application state. Contains inputs for equations and sliders for visual properties.
*   **`src/components/Scene.tsx`**: A wrapper for the Three.js `Canvas`. Sets up lighting, camera controls (`OrbitControls`), and the environment.
*   **`src/components/Knot.tsx`**: The core 3D component.
    *   Uses `utils/math.ts` to generate 3D points from the string equations.
    *   Creates a `CatmullRomCurve3` from these points.
    *   Renders a `tubeGeometry` mesh based on the curve.
    *   Handles the "growth" animation by dynamically slicing the points array.

### Utilities
*   **`src/utils/math.ts`**: Contains the logic for parsing user-provided string equations (e.g., "sin(t)") into numerical coordinates using `mathjs`.

## Development Workflow

### Prerequisites
Ensure Node.js is installed.

### Scripts
*   **Start Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
    *This runs `tsc` (TypeScript compiler) followed by `vite build`.*
*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

## Conventions
*   **Styling:** Basic layout uses inline styles (flexbox) for the split-screen view (Sidebar/Scene).
*   **State Management:** React `useState` and props drilling are currently used for state management.
*   **3D Logic:** 3D logic is encapsulated within the `Canvas` in `Scene.tsx` and `Knot.tsx`.
*   **Math Parsing:** All raw string evaluation happens in the utility layer to keep components clean.
