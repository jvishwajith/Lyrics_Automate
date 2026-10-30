import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { LyricWord, LyricsData } from "../../shared/types";
import { getActiveLyricsState } from "../../shared/lyrics";
import { SAD_CONFIG } from "./config";

const { fontFamily } = loadFont("normal", { weights: ["600"], subsets: ["latin"] });

interface SadLyricsProps { lyricsData: LyricsData; }

export const SadLyrics: React.FC<SadLyricsProps> = ({ lyricsData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const t = SAD_CONFIG.theme;
  const l = SAD_CONFIG.layout;
  const a = SAD_CONFIG.animation;
  const ty = SAD_CONFIG.typography;

  const { currentWord, previousWord, nextWord } = getActiveLyricsState(lyricsData.words, currentTime, a.previewWindowSeconds);

  const renderEcho = (word: LyricWord) => {
    const endFrame = Math.round(word.end * fps);
    const framesSinceEnd = frame - endFrame;
    if (framesSinceEnd < 0 || framesSinceEnd > fps * a.echoFadeSeconds) return null;
    const opacity = interpolate(framesSinceEnd, [0, fps * a.echoFadeSeconds], [a.echoOpacity, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const driftY = interpolate(framesSinceEnd, [0, fps * a.echoFadeSeconds], [-l.lineVerticalOffset, -l.lineVerticalOffset - 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div key={`echo-${word.index}`} style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) translateY(${driftY}px)`, width: "100%", textAlign: "center", fontFamily, fontSize: `${ty.contextFontSize}px`, fontWeight: ty.contextFontWeight, letterSpacing: ty.contextLetterSpacing, color: t.secondaryTextColor, opacity, filter: `blur(${a.echoBlurPx}px)`, pointerEvents: "none", willChange: "transform, opacity, filter", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
        {word.text}
      </div>
    );
  };

  const renderHero = (word: LyricWord) => {
    const startFrame = Math.round(word.start * fps);
    const endFrame = Math.round(word.end * fps);
    const durationFrames = Math.max(1, endFrame - startFrame);
    const localFrame = frame - startFrame;
    const exitThresholdFrames = Math.max(8, Math.round(fps * a.exitThresholdSeconds));
    const exitFrame = frame - (endFrame - exitThresholdFrames);

    const entryProgress = spring({ frame: localFrame, fps, config: a.spring });
    const entryY = interpolate(entryProgress, [0, 1], [a.entryTranslateY, 0]);
    const entryOpacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
    const textColor = word.emphasis ? t.highlightTextColor : t.primaryTextColor;
    const textShadow = word.emphasis
      ? `0 0 45px ${t.accentVocalGlow}, 0 8px 30px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.4)`
      : `0 8px 35px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8), 0 0 25px ${t.accentVocalGlow}`;

    return (
      <div key={`hero-${word.index}`} style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${continuousScale})`, width: "100%", textAlign: "center", fontFamily, fontSize: `${ty.heroFontSize}px`, fontWeight: ty.heroFontWeight, lineHeight: ty.heroLineHeight, letterSpacing: ty.heroLetterSpacing, color: textColor, opacity, filter: `blur(${blur}px)`, textShadow, willChange: "transform, opacity, filter", padding: "0 20px", boxSizing: "border-box" }}>
        {word.text}
      </div>
    );
  };

  const renderPreview = (word: LyricWord) => {
    const timeUntilStart = word.start - currentTime;
    if (timeUntilStart <= 0 || timeUntilStart > a.previewWindowSeconds) return null;
    const pp = 1 - timeUntilStart / a.previewWindowSeconds;
    const opacity = interpolate(pp, [0, 0.4, 1], [0, a.previewOpacity * 0.7, a.previewOpacity], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const previewY = interpolate(pp, [0, 1], [l.lineVerticalOffset + 20, l.lineVerticalOffset], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div key={`preview-${word.index}`} style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) translateY(${previewY}px)`, width: "100%", textAlign: "center", fontFamily, fontSize: `${ty.contextFontSize - 4}px`, fontWeight: ty.contextFontWeight, letterSpacing: ty.contextLetterSpacing, color: t.tertiaryTextColor, opacity, filter: `blur(${a.previewBlurPx}px)`, pointerEvents: "none", willChange: "transform, opacity, filter", textShadow: "0 4px 15px rgba(0,0,0,0.7)" }}>
        {word.text}
      </div>
    );
  };

  return (
    <div style={{ position: "absolute", top: `${l.lyricStageCenterY}px`, left: "50%", transform: "translate(-50%, -50%)", width: `${l.safeRight - l.safeLeft}px`, height: "400px", display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none", zIndex: 20 }}>
      {previousWord && renderEcho(previousWord)}
      {currentWord && renderHero(currentWord)}
      {nextWord && renderPreview(nextWord)}
    </div>
  );
};
