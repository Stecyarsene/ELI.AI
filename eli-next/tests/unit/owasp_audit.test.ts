/** ÉLI — Audit OWASP automatisé : prouve les garanties et empêche toute régression. */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { safeParse, chatInput, payInit, otpVerify } from '../../src/lib/validation/schemas';

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const SRC = walk('src');
const read = (p: string) => readFileSync(p, 'utf8');

describe('OWASP A02/A05 — secrets jamais côté client', () => {
  it('aucun fichier "use client" ne référence service_role', () => {
    const leaks = SRC.filter((p) => /\.(tsx|ts)$/.test(p) && read(p).includes("'use client'") && /service_role|SERVICE_ROLE/.test(read(p)));
    expect(leaks).toEqual([]);
  });
  it('aucun secret ne porte le préfixe NEXT_PUBLIC_ (sauf ANON_KEY, public par conception)', () => {
    const bad = SRC.filter((p) => /NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE_ROLE|GEMINI|RESEND|TOKEN|WEBHOOK)/.test(read(p)));
    expect(bad).toEqual([]);
  });
  it('service_role n\'est utilisé que dans la couche serveur', () => {
    const users = SRC.filter((p) => /SUPABASE_SERVICE_ROLE_KEY/.test(read(p)));
    users.forEach((p) => expect(p).toMatch(/server\.ts$/));
  });
});

describe('OWASP A01 — .env protégé du dépôt', () => {
  it('.gitignore exclut .env*', () => {
    expect(existsSync('.gitignore')).toBe(true);
    expect(read('.gitignore')).toMatch(/\.env/);
  });
});

describe('OWASP A03 — validation stricte des entrées (Zod)', () => {
  it('chatInput rejette message vide / trop long / champ en trop', () => {
    expect(safeParse(chatInput, { message: '' }).ok).toBe(false);
    expect(safeParse(chatInput, { message: 'x'.repeat(5000) }).ok).toBe(false);
    expect(safeParse(chatInput, { message: 'ok', evil: 1 }).ok).toBe(false); // .strict()
    expect(safeParse(chatInput, { message: 'explique les fractions' }).ok).toBe(true);
  });
  it('payInit rejette planId/msisdn malformés', () => {
    expect(safeParse(payInit, { planId: 'DROP TABLE', msisdn: 'abc' }).ok).toBe(false);
    expect(safeParse(payInit, { planId: 'nat_mensuel', msisdn: '+24107374043' }).ok).toBe(true);
  });
  it('otpVerify impose un code à 6 chiffres', () => {
    expect(safeParse(otpVerify, { phone: '+24107', code: '12' }).ok).toBe(false);
    expect(safeParse(otpVerify, { phone: '+24107374043', code: '123456' }).ok).toBe(true);
  });
});

describe('OWASP A08 — intégrité : routes mutatives valident leur entrée', () => {
  it('les routes à body (chat, pay/init, pay/webhook) référencent une validation', () => {
    ['src/app/api/ai/chat/route.ts', 'src/app/api/pay/init/route.ts', 'src/app/api/pay/webhook/route.ts']
      .filter(existsSync)
      .forEach((p) => expect(/safeParse|verifyHmac|timingSafeEqual|\.parse\(/.test(read(p))).toBe(true));
  });
});
