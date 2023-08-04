import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import UserProfileUpdateForm from '../components/userProfileUpdateForm'

function Settings({ user }) {

  const { user: stateUser } = useSelector((state) => state.auth)
  
  return (
      
    <div  className="flex flex-col items-center mt-10">
              <div className=" rounded-lg border shadow-2xl w-8/12  flex flex-col items-center ">
                       
                      <div className=' text-center w-96 '> 

                      <svg className="text-gray-800 ml-36 mb-2 h-18 w-24  mt-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 18">
                       <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-2 3h4a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"/>
                      </svg>                        
                          <p className="mb-3 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text
                           font-bold "> {user?.names || stateUser?.names} </p>
                         <div className='border shadow-xl rounded-lg mb-10'>                         
                          <p className="mb-2 mt-2 font-semibold leading-none text-gray-900 ">Phone 1</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{user?.phone1 || stateUser?.phone1}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900 ">Phone 2</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{user?.phone2 || stateUser?.phone2}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900">Deparment</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{user?.department_id|| stateUser?.department_id}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900">Email</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">{user?.email || stateUser?.email}</p>                         
                          <p className="mb-2 font-semibold leading-none text-gray-900">Password</p>
                          <p className="mb-4 font-light text-gray-700 sm:mb-5 ">*********</p>

                           <button type="button" className="text-white mb-5 inline-flex items-center bg-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:text-white hover:bg-gray-800  ">
                                  <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                  Edit
                              </button>                           


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
    department_id: PropTypes.string,
    // departments: PropTypes.shape({
    //   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    //   name: PropTypes.string,
    //   level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // })

  }),
}

export default Settings