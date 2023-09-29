import { useEffect } from 'react'
import { useLazyGetSingleTransactionQuery } from '../states/api/apiSlice'
import { useParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import RWlogo from '../assets/login.png'
import Kgl from '../assets/kglLogo.png'
import RWline from '../assets/rwline.png'
import FaQrcode from '../assets/qrcode.jpeg'
import moment from 'moment'
import formatFunds from '../utils/Funds'
import Loading from './Loading'

const PaymentReceipt = () => {
  const { id } = useParams()

  const [
    getSingleTransaction,
    {
      data: singleTransactionData,
      isLoading: singleTransactionLoading,
      isSuccess: singleTransactionSuccess,
      isError: singleTransactionError,
      error: singleTransactionErrorData,
    },
  ] = useLazyGetSingleTransactionQuery()

  useEffect(() => {
    getSingleTransaction({ id })
  }, [id])

  function dataURLtoBlob(dataURL) {
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

  const handleDownloadPdf = (transaction) => {
    const doc = new jsPDF()
    // Add the header section
    doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
    doc.setFontSize(12)
    doc.text('REPUBLIC OF RWANDA', 50, 15)
    doc.text('KIGALI CITY', 50, 22)
    doc.text(
      `${transaction?.households?.districts[0]?.name} DISTRICT`,
      50,
      30
    )
    doc.text(`${transaction?.households?.sectors[0]?.name} SECTOR`, 50, 40)
    doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

    doc.addImage(RWline, 'PNG', 10, 50, 180, 10)
    // Add the PAYMENT RECEIPT section
    doc.setFontSize(12)
    // Determine the title based on the transaction status
    let title = ''
    if (transaction?.status === 'PAID') {
      title = 'PAYMENT RECEIPT'
    } else if (transaction?.status === 'PENDING') {
      title = 'PAYMENT INVOICE'
    } else if (transaction?.status === 'PARTIAL') {
      title = 'PAYMENT PARTIAL RECEIPT'
    }
    doc.setFontSize(24)
    doc.text(`${title}`, 60, 70)

    const itemsColumn1 = [
      `Reference: ${transaction?.id}UMS${transaction?.households?.id}`,
      `Names: ${transaction?.households?.name}`,
      `Tel: ${transaction?.households?.phone1}`,
      `TIN: ${transaction?.households?.phone1}`,
    ]
    const itemsColumn2 = [
      `Date: ${moment(transaction?.transaction_date).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`,
      `Cell: ${transaction?.households?.cells[0]?.name}`,
      `Status:${transaction?.status}`,
      `Village: ${transaction?.households?.villages[0]?.name}`,
      'Service: Umutekano',
    ]
    const startXColumn1 = 15
    const startXColumn2 = 130
    let currentY = 80

    doc.setFontSize(12)

    // Display items in column 1
    for (let i = 0; i < itemsColumn1.length; i++) {
      doc.text(itemsColumn1[i], startXColumn1, currentY)
      currentY += 10
    }

    currentY = 80

    // Display items in column 2
    for (let i = 0; i < itemsColumn2.length; i++) {
      doc.text(itemsColumn2[i], startXColumn2, currentY)
      currentY += 10
    }
    // Define the style for the table header
    const tableHeaderStyle = {
      fillColor: [0, 128, 0], // Green background color
      textColor: 255, // White text color
    }

    // Add the table section
    doc.autoTable({
      startY: 125,
      head: [
        [
          'DESCRIPTION',
          'MONTH',
          'MONTHLY CONTRIBUTION',
          `${
            transaction?.status === 'PAID' ? 'AMOUNT PAID' : 'PENDING AMOUNT'
          }`,
        ],
      ],
      body: [
        [
          'Umutekano',
          `${moment(transaction?.transaction_date).format('MMMM YYYY')}`,
          `${formatFunds(transaction?.households?.ubudehe)} RWF`,
          `${formatFunds(transaction?.amount)} RWF`,
        ],
      ],
      theme: 'grid', // Apply a grid theme
      headStyles: {
        fillColor: [0, 128, 0], // Green background color for the header
        textColor: 255, // White text color for the header
        fontSize: 12, // Font size for the header
      },
      styles: {
        fontSize: 10, // Font size for the body
        textColor: 0, // Black text color for the body
        cellPadding: 5, // Padding for each cell
      },
      columnStyles: {
        0: {
          // Style for the first column (MONTH)
          fontStyle: 'bold', // Make the text bold
        },
        1: {
          // Style for the second column (10 %)
          halign: 'right', // Align the text to the right
        },
      },
    })
    // Add the TOTAL PAID section
    doc.text(
      `TOTAL PAID ${formatFunds(transaction?.amount)} RWF`,
      140,
      doc.autoTable.previous.finalY + 10
    )

    doc.setFontSize(10)
    doc.text(
      'For more info, Please call: 0788623772',
      15,
      doc.autoTable.previous.finalY + 20
    )
    doc.text(
      'PAY CASHLESS DIAL: *775*3# ',
      15,
      doc.autoTable.previous.finalY + 30
    )

    doc.addImage(
      FaQrcode,
      'JPEG',
      150,
      doc.autoTable.previous.finalY + 30,
      30,
      30
    )
    const pdfDataUrl = doc.output('datauristring')
    const blob = dataURLtoBlob(pdfDataUrl)
    const blobUrl = window.URL.createObjectURL(blob)

    window.location.href = blobUrl
  }

  // Handle changes in the selected month

  useEffect(() => {
    if (singleTransactionSuccess) {
      handleDownloadPdf(singleTransactionData.data)
    }
  }, [singleTransactionSuccess])

  return (
    <main className="min-h-[80vh] w-full flex flex-col items-center justify-center gap-8">
      <h1 className="text-[20px] font-bold uppercase">
        Your receipt is being downloaded in a few seconds
      </h1>
      {singleTransactionLoading && (<Loading />)}
    </main>
  )
}

export default PaymentReceipt
