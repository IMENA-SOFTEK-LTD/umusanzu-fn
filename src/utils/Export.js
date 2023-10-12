import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import logo from '../assets/LOGO.png';
import FaQrcode from '../assets/qrcode.jpeg';


export const convertBlobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
};

export function underlineText(doc, text, x, y) {
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize()
    const lineLength = (textWidth / 2) * 0.75
    doc.text(text, x, y)
    doc.setLineWidth(0.5) // Adjust the line width as needed
    doc.line(x, y + 1, x + lineLength, y + 1) // Draw a line under the text
}


const printPDF = async ({ totalCommission, monthPaid, reportName }) => {

  const doc = new jsPDF();
  const logoResponse = await fetch(logo);
  const logoData = await logoResponse.blob();
  const reader = new FileReader();

  reader.onload = async () => {
    doc.setFontSize(16);
    // Add the header section
    doc.addImage(logo, 'PNG', 80, 10, 30, 30);
    doc.setFontSize(24);
    // Usage
    doc.setFontSize(24);
        // Usage
    underlineText(doc, 'PAYMENT RECEIPT', 50, 50);
    doc.text('FROM: IMENA SOFTEK LTD', 30, 70);
    doc.text(`TO: ${reportName.toUpperCase()} SECTOR `, 30, 80);
    // Add the table section
    doc.autoTable({
        startY: 100,
        head: [
          [
            'MONTH',
            '10%',
          ],
        ],
        body: [
          [
            monthPaid,
            totalCommission,
          ],
        ],
        theme: 'grid', // Apply a grid theme
        headStyles: {
          fillColor: [0, 128, 0], // Green background color for the header
          textColor: 255, // White text color for the header
          fontSize: 12, // Font size for the header
          halign: 'center', // Center align the text horizontally
        },
        styles: {
          fontSize: 10, // Font size for the body
          textColor: 0, // Black text color for the body
          cellPadding: 3, // Padding for each cell
        },
        columnStyles: {
          0: {
            // Style for the first column (DESCRIPTION)
            halign: 'center', // Center align the text horizontally
          },
          1: {
            // Style for the second column (MONTH)
            halign: 'center', // Center align the text horizontally
          },
        },
      })

      const qrCodeHeight = 30
        // Add the signature image here
        const qrCodeResponse = await fetch(FaQrcode);
        const qrCodeData = await qrCodeResponse.blob();
        const qrCodeBase64 = await convertBlobToBase64(qrCodeData);
        doc.addImage(qrCodeBase64, 'JPEG', 15, 140, 30, 30);
        doc.setFontSize(10)

        doc.text('IMENA SOFTEK LTD', 15, 180);
        doc.text('TIN : 1123965711 ', 15, 190);
        doc.text('TEL : +250 784 368 695 ', 15, 200);
        doc.text('Kacyiru , Kigali , Rwanda ', 15, 210);

  doc.setFontSize(12);
  doc.setFont('Arial', 'bold');
    doc.text(
      `Date: ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
      15,
      doc.lastAutoTable.finalY + 10
    );

    doc.save(`${reportName}.pdf`);
  };

  reader.readAsDataURL(logoData);
};

export default printPDF;
