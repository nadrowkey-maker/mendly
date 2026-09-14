/**
 * Les instants de départ de chaque scène, en images.
 *
 * Isolés du montage pour que la bande-son puisse s'y caler sans importer le
 * montage lui-même : `Ad` importe la bande-son, la bande-son importerait `Ad`,
 * et une importation circulaire lit ses constantes avant qu'elles existent.
 */
export const SCENE_START = {
  hook: 0,
  problem: 72,
  reveal: 204,
  demo: 282,
  room: 522,
  night: 590,
  benefits: 650,
  cta: 722,
} as const;

export const AD_DURATION = 830;
