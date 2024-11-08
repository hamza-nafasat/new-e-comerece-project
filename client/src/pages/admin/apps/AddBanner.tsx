/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { StoreRootState } from "../../../redux/store/store";
import { useSelector } from "react-redux";
import { useAddOrUpdateBannerMutation } from "../../../redux/api/adminApi";
import { toast } from "react-toastify";
import AdminAside from "../../../components/admin/AdminAside";

const AddBanner = ({ refetch }: any) => {
  const [addBanner] = useAddOrUpdateBannerMutation();
  const { user } = useSelector((state: StoreRootState) => state.userReducer);
  const [file, setFile] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!file) return toast.error("Please select an image");

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("name", "banner");
      const response: any = await addBanner({ formData, id: user?._id as string });
      console.log(response);
      if (response?.data?.message) {
        await refetch();
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.error?.data?.message || "Error While Adding Banner");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error While Adding Banner");
      console.log("error while adding banner", error);
    } finally {
      setIsLoading(false);
      setFile("");
      setFilePreview("");
    }
  };

  return (
    <div className="adminContainer">
      <AdminAside />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "2rem",
        }}
      >
        <div className="modal-content">
          <button className="close-button">&times;</button>
          <h2 className="modal-title">Add Banner</h2>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="">Image</label>
              <input
                type="file"
                name="image"
                id="image"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>
            {filePreview && <img src={filePreview} alt="" />}
            <button disabled={isLoading} type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBanner;
