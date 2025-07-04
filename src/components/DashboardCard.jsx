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
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Button from './Button'
import {
  setMonthlyTarget,
  setLastMonthlyTarget,
} from '../states/features/dashboard/dashboardCardSlice'
import formatFunds from '../utils/Funds'
import { useNavigate } from 'react-router-dom'
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
      isError: dashboardCardIsError,
      error: dashboardCardError,
    },
  ] = useLazyDashboardCardQuery()

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const { isOpen } = useSelector((state) => state.sidebar)
  const [showModal, setShowModal] = useState(false)
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
        title: `Target`,
        period: 'month',
        viewMore: true,
        bg_color: 'bg-[#013B47]',
        text_color: 'text-white',
        increase: false,
        increaseValue: 0,
        funds: !dashboardCardIsLoading,
        route: 'monthlyTarget',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyTarget || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'monthlyTarget',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 2:
      newProps = {
        ...props,
        period: 'day',
        title: "Today's Collections",
        bg_color: 'bg-[#E9D8A6]',
        text_color: 'white',
        route: 'todayCollections',
        removeIncreaseDecrease: false,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        progress: 0,
        viewMore: true,
        funds: !dashboardCardIsLoading,
        lastDayAmount: dashboardCardData?.data.lastDayCollections || 0,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data.todayCollections || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'todayCollections',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 3:
      newProps = {
        ...props,
        period: 'month',
        title: `Monthly Collections`,
        bg_color: 'bg-[#12a6bc80]',
        text_color: 'text-black',
        route: 'monthlyCollections',
        viewMore: true,
        funds: !dashboardCardIsLoading,
        removeIncreaseDecrease: false,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        progress: dashboardCardData?.data?.progress || 0,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyCollections || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'monthlyCollections',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break

    case 4:
      newProps = {
        ...props,
        title: 'Pending Paid',
        period: 'month',
        bg_color: 'bg-[#CADEDE]',
        text_color: 'white',
        route: 'amountPendingPaid',
        viewMore: true,
        removeIncreaseDecrease: true,
        funds: !dashboardCardIsLoading,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        progress: dashboardCardData?.data?.progress || 0,

        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.amountPendingPaid || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'amountPendingPaid',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break

    case 5:
      newProps = {
        ...props,
        title: 'Advance Payments',
        period: 'month',
        bg_color: 'bg-[#ee9b00]',
        text_color: 'white',
        route: 'advancePayments',
        removeIncreaseDecrease: true,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        progress: dashboardCardData?.data?.progress || 0,
        viewMore: true,
        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.advancePayments || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'advancePayments',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break

    case 6:
      newProps = {
        ...props,
        title: 'Pending',
        route: 'amountPendingNotPaid',
        bg_color: 'bg-[#ae2012]',
        text_color: 'text-white',
        period: 'month',
        viewMore: true,
        removeIncreaseDecrease: true,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        progress: dashboardCardData?.data?.progress || 0,

        funds: !dashboardCardIsLoading,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.amountPendingNotPaid || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'amountPendingNotPaid',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break

    case 7:
      newProps = {
        ...props,
        title: 'Total Households',
        period: 'month',
        bg_color: 'bg-[#005F73]',
        text_color: 'text-white',
        route: '',
        viewMore: true,
        funds: false,
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.totalHouseholds || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'totalHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 8:
      newProps = {
        ...props,
        title: 'Active Households',
        viewMore: true,
        period: 'month',
        bg_color: 'bg-[#CA6702]',
        text_color: 'text-white',
        route: 'active',
        funds: false,
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.activeHouseholds || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'activeHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 9:
      newProps = {
        ...props,
        title: 'Inactive Households',
        viewMore: true,
        period: 'month',
        bg_color: 'bg-[#9B2226]',
        text_color: 'text-white',
        route: 'inactive',
        funds: false,
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.inactiveHouseholds || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'inactiveHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 10:
      newProps = {
        ...props,
        title: 'Moved Households',
        viewMore: true,
        period: 'month',
        bg_color: 'bg-yellow-900',
        text_color: 'text-white',
        route: 'moved',
        funds: false,
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.movedHouseholds || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'movedHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    case 11:
      newProps = {
        ...props,
        title: 'Requests to move',
        viewMore: true,
        period: 'month',
        bg_color: 'bg-green-900',
        text_color: 'text-white',
        route: 'requested',
        funds: false,
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.requestedHouseholds || 0
        ),
      }
      useEffect(() => {
        dashboardCard({
          v2: true,
          department,
          route: 'requestedHouseholds',
          departmentId: props?.user?.department_id,
        })
      }, [])
      break
    default:
      newProps = { ...newProps }
  }

  useEffect(() => {
    if (dashboardCardIsSuccess && dashboardCardData.data?.monthlyTarget) {
      dispatch(setMonthlyTarget(dashboardCardData?.data?.monthlyTarget))
      dispatch(setLastMonthlyTarget(dashboardCardData?.data?.lastMonthlyTarget))
    }
  }, [dashboardCardIsSuccess])

  return (
    <article
      className={`${isOpen ? 'w-[18%]' : 'w-[18%]'} h-full ${
        newProps.bg_color
      } ${
        newProps.text_color
      } max-h-[20rem] min-h-fit flex flex-col w-min-fit border-[.5px] border-slate-200 rounded-md shadow-md ease-in-out duration-200 hover:scale-[1.01] max-[1200px]:p1200-dashboardCard ${
        department !== 'sector' &&
        department !== 'country' &&
        (newProps?.route === 'moved' || newProps?.route === 'requested')
          ? 'hidden'
          : 'flex'
      }`}
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
            <p>
              {dashboardCardIsLoading ? (
                <Loading size={4} />
              ) : (
                formatFunds(newProps.amount)
              )}
            </p>
            <p className={`${newProps.funds ? 'flex' : 'hidden'}`}>RWF</p>
          </span>

          <p
            className={`${newProps.lastDayAmount ? 'hidden' : ''} ${
              newProps.progress > 70 && newProps.funds
                ? 'text-green-500 flex'
                : newProps.progress < 70 && newProps.funds
                ? 'text-yellow-900'
                : 'text-slate-200'
            } ${
              newProps.title === `Target` ||
              newProps.title === `Today's Collections` ||
              newProps.title === `Pending`
                ? 'invisible'
                : 'flex'
            } text-[12px] ${newProps.funds ? 'flex' : 'invisible'}`}
          >
            {newProps.progress}% of monthly target
          </p>
          <p
            className={`text-yellow-900 text-bold flex' ${
              !newProps.lastDayAmount ? 'hidden' : 'flex'
            } text-[12px]`}
          >
            <p>
              {dashboardCardIsLoading
                ? '...'
                : formatFunds(newProps.lastDayAmount)}
            </p>
            <p className={`flex`}>RWF (Last Day)</p>
          </p>
        </div>
        <figure className="p-1 bg-slate-200 rounded-md shadow-md h-full flex justify-start">
          <FontAwesomeIcon
            className="text-black cursor-pointer w-6 h-6"
            icon={newProps.funds ? faMoneyBill : faHouse}
          />
        </figure>
      </section>
      <section className="border-t-[1px] bg-slate-50 flex w-full h-full items-center justify-end py-[5px] px-4">
        {!newProps.removeIncreaseDecrease && (
          <small className="flex flex-col items-center">
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
        )}
        <Button
          disabled={dashboardCardIsLoading || newProps.amount <= 0}
          value="View more"
          // route={`/households/?query=${newProps?.route}`}
          className={`sm ${
            isOpen
              ? '!px-[7px] !py-[7px] text-[12px] text-center ml-4'
              : 'px-[8px] py-[7px] text-[12px] text-center'
          } ${newProps.viewMore ? 'flex' : 'invisible'} p-2 ${
            newProps.period === 'day' ? 'ml-4' : 'ml-0'
          } w-fit`}
          onClick={(e) => {
            e.preventDefault()
            setShowModal(true)
            // if (newProps?.route === 'monthlyTarget') {
            //   navigate(`/households/?query=monthlyTarget`)
            // } else if (['active'].includes(newProps?.route)) {
            //   navigate(`/households/?status=ACTIVE`)
            // } else if (['inactive'].includes(newProps?.route)) {
            //   navigate(`/households/?status=INACTIVE`)
            // } else if (['moved'].includes(newProps?.route)) {
            //   navigate(`/households/?status=MOVED`)
            // } else if (['requested'].includes(newProps?.route)) {
            //   navigate(`/households/?status=REQUESTED`)
            // }
          }}
        />
        {newProps?.title && (
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
                <div className="w-full mx-3">
                  {[
                    'todayCollections',
                    'monthlyCollections',
                    'amountPendingPaid',
                    'advancePayments',
                    'amountPendingNotPaid',
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
        level_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    }),
  }),
}

DashboardCard.defaultProps = {
  props: {
    increaseValue: (Math.random() * 10).toFixed(1),
    progress: Math.floor(Math.random() * 100),
  },
}

export default DashboardCard
