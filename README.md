# ATHINET website

A static, mobile-responsive business website for ATHINET, built with HTML5, CSS3, and vanilla JavaScript.

## Project structure

- `index.html` — page structure and content
- `css/style.css` — design system, layout, responsive styling, and accessibility tweaks
- `js/script.js` — mobile navigation, package modal handling, form validation, FAQ behavior, and WhatsApp generation
- `assets/images/` — place the official ATHINET logo and advertisement images here
- `robots.txt` — placeholder SEO configuration
- `sitemap.xml` — placeholder sitemap entry for the final domain

## Required image files

The supplied ATHINET logo and advertising poster were not found in the workspace. Place them here before deployment:

- `assets/images/athinet-logo.png`
- `assets/images/athinet-advertisement.jpg`

The site already includes fallback UI if these files are missing, but the official branding should be restored by adding the real files.

## Run locally

Open `index.html` directly in a browser, or serve the folder with a simple local web server:

```bash
cd "C:\Users\bmumo\OneDrive\Desktop\Athi net"
python -m http.server 8000
```

Then visit: `http://localhost:8000`

## Deployment

This is a static website and can be deployed to:

- GitHub Pages
- Netlify
- Any static web host

When deploying, update the `og:url` and the placeholder domain in `robots.txt` and `sitemap.xml` to your final live domain.

## Business details to confirm before launch

- Final package pricing and any terms that may apply
- Coverage and service area details
- Installation conditions and approval process
- Preferred contact workflow for enquiries and customer support
