import PropTypes from 'prop-types'
import {
  faArrowDown,
  faArrowUp,
  faHouse,
  faMoneyBill
} from '@fortawesome/free-solid-svg-icons'
import Loading from './Loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyDashboardCardQuery } from '../states/api/apiSlice'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Button from './Button'
import { setMonthlyTarget } from '../states/features/dashboard/dashboardCardSlice'
import { color } from 'framer-motion'
import getMonthName from '../utils/Dates'
import formatFunds from '../utils/Funds'

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
    route: '#',
    increaseValue: 2.15,
    user: {},
    bg_color: 'black',
    text_color: 'white'
  }
}) => {
  const [
    dashboardCard,
    {
      data: dashboardCardData,
      isLoading: dashboardCardIsLoading,
      isSuccess: dashboardCardIsSuccess,
      isError: dashboardCardIsError,
      error: dashboardCardError
    }
  ] = useLazyDashboardCardQuery()

  const dispatch = useDispatch()

  const { monthlyTarget } = useSelector((state) => state.dashboardCard)
  const { isOpen } = useSelector((state) => state.sidebar)

  let newProps = { ...props, viewMore: true }
  let department = ''

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
        title: `${getMonthName()}'s Target`,
        period: 'month',
        viewMore: true,
        bg_color: 'bg-[#013B47]',
        text_color: 'text-white',
        progress:
          Math.round(
            (dashboardCardData?.data[0]?.monthlyTarget / monthlyTarget).toFixed(
              2
            ) * 100
          ) || 0,
        route: 'active',
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.monthlyTarget || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'monthlyTarget',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 6:
      newProps = {
        ...props,
        title: 'Total Collected',
        period: 'month',
        bg_color: 'bg-[#94d2bd]',
        text_color: 'text-black',
        route: 'monthlyCollections',
        viewMore: true,
        progress:
          Math.round(
            (
              dashboardCardData?.data[0]?.totalCollected / monthlyTarget
            ).toFixed(1) * 100
          ) || 0,
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.totalCollected || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'totalCollections',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 3:
      newProps = {
        ...props,
        title: 'Pending Paid',
        period: 'month',
        bg_color: 'bg-[#CADEDE]',
        text_color: 'white',
        route: 'amountPendingNotPaid',
        viewMore: true,
        funds: !dashboardCardIsLoading,
        progress:
          Math.round(
            (
              dashboardCardData?.data[0]?.amountPendingPaid / monthlyTarget
            ).toFixed(1) * 100
          ) || 0,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.amountPendingPaid || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'amountPendingPaid',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 2:
      newProps = {
        ...props,
        period: 'month',
        title: `${getMonthName()}'s Collections`,
        bg_color: 'bg-[#12a6bc80]',
        text_color: 'text-black',
        route: 'monthlyCollections',
        viewMore: true,
        funds: !dashboardCardIsLoading,
        progress:
          Math.round(
            (
              dashboardCardData?.data[0]?.monthlyCollections / monthlyTarget
            ).toFixed(1) * 100
          ) || 0,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.monthlyCollections || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'monthlyCollections',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 7:
      newProps = {
        ...props,
        title: 'Pending',
        route: 'amountPendingNotPaid',
        bg_color: 'bg-[#ae2012]',
        text_color: 'text-white',
        period: 'month',
        viewMore: true,
        progress:
          Math.round(
            (
              dashboardCardData?.data[0]?.amountPendingNotPaid / monthlyTarget
            ).toFixed(1) * 100
          ) || 0,
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.amountPendingNotPaid || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'amountPendingNotPaid',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 4:
      newProps = {
        ...props,
        title: 'Advance Payments',
        period: 'month',
        bg_color: 'bg-[#ee9b00]',
        text_color: 'white',
        route: 'advancePayments',
        progress:
          Math.round(
            (
              dashboardCardData?.data[0]?.advancePayments / monthlyTarget
            ).toFixed(1) * 100
          ) || 0,
        viewMore: true,
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.advancePayments || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'advancePayments',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 5:
      newProps = {
        ...props,
        period: 'day',
        title: "Today's Collections",
        bg_color: 'bg-[#E9D8A6]',
        text_color: 'white',
        route: 'todayCollections',
        progress:
          Math.round(
            (
              dashboardCardData?.data[0]?.todayCollections / monthlyTarget
            ).toFixed(1) * 100
          ) || 0,
        viewMore: true,
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.todayCollections || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'todayCollections',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 8:
      newProps = {
        ...props,
        title: 'Total Households',
        period: 'month',
        bg_color: 'bg-[#005F73]',
        text_color: 'text-white',
        route: '',
        viewMore: true,
        funds: false,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.totalHouseholds || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'totalHouseholds',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 9:
      newProps = {
        ...props,
        title: 'Active Households',
        viewMore: true,
        period: 'month',
        bg_color: 'bg-[#CA6702]',
        text_color: 'text-white',
        route: 'active',
        funds: false,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.activeHouseholds || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'activeHouseholds',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    case 10:
      newProps = {
        ...props,
        title: 'Inactive Households',
        viewMore: true,
        period: 'month',
        bg_color: 'bg-[#9B2226]',
        text_color: 'text-white',
        route: 'inactive',
        funds: false,
        amount: dashboardCardIsLoading
          ? (
          <Loading />
            )
          : (
              dashboardCardData?.data[0]?.inactiveHouseholds || 0
            )
      }
      useEffect(() => {
        dashboardCard({
          department,
          route: 'inactiveHouseholds',
          departmentId: props?.user?.department_id
        })
      }, [])
      break
    default:
      newProps = { ...newProps }
  }

  useEffect(() => {
    if (dashboardCardIsSuccess && dashboardCardData.data[0].monthlyTarget) {
      dispatch(setMonthlyTarget(dashboardCardData?.data[0]?.monthlyTarget))
    }
  }, [dashboardCardIsSuccess])

  return (
    <article
      className={`${isOpen ? 'w-[18%]' : 'w-[18%]'} h-full ${
        newProps.bg_color
      } ${
        newProps.text_color
      } max-h-[20rem] min-h-fit flex flex-col w-min-fit border-[.5px] border-slate-200 rounded-md shadow-md ease-in-out duration-200 hover:scale-[1.01]`}
    >
      <section className="w-full flex items-start py-4 px-4 justify-start h-full min-h-[60%]">
        <div className="w-full flex flex-col items-start gap-2">
          <h3
            className={`${newProps.text_color} ${
              isOpen ? 'text-[14px]' : 'text-[15px]'
            } font-bold`}
          >
            {newProps.title}
          </h3>
          <span
            className={`${
              isOpen ? 'text-[14px]' : 'text-[16px]'
            }  w-full flex items-center gap-2 font-black`}
          >
            <p>{dashboardCardIsLoading ? '...' : formatFunds(newProps.amount)}</p>
            <p className={`${newProps.funds ? 'flex' : 'hidden'}`}>RWF</p>
          </span>
          <p
            className={`${
              newProps.progress > 70 && newProps.funds
                ? 'text-green-500 flex'
                : newProps.progress < 70 && newProps.funds
                ? 'text-yellow-900'
                : 'text-slate-200'
            } text-[14px] ${newProps.funds ? 'flex' : 'invisible'}`}
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
      <section className="border-t-[1px] bg-slate-50 flex w-full h-full items-center justify-between py-[5px] px-4">
        <small className='flex flex-col items-start'>
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
          </span>
          <p className="text-[13px] block text-slate-500">
            Last {newProps.period}
          </p>
        </small>
        <Button
          value="View more"
          route={
            newProps.funds && newProps.title !== `${getMonthName()}'s Target`
              ? `/transactions/?query=${newProps?.route}`
              : newProps.title === `${getMonthName()}'s Target` ? `/households/?query=${newProps?.route}` : `/households/?query=${newProps?.route}`
          }
          className={`${
            isOpen
              ? 'px-[3px] py-[3px] text-[12px] text-center ml-4'
              : 'px-[8px] py-[7px] text-[12px] text-center'
          } ${newProps.viewMore ? 'flex' : 'invisible'} p-2 ${
            newProps.period === 'day' ? 'ml-4' : 'ml-0'
          } w-fit`}
        />
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
    color: PropTypes.string,
    route: PropTypes.string,
    title: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user: PropTypes.shape({
      department_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      departments: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      })
    })
  })
}

DashboardCard.defaultProps = {
  props: {
    increaseValue: (Math.random() * 10).toFixed(1),
    progress: Math.floor(Math.random() * 100)
  }
}

export default DashboardCard
