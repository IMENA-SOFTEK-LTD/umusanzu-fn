import { useState } from 'react'
import LineChart from '../../components/LineChart'
import { weeklyData, monthData, annualData } from './Data'

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

  return (
    <div className="w-11/12 mx-auto max-w-screen-lg">
      <div className="space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('weekly')}
        >
          View Weekly Collections
        </button>
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('monthly')}
        >
          View Monthly Collections
        </button>
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('annual')}
        >
          View Annual Collections
        </button>
      </div>
      <div className="border rounded-lg shadow-md p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode === 'daily'
            ? 'Daily Collections'
            : viewMode === 'monthly'
            ? 'Monthly Collections'
            : 'Annual Collections'}
        </h2>
        <div className="border rounded p-4">
          <LineChart data={chartData} />
        </div>
      </div>
    </div>
  )
}

export default ChartDashboard
