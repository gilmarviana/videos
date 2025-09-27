'use client';

import React, { useState, useEffect } from 'react';
import { FAQContent, FAQItem } from '@/types';
import { FAQSection } from '@/components/landing/FAQSection';

interface FAQEditorProps {
  content?: FAQContent;
  onSave: (content: FAQContent) => void;
  previewMode: boolean;
}

export function FAQEditor({ content, onSave, previewMode }: FAQEditorProps) {
  const [formData, setFormData] = useState<FAQContent>({
    title: '',
    subtitle: '',
    items: [],
  });

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof FAQContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFAQ = () => {
    const newFAQ: FAQItem = {
      question: '',
      answer: '',
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newFAQ] }));
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  if (previewMode) {
    return <FAQSection content={formData} />;
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
          <label className="block text-sm font-medium text-gray-700">Perguntas Frequentes</label>
          <button onClick={addFAQ} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Adicionar FAQ
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">FAQ {index + 1}</h4>
                <button onClick={() => removeFAQ(index)} className="text-red-600 hover:text-red-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pergunta</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite a pergunta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resposta</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite a resposta"
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