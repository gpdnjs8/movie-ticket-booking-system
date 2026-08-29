import { Response } from "express";

export function success<T>(res: Response, statusCode: number, data: T) {
  return res.status(statusCode).json({ data });
}
