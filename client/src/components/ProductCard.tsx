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
};

const ProductCard = ({ name, photo, price, productId }: ProductsProps) => {
  const navigate = useNavigate();
  return (
    <div className="productCard">
      <img src={photo?.url} alt={name} loading="lazy" />
      <p>{name}</p>
      <span>{price} Rs</span>
      <div onClick={() => navigate(`/product/${productId}`)}></div>
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
