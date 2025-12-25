import jsPDF from 'jspdf'
import 'jspdf-autotable'
import moment from 'moment'
import logo from '../../assets/LOGO.png'
import RWlogo from '../../assets/login.png'
import Kgl from '../../assets/kglLogo.png'
import RWline from '../../assets/rwline.png'
import QRCOD from '../../assets/qrcode.jpeg'
import formatFunds from '../../utils/Funds'
import cachet from '../../assets/cachet.png'
import signature from '../../assets/signature.png'
import API_URL from '../../constants/upload_url'

export const convertBlobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1])
    }
    reader.readAsDataURL(blob)
  })
}

// Helper function to add images with custom dimensions
export const addImageWithCustomSize = (doc, imageUrl, x, y, width, height, format = 'JPEG') => {
  try {
    if (imageUrl) {
      doc.addImage(imageUrl, format, x, y, width, height)
      return true
    }
    return false
  } catch (error) {
    console.warn('Failed to add image to PDF:', error)
    return false
  }
}

// Helper function to add signature images with customizable dimensions
export const addSignatureImage = (doc, signatureUrl, options = {}) => {
  const {
    x = 130,
    y = 0,
    width = 35,
    height = 35,
    format = 'JPEG'
  } = options

  if (!signatureUrl) return false

  try {
    // Extract proper image format from filename
    const getImageFormat = (imagePath) => {
      const extension = imagePath?.split('.').pop()?.toLowerCase()
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          return 'JPEG'
        case 'png':
          return 'PNG'
        case 'gif':
          return 'GIF'
        case 'bmp':
          return 'BMP'
        case 'webp':
          return 'WEBP'
        default:
          return format
      }
    }

    const imageFormat = getImageFormat(signatureUrl)
    const imageUrl = signatureUrl.startsWith('http') ? signatureUrl : `${API_URL}/${signatureUrl}`
    
    doc.addImage(imageUrl, imageFormat, x, y, width, height)
    return true
  } catch (error) {
    console.warn('Failed to add signature image to PDF:', error)
    return false
  }
}

// Helper function to draw rounded rectangle (top only)
export const drawRoundedRect = (doc, x, y, width, height, radius, fillColor = [0, 0, 0]) => {
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
  doc.setDrawColor(fillColor[0], fillColor[1], fillColor[2])
  
  // Draw rounded rectangle with rounded top corners only
  doc.roundedRect(x, y, width, height, radius, radius, 0, 0, 'F')
}

// Helper function to draw header rectangle
export const drawHeaderRect = (doc, x, y, width, height, fillColor = [0, 0, 0]) => {
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
  doc.setDrawColor(fillColor[0], fillColor[1], fillColor[2])
  
  // Draw a regular rectangle for the header
  doc.rect(x, y, width, height, 'F')
}

// Helper function to draw colored status badge
export const drawStatusBadge = (doc, status, x, y) => {
  let fillColor, textColor
  
  // Define colors based on status
  switch (status?.toUpperCase()) {
    case 'PAID':
      fillColor = [34, 197, 94] // Green
      textColor = [255, 255, 255] // White
      break
    case 'PENDING':
      fillColor = [234, 179, 8] // Yellow
      textColor = [0, 0, 0] // Black
      break
    case 'PARTIAL':
      fillColor = [59, 130, 246] // Blue
      textColor = [255, 255, 255] // White
      break
    default:
      fillColor = [239, 68, 68] // Red
      textColor = [255, 255, 255] // White
  }
  
  // Set colors
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  
  // Draw rounded rectangle for status badge (more compact size)
  const badgeWidth = 15
  const badgeHeight = 5
  const radius = 1
  
  // Draw badge background
  doc.roundedRect(x, y, badgeWidth, badgeHeight, radius, radius, 'F')
  
  // Add status text with equal padding
  doc.setFontSize(5)
  doc.setFont('Times New Roman', 'bold')
  const textX = x + (badgeWidth / 2)
  const textY = y + (badgeHeight / 2) + 0.5 // Centered vertically with equal padding
  doc.text(status?.toUpperCase(), textX, textY, { align: 'center' })
  
  // Reset text color to black
  doc.setTextColor(0, 0, 0)
}

