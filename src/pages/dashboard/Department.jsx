import { DepartmentModals } from '../../containers/dashboard/DepartmentModals'
import DepartmentsTable from '../../containers/dashboard/DepartmentsTable'

const Department = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <main>
      <DepartmentModals />
      <DepartmentsTable user={user} />
    </main>
  )
}

export default Department
