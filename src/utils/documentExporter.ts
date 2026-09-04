import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { WORSHIP_GUIDE_SECTIONS, WORSHIP_GUIDE_TITLE, WORSHIP_GUIDE_SUBTITLE, RAW_MARKDOWN_GUIDE } from './worshipGuideContent';

/**
 * Downloads the User Guide as a Microsoft Word document (.docx)
 */
export async function downloadWordDocx(): Promise<void> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/_rels/document.xml.rels
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  // 4. word/styles.xml
  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/>
        <w:sz w:val="22"/>
        <w:color w:val="27272A"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`
  );

  // Helper function to escape XML
  const xmlEscape = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // 5. Generate word/document.xml body
  let bodyXml = '';

  // Title
  bodyXml += `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="240" w:after="80"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="44"/>
          <w:color w:val="B45309"/>
        </w:rPr>
        <w:t>${xmlEscape(WORSHIP_GUIDE_TITLE)}</w:t>
      </w:r>
    </w:p>`;

  // Subtitle
  bodyXml += `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="360"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:i/>
          <w:sz w:val="26"/>
          <w:color w:val="71717A"/>
        </w:rPr>
        <w:t>${xmlEscape(WORSHIP_GUIDE_SUBTITLE)}</w:t>
      </w:r>
    </w:p>`;

  // Render all sections grouped by category
  let lastCategory = '';
  for (const sec of WORSHIP_GUIDE_SECTIONS) {
    if (sec.category && sec.category !== lastCategory) {
      lastCategory = sec.category;
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="400" w:after="140"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="32"/>
            <w:color w:val="D97706"/>
          </w:rPr>
          <w:t>━━━ CATEGORY: ${xmlEscape(sec.category.toUpperCase())} ━━━</w:t>
        </w:r>
      </w:p>`;
    }

    // Section Heading
    bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="280" w:after="80"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="28"/>
            <w:color w:val="18181B"/>
          </w:rPr>
          <w:t>${xmlEscape(sec.title)}</w:t>
        </w:r>
      </w:p>`;

    // Plain English Summary if available
    if (sec.summary) {
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:after="100"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:i/>
            <w:sz w:val="22"/>
            <w:color w:val="52525B"/>
          </w:rPr>
          <w:t>${xmlEscape(sec.summary)}</w:t>
        </w:r>
      </w:p>`;
    }

    // Content paragraphs
    for (const para of sec.content) {
      const lines = para.split('\n');
      for (const line of lines) {
        if (line.startsWith('•')) {
          bodyXml += `
            <w:p>
              <w:pPr>
                <w:ind w:left="360"/>
                <w:spacing w:after="60"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:color w:val="3F3F46"/>
                </w:rPr>
                <w:t>${xmlEscape(line)}</w:t>
              </w:r>
            </w:p>`;
        } else {
          bodyXml += `
            <w:p>
              <w:pPr>
                <w:spacing w:after="100"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:color w:val="27272A"/>
                </w:rPr>
                <w:t>${xmlEscape(line)}</w:t>
              </w:r>
            </w:p>`;
        }
      }
    }

    // Subsections (e.g. Main A, Main B, Main C, Main D)
    if (sec.subsections && sec.subsections.length > 0) {
      for (const sub of sec.subsections) {
        bodyXml += `
          <w:p>
            <w:pPr>
              <w:spacing w:before="160" w:after="80"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:b/>
                <w:sz w:val="24"/>
                <w:color w:val="D97706"/>
              </w:rPr>
              <w:t>${xmlEscape(sub.title)}</w:t>
            </w:r>
          </w:p>`;

        if (sub.description) {
          const subLines = sub.description.split('\n');
          for (const sLine of subLines) {
            bodyXml += `
              <w:p>
                <w:pPr>
                  <w:ind w:left="${sLine.startsWith('•') ? '360' : '0'}"/>
                  <w:spacing w:after="60"/>
                </w:pPr>
                <w:r>
                  <w:t>${xmlEscape(sLine)}</w:t>
                </w:r>
              </w:p>`;
          }
        }

        if (sub.bestFor && sub.bestFor.length > 0) {
          bodyXml += `
            <w:p>
              <w:pPr>
                <w:spacing w:before="80" w:after="40"/>
              </w:pPr>
              <w:r>
                <w:rPr><w:b/><w:color w:val="52525B"/></w:rPr>
                <w:t>Best for:</w:t>
              </w:r>
            </w:p>`;
          for (const item of sub.bestFor) {
            bodyXml += `
              <w:p>
                <w:pPr>
                  <w:ind w:left="360"/>
                  <w:spacing w:after="40"/>
                </w:pPr>
                <w:r>
                  <w:t>• ${xmlEscape(item)}</w:t>
                </w:r>
              </w:p>`;
          }
        }
      }
    }

    // Table (e.g. Quick Reference)
    if (sec.table) {
      bodyXml += `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="4" w:space="0" w:color="D4D4D8"/>
              <w:left w:val="single" w:sz="4" w:space="0" w:color="D4D4D8"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D4D4D8"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="D4D4D8"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E4E4E7"/>
              <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E4E4E7"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            ${sec.table.headers
              .map(
                (h) => `
              <w:tc>
                <w:tcPr>
                  <w:shd w:val="clear" w:color="auto" w:fill="F4F4F5"/>
                </w:tcPr>
                <w:p>
                  <w:pPr><w:spacing w:after="80" w:before="80"/></w:pPr>
                  <w:r>
                    <w:rPr><w:b/></w:rPr>
                    <w:t>${xmlEscape(h)}</w:t>
                  </w:r>
                </w:p>
              </w:tc>`
              )
              .join('')}
          </w:tr>
          ${sec.table.rows
            .map(
              (r) => `
            <w:tr>
              ${r.map((cell, cIdx) => `
                <w:tc>
                  <w:p>
                    <w:pPr><w:spacing w:after="60" w:before="60"/></w:pPr>
                    <w:r>
                      ${cIdx === 0 ? '<w:rPr><w:b/></w:rPr>' : ''}
                      <w:t>${xmlEscape(cell)}</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              `).join('')}
            </w:tr>`
            )
            .join('')}
        </w:tbl>`;
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, 'DM_Arrangia_User_Guide.docx');
}

