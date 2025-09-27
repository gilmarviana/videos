'use client';

import React from 'react';
import { PricingContent } from '@/types';

interface PricingSectionProps {
  content: PricingContent;
}

export function PricingSection({ content }: PricingSectionProps) {
  const handlePlanClick = (plan: any) => {
    if (plan.name === 'Teste Gratuito' || plan.price === '0') {
      window.location.href = '/auth/register';
    } else {
      window.location.href = '/auth/register?plan=monthly';
    }
  };

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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {content.plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${
                plan.highlighted ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {/* Highlighted Badge */}
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Mais Popular
                </div>
              )}

              <div className={`p-8 ${plan.highlighted ? 'pt-12' : ''}`}>
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Plan Description */}
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Todas as assinaturas incluem garantia de 7 dias
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Pagamento Seguro
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancele a qualquer momento
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}