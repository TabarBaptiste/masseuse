'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, User, Service, SiteSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const [_users, setUsers] = useState<User[]>([]);
    const [_services, setServices] = useState<Service[]>([]);
    const [_settings, setSettings] = useState<SiteSettings | null>(null);
    const [_loading, setLoading] = useState(true);

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
        totalUsers: _users.length,
        proUsers: _users.filter(u => u.role === UserRole.PRO).length,
        regularUsers: _users.filter(u => u.role === UserRole.USER).length,
        activeServices: _services.filter(s => s.isActive).length,
        totalServices: _services.length,
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[{ label: 'Administration' }]}
                    className="mb-8"
                />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard Administrateur
                    </h1>
                    <p className="text-gray-600">
                        Gérez les utilisateurs, services et paramètres du site
                    </p>
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
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Gestion des utilisateurs
                        </h2>
                        <div className="space-y-3">
                            <Link href="/admin/users" className="block">
                                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Voir tous les utilisateurs
                                </button>
                            </Link>
                            {/* <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Ajouter un professionnel
                            </button>
                            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Gérer les rôles
                            </button> */}
                        </div>
                    </Card>

                    {/* Service Management */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Gestion des services
                        </h2>
                        <div className="space-y-3">
                            <Link href="/services" className="block">
                                <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Voir tous les services
                                </button>
                            </Link>
                            {/* <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Ajouter un service
                            </button>
                            <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Modifier les prix
                            </button> */}
                        </div>
                    </Card>

                    {/* Site Settings */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Paramètres du site
                        </h2>
                        <div className="space-y-3">
                            <Link href="/pro/settings" className="block">
                                <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Configuration générale
                                </button>
                            </Link>
                            <Link href="/pro/availability" className="block">
                                <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Disponibilités
                                </button>
                            </Link>
                        </div>
                    </Card>

                    {/* Bookings Overview */}
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Aperçu des réservations
                        </h2>
                        <div className="space-y-3">
                            <Link href="/pro/dashboard" className="block">
                                <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Voir toutes les réservations
                                </button>
                            </Link>
                            <Link href="/pro/stats" className="block">
                                <button className="w-full px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Rapports et statistiques
                                </button>
                            </Link>
                            <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Gérer les conflits
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity or Quick Actions */}
                {/* <div className="mt-8">
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Actions rapides
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Sauvegarder la base de données
                            </button>
                            <button className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Vider le cache
                            </button>
                            <button className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Logs système
                            </button>
                            <button className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Mise à jour système
                            </button>
                        </div>
                    </Card>
                </div> */}
            </div >
        </div >
    );
}