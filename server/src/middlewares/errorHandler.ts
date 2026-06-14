import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, "Ruta no encontrada"));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : "Error inesperado";

  res.status(status).json({
    ok: false,
    message
  });
};
