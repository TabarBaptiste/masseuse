'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Service, UserRole } from '@/types';
import { ServiceCard } from '@/components/services/ServiceCard';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/store/auth';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canManageServices = isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.PRO);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get<Service[]>('/services');
      setServices(response.data);
    } catch {
      setError('Erreur lors du chargement des services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      await api.delete(`/services/${id}`);
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du service');
    }
  };

  const handleEdit = (service: Service) => {
    router.push(`/services/manage?id=${service.id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: 'Services' }]}
          className="mb-8"
        />
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Mes Services de Massage
            </h1>
            {canManageServices && (
              <button
                onClick={() => router.push('/services/manage')}
                className="flex items-center space-x-2 bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau service</span>
              </button>
            )}
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre gamme complète de massages thérapeutiques et relaxants
          </p>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-gray-600">
            Aucun service disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="relative">
                <ServiceCard service={service} />
                {canManageServices && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
