"""
elidoc.py — Générateur de PDF de marque Éli (reportlab).
Charte : vert profond + or, mise en page épurée et premium.

RÈGLE TOFU (impérative) : tout le texte doit être encodable en cp1252.
Pas de fleches/symboles Unicode hors cp1252 ( -> , >= , <= , x , "racine", "Delta", "lambda" ...).
scan_cp1252() leve une erreur AVANT le rendu si un caractere interdit est present.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether, NextPageTemplate,
)

# ── Palette de marque ──
GREEN_DEEP = colors.HexColor("#0B3D2E")
GREEN = colors.HexColor("#0B6B3A")
GREEN_SOFT = colors.HexColor("#12894B")
GOLD = colors.HexColor("#BF9B49")
GOLD_BRIGHT = colors.HexColor("#E4C66B")
INK = colors.HexColor("#16241C")
MUTED = colors.HexColor("#5C6A60")
CANVAS = colors.HexColor("#FBFAF6")
LINE = colors.HexColor("#E5E0D3")

SECTION_COLORS = {
    "Objectif": GREEN,
    "Prerequis": colors.HexColor("#6B5BD2"),
    "Cours": GREEN_DEEP,
    "Methode": colors.HexColor("#0E6F86"),
    "Exemple": colors.HexColor("#8A6D1F"),
    "Erreurs frequentes": colors.HexColor("#B23A48"),
    "Entrainement": colors.HexColor("#1B7A4B"),
}

# ── Identite de marque (reprise du pied de page du site) ──
ELI_SLOGAN = "L'intelligence au service de ta reussite"
ELI_TAGLINE = ("Aide aux devoirs, entrainement a l'oral, suivi quotidien et preparation aux examens. "
               "Eli accompagne chaque eleve, partout, a toute heure.")
ELI_COPY = "(c) 2026 Eli, tous droits reserves."
# Couleurs fideles au logo du site
LOGO_GREEN = colors.HexColor("#247A33")
LOGO_GOLD = colors.HexColor("#FFB300")
LOGO_FLAME = colors.HexColor("#FFD54F")


def scan_cp1252(text):
    """Leve ValueError si un caractere n'est pas encodable cp1252 (anti-tofu)."""
    bad = []
    for i, ch in enumerate(text):
        try:
            ch.encode("cp1252")
        except UnicodeEncodeError:
            bad.append((i, ch, hex(ord(ch))))
    if bad:
        sample = ", ".join("%r(%s)" % (c, h) for _, c, h in bad[:20])
        raise ValueError("Caracteres non-cp1252 (tofu) detectes: %s" % sample)


def _styles():
    ss = getSampleStyleSheet()
    out = {}
    out["title"] = ParagraphStyle("title", parent=ss["Title"], fontName="Helvetica-Bold",
                                  fontSize=26, leading=30, textColor=GREEN_DEEP, alignment=TA_CENTER)
    out["subtitle"] = ParagraphStyle("subtitle", fontName="Helvetica", fontSize=13, leading=18,
                                     textColor=MUTED, alignment=TA_CENTER)
    out["chapter"] = ParagraphStyle("chapter", fontName="Helvetica-Bold", fontSize=18, leading=22,
                                    textColor=GREEN_DEEP, spaceBefore=6, spaceAfter=10)
    out["section"] = ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=12.5, leading=16,
                                    textColor=colors.white, spaceBefore=4, spaceAfter=4)
    out["body"] = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=15.5,
                                 textColor=INK, alignment=TA_LEFT, spaceAfter=5)
    out["bullet"] = ParagraphStyle("bullet", parent=out["body"], leftIndent=12, bulletIndent=2, spaceAfter=3)
    out["small"] = ParagraphStyle("small", fontName="Helvetica", fontSize=8.5, leading=11, textColor=MUTED)
    return out


