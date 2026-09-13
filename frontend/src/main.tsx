import App from './App.tsx'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '825902409748-038mb9uht9h0p1j6cibdntv21m49j3i7.apps.googleusercontent.com'; // Placeholder if missing

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </GoogleOAuthProvider>
)
