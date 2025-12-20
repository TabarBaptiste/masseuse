import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Get()
  findAll(@Query('publishedOnly') publishedOnly?: string) {
    return this.reviewsService.findAll(publishedOnly !== 'false');
  }

  @Get('service/:serviceId')
  findByService(
    @Param('serviceId') serviceId: string,
    @Query('publishedOnly') publishedOnly?: string,
  ) {
    return this.reviewsService.findByService(
      serviceId,
      publishedOnly !== 'false',
    );
  }

  @Get('service/:serviceId/user-bookings')
  @UseGuards(JwtAuthGuard)
  getUserCompletedBookingsForService(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.reviewsService.getUserCompletedBookingsForService(
      user.id,
      serviceId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Patch(':id/user-update')
  @UseGuards(JwtAuthGuard)
  updateByUser(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateReviewDto: { comment?: string },
  ) {
    return this.reviewsService.updateByUser(user.id, id, updateReviewDto);
  }

  @Delete(':id/user-delete')
  @UseGuards(JwtAuthGuard)
  removeByUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reviewsService.removeByUser(user.id, id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRO, UserRole.ADMIN)
  unpublish(@Param('id') id: string) {
    return this.reviewsService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
