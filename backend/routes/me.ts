import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../prisma/client.js";

const router = Router();
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { id: true, email: true, name: true, status: true, role: { select: { id: true, name: true, slug: true, permissions: { select: { permission: { select: { key: true } } } } } } } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { ...user, permissions: user.role?.permissions.map(({ permission }) => permission.key) ?? [] } });
  } catch (error) { next(error); }
});
export default router;
