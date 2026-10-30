import React from "react";
import { LyricsData } from "../shared/types";
import { SadVideo } from "./Sad/SadVideo";
import { RapVideo } from "./Rap/RapVideo";
import { FeelGoodVideo } from "./FeelGood/FeelGoodVideo";
import { EnergeticVideo } from "./Energetic/EnergeticVideo";
import { BackgroundsVideo } from "./Backgrounds/BackgroundsVideo";
import { VerticalGlassVideo } from "./VerticalGlass/VerticalGlassVideo";
import { JustLyricsVideo } from "./JustLyrics/JustLyricsVideo";

export interface TemplateVideoProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
  textColor?: string;
  backgroundImage?: string;
  fontFamily?: string;
  fontSize?: number | string;
}

export type TemplateVideoComponent = React.FC<TemplateVideoProps>;

export const WATERMARK_BOTTOM_TEMPLATES = new Set<string>([
  "backgrounds",
  "verticalglass",
  "justlyrics",
]);

export const TEMPLATE_REGISTRY: Record<string, TemplateVideoComponent> = {
  sad:           SadVideo,
  rap:           RapVideo,
  feelgood:      FeelGoodVideo,
  energetic:     EnergeticVideo,
  backgrounds:   BackgroundsVideo,
  verticalglass: VerticalGlassVideo,
  justlyrics:    JustLyricsVideo,
};
