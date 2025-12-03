import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './dto';

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    // Get the first (and should be only) site settings record
    let settings = await this.prisma.siteSettings.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: {
          salonName: 'Mon Salon de Massage',
          salonDescription: 'Bienvenue dans notre salon de massage professionnel.',
        },
      });
    }

    return settings;
  }

  async update(updateSiteSettingsDto: UpdateSiteSettingsDto) {
    const settings = await this.get();

    return this.prisma.siteSettings.update({
      where: { id: settings.id },
      data: updateSiteSettingsDto,
    });
  }
}