// Helper function to add rounded header to table
export const addRoundedTableHeader = (doc, tableData, startY, columns, options = {}) => {
  const {
    margin = 15,
    headerHeight = 12,
    borderRadius = 3,
    fillColor = [240, 240, 240], // Light gray background
    textColor = [64, 64, 64] // Dark gray text
  } = options

  const pageWidth = doc.internal.pageSize.getWidth()
  const tableWidth = pageWidth - (margin * 2)
  const columnWidth = tableWidth / columns.length // Equal width for all columns
  
  // Draw header background with rounded top corners only
  drawHeaderRect(
    doc,
    margin,
    startY,
    tableWidth,
    headerHeight,
    fillColor
  )

  // Add header text with proper centering and padding
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFontSize(8)
  doc.setFont('Times New Roman', 'bold')
  
  // Calculate vertical center with equal padding
  const verticalPadding = 2
  const textY = startY + (headerHeight / 2) + (verticalPadding / 2)
  
  columns.forEach((column, index) => {
    const textX = margin + (index * columnWidth) + (columnWidth / 2)
    
    doc.text(column.toUpperCase(), textX, textY, { align: 'center' })
  })

  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  return startY + headerHeight
}

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

const printPDF = async ({
  TableInstance,
  reportTitleObj,
  reportName,
  columns = [],
  totals,
}) => {
  const doc = new jsPDF('landscape')
  const logoResponse = await fetch(logo)
  const logoData = await logoResponse.blob()
  const reader = new FileReader()

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1])
      }
      reader.readAsDataURL(blob)
    })
  }

  reader.onload = async () => {
    const logoBase64 = reader.result.split(',')[1]
    doc.addImage(logoBase64, 'PNG', 130, 10, 30, 30)
    doc.setFont('Symbol', 'bold')
    doc.setFontSize(12)
    doc.text('IMENA SOFTEK LTD', 125, 50)
    doc.text(reportTitleObj.title, 65, 65)
    doc.line(61, 67, 220, 67)
    doc.setFontSize(10)

    const noValues = Array.from(
      { length: TableInstance.rows.length },
      (_, index) => index + 1
    )

    const exportData = TableInstance.rows.map((row, index) => {
      return {
        id: noValues[index],
        ...row?.original,
      }
    })

    doc.autoTable({
      startY: 75,
      columns: columns
        .filter((column) => column.accessor !== 'actions')
        .map((column) => column.Header.toUpperCase()),
      body: exportData.map((row, index) => {
        const rowData = columns.map((header) => {
          return row[header?.accessor || 'NO']
        })
        return { index, ...rowData }
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
    })
    const { monthlyTargetTotal, monthlyCollectionsTotal, differenceTotal } =
      totals

    const subTotalData = [
      [
        'TOTAL',
        `RWF ${monthlyTargetTotal}`,
        `RWF ${monthlyCollectionsTotal}`,
        `RWF ${differenceTotal}`,
        ` `,
      ],
    ]
    const subTotalStyles = {
      theme: 'grid',
      styles: {
        fontSize: 10,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 131 },
        1: { cellWidth: 29 },
        2: { cellWidth: 37 },
        3: { cellWidth: 28.5 },
        4: { cellWidth: 43 },
      },
    }

    if (totals !== null) {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY,
        head: false,
        body: subTotalData,
        ...subTotalStyles,
      })
    }

    doc.setFontSize(12)
    doc.setFont('Arial', 'bold')

    const customContent = [
      ['BITEGUWE NA:', 'BYEMEJWE NA:'],
      ['', ''],
      ['TETA TAMARA', 'NDAGIJIMANA Gedeon'],
      ['DATA MANAGEMENT', 'CEO IMENA SOFTEK LTD'],
      ['IMENA SOFTEK LTD', ''],
    ]

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
    }

    if (doc.lastAutoTable.finalY + 90 > doc.internal.pageSize.height) {
      doc.addPage()

      doc.text(`Done on : ${moment().format('DD-MM-YYYY HH:mm:ss')}`, 16, 40)

      doc.autoTable({
        startY: 60,
        head: false,
        body: customContent,
        ...customContentStyles,
      })

      const cachetResponse = await fetch(cachet)
      const cachetData = await cachetResponse.blob()
      const cachetBase64 = await convertBlobToBase64(cachetData)

      doc.addImage(
        cachetBase64,
        'PNG',
        200,
        doc.lastAutoTable.finalY - 50,
        50,
        50
      )

      // Add the signature image here
      const signatureResponse = await fetch(signature)
      const signatureData = await signatureResponse.blob()
      const signatureBase64 = await convertBlobToBase64(signatureData)

      doc.addImage(
        signatureBase64,
        'PNG',
        20,
        doc.lastAutoTable.finalY - 50,
        50,
        50
      )
    } else {
      doc.text(
        `Done on : ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
        16,
        doc.lastAutoTable.finalY + 30
      )

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 50,
        head: false,
        body: customContent,
        ...customContentStyles,
      })
      const cachetResponse = await fetch(cachet)
      const cachetData = await cachetResponse.blob()
      const cachetBase64 = await convertBlobToBase64(cachetData)

      doc.addImage(
        cachetBase64,
        'PNG',
        200,
        doc.lastAutoTable.finalY - 50,
        50,
        50
      )

      // Add the signature image here
      const signatureResponse = await fetch(signature)
      const signatureData = await signatureResponse.blob()
      const signatureBase64 = await convertBlobToBase64(signatureData)

      doc.addImage(
        signatureBase64,
        'PNG',
        20,
        doc.lastAutoTable.finalY - 50,
        50,
        50
      )
    }

    doc.save(`${reportName}.pdf`)
  }

  reader.readAsDataURL(logoData)
}

export const printTransactionPDF = ({ payment }) => {
  const doc = new jsPDF()
  
  // Get location and service info from householdDepartmentService
  const serviceData = payment?.householdDepartmentService
  const locationInfo = {
    province: serviceData?.province,
    district: serviceData?.district,
    sector: serviceData?.sector,
    cell: serviceData?.cell,
    village: serviceData?.village,
  }
  const serviceName = serviceData?.department_service?.service?.title || 'Umutekano'
  const serviceType = serviceData?.householdType || 'N/A'
  const ubudehe = serviceData?.ubudehe || payment?.amount
  
  // Add the header section
  doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
  doc.setFontSize(10.5)
  doc.setFont('Times New Roman', 'bold')
  doc.text('REPUBLIC OF RWANDA', 70, 17)
  doc.text(`${locationInfo?.province?.name || payment?.household?.provinces?.[0]?.name || 'KIGALI CITY'}`, 70, 23)
  doc.text(`${locationInfo?.district?.name || payment?.household?.districts?.[0]?.name || ''} DISTRICT`, 70, 29)
  doc.text(`${locationInfo?.sector?.name || payment?.household?.sectors?.[0]?.name || ''} SECTOR`, 70, 35)
  doc.setFont('Times New Roman', 'bold')
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

  doc.setFont('Times New Roman', 'normal')
  const itemsColumn1 = [
    `Reference: ${payment?.household?.id}UMS${payment?.household?.name.split(' ')[0]}`,
    `Names: ${payment?.household?.name || 'N/A'}`,
    `Tel: ${payment?.household?.phone1 || 'N/A'}`,
    `TIN: ${payment?.household?.tin || 'N/A'}`,
  ]
  const itemsColumn2 = [
    `Date: ${moment(payment?.transaction_date || payment?.updatedAt || payment?.createdAt).format('YYYY-MM-DD HH:mm:ss')}`,
    `Cell: ${locationInfo?.cell?.name || payment?.household?.cells?.[0]?.name || 'N/A'}`,
    `Village: ${locationInfo?.village?.name || payment?.household?.villages?.[0]?.name || 'N/A'}`,
    `Service: ${serviceName} / ${serviceType}`,
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

  // Add colored status badge
  doc.text('Status:', startXColumn2, currentY)
  drawStatusBadge(doc, payment?.status, startXColumn2 + 18, currentY - 4)
  
  // Add rounded header
  const columns = [
    'DESCRIPTION',
    'MONTH',
    'UNIT PRICE',
    `${payment?.status === 'PAID' ? 'AMOUNT PAID' : 'PENDING AMOUNT'}`,
  ]
  
  const headerEndY = addRoundedTableHeader(doc, null, 125, columns, {
    margin: 15,
    headerHeight: 10,
    borderRadius: 2,
    fillColor: [240, 240, 240], // Light gray background
    textColor: [64, 64, 64] // Dark gray text
  })

  // Add the table body without header
  doc.autoTable({
    startY: headerEndY,
    head: false, // No header since we drew it manually
    body: [
      [
        serviceName,
        `${moment(payment?.month_paid).format('MMMM YYYY')}`,
        `${formatFunds(ubudehe)} RWF`,
        payment?.status === 'PAID' ? `${formatFunds(payment?.amount)} RWF` : `${formatFunds(payment?.remain_amount)} RWF`,
      ],
      // Add more rows as needed
    ],
    theme: 'grid',
    tableWidth: 'auto', // Use auto width to match header
    margin: { left: 15, right: 15 }, // Match header margins
    styles: {
      fontSize: 9, // Slightly smaller font size
      textColor: 0,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      halign: 'center',
      valign: 'middle',
      lineColor: [200, 200, 200], // Light gray grid lines
      lineWidth: 0.1, // Thin grid lines
    },
    columnStyles: {
      0: { halign: 'left' }, // DESCRIPTION - left aligned
      1: { halign: 'left' }, // MONTH - left aligned
      2: { halign: 'right', fontStyle: 'bold' }, // UNIT PRICE - right aligned, bold
      3: { halign: 'right', fontStyle: 'bold' }, // AMOUNT - right aligned, bold
    },
    didDrawPage: function (data) {
      // Check if the table exceeds the bottom margin
      if (currentY + data.table.height >= doc.internal.pageSize.height - 10) {
        doc.addPage() // Add a new page
        currentY = 10 // Reset the Y-coordinate for the new page
      }
    },
  })
  // Calculate the total amount
  const totalAmount = payment?.amount
  // Add the TOTAL PAID section (right-aligned with table)
  doc.setFont('Times New Roman', 'bold')
  const pageWidth = doc.internal.pageSize.getWidth()
  const rightMargin = pageWidth - 15 // Align with table's right margin
  doc.text(
    `TOTAL ${formatFunds(totalAmount)} RWF`,
    rightMargin,
    doc.autoTable.previous.finalY + 15,
    { align: 'right' }
  )

  doc.setFont('Times New Roman', 'normal')
  doc.setFontSize(12)
  doc.text(
    `For more info, Please call: ${payment?.household?.phone1}`,
    15,
    doc.autoTable.previous.finalY + 15
  )
  doc.text('PAY CASHLESS DIAL: *775*3#', 15, doc.autoTable.previous.finalY + 30)
  
  // Add QR code under the PAY CASHLESS DIAL text
  const qrY = doc.autoTable.previous.finalY + 45 // Position below the dial text
  doc.addImage(QRCOD, 'JPEG', 15, qrY, 20, 20) // QR code on the left side
  
  // Signature section with improved design
  doc.setFontSize(13)
  
  // Add a subtle line above signature section
  doc.setDrawColor(200, 200, 200) // Light gray line
  doc.line(rightMargin - 60, doc.autoTable.previous.finalY + 25, rightMargin, doc.autoTable.previous.finalY + 25)
  
  // Use sector info from householdDepartmentService, fallback to household
  const sectorInfo = locationInfo?.sector || payment?.household?.sectors?.[0]
  const image = sectorInfo?.stamp || null
  if (image) {
    // Position stamp with better design
    addSignatureImage(doc, image, {
      x: rightMargin - 45, // Centered above the text block
      y: doc.autoTable.previous.finalY + 30, // Better spacing
      width: 30, // Slightly larger for better visibility
      height: 30 // Slightly larger for better visibility
    })
  }
  
  // Signature details with improved spacing and design
  doc.setFont('Times New Roman', 'bold')
  const signatureDetailsX = rightMargin - 50 // Better block width
  const signatureStartY = doc.autoTable.previous.finalY + 70
  
  doc.text(
    `${sectorInfo?.department_infos?.[0]?.leader_name || 'N/A'}`,
    signatureDetailsX,
    signatureStartY,
    { align: 'left' }
  )
  doc.text(
    `${sectorInfo?.department_infos?.[0]?.leader_title || 'N/A'},`,
    signatureDetailsX,
    signatureStartY + 8,
    { align: 'left' }
  )
  doc.text(
    `${locationInfo?.sector?.name || sectorInfo?.name || 'N/A'} SECTOR`,
    signatureDetailsX,
    signatureStartY + 16,
    { align: 'left' }
  )
  
  // Generate and open PDF
  const pdfDataUrl = doc.output('datauristring')
  const blob = dataURLtoBlob(pdfDataUrl)
  const blobUrl = window.URL.createObjectURL(blob)

  window.open(blobUrl, '_blank')
}

// Helper function to generate a single receipt PDF for a location group
const generateSingleReceiptPDF = ({ household, payments, locationInfo, request }) => {
  const doc = new jsPDF()
  
  // === HEADER SECTION (Keep Original Design) ===
  // Add the header section
  doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
  doc.setFontSize(10.5)
  doc.setFont('Times New Roman', 'bold')
  doc.text('REPUBLIC OF RWANDA', 70, 17)
  doc.text(`${locationInfo?.province?.name || 'KIGALI CITY'}`, 70, 23)
  doc.text(`${locationInfo?.district?.name || ''} DISTRICT`, 70, 29)
  doc.text(`${locationInfo?.sector?.name || ''} SECTOR`, 70, 35)
  doc.setFont('Times New Roman', 'bold')
  doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

  doc.addImage(RWline, 'PNG', 10, 45, 180, 10)
  
  // === TITLE SECTION ===
  doc.setFontSize(18)
  doc.setFont('Times New Roman', 'bold')
  const text = `${household?.name} - ${request}`?.toUpperCase()
  doc.text(text, (210 - doc.getTextWidth(text)) / 2, 65)

  // === CUSTOMER INFO SECTION ===
  doc.setFont('Times New Roman', 'normal')
  const serviceName = payments[0]?.householdDepartmentService?.department_service?.service?.title || 'Umutekano'
  const serviceType = payments[0]?.householdDepartmentService?.householdType || 'N/A'
  const itemsColumn1 = [
    `Reference: ${household?.id}UMS${household?.name.split(' ')[0]}`,
    `Names: ${household?.name}`,
    `Service: ${serviceName} / ${serviceType}`,
    `Tel: ${household?.phone1}`,
    `TIN: ${household?.tin || 'N/A'}`,
  ]
  const itemsColumn2 = [
    `Date: ${moment().format('DD-MM-YYYY HH:mm')}`,
    `Cell: ${locationInfo?.cell?.name || household?.cells[0]?.name || 'N/A'}`,
    `Village: ${locationInfo?.village?.name || household?.villages[0]?.name || 'N/A'}`,
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
  
  // === PAYMENT TABLE ===
  const tableData = payments.map((item) => {
    const serviceTitle = item?.householdDepartmentService?.department_service?.service?.title || 'Umutekano'
    const serviceType = item?.householdDepartmentService?.householdType || 'N/A'
    const ubudehe = item?.householdDepartmentService?.ubudehe || household?.ubudehe
    return [
      `${serviceTitle} / ${serviceType}`,
      moment(item?.month_paid).format('YYYY-MM'), // Format month as YYYY-MM
      formatFunds(ubudehe),
      formatFunds(item?.amount),
      item?.status, // This will be replaced with a status badge in the table
    ]
  })

  // Add rounded header
  const columns = [
    'DESCRIPTION',
    'MONTH',
    'UNIT PRICE',
    `${request === 'receipt' ? 'AMOUNT PAID' : 'PENDING AMOUNT'}`,
    'STATUS',
  ]
  
  const headerEndY = addRoundedTableHeader(doc, null, 115, columns, {
    margin: 15,
    headerHeight: 7,
    borderRadius: 2,
    fillColor: [240, 240, 240], // Light gray background
    textColor: [64, 64, 64] // Dark gray text
  })

  // Add the table body without header
  doc.autoTable({
    startY: headerEndY,
    head: false, // No header since we drew it manually
    body: tableData.map(row => row.slice(0, 5)), // Include all 5 columns including status
    theme: 'grid', // Apply a grid theme
    tableWidth: 'auto', // Use auto width to match header
    margin: { left: 15, right: 15 }, // Match header margins
    styles: {
      fontSize: 7, // Reduced font size to fit more content
      textColor: 0, // Black text color for the body
      cellPadding: { top: 1, right: 1, bottom: 1, left: 1 }, // Minimal padding
      halign: 'center', // Center align horizontally
      valign: 'middle', // Center align vertically
      lineColor: [200, 200, 200], // Light gray grid lines
      lineWidth: 0.1, // Thin grid lines
      minCellHeight: 4, // Reduced row height
    },
    columnStyles: {
      0: { halign: 'left' }, // DESCRIPTION - left aligned
      1: { halign: 'left' }, // MONTH - left aligned
      2: { halign: 'right', fontStyle: 'bold' }, // UNIT PRICE - right aligned, bold
      3: { halign: 'right', fontStyle: 'bold' }, // AMOUNT - right aligned, bold
      4: { halign: 'center', fontStyle: 'bold' }, // STATUS - center aligned, bold
    },
    didParseCell: function(data) {
      // Change the cell text for status column to empty so we can draw it ourselves
      if (data.column.index === 4 && data.row.index < tableData.length) {
        data.cell.text = ''
      }
    },
    didDrawCell: function(data) {
      // Add colored status text instead of badges
      if (data.column.index === 4 && data.row.index < tableData.length) {
        const status = tableData[data.row.index][4] // Get status from original data
        
        // Define colors based on status
        let fillColor, textColor
        switch (status?.toUpperCase()) {
          case 'PAID':
            textColor = [34, 197, 94] // Green
            break
          case 'PENDING':
            textColor = [184, 134, 11] // Dark yellow
            break
          case 'PARTIAL':
            textColor = [59, 130, 246] // Blue
            break
          default:
            textColor = [239, 68, 68] // Red
        }
        
        // Set the text color
        doc.setTextColor(textColor[0], textColor[1], textColor[2])
        doc.setFont('Times New Roman', 'bold')
        doc.setFontSize(7)
        
        // Center the text in the cell
        const textX = data.cell.x + (data.cell.width / 2)
        const textY = data.cell.y + (data.cell.height / 2) + 0.5
        
        // Draw the status text
        doc.text(status?.toUpperCase(), textX, textY, { align: 'center' })
        
        // Reset text color to black
        doc.setTextColor(0, 0, 0)
      }
    }
  })
  
  // Calculate the total amount
  const totalAmount = tableData.reduce(
    (sum, row) => sum + parseFloat(row[3].replace(/,/g, '')),
    0
  )
  // Add the TOTAL PAID section (right-aligned with table)
  doc.setFont('Times New Roman', 'bold')
  const pageWidth = doc.internal.pageSize.getWidth()
  const rightMargin = pageWidth - 15 // Align with table's right margin
  doc.text(
    `TOTAL ${formatFunds(totalAmount)} RWF`,
    rightMargin,
    doc.autoTable.previous.finalY + 8,
    { align: 'right' }
  )

  doc.setFont('Times New Roman', 'normal')
  doc.setFontSize(8)
  doc.text(
    `For more info, Please call: ${household?.phone1}`,
    15,
    doc.autoTable.previous.finalY + 8
  )
  doc.text('PAY CASHLESS DIAL: *775*3#', 15, doc.autoTable.previous.finalY + 15)
  
  // Add QR code under the PAY CASHLESS DIAL text
  const qrY = doc.autoTable.previous.finalY + 30 // Position below the dial text
  doc.addImage(QRCOD, 'JPEG', 15, qrY, 15, 15) // QR code on the left side (smaller size)

  // Signature section with improved design
  doc.setFontSize(10)
  
  // Add a subtle line above signature section
  doc.setDrawColor(200, 200, 200) // Light gray line
  doc.line(rightMargin - 60, doc.autoTable.previous.finalY + 15, rightMargin, doc.autoTable.previous.finalY + 15)
  
  // Use location info from householdDepartmentService for signature
  const sectorInfo = locationInfo?.sector || household?.sectors?.[0]
  const image = sectorInfo?.stamp || null
  if (image) {
    // Position stamp with better design
    addSignatureImage(doc, image, {
      x: rightMargin - 45, // Centered above the text block
      y: doc.autoTable.previous.finalY + 20, // Better spacing
      width: 25, // Reduced size for more space
      height: 25 // Reduced size for more space
    })
  }
  
  // Signature details with improved spacing and design
  doc.setFont('Times New Roman', 'bold')
  const signatureDetailsX = rightMargin - 50 // Better block width
  const signatureStartY = doc.autoTable.previous.finalY + 50 // Added padding between stamp and signer names
  
  // Check if we need a new page for signature details
  if (signatureStartY + 30 > doc.internal.pageSize.height - 20) {
    doc.addPage()
    const newSignatureStartY = 20
    doc.text(
      `${sectorInfo?.department_infos?.[0]?.leader_name || 'N/A'}`,
      signatureDetailsX,
      newSignatureStartY,
      { align: 'left' }
    )
    doc.text(
      `${sectorInfo?.department_infos?.[0]?.leader_title || 'N/A'},`,
      signatureDetailsX,
      newSignatureStartY + 8,
      { align: 'left' }
    )
    doc.text(
      `${locationInfo?.sector?.name || 'N/A'} SECTOR`,
      signatureDetailsX,
      newSignatureStartY + 16,
      { align: 'left' }
    )
  } else {
    doc.text(
      `${sectorInfo?.department_infos?.[0]?.leader_name || 'N/A'}`,
      signatureDetailsX,
      signatureStartY,
      { align: 'left' }
    )
    doc.text(
      `${sectorInfo?.department_infos?.[0]?.leader_title || 'N/A'},`,
      signatureDetailsX,
      signatureStartY + 8,
      { align: 'left' }
    )
    doc.text(
      `${locationInfo?.sector?.name || 'N/A'} SECTOR`,
      signatureDetailsX,
      signatureStartY + 16,
      { align: 'left' }
    )
  }
  
  // Generate and open PDF
  const pdfDataUrl = doc.output('datauristring')
  const blob = dataURLtoBlob(pdfDataUrl)
  const blobUrl = window.URL.createObjectURL(blob)

  const newTab = window.open(blobUrl, '_blank')
  if (newTab) {
    newTab.focus()
  }
}

export const printReceiptsPDF = ({ household, request }) => {
  // Filter out payments without householdDepartmentService
  const validPayments = household?.payments?.filter(
    (p) => p?.householdDepartmentService && p?.status !== 'FAILED'
  ) || []

  if (validPayments.length === 0) {
    console.warn('No valid payments found with householdDepartmentService')
    return
  }

  // Group payments by location (province_id, district_id, sector_id)
  const locationGroups = {}
  
  validPayments.forEach((payment) => {
    const serviceData = payment.householdDepartmentService
    const locationKey = `${serviceData?.province_id || 'unknown'}-${serviceData?.district_id || 'unknown'}-${serviceData?.sector_id || 'unknown'}`
    
    if (!locationGroups[locationKey]) {
      locationGroups[locationKey] = {
        payments: [],
        locationInfo: {
          province: serviceData?.province,
          district: serviceData?.district,
          sector: serviceData?.sector,
          cell: serviceData?.cell,
          village: serviceData?.village,
        }
      }
    }
    
    locationGroups[locationKey].payments.push(payment)
  })

  // Generate a separate PDF for each location group
  Object.values(locationGroups).forEach((group, index) => {
    // Add a small delay between opening PDFs to avoid browser blocking
    setTimeout(() => {
      generateSingleReceiptPDF({
        household,
        payments: group.payments,
        locationInfo: group.locationInfo,
        request
      })
    }, index * 500) // 500ms delay between each PDF
  })
}

export default printPDF
