import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { LOCAL_API_URL } from '../../constants'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: LOCAL_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', token)
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

      updatePassword: builder.mutation({
        query: ({ id, departmentId, oldPassword, newPassword }) => ({
          url: `/userProfile/password/${id}/?departmentId=${departmentId}`,
          method: 'PUT',
          body: { oldPassword, newPassword },
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
        query: ({ department, departmentId, page, size }) => ({
          url: `/${department}/households/?departmentId=${departmentId}&page=${
            page || 0
          }&size=${size || 20}`,
        }),
      }),
      createHouseHold: builder.mutation({
        query: ({ name, ubudehe, nid, phone1, phone2, departmentId }) => ({
          url: `/households/?departmentId=${departmentId}`,
          method: 'POST',
          body: {
            name,
            ubudehe,
            nid,
            phone1,
            phone2,
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
            url: `department/agent`,
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
    }
  },
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
} = apiSlice
