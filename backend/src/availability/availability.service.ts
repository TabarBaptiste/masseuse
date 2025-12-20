import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto';

const AVAILABILITY_CACHE_KEY = 'availability_list';
const WORKING_DAYS_CACHE_KEY = 'working_days';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AvailabilityService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async invalidateCache() {
    await this.cacheManager.del(AVAILABILITY_CACHE_KEY);
    await this.cacheManager.del(WORKING_DAYS_CACHE_KEY);
  }

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

    const availability = await this.prisma.weeklyAvailability.create({
      data: createAvailabilityDto,
    });

    await this.invalidateCache();
    return availability;
  }

  async findAll(includeInactive = false) {
    // Utiliser le cache pour les disponibilités actives
    if (!includeInactive) {
      const cached = await this.cacheManager.get(AVAILABILITY_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    const availabilities = await this.prisma.weeklyAvailability.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    if (!includeInactive) {
      await this.cacheManager.set(AVAILABILITY_CACHE_KEY, availabilities, CACHE_TTL);
    }

    return availabilities;
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

    const availability = await this.prisma.weeklyAvailability.update({
      where: { id },
      data: updateAvailabilityDto,
    });

    await this.invalidateCache();
    return availability;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if availability exists

    const availability = await this.prisma.weeklyAvailability.delete({
      where: { id },
    });

    await this.invalidateCache();
    return availability;
  }

  async getWorkingDays() {
    // Utiliser le cache
    const cached = await this.cacheManager.get(WORKING_DAYS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    try {
      const availabilities = await this.prisma.weeklyAvailability.findMany({
        where: { isActive: true },
        select: { dayOfWeek: true },
        distinct: ['dayOfWeek'],
      });

      const workingDays = availabilities.map((a) => a.dayOfWeek);

      await this.cacheManager.set(WORKING_DAYS_CACHE_KEY, workingDays, CACHE_TTL);

      return workingDays;
    } catch (error) {
      console.error('Error in getWorkingDays:', error);
      throw error;
    }
  }
}
