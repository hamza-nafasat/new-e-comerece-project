import { FormEvent, useState } from "react";
import AdminAside from "../../../components/admin/AdminAside";
import { FaPlus } from "react-icons/fa";
import { backendServerUrl, StoreRootState } from "../../../redux/store/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const allNumbers = "1234567890";
const allSymbols = "*&^%$#@!-+=?/><|";
const allAlphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const Coupon = () => {
  const [modal, setModal] = useState<boolean>(false);
  const [size, setSize] = useState<number>(8);
  const [coupon, setCoupon] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false);
  const [includeCharacters, setIncludeCharacters] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // COPY FUNCTION
  // =============
  const copyText = async (coupon: string) => {
    await window.navigator.clipboard.writeText(coupon);
    setIsCopied(true);
  };
  // GENERATED ONCLICK FUNCTION
  // ==========================
  const formSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clearing old value of coupon
    setCoupon("");
    // Checking the selected fields
    if (!includeCharacters && !includeNumbers && !includeSymbols) {
      return alert("Please select at least one from Characters, Numbers and Symbols");
    }
    // making a string which is used for generating coupon
    let entireCharsForCoupon: string = "";
    if (includeNumbers) entireCharsForCoupon += allNumbers;
    if (includeSymbols) entireCharsForCoupon += allSymbols;
    if (includeCharacters) entireCharsForCoupon += allAlphabets;
    // generating coupon
    // =================
    let generatedCoupon: string = prefix || "";
    const loopLength: number = size - generatedCoupon.length;
    for (let i = 0; i < loopLength; i++) {
      const randomNumber: number = Math.floor(Math.random() * entireCharsForCoupon.length);
      generatedCoupon += entireCharsForCoupon[randomNumber];
    }
    // Set coupon value and making is copied false
    setCoupon(generatedCoupon);

    setIsCopied(false);
  };
  return (
    <div className="adminContainer">
      <AdminAside />
      <main className="couponContainer">
        <h2>Coupon</h2>
        <span onClick={() => setModal(true)}>
          <FaPlus />
        </span>
        <section>
          <form className="couponForm" onSubmit={formSubmitHandler}>
            <label htmlFor="prefix">Prefix</label>
            <input
              type="text"
              id="prefix"
              value={prefix}
              maxLength={size}
              placeholder="Text to include"
              onChange={(e) => setPrefix(e.target.value)}
            />
            <label htmlFor="size">Prefix</label>
            <input
              type="number"
              id="size"
              value={size}
              max={25}
              min={8}
              onChange={(e) => setSize(Number(e.target.value))}
            />
            <fieldset>
              <legend>Include</legend>
              <label htmlFor="characters">Characters</label>
              <input
                id="characters"
                type="checkbox"
                checked={includeCharacters}
                onChange={() => setIncludeCharacters((prev) => !prev)}
              />
              <label htmlFor="numbers">Numbers</label>
              <input
                id="numbers"
                type="checkbox"
                checked={includeNumbers}
                onChange={() => setIncludeNumbers((prev) => !prev)}
              />
              <label htmlFor="symbols">Symbols</label>
              <input
                id="symbols"
                type="checkbox"
                checked={includeSymbols}
                onChange={() => setIncludeSymbols((prev) => !prev)}
              />
            </fieldset>
            <button type="submit">Generate Coupon</button>
          </form>
          {coupon ? (
            <output onClick={() => copyText(coupon)}>
              {coupon} <span>{isCopied ? "Copied" : "Copy"}</span>
            </output>
          ) : null}
        </section>
        <ModalComponent isOpen={modal} onClose={() => setModal(false)} />
      </main>
    </div>
  );
};

export default Coupon;

const ModalComponent = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user } = useSelector((state: StoreRootState) => state.userReducer);
  const [couponCode, setCouponCode] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const handleSubmit = async (e: any) => {
    if (!couponCode || !price) return toast.error("Please enter coupon code and price");
    if (couponCode.length < 8) return toast.error("Coupon code must be atleast 8 characters long");
    e.preventDefault();
    try {
      const res = await fetch(`${backendServerUrl}/api/v1/payments/coupon/new?id=${user?._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode,
          amount: price,
        }),
      });
      const response = await res.json();
      if (response?.success) toast.success(response?.message);
    } catch (error) {
      console.log("error while creating new coupon", error);
    } finally {
      onClose();
    }
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
            <label htmlFor="couponCode">Coupon Code</label>
            <input
              type="text"
              id="couponCode"
              name="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
