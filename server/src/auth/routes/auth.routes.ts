import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { asyncHandler } from "../../middleware/error.middleware";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: 회원가입 성공. accessToken은 응답 바디, refreshToken은 httpOnly 쿠키로 발급됨
 *       409: { description: 이미 가입된 이메일 }
 */
router.post("/register", asyncHandler(authController.register));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: 로그인 성공 }
 *       401: { description: 인증 실패 }
 */
router.post("/login", asyncHandler(authController.login));

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: accessToken 재발급
 *     tags: [Auth]
 *     responses:
 *       200: { description: 재발급 성공 }
 *       401: { description: 쿠키가 없거나 유효하지 않은 리프레시 토큰 }
 */
router.post("/refresh", asyncHandler(authController.refresh));

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: 로그아웃 처리됨 }
 *       401: { description: 인증되지 않은 요청 }
 */
router.post("/logout", requireAuth, asyncHandler(authController.logout));

export default router;
