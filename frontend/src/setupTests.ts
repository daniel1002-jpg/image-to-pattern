import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Enable React act() environment to avoid warnings in tests
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let anchorClickSpy: ReturnType<typeof vi.spyOn> | null = null;

beforeEach(() => {
  anchorClickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
});

afterEach(() => {
  anchorClickSpy?.mockRestore();
  anchorClickSpy = null;
});
