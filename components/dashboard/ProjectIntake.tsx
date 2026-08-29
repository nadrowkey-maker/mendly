"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import type { IntakeFields } from "@/lib/ai/intake";
import type { ProjectStage, ProjectSector } from "@/lib/types/project";

/**
 * L'entretien de création, côté interface.
 *
 * La première réplique de Mendly est écrite en dur, pas générée : elle est
 * toujours la même, et la faire produire par le modèle coûterait un appel et
 * une seconde d'attente avant que le fondateur puisse seulement commencer à
 * écrire.
 *
 * Le formulaire classique reste accessible en un clic. Un entretien est la
 * bonne porte d'entrée la première fois ; au troisième projet, il devient une
 * cérémonie qu'on veut pouvoir sauter.
 */
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProjectIntakeProps {
  onSwitchToForm: () => void;
}

export function ProjectIntake({ onSwitchToForm }: ProjectIntakeProps) {
  const t = useTranslations("intake");
  const locale = useLocale();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("opening") },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "ready" | "creating">("idle");
  const [fields, setFields] = useState<IntakeFields | null>(null);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const send = async () => {
    const text = input.trim();
    if (!text || status !== "idle") return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStatus("thinking");
    setError("");

    try {
      const res = await fetch("/api/projects/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: next, locale }),
      });
      if (!res.ok) throw new Error("intake failed");

      const data = (await res.json()) as { reply: string; fields: IntakeFields; done: boolean };
      setMessages([...next, { role: "assistant", content: data.reply }]);

      if (data.done) {
        setFields(data.fields);
        setStatus("ready");
      } else {
        setStatus("idle");
      }
    } catch {
      setError(t("error"));
      setStatus("idle");
    }
  };

  const create = async () => {
    if (!fields?.name || !fields.stage) return;
    setStatus("creating");
    setError("");

    const res = await createProject({
      name: fields.name,
      description: fields.description ?? undefined,
      stage: fields.stage as ProjectStage,
      sector: (fields.sector ?? undefined) as ProjectSector | undefined,
      vision: fields.vision ?? undefined,
      locale: locale === "en" ? "en" : "fr",
    });

    if (res.success && res.project) {
      router.push(`/dashboard/projects/${res.project.id}`);
    } else {
      setError(res.error ?? t("error"));
      setStatus("ready");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col">
      <div className="flex-1 space-y-5 pb-6">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={m.role === "user" ? "flex justify-end" : ""}
            >
              {m.role === "assistant" ? (
                <div>
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-(--accent-glow)">
                    Mendly
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed text-white">{m.content}</p>
                </div>
              ) : (
                <p className="max-w-[80%] rounded-2xl border border-(--glass-line) bg-(--glass) px-4 py-2.5 text-[15px] text-(--text-secondary) backdrop-blur-xl">
                  {m.content}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {status === "thinking" && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
            {t("thinking")}
          </p>
        )}

        {status === "ready" && fields && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-(--accent-primary)/35 bg-(--accent-primary)/8 p-5 backdrop-blur-xl"
          >
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-(--accent-glow)">
              {t("recapTitle")}
            </span>
            <p className="text-lg font-medium text-white">{fields.name}</p>
            {fields.description && (
              <p className="mt-1.5 text-sm text-(--text-secondary)">{fields.description}</p>
            )}
            <button
              onClick={create}
              disabled={status !== "ready"}
              className="mt-5 w-full cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:-translate-y-px disabled:opacity-60"
            >
              {t("createCta")}
            </button>
          </motion.div>
        )}

        {status === "creating" && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--accent-glow)">
            {t("creating")}
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div ref={endRef} />
      </div>

      {status !== "ready" && status !== "creating" && (
        <div className="sticky bottom-6">
          <div className="flex items-end gap-2 rounded-2xl border border-(--glass-line) bg-[rgba(8,11,15,0.8)] p-2 backdrop-blur-2xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              disabled={status === "thinking"}
              placeholder={t("placeholder")}
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-white placeholder:text-(--text-muted) focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || status === "thinking"}
              aria-label={t("send")}
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-black transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>

          <button
            onClick={onSwitchToForm}
            className="mt-3 w-full cursor-pointer text-center font-mono text-[11px] uppercase tracking-[0.16em] text-(--text-muted) transition-colors hover:text-white"
          >
            {t("switchToForm")}
          </button>
        </div>
      )}
    </div>
  );
}
