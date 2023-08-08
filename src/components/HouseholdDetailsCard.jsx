import PropTypes from 'prop-types'
import { useLazyGetTotalHouseholdPaysQuery } from '../states/api/apiSlice'
import {
  faArrowDown,
  faArrowUp,
  faHouse,
  faMoneyBill,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react'
import Loading from './Loading'

const HouseholdDetailsCard = ({
  props = {
    numberOfPays: 3,
    amount: 10000,
    isHousehold: true,
    numberofHouseholds: 189,
    istotalHouseholdsTarget: false,
    totalHouseholdsTarget: 1000000,
    user: {},
  },
}) => {
  let newProps = { ...props }

  const [getTotalHouseholdPays, { data, isLoading, isError, isSuccess }] =
    useLazyGetTotalHouseholdPaysQuery()

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
        amount: 5000,
        isHousehold:true,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 5000,
          route: department,
        })
      }, [])
      break
    case 2:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 3000,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 3000,
          route: department,
        })
      }, [])
      break
    case 3:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 2000,
        isHousehold: true,
      }

      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 2000,
          route: department,
        })
      }, [])
      break
    case 4:
      newProps = {
        ...props,
        numberOfPays:isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 15000,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 15000,
          route: department,
        })
      }, [])
      break
    case 5:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 500,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 500,
          route: department,
        })
      }, [])
      break
    case 6:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 0,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 0,
          route: department,
        })
      }, [])
      break
    case 7:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 1000,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 1000,
          route: department,
        })
      }, [])
      break
    case 8:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 4000,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 4000,
          route: department,
        })
      }, [])
      break
    case 9:
      newProps = {
        ...props,
        numberOfPays: isLoading ? <Loading /> : data?.data[0]?.totalagentPays,
        amount: 25000,
        isHousehold: true,
      }
      useEffect(() => {
        getTotalHouseholdPays({
          departmentId: props?.user?.department_id,
          ubudehe: 500,
          route: department,
        })
      }, [])
      break
    default:
      newProps = { ...newProps }
  }

  
  return (
    <article
      className={`w-full max-w-[20rem] h-full max-h-[25rem] min-h-fit flex flex-col w-min-fit border-[.5px] border-slate-100 rounded-xl shadow-md ease-in-out duration-200 hover:scale-[1.01]`}
    >
      <section className="w-full flex items-start py-6 px-4 justify-start h-full min-h-[70%]">
        <div className="w-full flex flex-col items-start gap-4">
          <div className="flex flex-row">
            <div>Number of pays: </div>
            <div className="text-slate-700 text-[1rem] font-bold">
              {newProps.numberOfPays}
            </div>
          </div>
          <span className="text-[18px] w-full flex items-center gap-2 font-black">
            <p>{newProps.amount}</p>
          </span>
        </div>
        <figure className="p-1 bg-slate-200 rounded-md shadow-md h-full flex justify-start">
          <FontAwesomeIcon
            className="text-black cursor-pointer w-6 h-6"
            icon={newProps.isHousehold ? faHouse : faMoneyBill}
          />
        </figure>
      </section>
      <section className="border-t-[1px] bg-slate-200 flex w-full items-center justify-between p-2 px-4 ">
        <button className="p-2 px-4 rounded-sm shadow-2xl ease-in-out duration-300 bg-slate-00 text-white text-[15px] hover:bg-accent hover:text-white bg-amber-600">
          View more
        </button>
      </section>
    </article>
  )
}

HouseholdDetailsCard.propTypes = {
  props: PropTypes.shape({
    props: PropTypes.object,
    numberOfPays: PropTypes.number,
    isHousehold: PropTypes.bool,
    istotalHouseholdsTarget: PropTypes.bool,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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

export default HouseholdDetailsCard
