import PerformancesTable from "../../containers/dashboard/PerformancesTable";

const Performances = ({ user }) => {
  return (
    <main>
      <PerformancesTable user={user} />
    </main>
  )
}

export default Performances;
