export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  free_trial_expires_at?: string;
  created_at: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  video_url: string;
  genres: string[];
  release_year: number;
  duration: number;
  rating?: string;
  is_exclusive: boolean;
  views_count: number;
  created_at: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  genres: string[];
  release_year: number;
  rating?: string;
  is_exclusive: boolean;
  views_count: number;
  seasons: Season[];
  created_at: string;
}

export interface Season {
  id: string;
  series_id: string;
  season_number: number;
  title: string;
  description?: string;
  episodes: Episode[];
  created_at: string;
}

export interface Episode {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  views_count: number;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  max_screens: number;
  video_quality: string;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'movie' | 'episode';
  watch_time: number;
  total_duration: number;
  last_watched_at: string;
  completed: boolean;
}

export interface Analytics {
  total_users: number;
  active_users: number;
  current_watching: number;
  most_watched_content: ContentAnalytics[];
}

export interface ContentAnalytics {
  id: string;
  title: string;
  type: 'movie' | 'series';
  views: number;
  watch_time: number;
}

export interface ActiveWatching {
  id: string;
  user_id: string;
  user_name: string;
  content_id: string;
  content_title: string;
  content_type: 'movie' | 'episode';
  started_at: string;
}