import { useState } from 'react'
const Validate2faPage = () => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])

  const handleInputChange = (index, value) => {
    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)
  }
  return (
    <>
      <div className="h-screen bg-gradient-to-r from-rose-100 to-teal-100 py-20 px-3">
        <div className="container mx-auto">
          <div className="max-w-sm mx-auto md:max-w-lg">
            <div className="w-full">
              <div className="bg-white h-64 py-3 rounded text-center shadow-2xl">
                <h1 className="text-2xl font-bold">Kugenzura OTP</h1>
                <div className="flex flex-col mt-4">
                  <span>Injiza OTP wakiriye kuri</span>
                  <span className="font-bold">+250 7******876</span>
                </div>

                <div
                  id="otp"
                  className="flex flex-row justify-center text-center px-2 mt-5"
                >
                  <input
                    className="m-2 border h-10 w-10 text-center form-control rounded"
                    type="text"
                    id="first"
                    value={otpValues[0]}
                    onChange={(e) => handleInputChange(0, e.target.value)}
                    maxLength="1"
                  />
                  <input
                    className="m-2 border h-10 w-10 text-center form-control rounded"
                    type="text"
                    id="second"
                    value={otpValues[1]}
                    onChange={(e) => handleInputChange(1, e.target.value)}
                    maxLength="1"
                  />
                  <input
                    className="m-2 border h-10 w-10 text-center form-control rounded"
                    type="text"
                    id="third"
                    value={otpValues[2]}
                    onChange={(e) => handleInputChange(2, e.target.value)}
                    maxLength="1"
                  />
                  <input
                    className="m-2 border h-10 w-10 text-center form-control rounded"
                    type="text"
                    id="fourth"
                    value={otpValues[3]}
                    onChange={(e) => handleInputChange(3, e.target.value)}
                    maxLength="1"
                  />
                  <input
                    className="m-2 border h-10 w-10 text-center form-control rounded"
                    type="text"
                    id="fifth"
                    value={otpValues[4]}
                    onChange={(e) => handleInputChange(4, e.target.value)}
                    maxLength="1"
                  />
                  <input
                    className="m-2 border h-10 w-10 text-center form-control rounded"
                    type="text"
                    id="sixth"
                    value={otpValues[5]}
                    onChange={(e) => handleInputChange(5, e.target.value)}
                    maxLength="1"
                  />
                </div>

                <div className="flex justify-center text-center mt-5">
                  <a className="flex items-center text-tertiary hover:text-accent cursor-pointer">
                    <span className="font-bold">Ongera usabe OTP</span>
                    <i className="bx bx-caret-right ml-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Validate2faPage
