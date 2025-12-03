import React from 'react';
import Link from 'next/link';
import { Service } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <Card>
      {service.imageUrl && (
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
        />
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {service.name}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3">
        {service.description}
      </p>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-2xl font-bold text-blue-600">
            {service.price}€
          </span>
          <span className="text-gray-600 ml-2">
            {service.duration} min
          </span>
        </div>
      </div>
      <Link href={`/services/${service.id}`}>
        <Button className="w-full">
          Voir les détails
        </Button>
      </Link>
    </Card>
  );
};
