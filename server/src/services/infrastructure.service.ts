import { InfrastructureModel } from "../models/Infrastructure";
import { HttpError } from "../utils/httpError";

type InfrastructureInput = {
  name: string;
  category: "puente" | "drenaje" | "poste" | "edificio" | "carretera" | "otro";
  condition: "good" | "warning" | "critical";
  description: string;
  location: string;
  owner?: string;
};

export const listInfrastructures = async () => {
  return InfrastructureModel.find().sort({ createdAt: -1 }).populate("location");
};

export const createInfrastructure = async (input: InfrastructureInput) => {
  return InfrastructureModel.create(input);
};

export const updateInfrastructure = async (id: string, input: Partial<InfrastructureInput>) => {
  const infrastructure = await InfrastructureModel.findByIdAndUpdate(id, input, { new: true });

  if (!infrastructure) {
    throw new HttpError(404, "Infraestructura no encontrada");
  }

  return infrastructure;
};

export const deleteInfrastructure = async (id: string) => {
  const infrastructure = await InfrastructureModel.findByIdAndDelete(id);

  if (!infrastructure) {
    throw new HttpError(404, "Infraestructura no encontrada");
  }

  return infrastructure;
};
