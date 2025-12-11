/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Service } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Calendar } from '@/components/booking/Calendar';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useWorkingDaysStore } from '@/store/working-days';
import { useServicesStore } from '@/store/services';
import { MapEmbed } from '@/components/ui/MapEmbed';

interface BookingFormData {
  notes?: string;
}

export default function ReservationPage() {
  return (
    <ProtectedRoute>
      <ReservationContent />
    </ProtectedRoute>
  );
}

function ReservationContent() {
  const router = useRouter();
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [siteSettings, setSiteSettings] = useState<{ bookingAdvanceMinDays: number; bookingAdvanceMaxDays: number } | null>(null);

  const { register, handleSubmit } = useForm<BookingFormData>();

  // Utiliser les stores pour les données cachées
  const {
    workingDays,
    isLoading: isLoadingWorkingDays,
    isCacheValid: isWorkingDaysCacheValid,
    setWorkingDays,
    setLoading: setLoadingWorkingDays,
    updateLastFetched: updateWorkingDaysLastFetched
  } = useWorkingDaysStore();

  const { services } = useServicesStore();

  // Récupérer le service depuis le store ou l'état local
  const [service, setService] = useState<Service | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(true);

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await api.get('/site-settings');
        setSiteSettings({
          bookingAdvanceMinDays: response.data.bookingAdvanceMinDays,
          bookingAdvanceMaxDays: response.data.bookingAdvanceMaxDays
        });
      } catch (err) {
        console.error('Error fetching site settings:', err);
        // Valeurs par défaut en cas d'erreur
        setSiteSettings({
          bookingAdvanceMinDays: 0,
          bookingAdvanceMaxDays: 60
        });
      }
    };

    fetchSiteSettings();
  }, []);

  // Fetch working days avec cache
  useEffect(() => {
    const fetchWorkingDays = async () => {
      if (isWorkingDaysCacheValid()) {
        return; // Utiliser le cache
      }

      setLoadingWorkingDays(true);
      try {
        const response = await api.get<string[]>('/availability/working-days');
        setWorkingDays(response.data);
        updateWorkingDaysLastFetched();
      } catch (err) {
        console.error('Error fetching working days:', err);
      } finally {
        setLoadingWorkingDays(false);
      }
    };

    fetchWorkingDays();
  }, [isWorkingDaysCacheValid, setWorkingDays, setLoadingWorkingDays, updateWorkingDaysLastFetched]);

  // Fetch service avec possibilité d'utiliser le cache
  useEffect(() => {
    const fetchService = async () => {
      // Vérifier d'abord dans le store
      const cachedService = services.find((s: Service) => s.id === params.serviceId);
      if (cachedService) {
        setService(cachedService);
        setIsLoadingService(false);
        return;
      }

      // Sinon, charger depuis l'API
      try {
        const response = await api.get<Service>(`/services/${params.serviceId}`);
        setService(response.data);
      } catch (err) {
        setError('Service introuvable');
      } finally {
        setIsLoadingService(false);
      }
    };

    if (params.serviceId) {
      fetchService();
    }
  }, [params.serviceId, services]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !service) return;

      setIsLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await api.get<string[]>('/bookings/available-slots', {
          params: {
            serviceId: service.id,
            date: dateStr,
          },
        });
        setAvailableSlots(response.data);
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, service]);

  // Fonction de scroll smooth avec easing personnalisé
  const smoothScrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

    // Fonction d'easing ease-out (rapide au début, lent à la fin)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const startPosition = window.pageYOffset;
    const distance = middle - startPosition;
    const duration = 800; // Durée totale en ms
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Appliquer l'easing
      const easedProgress = easeOutCubic(progress);
      const currentPosition = startPosition + (distance * easedProgress);

      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // Scroll vers les créneaux quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      setTimeout(() => {
        smoothScrollToElement('time-slots-section');
      }, 200); // Délai réduit car l'animation est maintenant fluide
    }
  }, [selectedDate]);

  // Scroll vers les notes quand un créneau est sélectionné
  useEffect(() => {
    if (selectedSlot) {
      setTimeout(() => {
        smoothScrollToElement('notes-section');
      }, 200); // Délai réduit car l'animation est maintenant fluide
    }
  }, [selectedSlot]);

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedSlot || !service) {
      setError('Veuillez sélectionner une date et un créneau horaire');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const bookingData = {
        serviceId: service.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot,
        notes: data.notes,
      };

      await api.post('/bookings', bookingData);

      // Redirect to profile/bookings page
      router.push('/profile?tab=bookings');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
        'Erreur lors de la réservation. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingService) {
    return <Loading />;
  }

  if (error && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Services', href: '/services' },
            { label: service.name, href: `/services/${service.id}` },
            { label: 'Réservation' }
          ]}
          className="mb-8"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Réserver : {service.name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Date */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                1. Sélectionnez une date
              </h2>
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                workingDays={workingDays}
                minDate={siteSettings ? addDays(new Date(), siteSettings.bookingAdvanceMinDays - 1) : new Date()}
                maxDate={siteSettings ? addDays(new Date(), siteSettings.bookingAdvanceMaxDays) : addDays(new Date(), 60)}
              />
            </div>

            {/* Step 2: Select Time Slot */}
            {selectedDate && (
              <div id="time-slots-section">
                <h2 className="text-xl font-semibold mb-4">
                  2. Choisissez un créneau horaire
                </h2>
                <Card>
                  <p className="text-sm text-gray-600 mb-4">
                    Créneaux pour le{' '}
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <TimeSlotPicker
                    slots={availableSlots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                    isLoading={isLoadingSlots}
                  />
                </Card>
              </div>
            )}

            {/* Optional Notes */}
            {selectedSlot && (
              <div id="notes-section">
                <h2 className="text-xl font-semibold mb-4">
                  3. Notes (optionnel)
                </h2>
                <Card>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Informations complémentaires
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Préférences, informations spéciales..."
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Step 3: Confirm */}
            {/* {selectedSlot && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  3. Confirmez votre réservation
                </h2>
                <Card>
                  <p className="text-sm text-gray-600">
                    Vérifiez les informations ci-dessous et confirmez votre réservation.
                  </p>
                </Card>
              </div>
            )} */}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="font-medium">{service.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prix</p>
                  <p className="font-medium text-xl text-blue-600">
                    {service.price}€
                  </p>
                </div>
                {selectedDate && (
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
                {selectedSlot && (
                  <div>
                    <p className="text-sm text-gray-600">Heure</p>
                    <p className="font-medium">{selectedSlot}</p>
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              {selectedSlot && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
                    </Button>
                  </form>
                </div>
              )}

              {/* Map Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold mb-4">Emplacement du salon</h4>
                <MapEmbed width={400} height={250} />
                <p className="text-sm text-gray-600 mt-2">
                  21, Rue des goyaviers, Zac Moulin à vent, Le Robert 97231, Martinique
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

