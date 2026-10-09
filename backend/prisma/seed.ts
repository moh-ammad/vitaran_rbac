import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const permissions = [
  ["dashboard.view", "View dashboard"], ["users.view", "View users"], ["school.view", "View school stats"],
  ["classes.view", "View classes"], ["classes.manage", "Create and manage classes"], ["subjects.manage", "Create and manage subjects"],
  ["books.view", "View books"], ["question-papers.view", "View question papers"], ["resources.create", "Create books and question papers"],
  ["assignments.manage", "Assign teachers and students"], ["instructions.view", "View instructions"], ["settings.manage", "Manage roles and permissions"],
] as const;

async function main() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL ?? "admin@lms.com";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "admin123";
  const password = await bcrypt.hash(adminPassword, 10);
  const permissionRows = new Map<string, string>();
  for (const [key, name] of permissions) { const permission = await prisma.permission.upsert({ where: { key }, update: { name }, create: { key, name } }); permissionRows.set(key, permission.id); }
  const adminRole = await prisma.role.upsert({ where: { slug: "super-admin" }, update: { name: "Super Admin", isSystem: true }, create: { name: "Super Admin", slug: "super-admin", description: "Full workspace access", isSystem: true } });
  const pendingRole = await prisma.role.upsert({ where: { slug: "user" }, update: { name: "User", isSystem: true }, create: { name: "User", slug: "user", description: "Pending account with dashboard access", isSystem: true } });
  for (const permissionId of permissionRows.values()) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId } }, update: {}, create: { roleId: adminRole.id, permissionId } });
  const dashboardPermission = permissionRows.get("dashboard.view");
  if (dashboardPermission) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: pendingRole.id, permissionId: dashboardPermission } }, update: {}, create: { roleId: pendingRole.id, permissionId: dashboardPermission } });
  await prisma.user.upsert({ where: { email: adminEmail }, update: { password, roleId: adminRole.id, status: "ACTIVE" }, create: { email: adminEmail, password, name: "Super Admin", roleId: adminRole.id, status: "ACTIVE" } });
  console.log(`Bootstrapped super admin ${adminEmail} and ${permissions.length} system permissions. No demo school data was created.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
