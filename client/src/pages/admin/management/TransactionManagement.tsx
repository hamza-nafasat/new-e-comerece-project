import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminAside from "../../../components/admin/AdminAside";
import {
  useDeleteOrderMutation,
  useProcessOrderMutation,
  useSingleOrderQuery,
} from "../../../redux/api/orderApi";
import Loader from "../../../components/Loader";
import { StoreRootState } from "../../../redux/store/store";
import { CustomErrorType } from "../../../types/api-types";
import { responseToast } from "../../../utils/features";

export type OrderItemType = {
  name: string;
  photo: {
    publicId: string;
    url: string;
  };
  price: number;
  stock: number;
  quantity: number;
  productId: string;
  _id: string;
};
export type OrderType = {
  name: string;
  contact?: string;
  address: string;
  city: string;
  country: string;
  state: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCharges: number;
  total: number;
  orderItems: OrderItemType[];
  _id: string;
};

const TransactionManagement = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useSelector((state: StoreRootState) => state.userReducer);

  const { data, isLoading, isError, error } = useSingleOrderQuery(params.id!);
  const [deleteOrder] = useDeleteOrderMutation();
  const [processOrder] = useProcessOrderMutation();
  const [order, setOrder] = useState<OrderType>();
  const [processBtnLoading, setProcessBtnLoading] = useState<boolean>(false);
  const [deleteBtnLoading, setDeleteBtnLoading] = useState<boolean>(false);

  // update order processing to shipped and shipped to delivered
  const orderUpdateHandler = async () => {
    try {
      setProcessBtnLoading(true);
      const res = await processOrder({
        orderId: order?._id as string,
        userId: user?._id as string,
      });
      if ("data" in res) {
        toast.success(res.data.message);
      } else {
        const error = res.error as CustomErrorType;
        toast.error(error.data.message);
      }
      setProcessBtnLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error While Processing Order");
      setProcessBtnLoading(false);
    }
  };
  // delete order handler
  const orderDeleteHandler = async () => {
    try {
      setDeleteBtnLoading(true);
      const res = await deleteOrder({
        orderId: order?._id as string,
        userId: user?._id as string,
      });
      responseToast(res, navigate, "/admin/transactions");
      setDeleteBtnLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error While Deleting Order");
      setDeleteBtnLoading(false);
    }
  };
  // setting data in useEffect
  useEffect(() => {
    if (data) {
      const receivedData = data.data;
      if (data)
        setOrder({
          name: receivedData.userId?.name || "Deleted User",
          contact: receivedData.shippingInfo?.contact || undefined,
          address: receivedData.shippingInfo.address,
          city: receivedData.shippingInfo.city,
          country: receivedData.shippingInfo.country,
          state: receivedData.shippingInfo.state,
          status: receivedData.status,
          subtotal: receivedData.subtotal,
          discount: receivedData.discount,
          shippingCharges: receivedData.shippingCharges,
          total: receivedData.total,
          orderItems: receivedData.cartItem,
          _id: receivedData._id,
        });
    }
  }, [data]);

  // error handling
  if (isError) {
    const err = error as CustomErrorType;
    toast.error(err.data.message);
    navigate("/404");
    return;
  }

  return (
    <div className="adminContainer">
      <AdminAside />
      {!order || isLoading ? (
        <Loader />
      ) : (
        <main className="transactionManagementContainer">
          {/* ORDER ITEM SECTION */}
          {/* ================== */}
          <section>
            <h2>Order Items</h2>
            {order.orderItems?.map((item) => (
              <ProductCard
                key={item._id}
                _id={item.productId}
                name={item.name}
                photo={item.photo}
                price={item.price}
                quantity={item.quantity}
                productId={item.productId}
                stock={item.stock}
              />
            ))}
          </section>
          {/* ORDER INFO ARTICLE */}
          {/* ================== */}
          <article>
            <h2>Order Info</h2>
            <h5>User info</h5>
            <p>Name - {order.name}</p>
            {order.contact && <p>contact - {order.contact}</p>}
            <p>Country - {order.country}</p>
            <p>Address - {`${order.address}, ${order.city}, ${order.state}`}</p>
            <h5>Amount Info</h5>
            <p>Subtotal - {order.subtotal}</p>
            <p>Discount - {order.discount}</p>
            <p>Shipping charges - {order.shippingCharges}</p>
            <p>Total amount - {order.total}</p>
            <h5>Status Info</h5>
            <p>
              Status -{" "}
              <span
                className={
                  order.status === "delivered" ? "purple" : order.status === "shipped" ? "green" : "red"
                }
              >
                {order?.status.toUpperCase()}
              </span>
            </p>
            <button disabled={processBtnLoading} onClick={orderUpdateHandler}>
              Process Order
            </button>
            <button disabled={deleteBtnLoading} onClick={orderDeleteHandler}>
              Delete Order
            </button>
          </article>
        </main>
      )}
    </div>
  );
};

const ProductCard = ({ name, _id, photo, price, quantity }: OrderItemType) => {
  return (
    <div className="transactionProductCard">
      <img src={photo.url} alt={name} />
      <Link to={`/admin/products/single/${_id}`}>{name}</Link>
      <span>
        ${price} x {quantity} = ${quantity * price}
      </span>
    </div>
  );
};

export default TransactionManagement;
