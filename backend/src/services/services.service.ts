import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

const SERVICES_CACHE_KEY = 'services_list';
const SERVICE_CACHE_PREFIX = 'service_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: createServiceDto,
    });
    
    // Invalider le cache de la liste
    await this.cacheManager.del(SERVICES_CACHE_KEY);
    
    return service;
  }

  async findAll(includeInactive = false) {
    // Essayer de récupérer depuis le cache pour les services actifs
    if (!includeInactive) {
      const cached = await this.cacheManager.get(SERVICES_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    const services = await this.prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    // Mettre en cache uniquement les services actifs
    if (!includeInactive) {
      await this.cacheManager.set(SERVICES_CACHE_KEY, services, CACHE_TTL);
    }

    return services;
  }

  async findOne(id: string) {
    // Essayer de récupérer depuis le cache
    const cacheKey = `${SERVICE_CACHE_PREFIX}${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Mettre en cache
    await this.cacheManager.set(cacheKey, service, CACHE_TTL);

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Check if service exists

    const service = await this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });

    // Invalider les caches
    await this.cacheManager.del(SERVICES_CACHE_KEY);
    await this.cacheManager.del(`${SERVICE_CACHE_PREFIX}${id}`);

    return service;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if service exists

    const service = await this.prisma.service.delete({
      where: { id },
    });

    // Invalider les caches
    await this.cacheManager.del(SERVICES_CACHE_KEY);
    await this.cacheManager.del(`${SERVICE_CACHE_PREFIX}${id}`);

    return service;
  }
}
