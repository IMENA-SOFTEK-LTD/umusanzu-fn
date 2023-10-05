import { useEffect, useState } from 'react'
import {
  useLazyGetDepartmentProfileQuery,
  useLazyGetSectorDetailsQuery,
  useLazyGetSingleTransactionQuery,
} from '../states/api/apiSlice'
import { useParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import RWlogo from '../assets/login.png'
import Kgl from '../assets/kglLogo.png'
import RWline from '../assets/rwline.png'
import moment from 'moment'
import formatFunds from '../utils/Funds'
import Loading from './Loading'

const PaymentReceipt = () => {
  const { id } = useParams()
  const user = JSON.parse(localStorage.getItem('user'))
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
  const [
    getDepartmentProfile,
    { data, isLoadingData, isErrors, isSuccessful },
  ] = useLazyGetDepartmentProfileQuery();

  const [getSectorDetails, {
    data: sectorDetailsData,
    isLoading: sectorDetailsIsLoading,
    isError: sectorDetailsIsError,
    isSuccess: sectorDetailsIsSuccess,
}] = useLazyGetSectorDetailsQuery();

useEffect(() => {
    getDepartmentProfile({
        id: user?.departments?.department_id,
    });
    getSectorDetails({
        id: 121
    });
}, []);

const [departmentInfos, setDeparmtmentInfos] = useState(sectorDetailsData?.data?.department_infos[0] || {})

useEffect(() => {
    if(sectorDetailsIsSuccess) {
      setDeparmtmentInfos(sectorDetailsData?.data?.department_infos[0] || {})
    }
}, [sectorDetailsIsSuccess, sectorDetailsData]);
  const handleDownloadPdf = (transaction) => {
    const doc = new jsPDF()
    // Add the header section
    doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
    doc.setFontSize(10.5)
    doc.setFont('Times New Roman', 'bold');
    doc.text('REPUBLIC OF RWANDA', 70, 17)
    doc.text('KIGALI CITY', 70, 23)
    doc.text(`${transaction?.households?.districts[0]?.name} DISTRICT`, 70, 29)
    doc.text(`${transaction?.households?.sectors[0]?.name} SECTOR`, 70, 35)
    doc.setFont('Times New Roman', 'bold');
    doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

    doc.addImage(RWline, 'PNG', 10, 45, 180, 10)
          // Add the PAYMENT RECEIPT section
          doc.setFontSize(11)
          // Determine the title based on the transaction status
          let title = ''
          let paymentStatus = ''
          if (transaction?.status === 'PAID') {
            title = 'PAYMENT RECEIPT'
            paymentStatus = 'PAID'
          } else if (transaction?.status === 'PENDING') {
            title = 'PAYMENT INVOICE'
            paymentStatus = 'PENDING'
          }

          doc.setFontSize(18)
          doc.setFont('Times New Roman', 'bold')
          doc.text(`${title}`, 70, 65)

          doc.setFont('Times New Roman', 'normal');

    const itemsColumn1 = [
      `Reference: ${transaction?.id}UMS${transaction?.households?.id}`,
      `Names: ${transaction?.households?.name}`,
      `Tel: ${transaction?.households?.phone1}`,
      `TIN: ${transaction?.households?.tin || 'N/A'}`,
    ]
    const itemsColumn2 = [
      `Date: ${moment(transaction?.transaction_date).format(
        'YYYY-MM-DD HH:mm:ss'
      )}`,
      `Cell: ${transaction?.households?.cells[0]?.name}`,
      `Status: ${transaction?.status}`,
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
      currentY += 8
    }

    currentY = 80

    // Display items in column 2
    for (let i = 0; i < itemsColumn2.length; i++) {
      doc.text(itemsColumn2[i], startXColumn2, currentY)
      currentY += 8
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
          'AMOUNT',
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
    doc.setFont('Times New Roman', 'normal');
    doc.setFontSize(12)
    doc.text(
      `For more info, Please call: ${transaction?.households?.phone1}`,
      15,
      doc.autoTable.previous.finalY + 15
    )
    doc.text(
      'PAY CASHLESS DIAL: *775*3#',
      15,
      doc.autoTable.previous.finalY + 30
    )
          doc.setFontSize(13)

          const image = transaction?.households?.sectors[0]?.stamp;
        if (image) {
          doc.addImage(image, image?.slice(-3), 130,
            doc.autoTable.previous.finalY + 17, 40, 40);
        }
            doc.setFont('Times New Roman', 'bold');
          doc.text(
            `${transaction?.households?.sectors[0]?.department_infos[0]?.leader_name}`,
            130,
            doc.autoTable.previous.finalY + 73
          )
          doc.text(
            `${transaction?.households?.sectors[0]?.department_infos[0]?.leader_title},`,
            130,
            doc.autoTable.previous.finalY + 83
          )
          doc.text(`${transaction?.households?.sectors[0]?.name} SECTOR`, 130, doc.autoTable.previous.finalY + 90)
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
