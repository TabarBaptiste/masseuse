/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Service } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useAuthStore } from '@/store/auth';
import { useServicesStore } from '@/store/services';

const getCloudinaryUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return null;

  // Si c'est déjà une URL Cloudinary, la retourner telle quelle
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  // Si c'est un public_id Cloudinary, construire l'URL
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && imageUrl) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_400,f_auto,q_auto/${imageUrl}`;
  }

  // Fallback vers l'URL originale
  return imageUrl;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { services } = useServicesStore();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      // Vérifier d'abord dans le store
      const cachedService = services.find((s: Service) => s.id === params.id);
      if (cachedService) {
        setService(cachedService);
        setIsLoading(false);
        return;
      }

      // Sinon, charger depuis l'API
      try {
        const response = await api.get<Service>(`/services/${params.id}`);
        setService(response.data);
      } catch (_err) {
        setError('Service introuvable');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id, services]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/reservation/${service?.id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/services">
            <Button>Retour aux services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Services', href: '/services' },
            { label: service.name }
          ]}
          className="mb-6"
        />

        <Card>
          {service.imageUrl && getCloudinaryUrl(service.imageUrl) && (
            <img
              src={getCloudinaryUrl(service.imageUrl)!}
              alt={service.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {service.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-blue-600">
              {service.price}€
            </span>
            <span className="text-xl text-gray-600">
              {service.duration} minutes
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-line">
              {service.description}
            </p>
          </div>

          <Button
            onClick={handleBooking}
            size="lg"
            className="w-full md:w-auto"
          >
            Réserver ce massage
          </Button>
        </Card>
      </div>
    </div>
  );
}
