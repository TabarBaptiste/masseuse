'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, Conflict } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Loading } from '@/components/ui/Loading';
import api from '@/lib/api';
import Link from 'next/link';
import {
    AlertTriangle, 
    AlertCircle, 
    Info,
    Calendar,
    Clock,
    User,
    Ban,
    RefreshCw
} from 'lucide-react';

interface ConflictsSummary {
    total: number;
    byType: {
        OVERLAPPING_BOOKINGS: number;
        BOOKING_BLOCKED_SLOT: number;
        BOOKING_NO_AVAILABILITY: number;
    };
    bySeverity: {
        HIGH: number;
        MEDIUM: number;
        LOW: number;
    };
}

export default function ConflictsPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <ConflictsContent />
        </ProtectedRoute>
    );
}

function ConflictsContent() {
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [summary, setSummary] = useState<ConflictsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchConflicts();
    }, []);

    const fetchConflicts = async () => {
        try {
            const [conflictsRes, summaryRes] = await Promise.all([
                api.get('/conflicts'),
                api.get('/conflicts/summary'),
            ]);
            setConflicts(conflictsRes.data.conflicts);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement des conflits:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchConflicts();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'HIGH':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'MEDIUM':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'LOW':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <Info className="w-5 h-5 text-gray-600" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'HIGH':
                return 'bg-red-100 border-red-300 text-red-900';
            case 'MEDIUM':
                return 'bg-orange-100 border-orange-300 text-orange-900';
            case 'LOW':
                return 'bg-blue-100 border-blue-300 text-blue-900';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-900';
        }
    };

    const getSeverityLabel = (severity: string) => {
        switch (severity) {
            case 'HIGH':
                return 'Critique';
            case 'MEDIUM':
                return 'Moyenne';
            case 'LOW':
                return 'Faible';
            default:
                return severity;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'OVERLAPPING_BOOKINGS':
                return 'Réservations qui se chevauchent';
            case 'BOOKING_BLOCKED_SLOT':
                return 'Réservation pendant un blocage';
            case 'BOOKING_NO_AVAILABILITY':
                return 'Réservation hors disponibilité';
            case 'DOUBLE_BOOKING':
                return 'Double réservation';
            default:
                return type;
        }
    };

    const getResolutionSuggestion = (conflict: Conflict) => {
        switch (conflict.type) {
            case 'OVERLAPPING_BOOKINGS':
                return 'Annulez ou déplacez l\'une des réservations pour résoudre le conflit.';
            case 'BOOKING_BLOCKED_SLOT':
                return 'Supprimez le créneau bloqué ou annulez/déplacez la réservation.';
            case 'BOOKING_NO_AVAILABILITY':
                return 'Ajoutez une disponibilité pour ce jour/horaire ou annulez/déplacez la réservation.';
            default:
                return 'Contactez le client pour trouver une solution.';
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Gestion conflits' }
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
                                Gestion des conflits
                            </h1>
                            <p className="text-gray-600">
                                Détection et résolution des conflits de planning
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center space-x-2 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <div className="text-sm text-gray-600 mb-1">Total des conflits</div>
                            <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
                        </Card>
                        <Card className="border-l-4 border-red-500">
                            <div className="text-sm text-gray-600 mb-1">Critiques</div>
                            <div className="text-3xl font-bold text-red-600">{summary.bySeverity.HIGH}</div>
                        </Card>
                        <Card className="border-l-4 border-orange-500">
                            <div className="text-sm text-gray-600 mb-1">Moyens</div>
                            <div className="text-3xl font-bold text-orange-600">{summary.bySeverity.MEDIUM}</div>
                        </Card>
                        <Card className="border-l-4 border-blue-500">
                            <div className="text-sm text-gray-600 mb-1">Faibles</div>
                            <div className="text-3xl font-bold text-blue-600">{summary.bySeverity.LOW}</div>
                        </Card>
                    </div>
                )}

                {/* Conflicts List */}
                {conflicts.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <AlertCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Aucun conflit détecté
                            </h3>
                            <p className="text-gray-600">
                                Votre planning est bien organisé !
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {conflicts.map((conflict) => (
                            <Card key={conflict.id} className={`border-2 ${getSeverityColor(conflict.severity)}`}>
                                <div className="flex items-start space-x-4">
                                    <div className="shrink-0 mt-1">
                                        {getSeverityIcon(conflict.severity)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
                                                    {getSeverityLabel(conflict.severity)}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {getTypeLabel(conflict.type)}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold mb-2">
                                            {conflict.description}
                                        </h3>

                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-700 mb-4">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4 shrink-0" />
                                                <span>{formatDate(conflict.date)}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-4 h-4 shrink-0" />
                                                <span>{conflict.startTime} - {conflict.endTime}</span>
                                            </div>
                                        </div>

                                        {/* Affected Bookings */}
                                        {conflict.affectedBookings && conflict.affectedBookings.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="font-medium text-sm mb-2">Réservations concernées :</h4>
                                                <div className="space-y-2">
                                                    {conflict.affectedBookings.map((booking) => (
                                                        <div
                                                            key={booking.id}
                                                            className="bg-white rounded-lg p-3 border border-gray-200"
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                                    <User className="w-4 h-4 text-gray-500 shrink-0" />
                                                                    <span className="font-medium truncate">
                                                                        {booking.user?.firstName} {booking.user?.lastName}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 sm:text-right">
                                                                    {booking.service?.name}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {booking.startTime} - {booking.endTime} • Statut: {booking.status}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Blocked Slot */}
                                        {conflict.blockedSlot && (
                                            <div className="mb-4">
                                                <h4 className="font-medium text-sm mb-2">Créneau bloqué :</h4>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center space-x-2">
                                                        <Ban className="w-4 h-4 text-red-500" />
                                                        <span>{conflict.blockedSlot.startTime} - {conflict.blockedSlot.endTime}</span>
                                                    </div>
                                                    {conflict.blockedSlot.reason && (
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            Raison: {conflict.blockedSlot.reason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Resolution Suggestion */}
                                        <div className="bg-white rounded-lg p-3 border-l-4 border-amber-500">
                                            <h4 className="font-medium text-sm mb-1 text-amber-900">
                                                💡 Suggestion de résolution
                                            </h4>
                                            <p className="text-sm text-gray-700">
                                                {getResolutionSuggestion(conflict)}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                            <Link href="/pro/reservations" className="flex-1">
                                                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                                    Voir les réservations
                                                </button>
                                            </Link>
                                            <Link href="/pro/availability" className="flex-1">
                                                <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                                                    Gérer les disponibilités
                                                </button>
                                            </Link>
                                            <Link href="/pro/blocked-slots" className="flex-1">
                                                <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                                    Gérer les blocages
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <Info className="w-6 h-6 text-blue-600 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                À propos de la détection des conflits
                            </h3>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p>
                                    <strong>Réservations qui se chevauchent :</strong> Deux réservations ou plus sont prévues en même temps.
                                </p>
                                <p>
                                    <strong>Réservation pendant un blocage :</strong> Une réservation existe pendant un créneau marqué comme bloqué (congés, absence...).
                                </p>
                                <p>
                                    <strong>Réservation hors disponibilité :</strong> Une réservation a été faite en dehors des horaires d'ouverture configurés.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
