# Rizky Pangestu — Portfolio

A lightweight, editorial-style one-page portfolio using **HTML, CSS, vanilla JavaScript and JSON**. No build step, framework, CDN JavaScript, tracking, or dependencies. Fonts are loaded from Google Fonts with local system fallbacks.

## Run locally

JSON is loaded with `fetch()`, so opening `index.html` via `file://` may fail in browsers. Run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

For deployment, upload the entire directory to GitHub Pages, Netlify, Cloudflare Pages or any static host. Do not upload the ZIP itself as the website root.

## Edit content

Open `data/content.json` to update name, bio, work experience, skill categories, project links, education, contact details and CV. No HTML editing needed for these items.

**Add a project:** Insert an object in the `projects` array (remove the empty `[]`):

```json
{
  "name": "Your actual project name",
  "type": "Backend / Personal project",
  "description": "What you built, the problem solved, and what you personally contributed.",
  "stack": ["Go", "PostgreSQL"],
  "url": "https://your-live-demo.example",
  "repository": "https://github.com/yourname/your-repository"
}
```

Projects with missing `url` or `repository` simply don't display that link. Only publish work you are permitted to disclose.

**Contact:** Email and GitHub are empty intentionally until you provide your actual details. Add a public CV path to `profile.resume` if you have a file.

## Content verification

Professional profile info was sourced from the publicly indexed LinkedIn profile provided by the owner (accessed October 12, 2026). Work experience is paraphrased; no client or project outcomes were invented. Personal projects were not verifiable and are **not included**. The profile's availability statement and editorial about-copy should be reviewed by the owner before publishing. Degree naming and graduation status should also be double checked against your current CV.

Reference: https://www.linkedin.com/in/muhammad-rizky-pangestu-691a28276/

## Design decisions

- Warm paper background, dark text, copper accent
- Mixed sans-serif + restrained italic serif typography
- Clear hierarchy, dense but readable project and work sections
- Native anchor scrolling, zero gratuitous animations
- Mobile layout, semantic HTML, keyboard navigation, reduced-motion support
- Project data rendered safely with `textContent` (not untrusted `innerHTML`)
