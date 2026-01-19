import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Mock framer-motion para evitar problemas com animacoes em testes
mock.module('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) =>
      React.createElement('div', props, children),
    p: ({ children, ...props }: React.PropsWithChildren<object>) =>
      React.createElement('p', props, children)
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) =>
    React.createElement(React.Fragment, null, children)
}));

// Importar depois dos mocks
import { SomaticLoader } from './SomaticLoader';

describe('SomaticLoader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default text', () => {
    render(<SomaticLoader />);
    expect(screen.getByText('ANALISANDO BIO-DADOS...')).toBeDefined();
  });

  it('renders with custom text', () => {
    render(<SomaticLoader text="PROCESSANDO..." />);
    expect(screen.getByText('PROCESSANDO...')).toBeDefined();
  });

  it('shows neural link message', () => {
    render(<SomaticLoader />);
    expect(screen.getByText('A100 NEURAL LINK ESTABLISHED')).toBeDefined();
  });
});
