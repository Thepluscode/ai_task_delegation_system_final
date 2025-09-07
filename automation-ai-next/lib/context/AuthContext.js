'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { api } from '@/lib/api/client'

// Auth context
const AuthContext = createContext()

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  UPDATE_USER: 'UPDATE_USER',
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: action.payload?.isLoading !== undefined ? action.payload.isLoading : false,
        error: null,
      }
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        isLoading: false,
      }
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      }
    
    default:
      return state
  }
}

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Demo mode for investor presentations - auto login
        const isDemoMode = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

        if (isDemoMode) {
          // Auto-login for demo
          const demoUser = {
            id: 'demo_user',
            name: 'Demo Admin',
            email: 'admin@enterprise.com',
            role: 'admin',
            company: 'Enterprise Demo'
          }
          const demoToken = 'demo_token_' + Date.now()

          localStorage.setItem('auth_token', demoToken)
          localStorage.setItem('user_data', JSON.stringify(demoUser))

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: demoUser,
              token: demoToken,
            },
          })
          return
        }

        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data') || localStorage.getItem('auth_user')

        if (token && userData) {
          const user = JSON.parse(userData)

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user,
              token,
            },
          })
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOGOUT,
            payload: { isLoading: false }
          })
        }
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth_user')
        dispatch({
          type: AUTH_ACTIONS.LOGOUT,
          payload: { isLoading: false }
        })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await api.post('/auth/login', credentials)
      const { user, token } = response

      // Store in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      return { success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      })
      return { success: false, error: error.message }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await api.post('/auth/register', userData)
      const { user, token } = response

      // Store in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      return { success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      })
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('user_data')
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { token } = response

      localStorage.setItem('auth_token', token)

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { token },
      })

      return token
    } catch (error) {
      logout()
      throw error
    }
  }

  // Update user function
  const updateUser = async (userData) => {
    try {
      const updatedUser = await api.put('/auth/profile', userData)

      localStorage.setItem('auth_user', JSON.stringify(updatedUser))

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user: updatedUser },
      })

      return updatedUser
    } catch (error) {
      throw error
    }
  }

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
