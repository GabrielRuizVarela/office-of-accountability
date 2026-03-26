/**
 * Email HTML templates for auth flows.
 *
 * Returns plain HTML strings - no template engine dependency.
 * All user-provided values are HTML-escaped to prevent XSS.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e4e4e7;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:14px;font-weight:600;color:#71717a;">ORC</span>
    </div>
    ${content}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e4e4e7;text-align:center;">
      <span style="font-size:12px;color:#a1a1aa;">Oficina de Rendición de Cuentas</span>
    </div>
  </div>
</body>
</html>`
}

function buttonHtml(url: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0;">
  <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">${escapeHtml(label)}</a>
</div>`
}

export function verificationEmail(name: string, verifyUrl: string): { subject: string; html: string } {
  return {
    subject: 'Verificá tu email - ORC',
    html: baseLayout(`
      <h1 style="font-size:20px;font-weight:700;color:#18181b;margin:0 0 12px;">Verificá tu email</h1>
      <p style="font-size:14px;color:#52525b;line-height:1.6;">
        Hola ${escapeHtml(name || 'usuario')}, gracias por registrarte en ORC.
        Hacé clic en el botón para verificar tu dirección de email.
      </p>
      ${buttonHtml(verifyUrl, 'Verificar email')}
      <p style="font-size:12px;color:#a1a1aa;line-height:1.5;">
        Este enlace expira en 24 horas. Si no creaste esta cuenta, podés ignorar este email.
      </p>
      <p style="font-size:11px;color:#d4d4d8;word-break:break-all;">${escapeHtml(verifyUrl)}</p>
    `),
  }
}

export function passwordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Restablecer contraseña - ORC',
    html: baseLayout(`
      <h1 style="font-size:20px;font-weight:700;color:#18181b;margin:0 0 12px;">Restablecer contraseña</h1>
      <p style="font-size:14px;color:#52525b;line-height:1.6;">
        Hola ${escapeHtml(name || 'usuario')}, recibimos una solicitud para restablecer tu contraseña.
      </p>
      ${buttonHtml(resetUrl, 'Restablecer contraseña')}
      <p style="font-size:12px;color:#a1a1aa;line-height:1.5;">
        Este enlace expira en 1 hora y solo puede usarse una vez.
        Si no solicitaste esto, podés ignorar este email - tu contraseña no cambiará.
      </p>
      <p style="font-size:11px;color:#d4d4d8;word-break:break-all;">${escapeHtml(resetUrl)}</p>
    `),
  }
}
