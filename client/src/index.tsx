import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  
import './utils/i18n';
import App from './App';
import { AppProvider } from './context/AppContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <AppProvider>
    <App />
    </AppProvider>
);

