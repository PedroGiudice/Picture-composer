// src/components/Button.test.tsx
import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from './Button';

describe('Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-rose-600');
  });

  it('applies secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-slate-800');
  });

  it('applies outline variant when specified', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-slate-700');
    expect(button.className).toContain('bg-transparent');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    // Should be disabled when loading
    expect(button).toBeDisabled();
    // Should have spinner (svg with animate-spin)
    const svg = button.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Button icon={<TestIcon />}>With Icon</Button>);
    expect(screen.getByTestId('test-icon')).toBeDefined();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = mock(() => {});
    render(<Button onClick={handleClick}>Clickable</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = mock(() => {});
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Disabled buttons don't fire click events in the DOM
    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  it('does not call onClick when loading', () => {
    const handleClick = mock(() => {});
    render(<Button onClick={handleClick} isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  it('merges custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });
});
