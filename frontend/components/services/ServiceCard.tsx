import React from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';

interface ServiceCardProps {
  service: Service;
}

const getCloudinaryUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return null;

  // Si c'est déjà une URL Cloudinary, la retourner telle quelle
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  // Si c'est un public_id Cloudinary, construire l'URL
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && imageUrl) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_400,h_300,f_auto,q_auto/${imageUrl}`;
  }

  // Fallback vers l'URL originale
  return imageUrl;
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/reservation/${service.id}`);
  };

  const imageUrl = getCloudinaryUrl(service.imageUrl);

  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <div className="relative w-full h-48">
          <img
            src={imageUrl}
            alt={service.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      <div className={imageUrl ? 'pt-4' : ''}>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {service.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {service.description}
        </p>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {service.price}€
            </span>
            <span className="text-gray-600 ml-2">
              {service.duration} min
            </span>
          </div>
        </div>
        <Button onClick={handleBooking} className="w-full">
          Réserver ce massage
        </Button>
      </div>
    </Card>
  );
};
