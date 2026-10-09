// src/lib/jwt.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error("JWT_SECRET missing in .env");

export type JwtPayload = {
  sub: string;      // user id
  role: string;     // "super-admin" | "user" | whatever
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}