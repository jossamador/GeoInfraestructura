import { ZoneModel } from "../models/Zone";
import { HttpError } from "../utils/httpError";

type ZoneInput = {
  name: string;
  description: string;
  points: Array<{ lat: number; lng: number }>;
  createdBy: string;
};

export const listZones = async () => {
  return ZoneModel.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
};

export const createZone = async (input: ZoneInput) => {
  return ZoneModel.create(input);
};

export const updateZone = async (id: string, input: Partial<ZoneInput>) => {
  const zone = await ZoneModel.findByIdAndUpdate(id, input, { new: true });

  if (!zone) {
    throw new HttpError(404, "Zona no encontrada");
  }

  return zone;
};

export const deleteZone = async (id: string) => {
  const zone = await ZoneModel.findByIdAndDelete(id);

  if (!zone) {
    throw new HttpError(404, "Zona no encontrada");
  }

  return zone;
};
