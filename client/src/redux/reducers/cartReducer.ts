import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CartReducerInitState } from "../../types/reducer-types";
import { CartItemType } from "../../types/types";

type RemoveFromCartPayload = {
  productId: string;
  color: string;
  size: string;
};
const initialState: CartReducerInitState = {
  isLoading: false,
  cartItem: [],
  total: 0,
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  shippingInfo: {
    contact: "",
    address: "",
    city: "",
    country: "",
    state: "",
  },
};

export const cartReducer = createSlice({
  name: "cartReducer",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItemType>) => {
      state.isLoading = true;
      // const index = state.cartItem.findIndex(
      //   (item) => item.productId === action.payload.productId
      // );
      // if (index !== -1) {
      //   throw Error("Product Already In Cart");
      // } else {
      state.cartItem = [...state.cartItem, action.payload];
      // }
      state.isLoading = false;
    },
    updateCart: (state, action: PayloadAction<CartItemType>) => {
      state.isLoading = true;
      const index = state.cartItem.findIndex((item) => item.productId === action.payload.productId);
      if (index !== -1) {
        state.cartItem[index].quantity = action.payload.quantity;
      }
      state.isLoading = false;
    },
    removeFromCart: (state, action: PayloadAction<RemoveFromCartPayload>) => {
      state.isLoading = true;
      state.cartItem = state.cartItem.filter((item) => {
        return (
          item.productId !== action.payload?.productId ||
          item?.colorDescription?.toLocaleLowerCase() !== action.payload?.color?.toLocaleLowerCase() ||
          item?.productSize?.toLocaleLowerCase() !== action.payload?.size?.toLocaleLowerCase()
        );
      });
      state.isLoading = false;
    },
    calculatePrise: (state) => {
      state.isLoading = true;
      state.subtotal = state.cartItem.reduce((acc, item) => acc + item.price * item.quantity, 0);
      state.shippingCharges = 200;
      state.total = state.subtotal + state.shippingCharges;
      state.isLoading = false;
    },
    discountApplied: (state, action: PayloadAction<number>) => {
      state.isLoading = true;
      state.discount = action.payload;
      if (state.discount === 0) {
        state.total = Number(state.subtotal) + Number(state.shippingCharges);
      } else {
        const discountAmount = (Number(state.subtotal) * state.discount) / 100;
        state.total = Number(state.subtotal) - discountAmount + Number(state.shippingCharges);
      }
      state.isLoading = false;
    },
    saveShippingInfo: (state, action: PayloadAction<CartReducerInitState["shippingInfo"]>) => {
      state.isLoading = true;
      state.shippingInfo = action.payload;
      state.isLoading = false;
    },
    resetCart: () => initialState,
  },
});

export const { addToCart, updateCart, removeFromCart, calculatePrise, discountApplied, saveShippingInfo, resetCart } =
  cartReducer.actions;
