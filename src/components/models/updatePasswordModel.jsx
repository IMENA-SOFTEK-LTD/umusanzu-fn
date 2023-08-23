import {  useState } from 'react'
import Button from '../Button'
import { FaPenNib } from 'react-icons/fa'

function updatePasswordModel() {

    const [showModal, setShowModal] = useState(false)
    
    const openModal = () => {
      setShowModal(true)
    }
  
    const closeModal = () => {
      setShowModal(false)
    }  
    

  return (
    <div>
      <button
        onClick={openModal}
        className="flex mb-3 items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ml-4 "
        type="button"
      >       
      <FaPenNib className="mr-2 text-lg" />
        Update Password
      </button>

      {showModal && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
        >
          <div className="relative bg-white rounded-lg shadow">
            <button
              onClick={closeModal}
              type="button"
              className="absolute top-3 right-2.5 text-primary bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl text-center font-medium text-black">
                Update Your Passord
              </h3>
              <form className="space-y-6">
                <div>

                  <label
                    htmlFor="OldPassword"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    Old Password
                  </label>
                  <input
                    type="password"                  
                    placeholder="Old password"
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />
                  
                </div>

                <div>
                  <label
                    htmlFor="NewPassword"
                    className="block mb-2 text-sm font-medium text-black"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="New Password"
                    className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                  />
              
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="RetypePassword"
                      className="block mb-2 text-sm font-medium text-black"
                    >
                      Retype Password
                    </label>
                    <input
                      type="password"                     
                      placeholder="Retype password"                  
                      className="text-sm border-[1.3px] focus:outline-primary border-primary rounded-lg block w-full p-2 py-2.5 px-4"
                    />
                 </div>
                 </div>                  
                <Button className={''}
                  submit
                  name="Submit"
                  value='Edit profile'
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    )
}
     


export default updatePasswordModel