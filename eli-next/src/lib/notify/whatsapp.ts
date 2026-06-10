/** ÉLI — WhatsApp Business : assistance d'urgence (doc 10). Template message au parent. */
export async function sendWhatsAppTemplate(to: string, template: 'payment_failed' | 'access_help', params: string[]): Promise<{ ok: boolean; status: number }> {
  const token = process.env.WHATSAPP_TOKEN, phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return { ok: false, status: 0 };               // pas configuré → non bloquant
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to,
        type: 'template',
        template: { name: template, language: { code: 'fr' }, components: [{ type: 'body', parameters: params.map((t) => ({ type: 'text', text: t })) }] },
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch { return { ok: false, status: 0 }; }
}
