// src/features/invites/hooks/useBootstrap.ts
// Resolves, for an authenticated user, which destination they belong in:
//   'has-group'        → user already belongs to a family group → main app
//   'has-invite'       → no group yet, but a pending invite exists → accept screen
//   'needs-onboarding' → no group and no invite → create-a-group onboarding
// This is the single source of truth for post-auth routing.

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/core/auth/sessionManager';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import { fetchPendingInviteForEmail } from '../repository/invites.repository';

export type BootstrapDestination = 'has-group' | 'has-invite' | 'needs-onboarding';

export function useBootstrapQuery(enabled: boolean) {
  return useQuery<BootstrapDestination, Error>({
    queryKey: ['bootstrap'],
    enabled,
    staleTime: 0,
    queryFn: async () => {
      const group = await fetchFamilyGroup();
      if (group) return 'has-group';

      const user = await getCurrentUser();
      const email = user?.email;
      if (email) {
        const invite = await fetchPendingInviteForEmail(email);
        if (invite) return 'has-invite';
      }

      return 'needs-onboarding';
    },
  });
}
