import { Router, type IRouter } from "express";
import {
  SubmitContactMessageBody,
  SubmitContactMessageResponse,
} from "@workspace/api-zod";
import { sendMail } from "../lib/mailer";

const router: IRouter = Router();
const recipient = "info@myifa.co.za";
const rateLimitWindowMs = 15 * 60 * 1000;
const maxMessagesPerWindow = 5;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function isRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  if (requestsByIp.size > 5000) {
    for (const [key, record] of requestsByIp) {
      if (record.resetAt <= now) requestsByIp.delete(key);
    }
    while (requestsByIp.size > 5000) {
      const oldestKey = requestsByIp.keys().next().value;
      if (oldestKey === undefined) break;
      requestsByIp.delete(oldestKey);
    }
  }

  const current = requestsByIp.get(ipAddress);

  if (!current || current.resetAt <= now) {
    requestsByIp.set(ipAddress, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  if (current.count >= maxMessagesPerWindow) return true;
  current.count += 1;
  return false;
}

router.post("/contact-us", async (req, res): Promise<void> => {
  const parsed = SubmitContactMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your name, email address, topic and message." });
    return;
  }

  const fullName = parsed.data.fullName.trim();
  const email = parsed.data.email.trim();
  const topic = parsed.data.topic;
  const priorities = parsed.data.priorities ?? [];
  const message = parsed.data.message.trim();
  const website = parsed.data.website;

  if (fullName.length < 2 || message.length < 10) {
    res.status(400).json({ error: "Please enter your name and a message of at least 10 characters." });
    return;
  }

  if (website?.trim()) {
    // Silently accept automated submissions caught by the honeypot.
    res.json(SubmitContactMessageResponse.parse({
      message: "Thank you. Your message has been received.",
    }));
    return;
  }

  const ipAddress = req.ip || "unknown";
  if (isRateLimited(ipAddress)) {
    res.setHeader("Retry-After", String(Math.ceil(rateLimitWindowMs / 1000)));
    res.status(429).json({ error: "Too many messages were sent. Please try again in 15 minutes." });
    return;
  }

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePriorities = priorities.map(escapeHtml);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  const text = [
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    "Important priorities:",
    ...(priorities.length
      ? priorities.map((priority) => `- ${priority}`)
      : ["Not provided"]),
    "",
    message,
  ].join("\n");

  try {
    await sendMail({
      to: recipient,
      replyTo: email,
      subject: `MyIFA contact enquiry: ${topic}`,
      text,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1b2a4a">
          <h1 style="font-size:22px">New MyIFA contact enquiry</h1>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
          <p><strong>Important priorities:</strong></p>
          ${
            safePriorities.length
              ? `<ul>${safePriorities.map((priority) => `<li>${priority}</li>`).join("")}</ul>`
              : "<p>Not provided</p>"
          }
          <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
          <p style="line-height:1.7">${safeMessage}</p>
        </div>
      `,
    });
  } catch (error) {
    req.log.error({ err: error }, "Contact message email delivery failed");
    res.status(503).json({ error: "We could not send your message right now. Please try again later." });
    return;
  }

  res.json(SubmitContactMessageResponse.parse({
    message: "Thank you. Your message has been sent to MyIFA.",
  }));
});

export default router;
