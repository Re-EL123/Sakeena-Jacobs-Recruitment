// /api/submit-lead.js
// Vercel Serverless Function — Node.js 20
// Lead form submission handler for Sakeena Jacobs Recruitment

const nodemailer = require('nodemailer');

// ── Rate Limiting (in-memory, resets on cold start) ──────────────
const requestLog = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 requests per IP per minute

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!requestLog.has(ip)) {
    requestLog.set(ip, []);
  }

  // Clean old entries
  const timestamps = requestLog.get(ip).filter(t => t > windowStart);
  requestLog.set(ip, timestamps);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
}

// ── Input Sanitization ────────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 2000);
}

// ── Email HTML Template ────────────────────────────────────────────
function buildEmailHTML({ name, company, email, role, message }) {
  const timestamp = new Date().toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead — Sakeena Jacobs Recruitment</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #F2F2F2; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2B2B2B 0%, #5C3D3D 60%, #A56A6A 100%); padding: 36px 40px; }
    .header h1 { margin: 0; font-size: 22px; color: #fff; font-weight: 600; letter-spacing: 0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.6); letter-spacing: 0.05em; text-transform: uppercase; }
    .body { padding: 36px 40px; }
    .alert { background: #FFF5F5; border-left: 3px solid #A56A6A; padding: 12px 16px; margin-bottom: 28px; border-radius: 0 4px 4px 0; }
    .alert p { margin: 0; font-size: 13px; color: #6E3F3F; font-weight: 500; }
    .field { margin-bottom: 20px; }
    .field label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #B8B0AE; margin-bottom: 6px; }
    .field .value { font-size: 15px; color: #2B2B2B; font-weight: 500; }
    .field .message-value { font-size: 14px; color: #4A4A4A; line-height: 1.7; background: #F9F7F7; border-radius: 4px; padding: 14px 16px; border: 1px solid #E2D8D8; }
    .divider { border: none; border-top: 1px solid #E8D6D6; margin: 24px 0; }
    .footer-bar { background: #F9F7F7; padding: 20px 40px; border-top: 1px solid #E8D6D6; }
    .footer-bar p { margin: 0; font-size: 11px; color: #B8B0AE; }
    .badge { display: inline-block; background: #E8D6D6; color: #6E3F3F; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 100px; margin-left: 6px; }
    .reply-btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #A56A6A; color: #fff; text-decoration: none; border-radius: 3px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>New Recruitment Lead</h1>
        <p>Sakeena Jacobs Recruitment &bull; Lead Notification</p>
      </div>
      <div class="body">
        <div class="alert">
          <p>⚡ A new lead has been submitted via the website contact form. Please respond within 48 hours.</p>
        </div>

        <div class="field">
          <label>Full Name</label>
          <div class="value">${name}</div>
        </div>

        <div class="field">
          <label>Company</label>
          <div class="value">${company}</div>
        </div>

        <div class="field">
          <label>Email Address</label>
          <div class="value"><a href="mailto:${email}" style="color:#A56A6A;">${email}</a></div>
        </div>

        <div class="field">
          <label>Role Required <span class="badge">Priority</span></label>
          <div class="value">${role}</div>
        </div>

        <hr class="divider" />

        <div class="field">
          <label>Message / Requirements</label>
          <div class="message-value">${message || '<em style="color:#B8B0AE;">No message provided.</em>'}</div>
        </div>

        <a href="mailto:${email}?subject=Re: Your Recruitment Enquiry — Sakeena Jacobs Recruitment" class="reply-btn">
          Reply to ${name.split(' ')[0]}
        </a>
      </div>
      <div class="footer-bar">
        <p><strong>Received:</strong> ${timestamp}</p>
        <p style="margin-top:4px;">SAKEENA JACOBS RECRUITMENT (Pty) Ltd &bull; Reg. No: 2018/341619/07</p>
        <p style="margin-top:4px;">This is an automated notification. Do not reply to this email directly.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ── CORS Headers ──────────────────────────────────────────────────
function setCorsHeaders(res, origin) {
  const allowed = [
    'https://sakeenajacobsrecruitment.com',
    'https://www.sakeenajacobsrecruitment.com',
  ];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}

// ── Main Handler ──────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  setCorsHeaders(res, origin);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait and try again.' });
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Honeypot check
  if (body.website) {
    // Silent success for bots
    return res.status(200).json({ success: true });
  }

  // Sanitize inputs
  const name = sanitize(body.name || '');
  const company = sanitize(body.company || '');
  const email = sanitize(body.email || '');
  const role = sanitize(body.role || '');
  const message = sanitize(body.message || '');

  // Server-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || name.length < 2) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }
  if (!company || company.length < 2) {
    return res.status(400).json({ success: false, message: 'Company name is required.' });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }
  if (!role) {
    return res.status(400).json({ success: false, message: 'Role is required.' });
  }

  // Validate required environment variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP environment variables.');
    return res.status(500).json({ success: false, message: 'Server configuration error. Please contact us directly.' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: true },
  });

  // Build email
  const mailOptions = {
    from: `"Sakeena Jacobs Recruitment — Lead Form" <${process.env.SMTP_USER}>`,
    to: 'info@sakeenajacobsrecruitment.com',
    cc: 'recruitment@sakeenajacobsrecruitment.com',
    replyTo: email,
    subject: `New Recruitment Lead: ${role} — ${company}`,
    html: buildEmailHTML({ name, company, email, role, message }),
    text: `New lead from ${name} (${company})\nEmail: ${email}\nRole: ${role}\nMessage: ${message}`,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Lead submitted: ${name} | ${company} | ${role} | ${new Date().toISOString()}`);
    return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
  } catch (err) {
    console.error('Email send error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send. Please try again or contact us directly.' });
  }
};
