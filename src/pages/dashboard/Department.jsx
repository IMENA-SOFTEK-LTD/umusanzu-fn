import { useEffect } from 'react'
import { DepartmentModals } from '../../containers/dashboard/DepartmentModals'
import DepartmentsTable from '../../containers/dashboard/DepartmentsTable'

const Department = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    document.title = 'Departments | Umusanzu Digital'
  }, [])

  return (
    <main>
      <DepartmentModals />
      <DepartmentsTable user={user} />
    </main>
  )
}

export default Department
