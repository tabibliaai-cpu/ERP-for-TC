#!/usr/bin/env python3
"""
CovenantERP — Complete Feature Audit Report Generator
Generates a comprehensive PDF using ReportLab with professional formatting.
"""

import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Image, Frame, PageTemplate,
    BaseDocTemplate, NextPageTemplate, Flowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle
from reportlab.graphics import renderPDF
from io import BytesIO
from datetime import datetime

# ─── COLOR PALETTE ───────────────────────────────────────────────────────────
DARK_NAVY    = HexColor('#0D1B2A')
NAVY         = HexColor('#1B2A4A')
DEEP_BLUE    = HexColor('#1F3A5F')
ACCENT_BLUE  = HexColor('#3B82F6')
LIGHT_BLUE   = HexColor('#DBEAFE')
PALE_BLUE    = HexColor('#EFF6FF')
MEDIUM_GRAY  = HexColor('#6B7280')
LIGHT_GRAY   = HexColor('#F3F4F6')
BORDER_GRAY  = HexColor('#D1D5DB')
WHITE        = HexColor('#FFFFFF')

# Status colors
GREEN_BG     = HexColor('#DCFCE7')
GREEN_TEXT   = HexColor('#166534')
GREEN_BORDER = HexColor('#86EFAC')
AMBER_BG     = HexColor('#FEF3C7')
AMBER_TEXT   = HexColor('#92400E')
AMBER_BORDER = HexColor('#FCD34D')
RED_BG       = HexColor('#FEE2E2')
RED_TEXT     = HexColor('#991B1B')
RED_BORDER   = HexColor('#FCA5A5')

OUTPUT_PATH = '/home/z/my-project/download/CovenantERP_Feature_Audit_Report.pdf'

# ─── CUSTOM FLOWABLES ────────────────────────────────────────────────────────

class ColoredRect(Flowable):
    """A colored rectangle flowable."""
    def __init__(self, width, height, color, radius=0):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.color = color
        self.radius = radius

    def draw(self):
        self.canv.setFillColor(self.color)
        if self.radius:
            self.canv.roundRect(0, 0, self.width, self.height, self.radius, fill=1, stroke=0)
        else:
            self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)


class HorizontalLine(Flowable):
    """Draws a horizontal line."""
    def __init__(self, width, color=BORDER_GRAY, thickness=1):
        Flowable.__init__(self)
        self.width = width
        self.color = color
        self.thickness = thickness
        self.height = thickness + 4

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 2, self.width, 2)


class ModuleHeader(Flowable):
    """A styled module header with number and title."""
    def __init__(self, module_num, title, width):
        Flowable.__init__(self)
        self.module_num = module_num
        self.title = title
        self.w = width
        self.height = 38

    def draw(self):
        c = self.canv
        # Background bar
        c.setFillColor(NAVY)
        c.roundRect(0, 0, self.w, self.height, 6, fill=1, stroke=0)
        # Module number circle
        c.setFillColor(ACCENT_BLUE)
        c.circle(22, self.height / 2, 13, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(22, self.height / 2 - 4, str(self.module_num))
        # Title
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(42, self.height / 2 - 5, self.title)


class SectionHeader(Flowable):
    """A sub-section header."""
    def __init__(self, text, width):
        Flowable.__init__(self)
        self.text = text
        self.w = width
        self.height = 24

    def draw(self):
        c = self.canv
        c.setFillColor(PALE_BLUE)
        c.roundRect(0, 0, self.w, self.height, 4, fill=1, stroke=0)
        c.setFillColor(DEEP_BLUE)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(10, 7, self.text)


class SummaryBadge(Flowable):
    """A colored badge showing implementation percentage."""
    def __init__(self, percentage, grade, width):
        Flowable.__init__(self)
        self.percentage = percentage
        self.grade = grade
        self.w = width
        self.height = 30

    def draw(self):
        c = self.canv
        p = int(self.percentage.replace('%', '').replace('~', '').replace(' ', ''))
        if p >= 60:
            bg = GREEN_BG; border = GREEN_BORDER; text = GREEN_TEXT
        elif p >= 35:
            bg = AMBER_BG; border = AMBER_BORDER; text = AMBER_TEXT
        else:
            bg = RED_BG; border = RED_BORDER; text = RED_TEXT

        c.setFillColor(bg)
        c.setStrokeColor(border)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, self.w, self.height, 6, fill=1, stroke=1)

        c.setFillColor(text)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(12, 10, f"Module Summary: {self.percentage} Implemented")
        c.setFont("Helvetica-Bold", 12)
        c.drawRightString(self.w - 12, 10, f"Grade: {self.grade}")


class CriticalGapItem(Flowable):
    """A single critical gap item."""
    def __init__(self, number, text, width):
        Flowable.__init__(self)
        self.number = number
        self.text = text
        self.w = width
        self.height = 22

    def draw(self):
        c = self.canv
        # Number circle
        c.setFillColor(RED_TEXT)
        c.circle(10, self.height / 2, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(10, self.height / 2 - 3, str(self.number))
        # Text
        c.setFillColor(HexColor('#374151'))
        c.setFont("Helvetica", 9)
        c.drawString(24, self.height / 2 - 3, self.text)


# ─── PAGE TEMPLATES & CALLBACKS ─────────────────────────────────────────────

def title_page_callback(canvas_obj, doc):
    """Draws the title page background."""
    c = canvas_obj
    w, h = A4
    c.saveState()
    # Full background
    c.setFillColor(DARK_NAVY)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    # Accent strip
    c.setFillColor(ACCENT_BLUE)
    c.rect(0, h * 0.42, w, 4, fill=1, stroke=0)
    # Decorative geometric elements
    c.setFillColor(HexColor('#1A2940'))
    c.circle(w * 0.85, h * 0.8, 120, fill=1, stroke=0)
    c.setFillColor(HexColor('#162236'))
    c.circle(w * 0.9, h * 0.15, 80, fill=1, stroke=0)
    c.setFillColor(HexColor('#1E3352'))
    c.circle(-30, h * 0.3, 60, fill=1, stroke=0)
    # Small dots pattern
    c.setFillColor(HexColor('#2A4570'))
    for i in range(8):
        for j in range(5):
            c.circle(w * 0.7 + i * 15, h * 0.55 + j * 15, 1.5, fill=1, stroke=0)
    c.restoreState()


def normal_page_callback(canvas_obj, doc):
    """Draws header/footer on normal pages."""
    c = canvas_obj
    w, h = A4
    c.saveState()
    # Top header bar
    c.setFillColor(NAVY)
    c.rect(0, h - 28, w, 28, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 7.5)
    c.drawString(30, h - 20, "CovenantERP — Feature Audit Report")
    c.drawRightString(w - 30, h - 20, "April 26, 2026 | Confidential")
    # Accent line under header
    c.setFillColor(ACCENT_BLUE)
    c.rect(0, h - 30, w, 2, fill=1, stroke=0)
    # Footer
    c.setFillColor(BORDER_GRAY)
    c.rect(0, 0, w, 24, fill=1, stroke=0)
    c.setFillColor(MEDIUM_GRAY)
    c.setFont("Helvetica", 7)
    c.drawString(30, 9, "Generated by CovenantERP Audit System")
    c.drawRightString(w - 30, 9, f"Page {doc.page}")
    c.restoreState()


# ─── STYLES ──────────────────────────────────────────────────────────────────

styles = getSampleStyleSheet()

style_title_main = ParagraphStyle(
    'TitleMain', parent=styles['Title'],
    fontName='Helvetica-Bold', fontSize=30, leading=36,
    textColor=WHITE, alignment=TA_CENTER, spaceAfter=8
)
style_subtitle = ParagraphStyle(
    'Subtitle', parent=styles['Normal'],
    fontName='Helvetica', fontSize=13, leading=18,
    textColor=HexColor('#94A3B8'), alignment=TA_CENTER, spaceAfter=6
)
style_meta = ParagraphStyle(
    'Meta', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10, leading=14,
    textColor=HexColor('#64748B'), alignment=TA_CENTER
)
style_section_title = ParagraphStyle(
    'SectionTitle', parent=styles['Heading1'],
    fontName='Helvetica-Bold', fontSize=16, leading=22,
    textColor=NAVY, spaceBefore=16, spaceAfter=8
)
style_body = ParagraphStyle(
    'BodyText2', parent=styles['Normal'],
    fontName='Helvetica', fontSize=9, leading=13,
    textColor=HexColor('#374151'), alignment=TA_JUSTIFY,
    spaceBefore=4, spaceAfter=4
)
style_body_bold = ParagraphStyle(
    'BodyBold', parent=style_body,
    fontName='Helvetica-Bold'
)
style_toc_entry = ParagraphStyle(
    'TOCEntry', parent=styles['Normal'],
    fontName='Helvetica', fontSize=11, leading=20,
    textColor=NAVY, leftIndent=20
)
style_toc_sub = ParagraphStyle(
    'TOCSub', parent=styles['Normal'],
    fontName='Helvetica', fontSize=9.5, leading=17,
    textColor=MEDIUM_GRAY, leftIndent=40
)
style_small = ParagraphStyle(
    'Small', parent=styles['Normal'],
    fontName='Helvetica', fontSize=8, leading=11,
    textColor=MEDIUM_GRAY
)
style_critical = ParagraphStyle(
    'Critical', parent=styles['Normal'],
    fontName='Helvetica-Bold', fontSize=10, leading=14,
    textColor=RED_TEXT
)
style_exec_summary = ParagraphStyle(
    'ExecSummary', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10, leading=15,
    textColor=HexColor('#374151'), alignment=TA_JUSTIFY,
    spaceBefore=6, spaceAfter=6
)


# ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

def make_status_table(data, col_widths, section_title=None):
    """Creates a professionally styled status table.
    data: list of [Feature, Status, Notes]
    """
    avail_width = A4[0] - 60  # margins
    if col_widths:
        cw = col_widths
    else:
        cw = [avail_width * 0.38, avail_width * 0.18, avail_width * 0.44]

    # Header row
    header = [
        Paragraph('<b>Feature / Section</b>', ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, leading=11)),
        Paragraph('<b>Status</b>', ParagraphStyle('th2', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, leading=11, alignment=TA_CENTER)),
        Paragraph('<b>Notes</b>', ParagraphStyle('th3', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, leading=11)),
    ]

    table_data = [header]
    style_note = ParagraphStyle('tn', fontName='Helvetica', fontSize=7.5, leading=10, textColor=HexColor('#4B5563'))
    style_feature = ParagraphStyle('tf', fontName='Helvetica', fontSize=7.5, leading=10, textColor=HexColor('#1F2937'))

    for row in data:
        feature, status, notes = row[0], row[1], row[2] if len(row) > 2 else ''
        status_upper = status.upper().strip()

        if 'IMPLEMENTED' == status_upper:
            sc = GREEN_BG; st = GREEN_TEXT
        elif 'PARTIAL' in status_upper:
            sc = AMBER_BG; st = AMBER_TEXT
        else:
            sc = RED_BG; st = RED_TEXT

        status_style = ParagraphStyle('ts', fontName='Helvetica-Bold', fontSize=7.5, leading=10,
                                       textColor=st, alignment=TA_CENTER)

        table_data.append([
            Paragraph(feature, style_feature),
            Paragraph(f'<font color="{st.hexval()}" backColor="{sc.hexval()}">&nbsp;&nbsp;{status}&nbsp;&nbsp;</font>', status_style),
            Paragraph(notes, style_note),
        ])

    t = Table(table_data, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        # Body
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 7.5),
        ('TOPPADDING', (0, 1), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, ACCENT_BLUE),
        # Alternating rows
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    # Alternating row colors
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, i), (-1, i), LIGHT_GRAY),
            ]))

    elements = []
    if section_title:
        elements.append(Spacer(1, 8))
        elements.append(SectionHeader(section_title, avail_width))
        elements.append(Spacer(1, 4))
    elements.append(t)
    return elements


