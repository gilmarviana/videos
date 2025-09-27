import PDFDocument from 'pdfkit';

export interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: Date;
  averageScore?: number | null;
  certificateId: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Certificate design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Background and border
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
         .lineWidth(3)
         .stroke('#2563eb');

      doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
         .lineWidth(1)
         .stroke('#64748b');

      // Header
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text('CERTIFICADO DE CONCLUSÃO', 0, 100, { align: 'center' });

      // Decorative line
      doc.moveTo(centerX - 150, 150)
         .lineTo(centerX + 150, 150)
         .lineWidth(2)
         .stroke('#2563eb');

      // Main content
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#374151')
         .text('Certificamos que', 0, 200, { align: 'center' });

      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text(data.userName.toUpperCase(), 0, 240, { align: 'center' });

      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#374151')
         .text('concluiu com êxito o curso', 0, 290, { align: 'center' });

      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text(data.courseName, 0, 330, { align: 'center' });

      // Score information (if available)
      if (data.averageScore !== null && data.averageScore !== undefined) {
        doc.fontSize(16)
           .font('Helvetica')
           .fillColor('#374151')
           .text(`com aproveitamento de ${data.averageScore.toFixed(1)}%`, 0, 380, { align: 'center' });
      }

      // Date and certificate ID
      const formattedDate = data.completionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(`Emitido em ${formattedDate}`, 0, 450, { align: 'center' });

      // Certificate ID
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text(`ID do Certificado: ${data.certificateId}`, 0, 480, { align: 'center' });

      // Footer
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text('Plataforma de Cursos Online', 0, 520, { align: 'center' });

      // Verification note
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Este certificado pode ser verificado em nossa plataforma usando o ID acima', 0, 550, { align: 'center' });

      // Decorative elements
      // Left decoration
      doc.circle(80, centerX, 20)
         .fillColor('#dbeafe')
         .fill();

      doc.circle(80, centerX, 15)
         .fillColor('#2563eb')
         .fill();

      // Right decoration
      doc.circle(pageWidth - 80, centerX, 20)
         .fillColor('#dbeafe')
         .fill();

      doc.circle(pageWidth - 80, centerX, 15)
         .fillColor('#2563eb')
         .fill();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateCertificateTemplate(): Buffer {
  // This could be used for creating a template that can be customized
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape'
  });

  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // Basic template structure
  doc.fontSize(20)
     .text('Certificate Template', 100, 100);

  doc.end();
  
  return Buffer.concat(buffers);
}