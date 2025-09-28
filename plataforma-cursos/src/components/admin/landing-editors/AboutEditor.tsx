'use client';

import React, { useState, useEffect } from 'react';
import { AboutContent, StatItem } from '@/types';
import { AboutSection } from '@/components/landing/AboutSection';
import { ImageUpload } from '../ImageUpload';

interface AboutEditorProps {
  content?: AboutContent;
  onSave: (content: AboutContent) => void;
  previewMode: boolean;
}

export function AboutEditor({ content, onSave, previewMode }: AboutEditorProps) {
  const [formData, setFormData] = useState<AboutContent>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    stats: [],
  });

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof AboutContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStat = () => {
    const newStat: StatItem = {
      label: '',
      value: '',
      icon: '',
    };
    setFormData(prev => ({ 
      ...prev, 
      stats: [...(prev.stats || []), newStat] 
    }));
  };

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats?.map((stat, i) => 
        i === index ? { ...stat, [field]: value } : stat
      ) || [],
    }));
  };

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats?.filter((_, i) => i !== index) || [],
    }));
  };

  if (previewMode) {
    return <AboutSection content={formData} />;
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
          placeholder="Digite o título da seção"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o subtítulo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite a descrição da seção"
        />
      </div>

      <ImageUpload
        currentImageUrl={formData.imageUrl}
        onImageUpload={(url) => handleInputChange('imageUrl', url)}
        section="about"
        label="Imagem da Seção"
      />

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Estatísticas</label>
          <button onClick={addStat} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Adicionar Estatística
          </button>
        </div>

        <div className="space-y-4">
          {formData.stats?.map((stat, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Estatística {index + 1}</h4>
                <button onClick={() => removeStat(index)} className="text-red-600 hover:text-red-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1000+"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rótulo</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Alunos Ativos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone (opcional)</label>
                  <input
                    type="text"
                    value={stat.icon || ''}
                    onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 👥"
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