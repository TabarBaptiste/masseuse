import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { AvailabilityModule } from './availability/availability.module';
import { BlockedSlotsModule } from './blocked-slots/blocked-slots.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    AvailabilityModule,
    BlockedSlotsModule,
    BookingsModule,
    ReviewsModule,
    SiteSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
