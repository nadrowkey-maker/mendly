import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type EmailActionType =
  | "signup"
  | "recovery"
  | "invite"
  | "email_change"
  | "magiclink";

function buildSubject(type: EmailActionType, locale: string): string {
  const fr = {
    signup: "Confirme ton adresse email — Mendly",
    recovery: "Réinitialise ton mot de passe — Mendly",
    invite: "Tu as été invité sur Mendly",
    email_change: "Confirme ton nouvel email — Mendly",
    magiclink: "Ton lien de connexion Mendly",
  };
  const en = {
    signup: "Confirm your email address — Mendly",
    recovery: "Reset your password — Mendly",
    invite: "You've been invited to Mendly",
    email_change: "Confirm your new email — Mendly",
    magiclink: "Your Mendly sign-in link",
  };
  return (locale === "fr" ? fr : en)[type] ?? "Mendly";
}

function buildHtml(
  type: EmailActionType,
  confirmUrl: string,
  locale: string
): string {
  const isFr = locale === "fr";

  const content: Record<EmailActionType, { heading: string; body: string; cta: string }> = {
    signup: {
      heading: isFr ? "Confirme ton email" : "Confirm your email",
      body: isFr
        ? "Clique sur le bouton ci-dessous pour activer ton compte Mendly."
        : "Click the button below to activate your Mendly account.",
      cta: isFr ? "Activer mon compte" : "Activate my account",
    },
    recovery: {
      heading: isFr ? "Réinitialise ton mot de passe" : "Reset your password",
      body: isFr
        ? "Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe."
        : "Click the button below to choose a new password.",
      cta: isFr ? "Réinitialiser mon mot de passe" : "Reset my password",
    },
    invite: {
      heading: isFr ? "Tu as été invité" : "You've been invited",
      body: isFr
        ? "Clique sur le bouton ci-dessous pour rejoindre Mendly."
        : "Click the button below to join Mendly.",
      cta: isFr ? "Rejoindre Mendly" : "Join Mendly",
    },
    email_change: {
      heading: isFr ? "Confirme ton nouvel email" : "Confirm your new email",
      body: isFr
        ? "Clique sur le bouton ci-dessous pour confirmer ce changement."
        : "Click the button below to confirm this change.",
      cta: isFr ? "Confirmer" : "Confirm",
    },
    magiclink: {
      heading: isFr ? "Ton lien de connexion" : "Your sign-in link",
      body: isFr
        ? "Clique sur le bouton ci-dessous pour te connecter à Mendly."
        : "Click the button below to sign in to Mendly.",
      cta: isFr ? "Se connecter" : "Sign in",
    },
  };

  const c = content[type] ?? content.signup;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#05030E;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05030E;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Logo -->
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-size:24px;font-weight:800;color:#F5F3FF;letter-spacing:-0.5px;">Mendly</span>
        </td></tr>
        <!-- Card -->
        <tr><td style="background:#14102A;border:1px solid rgba(139,92,246,0.2);border-radius:20px;padding:40px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F5F3FF;">${c.heading}</h1>
          <p style="margin:0 0 32px;font-size:15px;color:#A1A1AA;line-height:1.6;">${c.body}</p>
          <a href="${confirmUrl}"
             style="display:inline-block;padding:14px 28px;background:#8B5CF6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">
            ${c.cta}
          </a>
          <p style="margin:32px 0 0;font-size:12px;color:#71717A;">
            ${isFr ? "Si tu n'es pas à l'origine de cette demande, ignore cet email." : "If you didn't request this, you can safely ignore this email."}
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#71717A;">© 2025 Mendly · mendlyai.io</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const user = payload.user as { email: string };
    const emailData = payload.email_data as {
      token: string;
      token_hash: string;
      redirect_to: string;
      email_action_type: EmailActionType;
      site_url: string;
    };

    if (!user?.email || !emailData?.token_hash) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { token_hash, redirect_to, email_action_type } = emailData;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mendlyai.io";

    // Detect locale from redirect_to URL
    const locale = redirect_to?.includes("/fr/") ? "fr" : "en";

    // Build Supabase verification URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to ?? siteUrl)}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[send-email hook] RESEND_API_KEY not set");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mendly <noreply@mendlyai.io>",
        to: user.email,
        subject: buildSubject(email_action_type, locale),
        html: buildHtml(email_action_type, confirmUrl, locale),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[send-email hook] Resend error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-email hook] Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
