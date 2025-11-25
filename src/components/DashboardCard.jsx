import PropTypes from 'prop-types'
import {
  faArrowDown,
  faArrowUp,
  faArrowUpRightFromSquare,
  faBullseye,
  faCoins,
  faChartLine,
  faFileInvoiceDollar,
  faHandHoldingDollar,
  faHourglassHalf,
  faHouse,
  faMoneyBill,
  faPiggyBank,
  faUsers,
  faUserCheck,
  faUserGear,
  faUserXmark,
} from '@fortawesome/free-solid-svg-icons'
import Loading from './Loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyDashboardCardQuery } from '../states/api/apiSlice'
import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setMonthlyTarget,
  setLastMonthlyTarget,
} from '../states/features/dashboard/dashboardCardSlice'
import formatFunds from '../utils/Funds'
import CustomDialog from './models/CustomDialog'
import HouseHoldsReports from '../pages/dashboard/HouseHoldsReports'
import TransactionsReports from '../pages/dashboard/TransactionsReports'

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
    text_color: 'white',
  },
}) => {
  const [
    dashboardCard,
    {
      data: dashboardCardData,
      isLoading: dashboardCardIsLoading,
      isSuccess: dashboardCardIsSuccess,
    },
  ] = useLazyDashboardCardQuery()

  const dispatch = useDispatch()
  const { isOpen } = useSelector((state) => state.sidebar)
  const [showModal, setShowModal] = useState(false)

  // map department levels
  const departmentMap = {
    1: 'province',
    2: 'district',
    3: 'sector',
    4: 'cell',
    5: 'country',
    6: 'agent',
  }
  const department = departmentMap[props.user?.departments?.level_id] || 'agent'

  // central config for all cards
  const cardConfig = useMemo(() => {
    return {
      1: {
        title: 'Target',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'monthlyTarget',
        variant: 'primary',
        icon: faBullseye,
        iconBg: 'bg-white/20 text-white',
        summary: 'Targets updated for this month',
        helper: 'Latest approved target amount',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyTarget || 0
        ),
      },
      2: {
        title: 'Collected',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'monthlyCollected',
        // variant: 'neutral',
        variant: 'primary',
        icon: faHandHoldingDollar,
        iconBg: 'bg-emerald-100 text-emerald-600',
        summary: 'Total collections completed',
        helper: 'Confirmed payments during the period',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyCollected || 0
        ),
      },
      3: {
        title: 'Pending',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'amountPendingNotPaid',
        // variant: 'neutral',
        variant: 'primary',
        icon: faHourglassHalf,
        iconBg: 'bg-rose-100 text-rose-600',
        summary: 'Outstanding balances pending',
        helper: 'Monitor overdue household amounts',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.amountPendingNotPaid || 0
        ),
      },
      4: {
        title: "Today's Collections",
        period: 'day',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'todayCollections',
        // variant: 'neutral',
        variant: 'primary',
        icon: faCoins,
        iconBg: 'bg-sky-100 text-sky-600',
        helper: 'Last day performance snapshot',
        lastDayAmount: dashboardCardData?.data?.lastDayCollections || 0,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.todayCollections || 0
        ),
      },
      5: {
        title: 'Pending Paid',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'amountPendingPaid',
        // variant: 'neutral',
        variant: 'primary',
        icon: faFileInvoiceDollar,
        iconBg: 'bg-amber-100 text-amber-600',
        summary: 'Pending payments awaiting clearance',
        helper: 'Amounts queued for disbursement',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.amountPendingPaid || 0
        ),
      },
      6: {
        title: 'Advance Payments',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'advancePayments',
        // variant: 'neutral',
        variant: 'primary',
        icon: faPiggyBank,
        // iconBg: 'bg-primary/10 text-primary',
        iconBg: 'bg-emerald-100 text-emerald-600',
        summary: 'Advance payments collected',
        helper: 'Prepaid balances received',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.advancePayments || 0
        ),
      },
      7: {
        title: 'Monthly Collections',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'monthlyCollections',
        // variant: 'neutral',
        variant: 'primary',
        icon: faChartLine,
        iconBg: 'bg-emerald-100 text-emerald-600',
        helper: 'Comparison with previous month',
        progress: dashboardCardData?.data?.progress || 0,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyCollections || 0
        ),
      },
      8: {
        title: 'Total Households',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'totalHouseholds',
        // variant: 'neutral',
        variant: 'primary',
        icon: faUsers,
        // iconBg: 'bg-primary/10 text-primary',
        iconBg: 'bg-emerald-100 text-emerald-600',
        summary: 'Total households registered',
        helper: 'All households recorded in the system',
        removeIncreaseDecrease: true,
        funds: false,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.totalHouseholds || 0
        ),
      },
      9: {
        title: 'Active Households',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'activeHouseholds',
        // variant: 'neutral',
        variant: 'primary',
        icon: faUserCheck,
        // iconBg: 'bg-primary/10 text-primary',
        iconBg: 'bg-emerald-100 text-emerald-600',
        summary: 'Households currently active',
        helper: 'Engaged households this cycle',
        removeIncreaseDecrease: true,
        funds: false,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.activeHouseholds || 0
        ),
      },
      10: {
        title: 'Inactive Households',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'inactiveHouseholds',
        // variant: 'neutral',
        variant: 'primary',
        icon: faUserXmark,
        iconBg: 'bg-slate-200 text-slate-800',
        summary: 'Households inactive this period',
        helper: 'Requires follow-up or reactivation',
        removeIncreaseDecrease: true,
        funds: false,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.inactiveHouseholds || 0
        ),
      },
      11: {
        title: 'Moved Households',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'movedHouseholds',
        // variant: 'neutral',
        variant: 'primary',
        icon: faHouse,
        // iconBg: 'bg-lime-100 text-lime-600',
        iconBg: 'bg-emerald-100 text-emerald-600',
        summary: 'Households moved recently',
        helper: 'Track migration across regions',
        removeIncreaseDecrease: true,
        funds: false,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.movedHouseholds || 0
        ),
      },
      12: {
        title: 'Requests to move',
        period: 'month',
        bg_color: 'bg-primary-dark',
        text_color: 'text-white',
        route: 'requestedHouseholds',
        // variant: 'neutral',
        variant: 'primary',
        icon: faUserGear,
        iconBg: 'bg-primary/10 text-primary',
        summary: 'Pending move requests',
        helper: 'Awaiting approval from admins',
        removeIncreaseDecrease: true,
        funds: false,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.requestedHouseholds || 0
        ),
      },
    }
  }, [dashboardCardData, dashboardCardIsLoading])

  // merged props
  const newProps = {
    ...props,
    ...cardConfig[props.index],
    viewMore: true,
    funds: cardConfig[props.index]?.funds ?? !dashboardCardIsLoading,
  }

  const isPrimaryCard = newProps.variant === 'primary'
  const cardClasses = `relative overflow-hidden rounded-3xl border transition-all duration-300 ${
    isPrimaryCard
      ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl hover:shadow-2xl border-primary/30 hover:border-primary/50'
      : 'bg-white text-slate-900 border-slate-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg'
  }`
  const iconBgClass =
    newProps.iconBg ||
    (isPrimaryCard ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary')
  const iconWrapperClasses = `flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBgClass}`
  const labelColor = isPrimaryCard ? 'text-white/80' : 'text-slate-500'
  const valueColor = isPrimaryCard ? 'text-white' : 'text-slate-900'
  const mutedTextColor = isPrimaryCard ? 'text-white/70' : 'text-slate-500'

  const viewDisabled = dashboardCardIsLoading || !newProps.route
  const viewButtonClasses = `${
    isPrimaryCard
      ? 'border-white/30 text-white hover:bg-white/15'
      : 'border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
  } flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200`
  const viewButtonClassName = `${viewButtonClasses} ${
    viewDisabled ? 'pointer-events-none opacity-50' : ''
  }`

  const hasTrend = !newProps.removeIncreaseDecrease
  const pillText = hasTrend
    ? `${newProps.increase ? 'Increased' : 'Decreased'} from last ${
        newProps.period
      }`
    : newProps.footnote || 'View insights'
  const helperText = hasTrend
    ? `Last ${newProps.period}`
    : newProps.footnote || 'Detailed insights available in the report'

  const pillClasses = `${
    hasTrend
      ? newProps.increase
        ? isPrimaryCard
          ? 'bg-white/15 text-emerald-100'
          : 'bg-emerald-50 text-emerald-700'
        : isPrimaryCard
        ? 'bg-white/15 text-rose-100'
        : 'bg-rose-50 text-rose-600'
      : isPrimaryCard
      ? 'bg-white/10 text-white/85'
      : 'bg-slate-100 text-slate-600'
  } flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold`

  const trendIcon = hasTrend
    ? newProps.increase
      ? faArrowUp
      : faArrowDown
    : null
  const showIncreaseValue =
    hasTrend &&
    newProps.increaseValue !== undefined &&
    newProps.increaseValue !== null &&
    newProps.increaseValue !== '' &&
    !dashboardCardIsLoading

  const openDetails = (event) => {
    event.preventDefault()
    if (!viewDisabled) {
      setShowModal(true)
    }
  }

  // central useEffect to trigger API once
  useEffect(() => {
    if (newProps.route) {
      dashboardCard({
        v2: true,
        department,
        route: newProps.route,
        departmentId: props?.user?.department_id,
      })
    }
  }, [props.index])

  // update redux store when target is loaded
  useEffect(() => {
    if (dashboardCardIsSuccess && dashboardCardData?.data?.monthlyTarget) {
      dispatch(setMonthlyTarget(dashboardCardData?.data?.monthlyTarget))
      dispatch(setLastMonthlyTarget(dashboardCardData?.data?.lastMonthlyTarget))
    }
  }, [dashboardCardIsSuccess])

  return (
    <article className={cardClasses}>
      <div className="flex h-full flex-col gap-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={iconWrapperClasses}>
              <FontAwesomeIcon
                icon={newProps.icon || faBullseye}
                className="h-5 w-5"
              />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold uppercase tracking-wide ${labelColor}`}
              >
                {newProps.title}
              </h3>
              {dashboardCardIsLoading ? (
                <div className="mt-3">
                  <Loading size={4} />
                </div>
              ) : (
                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className={`text-1xl font-semibold tracking-tight ${valueColor}`}
                  >
                    {formatFunds(newProps.amount)}
                  </span>
                  {newProps.funds && (
                    <span className={`text-sm font-medium ${mutedTextColor}`}>
                      RWF
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={viewDisabled}
            onClick={openDetails}
            className={viewButtonClassName}
            aria-label={`View details for ${newProps.title}`}
          >
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className="h-4 w-4"
            />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className={pillClasses}>
            {trendIcon && (
              <FontAwesomeIcon icon={trendIcon} className="h-3 w-3" />
            )}
            {pillText}
          </span>
          {showIncreaseValue && (
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                newProps.increase
                  ? isPrimaryCard
                    ? 'text-emerald-100'
                    : 'text-emerald-600'
                  : isPrimaryCard
                  ? 'text-rose-200'
                  : 'text-rose-500'
              }`}
            >
              {newProps.increaseValue}%
            </span>
          )}
        </div>
        {/* <p className={`text-xs font-medium ${mutedTextColor}`}>{helperText}</p> */}
      </div>

      {newProps?.title && showModal && (
        <CustomDialog
          size="xl"
          headerBgColor={newProps?.bg_color}
          headerTxtColor={newProps?.text_color}
          title={
            <>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2">
                  <li>
                    <a href="#" className="inline-flex items-center ">
                      <FontAwesomeIcon
                        className={`${newProps?.text_color} cursor-pointer w-6 h-6 mt-1`}
                        icon={newProps.funds ? faMoneyBill : faHouse}
                      />{' '}
                      <span className="ml-2 mt-1">{newProps?.title}</span>
                      <svg
                        className="w-5 h-5 text-gray-400 mx-3 mt-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </a>
                  </li>

                  <li>
                    <div className="flex">
                      <span
                        className={`${
                          isOpen ? 'text-[14px]' : 'text-[16px]'
                        }  w-full flex items-center gap-2 font-black`}
                      >
                        <p>
                          {dashboardCardIsLoading ? (
                            <Loading size={4} />
                          ) : (
                            formatFunds(newProps.amount)
                          )}
                        </p>
                        <p>{newProps.funds ? 'RWF' : 'Records'}</p>
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </>
          }
          open={showModal}
          onClose={() => {
            setShowModal(false)
          }}
          children={
            <>
              <div className="w-full mx-3 ">
                {[
                  'todayCollections',
                  'monthlyCollections',
                  'amountPendingPaid',
                  'advancePayments',
                  'amountPendingNotPaid',
                  'monthlyCollected',
                ].includes(newProps?.route) ? (
                  <>
                    <TransactionsReports
                      route={newProps?.route}
                      user={props.user}
                      department={department}
                      departmentId={props?.user?.department_id}
                    />
                  </>
                ) : (
                  <HouseHoldsReports
                    route={newProps?.route}
                    user={props.user}
                    department={department}
                    departmentId={props?.user?.department_id}
                  />
                )}
              </div>
            </>
          }
        />
      )}
    </article>
  )
}

DashboardCard.propTypes = {
  props: PropTypes.object,
}

export default DashboardCard
