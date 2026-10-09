// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors"; // 👈 1. Import cors
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";
import { authRateLimit } from "./middleware/rate-limit.js";

const app = express();

// 👈 2. Add CORS middleware BEFORE your routes
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001", // Allow your Next.js app
  credentials: true, // Allow cookies/auth headers if needed
}));

app.use(express.json());
app.use("/api/auth", authRateLimit);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);
app.use(errorHandler);

// 👈 3. Change the default fallback port to 4000 (or 5000)
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`🚀 http://localhost:${port}`));