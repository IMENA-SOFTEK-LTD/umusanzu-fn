import HouseHoldDetailTable from './HouseHoldDetailTable' // Adjust the import path accordingly
import RecordPaymentModel from '../../components/models/RecordPaymentModel'
import { useLazyGetHouseHoldDetailsQuery, useLazyGetHouseholdDepartmentsQuery } from '../../states/api/apiSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
const HouseholdDetail = () => {
  const { id } = useParams()

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
      <RecordPaymentModel />
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
