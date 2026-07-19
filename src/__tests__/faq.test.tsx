/**
 * FAQ Accordion Tests
 *
 * Validates rendering, toggle behavior, and accessibility.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FaqAccordion from '../features/SeoContentSection/FaqAccordion';

describe('FaqAccordion', () => {
  it('renders the heading', () => {
    render(<FaqAccordion />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders all FAQ questions', () => {
    render(<FaqAccordion />);
    expect(screen.getByText('Is DAChess really free?')).toBeInTheDocument();
    expect(screen.getByText('What chess engine does DAChess use?')).toBeInTheDocument();
    expect(screen.getByText('How do the chess puzzles work?')).toBeInTheDocument();
    expect(screen.getByText('Is DAChess available on mobile?')).toBeInTheDocument();
  });

  it('does NOT render the removed "sign in" question', () => {
    render(<FaqAccordion />);
    expect(screen.queryByText(/sign in to play with friends/i)).not.toBeInTheDocument();
  });

  it('first FAQ is expanded by default', () => {
    render(<FaqAccordion />);
    const firstButton = screen.getByText('Is DAChess really free?').closest('button');
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking a closed FAQ expands it', () => {
    render(<FaqAccordion />);
    const engineButton = screen.getByText('What chess engine does DAChess use?').closest('button');
    expect(engineButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(engineButton!);
    expect(engineButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking an expanded FAQ collapses it', () => {
    render(<FaqAccordion />);
    const firstButton = screen.getByText('Is DAChess really free?').closest('button');
    
    // Initially expanded
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click to collapse
    fireEvent.click(firstButton!);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('all FAQ toggle buttons have aria-expanded attribute', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveAttribute('aria-expanded');
    });
  });
});
