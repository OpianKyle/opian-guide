import nodemailer from "nodemailer";

const host = process.env["SMTP_HOST"];
const port = Number(process.env["SMTP_PORT"] || 993);
const user = process.env["SMTP_USER"];
const pass = process.env["SMTP_PASS"];
const fromName = process.env["SMTP_FROM_NAME"] || "Opian";
const fromEmail = process.env["SMTP_FROM_EMAIL"] || user;

if (!host || !user || !pass) {
  throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set.");
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: true, // SSL/TLS
  auth: { user, pass },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certs common on cPanel hosts
  },
});

export const FROM = `"${fromName}" <${fromEmail}>`;

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
