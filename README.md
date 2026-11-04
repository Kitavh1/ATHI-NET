# ATHINET Corporate Website

The main ATHINET website is a static, responsive corporate homepage built with HTML, CSS, and vanilla JavaScript. It introduces ATHINET's technology areas, preserves the home internet package and coverage enquiry flows, and links to the independent Services and Products websites.

## Project structure

- `index.html` — corporate homepage, internet packages, coverage/contact forms, and SEO metadata
- `css/style.css` — brand styles, page layouts, responsive rules, and accessibility details
- `js/script.js` — mobile navigation, package enquiries, coverage checks, contact flow, FAQ, and ATHINET AI Assistant
- `assets/images/Athinet.logo.jpeg` — official ATHINET logo
- `robots.txt` — crawler access and main-site sitemap location
- `sitemap.xml` — homepage sitemap for `https://athinet.co.ke/`

## Run locally

Open `index.html` in a browser or run a local static server:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Related ATHINET websites

- Main corporate website: <https://athinet.co.ke/>
- Professional services: <https://services.athinet.co.ke/>
- Products and applications: <https://products.athinet.co.ke/>

## Enquiry handling

The internet coverage, package, and contact forms prepare WhatsApp message drafts for visitors to review and send. This static site does not store or submit form data to a backend.

The ATHINET AI Assistant is a rule-based interface using published website information and local knowledge in `js/script.js`. It does not send or persist chat messages.

## Deployment

The site is compatible with GitHub Pages and other static hosts. Keep the canonical URL, Open Graph metadata, `robots.txt`, and `sitemap.xml` aligned with the published main-site domain.
