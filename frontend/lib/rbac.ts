import { BarChart3, BookOpen, Building2, ClipboardList, GraduationCap, HelpCircle, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "@/types";

export type Permission = "dashboard.view" | "users.view" | "school.view" | "classes.view" | "classes.manage" | "subjects.manage" | "books.view" | "question-papers.view" | "resources.create" | "assignments.manage" | "instructions.view" | "settings.manage";

export type NavItem = { label: string; href: string; icon: LucideIcon; permission: Permission };

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3, permission: "dashboard.view" },
  { label: "Users", href: "/users", icon: Users, permission: "users.view" },
  { label: "School", href: "/school", icon: Building2, permission: "school.view" },
  { label: "Classes", href: "/classes", icon: GraduationCap, permission: "classes.view" },
  { label: "Assignments", href: "/assignments", icon: Users, permission: "assignments.manage" },
  { label: "Books", href: "/books", icon: BookOpen, permission: "books.view" },
  { label: "Question Papers", href: "/question-papers", icon: ClipboardList, permission: "question-papers.view" },
  { label: "Instructions", href: "/instructions", icon: HelpCircle, permission: "instructions.view" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "settings.manage" },
];

// Temporary seed data for the UI. These permissions will move to Prisma-backed roles.
export const demoRolePermissions: Record<string, Permission[]> = {
  "super-admin": navItems.map((item) => item.permission),
  user: ["dashboard.view"],
  teacher: ["dashboard.view", "classes.view", "books.view", "question-papers.view", "instructions.view"],
  student: ["dashboard.view", "books.view", "question-papers.view", "instructions.view"],
};

export function hasPermission(user: AuthUser | null, permission: Permission) {
  if (!user) return false;
  if (user.permissions) return user.permissions.includes(permission);
  return demoRolePermissions[user.role]?.includes(permission) ?? false;
}

export function getVisibleNavItems(user: AuthUser | null) {
  return navItems.filter((item) => hasPermission(user, item.permission));
}
