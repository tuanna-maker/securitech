/**
 * Parse pagination params from URL.
 */
export function parsePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(
    Math.max(1, parseInt(url.searchParams.get("limit") || "20")),
    100
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build standard paginated response body.
 */
export function paginatedResponse(
  data: unknown[],
  total: number | null,
  page: number,
  limit: number
) {
  return { data, total: total ?? 0, page, limit };
}
