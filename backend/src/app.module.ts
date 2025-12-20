import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
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
import { ConflictsModule } from './conflicts/conflicts.module';
import { StripeModule } from './stripe/stripe.module';
import { EmailModule } from './email/email.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting global
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000, // 1 seconde
      limit: 3, // 3 requêtes par seconde
    }, {
      name: 'medium',
      ttl: 10000, // 10 secondes
      limit: 20, // 20 requêtes par 10 secondes
    }, {
      name: 'long',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requêtes par minute
    }]),
    // Cache global
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 secondes par défaut
      max: 100, // Maximum 100 items en cache
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
    ConflictsModule,
    StripeModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Activer le throttling global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Filtre d'exception global
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
