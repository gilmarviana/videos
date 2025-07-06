import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if Supabase is properly configured
  useEffect(() => {
    console.log('AuthProvider: Checking Supabase configuration...')
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set')
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  }, [])

  useEffect(() => {
    console.log('AuthProvider: Starting initialization...')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting current user...')
        const { data: { user }, error } = await auth.getCurrentUser()
        console.log('AuthProvider: getCurrentUser result:', { user: !!user, error })
        
        if (error) {
          console.error('Error getting current user:', error)
          setLoading(false)
          return
        }
        
        if (user) {
          console.log('AuthProvider: User found, loading data...')
          setUser(user)
          await loadUserData(user.id)
        } else {
          console.log('AuthProvider: No user found')
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        console.log('AuthProvider: Setting loading to false')
        setLoading(false)
      }
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false')
      setLoading(false)
    }, 3000) // Reduced to 3 seconds for faster debugging

    // Start initialization
    getInitialSession().catch(error => {
      console.error('getInitialSession failed:', error)
      setLoading(false)
    })

    // Listen for auth changes
    console.log('AuthProvider: Setting up auth state listener...')
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setSubscription(null)
      }
      setLoading(false)
    })

    return () => {
      console.log('AuthProvider: Cleaning up...')
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId) => {
    try {
      console.log('Loading user data for:', userId)
      
      // Load profile
      const { data: profileData, error: profileError } = await db.getProfile(userId)
      if (profileError) {
        console.error('Error loading profile:', profileError)
      } else if (profileData) {
        setProfile(profileData)
        console.log('Profile loaded:', profileData)
      }

      // Load subscription
      const { data: subscriptionData, error: subscriptionError } = await db.getSubscription(userId)
      if (subscriptionError) {
        console.error('Error loading subscription:', subscriptionError)
      } else if (subscriptionData) {
        setSubscription(subscriptionData)
        console.log('Subscription loaded:', subscriptionData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await auth.signUp(email, password, userData)
      if (error) throw error

      // Create profile
      if (data.user) {
        await db.createProfile({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          role: 'client',
          created_at: new Date().toISOString()
        })
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      const { data, error } = await db.updateProfile(user.id, updates)
      if (error) throw error
      
      setProfile(data[0])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const subscribe = async (planId) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      const { data, error } = await db.createSubscription({
        user_id: user.id,
        plan_id: planId,
        active: true,
        created_at: new Date().toISOString()
      })
      
      if (error) throw error
      
      // Reload subscription data
      await loadUserData(user.id)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const hasAccess = (contentType) => {
    if (!subscription || !subscription.active) return false
    
    // If it's a trial subscription, give access to everything
    if (subscription.is_trial) {
      return true
    }
    
    const plan = subscription.subscription_plans
    if (!plan) return false

    switch (contentType) {
      case 'basic':
        return true
      case 'vip':
        return plan.includes_vip
      default:
        return true
    }
  }

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  const isTrialValid = () => {
    if (!subscription || !subscription.is_trial) return false
    
    const now = new Date()
    const expiresAt = new Date(subscription.expires_at)
    
    return now < expiresAt
  }

  const value = {
    user,
    profile,
    subscription,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    subscribe,
    hasAccess,
    isAdmin,
    isTrialValid,
    loadUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext