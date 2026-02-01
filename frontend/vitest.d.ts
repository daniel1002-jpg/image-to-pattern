/// <reference types="vitest" />
import '@testing-library/jest-dom';

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface CustomMatchers<R = void> {
  toBeInTheDocument(): R;
  toBeVisible(): R;
  toBeEmptyDOMElement(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toBeInvalid(): R;
  toBeValid(): R;
  toBeRequired(): R;
  toHaveAttribute(attr: string, value?: string): R;
  toHaveClass(className: string): R;
  toHaveFormValues(values: Record<string, any>): R;
  toHaveStyle(css: string | Record<string, any>): R;
  toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
  toHaveValue(value: string | number | string[]): R;
  toBeChecked(): R;
  toBePartiallyChecked(): R;
  toHaveErrorMessage(message: string): R;
}
