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
  for (const para of String(text || '').split('\n')) {
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
