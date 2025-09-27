'use client';

import React, { useState, useEffect } from 'react';
import { WhatsAppConfig, WhatsAppMenuOption } from '@/types';

export function WhatsAppConfiguration() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [menuOptions, setMenuOptions] = useState<WhatsAppMenuOption[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp/config');
      const result = await response.json();
      
      if (result.success && result.data) {
        const configData = result.data;
        setConfig(configData);
        setPhoneNumber(configData.phoneNumber);
        setWelcomeMessage(configData.welcomeMessage);
        setMenuOptions(configData.menuOptions || []);
        setIsActive(configData.isActive);
      } else {
        // No config exists, set defaults
        setPhoneNumber('');
        setWelcomeMessage('Olá! Como podemos ajudar você hoje?');
        setMenuOptions([]);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
      setError('Erro ao carregar configuração do WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        phoneNumber,
        welcomeMessage,
        menuOptions,
        isActive
      };

      let response;
      if (config) {
        // Update existing config
        response = await fetch(`/api/whatsapp/config/${config.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new config
        response = await fetch('/api/whatsapp/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
        setSuccess('Configuração do WhatsApp salva com sucesso!');
      } else {
        setError(result.error?.message || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      setError('Erro ao salvar configuração do WhatsApp');
    } finally {
      setIsSaving(false);
    }
  };

  const addMenuOption = () => {
    const newOption: WhatsAppMenuOption = {
      id: `option_${Date.now()}`,
      title: '',
      message: '',
      icon: '💬',
      order: menuOptions.length
    };
    setMenuOptions([...menuOptions, newOption]);
  };

  const updateMenuOption = (index: number, field: keyof WhatsAppMenuOption, value: string) => {
    const updatedOptions = [...menuOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setMenuOptions(updatedOptions);
  };

  const removeMenuOption = (index: number) => {
    const updatedOptions = menuOptions.filter((_, i) => i !== index);
    setMenuOptions(updatedOptions);
  };

  const moveMenuOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuOptions.length) return;

    const updatedOptions = [...menuOptions];
    [updatedOptions[index], updatedOptions[newIndex]] = [updatedOptions[newIndex], updatedOptions[index]];
    
    // Update order values
    updatedOptions.forEach((option, i) => {
      option.order = i;
    });
    
    setMenuOptions(updatedOptions);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Configuração do WhatsApp</h2>
          <p className="text-gray-600 mt-2">
            Configure o botão flutuante do WhatsApp e as opções de menu para seus visitantes.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 5511999999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inclua o código do país (55 para Brasil)
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Ativar WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de Boas-vindas
            </label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              placeholder="Digite a mensagem que será enviada quando alguém clicar no botão do WhatsApp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Menu Options */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Opções do Menu</h3>
              <button
                onClick={addMenuOption}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Adicionar Opção
              </button>
            </div>

            <div className="space-y-4">
              {menuOptions.map((option, index) => (
                <div key={option.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ícone
                      </label>
                      <input
                        type="text"
                        value={option.icon || ''}
                        onChange={(e) => updateMenuOption(index, 'icon', e.target.value)}
                        placeholder="😊"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={option.title}
                        onChange={(e) => updateMenuOption(index, 'title', e.target.value)}
                        placeholder="Ex: Suporte Técnico"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        value={option.message}
                        onChange={(e) => updateMenuOption(index, 'message', e.target.value)}
                        rows={2}
                        placeholder="Mensagem que será enviada quando esta opção for selecionada"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col space-y-2">
                      <button
                        onClick={() => moveMenuOption(index, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑ Subir
                      </button>
                      <button
                        onClick={() => moveMenuOption(index, 'down')}
                        disabled={index === menuOptions.length - 1}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓ Descer
                      </button>
                      <button
                        onClick={() => removeMenuOption(index)}
                        className="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {menuOptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma opção de menu configurada.</p>
                  <p className="text-sm">Clique em "Adicionar Opção" para criar uma nova opção.</p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving || !phoneNumber || !welcomeMessage}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}