import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { prisma } from "../prisma/client.js";

const router = Router();
router.get("/users", authenticate, requirePermission("users.view"), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, name: true, status: true, createdAt: true, role: { select: { id: true, name: true, slug: true } } } });
    res.json({ users });
  } catch (error) { next(error); }
});
export default router;
