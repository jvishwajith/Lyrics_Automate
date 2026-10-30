import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricsData, LyricWord } from "../../shared/types";
import { IntroAnimation } from "../../shared/IntroAnimation";
import { SadBackground } from "./SadBackground";
import { SadHeader } from "./SadHeader";
import { SadLyrics } from "./SadLyrics";
import { SadProgress } from "./SadProgress";

interface SadVideoProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
}

export const SadVideo: React.FC<SadVideoProps> = ({ lyricsData, durationInSeconds }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  const currentWord: LyricWord | undefined = lyricsData?.words?.find(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  const totalDuration = durationInSeconds > 0 ? durationInSeconds : durationInFrames / fps;

  const firstWordStart = lyricsData?.words?.[0]?.start ?? 0;
  const introDurationSeconds = firstWordStart;

  const songTitle = lyricsData.audio_file.replace(/\.[^.]+$/, "").replace(/_/g, " ");
  const subtitle =
    lyricsData.language === "ta"
      ? "Tamil Lyrics • English Transliteration"
      : "English Lyrics";

  return (
    <AbsoluteFill style={{ backgroundColor: "#07080c" }}>
      <SadBackground currentWord={currentWord} />
      <SadHeader title={songTitle} subtitle={subtitle} />
      <SadLyrics lyricsData={lyricsData} />
      <SadProgress totalDurationSeconds={totalDuration} />
      {introDurationSeconds > 0 && (
        <IntroAnimation introDurationSeconds={introDurationSeconds} />
      )}
      {lyricsData.audio_file && (
        <Audio src={staticFile(`assets/${lyricsData.audio_file}`)} />
      )}
    </AbsoluteFill>
  );
};
