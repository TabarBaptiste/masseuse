import React from 'react';

interface ServicesLoadingProps {
    count?: number;
}

export const ServicesLoading: React.FC<ServicesLoadingProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div key={index} className="group relative bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                        {/* Image Container */}
                        <div className="relative h-64 bg-gray-200"></div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="flex gap-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};