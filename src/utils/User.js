const logOut = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getDepartment = (level_id) => {
  let department = ''
  switch (level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }
  return department
}

export { logOut }
