import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'masseuse_services');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      alert('Configuration Cloudinary manquante');
      return;
    }

    try {
      setUploading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;
      setPreview(imageUrl);
      onChange(imageUrl);
    } catch (error) {
      console.error('Erreur upload Cloudinary:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      uploadToCloudinary(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCloudinaryUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    // Si c'est déjà une URL Cloudinary optimisée, la retourner telle quelle
    if (imageUrl.includes('cloudinary.com') && imageUrl.includes('c_fill')) {
      return imageUrl;
    }

    // Si c'est une URL Cloudinary simple, l'optimiser
    if (imageUrl.includes('cloudinary.com')) {
      return imageUrl.replace('/upload/', '/upload/c_fill,w_400,h_300,f_auto,q_auto/');
    }

    // Si c'est un public_id, construire l'URL optimisée
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloudName && imageUrl) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_400,h_300,f_auto,q_auto/${imageUrl}`;
    }

    return imageUrl;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Image du service
      </label>

      {/* Zone d'upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          {preview ? (
            <div className="relative inline-block">
              <img
                src={getCloudinaryUrl(preview) || preview}
                alt="Aperçu"
                className="max-w-full h-32 object-cover rounded-lg mx-auto"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || uploading}
                  className="font-medium text-amber-600 hover:text-amber-500 disabled:opacity-50"
                >
                  Télécharger une image
                </button>
                <span className="ml-1">ou glisser-déposer</span>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF jusqu'à 5MB
              </p>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Upload en cours...</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>

      {/* Champ caché pour la valeur */}
      <input
        type="hidden"
        name="imageUrl"
        value={preview || ''}
      />
    </div>
  );
};