'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { FormField } from '@/components/ui/FormField';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from 'lucide-react';

interface BlockedSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
    createdAt: string;
    updatedAt: string;
}

export default function BlockedSlotsPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <BlockedSlotsContent />
        </ProtectedRoute>
    );
}

function BlockedSlotsContent() {
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState<BlockedSlot | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBlockedSlots();
    }, []);

    const fetchBlockedSlots = async () => {
        try {
            const response = await api.get('/blocked-slots');
            setBlockedSlots(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des créneaux bloqués:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setSaving(true);

        try {
            const data = {
                date: formData.get('date') as string,
                startTime: formData.get('startTime') as string,
                endTime: formData.get('endTime') as string,
                reason: formData.get('reason') as string,
            };

            if (editingSlot) {
                await api.patch(`/blocked-slots/${editingSlot.id}`, data);
            } else {
                await api.post('/blocked-slots', data);
            }

            await fetchBlockedSlots();
            setShowForm(false);
            setEditingSlot(null);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            alert('Erreur lors de l\'enregistrement du créneau bloqué');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (slot: BlockedSlot) => {
        setEditingSlot(slot);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau bloqué ?')) {
            return;
        }

        try {
            await api.delete(`/blocked-slots/${id}`);
            await fetchBlockedSlots();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression du créneau bloqué');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingSlot(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Grouper les créneaux par date
    const groupedSlots = blockedSlots.reduce((acc, slot) => {
        const date = slot.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(slot);
        return acc;
    }, {} as Record<string, BlockedSlot[]>);

    // Trier les dates
    const sortedDates = Object.keys(groupedSlots).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
    );

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Créneaux bloqués' }
                    ]}
                    className="mb-8"
                />

                <div className="mb-8">
                    {/* <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center space-x-2 text-amber-800 hover:text-amber-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </Link> */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Créneaux bloqués
                            </h1>
                            <p className="text-gray-600">
                                Gérez vos absences et congés
                            </p>
                        </div>
                        {!showForm && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Ajouter un blocage</span>
                            </Button>
                        )}
                    </div>
                </div>

                {showForm && (
                    <Card className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingSlot ? 'Modifier le créneau bloqué' : 'Nouveau créneau bloqué'}
                        </h2>
                        <form action={handleSubmit} className="space-y-6">
                            <FormField
                                label="Date"
                                name="date"
                                type="date"
                                defaultValue={editingSlot?.date.split('T')[0] || ''}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Heure de début"
                                    name="startTime"
                                    type="time"
                                    defaultValue={editingSlot?.startTime || ''}
                                    required
                                />

                                <FormField
                                    label="Heure de fin"
                                    name="endTime"
                                    type="time"
                                    defaultValue={editingSlot?.endTime || ''}
                                    required
                                />
                            </div>

                            <FormField
                                label="Raison (optionnel)"
                                name="reason"
                                type="textarea"
                                rows={3}
                                defaultValue={editingSlot?.reason || ''}
                                placeholder="Ex: Congés, rendez-vous médical..."
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                                >
                                    Annuler
                                </Button>
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
                )}

                {blockedSlots.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                                Aucun créneau bloqué pour le moment
                            </p>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="flex items-center space-x-2 mx-auto"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Ajouter un blocage</span>
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {sortedDates.map((date) => (
                            <Card key={date}>
                                <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                                    <Calendar className="w-5 h-5 text-amber-800" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {formatDate(date)}
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {groupedSlots[date].map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        {slot.startTime} - {slot.endTime}
                                                    </span>
                                                </div>
                                                {slot.reason && (
                                                    <p className="text-sm text-gray-600">
                                                        {slot.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(slot)}
                                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(slot.id)}
                                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
