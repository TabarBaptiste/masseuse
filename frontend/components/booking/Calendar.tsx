'use client';

import React from 'react';
import { format, addDays, startOfWeek, isSameDay, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  workingDays?: string[]; // Array of day names: MONDAY, TUESDAY, etc.
}

// Mapping from JS getDay() (0=Sunday) to DayOfWeek enum
const dayMapping = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  maxDate = addDays(new Date(), 60),
  workingDays,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const allDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // Filter to show only working days if workingDays is provided
  const days = workingDays 
    ? allDays.filter(day => {
        const dayName = dayMapping[getDay(day)];
        return workingDays.includes(dayName);
      })
    : allDays;

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
          <ArrowLeft  className="w-5 h-5"/>
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
          <ArrowRight  className="w-5 h-5"/>
        </button>
      </div>

      <div className="grid gap-2" style={{
        gridTemplateColumns: workingDays ? `repeat(${days.length}, minmax(0, 1fr))` : 'repeat(7, minmax(0, 1fr))'
      }}>
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDisabled = day < minDate || day > maxDate;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onSelectDate(day)}
              disabled={isDisabled}
              className={clsx(
                'p-2 rounded-lg text-center transition-colors',
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
