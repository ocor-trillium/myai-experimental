import { feedbackFixture } from '@/mocks/feedback';
import type { FeedbackCategory, FeedbackItem } from '@/types/domain';

import { classifyFeedback } from './myaiService';
import { notifyTeams } from './teamsService';
import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * Feedback inbox (OB-07).
 *
 * The pipeline is:
 *   1. Capture user text.
 *   2. Classify with MYAI (`classifyFeedback`).
 *   3. Route to the proper Teams channel (`notifyTeams`).
 *
 * TODO(BACKEND):
 *   GET    /feedback                          -> FeedbackItem[]
 *   POST   /feedback                          -> FeedbackItem
 *   POST   /feedback/{id}/classify            -> FeedbackItem (manual override)
 *   POST   /feedback/{id}/notify-teams        -> FeedbackItem
 */

const inbox = new Map<string, FeedbackItem>(feedbackFixture.map((f) => [f.id, { ...f }]));

const channelByCategory: Record<FeedbackCategory, string | undefined> = {
  bug: '#onboarding-bugs',
  feature_request: '#onboarding-features',
  question: '#onboarding-help',
  unclassified: undefined,
};

export async function listFeedback(): Promise<FeedbackItem[]> {
  return withCircuitBreaker('feedback:list', async () => {
    await simulateLatency();
    return Array.from(inbox.values())
      .map((f) => ({ ...f }))
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  });
}

export async function submitFeedback(submittedBy: string, text: string): Promise<FeedbackItem> {
  return withCircuitBreaker('feedback:submit', async () => {
    await simulateLatency(150, 300);
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      throw new Error('Feedback text cannot be empty.');
    }
    if (trimmed.length > 2_000) {
      throw new Error('Feedback text is too long (max 2000 chars).');
    }

    const { category, confidence } = await classifyFeedback(trimmed);
    const channel = channelByCategory[category];
    let notifiedAt: string | undefined;
    if (channel) {
      await notifyTeams(channel, `New ${category}: ${trimmed.slice(0, 140)}`);
      notifiedAt = new Date().toISOString();
    }

    const item: FeedbackItem = {
      id: `fb-${Date.now()}`,
      submittedBy,
      submittedAt: new Date().toISOString(),
      text: trimmed,
      category,
      confidence,
      ...(channel ? { notifiedTeamsChannel: channel } : {}),
      ...(notifiedAt ? { notifiedAt } : {}),
    };
    inbox.set(item.id, item);
    return { ...item };
  });
}

export async function reclassify(
  id: string,
  category: FeedbackCategory,
): Promise<FeedbackItem | null> {
  return withCircuitBreaker(`feedback:reclassify:${id}`, async () => {
    await simulateLatency(120, 250);
    const current = inbox.get(id);
    if (!current) return null;
    const channel = channelByCategory[category];
    const next: FeedbackItem = {
      ...current,
      category,
      confidence: 1,
      ...(channel ? { notifiedTeamsChannel: channel } : {}),
    };
    inbox.set(id, next);
    return { ...next };
  });
}
