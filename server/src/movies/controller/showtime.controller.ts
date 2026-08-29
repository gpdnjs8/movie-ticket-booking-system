import { Request, Response } from "express";
import { success } from "../../common/response";
import { movieIdParamSchema, movieShowtimesQuerySchema } from "../dto/showtime.dto";
import { showtimeService } from "../service/showtime.service";

export const showtimeController = {
  async listByMovie(req: Request, res: Response) {
    const { id } = movieIdParamSchema.parse(req.params);
    const query = movieShowtimesQuerySchema.parse(req.query);
    const result = await showtimeService.listByMovie(BigInt(id), query);
    success(res, 200, result);
  },
};
