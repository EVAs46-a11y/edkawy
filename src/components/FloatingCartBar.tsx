import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from '@phosphor-icons/react';
import { CartItem } from '../types/edkawi';
import {
  calculateCartTotals,
  formatArabicCartCount,
} from '../utils/orderLogic';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenCart: () => void;
}

export function FloatingCartBar({ cart, onOpenCart }: FloatingCartBarProps) {
  if (cart.length === 0) return null;

  const totals = calculateCartTotals(cart);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="region"
      aria-label="ملخص السلة العائم"
      className="fixed bottom-[4.5rem] md:bottom-5 inset-x-3 sm:inset-x-6 z-40 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto rounded-2xl bg-white/90 dark:bg-[#1E293B]/92 backdrop-blur-xl text-[#1E293B] dark:text-[#F8FAFC] border border-slate-200/80 dark:border-[#334155]/90 shadow-[0_18px_42px_-10px_rgba(15,23,42,0.28)] px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-2xl bg-[#FF7100] text-white flex items-center justify-center font-mono font-extrabold text-xs sm:text-sm tabular-nums shrink-0 shadow-sm">
            {totals.itemCount}
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-extrabold text-[#1E293B] dark:text-[#F8FAFC] truncate">
              <span>{formatArabicCartCount(totals.itemCount)}</span>{' '}
              <span className="hidden sm:inline text-slate-500 dark:text-[#94A3B8] font-normal">
                · {cart[0].storeName}
              </span>
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] truncate">
              الإجمالي شامل التوصيل:{' '}
              <span className="font-mono font-extrabold text-[#1E293B] dark:text-[#F8FAFC] tabular-nums">
                {totals.totalAmount}
              </span>{' '}
              ج.م
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onOpenCart}
          className="min-h-[42px] py-2 sm:py-2.5 px-4 sm:px-5 rounded-2xl bg-[#46D5D4] hover:bg-[#32C2C1] text-[#0F172A] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_6px_18px_rgba(70,213,212,0.3)]"
        >
          <ShoppingBag weight="bold" className="w-4 h-4" aria-hidden="true" />
          <span>عرض السلة</span>
          <ArrowLeft weight="bold" className="w-3.5 h-3.5" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>
  );
}
