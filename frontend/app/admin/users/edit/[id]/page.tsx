'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { User, UserRole } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/store/auth';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { FormField } from '@/components/ui/FormField';

function EditUserContent() {
    const router = useRouter();
    const params = useParams();
    const { user: currentUser, isAuthenticated } = useAuthStore();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completedBookingsCount, setCompletedBookingsCount] = useState(0);

    const userId = params.id as string;
    const canManageUsers = isAuthenticated && currentUser?.role === UserRole.ADMIN;

    useEffect(() => {
        if (!canManageUsers) {
            router.push('/admin/users');
            return;
        }

        if (userId) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, [canManageUsers, userId, router]);

    const fetchUser = async () => {
        try {
            const response = await api.get<User>(`/users/${userId}`);
            setEditingUser(response.data);
            // Récupérer les réservations terminées
            await fetchCompletedBookings();
        } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
            router.push('/admin/users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompletedBookings = async () => {
        try {
            const response = await api.get(`/bookings?userId=${userId}&status=COMPLETED`);
            setCompletedBookingsCount(response.data.length || 0);
        } catch (error) {
            console.error('Erreur lors du chargement des réservations:', error);
            setCompletedBookingsCount(0);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        if (!editingUser) return;

        setSaving(true);

        try {
            const data = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
            };

            await api.patch(`/users/${editingUser.id}`, data);
            router.push('/admin/users');
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            alert('Erreur lors de la modification de l\'utilisateur');
        } finally {
            setSaving(false);
        }
    };

    if (!canManageUsers) {
        return null;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!editingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Utilisateur non trouvé</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Utilisateurs', href: '/admin/users' },
                        { label: 'Modifier l\'utilisateur' }
                    ]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modifier l'utilisateur
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {editingUser.firstName} {editingUser.lastName} ({editingUser.email})
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form action={handleSubmit} className="space-y-6">
                        <FormField
                            label="Prénom"
                            name="firstName"
                            type="text"
                            defaultValue={editingUser.firstName}
                            required
                        />

                        <FormField
                            label="Nom"
                            name="lastName"
                            type="text"
                            defaultValue={editingUser.lastName}
                            required
                        />

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            defaultValue={editingUser.email}
                            required
                        />

                        <FormField
                            label="Téléphone"
                            name="phone"
                            type="tel"
                            defaultValue={editingUser.phone || ''}
                        />
                        <hr />
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Informations système</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Service{completedBookingsCount !== 1 ? 's' : ''} rendu{completedBookingsCount !== 1 ? 's' : ''}:</span>
                                    <span className="ml-2 text-gray-900">
                                        {completedBookingsCount}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Statut:</span>
                                    <span className={`ml-2 ${editingUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {editingUser.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Rôle:</span>
                                    <span className="ml-2 text-gray-900">{editingUser.role}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Créé le:</span>
                                    <span className="ml-2 text-gray-900">
                                        {new Date(editingUser.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href="/admin/users"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-center"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Enregistrement...' : 'Modifier'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function EditUserPage() {
    return (
        <Suspense fallback={<Loading />}>
            <EditUserContent />
        </Suspense>
    );
}