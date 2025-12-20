/**
 * Module Stripe
 *
 * Ce module gère l'intégration avec Stripe pour les paiements d'acompte.
 * Il expose les endpoints pour créer des sessions de paiement et recevoir les webhooks.
 */

import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
