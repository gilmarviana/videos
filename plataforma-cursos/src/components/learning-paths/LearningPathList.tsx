'use client';

import React, { useState } from 'react';
import { LearningPath } from '../../types';
import { useLearningPaths } from '../../hooks/useLearningPaths';
import { LearningPathCreator } from './LearningPathCreator';
import { ShareModal } from './ShareModal';

export function LearningPathList() {
  const {
    learningPaths,
    loading,
    error,
    deleteLearningPath,
    regenerateShareToken,
    togglePublicAccess,
    clearError
  } = useLearningPaths();

  const [showCreator, setShowCreator] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [shareModalPath, setShareModalPath] = useState<LearningPath | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning path?')) {
      return;
    }

    setDeletingId(id);
    const success = await deleteLearningPath(id);
    setDeletingId(null);

    if (!success) {
      alert('Failed to delete learning path');
    }
  };

  const handleEdit = (path: LearningPath) => {
    setEditingPath(path);
    setShowCreator(true);
  };

  const handleShare = (path: LearningPath) => {
    setShareModalPath(path);
  };

  const handleCreatorClose = () => {
    setShowCreator(false);
    setEditingPath(null);
  };

  const handleCreatorSuccess = () => {
    setShowCreator(false);
    setEditingPath(null);
  };

  const handleTogglePublic = async (path: LearningPath) => {
    await togglePublicAccess(path.id, !path.isPublic);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading learning paths...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Paths</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your personalized learning journeys
          </p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Learning Path
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {learningPaths.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            You haven't created any learning paths yet
          </div>
          <button
            onClick={() => setShowCreator(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Learning Path
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {path.coverImageUrl && (
                <img
                  src={path.coverImageUrl}
                  alt={path.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">
                    {path.title}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2">
                    {path.isPublic && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {path.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{path.courses.length} courses</span>
                  <span>
                    Created {new Date(path.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {path.courses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Courses:</h4>
                    <div className="space-y-1">
                      {path.courses.slice(0, 3).map((pathCourse, index) => (
                        <div key={pathCourse.id} className="text-xs text-gray-600 flex items-center">
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 min-w-[20px] text-center">
                            {index + 1}
                          </span>
                          <span className="truncate">
                            {pathCourse.course?.title || 'Unknown Course'}
                          </span>
                        </div>
                      ))}
                      {path.courses.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{path.courses.length - 3} more courses
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(path)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleShare(path)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleTogglePublic(path)}
                    className={`px-3 py-2 text-sm rounded ${
                      path.isPublic
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {path.isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                  <button
                    onClick={() => handleDelete(path.id)}
                    disabled={deletingId === path.id}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === path.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreator && (
        <LearningPathCreator
          onClose={handleCreatorClose}
          onSuccess={handleCreatorSuccess}
          editingPath={editingPath}
        />
      )}

      {shareModalPath && (
        <ShareModal
          learningPath={shareModalPath}
          onClose={() => setShareModalPath(null)}
          onRegenerateToken={regenerateShareToken}
        />
      )}
    </div>
  );
}