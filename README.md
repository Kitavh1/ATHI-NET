# ATHINET Corporate Website

The main ATHINET website is a static, responsive corporate homepage built with HTML, CSS, and vanilla JavaScript. It introduces ATHINET's technology areas, preserves the home internet package and coverage enquiry flows, and links to the independent Services and Products websites.

## Project structure

- `index.html` — corporate homepage, internet packages, coverage/contact forms, and SEO metadata
- `careers.html` — data-driven vacancies, vacancy detail dialog, and application entry point
- `privacy.html` — recruitment privacy notice
- `recruitment-admin.html` — authenticated vacancy and candidate administration
- `css/style.css` — brand styles, page layouts, responsive rules, and accessibility details
- `css/careers.css` — careers, privacy, and recruitment administration styles
- `js/script.js` — homepage navigation, package enquiries, contact flow, and ATHINET AI Assistant
- `js/jobs-data.js` — static fallback job advertisements; do not put applicant data here
- `js/recruitment-config.js` — public Supabase URL/anon key and Cloudflare Turnstile site key
- `js/careers.js` — vacancy rendering and application client
- `js/recruitment-admin.js` — authenticated recruitment administration client
- `supabase/migrations/202611080001_recruitment.sql` — recruitment schema, RLS policies, private bucket and initial vacancy
- `supabase/functions/apply/index.ts` — validated application intake, private document storage, and optional notification
- `assets/images/Athinet.logo.jpeg` — official ATHINET logo
- `robots.txt` — crawler access and sitemap location
- `sitemap.xml` — public home, careers and privacy pages

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

## Recruitment system

The careers page is integrated with the existing static site. The initial customer-care vacancy uses the supplied details only; its department, location, employment type, number of positions, experience, and skills are left unspecified rather than inferred. There is no `JobPosting` structured data until vacancy facts required for accurate job-search markup are available.

With no recruitment backend configured, open vacancies use a clearly labelled email application link. Closed or expired vacancies have no application route. No application details or documents are stored in the browser. The online form only appears after its public configuration points to an operational Supabase project, deployed Edge Function, and Cloudflare Turnstile site key.

### Secure backend deployment

1. Create a Supabase project owned by ATHINET and run `supabase/migrations/202611080001_recruitment.sql` in its SQL editor. Review the migration for the target project before applying it.
2. Link the CLI to the ATHINET project with `supabase link --project-ref <project-ref>`, then deploy the application function with `supabase functions deploy apply`.
3. Configure the Edge Function secrets outside the repository. Required: `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, and `SITE_ORIGIN` (for example, `https://athinet.co.ke`). Optional email notifications: `RESEND_API_KEY` and `RECRUITMENT_FROM_EMAIL`. The sender domain must be verified with Resend. The service-role key and Turnstile secret must never be added to client JavaScript, GitHub Pages settings, or committed files.
4. Create a Cloudflare Turnstile widget for the production domain. Set only the public `supabaseUrl`, public anon/publishable key, and Turnstile site key in `js/recruitment-config.js`. Keep this file unconfigured until the backend function and secrets are deployed.
5. In Supabase Auth, create or invite an administrator account. Add its Auth user UUID to `public.recruitment_admins` using the Supabase SQL editor. Only those users pass the administrator check; RLS restricts candidate and document access. Do not create a public administrator signup flow.
6. Configure a staging Supabase project and Turnstile test keys. Test a complete staged application, PDF/DOCX rejection and size boundaries, duplicate retries, deadline closure, notification delivery, and admin access before enabling production keys.
7. Test a production notification to `athinet72@gmail.com`. Emails contain applicant name, role, reference, submission date, and contact email only; they do not contain CV content or public document links. If Resend is not configured, applications are stored but notification emails are not sent.
8. Update the privacy notice and retention practices to ATHINET's approved policy, deploy the static changes to GitHub Pages, and verify the site over its production domain.

The migration creates `jobs`, `recruitment_admins`, `applications`, and `application_documents`. The private `recruitment-documents` storage bucket has no public access. Public users can read only published, open, unexpired jobs. Only authenticated recruitment administrators can read candidate records or generate 60-second signed document URLs. Applications are inserted only by the Edge Function using its server-side service key. The admin interface supports vacancy creation/editing/status, application search across the most recently loaded 500 records, review, status updates, and short-lived private document access.

Supabase and email accounts, domain verification, production secrets, staging credentials, and administrator identities are external ATHINET-owned configuration. They are intentionally not included in this repository. Do not claim online applications or email notifications are operational until the complete staging and production checks succeed.

## Deployment

The site is compatible with GitHub Pages and other static hosts. Keep the canonical URL, Open Graph metadata, `robots.txt`, and `sitemap.xml` aligned with the published main-site domain.
