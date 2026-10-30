# Hrithika Patalay — portfolio

A static website. No build step, no paid services.

## Files
- `index.html` — the page structure
- `styles.css` — the design
- `app.js` — the interactive parts (capability index, filters, project pages)
- `motion.js` — animations: intro, smooth scroll, cursor, reveals, page transitions
- `assets/vendor/` — GSAP and Lenis animation libraries (free, bundled)
- `data.js` — **all the text, grades and projects**. Edit this file to change content.
- `reports/` — the full PDF report for every project
- `assets/` — fonts and the CV download

## Publish on GitHub Pages (free)
1. Sign in to GitHub.
2. Create a new repository named exactly `hrithikapatalay.github.io` and set it to **Public**.
3. On the empty repository page, click **uploading an existing file**.
4. Drag in everything **inside** this folder (index.html must sit at the top level, not inside another folder). Click **Commit changes**.
5. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
6. After one or two minutes the site is live at `https://hrithikapatalay.github.io`.

## Adding a project later
1. Put its PDF in `reports/` with a short lowercase name, e.g. `new-project.pdf`.
2. In `data.js`, copy one block inside `window.PROJECTS`, change the text, and set `pdf: "new-project.pdf"`.
3. Upload both changed files to GitHub. The site updates in a minute or two.
