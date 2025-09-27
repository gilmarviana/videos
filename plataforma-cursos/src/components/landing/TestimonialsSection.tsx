'use client';

import React, { useState } from 'react';
import { TestimonialsContent } from '@/types';

interface TestimonialsSectionProps {
  content: TestimonialsContent;
}

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % content.items.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + content.items.length) % content.items.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-white">
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

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
            </div>

            <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              "{content.items[currentIndex].content}"
            </blockquote>

            {/* Rating */}
            <div className="flex justify-center mb-6">
              {renderStars(content.items[currentIndex].rating)}
            </div>

            {/* Author */}
            <div className="flex items-center justify-center space-x-4">
              {content.items[currentIndex].avatar && (
                <img
                  src={content.items[currentIndex].avatar}
                  alt={content.items[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  {content.items[currentIndex].name}
                </div>
                <div className="text-gray-600">
                  {content.items[currentIndex].role}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {content.items.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {content.items.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {content.items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* All Testimonials Grid (Mobile Alternative) */}
        <div className="md:hidden mt-12 space-y-6">
          {content.items.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6">
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <blockquote className="text-gray-700 mb-4">
                "{testimonial.content}"
              </blockquote>
              <div className="flex items-center space-x-3">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}