import { LocationModel } from "../models/Location";
import { HttpError } from "../utils/httpError";
import { emitDataChange } from "../config/socket";

type LocationInput = {
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  createdBy: string;
};

type UpdateLocationInput = Partial<Omit<LocationInput, "createdBy">>;

export const listLocations = async () => {
  return LocationModel.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
};

export const searchLocationByName = async (name: string) => {
  const location = await LocationModel.findOne({ name: new RegExp(name, "i") }).populate("createdBy", "name email");

  if (!location) {
    throw new HttpError(404, "Ubicacion no encontrada");
  }

  return location;
};

export const createLocation = async (input: LocationInput) => {
  const location = await LocationModel.create(input);
  const populated = await LocationModel.findById(location.id).populate("createdBy", "name email");
  emitDataChange("locations:changed", { action: "create" });
  return populated;
};

export const updateLocation = async (id: string, input: UpdateLocationInput) => {
  const location = await LocationModel.findByIdAndUpdate(id, input, { new: true }).populate("createdBy", "name email");

  if (!location) {
    throw new HttpError(404, "Ubicacion no encontrada");
  }

  emitDataChange("locations:changed", { action: "update" });
  return location;
};

export const deleteLocation = async (id: string) => {
  const location = await LocationModel.findByIdAndDelete(id);

  if (!location) {
    throw new HttpError(404, "Ubicacion no encontrada");
  }

  emitDataChange("locations:changed", { action: "delete" });
  return location;
};
