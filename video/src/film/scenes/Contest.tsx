import { Caption } from "../components/Caption";
import { Pointer } from "../components/Pointer";
import { QuoteCard } from "../components/QuoteCard";
import { useShotFrame } from "../components/Shot";
import { Group, Node, Screen, Space } from "../components/Space";
import type { FilmCopy, Locale } from "../copy";
import { GLIDE, LEAVE, range, track } from "../ease";

/**
 * Mesures 5–6 — le vrai produit : Mendly contredit, puis tranche.
 *
 * Un seul écran, la capture réelle de la conversation, et une caméra qui s'y
 * déplace : il arrive de biais, se redresse sur le paragraphe de tension,
 * descend jusqu'à « Ma position », puis le pointeur ouvre la salle de réunion
 * et la caméra plonge dans le bouton — ce qui enchaîne sur le débat.
 *
 * Cadrage : l'écran mesure PW × PH ; une zone (u, v) de la capture est
 * centrée quand le groupe est décalé de -s·((u-0,5)·PW, (v-0,5)·PH).
 */
const PW = 3000;
const PH = 1875;
const LIFT = 60;

const REGION = {
  tension: { u: 0.59, v: 0.39 },
  position: { u: 0.59, v: 0.54 },
  room: { u: 0.45, v: 0.62 },
};

export const CARD_TENSION_AT = 30;
export const CARD_POSITION_AT = 78;
export const CLICK_AT = 112;

const off = (r: { u: number; v: number }) => ({ x: (r.u - 0.5) * PW, y: (r.v - 0.5) * PH });

export const Contest: React.FC<{ copy: FilmCopy; locale: Locale }> = ({ copy, locale }) => {
  const f = useShotFrame();
  const t = off(REGION.tension);
  const p = off(REGION.position);
  const r = off(REGION.room);

  const s = track(f, [[-8, 0.42], [34, 0.8], [63, 0.9], [98, 0.95], [CLICK_AT, 1.05], [134, 1.9]]);
  const at = (o: { x: number; y: number }, scale: number) => ({ x: -scale * o.x, y: -scale * o.y + LIFT });
  const x = track(f, [[-8, 140], [34, at(t, 0.8).x], [63, at(t, 0.9).x], [98, at(p, 0.95).x], [CLICK_AT, at(r, 1.05).x], [134, at(r, 1.9).x]]);
  const y = track(f, [[-8, 420], [34, at(t, 0.8).y], [63, at(t, 0.9).y], [98, at(p, 0.95).y], [CLICK_AT, at(r, 1.05).y], [134, at(r, 1.9).y]]);
  const pose = {
    x,
    y,
    scale: s,
    z: track(f, [[-8, -700], [34, -120], [63, 0], [CLICK_AT, 0], [134, 520]]),
    ry: track(f, [[-8, -34], [34, -12], [63, -6], [98, 4], [CLICK_AT, 1], [134, 0]]),
    rx: track(f, [[-8, 22], [34, 9], [63, 5], [98, 3], [134, 0]]),
    rz: track(f, [[-8, -5], [34, -1], [63, 0]]),
  };

  const card1 = range(f, CARD_TENSION_AT, CARD_TENSION_AT + 20, 0, 1, GLIDE) * (1 - range(f, 66, 80, 0, 1, LEAVE));
  const card2 = range(f, CARD_POSITION_AT, CARD_POSITION_AT + 20, 0, 1, GLIDE) * (1 - range(f, 104, 116, 0, 1, LEAVE));
  const dof = Math.max(card1, card2) * 3.5;

  const pointerIn = range(f, 92, 100);
  const px = track(f, [[92, 260], [CLICK_AT - 3, r.x]]);
  const py = track(f, [[92, 560], [CLICK_AT - 3, r.y]]);

  return (
    <>
      <Space>
        <Group {...pose}>
          <Screen src={`product/${locale}/contradiction.png`} width={PW} height={PH} radius={70} blur={dof} />
          <div style={{ position: "absolute", left: 0, top: 0, transform: "translateZ(2px)" }}>
            <Pointer x={px} y={py} pressAt={CLICK_AT} opacity={pointerIn} />
          </div>
        </Group>
      </Space>
      {/* Les cartes vivent dans leur propre volume : dans celui de l'écran,
          elles le traversaient là où il penche vers la caméra. */}
      <Space>
        {[
          { p: card1, label: copy.cardLabel, text: copy.cardTension },
          { p: card2, label: copy.cardLabel, text: copy.cardPosition },
        ].map((c, i) => (
          <Node key={i} width={920} height={260} y={360} z={-360 * (1 - c.p) + 40} ry={(1 - c.p) * -10} opacity={c.p}>
            <div style={{ filter: c.p < 0.98 ? `blur(${(1 - c.p) * 14}px)` : undefined }}>
              <QuoteCard label={c.label} text={c.text} width={920} />
            </div>
          </Node>
        ))}
      </Space>
      <Caption line={copy.dares} start={2} end={52} y={-640} size={70} />
      <Caption line={copy.decides} start={66} end={108} y={-640} size={70} />
    </>
  );
};
