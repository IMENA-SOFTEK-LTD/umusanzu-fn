import HouseHoldDetailTable from './HouseHoldDetailTable' // Adjust the import path accordingly
import RecordPaymentModel from '../../components/models/RecordPaymentModel'
import CreateOfflinePaymentModel from '../../components/models/CreateOfflinePaymentModel'
import {
  useLazyGetHouseHoldDetailsQuery,
  useLazyGetHouseholdDepartmentsQuery,
} from '../../states/api/apiSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faX } from '@fortawesome/free-solid-svg-icons'
import UpdateHousehold from '../../components/models/UpdateHousehold'
import UpdateHouseholdStatus from '../../components/models/UpdateHouseholdStatus'
import DeleteTransaction from '../../components/models/DeleteTransaction'
const HouseholdDetail = () => {
  const { id } = useParams()
  const [showModals, setShowModals] = useState(false)
  const [
    getHouseholdDepartments,
    {
      data: householdDepartmentsData,
      isLoading: householdDepartmentsIsLoading,
      isError: householdDepartmentsIsError,
      isSuccess: householdDepartmentsIsSuccess,
    },
  ] = useLazyGetHouseholdDepartmentsQuery()

  const [
    GetHouseHoldDetails,
    {
      data: houseHoldDetailsData,
      isLoading: houseHoldDetailsLoading,
      isSuccess: houseHoldDetailsSuccess,
      isError: houseHoldDetailsError,
      error: houseHoldError,
    },
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
  const member = {
    name: data?.name,
    phone1: data?.phone1,
    phone2: data?.phone2,
    nid: data?.nid,
    ubudehe: data?.ubudehe,
    currency: 'RWF',
    status: data?.status,
  }

  const village = {
    name: householdDepartmentsData?.data[0]?.village,
  }

  const cell = {
    name: householdDepartmentsData?.data[0]?.cell,
  }

  const sector = {
    name: householdDepartmentsData?.data[0]?.sector,
  }

  const district = {
    name: householdDepartmentsData?.data[0]?.district,
  }

  const province = {
    name: householdDepartmentsData?.data[0]?.province,
  }
  console.log(transactions)
  return (
    <main className="flex flex-col gap-2 my-4">
      <section className="flex items-center gap-4 px-4">
        <RecordPaymentModel household={houseHoldDetailsData?.data} />
        <CreateOfflinePaymentModel householdData={houseHoldDetailsData?.data} householdDepartments={householdDepartmentsData?.data[0]} />
        <UpdateHousehold household={houseHoldDetailsData?.data} />
        <UpdateHouseholdStatus household={houseHoldDetailsData?.data} />
        <DeleteTransaction />
      </section>
      <HouseHoldDetailTable
        transactions={transactions}
        member={member}
        village={village}
        cell={cell}
        sector={sector}
        district={district}
        province={province}
      />
    </main>
  )
}

export default HouseholdDetail
