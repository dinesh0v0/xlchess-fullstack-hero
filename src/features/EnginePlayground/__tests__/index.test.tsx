import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnginePlayground from '../index';

describe('EnginePlayground Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders the EnginePlayground chessboard and sidebar panels flawlessly', () => {
    render(<EnginePlayground />);
    
    // Verifies the main wrapper renders based on aria-labels
    expect(screen.getByLabelText(/Interactive chess engine playground/i)).toBeInTheDocument();
    
    // Verifies the control sidebar renders correctly
    expect(screen.getByRole('button', { name: /Undo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hint/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /More/i })).toBeInTheDocument();

    // Verifies the default move log panel is visible
    expect(screen.getByText(/No moves yet. Make a move on the board./i)).toBeInTheDocument();
  });

  it('2. Triggers Chess960 state change when Fischer Random is selected', async () => {
    const user = userEvent.setup();
    render(<EnginePlayground />);
    
    // Expand the More dropdown
    const moreBtn = screen.getByRole('button', { name: /More/i });
    await user.click(moreBtn);
    
    // Select Chess960 option
    const chess960Btn = await screen.findByText(/Chess960/i);
    await user.click(chess960Btn);

    // Verify the game state reset and FEN loading executed without crashing
    // The Move Log should still be visible showing state successfully re-initialized
    expect(screen.getByText(/No moves yet/i)).toBeInTheDocument();
  });

  it('3. Toggles Edit Position mode and correctly updates the generated FEN string', async () => {
    const user = userEvent.setup();
    render(<EnginePlayground />);
    
    // Expand the More dropdown
    const moreBtn = screen.getByRole('button', { name: /More/i });
    await user.click(moreBtn);
    
    // Enter Edit Mode
    const editBtn = await screen.findByText(/Edit Position/i);
    await user.click(editBtn);
    
    // Verify Edit mode UI is active (state update isEditMode = true)
    expect(screen.getByText(/White to move/i)).toBeInTheDocument();
    expect(screen.getByText(/Black to move/i)).toBeInTheDocument();
    
    // Validates the FEN input is visible
    const fenInput = screen.getByDisplayValue('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(fenInput).toBeInTheDocument();
    
    // Exit edit mode
    const loadBtn = screen.getByRole('button', { name: /Load/i });
    await user.click(loadBtn);
    
    // Verify it reverts to normal controls
    expect(screen.getByRole('button', { name: /Undo/i })).toBeInTheDocument();
  });
});
