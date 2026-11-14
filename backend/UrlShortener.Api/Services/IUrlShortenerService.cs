using UrlShortener.Api.Models;

namespace UrlShortener.Api.Services;

public interface IUrlShortenerService
{
    Task<ShortenUrlResponse> ShortenAsync(ShortenUrlRequest request, string baseUrl);
    Task<string?> GetFullUrlAsync(string alias);

    Task<PagedResponse<UrlListItem>> GetAllAsync(
        string baseUrl,
        PaginationParams paginationParams);

    Task<bool> DeleteAsync(string alias);
}