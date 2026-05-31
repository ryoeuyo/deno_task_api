"use client";

import { useState } from "react";
import type { TaskInput } from "@/lib/api";

export function TaskForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: TaskInput;
  submitLabel: string;
  onSubmit: (data: TaskInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // mirror the backend zod rules: name 5..255, description non-empty
  function validate(): string | null {
    if (name.trim().length < 5) return "name must be at least 5 characters";
    if (name.length > 255) return "name must be at most 255 characters";
    if (description.trim().length === 0) return "description cannot be empty";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="msg error">{error}</div>}

      <div className="field">
        <label htmlFor="name">
          name <span className="star">*</span>
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="refactor the parser"
          autoComplete="off"
          autoFocus
        />
        <div className="hint">min 5 chars · {name.length}/255</div>
      </div>

      <div className="field">
        <label htmlFor="description">
          description <span className="star">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="what needs to happen…"
          rows={4}
        />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn green" disabled={busy}>
          {busy ? "saving…" : submitLabel}
        </button>
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={busy}
        >
          cancel
        </button>
      </div>
    </form>
  );
}
