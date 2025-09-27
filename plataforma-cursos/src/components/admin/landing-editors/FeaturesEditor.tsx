'use client';

import React, { useState, useEffect } from 'react';
import { FeaturesContent, FeatureItem } from '@/types';
import { FeaturesSection } from '@/components/landing/FeaturesSection';

interface FeaturesEditorProps {
  content?: FeaturesContent;
  onSave: (content: FeaturesContent) => void;
  previewMode: boolean;
}

export function FeaturesEditor({ content, onSave, previewMode }: FeaturesEditorProps) {
  const [formData, setFormData] = useState<FeaturesContent>({
    title: '',
    subtitle: '',
    items: [],
  });

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof FeaturesContent, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFeature = () => {
    const newFeature: FeatureItem = {
      title: '',
      description: '',
      icon: 'star',
      imageUrl: '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newFeature],
    }));
  };

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const iconOptions = [
    { value: 'star', label: '⭐ Estrela' },
    { value: 'clock', label: '🕒 Relógio' },
    { value: 'certificate', label: '📜 Certificado' },
    { value: 'support', label: '🎧 Suporte' },
  ];

  if (previewMode) {
    return <FeaturesSection content={formData} />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título da Seção
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o título da seção"
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

      {/* Features */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Recursos
          </label>
          <button
            onClick={addFeature}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Adicionar Recurso
          </button>
        </div>

        <div className="space-y-6">
          {formData.items.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Recurso {index + 1}</h4>
                <button
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título do recurso"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone
                  </label>
                  <select
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição do recurso"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={feature.imageUrl || ''}
                    onChange={(e) => updateFeature(index, 'imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
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