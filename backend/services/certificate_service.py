from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime
import os

def generate_certificate(student_name: str, course_name: str, completion_date: str, output_path: str = "certificates"):
    """Generate a PDF certificate for course completion"""
    
    # Create certificates directory if it doesn't exist
    os.makedirs(output_path, exist_ok=True)
    
    # Generate filename
    filename = f"{output_path}/certificate_{student_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    # Create PDF
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    
    # Draw border
    c.setStrokeColor(colors.HexColor('#6366f1'))
    c.setLineWidth(3)
    c.rect(0.5*inch, 0.5*inch, width-inch, height-inch)
    
    # Draw inner border
    c.setStrokeColor(colors.HexColor('#8b5cf6'))
    c.setLineWidth(1)
    c.rect(0.75*inch, 0.75*inch, width-1.5*inch, height-1.5*inch)
    
    # Title
    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(colors.HexColor('#6366f1'))
    c.drawCentredString(width/2, height-2*inch, "CERTIFICATE")
    
    c.setFont("Helvetica", 20)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, height-2.5*inch, "OF COMPLETION")
    
    # Divider line
    c.setStrokeColor(colors.HexColor('#f59e0b'))
    c.setLineWidth(2)
    c.line(2*inch, height-3*inch, width-2*inch, height-3*inch)
    
    # Body text
    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2, height-4*inch, "This is to certify that")
    
    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(colors.HexColor('#6366f1'))
    c.drawCentredString(width/2, height-4.7*inch, student_name)
    
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, height-5.4*inch, "has successfully completed the course")
    
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(colors.HexColor('#8b5cf6'))
    c.drawCentredString(width/2, height-6.1*inch, course_name)
    
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, height-6.8*inch, f"on {completion_date}")
    
    # Footer
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.HexColor('#6366f1'))
    c.drawCentredString(width/2, 2*inch, "Python Coaching Center")
    
    c.setFont("Helvetica", 12)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, 1.5*inch, "Empowering Future Developers")
    
    # Save PDF
    c.save()
    
    return filename
