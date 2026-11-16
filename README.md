# Snip – URL Shortener

A full-stack URL shortener built with **C# / ASP.NET Core 8** (backend) and **React + TypeScript** (frontend), containerised with Docker.

---

## Project setup

the front end requires a .env file to be created in the root of the frontend directory with the following content. Also see the .env.example file for reference.

```
VITE_API_BASE_URL=http://localhost:5000
```

To use swagger on the backend, you can add an environment variable to the backend project. In Visual Studio, right click on the UrlShortener.Api project, select Properties, then Debug, and add the following environment variable:

```
ASPNETCORE_ENVIRONMENT=Development
```

## Front end setup

Run the following commands to build and run the project:

```bash
cd frontend
npm install
npm run dev
npm run test
# check the frontend is running at http://localhost:3000 and check the tests are passing
```

## Backend setup

```bash
cd backend/UrlShortener.Api
dotnet restore
dotnet build
dotnet run
# check the backend is running at http://localhost:5000 and check the tests are passing
cd ../UrlShortener.Tests
dotnet test
```

## Docker container

```bash
# Build and run the backend and frontend in Docker.
docker-compose up --build
# this will stop and remove the containers, networks, and volumes created by docker-compose up
docuker-compose down
```

## Architecture

```
frontend/      React + TypeScript (Vite)
backend/
  UrlShortener.Api/      ASP.NET Core 8 Web API + SQLite (EF Core)
  UrlShortener.Tests/    xUnit unit + integration tests
docker-compose.yml       Orchestrates both services
```

The frontend proxies API calls through Nginx in production, so there are no CORS concerns once containerised. In development, Vite's dev server proxies to the local API.

---

## API reference

The API matches the provided `openapi.yaml` contract exactly.

| Method   | Path       | Description              |
| -------- | ---------- | ------------------------ |
| `POST`   | `/shorten` | Create a shortened URL   |
| `GET`    | `/urls`    | List all shortened URLs  |
| `GET`    | `/{alias}` | Redirect to the full URL |
| `DELETE` | `/{alias}` | Delete a shortened URL   |

### POST /shorten

```json
// Request
{
  "fullUrl": "https://example.com/very/long/path",
  "customAlias": "my-alias"   // optional
}

// Response 201
{
  "alias": "my-alias",
  "fullUrl": "https://example.com/very/long/path",
  "shortUrl": "http://localhost:8080/my-alias"
}
```

Returns `400` if the URL is invalid, the alias is malformed, or the alias is already taken.

### GET /urls

```json
// Response 200
[
  {
    "alias": "my-alias",
    "fullUrl": "https://example.com/very/long/path",
    "shortUrl": "http://localhost:8080/my-alias"
  }
]
```

### GET /{alias}

Returns `302 Redirect` to the full URL, or `404` if the alias doesn't exist.

### DELETE /{alias}

Returns `204 No Content` on success, `404` if alias not found.

---

## Design decisions & assumptions

**Persistence** — SQLite via EF Core. Zero-dependency, file-based. The database file path is configurable via `DatabasePath` in `appsettings.json` or an environment variable, and is volume-mounted in Docker so data survives container restarts.

**Alias validation** — Aliases must be 2–64 characters, containing only letters, numbers, and hyphens. This mirrors typical URL shortener conventions and avoids characters that are awkward in URLs.

**Random alias generation** —

**Error handling** — A global exception middleware catches unhandled exceptions and returns a clean JSON `{ "error": "..." }` envelope. Domain errors (duplicate alias, invalid input) are surfaced as typed exceptions from the service layer, translated to 400s in the controller.

**Testing** — The backend has both unit tests (service layer, in-memory EF) and integration tests (`WebApplicationFactory` + in-memory EF, full HTTP stack). The frontend has component tests (React Testing Library) and service layer tests (mocked fetch).

**Frontend** — Intentionally lightweight: a custom hook (`useUrlShortener`) owns all state and API interaction; components are purely presentational. No external state management library is needed at this scale.

**CORS** — Allowed origins are configured in `appsettings.json`. In the Docker Compose setup, the Nginx reverse proxy means the frontend and API appear on the same origin to the browser, so CORS is only relevant in local development.
