import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { expect } from 'vitest';

/**
 * Sets up the initial pattern by rendering the app, uploading a file, and generating a pattern.
 * This helper reduces code duplication across zoom scenario tests.
 * 
 * @param user - The userEvent instance from userEvent.setup()
 * @returns An object containing the input element and generateButton for further interactions
 */
export async function setupInitialPattern(user: ReturnType<typeof userEvent.setup>) {
  render(React.createElement(App));
  const file = new File(['dummy'], 'test.png', { type: 'image/png' });
  const input = screen.getByTitle('file');
  await user.upload(input, file);

  const generateButton = screen.getByRole('button', { name: /generar patrón/i });
  await user.click(generateButton);

  await waitFor(() => {
    expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
  });

  return { input, generateButton };
}

/**
 * Helper to generate a new pattern by uploading a new file and clicking generate.
 * 
 * @param user - The userEvent instance from userEvent.setup()
 * @param input - The file input element from setupInitialPattern
 * @param generateButton - The generate button element from setupInitialPattern
 */
export async function generateNewPattern(
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLInputElement,
  generateButton: HTMLElement
) {
  const newFile = new File(['dummy2'], 'test2.png', { type: 'image/png' });
  await user.upload(input, newFile);
  await user.click(generateButton);

  await waitFor(() => {
    expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
  });
}
