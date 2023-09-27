const getBase64 = (file, cb) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function () {
    cb(reader.result)
  }
  reader.onerror = function (error) {
    return error
  }
}

export { getBase64 }
