import React from "react";
import { Composition, staticFile } from "remotion";
import { MasterComposition } from "./MasterComposition";
import { LyricsData, CompositionProps, TemplateName } from "./shared/types";
import { IntroOnly } from "./shared/IntroOnly";
import { WatermarkOnly } from "./shared/WatermarkOnly";
import { getAudioDurationInSeconds } from "@remotion/media-utils";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

type ExtendedLyricsData = LyricsData & {
  template?: TemplateName;
  watermark?: string;
  showWatermark?: boolean;
};

async function calculateMetadata({ props }: { props: CompositionProps }) {
  let lyricsData: ExtendedLyricsData;
  try {
    const res = await fetch(staticFile("assets/active_timing.json"));
    if (!res.ok) throw new Error("No active_timing.json");
    lyricsData = (await res.json()) as ExtendedLyricsData;
  } catch {
    const res = await fetch(staticFile("assets/tamil_timing_v4.json"));
    lyricsData = (await res.json()) as ExtendedLyricsData;
  }

  const effectiveLyricsData =
    props.lyricsData?.words?.length
      ? { ...lyricsData, ...props.lyricsData }
      : lyricsData;

  const audioUrl = staticFile(`assets/${effectiveLyricsData.audio_file}`);
  const durationInSeconds = await getAudioDurationInSeconds(audioUrl);
  const durationInFrames = Math.ceil(durationInSeconds * FPS);

  const selectedTemplate = effectiveLyricsData.template ?? props.template ?? "sad";
  const selectedWatermark = effectiveLyricsData.watermark ?? props.watermark ?? "@LetsBreakup-2k26";
  const selectedShowWatermark = effectiveLyricsData.showWatermark ?? props.showWatermark ?? true;
  const selectedTextColor = effectiveLyricsData.textColor ?? props.textColor ?? "#FFFFFF";
  const selectedBgImage =
    effectiveLyricsData.backgroundImage ??
    effectiveLyricsData.background_image ??
    props.backgroundImage ??
    "1.png";
  const selectedFontFamily = effectiveLyricsData.fontFamily ?? props.fontFamily ?? "Outfit";
  const selectedFontSize = effectiveLyricsData.fontSize ?? props.fontSize ?? 64;

  return {
    durationInFrames,
    props: {
      ...props,
      template: selectedTemplate,
      lyricsData: effectiveLyricsData,
      durationInSeconds,
      watermark: selectedWatermark,
      showWatermark: selectedShowWatermark,
      textColor: selectedTextColor,
      backgroundImage: selectedBgImage,
      fontFamily: selectedFontFamily,
      fontSize: selectedFontSize,
    },
  };
}

const defaultProps: CompositionProps = {
  watermark: "@LetsBreakup-2k26",
  showWatermark: true,
  textColor: "#FFFFFF",
  backgroundImage: "1.png",
  fontFamily: "Outfit",
  fontSize: 64,
  lyricsData: {
    audio_file: "Thodu_Vaanam.mp3",
    language: "ta",
    model: "whisper-large-v3-turbo",
    words: [],
  },
  durationInSeconds: 0,
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LyricsVideo"
      component={MasterComposition as unknown as React.FC<Record<string, unknown>>}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      calculateMetadata={calculateMetadata}
      defaultProps={defaultProps as unknown as Record<string, unknown>}
    />
    <Composition
      id="IntroOnly"
      component={IntroOnly}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={6 * FPS}
      defaultProps={{}}
    />
    <Composition
      id="WatermarkOnly"
      component={WatermarkOnly}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={45 * FPS}
      defaultProps={{}}
    />
  </>
);