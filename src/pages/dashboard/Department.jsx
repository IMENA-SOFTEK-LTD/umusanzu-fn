import CreateCellModel from '../../components/models/CreateCellModel'
import { useSelector } from 'react-redux'
import CreateDistictModel from '../../components/models/createDistrictModel'
import CreateHouseHoldModel from '../../components/models/CreateHouseHoldModel'

export const Department = () => {
  const { user: stateUser } = useSelector((state) => state.auth)
  const user = JSON.parse(localStorage.getItem('user'))
  console.log(user)

  const renderComponent = () => {
    switch (user?.departments?.level_id || stateUser.departments?.level_id) {
      case 1:
        return <CreateDistictModel />
      case 6:
        return <CreateHouseHoldModel />
      case 3:
        return <CreateCellModel />
      default:
        return null
    }
  }

  return <div>{renderComponent()}</div>
}
