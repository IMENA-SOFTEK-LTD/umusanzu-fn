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
      dashboardCard: builder.query({
        query: ({ department, departmentId, route }) => ({
          url: `/${department}/${route}/?departmentId=${departmentId}`,
        }),
      }),
      //end point to get total household pays which take department_Id and ubudehe as query params
      getTotalHouseholdPays: builder.query({
        query: ({ departmentId, ubudehe }) => ({
          url: `agent/totalPays/?departmentId=${departmentId}&ubudehe=${ubudehe}`,
          method: 'GET',
        }),
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
          url: `/${department}`,
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
    }
  },
})

export const {
  useLoginMutation,
  useLazyDashboardCardQuery,
  useLazyGetTotalHouseholdPaysQuery,
} = apiSlice
