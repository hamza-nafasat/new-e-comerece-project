/* eslint-disable react-hooks/rules-of-hooks */
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import AdminAside from "../../../components/admin/AdminAside";
import {
  useDeletePhotoFromProductMutation,
  useDeleteSingleProductMutation,
  useSingleProductQuery,
  useUpdateSingleProductMutation,
} from "../../../redux/api/productApi";
import { StoreRootState } from "../../../redux/store/store";
import { CustomErrorType } from "../../../types/api-types";
import { responseToast } from "../../../utils/features";
import { categoriesOptions, subCategoriesOptions } from "../../../sampleData/data";

const ProductsManagement = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: StoreRootState) => state.userReducer);
  const { data, isLoading, isError, error, refetch } = useSingleProductQuery(params.id!);

  const [updatedName, setUpdatedName] = useState("");
  const [updatedPrice, setUpdatedPrice] = useState<number>();
  const [updatedStock, setUpdatedStock] = useState<number>();
  const [updatedCategory, setUpdatedCategory] = useState("");
  const [updatedSubCategory, setUpdatedSubCategory] = useState("");
  const [updatedOfferPrice, setUpdatedOfferPrice] = useState<number>();

  const [oldPHotos, setOldPHotos] = useState<{ url: string; publicId: string }[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [updatedSizeChartPhoto, setUpdatedSizeChartPhoto] = useState("");
  const [sizeChartFile, setSizeChartFile] = useState<File | string>("");

  const [isProductUpdateLoading, setIsProductUpdateLoading] = useState(false);

  const [updateProduct] = useUpdateSingleProductMutation();
  const [deletePhotoFromProduct] = useDeletePhotoFromProductMutation();
  const [deleteProduct] = useDeleteSingleProductMutation();

  // Handle errors on data fetch
  if (isError) {
    const err = error as CustomErrorType;
    toast.error(err.data.message);
    return null;
  }

  // Populate the fields with fetched data on load
  useEffect(() => {
    if (data && data.data) {
      const { name, price, stock, category, subCategory, photos, sizeChartPhoto, offerPrice } = data.data;
      setUpdatedName(name);
      setUpdatedPrice(price as number);
      setUpdatedStock(stock as number);
      setUpdatedCategory(category);
      setOldPHotos(photos);
      setUpdatedSubCategory(subCategory);
      setUpdatedOfferPrice(offerPrice as number);
      setUpdatedSizeChartPhoto(sizeChartPhoto.url);
    }
  }, [data]);

  // Photo change handler
  const changePhotosHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (oldPHotos.length + photoFiles.length + files.length > 5) {
      toast.error("You can only upload up to 5 photos.");
      return;
    }

    const newPhotos = [...photoFiles, ...files];
    setPhotoFiles(newPhotos);

    const newPreviewPhotos = files.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
    });

    Promise.all(newPreviewPhotos).then((previewUrls) => {
      setPreviewPhotos((prev) => [...prev, ...previewUrls]);
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdatedCategory(e.target.value);
    setUpdatedSubCategory("");
  };

  // Remove photo handler
  const removePhoto = (index: number) => {
    const newPreviewPhotos = [...previewPhotos];
    const newPhotoFiles = [...photoFiles];
    newPreviewPhotos.splice(index, 1);
    newPhotoFiles.splice(index, 1);
    setPreviewPhotos(newPreviewPhotos);
    setPhotoFiles(newPhotoFiles);
  };

  // Size chart change handler
  const changeSizeChartPhotoHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChartFile(file);
      setUpdatedSizeChartPhoto(URL.createObjectURL(file));
    }
  };

  // Form submission handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log(updatedOfferPrice);
    e.preventDefault();
    setIsProductUpdateLoading(true);

    const formData = new FormData();
    formData.append("name", updatedName);
    formData.append("price", String(updatedPrice! > 0 ? updatedPrice : 0));
    formData.append("stock", String(updatedStock! > 0 ? updatedStock : 0));
    formData.append("category", updatedCategory);
    if (updatedOfferPrice! > 0) formData.append("offerPrice", String(updatedOfferPrice));
    if (updatedSubCategory) formData.append("subCategory", updatedSubCategory);

    if (photoFiles.length > 0) {
      photoFiles.forEach((file) => formData.append("photos", file));
    }
    if (sizeChartFile) formData.append("sizeChartPhoto", sizeChartFile);
    try {
      const response = await updateProduct({
        formData,
        userId: user?._id as string,
        productId: params.id!,
      });
      responseToast(response, navigate, "/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Error updating product.");
    } finally {
      setIsProductUpdateLoading(false);
    }
  };

  // Delete product handler
  const deleteProductHandler = async () => {
    setIsProductUpdateLoading(true);
    try {
      const response = await deleteProduct({ userId: user?._id as string, productId: params.id! });
      responseToast(response, navigate, "/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product.");
    } finally {
      setIsProductUpdateLoading(false);
    }
  };

  //   delete photo from product
  const deletePhotoFromProductHandler = async (publicId: string, productId: string) => {
    try {
      if (!publicId || !productId) return toast.error("Error deleting photo from product.");
      const response = await deletePhotoFromProduct({ id: user?._id as string, publicId, productId });
      responseToast(response, null, "");
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting photo from product.");
    }
  };

  return (
    <div className="adminContainer">
      <AdminAside />
      {isLoading ? (
        <Loader />
      ) : (
        <main className="ProductsManagementContainer">
          <section>
            <strong>ID - {data?.data._id}</strong>
            <div className="updateProductPhotosCss">
              {oldPHotos?.length &&
                oldPHotos?.map((photo: { url: string; publicId: string }, i: number) => (
                  <div key={i}>
                    <img src={photo.url} alt="Product Photo" width={100} height="auto" />
                    <button
                      onClick={() => deletePhotoFromProductHandler(photo.publicId, params.id!)}
                      type="button"
                      className="removePhoto"
                    >
                      &times;
                    </button>
                  </div>
                ))}
            </div>
            <p>{updatedName}</p>
            {updatedStock && updatedStock > 0 ? (
              <span className="green">{updatedStock} Available</span>
            ) : (
              <span className="red">Not Available</span>
            )}
            <h3>{updatedPrice}-PKR</h3>
            <button
              className="trash"
              onClick={deleteProductHandler}
              style={{
                opacity: isProductUpdateLoading ? 0.3 : 1,
                cursor: isProductUpdateLoading ? "not-allowed" : "pointer",
              }}
            >
              <FaTrash />
            </button>
          </section>
          <article>
            <form onSubmit={handleSubmit}>
              <h2>Manage</h2>
              <div>
                <label htmlFor="productName">Name:</label>
                <input
                  type="text"
                  value={updatedName}
                  id="productName"
                  placeholder="Enter product name"
                  onChange={(e) => setUpdatedName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="productPrice">Price:</label>
                <input
                  type="number"
                  value={updatedPrice}
                  step="1"
                  id="productPrice"
                  placeholder="Enter product price"
                  onChange={(e) => setUpdatedPrice(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label htmlFor="productOfferPrice">Offer Price:</label>
                <input
                  type="number"
                  value={updatedOfferPrice}
                  id="productOfferPrice"
                  placeholder="Enter Offer price"
                  step="1"
                  onChange={(e) => setUpdatedOfferPrice(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label htmlFor="productStock">Stock:</label>
                <input
                  type="number"
                  value={updatedStock}
                  step="1"
                  id="productStock"
                  placeholder="Enter product stock"
                  onChange={(e) => setUpdatedStock(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label htmlFor="newProductCategory">Category:</label>
                <select
                  required
                  id="newProductCategory"
                  value={updatedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  {categoriesOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Select */}
              {updatedCategory && (
                <div>
                  <label htmlFor="newProductSubCategory">Sub Category:</label>
                  <select
                    required
                    id="newProductSubCategory"
                    value={updatedSubCategory}
                    onChange={(e) => setUpdatedSubCategory(e.target.value)}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategoriesOptions[updatedCategory]?.map((sub: string, index: number) => (
                      <option key={index} value={sub}>
                        {sub.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="sizeChartPhoto">Size Chart Photo:</label>
                <input type="file" id="sizeChartPhoto" onChange={changeSizeChartPhotoHandler} />
                {updatedSizeChartPhoto && (
                  <div className="sizeChartPreview">
                    <img height={100} src={updatedSizeChartPhoto} alt="Size Chart Preview" />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="newProductPhotos">Product Photos:</label>
                <input type="file" id="newProductPhotos" multiple onChange={changePhotosHandler} />
              </div>
              <div className="photoPreviews">
                {previewPhotos.map((photo, index) => (
                  <div key={index} className="photoContainer">
                    <img height={100} src={photo} alt={`product preview ${index}`} />
                    <button type="button" onClick={() => removePhoto(index)} className="removePhoto">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button disabled={isProductUpdateLoading} type="submit">
                Update
              </button>
            </form>
          </article>
        </main>
      )}
    </div>
  );
};

export default ProductsManagement;
