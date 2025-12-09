'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, User, Service, SiteSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Loading } from '@/components/ui/Loading';
import api from '@/lib/api';
import Link from 'next/link';
import {
    Users,
    Settings,
    Calendar,
    BarChart3,
    Shield,
    Wrench,
    Plus,
    TrendingUp,
    Activity,
    MessageSquare,
    PenLine,
    CircleOff
} from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [_settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, servicesRes, settingsRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/services'),
                    api.get('/site-settings'),
                ]);
                setUsers(usersRes.data);
                setServices(servicesRes.data);
                setSettings(settingsRes.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = {
        totalUsers: users.length,
        proUsers: users.filter(u => u.role === UserRole.PRO).length,
        regularUsers: users.filter(u => u.role === UserRole.USER).length,
        activeServices: services.filter(s => s.isActive).length,
        totalServices: services.length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[{ label: 'Administration' }]}
                        className="mb-8"
                    />
                    <div className="flex justify-center items-center h-64">
                        <Loading />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[{ label: 'Administration' }]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard Administrateur
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gérez les utilisateurs, services et paramètres du site
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Utilisateurs</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Professionnels</div>
                        <div className="text-3xl font-bold text-green-600">{stats.proUsers}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Clients</div>
                        <div className="text-3xl font-bold text-purple-600">{stats.regularUsers}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Services actifs</div>
                        <div className="text-3xl font-bold text-amber-600">{stats.activeServices}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Total services</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.totalServices}</div>
                    </Card>
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Management */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <PenLine className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Gestion
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <Link href="/pro/dashboard" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Calendar className="w-4 h-4" />
                                    Réservations
                                </button>
                            </Link>
                            <Link href="/admin/users" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Users className="w-4 h-4" />
                                    Utilisateurs
                                </button>
                            </Link>
                            <Link href="/pro/reviews" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    Avis clients
                                </button>
                            </Link>
                            {/* <Link href="/services" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Wrench className="w-4 h-4" />
                                    Services
                                </button>
                            </Link> */}
                        </div>
                    </Card>

                    {/* Service Management */}
                    {/* <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Wrench className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Gestion des services
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <Link href="/services" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Eye className="w-4 h-4" />
                                    Voir tous les services
                                </button>
                            </Link>
                        </div>
                    </Card> */}

                    {/* Site Settings */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Settings className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Horraires
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <Link href="/pro/availability" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Calendar className="w-4 h-4" />
                                    Disponibilités
                                </button>
                            </Link>
                            <Link href="/pro/blocked-slots" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Shield className="w-4 h-4" />
                                    Créneaux bloqués
                                </button>
                            </Link>
                            <Link href="/pro/conflicts" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <CircleOff className="w-4 h-4" />
                                    Conflits
                                </button>
                            </Link>
                        </div>
                    </Card>

                    {/* Bookings Overview */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Statistiques et paramètres
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <Link href="/pro/stats" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <BarChart3 className="w-4 h-4" />
                                    Rapports et statistiques
                                </button>
                            </Link>
                            <Link href="/pro/settings" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Configuration générale
                                </button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Shield className="w-6 h-6 text-gray-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Actions système
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <TrendingUp className="w-4 h-4" />
                                Sauvegarder
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <Activity className="w-4 h-4" />
                                Vider le cache
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <BarChart3 className="w-4 h-4" />
                                Logs système
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" />
                                Mise à jour
                            </button>
                        </div>
                    </Card>
                </div>
            </div >
        </div >
    );
}