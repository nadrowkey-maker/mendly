/**
 * L'emplacement de la musique de fond.
 *
 * Vide tant qu'aucun morceau sous licence n'est disponible. Pour en poser un :
 * déposer le fichier dans `public/audio/` (ignoré par git — le dépôt est
 * public, et redistribuer un morceau sous licence la violerait), puis
 * renseigner ce fichier.
 *
 * `gain` règle la musique sous les effets : autour de 0,35, elle porte le
 * rythme sans masquer les coups.
 */
export interface MusicBed {
  /** Chemin relatif à `public/`, par exemple "audio/music.mp3". */
  file: string;
  gain: number;
}

export const MUSIC: MusicBed | null = null;
