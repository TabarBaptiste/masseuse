'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Service, UserRole } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/store/auth';
import { useServicesStore } from '@/store/services';
import { CloudinaryUpload } from '@/components/ui/CloudinaryUpload';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

function ManageServiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuthStore();
    const { services, setServices, updateLastFetched } = useServicesStore();
    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const serviceId = searchParams.get('id');
    const isEdit = !!serviceId;

    const canManageServices = isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.PRO);

    const fetchService = useCallback(async () => {
        // Vérifier d'abord dans le store
        const cachedService = services.find((s: Service) => s.id === serviceId);
        if (cachedService) {
            setService(cachedService);
            setIsLoading(false);
            return;
        }

        // Sinon, charger depuis l'API
        try {
            const response = await api.get<Service>(`/services/${serviceId}`);
            setService(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement du service:', error);
            router.push('/services');
        } finally {
            setIsLoading(false);
        }
    }, [services, serviceId, router]);

    useEffect(() => {
        if (!canManageServices) {
            router.push('/services');
            return;
        }

        if (isEdit && serviceId) {
            fetchService();
        } else {
            setIsLoading(false);
        }
    }, [canManageServices, isEdit, serviceId, router, fetchService]);

    const handleSubmit = async (formData: FormData) => {
        setSaving(true);

        try {
            const data = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                duration: parseInt(formData.get('duration') as string),
                imageUrl: formData.get('imageUrl') as string,
                isActive: formData.get('isActive') === 'on',
            };

            let updatedService: Service;
            if (isEdit && serviceId) {
                const response = await api.patch(`/services/${serviceId}`, data);
                updatedService = response.data;
                // Mettre à jour le service dans le store
                const updatedServices = services.map((s: Service) =>
                    s.id === serviceId ? updatedService : s
                );
                setServices(updatedServices);
            } else {
                const response = await api.post('/services', data);
                updatedService = response.data;
                // Ajouter le nouveau service au store
                setServices([...services, updatedService]);
                updateLastFetched();
            }

            router.push('/services');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Erreur lors de la sauvegarde du service');
        } finally {
            setSaving(false);
        }
    };

    if (!canManageServices) {
        return null;
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Services', href: '/services' },
                        { label: isEdit ? 'Modifier le service' : 'Nouveau service' }
                    ]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Modifier le service' : 'Nouveau service'}
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nom du service *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                defaultValue={service?.name || ''}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={service?.description || ''}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Prix (€) *
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    defaultValue={service?.price || ''}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                    Durée (minutes) *
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    defaultValue={service?.duration || 60}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <CloudinaryUpload
                            value={service?.imageUrl}
                            onChange={(url: string) => {
                                // Mettre à jour la valeur dans le formulaire
                                const form = document.querySelector('form') as HTMLFormElement;
                                const hiddenInput = form.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                                if (hiddenInput) {
                                    hiddenInput.value = url;
                                }
                            }}
                        />

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                defaultChecked={service?.isActive ?? true}
                                className="w-4 h-4 text-amber-800 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                Service actif (visible pour les clients)
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href="/services"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-center"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ManageServicePage() {
    return (
        <Suspense fallback={<Loading />}>
            <ManageServiceContent />
        </Suspense>
    );
}