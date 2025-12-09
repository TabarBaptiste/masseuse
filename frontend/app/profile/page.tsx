'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Booking, BookingStatus } from '@/types';
import api from '@/lib/api';
import Link from 'next/link';
import { LeaveReviewModal } from '@/components/ui/LeaveReviewModal';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; serviceName: string } | null>(null);

  useEffect(() => {
    // Force scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my-bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      case 'NO_SHOW':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'COMPLETED':
        return 'Terminée';
      case 'CANCELLED':
        return 'Annulée';
      case 'NO_SHOW':
        return 'Absent';
      default:
        return status;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}`, { status: BookingStatus.CANCELLED });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b));
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      alert('Erreur lors de l\'annulation de la réservation');
    }
  };

  const canCancelBooking = (booking: Booking) => {
    // Vérifier si la réservation peut être annulée (statut et délai de 24h)
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      return false;
    }

    // Calculer la date et heure de la réservation
    const datePart = booking.date.split('T')[0];
    const bookingDateTime = new Date(`${datePart}T${booking.startTime}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Ne permettre l'annulation que si plus de 24h avant le rendez-vous
    return hoursUntilBooking > 24;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: 'Mon Profil' }]}
          className="mb-8"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mon Profil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
              {user.role === 'ADMIN' && (
                <div>
                  <p className="text-sm text-gray-600">Rôle</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
              >
                Modifier mes informations
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Mes réservations{loading ? '' : ` (${bookings.length})`}</h2>
            {loading ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-gray-600">
                Vous n'avez pas encore de réservation.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{booking.service?.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                      <p><strong>Heure:</strong> {booking.startTime} - {booking.endTime}</p>
                      <p><strong>Durée:</strong> {booking.service?.duration} minutes</p>
                      <p><strong>Prix:</strong> {booking.priceAtBooking}€</p>
                    </div>
                    {canCancelBooking(booking) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Annuler la réservation
                        </button>
                      </div>
                    )}
                    {booking.status === BookingStatus.COMPLETED && (!booking.reviews || booking.reviews.length === 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setReviewModal({ bookingId: booking.id, serviceName: booking.service?.name || 'Service' })}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Laisser un avis
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <LeaveReviewModal
          bookingId={reviewModal.bookingId}
          serviceName={reviewModal.serviceName}
          onClose={() => setReviewModal(null)}
          onReviewSubmitted={() => {
            setReviewModal(null);
            // Optionally refresh bookings or show success message
          }}
        />
      )}
    </div>
  );
}
