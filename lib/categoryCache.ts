import { prisma } from "@/lib/prisma";

type CategoryNameMap = Map<string, string>;

const TTL_MS = 60 * 60 * 1000;

let cache: { promise: Promise<CategoryNameMap>; expiresAt: number } | null =
  null;

export function getCategoryNameMap(): Promise<CategoryNameMap> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.promise;
  }

  const promise = prisma.itemCategory
    .findMany({ select: { categoryId: true, categoryName: true } })
    .then(
      (rows) =>
        new Map(rows.map((row) => [row.categoryId, row.categoryName])),
    )
    .catch((error) => {
      cache = null;
      throw error;
    });

  cache = { promise, expiresAt: now + TTL_MS };
  return promise;
}

export function invalidateCategoryCache() {
  cache = null;
}
