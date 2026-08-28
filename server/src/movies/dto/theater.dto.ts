import { z } from "zod";
import { cursorQuerySchema } from "../../common/pagination";

export const theaterListQuerySchema = cursorQuerySchema;

export type TheaterListQueryDto = z.infer<typeof theaterListQuerySchema>;

export interface TheaterListItemDto {
  id: string;
  name: string;
}
