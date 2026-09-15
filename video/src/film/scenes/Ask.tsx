import { MONO, SANS } from "../../theme";
import { Bokeh } from "../components/Bokeh";
import { Glass } from "../components/Glass";
import { useShotFrame } from "../components/Shot";
import { Node, Space } from "../components/Space";
import type { FilmCopy } from "../copy";
import { GLIDE, range, track } from "../ease";
import { LOOK } from "../look";
import { schedule, typedAt } from "../typing";

/**
 * Mesure 1 — la question, tapée à 2 h du matin.
 *
 * Le champ de saisie flotte dans le noir, vu de biais, et se redresse pendant
 * que les lettres arrivent. Chaque lettre a sa frappe de clavier dans la
 * bande-son : elle lit le même calendrier (`typing.ts`).
 */
export const TYPE_START = 6;
export const TYPE_RATE = 0.86;

export function askStrokes(copy: FilmCopy) {
  return schedule(copy.typed, TYPE_START, TYPE_RATE);
}

export function sendFrame(copy: FilmCopy): number {
  const strokes = askStrokes(copy);
  return strokes[strokes.length - 1].frame + 7;
}

export const Ask: React.FC<{ copy: FilmCopy }> = ({ copy }) => {
  const f = useShotFrame();
  const strokes = askStrokes(copy);
  const send = sendFrame(copy);
  const typed = typedAt(strokes, f);
  const caretOn = Math.floor(f / 8) % 2 === 0 || typed.length < copy.typed.length;
  const press = range(f, send - 3, send, 0, 1) - range(f, send + 2, send + 10, 0, 1);
  const sent = range(f, send, send + 14, 0, 1, GLIDE);

  const world = {
    z: track(f, [[-8, -520], [36, -40], [71, 60]]),
    rx: track(f, [[-8, 24], [36, 7], [71, 3]]),
    ry: track(f, [[-8, -20], [36, -5], [71, 3]]),
    rz: track(f, [[-8, -3], [36, 0]]),
  };

  return (
    <Space world={world}>
      <Bokeh color="rgba(90,160,255,0.9)" count={14} />
      <Node width={900} height={60} y={-190} opacity={range(f, -2, 14)}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "rgba(244,246,250,0.55)",
            textAlign: "center",
          }}
        >
          {copy.askLabel}
        </div>
      </Node>
      <Node width={940} height={170}>
        <Glass tone="dark" radius={85} glow={0.9 + sent * 0.6} style={{ width: "100%", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 34px 0 58px",
              gap: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                fontFamily: SANS,
                fontSize: 42,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: typed ? "#F4F6FA" : "rgba(244,246,250,0.35)",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {typed || copy.placeholder}
              {typed && (
                <span
                  style={{
                    display: "inline-block",
                    width: 3,
                    height: 46,
                    marginLeft: 4,
                    verticalAlign: "middle",
                    background: LOOK.glow,
                    opacity: caretOn && sent < 0.5 ? 1 : 0,
                  }}
                />
              )}
            </div>
            <div
              style={{
                width: 102,
                height: 102,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: typed.length === copy.typed.length ? LOOK.azure : "rgba(255,255,255,0.12)",
                boxShadow: `0 0 ${40 * sent}px rgba(58,168,255,${0.8 * sent})`,
                transform: `scale(${1 - press * 0.16})`,
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </Glass>
      </Node>
    </Space>
  );
};
