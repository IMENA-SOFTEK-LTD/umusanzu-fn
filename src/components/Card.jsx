import { motion } from 'framer-motion'

const AwesomeCard = ({
  name,
  phone,
  nationalId,
  email,
  onViewProfileClick,
  onEditClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg shadow-xl p-6 w-80 text-gray-800"
    >
      <h2 className="text-xl font-extrabold mb-4">{name}</h2>
      <div className="flex mb-2">
        <span className="text-gray-600 font-semibold w-24">Phone:</span>
        <p className="text-gray-600">{phone}</p>
      </div>
      <div className="flex mb-2">
        <span className="text-gray-600 font-semibold w-24">National ID:</span>
        <p className="text-gray-600">{nationalId}</p>
      </div>
      <div className="flex mb-6">
        <span className="text-gray-600 font-semibold w-24">Email:</span>
        <p className="text-gray-600">{email}</p>
      </div>
      <div className="flex items-center justify-start">
        <button
          onClick={onViewProfileClick}
          className="shadow-md px-4 py-[5px] rounded-sm bg-primary text-white transition-colors hover:scale-[.98] duration-300"
        >
          View Profile
        </button>
      </div>
    </motion.div>
  )
}

export default AwesomeCard
