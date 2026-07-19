/**
 * Contact Form Tests
 *
 * Validates form rendering, validation states, and subject selection.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactSection from '../features/ContactSection';

describe('ContactSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactSection />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('renders the heading', () => {
    render(<ContactSection />);
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });

  it('renders all subject topic pills', () => {
    render(<ContactSection />);
    
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Partnerships')).toBeInTheDocument();
  });

  it('submit button is disabled when fields are empty', () => {
    render(<ContactSection />);
    const submitBtn = screen.getByRole('button', { name: /send message/i });
    expect(submitBtn).toBeDisabled();
  });

  it('submit button enables when all required fields are filled', () => {
    render(<ContactSection />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Dinesh' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'dinesh@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Great platform!' } });
    
    const submitBtn = screen.getByRole('button', { name: /send message/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('allows selecting different subject topics', () => {
    render(<ContactSection />);
    
    const supportBtn = screen.getByText('Support');
    fireEvent.click(supportBtn);
    
    // The Support button should now have the active class (bg-brand-accent)
    expect(supportBtn.className).toContain('bg-brand-accent');
  });

  it('General is selected by default', () => {
    render(<ContactSection />);
    
    const generalBtn = screen.getByText('General');
    expect(generalBtn.className).toContain('bg-brand-accent');
  });
});
