import { useNavigate } from "react-router-dom";

type ProductsProps = {
  productId: string;
  name: string;
  photo: {
    publicId: string;
    url: string;
  };
  stock: number;
  price: number;
  offerPrice: number;
};

const ProductCard = ({ name, photo, price, productId, offerPrice }: ProductsProps) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/product/${productId}`)} className="productCard">
      <img src={photo?.url} alt={name} loading="lazy" className="product-image" />
      <hr className="hr" />
      <p className="product-name">{name}</p>
      {!offerPrice ? (
        <span className="product-price">Rs {price} </span>
      ) : (
        <div className="productPriceWithOfferPrice">
          <span style={{ textDecoration: "line-through" }} className="product-price">
            Rs {price}{" "}
          </span>
          <span className="product-offer-price">{offerPrice} </span>
        </div>
      )}
      <div onClick={() => navigate(`/product/${productId}`)} className="product-hover" />
    </div>
  );
};

const SampleProductCard = ({
  name,
  photo,
  handler,
}: {
  name: string;
  photo: string;
  handler: () => void;
}) => {
  return (
    <div onClick={handler} className="sampleProductCard">
      <img src={photo} alt={name} loading="lazy" />
      <p>{name}</p>
    </div>
  );
};
export { SampleProductCard };

export default ProductCard;
