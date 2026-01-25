import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock ThemeContext
mock.module('@/context/ThemeContext', () => ({
  useTheme: () => ({
    mode: 'hot',
    setMode: mock(() => {}),
  }),
}));

// Mock Modal
mock.module('./Modal', () => ({
  Modal: ({ children, isOpen, title }: any) => (
    isOpen ? <div data-testid="modal-mock"><h1>{title}</h1>{children}</div> : null
  ),
}));

// Import component after mocks
import { ConfigModal } from './ConfigModal';

describe('ConfigModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly when open', () => {
    const mockOnClose = mock(() => {});
    render(<ConfigModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('modal-mock')).toBeDefined();
    expect(screen.getByText('System Configuration')).toBeDefined();
    expect(screen.getByText('Experience Mode')).toBeDefined();
    expect(screen.getByLabelText('Gemini API Key')).toBeDefined();
  });

  it('does not render when closed', () => {
    const mockOnClose = mock(() => {});
    render(<ConfigModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByTestId('modal-mock')).toBeNull();
  });

  it('updates API key input', () => {
    const mockOnClose = mock(() => {});
    render(<ConfigModal isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByLabelText('Gemini API Key') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    
    expect(input.value).toBe('new-api-key');
  });

  it('calls onClose when save is clicked', () => {
    const mockOnClose = mock(() => {});
    render(<ConfigModal isOpen={true} onClose={mockOnClose} />);
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});
