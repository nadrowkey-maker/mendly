const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER = { email: "hello@mendly.co", name: "Mendly" };

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendTransactionalEmail(
  options: SendEmailOptions
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set — skipping email send");
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: SENDER,
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }
}

export function buildWeeklyRecapHtml(params: {
  userName: string;
  projectName: string;
  deliverables: { title: string; agent_role: string; created_at: string }[];
  locale: "fr" | "en";
  dashboardUrl: string;
}): string {
  const { userName, projectName, deliverables, locale, dashboardUrl } = params;
  const isFr = locale === "fr";

  const heading = isFr
    ? `Ton récap hebdo — ${projectName}`
    : `Your weekly recap — ${projectName}`;
  const intro = isFr
    ? `Bonjour ${userName || "founder"},<br><br>Voici les livrables générés cette semaine pour <strong>${projectName}</strong> :`
    : `Hi ${userName || "founder"},<br><br>Here are the deliverables generated this week for <strong>${projectName}</strong>:`;
  const cta = isFr ? "Voir mes livrables" : "View my deliverables";
  const footer = isFr
    ? "Tu reçois cet email parce que tu as un compte Mendly. Pour te désabonner, accède aux paramètres de ton compte."
    : "You're receiving this because you have a Mendly account. To unsubscribe, go to your account settings.";

  const rows = deliverables
    .map(
      (d) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1e1b4b;">
        <span style="background:#1e1b4b;color:#a78bfa;font-family:monospace;font-size:10px;padding:2px 8px;border-radius:99px;">${d.agent_role}</span>
        &nbsp;
        <span style="color:#e5e7eb;font-size:14px;">${d.title}</span>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#05030e;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05030e;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#14102a;border:1px solid rgba(139,92,246,0.2);border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,rgba(139,92,246,0.3),rgba(6,182,212,0.1));padding:32px 40px;">
            <p style="margin:0 0 4px;font-family:monospace;font-size:10px;letter-spacing:0.3em;color:#a78bfa;text-transform:uppercase;">MENDLY</p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;">${heading}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">${intro}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
            <div style="margin-top:32px;text-align:center;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#8b5cf6;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:99px;text-decoration:none;">${cta}</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(139,92,246,0.15);">
            <p style="margin:0;color:#52525b;font-size:11px;line-height:1.6;">${footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
