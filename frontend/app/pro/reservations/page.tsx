'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, Booking, BookingStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Phone, Mail, X, User, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STATUS_CONFIG = {
    [BookingStatus.PENDING]: {
        text: 'En attente',
        color: 'text-yellow-700 bg-yellow-100 border-yellow-300',
        statColor: 'text-yellow-600'
    },
    [BookingStatus.CONFIRMED]: {
        text: 'Confirmée',
        color: 'text-green-700 bg-green-100 border-green-300',
        statColor: 'text-green-600'
    },
    [BookingStatus.COMPLETED]: {
        text: 'Terminée',
        color: 'text-blue-700 bg-blue-100 border-blue-300',
        statColor: 'text-blue-600'
    },
    [BookingStatus.CANCELLED]: {
        text: 'Refusée',
        color: 'text-red-700 bg-red-100 border-red-300',
        statColor: 'text-red-600'
    },
    [BookingStatus.NO_SHOW]: {
        text: 'Absent',
        color: 'text-gray-700 bg-gray-100 border-gray-300',
        statColor: 'text-gray-700'
    }
};

const ITEMS_PER_PAGE = 20;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const isToday = (dateString: string) => {
    return new Date(dateString).toDateString() === new Date().toDateString();
};

const isPastDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
};

const separateBookingsByDate = (bookings: Booking[]) => {
    return bookings.reduce((acc, booking) => {
        if (isPastDate(booking.date)) {
            acc.past.push(booking);
        } else {
            acc.upcoming.push(booking);
        }
        return acc;
    }, { upcoming: [] as Booking[], past: [] as Booking[] });
};

