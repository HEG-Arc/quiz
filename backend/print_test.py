from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.graphics import barcode
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER

import tempfile
import win32api

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
d = barcode.createBarcodeDrawing("QR", width=7*cm, height=7*cm, barBorder=0, value="http://gestion.he-arc.ch/quiz/3EGBHB3")
d.hAlign = "CENTER"
d.vAlign = "TOP"

normal.spaceAfter = 18
parts.append(Paragraph("Scannez votre ticket pour tourner la roue!", normal))
parts.append(d)
parts.append(Paragraph("999", h1))
parts.append(Paragraph("http://gestion.he-arc.ch/quiz", normal))
doc.build(parts)

from subprocess import call

acrobat = "C:\Program Files (x86)\Adobe\Reader 11.0\Reader\AcroRd32.exe"
printer = "EPSON TM-T20II Receipt"
#call([acrobat, "", pdf_file_name])
call([acrobat, "/h", "/s", "/o", "/t", pdf_file_name, printer])



