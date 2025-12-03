import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  create(@Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilityService.create(createAvailabilityDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.availabilityService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availabilityService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.availabilityService.update(id, updateAvailabilityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }
}
