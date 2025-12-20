/**
 * Service Stripe
 *
 * Ce service gère toutes les interactions avec l'API Stripe :
 * - Création de sessions Checkout pour l'acompte
 * - Vérification des paiements
 * - Gestion des webhooks
 *
 * IMPORTANT : Ne jamais exposer les clés secrètes côté client !
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private prisma: PrismaService) {
    // Initialisation du client Stripe avec la clé secrète
    // La clé est stockée dans les variables d'environnement pour la sécurité
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    });
  }

  // ========================================
  // STRIPE CONNECT - Gestion du compte masseuse
  // ========================================

  /**
   * Récupère le compte Stripe Connect de l'ADMIN (masseuse)
   * @returns L'ID du compte Stripe Connect ou null
   */
  private async getStripeConnectAccountId(): Promise<string | null> {
    const admin = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
      select: { stripeAccountId: true },
    });
    return admin?.stripeAccountId || null;
  }

  /**
   * Récupère le compte Stripe Connect ou lève une erreur si non configuré
   * @throws BadRequestException si le compte Stripe n'est pas configuré
   */
  private async requireStripeConnectAccount(): Promise<string> {
    const accountId = await this.getStripeConnectAccountId();
    if (!accountId) {
      throw new BadRequestException(
        'Le compte Stripe de la masseuse n\'est pas encore configuré. Veuillez contacter l\'administrateur.',
      );
    }
    return accountId;
  }

  /**
   * Crée un compte Stripe Connect Standard pour la masseuse (ADMIN)
   * @param userId - ID de l'utilisateur ADMIN
   * @returns L'ID du compte Stripe créé
   */
  async createStripeConnectAccount(userId: string): Promise<{ accountId: string }> {
    // Vérifier que l'utilisateur est bien ADMIN
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul l\'administrateur peut configurer le compte Stripe');
    }

    // Vérifier si un compte existe déjà
    if (user.stripeAccountId) {
      return { accountId: user.stripeAccountId };
    }

    // Créer le compte Stripe Connect Standard
    const account = await this.stripe.accounts.create({
      type: 'standard',
      country: 'FR',
      email: user.email,
      metadata: {
        userId: user.id,
        platform: 'masseuse-app',
      },
    });

    // Sauvegarder l'ID du compte dans la base de données
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: account.id },
    });

    this.logger.log(`Compte Stripe Connect créé pour l'admin ${userId}: ${account.id}`);

    return { accountId: account.id };
  }

  /**
   * Génère un lien d'onboarding Stripe pour la masseuse
   * @param userId - ID de l'utilisateur ADMIN
   * @returns L'URL d'onboarding Stripe
   */
  async createOnboardingLink(userId: string): Promise<{ url: string }> {
    // Vérifier que l'utilisateur est bien ADMIN
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul l\'administrateur peut configurer le compte Stripe');
    }

    // Si pas de compte Stripe, le créer d'abord
    let accountId = user.stripeAccountId;
    if (!accountId) {
      const result = await this.createStripeConnectAccount(userId);
      accountId = result.accountId;
    }

    // Déterminer l'URL du frontend
    const frontendUrl =
      process.env.FRONTEND_URL?.split(',')[0]?.trim() ||
      'http://localhost:3000';

    // Créer le lien d'onboarding
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${frontendUrl}/admin/stripe/refresh`,
      return_url: `${frontendUrl}/admin/stripe/success`,
    });

    this.logger.log(`Lien d'onboarding Stripe généré pour l'admin ${userId}`);

    return { url: accountLink.url };
  }

  /**
   * Vérifie le statut du compte Stripe Connect
   * @param userId - ID de l'utilisateur ADMIN
   * @returns Le statut du compte (configured, pending, not_created)
   */
  async getStripeAccountStatus(userId: string): Promise<{
    status: 'configured' | 'pending' | 'not_created';
    accountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    detailsSubmitted?: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (!user.stripeAccountId) {
      return { status: 'not_created' };
    }

    try {
      const account = await this.stripe.accounts.retrieve(user.stripeAccountId);

      // Vérifier si le compte est entièrement configuré
      const isConfigured = 
        account.charges_enabled && 
        account.payouts_enabled && 
        account.details_submitted;

      return {
        status: isConfigured ? 'configured' : 'pending',
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du compte Stripe: ${error}`);
      return { status: 'not_created' };
    }
  }

  // ========================================
  // CHECKOUT SESSIONS - Paiement des acomptes
  // ========================================

  /**
   * Crée une session Stripe Checkout pour le paiement de l'acompte
   * AVANT la création de la réservation (réservation créée seulement après paiement)
   *
   * @param userId - ID de l'utilisateur
   * @param bookingData - Données de la réservation
   * @returns L'URL de redirection vers Stripe Checkout
   */
  async createCheckoutSessionForBooking(
    userId: string,
    bookingData: {
      serviceId: string;
      date: string;
      startTime: string;
      notes?: string;
    },
  ): Promise<{ url: string }> {
    // 1. Récupérer le service et l'utilisateur
    const [service, user] = await Promise.all([
      this.prisma.service.findUnique({
        where: { id: bookingData.serviceId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
      }),
    ]);

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // 2. Récupérer les paramètres du site pour le montant de l'acompte
    const settings = await this.prisma.siteSettings.findFirst();
    const depositAmount = settings?.depositAmount
      ? Number(settings.depositAmount)
      : 20;

    // 3. Déterminer l'URL du frontend (prendre la première si plusieurs sont configurées)
    const frontendUrl =
      process.env.FRONTEND_URL?.split(',')[0]?.trim() ||
      'http://localhost:3000';

    // 4. Calculer l'heure de fin pour les métadonnées
    const [startHour, startMinute] = bookingData.startTime
      .split(':')
      .map(Number);
    const endMinutes = startHour * 60 + startMinute + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // 5. Formater la date pour l'affichage
    const bookingDate = new Date(bookingData.date);
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 6. Récupérer le compte Stripe Connect de la masseuse (obligatoire)
    const stripeAccountId = await this.requireStripeConnectAccount();

    // 7. Créer la session Stripe Checkout sur le compte Connect
    const session = await this.stripe.checkout.sessions.create(
      {
        // Mode paiement unique (pas d'abonnement)
        mode: 'payment',

        // URLs de redirection après paiement
        success_url: `${frontendUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/reservation/cancel?service_id=${bookingData.serviceId}`,

        // Email du client pré-rempli
        customer_email: user.email,

        // Métadonnées pour créer la réservation dans le webhook
        metadata: {
          userId: user.id,
          serviceId: service.id,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: endTime,
          notes: bookingData.notes || '',
          depositAmount: depositAmount.toString(),
        },

        // Produit : l'acompte pour la réservation
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(depositAmount * 100), // Stripe utilise les centimes
              product_data: {
                name: `Acompte - ${service.name}`,
                description: `Réservation du ${formattedDate} à ${bookingData.startTime}`,
                // Image du service si disponible
                ...(service.imageUrl && {
                  images: [service.imageUrl],
                }),
              },
            },
            quantity: 1,
          },
        ],

        // Options de paiement
        payment_method_types: ['card'],

        // Expiration de la session (30 minutes)
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

        // Message personnalisé
        custom_text: {
          submit: {
            message: `Acompte non remboursable en cas d'annulation tardive (moins de ${settings?.cancellationDeadlineHours || 24}h avant le RDV).`,
          },
        },
      },
      // Utiliser le compte Stripe Connect de la masseuse
      { stripeAccount: stripeAccountId },
    );

    // this.logger.log(
    //   `Session Checkout créée pour ${user.email} - Service: ${service.name} - Session: ${session.id}`,
    // );

    // 8. Retourner l'URL de redirection
    return { url: session.url! };
  }

  /**
   * Crée une session Stripe Checkout pour le paiement de l'acompte
   * DEPRECATED - Utiliser createCheckoutSessionForBooking à la place
   *
   * @param bookingId - ID de la réservation
   * @param userId - ID de l'utilisateur (pour vérification de propriété)
   * @returns L'URL de redirection vers Stripe Checkout
   */
  async createCheckoutSession(
    bookingId: string,
    userId: string,
  ): Promise<{ url: string }> {
    // 1. Récupérer la réservation avec le service associé
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        user: true,
      },
    });

    // 2. Vérifications de sécurité
    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    // Vérifier que l'utilisateur est bien le propriétaire de la réservation
    if (booking.userId !== userId) {
      throw new BadRequestException(
        'Vous ne pouvez payer que vos propres réservations',
      );
    }

    // Vérifier que la réservation est en attente de paiement
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        "Cette réservation a déjà été payée ou n'est plus valide",
      );
    }

    // Vérifier qu'une session Stripe n'existe pas déjà
    if (booking.stripeSessionId) {
      // Vérifier si la session est encore valide
      try {
        const existingSession = await this.stripe.checkout.sessions.retrieve(
          booking.stripeSessionId,
        );
        if (existingSession.status === 'open') {
          // La session existe et est encore ouverte, retourner l'URL
          return { url: existingSession.url! };
        }
      } catch {
        // La session n'existe plus ou a expiré, on en crée une nouvelle
        this.logger.warn(
          `Session Stripe ${booking.stripeSessionId} expirée, création d'une nouvelle`,
        );
      }
    }

    // 3. Récupérer les paramètres du site pour le montant de l'acompte
    const settings = await this.prisma.siteSettings.findFirst();
    const depositAmount = settings?.depositAmount
      ? Number(settings.depositAmount)
      : 20;

    // 4. Déterminer l'URL du frontend (prendre la première si plusieurs sont configurées)
    const frontendUrl =
      process.env.FRONTEND_URL?.split(',')[0]?.trim() ||
      'http://localhost:3000';

    // 5. Formater la date pour l'affichage
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 6. Récupérer le compte Stripe Connect de la masseuse (obligatoire)
    const stripeAccountId = await this.requireStripeConnectAccount();

    // 7. Créer la session Stripe Checkout sur le compte Connect
    const session = await this.stripe.checkout.sessions.create(
      {
        // Mode paiement unique (pas d'abonnement)
        mode: 'payment',

        // URLs de redirection après paiement
        success_url: `${frontendUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
        cancel_url: `${frontendUrl}/reservation/cancel?booking_id=${bookingId}`,

        // Email du client pré-rempli
        customer_email: booking.user.email,

        // Métadonnées pour identifier la réservation dans le webhook
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
          serviceId: booking.serviceId,
        },

        // Produit : l'acompte pour la réservation
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(depositAmount * 100), // Stripe utilise les centimes
              product_data: {
                name: `Acompte - ${booking.service.name}`,
                description: `Réservation du ${formattedDate} à ${booking.startTime}`,
                // Image du service si disponible
                ...(booking.service.imageUrl && {
                  images: [booking.service.imageUrl],
                }),
              },
            },
            quantity: 1,
          },
        ],

        // Options de paiement
        payment_method_types: ['card'],

        // Expiration de la session (30 minutes)
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

        // Message personnalisé
        custom_text: {
          submit: {
            message: `Acompte non remboursable en cas d'annulation tardive (moins de ${settings?.cancellationDeadlineHours || 24}h avant le RDV).`,
          },
        },
      },
      // Utiliser le compte Stripe Connect de la masseuse
      { stripeAccount: stripeAccountId },
    );

    // 8. Mettre à jour la réservation avec l'ID de session Stripe
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripeSessionId: session.id,
        depositAmount: depositAmount,
      },
    });

    // this.logger.log(
    //   `Session Checkout créée pour la réservation ${bookingId}: ${session.id}`,
    // );

    // 9. Retourner l'URL de redirection
    return { url: session.url! };
  }

  /**
   * Vérifie la signature du webhook Stripe
   *
   * @param payload - Corps de la requête brut
   * @param signature - Signature Stripe-Signature header
   * @returns L'événement Stripe vérifié
   */
  constructEventFromWebhook(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error('Erreur de vérification du webhook Stripe:', err);
      throw new BadRequestException('Signature webhook invalide');
    }
  }

  /**
   * Gère l'événement de paiement réussi
   * Crée la réservation si elle n'existe pas encore (nouveau flow)
   * Ou met à jour une réservation existante (ancien flow)
   *
   * @param session - Session Checkout Stripe
   */
  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const bookingId = session.metadata?.bookingId;
    const userId = session.metadata?.userId;
    const serviceId = session.metadata?.serviceId;

    // Nouveau flow : créer la réservation après paiement
    if (!bookingId && userId && serviceId) {
      await this.createBookingFromPayment(session);
      return;
    }

    // Ancien flow : mettre à jour une réservation existante
    if (!bookingId) {
      this.logger.error('Webhook reçu sans bookingId dans les métadonnées');
      return;
    }

    // Vérifier que la réservation existe et n'est pas déjà payée
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      this.logger.error(`Réservation ${bookingId} introuvable`);
      return;
    }

    if (booking.isDepositPaid) {
      this.logger.warn(`Réservation ${bookingId} déjà marquée comme payée`);
      return;
    }

    // Mettre à jour la réservation
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.PENDING, // Passe en "En attente de confirmation"
        stripePaymentIntentId: session.payment_intent as string,
        isDepositPaid: true,
        depositPaidAt: new Date(),
      },
    });

    this.logger.log(`Paiement confirmé pour la réservation ${bookingId}`);
  }

  /**
   * Crée une réservation après paiement réussi
   * Utilisé dans le nouveau flow où la réservation est créée seulement après paiement
   * 
   * IDEMPOTENCE : Vérifie si une réservation existe déjà avec ce stripeSessionId
   *
   * @param session - Session Checkout Stripe
   */
  private async createBookingFromPayment(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const {
      userId,
      serviceId,
      date,
      startTime,
      endTime,
      notes,
      depositAmount,
    } = session.metadata!;

    try {
      // IDEMPOTENCE : Vérifier si une réservation existe déjà avec cette session
      const existingBooking = await this.prisma.booking.findFirst({
        where: {
          stripeSessionId: session.id,
        },
      });

      if (existingBooking) {
        this.logger.warn(
          `Webhook doublon détecté - Réservation ${existingBooking.id} existe déjà pour la session ${session.id}`,
        );
        return;
      }

      // Récupérer le prix du service
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        this.logger.error(
          `Service ${serviceId} introuvable lors de la création de réservation`,
        );
        return;
      }

      // Créer la réservation avec statut PENDING
      const booking = await this.prisma.booking.create({
        data: {
          userId,
          serviceId,
          date: new Date(date),
          startTime,
          endTime,
          notes: notes || null,
          status: BookingStatus.PENDING,
          priceAtBooking: service.price,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          depositAmount: depositAmount ? Number(depositAmount) : null,
          isDepositPaid: true,
          depositPaidAt: new Date(),
        },
      });

      this.logger.log(`Réservation créée après paiement réussi: ${booking.id}`);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la création de la réservation après paiement:',
        error,
      );
      throw error;
    }
  }

  /**
   * Gère l'événement d'expiration de session
   * La réservation reste en PENDING_PAYMENT jusqu'à expiration ou annulation
   *
   * @param session - Session Checkout Stripe expirée
   */
  handleSessionExpired(session: Stripe.Checkout.Session): void {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return;
    }

    // Optionnel : on peut supprimer la réservation ou la laisser expirer naturellement
    // Ici on la laisse en PENDING_PAYMENT, elle sera nettoyée par un job de maintenance
    this.logger.log(`Session expirée pour la réservation ${bookingId}`);
  }

  /**
   * Récupère les détails d'une session Stripe
   * Utile pour la page de succès
   *
   * @param sessionId - ID de la session Checkout
   * @returns Les détails de la session
   */
  async getSessionDetails(sessionId: string): Promise<Stripe.Checkout.Session> {
    const stripeAccountId = await this.getStripeConnectAccountId();
    
    // Si un compte Connect est configuré, utiliser ce compte
    if (stripeAccountId) {
      return this.stripe.checkout.sessions.retrieve(
        sessionId,
        { expand: ['payment_intent'] },
        { stripeAccount: stripeAccountId },
      );
    }
    
    // Fallback pour les anciennes sessions (avant Connect)
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
  }

  /**
   * Vérifie si un paiement est valide
   * Utilisé pour empêcher la manipulation côté client
   *
   * @param bookingId - ID de la réservation
   * @param sessionId - ID de la session Stripe
   * @returns true si le paiement est valide
   */
  async verifyPayment(bookingId: string, sessionId: string): Promise<boolean> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.stripeSessionId !== sessionId) {
      return false;
    }

    // Vérifier auprès de Stripe (avec le compte Connect si configuré)
    const stripeAccountId = await this.getStripeConnectAccountId();
    
    let session: Stripe.Checkout.Session;
    if (stripeAccountId) {
      session = await this.stripe.checkout.sessions.retrieve(
        sessionId,
        {},
        { stripeAccount: stripeAccountId },
      );
    } else {
      session = await this.stripe.checkout.sessions.retrieve(sessionId);
    }
    
    return session.payment_status === 'paid';
  }

  /**
   * Vérifie si une réservation peut être remboursée selon le délai configuré
   * 
   * @param bookingId - ID de la réservation
   * @returns { canRefund: boolean, reason?: string, hoursUntilBooking?: number }
   */
  async canRefundBooking(bookingId: string): Promise<{
    canRefund: boolean;
    reason?: string;
    hoursUntilBooking?: number;
  }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { canRefund: false, reason: 'Réservation introuvable' };
    }

    if (!booking.isDepositPaid || !booking.stripePaymentIntentId) {
      return { canRefund: false, reason: 'Aucun paiement à rembourser' };
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return { canRefund: false, reason: 'Réservation déjà annulée' };
    }

    // Récupérer les paramètres du site pour le délai d'annulation
    const settings = await this.prisma.siteSettings.findFirst();
    const cancellationDeadlineHours = settings?.cancellationDeadlineHours || 24;

    // Calculer le temps restant avant le rendez-vous
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < cancellationDeadlineHours) {
      return {
        canRefund: false,
        reason: `Annulation impossible moins de ${cancellationDeadlineHours}h avant le rendez-vous. L'acompte ne sera pas remboursé.`,
        hoursUntilBooking: Math.max(0, hoursUntilBooking),
      };
    }

    return { canRefund: true, hoursUntilBooking };
  }

  /**
   * Effectue un remboursement Stripe pour une réservation
   * 
   * @param bookingId - ID de la réservation à rembourser
   * @param reason - Raison du remboursement (optionnel)
   * @returns Les détails du remboursement
   */
  async refundBooking(
    bookingId: string,
    reason?: string,
  ): Promise<{
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
  }> {
    // Vérifier si le remboursement est possible
    const canRefundResult = await this.canRefundBooking(bookingId);
    
    if (!canRefundResult.canRefund) {
      return {
        success: false,
        error: canRefundResult.reason,
      };
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || !booking.stripePaymentIntentId) {
      return {
        success: false,
        error: 'Paiement Stripe introuvable',
      };
    }

    try {
      // Récupérer le compte Stripe Connect si configuré
      const stripeAccountId = await this.getStripeConnectAccountId();

      // Créer le remboursement via Stripe (sur le compte Connect si configuré)
      const refund = stripeAccountId
        ? await this.stripe.refunds.create(
            {
              payment_intent: booking.stripePaymentIntentId,
              reason: 'requested_by_customer',
              metadata: {
                bookingId: booking.id,
                reason: reason || 'Annulation client',
              },
            },
            { stripeAccount: stripeAccountId },
          )
        : await this.stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking.id,
              reason: reason || 'Annulation client',
            },
          });

      // Mettre à jour la réservation
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason || 'Annulation avec remboursement',
          // On pourrait ajouter un champ stripeRefundId si nécessaire
        },
      });

      this.logger.log(
        `Remboursement effectué pour la réservation ${bookingId}: ${refund.id} - ${refund.amount / 100}€`,
      );

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100, // Convertir en euros
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors du remboursement de la réservation ${bookingId}:`,
        error,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du remboursement',
      };
    }
  }
}
