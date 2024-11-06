import { signOut } from "firebase/auth";
import { FaCartPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import logiImage from "../assets/web-images/logo.jpeg";
import { auth } from "../firebase";
import { StoreRootState } from "../redux/store/store";
import { User } from "../types/types";

interface HeaderPropTypes {
  user: User | null;
}

const Header = ({ user }: HeaderPropTypes) => {
  const { cartItem } = useSelector((state: StoreRootState) => state.cartReducer);
  const logOutHandler = async () => {
    try {
      await signOut(auth);
      toast.success("Logout Successfully");
    } catch (error) {
      toast.error("Logout Failed Please Try Again Lated");
      throw error;
    }
  };
  return (
    <nav className="header">
      <img height={100} src={logiImage} alt="logo image" />
      <div>
        <Link to={"/"} aria-label="home page">
          Home
        </Link>
        <Link to={"/search"} aria-label="search page">
          Products
        </Link>

        {user?.role == "admin" ? (
          <Link to={"/admin/dashboard"} aria-label="admin page">
            Admin
          </Link>
        ) : (
          <Link to={"/orders"} aria-label="admin page">
            Orders
          </Link>
        )}
      </div>
      {/* IF USER LOGIN */}
      {/* ============= */}
      {user?._id ? (
        <div className="logoutButton">
          <div className="cartDiv">
            <Link to={"/cart"} aria-label="cart page">
              <FaCartPlus />
            </Link>
            {cartItem?.length > 0 && <span>{cartItem.length}</span>}
          </div>
          <button className="logout" title="Logout" onClick={logOutHandler}>
            {/* <Logout /> */}
            Logout
          </button>
        </div>
      ) : (
        <>
          {/* IF USER NOT LOGIN */}
          {/* ================= */}

          <div className="loginButton">
            <Link className="login" to={"/login"} title="Login" aria-label="login page">
              {/* <Login /> */}
              Login
            </Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Header;
