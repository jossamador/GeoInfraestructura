import { Router } from "express";
import { z } from "zod";
import { getProfile, loginUser, registerUser } from "../services/auth.service";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const authBaseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res, next) => {
  try {
    const data = authBaseSchema.extend({ name: z.string().min(2) }).parse(req.body);
    const result = await registerUser(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = authBaseSchema.parse(req.body);
    const result = await loginUser(data);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await getProfile(req.user!.id);
    res.json({ ok: true, profile });
  } catch (error) {
    next(error);
  }
});

export default router;
