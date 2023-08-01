import { useState, useRef, useMemo } from 'react'
import { useTable, usePagination, useFilters } from 'react-table'

const TransactionTable = () => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'N',
        accessor: 'id',
        sortable: true,
      },
      {
        Header: 'Names',
        accessor: 'name',
        sortable: true,
      },
      {
        Header: 'Month paid',
        accessor: 'monthPaid',
        sortable: true,
      },
      {
        Header: 'Cell',
        accessor: 'cell',
        sortable: true,
      },
      {
        Header: 'Village',
        accessor: 'village',
        sortable: true,
      },
      {
        Header: 'Total',
        accessor: 'totalAmount',
        sortable: true,
      },
      {
        Header: 'Bank',
        accessor: 'bank',
        sortable: true,
      },
      {
        Header: 'Commission',
        accessor: 'commission',
        sortable: true,
      },
      {
        Header: 'Date',
        accessor: 'datePaid',
        sortable: true,
      },
    ],
    []
  )

  // Sample Data
  const initialData = [
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
    {
      id: 2,
      name: 'John Nishimwe',
      monthPaid: 'January',
      cell: '123-456-7890',
      village: 'Nyarugenge',
      totalAmount: '$100',
      bank: 'ABC Bank',
      commission: '$67',
      datePaid: '2023-06-01',
    },
    {
      id: 3,
      name: 'John Doe',
      monthPaid: 'January',
      cell: '123-456-7890',
      village: 'Nyarugenge',
      totalAmount: '$100',
      bank: 'ABC Bank',
      commission: '$10',
      datePaid: '2023-06-01',
    },
    {
      id: 4,
      name: 'John Nishimwe',
      monthPaid: 'January',
      cell: '123-456-7890',
      village: 'Nyarugenge',
      totalAmount: '$100',
      bank: 'ABC Bank',
      commission: '$67',
      datePaid: '2023-06-01',
    },
  ]

  const [data, setData] = useState(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('All')
  const [paymentMethod, setPaymentMethod] = useState('All')

  // Function to handle date from input change
  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value)
  }

  // Function to handle date to input change
  const handleDateToChange = (e) => {
    setDateTo(e.target.value)
  }

  // Function to handle payment method select change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value)
  }

  // Function to handle status select change
  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  // Function to handle search button click
  const handleSearchButtonClick = () => {
    filterData()
  }

  // Function to filter data based on search query, date range, status, and payment method
  const filterData = () => {
    let filteredData = data

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

    return filteredData
  }

  // Function to handle search input changes
  const handleSearchChange = (e) => {
    const searchQuery = e.target.value
    setSearchQuery(searchQuery)
  }

  const filteredData = useMemo(
    () => filterData(),
    [searchQuery, dateFrom, dateTo, status, paymentMethod]
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize, canPreviousPage, canNextPage },
    setPageSize,
    gotoPage,
    previousPage, // Add this line to extract previousPage function
    pageCount,
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useFilters,
    usePagination
  )

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
          onInput={handleSearchChange}
        />
      </div>
      <div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      className="px-4 py-2 text-left bg-gray-100"
                      {...column.getHeaderProps()}
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row)
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td className="border px-4 py-2" {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center mt-4">
          <button
            className="px-2 py-1 mr-1 rounded-lg bg-gray-200"
            onClick={() => gotoPage(0)}
            disabled={pageIndex === 0}
          >
            {'<<'}
          </button>
          <button
            className="px-2 py-1 mr-1 rounded-lg bg-gray-200"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {'<'}
          </button>
          <button
            className="px-2 py-1 mr-1 rounded-lg bg-gray-200"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {'>'}
          </button>
          <button
            className="px-2 py-1 mr-1 rounded-lg bg-gray-200"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={pageIndex === pageCount - 1}
          >
            {'>>'}
          </button>
          <span className="mr-2">
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageCount}
            </strong>
          </span>
          <input
            type="number"
            className="w-16 px-2 py-1 text-center border rounded-md"
            value={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
          />
          <span>of {pageCount}</span>
          <select
            className="w-24 ml-2 border rounded-md"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default TransactionTable
