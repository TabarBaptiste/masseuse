import React from 'react';
import { UserRole } from '@/types';
import { Search } from 'lucide-react';

interface UsersFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    roleFilter: 'ALL' | UserRole;
    onRoleFilterChange: (value: 'ALL' | UserRole) => void;
    statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
    onStatusFilterChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
}

export const UsersFilters: React.FC<UsersFiltersProps> = ({
    searchTerm,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    statusFilter,
    onStatusFilterChange,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Rechercher par nom, email, téléphone..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
            </div>

            {/* Role Filter */}
            <select
                value={roleFilter}
                onChange={(e) => onRoleFilterChange(e.target.value as 'ALL' | UserRole)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
                <option value="ALL">Tous les rôles</option>
                <option value={UserRole.ADMIN}>Administrateurs</option>
                <option value={UserRole.PRO}>Professionnels</option>
                <option value={UserRole.USER}>Clients</option>
            </select>

            {/* Status Filter */}
            <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
            </select>
        </div>
    );
};