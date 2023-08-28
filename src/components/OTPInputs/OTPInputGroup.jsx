import { useState } from 'react'
import OTPInput from './OTPInput'

const OTPInputGroup = () => {
  // state to store all input boxes
  const [inputValues, setInputValues] = useState({
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    input5: '',
    input6: ''
    //  Add more input values here
  })
  // this function updates the value of the state inputValues
  const handleInputChange = (inputId, value) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [inputId]: value
    }))
  }
  // this function processes form submission
  const handleSubmit = () => {
    //  ... Your submit logic here
  }
  // return child component
  return (
    <>
      <div id="OTPInputGroup" data-autosubmit="true">
        <OTPInput
          id="input1"
          value={inputValues.input1}
          onValueChange={handleInputChange}
          previousId={null}
          handleSubmit={handleSubmit}
          nextId="input2"
        />
        <OTPInput
          id="input2"
          value={inputValues.input2}
          onValueChange={handleInputChange}
          previousId="input1"
          handleSubmit={handleSubmit}
          nextId="input3"
        />
        <OTPInput
          id="input3"
          value={inputValues.input3}
          onValueChange={handleInputChange}
          previousId="input2"
          handleSubmit={handleSubmit}
          nextId="input4"
        />
        {/* Seperator */}
        <span>&ndash;</span>
        <OTPInput
          id="input4"
          value={inputValues.input4}
          onValueChange={handleInputChange}
          previousId="input3"
          handleSubmit={handleSubmit}
          nextId="input5"
        />
        <OTPInput
          id="input5"
          value={inputValues.input5}
          onValueChange={handleInputChange}
          previousId="input4"
          handleSubmit={handleSubmit}
          nextId="input6"
        />
        <OTPInput
          id="input6"
          value={inputValues.input6}
          onValueChange={handleInputChange}
          previousId="input5"
          handleSubmit={handleSubmit}
        />
      </div>
    </>
  )
}

export default OTPInputGroup
