import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/error";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("인증 토큰이 필요합니다.");
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized("유효하지 않거나 만료된 토큰입니다.");
  }
}
