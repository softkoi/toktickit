import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Component Health Check', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders health status when API call succeeds', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
    } as Response);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('TokTickIT API')).toBeInTheDocument();
      expect(screen.getByText('ok')).toBeInTheDocument();
    });
  });

  it('renders error message when API call fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/ไม่สามารถเชื่อมต่อกับ Server ได้/i)
      ).toBeInTheDocument();
    });
  });
});
