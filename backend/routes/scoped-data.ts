import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getUserScope } from "../lib/scope.js";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
router.get("/teacher-students", authenticate, requirePermission("classes.view"), async (req, res, next) => {
  try {
    const classSubjectId = z.string().uuid().parse(req.query.classSubjectId);
    const scope = await getUserScope(req.user!.sub);
    if (!scope || scope.isAdmin) return res.status(400).json({ error: "Use the users endpoint for administrative access" });
    if (!scope.classSubjectIds?.includes(classSubjectId)) throw new HttpError(403, "Subject is not assigned to this teacher");
    const link = await prisma.classSubject.findUnique({ where: { id: classSubjectId }, select: { classId: true, subject: { select: { id: true, name: true } }, classGroup: { select: { id: true, name: true } } } });
    if (!link) throw new HttpError(404, "Class subject not found");
    const students = await prisma.studentEnrollment.findMany({ where: { classId: link.classId }, select: { user: { select: { id: true, name: true, email: true, status: true } } } });
    res.json({ class: link.classGroup, subject: link.subject, students: students.map(({ user }) => user) });
  } catch (error) { next(error); }
});

router.get("/my-subjects", authenticate, requirePermission("dashboard.view"), async (req, res, next) => {
  try {
    const scope = await getUserScope(req.user!.sub);
    if (!scope) return res.status(404).json({ error: "User not found" });
    const subjects = await prisma.classSubject.findMany({ ...(scope.isTeacher && scope.classSubjectIds ? { where: { id: { in: scope.classSubjectIds } } } : scope.classIds ? { where: { classId: { in: scope.classIds } } } : {}), select: { id: true, subject: { select: { id: true, name: true } }, classGroup: { select: { id: true, name: true, grade: true } } }, orderBy: { subject: { name: "asc" } } });
    res.json({ subjects });
  } catch (error) { next(error); }
});
export default router;
