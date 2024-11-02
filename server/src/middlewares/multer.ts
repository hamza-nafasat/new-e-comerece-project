import path from "path";
import multer from "multer";
import { v4 as uuid } from "uuid";
import CustomError from "../utils/customClass.js";

// const storage = multer.diskStorage({
// 	destination(req, file, callback) {
// 		callback(null, "uploads");
// 	},
// 	filename(req, file, callback) {
// 		callback(null, `${file.originalname.split(".")[0]}_${uuid()}_${file.originalname}`);
// 	},
// });

const fileFilter = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedExtension = [".jpg", ".png", ".jpeg", ".webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedExtension.includes(fileExtension)) {
    return callback(null, true);
  }
  callback(new CustomError("File Upload Error", 400));
};

const singleUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
}).single("photo");

const multiUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
}).fields([
  { name: "photos", maxCount: 5 },
  { name: "sizeChartPhoto", maxCount: 1 },
]);

export { multiUpload };
export default singleUpload;
