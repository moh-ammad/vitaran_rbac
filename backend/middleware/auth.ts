// src/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../lib/jwt.js";
import { HttpError } from "./error.js";
import { prisma } from "../prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return next(new HttpError(401, "Missing token"));

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

// Use on any route: requireRole("super-admin")
export function requireRole(...allowed: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Unauthorized"));
    if (!allowed.includes(req.user.role))
      return next(new HttpError(403, "Forbidden"));
    next();
  };
}

export function requirePermission(permission: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) return next(new HttpError(401, "Unauthorized"));
      const user = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { status: true, role: { select: { slug: true, isActive: true, permissions: { select: { permission: { select: { key: true } } } } } } },
      });
      if (!user) return next(new HttpError(401, "User not found"));
      if (user.status === "SUSPENDED") return next(new HttpError(403, "Account suspended"));
      if (!user.role?.isActive) return next(new HttpError(403, "Role disabled"));
      const allowed = user.role?.permissions.some(({ permission: rolePermission }) => rolePermission.key === permission);
      if (!allowed) return next(new HttpError(403, "Forbidden"));
      next();
    } catch (error) {
      next(error);
    }
  };
}