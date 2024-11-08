import { Schema, model } from "mongoose";

const dataSchema = new Schema(
  {
    name: { type: String, required: [true, "Please Enter Data Name"] },
    image: {
      type: { publicId: { type: String, required: true }, url: { type: String, required: true } },
      required: true,
    },
  },

  { timestamps: true }
);

const Data = model("Data", dataSchema);
export default Data;
