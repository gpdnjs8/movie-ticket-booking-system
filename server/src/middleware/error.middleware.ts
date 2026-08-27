import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/error";

// Express는 인자 개수(4개)로 에러 핸들러를 식별하므로 _next를 유지합니다.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "입력값이 올바르지 않습니다.",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: { code: "CONFLICT", message: "이미 선점된 자원입니다." },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "요청한 리소스를 찾을 수 없습니다." },
      });
    }
  }

  console.error(err);
  return res
    .status(500)
    .json({ error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." } });
}

// async 라우트 핸들러의 예외를 next(err)로 전달하기 위한 래퍼
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
