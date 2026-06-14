import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import locationRoutes from "./routes/location.routes";
import reportRoutes from "./routes/report.routes";
import infrastructureRoutes from "./routes/infrastructure.routes";
import zoneRoutes from "./routes/zone.routes";
import { errorHandler, notFound } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "*", credentials: true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, message: "API de daños por lluvias activa" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/infrastructures", infrastructureRoutes);
  app.use("/api/zones", zoneRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
