'use client';

import React from 'react';
import { AboutContent } from '@/types';

interface AboutSectionProps {
  content: AboutContent;
}

export function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {content.title}
            </h2>
            
            {content.subtitle && (
              <h3 className="text-xl text-blue-600 font-semibold mb-4">
                {content.subtitle}
              </h3>
            )}
            
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {content.description}
            </p>

            {/* Stats */}
            {content.stats && content.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-6">
                {content.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div className="relative">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={content.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <h3 className="text-2xl font-bold">Educação Online</h3>
                  <p className="text-blue-100">Transformando vidas através do conhecimento</p>
                </div>
              </div>
            )}
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}