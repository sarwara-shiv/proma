import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  
import './utils/i18n';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Provider } from 'react-redux'; 
import { store } from './app/store'; 

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <SocketProvider>
    <AuthProvider>
    <AppProvider>
      <App />
      </AppProvider>
    </AuthProvider>
    </SocketProvider>
  </Provider>
);

