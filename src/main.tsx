import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { MessageQueueProvider } from './MessageQueueContext.tsx';
import { RecoilRoot } from 'recoil';
import { AppThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <AppThemeProvider>
  <MessageQueueProvider>
  <RecoilRoot>
    <App />
    </RecoilRoot>
    </MessageQueueProvider>
    </AppThemeProvider>
  </React.StrictMode>,
)
