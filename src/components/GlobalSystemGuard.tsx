import { ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  isAdminBypassUser,
  resolveGlobalGuardStatus,
  useSystemConfig,
} from '../contexts/SystemContext';
import { LegalSectionKey, PortalRole, UserProfileRecord } from '../types/edkawi';
import { EdkawySplashScreen } from './EdkawySplashScreen';
import { MaintenancePage, PreRegistrationPage } from './SystemStatusPages';

interface GlobalSystemGuardProps {
  user: User | null;
  userProfile: UserProfileRecord | null;
  activePortal: PortalRole;
  isSignedIn: boolean;
  isGuestCustomer: boolean;
  onOpenAdminLogin: () => void;
  onOpenLegalModal: (section?: LegalSectionKey) => void;
  onSignOut: () => void;
  children: ReactNode;
}

export function GlobalSystemGuard({
  user,
  userProfile,
  activePortal,
  isSignedIn,
  isGuestCustomer,
  onOpenAdminLogin,
  onOpenLegalModal,
  onSignOut,
  children,
}: GlobalSystemGuardProps) {
  const {
    systemConfig,
    maintenanceMode,
    registrationMode,
    isSystemConfigLoading,
  } = useSystemConfig();

  const isAdminBypass = isAdminBypassUser({
    user,
    userProfile,
    activePortal,
  });

  const guardStatus = resolveGlobalGuardStatus({
    isAdminBypass,
    isSystemConfigLoading,
    maintenanceMode,
    registrationMode,
  });

  if (guardStatus === 'loading') {
    return (
      <EdkawySplashScreen
        isLoading={true}
        statusText="جارٍ التحقق من حالة المنصة وإعدادات التشغيل..."
      />
    );
  }

  if (guardStatus === 'maintenance') {
    return (
      <MaintenancePage
        config={systemConfig}
        isSignedIn={isSignedIn}
        isGuestCustomer={isGuestCustomer}
        userName={userProfile?.name || user?.displayName || undefined}
        onOpenAdminLogin={onOpenAdminLogin}
        onOpenLegalModal={onOpenLegalModal}
        onSignOut={onSignOut}
      />
    );
  }

  if (guardStatus === 'pre_registration') {
    return (
      <PreRegistrationPage
        config={systemConfig}
        isSignedIn={isSignedIn}
        isGuestCustomer={isGuestCustomer}
        userName={userProfile?.name || user?.displayName || undefined}
        onOpenAdminLogin={onOpenAdminLogin}
        onOpenLegalModal={onOpenLegalModal}
        onSignOut={onSignOut}
      />
    );
  }

  return <>{children}</>;
}
