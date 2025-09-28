'use client';

import React, { useState, useEffect } from 'react';
import { Course, Module, Lesson, UserProgress } from '../../types';
import { EnhancedVideoPlayer } from '../video/EnhancedVideoPlayer';
import { LessonNavigationSidebar } from './LessonNavigationSidebar';
import { LessonCompletionModal } from './LessonCompletionModal';
import { CourseCompletionModal } from './CourseCompletionModal';

interface CoursePlayerProps {
  course: Course;
  userId: string;
  initialLessonId?: string;
  onExit?: () => void;
  className?: string;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  userId,
  initialLessonId,
  onExit,
  className = ''
}) => {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLessonCompletionModal, setShowLessonCompletionModal] = useState(false);
  const [showCourseCompletionModal, setShowCourseCompletionModal] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize current lesson
  useEffect(() => {
    if (course.modules && course.modules.length > 0) {
      let targetLesson: Lesson | null = null;
      let targetModule: Module | null = null;

      if (initialLessonId) {
        // Find the specific lesson
        for (const module of course.modules) {
          const lesson = module.lessons?.find(l => l.id === initialLessonId);
          if (lesson) {
            targetLesson = lesson;
            targetModule = module;
            break;
          }
        }
      }

      // If no specific lesson or lesson not found, use first lesson
      if (!targetLesson) {
        const firstModule = course.modules[0];
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          targetLesson = firstModule.lessons[0];
          targetModule = firstModule;
        }
      }

      setCurrentLesson(targetLesson);
      setCurrentModule(targetModule);
    }
    setLoading(false);
  }, [course, initialLessonId]);

  // Load lesson progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/courses/${course.id}/progress`);
        const data = await response.json();
        
        if (data.success) {
          setLessonProgress(data.data.lessons || []);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();
  }, [course.id]);

  // Handle lesson selection
  const handleLessonSelect = (lesson: Lesson, module: Module) => {
    setCurrentLesson(lesson);
    setCurrentModule(module);
  };

  // Handle lesson completion
  const handleLessonComplete = () => {
    setShowLessonCompletionModal(true);
    
    // Update progress state
    setLessonProgress(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(p => p.lessonId === currentLesson?.id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], completed: true };
      } else if (currentLesson) {
        updated.push({
          id: `temp-${currentLesson.id}`,
          userId,
          lessonId: currentLesson.id,
          watchedSeconds: 0,
          completed: true,
          lastWatchedAt: new Date(),
          completedAt: new Date()
        });
      }
      
      return updated;
    });
  };

  // Handle course completion
  const handleCourseComplete = () => {
    setShowCourseCompletionModal(true);
  };

  // Navigate to next lesson
  const navigateToNextLesson = () => {
    if (!currentLesson || !currentModule) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    // Try next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];
      setCurrentLesson(nextLesson);
      return;
    }

    // Try first lesson of next module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        setCurrentLesson(nextModule.lessons[0]);
        setCurrentModule(nextModule);
        return;
      }
    }

    // No more lessons
    console.log('No more lessons available');
  };

  // Navigate to previous lesson
  const navigateToPreviousLesson = () => {
    if (!currentLesson || !currentModule) return;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    // Try previous lesson in current module
    if (currentLessonIndex > 0) {
      const prevLesson = currentModule.lessons[currentLessonIndex - 1];
      setCurrentLesson(prevLesson);
      return;
    }

    // Try last lesson of previous module
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
        setCurrentLesson(lastLesson);
        setCurrentModule(prevModule);
        return;
      }
    }

    // No previous lessons
    console.log('No previous lessons available');
  };

  // Check if there's a next lesson
  const hasNextLesson = () => {
    if (!currentLesson || !currentModule) return false;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    // Check if there's a next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) return true;

    // Check if there's a next module with lessons
    for (let i = currentModuleIndex + 1; i < course.modules.length; i++) {
      if (course.modules[i].lessons && course.modules[i].lessons.length > 0) {
        return true;
      }
    }

    return false;
  };

  // Check if there's a previous lesson
  const hasPreviousLesson = () => {
    if (!currentLesson || !currentModule) return false;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    // Check if there's a previous lesson in current module
    if (currentLessonIndex > 0) return true;

    // Check if there's a previous module with lessons
    for (let i = currentModuleIndex - 1; i >= 0; i--) {
      if (course.modules[i].lessons && course.modules[i].lessons.length > 0) {
        return true;
      }
    }

    return false;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!currentLesson || !currentModule) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-100 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">No lessons available in this course.</p>
          {onExit && (
            <button
              onClick={onExit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Back to Course
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      {/* Lesson Navigation Sidebar */}
      <LessonNavigationSidebar
        course={course}
        currentLesson={currentLesson}
        currentModule={currentModule}
        lessonProgress={lessonProgress}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLessonSelect={handleLessonSelect}
        onExit={onExit}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Show navigation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentLesson.title}</h1>
                <p className="text-sm text-gray-600">{currentModule.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Lesson Button */}
              <button
                onClick={navigateToPreviousLesson}
                disabled={!hasPreviousLesson()}
                className={`p-2 rounded-lg transition-colors ${
                  hasPreviousLesson()
                    ? 'hover:bg-gray-100 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Previous lesson"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Lesson Button */}
              <button
                onClick={navigateToNextLesson}
                disabled={!hasNextLesson()}
                className={`p-2 rounded-lg transition-colors ${
                  hasNextLesson()
                    ? 'hover:bg-gray-100 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="Next lesson"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <EnhancedVideoPlayer
              lessonId={currentLesson.id}
              userId={userId}
              courseId={course.id}
              title={currentLesson.title}
              onLessonComplete={handleLessonComplete}
              onCourseComplete={handleCourseComplete}
              className="w-full"
            />

            {/* Lesson Description */}
            {currentLesson.description && (
              <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-3">About this lesson</h3>
                <p className="text-gray-700 leading-relaxed">{currentLesson.description}</p>
              </div>
            )}

            {/* Lesson Materials */}
            {currentLesson.materials && currentLesson.materials.length > 0 && (
              <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Lesson Materials</h3>
                <div className="space-y-2">
                  {currentLesson.materials.map((material, index) => (
                    <a
                      key={index}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mr-3">
                        {material.type === 'pdf' && (
                          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {material.type === 'audio' && (
                          <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.216 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.216l4.167-3.776z" clipRule="evenodd" />
                          </svg>
                        )}
                        {material.type === 'document' && (
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{material.name}</p>
                        <p className="text-sm text-gray-500">
                          {material.type.toUpperCase()} • {Math.round(material.size / 1024)} KB
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={navigateToPreviousLesson}
                disabled={!hasPreviousLesson()}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasPreviousLesson()
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Lesson
              </button>

              <button
                onClick={navigateToNextLesson}
                disabled={!hasNextLesson()}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasNextLesson()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next Lesson
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LessonCompletionModal
        isOpen={showLessonCompletionModal}
        onClose={() => setShowLessonCompletionModal(false)}
        onNextLesson={hasNextLesson() ? navigateToNextLesson : undefined}
        lessonTitle={currentLesson.title}
      />

      <CourseCompletionModal
        isOpen={showCourseCompletionModal}
        onClose={() => setShowCourseCompletionModal(false)}
        courseTitle={course.title}
        onViewCertificate={() => {
          // TODO: Navigate to certificate view
          console.log('View certificate');
        }}
      />
    </div>
  );
};