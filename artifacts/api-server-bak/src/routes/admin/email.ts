import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, leadEmailLogsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "./middleware";
import { sendMail } from "../../lib/mailer";
import { getTemplate } from "../../lib/campaign";

const router = Router();

// POST /admin/email/process-queue
// Sends the next campaign email to every active lead and advances their emailDay counter.
router.post("/admin/email/process-queue", requireAdmin, async (req, res) => {
  try {
    const activeLeads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.campaignActive, true));

    let sent = 0;
    let failed = 0;
    let completed = 0;

    for (const lead of activeLeads) {
      const day = lead.emailDay;
      const template = getTemplate(day);
      const firstName = lead.firstName || lead.email.split("@")[0];

      let status: "sent" | "failed" = "sent";
      let errorMsg: string | undefined;

      try {
        await sendMail({
          to: lead.email,
          subject: template.subject,
          html: template.html(firstName),
        });
        sent++;
      } catch (err: any) {
        status = "failed";
        errorMsg = err?.message || "Unknown error";
        failed++;
      }

      // Log the attempt
      await db.insert(leadEmailLogsTable).values({
        leadId: lead.id,
        day,
        subject: template.subject,
        status,
        error: errorMsg || null,
      });

      // Advance the counter; deactivate campaign after day 30
      const nextDay = day + 1;
      if (nextDay > 30) {
        await db
          .update(leadsTable)
          .set({ campaignActive: false, emailDay: nextDay })
          .where(eq(leadsTable.id, lead.id));
        completed++;
      } else {
        await db
          .update(leadsTable)
          .set({ emailDay: nextDay })
          .where(eq(leadsTable.id, lead.id));
      }
    }

    res.json({
      processed: activeLeads.length,
      sent,
      failed,
      completed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to process email queue" });
  }
});

export default router;
