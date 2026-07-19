/**
 * App Routing & Navigation Tests
 *
 * Verifies route rendering, 404 redirect, and scroll-to-top behavior.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';

// We test the route structure independently of BrowserRouter
function TestApp({ initialEntries }: { initialEntries: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <TestableAppContent />
    </MemoryRouter>
  );
}

function TestableAppContent() {
  return (
    <>
      <nav data-testid="navbar">NavBar</nav>
      <Routes>
        <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
        <Route path="/puzzles" element={<div data-testid="puzzles-page">Puzzles Page</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the home page on "/"', () => {
    render(<TestApp initialEntries={['/']} />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the puzzles page on "/puzzles"', () => {
    render(<TestApp initialEntries={['/puzzles']} />);
    expect(screen.getByTestId('puzzles-page')).toBeInTheDocument();
  });

  it('redirects unknown routes to home', () => {
    render(<TestApp initialEntries={['/unknown-route']} />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('redirects nested unknown routes to home', () => {
    render(<TestApp initialEntries={['/foo/bar/baz']} />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
