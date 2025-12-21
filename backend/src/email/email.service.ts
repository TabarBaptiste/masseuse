import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { SiteSettingsService } from '../site-settings/site-settings.service';

/**
 * Échappe les caractères HTML pour prévenir les attaques XSS
 * @param str - La chaîne à échapper
 * @returns La chaîne échappée
 */
function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

@Injectable()
export class EmailService {
    private resend: Resend;
    private fromEmail: string;

    constructor(
        private siteSettingsService: SiteSettingsService,
    ) {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@alydousheure.fr';
    }

    async sendContactEmail(data: {
        name: string;
        email: string;
        phone?: string;
        message: string;
    }) {
        try {
            const safeName = escapeHtml(data.name);
            const safeEmail = escapeHtml(data.email);
            const safePhone = escapeHtml(data.phone);
            const safeMessage = escapeHtml(data.message);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: process.env.CONTACT_EMAIL || '',
                subject: `Message de ${safeName}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #92400e;">Nouveau message</h2>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Nom:</strong> ${safeName}</p>
              <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
              ${safePhone ? `<p><strong>Téléphone:</strong> ${safePhone}</p>` : ''}
            </div>
            <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px;">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${safeMessage}</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              Ce message a été envoyé depuis le formulaire de contact du site Aly Dous'heure.
            </p>
          </div>
        `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw error;
        }
    }

    // async sendBookingConfirmation(to: string, bookingDetails: any) {
    //     try {
    //         const result = await this.resend.emails.send({
    //             from: this.fromEmail,
    //             to,
    //             subject: 'Confirmation de votre réservation - Aly Dous\'heure',
    //             html: `
    //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    //         <h2 style="color: #92400e;">Confirmation de réservation</h2>
    //         <p>Bonjour,</p>
    //         <p>Votre réservation a bien été enregistrée.</p>
    //         <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //             <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
    //             <p><strong>Date:</strong> ${bookingDetails.date}</p>
    //             <p><strong>Heure:</strong> ${bookingDetails.time}</p>
    //             <p><strong>Durée:</strong> ${bookingDetails.duration} minutes</p>
    //         </div>
    //         <p>Nous avons hâte de vous accueillir!</p>
    //         <p style="margin-top: 30px;">Cordialement,<br>L'équipe Aly Dous'heure</p>
    //         </div>
    //     `,
    //         });

    //         return result;
    //     } catch (error) {
    //         console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    //         throw error;
    //     }
    // }

