'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SiteSettings } from '@/types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>({
    id: '',
    salonName: "Aly Dous'heure",
    salonDescription: "Votre havre de paix et de relaxation.",
    salonAddress: "Le Robert, Martinique",
    salonPhone: "+596 596 XX XX XX",
    salonEmail: "",
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
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/site-settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres du site:', error);
        // Garder les valeurs par défaut en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  if (!settings) {
    return null; // Cas improbable puisque settings est initialisé
  }

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{settings.salonName}</h3>
            <p className="text-gray-400 text-sm">
              {settings.salonDescription}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">
              {settings.salonAddress?.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < settings.salonAddress!.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
              {settings.salonPhone && (
                <>
                  <br />
                  Tél: {settings.salonPhone}
                </>
              )}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Horaires</h3>
            <p className="text-gray-400 text-sm">
              Lundi - Samedi<br />
              {settings.defaultOpenTime} - {settings.defaultCloseTime}
            </p>
            </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <a href="/mentions-legales" className="hover:text-white transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/politique-confidentialite" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/conditions-generales" className="hover:text-white transition-colors">
                  Conditions générales
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {currentYear} {settings.salonName}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
