/* eslint-disable react-hooks/static-components */
import React from 'react';
import { User, UserRole } from '@/types';
import { Card } from '@/components/ui/Card';
import { Edit, Trash2, UserCheck, UserX, Mail, Phone, Calendar, Shield, UserStar, User as Utilisateur } from 'lucide-react';

interface UsersTableProps {
    users: User[];
    onToggleStatus: (userId: string, currentStatus: boolean) => void;
    onChangeRole: (userId: string, newRole: UserRole) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
    users,
    onToggleStatus,
    onChangeRole,
    onEditUser,
    onDeleteUser,
}) => {
    // Trier les utilisateurs par date d'inscription croissante (plus ancien en premier)
    const sortedUsers = [...users].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'bg-red-100 text-red-800';
            case UserRole.PRO:
                return 'bg-blue-100 text-blue-800';
            case UserRole.USER:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return <Shield className="w-4 h-4" />;
            case UserRole.PRO:
                return <UserStar className="w-4 h-4" />;
            case UserRole.USER:
                return <Utilisateur className="w-4 h-4" />;
            default:
                return <Utilisateur className="w-4 h-4" />;
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'Administrateur';
            case UserRole.PRO:
                return 'Professionnel';
            case UserRole.USER:
                return 'Client';
            default:
                return 'Client';
        }
    };

    // Version mobile avec cartes
    const MobileCards = () => (
        <div className="space-y-4">
            {sortedUsers.length === 0 ? (
                <Card>
                    <div className="text-center py-8 text-gray-500">
                        Aucun utilisateur trouvé
                    </div>
                </Card>
            ) : (
                sortedUsers.map((user) => (
                    <Card key={user.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="shrink-0 h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-amber-800 font-medium text-lg">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)} mt-1`}>
                                        {getRoleIcon(user.role)}
                                        {/* <span className="ml-1">{getRoleLabel(user.role)}</span> */}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onToggleStatus(user.id, user.isActive)}
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                    user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {user.isActive ? (
                                    <>
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        Actif
                                    </>
                                ) : (
                                    <>
                                        <UserX className="w-3 h-3 mr-1" />
                                        Inactif
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                {user.email}
                            </div>
                            {user.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {user.phone}
                                </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Rôle:</span>
                                <select
                                    value={user.role}
                                    onChange={(e) => onChangeRole(user.id, e.target.value as UserRole)}
                                    className={`px-3 py-1 text-sm font-medium rounded-lg ${getRoleBadgeColor(user.role)} border-0 cursor-pointer`}
                                >
                                    <option value={UserRole.USER}>Client</option>
                                    <option value={UserRole.PRO}>Professionnel</option>
                                    <option value={UserRole.ADMIN}>Administrateur</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onEditUser(user)}
                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDeleteUser(user.id)}
                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );

    // Version desktop avec tableau
    const DesktopTable = () => (
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Utilisateur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email / Téléphone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Inscription
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            sortedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                <span className="text-amber-800 font-medium">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        {user.phone && (
                                            <div className="text-sm text-gray-500">{user.phone}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={user.role}
                                            onChange={(e) => onChangeRole(user.id, e.target.value as UserRole)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)} border-0 cursor-pointer`}
                                        >
                                            <option value={UserRole.USER}>Client</option>
                                            <option value={UserRole.PRO}>Professionnel</option>
                                            <option value={UserRole.ADMIN}>Administrateur</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => onToggleStatus(user.id, user.isActive)}
                                            className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-full ${
                                                user.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            } transition-colors`}
                                        >
                                            {user.isActive ? (
                                                <>
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    Actif
                                                </>
                                            ) : (
                                                <>
                                                    <UserX className="w-3 h-3 mr-1" />
                                                    Inactif
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => onEditUser(user)}
                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    return (
        <>
            {/* Version mobile */}
            <div className="block md:hidden">
                <MobileCards />
            </div>

            {/* Version desktop */}
            <div className="hidden md:block">
                <DesktopTable />
            </div>
        </>
    );
};