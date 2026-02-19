# Sakeena Jacobs Recruitment — Website

**Company:** Sakeena Jacobs Recruitment (Pty) Ltd  
**Registration:** 2018/341619/07  
**Domain:** sakeenajacobsrecruitment.com  

---

## Project Structure

```
/
├── index.html              ← Main landing page (GitHub Pages)
├── privacy-policy.html     ← Privacy Policy page
├── terms.html              ← Terms of Service page
├── sitemap.xml             ← SEO sitemap
├── robots.txt              ← Search engine directives
├── vercel.json             ← Vercel deployment config
├── package.json            ← Node.js dependencies
├── README.md               ← This file
└── api/
    └── submit-lead.js      ← Vercel serverless function
```

---

## Deployment

### Frontend — GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your site will be live at `https://yourusername.github.io/repo-name`
5. Configure your custom domain `sakeenajacobsrecruitment.com` in Pages settings
6. Add a `CNAME` file with `sakeenajacobsrecruitment.com` as content

### Backend — Vercel (Serverless API)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root and follow prompts
3. Set environment variables in the Vercel Dashboard:

```
SMTP_HOST=your-smtp-host         (e.g. smtp.gmail.com or mail.yourdomain.com)
SMTP_PORT=587                    (587 for TLS, 465 for SSL)
SMTP_USER=info@sakeenajacobsrecruitment.com
SMTP_PASS=your-smtp-password-or-app-password
```

4. Deploy to production: `vercel --prod`
5. Note your Vercel deployment URL (e.g. `https://sakeena-jacobs.vercel.app`)

### Connecting Frontend to Backend

In `index.html`, the form posts to `/api/submit-lead`. For GitHub Pages + Vercel:

**Option A — Custom Domain on Vercel too:**
Point `api.sakeenajacobsrecruitment.com` to your Vercel deployment and update the fetch URL:
```js
const response = await fetch('https://api.sakeenajacobsrecruitment.com/api/submit-lead', { ... });
```

**Option B — Direct Vercel URL:**
Update the fetch URL in `index.html` to your full Vercel URL:
```js
const response = await fetch('https://sakeena-jacobs.vercel.app/api/submit-lead', { ... });
```

Also update CORS allowed origins in `api/submit-lead.js` accordingly.

---

## Environment Variables Reference

| Variable     | Description                              | Example                          |
|-------------|------------------------------------------|----------------------------------|
| `SMTP_HOST` | SMTP server hostname                     | `smtp.gmail.com`                 |
| `SMTP_PORT` | SMTP port (587 or 465)                   | `587`                            |
| `SMTP_USER` | SMTP authentication email                | `info@sakeenajacobsrecruitment.com` |
| `SMTP_PASS` | SMTP password or app password            | `your-app-password`              |

> **Note:** Never commit environment variables to Git. Use `.env` locally (add to `.gitignore`) and the Vercel dashboard for production.

---

## Gmail SMTP Setup (if using Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a new App Password for "Mail"
4. Use `smtp.gmail.com`, port `587`, and the generated App Password as `SMTP_PASS`

---

## Local Development

```bash
npm install
vercel dev          # Runs locally with serverless functions
```

Visit `http://localhost:3000`

---

## Email Destinations

Lead form submissions are sent to:
- **To:** info@sakeenajacobsrecruitment.com
- **CC:** recruitment@sakeenajacobsrecruitment.com

---

## Security Features

- ✅ Honeypot spam protection
- ✅ Server-side input sanitization
- ✅ Server-side validation
- ✅ Rate limiting (3 requests/minute per IP)
- ✅ Client-side rate limiting (1 minute cooldown)
- ✅ CORS restrictions to known domains
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ HTTPS enforced via Vercel / GitHub Pages
- ✅ No sensitive data logged

---

## SEO Checklist

- ✅ Meta title & description
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Organization structured data (JSON-LD)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Semantic HTML5 with ARIA labels
- ✅ Fast-loading (no heavy dependencies)

---

## Contact

- **General:** info@sakeenajacobsrecruitment.com
- **Recruitment:** recruitment@sakeenajacobsrecruitment.com
- **Direct:** sj@sakeenajacobsrecruitment.com

---

*© 2025 Sakeena Jacobs Recruitment (Pty) Ltd — Reg. No: 2018/341619/07*
