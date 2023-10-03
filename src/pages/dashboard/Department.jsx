import { useEffect } from 'react'
import { DepartmentModals } from '../../containers/dashboard/DepartmentModals'
import DepartmentsTable from '../../containers/dashboard/DepartmentsTable'
import Button from '../../components/Button'

const Department = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    document.title = 'Departments | Umusanzu Digital'
  }, [])

  return (
    <main className='relative'>
      <Button value = 'Performances' className='absolute' />
      <DepartmentModals />
      <DepartmentsTable user={user} />
    </main>
  )
}

export default Department
