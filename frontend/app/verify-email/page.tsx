'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { reloadUser } = useAuthStore();

    const [status, setStatus] = useState<'loading' | 'success' | 'already-verified' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(5);

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
                // Recharger les données utilisateur pour mettre à jour le statut emailVerified
                await reloadUser();
            } catch (error: unknown) {
                setStatus('error');
                const axiosError = error as { response?: { data?: { message?: string } } };
                setMessage(axiosError.response?.data?.message || 'Token de vérification invalide ou expiré');
            }
        };

        verifyEmail();
    }, [token, reloadUser]);

    // Compte à rebours et fermeture automatique après succès
    useEffect(() => {
        if (status === 'success' || status === 'already-verified') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        window.close();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [status]);

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
                                <p className="text-gray-600 mb-4">
                                    {message}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Cet onglet se fermera automatiquement dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                                </p>
                            </>
                        )}

                        {status === 'already-verified' && (
                            <>
                                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Déjà vérifié
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {message}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Cet onglet se fermera automatiquement dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                                </p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Erreur de vérification
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {message}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Vous pouvez fermer cet onglet. Si besoin, vous pourrez renvoyer un email de vérification depuis votre profil.
                                </p>
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
