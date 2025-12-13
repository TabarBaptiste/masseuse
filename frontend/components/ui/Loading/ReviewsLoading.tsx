import React from 'react';

interface ReviewsLoadingProps {
    count?: number;
}

export const ReviewsLoading: React.FC<ReviewsLoadingProps> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 animate-pulse">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-3">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};