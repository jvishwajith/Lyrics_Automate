import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricsData, LyricWord } from "../../shared/types";
import { IntroAnimation } from "../../shared/IntroAnimation";
import { FeelGoodBackground } from "./FeelGoodBackground";
import { FeelGoodLyrics } from "./FeelGoodLyrics";

interface FeelGoodVideoProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
}

export const FeelGoodVideo: React.FC<FeelGoodVideoProps> = ({ lyricsData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const currentWord: LyricWord | undefined = lyricsData?.words?.find(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  const firstWordStart = lyricsData?.words?.[0]?.start ?? 0;
  const introDurationSeconds = firstWordStart;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0906" }}>
      <FeelGoodBackground currentWord={currentWord} />
      <FeelGoodLyrics lyricsData={lyricsData} />
      {introDurationSeconds > 0 && (
        <IntroAnimation introDurationSeconds={introDurationSeconds} />
      )}
      {lyricsData.audio_file && <Audio src={staticFile(`assets/${lyricsData.audio_file}`)} />}
    </AbsoluteFill>
  );
};
