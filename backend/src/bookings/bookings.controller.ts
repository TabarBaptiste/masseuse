import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, BookingStatus } from '@prisma/client';
import { StripeService } from '../stripe/stripe.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    // 1. Vérifier la disponibilité du créneau avant de créer la session de paiement
    const isAvailable = await this.bookingsService.checkSlotAvailability(
      createBookingDto.serviceId,
      createBookingDto.date,
      createBookingDto.startTime,
    );

    if (!isAvailable) {
      throw new BadRequestException("Ce créneau n'est plus disponible");
    }

    // TODO : DOIT ÊTRE SUPPRIMÉ APRÈS TESTS
    // ! DOIT ÊTRE SUPPRIMÉ APRÈS TESTS
    // Créer la réservation avec statut PENDING_PAYMENT
    await this.bookingsService.create(
      user.id,
      createBookingDto,
    );
    // TODO : DOIT ÊTRE SUPPRIMÉ APRÈS TESTS
    // ! DOIT ÊTRE SUPPRIMÉ APRÈS TESTS
  
    // 2. Créer la session Stripe Checkout avec les données de réservation
    const { url } = await this.stripeService.createCheckoutSessionForBooking(
      user.id,
      createBookingDto,
    );

    // 3. Retourner l'URL de paiement (pas de réservation créée encore)
    return {
      checkoutUrl: url,
      message: 'Redirection vers le paiement en cours...',
    };
  }

  @Get('available-slots')
  getAvailableSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(serviceId, date);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: BookingStatus,
    @Query('date') date?: string,
    @Query('name') name?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'upcoming' | 'past',
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.bookingsService.findAll(userId, status, date, name, cursor, limitNum, type);
  }

  @Get('my-bookings')
  findMyBookings(
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.findAll(user.id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.update(
      id,
      updateBookingDto,
      user.id,
      user.role,
    );
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.cancel(id, user.id, user.role, reason);
  }
}
