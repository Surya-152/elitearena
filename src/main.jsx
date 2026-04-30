// src/main.jsx
import ReactDOM from 'react-dom/client';
import App      from './App.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import './index.css';

// Production: no StrictMode (prevents double useEffect runs = faster)
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
