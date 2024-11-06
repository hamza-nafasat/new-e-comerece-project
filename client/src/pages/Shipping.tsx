import axios from "axios";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../redux/api/orderApi";
import { resetCart } from "../redux/reducers/cartReducer";
import { backendServerUrl, StoreRootState } from "../redux/store/store";
import { NewOrderDateTypes } from "../types/types";
import { responseToast } from "../utils/features";

interface InitialState {
  address: string;
  state: string;
  city: string;
  country: string;
}
const initialState: InitialState = {
  address: "",
  state: "",
  city: "",
  country: "",
};

const Shipping = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: StoreRootState) => state.userReducer);
  const [shippingInfo, setShippingInfo] = useState<InitialState>(initialState);
  const [createOrder] = useCreateOrderMutation();
  const [loading, setIsLoading] = useState(false);

  const {
    subtotal,
    shippingCharges,
    total: totalAmount,
    discount,
    cartItem: cartItemSelected,
  } = useSelector((state: StoreRootState) => state.cartReducer);

  const inputOnChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault();
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (e: ChangeEvent<HTMLFormElement>) => {
    if (cartItemSelected?.length <= 0) return navigate("/cart");
    setIsLoading(true);
    e.preventDefault();
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country || !shippingInfo.state) {
      return toast.error("Please Enter Full Shipping info");
    }
    let subject = `One Order Placed By ${user?.name} and this user details are \n\n${JSON.stringify({
      name: user?.name,
      email: user?.email,
      gender: user?.gender,
    })}\n\n and Total Amount Details are \n\n${JSON.stringify({
      subtotal,
      shippingCharges,
      discount,
      totalAmount,
    })}\n\n and Shipping Info is \n\n${JSON.stringify(shippingInfo)}\n\nProducts He Selected are \n\n`;
    cartItemSelected.forEach((item, i) => {
      subject += `${i}== name-${item?.name} quantity-${item?.quantity} price-${item?.price} size-${item?.productSize} category-${item?.category} subCategory-${item?.subCategory} productId-${item?.productId} color-${item?.colorDescription}  \n\n`;
    });

    const newOrderData: NewOrderDateTypes = {
      userId: user?._id as string,
      subtotal,
      shippingCharges: shippingCharges,
      discount: discount,
      total: totalAmount,
      shippingInfo: shippingInfo,
      cartItem: cartItemSelected,
    };

    console.log("new Order data", newOrderData);

    try {
      const { data } = await axios.post(
        `${backendServerUrl}/api/v1/payments/create`,
        { adminEmail: import.meta.env.VITE_EMAIL, subject, clientEmail: user?.email },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!data) return toast.error("Some Error Occurred. Please Try Again Later");
      //  add order after success
      const res = await createOrder(newOrderData);
      dispatch(resetCart());
      responseToast(res, navigate, "/orders");
    } catch (error) {
      console.log(error);
      toast.error("Some Error Occurred. Please Try Again Later");
      setShippingInfo(initialState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shippingPage">
      <Link to={"/cart"} className="backBtn">
        <BiArrowBack />
      </Link>
      <form onSubmit={submitHandler}>
        <h2>Shipping Info</h2>
        <input
          required
          autoFocus
          id="address"
          type="text"
          name="address"
          autoComplete="street-address"
          value={shippingInfo.address}
          placeholder="Enter Your Address"
          onChange={inputOnChangeHandler}
        />
        <input
          required
          id="state"
          type="text"
          name="state"
          autoComplete="address-level1"
          value={shippingInfo.state}
          placeholder="Enter Your State"
          onChange={inputOnChangeHandler}
        />
        <input
          required
          id="city"
          type="text"
          name="city"
          autoComplete="address-level2"
          value={shippingInfo.city}
          placeholder="Enter Your City"
          onChange={inputOnChangeHandler}
        />
        <select
          required
          id="country"
          name="country"
          autoComplete="country"
          value={shippingInfo.country}
          onChange={inputOnChangeHandler}
        >
          <option value="">Choose Country</option>
          <option value="pakistan">Pakistan</option>
          <option value="india">India</option>
        </select>
        <button disabled={loading} type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Shipping;
