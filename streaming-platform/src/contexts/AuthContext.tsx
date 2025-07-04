import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as CustomUser } from '../types';

interface AuthContextType {
  user: User | null;
  customUser: CustomUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSubscribed: boolean;
  hasFreeTrial: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  customUser: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  isSubscribed: false,
  hasFreeTrial: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setCustomUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setCustomUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create user profile with 3-day free trial
      const freeTrialEnd = new Date();
      freeTrialEnd.setDate(freeTrialEnd.getDate() + 3);

      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name,
        free_trial_expires_at: freeTrialEnd.toISOString(),
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isSubscribed = customUser?.subscription_expires_at 
    ? new Date(customUser.subscription_expires_at) > new Date()
    : false;

  const hasFreeTrial = customUser?.free_trial_expires_at 
    ? new Date(customUser.free_trial_expires_at) > new Date()
    : false;

  const value = {
    user,
    customUser,
    loading,
    signUp,
    signIn,
    signOut,
    isSubscribed,
    hasFreeTrial,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};