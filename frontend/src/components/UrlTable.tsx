import { UrlListItem } from "../types/api";

interface UrlTableProps {
    urls: UrlListItem[];
    onDelete: (alias: string) => void;
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSize?: number;
}

const pageSizeOptions = [5, 10, 20, 50];

export default function UrlTable({
    urls,
    onDelete,
    totalPages = 1,
    currentPage,
    onPageChange,
    pageSize,
    onPageSizeChange
}: UrlTableProps) {
    if (urls.length === 0) {
        return <p className="empty-state">No shortened URLs yet.</p>;
    }

    return (
        <div>

            <table className="url-table">
                <thead></thead>
                <tr>
                    <th>Alias</th>

                    <th>Short URL</th>


                    <th>Actions</th>

                </tr>
                <tbody>
                    {urls.map((url, index) => (
                        <tr key={`${url.alias}-${index}`}>
                            <td>
                                {url.alias}
                            </td>
                            <td>
                                <a
                                    href={url.fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="short-url-link"
                                >
                                    {url.shortUrl}
                                </a>
                            </td>
                            <td className="actions-cell">
                                <button className="btn-secondary" onClick={() => onDelete(url.alias)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => {

                        const pageNumber = i + 1; // Convert to 1-based page number for display

                        return (
                            <button
                                key={i}
                                className={currentPage === pageNumber ? "btn-primary" : "btn-secondary"}
                                onClick={() => onPageChange && onPageChange(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        )
                    })}
                </div>
                <div>
                    <select value={pageSize} onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}>
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size} per page
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}