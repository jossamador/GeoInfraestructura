import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { createZone, deleteZone, listZones, updateZone } from "../services/zone.service";

const router = Router();

const zoneSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  points: z.array(z.object({ lat: z.coerce.number(), lng: z.coerce.number() })).min(3)
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const zones = await listZones();
    res.json({ ok: true, zones });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = zoneSchema.parse(req.body);
    const zone = await createZone({ ...data, createdBy: req.user!.id });
    res.status(201).json({ ok: true, zone });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = zoneSchema.partial().parse(req.body);
    const zone = await updateZone(String(req.params.id), data);
    res.json({ ok: true, zone });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const zone = await deleteZone(String(req.params.id));
    res.json({ ok: true, zone });
  } catch (error) {
    next(error);
  }
});

export default router;
