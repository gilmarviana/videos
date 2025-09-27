'use client';

import { useEffect, useState } from 'react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  minutesUsed: number;
}

export function TrialExpiredModal({ isOpen, onClose, onSubscribe, minutesUsed }: TrialExpiredModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const formatUsedTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes} minutos`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header */}
          <div className="bg-red-50 px-6 py-4 rounded-t-lg border-b border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⏰</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">
                  Teste Gratuito Expirado
                </h3>
                <p className="text-sm text-red-600">
                  Você utilizou {formatUsedTime(minutesUsed)} do seu teste gratuito
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Seu período de teste gratuito de 4 horas chegou ao fim. 
                Para continuar acessando nossos cursos, assine nossa plataforma.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  Plano Mensal - R$ 30,00
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Acesso ilimitado a todos os cursos</li>
                  <li>✓ Certificados de conclusão</li>
                  <li>✓ Suporte prioritário</li>
                  <li>✓ Novos cursos toda semana</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onSubscribe}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}