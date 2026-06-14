import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { createReport, deleteReport, listReports, updateReport } from "../services/report.service";

const router = Router();

const reportSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["inundacion", "electrico", "estructural", "arboles", "otro"]),
  location: z.string().min(1)
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const reports = await listReports();
    res.json({ ok: true, reports });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = reportSchema.parse(req.body);
    const report = await createReport({ ...data, reporter: req.user!.id });
    res.status(201).json({ ok: true, report });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = reportSchema.partial().parse(req.body);
    const report = await updateReport(String(req.params.id), data);
    res.json({ ok: true, report });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const report = await deleteReport(String(req.params.id));
    res.json({ ok: true, report });
  } catch (error) {
    next(error);
  }
});

export default router;
