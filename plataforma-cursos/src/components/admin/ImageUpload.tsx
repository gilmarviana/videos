'use client';

import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  section: string;
  label?: string;
  className?: string;
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUpload, 
  section, 
  label = "Imagem",
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Apenas arquivos JPEG, PNG e WebP são permitidos');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('O arquivo deve ter menos de 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section);

      const response = await fetch('/api/admin/landing/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onImageUpload(result.data.url);
      } else {
        setError(result.error?.message || 'Erro ao fazer upload da imagem');
      }
    } catch (err) {
      setError('Erro ao fazer upload da imagem');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="relative inline-block">
          <img
            src={currentImageUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            title="Remover imagem"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{currentImageUrl ? 'Alterar Imagem' : 'Fazer Upload'}</span>
            </>
          )}
        </button>

        {/* URL Input Alternative */}
        <span className="text-gray-500">ou</span>
        <input
          type="url"
          placeholder="Cole a URL da imagem"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onBlur={(e) => {
            if (e.target.value.trim()) {
              onImageUpload(e.target.value.trim());
            }
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB
      </p>
    </div>
  );
}