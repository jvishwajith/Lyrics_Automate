import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricsData } from "../../shared/types";
import { JUST_LYRICS_CONFIG } from "./config";
import { GoogleFontLoader } from "./GoogleFontLoader";

interface JustLyricsViewProps {
  lyricsData: LyricsData;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number | string;
}

export const JustLyricsView: React.FC<JustLyricsViewProps> = ({
  lyricsData,
  textColor,
  fontFamily,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const resolvedColor =
    lyricsData?.textColor ?? textColor ?? JUST_LYRICS_CONFIG.defaultTextColor;
  const resolvedFontFamily =
    lyricsData?.fontFamily ?? fontFamily ?? JUST_LYRICS_CONFIG.defaultFontFamily;
  const rawFontSize =
    lyricsData?.fontSize ?? fontSize ?? JUST_LYRICS_CONFIG.defaultFontSize;

  const resolvedFontSize = useMemo(() => {
    if (typeof rawFontSize === "number") return rawFontSize;
    const parsed = parseInt(String(rawFontSize).replace(/px/gi, "").trim(), 10);
    return isNaN(parsed) ? JUST_LYRICS_CONFIG.defaultFontSize : parsed;
  }, [rawFontSize]);

  const words = useMemo(() => lyricsData?.words || [], [lyricsData?.words]);
  const activeWord = useMemo(() => {
    if (!words.length || currentTime < words[0].start) return undefined;
    for (let i = words.length - 1; i >= 0; i--) {
      if (currentTime >= words[i].start) {
        return words[i];
      }
    }
    return undefined;
  }, [words, currentTime]);

  const activeWordStartFrame = activeWord
    ? Math.round(activeWord.start * fps)
    : 0;
  const wordLocalFrame = Math.max(0, frame - activeWordStartFrame);

  const wordEntranceSpring = spring({
    frame: wordLocalFrame,
    fps,
    config: {
      damping: 14,
      mass: 0.5,
      stiffness: 120,
    },
  });

  const wordScale = activeWord
    ? interpolate(wordEntranceSpring, [0, 1], [0.96, 1.0])
    : 1.0;

  const wordOpacity = activeWord
    ? interpolate(wordEntranceSpring, [0, 0.25], [0.4, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const lyricLines = useMemo(() => {
    if (!activeWord || !activeWord.text) return [];
    const text = activeWord.text.trim();
    if (text.includes("-")) {
      const parts = text.split("-");
      const line1 = parts[0].trim();
      const line2 = parts.slice(1).join("-").trim();
      return [line1, line2].filter(Boolean);
    }
    return [text];
  }, [activeWord]);

  const { layout } = JUST_LYRICS_CONFIG;

  return (
    <>
      <GoogleFontLoader fontFamily={resolvedFontFamily} />
      <div
        style={{
          position: "absolute",
          top: `${layout.containerTopY}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${layout.containerWidth}px`,
          height: `${layout.containerHeight}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 50,
          boxSizing: "border-box",
          padding: "0 30px",
        }}
      >
        {activeWord && lyricLines.length > 0 && (
          <div
            style={{
              opacity: wordOpacity,
              transform: `scale(${wordScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0px",
              width: "100%",
            }}
          >
            {lyricLines.map((line, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: `"${resolvedFontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
                  fontSize: `${resolvedFontSize}px`,
                  fontWeight: "normal",
                  letterSpacing: "normal",
                  lineHeight: 1.0,
                  color: resolvedColor,
                  textAlign: "center",
                  display: "block",
                  width: "100%",
                  wordBreak: "break-word",
                  textShadow: "none",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                  textRendering: "geometricPrecision",
                }}
              >
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
