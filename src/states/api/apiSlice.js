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
    }
  },
})

export const { useLoginMutation, useLazyDashboardCardQuery } = apiSlice;