'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, SiteSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Save } from 'lucide-react';
import Link from 'next/link';

export default function ProSettingsPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <SettingsContent />
        </ProtectedRoute>
    );
}

function SettingsContent() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get<SiteSettings>('/site-settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            salonName: formData.get('salonName') as string,
            salonDescription: formData.get('salonDescription') as string,
            salonAddress: formData.get('salonAddress') as string,
            salonPhone: formData.get('salonPhone') as string,
            salonEmail: formData.get('salonEmail') as string,
            logoUrl: formData.get('logoUrl') as string,
            heroImageUrl: formData.get('heroImageUrl') as string,
            defaultOpenTime: formData.get('defaultOpenTime') as string,
            defaultCloseTime: formData.get('defaultCloseTime') as string,
            bookingAdvanceMinDays: parseInt(formData.get('bookingAdvanceMinDays') as string),
            bookingAdvanceMaxDays: parseInt(formData.get('bookingAdvanceMaxDays') as string),
            cancellationDeadlineHours: parseInt(formData.get('cancellationDeadlineHours') as string),
            emailNotificationsEnabled: formData.get('emailNotificationsEnabled') === 'on',
            reminderDaysBefore: parseInt(formData.get('reminderDaysBefore') as string),
            facebookUrl: formData.get('facebookUrl') as string,
            instagramUrl: formData.get('instagramUrl') as string,
        };

        try {
            const response = await api.patch<SiteSettings>('/site-settings', data);
            setSettings(response.data);
            setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des paramètres' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!settings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Impossible de charger les paramètres</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Configuration générale' }
                    ]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Configuration du site
                    </h1>
                    <p className="text-gray-600">
                        Gérez les paramètres généraux de votre salon
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations du salon */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Informations du salon
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom du salon *
                                </label>
                                <input
                                    type="text"
                                    id="salonName"
                                    name="salonName"
                                    defaultValue={settings.salonName}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="salonDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="salonDescription"
                                    name="salonDescription"
                                    rows={4}
                                    defaultValue={settings.salonDescription}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="salonAddress" className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse
                                </label>
                                <input
                                    type="text"
                                    id="salonAddress"
                                    name="salonAddress"
                                    defaultValue={settings.salonAddress || ''}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="salonPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        id="salonPhone"
                                        name="salonPhone"
                                        defaultValue={settings.salonPhone || ''}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="salonEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="salonEmail"
                                        name="salonEmail"
                                        defaultValue={settings.salonEmail || ''}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Images */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Images
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL du logo
                                </label>
                                <input
                                    type="url"
                                    id="logoUrl"
                                    name="logoUrl"
                                    defaultValue={settings.logoUrl || ''}
                                    placeholder="https://exemple.com/logo.png"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="heroImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de l'image d'en-tête
                                </label>
                                <input
                                    type="url"
                                    id="heroImageUrl"
                                    name="heroImageUrl"
                                    defaultValue={settings.heroImageUrl || ''}
                                    placeholder="https://exemple.com/hero.jpg"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Horaires */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Horaires par défaut
                        </h2>
                        {/* <div className="grid grid-cols-2 gap-4"> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="defaultOpenTime" className="block text-sm font-medium text-gray-700 mb-2">
                                    Heure d'ouverture *
                                </label>
                                <input
                                    type="time"
                                    id="defaultOpenTime"
                                    name="defaultOpenTime"
                                    defaultValue={settings.defaultOpenTime}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="defaultCloseTime" className="block text-sm font-medium text-gray-700 mb-2">
                                    Heure de fermeture *
                                </label>
                                <input
                                    type="time"
                                    id="defaultCloseTime"
                                    name="defaultCloseTime"
                                    defaultValue={settings.defaultCloseTime}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Paramètres de réservation */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Paramètres de réservation
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bookingAdvanceMinDays" className="block text-sm font-medium text-gray-700 mb-2">
                                        Délai minimum (jours) *
                                    </label>
                                    <input
                                        type="number"
                                        id="bookingAdvanceMinDays"
                                        name="bookingAdvanceMinDays"
                                        min="0"
                                        defaultValue={settings.bookingAdvanceMinDays}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nombre de jours min avant une réservation
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="bookingAdvanceMaxDays" className="block text-sm font-medium text-gray-700 mb-2">
                                        Délai maximum (jours) *
                                    </label>
                                    <input
                                        type="number"
                                        id="bookingAdvanceMaxDays"
                                        name="bookingAdvanceMaxDays"
                                        min="1"
                                        defaultValue={settings.bookingAdvanceMaxDays}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nombre de jours max à l'avance
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cancellationDeadlineHours" className="block text-sm font-medium text-gray-700 mb-2">
                                    Délai d'annulation (heures) *
                                </label>
                                <input
                                    type="number"
                                    id="cancellationDeadlineHours"
                                    name="cancellationDeadlineHours"
                                    min="0"
                                    defaultValue={settings.cancellationDeadlineHours}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Délai minimum pour annuler une réservation
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="emailNotificationsEnabled"
                                    name="emailNotificationsEnabled"
                                    defaultChecked={settings.emailNotificationsEnabled}
                                    className="w-4 h-4 text-amber-800 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <label htmlFor="emailNotificationsEnabled" className="ml-2 text-sm font-medium text-gray-700">
                                    Activer les notifications par email
                                </label>
                            </div>

                            <div>
                                <label htmlFor="reminderDaysBefore" className="block text-sm font-medium text-gray-700 mb-2">
                                    Rappel avant rendez-vous (jours) *
                                </label>
                                <input
                                    type="number"
                                    id="reminderDaysBefore"
                                    name="reminderDaysBefore"
                                    min="0"
                                    defaultValue={settings.reminderDaysBefore}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Nombre de jours avant le RDV pour envoyer un rappel
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Réseaux sociaux */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Réseaux sociaux
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Facebook
                                </label>
                                <input
                                    type="url"
                                    id="facebookUrl"
                                    name="facebookUrl"
                                    defaultValue={settings.facebookUrl || ''}
                                    placeholder="https://facebook.com/votrepage"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Instagram
                                </label>
                                <input
                                    type="url"
                                    id="instagramUrl"
                                    name="instagramUrl"
                                    defaultValue={settings.instagramUrl || ''}
                                    placeholder="https://instagram.com/votrecompte"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Link
                            href="/admin/dashboard"
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-center"
                        >
                            Annuler
                        </Link>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center space-x-2"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
