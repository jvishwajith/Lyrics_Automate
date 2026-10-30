import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { LyricsData } from "../../shared/types";
import { resolveIntroTextColor } from "../../shared/utils";
import { BackgroundImage } from "./BackgroundImage";
import { FrostedGlassMusicPlayer } from "./FrostedGlassMusicPlayer";
import { IntroAnimation } from "../../shared/IntroAnimation";

interface BackgroundsVideoProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
  textColor?: string;
  backgroundImage?: string;
}

export const BackgroundsVideo: React.FC<BackgroundsVideoProps> = ({
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
      <BackgroundImage
        imageName={chosenImage}
        introDurationSeconds={introDurationSeconds}
        textColor={chosenColor}
      />

      {lyricsData.audio_file && (
        <Audio src={staticFile(`assets/${lyricsData.audio_file}`)} />
      )}

      <FrostedGlassMusicPlayer
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
