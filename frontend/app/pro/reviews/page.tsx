'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, Review, Service } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Loading } from '@/components/ui/Loading';
import api from '@/lib/api';
import { MessageSquare, Star, User, Calendar, Eye, EyeOff, Search, Filter } from 'lucide-react';

export default function AdminReviewsPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ReviewsContent />
        </ProtectedRoute>
    );
}

function ReviewsContent() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingReviews, setTogglingReviews] = useState<Set<string>>(new Set());

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceFilter, setServiceFilter] = useState<'ALL' | string>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'UNPUBLISHED'>('ALL');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchReviews = useCallback(async () => {
        try {
            // Récupérer tous les avis (y compris non publiés) pour l'admin
            const response = await api.get<Review[]>('/reviews?publishedOnly=false');
            setReviews(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des avis:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchServices = useCallback(async () => {
        try {
            const response = await api.get<Service[]>('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des services:', error);
        }
    }, []);

    const filterReviews = useCallback(() => {
        let filtered = [...reviews];

        // Filter by search term (user name or email)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(review =>
                review.user?.firstName?.toLowerCase().includes(term) ||
                review.user?.lastName?.toLowerCase().includes(term) ||
                review.user?.email?.toLowerCase().includes(term)
            );
        }

        // Filter by service
        if (serviceFilter !== 'ALL') {
            filtered = filtered.filter(review => review.booking?.service?.id === serviceFilter);
        }

        // Filter by status
        if (statusFilter === 'PUBLISHED') {
            filtered = filtered.filter(review => review.isApproved);
        } else if (statusFilter === 'UNPUBLISHED') {
            filtered = filtered.filter(review => !review.isApproved);
        }

        setFilteredReviews(filtered);
    }, [reviews, searchTerm, serviceFilter, statusFilter]);

    useEffect(() => {
        fetchReviews();
        fetchServices();
    }, [fetchReviews, fetchServices]);

    useEffect(() => {
        filterReviews();
    }, [filterReviews]);

    const handleToggleReview = async (reviewId: string, currentStatus: boolean) => {
        // Ajouter l'ID à la liste des reviews en cours de modification
        setTogglingReviews(prev => new Set(prev).add(reviewId));

        try {
            // Endpoint pour activer/désactiver l'avis
            const endpoint = currentStatus ? `/reviews/${reviewId}/unpublish` : `/reviews/${reviewId}/approve`;
            await api.post(endpoint);

            // Mettre à jour l'état local
            setReviews(reviews.map(review =>
                review.id === reviewId
                    ? { ...review, isApproved: !currentStatus }
                    : review
            ));
        } catch (err) {
            console.error('Erreur lors de la modification de l\'avis:', err);
            alert('Erreur lors de la modification de l\'avis');
        } finally {
            // Retirer l'ID de la liste des reviews en cours de modification
            setTogglingReviews(prev => {
                const next = new Set(prev);
                next.delete(reviewId);
                return next;
            });
        }
    };

    // Composant pour afficher les étoiles
    const StarRating = ({ rating }: { rating: number }) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : star <= rating + 0.5
                                ? 'text-amber-400 fill-amber-200'
                                : 'text-stone-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    // Composant Toggle Switch
    const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => {
        return (
            <button
                type="button"
                onClick={onChange}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${enabled ? 'bg-green-600' : 'bg-stone-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const publishedCount = reviews.filter(r => r.isApproved).length;
    const unpublishedCount = reviews.filter(r => !r.isApproved).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[{ label: 'Administration' }, { label: 'Avis clients' }]}
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
                    items={[{ label: 'Administration', href: '/admin/dashboard' }, 
                        { label: 'Avis clients' }]}
                    className="mb-8"
                />

                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl shadow-lg">
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestion des avis clients
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Modérez et gérez tous les avis laissés par vos clients
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Total des avis</div>
                        <div className="text-3xl font-bold text-blue-600">{reviews.length}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Avis publiés</div>
                        <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-600 mb-1">Avis masqués</div>
                        <div className="text-3xl font-bold text-amber-600">{unpublishedCount}</div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search by user */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rechercher par utilisateur
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Nom, prénom ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filter by service */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service
                            </label>
                            <select
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tous les services</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter by status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                État
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'UNPUBLISHED')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tous les états</option>
                                <option value="PUBLISHED">Publiés</option>
                                <option value="UNPUBLISHED">Masqués</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Reviews List */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Avis filtrés ({filteredReviews.length})
                        </h2>
                    </div>

                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-16">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                {reviews.length === 0 ? 'Aucun avis pour le moment' : 'Aucun avis ne correspond aux filtres'}
                            </p>
                            <p className="text-gray-400 mt-2">
                                {reviews.length === 0
                                    ? 'Les avis apparaîtront ici une fois que les clients auront laissé leurs commentaires'
                                    : 'Essayez de modifier vos critères de recherche'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredReviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                <User className="w-6 h-6 text-amber-800" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {review.user?.firstName} {review.user?.lastName}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {review.user?.email}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <StarRating rating={review.rating} />
                                                        <span className="font-medium text-gray-900">{review.rating}/5</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(review.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:hidden">
                                                        {review.isApproved ? (
                                                            <div className="flex items-center gap-2 text-green-600">
                                                                <Eye className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Publié</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-amber-600">
                                                                <EyeOff className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Masqué</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-gray-700 leading-relaxed mb-4">
                                                        "{review.comment}"
                                                    </p>
                                                )}
                                                <div className="text-sm text-gray-600">
                                                    <strong>Service:</strong> {review.booking?.service?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end sm:gap-2">
                                            <div className="hidden sm:flex items-center gap-2">
                                                {review.isApproved ? (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Publié</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-amber-600">
                                                        <EyeOff className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Masqué</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-500 sm:hidden">
                                                    {review.isApproved ? 'Visible' : 'Masqué'}
                                                </span>
                                                <ToggleSwitch
                                                    enabled={review.isApproved}
                                                    onChange={() => handleToggleReview(review.id, review.isApproved)}
                                                    disabled={togglingReviews.has(review.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}