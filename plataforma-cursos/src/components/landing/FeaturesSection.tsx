'use client';

import React from 'react';
import { FeaturesContent } from '@/types';

interface FeaturesSectionProps {
  content: FeaturesContent;
}

const iconMap: Record<string, React.ReactNode> = {
  star: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  certificate: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
    </svg>
  ),
  support: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-1.106-1.106A6.002 6.002 0 004 10c0 .91.203 1.77.567 2.542l1.591-1.425zm4.677-4.677a4.002 4.002 0 012.08.041l1.106-1.106A6.002 6.002 0 0010 4a6.006 6.006 0 00-2.542.567l1.425 1.591z" clipRule="evenodd" />
    </svg>
  ),
};

export function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.items.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {iconMap[feature.icon] || iconMap.star}
              </div>

              {/* Feature Image */}
              {feature.imageUrl && (
                <div className="mb-6">
                  <img
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}