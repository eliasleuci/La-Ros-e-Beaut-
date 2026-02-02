"use client";

import { BookingWizard } from "@/components/booking/BookingWizard";
import { FAQSection } from "@/components/public/FAQSection";
import { GallerySection } from "@/components/public/GallerySection";
import { TeamSection } from "@/components/public/TeamSection";
import { ReviewsSection } from '@/components/public/ReviewsSection';
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen md:flex">

      {/* LEFT COLUMN: Hero Image (Desktop Fixed, Mobile Top) */}
      <div className="w-full md:w-1/2 lg:w-5/12 md:h-screen md:fixed left-0 top-0 bg-[#F1EFEC] flex flex-col justify-center items-center p-8 md:p-12 z-10 relative overflow-hidden transition-colors duration-700 shadow-sm">
        {/* Background Watermark - Photographic Cinematic Style */}
        <div className="absolute inset-0">
          <img
            src="/branding/marble-bg.png"
            alt="Marble Background"
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay for text readability if needed */}
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
        </div>

        <div className="absolute top-8 right-8 z-20 md:fixed md:top-8 md:right-auto md:left-8">
          <LanguageSwitcher />
        </div>

        <div className="relative z-10 text-center space-y-2 max-w-lg mt-0 md:-mt-32 animate-in fade-in duration-1000 slide-in-from-bottom-4">

          {/* Main Logo Text - CSS Gold Gradient */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-widest leading-tight">
            <span className="bg-gradient-to-r from-[#BF953F] via-[#D4AF37] to-[#8A6E2F] bg-clip-text text-transparent drop-shadow-sm filter">
              BEAUTY ROOM
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            <p className="text-xl md:text-2xl font-serif tracking-[0.2em] text-[#5e5e5e] uppercase">
              BY SHAY
            </p>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          </div>

          <p className="text-stone-500 font-bold text-[10px] tracking-[0.4em] uppercase pt-8">
            {t('common.estetica_bienestar')}
          </p>
          <div className="pt-4 text-[9px] font-bold tracking-[0.6em] text-stone-400 uppercase">
            {t('common.cordoba')} • {t('common.argentina')}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Scrollable Content */}
      <div className="w-full md:w-1/2 lg:w-7/12 md:ml-auto bg-white min-h-screen">
        <div className="px-6 py-12 md:p-20 max-w-3xl mx-auto space-y-20">

          {/* Booking Section */}
          <section id="book">
            <h2 className="text-sm font-bold tracking-widest md:tracking-[0.2em] text-stone-400 uppercase mb-8 text-center md:text-left">{t('common.booking')}</h2>
            <BookingWizard />
          </section>

          {/* Team */}
          <TeamSection />

          {/* Gallery */}
          <GallerySection />

          {/* Reviews */}
          <ReviewsSection />

          {/* FAQs */}
          <FAQSection />

          <footer className="text-center text-xs text-stone-300 py-12 uppercase tracking-widest border-t border-stone-200">
            <div>Beauty Room BY SHAY © {new Date().getFullYear()}</div>
            <div className="mt-4 lowercase tracking-normal flex items-center justify-center gap-4">
              <a href="/staff" className="hover:text-gold-400 decoration-gold-200/30 underline-offset-4 underline">{t('common.staff_access')}</a>
              <span className="text-stone-200">•</span>
              <a href="/admin" className="hover:text-gold-400 decoration-gold-200/30 underline-offset-4 underline font-medium">{t('common.admin_panel')}</a>
            </div>
          </footer>
        </div>
      </div>

    </div>
  );
}
