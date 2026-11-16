import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UrlTable from '../UrlTable'
import type { UrlListItem } from '../../types/api';

const mockUrls: UrlListItem[] = [
  { alias: 'abc', fullUrl: 'https://example.com', shortUrl: 'http://localhost:8080/abc' },
  { alias: 'def', fullUrl: 'https://another.com/path', shortUrl: 'http://localhost:8080/def' },
];

describe('UrlTable', () => {
  it('shows empty state when there are no URLs', () => {
    render(<UrlTable urls={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no shortened urls yet/i)).toBeInTheDocument();
  });

  it('renders a row for each URL', () => {
    render(<UrlTable urls={mockUrls} onDelete={vi.fn()} />);
    expect(screen.getByText('http://localhost:8080/abc')).toBeInTheDocument();
    expect(screen.getByText('http://localhost:8080/def')).toBeInTheDocument();
  });

  it('calls onDelete with the alias when delete is clicked', () => {
    const onDelete = vi.fn();
    render(<UrlTable urls={mockUrls} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(onDelete).toHaveBeenCalledWith('abc');
  });

  it('renders page buttons and marks the current page', () => {
    render(
      <UrlTable
        urls={mockUrls}
        onDelete={vi.fn()}
        totalPages={3}
        currentPage={2}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '1' })).toHaveClass('btn-secondary');
    expect(screen.getByRole('button', { name: '2' })).toHaveClass('btn-primary');
    expect(screen.getByRole('button', { name: '3' })).toHaveClass('btn-secondary');
  });

  it('calls onPageChange with the selected page', () => {
    const onPageChange = vi.fn();
    render(
      <UrlTable
        urls={mockUrls}
        onDelete={vi.fn()}
        totalPages={3}
        currentPage={1}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('marks the only page as current when there is a single page', () => {
    render(
      <UrlTable
        urls={mockUrls}
        onDelete={vi.fn()}
        totalPages={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '1' })).toHaveClass('btn-primary');
  });

  it('shows the selected page size and available options', () => {
    render(
      <UrlTable
        urls={mockUrls}
        onDelete={vi.fn()}
        pageSize={20}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('20');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '5 per page',
      '10 per page',
      '20 per page',
      '50 per page',
    ]);
  });

  it('calls onPageSizeChange with the selected numeric page size', () => {
    const onPageSizeChange = vi.fn();
    render(
      <UrlTable
        urls={mockUrls}
        onDelete={vi.fn()}
        pageSize={10}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
