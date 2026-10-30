import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { LyricsData } from "../../shared/types";
import { resolveIntroTextColor } from "../../shared/utils";
import { BackgroundImage } from "../Backgrounds/BackgroundImage";
import { JustLyricsView } from "./JustLyricsView";
import { IntroAnimation } from "../../shared/IntroAnimation";

interface JustLyricsVideoProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
  textColor?: string;
  backgroundImage?: string;
  fontFamily?: string;
  fontSize?: number | string;
}

export const JustLyricsVideo: React.FC<JustLyricsVideoProps> = ({
  lyricsData,
  textColor,
  backgroundImage,
  fontFamily,
  fontSize,
}) => {
  const chosenColor = lyricsData?.textColor ?? textColor ?? "#FFFFFF";
  const chosenImage =
    lyricsData?.backgroundImage ??
    lyricsData?.background_image ??
    backgroundImage;
  const chosenFontFamily = lyricsData?.fontFamily ?? fontFamily ?? "Outfit";
  const chosenFontSize = lyricsData?.fontSize ?? fontSize ?? 64;

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

      <JustLyricsView
        lyricsData={lyricsData}
        textColor={chosenColor}
        fontFamily={chosenFontFamily}
        fontSize={chosenFontSize}
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
