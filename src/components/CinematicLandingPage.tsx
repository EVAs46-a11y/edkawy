import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  CookingPot,
  MapPin,
  Moon,
  Moped,
  Pill,
  ShieldCheck,
  Storefront,
  Sun,
} from '@phosphor-icons/react';
import { useTheme } from '../contexts/ThemeContext';
import { LegalSectionKey } from '../types/edkawi';
import { AdkawyLogo } from './AdkawyLogo';

interface CinematicLandingPageProps {
  onStartLogin: () => void;
  onStartRegister: () => void;
  onJoinPartner: () => void;
  onOpenLegalModal: (section?: LegalSectionKey) => void;
}

const CAPABILITY_CARDS = [
  {
    id: 'restaurants',
    index: '01',
    title: 'مطاعم ومأكولات طازجة',
    description:
      'منيو حي محدث لحظياً مع وقت تحضير محسوب حسب ضغط المطبخ وتنوع وجبات إدكو.',
    icon: CookingPot,
  },
  {
    id: 'pharmacies',
    index: '02',
    title: 'صيدليات ومستلزمات طبية',
    description:
      'إرسال الروشتة أو طلب الدواء مع تسعير فوري من الصيدلية وتوصيل موثوق لباب البيت.',
    icon: Pill,
  },
  {
    id: 'occasions',
    index: '03',
    title: 'عروض المناسبات والمطابخ البيتية',
    description:
      'باقات فطار العيلة، سهرة الفيلم، وأشهر الأكلات البيتية في إدكو بعروض موقوتة حقيقية.',
    icon: Storefront,
  },
  {
    id: 'tracking',
    index: '04',
    title: 'تتبع مباشر على خريطة إدكو',
    description:
      'حركة المندوب من استلام الطلب حتى التسليم مع تواصل فوري وخيارات دفع مرنة.',
    icon: MapPin,
  },
] as const;

