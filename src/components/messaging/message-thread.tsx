"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = { id: string; senderRole: "employer" | "seeker"; body: string; createdAt: string };
type ThreadState = {
  role: "employer" | "seeker" | "admin";
  jobTitle: string;
  canPost: boolean;
  messages: Message[];
};

const OTHER_LABEL = { seeker: "Applicant", employer: "Employer" } as const;

export function MessageThread({ applicationId }: { applicationId: string }) {
  const [state, setState] = useState<ThreadState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/applications/${applicationId}/messages`)
      .then((r) => r.json().then((json) => ({ ok: r.ok, json })))
      .then(({ ok, json }) => {
        if (!active) return;
        if (!ok) setError(json?.error ?? "Could not load messages");
        else setState(json);
      })
      .catch(() => active && setError("Could not load messages"));
    return () => {
      active = false;
    };
  }, [applicationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.messages.length]);

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Could not send");
      setState((s) => (s ? { ...s, messages: [...s.messages, json.message] } : s));
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  };

  if (error && !state) {
    return <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>;
  }
  if (!state) return <p className="text-sm text-slate-500">Loading conversation…</p>;

  const viewerRole = state.role;

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-sand-100 px-5 py-4">
        <h2 className="font-bold text-ink-900">Messages</h2>
        <p className="text-xs text-slate-500">
          {viewerRole === "admin" ? "Viewing as admin (read-only)." : "Direct messages about this application."}
        </p>
      </div>

      <div className="max-h-[26rem] space-y-3 overflow-y-auto bg-sand-50/40 px-5 py-5">
        {state.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No messages yet. Say hello 👋</p>
        ) : (
          state.messages.map((m) => {
            const mine = m.senderRole === viewerRole;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", mine ? "bg-brand-600 text-white" : "border border-sand-200 bg-white text-ink-900")}>
                  <div className={cn("mb-0.5 text-[11px] font-semibold", mine ? "text-brand-100" : "text-slate-400")}>
                    {mine ? "You" : OTHER_LABEL[m.senderRole]}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {state.canPost ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 border-t border-sand-100 p-4"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Write a message…"
            className="min-h-11 flex-1 resize-none rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
          <Button type="submit" size="md" disabled={sending || !body.trim()}>
            {sending ? "…" : <Icon name="send" className="h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <p className="border-t border-sand-100 px-5 py-3 text-xs text-slate-400">Read-only view.</p>
      )}

      {error && <p className="px-5 pb-3 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
