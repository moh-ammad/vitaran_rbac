// backend/routes/auth/register.ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/client.js"; 
import { hashPassword } from "../../lib/password.js";
import { signToken } from "../../lib/jwt.js";
import { HttpError } from "../../middleware/error.js";

const router = Router();

const bodySchema = z.object({
  email: z.email(), // Zod v4 fix
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

router.post("/register", async (req, res, next) => {
  try {
    const data = bodySchema.parse(req.body);

    // 1. Check if user already exists
    const exists = await prisma.user.findUnique({ 
      where: { email: data.email } 
    });
    if (exists) throw new HttpError(409, "Email already exists");

    // 2. Find the default "user" role
    const defaultRole = await prisma.role.findUnique({
      where: { slug: "user" },
    });

    if (!defaultRole) {
      throw new HttpError(500, "Default user role not found. Please run 'npx prisma db seed'");
    }

    // 3. Create the user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name, 
        password: await hashPassword(data.password),
        roleId: defaultRole.id,
        status: "PENDING",
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        role: { select: { slug: true, permissions: { select: { permission: { select: { key: true } } } } } },
        createdAt: true,
      },
    });

    // 4. Generate token
    const token = signToken({ 
      sub: user.id, 
      role: user.role?.slug ?? "user"
    });

    res.status(201).json({ user: { ...user, permissions: user.role?.permissions.map(({ permission }) => permission.key) ?? ["dashboard.view"] }, token });
  } catch (error) {
    next(error);
  }
});

export default router;