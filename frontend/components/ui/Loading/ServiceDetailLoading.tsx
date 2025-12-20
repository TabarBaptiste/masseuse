import React from 'react';

export const ServiceDetailLoading: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-50 animate-pulse">
            {/* Hero Image Section */}
            <section className="relative h-[50vh] md:h-[60vh] bg-gray-200">
                {/* Back Button */}
                <div className="absolute top-6 left-6 bg-white/90 rounded-full px-4 py-2.5 shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="w-16 h-4 bg-gray-300 rounded"></div>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="max-w-5xl mx-auto">
                        {/* Rating */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div key={star} className="w-6 h-6 bg-gray-300 rounded"></div>
                                ))}
                            </div>
                            <div className="w-12 h-4 bg-gray-300 rounded"></div>
                            <div className="w-16 h-4 bg-gray-300 rounded"></div>
                        </div>

                        <div className="w-3/4 h-12 bg-gray-300 rounded mb-4"></div>

                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 rounded-full px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                    <div className="w-20 h-4 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pt-12 md:pt-16 pb-8 md:pb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Description */}
                        <div className="lg:col-span-2">
                            <div className="w-48 h-8 bg-gray-200 rounded mb-6"></div>
                            <div className="space-y-3">
                                <div className="w-full h-4 bg-gray-200 rounded"></div>
                                <div className="w-full h-4 bg-gray-200 rounded"></div>
                                <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                                <div className="w-full h-4 bg-gray-200 rounded"></div>
                                <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        {/* Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-stone-100">
                                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between py-3 border-b border-stone-100">
                                        <div className="w-12 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-stone-100">
                                        <div className="w-8 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-12 h-6 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="w-8 h-4 bg-gray-200 rounded"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                                                ))}
                                            </div>
                                            <div className="w-8 h-4 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-12 md:py-8 bg-stone-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex-1">
                            <div className="w-40 h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div key={star} className="w-5 h-5 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <div className="w-full h-4 bg-gray-200 rounded"></div>
                                            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                                            <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};