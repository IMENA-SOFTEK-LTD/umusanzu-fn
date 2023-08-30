import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading'
import {
  useVerifyOtpMutation
} from '../../states/api/apiSlice';
import { setUser } from '../../states/features/auth/authSlice';

const Validate2faPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: stateUser } = useSelector((state) => state.auth);

  const [
    verifyOtp,
    {
      data: otpData,
      isLoading: otpLoading,
      isSuccess: otpIsSuccess,
      isError: otpIsError,
      error: otpError
    }
  ] = useVerifyOtpMutation();

  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value && index < otpValues.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    const cleanedData = pasteData.replace(/\D/g, '').slice(0, 6);

    const newOtpValues = [...otpValues];
    cleanedData.split('').forEach((char, index) => {
      if (index < otpValues.length) {
        newOtpValues[index] = char;
      }
    });

    setOtpValues(newOtpValues);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = '';

      if (index > 0) {
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1].focus();
      } else {
        setOtpValues(newOtpValues);
      }
    }
  };

  const handleOtpVerification = async () => {
    try {
      const otpCode = otpValues.join('');

      verifyOtp({
        username: user?.username,
        code: otpCode
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  useEffect(() => {
    if (otpIsSuccess) {
      dispatch(setUser(otpData));
      navigate('/dashboard');
      window.location.reload();
    }
  }, [otpData, otpIsSuccess]);

  return (
    <>
      <div className="h-screen bg-slate-50 py-20 px-3">
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
                  onPaste={handlePaste}
                >
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      className="m-2 border h-10 w-10 text-center form-control rounded"
                      type="text"
                      value={value}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      maxLength="1"
                    />
                  ))}
                </div>

                <div className="flex justify-center text-center mt-5">
                  <a
                    className="flex items-center text-tertiary hover:text-accent cursor-pointer"
                    onClick={handleOtpVerification}
                  >
                    <span className="font-bold">
                      {otpLoading ? <Loading /> : 'Emeza'}
                    </span>
                    <i className="bx bx-caret-right ml-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Validate2faPage;
