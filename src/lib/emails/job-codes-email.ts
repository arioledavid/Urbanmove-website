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

export type JobCodesEmailInput = {
  to: string;
  contactName: string;
  jobReference: string;
  pickupCode: string;
  dropoffCode: string;
};

function buildJobCodesEmailHtml(input: JobCodesEmailInput): string {
  const name = escapeHtml(input.contactName);
  const reference = escapeHtml(input.jobReference);
  const pickup = escapeHtml(input.pickupCode);
  const dropoff = escapeHtml(input.dropoffCode);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your UrbanMove job codes</title>
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
                  Your pickup and drop-off codes
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                  Hi ${name}, your job is scheduled. Keep these codes handy and give them only to the UrbanMove crew.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusMd};overflow:hidden;background:${EMAIL_BRAND.paper};">
                  <tr>
                    <td style="padding:20px 20px 16px;background:${EMAIL_BRAND.primarySoft};">
                      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${EMAIL_BRAND.ink};">
                        Give this code to your crew when they arrive:
                      </p>
                      <p style="margin:0;font-size:32px;line-height:1.2;font-weight:700;letter-spacing:0.18em;font-family:${EMAIL_BRAND.fontStack};color:${EMAIL_BRAND.ink};">
                        ${pickup}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;border-top:1px solid ${EMAIL_BRAND.border};">
                      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${EMAIL_BRAND.ink};">
                        Give this code to your crew when your items are delivered:
                      </p>
                      <p style="margin:0;font-size:32px;line-height:1.2;font-weight:700;letter-spacing:0.18em;font-family:${EMAIL_BRAND.fontStack};color:${EMAIL_BRAND.ink};">
                        ${dropoff}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                  Do not share these codes with anyone except your UrbanMove crew.
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

export function buildJobCodesEmail(input: JobCodesEmailInput) {
  const subject = `Your UrbanMove job codes (${input.jobReference})`;
  const text = [
    `Hi ${input.contactName},`,
    "",
    `Your job ${input.jobReference} is scheduled. Keep these codes handy and give them only to the UrbanMove crew.`,
    "",
    `Give this code to your crew when they arrive: ${input.pickupCode}`,
    `Give this code to your crew when your items are delivered: ${input.dropoffCode}`,
    "",
    "Do not share these codes with anyone except your UrbanMove crew.",
    "",
    SITE_NAME,
    `${BUSINESS.telephoneDisplay} · ${BUSINESS.email}`,
    SITE_URL,
  ].join("\n");

  return { subject, text, html: buildJobCodesEmailHtml(input) };
}

export async function sendJobCodesEmail(
  input: JobCodesEmailInput,
): Promise<Result<void>> {
  try {
    const from =
      process.env.RESEND_FROM_EMAIL ??
      `${BUSINESS.name} <onboarding@resend.dev>`;
    const { subject, text, html } = buildJobCodesEmail(input);
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to: [input.to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend job-codes email error:", error);
      return err("Unable to send pickup/dropoff codes email.");
    }

    return ok(undefined);
  } catch (error) {
    console.error("Job codes email failed:", error);
    return err("Unable to send pickup/dropoff codes email.");
  }
}
