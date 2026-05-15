import type { SignedUrl, SignedUrlScope } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * SharePoint document service.
 *
 * Per OnboardingContext: signed URLs MUST expire in 1 hour for sensitive
 * documents. Generation happens server-side; the browser only consumes the
 * signed URL.
 *
 * TODO(BACKEND): POST {VITE_API_BASE_URL}/sharepoint/sign
 *   body: { folderId: string, fileId?: string, scope: SignedUrlScope }
 *   resp: { url, scope, expiresAt }
 *
 * The backend MUST authorize the caller against the folder ACL before
 * issuing a signature.
 */

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getSignedUrl(folderId: string, scope: SignedUrlScope): Promise<SignedUrl> {
  return withCircuitBreaker(`sharepoint:sign:${folderId}:${scope}`, async () => {
    if (!folderId || !folderId.startsWith('SP-')) {
      throw new Error('Invalid SharePoint folder id.');
    }
    await simulateLatency(150, 300);
    return {
      url: `https://sharepoint.example/signed/${folderId}?scope=${scope}&token=mock-${Date.now()}`,
      scope,
      expiresAt: new Date(Date.now() + ONE_HOUR_MS).toISOString(),
    };
  });
}
