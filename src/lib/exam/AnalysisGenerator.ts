import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAnalysisReport = (
  variantId: string,
  scores: Record<string, number>,
  answers: Record<string, any>,
  examData: any
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const brandColor = [255, 204, 0]; // #ffcc00
  const darkColor = [10, 10, 10]; // #0a0a0a

  // Helper: Header
  const addHeader = (title: string) => {
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('DEUTSCHPATH', 20, 20);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFontSize(10);
    doc.text('PREMIUM PRÜFUNGSSIMULATION ANALYSE', 20, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(title, pageWidth - 20, 25, { align: 'right' });
    
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(1);
    doc.line(20, 32, pageWidth - 20, 32);
  };

  // Helper: Footer
  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`© 2026 DEUTSCHPATH • URHEBERRECHTLICH GESCHÜTZT`, 20, pageHeight - 10);
    doc.text(`Seite ${pageNum}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  };

  // --- PAGE 1: COVER ---
  addHeader('ERGEBNISÜBERSICHT');
  
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text(`Prüfungsvariante: ${variantId}`, 20, 55);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 62);

  // Score Summary Table
  const summaryData = [
    ['Modul', 'Ergebnis (Scaled)', 'Status'],
    ['Lesen', `${Math.round(((scores.lesen || 0) / 30) * 100)} / 100`, (scores.lesen || 0) >= 18 ? 'Bestanden' : 'Nicht bestanden'],
    ['Hören', `${Math.round(((scores.horen || 0) / 30) * 100)} / 100`, (scores.horen || 0) >= 18 ? 'Bestanden' : 'Nicht bestanden'],
    ['Schreiben', `${scores.schreiben || 0} / 100`, (scores.schreiben || 0) >= 60 ? 'Bestanden' : 'Nicht bestanden'],
    ['Sprechen', `${scores.sprechen || 0} / 100`, (scores.sprechen || 0) >= 60 ? 'Bestanden' : 'Nicht bestanden']
  ];

  autoTable(doc, {
    startY: 75,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: darkColor as any, textColor: brandColor as any, fontStyle: 'bold' },
    margin: { left: 20, right: 20 }
  });

  const finalScore = Math.round(Object.values(scores).reduce((a, b) => a + (b || 0), 0) / 4);
  const passStatus = finalScore >= 60 ? 'BESTANDEN' : 'NICHT BESTANDEN';
  
  doc.setFontSize(18);
  if (finalScore >= 60) {
    doc.setTextColor(34, 197, 94);
  } else {
    doc.setTextColor(239, 68, 68);
  }
  
  const lastY = (doc as any).lastAutoTable?.cursor?.y || 120;
  doc.text(`Gesamturteil: ${passStatus} (${finalScore}%)`, pageWidth / 2, lastY + 20, { align: 'center' });

  addFooter(1);

  // --- MODULE DETAILS ---
  let pageCount = 2;

  // Function to process a module
  const processModule = (modId: string, modName: string) => {
    if (!examData[modId]) return;
    
    doc.addPage();
    addHeader(`ANALYSE: ${modName.toUpperCase()}`);
    
    const modData = examData[modId];
    let currentY = 50;

    Object.keys(modData).filter(k => k.startsWith('teil')).forEach(teilKey => {
      const teil = modData[teilKey];
      const items = teil.items || teil.texts?.flatMap((t: any) => t.items || [t.q1, t.q2]) || teil.situations || [];
      const validItems = items.filter(Boolean);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Teil ${teilKey.replace('teil', '')}: ${teil.instructions || ''}`, 20, currentY);
      currentY += 8;

      if (modId === 'horen' && (teil.transcript || teil.texts?.[0]?.transcript)) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const transcript = teil.transcript || teil.texts?.[0]?.transcript;
        const splitTranscript = doc.splitTextToSize(`Transkription: ${transcript}`, pageWidth - 40);
        doc.text(splitTranscript, 20, currentY);
        currentY += (splitTranscript.length * 4) + 5;
      }

      const rows = validItems.map((item: any, idx: number) => {
        const teilNum = teilKey.replace('teil', '').replace('aufgabe', '');
        const userAnsKey = `${modId}_${teilNum}`;
        const userAns = answers[userAnsKey]?.[item.id] || answers[`${userAnsKey}_${idx}`] || '---';
        const correctAns = item.correct;
        const isCorrect = String(userAns).toLowerCase() === String(correctAns).toLowerCase();
        
        return [
          item.text || `Aufgabe ${item.id}`,
          userAns,
          correctAns,
          isCorrect ? 'Richtig' : 'Falsch'
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Aufgabe', 'Deine Antwort', 'Korrekt', 'Status']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          3: { fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          currentY = data.cursor.y + 10;
        }
      });
      
      currentY = ((doc as any).lastAutoTable?.cursor?.y || currentY) + 10;
      
      // Page break check
      if (currentY > pageHeight - 40) {
        doc.addPage();
        addHeader(`ANALYSE: ${modName.toUpperCase()} (Fortsetzung)`);
        currentY = 50;
      }
    });

    addFooter(pageCount++);
  };

  processModule('lesen', 'Lesen');
  processModule('horen', 'Hören');

  // For Schreiben and Sprechen, list the prompts AND user answers
  const processSubjectiveModule = (modId: string, modName: string) => {
    if (!examData[modId]) return;
    doc.addPage();
    addHeader(`ANALYSE: ${modName.toUpperCase()}`);
    
    const modData = examData[modId];
    let currentY = 50;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Hinweis: Diese Module werden manuell bewertet. Hier sind die Aufgabenstellungen und Ihre Antworten.', 20, currentY);
    currentY += 10;

    Object.keys(modData).filter(k => k.startsWith('teil') || k.startsWith('aufgabe')).forEach(teilKey => {
      const teil = modData[teilKey];
      const teilNum = teilKey.replace('teil', '').replace('aufgabe', '');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`${modName} Teil ${teilNum}`, 20, currentY);
      currentY += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const prompt = teil.prompt || teil.situation || teil.thema || teil.instructions || '---';
      const splitPrompt = doc.splitTextToSize(`Aufgabe: ${prompt}`, pageWidth - 40);
      doc.text(splitPrompt, 20, currentY);
      currentY += (splitPrompt.length * 4) + 6;

      // SHOW USER ANSWER
      const userAnsKey = `${modId}_${teilNum}`;
      const userAns = answers[userAnsKey];

      if (userAns) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('DEINE ANTWORT:', 20, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        if (Array.isArray(userAns)) {
          // Chat history (Sprechen)
          userAns.forEach((msg: any) => {
            const roleLabel = msg.role === 'user' ? 'Ich: ' : 'Partner: ';
            const splitMsg = doc.splitTextToSize(roleLabel + msg.content, pageWidth - 50);
            
            if (currentY + (splitMsg.length * 4) > pageHeight - 20) {
              doc.addPage();
              addHeader(`ANALYSE: ${modName.toUpperCase()} (Fortsetzung)`);
              currentY = 50;
            }

            doc.text(splitMsg, 25, currentY);
            currentY += (splitMsg.length * 4) + 2;
          });
          currentY += 5;
        } else if (typeof userAns === 'string') {
          // Written text (Schreiben)
          const splitAns = doc.splitTextToSize(userAns, pageWidth - 40);
          
          if (currentY + (splitAns.length * 4) > pageHeight - 20) {
            doc.addPage();
            addHeader(`ANALYSE: ${modName.toUpperCase()} (Fortsetzung)`);
            currentY = 50;
          }

          doc.text(splitAns, 20, currentY);
          currentY += (splitAns.length * 4) + 10;
        }
      }

      // Page break check between parts
      if (currentY > pageHeight - 40) {
        doc.addPage();
        addHeader(`ANALYSE: ${modName.toUpperCase()} (Fortsetzung)`);
        currentY = 50;
      }
    });

    // Special case for Sprechen notes
    if (modId === 'sprechen' && answers['sprechen_notes']) {
      doc.addPage();
      addHeader('DEINE NOTIZEN (Vorbereitung)');
      let noteY = 50;
      const notes = answers['sprechen_notes'];
      Object.entries(notes).forEach(([folie, text]: [any, any]) => {
        if (!text || !text.trim()) return;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Folie ${folie}:`, 20, noteY);
        noteY += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitNote = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(splitNote, 20, noteY);
        noteY += (splitNote.length * 4) + 8;

        if (noteY > pageHeight - 20) {
          doc.addPage();
          addHeader('DEINE NOTIZEN (Fortsetzung)');
          noteY = 50;
        }
      });
    }

    addFooter(pageCount++);
  };

  processSubjectiveModule('schreiben', 'Schreiben');
  processSubjectiveModule('sprechen', 'Sprechen');

  // Save PDF
  doc.save(`DeutschPath_Analyse_B1_Var_${variantId}.pdf`);
};
