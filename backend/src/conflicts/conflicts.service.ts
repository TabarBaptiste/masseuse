import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, DayOfWeek } from '@prisma/client';

export interface Conflict {
  id: string;
  type:
    | 'OVERLAPPING_BOOKINGS'
    | 'BOOKING_BLOCKED_SLOT'
    | 'BOOKING_NO_AVAILABILITY'
    | 'DOUBLE_BOOKING';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  affectedBookings?: any[];
  blockedSlot?: any;
  details?: any;
}

@Injectable()
export class ConflictsService {
  constructor(private prisma: PrismaService) {}

  async findAllConflicts(fromDate?: string, toDate?: string) {
    const dateFilter: any = {};
    if (fromDate) dateFilter.gte = new Date(fromDate);
    if (toDate) dateFilter.lte = new Date(toDate);

    // Get all active bookings
    const bookings = await this.prisma.booking.findMany({
      where: {
        ...(fromDate || toDate ? { date: dateFilter } : {}),
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Get all blocked slots
    const blockedSlots = await this.prisma.blockedSlot.findMany({
      where: fromDate || toDate ? { date: dateFilter } : {},
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Get all weekly availabilities
    const weeklyAvailabilities = await this.prisma.weeklyAvailability.findMany({
      where: { isActive: true },
    });

    const conflicts: Conflict[] = [];

    // 1. Check for overlapping bookings (double booking)
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const booking1 = bookings[i];
        const booking2 = bookings[j];

        // Same date
        if (
          booking1.date.toISOString().split('T')[0] ===
          booking2.date.toISOString().split('T')[0]
        ) {
          if (
            this.timesOverlap(
              booking1.startTime,
              booking1.endTime,
              booking2.startTime,
              booking2.endTime,
            )
          ) {
            conflicts.push({
              id: `overlap-${booking1.id}-${booking2.id}`,
              type: 'OVERLAPPING_BOOKINGS',
              severity: 'HIGH',
              date: booking1.date.toISOString().split('T')[0],
              startTime: booking1.startTime,
              endTime: booking1.endTime,
              description: `Deux réservations se chevauchent`,
              affectedBookings: [booking1, booking2],
            });
          }
        }
      }
    }

    // 2. Check for bookings conflicting with blocked slots
    for (const booking of bookings) {
      const bookingDate = booking.date.toISOString().split('T')[0];
      const conflictingBlocks = blockedSlots.filter(
        (block) =>
          block.date.toISOString().split('T')[0] === bookingDate &&
          this.timesOverlap(
            booking.startTime,
            booking.endTime,
            block.startTime,
            block.endTime,
          ),
      );

      for (const block of conflictingBlocks) {
        conflicts.push({
          id: `booking-block-${booking.id}-${block.id}`,
          type: 'BOOKING_BLOCKED_SLOT',
          severity: 'HIGH',
          date: bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          description: `Réservation pendant un créneau bloqué${block.reason ? ` (${block.reason})` : ''}`,
          affectedBookings: [booking],
          blockedSlot: block,
        });
      }
    }

    // 3. Check for bookings outside availability hours
    for (const booking of bookings) {
      const bookingDate = new Date(booking.date);
      const dayOfWeek = this.getDayOfWeek(bookingDate);

      const dayAvailabilities = weeklyAvailabilities.filter(
        (av) => av.dayOfWeek === dayOfWeek,
      );

      if (dayAvailabilities.length === 0) {
        conflicts.push({
          id: `no-availability-${booking.id}`,
          type: 'BOOKING_NO_AVAILABILITY',
          severity: 'MEDIUM',
          date: booking.date.toISOString().split('T')[0],
          startTime: booking.startTime,
          endTime: booking.endTime,
          description: `Réservation un jour non ouvert (${this.getDayName(dayOfWeek)})`,
          affectedBookings: [booking],
          details: { dayOfWeek },
        });
      } else {
        const isWithinAvailability = dayAvailabilities.some(
          (av) =>
            booking.startTime >= av.startTime && booking.endTime <= av.endTime,
        );

        if (!isWithinAvailability) {
          conflicts.push({
            id: `outside-hours-${booking.id}`,
            type: 'BOOKING_NO_AVAILABILITY',
            severity: 'MEDIUM',
            date: booking.date.toISOString().split('T')[0],
            startTime: booking.startTime,
            endTime: booking.endTime,
            description: `Réservation en dehors des horaires d'ouverture`,
            affectedBookings: [booking],
            details: { availabilities: dayAvailabilities },
          });
        }
      }
    }

    // 4. Check for blocked slots overlapping with each other
    for (let i = 0; i < blockedSlots.length; i++) {
      for (let j = i + 1; j < blockedSlots.length; j++) {
        const block1 = blockedSlots[i];
        const block2 = blockedSlots[j];

        if (
          block1.date.toISOString().split('T')[0] ===
          block2.date.toISOString().split('T')[0]
        ) {
          if (
            this.timesOverlap(
              block1.startTime,
              block1.endTime,
              block2.startTime,
              block2.endTime,
            )
          ) {
            conflicts.push({
              id: `block-overlap-${block1.id}-${block2.id}`,
              type: 'BOOKING_BLOCKED_SLOT',
              severity: 'LOW',
              date: block1.date.toISOString().split('T')[0],
              startTime: block1.startTime,
              endTime: block1.endTime,
              description: `Deux créneaux bloqués se chevauchent`,
              details: { blocks: [block1, block2] },
            });
          }
        }
      }
    }

    return {
      total: conflicts.length,
      conflicts: conflicts.sort((a, b) => {
        // Sort by severity (HIGH > MEDIUM > LOW) then by date
        const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.date.localeCompare(b.date);
      }),
    };
  }

  async getConflictsSummary() {
    const result = await this.findAllConflicts();
    const conflicts = result.conflicts;

    const summary = {
      total: conflicts.length,
      byType: {
        OVERLAPPING_BOOKINGS: conflicts.filter(
          (c) => c.type === 'OVERLAPPING_BOOKINGS',
        ).length,
        BOOKING_BLOCKED_SLOT: conflicts.filter(
          (c) => c.type === 'BOOKING_BLOCKED_SLOT',
        ).length,
        BOOKING_NO_AVAILABILITY: conflicts.filter(
          (c) => c.type === 'BOOKING_NO_AVAILABILITY',
        ).length,
      },
      bySeverity: {
        HIGH: conflicts.filter((c) => c.severity === 'HIGH').length,
        MEDIUM: conflicts.filter((c) => c.severity === 'MEDIUM').length,
        LOW: conflicts.filter((c) => c.severity === 'LOW').length,
      },
    };

    return summary;
  }

  private timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[date.getDay()] as DayOfWeek;
  }

  private getDayName(dayOfWeek: DayOfWeek): string {
    const names: Record<DayOfWeek, string> = {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
      SATURDAY: 'Samedi',
      SUNDAY: 'Dimanche',
    };
    return names[dayOfWeek];
  }
}
