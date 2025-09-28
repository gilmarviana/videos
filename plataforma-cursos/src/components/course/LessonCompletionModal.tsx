'use client';

import React from 'react';

interface LessonCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLesson?: () => void;
  lessonTitle: string;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  onClose,
  onNextLesson,
  lessonTitle
}) => {
  if (!isOpen) return null;

  const handleNextLesson = () => {
    onClose();
    if (onNextLesson) {
      onNextLesson();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all">
        {/* Success Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Lesson Completed!
          </h3>
          <p className="text-gray-600">
            Great job! You've successfully completed "{lessonTitle}".
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Stay Here
          </button>
          
          {onNextLesson ? (
            <button
              onClick={handleNextLesson}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Next Lesson
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Course Complete!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};