export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status?: "PENDING" | "ACTIVE" | "SUSPENDED";
  permissions?: string[];
};

export type AuthResponse = {
  user: { id: string; email: string; name: string | null; role: string | { slug: string }; status?: AuthUser["status"]; permissions?: string[] };
  token: string;
};

export function normalizeUser(user: AuthResponse["user"]): AuthUser {
  return { ...user, role: typeof user.role === "string" ? user.role : user.role.slug, permissions: user.permissions ?? [] };
}
