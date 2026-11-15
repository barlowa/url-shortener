import type {
  ShortenUrlRequest,
  ShortenUrlResponse,
  UrlListParams,
  UrlListResponse,
} from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  shorten(request: ShortenUrlRequest): Promise<ShortenUrlResponse> {
    return fetch(`${API_BASE}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }).then((r) => handleResponse<ShortenUrlResponse>(r));
  },

  listAll(params: UrlListParams): Promise<UrlListResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString();

    return fetch(`${API_BASE}/urls?${queryString}`).then((r) =>
      handleResponse<UrlListResponse>(r),
    );
  },

  delete(alias: string): Promise<void> {
    return fetch(`${API_BASE}/${encodeURIComponent(alias)}`, {
      method: "DELETE",
    }).then((r) => handleResponse<void>(r));
  },

  getAlias(alias: string): Promise<ShortenUrlResponse> {
    return fetch(`${API_BASE}/${encodeURIComponent(alias)}`).then((r) =>
      handleResponse<ShortenUrlResponse>(r),
    );
  },
};
