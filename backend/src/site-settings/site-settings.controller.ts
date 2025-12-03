import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSiteSettingsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  get() {
    return this.siteSettingsService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Body() updateSiteSettingsDto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.update(updateSiteSettingsDto);
  }
}
