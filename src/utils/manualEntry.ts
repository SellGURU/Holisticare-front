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
  uploadedAt?: string, // ✅ pass your uploaded date here
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

  // --- Header card (rounded) ---
  const headerH = 60;
  const headerW = pageWidth - marginX * 2;

  doc.setFillColor(233, 240, 242);
  doc.roundedRect(marginX, topY, headerW, headerH, 10, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text('Manual Entry Biomarkers', marginX + 8, topY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);

  // Left meta (same padding)
  doc.text(
    [`Uploaded at: ${uploadedAt || '—'}`].join('\n'),
    marginX + 8,
    topY + 48,
  );

  // Right meta (aligned to same right padding as left uses on its side)
  const rightPad = 8; // match left "8"
  const totalText = `Total Biomarkers: ${payload.data.length}`;
  doc.text(totalText, pageWidth - marginX - rightPad, topY + 48, {
    align: 'right',
  });

  // --- Table ---
  const tableStartY = topY + 90;

  autoTable(doc, {
    startY: tableStartY,
    theme: 'grid',
    head: [['Biomarker', 'Value', 'Unit']],
    body: payload.data.map((row) => [
      row.biomarker ?? '—',
      row.value ?? '—',
      row.unit ?? '—',
    ]),
    margin: { left: marginX, right: marginX }, // ✅ match header width
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
    columnStyles: {
      0: { halign: 'left', cellWidth: 280 }, // Biomarker
      1: { halign: 'center', cellWidth: 120 }, // Value
      2: { halign: 'center', cellWidth: 120 }, // Unit
    },
    didParseCell: (data: any) => {
      if (data.section === 'head') {
        if (data.column.index === 0) data.cell.styles.halign = 'left';
        else data.cell.styles.halign = 'center';
      }
    },
  });

  // --- Rounded border around the table (safe guard to avoid jsPDF.roundedRect crash) ---
  const last = (doc as any).lastAutoTable;

  if (
    last &&
    typeof last.startY === 'number' &&
    typeof last.finalY === 'number' &&
    last.finalY > last.startY
  ) {
    const left = last.settings?.margin?.left ?? marginX;
    const right = last.settings?.margin?.right ?? marginX;

    const x = left;
    const y = last.startY;
    const w = pageWidth - left - right;
    const h = last.finalY - last.startY;

    if (w > 0 && h > 0) {
      const radius = 10;
      const pad = 2;

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.8);

      // draw rounded outline (S = stroke)
      doc.roundedRect(x, y - pad, w, h + pad * 2, radius, radius, 'S');
    }
  }

  doc.save(fileName);
};
