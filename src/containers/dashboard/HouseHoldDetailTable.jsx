const HouseHoldDetailTable = ({
  transactions,
  member,
  village,
  cell,
  sector,
  district,
  province,
}) => {
  return (
    <div className="page-wrapper p-4 mt-8">
      <div className="page-content-wrapper">
        <div className="page-content">
          <div className="flex items-start gap-4 mx-auto">
            <div className="max-w-[70%] bg-white rounded-lg shadow-lg ring-1 ring-gray-200">
              <div className="card-body">
                <h6 className="font-semibold mb-4 text-gray-800 px-3 mt-3">
                  <b>Transaction history</b>
                </h6>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4">
                          N<sup>o</sup>
                        </th>
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
                    <tbody>
                      {transactions.map((transaction, index) => {
                        const paidMonth = new Date(
                          transaction.month_paid
                        ).toLocaleString('default', {
                          month: 'long',
                          year: 'numeric',
                        })

                        let payStatus = ''
                        if (transaction.status === 'PENDING') {
                          payStatus = 'bg-red-500 text-white'
                        } else if (transaction.status === 'PARTIAL') {
                          payStatus = 'bg-blue-500 text-white'
                        } else {
                          payStatus = 'bg-green-500 text-white'
                        }

                        return (
                          <tr key={transaction.id} className="border-b">
                            <td className="py-3 px-4 whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.status !== 'PAID' && (
                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 mr-2 rounded-sm transition duration-300">
                                  Pay Now
                                </button>
                              )}
                              {paidMonth}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.amount} RWF
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.remain_amount} RWF
                            </td>
                            <td
                              className={`py-3 px-4 ${payStatus} whitespace-nowrap`}
                            >
                              {transaction.status}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.updated_at}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <a
                                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 transition duration-300"
                                href={`viewHistory/${transaction.id}/${paidMonth}/${transaction.amount}/${transaction.remain_amount}`}
                              >
                                <i className="mr-2 text-lg bx bx-eyes"></i>
                                View History
                              </a>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <a
                                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-sm hover:bg-green-600 transition duration-300"
                                href={`receipt/${transaction.guid}`}
                              >
                                <i className="mr-2 text-lg bx bx-download"></i>
                                Receipt
                              </a>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              {transaction.transaction_id}IMS{transaction.agent}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="card bg-white rounded-lg shadow-lg ring-1 ring-gray-200">
              <div className="card-body">
                <h6 className="font-semibold mb-4 text-gray-800 px-3 mt-4">
                  <b>Household information</b>
                </h6>
                <div className="table-responsive">
                  <table className="min-w-full">
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Names</td>
                        <td className="py-2 px-4">{member.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Phone 1</td>
                        <td className="py-2 px-4">{member.phone1}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">TIN Number</td>
                        <td className="py-2 px-4">{member.phone2}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">National ID</td>
                        <td className="py-2 px-4">{member.nid}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Amount</td>
                        <td className="py-2 px-4">
                          {member.ubudehe} ({member.price} {member.currency})
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Village</td>
                        <td className="py-2 px-4">{village.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Cell</td>
                        <td className="py-2 px-4">{cell.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Sector</td>
                        <td className="py-2 px-4">{sector.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">District</td>
                        <td className="py-2 px-4">{district.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Province</td>
                        <td className="py-2 px-4">{province.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold">Status</td>
                        <td className="py-2 px-4">
                          <span className="badge badge-success">
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HouseHoldDetailTable