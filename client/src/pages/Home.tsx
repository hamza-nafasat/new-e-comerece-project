import { Link, useNavigate } from "react-router-dom";
import BoysPic from "../assets/web-images/boy.png";
import GirlsPic from "../assets/web-images/girl.png";
import MensPic from "../assets/web-images/men.png";
import WomensPic from "../assets/web-images/women.png";
import { SampleProductCard } from "../components/ProductCard";
import banner from "../assets/web-images/banner.jpeg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="homePage">
      <img src={banner} alt="banner" loading="lazy" />
      <section>
        <h2>Products Categories</h2>
        <Link to={"/search"} className="findMore" aria-label="more products link">
          See all products
        </Link>
      </section>
      <main>
        {["Mens", "Womens", "Girls", "Boys"].map((product, i) => {
          const navigateHandler = () => {
            return navigate(`/search`, {
              state: product?.toLocaleLowerCase(),
            });
          };
          return (
            <SampleProductCard
              key={i}
              name={product}
              photo={`${
                product === "Mens"
                  ? MensPic
                  : product === "Womens"
                  ? WomensPic
                  : product === "Girls"
                  ? GirlsPic
                  : BoysPic
              }`}
              handler={navigateHandler}
            />
          );
        })}
      </main>
    </div>
  );
};

export default Home;
