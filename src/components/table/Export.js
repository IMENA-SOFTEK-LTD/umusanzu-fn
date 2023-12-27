import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import logo from '../../assets/LOGO.png';

export const convertBlobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
};

const printPDF = async ({ TableInstance, reportName, columns = [] }) => {

  const doc = new jsPDF('landscape');
  const logoResponse = await fetch(logo);
  const logoData = await logoResponse.blob();
  const reader = new FileReader();

  reader.onload = async () => {
    const logoBase64 = reader.result.split(',')[1];
    doc.setFontSize(16);
    doc.setFillColor(242, 244, 245);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    doc.addImage(logoBase64, logo.slice(-3), 10, 5, 50, 30);
    doc.setTextColor(0);
    doc.setFontSize(20);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(0, 157, 215)
    doc.text(`${reportName.toUpperCase()}`, doc.internal.pageSize.getWidth() - 90, 20);
    doc.setTextColor(0);
    doc.setFontSize(10);

    const noValues = Array.from(
      { length: TableInstance.rows.length },
      (_, index) => index + 1
    );

    const exportData = TableInstance.rows.map((row, index) => {
      return {
        id: noValues[index],
        ...row?.original,
      };
    });

  doc.autoTable({
   startY: 50,
   columns: columns.filter((column) => column.accessor !== 'actions').map((column) => column.Header.toUpperCase()),
   body: exportData.map((row, index) => {
    const rowData = columns.map((header) => {
      return row[header?.accessor || 'NO'];
    })
    return {index, ...rowData};
   }),
   theme: 'grid',
   headStyles: {
    fillColor: [0, 158, 215],
    textColor: 255,
    fontSize: 10,
    halign: 'start',
    cellPadding: 3,
  },
  styles: {
    fontSize: 10, 
    textColor: 0,
    cellPadding: 3,
  },
  });

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
