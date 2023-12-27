import { useState } from 'react'
import Button from '../Button'
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia'
import { useParams } from 'react-router-dom'
import {
  useLazyGetReceiptQuery,
  useLazyGetInvoiceQuery,
} from '../../states/api/apiSlice'
import jsPDF from 'jspdf'
import RWlogo from '../../assets/login.png'
import Kgl from '../../assets/kglLogo.png'
import RWline from '../../assets/rwline.png'
import formatFunds from '../../utils/Funds'
import QRCOD from '../../assets/qrcode.jpeg'
import moment from 'moment'
import Loading from '../Loading'

const InvoiceRequestFormModel = ({
  member,
  village,
  cell,
  sector,
  district,
 }) => {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [startingMonth, setStartingMonth] = useState('2023-01');
  const [endingMonth, setEndingMonth] = useState('2023-01');
  const [requestType, setRequestType] = useState('PENDING')

  const [
    getReceipt,
    {
      data: receiptData,
      isLoading: receiptIsLoading,
      isError: receiptIsError,
      isSuccess: receiptIsSuccess,
    },
  ] = useLazyGetReceiptQuery()

  const [
    getInvoice,
    {
      data: invoiceData,
      isLoading: invoiceIsLoading,
      isError: invoiceIsError,
      isSuccess: invoiceIsSuccess,
    },
  ] = useLazyGetInvoiceQuery()

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleRequestTypeChange = (event) => {
    const { value } = event.target
    setRequestType(value)
  }

  const handleDownloadPdf = (data) => {
    const doc = new jsPDF()
    // Assuming data is an array of objects
      // Add the header section
      doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
      doc.setFontSize(10.5)
      doc.setFont('Times New Roman', 'bold')
      doc.text('REPUBLIC OF RWANDA', 70, 17)
      doc.text('KIGALI CITY', 70, 23)
      doc.text(`${district.name} DISTRICT`, 70, 29)
      doc.text(`${sector.name} SECTOR`, 70, 35)
      doc.setFont('Times New Roman', 'bold')
      doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

      doc.addImage(RWline, 'PNG', 10, 45, 180, 10)
      // Add the PAYMENT RECEIPT section
      doc.setFontSize(11)
      // Determine the title based on the transaction status
      let title = ''
      let paymentStatus = ''
    if (requestType === 'PAID' || requestType === 'INITIATED') {
        title = 'PAYMENT RECEIPT'
        paymentStatus = 'PAID'
      } else if (requestType === 'PENDING' || requestType === 'PENDING') {
        title = 'PAYMENT INVOICE'
        paymentStatus = 'PENDING'
      }

      doc.setFontSize(18)
      doc.setFont('Times New Roman', 'bold')
      doc.text(`${title}`, 70, 65)

      doc.setFont('Times New Roman', 'normal')
      const itemsColumn1 = [
        `Reference: ${id}UMS${member.name.split(' ')[0]}`,
        `Names: ${member.name}`,
        'Service: Umutekano',
        `Tel: ${member.phone1}`,
        `TIN: ${member.tin || 'N/A'}`,
      ]
      const itemsColumn2 = [
        `Date: ${moment().format('DD-MM-YYYY HH:mm')}`,
        `Cell: ${cell.name}`,
        `Status: ${paymentStatus}`,
        `Village: ${village.name}`,
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
      const tableData = data.map((item) => [
        'Umuteko',
        item.month_paid,
        formatFunds(member.ubudehe),
        formatFunds(item.amount),
      ]);

      // Add the table section
      doc.autoTable({
        startY: 120,
        head: [
          [
            'DESCRIPTION',
            'MONTH',
            'UNIT PRICE',
            `${requestType === 'PAID' ? 'AMOUNT PAID' : 'PENDING AMOUNT'}`,
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
        `For more info, Please call: ${member.phone1}`,
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
      // const image = sectors[0]?.stamp
      // doc.addImage(
      //   image,
      //   image.slice(-3),
      //   130,
      //   doc.autoTable.previous.finalY + 17,
      //   40,
      //   40
      // )
      // doc.setFont('Times New Roman', 'bold')
      // doc.text(
      //   `${sectors[0]?.department_infos[0]?.leader_name}`,
      //   130,
      //   doc.autoTable.previous.finalY + 73
      // )
      // doc.text(
      //   `${sectors[0]?.department_infos[0]?.leader_title},`,
      //   130,
      //   doc.autoTable.previous.finalY + 83
      // )
      // doc.text(
      //   `${sectors[0]?.name} SECTOR`,
      //   130,
      //   doc.autoTable.previous.finalY + 90
    // )
      const pdfDataUrl = doc.output('datauristring')
      const blob = dataURLtoBlob(pdfDataUrl)
      const blobUrl = window.URL.createObjectURL(blob)

      // Open the Blob URL in a new tab for download
      const newTab = window.open(blobUrl, '_blank')
      if (newTab) {
        newTab.focus()
      }
  }

  // Helper function to convert data URL to Blob
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
  const handleRequest = async () => {

    if (requestType === 'PAID' || requestType === 'INITIATED') {
      try {
        // Call getReceipt and wait for the data to be fetched
        const receiptResponse = await getReceipt({
          id,
          startingMonth,
          endingMonth,
        })
        // Check if the receipt request was successful
        if (receiptResponse?.data?.data) {
          // Call the function to generate and download the receipt report
          handleDownloadPdf(receiptResponse?.data?.data)
        } else {
          // Handle the case where the receipt request was not successful
          console.error('Error fetching receipt data')
        }
      } catch (error) {
        // Handle any errors that occurred during the receipt request
        console.error('Error fetching receipt data:', error.message)
      }
    } else if (requestType === 'PENDING') {
      try {
        // Call getInvoice and wait for the data to be fetched
        const invoiceResponse = await getInvoice({
          id,
          startingMonth,
          endingMonth,
        })

        // Check if the invoice request was successful
        if (invoiceResponse?.data?.data) {
          // Call the function to generate and download the invoice report
          handleDownloadPdf(invoiceResponse.data?.data)
        } else {
          // Handle the case where the invoice request was not successful
          console.error('Error fetching invoice data')
        }
      } catch (error) {
        // Handle any errors that occurred during the invoice request
        console.error('Error fetching invoice data:', error)
      }
    }

    closeModal()
  }
  return (
    <div className="relative">
      <Button
        value={
          <span className="flex items-center gap-2">
            <LiaFileInvoiceDollarSolid />
            Request Invoice / Receipt
          </span>
        }
        onClick={openModal}
      />
      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <div className="bg-primary rounded-t-lg p-3">
              <button
                onClick={closeModal}
                type="button"
                className="absolute top-3 right-2.5 text-white bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="flex items-center justify-center gap-5">
                <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
                  Request Invoice / Receipt
                </h3>
              </div>
            </div>
            <div className="p-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Request Type:
              </label>
              <div className="mt-2 flex gap-9">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    value="PENDING"
                    checked={requestType === 'PENDING'}
                    onChange={handleRequestTypeChange}
                  />
                  <span className="ml-2">PENDING</span>
                </label>
                <label className="inline-flex items-center mt-2">
                  <input
                    type="radio"
                    className="form-radio text-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    value="PAID"
                    checked={requestType === 'PAID'}
                    onChange={handleRequestTypeChange}
                  />
                  <span className="ml-2">PAID</span>
                </label>
              </div>
              <div className="mt-4">
                <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2 mt-2">
                  Select starting and ending month
                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[45%] focus:border-[1.5px] ease-in-out duration-150"
                      value={startingMonth}
                      onChange={(e) => setStartingMonth(e.target.value)}
                    />
                    <input
                      type="month"
                      className="p-2 outline-none border-[1px] rounded-md border-primary w-[45%] focus:border-[1.5px] ease-in-out duration-150"
                      value={endingMonth}
                      onChange={(e) => setEndingMonth(e.target.value)}
                    />
                  </div>
                </label>
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  value={
                    receiptIsLoading || invoiceIsLoading ? (
                      <Loading />
                    ) : (
                      'Generate'
                    )
                  }
                  onClick={handleRequest}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceRequestFormModel
