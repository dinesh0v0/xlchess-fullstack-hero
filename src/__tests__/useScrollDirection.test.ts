/**
 * useScrollDirection Hook Tests
 *
 * Validates scroll direction detection and cleanup behavior.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollDirection } from '../hooks/useScrollDirection';

describe('useScrollDirection', () => {
  let scrollY: number;

  beforeEach(() => {
    scrollY = 0;
    Object.defineProperty(window, 'pageYOffset', {
      get: () => scrollY,
      configurable: true,
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "top" initially when scroll is at top', () => {
    scrollY = 0;
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe('top');
  });

  it('returns "top" when scrollY is below threshold (< 50)', () => {
    scrollY = 30;
    const { result } = renderHook(() => useScrollDirection());
    
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(result.current).toBe('top');
  });

  it('returns "down" when scrolling down past threshold', () => {
    const { result } = renderHook(() => useScrollDirection());
    
    scrollY = 100;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('down');
  });

  it('cleans up scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollDirection());
    
    unmount();
    
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
