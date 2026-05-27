import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendExpiryAlert({ to, hostname, daysUntilExpiry, riskScore, issuer }) {
  const urgency = daysUntilExpiry <= 7 ? "CRITICAL" : daysUntilExpiry <= 14 ? "HIGH" : "MEDIUM";
  const color = daysUntilExpiry <= 7 ? "#ef4444" : daysUntilExpiry <= 14 ? "#f59e0b" : "#3b82f6";

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: `[${urgency}] ${hostname} certificate expires in ${daysUntilExpiry} days — CertiLens`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
            
            <!-- Header -->
            <div style="background:#0f172a;padding:32px;border-bottom:1px solid #334155;">
              <div style="font-size:22px;font-weight:700;color:#fff;">
                Certi<span style="color:#3b82f6;">Lens</span>
              </div>
              <div style="color:#64748b;font-size:13px;margin-top:4px;">TLS Certificate Intelligence</div>
            </div>

            <!-- Alert Badge -->
            <div style="padding:32px 32px 0;">
              <div style="display:inline-block;background:${color}20;border:1px solid ${color};color:${color};font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:100px;">
                ${urgency} ALERT
              </div>
            </div>

            <!-- Main Content -->
            <div style="padding:24px 32px;">
              <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 8px;">
                Certificate expiring soon
              </h2>
              <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
                The SSL/TLS certificate for <strong style="color:#fff;">${hostname}</strong> 
                will expire in <strong style="color:${color};">${daysUntilExpiry} days</strong>. 
                Renew it before it expires to avoid service disruption.
              </p>

              <!-- Stats -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;">
                  <div style="color:#64748b;font-size:11px;margin-bottom:4px;">DOMAIN</div>
                  <div style="color:#fff;font-weight:600;font-size:14px;">${hostname}</div>
                </div>
                <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;">
                  <div style="color:#64748b;font-size:11px;margin-bottom:4px;">EXPIRES IN</div>
                  <div style="color:${color};font-weight:700;font-size:14px;">${daysUntilExpiry} days</div>
                </div>
                <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;">
                  <div style="color:#64748b;font-size:11px;margin-bottom:4px;">RISK SCORE</div>
                  <div style="color:${color};font-weight:700;font-size:14px;">${riskScore}/100</div>
                </div>
                <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;">
                  <div style="color:#64748b;font-size:11px;margin-bottom:4px;">ISSUER</div>
                  <div style="color:#fff;font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${issuer?.split(",")[0] || "Unknown"}</div>
                </div>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:8px;">
                <a href="https://certilens.vercel.app/domains" 
                   style="display:inline-block;background:#3b82f6;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
                  View in CertiLens →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding:20px 32px;border-top:1px solid #334155;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0;">
                Sent by CertiLens — Real-time TLS Certificate Intelligence
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}