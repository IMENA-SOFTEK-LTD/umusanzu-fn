import { useState } from 'react'
import LineChart from '../../components/LineChart' // Make sure to import the LineChart component
import { dailyData, monthlyData } from './Data'

const ChartDashboard = () => {
  const [viewMode, setViewMode] = useState('daily')

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const getChartData = () => {
    return viewMode === 'daily' ? dailyData : monthlyData
  }

  const chartData = getChartData()

  return (
    <div className="w-11/12 mx-auto max-w-screen-lg">
      <div className="space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('daily')}
        >
          View Daily Collections
        </button>
        <button
          className={`px-4 py-2 rounded ${
            viewMode === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('monthly')}
        >
          View Monthly Collections
        </button>
      </div>
      <div className="border rounded-lg shadow-md p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode === 'daily' ? 'Daily Collections' : 'Monthly Collections'}
        </h2>
        <div className="border rounded p-4">
          <LineChart data={chartData} />
        </div>
      </div>
    </div>
  )
}

export default ChartDashboard
