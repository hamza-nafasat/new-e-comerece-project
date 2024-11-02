import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CategoriesResponseTypes,
  DeleteSingleProductData,
  HighestPriceResponse,
  NewProductDataTypes,
  ProductsResponseTypes,
  SearchProductsQueryTypes,
  SearchProductsTypes,
  SingleProductResponse,
  UpdateSingleProductData,
  addReviewsTypes,
  msgResponseTypes,
} from "../../types/api-types";

const backendServerUrl = import.meta.env.VITE_BACKEND_SERVER;

const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendServerUrl}/api/v1/products/`,
  }),
  tagTypes: ["products"],
  endpoints: (builder) => ({
    // 1
    latestProducts: builder.query<ProductsResponseTypes, string>({
      query: () => "latest",
      providesTags: ["products"],
    }),
    // 2
    highestPrice: builder.query<HighestPriceResponse, string>({
      query: () => "high-price",
      providesTags: ["products"],
    }),
    // 3
    allAdminProduct: builder.query<ProductsResponseTypes, string>({
      query: (id) => `admin-products?id=${id}`,
      providesTags: ["products"],
    }),
    // 4
    allCategories: builder.query<CategoriesResponseTypes, string>({
      query: () => `categories`,
      providesTags: ["products"],
    }),
    // 5
    allSearchProduct: builder.query<SearchProductsTypes, SearchProductsQueryTypes>({
      query: ({ category, page, price, search, sort, subCategory }) => {
        let base = `all-products?search=${search || ""}`;
        if (category) base += `&category=${category}`;
        if (page) base += `&page=${page}`;
        if (price) base += `&price=${price}`;
        if (sort) base += `&sort=${sort}`;
        if (subCategory) base += `&subCategory=${subCategory}`;
        return base;
      },
      providesTags: ["products"],
    }),
    // 6
    createNewProduct: builder.mutation<msgResponseTypes, NewProductDataTypes>({
      query: ({ id, formData }) => ({
        url: `new?id=${id}`,
        body: formData,
        method: "POST",
      }),
      invalidatesTags: ["products"],
    }),
    // 7
    singleProduct: builder.query<SingleProductResponse, string>({
      query: (id) => `single/${id}`,
      providesTags: ["products"],
    }),
    // 8
    updateSingleProduct: builder.mutation<msgResponseTypes, UpdateSingleProductData>({
      query: ({ formData, productId, userId }) => ({
        url: `single/${productId}?id=${userId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["products"],
    }),
    // 9
    deleteSingleProduct: builder.mutation<msgResponseTypes, DeleteSingleProductData>({
      query: ({ productId, userId }) => ({
        url: `single/${productId}?id=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products"],
    }),
    // 10
    deletePhotoFromProduct: builder.mutation<
      msgResponseTypes,
      { id: string; publicId: string; productId: string }
    >({
      query: ({ id, publicId, productId }) => ({
        url: `delete-photo?id=${id}&publicId=${publicId}&productId=${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products"],
    }),
    // 11
    addReview: builder.mutation<msgResponseTypes, addReviewsTypes>({
      query: ({ comment, productId, username, email, gender, rating, userId }) => ({
        url: `add-review?id=${userId}`,
        method: "POST",
        body: { comment, productId, username, email, gender, rating },
      }),
      invalidatesTags: ["products"],
    }),
  }),
});

export const {
  useLatestProductsQuery,
  useAllAdminProductQuery,
  useAllCategoriesQuery,
  useHighestPriceQuery,
  useAllSearchProductQuery,
  useCreateNewProductMutation,
  useSingleProductQuery,
  useUpdateSingleProductMutation,
  useDeleteSingleProductMutation,
  useDeletePhotoFromProductMutation,
  useAddReviewMutation,
} = productApi;
export default productApi;
