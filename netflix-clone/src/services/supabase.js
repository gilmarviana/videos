import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

  getCurrentUser: () => {
    return supabase.auth.getUser()
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