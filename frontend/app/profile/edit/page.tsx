'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { FormField } from '@/components/ui/FormField';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function EditProfilePage() {
    return (
        <ProtectedRoute>
            <EditProfileContent />
        </ProtectedRoute>
    );
}

function EditProfileContent() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [phonePrefix, setPhonePrefix] = useState('+596');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Force scroll to top on page load
        window.scrollTo(0, 0);
        
        // Initialiser les valeurs du téléphone
        if (user?.phone) {
            const parts = user.phone.split(' ');
            if (parts.length > 1) {
                setPhonePrefix(parts[0]);
                setPhoneNumber(parts.slice(1).join(' '));
            }
        }

        // Initialiser l'email
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (formData: FormData) => {
        if (!user) return;

        setSaving(true);

        try {
            // Mise à jour des informations de base
            const data = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                phone: phoneNumber ? `${phonePrefix} ${phoneNumber}` : '',
            };

            const response = await api.patch(`/users/${user.id}`, data);
            
            // Si l'email a changé et n'est pas vérifié, le mettre à jour
            if (!user.emailVerified && email !== user.email) {
                const emailResponse = await api.patch('/auth/update-email', { email });
                setUser(emailResponse.data);
                alert('Votre email a été mis à jour. Un nouvel email de vérification a été envoyé.');
            } else {
                setUser(response.data);
            }
            
            router.push('/profile');
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            alert('Erreur lors de la modification de votre profil');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Mon Profil', href: '/profile' },
                        { label: 'Modifier mes informations' }
                    ]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modifier mes informations
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Mettez à jour vos informations personnelles
                    </p>
                </div>

                <Card>
                    <form action={handleSubmit} className="space-y-6">
                        <FormField
                            label="Prénom"
                            name="firstName"
                            type="text"
                            defaultValue={user.firstName}
                            required
                        />

                        <FormField
                            label="Nom"
                            name="lastName"
                            type="text"
                            defaultValue={user.lastName}
                            required
                        />

                        <PhoneInput
                            label="Téléphone"
                            prefixValue={phonePrefix}
                            numberValue={phoneNumber}
                            onPrefixChange={setPhonePrefix}
                            onNumberChange={setPhoneNumber}
                        />

                        {/* Email - modifiable uniquement si non vérifié */}
                        {!user.emailVerified ? (
                            <div>
                                <FormField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="mt-2 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>
                                        Votre email n'est pas encore vérifié. Vous pouvez le modifier maintenant. Un nouvel email de vérification sera envoyé.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Informations non modifiables</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <span className="ml-2 text-gray-900">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Link
                                href="/profile"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-center"
                            >
                                Annuler
                            </Link>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}