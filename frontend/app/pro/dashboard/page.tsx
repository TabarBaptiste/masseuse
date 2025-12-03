'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, Booking, BookingStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
// import { ClientPageRoot } from 'next/dist/client/components/client-page';

export default function ProDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [nameFilter, setNameFilter] = useState<string>('');
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const params: Record<string, string> = {};
                if (filter !== 'ALL') params.status = filter;
                if (dateFilter) params.date = dateFilter;
                if (nameFilter) params.name = nameFilter;
                const response = await api.get('/bookings', { params });
                setBookings(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des réservations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [filter, dateFilter, nameFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case BookingStatus.PENDING:
                return 'text-yellow-700 bg-yellow-100 border-yellow-300';
            case BookingStatus.CONFIRMED:
                return 'text-green-700 bg-green-100 border-green-300';
            case BookingStatus.COMPLETED:
                return 'text-blue-700 bg-blue-100 border-blue-300';
            case BookingStatus.CANCELLED:
                return 'text-red-700 bg-red-100 border-red-300';
            case BookingStatus.NO_SHOW:
                return 'text-gray-700 bg-gray-100 border-gray-300';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case BookingStatus.PENDING:
                return 'En attente';
            case BookingStatus.CONFIRMED:
                return 'Confirmée';
            case BookingStatus.COMPLETED:
                return 'Terminée';
            case BookingStatus.CANCELLED:
                return 'Annulée';
            case BookingStatus.NO_SHOW:
                return 'Absent';
            default:
                return status;
        }
    };

    const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
        try {
            await api.patch(`/bookings/${bookingId}`, { status: newStatus });
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date).toDateString();
        const today = new Date().toDateString();
        return bookingDate === today && (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED);
    });

    // const upcomingBookings = bookings.filter(b => {
    //     const bookingDate = new Date(b.date);
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     return bookingDate > today && (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED);
    // });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
        confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
        completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
        today: todayBookings.length,
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard Professionnel
                    </h1>
                    <p className="text-gray-600">
                        Gérez vos réservations et votre planning
                    </p>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors sm:hidden"
                    >
                        {showStats ? 'Masquer les statistiques' : 'Afficher les statistiques'}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className={`${showStats ? 'block' : 'hidden'} grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8`}>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Aujourd'hui</div>
                        <div className="text-3xl font-bold text-amber-800">{stats.today}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">En attente</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Confirmées</div>
                        <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Terminé</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Total</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </Card>
                </div>

                {/* Today's Bookings */}
                {todayBookings.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Réservations d'aujourd'hui
                        </h2>
                        <div className="space-y-4">
                            {todayBookings.map((booking) => (
                                <Card key={booking.id}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {booking.startTime}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                    {getStatusText(booking.status)}
                                                </span>
                                            </div>
                                            <div className="text-base font-medium text-gray-900 mb-1">
                                                {booking.service?.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {booking.user?.firstName} {booking.user?.lastName}
                                            </div>
                                            {booking.user?.phone && (
                                                <div className="text-sm text-gray-600">
                                                    📞 {booking.user.phone}
                                                </div>
                                            )}
                                            {booking.notes && (
                                                <div className="text-sm text-gray-600 mt-2 italic">
                                                    Note: {booking.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.status === BookingStatus.PENDING && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id, BookingStatus.CONFIRMED)}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Confirmer
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id, BookingStatus.CANCELLED)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === BookingStatus.CONFIRMED && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id, BookingStatus.COMPLETED)}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Terminé
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id, BookingStatus.NO_SHOW)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Absent
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Bookings */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Toutes les réservations
                        </h2>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilter('ALL')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL'
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Toutes
                                </button>
                                <button
                                    onClick={() => setFilter(BookingStatus.PENDING)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === BookingStatus.PENDING
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    En attente
                                </button>
                                <button
                                    onClick={() => setFilter(BookingStatus.CONFIRMED)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === BookingStatus.CONFIRMED
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Confirmées
                                </button>
                                <button
                                    onClick={() => setFilter(BookingStatus.COMPLETED)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === BookingStatus.COMPLETED
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    Terminées
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Rechercher par nom/prénom"
                                />
                                <button
                                    onClick={() => { setDateFilter(''); setNameFilter(''); }}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Effacer filtres
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border rounded-lg p-6 bg-white animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        <Card>
                            <p className="text-gray-600 text-center py-8">
                                Aucune réservation trouvée.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <Card key={booking.id}>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                        {getStatusText(booking.status)}
                                                    </span>
                                                </div>
                                                <div className="text-base font-semibold text-gray-900 mb-1">
                                                    {formatDate(booking.date)}
                                                </div>
                                                <div className="text-sm text-gray-700 mb-2">
                                                    {booking.startTime} - {booking.endTime} • {booking.service?.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Client:</strong> {booking.user?.firstName} {booking.user?.lastName}
                                                </div>
                                                {booking.user?.email && (
                                                    <div className="text-sm text-gray-600">
                                                        📧 {booking.user.email}
                                                    </div>
                                                )}
                                                {booking.user?.phone && (
                                                    <div className="text-sm text-gray-600">
                                                        📞 {booking.user.phone}
                                                    </div>
                                                )}
                                                <div className="text-sm text-gray-600 mt-2">
                                                    <strong>Prix:</strong> {booking.priceAtBooking}€
                                                </div>
                                                {booking.notes && (
                                                    <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                                                        <strong>Note du client:</strong> {booking.notes}
                                                    </div>
                                                )}
                                                {booking.proNotes && (
                                                    <div className="text-sm text-gray-600 mt-2 p-2 bg-amber-50 rounded">
                                                        <strong>Note privée:</strong> {booking.proNotes}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {booking.status === BookingStatus.PENDING && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, BookingStatus.CONFIRMED)}
                                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Confirmer
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, BookingStatus.CANCELLED)}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === BookingStatus.CONFIRMED && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, BookingStatus.COMPLETED)}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Terminé
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, BookingStatus.NO_SHOW)}
                                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Absent
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
