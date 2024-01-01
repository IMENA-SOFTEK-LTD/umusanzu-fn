export const getUserDepartmentsInfoByLevelId = (user, stateUser) => {
  let userDepartmentInfo = {}
  const userInfo = user || stateUser
  switch (userInfo.departments?.level_id) {
    case 1:
      userDepartmentInfo.province = userInfo?.departments?.parent?.parent?.parent?.parent?.name
      userDepartmentInfo.district = 'n/a'
      userDepartmentInfo.sector = 'n/a'
      userDepartmentInfo.cell = 'n/a'
      userDepartmentInfo.village = 'n/a'
      userDepartmentInfo.department = `${userInfo?.departments?.name} province`
      userDepartmentInfo.level_id = userInfo.departments?.level_id
      break
    case 2:
      userDepartmentInfo.province = userInfo?.departments?.parent?.name
      userDepartmentInfo.district = userInfo?.departments?.name
      userDepartmentInfo.sector = 'n/a'
      userDepartmentInfo.cell = 'n/a'
      userDepartmentInfo.village = 'n/a'
      userDepartmentInfo.department = `${userInfo?.departments?.name} district`
      userDepartmentInfo.level_id = userInfo.departments?.level_id
      break
    case 3:
      userDepartmentInfo.province = userInfo?.departments?.parent?.parent?.name
      userDepartmentInfo.district = userInfo?.departments?.parent?.name
      userDepartmentInfo.sector = userInfo?.departments?.name
      userDepartmentInfo.cell = 'n/a'
      userDepartmentInfo.village = 'n/a'
      userDepartmentInfo.department = `${userInfo?.departments?.name} sector`
      userDepartmentInfo.level_id = userInfo.departments?.level_id
      break
    case 4:
      userDepartmentInfo.province = userInfo?.departments?.parent?.parent?.parent?.name
      userDepartmentInfo.district = userInfo?.departments?.parent?.parent?.name
      userDepartmentInfo.sector = userInfo?.departments?.parent?.name
      userDepartmentInfo.cell = userInfo?.departments?.name
      userDepartmentInfo.village = 'n/a'
      userDepartmentInfo.level_id = userInfo.departments?.level_id
      userDepartmentInfo.department = `${userInfo?.departments?.name} cell`
      break
    case 5:
      userDepartmentInfo.province = 'n/a'
      userDepartmentInfo.district = 'n/a'
      userDepartmentInfo.sector = 'n/a'
      userDepartmentInfo.cell = 'n/a'
      userDepartmentInfo.village = 'n/a'
      userDepartmentInfo.level_id = userInfo.departments?.level_id
      userDepartmentInfo.department = `${userInfo?.departments?.name} country`
      break
    case 6:
      userDepartmentInfo.province = userInfo?.departments?.parent?.parent?.parent?.parent?.name
      userDepartmentInfo.district = userInfo?.departments?.parent?.parent?.parent?.name
      userDepartmentInfo.sector = userInfo?.departments?.parent?.parent?.name
      userDepartmentInfo.cell = userInfo?.departments?.parent.name
      userDepartmentInfo.village = userInfo?.departments?.name
      userDepartmentInfo.level_id = userInfo.departments?.level_id
      userDepartmentInfo.department = `${userInfo?.departments?.name} village`
      break
    default:
  }

  return userDepartmentInfo;
}