/**
 * Downloads the User Guide as a PDF document using jsPDF with multi-page layout and styling
 */
export function downloadPdf(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 8) {
      doc.addPage();
      cursorY = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140, 140, 140);
      
      // Top runner
      doc.text('DM ARRANGIA — User Guide & Worship Companion', margin, 10);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 12, pageWidth - margin, 12);

      // Bottom footer
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
  };

  // Main Cover / Title Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(WORSHIP_GUIDE_TITLE, margin, cursorY + 6);
  cursorY += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text(WORSHIP_GUIDE_SUBTITLE, margin, cursorY);
  cursorY += 6;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Render all sections
  let lastPdfCategory = '';
  for (const sec of WORSHIP_GUIDE_SECTIONS) {
    if (sec.category && sec.category !== lastPdfCategory) {
      lastPdfCategory = sec.category;
      checkPageBreak(24);
      doc.setFillColor(245, 245, 247);
      doc.rect(margin, cursorY, maxLineWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(180, 83, 9); // Amber-700
      doc.text(`CATEGORY: ${sec.category.toUpperCase()}`, margin + 3, cursorY + 5.5);
      cursorY += 12;
    }

    checkPageBreak(16);

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(24, 24, 27); // Zinc-900
    doc.text(sec.title, margin, cursorY);
    cursorY += 5.5;

    // Plain English Summary if present
    if (sec.summary) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const sumLines = doc.splitTextToSize(sec.summary, maxLineWidth);
      for (const sl of sumLines) {
        checkPageBreak(5);
        doc.text(sl, margin, cursorY);
        cursorY += 4;
      }
      cursorY += 2;
    }

    // Paragraphs
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);

    for (const para of sec.content) {
      const lines = para.split('\n');
      for (const line of lines) {
        checkPageBreak(6);
        const isBullet = line.startsWith('•');
        const splitText = doc.splitTextToSize(line, isBullet ? maxLineWidth - 6 : maxLineWidth);
        
        for (const t of splitText) {
          checkPageBreak(5);
          doc.text(t, isBullet ? margin + 4 : margin, cursorY);
          cursorY += 4.5;
        }
        cursorY += 1;
      }
      cursorY += 2;
    }

    // Subsections (Main A, Main B, etc.)
    if (sec.subsections) {
      for (const sub of sec.subsections) {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(180, 83, 9);
        doc.text(sub.title, margin + 2, cursorY);
        cursorY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);

        if (sub.description) {
          const subLines = sub.description.split('\n');
          for (const sl of subLines) {
            const isB = sl.startsWith('•');
            const st = doc.splitTextToSize(sl, isB ? maxLineWidth - 10 : maxLineWidth - 4);
            for (const t of st) {
              checkPageBreak(4.5);
              doc.text(t, isB ? margin + 6 : margin + 2, cursorY);
              cursorY += 4.2;
            }
          }
        }

        if (sub.bestFor && sub.bestFor.length > 0) {
          checkPageBreak(6);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(90, 90, 90);
          doc.text('Best for:', margin + 2, cursorY);
          cursorY += 4;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          for (const bf of sub.bestFor) {
            checkPageBreak(4.5);
            doc.text(`• ${bf}`, margin + 6, cursorY);
            cursorY += 4;
          }
        }
        cursorY += 3;
      }
    }

    // Table
    if (sec.table) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, cursorY, maxLineWidth, 6, 'F');
      doc.setTextColor(20, 20, 20);

      const numCols = sec.table.headers.length;
      const colWidth = maxLineWidth / numCols;
      sec.table.headers.forEach((h, hIdx) => {
        doc.text(h, margin + 2 + hIdx * colWidth, cursorY + 4.2);
      });
      cursorY += 6.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      for (const row of sec.table.rows) {
        checkPageBreak(6);
        row.forEach((cell, cIdx) => {
          if (cIdx === 0) {
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFont('helvetica', 'normal');
          }
          const truncated = cell.length > 45 ? cell.substring(0, 42) + '...' : cell;
          doc.text(truncated, margin + 2 + cIdx * colWidth, cursorY + 4);
        });

        doc.setDrawColor(230, 230, 230);
        doc.line(margin, cursorY + 5.5, margin + maxLineWidth, cursorY + 5.5);
        cursorY += 6;
      }
      cursorY += 4;
    }

    cursorY += 4;
  }

  // Draw header and footers with accurate total page count
  drawHeaderFooter();

  doc.save('DM_Arrangia_User_Guide.pdf');
}

