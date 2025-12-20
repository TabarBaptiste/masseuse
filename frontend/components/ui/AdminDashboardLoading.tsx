import React from 'react';

export const AdminDashboardLoading: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-200 rounded-xl shadow-lg">
                            <div className="w-8 h-8 bg-gray-300 rounded"></div>
                        </div>
                        <div>
                            <div className="w-64 h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="w-96 h-4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="w-16 h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="w-12 h-8 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-200 rounded-lg">
                                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                                </div>
                                <div className="w-32 h-6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, btnIndex) => (
                                    <div key={btnIndex} className="w-full h-12 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-200 rounded-lg">
                                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                            <div className="w-40 h-6 bg-gray-200 rounded"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-12 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};