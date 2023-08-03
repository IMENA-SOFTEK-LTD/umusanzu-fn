import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import Loading from '../components/Loading'
import UserProfileUpdateForm from '../components/userProfileUpdateForm'
import { useLazyGetUserProfileQuery } from '../states/api/apiSlice'
// import { useRowState } from 'react-table'

function Settings({ user }) {


  const { user: stateUser } = useSelector((state) => state.auth)

  const [getUserProfile, { 
    data: userProfileData,
    isLoading,
    isError, 
    isSuccess }
  ] =  useLazyGetUserProfileQuery()
    

  useEffect(() => {
    if (user || stateUser) {
      getUserProfile({
        id: user?.id || stateUser?.id,
        departmentId: user?.department_id || stateUser?.department_id,
      });
    }
  }, [user, stateUser, getUserProfile]);

  
  return (
      
    <div  className="flex flex-col items-center mt-10">
              <div className=" rounded-lg border shadow-2xl w-8/12  flex flex-col items-center ">
                       
                      <div className=' text-center w-96 '> 

                      <svg className="text-gray-800 ml-36 mb-2 h-18 w-24  mt-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 18">
                       <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-2 3h4a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"/>
                      </svg>                        
                          <p className="mb-3 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text
                           font-bold "> {isLoading ? (<Loading /> ): (userProfileData?.data?.names)} </p>
                         <div className='border shadow-xl rounded-lg mb-10'>                         
                          <p className="mb-2 mt-2 font-semibold leading-none text-gray-900 ">Phone 1</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{isLoading ? (<Loading /> ): (userProfileData?.data?.phone1)}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900 ">Phone 2</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{isLoading ? (<Loading /> ): (userProfileData?.data?.phone2)}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900">Deparment</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{isLoading ? (<Loading /> ): (userProfileData?.data?.department_id)}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900">Email</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{isLoading ? (<Loading /> ): (userProfileData?.data?.email)}</p> 
                          <p className="mb-2 font-semibold leading-none text-gray-900">Username</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{isLoading ? (<Loading /> ): (userProfileData?.data?.username)}</p>                        
                          <p className="mb-2 font-semibold leading-none text-gray-900">Password</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">*********</p>
                        
                          
                            <UserProfileUpdateForm user={user || stateUser} />                         
    
                          </div>
                      </div>                                                           
              
              </div>
          </div> 
    
  )
}

Settings.propTypes = {
  user: PropTypes.shape({
    names: PropTypes.string,
    phone1: PropTypes.string,
    phone2: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
  
  }),
}

export default Settings