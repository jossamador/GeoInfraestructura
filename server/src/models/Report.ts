import { Schema, model } from "mongoose";

const reportSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    category: { type: String, enum: ["inundacion", "electrico", "estructural", "arboles", "otro"], required: true },
    status: { type: String, enum: ["abierto", "en_proceso", "resuelto"], default: "abierto" },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const ReportModel = model("Report", reportSchema);
