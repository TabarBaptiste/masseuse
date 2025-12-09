/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, WeeklyAvailability, DayOfWeek } from '@/types';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import api from '@/lib/api';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function AvailabilityPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <AvailabilityContent />
        </ProtectedRoute>
    );
}

const dayLabels: Record<DayOfWeek, string> = {
    MONDAY: 'Lundi',
    TUESDAY: 'Mardi',
    WEDNESDAY: 'Mercredi',
    THURSDAY: 'Jeudi',
    FRIDAY: 'Vendredi',
    SATURDAY: 'Samedi',
    SUNDAY: 'Dimanche',
};

const daysOrder: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
];

interface AvailabilityForm {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

function AvailabilityContent() {
    const [availabilities, setAvailabilities] = useState<WeeklyAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState<AvailabilityForm>({
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAvailabilities();
    }, []);

    const fetchAvailabilities = async () => {
        try {
            const response = await api.get<WeeklyAvailability[]>('/availability?includeInactive=true');
            setAvailabilities(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des disponibilités' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validation
        if (formData.startTime >= formData.endTime) {
            setMessage({ type: 'error', text: 'L\'heure de fin doit être après l\'heure de début' });
            return;
        }

        try {
            if (editingId) {
                // Update
                await api.patch(`/availability/${editingId}`, formData);
                setMessage({ type: 'success', text: 'Disponibilité modifiée avec succès !' });
            } else {
                // Create
                await api.post('/availability', formData);
                setMessage({ type: 'success', text: 'Disponibilité ajoutée avec succès !' });
            }
            
            await fetchAvailabilities();
            resetForm();
            window.scrollTo(0, 0);
        } catch (error: any) {
            console.error('Erreur lors de la sauvegarde:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleEdit = (availability: WeeklyAvailability) => {
        setFormData({
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime,
            endTime: availability.endTime,
            isActive: availability.isActive,
        });
        setEditingId(availability.id);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
            return;
        }

        try {
            await api.delete(`/availability/${id}`);
            setMessage({ type: 'success', text: 'Disponibilité supprimée avec succès !' });
            await fetchAvailabilities();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        }
    };

    const resetForm = () => {
        setFormData({
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: '09:00',
            endTime: '18:00',
            isActive: true,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const groupedAvailabilities = daysOrder.reduce((acc, day) => {
        acc[day] = availabilities.filter(a => a.dayOfWeek === day);
        return acc;
    }, {} as Record<DayOfWeek, WeeklyAvailability[]>);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Disponibilités' }
                    ]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center space-x-2 text-amber-800 hover:text-amber-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Gestion des disponibilités
                    </h1>
                    <p className="text-gray-600">
                        Définissez vos horaires de travail pour chaque jour de la semaine
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Add/Edit Form */}
                {showForm && (
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? 'Modifier la disponibilité' : 'Ajouter une disponibilité'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jour de la semaine *
                                </label>
                                <select
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    required
                                >
                                    {daysOrder.map(day => (
                                        <option key={day} value={day}>
                                            {dayLabels[day]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Heure de début *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Heure de fin *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-amber-800 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                    Disponibilité active
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{editingId ? 'Modifier' : 'Ajouter'}</span>
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Add Button */}
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full mb-6 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Ajouter une disponibilité</span>
                    </button>
                )}

                {/* Availabilities by Day */}
                <div className="space-y-6">
                    {daysOrder.map(day => {
                        const dayAvailabilities = groupedAvailabilities[day];
                        const hasAvailabilities = dayAvailabilities.length > 0;

                        return (
                            <Card key={day}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {dayLabels[day]}
                                </h3>
                                
                                {!hasAvailabilities ? (
                                    <p className="text-gray-500 text-sm">
                                        Aucune disponibilité définie pour ce jour
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {dayAvailabilities.map(availability => (
                                            <div
                                                key={availability.id}
                                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                                    availability.isActive 
                                                        ? 'bg-green-50 border-green-200' 
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">
                                                            {availability.startTime} - {availability.endTime}
                                                        </span>
                                                        {!availability.isActive && (
                                                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(availability)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(availability.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
