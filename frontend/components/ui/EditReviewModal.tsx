'use client';

import React, { useState } from 'react';
import { Star, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface EditReviewModalProps {
    reviewId: string;
    currentRating: number;
    currentComment: string;
    serviceName: string;
    onClose: () => void;
    onReviewUpdated: () => void;
}

export const EditReviewModal: React.FC<EditReviewModalProps> = ({
    reviewId,
    currentRating,
    currentComment,
    serviceName,
    onClose,
    onReviewUpdated,
}) => {
    const [comment, setComment] = useState(currentComment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setError('');

        try {
            await api.patch(`/reviews/${reviewId}/user-update`, {
                comment: comment.trim() || undefined,
            });

            onReviewUpdated();
            onClose();
        } catch (err: unknown) {
            console.error('Erreur lors de la mise à jour de l\'avis:', err);
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la mise à jour de l\'avis'
                : 'Erreur lors de la mise à jour de l\'avis';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.')) {
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await api.delete(`/reviews/${reviewId}/user-delete`);
            onReviewUpdated();
            onClose();
        } catch (err: unknown) {
            console.error('Erreur lors de la suppression de l\'avis:', err);
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la suppression de l\'avis'
                : 'Erreur lors de la suppression de l\'avis';
            setError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Modifier votre avis
                </h2>
                <p className="text-gray-600 mb-6">
                    Pour {serviceName}
                </p>

                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Rating (non modifiable) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Note (non modifiable)
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-8 h-8 ${star <= currentRating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Commentaire
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                            placeholder="Partagez votre expérience..."
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/500 caractères
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="space-y-3 pt-4">
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                                disabled={isSubmitting || isDeleting}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isDeleting}
                                className="flex-1"
                            >
                                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isSubmitting || isDeleting}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? 'Suppression...' : 'Supprimer l\'avis'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};