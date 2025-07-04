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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user } } = await auth.getCurrentUser()
      if (user) {
        setUser(user)
        await loadUserData(user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
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
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId) => {
    try {
      // Load profile
      const { data: profileData } = await db.getProfile(userId)
      if (profileData) {
        setProfile(profileData)
      }

      // Load subscription
      const { data: subscriptionData } = await db.getSubscription(userId)
      if (subscriptionData) {
        setSubscription(subscriptionData)
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
    loadUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext