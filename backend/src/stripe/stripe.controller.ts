/**
 * Contrôleur Stripe
 *
 * Expose les endpoints pour le paiement :
 * - POST /stripe/create-checkout-session - Crée une session de paiement
 * - POST /stripe/webhook - Reçoit les événements Stripe
 * - GET /stripe/verify-payment - Vérifie un paiement
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Param,
  Query,
  UseGuards,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Crée une session Stripe Checkout pour payer l'acompte
   *
   * @param user - Utilisateur authentifié
   * @param body - Corps contenant l'ID de réservation
   * @returns L'URL de redirection vers Stripe Checkout
   *
   * @example
   * POST /stripe/create-checkout-session
   * { "bookingId": "uuid-de-la-reservation" }
   *
   * Réponse : { "url": "https://checkout.stripe.com/..." }
   */
  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @CurrentUser() user: any,
    @Body('bookingId') bookingId: string,
  ) {
    if (!bookingId) {
      throw new BadRequestException('bookingId est requis');
    }

    return this.stripeService.createCheckoutSession(bookingId, user.id);
  }

  /**
   * Webhook Stripe
   *
   * Reçoit les événements de Stripe (paiement réussi, session expirée, etc.)
   *
   * IMPORTANT :
   * - Ce endpoint ne doit PAS utiliser le JwtAuthGuard
   * - Il utilise la signature Stripe pour vérifier l'authenticité
   * - Le body doit être le raw body, pas du JSON parsé
   *
   * Événements gérés :
   * - checkout.session.completed : Paiement réussi
   * - checkout.session.expired : Session expirée
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // Vérifier que le raw body est disponible
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        'Raw body non disponible. Vérifiez la configuration du middleware.',
      );
    }

    // Vérifier la signature et récupérer l'événement
    const event = this.stripeService.constructEventFromWebhook(
      rawBody,
      signature,
    );

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.stripeService.handlePaymentSuccess(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        await this.stripeService.handleSessionExpired(session);
        break;
      }

      // Autres événements peuvent être ajoutés ici si nécessaire
      // case 'payment_intent.payment_failed':
      //   ...
      //   break;

      default:
        // Événement non géré, on log mais on ne fait rien
        console.log(`Événement Stripe non géré : ${event.type}`);
    }

    // Stripe attend une réponse 200 pour confirmer la réception
    return { received: true };
  }

  /**
   * Vérifie si un paiement est valide
   *
   * Utilisé par la page de succès pour confirmer le paiement
   * avant d'afficher le message de confirmation
   *
   * @param bookingId - ID de la réservation
   * @param sessionId - ID de la session Stripe
   * @returns { valid: boolean, booking?: ... }
   */
  @Get('verify-payment/:bookingId')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Param('bookingId') bookingId: string,
    @Query('session_id') sessionId: string,
    @CurrentUser() _user: unknown,
  ) {
    if (!sessionId) {
      throw new BadRequestException('session_id est requis');
    }

    const isValid = await this.stripeService.verifyPayment(
      bookingId,
      sessionId,
    );

    if (!isValid) {
      return { valid: false };
    }

    // Si le paiement est valide, retourner aussi les détails de la session
    const session = await this.stripeService.getSessionDetails(sessionId);

    return {
      valid: true,
      paymentStatus: session.payment_status,
      amountPaid: session.amount_total ? session.amount_total / 100 : null,
      customerEmail: session.customer_email,
    };
  }
}
