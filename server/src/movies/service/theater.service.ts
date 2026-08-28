import { buildCursorPage, CursorPageDto, DEFAULT_TAKE } from "../../common/pagination";
import { TheaterListItemDto, TheaterListQueryDto } from "../dto/theater.dto";
import { theaterRepository } from "../repository/theater.repository";

export const theaterService = {
  async list(query: TheaterListQueryDto): Promise<CursorPageDto<TheaterListItemDto>> {
    const take = query.take ?? DEFAULT_TAKE;
    const cursor = query.cursor ? BigInt(query.cursor) : undefined;

    const rows = await theaterRepository.findMany({ cursor, take });

    return buildCursorPage(rows, take, (row) => ({
      id: row.id.toString(),
      name: row.name,
    }));
  },
};
