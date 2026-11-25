import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const ctrlOrMeta = e.ctrlKey || e.metaKey;
  if (
    e.key === 'F12' ||
    (ctrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
    (ctrlOrMeta && e.altKey && (key === 'i' || key === 'j' || key === 'c' || key === 'u')) ||
    (ctrlOrMeta && (key === 'u' || key === 's'))
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
