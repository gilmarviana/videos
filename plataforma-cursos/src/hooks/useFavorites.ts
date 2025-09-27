'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserFavorite } from '../types';
import { progressService } from '../lib/services/progress.service';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const userFavorites = await progressService.getFavorites();
        setFavorites(userFavorites);
        setError(null);
      } catch (err) {
        setError('Failed to load favorites');
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Add to favorites
  const addToFavorites = useCallback(async (courseId: string) => {
    try {
      await progressService.addToFavorites(courseId);
      
      // Optimistically update the state
      const newFavorite: UserFavorite = {
        id: `temp-${Date.now()}`,
        userId: 'current-user', // This will be replaced by actual data
        courseId,
        createdAt: new Date()
      };
      
      setFavorites(prev => [newFavorite, ...prev]);
      setError(null);
    } catch (err) {
      setError('Failed to add to favorites');
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, []);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (courseId: string) => {
    try {
      await progressService.removeFromFavorites(courseId);
      
      // Optimistically update the state
      setFavorites(prev => prev.filter(fav => fav.courseId !== courseId));
      setError(null);
    } catch (err) {
      setError('Failed to remove from favorites');
      console.error('Error removing from favorites:', err);
      throw err;
    }
  }, []);

  // Check if course is favorited
  const isFavorite = useCallback((courseId: string) => {
    return favorites.some(fav => fav.courseId === courseId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (courseId: string) => {
    if (isFavorite(courseId)) {
      await removeFromFavorites(courseId);
    } else {
      await addToFavorites(courseId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
};