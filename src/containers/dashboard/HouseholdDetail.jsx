import HouseHoldDetailTable from './HouseHoldDetailTable' // Adjust the import path accordingly
import RecordPaymentModel from '../../components/models/RecordPaymentModel'
import CreateOfflinePaymentModel from '../../components/models/CreateOfflinePaymentModel'
import {
  useLazyGetHouseHoldDetailsQuery,
  useLazyGetHouseholdDepartmentsQuery,
} from '../../states/api/apiSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import UpdateHousehold from '../../components/models/UpdateHousehold'
import UpdateHouseholdStatus from '../../components/models/UpdateHouseholdStatus'
import DeleteTransaction from '../../components/models/DeleteTransaction'
import InvoiceRequestFormModel from '../../components/models/InvoiceRequestFormModel'
import RecordMultipleMonthsPayment from '../../components/models/RecordMultipleMonthsPayment'
const HouseholdDetail = () => {
  const { id } = useParams()
  const user = JSON.parse(localStorage.getItem('user'))
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
      document.title = `${houseHoldDetailsData?.data?.name} | Umusanzu Digital`
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

  return (
    <main className="flex flex-col gap-2 my-4 max-[1000px]:flex-col">
      <div>
      {user?.departments.level_id >5  && (
      <section className="flex flex-col gap-2 md:flex-row items-center md:gap-2 px-4 mt-20 md:mt-0">
        <RecordPaymentModel household={houseHoldDetailsData?.data} className="mb-2 md:mb-0" />
        <CreateOfflinePaymentModel householdData={houseHoldDetailsData?.data} householdDepartments={householdDepartmentsData?.data[0]} className="mb-2 md:mb-0" />
        <RecordMultipleMonthsPayment household={houseHoldDetailsData?.data} className="mb-2 md:mb-0" />
            <DeleteTransaction className="mb-2 md:mb-0" />
            <InvoiceRequestFormModel className="mb-2 md:mb-0" />
        </section>
      )}
      <UpdateHousehold household={houseHoldDetailsData?.data} className="mb-2 md:mb-0" />
      <UpdateHouseholdStatus household={houseHoldDetailsData?.data} className="mb-2 md:mb-0" />
      </div>
      <section>
      <HouseHoldDetailTable
        transactions={transactions}
        member={member}
        village={village}
        cell={cell}
        sector={sector}
        district={district}
        province={province}
      />
      </section>
    </main>
  )
}

export default HouseholdDetail
