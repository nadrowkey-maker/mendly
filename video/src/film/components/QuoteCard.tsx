import { MONO, SANS } from "../../theme";
import { LOOK } from "../look";
import { Glass } from "./Glass";

/**
 * Un fragment de la réponse de Mendly, sorti de l'écran vers la caméra.
 *
 * C'est le procédé de la référence : la phrase qui compte quitte l'interface
 * et vient flotter devant elle, pendant que l'écran derrière passe hors foyer.
 */
interface QuoteCardProps {
  label: string;
  text: string;
  width: number;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ label, text, width }) => (
  <Glass radius={40} glow={1} style={{ width, padding: "34px 44px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: LOOK.azure, boxShadow: `0 0 14px ${LOOK.azure}` }} />
      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: LOOK.deep }}>
        {label}
      </div>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 44, fontWeight: 600, lineHeight: 1.18, letterSpacing: "-0.025em", color: LOOK.ink, whiteSpace: "pre-line" }}>
      {text}
    </div>
  </Glass>
);
