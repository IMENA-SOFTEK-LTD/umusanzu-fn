import { motion } from 'framer-motion'
const AwesomeCard = ({ name, phone, nationalId, email }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-xl p-6 w-80 text-gray-800"
    >
      <h2 className="text-3xl font-extrabold mb-4">{name}</h2>
      <p className="text-gray-600 mb-2">{phone}</p>
      <p className="text-gray-600 mb-2">{nationalId}</p>
      <p className="text-gray-600 mb-6">{email}</p>
      <div className="flex justify-end space-x-4">
        <button className="bg-yellow-500 text-white px-6 py-2 rounded-sm hover:bg-yellow-600 transition-colors duration-300">
          View Profile
        </button>
        <button className="bg-red-700 text-white px-6 py-2 rounded-sm hover:bg-red-800 transition-colors duration-300">
          Edit
        </button>
      </div>
    </motion.div>
  )
}

export default AwesomeCard
