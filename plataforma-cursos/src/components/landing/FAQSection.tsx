'use client';

import React, { useState } from 'react';
import { FAQContent } from '@/types';

interface FAQSectionProps {
  content: FAQContent;
}

export function FAQSection({ content }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* FAQ Items */}
        <div className="space-y-4">
          {content.items.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 p-8 bg-blue-50 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ainda tem dúvidas?
          </h3>
          <p className="text-gray-600 mb-4">
            Nossa equipe está pronta para ajudar você
          </p>
          <button
            onClick={() => window.location.href = '/contato'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Entre em Contato
          </button>
        </div>
      </div>
    </section>
  );
}