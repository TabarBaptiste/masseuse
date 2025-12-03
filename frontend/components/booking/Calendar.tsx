'use client';

import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  maxDate = addDays(new Date(), 60),
}) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToPrevWeek = () => {
    const prevWeek = addDays(currentWeekStart, -7);
    if (prevWeek >= minDate) {
      setCurrentWeekStart(prevWeek);
    }
  };

  const canGoPrev = currentWeekStart > minDate;
  const canGoNext = addDays(currentWeekStart, 6) < maxDate;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPrevWeek}
          disabled={!canGoPrev}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium',
            canGoPrev
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          ← Semaine précédente
        </button>
        <span className="font-semibold text-lg">
          {format(currentWeekStart, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={goToNextWeek}
          disabled={!canGoNext}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium',
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          Semaine suivante →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDisabled = day < minDate || day > maxDate;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onSelectDate(day)}
              disabled={isDisabled}
              className={clsx(
                'p-4 rounded-lg text-center transition-colors',
                isSelected &&
                  'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2',
                !isSelected && !isDisabled && 'bg-gray-100 hover:bg-gray-200',
                isDisabled && 'bg-gray-50 text-gray-400 cursor-not-allowed'
              )}
            >
              <div className="text-xs font-medium mb-1">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div className="text-lg font-bold">
                {format(day, 'd', { locale: fr })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
