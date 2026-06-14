import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { createLocation, deleteLocation, listLocations, searchLocationByName, updateLocation } from "../services/location.service";

const router = Router();

const locationSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  longitude: z.coerce.number(),
  latitude: z.coerce.number()
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const locations = await listLocations();
    res.json({ ok: true, locations });
  } catch (error) {
    next(error);
  }
});

router.get("/search/:name", requireAuth, async (req, res, next) => {
  try {
    const location = await searchLocationByName(String(req.params.name));
    res.json({ ok: true, location });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = locationSchema.parse(req.body);
    const location = await createLocation({ ...data, createdBy: req.user!.id });
    res.status(201).json({ ok: true, location });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = locationSchema.partial().parse(req.body);
    const location = await updateLocation(String(req.params.id), data);
    res.json({ ok: true, location });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const location = await deleteLocation(String(req.params.id));
    res.json({ ok: true, location });
  } catch (error) {
    next(error);
  }
});

export default router;
