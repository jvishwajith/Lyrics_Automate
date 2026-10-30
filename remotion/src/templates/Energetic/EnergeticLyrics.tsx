import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";
import { LyricWord, LyricsData } from "../../shared/types";
import { getActiveLyricsState, formatTime } from "../../shared/lyrics";
import { ENERGETIC_CONFIG } from "./config";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

interface EnergeticLyricsProps { lyricsData: LyricsData; }

export const EnergeticLyrics: React.FC<EnergeticLyricsProps> = ({ lyricsData }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;
  const t = ENERGETIC_CONFIG.theme;
  const l = ENERGETIC_CONFIG.layout;
  const a = ENERGETIC_CONFIG.animation;
  const ty = ENERGETIC_CONFIG.typography;

  const { currentWord, previousWord, nextWord } = getActiveLyricsState(
    lyricsData.words,
    currentTime,
    a.previewWindowSeconds
  );

  const renderEcho = (word: LyricWord) => {
    const endFrame = Math.round(word.end * fps);
    const framesSinceEnd = frame - endFrame;
    if (framesSinceEnd < 0 || framesSinceEnd > fps * a.echoFadeSeconds) return null;
    const opacity = interpolate(
      framesSinceEnd,
      [0, fps * a.echoFadeSeconds],
      [a.echoOpacity, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const driftY = interpolate(
      framesSinceEnd,
      [0, fps * a.echoFadeSeconds],
      [-l.lineVerticalOffset, -l.lineVerticalOffset - 22],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return (
      <div
        key={`echo-${word.index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${driftY}px)`,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontSize: `${ty.contextFontSize}px`,
          fontWeight: ty.contextFontWeight,
          letterSpacing: ty.contextLetterSpacing,
          color: t.secondaryTextColor,
          opacity,
          filter: `blur(${a.echoBlurPx}px)`,
          pointerEvents: "none",
          willChange: "transform, opacity, filter",
          textTransform: "uppercase",
          padding: "0 60px",
          boxSizing: "border-box",
        }}
      >
        {word.text}
      </div>
    );
  };

  const renderHero = (word: LyricWord) => {
    const startFrame = Math.round(word.start * fps);
    const endFrame = Math.round(word.end * fps);
    const durationFrames = Math.max(1, endFrame - startFrame);
    const localFrame = frame - startFrame;
    const exitThresholdFrames = Math.max(6, Math.round(fps * a.exitThresholdSeconds));
    const exitFrame = frame - (endFrame - exitThresholdFrames);

    const entryProgress = spring({ frame: localFrame, fps, config: a.spring });
    const entryY = interpolate(entryProgress, [0, 1], [a.entryTranslateY, 0]);
    const entryScale = interpolate(entryProgress, [0, 0.5, 1], [0.88, 1.06, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const entryOpacity = interpolate(localFrame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const entryBlur = interpolate(entryProgress, [0, 1], [a.entryBlurPx, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const vfp = Math.min(1, Math.max(0, localFrame / durationFrames));
    const continuousScale = interpolate(vfp, [0, 1], [1.0, a.heroContinuousZoom], { extrapolateRight: "clamp" });
    const continuousFloatY = interpolate(vfp, [0, 1], [0, a.heroFloatY], { extrapolateRight: "clamp" });

    const isExiting = exitFrame > 0;
    const exitOpacity = interpolate(exitFrame, [0, exitThresholdFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const exitBlur = interpolate(exitFrame, [0, exitThresholdFrames], [0, a.exitBlurPx], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const exitY = interpolate(exitFrame, [0, exitThresholdFrames], [0, a.exitTranslateY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const opacity = isExiting ? exitOpacity : entryOpacity;
    const blur = isExiting ? exitBlur : entryBlur;
    const translateY = (isExiting ? exitY : entryY) + continuousFloatY;
    const scale = (isExiting ? 1.0 : entryScale) * continuousScale;

    const textColor = word.emphasis ? t.highlightTextColor : t.primaryTextColor;
    const textShadow = word.emphasis
      ? `0 0 40px ${t.accentGlow}, 0 0 80px ${t.accentGlow}, 0 4px 20px rgba(0,0,0,0.9)`
      : `0 0 25px ${t.accentMagentaGlow}, 0 4px 20px rgba(0,0,0,0.9)`;

    return (
      <div
        key={`hero-${word.index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontSize: `${ty.heroFontSize}px`,
          fontWeight: ty.heroFontWeight,
          lineHeight: ty.heroLineHeight,
          letterSpacing: ty.heroLetterSpacing,
          color: textColor,
          opacity,
          filter: `blur(${blur}px)`,
          textShadow,
          textTransform: "uppercase",
          willChange: "transform, opacity, filter",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        {word.text}
      </div>
    );
  };

  const renderPreview = (word: LyricWord) => {
    const timeUntilStart = word.start - currentTime;
    if (timeUntilStart <= 0 || timeUntilStart > a.previewWindowSeconds) return null;
    const pp = 1 - timeUntilStart / a.previewWindowSeconds;
    const opacity = interpolate(pp, [0, 0.4, 1], [0, a.previewOpacity * 0.6, a.previewOpacity], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const previewY = interpolate(pp, [0, 1], [l.lineVerticalOffset + 16, l.lineVerticalOffset], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div
        key={`preview-${word.index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${previewY}px)`,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontSize: `${ty.contextFontSize - 4}px`,
          fontWeight: ty.contextFontWeight,
          letterSpacing: ty.contextLetterSpacing,
          color: t.tertiaryTextColor,
          opacity,
          filter: `blur(${a.previewBlurPx}px)`,
          pointerEvents: "none",
          willChange: "transform, opacity, filter",
          textTransform: "uppercase",
          padding: "0 60px",
          boxSizing: "border-box",
        }}
      >
        {word.text}
      </div>
    );
  };

  const totalSeconds = durationInFrames / fps;
  const pct = Math.min(100, Math.max(0, (currentTime / totalSeconds) * 100));

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: `${l.lyricStageCenterY}px`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${l.safeRight - l.safeLeft}px`,
          height: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        {previousWord && renderEcho(previousWord)}
        {currentWord && renderHero(currentWord)}
        {nextWord && renderPreview(nextWord)}
      </div>

      <div
        style={{
          position: "absolute",
          top: `${l.headerCenterY}px`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "2px",
            backgroundColor: t.accentCyan,
            boxShadow: `0 0 14px ${t.accentCyan}, 0 0 28px ${t.accentGlow}`,
            transform: `rotate(${frame * 2.5}deg)`,
            opacity: 0.8 + Math.sin(frame / 10) * 0.2,
          }}
        />
        <span
          style={{
            fontFamily,
            fontSize: `${ty.metaFontSize}px`,
            fontWeight: ty.metaFontWeight,
            letterSpacing: ty.metaLetterSpacing,
            color: t.secondaryTextColor,
            textTransform: "uppercase",
          }}
        >
          {lyricsData.audio_file.replace(/\.[^.]+$/, "").replace(/_/g, " ")}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: `${l.progressCenterY}px`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "68%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div style={{ width: "100%", height: "3px", backgroundColor: t.progressBarTrack, borderRadius: "1px", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${pct}%`,
              backgroundColor: t.progressBarColor,
              boxShadow: `0 0 12px ${t.progressBarColor}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${pct}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              backgroundColor: t.accentCyan,
              boxShadow: `0 0 10px ${t.accentCyan}`,
            }}
          />
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            fontFamily,
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.10em",
            color: t.tertiaryTextColor,
            textTransform: "uppercase",
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalSeconds)}</span>
        </div>
      </div>
    </>
  );
};
