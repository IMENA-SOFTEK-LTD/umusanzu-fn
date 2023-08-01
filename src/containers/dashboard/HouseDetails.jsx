import HouseholdDetailsCard from "../../components/HouseholdDetailsCard"


const HouseDetails = () => {
  return (
    <main className="w-full mx-auto p-4 flex items-center flex-wrap gap-4">
      {Array.from({ length: 9 }, (_, i) => {
        const props = {
          index: i + 1,         
          amount: '12,300',
          increaseValue: (Math.random() * 10).toFixed(2),
        }
        return <HouseholdDetailsCard key={i} props={props} />
      })}
    </main>
  )
}

export default HouseDetails