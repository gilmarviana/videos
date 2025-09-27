'use client';

import React, { useState } from 'react';
import { LearningPath, Course } from '../../types';
import { useSharedLearningPath } from '../../hooks/useLearningPaths';

interface SharedLearningPathViewerProps {
  shareToken: string;
}

export function SharedLearningPathViewer({ shareToken }: SharedLearningPathViewerProps) {
  const { learningPath, loading, error } = useSharedLearningPath(shareToken);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const handleCourseClick = (courseId: string) => {
    // For non-subscribers, show signup prompt
    const isSubscribed = false; // This should come from auth context
    
    if (!isSubscribed) {
      if (confirm('You need an active subscription to access course content. Would you like to sign up?')) {
        window.location.href = '/register';
      }
      return;
    }

    // For subscribers, navigate to course
    window.location.href = `/courses/${courseId}`;
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning path...</p>
        </div>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning Path Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The learning path you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {learningPath.title}
              </h1>
              <p className="text-gray-600">
                {learningPath.description}
              </p>
            </div>
            {learningPath.coverImageUrl && (
              <img
                src={learningPath.coverImageUrl}
                alt={learningPath.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{learningPath.courses.length} courses</span>
            <span>•</span>
            <span>Shared learning path</span>
            {learningPath.isPublic && (
              <>
                <span>•</span>
                <span className="text-green-600 font-medium">Public</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Subscription Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-blue-500 text-xl">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Want to access the full content?
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                This learning path is shared for preview. To watch videos and access all materials, 
                you need an active subscription starting at R$ 30,00/month with a 4-hour free trial.
              </p>
              <div className="mt-3">
                <a
                  href="/register"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Start Free Trial
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Learning Path ({learningPath.courses.length} courses)
          </h2>

          {learningPath.courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No courses have been added to this learning path yet.</p>
            </div>
          ) : (
            learningPath.courses.map((pathCourse, index) => {
              const course = pathCourse.course;
              if (!course) return null;

              const isExpanded = expandedCourse === course.id;

              return (
                <div key={pathCourse.id} className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {course.description}
                            </p>
                          </div>
                          
                          {course.coverImageUrl && (
                            <img
                              src={course.coverImageUrl}
                              alt={course.title}
                              className="w-16 h-16 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Course {index + 1} of {learningPath.courses.length}</span>
                            {course.price && (
                              <>
                                <span>•</span>
                                <span>R$ {course.price.toFixed(2)}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleCourseExpansion(course.id)}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                            </button>
                            <button
                              onClick={() => handleCourseClick(course.id)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Access Course
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              <p className="mb-2">
                                <strong>Course Overview:</strong> This course is part of the learning path 
                                and contains structured modules and lessons designed to help you learn effectively.
                              </p>
                              <p>
                                <strong>Access:</strong> Full access requires an active subscription. 
                                Start your free trial to explore the complete content.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of students already learning with our platform. 
            Get instant access to all courses with your subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100"
            >
              Start 4-Hour Free Trial
            </a>
            <a
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600"
            >
              Browse All Courses
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}