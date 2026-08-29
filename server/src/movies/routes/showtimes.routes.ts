import { Router } from "express";
import { seatController } from "../controller/seat.controller";
import { asyncHandler } from "../../middleware/error.middleware";

const router = Router();

/**
 * @openapi
 * /api/showtimes/{id}/seats:
 *   get:
 *     summary: 상영 회차의 좌석 목록 조회
 *     description: 좌석마다 isBooked로 예약 여부를 표시한다.
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: 상영(showtime) ID
 *     responses:
 *       200:
 *         description: 좌석 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     showtimeId: { type: string }
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           row: { type: string }
 *                           number: { type: integer }
 *                           isBooked: { type: boolean }
 *       400: { description: 잘못된 상영 ID }
 *       404: { description: 상영 정보를 찾을 수 없음 }
 */
router.get("/:id/seats", asyncHandler(seatController.listByShowtime));

export default router;
