import { PortalRole, UserProfileRecord } from '../types/edkawi';
import { normalizeEgyptPhoneOrEmpty } from './orderLogic';

export const ADMIN_BYPASS_PHONE = '01032874716';
export const ADMIN_WHATSAPP_URL = 'https://wa.me/201032874716';

const ADMIN_ALLOWLIST_EMAILS = new Set([
  'vortexstore.team@gmail.com',
  'alaslybys46@gmail.com',
]);

export interface AdminBypassAuthSnapshot {
  email?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  phoneNumber?: string | null;
}

export interface AdminBypassCheckInput {
  user: AdminBypassAuthSnapshot | null;
  userProfile: Pick<UserProfileRecord, 'phone' | 'role'> | null;
  activePortal: PortalRole;
}

export function isAdminBypassUser({
  user,
  userProfile,
  activePortal,
}: AdminBypassCheckInput): boolean {
  if (!user || user.isAnonymous) {
    return false;
  }

  if (activePortal === 'admin') {
    return true;
  }

  const normalizedEmail = (user.email ?? '').trim().toLowerCase();
  if (
    normalizedEmail &&
    ADMIN_ALLOWLIST_EMAILS.has(normalizedEmail) &&
    Boolean(user.emailVerified)
  ) {
    return true;
  }

  const profilePhone = normalizeEgyptPhoneOrEmpty(userProfile?.phone ?? '');
  const authPhone = normalizeEgyptPhoneOrEmpty(user.phoneNumber ?? '');

  return (
    profilePhone === ADMIN_BYPASS_PHONE || authPhone === ADMIN_BYPASS_PHONE
  );
}

export type GlobalGuardResolution =
  | 'allow'
  | 'loading'
  | 'maintenance'
  | 'pre_registration';

export function resolveGlobalGuardStatus(params: {
  isAdminBypass: boolean;
  isSystemConfigLoading: boolean;
  maintenanceMode: boolean;
  registrationMode: boolean;
}): GlobalGuardResolution {
  if (params.isAdminBypass) {
    return 'allow';
  }
  if (params.isSystemConfigLoading) {
    return 'loading';
  }
  if (params.maintenanceMode) {
    return 'maintenance';
  }
  if (params.registrationMode) {
    return 'pre_registration';
  }
  return 'allow';
}
