/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Service, Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/store/auth';
import { useServicesStore } from '@/store/services';
import { Clock, Star, ArrowLeft, Calendar, User, Quote } from 'lucide-react';

const getCloudinaryUrl = (imageUrl: string | null | undefined, width: number = 1200, height: number = 600) => {
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

// Fonction pour nettoyer la description des marqueurs *mot*
const cleanDescription = (description: string): string => {
  return description.replace(/\*([^*]+)\*/g, '$1');
};

// Composant pour afficher les étoiles
const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${star <= rating
            ? 'text-amber-400 fill-amber-400'
            : star <= rating + 0.5
              ? 'text-amber-400 fill-amber-200'
              : 'text-stone-300'
            }`}
        />
      ))}
    </div>
  );
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { services } = useServicesStore();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      const cachedService = services.find((s: Service) => s.id === params.id);
      if (cachedService) {
        setService(cachedService);
        setIsLoading(false);
        return;
      }

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

  // Fetch reviews pour ce service (simulé pour l'instant)
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        // TODO: Implémenter l'API pour récupérer les avis par service
        // const response = await api.get<Review[]>(`/reviews/service/${params.id}`);
        // setReviews(response.data);

        // Données simulées pour l'interface
        const mockReviews: Review[] = [];
        setReviews(mockReviews);

        // Calculer la moyenne
        if (mockReviews.length > 0) {
          const avg = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    if (params.id) {
      fetchReviews();
    }
  }, [params.id]);

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Service introuvable'}</p>
          <Link href="/services">
            <Button>Retour aux services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getCloudinaryUrl(service.imageUrl);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Image Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={service.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-amber-100 via-amber-50 to-stone-100" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

        {/* Back Button */}
        <Link
          href="/services"
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-stone-800 px-4 py-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </Link>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={averageRating} size="lg" />
                <span className="text-white font-medium text-lg">{averageRating}/5</span>
                <span className="text-white/80">({reviews.length} avis)</span>
              </div>
            )}

            <h1 className="heading-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
              {service.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">{service.duration} minutes</span>
              </div>
              {/* <div className="bg-amber-500 text-white font-bold text-2xl px-6 py-2 rounded-full shadow-lg">
                {service.price}€
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="heading-serif text-2xl md:text-3xl font-semibold text-stone-800 mb-6">
                À propos de ce soin
              </h2>
              <div className="prose prose-stone prose-lg max-w-none">
                <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                  {cleanDescription(service.description)}
                </p>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-2xl shadow-xl p-6 border border-stone-100">
                <h3 className="heading-serif text-xl font-semibold text-stone-800 mb-4">
                  Réserver ce soin
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-600">Durée</span>
                    <span className="font-semibold text-stone-800">{service.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-600">Prix</span>
                    <span className="font-bold text-2xl text-amber-800">{service.price}€</span>
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-stone-600">Note</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={averageRating} size="sm" />
                        <span className="font-semibold text-stone-800">{averageRating}/5</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleBooking}
                  size="lg"
                  className="w-full"                >
                  {/* <Calendar className="w-5 h-5 mr-2" /> */}
                  Trouver un créneau
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-stone-500 mt-4">
                    Vous devez être connecté pour réserver
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 md:py-16 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-serif text-2xl md:text-3xl font-semibold text-stone-800">
              Ce que disent mes clients
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="font-semibold text-stone-800">{averageRating}/5</span>
                <span className="text-stone-500">({reviews.length} avis)</span>
              </div>
            )}
          </div>

          {isLoadingReviews ? (
            <div className="text-center py-12">
              <Loading />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <Quote className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-lg">
                Aucun avis pour le moment
              </p>
              <p className="text-stone-400 mt-2">
                Soyez le premier à partager votre expérience !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-amber-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-stone-800">
                          {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-stone-600 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-sm text-stone-400 mt-3">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-serif text-3xl md:text-4xl font-semibold text-white mb-6">
            Prêt(e) pour votre moment de détente ?
          </h2>
          <p className="text-lg text-stone-300 mb-8">
            Réservez dès maintenant et offrez-vous un instant de bien-être
          </p>
          <Button
            onClick={handleBooking}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Réserver ce massage
          </Button>
        </div>
      </section>
    </div>
  );
}
