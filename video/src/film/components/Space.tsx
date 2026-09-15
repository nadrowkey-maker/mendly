import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

/**
 * L'espace 3D et les objets qu'on y pose.
 *
 * C'est ce qui manquait le plus à la première version : tout y était à plat,
 * et c'était le texte qui bougeait. Ici, la caméra se déplace dans un vrai
 * volume — perspective, profondeur, rotation — et les écrans du produit sont
 * des objets posés dedans. Un écran vu de biais qui se redresse en venant vers
 * nous, c'est le mouvement qui fait « produit financé ».
 */

export interface Pose {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
}

export function poseToTransform({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1 }: Pose): string {
  return `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
}

interface SpaceProps {
  children: ReactNode;
  /** Mouvement du monde entier — c'est la caméra, vue de l'autre côté. */
  world?: Pose;
  perspective?: number;
}

/** Le volume : l'origine est au centre de l'écran. */
export const Space: React.FC<SpaceProps> = ({ children, world = {}, perspective = 2200 }) => (
  <AbsoluteFill style={{ perspective, perspectiveOrigin: "50% 50%" }}>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 0,
        height: 0,
        transformStyle: "preserve-3d",
        transform: poseToTransform(world),
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

interface GroupProps extends Pose {
  children: ReactNode;
  opacity?: number;
}

/**
 * Un repère sans taille : ses enfants se centrent sur son origine. Sert à
 * déplacer ensemble un écran et ce qui est posé dessus (le pointeur).
 */
export const Group: React.FC<GroupProps> = ({ children, opacity = 1, ...pose }) => (
  <div
    style={{
      position: "absolute",
      width: 0,
      height: 0,
      transformStyle: "preserve-3d",
      transform: poseToTransform(pose),
      opacity,
    }}
  >
    {children}
  </div>
);

interface NodeProps extends Pose {
  children: ReactNode;
  width: number;
  height: number;
  opacity?: number;
  style?: CSSProperties;
}

/** Un objet centré sur sa position dans l'espace. */
export const Node: React.FC<NodeProps> = ({ children, width, height, opacity = 1, style, ...pose }) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      transformStyle: "preserve-3d",
      transform: poseToTransform(pose),
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

interface ScreenProps extends Pose {
  /** Chemin sous public/, par exemple "product/fr/debate.png". */
  src: string;
  width: number;
  height: number;
  radius?: number;
  opacity?: number;
  /** Flou de profondeur de champ, en pixels. */
  blur?: number;
  /** Décalage du contenu dans le cadre, en fractions : sert à cadrer une zone. */
  pan?: { u: number; v: number; zoom: number };
}

/**
 * Un écran du produit : la capture réelle, avec son arête lumineuse et son
 * ombre portée. `pan` cadre une zone précise de la capture à l'intérieur du
 * même cadre — c'est le gros plan sur « Ma position » ou sur un bouton.
 */
export const Screen: React.FC<ScreenProps> = ({ src, width, height, radius = 40, opacity = 1, blur = 0, pan, ...pose }) => {
  const zoom = pan?.zoom ?? 1;
  const u = pan?.u ?? 0.5;
  const v = pan?.v ?? 0.5;
  return (
    <Node width={width} height={height} opacity={opacity} {...pose}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          boxShadow: "0 80px 160px -60px rgba(10,24,48,0.55), 0 30px 60px -30px rgba(29,111,189,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          background: "#0A0A0B",
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            width: width * zoom,
            height: height * zoom,
            left: width / 2 - u * width * zoom,
            top: height / 2 - v * height * zoom,
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.1), inset 0 2px 0 rgba(255,255,255,0.18)",
        }}
      />
    </Node>
  );
};
