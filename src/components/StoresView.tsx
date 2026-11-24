import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lightning, Sparkle, Timer } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Bike,
  Bot,
  Camera,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Croissant,
  Fish,
  Flame,
  Gift,
  Heart,
  LayoutGrid,
  Lock,
  MapPin,
  Mic,
  MicOff,
  Pill,
  Radio,
  RefreshCw,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
  Store as StoreIcon,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import { fetchStoresPageFromFirestore } from '../services/edkawiFirebaseService';
import {
  AdBannerRecord,
  CampaignRecord,
  CartItem,
  LiveEventRecord,
  ProductRecord,
  StoreCategory,
  StoreRecord,
  SuperAppCategoryRecord,
} from '../types/edkawi';
import {
  filterStoresByCategoryAndQuery,
  isStoreCurrentlyOpen,
  STORE_CATEGORIES,
} from '../utils/orderLogic';
import { EdkuWeatherPromoBanner } from './ExclusiveEdkawyModals';
import { EmptyState } from './EmptyState';
import { ResilientImage } from './ResilientImage';
import { AdsBannerSkeleton, StoresGridSkeleton } from './SkeletonLoaders';

type EdkuOccasionFilter = 'الكل' | 'فطار العيلة' | 'ليلة الفيلم' | 'أكلات بيتي';

const EDKU_OCCASION_FILTERS: readonly EdkuOccasionFilter[] = [
  'الكل',
  'فطار العيلة',
  'ليلة الفيلم',
  'أكلات بيتي',
];

