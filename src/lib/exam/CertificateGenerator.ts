import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateCertificate = (totalScore: number, scores: Record<string, number>, variantId: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background Decorations
  doc.setFillColor(245, 245, 247);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Logo Placeholder / Icon
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(pageWidth / 2 - 15, 25, 30, 30, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('DP', pageWidth / 2, 45, { align: 'center' });

  // Main Title
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.text('ZERTIFIKAT', pageWidth / 2, 75, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('GOETHE-ZERTIFIKAT B1 SIMULATION', pageWidth / 2, 85, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(pageWidth / 2 - 40, 95, pageWidth / 2 + 40, 95);

  // Body Text
  doc.setFontSize(14);
  doc.text('Dieses Dokument bestätigt die erfolgreiche Teilnahme an der', pageWidth / 2, 110, { align: 'center' });
  doc.text(`Prüfungssimulation Variante ${variantId}`, pageWidth / 2, 118, { align: 'center' });

  // Scores Table
  const tableData = [
    ['Modul', 'Ergebnis', 'Max. Punkte', 'Status'],
    ['Lesen', `${scores.lesen || 0}`, '20', (scores.lesen || 0) >= 12 ? 'Bestanden' : 'Nicht bestanden'],
    ['Hören', `${scores.horen || 0}`, '15', (scores.horen || 0) >= 9 ? 'Bestanden' : 'Nicht bestanden'],
    ['Schreiben', `${scores.schreiben || 0}`, '20', (scores.schreiben || 0) >= 12 ? 'Bestanden' : 'Nicht bestanden'],
    ['Sprechen', `${scores.sprechen || 0}`, '25', (scores.sprechen || 0) >= 15 ? 'Bestanden' : 'Nicht bestanden']
  ];

  (doc as any).autoTable({
    startY: 130,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], halign: 'center', fontStyle: 'bold' },
    bodyStyles: { halign: 'center', fontSize: 12 },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      3: { fontStyle: 'bold' }
    },
    margin: { left: 50, right: 50 }
  });

  // Footer / Signature
  const finalY = (doc as any).lastAutoTable.cursor.y + 20;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString('de-DE');
  doc.text(`Datum: ${today}`, 50, finalY);
  doc.text(`DeutschPath Online-Akademie`, pageWidth - 50, finalY, { align: 'right' });

  doc.setDrawColor(100);
  doc.line(50, finalY + 15, 100, finalY + 15);
  doc.line(pageWidth - 100, finalY + 15, pageWidth - 50, finalY + 15);
  
  doc.setFontSize(8);
  doc.text('Unterschrift der Kursleitung', 75, finalY + 20, { align: 'center' });
  doc.text('Prüfungssiegel', pageWidth - 75, finalY + 20, { align: 'center' });

  // Save the PDF
  doc.save(`Goethe_B1_Zertifikat_${variantId}.pdf`);
};
