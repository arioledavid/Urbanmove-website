import { Resend } from "resend";

let resendClient: Resend | null = null;

/** Server-only check so the UI can warn before an action that depends on email. */
export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}
