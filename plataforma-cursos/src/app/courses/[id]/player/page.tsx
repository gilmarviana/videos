'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Course } from '../../../../types';
import { CoursePlayer } from '../../../../components/course/CoursePlayer';
import { AuthGuard } from '../../../../components/auth/AuthGuard';
import { TrialManager } from '../../../../components/trial/TrialManager';
import { useRouter } from 'next/navigation';

interface CoursePlayerPageProps {
  params: {
    id: string;
  };
  searchParams: {
    lesson?: string;
  };
}

export default function CoursePlayerPage({ params, searchParams }: CoursePlayerPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.error?.message || 'Failed to load course');
        }
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCourse();
    }
  }, [user, params.id]);

  const handleExit = () => {
    router.push('/courses');
  };

  if (loading) {
    return (
      <AuthGuard>
        <TrialManager>
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course...</p>
            </div>
          </div>
        </TrialManager>
      </AuthGuard>
    );
  }

  if (error || !course) {
    return (
      <AuthGuard>
        <TrialManager>
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
              <button
                onClick={handleExit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </TrialManager>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <TrialManager>
        <CoursePlayer
          course={course}
          userId={user!.id}
          initialLessonId={searchParams.lesson}
          onExit={handleExit}
        />
      </TrialManager>
    </AuthGuard>
  );
}