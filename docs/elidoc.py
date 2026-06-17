# -*- coding: utf-8 -*-
"""
elidoc.py — Generateur de documents de marque Eli (reportlab), version PREMIUM.
- Police Unicode (Liberation Sans) : accents francais corrects.
- Couverture pro (bandeau, logo, devise, bloc reference/confidentiel).
- Sommaire pagine (numeros de page), encadres (callouts), tableaux a en-tete vert.
- En-tete et pied de page professionnels.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    Table, TableStyle, NextPageTemplate, Flowable,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Police Unicode (accents) ──
_FD = "/usr/share/fonts/truetype/liberation"
pdfmetrics.registerFont(TTFont("Eli", _FD + "/LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Eli-B", _FD + "/LiberationSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Eli-I", _FD + "/LiberationSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Eli-BI", _FD + "/LiberationSans-BoldItalic.ttf"))
registerFontFamily("Eli", normal="Eli", bold="Eli-B", italic="Eli-I", boldItalic="Eli-BI")

# ── Palette ──
GREEN_DEEP = colors.HexColor("#0F3D2E")
GREEN = colors.HexColor("#0B6B3A")
GREEN_SOFT = colors.HexColor("#12894B")
GOLD = colors.HexColor("#C49A3F")
GOLD_BRIGHT = colors.HexColor("#FFD54F")
INK = colors.HexColor("#1B2A22")
MUTED = colors.HexColor("#5C6A60")
CANVAS = colors.HexColor("#FBFAF6")
LINE = colors.HexColor("#E2DCCD")
CALLOUT_BG = colors.HexColor("#EAF3EC")

ELI_SLOGAN = "L'intelligence au service de ta réussite"
ELI_PLATFORM = "Éli — Plateforme éducative IA · Gabon"
LOGO_GREEN = colors.HexColor("#247A33")
LOGO_GOLD = colors.HexColor("#FFB300")
LOGO_FLAME = colors.HexColor("#FFD54F")


def scan_cp1252(text):
    """Conservee pour compat ; avec police Unicode, ne bloque plus les accents."""
    return True


def _logo(c, x, y, r):
    s = r / 86.0
    def M(dx, dy):
        return (x + (dx - 100) * s, y - (dy - 100) * s)
    c.saveState()
    c.setFillColor(LOGO_GREEN)
    c.circle(x, y, r, fill=1, stroke=0)
    c.setFillColor(LOGO_GOLD)
    for rx, ry, w, h in [(61, 44, 13, 108), (61, 44, 78, 13), (61, 91, 60, 13), (61, 139, 78, 13)]:
        lx, ly = M(rx, ry + h)
        c.roundRect(lx, ly, w * s, h * s, 3 * s, fill=1, stroke=0)
    c.setFillColor(LOGO_FLAME)
    p = c.beginPath()
    p.moveTo(*M(147, 44)); p.curveTo(*M(145, 34), *M(141, 24), *M(147, 12))
    p.curveTo(*M(150, 5), *M(156, 1), *M(156, 1)); p.curveTo(*M(156, 1), *M(167, 10), *M(164, 24))
    p.curveTo(*M(162, 32), *M(156, 38), *M(156, 44)); p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(LOGO_GOLD)
    for dx, dy, dr in [(82, 172, 4.5), (100, 176, 5.5), (118, 172, 4.5)]:
        cx, cy = M(dx, dy); c.circle(cx, cy, dr * s, fill=1, stroke=0)
    c.restoreState()


class _Rule(Flowable):
    def __init__(self, width=170 * mm, color=GOLD, w=1.4):
        super().__init__(); self.width = width; self.color = color; self.height = 3; self.w = w
    def draw(self):
        self.canv.setStrokeColor(self.color); self.canv.setLineWidth(self.w)
        self.canv.line(0, 0, self.width, 0)


def _styles():
    out = {}
    out["title"] = ParagraphStyle("title", fontName="Eli-B", fontSize=27, leading=31,
                                  textColor=colors.white, alignment=TA_LEFT)
    out["title_dark"] = ParagraphStyle("title_dark", fontName="Eli-B", fontSize=27, leading=31,
                                       textColor=GREEN_DEEP, alignment=TA_LEFT)
    out["subtitle"] = ParagraphStyle("subtitle", fontName="Eli-B", fontSize=15, leading=20,
                                     textColor=GOLD, alignment=TA_LEFT)
    out["desc"] = ParagraphStyle("desc", fontName="Eli", fontSize=12, leading=18,
                                 textColor=MUTED, alignment=TA_LEFT)
    out["sec"] = ParagraphStyle("SecHead", fontName="Eli-B", fontSize=18, leading=23,
                                textColor=GREEN_DEEP, spaceBefore=6, spaceAfter=6)
    out["part"] = ParagraphStyle("PartHead", fontName="Eli-B", fontSize=23, leading=29,
                                 textColor=GREEN_DEEP, alignment=TA_CENTER)
    out["h2"] = ParagraphStyle("h2", fontName="Eli-B", fontSize=13, leading=18,
                               textColor=GREEN, spaceBefore=10, spaceAfter=4)
    out["body"] = ParagraphStyle("body", fontName="Eli", fontSize=11.3, leading=18,
                                 textColor=INK, alignment=TA_JUSTIFY, spaceAfter=10)
    out["bullet"] = ParagraphStyle("bullet", parent=out["body"], leftIndent=14, spaceAfter=7)
    out["quote"] = ParagraphStyle("quote", parent=out["body"], fontName="Eli-I", textColor=GREEN_DEEP)
    out["cell"] = ParagraphStyle("cell", fontName="Eli", fontSize=9.5, leading=13, textColor=INK)
    out["cellh"] = ParagraphStyle("cellh", fontName="Eli-B", fontSize=9.5, leading=13, textColor=colors.white)
    out["co_t"] = ParagraphStyle("co_t", fontName="Eli-B", fontSize=10.5, leading=14, textColor=GREEN_DEEP)
    out["co_b"] = ParagraphStyle("co_b", fontName="Eli", fontSize=10, leading=15, textColor=INK)
    return out


class EliDoc(BaseDocTemplate):
    def __init__(self, path, brand_sub, reference="", confidential=True, **kw):
        super().__init__(path, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                         topMargin=24 * mm, bottomMargin=18 * mm, **kw)
        self.brand_sub = brand_sub
        self.reference = reference
        self.confidential = confidential
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        cover = Frame(0, 0, A4[0], A4[1], id="cover", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover], onPage=self._cover),
            PageTemplate(id="body", frames=[frame], onPage=self._hf),
        ])

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            name = flowable.style.name
            if name == "PartHead":
                self.notify("TOCEntry", (0, flowable.getPlainText(), self.page))
            elif name == "SecHead":
                self.notify("TOCEntry", (1, flowable.getPlainText(), self.page))

    def _cover(self, c, doc):
        w, h = A4
        c.setFillColor(CANVAS); c.rect(0, 0, w, h, fill=1, stroke=0)
        # bandeau vert haut
        band = h * 0.46
        c.setFillColor(GREEN_DEEP); c.rect(0, h - band, w, band, fill=1, stroke=0)
        _logo(c, w / 2, h - band * 0.42, 20 * mm)
        c.setFillColor(colors.white); c.setFont("Eli-B", 26)
        c.drawCentredString(w / 2, h - band * 0.72, "Éli")
        c.setFillColor(GOLD_BRIGHT); c.setFont("Eli-I", 12)
        c.drawCentredString(w / 2, h - band * 0.82, ELI_SLOGAN)
        # bas de page : confidentiel + barre or
        c.setFillColor(GOLD); c.rect(0, 0, w, 5 * mm, fill=1, stroke=0)

    def _hf(self, c, doc):
        w, h = A4
        c.saveState()
        # en-tete
        _logo(c, 22 * mm, h - 14 * mm, 4.6 * mm)
        c.setFillColor(GREEN_DEEP); c.setFont("Eli-B", 10)
        c.drawString(27 * mm, h - 15.4 * mm, "Éli")
        c.setFillColor(MUTED); c.setFont("Eli", 8.5)
        c.drawRightString(w - 20 * mm, h - 15.4 * mm, self.brand_sub)
        c.setStrokeColor(LINE); c.setLineWidth(0.6)
        c.line(20 * mm, h - 18 * mm, w - 20 * mm, h - 18 * mm)
        # pied
        c.line(20 * mm, 13 * mm, w - 20 * mm, 13 * mm)
        c.setFillColor(MUTED); c.setFont("Eli", 8)
        left = (self.reference + (" · Confidentiel" if self.confidential else "")).strip(" ·")
        c.drawString(20 * mm, 9 * mm, left)
        c.drawCentredString(w / 2, 9 * mm, ELI_PLATFORM)
        c.drawRightString(w - 20 * mm, 9 * mm, "Page %d" % doc.page)
        c.restoreState()


def _table(headers, rows, st, col_widths=None):
    data = [[Paragraph(str(x), st["cellh"]) for x in headers]]
    for r in rows:
        data.append([Paragraph(str(x), st["cell"]) for x in r])
    n = len(headers)
    if not col_widths:
        col_widths = [170 * mm / n] * n
    else:
        col_widths = [c * mm for c in col_widths]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), GREEN_DEEP),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE),
        ("LINEAFTER", (0, 0), (-2, -1), 0.4, LINE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F4F1E8")))
    t.setStyle(TableStyle(style))
    return t


def _callout(title, text, st):
    inner = []
    if title:
        inner.append(Paragraph(title, st["co_t"]))
        inner.append(Spacer(1, 3))
    inner.append(Paragraph(text, st["co_b"]))
    box = Table([[inner]], colWidths=[166 * mm])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CALLOUT_BG),
        ("LINEBEFORE", (0, 0), (0, -1), 3, GREEN),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return box


def _render_blocks(story, blocks, st):
    for b in blocks:
        if isinstance(b, tuple):
            tag = b[0]
            if tag == "li":
                story.append(Paragraph("•&nbsp;&nbsp;" + b[1], st["bullet"]))
            elif tag == "h2":
                story.append(Paragraph(b[1], st["h2"]))
            elif tag == "quote":
                story.append(_callout("", b[1], st)); story.append(Spacer(1, 6))
            elif tag == "callout":
                story.append(_callout(b[1], b[2], st)); story.append(Spacer(1, 8))
            elif tag == "kv":
                rows = [[Paragraph("<b>%s</b>" % k, st["cell"]), Paragraph(v, st["cell"])] for k, v in b[1]]
                t = Table(rows, colWidths=[48 * mm, 122 * mm])
                t.setStyle(TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]))
                story.append(t); story.append(Spacer(1, 6))
            elif tag == "table":
                cw = b[3] if len(b) > 3 else None
                story.append(_table(b[1], b[2], st, cw)); story.append(Spacer(1, 8))
        else:
            story.append(Paragraph(b, st["body"]))


def build_document(path, title, subtitle, brand_sub, sections, intro=None,
                   reference="", version="", date="", confidential=True, page_per_section=False):
    st = _styles()
    doc = EliDoc(path, brand_sub, reference=reference, confidential=confidential)

    # ── Couverture (frame plein page) ──
    story = []
    w, h = A4
    story.append(Spacer(1, h * 0.50))
    story.append(Table([[Paragraph(title, st["title_dark"])]], colWidths=[w - 40 * mm],
                       style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    story.append(Spacer(1, 4))
    story.append(Table([[Paragraph(subtitle, st["subtitle"])]], colWidths=[w - 40 * mm],
                       style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    story.append(Spacer(1, 14))
    if intro:
        story.append(Table([[Paragraph(intro, st["desc"])]], colWidths=[w - 40 * mm],
                           style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    story.append(Spacer(1, 22))
    story.append(Table([[_Rule(width=w - 40 * mm, color=GOLD)]], colWidths=[w - 40 * mm],
                       style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    story.append(Spacer(1, 14))
    ref_line = " · ".join([x for x in [("Référence : " + reference) if reference else "",
                                       ("Version " + version) if version else "", date] if x])
    conf_line = "Document stratégique · Diffusion restreinte — Confidentiel" if confidential else ""
    refp = ParagraphStyle("refp", fontName="Eli", fontSize=10, leading=15, textColor=MUTED)
    if ref_line:
        story.append(Table([[Paragraph(ref_line, refp)]], colWidths=[w - 40 * mm],
                           style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    if conf_line:
        story.append(Table([[Paragraph(conf_line, refp)]], colWidths=[w - 40 * mm],
                           style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm)]))

    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    # ── Sommaire pagine ──
    real = [s for s in sections if s.get("h")]
    if len(real) >= 6:
        toc_title = ParagraphStyle("TocTitle", fontName="Eli-B", fontSize=18, leading=23, textColor=GREEN_DEEP)
        story.append(Paragraph("Sommaire", toc_title))
        story.append(_Rule()); story.append(Spacer(1, 10))
        toc = TableOfContents()
        toc.levelStyles = [
            ParagraphStyle("toc0", fontName="Eli-B", fontSize=11.5, leading=20, textColor=GREEN_DEEP, spaceBefore=6),
            ParagraphStyle("toc1", fontName="Eli", fontSize=10.5, leading=17, leftIndent=16, textColor=INK),
        ]
        story.append(toc)
        story.append(PageBreak())

    # ── Corps ──
    idx = 0
    first = True
    for s in sections:
        if s.get("divider"):
            story.append(PageBreak()); story.append(Spacer(1, 70 * mm))
            story.append(Paragraph(s["divider"], st["part"]))
            story.append(Spacer(1, 6)); story.append(_Rule(width=80 * mm, color=GOLD))
            first = True
            continue
        if s.get("h"):
            idx += 1
            if (page_per_section or s.get("brk")) and not first:
                story.append(PageBreak())
            first = False
            story.append(Paragraph("%d. %s" % (idx, s["h"]), st["sec"]))
            story.append(_Rule()); story.append(Spacer(1, 8))
        _render_blocks(story, s.get("blocks", []), st)
        story.append(Spacer(1, 6))

    doc.multiBuild(story)
    return path


# ====================== build_course (cours, format pedagogique) ======================
SECTION_COLORS = {
    "Objectif": GREEN, "Prérequis": colors.HexColor("#6B5BD2"), "Cours": GREEN_DEEP,
    "Méthode": colors.HexColor("#0E6F86"), "Exemple": colors.HexColor("#8A6D1F"),
    "Erreurs fréquentes": colors.HexColor("#B23A48"), "Entraînement": colors.HexColor("#1B7A4B"),
    # compat sans accents
    "Prerequis": colors.HexColor("#6B5BD2"), "Methode": colors.HexColor("#0E6F86"),
    "Erreurs frequentes": colors.HexColor("#B23A48"), "Entrainement": colors.HexColor("#1B7A4B"),
}


def _course_styles():
    s = _styles()
    s["chapter"] = ParagraphStyle("chapter", fontName="Eli-B", fontSize=18, leading=22,
                                  textColor=GREEN_DEEP, spaceBefore=6, spaceAfter=10)
    s["secband"] = ParagraphStyle("secband", fontName="Eli-B", fontSize=12, leading=16, textColor=colors.white)
    s["cbody"] = ParagraphStyle("cbody", fontName="Eli", fontSize=10.5, leading=15.5, textColor=INK,
                                alignment=TA_JUSTIFY, spaceAfter=5)
    s["cbul"] = ParagraphStyle("cbul", parent=s["cbody"], leftIndent=12, spaceAfter=3)
    return s


def _course_band(title, paras, st):
    color = SECTION_COLORS.get(title, GREEN)
    head = Table([[Paragraph(title.upper(), st["secband"])]], colWidths=[170 * mm])
    head.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), color),
                              ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                              ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    flow = [head, Spacer(1, 4)]
    for p in paras:
        if isinstance(p, tuple) and p[0] == "li":
            flow.append(Paragraph("•&nbsp;&nbsp;" + p[1], st["cbul"]))
        else:
            flow.append(Paragraph(p, st["cbody"]))
    flow.append(Spacer(1, 9))
    return flow


def build_course(path, title, subtitle, brand_sub, chapters, intro=None):
    st = _course_styles()
    doc = EliDoc(path, brand_sub, reference="", confidential=False)
    w, h = A4
    story = [Spacer(1, h * 0.50)]
    story.append(Table([[Paragraph(title, st["title_dark"])]], colWidths=[w - 40 * mm],
                       style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    story.append(Spacer(1, 4))
    story.append(Table([[Paragraph(subtitle, st["subtitle"])]], colWidths=[w - 40 * mm],
                       style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    story.append(Spacer(1, 14))
    if intro:
        story.append(Table([[Paragraph(intro, st["desc"])]], colWidths=[w - 40 * mm],
                           style=[("LEFTPADDING", (0, 0), (-1, -1), 20 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 20 * mm)]))
    story.append(NextPageTemplate("body")); story.append(PageBreak())
    for i, ch in enumerate(chapters):
        story.append(Paragraph("Chapitre %d — %s" % (i + 1, ch["titre"]), st["chapter"]))
        story.append(_Rule()); story.append(Spacer(1, 8))
        for name, paras in ch["sections"]:
            story.extend(_course_band(name, paras, st))
        if i < len(chapters) - 1:
            story.append(PageBreak())
    doc.build(story)
    return path
