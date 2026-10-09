import { Router } from "express";
import { z } from "zod";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
const roleInput = z.object({ name: z.string().min(2).max(80), description: z.string().max(240).optional() });
const permissionInput = z.object({ permissions: z.array(z.string()).max(100) });

router.get("/permissions", authenticate, requirePermission("settings.manage"), async (_req, res, next) => {
  try { const permissions = await prisma.permission.findMany({ orderBy: { key: "asc" }, select: { id: true, key: true, name: true, description: true } }); res.json({ permissions }); } catch (error) { next(error); }
});

router.get("/roles", authenticate, requirePermission("settings.manage"), async (_req, res, next) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, description: true, isSystem: true, isActive: true, _count: { select: { users: true } }, permissions: { select: { permission: { select: { key: true } } } } } });
    res.json({ roles: roles.map((role) => ({ ...role, members: role._count.users, permissions: role.permissions.map(({ permission }) => permission.key) })) });
  } catch (error) { next(error); }
});

router.patch("/roles/:id/status", authenticate, requirePermission("settings.manage"), async (req, res, next) => {
  try {
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!roleId) throw new HttpError(400, "Role id is required");
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new HttpError(404, "Role not found");
    if (role.isSystem) throw new HttpError(400, "System roles cannot be disabled");
    const updated = await prisma.role.update({ where: { id: role.id }, data: { isActive } });
    res.json({ role: updated });
  } catch (error) { next(error); }
});

router.post("/roles", authenticate, requirePermission("settings.manage"), async (req, res, next) => {
  try {
    const data = roleInput.parse(req.body);
    const slug = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const role = await prisma.role.create({ data: { name: data.name.trim(), slug, description: data.description?.trim() || "Custom workspace role" } });
    const dashboard = await prisma.permission.findUnique({ where: { key: "dashboard.view" } });
    if (dashboard) await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: dashboard.id } });
    res.status(201).json({ role: { ...role, permissions: ["dashboard.view"] } });
  } catch (error) { next(error); }
});

router.put("/roles/:id/permissions", authenticate, requirePermission("settings.manage"), async (req, res, next) => {
  try {
    const { permissions } = permissionInput.parse(req.body);
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!roleId) throw new HttpError(400, "Role id is required");
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new HttpError(404, "Role not found");
    if (role.isSystem) throw new HttpError(400, "System roles cannot be edited");
    const rows = await prisma.permission.findMany({ where: { key: { in: permissions } }, select: { id: true, key: true } });
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      if (rows.length) await tx.rolePermission.createMany({ data: rows.map(({ id }) => ({ roleId: role.id, permissionId: id })) });
    });
    res.json({ role: { id: role.id, permissions: rows.map(({ key }) => key) } });
  } catch (error) { next(error); }
});

router.put("/users/:id/role", authenticate, requirePermission("settings.manage"), async (req, res, next) => {
  try {
    const { roleId } = z.object({ roleId: z.string().uuid() }).parse(req.body);
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!userId) throw new HttpError(400, "User id is required");
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new HttpError(404, "Role not found");
    const user = await prisma.user.update({ where: { id: userId }, data: { roleId, status: "ACTIVE" }, select: { id: true, email: true, name: true, status: true, role: { select: { id: true, name: true, slug: true } } } });
    res.json({ user });
  } catch (error) { next(error); }
});

export default router;
