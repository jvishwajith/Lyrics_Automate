export type TemplateName = "sad" | "rap" | "feelgood" | "energetic" | "backgrounds" | "verticalglass" | "justlyrics";

export interface LyricWord {
  index: number;
  start: number;
  end: number;
  text: string;
  emphasis?: boolean;
}

export interface LyricsData {
  audio_file: string;
  model: string;
  language: string;
  words: LyricWord[];
  textColor?: string;
  backgroundImage?: string;
  background_image?: string;
  fontFamily?: string;
  fontSize?: number | string;
}

export interface ActiveLyricsState {
  currentWord?: LyricWord;
  currentIndex: number;
  previousWord?: LyricWord;
  nextWord?: LyricWord;
  isSinging: boolean;
  timeSinceStart: number;
  timeUntilEnd: number;
  progressInWord: number;
}

export interface WordCluster {
  words: LyricWord[];
  start: number;
  end: number;
  isBurst: boolean;
}

export interface CompositionProps {
  lyricsData?: LyricsData;
  durationInSeconds?: number;
  template?: TemplateName;
  watermark?: string;
  showWatermark?: boolean;
  textColor?: string;
  backgroundImage?: string;
  fontFamily?: string;
  fontSize?: number | string;
}
