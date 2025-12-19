import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './app.css';

function renderApp(root: HTMLElement) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}

function mountWhenReady() {
  const root = document.getElementById('root');
  if (root) {
    renderApp(root);
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const readyRoot = document.getElementById('root');
      if (readyRoot) renderApp(readyRoot);
    });
  }
}

mountWhenReady();
