'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Course } from '../../types';
import { CourseProgressCard } from '../../components/course/CourseProgressCard';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { TrialManager } from '../../components/trial/TrialManager';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (data.success) {
          setCourses(data.data);
        } else {
          setError(data.error?.message || 'Failed to load courses');
        }
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCourses();
    }
  }, [user]);

  const handleContinueCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/player`);
  };

  if (loading) {
    return (
      <AuthGuard>
        <TrialManager>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        </TrialManager>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <TrialManager>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
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
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="mt-2 text-gray-600">
                Continue your learning journey with our comprehensive courses
              </p>
            </div>

            {/* Courses Grid */}
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseProgressCard
                    key={course.id}
                    courseId={course.id}
                    courseTitle={course.title}
                    courseProgress={{
                      courseId: course.id,
                      totalLessons: course.modules?.reduce((total, module) => 
                        total + (module.lessons?.length || 0), 0) || 0,
                      completedLessons: 0, // This will be loaded from API
                      progressPercentage: 0, // This will be loaded from API
                      lessons: [],
                      isFavorite: false,
                      isCompleted: false
                    }}
                    onContinue={() => handleContinueCourse(course.id)}
                    className="hover:shadow-lg transition-shadow"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
                <p className="text-gray-600">
                  Check back later for new courses or contact support if you think this is an error.
                </p>
              </div>
            )}
          </div>
        </div>
      </TrialManager>
    </AuthGuard>
  );
}