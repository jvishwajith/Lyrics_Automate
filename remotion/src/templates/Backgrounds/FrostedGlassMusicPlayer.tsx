import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricsData } from "../../shared/types";
import { formatTime } from "../../shared/lyrics";
import { BACKGROUNDS_CONFIG } from "./config";
import {
  ShuffleIcon,
  MoreHorizontalIcon,
  MusicNoteIcon,
  FavoriteHeartIcon,
} from "./Icons";
import { useAdaptiveTheme } from "./theme";

interface FrostedGlassMusicPlayerProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
  textColor?: string;
  backgroundImage?: string;
}

export const FrostedGlassMusicPlayer: React.FC<FrostedGlassMusicPlayerProps> = ({
  lyricsData,
  durationInSeconds,
  textColor,
  backgroundImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const theme = useAdaptiveTheme(backgroundImage, textColor);

  const cardEntranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 18,
      mass: 0.7,
      stiffness: 90,
    },
  });
  const cardTranslateY = interpolate(cardEntranceSpring, [0, 1], [60, 0]);
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rawFileName = lyricsData?.audio_file || "";
  const displayFileName =
    rawFileName.split("/").pop()?.split("\\").pop() || rawFileName;

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

  const displayText = activeWord ? activeWord.text : "";

  const pulseFactor = Math.sin((frame / fps) * 3) * 0.15 + 0.85;

  const totalDuration = Math.max(
    durationInSeconds || 0,
    words.length > 0 ? words[words.length - 1].end : 0,
    0.1
  );
  const progressRatio = Math.min(1, Math.max(0, currentTime / totalDuration));
  const progressPercent = (progressRatio * 100).toFixed(2);

  const currentTimeFormatted = formatTime(currentTime);
  const totalDurationFormatted = formatTime(totalDuration);

  const { layout, typography } = BACKGROUNDS_CONFIG;

  const leftX = Math.round((1080 - layout.playerWidth) / 2);

  return (
    <div
      style={{
        position: "absolute",
        top: `${layout.playerTopY}px`,
        left: `${leftX}px`,
        transform: `translateY(${Math.round(cardTranslateY)}px)`,
        opacity: cardOpacity,
        width: `${layout.playerWidth}px`,
        minHeight: `${layout.playerHeight}px`,
        borderRadius: `${layout.playerRadius}px`,
        padding: "26px 36px 30px 36px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backdropFilter: "blur(20px) saturate(140%) brightness(1.04)",
        WebkitBackdropFilter: "blur(20px) saturate(140%) brightness(1.04)",
        background: theme.glassBackground,
        border: theme.glassBorder,
        boxShadow: `${theme.glassHighlight}, ${theme.glassDropShadow}`,
        zIndex: 50,
        pointerEvents: "none",
        fontFamily: typography.fontFamily,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "geometricPrecision",
        outline: theme.isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.20)",
        outlineOffset: "-1px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ opacity: 0.9, display: "flex", alignItems: "center" }}>
          <ShuffleIcon size={26} color={theme.primaryText} strokeWidth={2.2} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: theme.primaryText,
              boxShadow: theme.cursorGlow,
              opacity: pulseFactor,
              transform: `scale(${0.92 + 0.08 * pulseFactor})`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: typography.filename.fontSize,
              fontWeight: typography.filename.fontWeight,
              letterSpacing: typography.filename.letterSpacing,
              color: theme.secondaryText,
              lineHeight: 1,
            }}
          >
            {displayFileName}
          </span>
        </div>

        <div style={{ opacity: 0.9, display: "flex", alignItems: "center" }}>
          <MoreHorizontalIcon size={28} color={theme.primaryText} strokeWidth={2.2} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "18px 0 20px 0",
          width: "100%",
          minHeight: "90px",
        }}
      >
        <div
          style={{
            width: "82px",
            height: "82px",
            borderRadius: "24px",
            background: theme.buttonGlassBackground,
            border: theme.buttonGlassBorder,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.06)",
            flexShrink: 0,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <MusicNoteIcon size={40} color={theme.primaryText} strokeWidth={2.2} />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 18px",
            textAlign: "center",
            minHeight: "72px",
          }}
        >
          {displayText ? (
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.lyric.fontSize,
                fontWeight: typography.lyric.fontWeight,
                letterSpacing: typography.lyric.letterSpacing,
                lineHeight: typography.lyric.lineHeight,
                color: theme.primaryText,
                textShadow: theme.textShadow,
                opacity: wordOpacity,
                transform: `scale(${wordScale})`,
                display: "block",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "geometricPrecision",
              }}
            >
              {displayText}
            </span>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                opacity: 0.45 * pulseFactor,
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.secondaryText,
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.secondaryText,
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.secondaryText,
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            width: "82px",
            height: "82px",
            borderRadius: "24px",
            background: theme.buttonGlassBackground,
            border: theme.buttonGlassBorder,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.06)",
            flexShrink: 0,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <FavoriteHeartIcon size={38} color={theme.primaryText} strokeWidth={2.2} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "5px",
            borderRadius: "999px",
            backgroundColor: theme.trackBackground,
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${progressPercent}%`,
              borderRadius: "999px",
              background: theme.primaryText,
              boxShadow: theme.isDark ? theme.cursorGlow : "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: `${progressPercent}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: theme.cursorBackground,
              boxShadow: theme.cursorGlow,
              border: "1px solid rgba(255, 255, 255, 0.7)",
              pointerEvents: "auto",
              cursor: "pointer",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "0 2px",
          }}
        >
          <span
            style={{
              fontSize: typography.timestamp.fontSize,
              fontWeight: typography.timestamp.fontWeight,
              letterSpacing: typography.timestamp.letterSpacing,
              color: theme.secondaryText,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {currentTimeFormatted}
          </span>

          <span
            style={{
              fontSize: typography.timestamp.fontSize,
              fontWeight: typography.timestamp.fontWeight,
              letterSpacing: typography.timestamp.letterSpacing,
              color: theme.secondaryText,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {totalDurationFormatted}
          </span>
        </div>
      </div>
    </div>
  );
};
