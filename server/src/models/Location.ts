import { Schema, model, type Types } from "mongoose";

const locationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export type LocationDocument = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  createdBy: Types.ObjectId;
};

export const LocationModel = model("Location", locationSchema);
