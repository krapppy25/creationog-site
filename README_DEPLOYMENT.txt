CREATION OG — DIGITAL INSTRUMENT v0.1-alpha QA-ONLY

STATUS
- QA mode only.
- Evidence eligibility is hard-coded to NO.
- There is no remote submission/storage in this build.
- Completed QA traversals can be downloaded as JSON.
- No live research mode exists.

PROPOSED URLS
- https://www.creationog.com/
- https://www.creationog.com/experiment-001a/

DEPLOYMENT
This is a static site. It can be hosted on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or ordinary web hosting.
For QA, no backend is required.

BEFORE LIVE PILOT
A future version would need a separately authorized backend/data store, ethics/oversight review as applicable, immutable raw-data handling, and a distinct evidence-eligible mode. Do not repurpose QA records as evidence.

FILES
index.html                         Creation OG starter landing page
assets/site.css                    Shared visual system
experiment-001a/index.html         QA experiment shell
experiment-001a/app.js             Experiment engine and QA-only data capture
