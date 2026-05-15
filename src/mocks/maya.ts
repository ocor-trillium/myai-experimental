import type { AdaptiveCard, ChatMessage } from '@/types/domain';

const now = () => new Date().toISOString();

const profileCard: AdaptiveCard = {
  id: 'card-profile',
  title: 'Confirm your profile',
  description: 'I have a draft from your offer letter. Please confirm or edit the fields.',
  submitLabel: 'Confirm',
  fields: [
    {
      id: 'employee_id',
      label: 'Employee ID',
      kind: 'employee_id',
      placeholder: 'EMP-XXXXX',
      required: true,
    },
    {
      id: 'corporate_email',
      label: 'Corporate email',
      kind: 'email',
      placeholder: 'name@trillium.example',
      required: true,
    },
    {
      id: 'phone',
      label: 'Mobile phone (E.164)',
      kind: 'phone',
      placeholder: '+1 555 010 0101',
      required: false,
    },
    {
      id: 'preferred_pronouns',
      label: 'Preferred pronouns',
      kind: 'select',
      required: false,
      options: [
        { value: 'she_her', label: 'She / Her' },
        { value: 'he_him', label: 'He / Him' },
        { value: 'they_them', label: 'They / Them' },
        { value: 'prefer_not', label: 'Prefer not to say' },
      ],
    },
  ],
};

export const initialMayaConversation: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'maya',
    text: "Hi! I'm Maya, your onboarding assistant. I'll capture the few things I still need to set you up.",
    timestamp: now(),
  },
  {
    id: 'msg-2',
    role: 'maya',
    text: 'Take a look at this card and confirm the data is correct:',
    timestamp: now(),
    card: profileCard,
  },
];

/**
 * Scripted "AI" responses used by the Maya mock.
 *
 * TODO(MYAI): replace with the real MYAI streaming endpoint. The real call
 * will return tokens incrementally; the UI already renders messages one at a
 * time so swapping is local to `myaiService.sendMayaMessage`.
 */
export const mayaScriptedReplies: string[] = [
  'Got it. Let me note that down.',
  'Thanks! I will use this to request the right tools for your role.',
  'One more thing — do you want me to schedule the welcome call this week?',
  'Perfect. I am updating your profile in the directory now.',
];
