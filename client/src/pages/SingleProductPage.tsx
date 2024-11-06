/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import StarIcon from "../assets/StarIcon";
import { useAddReviewMutation, useSingleProductQuery } from "../redux/api/productApi";
import { addToCart } from "../redux/reducers/cartReducer";
import { StoreRootState } from "../redux/store/store";
import { CartItemType } from "../types/types";
import { responseToast } from "../utils/features";

const SingleProductPage = () => {
  const [size, setSize] = useState<string>("");
  const [colorDescription, setColorDescription] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [addReviewForProduct] = useAddReviewMutation();
  const { user } = useSelector((state: StoreRootState) => state.userReducer);
  const [product, setProduct] = useState<any>({
    _id: "",
    name: "",
    category: "",
    subCategory: "",
    price: 0,
    photos: [],
    sizeChartPhoto: { publicId: "", url: "" },
    createdAt: "",
    offerPrice: 0,
    reviews: [],
    banner: "",
    otherImages: [],
    stock: 0,
    updatedAt: "",
  });
  const { id: productId } = useParams();
  const { data, isLoading, isSuccess, refetch } = useSingleProductQuery(productId!);
  // console.log(data);

  const addToCartHandler = (e: React.MouseEvent<HTMLButtonElement>, cartItem: CartItemType) => {
    try {
      if (!user?._id) return toast.error("Please Login First Then You Can Add Products in Cart");
      if (
        (!cartItem?.colorDescription && product?.colors?.length) ||
        (product?.sizes?.length && !cartItem.productSize)
      ) {
        return toast.error("Please Select size and color");
      }
      if (
        !cartItem?.colorDescription ||
        !cartItem.name ||
        !cartItem.price ||
        !cartItem.productId ||
        !cartItem.productSize ||
        !cartItem.quantity ||
        !cartItem.stock ||
        !cartItem.photo ||
        !cartItem.category ||
        !cartItem.subCategory
      ) {
        return toast.error("Please Select All Fields");
      }
      e.stopPropagation();
      if (cartItem?.stock < 1) return toast.error(`${cartItem?.name} is out of stock`);
      dispatch(addToCart(cartItem));
      toast.success("Product Added To Cart");
      return;
    } catch (error) {
      toast.error("Product Already In Cart");
      throw error;
    }
  };

  const onSubmitReview = async ({
    username,
    rating,
    message,
    email,
    gender,
    productId,
    userId,
  }: {
    username: string;
    rating: string;
    message: string;
    email: string;
    gender: string;
    productId: string;
    userId: string;
  }) => {
    try {
      if (!username || !rating || !message || !email || !gender || !productId || !userId)
        return toast.error("All fields are required");
      const response = await addReviewForProduct({
        username,
        rating,
        comment: message,
        email,
        gender,
        productId,
        userId,
      });
      if (response) responseToast(response, null, "");
      await refetch();
    } catch (error) {
      toast.error("Something went wrong while adding reviews");
    }
  };

  useEffect(() => {
    if (data?.data) {
      const productData = {
        ...data?.data,
        createdAt: data?.data?.createdAt?.split("T")[0],
        updatedAt: data?.data?.updatedAt?.split("T")[0],
        banner: data?.data?.photos?.[0],
        otherImages: data?.data?.photos?.slice(1),
        sizeChart: data?.data?.sizeChartPhoto,
        reviews: data?.data?.reviews?.slice(0, 5),
        sizes: data?.data?.sizes,
        colors: data?.data?.colors,
      };
      console.log(productData);
      setProduct(productData);
    }
  }, [data]);

  return isLoading || !isSuccess || !product ? (
    <div>Loading...</div>
  ) : (
    <main className="singleProduct">
      <article className="singleProductContainer">
        {/* show details page */}
        <section className="showDetailsSection">
          <img src={product?.banner?.url} alt="product image" />
          <section className="otherImagesSection">
            <div className="otherImages">
              {product?.otherImages?.map((image: any, i: number) => (
                <img key={i} src={image?.url} alt="product image" />
              ))}
            </div>
          </section>
          <img className="sizeChart" src={product?.sizeChart?.url} alt="size chart" />
        </section>
        {/* product image section  */}
        <section className="showImagesSection">
          <div className="details">
            <div>
              <h4>Product Name</h4>
              <p>{product?.name}</p>
              <hr />
            </div>

            {product?.offerPrice > 0 ? (
              <div>
                <h4>Product Price</h4>
                <p>
                  <span className="secondSpan">Rs {product?.offerPrice}</span>
                </p>
                <hr />
              </div>
            ) : (
              <div>
                <h4>Product Price</h4>
                <p>{product?.price}</p>
                <hr />
              </div>
            )}
            <div>
              <h4>Product Category</h4>
              <p>{product?.category}</p>
              <hr />
            </div>
            <div>
              <h4>Product Sub Category</h4>
              <p>{product?.subCategory}</p>
              <hr />
            </div>
            <div className="singleProductDetailsInputDiv">
              <label htmlFor="size">Size</label>
              <select name="size" id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="">Select Size</option>
                {product?.sizes?.map((size: any, i: number) => (
                  <option key={i} value={size}>
                    {size?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="singleProductDetailsInputDiv">
              <label htmlFor="color">Color</label>
              <select
                name="color"
                id="color"
                value={colorDescription}
                onChange={(e) => setColorDescription(e.target.value)}
              >
                <option value="">Select Color</option>
                {product?.colors?.map((color: any, i: number) => (
                  <option key={i} value={color}>
                    {color?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={(e) =>
                addToCartHandler(e, {
                  name: product?.name,
                  photo: product?.banner,
                  price: product?.offerPrice ? product?.offerPrice : product?.price,
                  productId: product?._id,
                  stock: product?.stock,
                  quantity: 1,
                  productSize: size,
                  colorDescription: colorDescription,
                  category: product?.category,
                  subCategory: product?.subCategory,
                })
              }
            >
              Add to cart
            </button>
            {user && user?._id && <button onClick={() => setIsModalOpen(true)}>Add Reviews</button>}
          </div>
        </section>
      </article>
      {product?.reviews?.length ? (
        <article className="clientReviews">
          <h2>Top 5 Client Reviews</h2>
          {product?.reviews?.map((review: any, i: number) => (
            <ReviewsCard key={i} review={review} />
          ))}
        </article>
      ) : null}

      <ModalComponent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmitReview}
        productId={product?._id}
        user={user}
      />
    </main>
  );
};

export default SingleProductPage;

const ReviewsCard = ({ review }: any) => {
  return (
    <section className="reviewCard">
      <div>
        <h3>{review?.username}</h3>
        <Reviews rating={review?.rating} />
      </div>
      <p className="email">{review?.email}</p>
      <p>{review?.comment}</p>
    </section>
  );
};

const Reviews = ({ rating }: { rating: number }) => {
  return (
    <div className="review-container">
      {[1, 2, 3, 4, 5].map((item) => {
        if (item <= rating) {
          return (
            <button key={item} className={`star-button ${item <= rating ? "selected" : "unselected"}`}>
              <StarIcon />
            </button>
          );
        }
      })}
    </div>
  );
};

// modal for add review
// -------------------

const ModalComponent = ({
  isOpen,
  onClose,
  onSubmit,
  productId,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  productId: string;
  user: any;
}) => {
  const [formData, setFormData] = useState({
    username: "",
    rating: "",
    message: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.username || !formData.rating || !formData.message || !user || !user._id) {
      return toast.error("Please fill all the fields");
    }

    await onSubmit({
      username: formData.username,
      rating: formData.rating,
      message: formData.message,
      email: user?.email,
      gender: user?.gender,
      productId: productId,
      userId: user?._id,
    });

    setFormData({
      username: "",
      rating: "",
      message: "",
    });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Leave a Review</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select required name="rating" id="rating" value={formData.rating} onChange={handleInputChange}>
              <option value="">Select Rating 1 to 5</option>
              {[1, 2, 3, 4, 5].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
