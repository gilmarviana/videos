'use client';

import React, { useEffect, useRef } from 'react';
import { WhatsAppConfig, WhatsAppMenuOption } from '@/types';

interface WhatsAppMenuProps {
  config: WhatsAppConfig;
  onClose: () => void;
  onOptionSelect: (optionId: string) => void;
}

export function WhatsAppMenu({ config, onClose, onOptionSelect }: WhatsAppMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const sortedOptions = [...config.menuOptions].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div
        ref={menuRef}
        className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[280px] max-w-[320px] animate-in slide-in-from-bottom-2 duration-300"
      >
        {/* Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">WhatsApp</h3>
                <p className="text-xs opacity-90">Como podemos ajudar?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              aria-label="Close menu"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        {config.welcomeMessage && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-600">{config.welcomeMessage}</p>
          </div>
        )}

        {/* Menu Options */}
        <div className="py-2">
          {sortedOptions.map((option) => (
            <MenuOption
              key={option.id}
              option={option}
              onClick={() => onOptionSelect(option.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Clique em uma opção para iniciar a conversa
          </p>
        </div>
      </div>
    </div>
  );
}

interface MenuOptionProps {
  option: WhatsAppMenuOption;
  onClick: () => void;
}

function MenuOption({ option, onClick }: MenuOptionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 focus:outline-none focus:bg-gray-50"
    >
      <div className="flex items-center space-x-3">
        {option.icon && (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{option.icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {option.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {option.message.length > 60 
              ? `${option.message.substring(0, 60)}...` 
              : option.message
            }
          </p>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </button>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}