// src/middleware/error.ts
import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Something went wrong";
  res.status(status).json({ error: message });
}