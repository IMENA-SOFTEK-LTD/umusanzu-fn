import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useLazyGetTotalHouseholdPaysQuery } from '../states/api/apiSlice'
import {
  faArrowUpRightFromSquare,
  faSeedling,
  faHandHoldingDollar,
  faSackDollar,
  faWallet,
  faPiggyBank,
  faMoneyBill,
  faUsers,
  faUserGroup,
  faHouse,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useMemo } from 'react'
import Loading from './Loading'
import formatFunds from '../utils/Funds'

const ubudeheMeta = {
  1: {
    label: 'Ubudehe Tier 1',
    subtitle: 'Foundation support tier households',
    icon: faSeedling,
    iconBg: 'bg-emerald-100 text-emerald-600',
    pillBg: 'bg-emerald-50 text-emerald-700',
    variant: 'primary',
  },
  2: {
    label: 'Ubudehe Tier 2',
    subtitle: 'Emerging stability households',
    icon: faHandHoldingDollar,
    iconBg: 'bg-sky-100 text-sky-600',
    pillBg: 'bg-sky-50 text-sky-700',
  },
  3: {
    label: 'Ubudehe Tier 3',
    subtitle: 'Growing financial resilience',
    icon: faSackDollar,
    iconBg: 'bg-lime-100 text-lime-600',
    pillBg: 'bg-lime-50 text-lime-700',
  },
  4: {
    label: 'Ubudehe Tier 4',
    subtitle: 'Established income households',
    icon: faWallet,
    iconBg: 'bg-amber-100 text-amber-600',
    pillBg: 'bg-amber-50 text-amber-700',
  },
  5: {
    label: 'Ubudehe Tier 5',
    subtitle: 'Growing savings engagement',
    icon: faPiggyBank,
    iconBg: 'bg-rose-100 text-rose-600',
    pillBg: 'bg-rose-50 text-rose-700',
  },
  6: {
    label: 'Ubudehe Tier 6',
    subtitle: 'Advanced contribution households',
    icon: faMoneyBill,
    iconBg: 'bg-cyan-100 text-cyan-600',
    pillBg: 'bg-cyan-50 text-cyan-700',
  },
  7: {
    label: 'Ubudehe Tier 7',
    subtitle: 'Community leaders segment',
    icon: faUsers,
    iconBg: 'bg-indigo-100 text-indigo-600',
    pillBg: 'bg-indigo-50 text-indigo-700',
  },
  8: {
    label: 'Ubudehe Tier 8',
    subtitle: 'High growth participants',
    icon: faUserGroup,
    iconBg: 'bg-purple-100 text-purple-600',
    pillBg: 'bg-purple-50 text-purple-700',
  },
  9: {
    label: 'Ubudehe Tier 9',
    subtitle: 'Premium household cluster',
    icon: faHouse,
    iconBg: 'bg-slate-100 text-slate-700',
    pillBg: 'bg-slate-200 text-slate-700',
  },
}

const DEFAULT_META = {
  label: 'Ubudehe Tier',
  subtitle: 'Household contribution bracket',
  icon: faSeedling,
  iconBg: 'bg-primary/10 text-primary',
  pillBg: 'bg-slate-100 text-slate-600',
  variant: 'neutral',
}

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
  { index: 1, amount: 500 },
  { index: 2, amount: 1000 },
  { index: 3, amount: 1500 },
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

  const numberOfPays = data?.data ?? props.numberOfPays
  const totalMonthPaid = data?.total_month_paid ?? data?.data?.total_month_paid ?? 0
  const paysDisplay = isLoading ? <Loading size={4} /> : numberOfPays
  const totalPaidDisplay = isLoading ? <Loading size={4} /> : formatFunds(totalMonthPaid)

  const meta = ubudeheMeta[props.index] || DEFAULT_META
  const variant = 'primary'//meta.variant || (props.index === 1 ? 'primary' : 'neutral')

  const cardClasses = `relative overflow-hidden rounded-3xl border transition-all duration-300 ${
    variant === 'primary'
      ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl hover:shadow-2xl border-primary/40 hover:border-primary/60'
      : 'bg-white text-slate-900 border-slate-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40'
  }`

  const iconBgClass = meta.iconBg ||
    (variant === 'primary' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary')
  const iconWrapperClasses = `flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBgClass}`
  const labelColor = variant === 'primary' ? 'text-white/85' : 'text-slate-500'
  const valueColor = variant === 'primary' ? 'text-white' : 'text-slate-900'
  const mutedTextColor = variant === 'primary' ? 'text-white/70' : 'text-slate-500'

  const pillClasses = `${
    meta.pillBg || (variant === 'primary' ? 'bg-white/15 text-white/85' : 'bg-slate-100 text-slate-600')
  } rounded-full px-3 py-1 text-xs font-semibold`

  const amountValue = formatFunds(currentAmount || 0)
  const viewRoute = `/households/?query=ubudehe&ubudehe=${currentAmount}`
  const viewButtonClasses = `${
    variant === 'primary'
      ? 'border-white/40 text-white hover:bg-white/15'
      : 'border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
  } flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200`

  return (
    <article className={cardClasses}>
      <div className="flex h-full flex-col gap-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={iconWrapperClasses}>
              <FontAwesomeIcon icon={meta.icon} className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
                {meta.label}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold tracking-tight ${valueColor}`}>
                  {amountValue}
                </span>
                <span className={`text-xs font-semibold ${mutedTextColor}`}>RWF</span>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${mutedTextColor}`}>
                {meta.subtitle}
              </p>
            </div>
          </div>
          <Link
            to={viewRoute}
            className={`${viewButtonClasses} hover:scale-105`}
            aria-label={`View details for ${meta.label}`}
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedTextColor}`}>
                Number of pays
              </p>
              <p className={`mt-1 text-lg font-semibold ${valueColor}`}>
                {paysDisplay}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedTextColor}`}>
                Total month paid
              </p>
              <div className="mt-1 flex items-baseline justify-end gap-1">
                <p className={`text-lg font-semibold ${valueColor}`}>
                  {totalPaidDisplay}
                </p>
                <span className={`text-xs font-medium ${mutedTextColor}`}>RWF</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <span className={pillClasses}>{meta.label}</span>
          </div>
        </div>
      </div>
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