import { useState, useEffect } from 'react'
import LineChart from '../../components/LineChart'
import { useSelector } from 'react-redux'
import axios from 'axios'

const ChartDashboard = () => {
  const [viewMode, setViewMode] = useState('week')
  const [chartData, setChartData] = useState({})

  

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const getChartData = async () => {
    if (viewMode === 'week') {
      try {
        const response = await axios.get(`${process.env.VITE_APP_API_URL}/payment/chartinfo?week=true`)
        const weekPayments = {
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
          datasets: [
            {
              label: 'Money paid',
              data: response.data.data.length > 0 ? response.data.data.map(data => {
                return data.totalAmount;
              }) : [],
              borderColor: '#165F75',
              backgroundColor: 'rgba(59, 130, 246, 0.2)'
            }
          ]
        }       
        setChartData(weekPayments)
      } catch (error) {
        console.log(error);
      } 
    } else if (viewMode === 'month') {
      try {
        let todayDate = new Date();

        const response = await axios.get(`http://localhost:3000/api/v2/payment/chartinfo?month=${todayDate.getMonth() +1 }&year=${todayDate.getFullYear()}`)
        const monthPayments = {
          labels: response.data.data.length > 0 ? response.data.data.map(data => {
            return `${data.day}`;
          }) : [],
          datasets: [
            {
              label: 'Money paid',
              data: response.data.data.length > 0 ? response.data.data.map(data => {
                return data.totalAmount;
              }) : [],
              borderColor: '#165F75',
              backgroundColor: 'rgba(59, 130, 246, 0.2)'
            }
          ]
        }       
        setChartData(monthPayments)
      } catch (error) {
        console.log(error);
      }
    } else if (viewMode === 'year') {
      try {
        let todayDate = new Date();

        const response = await axios.get(`http://localhost:3000/api/v2/payment/chartinfo?year=${todayDate.getFullYear()}`)
        const yearPayments = {
          labels: response.data.data.length > 0 ? response.data.data.map(data => {
            return `${data.month}`;
          }) : [],
          datasets: [
            {
              label: 'Money paid',
              data: response.data.data.length > 0 ? response.data.data.map(data => {
                return data.totalAmount;
              }) : [],
              borderColor: '#165F75',
              backgroundColor: 'rgba(59, 130, 246, 0.2)'
            }
          ]
        }       
        setChartData(yearPayments)
      } catch (error) {
        console.log(error);
      }
    }
  }
  useEffect(() => {
    getChartData()    
  }, [viewMode])

  const { isOpen } = useSelector((state) => state.sidebar)

  return (
    <div
      className={`w-[98%] mx-auto ${
        !isOpen
          ? 'flex items-start flex-row-reverse gap-6'
          : 'flex flex-col gap-4'
      } mb-8`}
    >
      <div className="border w-full rounded-lg shadow-md p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode === 'week'
            ? `This week's Collections`
            : viewMode === 'month'
              ? `This month's Collections`
              : `This year's Collections`}
        </h2>
        <div className=" rounded p-4 min-h-[500px] max-h-[500px] font-bold">
          {Object.keys(chartData).length > 0 ? <LineChart className="w-full" data={chartData} />: ""}
          
        </div>
        <div
        className={`${
          isOpen ? 'flex items-center gap-6' : 'flex flex-col gap-4'
        }`}
      >
        <button
          className={`px-2 py-2 rounded ${
            viewMode === 'week' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('week')}
        >
          Week's Collections
        </button>
        <button
          className={`px-2 py-2 rounded ${
            viewMode === 'month' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('month')}
        >
          Month's Collections
        </button>
        <button
          className={`px-2 py-2 rounded ${
            viewMode === 'year' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleViewModeChange('year')}
        >
          Year's Collections
        </button>
      </div>
      </div>
    </div>
  )
}

export default ChartDashboard
