import { Request, Response } from "express";
import { success } from "../../common/response";
import { showtimeIdParamSchema } from "../dto/seat.dto";
import { seatService } from "../service/seat.service";

export const seatController = {
  async listByShowtime(req: Request, res: Response) {
    const { id } = showtimeIdParamSchema.parse(req.params);
    const userId = req.user ? BigInt(req.user.userId) : undefined;
    const result = await seatService.listByShowtime(BigInt(id), userId);
    success(res, 200, result);
  },
};
