import { TryCatch } from "../middlewares/errorHandler.js";
import Data from "../models/data.model.js";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import CustomError from "../utils/customClass.js";
import { responseFunc } from "../utils/features.js";
import getDataUri from "../utils/uriParser.js";

export const addOrUpdateBanner = TryCatch(async (req, res, next) => {
  const photo = req.file;
  const { name } = req.body;
  if (!photo || !name) return next(new CustomError("Please Provide All Fields", 400));
  let isExist = await Data.findOne({ name });
  if (!isExist) {
    const fileUrl = getDataUri(photo);
    const myCloud: any = await uploadOnCloudinary(fileUrl.content!, "data");
    let image = { publicId: myCloud?.public_id, url: myCloud?.secure_url };
    await Data.create({ name, image });
  } else {
    // remove old image
    await removeFromCloudinary(isExist?.image?.publicId as string);
    const fileUrl = getDataUri(photo);
    const myCloud: any = await uploadOnCloudinary(fileUrl.content!, "data");
    isExist.image = { publicId: myCloud?.public_id, url: myCloud?.secure_url };
    await isExist.save();
  }
  responseFunc(res, "Banner Added Successfully", 201);
});

// get the banner
export const getBanner = TryCatch(async (req, res, next) => {
  const banner = await Data.findOne({ name: "banner" });
  responseFunc(res, "", 200, banner);
});
