import { useState, useEffect } from 'react';
import { LearningPath, LearningPathCourse, ApiResponse } from '../types';

export function useLearningPaths() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/learning-paths', {
        credentials: 'include'
      });
      
      const data: ApiResponse<LearningPath[]> = await response.json();
      
      if (data.success && data.data) {
        setLearningPaths(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch learning paths');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createLearningPath = async (
    title: string,
    description: string,
    coverImageUrl?: string
  ): Promise<LearningPath | null> => {
    try {
      const response = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, description, coverImageUrl }),
      });

      const data: ApiResponse<LearningPath> = await response.json();

      if (data.success && data.data) {
        setLearningPaths(prev => [data.data!, ...prev]);
        return data.data;
      } else {
        setError(data.error?.message || 'Failed to create learning path');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const updateLearningPath = async (
    id: string,
    title: string,
    description: string,
    coverImageUrl?: string,
    isPublic?: boolean
  ): Promise<LearningPath | null> => {
    try {
      const response = await fetch(`/api/learning-paths/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, description, coverImageUrl, isPublic }),
      });

      const data: ApiResponse<LearningPath> = await response.json();

      if (data.success && data.data) {
        setLearningPaths(prev =>
          prev.map(path => path.id === id ? data.data! : path)
        );
        return data.data;
      } else {
        setError(data.error?.message || 'Failed to update learning path');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const deleteLearningPath = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/learning-paths/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setLearningPaths(prev => prev.filter(path => path.id !== id));
        return true;
      } else {
        setError(data.error?.message || 'Failed to delete learning path');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const addCourseToPath = async (
    pathId: string,
    courseId: string,
    orderIndex?: number
  ): Promise<LearningPathCourse | null> => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId, orderIndex }),
      });

      const data: ApiResponse<LearningPathCourse> = await response.json();

      if (data.success && data.data) {
        // Refresh the learning paths to get updated data
        await fetchLearningPaths();
        return data.data;
      } else {
        setError(data.error?.message || 'Failed to add course to learning path');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const removeCourseFromPath = async (pathId: string, courseId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/courses?courseId=${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Refresh the learning paths to get updated data
        await fetchLearningPaths();
        return true;
      } else {
        setError(data.error?.message || 'Failed to remove course from learning path');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const reorderCourses = async (
    pathId: string,
    courseOrders: { courseId: string; orderIndex: number }[]
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/courses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseOrders }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Refresh the learning paths to get updated data
        await fetchLearningPaths();
        return true;
      } else {
        setError(data.error?.message || 'Failed to reorder courses');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const regenerateShareToken = async (pathId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/share`, {
        method: 'POST',
        credentials: 'include',
      });

      const data: ApiResponse<{ shareToken: string }> = await response.json();

      if (data.success && data.data) {
        // Update the learning path in state
        setLearningPaths(prev =>
          prev.map(path =>
            path.id === pathId ? { ...path, shareToken: data.data!.shareToken } : path
          )
        );
        return data.data.shareToken;
      } else {
        setError(data.error?.message || 'Failed to regenerate share token');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const togglePublicAccess = async (pathId: string, isPublic: boolean): Promise<boolean> => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isPublic }),
      });

      const data: ApiResponse<LearningPath> = await response.json();

      if (data.success && data.data) {
        setLearningPaths(prev =>
          prev.map(path => path.id === pathId ? data.data! : path)
        );
        return true;
      } else {
        setError(data.error?.message || 'Failed to toggle public access');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  return {
    learningPaths,
    loading,
    error,
    fetchLearningPaths,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath,
    addCourseToPath,
    removeCourseFromPath,
    reorderCourses,
    regenerateShareToken,
    togglePublicAccess,
    clearError: () => setError(null),
  };
}

export function useSharedLearningPath(shareToken: string) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedLearningPath = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/learning-paths/shared/${shareToken}`);
        const data: ApiResponse<LearningPath> = await response.json();
        
        if (data.success && data.data) {
          setLearningPath(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch shared learning path');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedLearningPath();
    }
  }, [shareToken]);

  return {
    learningPath,
    loading,
    error,
  };
}