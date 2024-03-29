import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import API_URL from '../../constants'
import { toast } from 'react-toastify';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logOut } from '../../utils/User';

const showToast = (message) => {
  toast.error(message, { position: toast.POSITION.TOP_RIGHT });
};

export const rtkQueryErrorLogger = (api) => (next) => (action) => {

  if (isRejectedWithValue(action)) {
    if (action.payload && action.payload.status === 401) {
      setTimeout(() => {
        logOut();
        location.reload()
      }, 5000)
    } else if (action.payload && action.payload.status !== 200 && action.payload.status !== 500) {
      showToast(action?.payload?.data?.message)
    } else if (action.payload && action.payload.status === 500) {
      showToast("An error occured! Try Again.")
    }
  }

  return next(action);
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({

    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => {
    return {
      login: builder.mutation({
        query: ({ username, password }) => ({
          url: '/auth/login',
          method: 'POST',
          body: {
            username,
            password,
          },
        }),
      }),
      verifyOtp: builder.mutation({
        query: ({ username, code }) => ({
          url: `/auth/login/verify?code=${code}&username=${username}`,
          method: 'POST',
        }),
      }),

      dashboardCard: builder.query({
        query: ({ department, departmentId, route }) => ({
          url: `/${department}/${route}/?departmentId=${departmentId}`,
        }),
      }),
      getTotalHouseholdPays: builder.query({
        query: ({ departmentId, ubudehe, route }) => ({
          url: `${route}/totalPays/?departmentId=${departmentId}&ubudehe=${ubudehe}`,
          method: 'GET',
        }),
      }),
      updateUserProfile: builder.mutation({
        query: ({
          id,
          names,
          email,
          phone1,
          phone2,
          departmentId,
          route,
          username,
        }) => ({
          url: `/userProfile/${route}/${id}/?departmentId=${departmentId}`,
          method: 'PUT',
          body: { names, email, phone1, phone2, username },
        }),
      }),

      updateAdminStatus: builder.mutation({
        query: ({ id, status, route }) => ({
          url: `/${route}/status/${id}`,
          method: 'PUT',
          body: { status },
        }),
      }),

      deleteAdmin: builder.mutation({
        query: ({ id, route }) => ({
          url: `/${route}/admin/is_deleted/${id}`,
          method: 'PUT',
        }),
      }),

      updatePassword: builder.mutation({
        query: ({ id, departmentId, oldPassword, newPassword }) => ({
          url: `/userProfile/password/${id}/?departmentId=${departmentId}`,
          method: 'PUT',
          body: { oldPassword, newPassword },
        }),
      }),

      createAdmin: builder.mutation({
        query: ({
          route,
          levelId,
          departmentId,
          names,
          username,
          password,
          phone1,
          email,
          phone2,
          nid,
          staff_role,
          department_id,
          status,
        }) => ({
          url: `${route}/Admin/?departmentId=${departmentId}&levelId=${levelId}`,
          method: 'POST',
          body: {
            names,
            username,
            password,
            phone1,
            email,
            phone2,
            nid,
            staff_role,
            department_id,
            status,
          },
        }),
      }),
      getUserProfile: builder.query({
        query: ({ id, departmentId }) =>
          `userProfile/${id}?departmentId=${departmentId}`,
      }),
      createDepartment: builder.mutation({
        query: ({
          name,
          merchant_code,
          department_id,
          level_id,
          phone1,
          phone2,
          email,
          department,
        }) => ({
          url: `/department/${department}`,
          method: 'POST',
          body: {
            name,
            merchant_code,
            department_id,
            level_id,
            phone1,
            phone2,
            email,
          },
        }),
      }),
      getTransactionsList: builder.query({
        query: ({ department, departmentId, route, page, size }) => ({
          url: `/${department}/${route}/?departmentId=${departmentId}&page=${page || 0
            }&size=${size || 20}`,
        }),
      }),
      getHouseholdsList: builder.query({
        query: ({ department, departmentId, page, size, route, ubudehe, phone1 }) => {
          if (route === '') {
            return {
              url: `/${department}/households/?departmentId=${departmentId}&page=${page || 0
                }&size=${size || 20}`,
            }
          } else if (route === 'ubudehe') {
            return {
              url: `/${department}/households/ubudehe/?departmentId=${departmentId}&page=${page || 0
                }&size=${size || 20}&ubudehe=${ubudehe}`,
            }
          } else if (route === 'monthlyTargetList') {
            return {
              url: `/${department}/households/monthlyTargetList/?departmentId=${departmentId}&page=${page || 0
                }&size=${size || 20}`,
            }
          } else {
            return {
              url: `/${department}/households/${route}/?departmentId=${departmentId}&page=${page || 0
                }&size=${size || 20}&ubudehe=${ubudehe}&phone1=${phone1}`,
            }
          }
        },
      }),
      createHouseHold: builder.mutation({
        query: ({
          name,
          ubudehe,
          nid,
          phone1,
          phone2,
          province,
          district,
          sector,
          cell,
          village,
          type,
        }) => ({
          url: `/households`,
          method: 'POST',
          body: {
            name,
            ubudehe,
            nid,
            phone1,
            phone2,
            province,
            district,
            sector,
            cell,
            village,
            type,
          },
        }),
      }),
      createCell: builder.mutation({
        query: ({
          name,
          department_id,
          level_id,
          phone1,
          phone2,
          email,
          department,
        }) => ({
          url: `/department/${department}?departmentId=${department_id}`,
          method: 'POST',
          body: {
            name,
            level_id,
            phone1,
            phone2,
            email,
          },
        }),
      }),
      createDistrict: builder.mutation({
        query: ({
          name,
          departmentIid,
          level_id,
          phone1,
          phone2,
          email,
          department,
        }) => ({
          url: `/department/${department}?departmentId=${departmentIid}`,
          method: 'POST',
          body: {
            name,
            level_id,
            phone1,
            phone2,
            email,
          },
        }),
      }),
      getSectorVillages: builder.query({
        query: ({ id, page, size }) => {
          return {
            url: `/department/sector/${id}/children/?page=${page || 0}&size=${size || 20
              }`,
            method: 'GET',
          }
        },
      }),
      getCellVillages: builder.query({
        query: ({ id, size, page }) => {
          return {
            url: `/department/cell/${id}/villages/?page=${page || 0}&size=${size || 20
              }`,
            method: 'GET',
          }
        },
      }),
      getDistrictCells: builder.query({
        query: ({ id, page, size }) => {
          return {
            url: `/department/district/${id}/cells/?page=${page || 0}&size=${size || 20
              }`,
            method: 'GET',
          }
        },
      }),
      getCountryDistricts: builder.query({
        query: ({ id, page, size }) => {
          return {
            url: `/department/country/${id}/districts/?page=${page || 0}&size=${size || 20
              }`,
            method: 'GET',
          }
        },
      }),
      createAgent: builder.mutation({
        query: ({
          names,
          username,
          department_id,
          staff_role,
          nid,
          phone1,
          phone2,
          email,
          password,
        }) => {
          return {
            url: 'department/agent',
            method: 'POST',
            body: {
              names,
              username,
              department_id,
              staff_role,
              nid,
              phone1,
              phone2,
              email,
              password,
            },
          }
        },
      }),
      getStaff: builder.query({
        query: ({ department, departmentId, page, size }) => ({
          url: `/staff/${department}/${departmentId}?page=${page || 0}&size=${size || 20
            }`,
          method: 'GET',
        }),
      }),
      getHouseHoldDetails: builder.query({
        query: ({ id }) => ({
          url: `/households/${id}`,
          method: 'GET',
        }),
      }),
      getSingleStaffDetails: builder.query({
        query: ({ id }) => ({
          url: `/staff/${id}`,
          method: 'GET',
        }),
      }),
      updateStaffDetails: builder.mutation({
        query: ({ id, names, email, phone1, phone2, username }) => ({
          url: `/staff/${id}`,
          method: 'PATCH',
          body: { names, email, phone1, phone2, username },
        }),
      }),
      getHouseholdDepartments: builder.query({
        query: ({ id }) => ({
          url: `/households/${id}/departments`,
          method: 'GET',
        }),
      }),
      getSectorVillagesPerformance: builder.query({
        query: ({ departmentId, month }) => {
          return {
            url: `/sector/performance/villages/?departmentId=${departmentId}&month=${month}`,
            method: 'GET',
          }
        },
      }),
      getSingleSectorCommision: builder.query({
        query: ({ departmentId, month }) => {
          return {
            url: `/sector/${departmentId}/commission/?month=${month}`,
            method: 'GET',
          }
        },
      }),
      getSectorsCommissions: builder.query({
        query: ({ month }) => {
          return {
            url: `/sector/commission/?month=${month}`,
            method: 'GET',
          }
        },
      }),
      getHouseholdTransactionsByMonthPaid: builder.query({
        query: ({ departmentId, month }) => ({
          url: `/households/${departmentId}/transactions/?month=${month}`,
          method: 'GET',
        }),
      }),
      getCountryChildren: builder.query({
        query: () => ({
          url: `/department/country/children`,
          method: 'GET',
        }),
      }),
      getCountrySectors: builder.query({
        query: ({ page, size = 35 }) => ({
          url: `/department/country/sectors?page=${page || 0}&size=${size}`,
          method: 'GET',
        }),
      }),
      getProvinceChildren: builder.query({
        query: ({ departmentId }) => ({
          url: `/department/province/${departmentId}/children`,
          method: 'GET',
        }),
      }),
      getDistrictChildren: builder.query({
        query: ({ departmentId }) => ({
          url: `/department/district/${departmentId}/children`,
          method: 'GET',
        }),
      }),
      getSectorChildren: builder.query({
        query: ({ departmentId }) => ({
          url: `/department/sector/${departmentId}/children`,
          method: 'GET',
        }),
      }),
      getCellChildren: builder.query({
        query: ({ departmentId }) => ({
          url: `/department/cell/${departmentId}/children`,
          method: 'GET',
        }),
      }),
      getDistrictSectors: builder.query({
        query: ({ id, page, size }) => ({
          url: `/department/district/${id}/sectors/?page=${page || 0}&size=${size || 20
            }`,
          method: 'GET',
        }),
      }),
      getSectorCells: builder.query({
        query: ({ id, page, size }) => ({
          url: `/department/sector/${id}/cells/?page=${page || 0}&size=${size || 20
            }`,
          method: 'GET',
        }),
      }),
      moveHousehold: builder.mutation({
        query: ({
          name,
          ubudehe,
          nid,
          phone1,
          phone2,
          province,
          district,
          sector,
          cell,
          village,
          existingHouseholdId,
        }) => ({
          url: `/households/${existingHouseholdId}/move/approve`,
          method: 'PATCH',
          body: {
            name,
            ubudehe,
            nid,
            phone1,
            phone2,
            province,
            district,
            sector,
            cell,
            village,
          },
        }),
      }),
      createDuplicateHouseHold: builder.mutation({
        query: ({
          name,
          ubudehe,
          nid,
          phone1,
          phone2,
          province,
          district,
          sector,
          cell,
          village,
        }) => ({
          url: `/households/create/duplicate`,
          method: 'POST',
          body: {
            name,
            ubudehe,
            nid,
            phone1,
            phone2,
            province,
            district,
            sector,
            cell,
            village,
          },
        }),
      }),
      logActivities: builder.query({
        query: ({ staffId }) => ({
          url: `/activities/${staffId}`,
          method: 'GET',
        }),
      }),
      createPaymentSession: builder.mutation({
        query: ({
          total_month_paid,
          lang,
          household_id,
          payment_phone,
          month_paid,
          payment_method,
          agent,
        }) => ({
          url: `/payment/session/production`,
          method: 'POST',
          body: {
            total_month_paid,
            lang,
            household_id,
            payment_phone,
            month_paid,
            payment_method,
            agent,
          },
        }),
      }),
      updateHousehold: builder.mutation({
        query: ({ name, nid, phone1, phone2, ubudehe, id, type }) => ({
          url: `/households/${id}`,
          method: 'PATCH',
          body: {
            name,
            nid,
            phone1,
            phone2,
            ubudehe,
            type,
          },
        }),
      }),
      updateHouseholdStatus: builder.mutation({
        query: ({ id, status }) => ({
          url: `/households/${id}/status`,
          method: 'PATCH',
          body: {
            status,
          },
        }),
      }),
      deleteTransaction: builder.mutation({
        query: ({ id }) => ({
          url: `/transactions/${id}`,
          method: 'DELETE',
        }),
      }),
      getDepartmentProfile: builder.query({
        query: ({ id }) => ({
          url: `/department/${id}`,
          method: 'GET',
        }),
      }),
      updateDepartmentProfile: builder.mutation({
        query: ({
          id,
          merchant_code,
          phone1,
          phone2,
          email,
          leader_name,
          account_bank,
          account_name,
          service_offer,
          leader_title,
        }) => ({
          url: `/department/${id}`,
          method: 'PUT',
          body: {
            merchant_code,
            phone1,
            phone2,
            email,
            leader_name,
            account_bank,
            account_name,
            service_offer,
            leader_title,
          },
        }),
      }),
      getSingleTransaction: builder.query({
        query: ({ id }) => ({
          url: `/transactions/${id}`,
          method: 'GET',
        }),
      }),
      uploadDepartmentInfoStamp: builder.mutation({
        query: ({ image, department }) => ({
          url: `/departmentInfo/stamps/upload`,
          method: 'POST',
          body: { image, department },
        }),
      }),
      searchHousehold: builder.query({
        query: ({ search, page, size, departmentId, department }) => ({
          url: `/${department}/search/households?search=${search}&page=${page || 0
            }&size=${size || 50}&departmentId=${departmentId || 0}`,
          method: 'GET',
        }),
      }),
      getReceipt: builder.query({
        query: ({ id, start_month, end_month, request }) => ({
          url: `/households/${id}/${request}`,
          method: 'POST',
          body: { start_month, end_month },
        }),
      }),
      getSectorDetails: builder.query({
        query: ({ id }) => ({
          url: `/department/sector/${id}`,
          method: 'GET',
        }),
      }),
      getInitiatedTransactions: builder.query({
        query: ({ staffId }) => ({
          url: `/agent/transactions/initiated/?staffId=${staffId}`,
        }),
      }),
      getDepartmentPerformances: builder.query({
        query: ({ department, month, departmentId }) => ({
          url: `/${department}/performance/?month=${month}&departmentId=${departmentId}`,
        }),
      }),
      cancelMoveHousehold: builder.mutation({
        query: ({ id }) => ({
          url: `/households/${id}/move/cancel`,
          method: 'PATCH',
        }),
      }),
      requestMoveHousehold: builder.mutation({
        query: ({ id }) => ({
          url: `/households/${id}/move/request`,
          method: 'PATCH',
        })
      }),
      getPaymentsChartInfo: builder.query({
        query: ({ week, month, year }) => ({
          url: `/payment/chartinfo?week=${week}&month=${month}&year=${year}`
        }),
      }),
      // COMPLETE PENDING PAYMENT
      completePendingPayment: builder.mutation({
        query: ({ id, payment_phone }) => ({
          url: `/payment/${id}/pending/complete`,
          method: 'POST',
          body: { payment_phone },
        }),
      }),
      // GET PAYMENT DETAILS
      getPaymentDetails: builder.query({
        query: ({ id }) => ({
          url: `/payment/${id}`,
          method: 'GET',
        }),
      }),
      // DELETE PAYMENT
      deletePayment: builder.mutation({
        query: ({ id }) => ({
          url: `/payment/${id}`,
          method: 'DELETE',
        }),
      }),
      // RECORD OFFLINE PAYMENT
      recordOfflinePayment: builder.mutation({
        query: ({
          service,
          amount,
          month_paid,
          agent,
          household_id,
          sms_phone,
        }) => ({
          url: `/payment/offline?household_id=${household_id}`,
          method: 'POST',
          body: {
            service,
            amount,
            month_paid,
            agent,
            sms_phone,
          },
        }),
      }),
      // GET PAYMENTS
      getPayments: builder.query({
        query: ({ page, size, status }) => ({
          url: `/payment?page=${page || 0}&size=${size || 20}&status=${status}`,
          method: 'GET',
        }),
      }),
      // COMPLETE INITIATED PAYMENTS
      completeInitiatedPayments: builder.mutation({
        query: ({ totalAmount, payment_phone, staffId, payment_ids }) => ({
          url: `/payment/initiated/complete?staffId=${staffId}`,
          method: 'POST',
          body: { payment_phone, payment_ids, totalAmount },
        }),
      }),
      // RECORD MULTIPLE PAYMENTS
      recordMultiplePayments: builder.mutation({
        query: ({ payment_phone, agent, household_id, start_month, end_month }) => ({
          url: `/payment/advance/?household_id=${household_id}`,
          method: 'POST',
          body: { payment_phone, agent, start_month, end_month },
        }),
      }),
      // EDIT PAYMENT
      editPayment: builder.mutation({
        query: ({ id, month_paid, amount, agent, status }) => ({
          url: `/payment/${id}`,
          method: 'PATCH',
          body: { month_paid, amount, agent, status },
        }),
      }),
      // LIST DEPARTMENTS
      listDepartments: builder.query({
        query: ({ level_id }) => ({
          url: `/department?level_id=${level_id}`,
          method: 'GET',
        }),
      }),
      // CREATE ADMIN
      createStaffAdmin: builder.mutation({
        query: ({ names, username, phone1, phone2, staff_role, department_id, email, password }) => ({
          url: `/staff/?department_id=${department_id}`,
          method: 'POST',
          body: { names, username, phone1, phone2, staff_role, email, password },
        }),
      }),
    }
  },
})

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useLazyDashboardCardQuery,
  useLazyLogActivitiesQuery,
  useLazyGetTotalHouseholdPaysQuery,
  useUpdateUserProfileMutation,
  useLazyGetUserProfileQuery,
  useLazyGetTransactionsListQuery,
  useLazyGetHouseholdsListQuery,
  useCreateDepartmentMutation,
  useCreateHouseHoldMutation,
  useCreateCellMutation,
  useCreateDistrictMutation,
  useLazyGetSectorVillagesQuery,
  useCreateAgentMutation,
  useLazyGetCellVillagesQuery,
  useLazyGetDistrictCellsQuery,
  useLazyGetCountryDistrictsQuery,
  useUpdatePasswordMutation,
  useLazyGetStaffQuery,
  useLazyGetSectorVillagesPerformanceQuery,
  useLazyGetHouseHoldDetailsQuery,
  useLazyGetSingleStaffDetailsQuery,
  useCreateAdminMutation,
  useLazyGetHouseholdTransactionsByMonthPaidQuery,
  useUpdateStaffDetailsMutation,
  useLazyGetHouseholdDepartmentsQuery,
  useUpdateAdminStatusMutation,
  useDeleteAdminMutation,
  useRecordOfflinePaymentMutation,
  useLazyGetProvinceChildrenQuery,
  useLazyGetDistrictChildrenQuery,
  useLazyGetSectorChildrenQuery,
  useCreatePaymentSessionMutation,
  useLazyGetCellChildrenQuery,
  useLazyGetCountryChildrenQuery,
  useLazyGetCountrySectorsQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
  useMoveHouseholdMutation,
  useCreateDuplicateHouseHoldMutation,
  useUpdateHouseholdMutation,
  useUpdateHouseholdStatusMutation,
  useDeleteTransactionMutation,
  useLazyGetSingleTransactionQuery,
  useLazyGetDepartmentProfileQuery,
  useUpdateDepartmentProfileMutation,
  useUploadDepartmentInfoStampMutation,
  useLazySearchHouseholdQuery,
  useLazyGetReceiptQuery,
  useLazyGetDepartmentPerformancesQuery,
  useLazyGetSectorDetailsQuery,
  useLazyGetInitiatedTransactionsQuery,
  useCompleteInitiatedPaymentsMutation,
  useLazyGetSectorsCommissionsQuery,
  useLazyGetSingleSectorCommisionQuery,
  useCancelMoveHouseholdMutation,
  useRequestMoveHouseholdMutation,
  useGetPaymentsChartInfoQuery,
  useCompletePendingPaymentMutation,
  useLazyGetPaymentDetailsQuery,
  useDeletePaymentMutation,
  useLazyGetPaymentsQuery,
  useRecordMultiplePaymentsMutation,
  useEditPaymentMutation,
  useLazyListDepartmentsQuery,
  useCreateStaffAdminMutation
} = apiSlice
