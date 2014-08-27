from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.graphics import barcode
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from subprocess import call
import tempfile

class Printer:
  def doPrint(self, app, qrcode_value, score):
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

    doc = SimpleDocTemplate (pdf_file_name)
    doc.pagesize = (8*cm, 29*cm)
    doc.topMargin = 0
    doc.leftMargin = 0
    doc.rightMargin = 0

    parts = []
    d = barcode.createBarcodeDrawing("QR", width=7*cm, height=7*cm, barBorder=0, value=qrcode_value)
    d.hAlign = "CENTER"
    d.vAlign = "TOP"

    normal.spaceAfter = 18
    parts.append(Paragraph("Scannez votre ticket pour tourner la roue!", normal))
    parts.append(d)
    parts.append(Paragraph(str(score), h1))
    parts.append(Paragraph(app.config.get('url'), normal))
    doc.build(parts)
    call([app.config.get('acrobat'), "", pdf_file_name])
    #call([app.config.get('acrobat'), "/h", "/s", "/o", "/t", pdf_file_name, app.config.get('printer_name')])



