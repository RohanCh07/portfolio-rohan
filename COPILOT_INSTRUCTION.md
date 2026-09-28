# Copilot Instructions: 3D Portfolio

## Start of every session
1. Read `README.md` (full plan, theme, scene map, phases).
2. Read `PROGRESS.md` (current phase, what is done, next task, known issues).
3. Work only on the task the user gives. Do not jump ahead to later phases.

## End of every task
Update `PROGRESS.md`: tick finished items, set the "Next task", add any new
decisions or known issues, and add one line to the session log.

## Stack (strict)
- Plain HTML, CSS and JavaScript with ES modules. three.js and GSAP are
  loaded from CDN through the import map in `index.html`.
- Do NOT introduce React, Vite, npm, bundlers, TypeScript, or any new
  library without asking first.
- Run with a local static server (VS Code Live Server).

## Architecture rules
- One module per scene object in `src/scene/`, exporting `createX()` that
  returns a `THREE.Group`. Name interactive meshes/groups clearly
  ("monitor", "shelf", "board", "phone", "resume").
- All colors, fonts and timings come from `src/theme.js`. Never hardcode them.
- All text and project data come from `src/content.js`. Never hardcode them.
- Shared state lives in `src/store.js` (getState / setState / subscribe).
- Text, links and project details are HTML overlays in `src/ui/`, not 3D text.
- Camera stops are defined in one config; movement is eased (0.8 to 1.4 s),
  never snapping.
- Dispose of geometries, materials and listeners when removing objects.

## Style
- Keep files small and focused. Short comments explaining "why".
- Keep layout/position numbers in one config object at the top of a file.
- Only edit the files needed for the task. Do not reformat or rewrite
  unrelated files.
- Do not break existing features: after changes, check the browser console
  for errors and confirm earlier phases still work.

## Performance
- Cap pixel ratio at 2. Reuse geometries and materials where possible.
- Keep GLB models Draco-compressed, total under about 5 MB.
- Respect `prefers-reduced-motion` and the device-tier fallback.