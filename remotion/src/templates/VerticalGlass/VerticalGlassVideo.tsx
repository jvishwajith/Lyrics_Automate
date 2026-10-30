import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { LyricsData } from "../../shared/types";
import { resolveIntroTextColor } from "../../shared/utils";
import { VerticalGlassBackground } from "./VerticalGlassBackground";
import { VerticalGlassMusicPlayer } from "./VerticalGlassMusicPlayer";
import { IntroAnimation } from "../../shared/IntroAnimation";

interface VerticalGlassVideoProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
  textColor?: string;
  backgroundImage?: string;
}

export const VerticalGlassVideo: React.FC<VerticalGlassVideoProps> = ({
  lyricsData,
  durationInSeconds,
  textColor,
  backgroundImage,
}) => {
  const chosenColor = lyricsData?.textColor ?? textColor ?? "#FFFFFF";
  const chosenImage =
    lyricsData?.backgroundImage ??
    lyricsData?.background_image ??
    backgroundImage;

  const firstWordStart = lyricsData?.words?.[0]?.start ?? 0;
  const introDurationSeconds = firstWordStart;
  const introTextColor = resolveIntroTextColor(chosenColor);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <VerticalGlassBackground
        imageName={chosenImage}
        introDurationSeconds={introDurationSeconds}
        textColor={chosenColor}
      />

      {lyricsData.audio_file && (
        <Audio src={staticFile(`assets/${lyricsData.audio_file}`)} />
      )}

      <VerticalGlassMusicPlayer
        lyricsData={lyricsData}
        durationInSeconds={durationInSeconds}
        textColor={chosenColor}
        backgroundImage={chosenImage}
      />

      {introDurationSeconds > 0 && (
        <IntroAnimation
          introDurationSeconds={introDurationSeconds}
          textColor={introTextColor}
        />
      )}
    </AbsoluteFill>
  );
};
