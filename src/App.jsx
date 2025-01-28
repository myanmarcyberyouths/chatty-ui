
import './App.css'
import NotFound from './pages/NotFound'
import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/layout'
import AuthLayout from './components/auth-layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/chat/Home'
import ChatConversation from './pages/chat/ChatConversation'
import { useAuth, AuthProvider } from './contexts/auth-context'

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/register" />
  }

  return children
}

function App() {
  return (
    <>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Layout/>
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path=':recipientId' element={<ChatConversation />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </AuthProvider>
    </>
  )
}

export default App
