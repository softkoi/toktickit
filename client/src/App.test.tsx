import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Component Health & Category List', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders title and Check System button initially without auto-fetching', () => {
    render(<App />);

    expect(screen.getByText('TokTickIT IT Service Desk')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check System/i })).toBeInTheDocument();
    expect(screen.queryByText('System Status: Online')).not.toBeInTheDocument();
    expect(screen.queryByText('System Status: Offline')).not.toBeInTheDocument();
  });

  it('renders categories list when button is clicked and APIs succeed', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: 'Account and Access' },
          { id: 2, name: 'Hardware' },
        ],
      } as Response);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Check System/i }));

    await waitFor(() => {
      expect(screen.getByText('System Status: Online')).toBeInTheDocument();
      expect(screen.getByText('Account and Access')).toBeInTheDocument();
      expect(screen.getByText('Hardware')).toBeInTheDocument();
    });
  });

  it('renders error message when API call fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Check System/i }));

    await waitFor(() => {
      expect(screen.getByText('System Status: Offline')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to TokTickIT API')).toBeInTheDocument();
    });
  });
});
