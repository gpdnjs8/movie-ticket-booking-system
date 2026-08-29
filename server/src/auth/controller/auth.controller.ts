import { Request, Response } from "express";
import { success } from "../../common/response";
import { authService } from "../service/auth.service";
import { loginRequestSchema, registerRequestSchema } from "../dto/auth.dto";
import { AppError } from "../../errors/error";
import { getRefreshTokenMaxAgeMs } from "../../utils/jwt";

const REFRESH_COOKIE_NAME = "refreshToken";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: getRefreshTokenMaxAgeMs(),
    path: "/api/auth",
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerRequestSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.register(input);
    setRefreshCookie(res, refreshToken);
    success(res, 201, { accessToken, user });
  },

  async login(req: Request, res: Response) {
    const input = loginRequestSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.login(input);
    setRefreshCookie(res, refreshToken);
    success(res, 200, { accessToken, user });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw AppError.unauthorized("리프레시 토큰이 없습니다.", "INVALID_REFRESH_TOKEN");
    }
    const result = await authService.refresh(refreshToken);
    success(res, 200, result);
  },

  async logout(req: Request, res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    success(res, 200, { message: "로그아웃되었습니다." });
  },
};
