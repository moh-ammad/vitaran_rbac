import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { prisma } from "../prisma/client.js";

const router = Router();
router.get("/school/stats", authenticate, requirePermission("school.view"), async (_req, res, next) => {
  try {
    const [users, teachers, students, classes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { teacherAssignments: { some: {} } } }),
      prisma.user.count({ where: { enrollments: { some: {} } } }),
      prisma.classGroup.count(),
    ]);
    res.json({ stats: { users, teachers, students, classes } });
  } catch (error) { next(error); }
});
export default router;
