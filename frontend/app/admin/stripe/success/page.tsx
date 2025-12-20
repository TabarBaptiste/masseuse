'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import api from '@/lib/api';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface StripeConnectStatus {
    status: 'configured' | 'pending' | 'not_created';
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    detailsSubmitted?: boolean;
}

export default function StripeSuccessPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <StripeSuccessContent />
        </ProtectedRoute>
    );
}

function StripeSuccessContent() {
    const [status, setStatus] = useState<StripeConnectStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await api.get('/stripe/connect/status');
                setStatus(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération du statut:', err);
                setError('Impossible de vérifier le statut de votre compte Stripe');
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const isFullyConfigured = status?.status === 'configured';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Configuration Stripe' }
                    ]}
                    className="mb-8"
                />

                <Card className="text-center py-8">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            <p className="text-gray-600">Vérification du statut...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-4">
                            <AlertCircle className="w-16 h-16 text-red-500" />
                            <h1 className="text-2xl font-bold text-gray-900">Erreur</h1>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    ) : isFullyConfigured ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-green-100 rounded-full">
                                <CheckCircle className="w-16 h-16 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Configuration terminée !
                            </h1>
                            <p className="text-gray-600 max-w-md">
                                Votre compte Stripe Connect est maintenant entièrement configuré.
                                Vous pouvez commencer à recevoir des paiements.
                            </p>
                            <div className="mt-4 p-4 bg-green-50 rounded-lg text-left w-full max-w-sm">
                                <p className="text-sm text-green-800 font-medium mb-2">Statut :</p>
                                <ul className="space-y-1 text-sm text-green-700">
                                    <li>✓ Paiements activés</li>
                                    <li>✓ Virements activés</li>
                                    <li>✓ Informations complètes</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-amber-100 rounded-full">
                                <AlertCircle className="w-16 h-16 text-amber-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Configuration incomplète
                            </h1>
                            <p className="text-gray-600 max-w-md">
                                Votre compte Stripe a été créé mais la configuration n&apos;est pas terminée.
                                Veuillez compléter les informations manquantes.
                            </p>
                            <div className="mt-4 p-4 bg-amber-50 rounded-lg text-left w-full max-w-sm">
                                <p className="text-sm text-amber-800 font-medium mb-2">Statut :</p>
                                <ul className="space-y-1 text-sm">
                                    <li className={status?.chargesEnabled ? 'text-green-700' : 'text-amber-700'}>
                                        {status?.chargesEnabled ? '✓' : '○'} Paiements {status?.chargesEnabled ? 'activés' : 'en attente'}
                                    </li>
                                    <li className={status?.payoutsEnabled ? 'text-green-700' : 'text-amber-700'}>
                                        {status?.payoutsEnabled ? '✓' : '○'} Virements {status?.payoutsEnabled ? 'activés' : 'en attente'}
                                    </li>
                                    <li className={status?.detailsSubmitted ? 'text-green-700' : 'text-amber-700'}>
                                        {status?.detailsSubmitted ? '✓' : '○'} Informations {status?.detailsSubmitted ? 'complètes' : 'manquantes'}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/admin/dashboard">
                            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                                Retour au dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                        
                        {!isFullyConfigured && !loading && !error && (
                            <a
                                href="https://dashboard.stripe.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Accéder à Stripe Dashboard
                            </a>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