function formatFlashCountdown(endsAtIso: string | undefined, nowMs: number): string {
  if (!endsAtIso) return '15:00';
  const targetMs = Date.parse(endsAtIso);
  if (Number.isNaN(targetMs) || targetMs <= nowMs) return '00:00';
  const totalSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface StoresViewProps {
  stores: StoreRecord[];
  dynamicCategories?: SuperAppCategoryRecord[];
  isLoadingStores: boolean;
  storesError: string | null;
  cart: CartItem[];
  userName?: string;
  ads?: AdBannerRecord[];
  isLoadingAds?: boolean;
  activeCampaigns?: CampaignRecord[];
  mysteryBoxProducts?: ProductRecord[];
  trendingProducts?: ProductRecord[];
  liveEvents?: LiveEventRecord[];
  customerTotalSpent?: number;
  favoriteStoreIds?: string[];
  onToggleFavoriteStore?: (storeId: string) => void;
  onOpenStoreMenu: (store: StoreRecord) => void;
  onAddMysteryBoxToCart?: (product: ProductRecord, store: StoreRecord) => void;
  onOpenVisualSearch?: () => void;
  onOpenErrandService?: () => void;
  onOpenAiChat?: () => void;
  onRefreshStores?: () => void;
}

export function StoresView({
  stores,
  dynamicCategories,
  isLoadingStores,
  storesError,
  cart,
  userName,
  ads = [],
  isLoadingAds = false,
  activeCampaigns = [],
  mysteryBoxProducts = [],
  trendingProducts = [],
  liveEvents = [],
  customerTotalSpent = 0,
  favoriteStoreIds = [],
  onToggleFavoriteStore,
  onOpenStoreMenu,
  onAddMysteryBoxToCart,
  onOpenVisualSearch,
  onOpenErrandService,
  onOpenAiChat,
  onRefreshStores,
}: StoresViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    StoreCategory | 'الكل'
  >('الكل');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('الكل');
  const [selectedOccasion, setSelectedOccasion] =
    useState<EdkuOccasionFilter>('الكل');
  const [sortBy, setSortBy] = useState<'default' | 'rating'>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeAdIdx, setActiveAdIdx] = useState(0);
  const [isAdPaused, setIsAdPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullOffset, setPullOffset] = useState(0);

  const paginatedStoresQuery = useInfiniteQuery({
    queryKey: ['edkawi-stores-page'],
    queryFn: ({ pageParam }) =>
      fetchStoresPageFromFirestore(20, pageParam ?? null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.lastCursorId
        ? lastPage.lastCursorId
        : undefined,
    staleTime: 60_000,
  });

  const mergedStores = useMemo(() => {
    const byId = new Map<string, StoreRecord>();
    for (const s of stores) {
      byId.set(s.id, s);
    }
    for (const page of paginatedStoresQuery.data?.pages ?? []) {
      for (const s of page.stores) {
        if (!byId.has(s.id)) {
          byId.set(s.id, s);
        }
      }
    }
    return Array.from(byId.values());
  }, [stores, paginatedStoresQuery.data]);

  const [nowMs, setNowMs] = useState(() => Date.now());

  const flashCampaigns = useMemo(
    () =>
      activeCampaigns.filter(
        (c) =>
          c.isFlashDeal &&
          (!c.endsAtIso || Date.parse(c.endsAtIso) > nowMs)
      ),
    [activeCampaigns, nowMs]
  );

  const flashProducts = useMemo(
    () =>
      trendingProducts.filter(
        (p) =>
          p.isFlashSale &&
          (p.flashDiscountPercent ?? 0) > 0 &&
          (!p.flashSaleEndsAtIso || Date.parse(p.flashSaleEndsAtIso) > nowMs)
      ),
    [trendingProducts, nowMs]
  );

  const hasLiveFlashItems =
    flashCampaigns.length > 0 || flashProducts.length > 0;

  useEffect(() => {
    if (!hasLiveFlashItems) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [hasLiveFlashItems]);

  const occasionCampaigns = useMemo(() => {
    const tagged = activeCampaigns.filter((c) => Boolean(c.occasionTag));
    if (selectedOccasion === 'الكل') return tagged;
    return tagged.filter((c) => c.occasionTag === selectedOccasion);
  }, [activeCampaigns, selectedOccasion]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('متصفحك لا يدعم البحث الصوتي حالياً');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setSearchQuery(transcript);
      }
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const hiddenHomeCategories = useMemo(
    () => new Set<StoreCategory>(['أدوات منزلية', 'ملابس']),
    []
  );

  const availableCategoryTabs: readonly StoreCategory[] = useMemo(() => {
    if (dynamicCategories && dynamicCategories.length > 0) {
      return Array.from(
        new Set(
          [...dynamicCategories]
            .filter(
              (c) =>
                c.isActive !== false && !hiddenHomeCategories.has(c.storeCategory)
            )
            .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
            .map((c) => c.storeCategory)
        )
      );
    }
    return STORE_CATEGORIES.filter((c) => !hiddenHomeCategories.has(c));
  }, [dynamicCategories, hiddenHomeCategories]);

  useEffect(() => {
    if (
      selectedCategory !== 'الكل' &&
      !availableCategoryTabs.includes(selectedCategory)
    ) {
      setSelectedCategory('الكل');
    }
  }, [availableCategoryTabs, selectedCategory]);

  useEffect(() => {
    setSelectedSubCategory('الكل');
  }, [selectedCategory]);

  // Dynamic Banner Carousel Auto-Advance every 3 seconds with pause on hover
  useEffect(() => {
    if (ads.length <= 1 || isAdPaused) return;
    const timer = window.setInterval(() => {
      setActiveAdIdx((prev) => (prev + 1) % ads.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [ads.length, isAdPaused]);

  useEffect(() => {
    if (activeAdIdx >= ads.length) {
      setActiveAdIdx(0);
    }
  }, [ads.length, activeAdIdx]);

  const isTopRatedUnlocked = customerTotalSpent >= 100;

  let filteredStores = filterStoresByCategoryAndQuery(
    mergedStores.filter((s) => availableCategoryTabs.includes(s.category)),
    selectedCategory,
    debouncedSearchQuery
  );

  if (selectedOccasion !== 'الكل') {
    filteredStores = filteredStores.filter((s) => {
      if (selectedOccasion === 'أكلات بيتي') {
        return Boolean(s.isHomeFood || s.category === 'أكل بيتي');
      }
      if (selectedOccasion === 'فطار العيلة') {
        return (
          s.category === 'أكل بيتي' ||
          s.category === 'مخابز وفطائر' ||
          Boolean(s.isHomeFood)
        );
      }
      if (selectedOccasion === 'ليلة الفيلم') {
        return (
          s.category === 'مشويات ومطاعم' ||
          s.category === 'سوبر ماركت'
        );
      }
      return true;
    });
  }

  if (selectedSubCategory !== 'الكل') {
    filteredStores = filteredStores.filter((s) => {
      const matchesStoreDesc = s.description
        .toLowerCase()
        .includes(selectedSubCategory.toLowerCase());
      const matchesMenuItems = s.menuItems.some(
        (m) =>
          m.name.toLowerCase().includes(selectedSubCategory.toLowerCase()) ||
          (m.category &&
            m.category.toLowerCase().includes(selectedSubCategory.toLowerCase()))
      );
      return matchesStoreDesc || matchesMenuItems;
    });
  }

  if (sortBy === 'rating' && isTopRatedUnlocked) {
    filteredStores = [...filteredStores].sort((a, b) => b.rating - a.rating);
  }

  const quickSearchSuggestions = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (q.length < 3) return [];
    const results: Array<{
      id: string;
      label: string;
      subLabel: string;
      store: StoreRecord;
    }> = [];
    for (const store of mergedStores) {
      if (hiddenHomeCategories.has(store.category)) continue;
      if (
        store.name.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.neighborhood.toLowerCase().includes(q)
      ) {
        results.push({
          id: `store-${store.id}`,
          label: store.name,
          subLabel: `${store.category} · ${store.neighborhood}`,
          store,
        });
      }
      for (const item of store.menuItems || []) {
        if (item.name.toLowerCase().includes(q)) {
          results.push({
            id: `item-${store.id}-${item.id}`,
            label: item.name,
            subLabel: `${store.name} · ${item.price} ج.م`,
            store,
          });
        }
      }
    }
    return results.slice(0, 6);
  }, [debouncedSearchQuery, mergedStores, hiddenHomeCategories]);

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    onRefreshStores?.();
    void paginatedStoresQuery.refetch();
    toast.success('تم تحديث قائمة متاجر إدكو');
    window.setTimeout(() => setIsRefreshing(false), 750);
  };

  const pharmacyStoresCount = mergedStores.filter(
    (s) => s.category === 'صيدليات'
  ).length;

  function getStoreCartCount(storeId: string): number {
    return cart
      .filter((c) => c.storeId === storeId)
      .reduce((sum, entry) => sum + entry.quantity, 0);
  }

  function handleAdAction(ad: AdBannerRecord) {
    if (ad.storeId) {
      const target = mergedStores.find((s) => s.id === ad.storeId);
      if (target) {
        onOpenStoreMenu(target);
        return;
      }
    }
    if (mergedStores.length > 0) {
      onOpenStoreMenu(mergedStores[0]);
    }
  }

  const currentAd = ads[activeAdIdx] ?? null;

  return (
    <div
      onTouchStart={(e) => {
        if (window.scrollY <= 4) {
          setTouchStartY(e.touches[0]?.clientY ?? null);
        }
      }}
      onTouchMove={(e) => {
        if (touchStartY === null || window.scrollY > 4) return;
        const dy = (e.touches[0]?.clientY ?? touchStartY) - touchStartY;
        if (dy > 0) {
          setPullOffset(Math.min(72, dy * 0.45));
        }
      }}
      onTouchEnd={() => {
        if (pullOffset >= 48) {
          handleManualRefresh();
        }
        setTouchStartY(null);
        setPullOffset(0);
      }}
      className="max-w-7xl mx-auto p-4 sm:p-6 pb-28 space-y-8 edkawi-page-enter"
    >
      {(pullOffset > 12 || isRefreshing) && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#FF7100] py-1">
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>
            {isRefreshing
              ? 'جارٍ تحديث المتاجر...'
              : pullOffset >= 48
              ? 'اترك الشاشة للتحديث'
              : 'اسحب للأسفل للتحديث'}
          </span>
        </div>
      )}

      {liveEvents.length > 0 && (
        <div
          aria-label="أحدث النشاط المباشر في إدكو"
          className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] px-4 py-2.5 flex items-center gap-3 overflow-x-auto no-scrollbar shadow-sm"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7100] shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>الآن في إدكو:</span>
          </span>
          <div className="flex items-center gap-4 text-xs text-[#1E293B] dark:text-[#F8FAFC] whitespace-nowrap">
            {liveEvents.slice(0, 5).map((ev) => (
              <span
                key={ev.id}
                className="inline-flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#46D5D4]" />
                <span className="text-[#1E293B] dark:text-[#F8FAFC] font-medium">
                  {ev.text || ev.textAr}
                </span>
                {ev.neighborhood && (
                  <span className="text-slate-500 dark:text-[#94A3B8]">· {ev.neighborhood}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Hero & Search */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 dark:from-[#1E293B] dark:via-[#1E293B] dark:to-[#10192D] border border-slate-200 dark:border-[#334155] text-[#1E293B] dark:text-[#F8FAFC] p-6 shadow-lg dark:shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {userName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-slate-100 dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] text-xs sm:text-sm font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                  <span>مرحباً،</span>
                  <span className="text-[#FF7100]">{userName}</span>
                </span>
              )}
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF7100]">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>تطبيق إدكاوي · توصيل سريع داخل مدينة إدكو</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC] leading-snug headline-balance">
              مطاعم ومتاجر وصيدليات إدكو تصلك لحد باب البيت
            </h1>

            <div className="rounded-2xl bg-slate-100 dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] p-2 flex items-center gap-2 flex-wrap sm:flex-nowrap relative">
              <div className="relative flex-1 min-w-[200px]">
                <label htmlFor="store-search" className="sr-only">
                  ابحث عن متجر أو صيدلية أو وجبة في إدكو
                </label>
                <Search
                  className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="store-search"
                  type="search"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    window.setTimeout(() => setIsSearchFocused(false), 180)
                  }
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مطعم، صيدلية، سوبر ماركت، أو حي..."
                  className="w-full pr-10 pl-10 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-transparent focus:border-[#46D5D4] text-sm text-[#1E293B] dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  title={isListening ? 'جارٍ الاستماع...' : 'بحث صوتي'}
                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'text-slate-400 dark:text-[#94A3B8] hover:text-[#46D5D4]'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {isSearchFocused &&
                  debouncedSearchQuery.trim().length >= 3 &&
                  quickSearchSuggestions.length > 0 && (
                    <div className="absolute top-full right-0 left-0 mt-2 z-30 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl overflow-hidden divide-y divide-slate-200 dark:divide-[#334155]">
                      {quickSearchSuggestions.map((hit) => (
                        <button
                          key={hit.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsSearchFocused(false);
                            onOpenStoreMenu(hit.store);
                          }}
                          className="w-full px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-[#10192D] flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                              {hit.label}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-[#94A3B8] truncate">
                              {hit.subLabel}
                            </p>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-[#46D5D4] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {onOpenAiChat && (
                <button
                  type="button"
                  onClick={onOpenAiChat}
                  title="مقترح الوجبات السريع من إدكاوي"
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#46D5D4] hover:bg-[#32B8B7] text-[#0F172A] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                >
                  <Bot className="w-4 h-4" />
                  <span>محتار تاكل إيه؟</span>
                </button>
              )}

              {onOpenVisualSearch && (
                <button
                  type="button"
                  onClick={onOpenVisualSearch}
                  title="البحث بالصور في مطاعم إدكو"
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#FF7100]" aria-hidden="true" />
                  <span className="hidden sm:inline">بحث بالصور</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Highlight Card: Edkawy Pharmacy Prescription System */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF7100]">
                  <Pill className="w-4 h-4" />
                  <span>نظام صيدليات إدكاوي</span>
                </div>
                {pharmacyStoresCount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {pharmacyStoresCount} صيدلية متاحة
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-[#1E293B] dark:text-[#F8FAFC] leading-snug">
                ابعت صورة الروشتة أو اسم الدواء واستلم التسعيرة فوراً
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('صيدليات');
                  const el = document.getElementById('stores-heading');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#46D5D4] hover:bg-[#32B8B7] text-[#0F172A] text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Pill className="w-4 h-4" />
                <span>عرض صيدليات إدكو</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Exclusive Weather Promo + Custom Errand Service Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className={onOpenErrandService ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <EdkuWeatherPromoBanner
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              document
                .getElementById('stores-heading')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {onOpenErrandService && (
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#334155] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#FF7100] text-white flex items-center justify-center shrink-0">
                <Bike className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                  مشاوير إدكاوي
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2">
                  وصل أو استلم أي طلب خاص من أي مكان في إدكو.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenErrandService}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#46D5D4] hover:bg-[#32B8B7] text-[#0F172A] text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
            >
              اطلب مشوار
            </button>
          </div>
        )}
      </section>

      {/* Section 2: Promotional Ads Carousel */}
      {isLoadingAds ? (
        <AdsBannerSkeleton />
      ) : currentAd ? (
        <section
          id="home-ads-banner"
          aria-label="العروض الترويجية في إدكاوي"
          onMouseEnter={() => setIsAdPaused(true)}
          onMouseLeave={() => setIsAdPaused(false)}
          className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#334155] shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            <div className="md:col-span-7 p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#FF7100]">
                  {currentAd.badgeText}
                  {currentAd.storeName ? ` · ${currentAd.storeName}` : ''}
                </p>
                <h2 className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC] headline-balance leading-snug">
                  {currentAd.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-xl">
                  {currentAd.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => handleAdAction(currentAd)}
                  className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#46D5D4] hover:bg-[#32B8B7] text-[#0F172A] text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>{currentAd.ctaLabel || 'اطلب الآن'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {ads.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveAdIdx(
                          (prev) => (prev - 1 + ads.length) % ads.length
                        )
                      }
                      aria-label="العرض السابق"
                      className="min-h-[40px] min-w-[40px] rounded-2xl bg-slate-100 dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 px-1">
                      {ads.map((adItem, idx) => (
                        <button
                          key={adItem.id}
                          type="button"
                          onClick={() => setActiveAdIdx(idx)}
                          aria-label={`انتقل للعرض ${idx + 1}`}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === activeAdIdx
                              ? 'w-5 bg-[#46D5D4]'
                              : 'w-2 bg-slate-300 dark:bg-[#334155] hover:bg-slate-400 dark:hover:bg-[#94A3B8]'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveAdIdx((prev) => (prev + 1) % ads.length)
                      }
                      aria-label="العرض التالي"
                      className="min-h-[40px] min-w-[40px] rounded-2xl bg-slate-100 dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] text-[#1E293B] dark:text-[#F8FAFC] flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-5 relative h-52 sm:h-64 md:h-auto md:min-h-[240px] bg-slate-100 dark:bg-[#10192D] overflow-hidden">
              <ResilientImage
                src={currentAd.imageUrl || ''}
                alt={currentAd.title}
                fallbackLabel={currentAd.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/50 dark:from-[#1E293B]/60 via-transparent to-transparent hidden md:block"
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 2A: Flash Deals 15-30 Minutes Live Countdown */}
      {hasLiveFlashItems && (
        <section
          aria-label="عروض خاطفة في إدكو"
          className="rounded-3xl bg-gradient-to-l from-orange-50 via-white to-cyan-50/50 dark:from-[#1E293B] dark:via-[#18233C] dark:to-[#10192D] border border-[#FF7100]/40 p-5 sm:p-6 space-y-4 shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-[#FF7100] text-white flex items-center justify-center shadow-sm">
                <Lightning weight="fill" className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC]">
                  عروض خاطفة في إدكو (١٥ - ٣٠ دقيقة)
                </h2>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                  خصومات سريعة ومباشرة قبل انتهاء المؤقت الزمني
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF7100]/15 text-[#FF7100] text-xs font-extrabold">
              <Timer weight="bold" className="w-4 h-4" />
              <span>تحديث لحظي بالثانية</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashCampaigns.map((camp) => (
              <motion.article
                key={camp.id}
                whileHover={{ y: -2 }}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] p-4 flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-[#FF7100] text-white text-[11px] font-bold">
                    {camp.badgeText || 'عرض خاطف'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] font-mono text-xs font-extrabold text-[#FF7100] tabular-nums">
                    <Timer weight="bold" className="w-3.5 h-3.5" />
                    <span>{formatFlashCountdown(camp.endsAtIso, nowMs)}</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 leading-relaxed">
                    {camp.subtitle}
                  </p>
                </div>
              </motion.article>
            ))}

            {flashProducts.slice(0, 6).map((fp) => {
              const parentStore = mergedStores.find((s) => s.id === fp.storeId);
              if (!parentStore) return null;
              const discounted = Math.max(
                1,
                Math.round(fp.price * (1 - (fp.flashDiscountPercent ?? 0) / 100))
              );
              return (
                <motion.article
                  key={`flash-${fp.id}`}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] p-4 flex items-center gap-3.5 shadow-sm"
                >
                  <ResilientImage
                    src={fp.imageUrl || parentStore.imageUrl || ''}
                    alt={fp.name}
                    fallbackLabel={fp.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#FF7100] truncate">
                        {parentStore.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#FF7100]/15 text-[#FF7100] font-mono text-[11px] font-extrabold tabular-nums">
                        {formatFlashCountdown(fp.flashSaleEndsAtIso, nowMs)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                      {fp.name}
                    </h3>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-sm font-extrabold text-[#FF7100] tabular-nums">
                          {discounted} ج.م
                        </span>
                        <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                          {fp.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenStoreMenu(parentStore)}
                        className="px-3 py-1.5 rounded-xl bg-[#46D5D4] hover:bg-[#32B8B7] text-[#0F172A] text-xs font-extrabold cursor-pointer shrink-0"
                      >
                        اطلب الآن
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2B: Edku Occasions Filter & Showcase (فطار العيلة / ليلة الفيلم / أكلات بيتي) */}
      <section aria-label="عروض المناسبات في إدكو" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-[#46D5D4]/15 text-[#0F172A] dark:text-[#46D5D4] flex items-center justify-center">
              <Sparkle weight="fill" className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                عروض المناسبات في إدكو
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                اختر المناسبة لعرض أفضل الباقات والمطاعم المتخصصة في المدينة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EDKU_OCCASION_FILTERS.map((occ) => {
              const active = selectedOccasion === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#46D5D4] text-[#0F172A] shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-[#94A3B8] hover:border-[#46D5D4] hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {occasionCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occasionCampaigns.map((camp) => (
              <article
                key={camp.id}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] p-4 flex items-center gap-3.5 shadow-sm"
              >
                <ResilientImage
                  src={camp.imageUrl || ''}
                  alt={camp.title}
                  fallbackLabel={camp.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-[#46D5D4]/15 text-[#0F172A] dark:text-[#46D5D4] text-[10px] font-extrabold">
                    {camp.occasionTag}
                  </span>
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2">
                    {camp.subtitle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Section 2C: Rotating Gamification Campaigns (/campaigns) */}
      {activeCampaigns.filter((c) => !c.isFlashDeal && !c.occasionTag).length > 0 && (
        <section aria-label="الفعاليات والتحديات النشطة" className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF7100]" />
            <h2 className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
              فعاليات وتحديات إدكاوي النشطة
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns
              .filter((c) => !c.isFlashDeal && !c.occasionTag)
              .map((camp) => (
                <article
                  key={camp.id}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div className="h-36 w-full bg-slate-100 dark:bg-[#10192D] relative">
                    <ResilientImage
                      src={camp.imageUrl || ''}
                      alt={camp.title}
                      fallbackLabel={camp.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-[#10192D]/90 border border-slate-200 dark:border-[#334155] text-[#FF7100] text-[11px] font-bold">
                      {camp.badgeText}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      {camp.subtitle}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#FF7100]">
                      {camp.multiplier && camp.multiplier > 1 && (
                        <span>مضاعفة النقاط ×{camp.multiplier}</span>
                      )}
                      {camp.rewardPoints && camp.rewardPoints > 0 && (
                        <span>+{camp.rewardPoints} نقطة مكافأة</span>
                      )}
                      {camp.targetNeighborhood && (
                        <span>حي: {camp.targetNeighborhood}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>
      )}

      {/* Section 2D: Mystery Box Deals (صندوق المفاجآت) */}
      {mysteryBoxProducts.length > 0 && (
        <section aria-label="صندوق المفاجآت" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FF7100]" />
              <h2 className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                صندوق المفاجآت بخصم حصري
              </h2>
            </div>
            <span className="text-xs text-slate-600 dark:text-[#94A3B8]">
              كميات محدودة يومياً من متاجر إدكو
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mysteryBoxProducts.slice(0, 6).map((box) => {
              const parentStore = mergedStores.find((s) => s.id === box.storeId);
              if (!parentStore) return null;
              const outOfStock =
                typeof box.stockQuantity === 'number' && box.stockQuantity <= 0;
              return (
                <article
                  key={box.id}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] p-4 flex items-center gap-4 shadow-sm"
                >
                  <ResilientImage
                    src={box.imageUrl || ''}
                    alt={box.name}
                    fallbackLabel={box.name}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF7100]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="truncate">{parentStore.name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                      {box.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#FF7100] tabular-nums">
                        {box.price} ج.م
                      </span>
                      {box.originalValueEgp &&
                        box.originalValueEgp > box.price && (
                          <span className="text-xs text-slate-500 dark:text-[#94A3B8] line-through tabular-nums">
                            {box.originalValueEgp} ج.م
                          </span>
                        )}
                    </div>
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        if (onAddMysteryBoxToCart) {
                          onAddMysteryBoxToCart(box, parentStore);
                        } else {
                          onOpenStoreMenu(parentStore);
                        }
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-[#46D5D4] hover:bg-[#32B8B7] disabled:opacity-50 text-[#0F172A] text-xs font-extrabold cursor-pointer"
                    >
                      {outOfStock ? 'نفدت الكمية' : 'احجز الصندوق الآن'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 3: Trending Now (الأكثر طلباً في إدكو) */}
      {((trendingProducts && trendingProducts.length > 0) ||
        mergedStores.some((s) => s.menuItems?.length > 0)) && (
        <section aria-label="الأكثر طلباً في إدكو" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-[#283548] border border-slate-200 dark:border-[#334155] text-[#FF7100] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                  الأكثر طلباً في إدكو الآن
                </h2>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                  الوجبات والأصناف الأكثر طلباً بين أهالي إدكو
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(trendingProducts.length > 0
              ? trendingProducts.slice(0, 4).map((p) => {
                  const parentStore = mergedStores.find((s) => s.id === p.storeId);
                  return {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    imageUrl: p.imageUrl,
                    storeName: parentStore?.name || 'متجر في إدكو',
                    store: parentStore,
                  };
                })
              : mergedStores
                  .flatMap((s) =>
                    (s.menuItems || []).slice(0, 1).map((m) => ({
                      id: m.id,
                      name: m.name,
                      price: m.price,
                      imageUrl: m.imageUrl || s.imageUrl,
                      storeName: s.name,
                      store: s,
                    }))
                  )
                  .slice(0, 4)
            ).map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                onClick={() => {
                  if (item.store) onOpenStoreMenu(item.store);
                }}
                className="group relative rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4 hover:border-[#46D5D4] transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="relative h-32 w-full rounded-2xl bg-slate-100 dark:bg-[#10192D] overflow-hidden">
                    <ResilientImage
                      src={item.imageUrl || ''}
                      alt={item.name}
                      fallbackLabel={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-white/90 dark:bg-[#10192D]/90 border border-slate-200 dark:border-[#334155] text-[#FF7100] text-[10px] font-bold">
                      الأكثر مبيعاً
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#FF7100] truncate">
                      {item.storeName}
                    </p>
                    <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-[#334155] flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#FF7100] tabular-nums">
                    {item.price} ج.م
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-[#46D5D4] text-[#0F172A] text-xs font-extrabold inline-flex items-center gap-1">
                    <span>اطلب</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Circular Categories & Store Cards Grid */}
      <section aria-labelledby="stores-heading" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="stores-heading" className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
              أقسام ومتاجر وصيدليات إدكو
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
              اختر القسم لتصفح المطاعم والمتاجر والصيدليات المتاحة الآن
            </p>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="min-h-[40px] px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] text-xs font-bold text-[#1E293B] dark:text-[#F8FAFC] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#46D5D4] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>تحديث القائمة</span>
          </button>
        </div>

        {/* Circular Category Icons */}
        <div className="flex items-start gap-4 overflow-x-auto py-2 px-1 no-scrollbar">
          {(['الكل', ...availableCategoryTabs] as const).map((cat) => {
            const active = selectedCategory === cat;
            const isComingSoon = cat === 'هدايا وإكسسوارات';
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubCategory('الكل');
                }}
                className={`flex flex-col items-center gap-2 shrink-0 group cursor-pointer focus:outline-none ${
                  isComingSoon && !active ? 'opacity-80' : ''
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md ${
                      active
                        ? 'bg-[#46D5D4] text-[#0F172A] ring-4 ring-[#46D5D4]/30 scale-105'
                        : 'bg-slate-100 dark:bg-[#283548] border border-slate-200 dark:border-[#334155] text-[#FF7100] group-hover:border-[#46D5D4]'
                    }`}
                  >
                    {cat === 'الكل' ? (
                      <LayoutGrid className="w-6 h-6" />
                    ) : cat === 'أكل بيتي' ? (
                      <ChefHat className="w-6 h-6" />
                    ) : cat === 'أسماك وبحريات' ? (
                      <Fish className="w-6 h-6" />
                    ) : cat === 'مشويات ومطاعم' ? (
                      <Flame className="w-6 h-6" />
                    ) : cat === 'مخابز وفطائر' ? (
                      <Croissant className="w-6 h-6" />
                    ) : cat === 'سوبر ماركت' ? (
                      <ShoppingBasket className="w-6 h-6" />
                    ) : cat === 'صيدليات' ? (
                      <Pill className="w-6 h-6" />
                    ) : cat === 'مستحضرات تجميل' ? (
                      <Sparkles className="w-6 h-6" />
                    ) : cat === 'هدايا وإكسسوارات' ? (
                      <Gift className="w-6 h-6" />
                    ) : (
                      <UtensilsCrossed className="w-6 h-6" />
                    )}
                  </div>
                  {isComingSoon && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FF7100] text-white text-[9px] font-extrabold whitespace-nowrap shadow">
                      قريباً
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold transition text-center max-w-[84px] truncate ${
                    active
                      ? 'text-[#0F172A] dark:text-[#46D5D4]'
                      : 'text-[#1E293B] dark:text-[#F8FAFC] group-hover:text-[#FF7100]'
                  }`}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-categories Filter Controls & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            {(selectedCategory === 'مشويات ومطاعم' ||
            selectedCategory === 'الكل' ||
            selectedCategory === 'أسماك وبحريات'
              ? [
                  'الكل',
                  'مشويات',
                  'مخبوزات',
                  'أسماك',
                  'كشري',
                  'بروست',
                  'مشروبات',
                  'حلويات',
                ]
              : selectedCategory === 'مستحضرات تجميل'
              ? ['الكل', 'مكياج', 'عناية بالبشرة', 'عطور']
              : ['الكل']
            ).map((sub) => {
              const isSubActive = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-3.5 py-2 text-xs font-extrabold rounded-2xl transition cursor-pointer whitespace-nowrap ${
                    isSubActive
                      ? 'bg-[#46D5D4] text-[#0F172A] shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-600 dark:text-[#94A3B8]">ترتيب:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-2xl border transition cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'rating'
                  ? 'bg-[#46D5D4] border-[#46D5D4] text-[#0F172A]'
                  : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] text-slate-600 dark:text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {isTopRatedUnlocked ? (
                <Star className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>الأكثر تقييماً</span>
            </button>
          </div>
        </div>

        {sortBy === 'rating' && !isTopRatedUnlocked && (
          <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-[#FF7100]/40 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF7100]/15 text-[#FF7100] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                  قائمة الأعلى تقييماً تُفتح عند وصول إجمالي طلباتك إلى ١٠٠ ج.م
                </p>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                  محتاج تطلب بـ{' '}
                  <span className="font-mono font-bold text-[#FF7100]">
                    {Math.max(1, Math.ceil(100 - customerTotalSpent))}
                  </span>{' '}
                  ج.م كمان عشان تفتح الترتيب بأعلى التقييمات
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSortBy('default')}
              className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#10192D] border border-slate-200 dark:border-[#334155] text-xs font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#46D5D4] cursor-pointer"
            >
              عرض الترتيب الافتراضي
            </button>
          </div>
        )}

        {storesError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-200 text-sm"
          >
            تعذر الاتصال بمجموعة المتاجر: {storesError}
          </div>
        )}

        {isLoadingStores && mergedStores.length === 0 ? (
          <StoresGridSkeleton count={4} />
        ) : mergedStores.length === 0 ? (
          <EmptyState
            icon={StoreIcon}
            title="لا توجد متاجر منشورة حالياً"
            description="تُضاف المتاجر والمطاعم والصيدليات الحقيقية مع صورها الأصلية ومواقعها مباشرة من لوحة إدارة إدكاوي."
          />
        ) : filteredStores.length === 0 ? (
          <EmptyState
            icon={selectedCategory === 'هدايا وإكسسوارات' ? Gift : Search}
            title={
              selectedCategory === 'هدايا وإكسسوارات'
                ? 'قسم الهدايا والإكسسوارات قريباً في إدكو'
                : 'لا توجد نتائج مطابقة في هذا التصنيف حالياً'
            }
            description={
              selectedCategory === 'هدايا وإكسسوارات'
                ? 'نجهّز حالياً لانضمام أفضل محلات الهدايا والإكسسوارات داخل مدينة إدكو. تصفح باقي الأقسام المتاحة الآن.'
                : 'جرّب اختيار تصنيف آخر أو مسح كلمة البحث لعرض جميع متاجر إدكو.'
            }
            actionLabel="عرض كل المتاجر والصيدليات"
            onAction={() => {
              setSelectedCategory('الكل');
              setSelectedSubCategory('الكل');
              setSelectedOccasion('الكل');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStores.map((store, idx) => {
                const storeCartCount = getStoreCartCount(store.id);
                const isOpen = isStoreCurrentlyOpen(store);
                const isFav = favoriteStoreIds.includes(store.id);
                const isPharmacy = store.category === 'صيدليات';
                const hasMinOrder =
                  Boolean(store.minOrderAmount) &&
                  (store.minOrderAmount ?? 0) > 0;

                return (
                  <motion.article
                    key={store.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: Math.min(idx, 6) * 0.04 }}
                    className="relative rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-[#46D5D4] transition-colors overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl"
                  >
                    {onToggleFavoriteStore && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteStore(store.id);
                        }}
                        aria-label={
                          isFav
                            ? `إزالة ${store.name} من المفضلة`
                            : `إضافة ${store.name} إلى المفضلة`
                        }
                        className="absolute top-3.5 left-3.5 z-20 min-h-[42px] min-w-[42px] rounded-full bg-white/90 dark:bg-[#10192D]/85 border border-slate-200 dark:border-[#334155] backdrop-blur-md shadow-md flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFav
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-slate-500 dark:text-[#94A3B8] hover:text-rose-500'
                          }`}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenStoreMenu(store)}
                      aria-label={`فتح صفحة ${store.name}`}
                      className="text-right w-full flex-1 flex flex-col justify-between cursor-pointer group focus:outline-none"
                    >
                      <div className="w-full">
                        <div className="relative h-56 sm:h-60 w-full bg-slate-100 dark:bg-[#10192D] overflow-hidden">
                          <ResilientImage
                            src={store.imageUrl || ''}
                            alt={store.name}
                            fallbackLabel={store.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
                              !isOpen ? 'grayscale-[35%] opacity-90' : ''
                            }`}
                          />

                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-black/15 to-transparent"
                          />

                          {isPharmacy && (
                            <span className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md">
                              <Pill className="w-3.5 h-3.5" />
                              <span>يستقبل الروشتات</span>
                            </span>
                          )}

                          <div className="absolute bottom-3.5 inset-x-4 flex items-center justify-between gap-2">
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#10192D]/90 border border-slate-200 dark:border-[#334155] text-[#1E293B] dark:text-[#F8FAFC] text-xs font-bold">
                                <Clock
                                  className="w-3.5 h-3.5 text-[#FF7100]"
                                  aria-hidden="true"
                                />
                                <span>
                                  <span className="font-mono tabular-nums">
                                    {store.prepTimeMinutes ??
                                      store.deliveryTimeMinutes}
                                  </span>{' '}
                                  دقيقة
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold">
                                <Lock
                                  className="w-3.5 h-3.5 text-white"
                                  aria-hidden="true"
                                />
                                <span>مغلق</span>
                                {store.openingTime && (
                                  <span className="text-[10px] text-rose-100 font-normal mr-1">
                                    (يفتح {store.openingTime})
                                  </span>
                                )}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#10192D]/90 border border-slate-200 dark:border-[#334155] text-[#1E293B] dark:text-[#F8FAFC] text-xs font-bold">
                              <Star
                                className="w-3.5 h-3.5 fill-[#FF7100] text-[#FF7100]"
                                aria-hidden="true"
                              />
                              <span className="font-mono tabular-nums">
                                {store.rating.toFixed(1)}
                              </span>
                              {typeof store.reviewCount === 'number' &&
                                store.reviewCount > 0 && (
                                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] tabular-nums">
                                    ({store.reviewCount})
                                  </span>
                                )}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 pb-4">
                          <h3 className="text-xl font-bold text-[#1E293B] dark:text-[#F8FAFC] group-hover:text-[#FF7100] transition-colors leading-snug">
                            {store.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
                            {store.category} · {store.neighborhood}
                            {(store.isHomeFood ||
                              store.category === 'أكل بيتي') && (
                              <>
                                {' '}
                                ·{' '}
                                <span className="font-semibold text-[#FF7100]">
                                  أكل بيتي
                                </span>
                              </>
                            )}
                            {hasMinOrder && !isPharmacy ? (
                              <>
                                {' '}
                                · الحد الأدنى{' '}
                                <span className="font-mono font-semibold text-[#1E293B] dark:text-[#F8FAFC] tabular-nums">
                                  {store.minOrderAmount}
                                </span>{' '}
                                ج.م
                              </>
                            ) : null}
                          </p>

                          <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed line-clamp-2 mt-2.5">
                            {store.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-5 pt-4 border-t border-slate-200 dark:border-[#334155] w-full flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] truncate">
                          {!isOpen ? (
                            <span className="font-bold text-rose-500 dark:text-rose-400">
                              مغلق حالياً
                            </span>
                          ) : storeCartCount > 0 ? (
                            <span className="font-bold text-[#FF7100] tabular-nums">
                              في السلة ({storeCartCount})
                            </span>
                          ) : (
                            <>
                              <Truck
                                className="w-4 h-4 text-[#FF7100] shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                التوصيل{' '}
                                <strong className="text-[#1E293B] dark:text-[#F8FAFC]">
                                  <span className="font-mono tabular-nums">
                                    {store.deliveryFee}
                                  </span>{' '}
                                  ج.م
                                </strong>
                              </span>
                            </>
                          )}
                        </span>

                        <span className="min-h-[42px] px-4 py-2 rounded-2xl bg-[#46D5D4] group-hover:bg-[#32B8B7] text-[#0F172A] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors">
                          <span>
                            {isPharmacy
                              ? 'إرسال روشتة'
                              : isOpen
                              ? 'تصفح القائمة'
                              : 'عرض القائمة'}
                          </span>
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </div>
                    </button>
                  </motion.article>
                );
              })}
            </div>

            {paginatedStoresQuery.hasNextPage && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={paginatedStoresQuery.isFetchingNextPage}
                  onClick={() => void paginatedStoresQuery.fetchNextPage()}
                  className="min-h-[46px] px-8 py-3 rounded-2xl bg-[#46D5D4] hover:bg-[#32B8B7] disabled:opacity-60 text-[#0F172A] text-sm font-extrabold cursor-pointer shadow-md"
                >
                  {paginatedStoresQuery.isFetchingNextPage
                    ? 'جارٍ تحميل المزيد...'
                    : 'عرض المزيد من المتاجر'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
