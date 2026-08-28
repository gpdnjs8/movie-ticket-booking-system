import { Response } from "express";

export function sendSuccess<T>(res: Response, statusCode: number, data: T) {
  return res.status(statusCode).json({ data });
}
