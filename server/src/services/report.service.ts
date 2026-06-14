import { ReportModel } from "../models/Report";
import { HttpError } from "../utils/httpError";

type ReportInput = {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "inundacion" | "electrico" | "estructural" | "arboles" | "otro";
  location: string;
  reporter: string;
};

export const listReports = async () => {
  return ReportModel.find().sort({ createdAt: -1 }).populate("location reporter");
};

export const createReport = async (input: ReportInput) => {
  return ReportModel.create(input);
};

export const updateReport = async (id: string, input: Partial<ReportInput>) => {
  const report = await ReportModel.findByIdAndUpdate(id, input, { new: true });

  if (!report) {
    throw new HttpError(404, "Reporte no encontrado");
  }

  return report;
};

export const deleteReport = async (id: string) => {
  const report = await ReportModel.findByIdAndDelete(id);

  if (!report) {
    throw new HttpError(404, "Reporte no encontrado");
  }

  return report;
};
