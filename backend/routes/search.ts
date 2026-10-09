import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getUserScope } from "../lib/scope.js";
import { prisma } from "../prisma/client.js";

const router = Router();
router.get("/search", authenticate, requirePermission("dashboard.view"), async (req, res, next) => {
  try {
    const queryValue = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const query = typeof queryValue === "string" ? queryValue.trim() : "";
    if (query.length < 2) return res.json({ query, classes: [], resources: [], users: [] });
    const scope = await getUserScope(req.user!.sub);
    if (!scope) return res.status(404).json({ error: "User not found" });
    const resourceScope = scope.isTeacher && scope.classSubjectIds ? { classSubjectId: { in: scope.classSubjectIds } } : scope.classIds ? { classes: { some: { classId: { in: scope.classIds } } } } : {};
    const [classes, resources] = await Promise.all([
      prisma.classGroup.findMany({ where: { name: { contains: query, mode: "insensitive" }, ...(scope.classIds ? { id: { in: scope.classIds } } : {}) }, take: 10, select: { id: true, name: true, grade: true } }),
      prisma.resource.findMany({ where: { title: { contains: query, mode: "insensitive" }, ...resourceScope }, take: 10, select: { id: true, title: true, type: true } }),
    ]);
    const users = scope.isAdmin ? await prisma.user.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] }, take: 10, select: { id: true, name: true, email: true } }) : [];
    res.json({ query, classes, resources, users });
  } catch (error) { next(error); }
});
export default router;
