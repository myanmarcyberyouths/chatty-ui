'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// interface User {
//   id: string
//   name: string
//   phone: string
//   role: 'admin' | 'student'
// }

// interface AuthContextType {
//   user: User | null
//   login: (phone: string, password: string) => Promise<void>
//   register: (name: string, phone: string, password: string) => Promise<void>
//   logout: () => void
//   isLoading: boolean
// }

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const register = async (name, phone, password) => {
    // In a real app, this would make an API call
    const newUser = {
      id: Math.random().toString(36).slice(2),
      name,
      phone,
      role: 'student'
    }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const login = async (phone, password) => {
    // In a real app, this would verify credentials with an API
    const mockUser = {
      id: '123',
      name: 'Test User',
      phone,
      role: 'student' 
    }
    localStorage.setItem('user', JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

