'use client';

import React from 'react';
import clsx from 'clsx';

interface TimeSlotPickerProps {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  isLoading?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {slots.map((slot) => {
        const isSelected = slot === selectedSlot;
        return (
          <button
            key={slot}
            onClick={() => onSelectSlot(slot)}
            className={clsx(
              'p-3 rounded-lg text-center font-medium transition-colors',
              isSelected
                ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
};
