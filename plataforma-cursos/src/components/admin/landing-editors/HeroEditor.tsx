'use client';

import React, { useState, useEffect } from 'react';
import { HeroContent } from '@/types';
import { HeroSection } from '@/components/landing/HeroSection';

interface HeroEditorProps {
  content?: HeroContent;
  onSave: (content: HeroContent) => void;
  previewMode: boolean;
}

export function HeroEditor({ content, onSave, previewMode }: HeroEditorProps) {
  const [formData, setFormData] = useState<HeroContent>({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    backgroundImage: '',
    features: [],
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof HeroContent, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (previewMode) {
    return <HeroSection content={formData} />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título Principal
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o título principal"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtítulo
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o subtítulo"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite a descrição"
        />
      </div>

      {/* Button Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texto do Botão
        </label>
        <input
          type="text"
          value={formData.buttonText}
          onChange={(e) => handleInputChange('buttonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o texto do botão"
        />
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem de Fundo (URL)
        </label>
        <input
          type="url"
          value={formData.backgroundImage || ''}
          onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recursos Destacados
        </label>
        
        {/* Add Feature */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite um recurso"
            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
          />
          <button
            onClick={addFeature}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          {formData.features?.map((feature, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <span>{feature}</span>
              <button
                onClick={() => removeFeature(index)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}