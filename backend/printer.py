# -*- coding: utf-8 -*-
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics import barcode
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('FontAwesome', 'fontawesome-webfont.ttf'))

from subprocess import call
import tempfile

class Printer:
  def doPrint(self, app, qrcode_value, raw_score):
    pdf_file_name = tempfile.mktemp (".pdf")
    styles = getSampleStyleSheet ()
    h1 = styles["h1"]
    h1.alignment=TA_CENTER
    h1.fontSize = 36
    h1.spaceBefore = 10
    h1.spaceAfter = 22
    normal = styles["Normal"]
    normal.alignment=TA_CENTER
    normal.fontSize = 16
    starStyle = ParagraphStyle(name='Star',
                                  fontName='FontAwesome',
                                  fontSize=20,
                                  alignment=TA_CENTER,
                                  spaceAfter = 18)

    doc = SimpleDocTemplate (pdf_file_name)
    doc.pagesize = (8*cm, 29*cm)
    doc.topMargin = 0
    doc.leftMargin = 0
    doc.rightMargin = 0

    wheel_threshold = app.config.get('wheel_threshold')
    number_questions = app.config.get('number_questions')
    percent = float(raw_score) / float(number_questions)
    canWheel = float(percent) >= float(wheel_threshold) / float(number_questions)

    parts = []
    imagename = "images/stylo.png"
    normal.spaceAfter = 18
    if canWheel:
      parts.append(Paragraph(app.config.get('wheel_txt'), normal))

      d = barcode.createBarcodeDrawing("QR", width=4*cm, height=4*cm, barBorder=0, value=qrcode_value)
      d.hAlign = "CENTER"
      d.vAlign = "TOP"    
      parts.append(d)
    else:
      parts.append(Paragraph(app.config.get('no_wheel_txt'), normal))
      parts.append(Image(imagename, 4*cm, 4*cm))

    parts.append(Paragraph(str(app.config.scoreValueTable()[raw_score]), h1))
    empty_star = u"\uF006"
    full_star = u"\uF005"
    
    stars = u""
    if percent <= 0.3:
      stars += 3 * empty_star
    elif percent < 0.6:
      stars += full_star + 2 * empty_star
    elif percent < 1:
      stars += 2 * full_star + empty_star
    else:
      stars += 3 * full_star
      
    parts.append(Paragraph(stars, starStyle))
    
    parts.append(Paragraph(app.config.get('url'), normal))
    doc.build(parts)
    call([app.config.get('acrobat'), "", pdf_file_name])
    #call([app.config.get('foxit'), "/t", pdf_file_name, app.config.get('printer_name')])
    #call([app.config.get('acrobat'), "", pdf_file_name, app.config.get('printer_name')])
    #call([app.config.get('sumatra'), pdf_file_name, "-print-to", app.config.get('printer_name')])