import { ChangeEvent, FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminAside from "../../../components/admin/AdminAside";
import { useCreateNewProductMutation } from "../../../redux/api/productApi";
import { StoreRootState } from "../../../redux/store/store";
import { responseToast } from "../../../utils/features";

import { categoriesOptions, subCategoriesOptions } from "../../../sampleData/data";

const NewProduct = () => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [price, setPrice] = useState<number>();
  const [offerPrice, setOfferPrice] = useState<number>();
  const [stock, setStock] = useState<number>();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [sizeChartPhoto, setSizeChartPhoto] = useState<File | null>(null);
  const [sizeChartPreview, setSizeChartPreview] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useSelector((state: StoreRootState) => state.userReducer);

  const [createNewProduct] = useCreateNewProductMutation();

  // Handler for changing product photos
  const changePhotoHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("You can only upload up to 5 photos.");
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

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
    setCategory(e.target.value);
    setSubCategory(""); // Reset subcategory when category changes
  };
  // Handler for changing size chart photo
  const changeSizeChartHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChartPhoto(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setSizeChartPreview(reader.result as string);
      };
    }
  };

  // Handler to remove a specific product photo
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonLoading(true);

    // Ensure all required fields, including the Size Chart photo, are provided
    if (!photos.length || !name || (stock && stock < 0) || !category || !price || !sizeChartPhoto) {
      toast.error("Please enter all fields including the Size Chart photo.");
      setButtonLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      if (offerPrice) formData.append("offerPrice", String(offerPrice));

      // Add sizeChartPhoto as a single file
      formData.append("sizeChartPhoto", sizeChartPhoto);

      // Add each photo in the photos array
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await createNewProduct({ id: user?._id as string, formData });
      responseToast(res, navigate, "/admin/products");
    } catch (error) {
      console.log(error);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div className="adminContainer">
      <AdminAside />
      <main className="newProductContainer">
        <article>
          <form onSubmit={handleSubmit}>
            <h2>New Product</h2>
            <div>
              <label htmlFor="newProductName">Name:</label>
              <input
                required
                type="text"
                value={name}
                id="newProductName"
                placeholder="Enter product name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="newProductPrice">Price:</label>
              <input
                required
                type="number"
                value={price}
                id="newProductPrice"
                placeholder="Enter product price"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="newProductOfferPrice">Offer Price:</label>
              <input
                required
                type="number"
                value={offerPrice}
                id="newProductOfferPrice"
                placeholder="Enter product Offer price"
                onChange={(e) => setOfferPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="newProductCategory">Category:</label>
              <select required id="newProductCategory" value={category} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categoriesOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Select */}
            {category && (
              <div>
                <label htmlFor="newProductSubCategory">Sub Category:</label>
                <select
                  required
                  id="newProductSubCategory"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="">Select Sub Category</option>
                  {subCategoriesOptions[category]?.map((sub: string, index: number) => (
                    <option key={index} value={sub}>
                      {sub.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="newProductStock">Stock:</label>
              <input
                required
                type="number"
                value={stock}
                id="newProductStock"
                placeholder="Enter product stock"
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="sizeChartPhoto">Size Chart Photo:</label>
              <input required type="file" id="sizeChartPhoto" onChange={changeSizeChartHandler} />
              {sizeChartPreview && (
                <div className="sizeChartPreview">
                  <img src={sizeChartPreview} alt="Size Chart Preview" />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="newProductPhotos">Product Photos:</label>
              <input required type="file" id="newProductPhotos" multiple onChange={changePhotoHandler} />
            </div>
            <div className="photoPreviews">
              {previewPhotos.map((photo, index) => (
                <div key={index} className="photoContainer">
                  <img src={photo} alt={`product preview ${index}`} />
                  <button type="button" onClick={() => removePhoto(index)} className="removePhoto">
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <button disabled={buttonLoading} type="submit">
              Create
            </button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewProduct;
