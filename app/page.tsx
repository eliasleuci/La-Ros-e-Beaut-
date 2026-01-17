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
            src="/hero-watermark.jpg"
            alt="Watermark"
            className="w-full h-full object-cover grayscale opacity-60 mix-blend-multiply"
          />
          {/* Multi-layered cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F1EFEC]/70 via-transparent to-[#F1EFEC]/70"></div>
          <div className="absolute inset-0 bg-[#F1EFEC]/20 mix-blend-overlay"></div>
        </div>

        <div className="absolute top-8 right-8 z-20 md:fixed md:top-8 md:right-auto md:left-8">
          <LanguageSwitcher />
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-md mt-0 md:-mt-32">
          <div className="w-16 h-[1px] bg-stone-500/80 mx-auto mb-10"></div>
          <h1 className="text-5xl md:text-7xl font-serif text-stone-800 leading-[0.9] tracking-tighter drop-shadow-md">
            La Rosée<br /><span className="text-3xl md:text-4xl italic text-stone-600/80 drop-shadow-sm mt-4 block font-light">Beauté</span>
          </h1>
          <p className="text-stone-800 font-bold text-[10px] tracking-[0.4em] uppercase pt-4">
            {t('common.estetica_bienestar')}
          </p>
          <div className="pt-12 text-[9px] font-bold tracking-[0.6em] text-stone-700 uppercase">
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
            <div>La Rosée Beauté © {new Date().getFullYear()}</div>
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
