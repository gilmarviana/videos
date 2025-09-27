'use client';

import React, { useState } from 'react';
import { LearningPath } from '../../types';

interface ShareModalProps {
  learningPath: LearningPath;
  onClose: () => void;
  onRegenerateToken: (pathId: string) => Promise<string | null>;
}

export function ShareModal({ learningPath, onClose, onRegenerateToken }: ShareModalProps) {
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentToken, setCurrentToken] = useState(learningPath.shareToken);

  const shareUrl = `${window.location.origin}/shared/learning-path/${currentToken}`;

  const handleCopyLink = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success feedback
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setCopying(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm('Are you sure you want to regenerate the share link? The old link will no longer work.')) {
      return;
    }

    setRegenerating(true);
    const newToken = await onRegenerateToken(learningPath.id);
    
    if (newToken) {
      setCurrentToken(newToken);
    }
    
    setRegenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Share Learning Path</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{learningPath.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{learningPath.description}</p>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                learningPath.isPublic 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {learningPath.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            {!learningPath.isPublic && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This learning path is private. Visitors with the link can view the content 
                  but won't be able to watch videos unless they have an active subscription.
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                disabled={copying}
                className={`px-4 py-2 rounded-r-md text-sm font-medium ${
                  copying
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copying ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Course Preview</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {learningPath.courses.map((pathCourse, index) => (
                <div key={pathCourse.id} className="flex items-center text-sm">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-3 min-w-[24px] text-center text-xs">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">
                    {pathCourse.course?.title || 'Unknown Course'}
                  </span>
                </div>
              ))}
              {learningPath.courses.length === 0 && (
                <p className="text-gray-500 text-sm">No courses added yet</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={handleRegenerateToken}
              disabled={regenerating}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate Link'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}