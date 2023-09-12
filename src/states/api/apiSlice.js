import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { LOCAL_API_URL } from '../../constants'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: LOCAL_API_URL,
    prepareHeaders: (headers) => {
      // eslint-disable-next-line no-undef
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', token)
      }
      return headers
    }
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
          url: `/${department}/${route}/?departmentId=${departmentId}&page=${
            page || 0
          }&size=${size || 20}`,
        }),
      }),
      getHouseholdsList: builder.query({
        query: ({ department, departmentId, page, size, route, ubudehe }) => {
          if (route === '') {
            return {
              url: `/${department}/households/?departmentId=${departmentId}&page=${
                page || 0
              }&size=${size || 20}`
            }
          }
          else if (route === 'ubudehe') {
            return {
              url: `/${department}/households/ubudehe/?departmentId=${departmentId}&page=${
                page || 0
              }&size=${size || 20}&ubudehe=${ubudehe}`
            }
          }
          else {
            return {
              url: `/${department}/households/${route}/?departmentId=${departmentId}&page=${
                page || 0
              }&size=${size || 20}&ubudehe=${ubudehe}`
            }
          }
        }
      }),
      createHouseHold: builder.mutation({
        query: ({ name, ubudehe, nid, phone1, phone2, province, district, sector, cell, village }) => ({
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
            url: `/department/sector/${id}/villages/?page=${page || 0}&size=${
              size || 20
            }`,
            method: 'GET',
          }
        },
      }),
      getCellVillages: builder.query({
        query: ({ id, size, page }) => {
          return {
            url: `/department/cell/${id}/villages/?page=${page || 0}&size=${
              size || 20
            }`,
            method: 'GET',
          }
        },
      }),
      getDistrictCells: builder.query({
        query: ({ id, page, size }) => {
          return {
            url: `/department/district/${id}/cells/?page=${page || 0}&size=${
              size || 20
            }`,
            method: 'GET',
          }
        },
      }),
      getCountryDistricts: builder.query({
        query: ({ id, page, size }) => {
          return {
            url: `/department/country/${id}/districts/?page=${page || 0}&size=${
              size || 20
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
          url: `/staff/${department}/${departmentId}?page=${page || 0}&size=${
            size || 20
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
      recordOfflinePayment: builder.mutation({
        query: ({ service, amount, month_paid, agent, household }) => ({
          url: '/transactions/offline',
          method: 'POST',
          body: {
            service,
            amount,
            month_paid,
            agent,
            household,
          },
        }),
      }),
      getSectorStaffTotalCollectionsByMonth: builder.query({
        query: ({ departmentId, month }) => {
          return {
            url: `/sector/staffsCollections/list/?departmentId=${departmentId}&month=${month}`,
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
          url: `/department/district/${id}/sectors/?page=${page || 0}&size=${
            size || 20
          }`,
          method: 'GET',
        }),
      }),
      getSectorCells: builder.query({
        query: ({ id, page, size }) => ({
          url: `/department/sector/${id}/cells/?page=${page || 0}&size=${
            size || 20
          }`,
          method: 'GET',
        }),
      }),
      moveHousehold: builder.mutation({
        query: ({ name, ubudehe, nid, phone1, phone2, province, district, sector, cell, village, existingHouseholdId }) => ({
          url: `/households/${existingHouseholdId}/move`,
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
        query: ({ name, ubudehe, nid, phone1, phone2, province, district, sector, cell, village }) => ({
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
    }
  }
})

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useLazyDashboardCardQuery,
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
  useLazyGetSectorStaffTotalCollectionsByMonthQuery,
  useLazyGetHouseHoldDetailsQuery,
  useLazyGetSingleStaffDetailsQuery,
  useCreateAdminMutation,
  useLazyGetHouseholdTransactionsByMonthPaidQuery,
  useUpdateStaffDetailsMutation,
  useLazyGetHouseholdDepartmentsQuery,
  useUpdateAdminStatusMutation,
  useRecordOfflinePaymentMutation,
  useLazyGetProvinceChildrenQuery,
  useLazyGetDistrictChildrenQuery,
  useLazyGetSectorChildrenQuery,
  useLazyGetCellChildrenQuery,
  useLazyGetCountryChildrenQuery,
  useLazyGetDistrictSectorsQuery,
  useLazyGetSectorCellsQuery,
  useMoveHouseholdMutation,
  useCreateDuplicateHouseHoldMutation
} = apiSlice
