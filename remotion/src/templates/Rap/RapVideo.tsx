import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricsData, LyricWord } from "../../shared/types";
import { IntroAnimation } from "../../shared/IntroAnimation";
import { RapBackground } from "./RapBackground";
import { RapLyrics } from "./RapLyrics";

interface RapVideoProps { lyricsData: LyricsData; durationInSeconds: number; }

export const RapVideo: React.FC<RapVideoProps> = ({ lyricsData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const currentWord: LyricWord | undefined = lyricsData?.words?.find((w) => currentTime >= w.start && currentTime < w.end);

  const firstWordStart = lyricsData?.words?.[0]?.start ?? 0;
  const introDurationSeconds = firstWordStart;

  return (
    <AbsoluteFill style={{ backgroundColor: "#08090a" }}>
      <RapBackground currentWord={currentWord} />
      <RapLyrics lyricsData={lyricsData} />
      {introDurationSeconds > 0 && (
        <IntroAnimation introDurationSeconds={introDurationSeconds} />
      )}
      {lyricsData.audio_file && <Audio src={staticFile(`assets/${lyricsData.audio_file}`)} />}
    </AbsoluteFill>
  );
};
