import HouseHoldDetailTable from './HouseHoldDetailTable' // Adjust the import path accordingly
import RecordPaymentModel from '../../components/models/RecordPaymentModel'
const HouseholdDetail = () => {
  const transactions = [
    {
      id: 1,
      month_paid: '2023-01-01',
      amount: 1000,
      remain_amount: 500,
      status: 'PENDING',
      updated_at: '2023-08-17',
      guid: 'abc123',
      transaction_id: '12345',
      agent: 'Agent Name',
    },
    {
      id: 2,
      month_paid: '2023-02-01',
      amount: 1000,
      remain_amount: 500,
      status: 'PARTIAL',
      updated_at: '2023-09-16',
      guid: 'abc123',
      transaction_id: '12345',
      agent: 'Agent Name',
    },
    {
      id: 3,
      month_paid: '2023-03-01',
      amount: 1000,
      remain_amount: 500,
      status: 'PAID',
      updated_at: '2023-10-15',
      guid: 'abc123',
      transaction_id: '12345',
      agent: 'Agent Name',
    },
  ]

  const member = {
    name: 'John Doe',
    phone1: '123-456-7890',
    phone2: 'TIN123',
    nid: 'ID123',
    ubudehe: 'Ubudehe Status',
    price: 200,
    currency: 'USD',
    status: 'Active',
  }

  const village = {
    name: 'Sample Village',
  }

  const cell = {
    name: 'Sample Cell',
  }

  const sector = {
    name: 'Sample Sector',
  }

  const district = {
    name: 'Sample District',
  }

  const province = {
    name: 'Sample Province',
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
