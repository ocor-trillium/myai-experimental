import { initialMayaConversation, mayaScriptedReplies } from '@/mocks/maya';
import type { ChatMessage, FeedbackCategory } from '@/types/domain';

import { simulateLatency, withCircuitBreaker } from './transport';

/**
 * MYAI gateway client.
 *
 * Powers two surfaces:
 *  - Maya conversational onboarding (OB-02)
 *  - Feedback auto-classification (OB-07)
 *
 * Zero-chat-monitoring contract: the client only sends what the user
 * explicitly typed. Never read clipboards, focus events, or other
 * implicit signals.
 *
 * TODO(MYAI): replace with the streaming endpoint
 *   POST {VITE_API_BASE_URL}/myai/chat
 *   POST {VITE_API_BASE_URL}/myai/classify
 * Streaming will be Server-Sent Events; the UI already supports
 * appending messages incrementally.
 */

let scriptIndex = 0;

export async function getInitialConversation(): Promise<ChatMessage[]> {
  return withCircuitBreaker('myai:initial', async () => {
    await simulateLatency(80, 200);
    return initialMayaConversation.map((m) => ({ ...m }));
  });
}

export async function sendMayaMessage(_userText: string): Promise<ChatMessage> {
  return withCircuitBreaker('myai:chat', async () => {
    await simulateLatency(400, 900);
    const reply = mayaScriptedReplies[scriptIndex % mayaScriptedReplies.length] ?? 'Got it.';
    scriptIndex += 1;
    return {
      id: `maya-${Date.now()}`,
      role: 'maya',
      text: reply,
      timestamp: new Date().toISOString(),
    };
  });
}

export async function submitMayaCard(
  cardId: string,
  values: Record<string, string>,
): Promise<ChatMessage> {
  return withCircuitBreaker('myai:card', async () => {
    await simulateLatency(300, 700);
    const summary = Object.entries(values)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    return {
      id: `maya-card-ack-${Date.now()}`,
      role: 'maya',
      text: `Thanks! I saved your answers (${summary}). I will use them for the next steps.`,
      timestamp: new Date().toISOString(),
      cardSubmittedValues: { ...values, _cardId: cardId },
    };
  });
}

/**
 * Feedback auto-classification (OB-07).
 *
 * In the real implementation this is a single MYAI call returning
 * {category, confidence, reasoning}. The reasoning is logged server-side
 * and never exposed to non-admin users to avoid prompt-leak issues.
 */
export async function classifyFeedback(
  text: string,
): Promise<{ category: FeedbackCategory; confidence: number }> {
  return withCircuitBreaker('myai:classify', async () => {
    await simulateLatency(250, 600);
    const lowered = text.toLowerCase();
    if (
      lowered.includes('error') ||
      lowered.includes('broken') ||
      lowered.includes('bug') ||
      lowered.includes('not working') ||
      lowered.includes('never arrived') ||
      lowered.includes('failed')
    ) {
      return { category: 'bug', confidence: 0.91 };
    }
    if (
      lowered.includes('would be great') ||
      lowered.includes('could you') ||
      lowered.includes('feature') ||
      lowered.includes('add ') ||
      lowered.includes('please')
    ) {
      return { category: 'feature_request', confidence: 0.84 };
    }
    if (
      lowered.includes('?') ||
      lowered.includes('how do') ||
      lowered.includes('what is') ||
      lowered.includes('where can')
    ) {
      return { category: 'question', confidence: 0.76 };
    }
    return { category: 'unclassified', confidence: 0.4 };
  });
}
