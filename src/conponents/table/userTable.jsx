import { useState } from 'react'

import DataTable from 'react-data-table-component'

const userTable = () => {
  const column = [
    {
      name: 'N',
      selector: (row) => row.id, // Assuming 'id' is the property for 'N' column
      sortable: true,
    },
    {
        name: 'Names',
        selector: (row) => row.name, // 'name' property for 'Names' column
        sortable: true,
      },
      {
        name: 'Month paid',
        selector: (row) => row.monthPaid, // 'monthPaid' property for 'Month paid' column
        sortable: true,
      },
      {
        name: 'Cell',
        selector: (row) => row.cell, // 'cell' property for 'Cell' column
        sortable: true,
      },
      {
        name: 'Village',
        selector: (row) => row.village, // 'village' property for 'Village' column
        sortable: true,
      },
      {
        name: 'Total',
        selector: (row) => row.totalAmount, // 'totalAmount' property for 'Total' column
        sortable: true,
      },
      {
        name: 'Bank',
        selector: (row) => row.bank, // 'bank' property for 'Bank' column
        sortable: true,
      },
      {
        name: 'Commission',
        selector: (row) => row.commission, // 'commission' property for 'Commission' column
        sortable: true,
      },
      {
        name: 'Date',
        selector: (row) => row.datePaid, // 'datePaid' property for 'Date' column
        sortable: true,
      },
  ]
  const Data = [
    {
      id: 1,
      name: 'John Doe',
      monthPaid: 'January',
      cell: '123-456-7890',
      village: 'Nyarugenge',
      totalAmount: '$100',
      bank: 'ABC Bank',
      commission: '$10',
      datePaid: '2023-06-01',
    },
  ]
  const village = 'Nyarugenge'

  const [data, setData] = useState(Data)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('All')
  const [paymentMethod, setPaymentMethod] = useState('All')
  // Function to handle date from input change
  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value)
    filterData()
  }

  // Function to handle date to input change
  const handleDateToChange = (e) => {
    setDateTo(e.target.value)
    filterData()
  }

  // Function to handle payment method select change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value)
    filterData()
  }

  // Function to handle status select change
  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    filterData()
  }

  // Function to handle search button click
  const handleSearchButtonClick = () => {
    filterData()
  }

  // Function to filter data based on search query, date range, status, and payment method
  const filterData = () => {
    let filteredData = Data

    if (searchQuery) {
      filteredData = filteredData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.village.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (dateFrom) {
      filteredData = filteredData.filter((item) => item.datePaid >= dateFrom)
    }

    if (dateTo) {
      filteredData = filteredData.filter((item) => item.datePaid <= dateTo)
    }

    if (status !== 'All') {
      filteredData = filteredData.filter((item) => item.status === status)
    }

    if (paymentMethod !== 'All') {
      filteredData = filteredData.filter(
        (item) => item.paymentMethod === paymentMethod
      )
    }

    setData(filteredData)
  }

  // Function to handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    filterData(e.target.value)
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 min-h-screen">
      {/* Search form by Date From, Date To, Status, Payment Method */}
      <div className="flex flex-col md:flex-row justify-between md:space-x-4 bg-white rounded-lg p-4 shadow-lg mb-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col">
            <label className="text-gray-600">Date From</label>
            <input
              type="date"
              className="border rounded-lg p-2"
              value={dateFrom}
              onChange={handleDateFromChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600">Date To</label>
            <input
              type="date"
              className="border rounded-lg p-2"
              value={dateTo}
              onChange={handleDateToChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600">Status</label>
            <select
              className="border rounded-lg p-2"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600">Payment Method</label>
            <select
              className="border rounded-lg p-2"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <option value="All">All</option>
              <option value="Bank">Bank</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <button
            className="bg-indigo-500 text-white rounded-lg p-2 shadow-md"
            onClick={handleSearchButtonClick}
          >
            Search
          </button>
        </div>
      </div>
      {/* End of search form */}
      {/* Search form by using text */}
      <div className="bg-white rounded-lg p-4 shadow-lg mb-4">
        <label className="text-gray-600">Search</label>
        <input
          type="text"
          className="border rounded-lg p-2 w-full"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <DataTable
        title={`List Of ${village} Village ALL Transactions`}
        columns={column}
        data={data}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
        paginationComponentOptions={{
          rowsPerPageText: 'Rows per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: false,
          selectAllRowsItemText: 'All',
        }}
        className="bg-white text-gray-800 shadow-lg rounded-lg"
        responsive
        highlightOnHover
        striped
        dense
      />
    </div>
  )
}

export default userTable
