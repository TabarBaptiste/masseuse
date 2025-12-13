'use client';

import React from 'react';
import { format, addDays, isSameDay, getDay } from 'date-fns';
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
  const [currentMonthStart, setCurrentMonthStart] = React.useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Générer toutes les dates du mois en cours + padding pour 5 semaines complètes
  const generateCalendarDates = () => {
    const year = currentMonthStart.getFullYear();
    const month = currentMonthStart.getMonth();
    
    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    const firstDayWeekday = getDay(firstDayOfMonth);
    // Ajuster pour commencer la semaine le lundi (1)
    const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    
    // Calculer le nombre total de jours à afficher (5 semaines = 35 jours)
    const totalDays = 35;
    
    const dates = [];
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(year, month, 1 - startOffset + i);
      dates.push(date);
    }
    
    return dates;
  };

  const allDates = generateCalendarDates();

  // On n'applique PAS le filtre workingDays sur l'affichage, seulement sur l'activation des boutons
  const dates = allDates;

  const goToNextMonth = () => {
    setCurrentMonthStart(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    const prevMonth = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1);
    if (prevMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      setCurrentMonthStart(prevMonth);
    }
  };

  const canGoPrev = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1) >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1) <= maxDate;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPrevMonth}
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
          {format(currentMonthStart, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={goToNextMonth}
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

      {/* Header des jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier - 5 semaines */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = day.getMonth() === currentMonthStart.getMonth();
          const isPastDate = day < minDate;
          const isFutureDate = day > maxDate;
          
          // Vérifier si c'est un jour de travail
          const dayName = dayMapping[getDay(day)];
          const isWorkingDay = !workingDays || workingDays.includes(dayName);
          
          // Le jour est désactivé si : passé, futur, ou pas un jour de travail
          const isDisabled = isPastDate || isFutureDate || !isWorkingDay;

          return (
            <button
              key={`${day.toISOString()}-${index}`}
              onClick={() => !isDisabled && onSelectDate(day)}
              disabled={isDisabled}
              className={clsx(
                'p-2 rounded-lg text-center transition-colors min-h-12 flex items-center justify-center',
                isSelected &&
                  'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2',
                !isSelected && !isDisabled && isCurrentMonth && 'bg-gray-100 hover:bg-gray-200',
                !isSelected && !isDisabled && !isCurrentMonth && 'bg-gray-50 hover:bg-gray-100 text-gray-500',
                isDisabled && 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
              )}
            >
              <div className="text-sm font-medium">
                {format(day, 'd', { locale: fr })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
