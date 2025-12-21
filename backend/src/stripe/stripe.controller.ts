/**
 * Contrôleur Stripe
 *
 * Expose les endpoints pour le paiement :
 * - POST /stripe/create-checkout-session - Crée une session de paiement
 * - POST /stripe/webhook - Reçoit les événements Stripe
 * - GET /stripe/verify-payment - Vérifie un paiement
 * - POST /stripe/connect/create-account - Crée un compte Stripe Connect
 * - POST /stripe/connect/onboarding-link - Génère un lien d'onboarding
 * - GET /stripe/connect/status - Vérifie le statut du compte Stripe
 */

import * as common from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@common.Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // ========================================
  // STRIPE CONNECT - Configuration du compte masseuse
  // ========================================

  /**
   * Crée un compte Stripe Connect Standard pour la masseuse
   * Réservé à l'ADMIN uniquement
   */
  @common.Post('connect/create-account')
  @common.UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createConnectAccount(@CurrentUser() user: any) {
    return this.stripeService.createStripeConnectAccount(user.id);
  }

  /**
   * Génère un lien d'onboarding Stripe pour la masseuse
   * Ce lien permet de configurer le compte (IBAN, infos légales, etc.)
   * Réservé à l'ADMIN uniquement
   */
  @common.Post('connect/onboarding-link')
  @common.UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createOnboardingLink(@CurrentUser() user: any) {
    return this.stripeService.createOnboardingLink(user.id);
  }

  /**
   * Vérifie le statut du compte Stripe Connect
   * Réservé à l'ADMIN uniquement
   * 
   * @returns { status: 'configured' | 'pending' | 'not_created', ... }
   */
  @common.Get('connect/status')
  @common.UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getConnectStatus(@CurrentUser() user: any) {
    return this.stripeService.getStripeAccountStatus(user.id);
  }

  // ========================================
  // CHECKOUT SESSIONS - Paiement des acomptes
  // ========================================

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
  @common.Post('create-checkout-session')
  @common.UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @CurrentUser() user: any,
    @common.Body('bookingId') bookingId: string,
  ) {
    if (!bookingId) {
      throw new common.BadRequestException('bookingId est requis');
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
  @common.Post('webhook')
  async handleWebhook(
    @common.Req() req: common.RawBodyRequest<Request>,
    @common.Headers('stripe-signature') signature: string,
  ) {
    // Vérifier que le raw body est disponible
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new common.BadRequestException(
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
        this.stripeService.handleSessionExpired(session);
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
  @common.Get('verify-payment/:bookingId')
  @common.UseGuards(JwtAuthGuard)
  async verifyPayment(
    @common.Param('bookingId') bookingId: string,
    @common.Query('session_id') sessionId: string,
    @CurrentUser() _user: unknown,
  ) {
    if (!sessionId) {
      throw new common.BadRequestException('session_id est requis');
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
