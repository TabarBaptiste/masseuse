import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    // Check if booking exists and belongs to user
    const booking = await this.prisma.booking.findUnique({
      where: { id: createReviewDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'Tu ne peux laisser un avis que pour tes propres réservations',
      );
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Tu ne peux laisser un avis que pour des réservations terminées',
      );
    }

    // Check if review already exists for this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: createReviewDto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('Tu as déjà noté cette réservation');
    }

    return this.prisma.review.create({
      data: {
        userId,
        bookingId: createReviewDto.bookingId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async findAll(publishedOnly = true) {
    return this.prisma.review.findMany({
      where: publishedOnly ? { isApproved: true } : {},
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByService(serviceId: string, publishedOnly = true) {
    return this.prisma.review.findMany({
      where: {
        booking: {
          serviceId,
        },
        ...(publishedOnly && { isApproved: true }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    await this.findOne(id); // Check if review exists

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async approve(id: string) {
    return this.update(id, { isApproved: true });
  }

  async unpublish(id: string) {
    return this.update(id, { isApproved: false });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if review exists

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async updateByUser(
    userId: string,
    reviewId: string,
    updateData: { comment?: string },
  ) {
    const review = await this.findOne(reviewId);

    if (review.userId !== userId) {
      throw new ForbiddenException('Tu ne peux modifier que tes propres avis');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { comment: updateData.comment },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async removeByUser(userId: string, reviewId: string) {
    const review = await this.findOne(reviewId);

    if (review.userId !== userId) {
      throw new ForbiddenException('Tu ne peux supprimer que tes propres avis');
    }

    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async getUserCompletedBookingsForService(userId: string, serviceId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
        serviceId,
        status: BookingStatus.COMPLETED,
      },
      include: {
        service: true,
        reviews: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