export const CinematicLandingPage: React.FC<CinematicLandingPageProps> = ({
  onStartLogin,
  onStartRegister,
  onJoinPartner,
  onOpenLegalModal,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] flex flex-col bg-white dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] overflow-x-clip"
    >
      {/* Top Bar (Strict 3-Zone Glass Header) */}
      <header className="sticky top-0 z-40 edkawi-glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="#landing-hero"
            className="whitespace-nowrap shrink-0"
            aria-label="إدكاوي - الصفحة الرئيسية"
          >
            <AdkawyLogo variant="navbar" />
          </a>

          <nav
            aria-label="روابط التعريف بالمنصة"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]"
          >
            <a
              href="#landing-services"
              className="hover:text-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              الخدمات
            </a>
            <a
              href="#landing-route"
              className="hover:text-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              كيف يعمل
            </a>
            <button
              type="button"
              onClick={onJoinPartner}
              className="hover:text-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              انضم كشريك
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalModal('terms')}
              className="hover:text-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              السياسات
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={toggleTheme}
              aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم'}
              className="min-h-[42px] min-w-[42px] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#46D5D4] cursor-pointer"
            >
              {isDark ? (
                <Sun weight="duotone" className="w-5 h-5 text-[#46D5D4]" />
              ) : (
                <Moon weight="duotone" className="w-5 h-5 text-[#1E293B]" />
              )}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onStartLogin}
              className="min-h-[42px] px-5 py-2 rounded-2xl bg-[#46D5D4] hover:bg-[#2EC4C3] text-[#0F172A] text-sm font-extrabold whitespace-nowrap shrink-0 shadow-lg shadow-[#46D5D4]/25 cursor-pointer"
            >
              تسجيل الدخول
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section with Animated Edkawy Scooter Track */}
      <section
        id="landing-hero"
        className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Right Narrative Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center space-y-6"
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-[#0D9488] dark:text-[#46D5D4]">
              مدينة إدكو · التوصيل المحلي الفوري
            </p>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.2] text-[#1E293B] dark:text-[#F8FAFC] headline-balance">
              كل مطاعم وصيدليات إدكو{' '}
              <span className="text-[#46D5D4]">بين يديك</span> في دقائق.
            </h1>

            <p className="text-base sm:text-lg text-[#475569] dark:text-[#94A3B8] leading-relaxed max-w-xl">
              من الوجبات الساخنة والمطابخ البيتية إلى طلبات الصيدليات والمشاوير
              السريعة — اطلب بسهولة وتابع الكابتن لحظة بلحظة على خريطة إدكو.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartRegister}
                className="min-h-[52px] px-7 py-3.5 rounded-2xl bg-[#46D5D4] hover:bg-[#2EC4C3] text-[#0F172A] text-base font-extrabold inline-flex items-center gap-2.5 shadow-xl shadow-[#46D5D4]/25 cursor-pointer"
              >
                <span>إنشاء حساب والبدء</span>
                <ArrowLeft weight="bold" className="w-5 h-5" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartLogin}
                className="min-h-[52px] px-6 py-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] hover:border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] text-base font-bold cursor-pointer"
              >
                لدي حساب بالفعل
              </motion.button>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                <Clock weight="duotone" className="w-4 h-4 text-[#46D5D4]" />
                <span>تغطية جميع أحياء إدكو</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck weight="duotone" className="w-4 h-4 text-[#FF7100]" />
                <span>دفع نقدي عند الاستلام أو عبر المحفظة</span>
              </span>
            </div>
          </motion.div>

          {/* Left Cinematic Motion Stage: Moving Edkawy Scooter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="lg:col-span-6 relative rounded-3xl border border-[#E2E8F0] dark:border-[#334155] bg-gradient-to-br from-[#F8FAFC] via-white to-[#ECFEFF] dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#132A38] p-6 sm:p-8 flex flex-col justify-between min-h-[340px] lg:min-h-[420px] shadow-2xl overflow-hidden"
          >
            {/* Atmospheric City Glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#46D5D4]/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#FF7100]/15 blur-3xl"
            />

            {/* Top Floating Route Label */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/logo_fb0191f4.png"
                  alt="إدكاوي"
                  className="w-12 h-12 rounded-2xl object-contain bg-white p-1 border border-[#E2E8F0] shadow-sm"
                />
                <div>
                  <p className="text-sm font-extrabold text-[#1E293B] dark:text-[#F8FAFC]">
                    أسطول توصيل إدكاوي
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    شارع البحر · السوق · المساكن · الكورنيش
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums font-bold text-[#0D9488] dark:text-[#46D5D4]">
                20 - 30 دقيقة
              </span>
            </div>

            {/* Animated Edku Horizon & Scooter Riding Loop */}
            <div className="relative z-10 my-6 h-44 flex flex-col justify-end overflow-hidden rounded-2xl bg-white/75 dark:bg-[#0F172A]/65 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-[#334155]/80 px-4 pb-5">
              {/* Architectural Silhouette Track */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-7 flex items-end justify-around opacity-25 dark:opacity-35 px-4"
              >
                <div className="w-10 h-14 rounded-t-lg bg-[#46D5D4]/50" />
                <div className="w-14 h-20 rounded-t-lg bg-[#64748B]/40" />
                <div className="w-8 h-12 rounded-t-lg bg-[#FF7100]/45" />
                <div className="w-16 h-24 rounded-t-lg bg-[#46D5D4]/40" />
                <div className="w-12 h-16 rounded-t-lg bg-[#64748B]/40" />
              </div>

              {/* Moving Scooter Group (RTL visual motion across road) */}
              <motion.div
                initial={{ x: '-35%' }}
                animate={{ x: ['-30%', '45%', '-30%'] }}
                transition={{
                  duration: 7.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative z-10 inline-flex items-center gap-3 self-center"
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    duration: 0.45,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#1E293B] text-white shadow-xl border border-[#46D5D4]/40"
                >
                  <Moped weight="fill" className="w-9 h-9 text-[#FF7100]" />
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-white">
                      كابتن إدكاوي
                    </p>
                    <p className="text-[11px] font-semibold text-[#46D5D4]">
                      في الطريق إليك
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Dashed Asphalt Road Line */}
              <div className="relative mt-3 h-1.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
                <motion.div
                  animate={{ x: ['0%', '50%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                  className="h-full w-[200%] bg-[repeating-linear-gradient(90deg,#46D5D4_0px,#46D5D4_22px,transparent_22px,transparent_44px)]"
                />
              </div>
            </div>

            {/* Bottom Partner CTA Strip */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs sm:text-sm font-semibold text-[#475569] dark:text-[#94A3B8]">
                تمتلك مطعماً أو صيدلية في إدكو؟
              </p>
              <button
                type="button"
                onClick={onJoinPartner}
                className="text-xs sm:text-sm font-extrabold text-[#0D9488] dark:text-[#46D5D4] hover:underline cursor-pointer"
              >
                سجل متجرك معنا الآن ←
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Capabilities Section (Editorial Numbered Grid) */}
      <section
        id="landing-services"
        className="border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/60 py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold text-[#0D9488] dark:text-[#46D5D4]">
              تجربة متكاملة لمدينة إدكو
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC] headline-balance">
              سرعة الاستجابة ودقة المتابعة في كل طلب
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAPABILITY_CARDS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="edkawi-soft-card p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-2xl bg-[#46D5D4]/15 text-[#0D9488] dark:text-[#46D5D4] flex items-center justify-center">
                      <Icon weight="duotone" className="w-6 h-6" />
                    </span>
                    <span className="font-mono text-xs font-bold text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      {item.index}.
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-[#1E293B] dark:text-[#F8FAFC]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple Flow Proof + Bottom CTA */}
      <section
        id="landing-route"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#334155] bg-[#1E293B] text-[#F8FAFC] p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-extrabold headline-balance">
              جاهز لتجربة أسرع توصيل في إدكو؟
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              أنشئ حسابك في ثوانٍ عبر جوجل أو البريد الإلكتروني وابدأ الطلب من
              أقرب متاجر ومطاعم إدكو.
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartRegister}
            className="min-h-[50px] px-7 py-3 rounded-2xl bg-[#46D5D4] hover:bg-[#2EC4C3] text-[#0F172A] text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-[#46D5D4]/20"
          >
            ابدأ الآن مجاناً
          </motion.button>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <p className="font-semibold text-[#1E293B] dark:text-[#F8FAFC]">
            إدكاوي (EDKAWY) · مدينة إدكو، محافظة البحيرة
          </p>
          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() => onOpenLegalModal('terms')}
              className="hover:text-[#46D5D4] cursor-pointer"
            >
              الشروط والأحكام
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:text-[#46D5D4] cursor-pointer"
            >
              سياسة الخصوصية
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalModal('partners')}
              className="hover:text-[#46D5D4] cursor-pointer"
            >
              انضمام الشركاء
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
