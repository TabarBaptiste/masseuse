'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface LeaveReviewModalProps {
    bookingId: string;
    serviceName: string;
    onClose: () => void;
    onReviewSubmitted: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
    bookingId,
    serviceName,
    onClose,
    onReviewSubmitted,
}) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Veuillez sélectionner une note');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await api.post('/reviews', {
                bookingId,
                rating,
                comment: comment.trim() || undefined,
            });

            onReviewSubmitted();
            onClose();
        } catch (err: unknown) {
            console.error('Erreur lors de la soumission de l\'avis:', err);
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la soumission de l\'avis'
                : 'Erreur lors de la soumission de l\'avis';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
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
                    Laisser un avis
                </h2>
                <p className="text-gray-600 mb-6">
                    Partagez votre expérience pour {serviceName}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Note *
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-300'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Commentaire (optionnel)
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
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};