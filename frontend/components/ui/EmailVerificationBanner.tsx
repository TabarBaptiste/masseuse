'use client';

import React, { useState } from 'react';
import { AlertTriangle, Mail, RefreshCw, Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface EmailVerificationBannerProps {
    email: string;
    emailVerified: boolean;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
    email,
    emailVerified,
}) => {
    const { setUser, user } = useAuthStore();
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState(email);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    if (emailVerified) {
        return null;
    }

    const handleResendEmail = async () => {
        setIsResending(true);
        setError('');
        try {
            await api.post('/auth/resend-verification');
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setIsResending(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail || newEmail === email) {
            setIsEditing(false);
            return;
        }

        // Basic email validation
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(newEmail)) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        setIsUpdating(true);
        setError('');
        try {
            const response = await api.patch('/auth/update-email', { email: newEmail });
            // Update user in store
            if (user) {
                setUser({ ...user, email: response.data.email });
            }
            setIsEditing(false);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-1">
                        Confirmez votre adresse email
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                        Nous avons envoyé un email de confirmation à <strong>{email}</strong>.
                        Veuillez cliquer sur le lien dans l'email pour confirmer votre adresse.
                    </p>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                    placeholder="Nouvelle adresse email"
                                />
                                <Button
                                    onClick={handleUpdateEmail}
                                    disabled={isUpdating}
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700"
                                >
                                    {isUpdating ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewEmail(email);
                                        setError('');
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleResendEmail}
                                disabled={isResending || resendSuccess}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2 bg-white"
                            >
                                {isResending ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : resendSuccess ? (
                                    <Check className="w-4 h-4 mr-2 text-green-600" />
                                ) : (
                                    <Mail className="w-4 h-4 mr-2" />
                                )}
                                {resendSuccess ? 'Email envoyé !' : 'Renvoyer l\'email'}
                            </Button>
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2 bg-white"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Modifier l'email
                            </Button>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-600 mt-2">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
