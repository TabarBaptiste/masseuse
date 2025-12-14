import React from 'react';
import { Card } from '@/components/ui/Card';

interface UsersStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
        admins: number;
        pros: number;
        clients: number;
    };
}

export const UsersStats: React.FC<UsersStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
                <div className="text-sm text-gray-600 mb-1">Total</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-600 mb-1">Actifs</div>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-600 mb-1">Inactifs</div>
                <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-600 mb-1">Clients</div>
                <div className="text-2xl font-bold text-green-600">{stats.clients}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-600 mb-1">Admins</div>
                <div className="text-2xl font-bold text-red-800">{stats.admins}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-600 mb-1">Pros</div>
                <div className="text-2xl font-bold text-blue-600">{stats.pros}</div>
            </Card>
        </div>
    );
};