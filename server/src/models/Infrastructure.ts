import { Schema, model } from "mongoose";

const infrastructureSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ["puente", "drenaje", "poste", "edificio", "carretera", "otro"], required: true },
    condition: { type: String, enum: ["good", "warning", "critical"], default: "warning" },
    description: { type: String, required: true, trim: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    owner: { type: String, trim: true, default: "Proteccion Civil" }
  },
  { timestamps: true }
);

export const InfrastructureModel = model("Infrastructure", infrastructureSchema);
