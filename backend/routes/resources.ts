import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getUserScope } from "../lib/scope.js";
import { prisma } from "../prisma/client.js";

const router = Router();
async function listResources(type: "BOOK" | "QUESTION_PAPER", req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1], next: Parameters<Parameters<typeof router.get>[1]>[2]) {
  try {
    const scope = await getUserScope(req.user!.sub);
    if (!scope) return res.status(404).json({ error: "User not found" });
    const resources = await prisma.resource.findMany({ where: { type, subject: { isActive: true }, ...(scope.isTeacher && scope.classSubjectIds ? { classSubjectId: { in: scope.classSubjectIds } } : scope.classIds ? { classes: { some: { classId: { in: scope.classIds } } } } : {}) }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, description: true, type: true, subject: { select: { id: true, name: true, isActive: true } }, classes: { select: { classGroup: { select: { id: true, name: true, grade: true } } } } } });
    res.json({ resources });
  } catch (error) { next(error); }
}
router.get("/resources/:id", authenticate, requirePermission("dashboard.view"), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const scope = await getUserScope(req.user!.sub);
    if (!id || !scope) return res.status(404).json({ error: "Resource not found" });
    const resource = await prisma.resource.findFirst({ where: { id, subject: { isActive: true }, ...(scope.isTeacher && scope.classSubjectIds ? { classSubjectId: { in: scope.classSubjectIds } } : scope.classIds ? { classes: { some: { classId: { in: scope.classIds } } } } : {}) }, select: { id: true, title: true, description: true, type: true, subject: { select: { id: true, name: true } }, classes: { select: { classGroup: { select: { id: true, name: true, grade: true } } } }, questions: { orderBy: { order: "asc" }, select: { id: true, prompt: true, options: true, order: true } } } });
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json({ resource });
  } catch (error) { next(error); }
});
router.get("/books", authenticate, requirePermission("books.view"), (req, res, next) => listResources("BOOK", req, res, next));
router.get("/question-papers", authenticate, requirePermission("question-papers.view"), (req, res, next) => listResources("QUESTION_PAPER", req, res, next));
export default router;
