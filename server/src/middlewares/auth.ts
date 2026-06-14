import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Token requerido"));
  }

  try {
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET ?? "dev_secret";
    req.user = jwt.verify(token, secret) as Express.Request["user"];
    return next();
  } catch {
    return next(new HttpError(401, "Token invalido"));
  }
};
