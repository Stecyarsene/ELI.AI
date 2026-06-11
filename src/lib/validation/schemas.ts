/** ÉLI — Validation stricte des entrées (OWASP A03 Injection / A04 Insecure Design). */
import { z } from 'zod';

export const chatInput = z.object({
  message: z.string().min(1).max(4000),
  focusSubject: z.string().max(60).optional(),
  pillar: z.string().max(60).optional(),
}).strict();

export const payInit = z.object({
  planId: z.string().regex(/^[a-z]+_[a-z]+$/),                 // ex: nat_mensuel
  msisdn: z.string().regex(/^\+?\d{8,15}$/),                   // numéro E.164-ish
}).strict();

export const phoneOtpRequest = z.object({
  phone: z.string().regex(/^\+?\d{8,15}$/),
}).strict();

export const otpVerify = z.object({
  phone: z.string().regex(/^\+?\d{8,15}$/),
  code: z.string().regex(/^\d{6}$/),
}).strict();

export const ficheInput = z.object({
  subject: z.string().min(1).max(120),
  kind: z.enum(['revision', 'quiz', 'examen']).default('revision'),
  title: z.string().max(200).optional(),
  body: z.record(z.unknown()).optional(),       // contenu structuré libre (JSONB)
  program: z.enum(['national', 'aefe']).optional(),
}).strict();

export const progressInput = z.object({
  subject: z.string().min(1).max(120),
  program: z.enum(['national', 'aefe']).optional(),
  bilan: z.object({
    chapitre_travaille: z.string().max(300).optional(),
    reussites: z.array(z.string().max(300)).max(20).optional(),
    erreurs_types: z.array(z.string().max(300)).max(20).optional(),
    statut_propose: z.enum(['vert', 'orange', 'rouge']).optional(),
    prochaine_etape: z.string().max(300).optional(),
  }),
}).strict();

/** Helper : parse sûr → {ok,data} | {ok:false,error}. Jamais d'exception non gérée. */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, error: r.error.issues.map((i) => i.path.join('.') + ':' + i.code).join(',') };
}
