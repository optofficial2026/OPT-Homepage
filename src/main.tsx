import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const page = document.body.dataset.page ?? 'home';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App page={page} />
  </StrictMode>,
);
