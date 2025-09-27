'use client';

import React, { useState, useEffect } from 'react';
import { PricingContent, PricingPlan } from '@/types';
import { PricingSection } from '@/components/landing/PricingSection';

interface PricingEditorProps {
  content?: PricingContent;
  onSave: (content: PricingContent) => void;
  previewMode: boolean;
}

export function PricingEditor({ content, onSave, previewMode }: PricingEditorProps) {
  const [formData, setFormData] = useState<PricingContent>({
    title: '',
    subtitle: '',
    plans: [],
  });

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof PricingContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPlan = () => {
    const newPlan: PricingPlan = {
      name: '',
      price: '',
      period: 'mês',
      description: '',
      features: [],
      buttonText: '',
      highlighted: false,
    };
    setFormData(prev => ({ ...prev, plans: [...prev.plans, newPlan] }));
  };

  const updatePlan = (index: number, field: keyof PricingPlan, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      ),
    }));
  };

  const removePlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  const addFeatureToPlan = (planIndex: number, feature: string) => {
    if (feature.trim()) {
      const updatedFeatures = [...formData.plans[planIndex].features, feature.trim()];
      updatePlan(planIndex, 'features', updatedFeatures);
    }
  };

  const removeFeatureFromPlan = (planIndex: number, featureIndex: number) => {
    const updatedFeatures = formData.plans[planIndex].features.filter((_, i) => i !== featureIndex);
    updatePlan(planIndex, 'features', updatedFeatures);
  };

  if (previewMode) {
    return <PricingSection content={formData} />;
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
          <label className="block text-sm font-medium text-gray-700">Planos</label>
          <button onClick={addPlan} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Adicionar Plano
          </button>
        </div>

        <div className="space-y-6">
          {formData.plans.map((plan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Plano {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={plan.highlighted}
                      onChange={(e) => updatePlan(index, 'highlighted', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacado</span>
                  </label>
                  <button onClick={() => removePlan(index)} className="text-red-600 hover:text-red-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                  <input
                    type="text"
                    value={plan.price}
                    onChange={(e) => updatePlan(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <input
                    type="text"
                    value={plan.period}
                    onChange={(e) => updatePlan(index, 'period', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={plan.buttonText}
                    onChange={(e) => updatePlan(index, 'buttonText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={plan.description}
                    onChange={(e) => updatePlan(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recursos do Plano</label>
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <span>{feature}</span>
                      <button
                        onClick={() => removeFeatureFromPlan(index, featureIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Novo recurso"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addFeatureToPlan(index, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        addFeatureToPlan(index, input.value);
                        input.value = '';
                      }}
                      className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
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