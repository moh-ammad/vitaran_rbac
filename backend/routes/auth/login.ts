// src/routes/auth/login.ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/client.js";
import { comparePassword } from "../../lib/password.js";
import { signToken } from "../../lib/jwt.js";
import { HttpError } from "../../middleware/error.js";

const router = Router();

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = bodySchema.parse(req.body);

    // 1. Fetch the user AND include the related role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });

    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await comparePassword(password, user.password);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    // 2. Safely get the role slug string (fallback to "user")
    const roleSlug = user.role?.slug ?? "user";
    const permissions = user.role?.permissions.map(({ permission }) => permission.key) ?? ["dashboard.view"];

    // 3. Generate token using the slug
    const token = signToken({ 
      sub: user.id, 
      role: roleSlug // 👈 FIXED: Pass the string slug, not the object
    });

    // 4. Return the same shape as register.ts
    res.json({
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: { slug: roleSlug },
        status: user.status,
        permissions,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;