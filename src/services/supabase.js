import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Validate URL before creating client
const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Use a mock client if environment variables are not set
const createMockClient = () => {
  console.warn('Supabase environment variables not found. Using mock client.')
  return {
    auth: {
      signUp: async () => ({ data: null, error: { message: 'Mock: Sign up not available' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Mock: Sign in not available' } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (callback) => {
        // Mock auth state change
        callback('SIGNED_OUT', null)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Mock: Database not available' } }) }) }),
      insert: () => ({ select: async () => ({ data: null, error: { message: 'Mock: Database not available' } }) }),
      update: () => ({ eq: () => ({ select: async () => ({ data: null, error: { message: 'Mock: Database not available' } }) }) }),
      delete: () => ({ eq: async () => ({ data: null, error: { message: 'Mock: Database not available' } }) }),
      upsert: async () => ({ data: null, error: { message: 'Mock: Database not available' } }),
      order: () => ({ limit: async () => ({ data: [], error: null }) })
    })
  }
}

export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey !== 'your-anon-key' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

// Auth functions
export const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    try {
      console.log('getCurrentUser: Starting...')
      
      // Use getSession which is more reliable for session restoration
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('getCurrentUser: Session result:', { hasSession: !!session, hasUser: !!session?.user, error })
      
      if (error) {
        console.error('Error getting session:', error)
        return { data: { user: null }, error }
      }
      
      return { data: { user: session?.user || null }, error: null }
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      return { data: { user: null }, error }
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database functions
export const db = {
  // User profiles
  createProfile: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
    return { data, error }
  },

  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  },

  // Subscriptions
  createSubscription: async (subscription) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
    return { data, error }
  },

  getSubscription: async (userId) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  },

  // Videos
  getVideos: async (filters = {}) => {
    let query = supabase
      .from('videos')
      .select('*, categories(*)')
      .eq('active', true)

    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters.is_vip !== undefined) {
      query = query.eq('is_vip', filters.is_vip)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  getVideo: async (id) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*, categories(*)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  createVideo: async (video) => {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
    return { data, error }
  },

  updateVideo: async (id, updates) => {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteVideo: async (id) => {
    const { data, error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name')
    return { data, error }
  },

  createCategory: async (category) => {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
    return { data, error }
  },

  // Subscription plans
  getSubscriptionPlans: async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price')
    return { data, error }
  },

  // Watch history
  addToWatchHistory: async (userId, videoId) => {
    const { data, error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: userId,
        video_id: videoId,
        watched_at: new Date().toISOString()
      })
    return { data, error }
  },

  getWatchHistory: async (userId) => {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*, videos(*, categories(*))')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(50)
    return { data, error }
  }
}