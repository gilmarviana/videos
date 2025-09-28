'use client';

import React, { useState } from 'react';
import { Course, Module, Lesson, UserProgress } from '../../types';

interface LessonNavigationSidebarProps {
  course: Course;
  currentLesson: Lesson;
  currentModule: Module;
  lessonProgress: UserProgress[];
  isOpen: boolean;
  onToggle: () => void;
  onLessonSelect: (lesson: Lesson, module: Module) => void;
  onExit?: () => void;
}

export const LessonNavigationSidebar: React.FC<LessonNavigationSidebarProps> = ({
  course,
  currentLesson,
  currentModule,
  lessonProgress,
  isOpen,
  onToggle,
  onLessonSelect,
  onExit
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set([currentModule.id])
  );

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(p => p.lessonId === lessonId && p.completed);
  };

  // Get lesson progress percentage
  const getLessonProgress = (lessonId: string) => {
    const progress = lessonProgress.find(p => p.lessonId === lessonId);
    if (!progress) return 0;
    
    // Assuming we have duration info, calculate percentage
    // For now, return 100% if completed, 50% if started but not completed
    if (progress.completed) return 100;
    if (progress.watchedSeconds > 0) return 50;
    return 0;
  };

  // Calculate module progress
  const getModuleProgress = (module: Module) => {
    if (!module.lessons || module.lessons.length === 0) return 0;
    
    const completedLessons = module.lessons.filter(lesson => 
      isLessonCompleted(lesson.id)
    ).length;
    
    return Math.round((completedLessons / module.lessons.length) * 100);
  };

  // Calculate total course progress
  const getCourseProgress = () => {
    const allLessons = course.modules.flatMap(m => m.lessons || []);
    if (allLessons.length === 0) return 0;
    
    const completedLessons = allLessons.filter(lesson => 
      isLessonCompleted(lesson.id)
    ).length;
    
    return Math.round((completedLessons / allLessons.length) * 100);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${!isOpen ? 'lg:w-0 lg:overflow-hidden' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {course.title}
              </h2>
              <div className="flex items-center mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCourseProgress()}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {getCourseProgress()}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {onExit && (
                <button
                  onClick={onExit}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Exit course"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors lg:hidden"
                title="Close navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Course Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {course.modules.map((module, moduleIndex) => {
                const isExpanded = expandedModules.has(module.id);
                const moduleProgress = getModuleProgress(module);
                const hasLessons = module.lessons && module.lessons.length > 0;

                return (
                  <div key={module.id} className="border rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <button
                      onClick={() => hasLessons && toggleModule(module.id)}
                      className={`w-full p-4 text-left transition-colors ${
                        hasLessons ? 'hover:bg-gray-50' : 'cursor-default'
                      } ${currentModule.id === module.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                moduleProgress === 100 
                                  ? 'bg-green-100 text-green-700' 
                                  : moduleProgress > 0 
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {moduleProgress === 100 ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  moduleIndex + 1
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {module.title}
                              </h3>
                              {hasLessons && (
                                <div className="flex items-center mt-1">
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                                    <div 
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        moduleProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${moduleProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {module.lessons.filter(l => isLessonCompleted(l.id)).length}/{module.lessons.length}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {hasLessons && (
                          <div className="flex-shrink-0 ml-2">
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Module Lessons */}
                    {hasLessons && isExpanded && (
                      <div className="border-t bg-gray-50">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = isLessonCompleted(lesson.id);
                          const progress = getLessonProgress(lesson.id);
                          const isCurrent = currentLesson.id === lesson.id;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => onLessonSelect(lesson, module)}
                              className={`w-full p-3 text-left transition-colors border-b border-gray-200 last:border-b-0 ${
                                isCurrent 
                                  ? 'bg-blue-100 border-blue-200' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isCompleted 
                                      ? 'bg-green-100 text-green-700' 
                                      : progress > 0 
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {isCompleted ? (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : progress > 0 ? (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      lessonIndex + 1
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isCurrent ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  
                                  <div className="flex items-center mt-1 space-x-2">
                                    {lesson.durationSeconds > 0 && (
                                      <span className="text-xs text-gray-500">
                                        {Math.floor(lesson.durationSeconds / 60)}:{(lesson.durationSeconds % 60).toString().padStart(2, '0')}
                                      </span>
                                    )}
                                    
                                    {progress > 0 && progress < 100 && (
                                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                                        <div 
                                          className="bg-blue-500 h-1 rounded-full"
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>
                                    )}
                                    
                                    {isCurrent && (
                                      <span className="text-xs text-blue-600 font-medium">
                                        Playing
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* No lessons message */}
                    {!hasLessons && (
                      <div className="p-4 text-center text-gray-500 text-sm border-t">
                        No lessons available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {course.modules.flatMap(m => m.lessons || []).filter(l => isLessonCompleted(l.id)).length} of{' '}
                {course.modules.flatMap(m => m.lessons || []).length} lessons completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};