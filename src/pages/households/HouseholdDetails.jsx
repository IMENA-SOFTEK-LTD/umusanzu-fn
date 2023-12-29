import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import HouseholdInfo from '../../containers/households/HouseholdInfo';
import { useLazyGetHouseHoldDetailsQuery } from '../../states/api/apiSlice';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { setHousehold } from '../../states/features/modals/householdSlice';
import Loading from '../../components/Loading';
import HouseholdPayments from '../../containers/households/HouseholdPayments';
import RecordPaymentModel from '../../components/models/RecordPaymentModel';

const HouseholdDetails = () => {

    // PARAMS
    const { id } = useParams();

    // GET HOUSEHOLD BY ID
    const [getHouseholdDetails, {
        data: householdDetails,
        isLoading: householdDetailsLoading,
        isSuccess: householdDetailsSuccess,
        isError: householdDetailsError,
    }] = useLazyGetHouseHoldDetailsQuery()

    // GET HOUSEHOLD REQUEST
    useEffect(() => {
      getHouseholdDetails({ id })
    }, [id])

    // STATE VARIABLES
    const { user } = useSelector((state) => state.auth);
    const { household } = useSelector((state) => state.household);
    const dispatch = useDispatch();

    // HANDLE GET HOUSEHOLD DETAILS
   useEffect(() => {
    if (householdDetailsSuccess) {
      dispatch(setHousehold(householdDetails?.data || []))
    } else if (householdDetailsError) {
      toast.error('Could not get household details. Please try again later.')
    }
   }, [householdDetailsSuccess, householdDetails])

  return (
    <main className="p-4 flex flex-col w-full items-center">
      {householdDetailsLoading && (
        <span className="flex items-center justify-center min-h-[70vh]">
          <Loading />
        </span>
      )}
      {householdDetailsSuccess && household && (
        <section className="flex flex-col w-full gap-2">
          {user?.departments.level_id > 5 && (
            <section className="flex flex-col gap-2 md:flex-row items-center md:gap-2 px-4 mt-20 md:mt-0">
              <RecordPaymentModel
                household={household}
                className="mb-2 md:mb-0"
              />
            </section>
          )}
          <span className='flex w-full gap-6 items-start'>
          <HouseholdPayments household={household} />
          <HouseholdInfo household={household} />
          </span>
        </section>
      )}
    </main>
  )
}

export default HouseholdDetails;
