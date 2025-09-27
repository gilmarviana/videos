'use client';

import React from 'react';
import { HeroContent } from '@/types';

interface HeroSectionProps {
  content: HeroContent;
}

export function HeroSection({ content }: HeroSectionProps) {
  const handleCTAClick = () => {
    // Navigate to registration/trial page
    window.location.href = '/auth/register';
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
      {/* Background Image */}
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        />
      )}
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-800/90" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {content.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
          
          {/* Description */}
          <p className="text-lg mb-10 text-blue-200 max-w-2xl mx-auto">
            {content.description}
          </p>
          
          {/* CTA Button */}
          <button
            onClick={handleCTAClick}
            className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {content.buttonText}
          </button>
          
          {/* Features List */}
          {content.features && content.features.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="white"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}