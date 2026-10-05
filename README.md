# LTR website

A standalone HTML/CSS/JavaScript website for Lighting the Rain Transform. No build step, npm dependencies, CDN requests, or framework required.

From this directory, run:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://localhost:8080. You can also open `index.html` directly; if clipboard access is unavailable, Copy selects the command for manual copying.

The opening animation scales three dark-orange logo boxes. The main CSS 3D sculpture responds to scrolling and pointer movement, supports dragging, and has keyboard-accessible Rotate and Separate buttons. Component tabs support arrow keys, Home and End. Architecture controls change the real build command and expected output path. Reduced-motion preferences and a manual motion toggle disable ambient animation; direct object controls remain available.

The SVG mark follows the triangle and trailing stroke in `fetch/fetch.c`. Space Grotesk is bundled under the SIL Open Font License in `assets/OFL.txt`. Content reflects the root README's boot-core development profile, not a production release. No public ISO URL was provided, so the main action leads to build instructions.

Host the contents of this folder with any static web server. No distribution build scripts or disk tools are invoked by this website.
