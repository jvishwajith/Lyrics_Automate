import React from "react";
import { CompositionProps, LyricsData } from "./shared/types";
import { TEMPLATE_REGISTRY, WATERMARK_BOTTOM_TEMPLATES } from "./templates/registry";
import { Watermark } from "./components/Watermark";

interface MasterCompositionProps extends CompositionProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
}

export const MasterComposition: React.FC<MasterCompositionProps> = ({
  template = "sad",
  lyricsData,
  durationInSeconds,
  watermark = "@LetsBreakup-2k26",
  showWatermark = true,
  textColor,
  backgroundImage,
  fontFamily,
  fontSize,
}) => {
  const normTemplate = (template || "sad").toLowerCase();
  const effectiveTextColor = lyricsData?.textColor ?? textColor;
  const effectiveBackgroundImage =
    lyricsData?.backgroundImage ?? lyricsData?.background_image ?? backgroundImage;
  const effectiveFontFamily = lyricsData?.fontFamily ?? fontFamily;
  const effectiveFontSize = lyricsData?.fontSize ?? fontSize;

  const TemplateComponent = TEMPLATE_REGISTRY[normTemplate] ?? TEMPLATE_REGISTRY["sad"];
  const watermarkPosition = WATERMARK_BOTTOM_TEMPLATES.has(normTemplate) ? "bottom" : "top";

  return (
    <>
      <TemplateComponent
        lyricsData={lyricsData}
        durationInSeconds={durationInSeconds}
        textColor={effectiveTextColor}
        backgroundImage={effectiveBackgroundImage}
        fontFamily={effectiveFontFamily}
        fontSize={effectiveFontSize}
      />
      {showWatermark && (
        <Watermark
          handle={watermark}
          position={watermarkPosition}
          bottomY={120}
        />
      )}
    </>
  );
};
