import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { LyricWord } from "../../shared/types";
import { ENERGETIC_CONFIG } from "./config";

interface EnergeticBackgroundProps { currentWord?: LyricWord; }

export const EnergeticBackground: React.FC<EnergeticBackgroundProps> = ({ currentWord }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = ENERGETIC_CONFIG.theme;

  const light1X = Math.sin(frame / 70) * 180 + Math.cos(frame / 130) * 80;
  const light1Y = Math.cos(frame / 80) * 140 + Math.sin(frame / 150) * 60;
  const light2X = Math.cos(frame / 65) * 200 - Math.sin(frame / 120) * 90;
  const light2Y = Math.sin(frame / 75) * 160 - Math.cos(frame / 140) * 70;
  const ambientBreathe = Math.sin(frame / 40) * 0.08 + 0.92;

  const startFrame = currentWord ? Math.round(currentWord.start * fps) : 0;
  const localFrame = currentWord ? Math.max(0, frame - startFrame) : 0;
  const hitPulse = spring({ frame: localFrame, fps, config: { damping: 10, stiffness: 320, mass: 0.4 } });
  const pulseIntensity = currentWord
    ? interpolate(hitPulse, [0, 0.15, 1], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const { lyricStageCenterY } = ENERGETIC_CONFIG.layout;

  return (
    <AbsoluteFill style={{ backgroundColor: t.backgroundColor, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: t.backgroundGradient }} />

      <div style={{ position: "absolute", top: "25%", left: "50%", width: 800, height: 600, borderRadius: "50%", background: `radial-gradient(ellipse, ${t.ambientLight1} 0%, transparent 70%)`, filter: "blur(90px)", opacity: 0.9 * ambientBreathe, transform: `translate(-50%, -50%) translate(${light1X}px, ${light1Y}px)`, willChange: "transform, opacity" }} />

      <div style={{ position: "absolute", top: "75%", left: "50%", width: 850, height: 550, borderRadius: "50%", background: `radial-gradient(ellipse, ${t.ambientLight2} 0%, transparent 65%)`, filter: "blur(100px)", opacity: 0.8 * ambientBreathe, transform: `translate(-50%, -50%) translate(${light2X}px, ${light2Y}px)`, willChange: "transform, opacity" }} />

      <div style={{ position: "absolute", top: `${lyricStageCenterY}px`, left: "50%", width: 900, height: 350, borderRadius: "50%", background: `radial-gradient(ellipse, ${t.accentGlow} 0%, transparent 70%)`, filter: "blur(55px)", opacity: pulseIntensity, transform: `translate(-50%, -50%) scaleX(${1 + pulseIntensity * 0.5})`, willChange: "transform, opacity" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(rgba(0, 240, 255, 0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.018) 1px, transparent 1px)`,
          backgroundSize: "55px 55px",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)",
          opacity: t.scanlineOpacity,
          pointerEvents: "none",
        }}
      />

      <Img
        src="data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: t.filmGrainOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,${t.vignetteStrength}) 100%)`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
