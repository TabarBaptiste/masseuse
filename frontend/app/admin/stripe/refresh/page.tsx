'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import api from '@/lib/api';
import Link from 'next/link';
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function StripeRefreshPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <StripeRefreshContent />
        </ProtectedRoute>
    );
}

function StripeRefreshContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRetry = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/stripe/connect/onboarding-link');
            window.location.href = response.data.url;
        } catch (err: any) {
            console.error('Erreur lors de la génération du lien:', err);
            setError(err.response?.data?.message || 'Impossible de générer un nouveau lien');
            setLoading(false);
        }
    };

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
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-amber-100 rounded-full">
                            <RefreshCw className="w-16 h-16 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Lien expiré
                        </h1>
                        <p className="text-gray-600 max-w-md">
                            Le lien de configuration Stripe a expiré ou n&apos;est plus valide.
                            Cliquez sur le bouton ci-dessous pour générer un nouveau lien.
                        </p>

                        {error && (
                            <div className="w-full max-w-sm p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={handleRetry}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        Réessayer
                                    </>
                                )}
                            </button>

                            <Link href="/admin/dashboard">
                                <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                                    Retour au dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
