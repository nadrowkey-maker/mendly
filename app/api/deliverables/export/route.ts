import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai/gemini";
import { getUserPlan } from "@/lib/actions/subscription";
import { track } from "@/lib/actions/analytics";
import { buildPitchPptx, buildFinancialsXlsx } from "@/lib/exports/build";
import type { Project } from "@/lib/types/project";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseJson<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "export";
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, type, locale = "en" } = (await req.json()) as {
      projectId: string;
      type: "pitch" | "financials" | "prd";
      locale?: string;
    };
    if (!projectId || !type) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const plan = await getUserPlan();
    if (plan !== "pro") {
      return new Response(JSON.stringify({ error: "pro_required" }), { status: 403 });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (error || !data) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
    const project = data as Project;

    const ctx = `Project: ${project.name}\nDescription: ${project.description ?? "—"}\nStage: ${project.stage}\nSector: ${project.sector ?? "—"}`;
    const lang = locale === "fr" ? "French" : "English";

    if (type === "pitch") {
      const prompt = `Draft a concise investor pitch deck for this startup, in ${lang}.
${ctx}

Reply with STRICT JSON only (no prose, no code fences):
{"slides":[{"title":"string","bullets":["string","string","string"]}]}
Exactly 6 slides in this order: Problem, Solution, Market & opportunity, Product, Business model, Why now / The ask. 3-4 punchy bullets each.`;
      const res = await geminiFlash.generateContent(prompt);
      const parsed = parseJson<{ slides: { title: string; bullets: string[] }[] }>(res.response.text());
      if (!parsed?.slides?.length) {
        return new Response(JSON.stringify({ error: "generation_failed" }), { status: 502 });
      }
      const buf = await buildPitchPptx(project.name, parsed.slides);
      void track("export_generated", { type: "pitch" });
      return new Response(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${slug(project.name)}-pitch.pptx"`,
        },
      });
    }

    if (type === "prd") {
      const prompt = `Draft a structured Product Requirements Document (PRD) for this startup, in ${lang}.
${ctx}

Reply with STRICT JSON only (no prose, no code fences):
{"slides":[{"title":"string","bullets":["string","string","string"]}]}
Exactly 7 sections in this order: Overview, Goals & success metrics, Target users, Core features (MVP), Functional requirements, Out of scope, Milestones & sequencing. 3-5 concrete bullets each.`;
      const res = await geminiFlash.generateContent(prompt);
      const parsed = parseJson<{ slides: { title: string; bullets: string[] }[] }>(res.response.text());
      if (!parsed?.slides?.length) {
        return new Response(JSON.stringify({ error: "generation_failed" }), { status: 502 });
      }
      const buf = await buildPitchPptx(project.name, parsed.slides);
      void track("export_generated", { type: "prd" });
      return new Response(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${slug(project.name)}-prd.pptx"`,
        },
      });
    }

    // financials
    const prompt = `Draft a simple 12-month financial model for this startup, in ${lang}. Be realistic for the stage.
${ctx}

Reply with STRICT JSON only (no prose, no code fences):
{"months":["M1",...12],"rows":[{"label":"New users","values":[12 numbers]},{"label":"Revenue (€)","values":[12 numbers]},{"label":"Costs (€)","values":[12 numbers]},{"label":"Net (€)","values":[12 numbers]}],"notes":["assumption 1","assumption 2"]}`;
    const res = await geminiFlash.generateContent(prompt);
    const parsed = parseJson<{
      months: string[];
      rows: { label: string; values: number[] }[];
      notes: string[];
    }>(res.response.text());
    if (!parsed?.rows?.length) {
      return new Response(JSON.stringify({ error: "generation_failed" }), { status: 502 });
    }
    const months = parsed.months?.length ? parsed.months : Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
    const buf = await buildFinancialsXlsx(project.name, months, parsed.rows, parsed.notes ?? []);
    void track("export_generated", { type: "financials" });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${slug(project.name)}-financials.xlsx"`,
      },
    });
  } catch (err) {
    console.error("export route error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
