import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Loading from '../../components/Loading'
import { useVerifyOtpMutation } from '../../states/api/apiSlice'
import { setUser } from '../../states/features/auth/authSlice'
import Button from '../../components/Button'

const Validate2faPage = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [
    verifyOtp,
    {
      data: otpData,
      isLoading: otpLoading,
      isSuccess: otpIsSuccess,
      isError: otpIsError,
      error: otpError,
    },
  ] = useVerifyOtpMutation()

  const inputRefs = useRef([])

  const handleInputChange = (index, value) => {
    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)

    if (value && index < otpValues.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text')
    const cleanedData = pasteData.replace(/\D/g, '').slice(0, 6)

    const newOtpValues = [...otpValues]
    cleanedData.split('').forEach((char, index) => {
      if (index < otpValues.length) {
        newOtpValues[index] = char
      }
    })

    setOtpValues(newOtpValues)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtpValues = [...otpValues]
      newOtpValues[index] = ''

      if (index > 0) {
        setOtpValues(newOtpValues)
        inputRefs.current[index - 1].focus()
      } else {
        setOtpValues(newOtpValues)
      }
    }
  }

  const handleOtpVerification = async () => {
    try {
      const otpCode = otpValues.join('')

      verifyOtp({
        username: user?.username,
        code: otpCode,
      })
    } catch (error) {
      console.error('Error verifying OTP:', error)
    }
  }

  useEffect(() => {
    if (otpIsSuccess) {
      dispatch(setUser(otpData))
      navigate('/dashboard')
      window.location.reload()
    }
  }, [otpData, otpIsSuccess])

  useEffect(() => {
    document.title = 'Verify OTP | Umusanzu Digital'
  }, [])

  return (
    <>
      <main className="container mx-auto w-full h-screen max-h-[80vh] bg-slate-50 flex items-center justify-center">
        <form className="flex flex-col items-center gap-6 p-8 bg-white shadow-lg w-full max-w-[50%] mx-auto max-md:max-w-[70%] max-sm:max-w-[85%]">
          <h1 className="text-[25px] uppercase font-bold text-center">
            OTP Confirmation
          </h1>
          <span className="w-full max-w-[80%] mx-auto flex flex-col items-center gap-4">
            <p className="text-center">
              Please enter a One-Time Password (OTP) you received on your email
              address below.
            </p>
            <p className="text-center text-[1.5rem] font-bold">
              {user?.email}
            </p>
          </span>
          <article
            id="otp"
            className="flex flex-row justify-center text-center"
            onPaste={handlePaste}
          >
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="m-2 border h-8 w-8 text-center form-control rounded focus:border-none outline-none focus:outline-primary max-md:w-8 max-md:h-8"
                type="text"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength="1"
              />
            ))}
          </article>

          <Button
            value={otpLoading ? <Loading /> : 'Confirm OTP'}
            onClick={handleOtpVerification}
            className="mx-auto w-full max-w-[50%] flex items-center justify-center text-center max-md:max-w-[70%] max-sm:max-w-[85%]"
          />
        </form>
      </main>
    </>
  )
}

export default Validate2faPage
