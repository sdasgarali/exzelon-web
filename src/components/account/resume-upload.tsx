"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";

type Props = { initialFileId?: string; initialFileName?: string };

/**
 * Self-contained resume file uploader. Uploads/deletes via /api/account/resume
 * (multipart) independently of the profile form's JSON save, then refreshes the
 * route so the completeness banner and apply-gating update.
 */
export function ResumeUpload({ initialFileId, initialFileName }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileId, setFileId] = useState(initialFileId);
  const [fileName, setFileName] = useState(initialFileName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/account/resume", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Upload failed");
      setFileId(json.fileId);
      setFileName(json.fileName);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/resume", { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove file");
      setFileId(undefined);
      setFileName(undefined);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-ink-900">Resume file</span>
      {fileId ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sand-200 bg-sand-50/60 p-3">
          <Icon name="file-text" className="h-5 w-5 shrink-0 text-brand-600" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">{fileName}</span>
          <a
            href={`/api/files/resume/${fileId}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-xs font-semibold text-slate-600 hover:text-ink-900 disabled:opacity-50"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60"
        >
          <Icon name="upload" className="h-4 w-4" />
          {busy ? "Uploading…" : "Upload resume (PDF, DOC, DOCX)"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onPick}
        className="hidden"
      />
      <p className="mt-1 text-xs text-slate-400">
        Upload a file <strong>or</strong> paste a link below — either one lets you apply. Max 5&nbsp;MB.
      </p>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
