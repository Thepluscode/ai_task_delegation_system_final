import { useState, useEffect, useContext, createContext } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      
      // Check for stored auth token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      // For demo purposes, create a mock user
      // In a real app, you'd validate the token with your backend
      const mockUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@automation.ai',
        role: 'admin',
        avatar: '/avatars/admin.jpg',
        permissions: ['read', 'write', 'admin'],
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      }

      setUser(mockUser)
      setError(null)
    } catch (err) {
      console.error('Auth check failed:', err)
      setError(err.message)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      // Mock login - in a real app, you'd call your authentication API
      if (credentials.email === 'admin@automation.ai' && credentials.password === 'admin123') {
        const token = 'mock_jwt_token_' + Date.now()
        localStorage.setItem('auth_token', token)
        
        const user = {
          id: '1',
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          avatar: '/avatars/admin.jpg',
          permissions: ['read', 'write', 'admin'],
          lastLogin: new Date().toISOString(),
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        }

        setUser(user)
        router.push('/dashboard')
        return { success: true, user }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Clear local storage
      localStorage.removeItem('auth_token')
      
      // Clear user state
      setUser(null)
      setError(null)
      
      // Redirect to login
      router.push('/login')
    } catch (err) {
      console.error('Logout failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      // In a real app, you'd sync this with your backend
      console.log('User updated:', updatedUser)
    }
  }

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    hasPermission,
    isAdmin,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    // Fallback for when used outside of AuthProvider
    return {
      user: {
        id: '1',
        name: 'Demo User',
        email: 'demo@automation.ai',
        role: 'admin',
        avatar: '/avatars/demo.jpg',
        permissions: ['read', 'write', 'admin']
      },
      loading: false,
      error: null,
      login: async () => ({ success: true }),
      logout: async () => {},
      updateUser: () => {},
      hasPermission: () => true,
      isAdmin: () => true,
      checkAuth: () => {}
    }
  }
  
  return context
}
