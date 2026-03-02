export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export interface ApiPaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
}

export interface ApiListResponse<TItem> {
  data: TItem[];
  meta?: ApiPaginationMeta;
}

