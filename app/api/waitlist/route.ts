import { NextRequest, NextResponse } from "next/server";
import { BrevoClient, BrevoError } from "@getbrevo/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: unknown; locale?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const locale = typeof body.locale === "string" ? body.locale : "en";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY ?? "";
    const listId = Number(process.env.BREVO_LIST_ID ?? 0);
    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? "";
    const senderName = process.env.BREVO_SENDER_NAME ?? "Mendly";

    if (!apiKey || !listId || !senderEmail) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    const client = new BrevoClient({ apiKey });

    // ── 1. Add contact to Brevo list ──
    try {
      await client.contacts.createContact({
        email,
        listIds: [listId],
        updateEnabled: true,
        attributes: { LOCALE: locale },
      });
    } catch (err: unknown) {
      // 409 Conflict = contact already exists, that's fine
      if (!(err instanceof BrevoError) || err.statusCode !== 409) throw err;
    }

    // ── 2. Send transactional confirmation email ──
    const isFr = locale === "fr";
    await client.transactionalEmails.sendTransacEmail({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: isFr
        ? "Tu es sur la liste Mendly 🚀"
        : "You're on the Mendly waitlist 🚀",
      htmlContent: isFr
        ? `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#05030E;color:#F5F3FF;border-radius:16px;border:1px solid rgba(139,92,246,0.2)"><h2 style="color:#A78BFA;font-size:24px;margin:0 0 16px">Tu es dans la liste. 🎉</h2><p style="color:#A1A1AA;line-height:1.7;margin:0 0 16px">Salut,</p><p style="color:#A1A1AA;line-height:1.7;margin:0 0 16px">Tu es officiellement sur la liste d'attente Mendly. On ouvre par vagues — tu recevras un email dès que c'est ton tour.</p><p style="color:#A1A1AA;line-height:1.7;margin:0">À très vite,<br/><strong style="color:#F5F3FF">L'équipe Mendly</strong></p></div>`
        : `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#05030E;color:#F5F3FF;border-radius:16px;border:1px solid rgba(139,92,246,0.2)"><h2 style="color:#A78BFA;font-size:24px;margin:0 0 16px">You're in. 🎉</h2><p style="color:#A1A1AA;line-height:1.7;margin:0 0 16px">Hey,</p><p style="color:#A1A1AA;line-height:1.7;margin:0 0 16px">You're officially on the Mendly waitlist. We're opening in waves — you'll get an email as soon as it's your turn.</p><p style="color:#A1A1AA;line-height:1.7;margin:0">See you soon,<br/><strong style="color:#F5F3FF">The Mendly team</strong></p></div>`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
