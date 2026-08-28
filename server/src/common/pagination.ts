import { z } from "zod";

export const DEFAULT_TAKE = 10;
export const MAX_TAKE = 50;

export const cursorQuerySchema = z.object({
  cursor: z.string().regex(/^\d+$/, "cursor는 숫자 문자열이어야 합니다.").optional(),
  take: z.coerce.number().int().min(1).max(MAX_TAKE).optional(),
});

export interface CursorPageDto<T> {
  items: T[];
  nextCursor: string | null;
}

export function buildCursorPage<Row extends { id: bigint }, Item>(
  rows: Row[],
  take: number,
  toItem: (row: Row) => Item
): CursorPageDto<Item> {
  const hasNext = rows.length > take;
  const pageRows = hasNext ? rows.slice(0, take) : rows;

  return {
    items: pageRows.map(toItem),
    nextCursor: hasNext ? pageRows[pageRows.length - 1].id.toString() : null,
  };
}
