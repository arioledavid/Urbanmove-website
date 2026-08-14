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

export type DriverCredentialsEmailInput = {
  to: string;
  name: string | null;
  temporaryPassword: string;
  loginUrl: string;
};

function buildDriverCredentialsEmailHtml(
  input: DriverCredentialsEmailInput,
): string {
  const greeting = input.name?.trim()
    ? `Hi ${escapeHtml(input.name.trim())},`
    : "Hi,";
  const email = escapeHtml(input.to);
  const password = escapeHtml(input.temporaryPassword);
  const loginUrl = escapeHtml(input.loginUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your UrbanMove driver login</title>
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
                  Driver account
                </p>
                <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:${EMAIL_BRAND.ink};">
                  Your UrbanMove login
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.muted};">
                  ${greeting} an admin created your driver account. Sign in with the details below, then change your password immediately.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_BRAND.border};border-radius:${EMAIL_BRAND.radiusMd};overflow:hidden;">
                  <tr>
                    <td style="padding:14px 16px;font-size:13px;font-weight:600;color:${EMAIL_BRAND.muted};width:34%;background:${EMAIL_BRAND.surface};">
                      Email
                    </td>
                    <td style="padding:14px 16px;font-size:14px;color:${EMAIL_BRAND.ink};background:${EMAIL_BRAND.surface};">
                      ${email}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;border-top:1px solid ${EMAIL_BRAND.border};font-size:13px;font-weight:600;color:${EMAIL_BRAND.muted};background:${EMAIL_BRAND.paper};">
                      Temporary password
                    </td>
                    <td style="padding:14px 16px;border-top:1px solid ${EMAIL_BRAND.border};font-size:16px;font-weight:700;letter-spacing:0.04em;color:${EMAIL_BRAND.ink};background:${EMAIL_BRAND.paper};font-family:${EMAIL_BRAND.fontStack};">
                      ${password}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 24px;">
                <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.ink};">
                  You will be asked to change this password as soon as you sign in.
                </p>
                <a href="${loginUrl}" style="display:inline-block;padding:12px 18px;border-radius:${EMAIL_BRAND.radiusMd};background:${EMAIL_BRAND.primary};color:${EMAIL_BRAND.paper};font-size:14px;font-weight:600;text-decoration:none;">
                  Sign in
                </a>
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

export function buildDriverCredentialsEmail(
  input: DriverCredentialsEmailInput,
) {
  const subject = "Your UrbanMove driver login";
  const greeting = input.name?.trim() ? `Hi ${input.name.trim()},` : "Hi,";
  const text = [
    greeting,
    "",
    "An admin created your UrbanMove driver account. Sign in with the details below, then change your password immediately.",
    "",
    `Email: ${input.to}`,
    `Temporary password: ${input.temporaryPassword}`,
    "",
    `Sign in: ${input.loginUrl}`,
    "",
    "You will be asked to change this password as soon as you sign in.",
    "",
    SITE_NAME,
    `${BUSINESS.telephoneDisplay} · ${BUSINESS.email}`,
    SITE_URL,
  ].join("\n");

  return {
    subject,
    text,
    html: buildDriverCredentialsEmailHtml(input),
  };
}

export async function sendDriverCredentialsEmail(
  input: DriverCredentialsEmailInput,
): Promise<Result<void>> {
  try {
    const from =
      process.env.RESEND_FROM_EMAIL ??
      `${BUSINESS.name} <onboarding@resend.dev>`;
    const { subject, text, html } = buildDriverCredentialsEmail(input);
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to: [input.to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend driver credentials email error:", error);
      return err("Unable to send driver login email.");
    }

    return ok(undefined);
  } catch (error) {
    console.error("Driver credentials email failed:", error);
    return err("Unable to send driver login email.");
  }
}
