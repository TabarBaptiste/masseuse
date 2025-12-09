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
    }, [user]);

    const handleSubmit = async (formData: FormData) => {
        if (!user) return;

        setSaving(true);

        try {
            const data = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                phone: phoneNumber ? `${phonePrefix} ${phoneNumber}` : '',
            };

            const response = await api.patch(`/users/${user.id}`, data);
            setUser(response.data); // Update the user in the store
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

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Informations non modifiables</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <span className="ml-2 text-gray-900">{user.email}</span>
                                </div>
                            </div>
                        </div>

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