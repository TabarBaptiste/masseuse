'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole, User } from '@/types';
import api from '@/lib/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Users } from 'lucide-react';
import { UsersStats, UsersFilters, UsersTable } from '@/components/pro/users';

export default function AdminUsersPage() {
    return (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <UsersContent />
        </ProtectedRoute>
    );
}

function UsersContent() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const filterUsers = useCallback(() => {
        let filtered = [...users];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.firstName.toLowerCase().includes(term) ||
                user.lastName.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.phone && user.phone.includes(term))
            );
        }

        // Filter by role
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Filter by status
        if (statusFilter === 'ACTIVE') {
            filtered = filtered.filter(user => user.isActive);
        } else if (statusFilter === 'INACTIVE') {
            filtered = filtered.filter(user => !user.isActive);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, statusFilter]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        filterUsers();
    }, [filterUsers]);

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${userId}`, { isActive: !currentStatus });
            await fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error);
            alert('Erreur lors de la modification du statut');
        }
    };

    const handleChangeRole = async (userId: string, newRole: UserRole) => {
        try {
            await api.patch(`/users/${userId}`, { role: newRole });
            await fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la modification du rôle:', error);
            alert('Erreur lors de la modification du rôle');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            await fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'utilisateur');
        }
    };

    const handleEditUser = (user: User) => {
        router.push(`/pro/users/edit/${user.id}`);
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        admins: users.filter(u => u.role === UserRole.ADMIN).length,
        pros: users.filter(u => u.role === UserRole.PRO).length,
        clients: users.filter(u => u.role === UserRole.USER).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        { label: 'Administration', href: '/admin/dashboard' },
                        { label: 'Utilisateurs' }
                    ]}
                    className="mb-8"
                />
                {/* Header */}
                <div className="mb-8">
                    {/* <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center space-x-2 text-amber-800 hover:text-amber-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </Link> */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Users className="w-8 h-8 mr-3 text-amber-600" />
                                Gestion des utilisateurs
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gérez tous les utilisateurs de la plateforme
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <UsersStats stats={stats} />

                {/* Filters */}
                <UsersFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                {/* Users Table */}
                <UsersTable
                    users={filteredUsers}
                    onToggleStatus={handleToggleStatus}
                    onChangeRole={handleChangeRole}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                />
            </div>
        </div>
    );
}
