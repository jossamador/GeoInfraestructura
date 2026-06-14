import { Schema, model } from "mongoose";

const zoneSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    points: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const ZoneModel = model("Zone", zoneSchema);
