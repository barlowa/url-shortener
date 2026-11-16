export interface ShortenUrlRequest {
  fullUrl: string;
  customAlias?: string;
}

export interface ShortenUrlResponse {
  alias: string;
  fullUrl: string;
  shortUrl: string;
}

export interface UrlListItem {
  alias: string;
  fullUrl: string;
  shortUrl: string;
}

export interface UrlListParams {
  PageNumber: number;
  PageSize: number;
}
export interface UrlListResponse {
  data: UrlListItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
export interface ApiError {
  error: string;
}
