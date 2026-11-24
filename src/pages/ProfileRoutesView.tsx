import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CaretLeft,
  GearSix,
  Headset,
  Heart,
  MapPin,
  Medal,
  Moon,
  ShoppingBag,
  SignOut,
  Storefront,
  Sun,
  UserCircle,
  Wallet,
} from '@phosphor-icons/react';
import {
  LegalSectionKey,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  ProfileSubRoute,
  SavedAddressItem,
  StoreRecord,
  UserProfileRecord,
  WalletTopupRequestRecord,
  WalletTransactionRecord,
} from '../types/edkawi';
import { useTheme } from '../contexts/ThemeContext';
import { CustomerAccountView } from '../components/CustomerAccountView';
import { CustomerOrders } from '../components/CustomerOrders';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { APP_VERSION } from '../utils/version';

interface ProfileRoutesViewProps {
  subRoute: ProfileSubRoute;
  onNavigateSubRoute: (next: ProfileSubRoute) => void;
  userUid: string;
  userEmail: string;
  userDisplayName: string;
  emailVerified?: boolean;
  isAnonymous: boolean;
  userProfile: UserProfileRecord | null;
  stores: StoreRecord[];
  walletTopups?: WalletTopupRequestRecord[];
  walletTransactions?: WalletTransactionRecord[];
  activeOrdersCount?: number;
  totalOrdersCount?: number;
  onUpdateProfileDetails: (patch: {
    name?: string;
    phone?: string;
    defaultNeighborhood?: string;
    defaultAddress?: string;
    defaultLat?: number;
    defaultLng?: number;
    savedAddresses?: SavedAddressItem[];
  }) => Promise<void>;
  onRedeemPoints: () => Promise<string>;
  onToggleFavoriteStore: (storeId: string) => Promise<void>;
  onSelectStore: (store: StoreRecord) => void;
  onOpenAuthModal: () => void;
  onOpenLegalModal?: (section?: LegalSectionKey) => void;
  onOpenDailySpin?: () => void;
  onNavigateToJoin?: () => void;
  onTrackOrder: (orderId: string) => void;
  onConfirmPendingOrder: (
    orderId: string,
    paymentMethod?: PaymentMethod
  ) => Promise<OrderStatus | void>;
  onExploreStores: () => void;
  onReorder: (order: OrderRecord) => void;
  onSignOut: () => void;
}

const SUB_ROUTE_META: Record<
  Exclude<ProfileSubRoute, 'hub'>,
  { title: string; subtitle: string }
> = {
  addresses: {
    title: 'عناويني المحفوظة',
    subtitle: 'أضف عناوينك وحدد موقعك بدقة على خريطة إدكو',
  },
  orders: {
    title: 'طلباتي السابقة والحالية',
    subtitle: 'تابع طلباتك لحظة بلحظة أو أعد الطلب بضغطة واحدة',
  },
  wallet: {
    title: 'محفظتي والشحن',
    subtitle: 'رصيد المحفظة، شحن فودافون كاش وإنستاباي، وكود الدعوة',
  },
  favorites: {
    title: 'المتاجر والصيدليات المفضلة',
    subtitle: 'وصول سريع لأماكنك المفضلة في مدينة إدكو',
  },
  loyalty: {
    title: 'نقاطي والمكافآت',
    subtitle: 'استبدل نقاطك بخصومات فورية وتابع سلسلة طلباتك',
  },
  support: {
    title: 'الدعم والمساعدة',
    subtitle: 'تذاكر الدعم الفني والمتابعة المباشرة مع فريق إدكاوي',
  },
  settings: {
    title: 'إعدادات الحساب والخصوصية',
    subtitle: 'تحديث بياناتك، المظهر، الخصوصية وإدارة الحساب',
  },
};

