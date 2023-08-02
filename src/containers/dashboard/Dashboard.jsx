import DashboardCard from '../../components/DashboardCard'
import Sidebar from '../../containers/navigation/Sidebar'

const Dashboard = () => {

  const user = JSON.parse(localStorage.getItem('user'))

  console.log(user)

  return (
    <main className="w-full mx-auto p-4 flex items-center flex-wrap gap-4">
      {Array.from({ length: 10 }, (_, i) => {
        const props = {
          index: i + 1,
          progress: Math.floor(Math.random() * 100),
          amount: '897,399',
          increaseValue: (Math.random() * 10).toFixed(2),
          user,
        }
        return <DashboardCard key={i} props={props} />
      })}
    </main>
  )
}

export default Dashboard