    // TODO : Ajouter un rappel "SiteSettings.cancellationDeadlineHours"heure avant le rendez-vous
    async sendBookingReminder(to: string, bookingDetails: any) {
        try {
            const settings = await this.siteSettingsService.get();
            const safeServiceName = escapeHtml(bookingDetails.serviceName);
            const safeDate = escapeHtml(bookingDetails.date);
            const safeTime = escapeHtml(bookingDetails.time);
            const safeAddress = escapeHtml(settings.salonAddress);
            const safePhone = escapeHtml(settings.salonPhone);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject: 'Rappel de votre rendez-vous - Aly Dous\'heure',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #92400e;">Rappel de votre rendez-vous</h2>
            <p>Bonjour,</p>
            <p>Nous vous rappelons votre rendez-vous prévu demain:</p>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${safeServiceName}</p>
              <p><strong>Date:</strong> ${safeDate}</p>
              <p><strong>Heure:</strong> ${safeTime}</p>
            </div>
            <p>À très bientôt!</p>
            ${safeAddress || safePhone ? `
            <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #44403c;">Informations de contact</h3>
              ${safeAddress ? `<p><strong>Adresse:</strong> ${safeAddress}</p>` : ''}
              ${safePhone ? `<p><strong>Téléphone:</strong> <a href="tel:${safePhone}">${safePhone}</a></p>` : ''}
            </div>
            ` : ''}
            <p style="margin-top: 30px;">Cordialement,<br>L'équipe Aly Dous'heure</p>
          </div>
        `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du rappel:', error);
            throw error;
        }
    }

    // ========================================
    // EMAILS À L'ADMINISTRATEUR
    // ========================================

    async notifyAdminNewBooking(bookingDetails: {
        clientName: string;
        clientEmail: string;
        clientPhone?: string;
        serviceName: string;
        date: string;
        time: string;
        duration: number;
        price: number;
        notes?: string;
    }) {
        try {
            const safeClientName = escapeHtml(bookingDetails.clientName);
            const safeClientEmail = escapeHtml(bookingDetails.clientEmail);
            const safeClientPhone = escapeHtml(bookingDetails.clientPhone);
            const safeServiceName = escapeHtml(bookingDetails.serviceName);
            const safeDate = escapeHtml(bookingDetails.date);
            const safeTime = escapeHtml(bookingDetails.time);
            const safeNotes = escapeHtml(bookingDetails.notes);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: process.env.CONTACT_EMAIL || '',
                subject: `🎉 Nouvelle réservation - ${safeServiceName}`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #92400e;">🎉 Nouvelle réservation</h2>
                    <p>Vous avez reçu une nouvelle réservation !</p>
                    
                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #92400e;">Détails de la réservation</h3>
                        <p><strong>Service:</strong> ${safeServiceName}</p>
                        <p><strong>Date:</strong> ${safeDate}</p>
                        <p><strong>Heure:</strong> ${safeTime}</p>
                        <p><strong>Durée:</strong> ${bookingDetails.duration} minutes</p>
                        <p><strong>Prix:</strong> ${bookingDetails.price}€</p>
                    </div>

                    <div style="background-color: #e7e5e4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #44403c;">Informations client</h3>
                        <p><strong>Nom:</strong> ${safeClientName}</p>
                        <p><strong>Email:</strong> <a href="mailto:${safeClientEmail}">${safeClientEmail}</a></p>
                        ${safeClientPhone ? `<p><strong>Téléphone:</strong> <a href="tel:${safeClientPhone}">${safeClientPhone}</a></p>` : ''}
                    </div>

                    ${safeNotes ? `
                    <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Notes du client:</h3>
                        <p style="white-space: pre-wrap;">${safeNotes}</p>
                    </div>
                    ` : ''}
                    <div style="margin-top: 30px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
                        <p style="margin: 0; color: #1e40af;">
                            <strong>💡 Rappel:</strong> Le client a payé un acompte de 20€. Le solde de ${bookingDetails.price - 20}€ est à régler sur place.
                        </p>
                    </div>
                </div>
                `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification admin (nouvelle réservation):', error);
            throw error;
        }
    }

