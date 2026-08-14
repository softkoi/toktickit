import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Component Health Check UI', () => {
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

  it('renders System Status: Online when Check System button is clicked and API call succeeds', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
    } as Response);

    render(<App />);

    const button = screen.getByRole('button', { name: /Check System/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('System Status: Online')).toBeInTheDocument();
    });
  });

  it('renders offline error message when Check System button is clicked and API call fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    const button = screen.getByRole('button', { name: /Check System/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('System Status: Offline')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to TokTickIT API')).toBeInTheDocument();
    });
  });
});
