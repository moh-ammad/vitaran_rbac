import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getUserScope } from "../lib/scope.js";
import { prisma } from "../prisma/client.js";

const router = Router();
router.get("/classes", authenticate, requirePermission("classes.view"), async (req, res, next) => {
  try {
    const scope = await getUserScope(req.user!.sub);
    if (!scope) return res.status(404).json({ error: "User not found" });
    const classes = await prisma.classGroup.findMany({ ...(scope.classIds ? { where: { id: { in: scope.classIds } } } : {}), orderBy: { grade: "asc" }, select: { id: true, name: true, grade: true, subjects: { select: { id: true, subject: { select: { id: true, name: true } } } }, _count: { select: { students: true, teachers: true } } } });
    res.json({ classes });
  } catch (error) { next(error); }
});
router.get("/classes/:id", authenticate, requirePermission("classes.view"), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const scope = await getUserScope(req.user!.sub);
    if (!id || !scope || (scope.classIds && !scope.classIds.includes(id))) return res.status(404).json({ error: "Class not found" });
    const item = await prisma.classGroup.findUnique({ where: { id }, select: { id: true, name: true, grade: true, subjects: { select: { id: true, subject: { select: { id: true, name: true, isActive: true } } } }, _count: { select: { students: true, teachers: true } } } });
    if (!item) return res.status(404).json({ error: "Class not found" });
    res.json({ class: item });
  } catch (error) { next(error); }
});
export default router;
