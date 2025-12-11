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
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
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

    // 6. Créer la session Stripe Checkout
    const session = await this.stripe.checkout.sessions.create({
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
    });

    this.logger.log(
      `Session Checkout créée pour ${user.email} - Service: ${service.name} - Session: ${session.id}`,
    );

    // 7. Retourner l'URL de redirection
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

    // 6. Créer la session Stripe Checkout
    const session = await this.stripe.checkout.sessions.create({
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
    });

    // 7. Mettre à jour la réservation avec l'ID de session Stripe
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripeSessionId: session.id,
        depositAmount: depositAmount,
      },
    });

    this.logger.log(
      `Session Checkout créée pour la réservation ${bookingId}: ${session.id}`,
    );

    // 8. Retourner l'URL de redirection
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

    // Vérifier auprès de Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === 'paid';
  }
}
