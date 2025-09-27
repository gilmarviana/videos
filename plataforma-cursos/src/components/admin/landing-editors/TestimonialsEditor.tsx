'use client';

import React, { useState, useEffect } from 'react';
import { TestimonialsContent, TestimonialItem } from '@/types';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

interface TestimonialsEditorProps {
  content?: TestimonialsContent;
  onSave: (content: TestimonialsContent) => void;
  previewMode: boolean;
}

export function TestimonialsEditor({ content, onSave, previewMode }: TestimonialsEditorProps) {
  const [formData, setFormData] = useState<TestimonialsContent>({
    title: '',
    subtitle: '',
    items: [],
  });

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof TestimonialsContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      name: '',
      role: '',
      content: '',
      rating: 5,
      avatar: '',
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newTestimonial] }));
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeTestimonial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  if (previewMode) {
    return <TestimonialsSection content={formData} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título da Seção</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Depoimentos</label>
          <button onClick={addTestimonial} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Adicionar Depoimento
          </button>
        </div>

        <div className="space-y-6">
          {formData.items.map((testimonial, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Depoimento {index + 1}</h4>
                <button onClick={() => removeTestimonial(index)} className="text-red-600 hover:text-red-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Função</label>
                  <input
                    type="text"
                    value={testimonial.role}
                    onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depoimento</label>
                  <textarea
                    value={testimonial.content}
                    onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação (1-5)</label>
                  <select
                    value={testimonial.rating}
                    onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} estrela{rating > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (URL)</label>
                  <input
                    type="url"
                    value={testimonial.avatar || ''}
                    onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => onSave(formData)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}