const calculateStats = (bookings: Booking[]) => {
    return {
        total: bookings.length,
        pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
        confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
        completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
        no_show: bookings.filter(b => b.status === BookingStatus.NO_SHOW).length,
        today: bookings.filter(b =>
            isToday(b.date) &&
            (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED)
        ).length,
    };
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useBookings = () => {
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [pastBookings, setPastBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const { user, isAuthenticated, isInitialized } = useAuthStore();

    const fetchBookings = useCallback(async (
        filters: { status?: string; date?: string; name?: string },
        currentCursor?: string | null,
        isLoadMore = false
    ) => {
        if (!isAuthenticated || !user) return;

        try {
            if (!isLoadMore) setLoading(true);
            else setLoadingMore(true);

            const params: Record<string, string> = {
                limit: String(ITEMS_PER_PAGE),
                ...filters
            };
            if (currentCursor) params.cursor = currentCursor;

            const response = await api.get('/bookings', { params });
            const { bookings: newBookings, hasNextPage, nextCursor } = response.data;

            const { upcoming, past } = separateBookingsByDate(newBookings);

            if (isLoadMore) {
                setUpcomingBookings(prev => [...prev, ...upcoming]);
                setPastBookings(prev => [...prev, ...past]);
            } else {
                setUpcomingBookings(upcoming);
                setPastBookings(past);
            }

            setCursor(nextCursor);
            setHasMore(hasNextPage);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des réservations:', error);
            if (error.response?.status === 403) {
                alert('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [isAuthenticated, user]);

    const updateBookingStatus = useCallback(async (bookingId: string, newStatus: BookingStatus) => {
        try {
            await api.patch(`/bookings/${bookingId}`, { status: newStatus });

            const updateInList = (bookings: Booking[]) =>
                bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);

            setUpcomingBookings(updateInList);
            setPastBookings(updateInList);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    }, []);

    return {
        upcomingBookings,
        pastBookings,
        loading,
        loadingMore,
        hasMore,
        cursor,
        fetchBookings,
        updateBookingStatus,
        isReady: isInitialized && isAuthenticated && user?.role === UserRole.PRO || user?.role === UserRole.ADMIN
    };
};

const useInfiniteScroll = (
    callback: () => void,
    dependencies: any[]
) => {
    const observerRef = useRef<IntersectionObserver | null>(null);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                callback();
            }
        });

        if (node) observerRef.current.observe(node);
    }, dependencies);

    return lastElementRef;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard: React.FC<{ label: string; value: number; colorClass?: string }> = ({
    label,
    value,
    colorClass = 'text-gray-900'
}) => (
    <Card>
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    </Card>
);

const FilterButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    colorClass?: string;
}> = ({ active, onClick, children, colorClass = 'bg-amber-800' }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
            ? `${colorClass} text-white`
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
    >
        {children}
    </button>
);

const BookingCard: React.FC<{
    booking: Booking;
    showActions: boolean;
    onStatusChange: (id: string, status: BookingStatus) => void;
}> = ({ booking, showActions, onStatusChange }) => {
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG[BookingStatus.PENDING];

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                {statusConfig.text}
                            </span>
                        </div>

                        <div className="text-base font-semibold text-gray-900 mb-1">
                            {isToday(booking.date)
                                ? `Aujourd'hui à ${booking.startTime}`
                                : formatDate(booking.date)
                            }
                        </div>

                        <div className="text-sm text-gray-700 mb-2">
                            {booking.startTime} - {booking.endTime} • {booking.service?.name}
                        </div>

                        <div className="text-sm text-gray-600">
                            <User className="inline-block mr-1 w-4 h-4" />
                            {booking.user?.firstName} {booking.user?.lastName}
                        </div>

                        {booking.user?.email && (
                            <div className="text-sm text-gray-600">
                                <Mail className="inline-block mr-1 w-4 h-4" /> {booking.user.email}
                            </div>
                        )}

                        {booking.user?.phone && (
                            <div className="text-sm text-gray-600">
                                <Phone className="inline-block mr-1 w-4 h-4" /> {booking.user.phone}
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

                    {showActions && (
                        <div className="flex flex-wrap gap-2">
                            {booking.status === BookingStatus.PENDING && (
                                <>
                                    <button
                                        onClick={() => onStatusChange(booking.id, BookingStatus.CONFIRMED)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {STATUS_CONFIG.CONFIRMED.text}
                                    </button>
                                    <button
                                        onClick={() => onStatusChange(booking.id, BookingStatus.CANCELLED)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {STATUS_CONFIG.CANCELLED.text}
                                    </button>
                                </>
                            )}
                            {booking.status === BookingStatus.CONFIRMED && (
                                <>
                                    <button
                                        onClick={() => onStatusChange(booking.id, BookingStatus.COMPLETED)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {STATUS_CONFIG.COMPLETED.text}
                                    </button>
                                    <button
                                        onClick={() => onStatusChange(booking.id, BookingStatus.NO_SHOW)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {STATUS_CONFIG.NO_SHOW.text}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
        <p className="text-sm text-gray-600 mt-2">Chargement...</p>
    </div>
);

const LoadingSkeleton: React.FC = () => (
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
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [showStats, setShowStats] = useState(false);

    const {
        upcomingBookings,
        pastBookings,
        loading,
        loadingMore,
        hasMore,
        cursor,
        fetchBookings,
        updateBookingStatus,
        isReady
    } = useBookings();

    const allBookings = [...upcomingBookings, ...pastBookings];
    const stats = calculateStats(allBookings);

    // Initial load and filter changes
    useEffect(() => {
        if (!isReady) return;

        const filters: Record<string, string> = {};
        if (filter !== 'ALL') filters.status = filter;
        if (dateFilter) filters.date = dateFilter;
        if (nameFilter) filters.name = nameFilter;

        fetchBookings(filters);
    }, [filter, dateFilter, nameFilter, isReady]);

    // Load more handler
    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore || !cursor) return;

        const filters: Record<string, string> = {};
        if (filter !== 'ALL') filters.status = filter;
        if (dateFilter) filters.date = dateFilter;
        if (nameFilter) filters.name = nameFilter;

        fetchBookings(filters, cursor, true);
    }, [loadingMore, hasMore, cursor, filter, dateFilter, nameFilter, fetchBookings]);

    const lastUpcomingRef = useInfiniteScroll(loadMore, [loadMore]);
    const lastPastRef = useInfiniteScroll(loadMore, [loadMore]);

    const clearFilters = () => {
        setDateFilter('');
        setNameFilter('');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        useAuthStore.getState().loadUser();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Réservations' }
                    ]}
                    className="mb-8"
                />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
                    <p className="text-gray-600">Gérez vos réservations</p>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors sm:hidden"
                    >
                        {showStats ? 'Masquer les statistiques' : 'Afficher les statistiques'}
                    </button>
                </div>

                {/* Stats */}
                <div className={`${showStats ? 'block' : 'hidden'} grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8`}>
                    <StatCard label="Aujourd'hui" value={stats.today} colorClass="text-amber-800" />
                    <StatCard label={STATUS_CONFIG[BookingStatus.PENDING].text} value={stats.pending} colorClass={STATUS_CONFIG[BookingStatus.PENDING].statColor} />
                    <StatCard label={STATUS_CONFIG[BookingStatus.CONFIRMED].text} value={stats.confirmed} colorClass={STATUS_CONFIG[BookingStatus.CONFIRMED].statColor} />
                    <StatCard label={STATUS_CONFIG[BookingStatus.COMPLETED].text} value={stats.completed} colorClass={STATUS_CONFIG[BookingStatus.COMPLETED].statColor} />
                    <StatCard label={STATUS_CONFIG[BookingStatus.NO_SHOW].text} value={stats.no_show} colorClass={STATUS_CONFIG[BookingStatus.NO_SHOW].statColor} />
                    <StatCard label="Total" value={stats.total} />
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
                                    Toutes
                                </FilterButton>
                                <FilterButton active={filter === BookingStatus.PENDING} onClick={() => setFilter(BookingStatus.PENDING)} colorClass="bg-yellow-600">
                                    En attente
                                </FilterButton>
                                <FilterButton active={filter === BookingStatus.CONFIRMED} onClick={() => setFilter(BookingStatus.CONFIRMED)} colorClass="bg-green-600">
                                    Confirmées
                                </FilterButton>
                                <FilterButton active={filter === BookingStatus.COMPLETED} onClick={() => setFilter(BookingStatus.COMPLETED)} colorClass="bg-blue-600">
                                    Terminées
                                </FilterButton>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Name Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher par nom</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nom, prénom..."
                                />
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    title="Effacer les filtres"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Bookings List */}
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="space-y-8">
                        {/* Upcoming Bookings */}
                        {upcomingBookings.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    À venir ({upcomingBookings.length}{hasMore ? '+' : ''})
                                </h2>
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking, index) => (
                                        <div
                                            key={booking.id}
                                            ref={index === upcomingBookings.length - 1 ? lastUpcomingRef : null}
                                        >
                                            <BookingCard
                                                booking={booking}
                                                showActions={true}
                                                onStatusChange={updateBookingStatus}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Bookings */}
                        {pastBookings.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Passé ({pastBookings.length}{hasMore ? '+' : ''})
                                </h2>
                                <div className="space-y-4">
                                    {pastBookings.map((booking, index) => (
                                        <div
                                            key={booking.id}
                                            ref={index === pastBookings.length - 1 ? lastPastRef : null}
                                        >
                                            <BookingCard
                                                booking={booking}
                                                showActions={false}
                                                onStatusChange={updateBookingStatus}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loadingMore && hasMore && <LoadingSpinner />}

                        {/* Empty State */}
                        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
                            <Card>
                                <p className="text-gray-600 text-center py-8">
                                    Aucune réservation trouvée.
                                </p>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}