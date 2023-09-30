import { useEffect, useState } from 'react'
import Button from '../Button'
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia'
import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import moment from 'moment'
import Loading from '../Loading'

const InvoiceRequestFormModel = () => {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [receiptRequests, setReceiptRequests] = useState([
    { year: new Date().getFullYear(), month: 'January' },
  ])

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

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const years = ['2021', '2022', '2023', '2024', '2025']

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const addReceiptRequest = () => {
    setReceiptRequests([
      ...receiptRequests,
      { year: new Date().getFullYear(), month: 'January' },
    ])
  }

  const removeReceiptRequest = (index) => {
    const updatedRequests = [...receiptRequests]
    updatedRequests.splice(index, 1)
    setReceiptRequests(updatedRequests)
  }

  const handleYearChange = (event, index) => {
    const { value } = event.target
    const updatedRequests = [...receiptRequests]
    updatedRequests[index].year = parseInt(value)
    setReceiptRequests(updatedRequests)
  }

  const handleMonthChange = (event, index) => {
    const { value } = event.target
    const updatedRequests = [...receiptRequests]
    updatedRequests[index].month = value
    setReceiptRequests(updatedRequests)
  }

  const handleRequestTypeChange = (event) => {
    const { value } = event.target
    setRequestType(value)
  }

  const handleDownloadPdf = (data) => {
    const doc = new jsPDF()
    // Assuming data is an array of objects
    data.forEach((item, index) => {
      // Check if data is null, skip if null
      if (!item.data) {
        return
      }

      // Add a page for each data item (except null data)
      if (index > 0) {
        doc.addPage()
      }
      // Add content for the current data item
      const {
        data: {
          id,
          name,
          phone1,
          phone2,
          ubudehe,
          districts,
          sectors,
          cells,
          villages,
          transactions,
          tin,
        },
      } = item
      // Add a table for transactions
      const transactionData = transactions.map((transaction) => [
        'Umutekano',
        transaction.month_paid,
        ` ${formatFunds(ubudehe)} RWF`,
        ` ${transaction.amount} RWF`,
      ])
      const total = transactionData.reduce(
        (acc, curr) => acc + parseFloat(curr[3]),
        0
      )
      // Add the header section
      doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30)
      doc.setFontSize(10.5)
      doc.setFont('Times New Roman', 'bold')
      doc.text('REPUBLIC OF RWANDA', 43, 17)
      doc.text('KIGALI CITY', 43, 23)
      doc.text(`${districts[0]?.name} DISTRICT`, 43, 29)
      doc.text(`${sectors[0]?.name} SECTOR`, 43, 35)
      doc.setFont('Times New Roman', 'bold')
      doc.addImage(Kgl, 'PNG', 150, 10, 30, 30)

      doc.addImage(RWline, 'PNG', 10, 45, 180, 10)
      // Add the PAYMENT RECEIPT section
      doc.setFontSize(11)
      // Determine the title based on the transaction status
      let title = ''
      let paymentStatus = ''
      if (requestType === 'PAID') {
        title = 'PAYMENT RECEIPT'
        paymentStatus = 'PAID'
      } else if (requestType === 'PENDING') {
        title = 'PAYMENT INVOICE'
        paymentStatus = 'PENDING'
      }

      doc.setFontSize(18)
      doc.setFont('Times New Roman', 'bold')
      doc.text(`${title}`, 70, 65)

      doc.setFont('Times New Roman', 'normal')
      const itemsColumn1 = [
        `Reference: ${id}UMS${name.split(' ')[0]}`,
        `Names: ${name}`,
        'Service: Umutekano',
        `Tel: ${phone1}`,
        `TIN: ${tin || 'N/A'}`,
      ]
      const itemsColumn2 = [
        `Date: ${moment().format('DD-MM-YYYY HH:mm')}`,
        `Cell: ${cells[0]?.name}`,
        `Status: ${paymentStatus}`,
        `Village: ${villages[0]?.name}`,
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
        startY: 120,
        head: [
          [
            'DESCRIPTION',
            'MONTH',
            'UNIT PRICE',
            `${requestType === 'PAID' ? 'AMOUNT PAID' : 'PENDING AMOUNT'}`,
          ],
        ],
        body: transactionData,
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

      // Add the TOTAL PAID section
      doc.setFont('Times New Roman', 'bold')
      doc.text(
        `TOTAL ${formatFunds(total)} RWF`,
        130,
        doc.autoTable.previous.finalY + 15
      )

      doc.setFont('Times New Roman', 'normal')
      doc.setFontSize(12)
      doc.text(
        `For more info, Please call: ${phone1}`,
        15,
        doc.autoTable.previous.finalY + 15
      )
      doc.text(
        'PAY CASHLESS DIAL: *775*3#',
        15,
        doc.autoTable.previous.finalY + 30
      )

      doc.setFontSize(13)

      const image = sectors[0]?.stamp
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
        `${sectors[0]?.department_infos[0]?.leader_name}`,
        130,
        doc.autoTable.previous.finalY + 73
      )
      doc.text(
        `${sectors[0]?.department_infos[0]?.leader_title},`,
        130,
        doc.autoTable.previous.finalY + 83
      )
      doc.text(
        `${sectors[0]?.name} SECTOR`,
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
    })
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
    // Transform the receiptRequests data
    const transformedReceiptRequests = {
      months: receiptRequests.map(({ year, month }) => {
        const monthNumber = months.indexOf(month) + 1
        return `${year}-${monthNumber.toString().padStart(2, '0')}`
      }),
    }
    if (requestType === 'PAID') {
      try {
        // Call getReceipt and wait for the data to be fetched
        const receiptResponse = await getReceipt({
          id,
          months: transformedReceiptRequests.months,
        })

        // Check if the receipt request was successful
        if (receiptResponse.data) {
          // Call the function to generate and download the receipt report
          handleDownloadPdf(receiptResponse.data?.data)
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
          months: transformedReceiptRequests.months,
        })

        // Check if the invoice request was successful
        if (invoiceResponse.data) {
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
            Request Invoice
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
                  Request Invoice
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
                {receiptRequests.map((request, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex mt-2 justify-between gap-3">
                      <select
                        className="form-select flex-1  rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        value={request.year}
                        onChange={(e) => handleYearChange(e, index)}
                      >
                        {years.map((element, index) => (
                          <option key={index}>{element}</option>
                        ))}
                      </select>
                      <select
                        className="form-select flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        value={request.month}
                        onChange={(e) => handleMonthChange(e, index)}
                      >
                        {months.map((element, index) => (
                          <option key={index}>{element}</option>
                        ))}
                      </select>
                      <button
                        className="ml-2 bg-red-500 w-10 h-10 rounded-full hover:bg-red-500 text-white"
                        onClick={() => removeReceiptRequest(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addReceiptRequest}
                  className="ml-2 bg-primary w-10 h-10 rounded-full hover:bg-red-500 text-white"
                >
                  <FontAwesomeIcon icon={faAdd} />
                </button>
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
