import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { BookingStatus, DayOfWeek } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  async create(userId: string, createBookingDto: CreateBookingDto) {
    // Get service
    const service = await this.prisma.service.findUnique({
      where: { id: createBookingDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!service.isActive) {
      throw new BadRequestException('Service is not active');
    }

    // Get site settings
    const settings = await this.prisma.siteSettings.findFirst();
    const bookingDate = new Date(createBookingDto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    const daysInAdvance = Math.floor(
      (bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (settings) {
      if (daysInAdvance < settings.bookingAdvanceMinDays) {
        throw new BadRequestException(
          `Bookings must be made at least ${settings.bookingAdvanceMinDays} days in advance`,
        );
      }
      if (daysInAdvance > settings.bookingAdvanceMaxDays) {
        throw new BadRequestException(
          `Bookings cannot be made more than ${settings.bookingAdvanceMaxDays} days in advance`,
        );
      }
    }

    // Calculate end time
    const [startHour, startMinute] = createBookingDto.startTime
      .split(':')
      .map(Number);
    const endMinutes = startHour * 60 + startMinute + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // Check if slot is available
    const isAvailable = await this.isSlotAvailable(
      createBookingDto.date,
      createBookingDto.startTime,
      endTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('This time slot is not available');
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        serviceId: createBookingDto.serviceId,
        date: new Date(createBookingDto.date),
        startTime: createBookingDto.startTime,
        endTime,
        // status: BookingStatus.PENDING_PAYMENT,
        notes: createBookingDto.notes,
        priceAtBooking: service.price,
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Envoyer email de notification à l'administrateur
    try {
      await this.emailService.notifyAdminNewBooking({
        clientName: `${booking.user.firstName} ${booking.user.lastName}`,
        clientEmail: booking.user.email,
        clientPhone: booking.user.phone || undefined,
        serviceName: booking.service.name,
        date: format(new Date(booking.date), 'EEEE d MMMM yyyy', { locale: fr }),
        time: booking.startTime,
        duration: booking.service.duration,
        price: Number(booking.priceAtBooking),
        notes: booking.notes || undefined,
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', error);
      // On ne fait pas échouer la réservation si l'email échoue
    }

    return booking;
  }

  async getAvailableSlots(serviceId: string, date: string) {
    // Get service
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!service.isActive) {
      throw new BadRequestException('Service is not active');
    }

    const requestedDate = new Date(date);
    const dayOfWeek = this.getDayOfWeek(requestedDate);

    // Get weekly availability for this day
    const weeklyAvailabilities = await this.prisma.weeklyAvailability.findMany({
      where: {
        dayOfWeek,
        isActive: true,
      },
    });

    if (weeklyAvailabilities.length === 0) {
      return [];
    }

    // Get blocked slots for this date
    const blockedSlots = await this.prisma.blockedSlot.findMany({
      where: {
        date: requestedDate,
      },
    });

    // Get existing bookings for this date
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        date: requestedDate,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    // Generate available slots
    const availableSlots: string[] = [];
    const slotInterval = 30; // 30 minutes interval

    for (const availability of weeklyAvailabilities) {
      const [startHour, startMinute] = availability.startTime
        .split(':')
        .map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      for (
        let time = startMinutes;
        time + service.duration <= endMinutes;
        time += slotInterval
      ) {
        const slotStartHour = Math.floor(time / 60);
        const slotStartMinute = time % 60;
        const slotStartTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`;
        const slotEndMinutes = time + service.duration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMinute = slotEndMinutes % 60;
        const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

        // Check if slot overlaps with blocked slots
        const isBlocked = blockedSlots.some((blocked) =>
          this.timesOverlap(
            slotStartTime,
            slotEndTime,
            blocked.startTime,
            blocked.endTime,
          ),
        );

        // Check if slot overlaps with existing bookings
        const isBooked = existingBookings.some((booking) =>
          this.timesOverlap(
            slotStartTime,
            slotEndTime,
            booking.startTime,
            booking.endTime,
          ),
        );

        if (!isBlocked && !isBooked) {
          availableSlots.push(slotStartTime);
        }
      }
    }

    return availableSlots;
  }

  async findAll(
    userId?: string,
    status?: BookingStatus,
    date?: string,
    name?: string,
  ) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }
    if (date) {
      where.date = new Date(date);
    }
    if (name) {
      where.user = {
        OR: [
          { firstName: { contains: name, mode: 'insensitive' } },
          { lastName: { contains: name, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        reviews: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (userId && userRole === 'USER' && booking.userId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  // Dans bookings.service.ts - modifier la méthode update()
  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId?: string,
    userRole?: string,
  ) {
    const booking = await this.findOne(id, userId, userRole);

    // PRO and ADMIN can update all fields
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Envoyer email de confirmation au client si le statut passe à CONFIRMED
    if (updateBookingDto.status === BookingStatus.CONFIRMED && booking.status !== BookingStatus.CONFIRMED) {
      try {
        await this.emailService.sendBookingConfirmationToClient(
          updatedBooking.user.email,
          {
            clientName: `${updatedBooking.user.firstName} ${updatedBooking.user.lastName}`,
            serviceName: updatedBooking.service.name,
            date: format(new Date(updatedBooking.date), 'EEEE d MMMM yyyy', { locale: fr }),
            time: updatedBooking.startTime,
            duration: updatedBooking.service.duration,
            price: Number(updatedBooking.priceAtBooking),
          }
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation au client:', error);
        // On ne fait pas échouer la mise à jour si l'email échoue
      }
    }

    return updatedBooking;
  }

  async cancel(id: string, userId: string, userRole: string, reason?: string) {
    const booking = await this.findOne(id, userId, userRole);

    // Check if booking can be cancelled
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('This booking cannot be cancelled');
    }

    // Check cancellation deadline
    const settings = await this.prisma.siteSettings.findFirst();
    if (settings && userRole === 'USER') {
      const bookingDateTime = new Date(booking.date);
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes);

      const now = new Date();
      const hoursUntilBooking =
        (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilBooking < settings.cancellationDeadlineHours) {
        throw new BadRequestException(
          `Bookings can only be cancelled at least ${settings.cancellationDeadlineHours} hours in advance`,
        );
      }
    }

    const cancelledBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Envoyer email de notification à l'administrateur
    try {
      await this.emailService.notifyAdminBookingCancelled({
        clientName: `${cancelledBooking.user.firstName} ${cancelledBooking.user.lastName}`,
        clientEmail: cancelledBooking.user.email,
        serviceName: cancelledBooking.service.name,
        date: format(new Date(cancelledBooking.date), 'EEEE d MMMM yyyy', { locale: fr }),
        time: cancelledBooking.startTime,
        cancelReason: reason,
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'annulation:', error);
      // On ne fait pas échouer l'annulation si l'email échoue
    }

    return cancelledBooking;
  }

  /**
   * Vérifie la disponibilité d'un créneau pour un service donné
   * Méthode publique utilisée avant de créer une session de paiement
   */
  async checkSlotAvailability(
    serviceId: string,
    date: string,
    startTime: string,
  ): Promise<boolean> {
    // Récupérer le service pour connaître la durée
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Calculer l'heure de fin
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endMinutes = startHour * 60 + startMinute + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // Vérifier la disponibilité
    return this.isSlotAvailable(date, startTime, endTime);
  }

  private async isSlotAvailable(
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const requestedDate = new Date(date);
    const dayOfWeek = this.getDayOfWeek(requestedDate);

    // Check weekly availability
    const weeklyAvailability = await this.prisma.weeklyAvailability.findFirst({
      where: {
        dayOfWeek,
        isActive: true,
      },
    });

    if (!weeklyAvailability) {
      return false;
    }

    // Check if time is within weekly availability
    if (
      startTime < weeklyAvailability.startTime ||
      endTime > weeklyAvailability.endTime
    ) {
      return false;
    }

    // Check blocked slots
    const blockedSlots = await this.prisma.blockedSlot.findMany({
      where: {
        date: requestedDate,
      },
    });

    for (const blocked of blockedSlots) {
      if (
        this.timesOverlap(
          startTime,
          endTime,
          blocked.startTime,
          blocked.endTime,
        )
      ) {
        return false;
      }
    }

    // Check existing bookings
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        date: requestedDate,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    for (const booking of existingBookings) {
      if (
        this.timesOverlap(
          startTime,
          endTime,
          booking.startTime,
          booking.endTime,
        )
      ) {
        return false;
      }
    }

    return true;
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

  /**
   * Calculate end time given a start time and duration in minutes
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  }

  /**
   * Get active weekly availabilities for a specific day
   */
  private async getWeeklyAvailabilitiesForDay(dayOfWeek: DayOfWeek) {
    return this.prisma.weeklyAvailability.findMany({
      where: {
        dayOfWeek,
        isActive: true,
      },
    });
  }

  /**
   * Get blocked slots for a specific date
   */
  private async getBlockedSlotsForDate(date: Date) {
    return this.prisma.blockedSlot.findMany({
      where: { date },
    });
  }

  /**
   * Get existing bookings (pending or confirmed) for a specific date
   */
  private async getExistingBookingsForDate(date: Date) {
    return this.prisma.booking.findMany({
      where: {
        date,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });
  }

  /**
   * Check if a time slot conflicts with blocked slots or existing bookings
   */
  private isSlotConflicting(
    slotStartTime: string,
    slotEndTime: string,
    blockedSlots: any[],
    existingBookings: any[],
  ): boolean {
    // Check if slot overlaps with blocked slots
    const isBlocked = blockedSlots.some((blocked) =>
      this.timesOverlap(
        slotStartTime,
        slotEndTime,
        blocked.startTime,
        blocked.endTime,
      ),
    );

    if (isBlocked) return true;

    // Check if slot overlaps with existing bookings
    const isBooked = existingBookings.some((booking) =>
      this.timesOverlap(
        slotStartTime,
        slotEndTime,
        booking.startTime,
        booking.endTime,
      ),
    );

    return isBooked;
  }
}
