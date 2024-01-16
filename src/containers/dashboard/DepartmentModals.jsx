import { useDispatch, useSelector } from 'react-redux'
import CreateDistictModel from '../../components/models/CreateDistrictModel'
import CreateVillageModel from '../../components/models/CreateVillageModel'
import CreateAgentModel from '../../components/models/CreateAgentModel'
import CreateAdminModel from '../../components/models/CreateAdminModel'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faX } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import CreateAdmin from '../staff/CreateAdmin'
import { setCreateAdminModal } from '../../states/features/departments/staffSlice'

export const DepartmentModals = () => {

  // STATE VARIABLES
  const dispatch = useDispatch()
  const { user: stateUser } = useSelector((state) => state.auth)

  const [showModals, setShowModals] = useState(false)

  let content = null

  switch (stateUser.departments?.level_id) {
    case 1:
      content = (
        <main>
          <CreateDistictModel />
          <CreateAdmin />
            <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
              e.preventDefault()
              dispatch(setCreateAdminModal(true))
            }} />
        </main>
      )
      break
    case 3:
      content = (
        <main className="flex flex-col gap-16 relative">
          <Button
            className="py-2 px-3 bg-primary text-white rounded-[50%] w-fit absolute right-6 top-6 max-md:top-2"
            value={<FontAwesomeIcon icon={showModals ? faX : faAdd} />}
            onClick={() => {
              setShowModals(!showModals)
            }}
          />
          <article
            className={`${
              showModals ? 'flex ease-in-out duration-100' : 'hidden'
            } ease-in-out duration-100 absolute top-12 right-6 w-full h-full flex flex-col gap-12`}
          >
            <CreateAgentModel />
            <CreateAdmin />
            <Button value='Create Admin' className='absolute top-16 right-6 !rounded-lg' onClick={(e) => {
              e.preventDefault()
              dispatch(setCreateAdminModal(true))
            }} />
          </article>
        </main>
      )
      break
    case 4:
      content = (
        <main className="flex flex-col gap-16 relative">
          <CreateVillageModel />
          <CreateAdmin />
            <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
              e.preventDefault()
              dispatch(setCreateAdminModal(true))
            }} />
        </main>
      )
      break
    case 5:
      content = (
        <main className="flex flex-col gap-16 relative">
          <Button
            className="py-2 px-3 bg-primary text-white rounded-[50%] w-fit absolute right-6 top-6 max-md:top-2"
            value={<FontAwesomeIcon icon={showModals ? faX : faAdd} />}
            onClick={() => {
              setShowModals(!showModals)
            }}
          />
          <article
            className={`${
              showModals ? 'flex ease-in-out duration-100' : 'hidden'
            } ease-in-out duration-100 absolute top-12 right-6 w-full h-full flex flex-col gap-12`}
          >
            <CreateVillageModel />
            <CreateAgentModel />
            <CreateAdmin />
            <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
              e.preventDefault()
              dispatch(setCreateAdminModal(true))
            }} />
          </article>
        </main>
      )
      break
    default:
      break
  }

  return content
}
