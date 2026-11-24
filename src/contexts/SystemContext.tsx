import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SystemMaintenanceConfig } from '../types/edkawi';
import {
  ADMIN_BYPASS_PHONE,
  ADMIN_WHATSAPP_URL,
  AdminBypassCheckInput,
  GlobalGuardResolution,
  isAdminBypassUser,
  resolveGlobalGuardStatus,
} from '../utils/systemGuardLogic';

export {
  ADMIN_BYPASS_PHONE,
  ADMIN_WHATSAPP_URL,
  isAdminBypassUser,
  resolveGlobalGuardStatus,
};
export type { AdminBypassCheckInput, GlobalGuardResolution };

export const DEFAULT_SYSTEM_CONFIG: SystemMaintenanceConfig = {
  maintenanceMode: false,
  maintenanceMessage:
    'نقوم حالياً بإجراء تحديثات سريعة لتحسين خدمة توصيل إدكاوي في مدينة إدكو. سنعود للعمل خلال دقائق بإذن الله.',
  registrationMode: false,
  registrationMessage:
    'تم تسجيل حسابك بنجاح! منصة إدكاوي حالياً في مرحلة التسجيل المسبق والتجهيز للافتتاح الرسمي في مدينة إدكو.',
  surgeEnabled: false,
  surgeMultiplier: 1.5,
  smtpEnabled: true,
  paymentMethods: { cash: true, wallet: true, visa: false },
  updatedBy: '',
  updatedAtIso: '',
};

interface SystemContextValue {
  systemConfig: SystemMaintenanceConfig;
  maintenanceMode: boolean;
  registrationMode: boolean;
  isSystemConfigLoading: boolean;
}

const SystemContext = createContext<SystemContextValue>({
  systemConfig: DEFAULT_SYSTEM_CONFIG,
  maintenanceMode: false,
  registrationMode: false,
  isSystemConfigLoading: false,
});

interface SystemProviderProps {
  children: ReactNode;
}

export function SystemProvider({ children }: SystemProviderProps) {
  const [hasSignedInSession, setHasSignedInSession] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [systemConfig, setSystemConfig] =
    useState<SystemMaintenanceConfig>(DEFAULT_SYSTEM_CONFIG);
  const [isSystemConfigLoading, setIsSystemConfigLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setHasSignedInSession(Boolean(firebaseUser));
      setAuthInitialized(true);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authInitialized || !hasSignedInSession) {
      setSystemConfig(DEFAULT_SYSTEM_CONFIG);
      setIsSystemConfigLoading(false);
      return;
    }

    setIsSystemConfigLoading(true);
    const systemDocRef = doc(db, 'appConfig', 'system');
    const unsubscribeSnapshot = onSnapshot(
      systemDocRef,
      (snap) => {
        if (!snap.exists()) {
          setSystemConfig(DEFAULT_SYSTEM_CONFIG);
          setIsSystemConfigLoading(false);
          return;
        }
        const d = snap.data() ?? {};
        const rawPm = (d.paymentMethods ?? {}) as Record<string, unknown>;
        const updatedAtIso =
          typeof d.updatedAt === 'object' &&
          d.updatedAt !== null &&
          'toDate' in d.updatedAt &&
          typeof (d.updatedAt as { toDate: () => Date }).toDate === 'function'
            ? (d.updatedAt as { toDate: () => Date }).toDate().toISOString()
            : '';

        setSystemConfig({
          maintenanceMode: Boolean(d.maintenanceMode),
          maintenanceMessage:
            typeof d.maintenanceMessage === 'string' && d.maintenanceMessage.trim()
              ? d.maintenanceMessage.trim()
              : DEFAULT_SYSTEM_CONFIG.maintenanceMessage,
          registrationMode: Boolean(d.registrationMode),
          registrationMessage:
            typeof d.registrationMessage === 'string' && d.registrationMessage.trim()
              ? d.registrationMessage.trim()
              : DEFAULT_SYSTEM_CONFIG.registrationMessage ?? '',
          surgeEnabled: Boolean(d.surgeEnabled),
          surgeMultiplier:
            typeof d.surgeMultiplier === 'number' && d.surgeMultiplier >= 1
              ? Math.min(3, d.surgeMultiplier)
              : 1.5,
          smtpEnabled: d.smtpEnabled !== false,
          paymentMethods: {
            cash: rawPm.cash !== false,
            wallet: rawPm.wallet !== false,
            visa: Boolean(rawPm.visa),
          },
          updatedBy: String(d.updatedBy ?? ''),
          updatedAtIso,
        });
        setIsSystemConfigLoading(false);
      },
      () => {
        setSystemConfig(DEFAULT_SYSTEM_CONFIG);
        setIsSystemConfigLoading(false);
      }
    );

    return () => unsubscribeSnapshot();
  }, [authInitialized, hasSignedInSession]);

  const value = useMemo<SystemContextValue>(
    () => ({
      systemConfig,
      maintenanceMode: Boolean(systemConfig.maintenanceMode),
      registrationMode: Boolean(systemConfig.registrationMode),
      isSystemConfigLoading,
    }),
    [systemConfig, isSystemConfigLoading]
  );

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  );
}

export function useSystemConfig(): SystemContextValue {
  return useContext(SystemContext);
}
