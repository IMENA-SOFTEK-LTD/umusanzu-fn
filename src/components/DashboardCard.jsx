import PropTypes from 'prop-types'
import {
  faArrowDown,
  faArrowUp,
  faHouse,
  faMoneyBill,
} from '@fortawesome/free-solid-svg-icons'
import Loading from './Loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyDashboardCardQuery } from '../states/api/apiSlice'
import { useEffect } from 'react'

const DashboardCard = ({
  props = {
    funds: true,
    increase: true,
    period: 'month',
    target: 50,
    title: 'Income',
    amount: '892,560,000',
    index: 0,
    progress: 50,
    increaseValue: 2.15,
    user: {}
  },
}) => {

  const [dashboardCard, {
    data: dashboardCardData,
    isLoading: dashboardCardIsLoading,
    isSuccess: dashboardCardIsSuccess,
    isError: dashboardCardIsError,
    error: dashboardCardError,
  }] = useLazyDashboardCardQuery()

  let newProps = { ...props }
  let department = '';

  switch (props.user?.departments?.level_id) {
    case 1:
      department = 'province'
      break
    case 2:
      department = 'district'
      break
    case 3:
      department = 'sector'
      break
    case 4:
      department = 'cell'
      break
    case 5:
      department = 'country'
      break
    case 6:
      department = 'agent'
      break
    default:
      department = 'agent'
  }

  switch (props.index) {
    case 1:
      newProps = {
        ...props,
        title: 'Monthly Target',
        period: 'month',
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.monthlyTarget,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'monthlyTarget',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 2:
      newProps = {
        ...props,
        title: 'Total Collected',
        period: 'month',
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : dashboardCardData?.data[0]?.totalCollected || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'totalCollected',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 3:
      newProps = {
        ...props,
        title: 'Cleared Pending Payments',
        period: 'month',
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.amountPendingPaid || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'amountPendingPaid',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 4:
      newProps = {
        ...props,
        period: 'month',
        title: "Monthly's Collections",
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.monthlyCollections || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'monthlyCollections',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 5:
      newProps = {
        ...props,
        title: 'Pending Payments',
        period: 'month',
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.amountPendingNotPaid || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'amountPendingNotPaid',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 6:
      newProps = {
        ...props,
        title: 'Advance Payments',
        period: 'month',
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.advancePayments || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'advancePayments',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 7:
      newProps = {
        ...props,
        period: 'day',
        title: "Today's Collections",
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.todayCollections || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'todayCollections',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 8:
      newProps = {
        ...props,
        title: 'Total Households',
        period: 'month',
        funds: false,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.totalHouseholds || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'totalHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 9:
      newProps = {
        ...props,
        title: 'Active Households',
        funds: false,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.activeHouseholds || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'activeHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 10:
      newProps = {
        ...props,
        title: 'Inactive Households',
        funds: false,
        amount: dashboardCardIsLoading ? <Loading /> : dashboardCardData?.data[0]?.inactiveHouseholds || 0,
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'inactiveHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    default:
      newProps = { ...newProps }
  }

  useEffect(() => {
    console.log(dashboardCardData?.data[0]?.amountPendingPaid, department, props?.user?.department_id)
  }, [dashboardCardIsSuccess])

  return (
    <article
      className={`${
        newProps.period === 'month' && newProps.target <= 20
          ? 'bg-yellow-50'
          : null
      } w-full max-w-[20rem] h-full max-h-[20rem] min-h-fit flex flex-col w-min-fit border-[.5px] border-slate-200 rounded-md shadow-md ease-in-out duration-200 hover:scale-[1.01]`}
    >
      <section className="w-full flex items-start py-4 px-4 justify-start h-full min-h-[60%]">
        <div className="w-full flex flex-col items-start gap-2">
          <h3 className="text-slate-700 text-[1rem] font-bold">
            {newProps.title}
          </h3>
          <span className="text-[18px] w-full flex items-center gap-2 font-black">
            <p>{newProps.amount}</p>
            <p className={`${newProps.funds ? 'flex' : 'hidden'}`}>RWF</p>
          </span>
          <p
            className={`${
              newProps.progress > 70 && newProps.funds
                ? 'text-green-500 flex'
                : newProps.progress < 70 && newProps.funds
                ? 'text-yellow-900'
                : 'text-slate-200'
            } text-[14px]`}
          >
            {newProps.progress}% of monthly target
          </p>
        </div>
        <figure className="p-1 bg-slate-200 rounded-md shadow-md h-full flex justify-start">
          <FontAwesomeIcon
            className="text-black cursor-pointer w-6 h-6"
            icon={newProps.funds ? faMoneyBill : faHouse}
          />
        </figure>
      </section>
      <section className="border-t-[1px] bg-slate-50 flex w-full items-center justify-between py-2 px-4">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon
            className={`${
              newProps.increase ? 'text-green-500' : 'text-red-500'
            } w-3 h-3`}
            icon={newProps.increase ? faArrowUp : faArrowDown}
          />
          <p
            className={`${
              newProps.increase ? 'text-green-500' : 'text-red-500'
            } text-[14px]`}
          >
            {newProps.increaseValue}%
          </p>
          <p className="text-[13px] ml-2 text-slate-500">
            Last {newProps.period}
          </p>
        </span>
        <button className="p-2 px-4 rounded-sm shadow-sm ease-in-out duration-300 bg-slate-00 text-black text-[15px] hover:bg-accent hover:text-white">
          View more
        </button>
      </section>
    </article>
  )
}

DashboardCard.propTypes = {
  props: PropTypes.shape({
    props: PropTypes.object,
    funds: PropTypes.bool,
    increase: PropTypes.bool,
    period: PropTypes.string,
    target: PropTypes.number,
    title: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user: PropTypes.shape({
      department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      departments: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    })
  }),
}

export default DashboardCard
