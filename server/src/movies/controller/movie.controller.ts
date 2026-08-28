import { Request, Response } from "express";
import { sendSuccess } from "../../common/response";
import { movieListQuerySchema } from "../dto/movie.dto";
import { movieService } from "../service/movie.service";

export const movieController = {
  async list(req: Request, res: Response) {
    const query = movieListQuerySchema.parse(req.query);
    const result = await movieService.list(query);
    sendSuccess(res, 200, result);
  },
};
