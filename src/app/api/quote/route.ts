import { NextResponse } from "next/server";
import { buildQuoteRequestEmail } from "@/lib/emails/quote-request-email";
import { getResendClient } from "@/lib/resend";
import { validateQuoteRequest } from "@/lib/quote-request";
import { BUSINESS } from "@/lib/seo";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const validation = validateQuoteRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const from =
    process.env.RESEND_FROM_EMAIL ??
    `${BUSINESS.name} <onboarding@resend.dev>`;
  const to = process.env.RESEND_TO_EMAIL ?? BUSINESS.email;

  const { subject, text } = buildQuoteRequestEmail(validation.data);

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: validation.data.email,
      subject,
      text,
    });

    if (error) {
      console.error("Resend email error:", error);
      return NextResponse.json(
        { error: "Unable to send your quote request. Please try again." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Quote request email failed:", error);
    return NextResponse.json(
      { error: "Unable to send your quote request. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
