import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Aly Dous'heure</h3>
            <p className="text-gray-400 text-sm">
              Votre havre de paix et de relaxation.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">
              123 Rue de la Paix<br />
              75001 Paris<br />
              Tél: +33 1 23 45 67 89
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Horaires</h3>
            <p className="text-gray-400 text-sm">
              Lundi - Samedi<br />
              9h00 - 18h00
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {currentYear} Aly Dous'heure. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
