import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders headline', () => {
    render(<App />);
    expect(screen.getByText(/TokTickIt Frontend/i)).toBeInTheDocument();
  });
});
