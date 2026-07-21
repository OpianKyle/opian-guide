import nodemailer from "nodemailer";

const host = process.env["SMTP_HOST"];
const port = Number(process.env["SMTP_PORT"] || 993);
const user = process.env["SMTP_USER"];
const pass = process.env["SMTP_PASS"];
const fromName = process.env["SMTP_FROM_NAME"] || "Opian";
const fromEmail = process.env["SMTP_FROM_EMAIL"] || user;

// Transporter is created lazily so that missing SMTP env vars don't crash the
// server on startup — only routes that actually send mail will fail.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;
  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set.");
  }
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
  return _transporter;
}

export const FROM = `"${fromName}" <${fromEmail}>`;

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await getTransporter().sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
