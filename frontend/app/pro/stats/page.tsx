'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, Booking, BookingStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import api from '@/lib/api';
import { ArrowLeft, Calendar, Clock, TrendingUp, Euro, Award } from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.PRO, UserRole.ADMIN]}>
            <StatsContent />
        </ProtectedRoute>
    );
}

interface Stats {
    totalBookings: number;
    todayBookings: number;
    monthlyBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageBookingValue: number;
    topTimeSlots: { time: string; count: number }[];
    topMonths: { month: string; count: number }[];
    topServices: { name: string; count: number }[];
    recentBookings: Booking[];
}

const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function StatsContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'year'>('all');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBookings();
    }, []);

    useEffect(() => {
        if (bookings.length > 0) {
            calculateStats();
        }
    }, [bookings, selectedPeriod]);

    const fetchBookings = async () => {
        try {
            const response = await api.get<Booking[]>('/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des réservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let filteredBookings = bookings;

        if (selectedPeriod === 'month') {
            filteredBookings = bookings.filter(b => {
                const bookingDate = new Date(b.date);
                return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
            });
        } else if (selectedPeriod === 'year') {
            filteredBookings = bookings.filter(b => {
                const bookingDate = new Date(b.date);
                return bookingDate.getFullYear() === currentYear;
            });
        }

        // Compteurs de base
        const totalBookings = filteredBookings.length;
        const todayBookings = filteredBookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.getTime() === today.getTime();
        }).length;

        const monthlyBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        }).length;

        const confirmedBookings = filteredBookings.filter(b => b.status === BookingStatus.CONFIRMED).length;
        const cancelledBookings = filteredBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
        const completedBookings = filteredBookings.filter(b => b.status === BookingStatus.COMPLETED).length;

        // Revenus
        const totalRevenue = filteredBookings
            .filter(b => b.status === BookingStatus.COMPLETED)
            .reduce((sum, b) => sum + Number(b.priceAtBooking), 0);

        const monthlyRevenue = bookings
            .filter(b => {
                const bookingDate = new Date(b.date);
                return bookingDate.getMonth() === currentMonth && 
                       bookingDate.getFullYear() === currentYear &&
                       b.status === BookingStatus.COMPLETED;
            })
            .reduce((sum, b) => sum + Number(b.priceAtBooking), 0);

        const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

        // Créneaux horaires les plus populaires
        const timeSlots: { [key: string]: number } = {};
        filteredBookings.forEach(b => {
            const hour = b.startTime.split(':')[0];
            const slot = `${hour}h`;
            timeSlots[slot] = (timeSlots[slot] || 0) + 1;
        });

        const topTimeSlots = Object.entries(timeSlots)
            .map(([time, count]) => ({ time, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Mois les plus populaires (sur toutes les données)
        const months: { [key: string]: number } = {};
        bookings.forEach(b => {
            const bookingDate = new Date(b.date);
            const monthKey = `${monthNames[bookingDate.getMonth()]} ${bookingDate.getFullYear()}`;
            months[monthKey] = (months[monthKey] || 0) + 1;
        });

        const topMonths = Object.entries(months)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        // Services les plus demandés
        const services: { [key: string]: number } = {};
        filteredBookings.forEach(b => {
            if (b.service) {
                services[b.service.name] = (services[b.service.name] || 0) + 1;
            }
        });

        const topServices = Object.entries(services)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Réservations récentes
        const recentBookings = [...filteredBookings]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        setStats({
            totalBookings,
            todayBookings,
            monthlyBookings,
            confirmedBookings,
            cancelledBookings,
            completedBookings,
            totalRevenue,
            monthlyRevenue,
            averageBookingValue,
            topTimeSlots,
            topMonths,
            topServices,
            recentBookings,
        });
    };

    if (loading) {
        return <Loading />;
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center space-x-2 text-amber-800 hover:text-amber-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Statistiques
                            </h1>
                            <p className="text-gray-600">
                                Analyse des réservations et performances
                            </p>
                        </div>
                        
                        {/* Period selector */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedPeriod('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedPeriod === 'all'
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                Tout
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('year')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedPeriod === 'year'
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                Année
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('month')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedPeriod === 'month'
                                        ? 'bg-amber-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                Mois
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Total réservations</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Aujourd'hui</p>
                                <p className="text-2xl font-bold text-green-600">{stats.todayBookings}</p>
                            </div>
                            <Clock className="w-8 h-8 text-green-600" />
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Ce mois</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.monthlyBookings}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Complétées</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.completedBookings}</p>
                            </div>
                            <Award className="w-8 h-8 text-amber-600" />
                        </div>
                    </Card>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Revenu total</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats.totalRevenue.toFixed(2)} €
                                </p>
                            </div>
                            <Euro className="w-10 h-10 text-green-600" />
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Revenu mensuel</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {stats.monthlyRevenue.toFixed(2)} €
                                </p>
                            </div>
                            <Euro className="w-10 h-10 text-blue-600" />
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Valeur moyenne</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {stats.averageBookingValue.toFixed(2)} €
                                </p>
                            </div>
                            <Euro className="w-10 h-10 text-purple-600" />
                        </div>
                    </Card>
                </div>

                {/* Status Breakdown */}
                <Card className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Répartition par statut
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {stats.confirmedBookings}
                            </div>
                            <div className="text-sm text-gray-600">Confirmées</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {stats.completedBookings}
                            </div>
                            <div className="text-sm text-gray-600">Complétées</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 mb-1">
                                {stats.cancelledBookings}
                            </div>
                            <div className="text-sm text-gray-600">Annulées</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {((stats.cancelledBookings / stats.totalBookings) * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600 mb-1">
                                {stats.totalBookings - stats.confirmedBookings - stats.completedBookings - stats.cancelledBookings}
                            </div>
                            <div className="text-sm text-gray-600">En attente</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {(((stats.totalBookings - stats.confirmedBookings - stats.completedBookings - stats.cancelledBookings) / stats.totalBookings) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Time Slots */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Créneaux horaires populaires
                        </h2>
                        {stats.topTimeSlots.length > 0 ? (
                            <div className="space-y-3">
                                {stats.topTimeSlots.map((slot, index) => (
                                    <div key={slot.time} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-900">{slot.time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-600"
                                                    style={{
                                                        width: `${(slot.count / stats.topTimeSlots[0].count) * 100}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                                                {slot.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
                        )}
                    </Card>

                    {/* Top Services */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Services les plus demandés
                        </h2>
                        {stats.topServices.length > 0 ? (
                            <div className="space-y-3">
                                {stats.topServices.map((service, index) => (
                                    <div key={service.name} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600"
                                                    style={{
                                                        width: `${(service.count / stats.topServices[0].count) * 100}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                                                {service.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
                        )}
                    </Card>
                </div>

                {/* Top Months */}
                <Card className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Périodes les plus actives
                    </h2>
                    {stats.topMonths.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.topMonths.map((month, index) => (
                                <div key={month.month} className="bg-linear-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-purple-700">#{index + 1}</span>
                                        <span className="text-2xl font-bold text-purple-900">{month.count}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">{month.month}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
                    )}
                </Card>

                {/* Recent Bookings */}
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Réservations récentes
                    </h2>
                    {stats.recentBookings.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentBookings.map(booking => (
                                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">
                                            {booking.user?.firstName} {booking.user?.lastName}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {booking.service?.name} • {new Date(booking.date).toLocaleDateString('fr-FR')} à {booking.startTime}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            booking.status === BookingStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                                            booking.status === BookingStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                            booking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Aucune réservation récente</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
