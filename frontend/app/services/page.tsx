'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Service, UserRole } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/store/auth';
import { useServicesStore } from '@/store/services';
import { Plus, Edit, Trash2, Clock, ArrowRight } from 'lucide-react';
import { MapEmbed } from '@/components/ui/MapEmbed';

// Fonction pour extraire les mots-clés entre *mot*
const extractKeywords = (description: string): string[] => {
  const regex = /\*([^*]+)\*/g;
  const keywords: string[] = [];
  let match;
  while ((match = regex.exec(description)) !== null) {
    keywords.push(match[1]);
  }
  return keywords;
};

// Fonction pour obtenir l'URL Cloudinary optimisée
const getCloudinaryUrl = (imageUrl: string | null | undefined, width: number = 800, height: number = 600) => {
  if (!imageUrl) return null;

  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl.replace('/upload/', `/upload/c_fill,w_${width},h_${height},f_auto,q_auto/`);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && imageUrl) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${imageUrl}`;
  }

  return imageUrl;
};

export default function ServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    services,
    isLoading,
    error,
    isCacheValid,
    setServices,
    setLoading,
    setError,
    updateLastFetched
  } = useServicesStore();

  const canManageServices = isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.PRO);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    if (isCacheValid()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<Service[]>('/services');
      if (Array.isArray(response.data)) {
        setServices(response.data);
        updateLastFetched();
      } else {
        console.error('API did not return an array:', response.data);
        setError('Erreur: données invalides reçues du serveur');
      }
    } catch {
      setError('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      await api.delete(`/services/${id}`);
      const updatedServices = services.filter((s: Service) => s.id !== id);
      setServices(updatedServices);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du service');
    }
  };

  const handleEdit = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/services/manage?id=${service.id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative py-20 pb-5 bg-linear-to-br from-amber-50 via-stone-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-amber-700 text-sm font-medium tracking-[0.3em] uppercase">
              Mes Prestations
            </span>
            <h1 className="heading-serif text-4xl sm:text-5xl md:text-6xl font-bold text-stone-800 mt-4 mb-6">
              Services de Massage
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Découvrez votre gamme complète de massages thérapeutiques et relaxants
            </p>
            {canManageServices && (
              <button
                onClick={() => router.push('/services/manage')}
                className="mt-8 inline-flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Nouveau service
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {Array.isArray(services) && services.length === 0 ? (
            <p className="text-center text-gray-600 py-20">
              Aucun service disponible pour le moment.
            </p>
          ) : Array.isArray(services) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const keywords = extractKeywords(service.description);
                const imageUrl = getCloudinaryUrl(service.imageUrl);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={service.id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                    onClick={() => router.push(`/services/${service.id}`)}
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className={`w-full h-full ${isEven ? 'bg-linear-to-br from-amber-100 to-amber-200' : 'bg-linear-to-br from-stone-100 to-stone-200'}`} />
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Price Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                        <span className="text-amber-800 font-bold text-lg">{service.price}€</span>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">{service.duration} min</span>
                      </div>

                      {/* Admin Actions */}
                      {canManageServices && (
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => handleEdit(service, e)}
                            className="p-2.5 bg-white/95 hover:bg-white text-stone-700 rounded-full shadow-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(service.id, e)}
                            className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="sm:p-4 p-6">
                      <h3 className="heading-serif text-2xl font-bold text-stone-800 mb-3 group-hover:text-amber-800 transition-colors">
                        {service.name}
                      </h3>

                      {/* Keywords Tags */}
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {keywords.slice(0, 4).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {keyword.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                        <span className="text-stone-500 text-sm">Voir les détails</span>
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-800 transition-colors duration-300">
                          <ArrowRight className="w-5 h-5 text-amber-800 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-red-600">
              Erreur: données des services invalides
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt(e) à vous détendre ?
          </h2>
          <p className="text-lg text-stone-300 mb-8">
            Choisissez le massage qui vous convient et réservez votre moment de bien-être
          </p>

          {/* Map Section */}
          <div className="mb-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">
              Me Trouver
            </h3>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <MapEmbed width={600} height={300} />
            </div>
            <p className="text-stone-300 mt-4 text-sm">
              21, Rue des goyaviers, Zac Moulin à vent, Le Robert 97231, Martinique
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
