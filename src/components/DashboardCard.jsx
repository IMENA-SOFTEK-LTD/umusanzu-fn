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
import { useEffect, useState, useMemo } from 'react'
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
    },
  ] = useLazyDashboardCardQuery()

  const dispatch = useDispatch()
  const navigate = useNavigate()
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
        bg_color: 'bg-[#013B47]',
        text_color: 'text-white',
        route: 'monthlyTarget',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyTarget || 0
        ),
      },
      2: {
        title: "Today's Collections",
        period: 'day',
        bg_color: 'bg-[#E9D8A6]',
        text_color: 'white',
        route: 'todayCollections',
        lastDayAmount: dashboardCardData?.data?.lastDayCollections || 0,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.todayCollections || 0
        ),
      },
      3: {
        title: 'Monthly Collections',
        period: 'month',
        bg_color: 'bg-[#12a6bc80]',
        text_color: 'text-black',
        route: 'monthlyCollections',
        progress: dashboardCardData?.data?.progress || 0,
        increase: dashboardCardData?.data?.increase || false,
        increaseValue: dashboardCardData?.data?.increaseValue?.toFixed(2) || 0,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyCollections || 0
        ),
      },
      4: {
        title: 'Pending Paid',
        period: 'month',
        bg_color: 'bg-[#CADEDE]',
        text_color: 'white',
        route: 'amountPendingPaid',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.amountPendingPaid || 0
        ),
      },
      5: {
        title: 'Advance Payments',
        period: 'month',
        bg_color: 'bg-[#ee9b00]',
        text_color: 'white',
        route: 'advancePayments',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.advancePayments || 0
        ),
      },
      6: {
        title: 'Collected',
        period: 'month',
        bg_color: 'bg-[#ACBDE3]',
        text_color: 'white',
        route: 'monthlyCollected',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.monthlyCollected || 0
        ),
      },
      7: {
        title: 'Pending',
        period: 'month',
        bg_color: 'bg-[#ae2012]',
        text_color: 'text-white',
        route: 'amountPendingNotPaid',
        removeIncreaseDecrease: true,
        amount: dashboardCardIsLoading ? (
          <Loading />
        ) : (
          dashboardCardData?.data?.amountPendingNotPaid || 0
        ),
      },
      8: {
        title: 'Total Households',
        period: 'month',
        bg_color: 'bg-[#005F73]',
        text_color: 'text-white',
        route: 'totalHouseholds',
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
        bg_color: 'bg-[#CA6702]',
        text_color: 'text-white',
        route: 'activeHouseholds',
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
        bg_color: 'bg-[#9B2226]',
        text_color: 'text-white',
        route: 'inactiveHouseholds',
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
        bg_color: 'bg-yellow-900',
        text_color: 'text-white',
        route: 'movedHouseholds',
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
        bg_color: 'bg-green-900',
        text_color: 'text-white',
        route: 'requestedHouseholds',
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
    <article
      className={`w-full h-full ${newProps.bg_color} ${newProps.text_color}
       flex flex-col border-[.5px] border-slate-200 rounded-md shadow-md`}
    >
      {/* Card Body */}
      <section className="w-full flex items-start py-4 px-4 justify-start h-full min-h-[60%]">
        <div className="w-full flex flex-col items-start gap-2">
          <h3 className="font-bold">{newProps.title}</h3>
          <span className="flex items-center gap-2 font-black">
            {dashboardCardIsLoading ? (
              <Loading size={4} />
            ) : (
              formatFunds(newProps.amount)
            )}

            <p className={`${newProps.funds ? 'flex' : 'hidden'}`}>RWF</p>
          </span>
        </div>
        {/* <figure className="p-1 bg-slate-200 rounded-md shadow-md h-full flex justify-start">
          <FontAwesomeIcon
            className="text-black cursor-pointer w-6 h-6"
            icon={newProps.funds ? faMoneyBill : faHouse}
          />
        </figure> */}
      </section>

      {/* Footer */}
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
          value="View"
          className="ml-4 text-[12px]"
          onClick={(e) => {
            e.preventDefault()
            setShowModal(true)
          }}
        />
        {/* {showModal && (
          <CustomDialog
            size="xl"
            headerBgColor={newProps.bg_color}
            headerTxtColor={newProps.text_color}
            title={newProps.title}
            onClose={() => setShowModal(false)}
          >
            {newProps.route?.includes('Households') ? (
              <HouseHoldsReports />
            ) : (
              <TransactionsReports />
            )}
          </CustomDialog>
        )} */}
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
      </section>
    </article>
  )
}

DashboardCard.propTypes = {
  props: PropTypes.object,
}

export default DashboardCard
