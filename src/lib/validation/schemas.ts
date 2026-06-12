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

export const continuiteInput = z.object({
  subject: z.string().max(120).optional(),
  lastChapter: z.string().max(300).optional(),
  minutes: z.number().int().min(0).max(600).optional(),
}).strict();

export const pushRegisterInput = z.object({
  platform: z.enum(['android', 'ios', 'web']),
  token: z.string().min(8).max(512),
}).strict();

const transcriptLine = z.object({ role: z.string().max(16), text: z.string().max(4000) }).strict();
export const sessionOpenInput = z.object({
  action: z.literal('open'),
  pillar: z.string().max(40).optional(),
  subject: z.string().max(120).optional(),
  classKey: z.string().max(40).optional(),
  serie: z.string().max(40).optional(),
  title: z.string().max(200).optional(),
}).strict();
export const sessionCloseInput = z.object({
  action: z.literal('close'),
  id: z.number().int().positive(),
  transcript: z.array(transcriptLine).max(200).optional(),
  done: z.boolean().optional(),
  minutes: z.number().int().min(0).max(600).optional(),
}).strict();

export const orientationInput = z.object({
  id: z.number().int().positive().optional(),
  track: z.enum(['parcoursup', 'mon_avenir']),
  formation: z.string().min(1).max(200),
  etablissement: z.string().max(200).optional(),
  ville: z.string().max(120).optional(),
  rank: z.number().int().min(1).max(50).optional(),
  status: z.enum(['envisage', 'candidate', 'accepte', 'refuse', 'confirme']).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const bougieInput = z.object({ on: z.boolean() }).strict();

export const examPdfInput = z.object({
  exam: z.string().min(1).max(60),
  subject: z.string().min(1).max(120),
}).strict();

/** Helper : parse sûr → {ok,data} | {ok:false,error}. Jamais d'exception non gérée. */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, error: r.error.issues.map((i) => i.path.join('.') + ':' + i.code).join(',') };
}
