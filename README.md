# OweLess Cinematic 2.0

An **isolated proof of concept** for a living OweLess Pathfinder homepage. This project deliberately **does not** modify Bubble, production domains, the existing OweLess app, or the `main` branch of any existing GitHub repository.

## Stack

- React 19 + Vite 7 for the frontend
- Three.js / React Three Fiber for WebGL terrain, road geometry, city, blossom trees, instanced petals, atmospheric depth and responsive pointer parallax
- GSAP ScrollTrigger for milestone and section choreography
- Rive reserved for future interactive Pathfinder state animations, **not integrated yet** (no `.riv` asset or motion state machine has been approved)
- Scoped CSS, low-power mobile mode and `prefers-reduced-motion` support

## Run locally

`npm install && npm run dev`

For a production build: `npm run build`. The Vercel framework preset is **Vite** and the output directory is `dist`.

## Preview limitations and integration

- The initial scene contains real animated 3D geometry; the skyline image is an atmospheric backdrop, **not** an animated copy of the previous flattened page.
- The four milestone illustrations are individual crops from the approved visual concept. They are images, not interactive Rive assets yet.
- The "Find My Path" links deliberately open the **existing Bubble test Pathfinder** (`/version-test/cinematic-pathfinder`). Actual auth, lead capture, debt data, and financial advice workflows are **not** connected to this preview.
- Graphic quality is reduced on mobile. If WebGL2 is unavailable, the background image and HTML storytelling remain accessible.
- No product or financial outcome guarantees are made.

## Visual QA checklist

Check Android Chrome, iOS Safari, desktop Chromium; GSAP entrance animations; reduced motion; road glow exactly on road geometry; link destinations; slow mobile devices and graceful WebGL fallback. The deployment must be visually inspected before considering this production ready.