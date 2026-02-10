import '@testing-library/jest-dom';
import { afterAll, vi } from 'vitest';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Enable React act() environment to avoid warnings in tests
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const anchorClickSpy = vi
  .spyOn(HTMLAnchorElement.prototype, 'click')
  .mockImplementation(() => {});

afterAll(() => {
  anchorClickSpy.mockRestore();
});
