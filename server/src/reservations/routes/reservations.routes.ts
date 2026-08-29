import { Router } from "express";
import { reservationController } from "../controller/reservation.controller";
import { asyncHandler } from "../../middleware/error.middleware";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/reservations:
 *   post:
 *     summary: 좌석 예매
 *     description: >
 *       상영시간(showtimeId)과 좌석 목록(seatIds, 1~6개, 중복 불가)을 받아 예매를 생성한다.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [showtimeId, seatIds]
 *             properties:
 *               showtimeId: { type: string }
 *               seatIds:
 *                 type: array
 *                 items: { type: string }
 *                 minItems: 1
 *                 maxItems: 6
 *     responses:
 *       201:
 *         description: 예매 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     showtimeId: { type: string }
 *                     totalPrice: { type: integer }
 *                     status: { type: string }
 *                     createdAt: { type: string, format: date-time }
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           seatId: { type: string }
 *                           row: { type: string }
 *                           number: { type: integer }
 *       400: { description: seatIds 개수/중복 오류(VALIDATION_ERROR) 또는 상영에 속하지 않는 좌석(INVALID_SEATS) }
 *       401: { description: 인증되지 않은 요청 }
 *       404: { description: 상영 정보를 찾을 수 없음(SHOWTIME_NOT_FOUND) }
 *       409: { description: 이미 예약된 좌석이 포함됨(SEAT_ALREADY_BOOKED) }
 */
router.post("/", requireAuth, asyncHandler(reservationController.create));

/**
 * @openapi
 * /api/reservations/me:
 *   get:
 *     summary: 예매 내역 조회
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: 이전 응답의 nextCursor 값. 없으면 최신 예매부터 조회
 *       - in: query
 *         name: take
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: 예매 내역 조회 성공
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
 *                           showtimeId: { type: string }
 *                           movieTitle: { type: string }
 *                           theaterName: { type: string }
 *                           screenName: { type: string }
 *                           startAt: { type: string, format: date-time }
 *                           totalPrice: { type: integer }
 *                           status: { type: string }
 *                           createdAt: { type: string, format: date-time }
 *                           seats:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 seatId: { type: string }
 *                                 row: { type: string }
 *                                 number: { type: integer }
 *                     nextCursor: { type: string, nullable: true }
 *       401: { description: 인증되지 않은 요청 }
 */
router.get("/me", requireAuth, asyncHandler(reservationController.listMine));

export default router;
