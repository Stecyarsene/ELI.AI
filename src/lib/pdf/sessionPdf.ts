import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface SessionPdfData {
  title: string; subject?: string | null; classLabel?: string | null;
  dateLabel: string; summary: string; highlights: string[];
  transcript: { role: string; text: string }[];
}

const GREEN = rgb(0.043, 0.239, 0.18);   // #0B3D2E
const GOLD = rgb(0.96, 0.71, 0.27);

function wrap(text: string, font: import('pdf-lib').PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of winansi(String(text || '')).split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      const t = line ? line + ' ' + word : word;
      if (font.widthOfTextAtSize(t, size) > maxW && line) { out.push(line); line = word; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

/** Génère le PDF récap d'une session de travail Éli. Retourne les octets. */
export async function buildSessionPdf(d: SessionPdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]); // A4
  const M = 50, W = 595 - M * 2;
  let y = 842;

  // En-tête vert Éli
  page.drawRectangle({ x: 0, y: 842 - 90, width: 595, height: 90, color: GREEN });
  page.drawText('Éli', { x: M, y: 842 - 56, size: 26, font: bold, color: GOLD });
  page.drawText('Récap de session', { x: M + 56, y: 842 - 54, size: 16, font: bold, color: rgb(1, 1, 1) });
  page.drawText(d.dateLabel, { x: M + 56, y: 842 - 72, size: 10, font, color: rgb(0.85, 0.92, 0.88) });
  y = 842 - 120;

  const line = (txt: string, size: number, f = font, color = rgb(0.1, 0.1, 0.1)) => {
    for (const l of wrap(txt, f, size, W)) {
      if (y < M + 40) { page = pdf.addPage([595, 842]); y = 842 - M; }
      page.drawText(l, { x: M, y, size, font: f, color });
      y -= size + 6;
    }
  };

  line(d.title || 'Session de travail', 18, bold, GREEN);
  if (d.subject) line((d.subject || '') + (d.classLabel ? '  ·  ' + d.classLabel : ''), 11, font, rgb(0.4, 0.4, 0.4));
  y -= 8;
  line('Ce que nous avons fait', 13, bold, GREEN); y -= 2;
  line(d.summary || '—', 11);
  y -= 10;
  if (d.highlights?.length) {
    line('Points clés', 13, bold, GREEN); y -= 2;
    for (const h of d.highlights) line('•  ' + h, 11);
    y -= 10;
  }
  if (d.transcript?.length) {
    line('Fil de la séance', 13, bold, GREEN); y -= 2;
    for (const t of d.transcript.slice(0, 30)) {
      const who = (t.role === 'eli' || t.role === 'assistant') ? 'Éli' : 'Moi';
      line(who + ' — ' + t.text, 10, font, who === 'Éli' ? GREEN : rgb(0.2, 0.2, 0.2));
    }
  }
  // Pied de page
  page.drawText('Généré par Éli · ton compagnon d\'apprentissage', { x: M, y: 28, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
  return pdf.save();
}

export interface ExamPdfData {
  examName: string; subject: string; intro: string;
  sections: { heading: string; items: string[] }[];
}

/** PDF de révision d'une épreuve d'examen (fiches kind=examen, ou axes de révision déduits). */
export async function buildExamPdf(d: ExamPdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]);
  const M = 50, W = 595 - M * 2;
  let y = 842;
  page.drawRectangle({ x: 0, y: 842 - 90, width: 595, height: 90, color: GREEN });
  page.drawText('Éli', { x: M, y: 842 - 56, size: 26, font: bold, color: GOLD });
  page.drawText('Fiche d\'épreuve · ' + d.examName, { x: M + 56, y: 842 - 54, size: 14, font: bold, color: rgb(1, 1, 1) });
  y = 842 - 120;
  const line = (txt: string, size: number, f = font, color = rgb(0.1, 0.1, 0.1)) => {
    for (const l of wrap(txt, f, size, W)) {
      if (y < M + 40) { page = pdf.addPage([595, 842]); y = 842 - M; }
      page.drawText(l, { x: M, y, size, font: f, color }); y -= size + 6;
    }
  };
  line(d.subject, 20, bold, GREEN);
  y -= 4;
  if (d.intro) { line(d.intro, 11, font, rgb(0.35, 0.35, 0.35)); y -= 8; }
  for (const sec of d.sections) {
    line(sec.heading, 13, bold, GREEN); y -= 2;
    for (const it of sec.items) line('•  ' + it, 11);
    y -= 10;
  }
  page.drawText('Généré par Éli · révise à ton rythme', { x: M, y: 28, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
  return pdf.save();
}

/* ───────── Assainissement WinAnsi (pdf-lib Helvetica n'encode que cp1252) ─────────
   Le contenu généré par l'IA (flèches, symboles maths, emojis, puces exotiques) ferait
   planter drawText. On mappe les symboles courants puis on retire tout caractère hors
   Latin-1 imprimable. Résultat : un texte toujours encodable, jamais d'erreur. */
const WINANSI_MAP: Record<string, string> = {
  '→': '->', '⇒': '=>', '➔': '->', '←': '<-', '↔': '<->', '⟶': '->',
  '≥': '>=', '≤': '<=', '≠': '!=', '±': '+/-', '×': 'x', '÷': '/', '·': '.',
  '√': 'racine ', '∞': 'l\'infini', 'π': 'pi', '≈': '~', '∈': 'appartient a', '∉': 'n\'appartient pas a',
  '∀': 'pour tout', '∃': 'il existe', '∑': 'somme', '∏': 'produit', '∫': 'integrale', '∂': 'd',
  '²': '2', '³': '3', '°': ' deg', 'µ': 'u', '∅': 'vide', '⊂': 'inclus', '∪': 'union', '∩': 'inter',
  '•': '-', '◦': '-', '▪': '-', '‣': '-', '–': '-', '—': '-', '…': '...',
  '“': '"', '”': '"', '«': '"', '»': '"', '‘': "'", '’': "'", '€': 'EUR', '\u00A0': ' ', '\t': '  ',
};
export function winansi(input: string): string {
  let s = String(input ?? '');
  for (const [k, v] of Object.entries(WINANSI_MAP)) s = s.split(k).join(v);
  // Retire tout ce qui dépasse Latin-1 (emojis, idéogrammes, symboles restants).
  let out = '';
  for (const ch of s) { const c = ch.codePointAt(0) ?? 0; out += c <= 0xff ? ch : ''; }
  return out;
}

export interface TeacherPdfData {
  title: string;
  meta: string[];          // lignes de contexte (programme, classe, série, matière, notion, type)
  markdown: string;        // texte intégral généré par l'IA (markdown léger)
}

/** Aplatit un markdown léger en lignes typées (titre/puce/numéro/paragraphe). */
function parseMarkdown(md: string): { kind: 'h1' | 'h2' | 'bullet' | 'num' | 'p' | 'gap'; text: string }[] {
  const lines: { kind: 'h1' | 'h2' | 'bullet' | 'num' | 'p' | 'gap'; text: string }[] = [];
  const strip = (t: string) => t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]*)`/g, '$1').replace(/^\s*#{1,6}\s*/, '').trim();
  for (const rawLine of String(md || '').split('\n')) {
    const l = rawLine.replace(/\s+$/, '');
    if (!l.trim()) { lines.push({ kind: 'gap', text: '' }); continue; }
    if (/^#{1}\s/.test(l)) lines.push({ kind: 'h1', text: strip(l) });
    else if (/^#{2,6}\s/.test(l)) lines.push({ kind: 'h2', text: strip(l) });
    else if (/^\s*[-*•]\s+/.test(l)) lines.push({ kind: 'bullet', text: strip(l.replace(/^\s*[-*•]\s+/, '')) });
    else if (/^\s*\d+[.)]\s+/.test(l)) lines.push({ kind: 'num', text: strip(l) });
    else lines.push({ kind: 'p', text: strip(l) });
  }
  return lines;
}

/** PDF de marque pour le matériel pédagogique enseignant (T3 §c). Toujours imprimable. */
export async function buildTeacherPdf(d: TeacherPdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]);
  const M = 50, W = 595 - M * 2;
  let y = 842;

  page.drawRectangle({ x: 0, y: 842 - 92, width: 595, height: 92, color: GREEN });
  page.drawText('Éli', { x: M, y: 842 - 56, size: 26, font: bold, color: GOLD });
  page.drawText(winansi('Espace enseignant'), { x: M + 58, y: 842 - 50, size: 13, font: bold, color: rgb(1, 1, 1) });
  page.drawText(winansi(d.meta.join('  ·  ')).slice(0, 90), { x: M + 58, y: 842 - 70, size: 9.5, font, color: rgb(0.85, 0.92, 0.88) });
  y = 842 - 122;

  const emit = (txt: string, size: number, f = font, color = rgb(0.12, 0.12, 0.12), indent = 0) => {
    for (const l of wrap(winansi(txt), f, size, W - indent)) {
      if (y < M + 44) { page = pdf.addPage([595, 842]); y = 842 - M; }
      page.drawText(l, { x: M + indent, y, size, font: f, color });
      y -= size + 6;
    }
  };

  emit(d.title, 19, bold, GREEN);
  y -= 6;
  for (const node of parseMarkdown(d.markdown)) {
    if (node.kind === 'gap') { y -= 6; continue; }
    if (node.kind === 'h1') { y -= 4; emit(node.text, 15, bold, GREEN); y -= 2; }
    else if (node.kind === 'h2') { y -= 2; emit(node.text, 13, bold, rgb(0.06, 0.3, 0.22)); y -= 1; }
    else if (node.kind === 'bullet') emit('-  ' + node.text, 11, font, rgb(0.12, 0.12, 0.12), 10);
    else if (node.kind === 'num') emit(node.text, 11, font, rgb(0.12, 0.12, 0.12), 10);
    else emit(node.text, 11);
  }
  page.drawText(winansi('Généré par Éli · assistant pédagogique · contenu original'), { x: M, y: 28, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
  return pdf.save();
}
