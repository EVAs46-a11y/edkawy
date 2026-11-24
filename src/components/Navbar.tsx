import { motion } from 'framer-motion';
import { Bell, Moon, Sun, UserCircle } from '@phosphor-icons/react';
import { useTheme } from '../contexts/ThemeContext';
import { ActiveView, PortalRole } from '../types/edkawi';
import { AdkawyLogo } from './AdkawyLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activePortal: PortalRole;
  activeCustomerView: ActiveView;
  onNavigateCustomerView: (view: ActiveView) => void;
  cartItemCount: number;
  customerOrdersCount: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  isAuthenticated: boolean;
  isGuestCustomer?: boolean;
  userName?: string;
  onPrimaryAction: () => void;
}

export function Navbar({
  activePortal,
  activeCustomerView,
  onNavigateCustomerView,
  cartItemCount,
  customerOrdersCount,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  isAuthenticated,
  isGuestCustomer = false,
  userName,
  onPrimaryAction,
}: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();

  function handleBrandClick() {
    if (isAuthenticated && activePortal === 'customer') {
      onNavigateCustomerView('stores');
    }
  }

  return (
    <header className="sticky top-0 z-40 edkawi-glass-header text-[#1E293B] dark:text-[#F8FAFC] w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8 h-16 min-w-0">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleBrandClick();
          }}
          aria-label="إدكاوي Edkawy - الصفحة الرئيسية"
          className="whitespace-nowrap shrink-0 hover:opacity-90 active:scale-[0.98]"
        >
          <AdkawyLogo variant="navbar" />
        </a>

        {!isAuthenticated ? (
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden sm:flex items-center gap-4 text-sm font-bold text-[#64748B] dark:text-[#94A3B8] min-w-0"
          >
            <span className="py-2 border-b-2 border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] truncate whitespace-nowrap">
              منصة إدكاوي · مدينة إدكو
            </span>
          </nav>
        ) : activePortal === 'customer' ? (
          <nav
            aria-label="أقسام واجهة العميل"
            className="hidden md:flex items-center gap-6 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]"
          >
            <button
              type="button"
              onClick={() => onNavigateCustomerView('stores')}
              aria-current={
                activeCustomerView === 'stores' ||
                activeCustomerView === 'store_menu'
                  ? 'page'
                  : undefined
              }
              className={`relative py-2 border-b-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeCustomerView === 'stores' ||
                activeCustomerView === 'store_menu'
                  ? 'border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC]'
                  : 'border-transparent hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
              }`}
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() => onNavigateCustomerView('cart')}
              aria-current={
                activeCustomerView === 'cart' ||
                activeCustomerView === 'checkout'
                  ? 'page'
                  : undefined
              }
              className={`relative py-2 border-b-2 whitespace-nowrap shrink-0 cursor-pointer tabular-nums transition-colors ${
                activeCustomerView === 'cart' ||
                activeCustomerView === 'checkout'
                  ? 'border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC]'
                  : 'border-transparent hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {cartItemCount > 0 ? `السلة (${cartItemCount})` : 'السلة'}
            </button>

            <button
              type="button"
              onClick={() => onNavigateCustomerView('orders')}
              aria-current={
                activeCustomerView === 'orders' ||
                activeCustomerView === 'tracking'
                  ? 'page'
                  : undefined
              }
              className={`relative py-2 border-b-2 whitespace-nowrap shrink-0 cursor-pointer tabular-nums transition-colors ${
                activeCustomerView === 'orders' ||
                activeCustomerView === 'tracking'
                  ? 'border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC]'
                  : 'border-transparent hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {customerOrdersCount > 0
                ? `طلباتي (${customerOrdersCount})`
                : 'طلباتي'}
            </button>

            <button
              type="button"
              onClick={() => onNavigateCustomerView('account')}
              aria-current={
                activeCustomerView === 'account' ? 'page' : undefined
              }
              className={`relative py-2 border-b-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeCustomerView === 'account'
                  ? 'border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC]'
                  : 'border-transparent hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
              }`}
            >
              حسابي
            </button>
          </nav>
        ) : (
          <nav
            aria-label="التنقل داخل البوابة"
            className="hidden sm:flex items-center gap-3 text-sm font-bold text-[#64748B] dark:text-[#94A3B8] min-w-0"
          >
            <span className="py-2 border-b-2 border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] truncate whitespace-nowrap">
              {activePortal === 'admin'
                ? 'لوحة تحكم الإدارة — إدكاوي'
                : activePortal === 'store'
                ? 'لوحة تحكم المتجر — إدكاوي'
                : 'بوابة كابتن التوصيل — إدكاوي'}
            </span>
          </nav>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton variant="compact" />

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم'}
            className="min-h-[42px] min-w-[42px] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#46D5D4] cursor-pointer shrink-0"
          >
            {isDark ? (
              <Sun weight="duotone" className="w-5 h-5 text-[#46D5D4]" />
            ) : (
              <Moon weight="duotone" className="w-5 h-5 text-[#1E293B]" />
            )}
          </motion.button>

          {isAuthenticated && activePortal === 'customer' && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigateCustomerView('account')}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#46D5D4] text-xs font-bold text-[#1E293B] dark:text-[#F8FAFC] cursor-pointer whitespace-nowrap max-w-[170px]"
            >
              <UserCircle weight="duotone" className="w-4 h-4 text-[#46D5D4] shrink-0" />
              <span className="truncate">
                {isGuestCustomer ? 'حساب ضيف' : userName?.trim() || 'حسابي'}
              </span>
            </motion.button>
          )}

          {isAuthenticated && onOpenNotifications && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={onOpenNotifications}
              aria-label="الإشعارات"
              className="relative min-h-[42px] min-w-[42px] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#46D5D4] cursor-pointer transition-colors shrink-0"
            >
              <Bell weight="duotone" className="w-5 h-5 text-[#46D5D4]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7100] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadNotificationsCount > 99
                    ? '99+'
                    : unreadNotificationsCount}
                </span>
              )}
            </motion.button>
          )}

          {isAuthenticated && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onPrimaryAction}
              className={`min-h-[42px] px-4 py-2 text-xs sm:text-sm font-extrabold rounded-2xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                !isGuestCustomer
                  ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#46D5D4]'
                  : 'bg-[#46D5D4] text-[#0F172A] hover:bg-[#2EC4C3]'
              }`}
            >
              {isGuestCustomer ? 'دخول' : 'خروج'}
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
