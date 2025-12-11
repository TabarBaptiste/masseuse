'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Clock, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

interface PaymentVerification {
  valid: boolean;
  paymentStatus?: string;
  amountPaid?: number;
  customerEmail?: string;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !bookingId) {
        setError('Paramètres de paiement manquants');
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<PaymentVerification>(
          `/stripe/verify-payment/${bookingId}?session_id=${sessionId}`
        );

        if (response.data.valid) {
          setVerification(response.data);
        } else {
          setError('Le paiement n\'a pas pu être vérifié');
        }
      } catch (err) {
        console.error('Erreur de vérification:', err);
        setError('Erreur lors de la vérification du paiement');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Erreur de vérification
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/profile?tab=bookings')} className="w-full">
              Voir mes réservations
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-teal-50">
      <Card className="max-w-lg w-full mx-4 p-8">
        {/* Icône de succès avec animation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Paiement confirmé !
          </h1>
          <p className="text-gray-600">
            Votre acompte a été reçu avec succès
          </p>
        </div>

        {/* Détails du paiement */}
        {verification && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="w-5 h-5" />
                <span>Montant payé</span>
              </div>
              <span className="font-semibold text-gray-800">
                {verification.amountPaid?.toFixed(2)} €
              </span>
            </div>

            {verification.customerEmail && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Confirmation envoyée à</span>
                <span className="font-medium text-gray-800">
                  {verification.customerEmail}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div className="shrink-0">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">
                Prochaines étapes
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Votre réservation est maintenant en attente de confirmation</li>
                <li>• Vous recevrez un email de confirmation très prochainement</li>
                <li>• Vous pouvez suivre votre réservation depuis votre profil</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rappel sur l'acompte */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div className="shrink-0">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
            </div>
            <div className="text-sm text-amber-800">
              <strong>Rappel :</strong> L&apos;acompte n&apos;est pas remboursable en cas
              d&apos;annulation tardive. Pensez à annuler à l&apos;avance si vos plans
              changent.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/profile?tab=bookings')}
            className="w-full"
          >
            Voir mes réservations
          </Button>
          <Link href="/services" className="block">
            <Button variant="outline" className="w-full">
              Réserver un autre service
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
