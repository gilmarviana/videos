'use client';

import React, { useEffect, useState } from 'react';
import { LandingPageContent } from '@/types';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { AboutSection } from './AboutSection';

interface LandingPageProps {
  initialData?: {
    sections: LandingPageContent[];
    popularCourses: any[];
    latestCourses: any[];
  };
}

export function LandingPage({ initialData }: LandingPageProps) {
  const [sections, setSections] = useState<LandingPageContent[]>(initialData?.sections || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      fetchLandingPageData();
    }
  }, [initialData]);

  const fetchLandingPageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/landing');
      const result = await response.json();

      if (result.success) {
        setSections(result.data.sections);
      } else {
        setError(result.error?.message || 'Failed to load landing page data');
      }
    } catch (err) {
      setError('Failed to load landing page data');
      console.error('Error fetching landing page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSectionContent = (sectionName: string) => {
    const section = sections.find(s => s.section === sectionName && s.isActive);
    return section?.content;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar página</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLandingPageData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {getSectionContent('hero') && (
        <HeroSection content={getSectionContent('hero')} />
      )}
      
      {getSectionContent('features') && (
        <FeaturesSection content={getSectionContent('features')} />
      )}
      
      {getSectionContent('testimonials') && (
        <TestimonialsSection content={getSectionContent('testimonials')} />
      )}
      
      {getSectionContent('pricing') && (
        <PricingSection content={getSectionContent('pricing')} />
      )}
      
      {getSectionContent('faq') && (
        <FAQSection content={getSectionContent('faq')} />
      )}
      
      {getSectionContent('about') && (
        <AboutSection content={getSectionContent('about')} />
      )}
    </div>
  );
}