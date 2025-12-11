'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

function CancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-slate-100">
      <Card className="max-w-lg w-full mx-4 p-8">
        {/* Icône d'annulation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-4">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Paiement annulé
          </h1>
          <p className="text-gray-600">
            Votre réservation n&apos;a pas été finalisée
          </p>
        </div>

        {/* Message d'information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-700 text-center">
            Le paiement de l&apos;acompte a été annulé ou interrompu.
            <br />
            <span className="text-gray-500 text-sm">
              Aucun montant n&apos;a été débité de votre compte.
            </span>
          </p>
        </div>

        {/* Options */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">
            Que souhaitez-vous faire ?
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Réessayer le paiement depuis votre profil si la réservation est toujours valide</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowLeft className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Créer une nouvelle réservation avec un autre créneau</span>
            </li>
          </ul>
        </div>

        {/* Aide */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-amber-800">
            <strong>Besoin d&apos;aide ?</strong>
            <br />
            Si vous rencontrez des difficultés avec le paiement, n&apos;hésitez pas
            à nous contacter.
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {bookingId ? (
            <Button
              onClick={() => router.push('/profile?tab=bookings')}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Voir mes réservations
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/services')}
              className="w-full"
            >
              Nouvelle réservation
            </Button>
          )}

          <Link href="/services" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voir les services
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="ghost" className="w-full text-gray-600">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
