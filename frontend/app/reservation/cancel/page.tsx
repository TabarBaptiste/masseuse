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

  const serviceId = searchParams.get('service_id');
  console.log('serviceId :', serviceId);

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

        {/* Actions */}
        <div className="space-y-3 rounded-lg mb-6">
          {serviceId && (
            <Button
              onClick={() => router.push(serviceId ? `/reservation/${serviceId}` : '/services')}
              className="flex items-center justify-center gap-2 px-3 py-2 w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Changer de créneau
            </Button>
          )}

          <Link href="/services" className="block">
            <Button variant="outline" className="flex items-center justify-center gap-2 px-3 py-2 w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voir les autres services
            </Button>
          </Link>
        </div>

        {/* Options */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">
            Que souhaitez-vous faire ?
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Changer de créneau</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowLeft className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Réserver un autre service</span>
            </li>
          </ul>
        </div> */}

        {/* Aide */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-amber-800">
            <strong>Besoin d&apos;aide ?</strong>
            <br />
            Si vous rencontrez des difficultés avec le paiement, n&apos;hésitez pas
            à me contacter.
          </div>
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
