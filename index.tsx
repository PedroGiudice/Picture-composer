import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    // Explicitly clear any pre-existing content or error messages
    container.innerHTML = '';
    
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("CRITICAL: Failed to mount React application", error);
    // Fallback UI if React itself crashes during mount
    container.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #0f172a;
        color: #f87171;
        font-family: ui-sans-serif, system-ui, sans-serif;
        padding: 2rem;
        text-align: center;
      ">
        <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Application Error</h1>
        <p style="color: #94a3b8; margin-bottom: 2rem;">The application failed to start.</p>
        <div style="
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.5rem;
          font-family: monospace;
          font-size: 0.875rem;
          max-width: 100%;
          overflow-x: auto;
          border: 1px solid #334155;
          text-align: left;
        ">${error instanceof Error ? error.message : String(error)}</div>
      </div>
    `;
  }
} else {
  console.error("Failed to find root element");
}