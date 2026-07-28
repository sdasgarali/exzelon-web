"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Panel, Table, EmptyState } from "@/components/dashboard/ui";

type ApiKey = {
  id: string;
  name: string;
  keyPreview: string;
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-ink-900">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-sand-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function ApiKeysManager({ endpoint, source }: { endpoint: string; source: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ name: string; rawKey: string } | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      const body = await res.json();
      setKeys(body.keys ?? []);
    } catch {
      setError("Could not load API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Could not create key");
      setRevealed({ name: body.key.name, rawKey: body.rawKey });
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create key");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this key? Any system using it will stop syncing immediately.")) return;
    try {
      await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setError("Could not revoke key.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Connection details for AccessHub */}
      <Panel className="p-6">
        <h2 className="text-sm font-bold text-ink-900">Connect in AccessHub → Websites → Connect API</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste these into AccessHub&apos;s pull configuration, then generate a key below for the API key field.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CopyField label="API URL" value={endpoint} />
          <CopyField label="Source" value={source} />
        </div>
      </Panel>

      {/* Reveal a freshly-created key (shown once) */}
      {revealed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <Icon name="badge-check" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-emerald-900">
                Key &ldquo;{revealed.name}&rdquo; created — copy it now
              </h3>
              <p className="mt-0.5 text-xs text-emerald-800">
                This is the only time the full key is shown. Store it in AccessHub&apos;s API key field.
              </p>
              <div className="mt-3">
                <CopyField label="API key" value={revealed.rawKey} />
              </div>
              <button
                type="button"
                onClick={() => setRevealed(null)}
                className="mt-3 text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
              >
                I&apos;ve saved it — dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create a key */}
      <Panel className="p-6">
        <h2 className="text-sm font-bold text-ink-900">Generate an API key</h2>
        <form onSubmit={create} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. AccessHub)"
            className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <Icon name="plus" className="h-4 w-4" />
            {busy ? "Generating…" : "Generate key"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
      </Panel>

      {/* Existing keys */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-ink-900">API keys</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : keys.length === 0 ? (
          <EmptyState icon="code" title="No API keys yet" description="Generate a key above to let AccessHub pull analytics." />
        ) : (
          <Panel>
            <Table head={["Name", "Key", "Created", "Last used", "Status", ""]}>
              {keys.map((k) => (
                <tr key={k.id} className="text-slate-700">
                  <td className="px-5 py-3.5 font-medium text-ink-900">{k.name}</td>
                  <td className="px-5 py-3.5"><code className="text-xs">{k.keyPreview}</code></td>
                  <td className="px-5 py-3.5 text-sm">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-sm">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
                        (k.active
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-500")
                      }
                    >
                      {k.active ? "active" : "revoked"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {k.active && (
                      <button
                        type="button"
                        onClick={() => revoke(k.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
        )}
      </div>
    </div>
  );
}
