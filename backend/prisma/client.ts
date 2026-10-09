// backend/prisma/client.ts
import { PrismaClient } from "../generated/prisma/client.js"; // 👈 MUST be this path
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing in .env");

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });