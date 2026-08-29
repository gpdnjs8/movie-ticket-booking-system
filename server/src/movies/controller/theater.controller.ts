import { Request, Response } from "express";
import { success } from "../../common/response";
import { theaterListQuerySchema } from "../dto/theater.dto";
import { theaterService } from "../service/theater.service";

export const theaterController = {
  async list(req: Request, res: Response) {
    const query = theaterListQuerySchema.parse(req.query);
    const result = await theaterService.list(query);
    success(res, 200, result);
  },
};