    async notifyAdminBookingCancelled(bookingDetails: {
        clientName: string;
        clientEmail: string;
        serviceName: string;
        date: string;
        time: string;
        cancelReason?: string;
    }) {
        try {
            const safeClientName = escapeHtml(bookingDetails.clientName);
            const safeClientEmail = escapeHtml(bookingDetails.clientEmail);
            const safeServiceName = escapeHtml(bookingDetails.serviceName);
            const safeDate = escapeHtml(bookingDetails.date);
            const safeTime = escapeHtml(bookingDetails.time);
            const safeCancelReason = escapeHtml(bookingDetails.cancelReason);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: process.env.CONTACT_EMAIL || '',
                subject: `❌ Annulation de réservation - ${safeServiceName}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">❌ Réservation annulée</h2>
            <p>Une réservation a été annulée.</p>
            
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #991b1b;">Détails de la réservation annulée</h3>
              <p><strong>Service:</strong> ${safeServiceName}</p>
              <p><strong>Date:</strong> ${safeDate}</p>
              <p><strong>Heure:</strong> ${safeTime}</p>
            </div>

            <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #44403c;">Client</h3>
              <p><strong>Nom:</strong> ${safeClientName}</p>
              <p><strong>Email:</strong> <a href="mailto:${safeClientEmail}">${safeClientEmail}</a></p>
            </div>

            ${safeCancelReason ? `
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Raison de l'annulation:</h3>
              <p style="white-space: pre-wrap;">${safeCancelReason}</p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>ℹ️ Info:</strong> Le créneau est maintenant disponible pour d'autres réservations.
              </p>
            </div>
          </div>
        `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification admin (annulation):', error);
            throw error;
        }
    }

    async sendBookingConfirmationToClient(to: string, bookingDetails: {
        clientName: string;
        serviceName: string;
        date: string;
        time: string;
        duration: number;
        price: number;
    }) {
        try {
            const settings = await this.siteSettingsService.get();
            const safeClientName = escapeHtml(bookingDetails.clientName);
            const safeServiceName = escapeHtml(bookingDetails.serviceName);
            const safeDate = escapeHtml(bookingDetails.date);
            const safeTime = escapeHtml(bookingDetails.time);
            const safeAddress = escapeHtml(settings.salonAddress);
            const safePhone = escapeHtml(settings.salonPhone);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject: 'Votre réservation est confirmée - Aly Dous\'heure',
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #92400e;">🎉 Votre réservation est confirmée !</h2>
          <p>Bonjour ${safeClientName},</p>
          <p>Votre réservation a été confirmée par notre équipe. Nous avons hâte de vous accueillir !</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Détails de votre rendez-vous</h3>
            <p><strong>Service:</strong> ${safeServiceName}</p>
            <p><strong>Date:</strong> ${safeDate}</p>
            <p><strong>Heure:</strong> ${safeTime}</p>
            <p><strong>Durée:</strong> ${bookingDetails.duration} minutes</p>
            <p><strong>Prix total:</strong> ${bookingDetails.price}€</p>
          </div>

          <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>💡 Rappel:</strong> Vous avez payé un acompte de 20€ lors de votre réservation. Le solde restant de ${bookingDetails.price - 20}€ est à régler sur place.
            </p>
          </div>

          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          ${safeAddress || safePhone ? `
          <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #44403c;">Informations de contact</h3>
            ${safeAddress ? `<p><strong>Adresse:</strong> ${safeAddress}</p>` : ''}
            ${safePhone ? `<p><strong>Téléphone:</strong> <a href="tel:${safePhone}">${safePhone}</a></p>` : ''}
          </div>
          ` : ''}
          <p style="margin-top: 30px;">À très bientôt !</p>
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Aly Dous'heure</p>
        </div>
      `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de confirmation au client:', error);
            throw error;
        }
    }

    // ========================================
    // EMAIL DE VÉRIFICATION
    // ========================================

    async sendEmailVerification(to: string, data: {
        firstName: string;
        verificationToken: string;
    }) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const verificationUrl = `${frontendUrl}/verify-email?token=${data.verificationToken}`;
            const safeFirstName = escapeHtml(data.firstName);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject: 'Confirmez votre adresse email - Aly Dous\'heure',
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #92400e;">Bienvenue chez Aly Dous'heure ! 🌿</h2>
          <p>Bonjour ${safeFirstName},</p>
          <p>Merci de vous être inscrit(e) ! Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #92400e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Confirmer mon email
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${verificationUrl}" style="color: #92400e;">${verificationUrl}</a>
          </p>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>💡 Bon à savoir :</strong> Tant que votre email n'est pas confirmé, vous pouvez le modifier depuis votre profil.
            </p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Si vous n'avez pas créé de compte sur Aly Dous'heure, vous pouvez ignorer cet email.
          </p>
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Aly Dous'heure</p>
        </div>
      `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
            throw error;
        }
    }

    // ========================================
    // EMAIL DE RÉINITIALISATION MOT DE PASSE
    // ========================================

    async sendPasswordResetEmail(to: string, data: {
        firstName: string;
        resetToken: string;
    }) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetUrl = `${frontendUrl}/reset-password?token=${data.resetToken}`;
            const safeFirstName = escapeHtml(data.firstName);

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject: 'Réinitialisation de votre mot de passe - Aly Dous\'heure',
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #92400e;">Réinitialisation de mot de passe 🔐</h2>
          <p>Bonjour ${safeFirstName},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #92400e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color: #92400e;">${resetUrl}</a>
          </p>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚠️ Important :</strong> Ce lien est valable pendant 1 heure uniquement.
            </p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe actuel reste inchangé.
          </p>
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe Aly Dous'heure</p>
        </div>
      `,
            });

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
            throw error;
        }
    }
}
