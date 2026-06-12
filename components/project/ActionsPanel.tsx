"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Plus, X } from "lucide-react";
import { createAction, setActionStatus } from "@/lib/actions/actions";
import type { ActionItem } from "@/lib/types/tracking";

export function ActionsPanel({
  projectId,
  initial,
}: {
  projectId: string;
  initial: ActionItem[];
}) {
  const t = useTranslations("memory");
  const [items, setItems] = useState<ActionItem[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const content = draft.trim();
    if (!content || busy) return;
    setBusy(true);
    const res = await createAction({ projectId, content });
    if (res.success && res.action) {
      setItems((prev) => [res.action!, ...prev]);
      setDraft("");
    }
    setBusy(false);
  };

  const toggle = async (a: ActionItem) => {
    const next = a.status === "done" ? "todo" : "done";
    setItems((prev) => prev.map((it) => (it.id === a.id ? { ...it, status: next } : it)));
    const res = await setActionStatus(a.id, next);
    if (!res.success) {
      setItems((prev) => prev.map((it) => (it.id === a.id ? a : it)));
    }
  };

  const abandon = async (a: ActionItem) => {
    setItems((prev) => prev.filter((it) => it.id !== a.id));
    await setActionStatus(a.id, "abandoned");
  };

  const open = items.filter((i) => i.status === "todo");
  const done = items.filter((i) => i.status === "done");

  return (
    <div>
      {/* Add */}
      <div className="flex items-center gap-2 mb-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={t("addActionPlaceholder")}
          className="flex-1 min-w-0 rounded-2xl px-4 py-2.5 bg-(--surface-2) border border-(--border) text-[15px] text-(--text-primary) placeholder-(--text-dim) focus:outline-none focus:border-(--border-emphasis) transition-colors"
        />
        <button
          onClick={add}
          disabled={!draft.trim() || busy}
          aria-label={t("add")}
          className="shrink-0 grid place-items-center h-10 w-10 rounded-full text-white transition-all duration-200 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#0071e3,#5b9dff)" }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.4} />
        </button>
      </div>

      {/* Open actions */}
      {open.length === 0 && done.length === 0 ? (
        <p className="text-[15px] text-(--text-muted) leading-relaxed py-2">{t("actionsEmpty")}</p>
      ) : (
        <ul className="space-y-1.5">
          {open.map((a) => (
            <li
              key={a.id}
              className="group flex items-start gap-3 rounded-2xl px-3.5 py-3 border border-(--border) bg-(--surface-1) hover:border-(--border-strong) transition-colors"
            >
              <button
                onClick={() => toggle(a)}
                aria-label={t("markDone")}
                className="shrink-0 mt-0.5 grid place-items-center h-5 w-5 rounded-full border-2 border-(--border-emphasis) hover:border-(--accent-primary) transition-colors cursor-pointer"
              />
              <span className="flex-1 text-[15px] text-(--text-secondary) leading-snug">{a.content}</span>
              <button
                onClick={() => abandon(a)}
                aria-label={t("abandon")}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-(--text-dim) hover:text-(--danger) transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Done actions */}
      {done.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-mono tracking-[0.18em] text-(--text-dim) uppercase mb-2 px-1">
            {t("doneTitle")} · {done.length}
          </p>
          <ul className="space-y-1.5">
            {done.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-2xl px-3.5 py-3 bg-(--surface-1)/50">
                <button
                  onClick={() => toggle(a)}
                  aria-label={t("reopen")}
                  className="shrink-0 mt-0.5 grid place-items-center h-5 w-5 rounded-full cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#0071e3,#5b9dff)" }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </button>
                <span className="flex-1 text-[15px] text-(--text-dim) line-through leading-snug">
                  {a.content}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
