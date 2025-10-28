import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#cbd5e1',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '90vw',
          },
          success: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#1e293b',
            },
            style: {
              border: '1px solid #f59e0b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
