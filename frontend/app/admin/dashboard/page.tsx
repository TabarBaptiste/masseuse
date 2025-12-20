'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, User, Service, SiteSettings } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { AdminDashboardLoading } from '@/components/ui/AdminDashboardLoading';
import api from '@/lib/api';
import Link from 'next/link';
import {
    Users,
    Settings,
    Calendar,
    BarChart3,
    Shield,
    Plus,
    TrendingUp,
    Activity,
    MessageSquare,
    PenLine,
    CircleOff,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Loader2
} from 'lucide-react';

// Types pour Stripe Connect
interface StripeConnectStatus {
    status: 'configured' | 'pending' | 'not_created';
    accountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    detailsSubmitted?: boolean;
}

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
    
    // Stripe Connect state
    const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
    const [stripeLoading, setStripeLoading] = useState(false);
    const [stripeError, setStripeError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fonction pour récupérer le statut Stripe
    const fetchStripeStatus = async () => {
        try {
            const response = await api.get('/stripe/connect/status');
            setStripeStatus(response.data);
            setStripeError(null);
        } catch (error) {
            console.error('Erreur lors de la récupération du statut Stripe:', error);
            setStripeError('Impossible de récupérer le statut Stripe');
        }
    };

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
                
                // Récupérer aussi le statut Stripe
                await fetchStripeStatus();
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fonction pour lancer l'onboarding Stripe
    const handleStripeOnboarding = async () => {
        setStripeLoading(true);
        setStripeError(null);
        
        try {
            const response = await api.post('/stripe/connect/onboarding-link');
            // Rediriger vers Stripe
            window.location.href = response.data.url;
        } catch (error: any) {
            console.error('Erreur lors de la création du lien d\'onboarding:', error);
            setStripeError(error.response?.data?.message || 'Erreur lors de la configuration Stripe');
            setStripeLoading(false);
        }
    };

    const stats = {
        // totalUsers: users.length,
        adminUsers: users.filter(u => u.role === UserRole.ADMIN).length,
        proUsers: users.filter(u => u.role === UserRole.PRO).length,
        regularUsers: users.filter(u => u.role === UserRole.USER).length,
        activeServices: services.filter(s => s.isActive).length,
        totalServices: services.length,
    };

    if (loading) {
        return <AdminDashboardLoading />;
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Clients</div>
                        <div className="text-3xl font-bold text-purple-600">{stats.regularUsers}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Admin</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.adminUsers}</div>
                    </Card>
                    {/* <Card>
                        <div className="text-sm text-gray-600 mb-1">Professionnels</div>
                        <div className="text-3xl font-bold text-green-600">{stats.proUsers}</div>
                    </Card> */}
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Services actifs</div>
                        <div className="text-3xl font-bold text-amber-600">{stats.activeServices}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Total services</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.totalServices}</div>
                    </Card>
                </div>

                {/* Stripe Connect Section */}
                <div className="mb-8">
                    <Card className="border-2 border-indigo-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <CreditCard className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Configuration Stripe Connect
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Configurez votre compte Stripe pour recevoir les paiements
                                </p>
                            </div>
                        </div>

                        {stripeError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm">{stripeError}</span>
                            </div>
                        )}

                        {/* Statut du compte */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {stripeStatus?.status === 'configured' ? (
                                        <>
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                            <div>
                                                <p className="font-medium text-green-700">Compte configuré</p>
                                                <p className="text-sm text-gray-500">
                                                    Votre compte Stripe est prêt à recevoir des paiements
                                                </p>
                                            </div>
                                        </>
                                    ) : stripeStatus?.status === 'pending' ? (
                                        <>
                                            <AlertCircle className="w-6 h-6 text-amber-500" />
                                            <div>
                                                <p className="font-medium text-amber-700">Configuration en cours</p>
                                                <p className="text-sm text-gray-500">
                                                    Complétez votre profil Stripe pour activer les paiements
                                                </p>
                                                {stripeStatus.accountId && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        ID: {stripeStatus.accountId}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-6 h-6 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-700">Compte non configuré</p>
                                                <p className="text-sm text-gray-500">
                                                    Configurez votre compte Stripe pour accepter les paiements
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Indicateurs de statut */}
                                {stripeStatus?.status === 'pending' && (
                                    <div className="text-right text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={stripeStatus.chargesEnabled ? 'text-green-600' : 'text-gray-400'}>
                                                {stripeStatus.chargesEnabled ? '✓' : '○'} Paiements
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={stripeStatus.payoutsEnabled ? 'text-green-600' : 'text-gray-400'}>
                                                {stripeStatus.payoutsEnabled ? '✓' : '○'} Virements
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={stripeStatus.detailsSubmitted ? 'text-green-600' : 'text-gray-400'}>
                                                {stripeStatus.detailsSubmitted ? '✓' : '○'} Infos complètes
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex flex-wrap gap-3">
                            {stripeStatus?.status !== 'configured' && (
                                <button
                                    onClick={handleStripeOnboarding}
                                    disabled={stripeLoading}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                                >
                                    {stripeLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirection...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="w-5 h-5" />
                                            {stripeStatus?.status === 'pending' 
                                                ? 'Continuer la configuration' 
                                                : 'Configurer Stripe Connect'}
                                        </>
                                    )}
                                </button>
                            )}

                            {stripeStatus?.status === 'configured' && (
                                <a
                                    href="https://dashboard.stripe.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Accéder au dashboard Stripe
                                </a>
                            )}

                            <button
                                onClick={fetchStripeStatus}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                <Activity className="w-4 h-4" />
                                Actualiser le statut
                            </button>
                        </div>
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
                            <h3 className="text-xl font-semibold text-gray-900">
                                Gestion
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <Link href="/pro/reservations" className="block">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <Calendar className="w-4 h-4" />
                                    Réservations
                                </button>
                            </Link>
                            <Link href="/pro/users" className="block">
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
                        </div>
                    </Card>

                    {/* Site Settings */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Settings className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Horaires
                            </h3>
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
                            <h3 className="text-xl font-semibold text-gray-900">
                                Statistiques et paramètres
                            </h3>
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
                            <h3 className="text-xl font-semibold text-gray-900">
                                Actions système
                            </h3>
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