'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface SiteSettings {
    salonEmail?: string;
    salonPhone?: string;
    salonAddress?: string;
    defaultOpenTime?: string;
    defaultCloseTime?: string;
}

interface WeeklyAvailability {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

// Données par défaut au cas où l'API ne répond pas
const DEFAULT_SETTINGS: SiteSettings = {
    salonEmail: 'contact@alydousheure.fr',
    salonPhone: '0596 12 34 56',
    salonAddress: '21, Rue des goyaviers, Zac Moulin à vent\nLe Robert 97231\nMartinique',
    defaultOpenTime: '09:00',
    defaultCloseTime: '18:00',
};

export default function Contact() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [availabilities, setAvailabilities] = useState<WeeklyAvailability[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupération des paramètres du site
                const settingsResponse = await api.get('/site-settings');
                if (settingsResponse.data) {
                    setSettings({ ...DEFAULT_SETTINGS, ...settingsResponse.data });
                }

                // Récupération des disponibilités
                const availResponse = await api.get('/availability');
                if (availResponse.data) {
                    setAvailabilities(availResponse.data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                // On garde les données par défaut
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await api.post('/contact', formData);
            setSubmitStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <section id="contact" className="py-16 sm:py-20 md:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="text-amber-700 text-sm font-medium tracking-[0.3em] uppercase">
                        Restons en Contact
                    </span>
                    <h2 className="heading-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mt-4 mb-6">
                        Contactez-moi
                    </h2>
                    <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Une question ? Un besoin particulier ? Je suis à votre écoute pour vous offrir
                        la meilleure expérience de bien-être.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Informations de contact */}
                    <div className="space-y-6 sm:space-y-8">
                        <div className="bg-linear-to-br from-amber-50 to-stone-50 rounded-2xl p-6 sm:p-8 shadow-md">
                            <h3 className="heading-serif text-xl sm:text-2xl font-semibold text-stone-800 mb-6">
                                Mes coordonnées
                            </h3>

                            <div className="space-y-5 sm:space-y-6">
                                {/* Téléphone */}
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-amber-800" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-500 mb-1">Téléphone</p>
                                        <a
                                            href={`tel:${settings.salonPhone?.replace(/\s/g, '')}`}
                                            className="text-base sm:text-lg font-semibold text-stone-800 hover:text-amber-800 transition-colors wrap-break-word"
                                        >
                                            {settings.salonPhone}
                                        </a>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-amber-800" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-500 mb-1">Email</p>
                                        <a
                                            href={`mailto:${settings.salonEmail}`}
                                            className="text-base sm:text-lg font-semibold text-stone-800 hover:text-amber-800 transition-colors break-all"
                                        >
                                            {settings.salonEmail}
                                        </a>
                                    </div>
                                </div>

                                {/* Adresse */}
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-amber-800" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-500 mb-1">Adresse</p>
                                        <p className="text-base sm:text-lg font-semibold text-stone-800 wrap-break-word">
                                            {settings.salonAddress?.split('\n').map((line, index) => (
                                                <span key={index}>
                                                    {line}
                                                    {index < settings.salonAddress!.split('\n').length - 1 && <br />}
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Horaires d'ouverture */}
                        <div className="bg-linear-to-br from-stone-50 to-neutral-50 rounded-2xl p-6 sm:p-8 shadow-md">
                            <h3 className="heading-serif text-xl sm:text-2xl font-semibold text-stone-800 mb-4">
                                Horaires d'ouverture
                            </h3>
                            <div className="space-y-3 text-stone-600">
                                {availabilities.length > 0 ? (
                                    (() => {
                                        const dayTranslations: { [key: string]: string } = {
                                            MONDAY: 'Lundi',
                                            TUESDAY: 'Mardi',
                                            WEDNESDAY: 'Mercredi',
                                            THURSDAY: 'Jeudi',
                                            FRIDAY: 'Vendredi',
                                            SATURDAY: 'Samedi',
                                            SUNDAY: 'Dimanche'
                                        };
                                        
                                        const groupedDays: { [key: string]: string[] } = {};
                                        availabilities.forEach(avail => {
                                            const key = `${avail.startTime}-${avail.endTime}`;
                                            if (!groupedDays[key]) groupedDays[key] = [];
                                            groupedDays[key].push(dayTranslations[avail.dayOfWeek]);
                                        });

                                        return Object.entries(groupedDays).map(([timeRange, days], index) => {
                                            const [start, end] = timeRange.split('-');
                                            const daysText = days.length > 1 
                                                ? `${days[0]} - ${days[days.length - 1]}`
                                                : days[0];
                                            return (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="font-medium">{daysText}</span>
                                                    <span>{start} - {end}</span>
                                                </div>
                                            );
                                        });
                                    })()
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Lundi - Samedi</span>
                                        <span>{settings.defaultOpenTime} - {settings.defaultCloseTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de contact */}
                    <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 shadow-md">
                        <h3 className="heading-serif text-xl sm:text-2xl font-semibold text-stone-800 mb-6">
                            Envoyez-moi un message
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nom */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                                    Nom et prénom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                                    placeholder="NOM et Prénom"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                                    placeholder="votre@email.com"
                                />
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                                    placeholder="0596 12 34 56"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none resize-none"
                                    placeholder="Votre message..."
                                />
                            </div>

                            {/* Messages de statut */}
                            {submitStatus === 'success' && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                                    ✓ Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                                    ✗ Erreur lors de l'envoi. Veuillez réessayer ou me contacter directement.
                                </div>
                            )}

                            {/* Bouton d'envoi */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-amber-800 hover:bg-amber-900 text-white py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Envoyer le message
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
