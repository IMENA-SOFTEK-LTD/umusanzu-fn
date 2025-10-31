import { useSelector } from 'react-redux'
import HouseholdDetailsCard from '../../components/HouseholdDetailsCard'
import { useEffect } from 'react'

const HouseDetails = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    document.title = 'Household Stats | Umusanzu Digital'
  }, [])

  return (
    <main className="w-full mx-auto p-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 9 }, (_, i) => {
        const props = {
          index: i + 1,
          amount: '12,300',
          increaseValue: (Math.random() * 10).toFixed(2),
          user
        }
        return <HouseholdDetailsCard key={i} props={props} />
      })}
    </main>
  )
}

export default HouseDetails
