using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using UrlShortener.Api.Data;
using UrlShortener.Api.Models;

namespace UrlShortener.Api.Services;

public class UrlShortenerService : IUrlShortenerService
{
    private readonly AppDbContext _db;

    public UrlShortenerService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ShortenUrlResponse> ShortenAsync(ShortenUrlRequest request, string baseUrl)
    {
        var alias = string.IsNullOrWhiteSpace(request.CustomAlias)
            ? GenerateAlias()
            : request.CustomAlias.Trim();

        if (!IsValidAlias(alias))
            throw new ArgumentException("Alias may only contain letters, numbers, and hyphens (2–64 characters).");

        var exists = await _db.ShortenedUrls.AnyAsync(u => u.Alias == alias);
        if (exists)
            throw new InvalidOperationException($"The alias '{alias}' is already taken.");

        var entry = new ShortenedUrl
        {
            Alias = alias,
            FullUrl = request.FullUrl
        };

        _db.ShortenedUrls.Add(entry);
        await _db.SaveChangesAsync();

        return new ShortenUrlResponse
        {
            Alias = alias,
            FullUrl = request.FullUrl,
            ShortUrl = $"{baseUrl}/{alias}"
        };
    }

    public async Task<string?> GetFullUrlAsync(string alias)
    {
        var entry = await _db.ShortenedUrls
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Alias == alias);

        return entry?.FullUrl;
    }

    public async Task<IEnumerable<UrlListItem>> GetAllAsync(string baseUrl)
    {
        return await _db.ShortenedUrls
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UrlListItem
            {
                Alias = u.Alias,
                FullUrl = u.FullUrl,
                ShortUrl = $"{baseUrl}/{u.Alias}"
            })
            .ToListAsync();
    }

    public async Task<bool> DeleteAsync(string alias)
        //method to delete a shortened url from the database based on the alias provided. It returns true if the deletion was successful, and false if no entry was found for the given alias.
        // It first queries the database for an entry with the specified alias. If found, it removes the entry and saves the changes to the database. If not found, it simply returns false.
        // The method uses asynchronous operations to ensure non-blocking database access, which is important for scalability and performance in web applications.
        // The use of AsNoTracking in the GetFullUrlAsync and GetAllAsync methods improves performance for read-only queries by not tracking the returned entities in the DbContext's change tracker.
        // The GenerateAlias and IsValidAlias methods are placeholders for the logic to generate a unique alias and validate the alias format, respectively. The actual implementation of these methods would depend on the specific requirements of the URL shortening service.
    {
        // added a variable 
        var entry = await _db.ShortenedUrls.FirstOrDefaultAsync(u => u.Alias == alias);

        if (entry is null)
            return false;

        //changed order of operations here - previously it was being saved before being removed so nothing was happening

        //remove the entry
        _db.ShortenedUrls.Remove(entry);

        //await and save to db
        await _db.SaveChangesAsync();

        return true;
    }

    // --- Private helpers ---

    private static string GenerateAlias()
    {
        //helper method used to generate an alias when one isn't provided by the user 
        const string choices = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        //This generates a random alias with 16 characters.
        return RandomNumberGenerator.GetString(choices, 16);
    }

    private static bool IsValidAlias(string alias)
    {
        if (alias.Length < 2 || alias.Length > 64)
            return false;

        return alias.All(c => char.IsLetterOrDigit(c) || c == '-');
    }
}