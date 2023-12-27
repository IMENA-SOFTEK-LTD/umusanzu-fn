import { useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useLazyGetHouseholdTransactionsByMonthPaidQuery } from '../../states/api/apiSlice'
import { FiDownload } from 'react-icons/fi'
import { useParams } from 'react-router'
import Button from '../../components/Button'
import { FaRegEye } from 'react-icons/fa'
import { useDispatch, } from 'react-redux'
import {
  setUpdateHouseholdModal,
  setUpdateHouseholdStatusModal,
} from '../../states/features/modals/householdSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  setDeleteTransactionId,
  setDeleteTransactionModal,
} from '../../states/features/transactions/transactionSlice'
import Table from '../../components/table/Table'
import HouseholdDetails from '../households/HouseholdInfo'

const HouseHoldDetailTable = ({
  transactions,
  member,
  village,
  cell,
  sector,
  district,
  province,
}) => {
  const [data, setData] = useState(null)
  const { id } = useParams()
  const [monthPaid, setMonthPaid] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const user = JSON.parse(localStorage.getItem('user'))

  const [
    getHouseholdTransactionsByMonthPaid,
    {
      data: transactionsData,
      isSuccess: transactionsSuccess,
      isError: transactionsError,
      error: transactionsErrorRes,
    },
  ] = useLazyGetHouseholdTransactionsByMonthPaidQuery()

  useEffect(() => {
    getHouseholdTransactionsByMonthPaid({
      departmentId: id,
      month: monthPaid,
    })
  }, [id, monthPaid])

  useEffect(() => {
    if (transactionsSuccess) {
      setData(transactionsData?.data || [])
    }
  }, [transactionsSuccess, transactionsData])

  const openModal = (month_paid) => {
    setMonthPaid(month_paid)
    setIsModalOpen(true)
  }

  const dispatch = useDispatch()

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleDownloadPdf = (transaction) => {
    const newTab = window.open(`/receipt/${transaction.id}`, '_blank')

    if (newTab) {
      newTab.focus()
    }
  }

  let department = ''

  switch (user?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  return (
    <div className="page-wrapper p-4 ">
      <div className="page-content-wrapper ">
        <div className="page-content">
          <div className=" flex flex-col-reverse gap-3 md:flex-row  mx-auto">
            {/* <Table columns= /> */}
            {/* HOUSEHOLD INFORMATION */}
            <HouseholdDetails />
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
