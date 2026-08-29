import { Request, Response } from "express";
import { sendSuccess } from "../../common/response";
import { createReservationSchema, myReservationsQuerySchema } from "../dto/reservation.dto";
import { reservationService } from "../service/reservation.service";

export const reservationController = {
  async create(req: Request, res: Response) {
    const input = createReservationSchema.parse(req.body);
    const userId = BigInt(req.user!.userId);
    const result = await reservationService.create(userId, input);
    sendSuccess(res, 201, result);
  },

  async listMine(req: Request, res: Response) {
    const query = myReservationsQuerySchema.parse(req.query);
    const userId = BigInt(req.user!.userId);
    const result = await reservationService.listMine(userId, query);
    sendSuccess(res, 200, result);
  },
};
