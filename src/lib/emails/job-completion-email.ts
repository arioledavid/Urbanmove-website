import {
  formatAdminDateTime,
  formatDurationMinutes,
} from "@/lib/admin-format";
import { EMAIL_BRAND } from "@/lib/emails/brand-tokens";
import { getResendClient } from "@/lib/resend";
import { err, ok, type Result } from "@/lib/result";
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/seo";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type JobCompletionEmailInput = {
  to: string;
  contactName: string;
  jobReference: string;
  pickedUpAt: Date;
  droppedOffAt: Date;
  actualDurationMinutes: number;
};

function buildJobCompletionEmailHtml(input: JobCompletionEmailInput): string {
  const name = escapeHtml(input.contactName);
  const reference = escapeHtml(input.jobReference);
  const pickupTime = escapeHtml(formatAdminDateTime(input.pickedUpAt));
  const dropoffTime = escapeHtml(formatAdminDateTime(input.droppedOffAt));
  const elapsed = escapeHtml(
    formatDurationMinutes(input.actualDurationMinutes),
  );

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your UrbanMove job is complete</title>
  </head>
  <body style="margin:0;padding:0;background:${EMAIL_BRAND.surface};font-family:${EMAIL_BRAND.fontStack};color:${EMAIL_BRAND.ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BRAND.surface};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${EMAIL_BRAND.paper};border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusLg};overflow:hidden;">
            <tr>
              <td style="height:4px;background:${EMAIL_BRAND.primary};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 24px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">
                  Job ${reference}
                </p>
                <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:${EMAIL_BRAND.ink};">
                  Your job is complete
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                  Hi ${name}, thanks for choosing UrbanMove. Here is a summary of your completed job.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusMd};overflow:hidden;background:${EMAIL_BRAND.paper};">
                  <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid ${EMAIL_BRAND.border};">
                      <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_BRAND.muted};">
                        Pickup time
                      </p>
                      <p style="margin:0;font-size:16px;line-height:1.4;font-weight:600;color:${EMAIL_BRAND.ink};">
                        ${pickupTime}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 20px;border-bottom:1px solid ${EMAIL_BRAND.border};">
                      <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_BRAND.muted};">
                        Drop-off time
                      </p>
                      <p style="margin:0;font-size:16px;line-height:1.4;font-weight:600;color:${EMAIL_BRAND.ink};">
                        ${dropoffTime}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 20px;background:${EMAIL_BRAND.primarySoft};">
                      <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_BRAND.muted};">
                        Total time elapsed
                      </p>
                      <p style="margin:0;font-size:20px;line-height:1.3;font-weight:700;color:${EMAIL_BRAND.ink};">
                        ${elapsed}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                  If you have any questions about this job, reply to this email or call us.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px;border-top:1px solid ${EMAIL_BRAND.border};background:${EMAIL_BRAND.surface};">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${EMAIL_BRAND.ink};">
                  ${escapeHtml(SITE_NAME)}
                </p>
                <p style="margin:0 0 4px;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted};">
                  ${escapeHtml(BUSINESS.telephoneDisplay)} · ${escapeHtml(BUSINESS.email)}
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.subtle};">
                  <a href="${SITE_URL}" style="color:${EMAIL_BRAND.primary};text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildJobCompletionEmail(input: JobCompletionEmailInput) {
  const pickupTime = formatAdminDateTime(input.pickedUpAt);
  const dropoffTime = formatAdminDateTime(input.droppedOffAt);
  const elapsed = formatDurationMinutes(input.actualDurationMinutes);
  const subject = `Your UrbanMove job is complete (${input.jobReference})`;
  const text = [
    `Hi ${input.contactName},`,
    "",
    `Your job ${input.jobReference} is complete. Here is a summary:`,
    "",
    `Pickup time: ${pickupTime}`,
    `Drop-off time: ${dropoffTime}`,
    `Total time elapsed: ${elapsed}`,
    "",
    "If you have any questions about this job, reply to this email or call us.",
    "",
    SITE_NAME,
    `${BUSINESS.telephoneDisplay} · ${BUSINESS.email}`,
    SITE_URL,
  ].join("\n");

  return { subject, text, html: buildJobCompletionEmailHtml(input) };
}

export async function sendJobCompletionEmail(
  input: JobCompletionEmailInput,
): Promise<Result<void>> {
  try {
    const from =
      process.env.RESEND_FROM_EMAIL ??
      `${BUSINESS.name} <onboarding@resend.dev>`;
    const { subject, text, html } = buildJobCompletionEmail(input);
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to: [input.to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend job-completion email error:", error);
      return err("Unable to send job completion email.");
    }

    return ok(undefined);
  } catch (error) {
    console.error("Job completion email failed:", error);
    return err("Unable to send job completion email.");
  }
}
