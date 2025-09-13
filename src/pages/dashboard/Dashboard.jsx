import { useEffect } from 'react'
import DashboardCard from '../../components/DashboardCard'
import ChartDashboard from '../../containers/dashboard/DashboardChart'

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    document.title = 'Dashboard | Umusanzu Digital'
  }, [])

  return (
    <main className="flex flex-col gap-10 w-full max-w-7xl mx-auto px-3 py-6">
      <section
        className="w-full p-4 mx-auto flex items-center flex-wrap justify-center
         grid 
          gap-4 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4 
          xl:grid-cols-6
      "
      >
        {Array.from({ length: 12 }, (_, i) => {
          const props = {
            index: i + 1,
            progress: 0,
            amount: 0,
            increaseValue: 0,
            user,
          }
          return <DashboardCard key={i} props={props} />
        })}
      </section>
      <section className="w-full">
        <ChartDashboard />
      </section>
    </main>
  )
}

export default Dashboard
