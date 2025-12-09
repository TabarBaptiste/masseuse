/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Service, Review, Booking } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/store/auth';
import { useServicesStore } from '@/store/services';
import { SelectBookingForReviewModal } from '@/components/ui/SelectBookingForReviewModal';
import { EditReviewModal } from '@/components/ui/EditReviewModal';
import { Clock, Star, ArrowLeft, Calendar, User, Quote, MessageSquare } from 'lucide-react';

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

// Composant Toggle Switch
const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${enabled ? 'bg-green-600' : 'bg-stone-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  );
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { services } = useServicesStore();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [togglingReviews, setTogglingReviews] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [userCompletedBookings, setUserCompletedBookings] = useState<Booking[]>([]);
  const [showBookingSelectionModal, setShowBookingSelectionModal] = useState(false);
  const [editingReview, setEditingReview] = useState<{ id: string; rating: number; comment: string; serviceName: string } | null>(null);

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

  // Fetch reviews pour ce service
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        // Si l'utilisateur est PRO ou ADMIN, on récupère tous les avis (y compris non approuvés)
        // Sinon, seulement les avis publiés
        const publishedOnly = !(user?.role === 'PRO' || user?.role === 'ADMIN');
        const response = await api.get<Review[]>(`/reviews/service/${params.id}?publishedOnly=${publishedOnly}`);
        setReviews(response.data);

        // Calculer la moyenne seulement avec les avis publiés
        const publishedReviews = response.data.filter(review => review.isApproved);
        if (publishedReviews.length > 0) {
          const avg = publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length;
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
  }, [params.id, user?.role]);

  // Fetch completed bookings for the current user
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!isAuthenticated || !params.id) return;

      try {
        const response = await api.get<Booking[]>(`/reviews/service/${params.id}/user-bookings`);
        setUserCompletedBookings(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err);
      }
    };

    fetchUserBookings();
  }, [isAuthenticated, params.id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/reservation/${service?.id}`);
  };

  const handleLeaveReview = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (userCompletedBookings.length === 0) {
      alert('Vous devez avoir effectué au moins une réservation pour laisser un avis');
      return;
    }

    setShowBookingSelectionModal(true);
  };

  const refreshReviews = async () => {
    try {
      const publishedOnly = !(user?.role === 'PRO' || user?.role === 'ADMIN');
      const response = await api.get<Review[]>(`/reviews/service/${params.id}?publishedOnly=${publishedOnly}`);
      setReviews(response.data);

      // Recalculer la moyenne
      const publishedReviews = response.data.filter(review => review.isApproved);
      if (publishedReviews.length > 0) {
        const avg = publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }

      // Refresh bookings
      if (isAuthenticated) {
        const bookingsResponse = await api.get<Booking[]>(`/reviews/service/${params.id}/user-bookings`);
        setUserCompletedBookings(bookingsResponse.data);
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des avis:', err);
    }
  };

  const handleReviewClick = (review: Review) => {
    // Only allow user to edit their own reviews
    if (user && review.userId === user.id) {
      setEditingReview({
        id: review.id,
        rating: review.rating,
        comment: review.comment || '',
        serviceName: service?.name || 'Service',
      });
    }
  };

  const handleToggleReview = async (reviewId: string, currentStatus: boolean) => {
    // Ajouter l'ID à la liste des reviews en cours de modification
    setTogglingReviews(prev => new Set(prev).add(reviewId));

    try {
      // Endpoint pour activer/désactiver l'avis
      const endpoint = currentStatus ? `/reviews/${reviewId}/unpublish` : `/reviews/${reviewId}/approve`;
      await api.post(endpoint);

      // Recharger les avis après modification
      const publishedOnly = !(user?.role === 'PRO' || user?.role === 'ADMIN');
      const response = await api.get<Review[]>(`/reviews/service/${params.id}?publishedOnly=${publishedOnly}`);
      setReviews(response.data);

      // Recalculer la moyenne avec les avis publiés
      const publishedReviews = response.data.filter(review => review.isApproved);
      if (publishedReviews.length > 0) {
        const avg = publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Erreur lors de la modification de l\'avis:', err);
      alert('Erreur lors de la modification de l\'avis');
    } finally {
      // Retirer l'ID de la liste des reviews en cours de modification
      setTogglingReviews(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
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
            {reviews.filter(r => r.isApproved).length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={averageRating} size="lg" />
                <span className="text-white font-medium text-lg">{averageRating}/5</span>
                <span className="text-white/80">({reviews.filter(r => r.isApproved).length} avis)</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-12 md:pt-16 pb-8 md:pb-8">
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
                  {reviews.filter(r => r.isApproved).length > 0 && (
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
                  className="w-full"
                >
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
      <section className="py-12 md:py-8 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex-1">
              <h2 className="heading-serif text-2xl md:text-3xl font-semibold text-stone-800 mb-2">
                {user?.role === 'PRO' || user?.role === 'ADMIN' ? 'Avis clients' : 'Vos avis'}
              </h2>
              {reviews.filter(r => r.isApproved).length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} />
                  <span className="font-semibold text-stone-800">{averageRating}/5</span>
                  <span className="text-stone-500">({reviews.filter(r => r.isApproved).length} avis)</span>
                </div>
              )}
            </div>
            {isAuthenticated && user && userCompletedBookings.length > 0 && user.role !== 'ADMIN' && user.role !== 'PRO' && !reviews.some(review => review.userId === user.id) && (
              <Button
                onClick={handleLeaveReview}
                className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Laisser un avis
              </Button>
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
                {user?.role === 'PRO' || user?.role === 'ADMIN'
                  ? 'Les avis apparaîtront ici une fois approuvés'
                  : 'Soyez le premier à partager votre expérience !'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => {
                const isUserReview = user && review.userId === user.id;
                return (
                  <div
                    key={review.id}
                    onClick={() => handleReviewClick(review)}
                    className={`bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow ${isUserReview ? 'cursor-pointer ring-2 ring-amber-200' : ''
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-amber-800" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-800">
                              {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <StarRating rating={review.rating} size="sm" />
                            {(user?.role === 'PRO' || user?.role === 'ADMIN') && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500">
                                  {review.isApproved ? 'Publié' : 'Masqué'}
                                </span>
                                <ToggleSwitch
                                  enabled={review.isApproved}
                                  onChange={() => handleToggleReview(review.id, review.isApproved)}
                                  disabled={togglingReviews.has(review.id)}
                                />
                              </div>
                            )}
                          </div>
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
              );
              })}
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

      {/* Modals */}
      {showBookingSelectionModal && service && (
        <SelectBookingForReviewModal
          bookings={userCompletedBookings}
          serviceName={service.name}
          onClose={() => setShowBookingSelectionModal(false)}
          onReviewSubmitted={refreshReviews}
        />
      )}

      {editingReview && (
        <EditReviewModal
          reviewId={editingReview.id}
          currentRating={editingReview.rating}
          currentComment={editingReview.comment}
          serviceName={editingReview.serviceName}
          onClose={() => setEditingReview(null)}
          onReviewUpdated={refreshReviews}
        />
      )}
    </div>
  );
}