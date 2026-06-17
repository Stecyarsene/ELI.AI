import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface SessionPdfData {
  title: string; subject?: string | null; classLabel?: string | null;
  dateLabel: string; summary: string; highlights: string[];
  transcript: { role: string; text: string }[];
}

const GREEN = rgb(0.043, 0.239, 0.18);   // #0B3D2E
const GOLD = rgb(0.96, 0.71, 0.27);
const GREEN_DEEP = rgb(0.059, 0.239, 0.18);
const LOGO_GREEN = rgb(0.141, 0.478, 0.2);   // #247A33
const GOLD_E = rgb(1, 0.70, 0);              // #FFB300
const GOLD_FLAME = rgb(1, 0.835, 0.31);      // #FFD54F
const MUTED = rgb(0.36, 0.42, 0.38);

/** Dessine le logo Éli (cercle vert, « E » doré, flamme de bougie, 3 points) — vectoriel, fidèle. */
function drawEliLogo(page: import('pdf-lib').PDFPage, cx: number, cy: number, r: number): void {
  const s = r / 86;
  const M = (dx: number, dy: number) => ({ x: cx + (dx - 100) * s, y: cy - (dy - 100) * s });
  page.drawCircle({ x: cx, y: cy, size: r, color: LOGO_GREEN });
  const bars: [number, number, number, number][] = [[61, 44, 13, 108], [61, 44, 78, 13], [61, 91, 60, 13], [61, 139, 78, 13]];
  for (const [rx, ry, w, h] of bars) {
    const bl = M(rx, ry + h);
    page.drawRectangle({ x: bl.x, y: bl.y, width: w * s, height: h * s, color: GOLD_E });
  }
  // Flamme de bougie (haut-droite), approximée par deux disques superposés.
  page.drawCircle({ x: cx + 0.42 * r, y: cy + 0.72 * r, size: 0.11 * r, color: GOLD_FLAME });
  page.drawCircle({ x: cx + 0.42 * r, y: cy + 0.82 * r, size: 0.06 * r, color: GOLD_FLAME });
  // 3 points en base.
  for (const [dx, dy, dr] of [[82, 172, 4.5], [100, 176, 5.5], [118, 172, 4.5]] as [number, number, number][]) {
    const p = M(dx, dy);
    page.drawCircle({ x: p.x, y: p.y, size: dr * s, color: GOLD_E });
  }
}

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
  '≥': '>=', '≤': '<=', '≠': '!=', '±': '+/-', '×': 'x', '÷': '/', '\u2212': '-',
  '√': 'racine ', '∞': 'l\'infini', 'π': 'pi', '≈': '~', '∈': 'appartient a', '∉': 'n\'appartient pas a',
  '∀': 'pour tout', '∃': 'il existe', '∑': 'somme', '∏': 'produit', '∫': 'integrale', '∂': 'd',
  '°': '°', 'µ': 'µ', '∅': 'vide', '⊂': 'inclus', '∪': 'union', '∩': 'inter',
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

/** PDF de marque pour le matériel pédagogique enseignant. Premium, épuré, jamais générique. */
export async function buildTeacherPdf(d: TeacherPdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const PW = 595, PH = 842, M = 54, W = PW - M * 2;
  let page = pdf.addPage([PW, PH]);
  let y = 0;

  const footer = (pg: import('pdf-lib').PDFPage) => {
    pg.drawLine({ start: { x: M, y: 40 }, end: { x: PW - M, y: 40 }, thickness: 0.6, color: rgb(0.89, 0.86, 0.80) });
    pg.drawText(winansi("L'intelligence au service de ta réussite"), { x: M, y: 28, size: 8.5, font: italic, color: GOLD });
    pg.drawText(winansi('Éli · Espace enseignant'), { x: PW - M - 120, y: 28, size: 8, font, color: MUTED });
  };
  const header = (pg: import('pdf-lib').PDFPage) => {
    pg.drawRectangle({ x: 0, y: PH - 96, width: PW, height: 96, color: GREEN });
    drawEliLogo(pg, M + 22, PH - 48, 22);
    pg.drawText('Éli', { x: M + 52, y: PH - 44, size: 20, font: bold, color: GOLD_FLAME });
    pg.drawText(winansi('Espace enseignant'), { x: M + 52, y: PH - 64, size: 11, font, color: rgb(0.85, 0.92, 0.88) });
    pg.drawText(winansi(d.meta.join('  ·  ')).slice(0, 88), { x: M + 52, y: PH - 80, size: 9, font, color: rgb(0.72, 0.84, 0.78) });
  };
  const newPage = () => { page = pdf.addPage([PW, PH]); header(page); footer(page); y = PH - 122; };

  header(page); footer(page);
  y = PH - 124;

  const emit = (txt: string, size: number, f = font, color = rgb(0.13, 0.16, 0.14), indent = 0, gapAfter = 6) => {
    for (const l of wrap(winansi(txt), f, size, W - indent)) {
      if (y < 58) newPage();
      page.drawText(l, { x: M + indent, y, size, font: f, color });
      y -= size + 5;
    }
    y -= gapAfter;
  };

  // Titre + filet doré
  emit(d.title, 19, bold, GREEN, 0, 4);
  page.drawLine({ start: { x: M, y: y + 4 }, end: { x: M + 64, y: y + 4 }, thickness: 2.2, color: GOLD });
  y -= 12;

  for (const node of parseMarkdown(d.markdown)) {
    if (node.kind === 'gap') { y -= 5; continue; }
    if (node.kind === 'h1') { y -= 4; if (y < 70) newPage(); emit(node.text, 15, bold, GREEN, 0, 3); }
    else if (node.kind === 'h2') { y -= 2; if (y < 66) newPage(); emit(node.text, 12.5, bold, GREEN_DEEP, 0, 2); }
    else if (node.kind === 'bullet') emit('•  ' + node.text, 11, font, rgb(0.13, 0.16, 0.14), 12, 3);
    else if (node.kind === 'num') emit(node.text, 11, font, rgb(0.13, 0.16, 0.14), 12, 3);
    else emit(node.text, 11, font, rgb(0.13, 0.16, 0.14), 0, 6);
  }
  return pdf.save();
}
