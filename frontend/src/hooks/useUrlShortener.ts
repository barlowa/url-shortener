import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api";
import type { ShortenUrlResponse, UrlListItem } from "../types/api";

interface UseUrlShortenerReturn {
  urls: UrlListItem[];
  loading: boolean;
  error: string | null;
  lastCreated: ShortenUrlResponse | null;
  shorten: (fullUrl: string, customAlias?: string) => Promise<void>;
  deleteUrl: (alias: string) => Promise<void>;
  clearLastCreated: () => void;
  setPageSize: (count: number) => void;
  setPageNumber: (page: number) => void;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export function useUrlShortener(): UseUrlShortenerReturn {
  const [urls, setUrls] = useState<UrlListItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<ShortenUrlResponse | null>(
    null,
  );
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, totalPages } = await api.listAll({
        PageNumber: currentPage,
        PageSize: currentPageSize,
      });
      setUrls(data ?? []);
      setTotalPages(totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load URLs.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentPageSize]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const shorten = useCallback(
    async (fullUrl: string, customAlias?: string) => {
      setError(null);
      setLastCreated(null);
      try {
        const result = await api.shorten({
          fullUrl,
          customAlias: customAlias || undefined,
        });
        setLastCreated(result);
        // Refresh the list
        await fetchAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to shorten URL.");
      }
    },
    [fetchAll],
  );

  const deleteUrl = useCallback(async (alias: string) => {
    setError(null);
    try {
      await api.delete(alias);
      setUrls((prev) => prev.filter((u) => u.alias !== alias));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete URL.");
    }
  }, []);

  const clearLastCreated = useCallback(() => setLastCreated(null), []);

  return {
    urls,
    loading,
    error,
    lastCreated,
    shorten,
    deleteUrl,
    clearLastCreated,
    setPageSize: setCurrentPageSize,
    setPageNumber: setCurrentPage,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
  };
}
