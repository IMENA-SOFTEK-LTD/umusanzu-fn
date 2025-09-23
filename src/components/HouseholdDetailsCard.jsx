import PropTypes from 'prop-types'
import { useLazyGetTotalHouseholdPaysQuery } from '../states/api/apiSlice'
import { faHouse, faMoneyBill } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useMemo } from 'react'
import Loading from './Loading'
import Button from './Button'

const HouseholdDetailsCard = ({
  props = {
    numberOfPays: 3,
    amount: 10000,
    isHousehold: true,
    numberofHouseholds: 189,
    istotalHouseholdsTarget: false,
    totalHouseholdsTarget: 1000000,
    user: {},
    index: 1,
  },
}) => {
  const [getTotalHouseholdPays, { data, isLoading }] =
    useLazyGetTotalHouseholdPaysQuery()

  /** Pick department route from level_id */
  const department = useMemo(() => {
    switch (props.user?.departments?.level_id) {
      case 1: return 'province'
      case 2: return 'district'
      case 3: return 'sector'
      case 4: return 'cell'
      case 5: return 'country'
      case 6: return 'agent'
      default: return 'agent'
    }
  }, [props.user?.departments?.level_id])

  /** Ubudehe value map by index */

  const ubudeheValues = [
  { index: 1, amount: 0 },
  { index: 2, amount: 500 },
  { index: 3, amount: 1000 },
  { index: 4, amount: 2000 },
  { index: 5, amount: 3000 },
  { index: 6, amount: 4000 },
  { index: 7, amount: 5000 },
  { index: 8, amount: 15000 },
  { index: 9, amount: 25000 },
]
const currentAmount = ubudeheValues.find(v => v.index === props.index)?.amount

  useEffect(() => {
    if (props.index && ubudeheValues.find(v => v.index === props.index) !== undefined) {
      getTotalHouseholdPays({
        departmentId: props?.user?.department_id,
        ubudehe: currentAmount,
       department,
      })
    }
  }, [props.index, props.user?.department_id, department, currentAmount])

  const numberOfPays = isLoading ? (
    <Loading />
  ) : (
    data?.data ?? props.numberOfPays
  )

  return (
    <article
      className="
        w-full 
        max-w-sm md:max-w-md lg:max-w-lg 
        h-full 
        max-h-[25rem] min-h-fit 
        flex flex-col 
        border border-slate-100 
        rounded-xl shadow-md 
        transition-transform duration-200 hover:scale-105
      "
    >
      <section className="w-full flex items-start py-6 px-4 justify-between min-h-[70%]">
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-2">
            <span>Number of pays:</span>
            <span className="text-slate-700 font-bold">{numberOfPays}</span>
          </div>
          <span className="text-lg font-black">{currentAmount}</span>
        </div>
        <figure className="p-2 bg-slate-200 rounded-md shadow-md flex items-center justify-center">
          <FontAwesomeIcon
            className="text-black w-6 h-6"
            icon={props.isHousehold ? faHouse : faMoneyBill}
          />
        </figure>
      </section>
      <section className="border-t bg-slate-200 flex w-full items-center justify-between p-2 px-4">
        <Button
          value="View more"
          route={`/households/?query=ubudehe&ubudehe=${currentAmount}`}
        />
      </section>
    </article>
  )
}

HouseholdDetailsCard.propTypes = {
  props: PropTypes.shape({
    index: PropTypes.number,
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