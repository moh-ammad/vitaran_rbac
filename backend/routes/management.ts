import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
const classInput = z.object({ name: z.string().min(1).max(80), grade: z.number().int().min(1).max(12) });
const subjectInput = z.object({ name: z.string().min(1).max(80) });
const assignmentInput = z.object({ teacherId: z.string().uuid(), classSubjectId: z.string().uuid() });
const enrollmentInput = z.object({ studentId: z.string().uuid(), classId: z.string().uuid() });
const resourceInput = z.object({ title: z.string().min(1).max(160), description: z.string().max(500).optional(), type: z.enum(["BOOK", "QUESTION_PAPER"]), classSubjectId: z.string().uuid() });
const questionInput = z.object({ prompt: z.string().min(1).max(1000), options: z.array(z.string().max(200)).min(2).max(6), answer: z.string().max(200).optional() });

router.post("/classes", authenticate, requirePermission("classes.manage"), async (req, res, next) => {
  try { const data = classInput.parse(req.body); const item = await prisma.classGroup.create({ data }); res.status(201).json({ class: item }); } catch (error) { next(error); }
});
router.post("/subjects", authenticate, requirePermission("subjects.manage"), async (req, res, next) => {
  try { const data = subjectInput.parse(req.body); const item = await prisma.subject.create({ data }); res.status(201).json({ subject: item }); } catch (error) { next(error); }
});
router.patch("/subjects/:id/status", authenticate, requirePermission("subjects.manage"), async (req, res, next) => {
  try { const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id; const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body); if (!id) throw new HttpError(400, "Subject id is required"); const subject = await prisma.subject.update({ where: { id }, data: { isActive } }); res.json({ subject }); } catch (error) { next(error); }
});
router.post("/class-subjects", authenticate, requirePermission("subjects.manage"), async (req, res, next) => {
  try { const data = z.object({ classId: z.string().uuid(), subjectId: z.string().uuid() }).parse(req.body); const item = await prisma.classSubject.create({ data }); res.status(201).json({ classSubject: item }); } catch (error) { next(error); }
});
router.post("/assignments/teachers", authenticate, requirePermission("assignments.manage"), async (req, res, next) => {
  try { const data = assignmentInput.parse(req.body); const link = await prisma.classSubject.findUnique({ where: { id: data.classSubjectId } }); if (!link) throw new HttpError(404, "Class subject not found"); const item = await prisma.teacherAssignment.create({ data: { userId: data.teacherId, classId: link.classId, classSubjectId: link.id } }); res.status(201).json({ assignment: item }); } catch (error) { next(error); }
});
router.post("/assignments/students", authenticate, requirePermission("assignments.manage"), async (req, res, next) => {
  try { const data = enrollmentInput.parse(req.body); const item = await prisma.studentEnrollment.create({ data: { userId: data.studentId, classId: data.classId } }); res.status(201).json({ enrollment: item }); } catch (error) { next(error); }
});
router.post("/resources", authenticate, requirePermission("resources.create"), async (req, res, next) => {
  try {
    const data = resourceInput.parse(req.body);
    const assignment = await prisma.classSubject.findUnique({ where: { id: data.classSubjectId }, select: { classId: true, subjectId: true } });
    if (!assignment) throw new HttpError(404, "Class subject not found");
    const actor = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { role: { select: { slug: true } }, teacherAssignments: { where: { classSubjectId: data.classSubjectId }, select: { classSubjectId: true } } } });
    if (!actor) throw new HttpError(401, "User not found");
    if (actor.role?.slug !== "super-admin" && actor.teacherAssignments.length === 0) throw new HttpError(403, "You are not assigned to this subject");
    const resource = await prisma.resource.create({ data: { title: data.title, description: data.description ?? null, type: data.type, classSubjectId: data.classSubjectId, subjectId: assignment.subjectId, classes: { create: { classId: assignment.classId } } } });
    res.status(201).json({ resource });
  } catch (error) { next(error); }
});
router.post("/resources/:id/questions", authenticate, requirePermission("resources.create"), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = questionInput.parse(req.body);
    if (!id) throw new HttpError(400, "Resource id is required");
    const resource = await prisma.resource.findUnique({ where: { id }, select: { type: true, classSubjectId: true } });
    if (!resource || resource.type !== "QUESTION_PAPER") throw new HttpError(404, "Question paper not found");
    const actor = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { role: { select: { slug: true } }, teacherAssignments: { where: { classSubjectId: resource.classSubjectId ?? "" }, select: { classSubjectId: true } } } });
    if (actor?.role?.slug !== "super-admin" && !actor?.teacherAssignments.length) throw new HttpError(403, "You are not assigned to this subject");
    const count = await prisma.resourceQuestion.count({ where: { resourceId: id } });
      const question = await prisma.resourceQuestion.create({ data: { resourceId: id, prompt: data.prompt, options: data.options, answer: data.answer ?? null, order: count } });
    res.status(201).json({ question: { id: question.id, prompt: question.prompt, options: question.options, order: question.order } });
  } catch (error) { next(error); }
});
export default router;
