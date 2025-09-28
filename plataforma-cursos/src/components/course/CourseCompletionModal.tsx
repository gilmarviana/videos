'use client';

import React from 'react';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCertificate?: () => void;
  courseTitle: string;
}

export const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  onViewCertificate,
  courseTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-8 transform transition-all">
        {/* Celebration Animation */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            
            {/* Confetti effect */}
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute -top-1 -right-3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-2 -left-3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🎉 Congratulations!
          </h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Course Completed Successfully!
          </h3>
          <p className="text-gray-600 leading-relaxed">
            You've successfully completed the entire "{courseTitle}" course. 
            Your dedication and hard work have paid off!
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">All Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">🏆</div>
              <div className="text-sm text-gray-600">Achievement</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Learning
          </button>
          
          {onViewCertificate && (
            <button
              onClick={() => {
                onClose();
                onViewCertificate();
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              View Certificate
            </button>
          )}
        </div>

        {/* Additional Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Share your achievement with friends and continue your learning journey!
          </p>
        </div>
      </div>
    </div>
  );
};