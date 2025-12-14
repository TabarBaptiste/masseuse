'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'already-verified' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token de vérification manquant');
                return;
            }

            try {
                const response = await api.get(`/auth/verify-email/${token}`);
                if (response.data.alreadyVerified) {
                    setStatus('already-verified');
                    setMessage('Votre email a déjà été vérifié');
                } else {
                    setStatus('success');
                    setMessage('Votre email a été vérifié avec succès !');
                }
            } catch (error: unknown) {
                setStatus('error');
                const axiosError = error as { response?: { data?: { message?: string } } };
                setMessage(axiosError.response?.data?.message || 'Token de vérification invalide ou expiré');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card>
                    <div className="text-center py-8">
                        {status === 'loading' && (
                            <>
                                <Loader2 className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Vérification en cours...
                                </h2>
                                <p className="text-gray-600">
                                    Veuillez patienter pendant que nous vérifions votre email.
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Email vérifié !
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Button onClick={() => router.push('/profile')} className="w-full">
                                        Accéder à mon profil
                                    </Button>
                                    <Link
                                        href="/services"
                                        className="block text-amber-700 hover:text-amber-800 font-medium"
                                    >
                                        Découvrir nos services
                                    </Link>
                                </div>
                            </>
                        )}

                        {status === 'already-verified' && (
                            <>
                                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Déjà vérifié
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Button onClick={() => router.push('/profile')} className="w-full">
                                        Accéder à mon profil
                                    </Button>
                                </div>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Erreur de vérification
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Button onClick={() => router.push('/profile')} className="w-full">
                                        Accéder à mon profil
                                    </Button>
                                    <p className="text-sm text-gray-500">
                                        Vous pourrez renvoyer un email de vérification depuis votre profil.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