class EliDoc(BaseDocTemplate):
    def __init__(self, path, brand_sub, **kw):
        super().__init__(path, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                         topMargin=26 * mm, bottomMargin=20 * mm, **kw)
        self.brand_sub = brand_sub
        frame = Frame(self.leftMargin, self.bottomMargin,
                      self.width, self.height, id="main")
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[frame], onPage=self._cover_bg),
            PageTemplate(id="body", frames=[frame], onPage=self._header_footer),
        ])

    def _logo(self, c, x, y, r):
        """Logo Eli fidele au site : cercle vert, 'E' dore, flamme de bougie, 3 points.
        Mappe le design SVG (viewBox 200x200, centre 100,100, cercle r=86) sur (x,y,r)."""
        s = r / 86.0
        def M(dx, dy):
            return (x + (dx - 100) * s, y - (dy - 100) * s)
        c.saveState()
        # Cercle vert
        c.setFillColor(LOGO_GREEN)
        c.circle(x, y, r, fill=1, stroke=0)
        # 'E' dore (4 barres arrondies)
        c.setFillColor(LOGO_GOLD)
        for rx, ry, w, h in [(61, 44, 13, 108), (61, 44, 78, 13), (61, 91, 60, 13), (61, 139, 78, 13)]:
            lx, ly = M(rx, ry + h)
            c.roundRect(lx, ly, w * s, h * s, 3 * s, fill=1, stroke=0)
        # Flamme de bougie (haut-droite)
        c.setFillColor(LOGO_FLAME)
        p = c.beginPath()
        p.moveTo(*M(147, 44))
        p.curveTo(*M(145, 34), *M(141, 24), *M(147, 12))
        p.curveTo(*M(150, 5), *M(156, 1), *M(156, 1))
        p.curveTo(*M(156, 1), *M(167, 10), *M(164, 24))
        p.curveTo(*M(162, 32), *M(156, 38), *M(156, 44))
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        # 3 points (base)
        c.setFillColor(LOGO_GOLD)
        for dx, dy, dr in [(82, 172, 4.5), (100, 176, 5.5), (118, 172, 4.5)]:
            cx, cy = M(dx, dy)
            c.circle(cx, cy, dr * s, fill=1, stroke=0)
        c.restoreState()

    def _cover_bg(self, c, doc):
        w, h = A4
        c.setFillColor(CANVAS)
        c.rect(0, 0, w, h, fill=1, stroke=0)
        c.setFillColor(GREEN_DEEP)
        c.rect(0, h - 8 * mm, w, 8 * mm, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(0, 0, w, 6 * mm, fill=1, stroke=0)
        self._logo(c, w / 2, h - 70 * mm, 18 * mm)
        # Devise (slogan) + tagline en bas de couverture
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Oblique", 13)
        c.drawCentredString(w / 2, 78, ELI_SLOGAN)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8.5)
        c.drawCentredString(w / 2, 60, ELI_COPY)

    def _header_footer(self, c, doc):
        w, h = A4
        c.saveState()
        # bandeau haut
        c.setFillColor(GREEN_DEEP)
        c.rect(0, h - 14 * mm, w, 14 * mm, fill=1, stroke=0)
        self._logo(c, 18 * mm, h - 7 * mm, 4.6 * mm)
        c.setFillColor(GOLD_BRIGHT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(26 * mm, h - 8.6 * mm, "Eli")
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 8.5)
        c.drawString(34 * mm, h - 8.6 * mm, self.brand_sub)
        # pied : devise a gauche, copyright + page a droite
        c.setStrokeColor(LINE)
        c.line(20 * mm, 14 * mm, w - 20 * mm, 14 * mm)
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Oblique", 8.5)
        c.drawString(20 * mm, 10 * mm, ELI_SLOGAN)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawRightString(w - 20 * mm, 10 * mm, "%s   -   Page %d" % (ELI_COPY, doc.page))
        c.restoreState()


def _section_block(title, paras, st):
    """Bloc section : bandeau coloré + contenu (gardé ensemble si possible)."""
    color = SECTION_COLORS.get(title, GREEN)
    head = Table([[Paragraph(title.upper(), st["section"])]], colWidths=[170 * mm])
    head.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROUNDEDCORNERS", [4, 4, 0, 0]),
    ]))
    flow = [head, Spacer(1, 4)]
    for p in paras:
        if isinstance(p, tuple) and p[0] == "li":
            flow.append(Paragraph("- " + p[1], st["bullet"]))
        else:
            flow.append(Paragraph(p, st["body"]))
    flow.append(Spacer(1, 9))
    return flow


