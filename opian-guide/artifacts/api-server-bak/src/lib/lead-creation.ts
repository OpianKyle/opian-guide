import { db, leadEmailLogsTable, leadsTable } from "@workspace/db";
import type { Lead } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCampaignTemplate } from "./campaign";
import { sendMail } from "./mailer";

export class DuplicateLeadError extends Error {
  constructor() {
    super("A lead with this email already exists");
    this.name = "DuplicateLeadError";
  }
}

export type LeadCreationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  notes: string | null;
  advisorId: number | null;
};

export type LeadCreationResult = {
  lead: Lead;
  emailSent: boolean;
  emailMessage: string;
  emailError?: unknown;
  trackingError?: unknown;
};

export type ParsedLeadCreationRequest = {
  input: LeadCreationInput;
  sendWelcomeEmail: boolean;
};

export function parseLeadCreationRequest(
  body: unknown,
  advisorId: number | null,
): ParsedLeadCreationRequest | { error: string } {
  const data =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email address is required." };
  }

  const optionalText = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  return {
    input: {
      firstName,
      lastName,
      email,
      phone: optionalText(data.phone),
      company: optionalText(data.company),
      jobTitle: optionalText(data.jobTitle),
      notes: optionalText(data.notes),
      advisorId,
    },
    sendWelcomeEmail: data.sendWelcomeEmail === true,
  };
}

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

export async function createLead(
  input: LeadCreationInput,
  sendWelcomeEmail: boolean,
): Promise<LeadCreationResult> {
  const email = input.email.trim().toLowerCase();
  const [duplicate] = await db
    .select({ id: leadsTable.id })
    .from(leadsTable)
    .where(eq(leadsTable.email, email))
    .limit(1);

  if (duplicate) throw new DuplicateLeadError();

  const [inserted] = await db
    .insert(leadsTable)
    .values({
      ...input,
      email,
      source: "manual",
      status: "new",
      emailDay: 0,
      campaignActive: true,
    })
    .$returningId();

  if (!inserted?.id) throw new Error("Lead was not created");

  const [createdLead] = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.id, inserted.id));

  if (!createdLead) throw new Error("Created lead could not be loaded");

  if (!sendWelcomeEmail) {
    return {
      lead: createdLead,
      emailSent: false,
      emailMessage: "Lead created without sending a welcome email.",
    };
  }

  const template = await getCampaignTemplate(0);
  let emailError: unknown;

  try {
    await sendMail({
      to: createdLead.email,
      subject: template.subject,
      html: template.html(escapeHtml(createdLead.firstName || "there")),
    });
  } catch (error) {
    emailError = error;
  }

  if (emailError) {
    let trackingError: unknown;
    try {
      await db.insert(leadEmailLogsTable).values({
        leadId: createdLead.id,
        day: 0,
        subject: template.subject,
        status: "failed",
        error: emailError instanceof Error ? emailError.message : "Email delivery failed",
      });
    } catch (error) {
      trackingError = error;
    }

    return {
      lead: createdLead,
      emailSent: false,
      emailMessage: "Lead created, but the welcome email could not be sent. Check the email settings.",
      emailError,
      trackingError,
    };
  }

  let trackingError: unknown;
  try {
    await db.insert(leadEmailLogsTable).values({
      leadId: createdLead.id,
      day: 0,
      subject: template.subject,
      status: "sent",
      error: null,
    });
  } catch (error) {
    trackingError = error;
  }

  try {
    await db
      .update(leadsTable)
      .set({ emailDay: 1 })
      .where(eq(leadsTable.id, createdLead.id));
  } catch (error) {
    trackingError ??= error;
  }

  const [updatedLead] = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.id, createdLead.id));

  return {
    lead: updatedLead ?? createdLead,
    emailSent: true,
    emailMessage: "Lead created and welcome email sent.",
    trackingError,
  };
}
