
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
          <Route path=':userId' element={<ChatConversation />} />
          {/* <Route path="course" element={<Course />} />
          <Route path="course/:courseId/module" element={<Module/>} />
          <Route path="course/:courseId/module/:moduleId/activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
          <Route path="courses" element={<Course />} />
          <Route path="recent" element={<Course />} />
          <Route path="my-courses" element={<Course />} />
          <Route path="manage" element={<Manage />} />
          <Route path="enrollment" element={<Enroll />} /> */}
          {/* Redirect any unmatched routes to the dashboard */}
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Catch all route */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
      </AuthProvider>
    </>
  )
}

export default App
