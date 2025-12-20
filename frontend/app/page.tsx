'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { MapEmbed } from '@/components/ui/MapEmbed';
import { FloatingFlowers } from '@/components/ui/FloatingFlowers';
import Contact from '@/components/contact/Contact';

export default function Home() {
  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-50 via-stone-100 to-neutral-100">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmNWY1ZjAiIG9wYWNpdHk9IjAuMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        {/* Fleurs flottantes */}
        <FloatingFlowers />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          <div className="space-y-8">
            <div className="inline-block animate-fade-in">
              <span className="text-amber-700 text-sm font-medium tracking-[0.3em] uppercase">Bien-être & Sérénité</span>
            </div>
            <h1 className="heading-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-stone-800 leading-tight animate-fade-in-up">
              Aly Dous'heure
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto font-light leading-relaxed px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Offrez-vous un moment de pure relaxation dans votre havre de paix.
              <br className="hidden md:block" />
              Des soins sur mesure pour votre bien-être absolu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/services" className="w-full sm:w-auto">
                <Button
                  variant="discover"
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg"
                >
                  Découvrir mes soins
                </Button>
              </Link>
              {/* <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-stone-800 hover:bg-stone-900 text-white border-2 border-stone-800 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Réserver maintenant
                </Button>
              </Link> */}
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64H1440V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" fill="#fdfcfb" />
          </svg>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="pt-24 pb-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-700 text-sm font-medium tracking-[0.3em] uppercase">Ma Philosophie</span>
            <h2 className="heading-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mt-4 mb-6">
              L'Art du Massage Authentique
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Nous croyons que chaque massage est une expérience unique,
              un voyage vers l'harmonie du corps et de l'esprit.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 pt-6 bg-linear-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-amber-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-linear-to-br from-amber-100 to-amber-50 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto shadow-md group-hover:shadow-xl transition-all duration-300">
                  <ShieldCheck className="w-12 h-12 text-amber-800" />
                </div>
              </div>
              <h3 className="heading-serif text-2xl font-semibold mb-3 text-stone-800">Expertise Certifiée</h3>
              <p className="text-stone-600 leading-relaxed">
                Thérapeute diplômée possèdant plus de 10 ans d'expérience dans l'art du massage thérapeutique.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-amber-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-linear-to-br from-amber-100 to-amber-50 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Heart className="w-12 h-12 text-amber-800" />
                </div>
              </div>
              <h3 className="heading-serif text-2xl font-semibold mb-3 text-stone-800">Soins Personnalisés</h3>
              <p className="text-stone-600 leading-relaxed">
                Chaque séance est adaptée à vos besoins spécifiques pour une expérience unique et sur mesure.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-amber-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-linear-to-br from-amber-100 to-amber-50 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="w-12 h-12 text-amber-800" />
                </div>
              </div>
              <h3 className="heading-serif text-2xl font-semibold mb-3 text-stone-800">Ambiance Zen</h3>
              <p className="text-stone-600 leading-relaxed">
                Un espace apaisant conçu pour vous transporter vers un état de relaxation profonde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-stone-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-400 text-sm font-medium tracking-[0.3em] uppercase">Mes Prestations</span>
            <h2 className="heading-serif text-4xl md:text-5xl font-bold mt-4 mb-6">
              Des Soins d'Exception
            </h2>
            <p className="text-xl text-stone-300 max-w-3xl mx-auto">
              Découvrez votre gamme de massages authentiques, du suédois traditionnel aux pierres chaudes
            </p>
          </div>
          <div className="text-center mt-12">
            <Link href="/services">
              <Button
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg"
              >
                Voir tous mes soins
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-linear-to-br from-amber-50 via-stone-50 to-neutral-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiM4YjczNTUiLz48L2c+PC9zdmc+')] "></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6">
            Offrez-vous un moment
            <br />
            <span className="text-amber-800">de pure détente</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-stone-600 mb-8 sm:mb-12 max-w-2xl mx-auto font-light px-4">
            Réservez dès maintenant votre séance et laissez mes mains expertes
            prendre soin de vous
          </p>
          <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center">
            <Link href="/services" className="w-full sm:w-auto max-w-sm">
              <Button
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg"
              >
                Réserver en ligne
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-stone-700 px-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm sm:text-base md:text-lg font-medium text-center">ou appelez moi au <strong className="block sm:inline">0596 12 34 56</strong></span>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="heading-serif text-2xl md:text-3xl font-semibold text-stone-800 mb-6 text-center">
              Me Trouver
            </h3>
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <MapEmbed width={800} height={400} />
            </div>
            <p className="text-center text-stone-600 mt-4 text-sm">
              21, Rue des goyaviers, Zac Moulin à vent, Le Robert 97231, Martinique
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