def module_block(module_num, title, percentage, grade, sections_data):
    """Creates a complete module block with header, tables, and summary."""
    avail_width = A4[0] - 60
    elements = []
    elements.append(Spacer(1, 12))
    elements.append(ModuleHeader(module_num, title, avail_width))
    elements.append(Spacer(1, 6))

    for sec_title, sec_rows in sections_data:
        elements.extend(make_status_table(sec_rows, None, sec_title))
        elements.append(Spacer(1, 4))

    elements.append(SummaryBadge(percentage, grade, avail_width))
    elements.append(Spacer(1, 6))
    return elements


# ─── MAIN DOCUMENT BUILDER ──────────────────────────────────────────────────

def build_report():
    """Builds the complete PDF audit report."""
    w, h = A4

    doc = BaseDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        topMargin=40,
        bottomMargin=36,
        leftMargin=30,
        rightMargin=30,
        title="CovenantERP — Complete Feature Audit Report",
        author="CovenantERP Audit System",
        subject="Feature Gap Analysis: Specifications vs. Implementation"
    )

    # Define page templates
    frame_title = Frame(0, 0, w, h, id='title_frame',
                        leftPadding=40, rightPadding=40, topPadding=40, bottomPadding=40)
    frame_normal = Frame(30, 36, w - 60, h - 76, id='normal_frame')

    doc.addPageTemplates([
        PageTemplate(id='TitlePage', frames=[frame_title], onPage=title_page_callback),
        PageTemplate(id='ContentPage', frames=[frame_normal], onPage=normal_page_callback),
    ])

    story = []
    avail_width = w - 60

    # ═══════════════════════════════════════════════════════════════════════
    # TITLE PAGE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 120))
    story.append(Paragraph("CovenantERP", ParagraphStyle(
        'Brand', fontName='Helvetica-Bold', fontSize=16, leading=20,
        textColor=ACCENT_BLUE, alignment=TA_CENTER, spaceAfter=6
    )))
    story.append(HorizontalLine(200, ACCENT_BLUE, 2))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Complete Feature Audit Report", style_title_main))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Comprehensive Gap Analysis: Specifications vs. Implementation",
                            style_subtitle))
    story.append(Spacer(1, 30))
    story.append(HorizontalLine(120, HexColor('#334155'), 0.5))
    story.append(Spacer(1, 16))
    story.append(Paragraph("Date: April 26, 2026", style_meta))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Prepared for: CovenantERP Development Team", style_meta))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Classification: Confidential", style_meta))
    story.append(Spacer(1, 50))
    story.append(Paragraph("10 Modules Audited  |  122+ Features Evaluated  |  ~42% Overall Implementation",
                            ParagraphStyle('tagline', fontName='Helvetica', fontSize=9, leading=13,
                                          textColor=HexColor('#475569'), alignment=TA_CENTER)))

    # ═══════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════════════
    story.append(NextPageTemplate('ContentPage'))
    story.append(PageBreak())
    story.append(Spacer(1, 10))
    story.append(Paragraph("Table of Contents", style_section_title))
    story.append(HorizontalLine(avail_width, ACCENT_BLUE, 2))
    story.append(Spacer(1, 12))

    toc_items = [
        ("1", "Executive Summary", ""),
        ("2", "Module 1: Student Enrollment Profile", "~65% Implemented"),
        ("3", "Module 2: Teacher Management System", "~45% Implemented"),
        ("4", "Module 3: Billing System", "~35% Implemented"),
        ("5", "Module 4: Dynamic Academic Configuration", "~50% Implemented"),
        ("6", "Module 5: Pedagogical Portal", "~35% Implemented"),
        ("7", "Module 6: Theological Library Portal", "~45% Implemented"),
        ("8", "Module 7: Super Admin System", "~35% Implemented"),
        ("9", "Module 8: Institution Profile", "~30% Implemented"),
        ("10", "Module 9: Admin Profile", "~15% Implemented"),
        ("11", "Module 10: Multi-tenant White-label Branding", "~40% Implemented"),
        ("12", "Consolidated Summary & Grading", ""),
        ("13", "Critical Gaps & Recommendations", ""),
    ]
    for num, title, detail in toc_items:
        story.append(Paragraph(
            f'<font color="{ACCENT_BLUE.hexval()}"><b>{num}.</b></font>&nbsp;&nbsp;'
            f'<font color="{NAVY.hexval()}"><b>{title}</b></font>'
            + (f'&nbsp;&nbsp;<font color="{MEDIUM_GRAY.hexval()}">({detail})</font>' if detail else ''),
            style_toc_entry
        ))

    # ═══════════════════════════════════════════════════════════════════════
    # EXECUTIVE SUMMARY
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Spacer(1, 6))
    story.append(Paragraph("Executive Summary", style_section_title))
    story.append(HorizontalLine(avail_width, ACCENT_BLUE, 2))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "This audit report provides a comprehensive gap analysis of the CovenantERP system, comparing "
        "the user's detailed feature specifications against the current implementation across <b>10 major modules</b>. "
        "The evaluation covers <b>122+ individual features</b> across student enrollment, teacher management, "
        "billing, academic configuration, pedagogical portal, theological library, super admin controls, "
        "institution profile, admin profile, and white-label branding.",
        style_exec_summary
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        "The overall implementation stands at approximately <b>42%</b>, earning a grade of <b><font color='"
        f"{RED_TEXT.hexval()}'>D+</font></b>. While foundational data structures and basic CRUD interfaces exist "
        "for most modules, critical gaps persist in file upload functionality, API integration, security measures, "
        "notification systems, AI features, and dynamic branding consumption.",
        style_exec_summary
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Key strengths include the comprehensive spiritual information fields in Student and Teacher profiles, "
        "a well-structured BrandContext architecture, and a solid multi-tenant backend foundation with per-institution "
        "SQLite databases. The primary weakness is that most UI pages render hardcoded sample data without "
        "real backend connectivity, and file uploads are simulated with text status fields.",
        style_exec_summary
    ))

    # Legend
    story.append(Spacer(1, 12))
    story.append(Paragraph("Status Legend", ParagraphStyle('leg', fontName='Helvetica-Bold', fontSize=9, textColor=NAVY)))
    story.append(Spacer(1, 4))
    legend_data = [
        [Paragraph('<font color="#166534" backColor="#DCFCE7">&nbsp;&nbsp;Implemented&nbsp;&nbsp;</font>',
                   ParagraphStyle('lg', fontSize=8, leading=11)),
         'Feature is fully implemented and functional'],
        [Paragraph('<font color="#92400E" backColor="#FEF3C7">&nbsp;&nbsp;Partial&nbsp;&nbsp;</font>',
                   ParagraphStyle('lg2', fontSize=8, leading=11)),
         'Feature partially implemented (e.g., UI exists, no backend)'],
        [Paragraph('<font color="#991B1B" backColor="#FEE2E2">&nbsp;&nbsp;MISSING&nbsp;&nbsp;</font>',
                   ParagraphStyle('lg3', fontSize=8, leading=11)),
         'Feature not implemented at all'],
    ]
    for ld in legend_data:
        story.append(Paragraph(f'&nbsp;&nbsp;{ld[0] if isinstance(ld[0], str) else ""}', style_body))
    story.append(Spacer(1, 4))

    legend_table = Table([
        [
            Paragraph('<font color="#166534"><b>Implemented</b></font>', ParagraphStyle('', fontSize=8, alignment=TA_CENTER)),
            Paragraph('<font color="#92400E"><b>Partial</b></font>', ParagraphStyle('', fontSize=8, alignment=TA_CENTER)),
            Paragraph('<font color="#991B1B"><b>MISSING</b></font>', ParagraphStyle('', fontSize=8, alignment=TA_CENTER)),
        ]
    ], colWidths=[avail_width/3]*3)
    legend_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), GREEN_BG),
        ('BACKGROUND', (1,0), (1,0), AMBER_BG),
        ('BACKGROUND', (2,0), (2,0), RED_BG),
        ('BOX', (0,0), (0,0), 1, GREEN_BORDER),
        ('BOX', (1,0), (1,0), 1, AMBER_BORDER),
        ('BOX', (2,0), (2,0), 1, RED_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(legend_table)

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 1: STUDENT ENROLLMENT PROFILE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m1_sections = [
        ("Section 1: Basic Information", [
            ["Full Name", "Implemented", "In Student interface and form"],
            ["Gender", "Implemented", ""],
            ["Date of Birth", "Implemented", ""],
            ["Nationality", "Implemented", "Includes Indian, Nepalese, etc."],
            ["Aadhaar/ID Number", "Partial", "Mapped to idProof field (not dedicated)"],
            ["Passport", "MISSING", "No field for international students"],
            ["Profile Photo", "Partial", "Field exists, no upload functionality"],
            ["Blood Group", "Implemented", ""],
        ]),
        ("Section 2: Contact Details", [
            ["Mobile Number", "Implemented", ""],
            ["Email Address", "Implemented", ""],
            ["Permanent Address", "Implemented", ""],
            ["Current Address", "Implemented", ""],
            ["Emergency Contact Person", "Implemented", ""],
            ["Emergency Contact Number", "Implemented", ""],
        ]),
        ("Section 3: Family/Guardian Details", [
            ["Father's Name", "Implemented", ""],
            ["Mother's Name", "Implemented", ""],
            ["Guardian Name", "Implemented", "Select: Father/Mother/Self/Other"],
            ["Occupation", "Implemented", ""],
            ["Contact Number", "MISSING", "No separate guardian contact"],
            ["Family Background", "Implemented", "Text area"],
        ]),
        ("Section 4: Spiritual Information", [
            ["Date of Conversion", "Implemented", ""],
            ["Baptism Status", "Implemented", ""],
            ["Baptism Date", "Implemented", ""],
            ["Baptism Church Name", "Implemented", ""],
            ["Current Church Membership", "Implemented", ""],
            ["Pastor Name", "Implemented", ""],
            ["Ministry Involvement", "Implemented", ""],
            ["Spiritual Gifts", "Implemented", ""],
            ["Personal Testimony", "Implemented", "Text area"],
        ]),
        ("Section 5: Academic Details", [
            ["Previous Qualification", "Implemented", ""],
            ["School/College Name", "Implemented", ""],
            ["Board/University", "Implemented", ""],
            ["Year of Passing", "Implemented", ""],
            ["Marks/Grade", "Implemented", ""],
            ["Medium of Instruction", "Implemented", ""],
        ]),
        ("Section 6: Course Enrollment", [
            ["Program Name", "Implemented", "B.Th, M.Div, Diploma, Certificate"],
            ["Department", "Implemented", ""],
            ["Enrollment Number", "Implemented", "Auto-generated (COVYYYY-NNN)"],
            ["Admission Date", "Implemented", ""],
            ["Academic Year", "Implemented", ""],
            ["Semester", "Implemented", ""],
            ["Mode", "Implemented", "Regular/Online"],
        ]),
        ("Section 7: Institutional Details", [
            ["Campus/Branch", "Implemented", ""],
            ["Hostel Required", "Implemented", ""],
            ["Room Allocation", "Implemented", ""],
            ["Transport Required", "Implemented", ""],
        ]),
        ("Section 8: Financial Information", [
            ["Fee Structure Assigned", "Implemented", ""],
            ["Scholarship", "Implemented", ""],
            ["Sponsorship Details", "Implemented", ""],
            ["Payment Plan", "Implemented", "Monthly/Quarterly/Full"],
            ["Fee Status", "Implemented", "Paid/Partial/Due"],
        ]),
        ("Section 9: Medical Information", [
            ["Health Conditions", "Implemented", ""],
            ["Allergies", "Implemented", ""],
            ["Disability", "Implemented", ""],
            ["Medical Certificate Upload", "Partial", "Boolean only, no actual upload"],
        ]),
        ("Section 10: Documents Upload", [
            ["ID Proof", "Partial", "Text status only (e.g., 'Uploaded')"],
            ["Academic Certificates", "Partial", "Text status only"],
            ["Baptism Certificate", "Partial", "Text status only"],
            ["Recommendation Letter from Pastor", "Partial", "Text status only"],
            ["Passport Photos", "Partial", "Boolean only"],
        ]),
        ("Section 11: Ministry & Calling Details", [
            ["Calling to Ministry", "Implemented", ""],
            ["Type of Calling", "Implemented", "Pastor/Missionary/Teacher/Evangelist/Worship Leader"],
            ["Ministry Experience", "Implemented", ""],
            ["Years of Service", "Implemented", ""],
            ["Preferred Ministry Field", "Implemented", ""],
            ["Internship Interest", "Implemented", ""],
        ]),
        ("Section 12: Admin Section", [
            ["Admission Status", "Implemented", "Pending/Approved/Rejected"],
            ["Verified By", "Implemented", ""],
            ["Remarks", "Implemented", ""],
            ["Enrollment Approval Date", "Implemented", ""],
        ]),
        ("Section 13: System Fields", [
            ["Student ID (UUID)", "Partial", "Uses string ID, not UUID"],
            ["Created At", "MISSING", "No timestamps"],
            ["Updated At", "MISSING", "No timestamps"],
            ["Created By", "MISSING", "No audit trail"],
        ]),
        ("Advanced Features", [
            ["Profile Completion Percentage", "Implemented", "calcCompletion() helper"],
            ["Spiritual Growth Tracking", "MISSING", "No tracking system"],
            ["Attendance + Ministry Participation", "Partial", "DB schema exists, no UI"],
            ["AI-based calling recommendation", "MISSING", "Future feature"],
            ["Role-based access", "Implemented", "Super Admin / Admin"],
            ["End-to-End Encryption", "MISSING", "All data in localStorage"],
        ]),
    ]
    story.extend(module_block(1, "Student Enrollment Profile (13 Sections + Advanced)", "~65%", "C+", m1_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 2: TEACHER MANAGEMENT SYSTEM
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m2_sections = [
        ("Section 1: Basic Information", [
            ["Full Name", "Implemented", ""],
            ["Gender", "Implemented", ""],
            ["Date of Birth", "Implemented", ""],
            ["Profile Photo", "Partial", "No upload"],
            ["Nationality", "Implemented", ""],
            ["Aadhaar/ID/Passport", "Partial", "Generic 'idProof' field"],
            ["Marital Status", "Implemented", ""],
            ["Blood Group", "Implemented", ""],
        ]),
        ("Section 2: Contact Details", [
            ["Mobile Number", "Implemented", ""],
            ["Email Address", "Implemented", ""],
            ["Address", "Implemented", ""],
            ["Emergency Contact", "Implemented", "Name + Phone"],
        ]),
        ("Section 3: Spiritual Profile", [
            ["Date of Conversion", "Implemented", ""],
            ["Baptism Status", "Implemented", ""],
            ["Baptism Date", "Implemented", ""],
            ["Church Name", "Implemented", ""],
            ["Pastor Name", "Implemented", ""],
            ["Ministry Involvement", "Implemented", ""],
            ["Years in Ministry", "Implemented", ""],
            ["Spiritual Gifts", "Implemented", ""],
            ["Personal Testimony", "Implemented", ""],
            ["Statement of Faith", "Implemented", "Text area"],
        ]),
        ("Section 4: Academic & Theological Qualifications", [
            ["Highest Qualification", "Implemented", ""],
            ["Theological Degree", "Implemented", "B.Th/M.Div/Th.M/D.Min/Ph.D./D.D."],
            ["Bible School/Seminary", "Implemented", ""],
            ["Year of Completion", "Implemented", ""],
            ["Certifications", "Implemented", "Text only, no upload"],
            ["Specialization", "Implemented", "OT, NT, Systematic Theology, etc."],
        ]),
        ("Section 5: Employment Details", [
            ["Employee ID", "Implemented", "Auto-generated (COV-TNNN)"],
            ["Role", "Implemented", "Teacher/Pastor/Visiting Faculty/Guest"],
            ["Department", "Implemented", ""],
            ["Subjects Assigned", "Implemented", ""],
            ["Date of Joining", "Implemented", ""],
            ["Employment Type", "Implemented", "Full-time/Part-time/Contract/Guest"],
            ["Experience", "Implemented", "Years"],
        ]),
        ("Section 6: Teaching Assignment Module", [
            ["Assigned Courses", "Implemented", ""],
            ["Class/Batch", "Implemented", ""],
            ["Subjects", "Partial", "Combined with assignedCourses"],
            ["Weekly Schedule", "Implemented", "Text field"],
            ["Lecture Hours", "Implemented", ""],
            ["Online/Offline Mode", "Implemented", ""],
        ]),
        ("Section 7: Ministry & Calling Details", [
            ["Calling Type", "Implemented", ""],
            ["Ministry Experience", "Implemented", ""],
            ["Current Ministry Role", "Implemented", ""],
            ["Church Leadership Role", "Implemented", ""],
            ["Field Experience", "Implemented", ""],
        ]),
        ("Section 8: Payroll & Financials", [
            ["Salary Structure", "Implemented", ""],
            ["Bank Details", "Implemented", ""],
            ["Payment Frequency", "Implemented", ""],
            ["Allowances", "Implemented", ""],
            ["Deductions", "Implemented", ""],
            ["Tax Info", "MISSING", ""],
            ["Payslip Generation", "MISSING", ""],
        ]),
        ("Section 9: Accommodation & Facilities", [
            ["Hostel/Staff Quarters", "MISSING", ""],
            ["Room Details", "MISSING", ""],
            ["Transport Facility", "MISSING", ""],
        ]),
        ("Section 10: Medical Information", [
            ["Health Conditions", "MISSING", ""],
            ["Insurance Details", "MISSING", ""],
            ["Emergency Medical Info", "MISSING", ""],
        ]),
        ("Section 11: Documents Management", [
            ["ID Proof", "Partial", "Text status only"],
            ["Certificates", "Partial", "Text status only"],
            ["Experience Letters", "Partial", "Text status only"],
            ["Ordination Certificate", "Partial", "Text status only"],
            ["Recommendation Letters", "Partial", "Text status only"],
            ["Resume/CV", "Partial", "Text status only"],
        ]),
        ("Section 12: Performance & Evaluation", [
            ["Student Feedback", "Implemented", ""],
            ["Academic Performance Metrics", "Implemented", ""],
            ["Spiritual Leadership Evaluation", "Implemented", ""],
            ["Attendance", "Implemented", ""],
            ["Admin Ratings", "Implemented", ""],
            ["Teaching Quality Score", "Partial", "performanceScore number 0-100"],
            ["Ministry Impact Score", "MISSING", ""],
        ]),
        ("Section 13: Attendance & Leave Management", [
            ["Daily Attendance", "Partial", "DB schema exists, no UI"],
            ["Leave Requests", "MISSING", ""],
            ["Leave Approval Workflow", "MISSING", ""],
            ["Holidays Calendar", "MISSING", ""],
        ]),
        ("Section 14: User Roles & Permissions", [
            ["Role-based Access", "Implemented", ""],
            ["View Students", "MISSING", ""],
            ["Enter Marks", "MISSING", ""],
            ["Upload Materials", "MISSING", ""],
            ["Manage Attendance", "MISSING", ""],
        ]),
        ("Section 15: Content & Learning Management", [
            ["Upload Lecture Notes", "MISSING", ""],
            ["Video Classes", "MISSING", ""],
            ["Assignments", "MISSING", ""],
            ["Exams Creation", "MISSING", ""],
            ["Grade Submission", "MISSING", ""],
        ]),
        ("Section 16: Admin Controls", [
            ["Approve/Reject Teacher", "MISSING", ""],
            ["Assign Roles", "MISSING", ""],
            ["Monitor Activity Logs", "MISSING", ""],
            ["Deactivate Accounts", "MISSING", ""],
            ["Institution Mapping", "MISSING", ""],
        ]),
        ("Section 17: Security Layer", [
            ["E2E Encryption for Personal Data", "MISSING", ""],
            ["E2E Encryption for Spiritual Records", "MISSING", ""],
            ["Activity Logs", "Partial", "Backend schema exists"],
            ["Login Tracking", "Partial", "last_login field"],
            ["2FA Authentication", "MISSING", ""],
        ]),
        ("Advanced Features", [
            ["Ministry Matching System", "MISSING", ""],
            ["Sermon & Teaching Archive", "MISSING", ""],
            ["Spiritual Growth Tracker", "MISSING", ""],
            ["Multi-Institution Control", "Partial", "Backend schema"],
            ["Analytics Dashboard", "MISSING", ""],
        ]),
    ]
    story.extend(module_block(2, "Teacher Management System (17 Sections + Advanced)", "~45%", "C-", m2_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 3: BILLING SYSTEM
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m3_sections = [
        ("Section 1: Fee Structure Management", [
            ["Fee Structure Name", "Implemented", ""],
            ["Program/Course", "Implemented", ""],
            ["Academic Year", "MISSING", ""],
            ["Semester", "MISSING", ""],
            ["Fee Components", "Implemented", "12 items"],
            ["Amount", "Implemented", "INR formatting"],
            ["One-time/Recurring", "Implemented", "frequency field"],
            ["Mandatory/Optional", "Implemented", ""],
        ]),
        ("Section 2: Student Fee Assignment", [
            ["Assign fee structure to student", "Partial", "UI shows data, no CRUD"],
            ["Custom adjustments", "MISSING", ""],
            ["Auto-generate fee plan", "MISSING", ""],
        ]),
        ("Section 3: Payment Management", [
            ["Payment Modes (Cash/UPI/Bank/Online)", "Implemented", ""],
            ["Payment ID", "Implemented", ""],
            ["Student ID", "Implemented", ""],
            ["Amount Paid", "Implemented", ""],
            ["Payment Date", "Implemented", ""],
            ["Payment Mode", "Implemented", ""],
            ["Transaction Reference", "Implemented", ""],
            ["Received By", "Implemented", ""],
        ]),
        ("Section 4: Installment & Payment Plans", [
            ["Full Payment", "Implemented", ""],
            ["Monthly/Quarterly Plans", "Implemented", ""],
            ["Auto schedule due dates", "MISSING", ""],
            ["Reminder system", "MISSING", ""],
            ["Late fee calculation", "MISSING", ""],
        ]),
        ("Section 5: Due & Fine Management", [
            ["Track unpaid fees", "Implemented", ""],
            ["Auto apply late fine", "MISSING", ""],
            ["Grace period setup", "MISSING", ""],
        ]),
        ("Section 6: Scholarship & Sponsorship", [
            ["Percentage/Fixed discount", "Implemented", ""],
            ["Merit/Need-based", "Implemented", ""],
            ["Sponsor Name/Contact", "Implemented", ""],
            ["Sponsored Amount", "Implemented", ""],
            ["Linked Students", "Implemented", ""],
            ["One sponsor to multiple students", "Partial", ""],
        ]),
        ("Section 7: Invoice Generation", [
            ["Auto-generate invoice", "Partial", "Sample data only"],
            ["Invoice Number", "Implemented", ""],
            ["Student Details", "Implemented", ""],
            ["Fee Breakdown", "Implemented", ""],
            ["Paid/Due Amount", "Implemented", ""],
            ["Payment History", "MISSING", ""],
            ["QR Code for UPI", "MISSING", ""],
        ]),
        ("Section 8: Receipt System", [
            ["Instant receipt", "MISSING", ""],
            ["Printable PDF download", "MISSING", ""],
            ["Email/WhatsApp send", "MISSING", ""],
        ]),
        ("Section 9: Financial Dashboard", [
            ["Total Revenue", "Implemented", ""],
            ["Pending Dues", "Implemented", ""],
            ["Monthly Collection", "Implemented", ""],
            ["Scholarship Given", "Implemented", ""],
            ["Sponsorship Funds", "Partial", ""],
            ["Course-wise filters", "MISSING", ""],
            ["Date-wise filters", "MISSING", ""],
            ["Campus-wise filters", "MISSING", ""],
        ]),
        ("Section 10: Super Admin Control", [
            ["Multi-institution billing", "MISSING", ""],
            ["Revenue analytics", "Partial", "Super Admin dashboard"],
            ["Commission tracking", "MISSING", ""],
            ["Override fees", "MISSING", ""],
        ]),
        ("Section 11: Security & Audit", [
            ["Every transaction logged", "Partial", "Backend schema"],
            ["Who created/edited", "MISSING", ""],
            ["No delete, only reverse", "MISSING", ""],
            ["E2E encryption", "MISSING", ""],
        ]),
        ("Section 12: Reports System", [
            ["Student Fee Statement", "MISSING", ""],
            ["Pending Fees Report", "MISSING", ""],
            ["Daily Collection Report", "MISSING", ""],
            ["Annual Financial Report", "MISSING", ""],
            ["Sponsor Contribution Report", "MISSING", ""],
        ]),
        ("Section 13: Refund & Adjustment", [
            ["Refund processing", "MISSING", ""],
            ["Fee adjustment/carry forward", "MISSING", ""],
            ["Credit balance system", "MISSING", ""],
        ]),
        ("Section 14: Automation Features", [
            ["Auto invoice generation", "MISSING", ""],
            ["Auto reminders (SMS/Email)", "MISSING", ""],
            ["Auto late fee", "MISSING", ""],
            ["Recurring billing", "MISSING", ""],
        ]),
        ("Advanced Features", [
            ["Donor/Ministry Fund Integration", "MISSING", ""],
            ["AI Financial Insights", "MISSING", ""],
            ["Multi-Currency Support", "MISSING", ""],
            ["Offline-first Billing", "MISSING", ""],
            ["Parent/Sponsor Portal", "MISSING", ""],
        ]),
    ]
    story.extend(module_block(3, "Billing System (14 Sections + Advanced)", "~35%", "D+", m3_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 4: DYNAMIC ACADEMIC CONFIGURATION
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m4_sections = [
        ("Section 1: Program Builder", [
            ["Create Programs", "Implemented", "B.Th, M.Div, Diploma, Certificate"],
            ["Define Duration", "Implemented", ""],
            ["Credit System", "Implemented", ""],
            ["Grading System", "Implemented", "GPA 4.0"],
            ["Program Code", "Implemented", "shortName field"],
            ["Level", "Implemented", "Undergrad/Postgrad/Diploma/Certificate"],
            ["Total Credits", "Implemented", ""],
            ["Description", "Implemented", ""],
            ["Enable/Disable Modules", "MISSING", ""],
        ]),
        ("Section 2: Course Builder", [
            ["Course Name/Code", "Implemented", "23 courses"],
            ["Department", "Implemented", ""],
            ["Credits", "Implemented", ""],
            ["Course Type", "Implemented", "Core/Elective/Optional"],
            ["Semester Mapping", "Implemented", ""],
            ["Pre-requisites", "Implemented", ""],
            ["Course Description", "Implemented", ""],
            ["Attach Syllabus", "Partial", "Text status only"],
            ["Video resources", "MISSING", ""],
            ["Reading materials", "MISSING", ""],
        ]),
        ("Section 3: Curriculum Designer", [
            ["Build Program Structure", "Implemented", "Semester-by-semester view"],
            ["Drag & Drop", "MISSING", "Static list view"],
            ["Add/remove courses", "Partial", "Modal exists"],
            ["Clone curriculum", "MISSING", ""],
        ]),
        ("Section 4: Version Control", [
            ["Version Number", "Implemented", "e.g., v3.2"],
            ["Effective From", "Implemented", ""],
            ["Old students keep old version", "MISSING", ""],
        ]),
        ("Section 5: Elective Selection", [
            ["Choose electives", "Partial", "View only"],
            ["Min/Max electives rules", "Partial", "Displayed rules"],
            ["Eligibility criteria", "MISSING", ""],
        ]),
        ("Section 6: Credit & Grading", [
            ["Custom grade mapping", "Implemented", "A+ through F"],
            ["GPA calculation", "Implemented", "Formula shown"],
            ["CGPA", "Implemented", "Sample displayed"],
        ]),
        ("Section 7: Academic Pattern Flexibility", [
            ["Semester system", "Implemented", ""],
            ["Yearly system", "MISSING", ""],
            ["Modular/Short-term", "MISSING", ""],
            ["Weekend Bible courses", "MISSING", ""],
            ["Online certification", "MISSING", ""],
        ]),
        ("Section 8: Multi-Institution Course Control", [
            ["Create master courses", "MISSING", ""],
            ["Share across seminaries", "MISSING", ""],
        ]),
        ("Section 9: Smart Course Assignment", [
            ["Assign course to teacher", "Partial", "DB schema + API"],
            ["Assign course to batch", "Partial", "DB schema + API"],
            ["Max teaching load", "MISSING", ""],
            ["Qualification-based assignment", "MISSING", ""],
        ]),
        ("Section 10: Course Status", [
            ["Active/Archived/Draft", "Implemented", "Status field exists"],
        ]),
        ("Section 11: Permissions", [
            ["Super Admin full access", "Partial", ""],
            ["Institution Admin limited", "Partial", ""],
            ["Teacher suggest only", "MISSING", ""],
        ]),
        ("Advanced Features", [
            ["Course Marketplace", "MISSING", ""],
            ["AI Curriculum Builder", "MISSING", ""],
            ["Auto Curriculum Generator", "MISSING", ""],
            ["Dependency Engine", "MISSING", ""],
        ]),
    ]
    story.extend(module_block(4, "Dynamic Academic Configuration (11 Sections + Advanced)", "~50%", "C", m4_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 5: PEDAGOGICAL PORTAL
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m5_sections = [
        ("Section 1: Teaching Method Framework", [
            ["Teaching styles defined", "Implemented", "5 methods"],
            ["Method descriptions", "Implemented", ""],
            ["Usage tracking", "Implemented", "Percentage shown"],
            ["Course mapping", "MISSING", ""],
            ["Expected outcomes", "MISSING", ""],
        ]),
        ("Section 2: Lesson Planning", [
            ["Lesson Plan per class", "Implemented", ""],
            ["Course", "Implemented", ""],
            ["Topic", "Implemented", ""],
            ["Date/Duration", "Implemented", ""],
            ["Objectives", "Implemented", ""],
            ["Teaching Method", "Implemented", ""],
            ["Scripture References", "Implemented", ""],
            ["Activities Planned", "Implemented", ""],
            ["Materials Required", "MISSING", ""],
        ]),
        ("Section 3: Teaching Resources Hub", [
            ["Upload notes", "Partial", "Modal exists, no real upload"],
            ["Sermons", "Partial", "Audio type exists"],
            ["Videos", "Partial", ""],
            ["PDFs", "Partial", ""],
            ["External links", "Implemented", ""],
            ["Course-wise categorization", "Implemented", ""],
            ["Topic-wise categorization", "MISSING", ""],
            ["Scripture-wise search", "MISSING", ""],
        ]),
        ("Section 4: Interactive Learning", [
            ["Live classes (Zoom)", "MISSING", ""],
            ["Recorded lectures", "MISSING", ""],
            ["Discussion forums", "MISSING", ""],
        ]),
        ("Section 5: Student Engagement Tracking", [
            ["Class participation", "Implemented", "87% metric"],
            ["Assignment submission", "Implemented", "82% metric"],
            ["Discussion activity", "Implemented", "71% metric"],
            ["Attendance", "Implemented", "93% metric"],
            ["Engagement Score", "Implemented", ""],
        ]),
        ("Section 6: Teaching Effectiveness", [
            ["Student feedback", "Partial", "Score display only"],
            ["Performance improvement", "MISSING", ""],
            ["Engagement levels", "Implemented", ""],
            ["Teaching Score", "Implemented", ""],
            ["Clarity Index", "MISSING", ""],
            ["Student Satisfaction", "MISSING", ""],
        ]),
        ("Section 7: Spiritual Formation", [
            ["Devotional participation", "Implemented", "85% metric"],
            ["Prayer sessions", "Implemented", "72% metric"],
            ["Bible study involvement", "Implemented", "68% metric"],
            ["Spiritual Formation Index", "Implemented", "73% shown"],
            ["Teacher assigns devotions", "MISSING", ""],
            ["Reflection tasks", "MISSING", ""],
        ]),
        ("Section 8: Reflective Learning", [
            ["Reflection journals", "MISSING", ""],
            ["Ministry experiences", "MISSING", ""],
            ["Spiritual growth notes", "MISSING", ""],
            ["Teacher reviews", "MISSING", ""],
            ["Teacher feedback", "MISSING", ""],
        ]),
        ("Section 9: Mentorship System", [
            ["Assign teacher to student", "Implemented", "4 mentorships"],
            ["Track meetings", "Implemented", "Meeting count shown"],
            ["Guidance notes", "MISSING", ""],
            ["Spiritual growth", "Partial", "Growth rating shown"],
        ]),
        ("Section 10: Pedagogical Reports", [
            ["Teaching quality", "MISSING", ""],
            ["Student engagement", "Implemented", ""],
            ["Spiritual growth trends", "Partial", "Index shown"],
            ["Course effectiveness", "MISSING", ""],
        ]),
        ("Section 11: Adaptive Teaching", [
            ["Suggest teaching method", "MISSING", ""],
            ["Focus on weak students", "MISSING", ""],
            ["Data-driven suggestions", "MISSING", ""],
        ]),
        ("Section 12: Content Calendar", [
            ["Weekly teaching plan", "MISSING", ""],
            ["Lesson schedule", "Partial", ""],
            ["Topic coverage tracking", "MISSING", ""],
        ]),
        ("Section 13: Role-Based Access", [
            ["Teacher: create/upload", "Partial", "Modal UI"],
            ["Student: view/participate", "MISSING", ""],
            ["Admin: monitor", "MISSING", ""],
        ]),
        ("Advanced Features", [
            ["Sermon Builder Tool", "MISSING", ""],
            ["Pedagogy Templates", "MISSING", ""],
            ["AI Teaching Assistant", "MISSING", ""],
            ["Ministry-Based Learning", "MISSING", ""],
            ["Gamified Learning", "MISSING", ""],
        ]),
    ]
    story.extend(module_block(5, "Pedagogical Portal (13 Sections + Advanced)", "~35%", "D+", m5_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 6: THEOLOGICAL LIBRARY PORTAL
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m6_sections = [
        ("Section 1: Manuscript Management", [
            ["Title/Author", "Implemented", "20 manuscripts"],
            ["Category", "Implemented", "9 categories"],
            ["Type (Book/Paper/Sermon/Commentary/Thesis)", "Implemented", ""],
            ["Language", "Implemented", ""],
            ["Publication Year", "Implemented", ""],
            ["ISBN", "Implemented", ""],
            ["Scripture References", "Implemented", ""],
            ["Keywords/Tags", "Implemented", ""],
            ["Abstract/Summary", "Implemented", ""],
            ["File Upload", "MISSING", "UI only, no backend"],
        ]),
        ("Section 2: Advanced Search", [
            ["Title search", "Implemented", ""],
            ["Author search", "Implemented", ""],
            ["Scripture search", "Implemented", "Search by verse"],
            ["Topic/keyword search", "Implemented", ""],
            ["Language filter", "MISSING", ""],
            ["File type filter", "MISSING", ""],
            ["Left panel filters", "Implemented", "Category sidebar"],
            ["Sort options", "MISSING", ""],
        ]),
        ("Section 3: Category System", [
            ["9 categories defined", "Implemented", ""],
            ["Add new categories", "MISSING", "Admin can't add dynamically"],
            ["Reorder categories", "MISSING", ""],
        ]),
        ("Section 4: Access Control", [
            ["Access levels", "Implemented", "Public/Students/Teachers"],
            ["Visual badges", "Implemented", "Lock/Globe icons"],
        ]),
        ("Section 5: Borrowing System", [
            ["Issue book", "Partial", "UI shows data"],
            ["Return tracking", "Implemented", ""],
            ["Due dates", "Implemented", ""],
            ["Late fine", "Implemented", "Rs 50 shown"],
            ["Auto reminders", "MISSING", ""],
        ]),
        ("Section 6: Bookmark & Favorites", [
            ["Save manuscripts", "Implemented", "Toggle bookmarks"],
            ["Personal collections", "MISSING", ""],
        ]),
        ("Section 7: AI Research Assistant", [
            ["AI suggest books", "MISSING", ""],
            ["AI suggest verses", "MISSING", ""],
        ]),
        ("Section 8: Scripture Integration", [
            ["Link to Bible verses", "Implemented", "scriptureRefs field"],
            ["Cross references", "Partial", ""],
            ["Click verse to open passage", "MISSING", ""],
        ]),
        ("Section 9: Notes & Highlighting", [
            ["Highlight text", "MISSING", ""],
            ["Add notes", "MISSING", ""],
            ["Save insights", "MISSING", ""],
        ]),
        ("Section 10: Usage Analytics", [
            ["Most read books", "MISSING", ""],
            ["Active users", "MISSING", ""],
            ["Popular topics", "MISSING", ""],
        ]),
        ("Section 11: Faculty Contribution", [
            ["Upload sermons/notes", "Partial", "Uploads tab, approval flow"],
            ["Approval flow", "Implemented", "Under Review/Approved"],
        ]),
        ("Section 12: Manuscript Versioning", [
            ["Update document", "MISSING", ""],
            ["Keep old versions", "MISSING", ""],
        ]),
        ("Section 13: Citation Generator", [
            ["APA style", "Implemented", ""],
            ["MLA style", "MISSING", ""],
            ["Chicago style", "MISSING", ""],
        ]),
        ("Section 14: Blockchain/Provenance", [
            ["Track manuscript origin", "MISSING", ""],
            ["Verify authenticity", "MISSING", ""],
        ]),
        ("Advanced Features", [
            ["Empty State improvements", "Partial", ""],
            ["Add Manuscript modal", "Implemented", "Multi-field form"],
            ["Grid/List view toggle", "Implemented", ""],
            ["View manuscript details", "Implemented", "Full modal"],
        ]),
    ]
    story.extend(module_block(6, "Theological Library Portal (14 Sections + Advanced)", "~45%", "C-", m6_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 7: SUPER ADMIN SYSTEM
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m7_sections = [
        ("Section 1: Institution Management", [
            ["Create institution", "Implemented", "Modal form"],
            ["Assign admin", "Implemented", "Name/Email fields"],
            ["Activate/deactivate", "Partial", "Status column"],
            ["6 sample institutions", "Implemented", ""],
        ]),
        ("Section 2: Global User Management", [
            ["View all users", "Implemented", "6 sample users"],
            ["Suspend/activate", "Partial", "Buttons exist"],
            ["Reset passwords", "MISSING", ""],
            ["Change roles", "MISSING", ""],
            ["Global search", "Implemented", ""],
        ]),
        ("Section 3: Master Academic Control", [
            ["Create global programs", "MISSING", ""],
            ["Create global courses", "MISSING", ""],
            ["Push to institutions", "MISSING", ""],
        ]),
        ("Section 4: Library Master Control", [
            ["Global manuscripts", "MISSING", ""],
            ["Approve uploads", "Partial", ""],
            ["Manage categories", "MISSING", ""],
        ]),
        ("Section 5: Revenue & Billing Control", [
            ["Track subscriptions", "Partial", "Plan field"],
            ["Total revenue", "Implemented", "Rs 74.8L"],
            ["Commission model", "MISSING", ""],
            ["Plan management", "Implemented", "3 tiers shown"],
        ]),
        ("Section 6: Feature Toggle System", [
            ["Per-institution toggles", "Implemented", "8 features"],
            ["ON/OFF modules", "Implemented", ""],
            ["Configure button", "Partial", ""],
        ]),
        ("Section 7: Global Security", [
            ["Data encryption policies", "MISSING", ""],
            ["Access logs", "Partial", "6 sample logs"],
            ["Login tracking", "MISSING", ""],
            ["Suspicious activity", "Partial", "Alert shown"],
        ]),
        ("Section 8: Platform Analytics", [
            ["Total users", "Implemented", "1,847"],
            ["Active institutions", "Implemented", "6"],
            ["System load", "Partial", "Uptime shown"],
            ["Date/Region filters", "MISSING", ""],
        ]),
        ("Section 9: Notifications", [
            ["Platform-wide notifications", "MISSING", ""],
        ]),
        ("Section 10: AI Control Center", [
            ["AI features toggle", "MISSING", ""],
        ]),
        ("Section 11: Multi-Tenant Architecture", [
            ["Isolated data per institution", "Implemented", "Backend: separate SQLite per tenant"],
            ["Super Admin access all", "Partial", ""],
        ]),
        ("Section 12: Backup & Recovery", [
            ["Backup data", "MISSING", ""],
            ["Restore institution", "MISSING", ""],
            ["Scheduled backups", "Partial", "Auto backup shown"],
        ]),
        ("Section 13: Audit & Logs", [
            ["User activity log", "Partial", "6 sample entries"],
            ["Financial transactions", "MISSING", ""],
            ["Data changes", "MISSING", ""],
            ["No delete, only logs", "MISSING", ""],
        ]),
        ("Section 14: Role & Permission Engine", [
            ["Create custom roles", "MISSING", ""],
            ["Fully customizable permissions", "MISSING", ""],
        ]),
        ("Section 15: Marketplace", [
            ["Sell courses", "MISSING", ""],
            ["Sell manuscripts", "MISSING", ""],
        ]),
        ("Advanced Features", [
            ["Institution Health Score", "MISSING", ""],
            ["Onboarding Wizard", "MISSING", ""],
        ]),
    ]
    story.extend(module_block(7, "Super Admin System (15 Sections + Advanced)", "~35%", "D+", m7_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 8: INSTITUTION PROFILE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m8_sections = [
        ("Section 1: Basic Information", [
            ["Institution Name", "Implemented", "In DB schema"],
            ["Institution Code", "Implemented", "Auto-generated"],
            ["Type", "Implemented", "Seminary/Bible College/Training Center"],
            ["Year Established", "MISSING", ""],
            ["Affiliation", "MISSING", ""],
            ["Logo Upload", "MISSING", ""],
            ["Cover Image", "MISSING", ""],
        ]),
        ("Section 2: Location", [
            ["Country/State/City", "Partial", "Location as text"],
            ["Full Address", "Partial", ""],
            ["Postal Code", "MISSING", ""],
            ["Google Maps", "MISSING", ""],
        ]),
        ("Section 3: Contact", [
            ["Email/Phone", "MISSING", ""],
            ["Website", "MISSING", ""],
            ["Social Media", "MISSING", ""],
        ]),
        ("Section 4: Spiritual Identity", [
            ["Denomination", "Partial", "In add institution modal"],
            ["Statement of Faith", "MISSING", ""],
            ["Mission & Vision", "MISSING", ""],
            ["Core Values", "MISSING", ""],
        ]),
        ("Section 5: Academic Setup", [
            ["Programs offered", "MISSING", "Auto summary"],
            ["Departments", "MISSING", ""],
            ["Total courses", "MISSING", ""],
        ]),
        ("Section 6: Institutional Stats", [
            ["Total Students", "Implemented", "In institution card"],
            ["Total Teachers", "MISSING", ""],
            ["Active courses", "MISSING", ""],
        ]),
        ("Section 7: Subscription", [
            ["Plan type", "Implemented", "Free/Basic/Premium"],
            ["Renewal date", "MISSING", ""],
            ["Payment status", "MISSING", ""],
        ]),
        ("Section 8: Feature Access", [
            ["Toggle modules", "Implemented", "Feature flags"],
            ["Read-only view for admin", "MISSING", ""],
        ]),
        ("Section 9: Security", [
            ["Allowed domains", "MISSING", ""],
            ["IP restrictions", "MISSING", ""],
            ["2FA", "MISSING", ""],
        ]),
        ("Section 10: Documents", [
            ["Registration certificate", "MISSING", ""],
            ["Accreditation docs", "MISSING", ""],
            ["Legal papers", "MISSING", ""],
        ]),
        ("Section 11: Admin Notes", [
            ["Internal remarks", "MISSING", ""],
            ["Risk flags", "MISSING", ""],
            ["Support history", "MISSING", ""],
        ]),
    ]
    story.extend(module_block(8, "Institution Profile (11 Sections)", "~30%", "D", m8_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 9: ADMIN PROFILE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m9_sections = [
        ("Sections 1-4: Basic/Contact/Role/Institution Mapping", [
            ["Dedicated admin profile page", "MISSING", "Admin identity only name/email in user list"],
        ]),
        ("Section 5: Spiritual Profile", [
            ["Spiritual profile for admins", "MISSING", ""],
        ]),
        ("Section 6: Security", [
            ["Password", "Partial", "Backend has hashing"],
            ["2FA", "MISSING", ""],
            ["Last login", "Partial", "DB field"],
            ["Device history", "MISSING", ""],
        ]),
        ("Section 7: Activity Tracking", [
            ["Activity tracking", "MISSING", ""],
        ]),
        ("Section 8: Status Control", [
            ["Active/Inactive", "Partial", "Status field"],
            ["Suspended", "Partial", ""],
        ]),
    ]
    story.extend(module_block(9, "Admin Profile (8 Sections)", "~15%", "F", m9_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # MODULE 10: MULTI-TENANT WHITE-LABEL BRANDING
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    m10_sections = [
        ("Req 1: Institution-Based Branding", [
            ["Each institution has branding config", "Implemented", "BrandContext exists"],
            ["Dynamic name replacement", "Partial", "Context exists, not consumed everywhere"],
        ]),
        ("Req 2: Branding Fields", [
            ["display_name", "Implemented", ""],
            ["short_name", "Implemented", ""],
            ["logo_url", "Partial", "Field exists, no upload"],
            ["sidebar_logo_url", "Partial", "Field exists, no upload"],
            ["favicon_url", "Partial", "Field exists, no upload"],
            ["primary_color", "Implemented", ""],
            ["secondary_color", "Implemented", ""],
            ["theme_mode", "Partial", "Light only"],
            ["footer_text", "Implemented", ""],
            ["login_background", "Partial", "Field exists, no upload"],
        ]),
        ("Req 3: Global Branding Application", [
            ["Navbar (logo + name)", "MISSING", 'Hardcoded "CovenantERP"'],
            ["Sidebar (logo)", "MISSING", "Hardcoded"],
            ["Login page", "Partial", "Left panel exists"],
            ["Dashboard headers", "MISSING", ""],
            ["All pages dynamic", "MISSING", ""],
            ["Emails", "MISSING", ""],
            ["PDFs", "MISSING", ""],
        ]),
        ("Req 4: Frontend (React)", [
            ["Global Brand Context/Provider", "Implemented", "BrandContext.tsx"],
            ["Fetch on app load", "MISSING", "Uses hardcoded brands"],
            ["Store in global state", "Implemented", ""],
            ["Consume dynamically", "MISSING", "Components don't use useBrand()"],
            ["CSS variables", "Implemented", "--brand-primary/secondary"],
        ]),
        ("Req 5: Backend", [
            ["GET /api/institution/branding", "Implemented", "Endpoint exists"],
            ["Tenant-based return", "Implemented", ""],
            ["Per-institution storage", "Implemented", "In institutions table"],
        ]),
        ("Req 6: Multi-Tenant ID", [
            ["Subdomain identification", "MISSING", ""],
            ["Auth-based institution_id", "Partial", "Backend supports"],
            ["Correct branding load", "Partial", "Frontend uses localStorage"],
        ]),
        ("Req 7: File Upload", [
            ["Logo upload", "MISSING", ""],
            ["Favicon upload", "MISSING", ""],
            ["Login background upload", "MISSING", ""],
            ["Secure file storage", "MISSING", ""],
        ]),
        ("Req 8: Fallback Logic", [
            ["Default branding", "Implemented", "DEFAULT_BRANDING constant"],
        ]),
        ("Req 9: Security", [
            ["Admin-only update", "MISSING", "No auth for branding updates"],
            ["Super admin override", "MISSING", ""],
        ]),
        ("Req 10: Performance", [
            ["Cache branding", "MISSING", ""],
            ["Load before UI render", "MISSING", "No flicker prevention"],
        ]),
    ]
    story.extend(module_block(10, "Multi-tenant White-label Branding (10 Requirements)", "~40%", "D+", m10_sections))

    # ═══════════════════════════════════════════════════════════════════════
    # CONSOLIDATED SUMMARY TABLE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Spacer(1, 6))
    story.append(Paragraph("Consolidated Summary & Grading", style_section_title))
    story.append(HorizontalLine(avail_width, ACCENT_BLUE, 2))
    story.append(Spacer(1, 10))

    summary_style_h = ParagraphStyle('sh', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, leading=12, alignment=TA_CENTER)
    summary_style_mod = ParagraphStyle('sm', fontName='Helvetica', fontSize=8.5, textColor=HexColor('#1F2937'), leading=11)
    summary_style_pct = ParagraphStyle('sp', fontName='Helvetica-Bold', fontSize=8.5, textColor=HexColor('#1F2937'), leading=11, alignment=TA_CENTER)
    summary_style_grade = ParagraphStyle('sg', fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=TA_CENTER)

    summary_header = [
        Paragraph('Module', summary_style_h),
        Paragraph('Implementation %', summary_style_h),
        Paragraph('Grade', summary_style_h),
    ]

    modules_summary = [
        ("1. Student Enrollment Profile", "65%", "C+", GREEN_TEXT),
        ("2. Teacher Management System", "45%", "C-", AMBER_TEXT),
        ("3. Billing System", "35%", "D+", AMBER_TEXT),
        ("4. Academic Configuration", "50%", "C", AMBER_TEXT),
        ("5. Pedagogical Portal", "35%", "D+", AMBER_TEXT),
        ("6. Theological Library", "45%", "C-", AMBER_TEXT),
        ("7. Super Admin System", "35%", "D+", AMBER_TEXT),
        ("8. Institution Profile", "30%", "D", RED_TEXT),
        ("9. Admin Profile", "15%", "F", RED_TEXT),
        ("10. White-label Branding", "40%", "D+", AMBER_TEXT),
    ]

    cw_summary = [avail_width * 0.52, avail_width * 0.28, avail_width * 0.20]
    summary_data = [summary_header]
    for mod_name, pct, grade, grade_color in modules_summary:
        p_val = int(pct.replace('%', ''))
        if p_val >= 60:
            bg = GREEN_BG; tc = GREEN_TEXT
        elif p_val >= 35:
            bg = AMBER_BG; tc = AMBER_TEXT
        else:
            bg = RED_BG; tc = RED_TEXT

        summary_data.append([
            Paragraph(mod_name, summary_style_mod),
            Paragraph(pct, ParagraphStyle('', fontName='Helvetica-Bold', fontSize=9, textColor=tc, alignment=TA_CENTER, leading=12)),
            Paragraph(f'<font color="{grade_color.hexval()}">{grade}</font>', summary_style_grade),
        ])

    # Overall row
    summary_data.append([
        Paragraph('<b>OVERALL AVERAGE</b>', ParagraphStyle('', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, leading=12)),
        Paragraph('<b>~42%</b>', ParagraphStyle('', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE, alignment=TA_CENTER, leading=12)),
        Paragraph('<b>D+</b>', ParagraphStyle('', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE, alignment=TA_CENTER, leading=12)),
    ])

    st = Table(summary_data, colWidths=cw_summary, repeatRows=1)
    st.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, ACCENT_BLUE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        # Overall row
        ('BACKGROUND', (0, -1), (-1, -1), DEEP_BLUE),
        ('TEXTCOLOR', (0, -1), (-1, -1), WHITE),
    ]))
    for i in range(1, len(summary_data) - 1):
        if i % 2 == 0:
            st.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), LIGHT_GRAY)]))

    story.append(st)

    # ═══════════════════════════════════════════════════════════════════════
    # CRITICAL GAPS & RECOMMENDATIONS
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(Paragraph("Critical Gaps & Recommendations", style_section_title))
    story.append(HorizontalLine(avail_width, RED_TEXT, 2))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "The following are the top 10 critical gaps that must be addressed to bring CovenantERP to a production-ready state:",
        style_body
    ))
    story.append(Spacer(1, 8))

    critical_gaps = [
        "No real file upload functionality anywhere — documents, photos, and logos use text status fields only.",
        "No real-time API integration — all pages render hardcoded sample data without backend connectivity.",
        "No 2FA authentication or end-to-end encryption for sensitive spiritual and personal data.",
        "No email/SMS notification system for fee reminders, admission updates, or general communications.",
        "No payslip generation or receipt PDF download — financial documents cannot be exported.",
        "No drag-and-drop curriculum builder — curriculum management uses static list views.",
        "No AI features implemented — research assistant, curriculum builder, and financial insights are all MISSING.",
        "React components do not consume BrandContext dynamically — navbar, sidebar, and headers remain hardcoded.",
        "No dedicated admin profile management page — admin identity is limited to name/email in user lists.",
        "No activity/audit tracking UI — despite backend schema support, no user-facing audit log exists.",
    ]

    for i, gap in enumerate(critical_gaps, 1):
        story.append(CriticalGapItem(i, gap, avail_width))
        story.append(Spacer(1, 4))

    # ═══════════════════════════════════════════════════════════════════════
    # RECOMMENDATIONS
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 16))
    story.append(Paragraph("Priority Recommendations", style_section_title))
    story.append(HorizontalLine(avail_width, ACCENT_BLUE, 2))
    story.append(Spacer(1, 8))

    recs = [
        ("Phase 1 — Critical Infrastructure (Weeks 1-4)", [
            "Implement real file upload using multipart/form-data with secure storage (S3/MinIO).",
            "Connect all pages to live APIs; remove hardcoded sample data.",
            "Implement JWT-based authentication with 2FA (TOTP).",
            "Set up email/SMS notification service (SendGrid/Twilio integration).",
        ]),
        ("Phase 2 — Core Features (Weeks 5-10)", [
            "Build PDF generation for invoices, receipts, and payslips.",
            "Implement drag-and-drop curriculum designer with version control.",
            "Create dedicated Admin Profile and Institution Profile management pages.",
            "Wire BrandContext to all components (navbar, sidebar, headers, login page).",
        ]),
        ("Phase 3 — Advanced Capabilities (Weeks 11-16)", [
            "Integrate AI services for research assistant, curriculum suggestions, and financial insights.",
            "Build comprehensive audit logging UI with role-based filtering.",
            "Implement activity tracking dashboard for all user roles.",
            "Add interactive learning features (Zoom integration, discussion forums).",
        ]),
        ("Phase 4 — Polish & Launch (Weeks 17-20)", [
            "End-to-end encryption for spiritual records and personal data.",
            "Performance optimization — branding cache, lazy loading, bundle splitting.",
            "Multi-institution course sharing and marketplace features.",
            "Full security audit, penetration testing, and production deployment.",
        ]),
    ]

    for phase_title, items in recs:
        story.append(Paragraph(f'<b>{phase_title}</b>', ParagraphStyle(
            'phase', fontName='Helvetica-Bold', fontSize=9.5, leading=13,
            textColor=DEEP_BLUE, spaceBefore=10, spaceAfter=4
        )))
        for item in items:
            story.append(Paragraph(
                f'<font color="{ACCENT_BLUE.hexval()}">&#9679;</font>&nbsp;&nbsp;{item}',
                ParagraphStyle('item', fontName='Helvetica', fontSize=8.5, leading=12,
                              textColor=HexColor('#374151'), leftIndent=16, spaceBefore=2)
            ))

    # ═══════════════════════════════════════════════════════════════════════
    # FOOTER / DISCLAIMER
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 30))
    story.append(HorizontalLine(avail_width, BORDER_GRAY, 0.5))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<i>This report was generated on April 26, 2026 based on an automated audit of the CovenantERP codebase. "
        "All findings reflect the implementation state at the time of analysis and should be validated against "
        "the latest development branch. Recommendations are prioritized based on security, usability, and "
        "business impact.</i>",
        ParagraphStyle('disclaimer', fontName='Helvetica-Oblique', fontSize=7.5, leading=10,
                      textColor=MEDIUM_GRAY, alignment=TA_JUSTIFY)
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>CovenantERP Audit System</b> &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; &copy; 2026 CovenantERP Development Team",
        ParagraphStyle('footer_note', fontName='Helvetica', fontSize=7, leading=9,
                      textColor=MEDIUM_GRAY, alignment=TA_CENTER)
    ))

    # ─── BUILD ────────────────────────────────────────────────────────────
    doc.build(story)
    print(f"[OK] Report generated successfully: {OUTPUT_PATH}")
    print(f"     File size: {os.path.getsize(OUTPUT_PATH):,} bytes")


if __name__ == '__main__':
    build_report()
