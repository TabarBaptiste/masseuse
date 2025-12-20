'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SiteSettings } from '@/types';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default function MentionsLegales() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/site-settings');
                setSettings(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des paramètres du site:', error);
                // Valeurs par défaut en cas d'erreur
                setSettings({
                    id: '',
                    salonName: "Aly Dous'heure",
                    salonDescription: "Votre havre de paix et de relaxation.",
                    salonAddress: "Le Robert, Martinique",
                    salonPhone: "+596 596 XX XX XX",
                    salonEmail: "contact@alydousheure.fr",
                    logoUrl: "",
                    heroImageUrl: "",
                    defaultOpenTime: "09:00",
                    defaultCloseTime: "18:00",
                    bookingAdvanceMinDays: 1,
                    bookingAdvanceMaxDays: 30,
                    cancellationDeadlineHours: 24,
                    emailNotificationsEnabled: true,
                    reminderDaysBefore: 1,
                    facebookUrl: "",
                    instagramUrl: "",
                    createdAt: "",
                    updatedAt: "",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    if (loading || !settings) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Breadcrumb
                items={[
                    { label: 'Mentions Légales' }
                ]}
                className="mb-8"
            />
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4">
                    <h1 className="text-3xl font-bold">Mentions Légales</h1>
                    <p className="mt-2 text-blue-100">Informations légales et conditions d'utilisation</p>
                </div>

                <div className="px-6 py-8 space-y-8">
                    {/* Éditeur du site */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            1. Éditeur du site
                        </h2>
                        <div className="text-gray-700 space-y-2">
                            <p><strong>Nom de l'entreprise :</strong> {settings.salonName}</p>
                            <p><strong>Forme juridique :</strong> [À définir - EI, SARL, etc.]</p>
                            <p><strong>Adresse :</strong> {settings.salonAddress || 'Le Robert, Martinique'}</p>
                            <p><strong>Téléphone :</strong> {settings.salonPhone || '+596 596 XX XX XX'}</p>
                            <p><strong>Email :</strong> {settings.salonEmail || 'contact@alydousheure.fr'}</p>
                            <p><strong>SIRET :</strong> [Numéro SIRET à renseigner]</p>
                            <p><strong>Numéro TVA intracommunautaire :</strong> [Si applicable]</p>
                            <p><strong>Directeur de la publication :</strong> [Nom du responsable]</p>
                        </div>
                    </section>

                    {/* Hébergement */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            2. Hébergement
                        </h2>
                        <div className="text-gray-700 space-y-2">
                            <p><strong>Hébergeur :</strong> [Nom de l'hébergeur - ex: OVH, AWS, etc.]</p>
                            <p><strong>Adresse :</strong> [Adresse de l'hébergeur]</p>
                            <p><strong>Téléphone :</strong> [Téléphone de l'hébergeur]</p>
                        </div>
                    </section>

                    {/* Propriété intellectuelle */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            3. Propriété intellectuelle
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>
                                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                            </p>
                            <p>
                                La reproduction de tout ou partie de ce site sur un support électronique ou autre, la mise à disposition du public de ce site ou de tout ou partie de son contenu,
                                sous quelque forme que ce soit, est formellement interdite sauf autorisation expresse et préalable de l'éditeur.
                            </p>
                            <p>
                                Les marques, logos, signes et tout autre contenu de ce site sont la propriété exclusive de l'entreprise et sont protégés par le droit des marques.
                            </p>
                        </div>
                    </section>

                    {/* Données personnelles */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            4. Protection des données personnelles
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>
                                Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD),
                                vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
                            </p>
                            <p>
                                Pour exercer ces droits, vous pouvez nous contacter à l'adresse email : {settings.salonEmail || 'contact@alydousheure.fr'}
                            </p>
                            <p>
                                Les données collectées via ce site sont utilisées uniquement pour le traitement de vos demandes de réservation et de contact.
                                Elles ne sont pas transmises à des tiers sans votre consentement préalable.
                            </p>
                            <p>
                                <strong>Données collectées :</strong>
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Nom et prénom</li>
                                <li>Adresse email</li>
                                <li>Numéro de téléphone</li>
                                <li>Informations de réservation (date, heure, service)</li>
                                <li>Données de navigation (cookies)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            5. Cookies
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>
                                Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
                            </p>
                            <p>
                                <strong>Types de cookies utilisés :</strong>
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li><strong>Cookies techniques :</strong> Nécessaires au fonctionnement du site</li>
                                <li><strong>Cookies analytiques :</strong> Pour mesurer l'audience (Google Analytics)</li>
                                <li><strong>Cookies de session :</strong> Pour la gestion de votre panier et réservations</li>
                            </ul>
                            <p>
                                Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur.
                            </p>
                        </div>
                    </section>

                    {/* Conditions d'utilisation */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            6. Conditions d'utilisation
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>
                                L'utilisation de ce site implique l'acceptation pleine et entière des conditions générales d'utilisation décrites ci-après.
                            </p>

                            <h3 className="text-lg font-semibold mt-4">Accès au site</h3>
                            <p>
                                L'accès au site est gratuit et ouvert à tous. Cependant, certaines fonctionnalités peuvent nécessiter une inscription préalable.
                            </p>

                            <h3 className="text-lg font-semibold mt-4">Réservations</h3>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Les réservations sont confirmées uniquement après paiement de l'acompte</li>
                                <li>L'acompte n'est pas remboursable en cas d'annulation tardive (moins de {settings.cancellationDeadlineHours}h avant le RDV)</li>
                                <li>Les tarifs sont susceptibles de modification sans préavis</li>
                                <li>Le client s'engage à fournir des informations exactes lors de la réservation</li>
                            </ul>

                            <h3 className="text-lg font-semibold mt-4">Responsabilités</h3>
                            <p>
                                L'entreprise Aly Dous'heure s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations diffusées sur ce site.
                                Cependant, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
                            </p>
                        </div>
                    </section>

                    {/* Conditions de vente */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            7. Conditions de vente
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <h3 className="text-lg font-semibold mt-4">Prix</h3>
                            <p>
                                Les prix affichés sur le site sont en euros (€) TTC. Ils sont susceptibles de modification sans préavis.
                            </p>

                            <h3 className="text-lg font-semibold mt-4">Paiement</h3>
                            <p>
                                Le paiement s'effectue en ligne via Stripe. Un acompte de 30% du montant total est demandé lors de la réservation.
                                Le solde est payable sur place le jour du rendez-vous.
                            </p>

                            <h3 className="text-lg font-semibold mt-4">Annulation et remboursement</h3>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Annulation gratuite jusqu'à 24h avant le rendez-vous</li>
                                <li>Annulation tardive : acompte conservé</li>
                                <li>No-show : acompte conservé</li>
                                <li>Remboursement possible en cas d'annulation de notre part</li>
                            </ul>
                        </div>
                    </section>

                    {/* Droit applicable */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            8. Droit applicable et juridiction
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p>
                                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
                            </p>
                            <p>
                                Conformément à l'article 14 du Règlement (UE) n°524/2013, la Commission Européenne met à disposition des consommateurs une plateforme de résolution des litiges en ligne :
                                <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                    https://ec.europa.eu/consumers/odr/
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                            9. Contact
                        </h2>
                        <div className="text-gray-700 space-y-2">
                            <p>
                                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
                            </p>
                            <p><strong>Email :</strong> {settings.salonEmail || 'contact@alydousheure.fr'}</p>
                            <p><strong>Téléphone :</strong> {settings.salonPhone || '+596 596 XX XX XX'}</p>
                            <p><strong>Adresse :</strong> {settings.salonAddress || 'Le Robert, Martinique'}</p>
                        </div>
                    </section>

                    {/* Mise à jour */}
                    <section className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-600">
                            <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}