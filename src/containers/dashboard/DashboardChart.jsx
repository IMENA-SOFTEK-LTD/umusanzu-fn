import { useState } from 'react'
import LineChart from '../../components/LineChart'
import { weeklyData, monthData, annualData } from './Data'
import { useSelector } from 'react-redux'

const ChartDashboard = () => {
  const [viewMode, setViewMode] = useState('daily')

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const getChartData = () => {
    if (viewMode === 'weekly') {
      return weeklyData
    } else if (viewMode === 'monthly') {
      return monthData
    } else {
      return annualData
    }
  }

  const chartData = getChartData()

  const { isOpen } = useSelector((state) => state.sidebar)

  return (
    <div
      className={`w-[98%] mx-auto ${
        !isOpen
          ? 'flex items-start flex-row-reverse gap-6'
          : 'flex flex-col gap-4'
      } mb-8`}
    >
      <div
        className={`${
          isOpen ? 'flex items-center gap-6' : 'flex flex-col gap-4'
        }`}
      >
        <button
          className={`px-2 py-2 rounded ${
            viewMode === 'weekly' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('weekly')}
        >
          View Weekly Collections
        </button>
        <button
          className={`px-2 py-2 rounded ${
            viewMode === 'monthly' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('monthly')}
        >
          View Monthly Collections
        </button>
        <button
          className={`px-2 py-2 rounded ${
            viewMode === 'annual' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('annual')}
        >
          View Annual Collections
        </button>
      </div>
      <div className="border w-full rounded-lg shadow-md p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode === 'daily'
            ? 'Daily Collections'
            : viewMode === 'monthly'
            ? 'Monthly Collections'
            : 'Annual Collections'}
        </h2>
        <div className="border rounded p-4 min-h-[500px] max-h-[500px] font-bold">
          <LineChart className="w-full" data={chartData} />
        </div>
      </div>
    </div>
  )
}

export default ChartDashboard
