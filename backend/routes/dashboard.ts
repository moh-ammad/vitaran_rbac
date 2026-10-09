import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getUserScope } from "../lib/scope.js";
import { prisma } from "../prisma/client.js";

const router = Router();
router.get("/dashboard/stats", authenticate, requirePermission("dashboard.view"), async (req, res, next) => {
  try {
    const scope = await getUserScope(req.user!.sub);
    if (!scope) return res.status(404).json({ error: "User not found" });
    const classFilter = scope.classIds ? { id: { in: scope.classIds } } : {};
    const resourceFilter = scope.classIds ? { classes: { some: { classId: { in: scope.classIds } } } } : undefined;
    const [users, classes, books, questionPapers] = await Promise.all([
      scope.isAdmin ? prisma.user.count() : prisma.user.count({ where: { enrollments: { some: { classId: { in: scope.classIds ?? [] } } } } }),
      prisma.classGroup.count({ where: classFilter }),
      prisma.resource.count({ where: { type: "BOOK", ...resourceFilter } }),
      prisma.resource.count({ where: { type: "QUESTION_PAPER", ...resourceFilter } }),
    ]);
    res.json({ stats: { users, classes, books, questionPapers } });
  } catch (error) { next(error); }
});
export default router;
