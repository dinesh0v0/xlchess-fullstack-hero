import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver for Framer Motion viewport animations
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
