import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { useAsync } from '@/hooks/useAsync';
import {
  CircuitOpenError,
  getInitialConversation,
  sendMayaMessage,
  submitMayaCard,
} from '@/services';
import type { AdaptiveCard, ChatMessage } from '@/types/domain';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,}$/;
const EMP_ID_RE = /^EMP-\d{3,}$/i;

function validate(field: AdaptiveCard['fields'][number], value: string): string | null {
  const trimmed = value.trim();
  if (field.required && trimmed.length === 0) return 'Required.';
  if (trimmed.length === 0) return null;
  if (field.kind === 'email' && !EMAIL_RE.test(trimmed)) return 'Invalid email.';
  if (field.kind === 'phone' && !PHONE_RE.test(trimmed)) return 'Invalid phone (use E.164).';
  if (field.kind === 'employee_id' && !EMP_ID_RE.test(trimmed)) return 'Format: EMP-12345.';
  return null;
}

function MayaCard({
  card,
  disabled,
  onSubmit,
}: {
  card: AdaptiveCard;
  disabled: boolean;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(card.fields.map((f) => [f.id, ''])),
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const out: Record<string, string | null> = {};
    for (const field of card.fields) {
      out[field.id] = validate(field, values[field.id] ?? '');
    }
    return out;
  }, [card.fields, values]);

  const hasError = Object.values(errors).some((e) => e !== null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const allTouched = Object.fromEntries(card.fields.map((f) => [f.id, true]));
        setTouched(allTouched);
        if (hasError) return;
        onSubmit(values);
      }}
      className="mt-2 flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-950/40 p-4"
      aria-label={card.title}
    >
      <header className="flex flex-col gap-1">
        <h3 className="font-semibold text-white">{card.title}</h3>
        {card.description && <p className="text-sm text-slate-300">{card.description}</p>}
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {card.fields.map((field) => {
          const value = values[field.id] ?? '';
          const error = touched[field.id] ? errors[field.id] : null;
          const inputClass = `w-full rounded-md border bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${error ? 'border-rose-400/60' : 'border-white/10'}`;
          return (
            <label key={field.id} className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-slate-300">
                {field.label}
                {field.required && <span className="ml-1 text-rose-300">*</span>}
              </span>
              {field.kind === 'select' ? (
                <select
                  value={value}
                  onChange={(event) => {
                    setValues((v) => ({ ...v, [field.id]: event.target.value }));
                  }}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, [field.id]: true }));
                  }}
                  className={inputClass}
                  disabled={disabled}
                >
                  <option value="">—</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.kind === 'email' ? 'email' : field.kind === 'phone' ? 'tel' : 'text'}
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(event) => {
                    setValues((v) => ({ ...v, [field.id]: event.target.value }));
                  }}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, [field.id]: true }));
                  }}
                  className={inputClass}
                  disabled={disabled}
                  inputMode={field.kind === 'phone' ? 'tel' : undefined}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${field.id}-error` : undefined}
                />
              )}
              {error && (
                <span id={`${field.id}-error`} className="text-rose-300">
                  {error}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={disabled || hasError}
        className="self-start rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-4 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {card.submitLabel}
      </button>
    </form>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <li
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      aria-label={`Message from ${message.role}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
            : 'bg-slate-800/80 text-slate-100'
        }`}
      >
        <p className="whitespace-pre-line">{message.text}</p>
        {message.cardSubmittedValues && (
          <p className="mt-1 text-[0.7rem] opacity-80">Card data captured ✓</p>
        )}
      </div>
    </li>
  );
}

function MayaChat() {
  const initialAsync = useAsync(getInitialConversation, []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (initialAsync.data) {
      setMessages(initialAsync.data);
      const card = initialAsync.data.find((m) => m.card)?.card;
      setPendingCardId(card ? card.id : null);
    }
  }, [initialAsync.data]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  function appendMessage(message: ChatMessage) {
    setMessages((prev) => [...prev, message]);
  }

  async function handleSendText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setNetworkError(null);
    setInput('');
    appendMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    });
    try {
      const reply = await sendMayaMessage(text);
      appendMessage(reply);
    } catch (error) {
      const msg =
        error instanceof CircuitOpenError
          ? 'Maya is temporarily unavailable. Please try again in a moment.'
          : error instanceof Error
            ? error.message
            : 'Unknown error.';
      setNetworkError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleCardSubmit(card: AdaptiveCard, values: Record<string, string>) {
    if (busy) return;
    setBusy(true);
    setNetworkError(null);
    setPendingCardId(null);
    try {
      const ack = await submitMayaCard(card.id, values);
      appendMessage(ack);
    } catch (error) {
      const msg =
        error instanceof CircuitOpenError
          ? 'Maya is temporarily unavailable. Please try again in a moment.'
          : error instanceof Error
            ? error.message
            : 'Unknown error.';
      setNetworkError(msg);
      setPendingCardId(card.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Talk to Maya</h1>
        <p className="text-slate-300">
          Conversational onboarding. Cards capture structured data and validate it inline.
        </p>
      </header>

      <AsyncBoundary
        loading={initialAsync.loading}
        error={initialAsync.error}
        onRetry={initialAsync.reload}
      >
        <ol
          ref={listRef}
          className="flex max-h-[55vh] flex-col gap-3 overflow-auto rounded-xl border border-white/10 bg-slate-900/40 p-4"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {pendingCardId && (
            <li className="flex justify-start">
              <div className="w-full max-w-xl">
                {messages
                  .filter((m) => m.card?.id === pendingCardId)
                  .map((m) =>
                    m.card ? (
                      <MayaCard
                        key={m.card.id}
                        card={m.card}
                        disabled={busy}
                        onSubmit={(values) => {
                          void handleCardSubmit(m.card!, values);
                        }}
                      />
                    ) : null,
                  )}
              </div>
            </li>
          )}
          {busy && (
            <li className="flex justify-start" aria-live="polite">
              <div className="rounded-2xl bg-slate-800/80 px-4 py-2 text-sm text-slate-300">
                Maya is typing…
              </div>
            </li>
          )}
        </ol>

        {networkError && (
          <p role="alert" className="text-sm text-rose-300">
            {networkError}
          </p>
        )}

        <form
          onSubmit={(event) => {
            void handleSendText(event);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            placeholder="Reply to Maya…"
            className="flex-1 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            disabled={busy}
            aria-label="Message"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </AsyncBoundary>
    </div>
  );
}

export default MayaChat;
