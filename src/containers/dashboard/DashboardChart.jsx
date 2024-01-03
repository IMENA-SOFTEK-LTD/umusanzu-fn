import { useState, useEffect } from 'react'
import LineChart from '../../components/LineChart'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Loading from '../../components/Loading'
import { LOCAL_API_URL, API_URL } from '../../constants'

const ChartDashboard = () => {
  const [viewMode, setViewMode] = useState('week')
  const [chartData, setChartData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [chartError, setChartError] = useState('')

  const token = localStorage.getItem('token')

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    getChartData(mode);
  };

  const getChartData = async (mode) => {
    setIsLoading(true)
    setChartError('')
    if (mode === 'week') {
      try {
        const response = await axios.get(`https://v2.api.umusanzu.rw/api/v2/payment/chartinfo?week=true`,
        { headers: { Authorization: `Bearer ${token}` } })
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
        setIsLoading(false)
        setChartData(weekPayments)
      } catch (error) {
        setIsLoading(false)
        setChartError('Loading payment data failed. Please try again!')
      } 
    } else if (mode === 'month') {

      try {
        let todayDate = new Date();

        const monthDays = () => { 
          const numDays = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
          
          
          let monthDays = [];
          for (let i = 1; i <= numDays; i++) {
            monthDays.push(i);
          }
          return monthDays;
        }
        const monthDaysArray = monthDays();

        const response = await axios.get(`https://v2.api.umusanzu.rw/api/v2/payment/chartinfo?month=${todayDate.getMonth() + 1}&year=${todayDate.getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } })
        const monthPayments = {
          labels: monthDaysArray,
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
        setIsLoading(false)
        setChartData(monthPayments)
      } catch (error) {
        setIsLoading(false)
        setChartError('Loading payment data failed. Please try again!')
      }
    } else if (mode === 'year') {
      try {
        let todayDate = new Date();

        const yearMonths = () => { 
          let months = [];
          for (let i = 1; i <= 12; i++) {
            months.push(i);
          }
          return months;
        }
        const monthsArray = yearMonths();
        const response = await axios.get(`https://v2.api.umusanzu.rw/api/v2/payment/chartinfo?year=${todayDate.getFullYear()}`,
          { headers: { Authorization: `Bearer ${token}` } })
        const yearPayments = {
          labels: monthsArray,
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
        setIsLoading(false)
        setChartData(yearPayments)
      } catch (error) {
        setIsLoading(false)
        setChartError('Loading payment data failed. Please try again!')
      }
    }
  }
  useEffect(() => {
    getChartData(viewMode)    
  }, [])

  const { isOpen } = useSelector((state) => state.sidebar);

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
          {isLoading ? (
            <span className="flex  flex-col items-center mt-20 justify-center min-h-[30vh]">
              <Loading />
              <h4 className="text-primary text-md text-center">
                {'Loading payments data'}
              </h4>
            </span>
          ) : (chartError ? (
            <span className="flex flex-col items-center justify-center min-h-[30vh]">
              <h4 className="text-primary text-md font-bold text-center">
                {chartError}
              </h4>
            </span>
          ): Object.keys(chartData).length && <LineChart className="w-full" data={chartData} /> )}
      </div>
      <div className='flex items-center justify-center gap-6' >
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
  );
};

export default ChartDashboard;
