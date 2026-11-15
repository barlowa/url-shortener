import { UrlListItem } from "../types/api";

interface UrlTableProps {
    urls: UrlListItem[];
    onDelete: (alias: string) => void;
}


export default function UrlTable({
    urls,
    onDelete,
}: UrlTableProps) {
    if (urls.length === 0) {
        return <p className="empty-state">No shortened URLs yet.</p>;
    }

    return (
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
    );
}