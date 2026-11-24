import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdkawyPinEmblem } from './AdkawyLogo';

interface AnimatedLogoProps {
  onComplete?: () => void;
  autoAdvanceMs?: number;
}

export default function AnimatedLogo({
  onComplete,
  autoAdvanceMs = 2400,
}: AnimatedLogoProps) {
  useEffect(() => {
    if (!onComplete) return;
    const timer = window.setTimeout(onComplete, autoAdvanceMs);
    return () => window.clearTimeout(timer);
  }, [onComplete, autoAdvanceMs]);

  return (
    <div
      dir="rtl"
      className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-white dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] overflow-hidden px-6 select-none"
    >
      {/* Subtle Turquoise + Orange ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-1/4 w-80 h-80 rounded-full bg-[#46D5D4]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-[#FF7100]/12 blur-3xl"
      />

      {/* 1. Location Pin + Scooter bouncing in from top & floating continuously */}
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 10,
          duration: 1,
        }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl p-4"
        >
          <img
            src="/assets/aistudio/logo_fb0191f4.png"
            alt="شعار إدكاوي"
            className="w-full h-full object-contain rounded-2xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <AdkawyPinEmblem className="sr-only" />
        </motion.div>
      </motion.div>

      {/* 2. Arabic Brand Name rising smoothly from below */}
      <motion.h1
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.75, type: 'spring' }}
        className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-[#FF7100] drop-shadow-sm"
      >
        إدكاوي
      </motion.h1>

      {/* 3. English Brand Name revealing with shimmer & tracking settle */}
      <motion.div
        dir="ltr"
        initial={{ opacity: 0, letterSpacing: '10px' }}
        animate={{ opacity: 1, letterSpacing: '3px' }}
        transition={{ delay: 0.95, duration: 0.9 }}
        className="relative mt-2 overflow-hidden"
      >
        <span className="text-xl md:text-2xl font-extrabold text-[#1E293B] dark:text-[#F8FAFC]">
          EDKAWY
        </span>
        <motion.span
          aria-hidden="true"
          initial={{ x: '-120%' }}
          animate={{ x: '220%' }}
          transition={{ delay: 1.1, duration: 0.95, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-[#46D5D4]/65 to-transparent skew-x-[-20deg]"
        />
      </motion.div>

      {/* Subtle Turquoise Progress Line & Skip Affordance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <div className="w-44 h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: autoAdvanceMs / 1000, ease: 'easeOut' }}
            style={{ transformOrigin: 'right' }}
            className="h-full bg-gradient-to-l from-[#46D5D4] to-[#FF7100]"
          />
        </div>

        {onComplete && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onComplete}
            className="min-h-[44px] px-5 py-2 rounded-2xl text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            الدخول مباشرة
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
