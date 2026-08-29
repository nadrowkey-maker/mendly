import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runIntakeTurn, MAX_TURNS } from "@/lib/ai/intake";

export const runtime = "nodejs";

/**
 * Un tour d'entretien de création de projet.
 *
 * Sans état côté serveur : le client renvoie la conversation complète à chaque
 * tour. Elle est courte par construction (plafonnée à MAX_TURNS), et une
 * création abandonnée ne laisse alors aucune trace à nettoyer — ce qui serait
 * le cas avec une session persistée.
 */
interface IntakeBody {
  transcript?: { role: "user" | "assistant"; content: string }[];
  locale?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IntakeBody;
  try {
    body = (await req.json()) as IntakeBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const transcript = Array.isArray(body.transcript) ? body.transcript.slice(-20) : [];
  if (transcript.length === 0) {
    return NextResponse.json({ error: "Empty transcript" }, { status: 400 });
  }

  const turn = transcript.filter((m) => m.role === "user").length;
  if (turn > MAX_TURNS + 2) {
    return NextResponse.json({ error: "Too many turns" }, { status: 429 });
  }

  const result = await runIntakeTurn({
    transcript,
    turn,
    locale: body.locale === "en" ? "en" : "fr",
  });

  return NextResponse.json(result);
}
