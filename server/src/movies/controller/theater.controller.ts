import { Request, Response } from "express";
import { sendSuccess } from "../../common/response";
import { theaterListQuerySchema } from "../dto/theater.dto";
import { theaterService } from "../service/theater.service";

export const theaterController = {
  async list(req: Request, res: Response) {
    const query = theaterListQuerySchema.parse(req.query);
    const result = await theaterService.list(query);
    sendSuccess(res, 200, result);
  },
};
