import { useEffect, useState } from 'react';
import moment from 'moment';
import { useLazyGetHouseholdTransactionsByMonthPaidQuery } from '../../states/api/apiSlice';
import { FiDownload } from 'react-icons/fi';
import { useParams } from 'react-router';
import jsPDF from 'jspdf';
import RWlogo from "../../assets/login.png";
import Kgl from "../../assets/kglLogo.png";
import FaQrcode from '../../assets/qrcode.jpeg';
import Button from '../../components/Button';
import { FaRegEye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setUpdateHouseholdModal, setUpdateHouseholdStatusModal } from '../../states/features/modals/householdSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { setDeleteTransactionId, setDeleteTransactionModal } from '../../states/features/transactions/transactionSlice';
import formatFunds from '../../utils/Funds';

const HouseHoldDetailTable = ({
  transactions,
  member,
  village,
  cell,
  sector,
  district,
  province,
}) => {
  const [data, setData] = useState(null);
  const { id } = useParams();
  const [monthPaid, setMonthPaid] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const [
    getHouseholdTransactionsByMonthPaid,
    {
      data: transactionsData,
      isSuccess: transactionsSuccess,
      isError: transactionsError,
      error: transactionsErrorRes,
    },
  ] = useLazyGetHouseholdTransactionsByMonthPaidQuery();

  useEffect(() => {
    getHouseholdTransactionsByMonthPaid({
      departmentId: id,
      month: monthPaid,
    });
  }, [id, monthPaid]);

  useEffect(() => {
    if (transactionsSuccess) {
      setData(transactionsData?.data || []);
    }
  }, [transactionsSuccess, transactionsData]);

  const openModal = (month_paid) => {
    setMonthPaid(month_paid);
    setIsModalOpen(true);
  };

  const dispatch = useDispatch();

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleDownloadPdf = (transaction) => {
    
    const doc = new jsPDF();
    // Add the header section
    doc.addImage(RWlogo, 'PNG', 10, 10, 30, 30);
    doc.setFontSize(14);
    doc.text("REPUBLIC OF RWANDA", 50, 20);
    doc.text("KIGALI CITY", 50, 30);
    doc.text(`${district.name} DISTRICT`, 50, 40);
    doc.text(`${sector.name} SECTOR`, 50, 50);
    doc.addImage(Kgl, 'PNG', 150, 10, 30, 30);
    // Add the PAYMENT RECEIPT section
    doc.setFontSize(12);
    // Determine the title based on the transaction status
    let title = '';
    if (transaction.status === 'PAID') {
      title = "PAYMENT RECEIPT";
    } else if (transaction.status === 'PENDING') {
      title = "PAYMENT Invoice";
    } else if (transaction.status === 'PARTIAL') {
      title = "PAYMENT Partial Receipt";
    }
    const itemsColumn1 = [
      `${title}`,
      "Reference: 71063010IMS159",
      `Names: ${member.name}`,
      "Service: Umutekano",
      `Tel: ${member.phone1}`
    ];
    const itemsColumn2 = [
      `Date: ${
      new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric',
        minute:
          'numeric',
        hour: 'numeric',
        day: 'numeric',
      })}`,
      `Cell: ${cell.name}`,
      `Status:${transaction.status }`,
      `Village: ${village.name}`,
      `TIN: ${member.phone2}`
    ];
    const startXColumn1 = 15;
    const startXColumn2 = 130;
    let currentY = 70;

    doc.setFontSize(12);

    // Display items in column 1
    for (let i = 0; i < itemsColumn1.length; i++) {
      doc.text(itemsColumn1[i], startXColumn1, currentY);
      currentY += 10;
    }

    currentY = 70;

    // Display items in column 2
    for (let i = 0; i < itemsColumn2.length; i++) {
      doc.text(itemsColumn2[i], startXColumn2, currentY);
      currentY += 10;
    }

    // Add the table section
    doc.autoTable({
      startY: 120,
      head: [["DESCRIPTION", "MONTH", "UNIT PRICE", `${transaction.status === 'PAID' ? 'AMOUNT PAID' : 'PENDING AMOUNT'}`]],
      body: [["Umutekano", `${transaction.transaction_date}`, `${formatFunds(member.ubudehe)} RWF`, `${formatFunds(transaction.amount)} RWF`]],
    });
    // Add the TOTAL PAID section
    doc.text(`TOTAL PAID ${formatFunds(transaction.amount)} RWF`, 140, doc.autoTable.previous.finalY + 10);

    doc.setFontSize(10);
    doc.text("For more info, Please call:", 105, doc.autoTable.previous.finalY + 30);
    doc.text("PAY CASHLESS DIAL: *775*3#", 105, doc.autoTable.previous.finalY + 40);
    doc.text("0788623772", 105, doc.autoTable.previous.finalY + 50);

    doc.addImage(FaQrcode, 'JPEG', 150, doc.autoTable.previous.finalY + 30, 30, 30);
    const pdfDataUrl = doc.output('datauristring');
    const blob = dataURLtoBlob(pdfDataUrl);
    const blobUrl = window.URL.createObjectURL(blob);

    // Open the Blob URL in a new tab for download
    const newTab = window.open(blobUrl, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  // Helper function to convert data URL to Blob
  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }
  let department = '';

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province';
      break;
    case 2:
      department = 'district';
      break;
    case 3:
      department = 'sector';
      break;
    case 4:
      department = 'cell';
      break;
    case 5:
      department = 'country';
      break;
    case 6:
      department = 'agent';
      break;
    default:
      department = 'agent';
  }

  useEffect(() => {
    document.title = `${member?.name} | Umusanzu Digital`
  }, [])

  return (
    <div className="page-wrapper p-4">
      <div className="page-content-wrapper">
        <div className="page-content">
          <div className="flex flex-col md:flex-row items-start gap-4 mx-auto">
            <div className="max-w-[65%] bg-white rounded-lg shadow-lg ring-1 ring-gray-200">
              <div className="card-body">
                <h6 className="font-semibold mb-4 text-gray-800 px-3 mt-3">
                  <b>Transaction history</b>
                </h6>
                <div className="overflow-x-auto max-h-[65vh]">
                  <table className="min-w-full border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4">
                          N<sup>o</sup>
                        </th>
                        <th className={`${department === 'country' ? 'flex' : "hidden"} py-2 px-4`}>Action</th>
                        <th className="py-2 px-4">Pay</th>
                        <th className="py-2 px-4">Month</th>
                        <th className="py-2 px-4 whitespace-nowrap">
                          Amount paid
                        </th>
                        <th className="py-2 px-4">Remains</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4 whitespace-nowrap">
                          Recent Paid at
                        </th>
                        <th className="py-2 px-4">History</th>
                        <th className="py-2 px-4">Receipt</th>
                        <th className="py-2 px-4">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="w-full">
                      {transactions.map((transaction, index) => {
                        const paidMonth = new Date(
                          transaction.month_paid
                        ).toLocaleString('default', {
                          month: 'long',
                          year: 'numeric',
                        })
                        let payStatus = ''
                        if (transaction.status === 'PENDING') {
                          payStatus = 'bg-red-600 text-white'
                        } else if (transaction.status === 'PARTIAL') {
                          payStatus = 'bg-blue-500 text-white'
                        } else if (transaction.status === 'PAID') {
                          payStatus = 'bg-green-500 text-white'
                        } else {
                          payStatus = 'bg-yellow-500 text-white'
                        }
                        return (
                          <tr key={transaction.id} className="border-b">
                            <td className="py-3 px-4 whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className={`${department === 'country' ? 'flex' : 'hidden'}`}>
                              <Button onClick={(e) => {
                                e.preventDefault()
                                dispatch(setDeleteTransactionModal(true))
                                dispatch(setDeleteTransactionId(transaction.id))
                              }} value={<FontAwesomeIcon icon={faTrash} />} className='!p-[8px] !px-[10px] !rounded-[50%] bg-red-600' />
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.status !== 'PAID' ? (
                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 mr-2 rounded-sm transition duration-300">
                                  {transaction.status === 'INITIATED'
                                    ? 'Complete'
                                    : 'Pay Now'}
                                </button>
                              ) : null}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {paidMonth}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.amount} RWF
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.remain} RWF
                            </td>
                            <td
                              className={`py-3 px-4 ${payStatus} whitespace-nowrap`}
                            >
                              {transaction.status}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {moment(transaction.transaction_date).format(
                                'YYYY-MM-DD HH:mm:ss'
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <a
                                className="flex cursor-pointer items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 transition duration-300"
                                onClick={() =>
                                  openModal(transaction.month_paid)
                                }
                              >
                                <FaRegEye className="mr-2" />
                                View History
                              </a>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.status === 'PAID' ? (
                                <a
                                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-sm hover:bg-green-600 transition duration-300 cursor-pointer"
                                onClick={() => handleDownloadPdf(transaction)}
                                >
                                  <FiDownload className="mr-2" />
                                  Receipt
                                </a>
                              ) : transaction.status === 'PENDING' ? (
                                <a
                                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-sm hover:bg-red-600 transition duration-300 cursor-pointer"
                                   onClick={() => handleDownloadPdf(transaction)}
                                >
                                  <FiDownload className="mr-2" />
                                  Invoice
                                </a>
                              ) : transaction.status === 'PARTIAL' ? (
                                <a
                                      className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 transition duration-300 cursor-pointer "
                                     onClick={() => handleDownloadPdf(transaction)}
                                >
                                  <FiDownload className="mr-2" />
                                  Partial Receipt
                                </a>
                              ) : (
                                <a
                                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-sm hover:bg-green-600 transition duration-300 cursor-pointer"
                                      onClick={() => handleDownloadPdf(transaction)}
                                >
                                  <FiDownload className="mr-2" />
                                  Receipt
                                </a>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.id}IMS
                              {transaction?.agents?.names.split(' ')[0]}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-4 w-full md:w-[35%] mx-auto">
              <div className="p-3">
                <h6 className="mb-4 text-xl font-semibold text-gray-800">
                  Household Information
                </h6>
                <div className="table-responsive flex flex-col items-center gap-4">
                  <table className="w-full  text-sm">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Names</td>
                        <td className="py-2 pl-4">{member.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Phone 1</td>
                        <td className="py-2 pl-4">{member.phone1}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">TIN number</td>
                        <td className="py-2 pl-4">{member.phone2}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">National ID</td>
                        <td className="py-2 pl-4">{member.nid}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Amount</td>
                        <td className="py-2 pl-4">
                          {member.ubudehe} ({member.currency})
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Village</td>
                        <td className="py-2 pl-4">{village.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Cell</td>
                        <td className="py-2 pl-4">{cell.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Sector</td>
                        <td className="py-2 pl-4">{sector.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">District</td>
                        <td className="py-2 pl-4">{district.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Province</td>
                        <td className="py-2 pl-4">{province.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-2 pr-4 font-semibold">Status</td>
                        <td className="py-2 pl-4">
                          <span
                            className={`inline-block px-3 py-1 text-sm font-semibold text-white ${
                              member?.status?.toUpperCase() === 'INACTIVE'
                                ? 'bg-red-600'
                                : 'bg-green-500'
                            }`}
                          >
                            {member?.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <span className="flex items-center gap-4">
                    <Button
                      value="Edit"
                      onClick={(e) => {
                        e.preventDefault()
                        dispatch(setUpdateHouseholdModal(true))
                      }}
                    />
                    <Button
                      className="bg-yellow-600"
                      value="Change status"
                      onClick={(e) => {
                        e.preventDefault()
                        dispatch(setUpdateHouseholdStatusModal(true))
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal-overlay fixed inset-0 bg-black opacity-50"></div>
          <div className="modal-container h-[80vh] w-full  bg-white mx-auto rounded shadow-lg z-50 ">
            <div className="modal-content py-4 text-left px-6">
              <div className="flex justify-between items-center pb-3">
                <p className="text-2xl font-bold">Transaction History</p>
                <button
                  onClick={closeModal}
                  className="modal-close cursor-pointer z-50"
                >
                  &times;
                </button>
              </div>
              <p className="mb-4">Month: {monthPaid}</p>
              <p className="mb-4">Amount Paid: {data[0]?.ubudehe} RWF</p>
              <p className="mb-4">
                Remaining Amount: {data[0]?.ubudehe - data[0]?.totalAmount} RWF
              </p>
              <p className="mb-4">Total: {data[0]?.totalAmount} RWF</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border whitespace-nowrap">ID</th>
                      <th className="py-2 px-4 border whitespace-nowrap">
                        Amount Paid
                      </th>
                      <th className="py-2 px-4 border whitespace-nowrap">
                        Paid At
                      </th>
                      <th className="py-2 px-4 border whitespace-nowrap">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data[0]?.transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="py-2 px-4 border whitespace-nowrap">
                          {transaction.amount} RWF
                        </td>
                        <td className="py-2 px-4 border whitespace-nowrap">
                          {moment(transaction.transaction_date).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </td>
                        <td className="py-2 px-4 border whitespace-nowrap">
                          {moment(transaction.created_at).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HouseHoldDetailTable
