import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import logo from '../../assets/LOGO.png';
import RWlogo from '../../assets/login.png'
import Kgl from '../../assets/kglLogo.png'
import RWline from '../../assets/rwline.png'
import QRCOD from '../../assets/qrcode.jpeg'
import formatFunds from '../../utils/Funds';
import cachet from '../../assets/cachet.png'
import signature from '../../assets/signature.png'

export const convertBlobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
};

export const dataURLtoBlob = (dataURL) => {
  const parts = dataURL.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  return new Blob([uInt8Array], { type: contentType })
}

const printPDF = async ({ TableInstance, reportName, columns = [], totals }) => {

  const doc = new jsPDF('landscape');
  const logoResponse = await fetch(logo);
  const logoData = await logoResponse.blob();
  const reader = new FileReader();

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  reader.onload = async () => {
    const logoBase64 = reader.result.split(',')[1];
    doc.setFontSize(16);
    doc.setFillColor(242, 244, 245);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    doc.addImage(logoBase64, logo.slice(-3), 10, 5, 30, 30);
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
        return { index, ...rowData };
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
    const { monthlyTargetTotal, monthlyCollectionsTotal, differenceTotal } = totals
    
    const totalsTitle = [
      ['TOTALS',]
    ];

    const totalsTitleStyles = {
      theme: 'plain', 
      styles: {
        fontSize: 10,
        fontStyle: 'bold', 
      },
        columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
      },

    };



    const totalsGrid = [
      ['Monthly Target Total: ', 'Monthly Collections Total (Progress): ', 'Total remaining amount (Remain): '],
      [monthlyTargetTotal, monthlyCollectionsTotal, differenceTotal]
    ];

    const totalsGridStyles = {
      theme: 'grid', 
      styles: {
        fontSize: 10,
        fontStyle: 'bold', 
      },
        columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
        2: { cellWidth: 80 },
      },

    };

    if (totals !== null) {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        head: false,
        body: totalsTitle,
        ...totalsTitleStyles,
      });
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 0,
        head: false,
        body: totalsGrid,
        ...totalsGridStyles,
      });
    }
    
    doc.setFontSize(12);
    doc.setFont('Arial', 'bold');
    
    const customContent = [
      ['BITEGUWE NA:', 'BYEMEJWE NA:'],
      ['', ''],
      ['TETA TAMARA', 'NDAGIJIMANA Gedeon'],
      ['DATA MANAGEMENT', 'CEO IMENA SOFTEK LTD'],
      ['IMENA SOFTEK LTD', ''],
    ];
    
    const customContentStyles = {
      theme: 'plain', // Use plain theme to remove table lines
      styles: {
        fontSize: 8,
        fontStyle: 'normal', // Use normal font weight
      },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 100 },
      },
    };

    if (doc.lastAutoTable.finalY + 90 > doc.internal.pageSize.height) {
      doc.addPage();

      doc.text(
        `Date: ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
        16,40
      );

      doc.autoTable({
        startY: 50,
        head: false,
        body: customContent,
        ...customContentStyles,
      });

      const cachetResponse = await fetch(cachet);
      const cachetData = await cachetResponse.blob();
      const cachetBase64 = await convertBlobToBase64(cachetData);
  
      doc.addImage(cachetBase64, 'PNG', 200, doc.lastAutoTable.finalY - 50, 50, 50);
  
        // Add the signature image here
      const signatureResponse = await fetch(signature);
      const signatureData = await signatureResponse.blob();
      const signatureBase64 = await convertBlobToBase64(signatureData);
  
      doc.addImage(signatureBase64, 'PNG', 20, doc.lastAutoTable.finalY - 50, 50, 50);
    } else {

      doc.text(
        `Date: ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
        16,40
      );

      doc.autoTable({
        startY: 50,
        head: false,
        body: customContent,
        ...customContentStyles,
      });
      const cachetResponse = await fetch(cachet);
      const cachetData = await cachetResponse.blob();
      const cachetBase64 = await convertBlobToBase64(cachetData);
  
      doc.addImage(cachetBase64, 'PNG', 200, doc.lastAutoTable.finalY - 50, 50, 50);
  
        // Add the signature image here
      const signatureResponse = await fetch(signature);
      const signatureData = await signatureResponse.blob();
      const signatureBase64 = await convertBlobToBase64(signatureData);
  
      doc.addImage(signatureBase64, 'PNG', 20, doc.lastAutoTable.finalY - 50, 50, 50);
    }

    doc.save(`${reportName}.pdf`);
  };

  reader.readAsDataURL(logoData);
};

