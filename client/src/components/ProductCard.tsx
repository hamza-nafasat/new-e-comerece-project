import { FaPlus } from "react-icons/fa";
import { CartItemType } from "../types/types";
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
  handler: (e: React.MouseEvent<HTMLButtonElement>, cartItem: CartItemType) => string | undefined;
};

const ProductCard = ({ handler, name, photo, price, productId, stock }: ProductsProps) => {
  const navigate = useNavigate();
  return (
    <div className="productCard">
      <img src={photo?.url} alt={name} loading="lazy" />
      <p>{name}</p>
      <span>{price} Rs</span>
      <div onClick={() => navigate(`/product/${productId}`)}>
        <button>
          <FaPlus onClick={(e) => handler(e, { name, photo, price, productId, stock, quantity: 1 })} />
        </button>
      </div>
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
