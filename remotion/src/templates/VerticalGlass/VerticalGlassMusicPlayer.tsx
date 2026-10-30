import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricsData } from "../../shared/types";
import { formatTime } from "../../shared/lyrics";
import { VERTICAL_GLASS_CONFIG } from "./config";
import { ShuffleIcon, PrevIcon, NextIcon, PauseIcon, HeartIcon } from "./Icons";
import { useVerticalGlassTheme } from "./theme";

interface VerticalGlassMusicPlayerProps {
  lyricsData: LyricsData;
  durationInSeconds: number;
  textColor?: string;
  backgroundImage?: string;
}

export const VerticalGlassMusicPlayer: React.FC<VerticalGlassMusicPlayerProps> = ({
  lyricsData,
  durationInSeconds,
  textColor,
  backgroundImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const theme = useVerticalGlassTheme(backgroundImage, textColor);

  const entranceSpring = spring({ frame, fps, config: { damping: 18, mass: 0.7, stiffness: 90 } });
  const cardTranslateY = interpolate(entranceSpring, [0, 1], [50, 0]);
  const cardOpacity    = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rawFileName    = lyricsData?.audio_file || "";
  const displayFileName = rawFileName.split("/").pop()?.split("\\").pop() || rawFileName;

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

  const wordStartFrame = activeWord ? Math.round(activeWord.start * fps) : 0;
  const wordLocalFrame = Math.max(0, frame - wordStartFrame);
  const wordSpring     = spring({ frame: wordLocalFrame, fps, config: { damping: 14, mass: 0.5, stiffness: 120 } });
  const wordScale      = activeWord ? interpolate(wordSpring, [0, 1], [0.97, 1.0]) : 1.0;
  const wordOpacity    = activeWord
    ? interpolate(wordSpring, [0, 0.25], [0.3, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const lyricLines = useMemo(() => {
    if (!activeWord || !activeWord.text) return [];
    if (activeWord.text.includes("-")) {
      return activeWord.text.split("-").map((s) => s.trim()).filter(Boolean);
    }
    return [activeWord.text.trim()];
  }, [activeWord]);

  const pulse = Math.sin((frame / fps) * 3) * 0.15 + 0.85;

  const totalDuration   = Math.max(durationInSeconds || 0, words.length > 0 ? words[words.length - 1].end : 0, 0.1);
  const progressPercent = (Math.min(1, Math.max(0, currentTime / totalDuration)) * 100).toFixed(2);
  const curTime         = formatTime(currentTime);
  const totTime         = formatTime(totalDuration);

  const { layout, typography } = VERTICAL_GLASS_CONFIG;
  const leftX = Math.round((1080 - layout.playerWidth) / 2);

  const lyricColor     = theme.primaryText;
  const secondaryColor = theme.secondaryText;

  return (
    <div
      style={{
        position: "absolute",
        top: `${layout.playerTopY}px`,
        left: `${leftX}px`,
        transform: `translateY(${Math.round(cardTranslateY)}px)`,
        opacity: cardOpacity,
        width: `${layout.playerWidth}px`,
        borderRadius: `${layout.playerRadius}px`,
        padding: "28px 24px 30px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "0px",
        backdropFilter: "blur(28px) saturate(170%) brightness(1.06)",
        WebkitBackdropFilter: "blur(28px) saturate(170%) brightness(1.06)",
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
          justifyContent: "flex-start",
          width: "100%",
          marginBottom: "18px",
        }}
      >
        <span
          style={{
            fontSize: typography.filename.fontSize,
            fontWeight: typography.filename.fontWeight,
            letterSpacing: typography.filename.letterSpacing,
            color: secondaryColor,
            lineHeight: 1,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayFileName}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          minHeight: "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          marginBottom: "22px",
        }}
      >
        {activeWord && lyricLines.length > 0 ? (
          <div
            style={{
              opacity: wordOpacity,
              transform: `scale(${wordScale})`,
              transformOrigin: "left center",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              width: "100%",
            }}
          >
            {lyricLines.map((line, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.lyric.fontSize,
                  fontWeight: typography.lyric.fontWeight,
                  letterSpacing: typography.lyric.letterSpacing,
                  lineHeight: typography.lyric.lineHeight,
                  color: lyricColor,
                  textShadow: theme.textShadow,
                  display: "block",
                  width: "100%",
                  wordBreak: "break-word",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                }}
              >
                {line}
              </span>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              opacity: 0.40 * pulse,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  backgroundColor: secondaryColor,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "4px",
            borderRadius: "999px",
            backgroundColor: theme.trackBackground,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
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
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              backgroundColor: theme.cursorBackground,
              boxShadow: theme.cursorGlow,
              border: "1.5px solid rgba(255,255,255,0.80)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 2px",
          }}
        >
          <span
            style={{
              fontSize: typography.timestamp.fontSize,
              fontWeight: typography.timestamp.fontWeight,
              letterSpacing: typography.timestamp.letterSpacing,
              color: secondaryColor,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {curTime}
          </span>
          <span
            style={{
              fontSize: typography.timestamp.fontSize,
              fontWeight: typography.timestamp.fontWeight,
              letterSpacing: typography.timestamp.letterSpacing,
              color: secondaryColor,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {totTime}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ opacity: 0.80, display: "flex", alignItems: "center" }}>
          <ShuffleIcon size={28} color={secondaryColor} strokeWidth={1.9} />
        </div>

        <div style={{ opacity: 0.88, display: "flex", alignItems: "center" }}>
          <PrevIcon size={30} color={secondaryColor} strokeWidth={2.1} />
        </div>

        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: theme.playButtonBg,
            boxShadow: theme.playButtonShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PauseIcon size={26} color="#FFFFFF" strokeWidth={2.6} />
        </div>

        <div style={{ opacity: 0.88, display: "flex", alignItems: "center" }}>
          <NextIcon size={30} color={secondaryColor} strokeWidth={2.1} />
        </div>

        <div style={{ opacity: 0.80, display: "flex", alignItems: "center" }}>
          <HeartIcon size={28} color={secondaryColor} strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
};
