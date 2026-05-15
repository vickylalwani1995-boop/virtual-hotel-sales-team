export interface EmailTemplateOptions {
  subject: string
  body: string
  agentId?: string
  agentName?: string
  agentTitle?: string
  senderEmail?: string
  baseUrl?: string
}

const NAVY  = "#0F4C81"
const BLUE  = "#1B6EB7"
const LIGHT = "#EAF2FA"
const LINE  = "#DCE5EF"

const AGENT_META: Record<string, { name: string; title: string }> = {
  "01_donna_marie":  { name: "Donna Marie",  title: "Director of Sales"          },
  "02_marcus_reed":  { name: "Marcus Reed",   title: "Lead Generation Specialist" },
  "03_sarah_chen":   { name: "Sarah Chen",    title: "Outbound Sales Manager"     },
  "04_priya_sharma": { name: "Priya Sharma",  title: "RFP & Group Sales Manager"  },
  "05_liam_chen":    { name: "Liam Chen",     title: "Client Retention Manager"   },
  "06_maya_reddy":   { name: "Maya Reddy",    title: "Revenue Strategy Manager"   },
}

function formatBody(raw: string): string {
  return raw
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => {
      const lines = para.split("\n").map((l) => l.trim()).filter(Boolean).join("<br>")
      return `<p style="margin:0 0 18px 0;line-height:1.75;color:#1a2e47;font-size:15px;">${lines}</p>`
    })
    .join("")
}

export function buildMarketingEmail(opts: EmailTemplateOptions): string {
  const { subject, body, agentId, agentName, agentTitle, senderEmail, baseUrl } = opts

  const agentMeta = agentId
    ? AGENT_META[agentId]
    : agentName
      ? Object.values(AGENT_META).find((a) => a.name === agentName)
      : undefined

  const displayName  = agentMeta?.name  ?? agentName  ?? "Sales Team"
  const displayTitle = agentMeta?.title ?? agentTitle  ?? "AI Sales Assistant"

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  const logoUrl   = `${baseUrl ?? "https://salesteam.myhospitalitysalespro.com"}/mhsp-logo.png`
  const formattedBody = formatBody(body)
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- ── TOP NAVY BAR ── -->
          <tr>
            <td style="background:${NAVY};border-radius:10px 10px 0 0;height:6px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── LOGO HEADER ── -->
          <tr>
            <td style="background:#ffffff;padding:28px 40px 24px 40px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};text-align:center;">
              <img src="${logoUrl}" alt="My Hospitality Sales Pro" width="220" style="display:block;margin:0 auto;max-width:220px;height:auto;">
              <p style="margin:12px 0 0 0;font-size:12px;color:#5A6B82;letter-spacing:0.5px;text-transform:uppercase;">AI-Powered Hotel Sales Team</p>
            </td>
          </tr>

          <!-- ── BLUE DIVIDER ── -->
          <tr>
            <td style="background:${BLUE};height:3px;font-size:0;line-height:0;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">&nbsp;</td>
          </tr>

          <!-- ── SUBJECT BANNER ── -->
          <tr>
            <td style="background:#F7FAFD;padding:20px 40px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width:4px;background:${NAVY};border-radius:2px;">&nbsp;</td>
                  <td style="padding-left:14px;">
                    <p style="margin:0;font-size:10px;font-weight:600;color:#5A6B82;text-transform:uppercase;letter-spacing:1px;">Subject</p>
                    <p style="margin:4px 0 0 0;font-size:17px;font-weight:700;color:${NAVY};line-height:1.3;">${subject}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
              <hr style="border:none;border-top:1px solid ${LINE};margin:0;">
            </td>
          </tr>

          <!-- ── EMAIL BODY ── -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 24px 40px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
              ${formattedBody}
            </td>
          </tr>

          <!-- ── AGENT SIGNATURE ── -->
          <tr>
            <td style="background:${LIGHT};padding:24px 40px;border:1px solid ${LINE};border-top:2px solid ${BLUE};">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:16px;">
                    <div style="width:46px;height:46px;background:${NAVY};border-radius:50%;text-align:center;line-height:46px;font-size:16px;font-weight:700;color:#ffffff;">
                      ${initials}
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:${NAVY};">${displayName}</p>
                    <p style="margin:2px 0 0 0;font-size:12px;color:#5A6B82;">${displayTitle} · My Hospitality Sales Pro</p>
                    ${senderEmail ? `<p style="margin:4px 0 0 0;font-size:12px;color:${BLUE};">${senderEmail}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:${NAVY};border-radius:0 0 10px 10px;padding:22px 40px;text-align:center;">
              <img src="${logoUrl}" alt="My Hospitality Sales Pro" width="140" style="display:block;margin:0 auto 12px auto;max-width:140px;height:auto;opacity:0.85;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">
                This email was composed by an AI sales agent on behalf of your hotel sales team.
              </p>
              <p style="margin:10px 0 0 0;font-size:11px;color:rgba(255,255,255,0.4);">
                © ${year} My Hospitality Sales Pro · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}
