import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { createInfrastructure, deleteInfrastructure, listInfrastructures, updateInfrastructure } from "../services/infrastructure.service";

const router = Router();

const infrastructureSchema = z.object({
  name: z.string().min(2),
  category: z.enum(["puente", "drenaje", "poste", "edificio", "carretera", "otro"]),
  condition: z.enum(["good", "warning", "critical"]),
  description: z.string().min(5),
  location: z.string(),
  owner: z.string().optional()
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const infrastructures = await listInfrastructures();
    res.json({ ok: true, infrastructures });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = infrastructureSchema.parse(req.body);
    const infrastructure = await createInfrastructure(data);
    res.status(201).json({ ok: true, infrastructure });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = infrastructureSchema.partial().parse(req.body);
    const infrastructure = await updateInfrastructure(String(req.params.id), data);
    res.json({ ok: true, infrastructure });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const infrastructure = await deleteInfrastructure(String(req.params.id));
    res.json({ ok: true, infrastructure });
  } catch (error) {
    next(error);
  }
});

export default router;