export const ProfileRoutesView: React.FC<ProfileRoutesViewProps> = ({
  subRoute,
  onNavigateSubRoute,
  userUid,
  userEmail,
  userDisplayName,
  emailVerified = false,
  isAnonymous,
  userProfile,
  stores,
  walletTopups = [],
  walletTransactions = [],
  activeOrdersCount = 0,
  totalOrdersCount = 0,
  onUpdateProfileDetails,
  onRedeemPoints,
  onToggleFavoriteStore,
  onSelectStore,
  onOpenAuthModal,
  onOpenLegalModal,
  onOpenDailySpin,
  onNavigateToJoin,
  onTrackOrder,
  onConfirmPendingOrder,
  onExploreStores,
  onReorder,
  onSignOut,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const displayName =
    userProfile?.name?.trim() || userDisplayName.trim() || 'عميل إدكاوي';
  const displayPhone =
    userProfile?.phone?.trim() || 'أضف رقم الموبايل من الإعدادات';
  const walletBalance = Number(userProfile?.walletBalance ?? 0);
  const points = Math.max(0, Math.trunc(userProfile?.points ?? 0));
  const savedAddressesCount = userProfile?.savedAddresses?.length ?? (userProfile?.defaultAddress ? 1 : 0);
  const favoritesCount = userProfile?.favoriteStoreIds?.length ?? 0;

  if (isAnonymous) {
    return (
      <CustomerAccountView
        userUid={userUid}
        userEmail={userEmail}
        userDisplayName={userDisplayName}
        emailVerified={emailVerified}
        isAnonymous={isAnonymous}
        userProfile={userProfile}
        stores={stores}
        walletTopups={walletTopups}
        walletTransactions={walletTransactions}
        onUpdateProfileDetails={onUpdateProfileDetails}
        onRedeemPoints={onRedeemPoints}
        onToggleFavoriteStore={onToggleFavoriteStore}
        onSelectStore={onSelectStore}
        onOpenAuthModal={onOpenAuthModal}
        onOpenLegalModal={onOpenLegalModal}
        onOpenDailySpin={onOpenDailySpin}
        onNavigateToJoin={onNavigateToJoin}
        activeOrdersCount={activeOrdersCount}
        onSignOut={onSignOut}
      />
    );
  }

  const menuCards: {
    id: Exclude<ProfileSubRoute, 'hub'>;
    label: string;
    description: string;
    badge?: string;
    icon: React.ReactNode;
    accentClass: string;
  }[] = [
    {
      id: 'addresses',
      label: 'عناويني',
      description: 'عناوين التوصيل والخريطة في إدكو',
      badge: `${savedAddressesCount} عنوان`,
      icon: <MapPin weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-[#46D5D4]/15 text-[#0F766E] dark:text-[#46D5D4]',
    },
    {
      id: 'orders',
      label: 'طلباتي',
      description: 'تتبع الطلبات النشطة وسجل الطلبات',
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} نشط` : `${totalOrdersCount} طلب`,
      icon: <ShoppingBag weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-[#FF7100]/15 text-[#FF7100]',
    },
    {
      id: 'wallet',
      label: 'محفظتي والشحن',
      description: 'فودافون كاش · إنستاباي · كود الدعوة',
      badge: `${walletBalance.toFixed(0)} ج.م`,
      icon: <Wallet weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'favorites',
      label: 'المفضلة',
      description: 'المطاعم والصيدليات المحفوظة',
      badge: `${favoritesCount} متجر`,
      icon: <Heart weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'loyalty',
      label: 'نقاطي والمكافآت',
      description: 'عجلة الحظ وتحدي ٥ طلبات',
      badge: `${points} نقطة`,
      icon: <Medal weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'support',
      label: 'الدعم والمساعدة',
      description: 'تذاكر الدعم الفني المباشر',
      icon: <Headset weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'settings',
      label: 'إعدادات الحساب والخصوصية',
      description: 'تعديل البيانات، التوثيق، وحذف الحساب',
      icon: <GearSix weight="duotone" className="w-5 h-5" />,
      accentClass: 'bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200',
    },
  ];

  return (
    <div dir="rtl" className="min-h-[70vh] pb-24">
      <AnimatePresence mode="wait">
        {subRoute === 'hub' ? (
          <motion.div
            key="profile_hub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6"
          >
            {/* Header Identity Card */}
            <section className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] dark:shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#46D5D4] to-[#0EA5E9] text-[#0F172A] flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-[0_8px_20px_rgba(70,213,212,0.3)]">
                    {displayName.slice(0, 1)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                      {displayName}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] tabular-nums">
                      {displayPhone}
                      {userProfile?.customerCode ? ` · ${userProfile.customerCode}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن'}
                    className="min-h-[44px] min-w-[44px] rounded-2xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] flex items-center justify-center cursor-pointer"
                  >
                    {theme === 'dark' ? (
                      <Sun weight="duotone" className="w-5 h-5 text-[#46D5D4]" />
                    ) : (
                      <Moon weight="duotone" className="w-5 h-5 text-[#1E293B]" />
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => onNavigateSubRoute('settings')}
                    className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#46D5D4]/15 hover:bg-[#46D5D4]/25 text-[#0F766E] dark:text-[#46D5D4] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCircle weight="bold" className="w-4 h-4" />
                    <span>تعديل</span>
                  </motion.button>
                </div>
              </div>

              {/* Dual Metric Tiles */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#334155]">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => onNavigateSubRoute('wallet')}
                  className="rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] p-4 text-right hover:border-[#46D5D4] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
                    رصيد المحفظة
                  </span>
                  <p className="text-xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC] tabular-nums mt-1">
                    {walletBalance.toFixed(0)}{' '}
                    <span className="text-xs font-bold text-[#0F766E] dark:text-[#46D5D4]">
                      ج.م
                    </span>
                  </p>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => onNavigateSubRoute('loyalty')}
                  className="rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] p-4 text-right hover:border-[#FF7100] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
                    نقاط المكافآت
                  </span>
                  <p className="text-xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC] tabular-nums mt-1">
                    {points}{' '}
                    <span className="text-xs font-bold text-[#FF7100]">
                      نقطة
                    </span>
                  </p>
                </motion.button>
              </div>
            </section>

            {/* Independent Sub-Route Navigation List */}
            <nav aria-label="أقسام الحساب المستقلة" className="space-y-3">
              {menuCards.map((item, idx) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.2) }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onNavigateSubRoute(item.id)}
                  className="w-full rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] p-4 flex items-center justify-between gap-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-colors cursor-pointer text-right"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${item.accentClass}`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-extrabold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="text-xs font-bold text-slate-600 dark:text-[#94A3B8] tabular-nums">
                        {item.badge}
                      </span>
                    )}
                    <CaretLeft
                      weight="bold"
                      className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]"
                    />
                  </div>
                </motion.button>
              ))}
            </nav>

            {/* Partner Join + Sign Out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {onNavigateToJoin && (
                <motion.button
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={onNavigateToJoin}
                  className="min-h-[52px] px-5 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-[#FF7100] text-[#1E293B] dark:text-[#F8FAFC] text-sm font-bold flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Storefront weight="duotone" className="w-5 h-5 text-[#FF7100]" />
                    <span>انضمام المتاجر والشركاء</span>
                  </span>
                  <CaretLeft weight="bold" className="w-4 h-4 text-slate-400" />
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.985 }}
                type="button"
                onClick={() => setConfirmSignOut(true)}
                className="min-h-[52px] px-5 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2.5">
                  <SignOut weight="duotone" className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </span>
                <CaretLeft weight="bold" className="w-4 h-4" />
              </motion.button>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-[#94A3B8] font-mono">
              EDKAWY · v{APP_VERSION}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`profile_sub_${subRoute}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {/* Dedicated Glass Back Bar */}
            <div className="sticky top-[68px] z-30 edkawi-glass-header border-b border-slate-200/80 dark:border-[#334155]/80">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => onNavigateSubRoute('hub')}
                    aria-label="العودة لقائمة حسابي"
                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
                  >
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </motion.button>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-extrabold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                      {SUB_ROUTE_META[subRoute].title}
                    </h1>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] truncate">
                      {SUB_ROUTE_META[subRoute].subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {subRoute === 'orders' ? (
              <CustomerOrders
                onTrackOrder={onTrackOrder}
                onConfirmPendingOrder={onConfirmPendingOrder}
                onExploreStores={onExploreStores}
                onReorder={onReorder}
              />
            ) : (
              <CustomerAccountView
                userUid={userUid}
                userEmail={userEmail}
                userDisplayName={userDisplayName}
                emailVerified={emailVerified}
                isAnonymous={isAnonymous}
                userProfile={userProfile}
                stores={stores}
                walletTopups={walletTopups}
                walletTransactions={walletTransactions}
                standaloneSection={subRoute}
                onUpdateProfileDetails={onUpdateProfileDetails}
                onRedeemPoints={onRedeemPoints}
                onToggleFavoriteStore={onToggleFavoriteStore}
                onSelectStore={onSelectStore}
                onOpenAuthModal={onOpenAuthModal}
                onOpenLegalModal={onOpenLegalModal}
                onOpenDailySpin={onOpenDailySpin}
                onNavigateToJoin={onNavigateToJoin}
                activeOrdersCount={activeOrdersCount}
                onSignOut={onSignOut}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmActionModal
        isOpen={confirmSignOut}
        title="تأكيد تسجيل الخروج"
        description="هل تريد تسجيل الخروج من حسابك الحالي في إدكاوي؟"
        confirmLabel="تسجيل الخروج"
        cancelLabel="البقاء متصلاً"
        tone="warning"
        onConfirm={() => {
          setConfirmSignOut(false);
          onSignOut();
        }}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  );
};
