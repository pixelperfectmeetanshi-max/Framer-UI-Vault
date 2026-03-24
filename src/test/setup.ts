/**
 * Test setup file for vitest
 * Configures testing environment with jsdom and testing-library matchers
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock timers for testing auto-dismiss functionality
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
