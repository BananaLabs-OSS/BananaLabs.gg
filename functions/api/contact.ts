interface Env {
  RESEND_API_KEY: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(logo: string, brand: string, accent: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en" style="height:100%;margin:0;">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;height:100%;background:#161618;font-family:'DM Sans',system-ui,-apple-system,sans-serif;color:#f0f0f0;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161618;height:100%;min-height:100vh;">
  <tr><td align="center" style="padding:40px 16px;vertical-align:middle;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:32px;">
        <span style="font-size:28px;margin-right:8px;">${logo}</span>
        <span style="font-size:28px;font-weight:900;color:#f0f0f0;letter-spacing:-.03em;">${brand}</span>
      </td></tr>
      <tr><td style="background:#1e1e21;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:40px 36px;">
        ${body}
      </td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:20px 16px;vertical-align:bottom;height:1px;">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,.35);line-height:1.6;">
      BananaLabs &middot; Open-source game infrastructure<br>
      Maintained by <a href="https://monkeylabs.gg" style="color:#c49a6c;text-decoration:none;">MonkeyLabs LLC</a>
    </p>
  </td></tr>
</table>
</body>
</html>`;
}

function notificationEmail(email: string, subject: string, message: string): string {
  return wrap('🍌', 'BananaLabs', '#e8b931', `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f0f0f0;letter-spacing:-.02em;">New Contact Message</h1>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,.55);line-height:1.65;">Someone reached out via bananalabs.gg</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;">
      <tr><td style="font-size:13px;color:rgba(255,255,255,.55);padding:4px 0;">From</td><td align="right" style="font-size:13px;font-weight:600;color:#f0f0f0;padding:4px 0;">${escapeHtml(email)}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;">
      <tr><td style="font-size:13px;color:rgba(255,255,255,.55);padding:4px 0;">Subject</td><td align="right" style="font-size:13px;font-weight:600;color:#f0f0f0;padding:4px 0;">${escapeHtml(subject || '(none)')}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:24px 0;">
    <p style="margin:0;font-size:15px;color:#f0f0f0;line-height:1.65;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `);
}

function autoReplyEmail(): string {
  return wrap('🍌', 'BananaLabs', '#e8b931', `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f0f0f0;letter-spacing:-.02em;">We got your message</h1>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,.55);line-height:1.65;">Thanks for reaching out. We're a small team but we read everything — expect a reply soon.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td>
      <a href="https://bananalabs.gg" style="display:inline-block;padding:14px 32px;background:#e8b931;color:#1a1400;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;font-family:'DM Sans',system-ui,sans-serif;">Visit BananaLabs</a>
    </td></tr></table>
    <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">You're receiving this because you submitted a message on bananalabs.gg. No further emails will be sent unless we reply directly.</p>
  `);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, message } = await request.json<{
      email: string;
      subject?: string;
      message: string;
    }>();

    if (!email || !message) {
      return new Response(JSON.stringify({ error: 'Email and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send branded notification to admin
    const notifRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BananaLabs Contact <noreply@bananalabs.gg>',
        to: ['hello@bananalabs.gg'],
        reply_to: email,
        subject: subject || 'Contact form submission',
        html: notificationEmail(email, subject || '', message),
      }),
    });

    if (!notifRes.ok) {
      const err = await notifRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send branded auto-reply to sender
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BananaLabs <noreply@bananalabs.gg>',
        to: [email],
        reply_to: 'hello@bananalabs.gg',
        subject: "We got your message",
        html: autoReplyEmail(),
      }),
    }).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('Contact handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
