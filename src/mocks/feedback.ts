import type { FeedbackItem } from '@/types/domain';

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const feedbackFixture: FeedbackItem[] = [
  {
    id: 'fb-001',
    submittedBy: 'emp-001',
    submittedAt: hoursAgo(36),
    text: 'The Slack invite never arrived in my inbox. I had to ask my manager to resend it.',
    category: 'bug',
    confidence: 0.92,
    notifiedTeamsChannel: '#onboarding-bugs',
    notifiedAt: hoursAgo(35),
  },
  {
    id: 'fb-002',
    submittedBy: 'emp-002',
    submittedAt: hoursAgo(20),
    text: 'It would be great if Maya could schedule the welcome call directly on my calendar.',
    category: 'feature_request',
    confidence: 0.88,
    notifiedTeamsChannel: '#onboarding-features',
    notifiedAt: hoursAgo(19),
  },
  {
    id: 'fb-003',
    submittedBy: 'emp-004',
    submittedAt: hoursAgo(6),
    text: 'How do I rotate the production break-glass credentials issued during onboarding?',
    category: 'question',
    confidence: 0.74,
  },
  {
    id: 'fb-004',
    submittedBy: 'emp-001',
    submittedAt: hoursAgo(1),
    text: 'Quick note from Ana about the dashboard.',
    category: 'unclassified',
    confidence: 0.0,
  },
];