def build_course(path, title, subtitle, brand_sub, chapters, intro=None):
    """
    chapters : liste de dict {
        "titre": str,
        "sections": [ (nom_section, [paragraphes_ou_(\"li\",texte)]) , ... ]
    }
    Sections attendues (ordre pedagogique) : Objectif, Prerequis, Cours, Methode,
    Exemple, Erreurs frequentes, Entrainement.
    """
    # Scan anti-tofu global
    blob = title + subtitle + brand_sub + (intro or "")
    for ch in chapters:
        blob += ch["titre"]
        for name, paras in ch["sections"]:
            blob += name
            for p in paras:
                blob += p[1] if isinstance(p, tuple) else p
    scan_cp1252(blob)

    st = _styles()
    doc = EliDoc(path, brand_sub)
    story = []
    # ── Couverture ──
    story.append(Spacer(1, 92 * mm))
    story.append(Paragraph(title, st["title"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(subtitle, st["subtitle"]))
    story.append(Spacer(1, 18))
    if intro:
        story.append(Paragraph(intro, ParagraphStyle("introc", parent=st["body"], alignment=TA_CENTER, textColor=MUTED)))
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())
    # ── Corps ──
    for i, ch in enumerate(chapters):
        head = [Paragraph("Chapitre %d - %s" % (i + 1, ch["titre"]), st["chapter"]),
                _Rule(), Spacer(1, 8)]
        story.extend(head)
        for name, paras in ch["sections"]:
            story.extend(_section_block(name, paras, st))
        if i < len(chapters) - 1:
            story.append(PageBreak())
    doc.build(story)
    return path


def build_document(path, title, subtitle, brand_sub, sections, intro=None):
    """
    Document de marque generique (rapport, CDC, master prompt...).
    sections : liste de dict {
        "h": titre de section (niveau 1),
        "blocks": [ str (paragraphe) | ("li", str) | ("h2", str) | ("quote", str) | ("kv", [(k,v),...]) ]
    }
    """
    blob = title + subtitle + brand_sub + (intro or "")
    for s in sections:
        blob += s.get("h", "")
        for b in s.get("blocks", []):
            if isinstance(b, tuple):
                if b[0] == "kv":
                    for k, v in b[1]:
                        blob += k + v
                else:
                    blob += b[1]
            else:
                blob += b
    scan_cp1252(blob)

    st = _styles()
    # Mise en page "manifeste" : corps plus genereux et aere (sans impacter build_course).
    st["body"] = ParagraphStyle("bodydoc", fontName="Helvetica", fontSize=11.5, leading=18,
                                textColor=INK, alignment=TA_LEFT, spaceAfter=9)
    st["bullet"] = ParagraphStyle("bulletdoc", parent=st["body"], leftIndent=14, bulletIndent=2, spaceAfter=6)
    st["chapter"] = ParagraphStyle("chapterdoc", fontName="Helvetica-Bold", fontSize=18, leading=23,
                                   textColor=GREEN_DEEP, spaceBefore=10, spaceAfter=12)
    st["h2doc"] = ParagraphStyle("h2doc", fontName="Helvetica-Bold", fontSize=13, leading=18,
                                 textColor=GREEN, spaceBefore=12, spaceAfter=6)
    st["quote"] = ParagraphStyle("quote", parent=st["body"], leftIndent=14, textColor=GREEN_DEEP,
                                 fontName="Helvetica-Oblique", borderPadding=(0, 0, 0, 0))
    doc = EliDoc(path, brand_sub)
    story = [Spacer(1, 92 * mm), Paragraph(title, st["title"]), Spacer(1, 6),
             Paragraph(subtitle, st["subtitle"]), Spacer(1, 18)]
    if intro:
        story.append(Paragraph(intro, ParagraphStyle("introc2", parent=st["body"], alignment=TA_CENTER, textColor=MUTED)))
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    # Sommaire (utile pour les longs documents de reference).
    if len(sections) >= 8:
        story.append(Paragraph("Sommaire", st["chapter"]))
        story.append(_Rule())
        story.append(Spacer(1, 10))
        toc = ParagraphStyle("toc", parent=st["body"], spaceAfter=5, leading=17)
        for i, s in enumerate(sections):
            if s.get("h"):
                story.append(Paragraph("%d.&nbsp;&nbsp;%s" % (i + 1, s["h"]), toc))
        story.append(PageBreak())

    for i, s in enumerate(sections):
        if s.get("h"):
            story.append(Paragraph("%d. %s" % (i + 1, s["h"]), st["chapter"]))
            story.append(_Rule())
            story.append(Spacer(1, 8))
        for b in s.get("blocks", []):
            if isinstance(b, tuple):
                if b[0] == "li":
                    story.append(Paragraph("- " + b[1], st["bullet"]))
                elif b[0] == "h2":
                    story.append(Paragraph(b[1], st["h2doc"]))
                elif b[0] == "quote":
                    story.append(Paragraph('"' + b[1] + '"', st["quote"]))
                    story.append(Spacer(1, 4))
                elif b[0] == "kv":
                    rows = [[Paragraph("<b>%s</b>" % k, st["body"]), Paragraph(v, st["body"])] for k, v in b[1]]
                    t = Table(rows, colWidths=[45 * mm, 125 * mm])
                    t.setStyle(TableStyle([
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 6))
            else:
                story.append(Paragraph(b, st["body"]))
        story.append(Spacer(1, 8))
    doc.build(story)
    return path


# ── Helpers flowables ──
from reportlab.platypus import Flowable


class _Rule(Flowable):
    def __init__(self, width=170 * mm, color=GOLD):
        super().__init__()
        self.width = width
        self.color = color
        self.height = 2

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(1.4)
        self.canv.line(0, 0, self.width, 0)
