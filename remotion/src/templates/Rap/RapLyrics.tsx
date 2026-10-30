import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";
import { LyricWord, LyricsData } from "../../shared/types";
import {
  groupWordsIntoClusters,
  getActiveCluster,
  formatTime,
} from "../../shared/lyrics";
import { RAP_CONFIG } from "./config";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

interface RapLyricsProps { lyricsData: LyricsData; }

function adaptFontSize(text: string, basePx: number): number {
  if (text.length > 14) return Math.round(basePx * 0.80);
  if (text.length > 10) return Math.round(basePx * 0.90);
  return basePx;
}

export const RapLyrics: React.FC<RapLyricsProps> = ({ lyricsData }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;
  const t = RAP_CONFIG.theme;
  const l = RAP_CONFIG.layout;
  const a = RAP_CONFIG.animation;
  const ty = RAP_CONFIG.typography;

  const clusters = useMemo(
    () =>
      groupWordsIntoClusters(
        lyricsData.words,
        a.burstThresholdSeconds,
        a.burstGroupMaxWords,
        a.burstGroupMaxSpanSeconds
      ),
    [lyricsData.words, a.burstThresholdSeconds, a.burstGroupMaxWords, a.burstGroupMaxSpanSeconds]
  );

  const { activeCluster, echoCluster, previewCluster, activeWordIndex } =
    getActiveCluster(clusters, currentTime, a.echoFadeSeconds, a.previewWindowSeconds);

  const totalSeconds = durationInFrames / fps;
  const pct = Math.min(100, Math.max(0, (currentTime / totalSeconds) * 100));

  const renderStandardHero = (word: LyricWord) => {
    const startFrame = Math.round(word.start * fps);
    const endFrame = Math.round(word.end * fps);
    const durationFrames = Math.max(1, endFrame - startFrame);
    const localFrame = frame - startFrame;

    const rawExitFrames = Math.max(6, Math.round(fps * a.exitThresholdSeconds));
    const exitThresholdFrames = Math.min(rawExitFrames, Math.floor(durationFrames * 0.40));
    const exitFrame = frame - (endFrame - exitThresholdFrames);

    const entryProgress = spring({ frame: localFrame, fps, config: a.spring });
    const entryY = interpolate(entryProgress, [0, 1], [a.entryTranslateY, 0]);
    const entryOpacity = interpolate(localFrame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
    const fontSize = adaptFontSize(word.text, ty.heroFontSize);
    const textShadow = word.emphasis
      ? `0 0 40px ${t.accentNeonGlow}, 0 0 80px ${t.accentNeonGlow}, 0 4px 20px rgba(0,0,0,0.9)`
      : `0 4px 25px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.7)`;

    return (
      <div
        key={`std-${word.index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${continuousScale})`,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight: ty.heroFontWeight,
          lineHeight: ty.heroLineHeight,
          letterSpacing: ty.heroLetterSpacing,
          color: textColor,
          opacity,
          filter: `blur(${blur}px)`,
          textShadow,
          willChange: "transform, opacity, filter",
          padding: "0 20px",
          boxSizing: "border-box",
          textTransform: "uppercase",
        }}
      >
        {word.text}
      </div>
    );
  };

  const renderStandardEcho = (word: LyricWord) => {
    const endFrame = Math.round(word.end * fps);
    const framesSinceEnd = frame - endFrame;
    if (framesSinceEnd < 0 || framesSinceEnd > fps * a.echoFadeSeconds) return null;
    const opacity = interpolate(framesSinceEnd, [0, fps * a.echoFadeSeconds], [a.echoOpacity, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const driftY = interpolate(framesSinceEnd, [0, fps * a.echoFadeSeconds], [-l.lineVerticalOffset, -l.lineVerticalOffset - 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div
        key={`echo-std-${word.index}`}
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
        }}
      >
        {word.text}
      </div>
    );
  };

  const renderStandardPreview = (word: LyricWord) => {
    const timeUntilStart = word.start - currentTime;
    if (timeUntilStart <= 0 || timeUntilStart > a.previewWindowSeconds) return null;
    const pp = 1 - timeUntilStart / a.previewWindowSeconds;
    const opacity = interpolate(pp, [0, 0.4, 1], [0, a.previewOpacity * 0.6, a.previewOpacity], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const previewY = interpolate(pp, [0, 1], [l.lineVerticalOffset + 15, l.lineVerticalOffset], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div
        key={`preview-std-${word.index}`}
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
        }}
      >
        {word.text}
      </div>
    );
  };

  const renderBurstCluster = () => {
    if (!activeCluster || !activeCluster.isBurst) return null;

    const clusterStartFrame = Math.round(activeCluster.start * fps);
    const clusterEndFrame = Math.round(activeCluster.end * fps);
    const clusterDurationFrames = Math.max(1, clusterEndFrame - clusterStartFrame);
    const clusterLocalFrame = frame - clusterStartFrame;

    const entryProgress = spring({ frame: clusterLocalFrame, fps, config: a.burstSpring });
    const entryY = interpolate(entryProgress, [0, 1], [a.burstEntryTranslateY, 0], { extrapolateRight: "clamp" });
    const entryOpacity = interpolate(clusterLocalFrame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const entryBlur = interpolate(entryProgress, [0, 1], [a.burstEntryBlurPx, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const rawExitFrames = Math.max(6, Math.round(fps * a.exitThresholdSeconds));
    const exitThresholdFrames = Math.min(rawExitFrames, Math.floor(clusterDurationFrames * 0.35));
    const exitFrame = frame - (clusterEndFrame - exitThresholdFrames);
    const isExiting = exitFrame > 0;
    const exitOpacity = interpolate(exitFrame, [0, exitThresholdFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const exitBlur = interpolate(exitFrame, [0, exitThresholdFrames], [0, a.burstExitBlurPx], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const exitY = interpolate(exitFrame, [0, exitThresholdFrames], [0, a.burstExitTranslateY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const clusterOpacity = isExiting ? exitOpacity : entryOpacity;
    const clusterBlur = isExiting ? exitBlur : entryBlur;
    const clusterTranslateY = (isExiting ? exitY : entryY);

    const words = activeCluster.words;
    const separatorStyle: React.CSSProperties = {
      width: "52%",
      height: "1px",
      backgroundColor: t.accentNeon,
      opacity: 0.35,
      margin: `${a.clusterGapPx * 0.5}px auto`,
      borderRadius: "1px",
    };

    return (
      <div
        key={`burst-${activeCluster.words[0].index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${clusterTranslateY}px)`,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: clusterOpacity,
          filter: `blur(${clusterBlur}px)`,
          pointerEvents: "none",
          willChange: "transform, opacity, filter",
          fontFamily,
          textTransform: "uppercase",
          padding: "0 20px",
          boxSizing: "border-box",
          gap: 0,
        }}
      >
        {words.map((word, wi) => {
          const isCurrent = wi === activeWordIndex;
          const isPast = wi < activeWordIndex;
          const isFuture = wi > activeWordIndex;

          const fontSize = isCurrent
            ? adaptFontSize(word.text, ty.clusterActiveFontSize)
            : adaptFontSize(word.text, ty.clusterContextFontSize);

          const wordColor = isCurrent ? t.primaryTextColor : t.secondaryTextColor;
          const wordOpacity = isCurrent ? 1.0 : isPast ? 0.38 : 0.20;
          const wordBlur = isFuture ? 1.5 : 0;
          const wordShadow = isCurrent
            ? `0 0 30px ${t.accentNeonGlow}, 0 0 60px ${t.accentNeonGlow}, 0 3px 16px rgba(0,0,0,0.9)`
            : "none";
          const wordWeight = isCurrent ? ty.heroFontWeight : ty.contextFontWeight;

          const showSeparatorBefore = isCurrent && wi > 0;
          const showSeparatorAfter = isCurrent && wi < words.length - 1;

          return (
            <React.Fragment key={word.index}>
              {showSeparatorBefore && <div style={separatorStyle} />}
              <div
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: wordWeight,
                  lineHeight: 1.15,
                  letterSpacing: ty.heroLetterSpacing,
                  color: wordColor,
                  opacity: wordOpacity,
                  filter: wordBlur > 0 ? `blur(${wordBlur}px)` : undefined,
                  textShadow: wordShadow,
                  textAlign: "center",
                  width: "100%",
                  paddingTop: `${a.clusterGapPx * 0.4}px`,
                  paddingBottom: `${a.clusterGapPx * 0.4}px`,
                  boxSizing: "border-box",
                  willChange: "opacity",
                }}
              >
                {word.text}
              </div>
              {showSeparatorAfter && <div style={separatorStyle} />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderBurstEcho = () => {
    if (!echoCluster || !echoCluster.isBurst) return null;
    if (activeCluster) return null;

    const echoEndFrame = Math.round(echoCluster.end * fps);
    const framesSinceEnd = frame - echoEndFrame;
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
    const echoText = echoCluster.words.map((w) => w.text).join("  ");

    return (
      <div
        key={`burst-echo-${echoCluster.words[0].index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${driftY}px)`,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontSize: `${ty.clusterContextFontSize}px`,
          fontWeight: ty.contextFontWeight,
          letterSpacing: ty.heroLetterSpacing,
          color: t.secondaryTextColor,
          opacity,
          filter: `blur(${a.echoBlurPx}px)`,
          pointerEvents: "none",
          willChange: "transform, opacity, filter",
          textTransform: "uppercase",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        {echoText}
      </div>
    );
  };

  const renderBurstPreview = () => {
    if (!previewCluster || !previewCluster.isBurst) return null;
    if (activeCluster) return null;

    const timeUntilStart = previewCluster.start - currentTime;
    if (timeUntilStart <= 0 || timeUntilStart > a.previewWindowSeconds) return null;

    const pp = 1 - timeUntilStart / a.previewWindowSeconds;
    const opacity = interpolate(pp, [0, 0.5, 1], [0, a.previewOpacity * 0.5, a.previewOpacity], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const previewY = interpolate(pp, [0, 1], [l.lineVerticalOffset + 18, l.lineVerticalOffset], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const previewText = previewCluster.words.map((w) => w.text).join("  ");

    return (
      <div
        key={`burst-preview-${previewCluster.words[0].index}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${previewY}px)`,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontSize: `${ty.clusterContextFontSize - 4}px`,
          fontWeight: ty.contextFontWeight,
          letterSpacing: ty.heroLetterSpacing,
          color: t.tertiaryTextColor,
          opacity,
          filter: `blur(${a.previewBlurPx}px)`,
          pointerEvents: "none",
          willChange: "transform, opacity, filter",
          textTransform: "uppercase",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        {previewText}
      </div>
    );
  };

  const isInBurstCluster = activeCluster?.isBurst === true;
  const isInStandardCluster = activeCluster && !activeCluster.isBurst;
  const activeWord = isInStandardCluster ? activeCluster.words[0] : undefined;

  const echoWord = (!echoCluster?.isBurst && echoCluster) ? echoCluster.words[0] : undefined;
  const previewWord = (!previewCluster?.isBurst && previewCluster) ? previewCluster.words[0] : undefined;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: `${l.lyricStageCenterY}px`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${l.safeRight - l.safeLeft}px`,
          height: "460px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        {!isInBurstCluster && echoWord && renderStandardEcho(echoWord)}
        {!isInBurstCluster && activeWord && renderStandardHero(activeWord)}
        {!isInBurstCluster && previewWord && renderStandardPreview(previewWord)}

        {isInBurstCluster && renderBurstCluster()}
        {isInBurstCluster && renderBurstEcho()}
        {isInBurstCluster && renderBurstPreview()}

        {!activeCluster && echoCluster?.isBurst && renderBurstEcho()}
        {!activeCluster && !echoCluster?.isBurst && echoWord && renderStandardEcho(echoWord)}
        {!activeCluster && previewCluster?.isBurst && renderBurstPreview()}
        {!activeCluster && !previewCluster?.isBurst && previewWord && renderStandardPreview(previewWord)}
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
            backgroundColor: t.accentNeon,
            boxShadow: `0 0 12px ${t.accentNeon}`,
            transform: `rotate(${frame * 2}deg)`,
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
        <div
          style={{
            width: "100%",
            height: "3px",
            backgroundColor: t.progressBarTrack,
            borderRadius: "1px",
            position: "relative",
          }}
        >
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
              backgroundColor: t.accentNeon,
              boxShadow: `0 0 10px ${t.accentNeon}`,
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
            letterSpacing: "0.1em",
            color: t.tertiaryTextColor,
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalSeconds)}</span>
        </div>
      </div>
    </>
  );
};
