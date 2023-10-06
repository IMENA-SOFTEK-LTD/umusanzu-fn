import { useEffect } from 'react'
import DashboardCard from '../../components/DashboardCard'
import ChartDashboard from '../../containers/dashboard/DashboardChart'

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    document.title = 'Dashboard | Umusanzu Digital'
  }, [])

  return (
    <main className="flex flex-col items-center gap-12 w-[95%] mx-auto">
      <section className="w-full p-4 mx-auto flex items-center flex-wrap gap-4 justify-center">
        {Array.from({ length: 12 }, (_, i) => {
          const props = {
            index: i + 1,
            progress: Math.floor(Math.random() * 100),
            amount: '897,399',
            increaseValue: (Math.random() * 10).toFixed(2),
            user
          }
          return <DashboardCard key={i} props={props} />
        })}
      </section>
      <section className="w-full mx-auto">
        <ChartDashboard />
      </section>
    </main>
  )
}

export default Dashboard
