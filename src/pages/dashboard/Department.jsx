import React from 'react'

const Department = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <main>
      <DepartmentsTable user={user} />
    </main>
  )
}

export default Department