/**
 * Downloads the User Guide as Markdown (.md)
 */
export function downloadMarkdown(): void {
  const blob = new Blob([RAW_MARKDOWN_GUIDE], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, 'DM_Arrangia_User_Guide.md');
}

/**
 * Browser Print dialog tailored for printable PDF generation
 */
export function printUserGuide(): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${WORSHIP_GUIDE_TITLE} — ${WORSHIP_GUIDE_SUBTITLE}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #18181b;
            background: #fff;
            padding: 2.5rem;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }
          h1 { color: #b45309; font-size: 2rem; margin-bottom: 0.25rem; }
          h2 { color: #71717a; font-size: 1.25rem; font-weight: normal; margin-top: 0; margin-bottom: 1.5rem; border-bottom: 1px solid #e4e4e7; padding-bottom: 0.5rem; }
          h3 { color: #18181b; font-size: 1.15rem; margin-top: 1.75rem; margin-bottom: 0.5rem; }
          h4 { color: #d97706; font-size: 1rem; margin-top: 1.25rem; margin-bottom: 0.25rem; }
          p { margin: 0.5rem 0; font-size: 0.95rem; }
          ul { margin: 0.5rem 0; padding-left: 1.5rem; }
          li { margin: 0.25rem 0; font-size: 0.95rem; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
          th, td { border: 1px solid #e4e4e7; padding: 0.5rem 0.75rem; text-align: left; }
          th { background-color: #f4f4f5; font-weight: bold; }
          hr { border: none; border-top: 1px solid #e4e4e7; margin: 2rem 0; }
          @media print {
            body { padding: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <h1>${WORSHIP_GUIDE_TITLE}</h1>
        <h2>${WORSHIP_GUIDE_SUBTITLE}</h2>
        ${(() => {
          let lastCat = '';
          return WORSHIP_GUIDE_SECTIONS.map((sec) => {
            let catHeader = '';
            if (sec.category && sec.category !== lastCat) {
              lastCat = sec.category;
              catHeader = `<div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 6px 12px; margin: 2rem 0 1rem 0; font-weight: bold; font-size: 1rem; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em;">CATEGORY: ${sec.category}</div>`;
            }
            return `
              ${catHeader}
              <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-top: 1rem;">${sec.title}</h3>
                ${sec.summary ? `<p style="color: #52525b; font-style: italic; font-size: 0.9rem; margin-top: -0.25rem;">${sec.summary}</p>` : ''}
                ${sec.content.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
                ${sec.subsections ? sec.subsections.map(sub => `
                  <div style="margin-left: 1rem; margin-top: 0.75rem;">
                    <h4>${sub.title}</h4>
                    ${sub.description ? `<p>${sub.description.replace(/\n/g, '<br/>')}</p>` : ''}
                    ${sub.bestFor ? `<strong>Best for:</strong><ul>${sub.bestFor.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
                  </div>
                `).join('') : ''}
                ${sec.table ? `
                  <table>
                    <thead>
                      <tr>${sec.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                      ${sec.table.rows.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join('')}
                    </tbody>
                  </table>
                ` : ''}
              </div>
            `;
          }).join('');
        })()}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
