import { useDispatch, useSelector } from 'react-redux'
import {
  setUpdateHouseholdModal,
  setUpdateHouseholdStatusModal,
} from '../../states/features/modals/householdSlice'
import Button from '../../components/Button'
import UpdateHousehold from '../../components/models/UpdateHousehold'
import UpdateHouseholdStatus from '../../components/models/UpdateHouseholdStatus'

const HouseholdInfo = ({ household }) => {

  // STATE VARIABLES
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)


  return (
    <main className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-4 w-full">
      <div className="p-3">
        <h6 className="mb-4 text-xl font-semibold text-gray-800">
          Household Information
        </h6>
        <div className="table-responsive flex flex-col items-center gap-4">
          <table className="w-full  text-sm">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Names</td>
                <td className="py-2 pl-4">{household?.name}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Phone 1</td>
                <td className="py-2 pl-4">{household?.phone1}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">TIN number</td>
                <td className="py-2 pl-4">{household?.phone2}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">National ID</td>
                <td className="py-2 pl-4">{household?.nid}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Household type</td>
                <td className="py-2 pl-4">
                <td className="py-2 pl-4">{household?.type}</td>  
                  {/* <select className="border-[2px] rounded-[2px] border-[#155E75] outline-[#155E75] w-2/3 text-xs"> 
                    <option value='residence' className='text-xs'> {'Residence'} </option>
                    <option value='business' className='text-xs'> {'Business'} </option>
                              
                  </select> */}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Amount</td>
                <td className="py-2 pl-4">
                  {household?.ubudehe} ({household?.currency || 'RWF'})
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Village</td>
                <td className="py-2 pl-4">
                  {household?.villages && household?.villages[0]?.name}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Cell</td>
                <td className="py-2 pl-4">
                  {household?.cells && household?.cells[0]?.name}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Sector</td>
                <td className="py-2 pl-4">
                  {household?.sectors && household?.sectors[0]?.name}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">District</td>
                <td className="py-2 pl-4">
                  {household?.districts && household?.districts[0]?.name}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Province</td>
                <td className="py-2 pl-4">
                  {household?.provinces && household?.provinces[0]?.name}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 pr-4 font-semibold">Status</td>
                <td className="py-2 pl-4">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold text-white ${
                      household?.status?.toUpperCase() === 'INACTIVE'
                        ? 'bg-red-600'
                        : 'bg-green-500'
                    }`}
                  >
                    {household?.status?.toUpperCase()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          {user?.departments.level_id !== 6 && (
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
          )}
          <UpdateHousehold household={household} />
          <UpdateHouseholdStatus household={household} />
        </div>
      </div>
    </main>
  )
}

export default HouseholdInfo
