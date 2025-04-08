import { useEffect } from 'react'
import DepartmentsTable from '../../containers/dashboard/DepartmentsTable'
import { DepartmentModals } from '../../containers/dashboard/DepartmentModals'

const Department = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    document.title = 'Departments | Umusanzu Digital'
  }, [])

  return (
    <main className='relative w-full'>
      <DepartmentsTable user={user} />
    </main>
  )
}

export default Department
