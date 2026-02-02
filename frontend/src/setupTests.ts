import '@testing-library/jest-dom';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Enable React act() environment to avoid warnings in tests
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
