import { LyricWord, ActiveLyricsState, WordCluster } from "./types";

export function getActiveLyricsState(
  words: LyricWord[],
  currentTime: number,
  previewWindow: number = 1.5
): ActiveLyricsState {
  if (!words || words.length === 0) {
    return { currentIndex: -1, isSinging: false, timeSinceStart: 0, timeUntilEnd: 0, progressInWord: 0 };
  }

  let currentIndex = -1;
  let currentWord: LyricWord | undefined;
  let previousWord: LyricWord | undefined;
  let nextWord: LyricWord | undefined;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (currentTime >= w.start && currentTime < w.end) {
      currentIndex = i;
      currentWord = w;
      previousWord = i > 0 ? words[i - 1] : undefined;
      nextWord = i < words.length - 1 ? words[i + 1] : undefined;
      break;
    }
  }

  if (!currentWord) {
    let lastEndedIndex = -1;
    for (let i = words.length - 1; i >= 0; i--) {
      if (words[i].end <= currentTime) { lastEndedIndex = i; break; }
    }
    if (lastEndedIndex >= 0) previousWord = words[lastEndedIndex];

    let nextUpcomingIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (words[i].start > currentTime) { nextUpcomingIndex = i; break; }
    }
    if (nextUpcomingIndex > 0) {
      const upcoming = words[nextUpcomingIndex];
      if (upcoming.start - currentTime <= previewWindow) nextWord = upcoming;
    }

    return { currentIndex: -1, isSinging: false, currentWord: undefined, previousWord, nextWord, timeSinceStart: 0, timeUntilEnd: 0, progressInWord: 0 };
  }

  const duration = currentWord.end - currentWord.start;
  const timeSinceStart = currentTime - currentWord.start;
  const timeUntilEnd = currentWord.end - currentTime;
  const progressInWord = duration > 0 ? Math.min(1, Math.max(0, timeSinceStart / duration)) : 0;

  return { currentIndex, isSinging: true, currentWord, previousWord, nextWord, timeSinceStart, timeUntilEnd, progressInWord };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function groupWordsIntoClusters(
  words: LyricWord[],
  burstThreshold: number = 0.45,
  maxWords: number = 4,
  maxSpanSeconds: number = 1.8,
  phraseBreakSeconds: number = 0.5
): WordCluster[] {
  if (!words || words.length === 0) return [];

  const clusters: WordCluster[] = [];
  let current: WordCluster | null = null;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const duration = word.end - word.start;
    const isShort = duration < burstThreshold;

    const hasGapBefore =
      i > 0 && word.start - words[i - 1].end >= phraseBreakSeconds;

    const canExtend =
      current !== null &&
      !hasGapBefore &&
      isShort &&
      current.isBurst &&
      current.words.length < maxWords &&
      word.start - current.start < maxSpanSeconds;

    if (canExtend && current) {
      current.words.push(word);
      current.end = word.end;
    } else {
      if (current) clusters.push(current);
      current = {
        words: [word],
        start: word.start,
        end: word.end,
        isBurst: isShort,
      };
    }
  }

  if (current) clusters.push(current);
  return clusters;
}

export interface ActiveClusterState {
  activeCluster: WordCluster | null;
  echoCluster: WordCluster | null;
  previewCluster: WordCluster | null;
  activeWordIndex: number;
}

export function getActiveCluster(
  clusters: WordCluster[],
  currentTime: number,
  echoWindowSeconds: number = 1.8,
  previewWindowSeconds: number = 1.2
): ActiveClusterState {
  let activeCluster: WordCluster | null = null;
  let activeWordIndex = 0;
  let echoCluster: WordCluster | null = null;
  let previewCluster: WordCluster | null = null;

  for (let ci = 0; ci < clusters.length; ci++) {
    const cluster = clusters[ci];

    if (currentTime >= cluster.start && currentTime < cluster.end) {
      activeCluster = cluster;
      activeWordIndex = 0;
      for (let wi = 0; wi < cluster.words.length; wi++) {
        if (currentTime >= cluster.words[wi].start) {
          activeWordIndex = wi;
        }
      }
      if (ci > 0) {
        const prev = clusters[ci - 1];
        if (currentTime - prev.end <= echoWindowSeconds) {
          echoCluster = prev;
        }
      }
      if (ci < clusters.length - 1) {
        const next = clusters[ci + 1];
        if (next.start - currentTime <= previewWindowSeconds) {
          previewCluster = next;
        }
      }
      break;
    }

    if (currentTime >= cluster.end) {
      if (ci === clusters.length - 1 || currentTime < clusters[ci + 1].start) {
        if (currentTime - cluster.end <= echoWindowSeconds) {
          echoCluster = cluster;
        }
        if (ci < clusters.length - 1) {
          const next = clusters[ci + 1];
          if (next.start - currentTime <= previewWindowSeconds) {
            previewCluster = next;
          }
        }
      }
    }
  }

  return { activeCluster, echoCluster, previewCluster, activeWordIndex };
}
