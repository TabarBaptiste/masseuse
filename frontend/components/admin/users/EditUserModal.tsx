import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface EditUserModalProps {
    editingUser: User | null;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    onUserChange: (user: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    editingUser,
    onClose,
    onSave,
    onUserChange,
}) => {
    if (!editingUser) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Modifier l'utilisateur
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom
                        </label>
                        <input
                            type="text"
                            value={editingUser.firstName}
                            onChange={(e) => onUserChange({ ...editingUser, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom
                        </label>
                        <input
                            type="text"
                            value={editingUser.lastName}
                            onChange={(e) => onUserChange({ ...editingUser, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => onUserChange({ ...editingUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            value={editingUser.phone || ''}
                            onChange={(e) => onUserChange({ ...editingUser, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};