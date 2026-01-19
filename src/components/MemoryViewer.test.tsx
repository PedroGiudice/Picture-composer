// src/components/MemoryViewer.test.tsx
import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Mock dos servicos antes de importar o componente
const mockProcessSession = mock(() => Promise.resolve({
  instruction_title_pt_br: 'Test Title',
  instruction_text_pt_br: 'Test instruction',
  clinical_rationale_pt_br: 'Test rationale',
  intensity_metric: 5,
  duration_sec: 120
}));

const mockGenerateFallback = mock(() => Promise.resolve({
  title: 'Fallback Title',
  instruction: 'Fallback instruction',
  rationale: 'Fallback rationale'
}));

// Mock modulos
mock.module('../services/api', () => ({
  SomaticBackend: {
    processSession: mockProcessSession
  }
}));

mock.module('../services/ollama', () => ({
  OllamaService: {
    generateFallbackChallenge: mockGenerateFallback
  }
}));

// Mock framer-motion para evitar problemas com animacoes
mock.module('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => React.createElement('div', props, children),
    img: (props: object) => React.createElement('img', props)
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) => React.createElement(React.Fragment, null, children)
}));

// Importar componente apos mocks
import { MemoryViewer } from './MemoryViewer';

// Mock URL APIs
const mockCreateObjectURL = mock(() => 'blob:mock-url-' + Math.random());
const mockRevokeObjectURL = mock(() => {});

describe('MemoryViewer', () => {
  beforeEach(() => {
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render in SETUP state initially', () => {
    const files = [
      new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' })
    ];
    const onReset = mock(() => {});

    render(<MemoryViewer files={files} onReset={onReset} />);

    // Deve mostrar botao de iniciar
    expect(screen.getByText(/Initialize Protocol/i)).toBeDefined();
  });

  it('should create objectURL on mount', () => {
    const files = [
      new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' })
    ];

    render(<MemoryViewer files={files} onReset={() => {}} />);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
  });

  it('should revoke objectURL on unmount', () => {
    const files = [
      new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' })
    ];

    const { unmount } = render(<MemoryViewer files={files} onReset={() => {}} />);

    unmount();

    // Deve ter chamado revoke ao desmontar
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
});
