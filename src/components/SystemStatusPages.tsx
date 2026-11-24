import React from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  MessageCircle,
  Scale,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { ADMIN_WHATSAPP_URL } from '../contexts/SystemContext';
import { LegalSectionKey, SystemMaintenanceConfig } from '../types/edkawi';
import { AdkawyLogo } from './AdkawyLogo';

interface SystemLockPageProps {
  config: SystemMaintenanceConfig;
  isSignedIn: boolean;
  isGuestCustomer: boolean;
  userName?: string;
  onOpenAdminLogin: () => void;
  onOpenLegalModal: (section?: LegalSectionKey) => void;
  onSignOut: () => void;
}

export const MaintenancePage: React.FC<SystemLockPageProps> = ({
  config,
  isSignedIn,
  isGuestCustomer,
  onOpenAdminLogin,
  onOpenLegalModal,
  onSignOut,
}) => {
  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] bg-[#10192D] text-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#1E293B] border border-[#334155] p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <AdkawyLogo variant="navbar" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#FF7100]/15 border border-[#FF7100]/30 text-[#FF7100] flex items-center justify-center mx-auto">
          <Wrench className="w-8 h-8" />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-extrabold tracking-wide text-[#FF7100]">
            وضع الصيانة والتحديث المؤقت
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] headline-balance">
            منصة إدكاوي في وضع الصيانة حالياً
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            {config.maintenanceMessage ||
              'تطبيق إدكاوي في وضع الصيانة والتحديث حالياً لرفع كفاءة الخدمة في مدينة إدكو — سنعود للعمل خلال دقائق.'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#10192D] border border-[#334155] p-4 sm:p-5 space-y-3">
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            للدعم الفوري أو الاستفسار عن الطلبات والتسجيل، تواصل مباشرة مع إدارة إدكاوي عبر واتساب:
          </p>
          <a
            href={ADMIN_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[54px] px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-[#0B141A] text-base font-extrabold inline-flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>تواصل معنا على واتساب (01032874716)</span>
          </a>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          {isSignedIn && !isGuestCustomer ? (
            <button
              type="button"
              onClick={onSignOut}
              className="flex-1 min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#FF7100] hover:bg-[#E66600] text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج / التبديل لحساب آخر</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="flex-1 min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#FF7100] hover:bg-[#E66600] text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>العودة لصفحة الدخول والتسجيل</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenLegalModal('terms')}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl border border-[#334155] bg-[#10192D] hover:bg-[#334155] text-[#F8FAFC] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-[#FF7100]" />
            <span>الشروط والسياسات</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const PreRegistrationPage: React.FC<SystemLockPageProps> = ({
  config,
  isSignedIn,
  isGuestCustomer,
  userName,
  onOpenAdminLogin,
  onOpenLegalModal,
  onSignOut,
}) => {
  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] bg-[#10192D] text-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#1E293B] border border-[#334155] p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <AdkawyLogo variant="navbar" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#FF7100]/15 border border-[#FF7100]/30 text-[#FF7100] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-extrabold tracking-wide text-[#FF7100] inline-flex items-center gap-1.5 justify-center">
            <Clock className="w-3.5 h-3.5" />
            <span>مرحلة التسجيل المسبق والاستعداد للإطلاق</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] headline-balance">
            {userName ? `أهلاً بك يا ${userName} في إدكاوي!` : 'أهلاً بك في منصة إدكاوي!'}
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            {config.registrationMessage ||
              'تم تسجيل حسابك بنجاح! منصة إدكاوي حالياً في مرحلة التسجيل المسبق والتجهيز للافتتاح الرسمي في مدينة إدكو.'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#10192D] border border-[#334155] p-4 sm:p-5 space-y-3">
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            حسابك محفوظ ومفعّل. إذا كنت شريكاً (متجر / مندوب) أو ترغب في تفعيل سريع أو الاستفسار عن موعد الانطلاق، تواصل معنا مباشرة عبر واتساب:
          </p>
          <a
            href={ADMIN_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[54px] px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-[#0B141A] text-base font-extrabold inline-flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>تواصل معنا على واتساب (01032874716)</span>
          </a>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          {isSignedIn && !isGuestCustomer ? (
            <button
              type="button"
              onClick={onSignOut}
              className="flex-1 min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#FF7100] hover:bg-[#E66600] text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج / حساب آخر</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="flex-1 min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#FF7100] hover:bg-[#E66600] text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>صفحة تسجيل الدخول والتسجيل</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenLegalModal('terms')}
            className="min-h-[46px] px-4 py-2.5 rounded-2xl border border-[#334155] bg-[#10192D] hover:bg-[#334155] text-[#F8FAFC] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-[#FF7100]" />
            <span>الشروط والسياسات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
