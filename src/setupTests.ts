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

// Mock Web Worker
class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
Object.defineProperty(window, 'Worker', {
  writable: true,
  configurable: true,
  value: MockWorker,
});

// Mock HTML5 Audio
class MockAudio {
  play = vi.fn().mockResolvedValue(undefined);
  load = vi.fn();
  pause = vi.fn();
  currentTime = 0;
}
Object.defineProperty(window, 'Audio', {
  writable: true,
  configurable: true,
  value: MockAudio,
});
