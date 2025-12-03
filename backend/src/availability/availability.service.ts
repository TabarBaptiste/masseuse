import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async create(createAvailabilityDto: CreateAvailabilityDto) {
    // Check for conflicts
    const existing = await this.prisma.weeklyAvailability.findUnique({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek: createAvailabilityDto.dayOfWeek,
          startTime: createAvailabilityDto.startTime,
          endTime: createAvailabilityDto.endTime,
        },
      },
    });

    if (existing) {
      throw new ConflictException('This availability slot already exists');
    }

    return this.prisma.weeklyAvailability.create({
      data: createAvailabilityDto,
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.weeklyAvailability.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const availability = await this.prisma.weeklyAvailability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    return availability;
  }

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto) {
    await this.findOne(id); // Check if availability exists

    return this.prisma.weeklyAvailability.update({
      where: { id },
      data: updateAvailabilityDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if availability exists
    
    return this.prisma.weeklyAvailability.delete({
      where: { id },
    });
  }
}
