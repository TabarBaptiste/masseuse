import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ConflictsService, Conflict } from './conflicts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('conflicts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PRO, UserRole.ADMIN)
export class ConflictsController {
  constructor(private readonly conflictsService: ConflictsService) {}

  @Get()
  findAll(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string): Promise<{ total: number; conflicts: Conflict[] }> {
    return this.conflictsService.findAllConflicts(fromDate, toDate);
  }

  @Get('summary')
  getSummary() {
    return this.conflictsService.getConflictsSummary();
  }
}
