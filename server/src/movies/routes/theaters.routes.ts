import { Router } from "express";
import { theaterController } from "../controller/theater.controller";
import { asyncHandler } from "../../middleware/error.middleware";

const router = Router();

/**
 * @openapi
 * /api/theaters:
 *   get:
 *     summary: 영화관 목록 조회
 *     tags: [Theaters]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: 이전 응답의 nextCursor 값. 없으면 첫 페이지부터 조회
 *       - in: query
 *         name: take
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *         description: 페이지당 조회 개수
 *     responses:
 *       200:
 *         description: 영화관 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           name: { type: string }
 *                     nextCursor: { type: string, nullable: true }
 *       400: { description: 잘못된 쿼리 파라미터 }
 */
router.get("/", asyncHandler(theaterController.list));

export default router;
