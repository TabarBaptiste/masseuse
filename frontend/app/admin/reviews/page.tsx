'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, Review } from '@/types';
import { Card } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Loading } from '@/components/ui/Loading';
import api from '@/lib/api';
import { MessageSquare, Star, User, Calendar, Eye, EyeOff } from 'lucide-react';

export default function AdminReviewsPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ReviewsContent />
        </ProtectedRoute>
    );
}

function ReviewsContent() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingReviews, setTogglingReviews] = useState<Set<string>>(new Set());

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Récupérer tous les avis (y compris non publiés) pour l'admin
                const response = await api.get<Review[]>('/reviews?publishedOnly=false');
                setReviews(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des avis:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

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
                    ? { ...review, isPublished: !currentStatus }
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

    const publishedCount = reviews.filter(r => r.isPublished).length;
    const unpublishedCount = reviews.filter(r => !r.isPublished).length;

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
                    items={[{ label: 'Administration' }, { label: 'Avis clients' }]}
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
                        <div className="text-sm text-gray-600 mb-1">Avis en attente</div>
                        <div className="text-3xl font-bold text-amber-600">{unpublishedCount}</div>
                    </Card>
                </div>

                {/* Reviews List */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Tous les avis ({reviews.length})
                        </h2>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-16">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                Aucun avis pour le moment
                            </p>
                            <p className="text-gray-400 mt-2">
                                Les avis apparaîtront ici une fois que les clients auront laissé leurs commentaires
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                <User className="w-6 h-6 text-amber-800" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {review.user?.firstName} {review.user?.lastName}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {review.user?.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <StarRating rating={review.rating} />
                                                        <span className="font-medium text-gray-900">{review.rating}/5</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(review.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {review.isPublished ? (
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
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">
                                                {review.isPublished ? 'Visible' : 'Masqué'}
                                            </span>
                                            <ToggleSwitch
                                                enabled={review.isPublished}
                                                onChange={() => handleToggleReview(review.id, review.isPublished)}
                                                disabled={togglingReviews.has(review.id)}
                                            />
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