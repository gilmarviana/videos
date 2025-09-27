'use client';

import React, { useState, useEffect } from 'react';
import { Course, LearningPath } from '../../types';
import { useLearningPaths } from '../../hooks/useLearningPaths';

interface LearningPathCreatorProps {
  onClose: () => void;
  onSuccess: (learningPath: LearningPath) => void;
  editingPath?: LearningPath | null;
}

interface CourseSelectionItem extends Course {
  selected: boolean;
  orderIndex: number;
}

export function LearningPathCreator({ onClose, onSuccess, editingPath }: LearningPathCreatorProps) {
  const [title, setTitle] = useState(editingPath?.title || '');
  const [description, setDescription] = useState(editingPath?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(editingPath?.coverImageUrl || '');
  const [isPublic, setIsPublic] = useState(editingPath?.isPublic || false);
  const [availableCourses, setAvailableCourses] = useState<CourseSelectionItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<CourseSelectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { createLearningPath, updateLearningPath, addCourseToPath, removeCourseFromPath, reorderCourses } = useLearningPaths();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (editingPath && availableCourses.length > 0) {
      // Set up selected courses for editing
      const pathCourseIds = editingPath.courses.map(c => c.courseId);
      const selected = availableCourses
        .filter(course => pathCourseIds.includes(course.id))
        .map(course => {
          const pathCourse = editingPath.courses.find(c => c.courseId === course.id);
          return {
            ...course,
            selected: true,
            orderIndex: pathCourse?.orderIndex || 0
          };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex);

      setSelectedCourses(selected);
    }
  }, [editingPath, availableCourses]);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch('/api/courses', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const coursesWithSelection = data.data.map((course: Course) => ({
          ...course,
          selected: false,
          orderIndex: 0
        }));
        setAvailableCourses(coursesWithSelection);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error occurred while fetching courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseToggle = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;

    const isCurrentlySelected = selectedCourses.some(c => c.id === courseId);

    if (isCurrentlySelected) {
      // Remove from selected
      setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    } else {
      // Add to selected
      const newCourse = {
        ...course,
        selected: true,
        orderIndex: selectedCourses.length
      };
      setSelectedCourses(prev => [...prev, newCourse]);
    }
  };

  const handleReorder = (courseId: string, direction: 'up' | 'down') => {
    setSelectedCourses(prev => {
      const courses = [...prev];
      const currentIndex = courses.findIndex(c => c.id === courseId);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= courses.length) return prev;
      
      // Swap courses
      [courses[currentIndex], courses[newIndex]] = [courses[newIndex], courses[currentIndex]];
      
      // Update order indices
      return courses.map((course, index) => ({
        ...course,
        orderIndex: index
      }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let learningPath: LearningPath | null = null;

      if (editingPath) {
        // Update existing learning path
        learningPath = await updateLearningPath(
          editingPath.id,
          title.trim(),
          description.trim(),
          coverImageUrl.trim() || undefined,
          isPublic
        );
      } else {
        // Create new learning path
        learningPath = await createLearningPath(
          title.trim(),
          description.trim(),
          coverImageUrl.trim() || undefined
        );
      }

      if (learningPath) {
        // Handle course changes for editing
        if (editingPath) {
          // Remove courses that are no longer selected
          const currentCourseIds = editingPath.courses.map(c => c.courseId);
          const newCourseIds = selectedCourses.map(c => c.id);
          
          for (const courseId of currentCourseIds) {
            if (!newCourseIds.includes(courseId)) {
              await removeCourseFromPath(learningPath.id, courseId);
            }
          }
        }

        // Add/update selected courses
        for (const course of selectedCourses) {
          await addCourseToPath(learningPath.id, course.id, course.orderIndex);
        }

        // Reorder courses if needed
        if (selectedCourses.length > 0) {
          const courseOrders = selectedCourses.map(course => ({
            courseId: course.id,
            orderIndex: course.orderIndex
          }));
          await reorderCourses(learningPath.id, courseOrders);
        }

        onSuccess(learningPath);
      }
    } catch (err) {
      setError('Failed to save learning path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {editingPath ? 'Edit Learning Path' : 'Create Learning Path'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter learning path title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your learning path"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this learning path public
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Public learning paths can be viewed by anyone with the share link
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Courses</h3>
              
              {coursesLoading ? (
                <div className="text-center py-4">Loading courses...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Courses */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Available Courses</h4>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {availableCourses
                        .filter(course => !selectedCourses.some(sc => sc.id === course.id))
                        .map(course => (
                          <div
                            key={course.id}
                            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCourseToggle(course.id)}
                          >
                            <div className="flex items-center">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{course.title}</h5>
                                <p className="text-xs text-gray-500 truncate">
                                  {course.description}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Selected Courses */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Selected Courses ({selectedCourses.length})
                    </h4>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {selectedCourses.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No courses selected
                        </div>
                      ) : (
                        selectedCourses.map((course, index) => (
                          <div
                            key={course.id}
                            className="p-3 border-b last:border-b-0 bg-blue-50"
                          >
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <h5 className="font-medium text-sm">{course.title}</h5>
                                    <p className="text-xs text-gray-500 truncate">
                                      {course.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleReorder(course.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReorder(course.id, 'down')}
                                  disabled={index === selectedCourses.length - 1}
                                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCourseToggle(course.id)}
                                  className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingPath ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}