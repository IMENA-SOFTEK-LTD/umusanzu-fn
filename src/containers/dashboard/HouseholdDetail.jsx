import HouseHoldDetailTable from './HouseHoldDetailTable' // Adjust the import path accordingly
import RecordPaymentModel from '../../components/models/RecordPaymentModel'
import CreateOfflinePaymentModel from '../../components/models/CreateOfflinePaymentModel'
import { useLazyGetHouseHoldDetailsQuery, useLazyGetHouseholdDepartmentsQuery } from '../../states/api/apiSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faX } from '@fortawesome/free-solid-svg-icons'
const HouseholdDetail = () => {
  const { id } = useParams()
  const [showModals, setShowModals] = useState(false)
  const [
    getHouseholdDepartments,
    {
      data: householdDepartmentsData,
      isLoading: householdDepartmentsIsLoading,
      isError: householdDepartmentsIsError,
      isSuccess: householdDepartmentsIsSuccess
    }
  ] = useLazyGetHouseholdDepartmentsQuery()

  const [
    GetHouseHoldDetails,
    {
      data: houseHoldDetailsData,
      isLoading: houseHoldDetailsLoading,
      isSuccess: houseHoldDetailsSuccess,
      isError: houseHoldDetailsError,
      error: houseHoldError
    }
  ] = useLazyGetHouseHoldDetailsQuery()
  const [data, setData] = useState(houseHoldDetailsData?.data || [])
  const [transactions, setTransactions] = useState(
    houseHoldDetailsData?.data?.transactions || []
  )
  useEffect(() => {
    if (houseHoldDetailsSuccess) {
      setData(houseHoldDetailsData?.data || [])
      setTransactions(houseHoldDetailsData?.data?.transactions || [])
    }
  }, [houseHoldDetailsSuccess, houseHoldDetailsData])

  useEffect(() => {
    GetHouseHoldDetails({ id })
  }, [GetHouseHoldDetails])

  useEffect(() => {
    getHouseholdDepartments({ id })
  }, [houseHoldDetailsData, houseHoldDetailsSuccess, id])

  useEffect(() => {
  }, [householdDepartmentsData, householdDepartmentsIsSuccess])

  const member = {
    name: data?.name,
    phone1: data?.phone1,
    phone2: data?.phone2,
    nid: data?.nid,
    ubudehe: data?.ubudehe,
    currency: 'RWF',
    status: data?.status
  }

  const village = {
    name: householdDepartmentsData?.data[0]?.village
  }

  const cell = {
    name: householdDepartmentsData?.data[0]?.cell
  }

  const sector = {
    name: householdDepartmentsData?.data[0]?.sector
  }

  const district = {
    name: householdDepartmentsData?.data[0]?.district
  }

  const province = {
    name: householdDepartmentsData?.data[0]?.province
  }

  return (
    <div>

      <main className="flex flex-col gap-16 relative">
          <Button
            className="py-2 px-3 bg-primary text-white rounded-[50%] w-fit absolute right-6 top-6"
            value={<FontAwesomeIcon icon={showModals ? faX : faAdd} />}
            onClick={() => {
              setShowModals(!showModals)
            }}
          />
          <article
            className={`${
              showModals ? 'flex ease-in-out duration-100' : 'hidden'
            } ease-in-out duration-100 absolute top-12 right-6 w-full h-full flex flex-col gap-12`}
          >
            <CreateOfflinePaymentModel />
            <RecordPaymentModel />
          </article>
        </main>
      <span>{'\u00A0'}</span>
      <HouseHoldDetailTable
        transactions={transactions}
        member={member}
        village={village}
        cell={cell}
        sector={sector}
        district={district}
        province={province}
      />
    </div>
  )
}

export default HouseholdDetail
