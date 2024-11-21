import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  BannerDataResponse,
  BarChartResponse,
  DashboardStatsResponse,
  LineChartResponse,
  msgResponseTypes,
  PieChartResponse,
} from "../../types/api-types";

const backendServerUrl = import.meta.env.VITE_BACKEND_SERVER;

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendServerUrl}/api/v1/admin`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // 1. dashboard stats
    dashboardStats: builder.query<DashboardStatsResponse, string>({
      query: (id) => `dashboard/stats?id=${id}`,
      keepUnusedDataFor: 0,
    }),
    // 2. pie charts
    pieChartState: builder.query<PieChartResponse, string>({
      query: (id) => `charts/pie?id=${id}`,
      keepUnusedDataFor: 0,
    }),
    // 3. line charts
    lineChartState: builder.query<LineChartResponse, string>({
      query: (id) => `charts/line?id=${id}`,
      keepUnusedDataFor: 0,
    }),
    // 4. bar charts
    barChartState: builder.query<BarChartResponse, string>({
      query: (id) => `charts/bar?id=${id}`,
      keepUnusedDataFor: 0,
    }),
    // 5 add new banner
    addOrUpdateBanner: builder.mutation<msgResponseTypes, { formData: FormData; id: string }>({
      query: ({ formData, id }) => ({
        url: `banner?id=${id}`,
        method: "POST",
        body: formData,
      }),
    }),
    getBanner: builder.query<BannerDataResponse, string>({
      query: () => `banner`,
    }),
  }),
});

export const {
  useDashboardStatsQuery,
  usePieChartStateQuery,
  useLineChartStateQuery,
  useBarChartStateQuery,
  useAddOrUpdateBannerMutation,
  useGetBannerQuery,
} = adminApi;
