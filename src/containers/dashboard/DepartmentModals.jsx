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
import CustomPopover from '../../components/models/CustomPopover'

export const DepartmentModals = () => {
  // STATE VARIABLES
  const dispatch = useDispatch()
  const { user: stateUser } = useSelector((state) => state.auth)

  const [showModals, setShowModals] = useState(false)

  return (
    <>
      <CustomPopover
        trigger={
          <>
            <Button
              submit
              type="button"
              className="py-2 px-3 bg-primary text-white rounded-[50%]"
              value={
                <>
                  <FontAwesomeIcon icon={showModals ? faX : faAdd} />
                  <span className="px-1"> Add</span>
                </>
              }
              onClick={() => {
                setShowModals(!showModals)
              }}
            />
          </>
        }
        placement="bottom"
        height={'h-[160px]'}
        children={
          <div
            className={`ease-in-out duration-100 absolute top-0  w-full flex flex-col gap-12`}
          >
            <CreateVillageModel user={stateUser} />
            <CreateAgentModel />
            {['country', 'province', 'district', 'sector'].includes(
              stateUser?.department
            ) && (
              <>
               <Button
                  value="Create Admin"
                  className="absolute top-28 right-6 !rounded-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    dispatch(setCreateAdminModal(true))
                  }}
                />
                  <CreateAdmin />
                
               
              </>
            )}
          
          </div>
        }
      />
    </>
  )
}
//   switch (stateUser.departments?.level_id) {
//     case 1:
//       content = (
//         <main>
//           <CreateDistictModel />
//           <CreateAdmin />
//             <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
//               e.preventDefault()
//               dispatch(setCreateAdminModal(true))
//             }} />
//         </main>
//       )
//       break
//     case 3:
//       content = (
//         <main className="flex flex-col gap-16 relative">
//           <Button
//             submit
//             type="button"
//             className="py-2 px-3 bg-primary text-white rounded-[50%] w-fit absolute right-6 top-6 max-md:top-2"
//             value={<FontAwesomeIcon icon={showModals ? faX : faAdd} />}
//             onClick={() => {
//               setShowModals(!showModals)
//             }}
//           />
//           <article style={{zIndex:9999}}
//             className={`${
//               showModals ? 'flex ease-in-out duration-100' : 'hidden'
//             } ease-in-out duration-100 absolute top-12 right-6 w-full h-full flex flex-col gap-12`}
//           >
//             <CreateVillageModel user={stateUser} />
//             <CreateAgentModel />
//             <CreateAdmin />
//             <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
//               e.preventDefault()
//               dispatch(setCreateAdminModal(true))
//             }} />
//           </article>
//         </main>
//       )
//       break
//     case 4:
//       content = (
//         <main className="flex flex-col gap-16 relative">
//           <CreateVillageModel user={stateUser} />
//           <CreateAdmin />
//             <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
//               e.preventDefault()
//               dispatch(setCreateAdminModal(true))
//             }} />
//         </main>
//       )
//       break
//     case 5:
//       content = (
//         <main className="flex flex-col gap-16 relative">
//           <Button
//             submit
//             type="button"
//             className="py-2 px-3 bg-primary text-white rounded-[50%] w-fit absolute right-6 top-6 max-md:top-2"
//             value={<FontAwesomeIcon icon={showModals ? faX : faAdd} />}
//             onClick={() => {
//               setShowModals(!showModals)
//             }}
//           />
//           <article style={{zIndex:9999}}
//             className={`${
//               showModals ? 'flex ease-in-out duration-100' : 'hidden'
//             } ease-in-out duration-100 absolute top-12 right-6 w-full h-full flex flex-col gap-12`}
//           >
//             <CreateVillageModel user={stateUser} />
//             <CreateAgentModel />
//             <CreateAdmin />
//             <Button value='Create Admin' className='absolute top-28 right-6 !rounded-lg' onClick={(e) => {
//               e.preventDefault()
//               dispatch(setCreateAdminModal(true))
//             }} />
//           </article>
//         </main>
//       )
//       break
//     default:
//       break
//   }

//   return content
// }
