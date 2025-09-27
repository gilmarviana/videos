'use client';

import React, { useState, useEffect } from 'react';
import { LandingPageContent } from '@/types';
import { HeroEditor } from './landing-editors/HeroEditor';
import { FeaturesEditor } from './landing-editors/FeaturesEditor';
import { TestimonialsEditor } from './landing-editors/TestimonialsEditor';
import { PricingEditor } from './landing-editors/PricingEditor';
import { FAQEditor } from './landing-editors/FAQEditor';
import { AboutEditor } from './landing-editors/AboutEditor';

export function LandingPageEditor() {
  const [sections, setSections] = useState<LandingPageContent[]>([]);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/landing');
      const result = await response.json();

      if (result.success) {
        setSections(result.data);
      } else {
        setError(result.error?.message || 'Failed to load sections');
      }
    } catch (err) {
      setError('Failed to load sections');
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section: string, content: any) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/landing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, content }),
      });

      const result = await response.json();

      if (result.success) {
        setSections(prev => 
          prev.map(s => s.section === section ? result.data : s)
        );
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to update section');
      }
    } catch (err) {
      setError('Failed to update section');
      console.error('Error updating section:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionStatus = async (section: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/landing/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json();

      if (result.success) {
        setSections(prev => 
          prev.map(s => s.section === section ? { ...s, isActive } : s)
        );
      } else {
        setError(result.error?.message || 'Failed to toggle section status');
      }
    } catch (err) {
      setError('Failed to toggle section status');
      console.error('Error toggling section status:', err);
    }
  };

  const getCurrentSection = () => {
    return sections.find(s => s.section === activeSection);
  };

  const sectionTabs = [
    { id: 'hero', name: 'Hero', icon: '🏠' },
    { id: 'features', name: 'Recursos', icon: '⭐' },
    { id: 'testimonials', name: 'Depoimentos', icon: '💬' },
    { id: 'pricing', name: 'Preços', icon: '💰' },
    { id: 'faq', name: 'FAQ', icon: '❓' },
    { id: 'about', name: 'Sobre', icon: 'ℹ️' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor da Landing Page</h1>
            <p className="text-gray-600 mt-2">Gerencie o conteúdo da página inicial</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              {previewMode ? 'Editar' : 'Visualizar'}
            </button>
            
            <button
              onClick={() => window.open('/', '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Ver Site
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {sectionTabs.map((tab) => {
            const section = sections.find(s => s.section === tab.id);
            const isActive = activeSection === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {section && (
                  <div className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Editor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {sectionTabs.find(t => t.id === activeSection)?.name}
            </h2>
            
            {getCurrentSection() && (
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={getCurrentSection()?.isActive || false}
                    onChange={(e) => toggleSectionStatus(activeSection, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Seção ativa</span>
                </label>
                
                {saving && (
                  <div className="flex items-center text-blue-600">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6">
          {activeSection === 'hero' && (
            <HeroEditor
              content={getCurrentSection()?.content}
              onSave={(content) => updateSection('hero', content)}
              previewMode={previewMode}
            />
          )}
          
          {activeSection === 'features' && (
            <FeaturesEditor
              content={getCurrentSection()?.content}
              onSave={(content) => updateSection('features', content)}
              previewMode={previewMode}
            />
          )}
          
          {activeSection === 'testimonials' && (
            <TestimonialsEditor
              content={getCurrentSection()?.content}
              onSave={(content) => updateSection('testimonials', content)}
              previewMode={previewMode}
            />
          )}
          
          {activeSection === 'pricing' && (
            <PricingEditor
              content={getCurrentSection()?.content}
              onSave={(content) => updateSection('pricing', content)}
              previewMode={previewMode}
            />
          )}
          
          {activeSection === 'faq' && (
            <FAQEditor
              content={getCurrentSection()?.content}
              onSave={(content) => updateSection('faq', content)}
              previewMode={previewMode}
            />
          )}
          
          {activeSection === 'about' && (
            <AboutEditor
              content={getCurrentSection()?.content}
              onSave={(content) => updateSection('about', content)}
              previewMode={previewMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}