import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ManualEntryApiResponse = {
  type: 'manual';
  data: Array<{
    biomarker: string;
    value: string | number;
    unit?: string;
  }>;
};

export const downloadManualEntryPdfFromApi = (
  payload: ManualEntryApiResponse,
  fileName = 'manual-entry.pdf',
) => {
  if (!payload?.data?.length) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 36;
  const topY = 36;

  // Header card (nice UI)
  doc.setFillColor(233, 240, 242);
  doc.roundedRect(marginX, topY, pageWidth - marginX * 2, 70, 10, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text('Manual Entry Biomarkers', marginX + 18, topY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(
    [
      `Type: ${payload.type}`,
      `Exported At: ${new Date().toLocaleString()}`,
    ].join('\n'),
    marginX + 18,
    topY + 48,
  );

  doc.text(
    `Total Biomarkers: ${payload.data.length}`,
    pageWidth - marginX - 160,
    topY + 48,
  );

  autoTable(doc, {
    startY: topY + 90,
    theme: 'grid',
    head: [['Biomarker', 'Value', 'Unit']],
    body: payload.data.map((row) => [
      row.biomarker ?? '—',
      row.value ?? '—',
      row.unit ?? '—',
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 8,
      valign: 'middle',
      textColor: [25, 25, 25],
      lineColor: [220, 220, 220],
      lineWidth: 0.6,
    },
    headStyles: {
      fillColor: [233, 240, 242],
      textColor: [20, 20, 20],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },

    // Body alignment
    columnStyles: {
      0: { halign: 'left', cellWidth: 280 }, // Biomarker
      1: { halign: 'center', cellWidth: 120 }, // Value
      2: { halign: 'center', cellWidth: 120 }, // Unit
    },

    // 👇 THIS FIXES HEADER ALIGNMENT PER COLUMN
    didParseCell: (data:any) => {
      if (data.section === 'head') {
        if (data.column.index === 0) {
          data.cell.styles.halign = 'left'; // Biomarker header
        } else {
          data.cell.styles.halign = 'center'; // Value + Unit headers
        }
      }
    },
  });

  doc.save(fileName);
};
