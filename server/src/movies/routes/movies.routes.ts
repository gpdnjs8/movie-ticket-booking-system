import { Router } from "express";
import { movieController } from "../controller/movie.controller";
import { showtimeController } from "../controller/showtime.controller";
import { asyncHandler } from "../../middleware/error.middleware";

const router = Router();

/**
 * @openapi
 * /api/movies:
 *   get:
 *     summary: 영화 목록 조회
 *     tags: [Movies]
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
 *         description: 영화 목록 조회 성공
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
 *                           title: { type: string }
 *                           genre: { type: string }
 *                           runtimeMin: { type: integer }
 *                           score: { type: string }
 *                           releaseDate: { type: string, nullable: true }
 *                           posterUrl: { type: string, nullable: true }
 *                     nextCursor: { type: string, nullable: true }
 *       400: { description: 잘못된 쿼리 파라미터 }
 */
router.get("/", asyncHandler(movieController.list));

/**
 * @openapi
 * /api/movies/{id}/showtimes:
 *   get:
 *     summary: 영화 상영시간 조회
 *     description: >
 *       특정 영화를 특정 날짜에 상영 중인 영화관 목록과 각 영화관별 상영시간 목록을 반환한다.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: 영화 ID
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: 조회할 날짜(YYYY-MM-DD) (생략 시 오늘 날짜)
 *       - in: query
 *         name: theaterId
 *         schema: { type: string }
 *         description: 특정 영화관 id (생략 시 전체 영화관)
 *     responses:
 *       200:
 *         description: 상영시간 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     theaters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           theaterId: { type: string }
 *                           theaterName: { type: string }
 *                           showtimes:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id: { type: string }
 *                                 screenName: { type: string }
 *                                 startAt: { type: string, format: date-time }
 *                                 endAt: { type: string, format: date-time }
 *                                 price: { type: integer }
 *       400: { description: 잘못된 영화 ID, date 형식(YYYY-MM-DD), 또는 theaterId }
 *       404: { description: 영화를 찾을 수 없음 }
 */
router.get("/:id/showtimes", asyncHandler(showtimeController.listByMovie));

export default router;
