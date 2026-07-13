import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10),
  website: z.string().optional(), // honeypot — checked after parse, not by schema
});

/**
 * Contact handler — the single working replacement for the source's two broken
 * form targets (CONTENT-MAPPING §4.7). With no RESEND_API_KEY set it is
 * dev-safe: it validates, logs, and returns success without external calls.
 */
export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  // Bot filled the honeypot — silently accept and drop.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL } = process.env;
  const { name, email, company, budget, message } = parsed.data;

  if (!RESEND_API_KEY) {
    console.info("[contact] submission received (no email provider configured):", {
      name,
      email,
      company,
      budget,
    });
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LinkAPI Website <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL ?? "partnership@linkapitech.com"],
        reply_to: email,
        subject: `New enquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nCompany: ${company ?? "-"}\nBudget: ${budget ?? "-"}\n\n${message}`,
      }),
    });
    if (!res.ok) throw new Error("delivery failed");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  }
}
