import { Request, Response } from "express";
import { success } from "../../common/response";
import { showtimeIdParamSchema } from "../dto/seat.dto";
import { seatService } from "../service/seat.service";

export const seatController = {
  async listByShowtime(req: Request, res: Response) {
    const { id } = showtimeIdParamSchema.parse(req.params);
    const result = await seatService.listByShowtime(BigInt(id));
    success(res, 200, result);
  },
};
