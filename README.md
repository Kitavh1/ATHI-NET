# ATHINET website

A static, mobile-responsive business website for ATHINET, built with HTML5, CSS3, and vanilla JavaScript.

## Project structure

- `index.html` — page structure and content
- `services.html` — dedicated Services page for ATHINET connectivity and professional technology offerings
- `css/style.css` — design system, layout, responsive styling, and accessibility tweaks
- `js/script.js` — mobile navigation, package modal handling, form validation, FAQ behavior, WhatsApp enquiries, service quote handoff, and the local ATHINET chat assistant knowledge base
- `assets/images/` — official ATHINET logo and advertisement
- `robots.txt` — crawler access and sitemap location
- `sitemap.xml` — sitemap entries for the published pages

## Brand assets

- `assets/images/Athinet.logo.jpeg` — ATHINET logo
- `assets/images/Athinet.advert.jpeg` — ATHINET internet advertisement

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

The Services page uses `https://athinet.co.ke/services.html` as its canonical URL. Keep the sitemap, `robots.txt`, and page canonical metadata aligned if the deployed domain changes.

## ATHINET chat assistant

The ATHINET AI Assistant widget is a rule-based chat interface, not a generative AI service. It answers using the information published on the site and the centralized knowledge in `js/script.js`; professional technical offerings are distinguished from the currently published home internet service and remain subject to confirmed ATHINET arrangements. Chat messages are not persisted or sent to ATHINET. Do not put AI provider keys in this static site.

## Service enquiries

The Services page quotation form requires consent before its fields are enabled. Submitting prepares a prefilled WhatsApp message; the visitor reviews and sends it. The static site has no configured enquiry backend and does not store submissions. Configure a secure server-side form endpoint before changing the flow to claim server submission or storage.

## Business details to confirm before launch

- Final package pricing and any terms that may apply
- Coverage and service area details
- Installation conditions and approval process
- Preferred contact workflow for enquiries and customer support