export const printTransactionPDF = ({ payment }) => {

  const doc = new jsPDF()
  // Add the header section
  doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
  doc.setFontSize(10.5)
  doc.setFont('Times New Roman', 'bold');
  doc.text('REPUBLIC OF RWANDA', 70, 17)
  doc.text('KIGALI CITY', 70, 23)
  doc.text(`${payment?.household?.districts[0]?.name} DISTRICT`, 70, 29)
  doc.text(`${payment?.household?.sectors[0]?.name} SECTOR`, 70, 35)
  doc.setFont('Times New Roman', 'bold');
  doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

  doc.addImage(RWline, 'PNG', 10, 45, 180, 10)
  // Add the PAYMENT RECEIPT section
  doc.setFontSize(11)
  // Determine the title based on the payment status
  let title = ''
  let paymentStatus = ''
  if (payment?.status === 'PAID') {
    title = 'PAYMENT RECEIPT'
    paymentStatus = 'PAID'
  } else if (payment?.status === 'PENDING') {
    title = 'PAYMENT INVOICE'
    paymentStatus = 'PENDING'
  }

  doc.setFontSize(18)
  doc.setFont('Times New Roman', 'bold')
  doc.text(`${title}`, 70, 65)

  doc.setFont('Times New Roman', 'normal');

  const itemsColumn1 = [
    `Reference: ${payment?.id}UMS${payment?.household?.id}`,
    `Names: ${payment?.household?.name}`,
    `Tel: ${payment?.household?.phone1}`,
    `TIN: ${payment?.household?.tin || 'N/A'}`,
  ]
  const itemsColumn2 = [
    `Date: ${moment(payment?.transaction_date).format(
      'YYYY-MM-DD HH:mm:ss'
    )}`,
    `Cell: ${payment?.household?.cells[0]?.name}`,
    `Status: ${payment?.status}`,
    `Village: ${payment?.household?.villages[0]?.name}`,
    'Service: Umutekano',
  ]
  const startXColumn1 = 15
  const startXColumn2 = 130
  let currentY = 80

  doc.setFontSize(12)

  // Display items in column 1
  for (let i = 0; i < itemsColumn1.length; i++) {
    doc.text(itemsColumn1[i], startXColumn1, currentY)
    currentY += 8
  }

  currentY = 80

  // Display items in column 2
  for (let i = 0; i < itemsColumn2.length; i++) {
    doc.text(itemsColumn2[i], startXColumn2, currentY)
    currentY += 8
  }

  // Add the table section
  doc.autoTable({
    startY: 125,
    head: [
      [
        'DESCRIPTION',
        'MONTH',
        'AMOUNT',
        `${payment?.status === 'PAID' ? 'AMOUNT PAID' : 'PENDING AMOUNT'
        }`,
      ],
    ],
    body: [
      [
        'Umutekano',
        `${moment(payment?.month_paid).format('MMMM YYYY')}`,
        `${formatFunds(payment?.amount)} RWF`,
        `${formatFunds(payment?.remain_amount)} RWF`,
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
      2: {
        // Style for the third column (UNIT PRICE)
        halign: 'center', // Center align the text horizontally
      },
      3: {
        // Style for the fourth column (AMOUNT PAID or PENDING AMOUNT)
        halign: 'center', // Center align the text horizontally
        fontStyle: 'bold', // Make the text bold
      },
    },
  })
  // Calculate the height of the image (assuming it's 10 units high)
  const imageHeight = 20;

  // Calculate the vertical position (y-coordinate) to place the image at the bottom center
  const pageHeight = doc.internal.pageSize.height;
  const imageY = pageHeight - imageHeight - 10; // Adjust the 10 for padding if needed
  // Calculate the total amount
  const totalAmount = payment?.amount;
  // Add the image at the bottom center
  doc.addImage(QRCOD, 'JPEG', 95, imageY, 20, imageHeight);
  // Add the TOTAL PAID section
  doc.setFont('Times New Roman', 'bold')
  doc.text(
    `TOTAL ${formatFunds(totalAmount)} RWF`,
    130,
    doc.autoTable.previous.finalY + 15
  )

  doc.setFont('Times New Roman', 'normal');
  doc.setFontSize(12)
  doc.text(
    `For more info, Please call: ${payment?.household?.phone1}`,
    15,
    doc.autoTable.previous.finalY + 15
  )
  doc.text(
    'PAY CASHLESS DIAL: *775*3#',
    15,
    doc.autoTable.previous.finalY + 30
  )
  doc.setFontSize(13)

  const image = payment?.household?.sectors[0]?.stamp;
  if (image) {
    doc.addImage(image, image?.slice(-3), 130,
      doc.autoTable.previous.finalY + 25, 40, 40);
  }
  doc.setFont('Times New Roman', 'bold');
  doc.text(
    `${payment?.household?.sectors[0]?.department_infos[0]?.leader_name}`,
    130,
    doc.autoTable.previous.finalY + 73
  )
  doc.text(
    `${payment?.household?.sectors[0]?.department_infos[0]?.leader_title},`,
    130,
    doc.autoTable.previous.finalY + 83
  )
  doc.text(`${payment?.household?.sectors[0]?.name} SECTOR`, 130, doc.autoTable.previous.finalY + 90)
  const pdfDataUrl = doc.output('datauristring')
  const blob = dataURLtoBlob(pdfDataUrl)
  const blobUrl = window.URL.createObjectURL(blob)

  window.open(blobUrl, "_blank");
}

export const printReceiptsPDF = ({ household, request }) => {
  const doc = new jsPDF()
  // Assuming data is an array of objects
  // Add the header section
  doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
  doc.setFontSize(10.5)
  doc.setFont('Times New Roman', 'bold')
  doc.text('REPUBLIC OF RWANDA', 70, 17)
  doc.text(`${household?.provinces[0]?.name}`, 70, 23)
  doc.text(`${household?.districts[0]?.name} DISTRICT`, 70, 29)
  doc.text(`${household?.sectors[0]?.name} SECTOR`, 70, 35)
  doc.setFont('Times New Roman', 'bold')
  doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

  doc.addImage(RWline, 'PNG', 10, 45, 180, 10)
  // Add the PAYMENT RECEIPT section
  doc.setFontSize(11)

  doc.setFontSize(18)
  doc.setFont('Times New Roman', 'bold')
  const text = `${household?.name} - ${request}`?.toUpperCase()
  doc.text(text, (210 - doc.getTextWidth(text)) / 2, 65)

  doc.setFont('Times New Roman', 'normal')
  const itemsColumn1 = [
    `Reference: ${household?.id}UMS${household?.name.split(' ')[0]}`,
    `Names: ${household?.name}`,
    'Service: Umutekano',
    `Tel: ${household?.phone1}`,
    `TIN: ${household?.tin || 'N/A'}`,
  ]
  const itemsColumn2 = [
    `Date: ${moment().format('DD-MM-YYYY HH:mm')}`,
    `Cell: ${household?.cells[0]?.name}`,
    `Village: ${household?.villages[0]?.name}`,
  ]
  const startXColumn1 = 15
  const startXColumn2 = 130
  let currentY = 80

  doc.setFontSize(12)

  // Display items in column 1
  for (let i = 0; i < itemsColumn1.length; i++) {
    doc.text(itemsColumn1[i], startXColumn1, currentY)
    currentY += 8
  }

  currentY = 80

  // Display items in column 2
  for (let i = 0; i < itemsColumn2.length; i++) {
    doc.text(itemsColumn2[i], startXColumn2, currentY)
    currentY += 8
  }
  // Add the table section
  const tableData = household?.payments.map((item) => [
    'Umuteko',
    item?.month_paid,
    formatFunds(household?.ubudehe),
    formatFunds(item?.amount),
    item?.status
  ]);

  // Add the table section
  doc.autoTable({
    startY: 120,
    head: [
      [
        'DESCRIPTION',
        'MONTH',
        'UNIT PRICE',
        `${request === 'receipt' ? 'AMOUNT PAID' : 'PENDING AMOUNT'}`,
        'STATUS',
      ],
    ],
    body: tableData,
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
      2: {
        // Style for the third column (UNIT PRICE)
        halign: 'center', // Center align the text horizontally
      },
      3: {
        // Style for the fourth column (AMOUNT PAID or PENDING AMOUNT)
        halign: 'center', // Center align the text horizontally
        fontStyle: 'bold', // Make the text bold
      },
    },
  })
  // Calculate the total amount
  const totalAmount = tableData.reduce((sum, row) => sum + parseFloat(row[3].replace(/,/g, '')), 0);
  // Add the TOTAL PAID section
  doc.setFont('Times New Roman', 'bold')
  doc.text(
    `TOTAL ${formatFunds(totalAmount)} RWF`,
    130,
    doc.autoTable.previous.finalY + 15
  )

  doc.setFont('Times New Roman', 'normal')
  doc.setFontSize(12)
  doc.text(
    `For more info, Please call: ${household?.phone1}`,
    15,
    doc.autoTable.previous.finalY + 15
  )
  doc.text(
    'PAY CASHLESS DIAL: *775*3#',
    15,
    doc.autoTable.previous.finalY + 30
  )

  doc.setFontSize(13)
  // Calculate the height of the image (assuming it's 10 units high)
  const imageHeight = 20;

  // Calculate the vertical position (y-coordinate) to place the image at the bottom center
  const pageHeight = doc.internal.pageSize.height;
  const imageY = pageHeight - imageHeight - 10; // Adjust the 10 for padding if needed

  // Add the image at the bottom center
  doc.addImage(QRCOD, 'JPEG', 95, imageY, 20, imageHeight);
  const image = household?.sectors[0]?.stamp
  doc.addImage(
    image,
    image.slice(-3),
    130,
    doc.autoTable.previous.finalY + 17,
    40,
    40
  )
  doc.setFont('Times New Roman', 'bold')
  doc.text(
    `${household?.sectors[0]?.department_infos[0]?.leader_name}`,
    130,
    doc.autoTable.previous.finalY + 73
  )
  doc.text(
    `${household?.sectors[0]?.department_infos[0]?.leader_title},`,
    130,
    doc.autoTable.previous.finalY + 83
  )
  doc.text(
    `${household?.sectors[0]?.name} SECTOR`,
    130,
    doc.autoTable.previous.finalY + 90
  )
  const pdfDataUrl = doc.output('datauristring')
  const blob = dataURLtoBlob(pdfDataUrl)
  const blobUrl = window.URL.createObjectURL(blob)

  // Open the Blob URL in a new tab for download
  const newTab = window.open(blobUrl, '_blank')
  if (newTab) {
    newTab.focus()
  }
};

export default printPDF;
