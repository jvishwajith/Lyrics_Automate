import React, { useMemo } from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { LyricWord } from "../../shared/types";
import { FEELGOOD_CONFIG } from "./config";

interface FeelGoodBackgroundProps { currentWord?: LyricWord; }

export const FeelGoodBackground: React.FC<FeelGoodBackgroundProps> = ({ currentWord }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = FEELGOOD_CONFIG.theme;

  const particles = useMemo(() => {
    return Array.from({ length: t.particleCount }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const r1 = seed / 233280;
      const r2 = ((seed * 9301 + 49297) % 233280) / 233280;
      const r3 = ((seed * 9301 + 12345) % 233280) / 233280;
      return {
        id: i,
        x: r1 * 1080,
        y: r2 * 1920,
        size: 2.5 + r3 * 5.5,
        speed: 0.1 + r1 * 0.2,
        opacity: 0.12 + r2 * 0.22,
        blur: r3 > 0.65 ? 3 : 1,
        driftRadius: 18 + r2 * 38,
        driftPhase: r1 * Math.PI * 2,
      };
    });
  }, [t.particleCount]);

  const light1X = Math.sin(frame / 160) * 110 + Math.cos(frame / 230) * 55;
  const light1Y = Math.cos(frame / 190) * 140 + Math.sin(frame / 270) * 65;
  const light2X = Math.cos(frame / 150) * 130 - Math.sin(frame / 210) * 60;
  const light2Y = Math.sin(frame / 170) * 120 - Math.cos(frame / 250) * 75;
  const ambientBreathe = Math.sin(frame / 80) * 0.05 + 0.95;

  const startFrame = currentWord ? Math.round(currentWord.start * fps) : 0;
  const localFrame = currentWord ? Math.max(0, frame - startFrame) : 0;
  const vocalPulseProgress = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 70, mass: 0.9 } });
  const vocalPulse = currentWord
    ? interpolate(vocalPulseProgress, [0, 0.4, 1], [0, 0.38, 0.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const { lyricStageCenterY } = FEELGOOD_CONFIG.layout;

  return (
    <AbsoluteFill style={{ backgroundColor: t.backgroundColor, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: t.backgroundGradient }} />

      <div style={{ position: "absolute", top: "32%", left: "50%", width: 850, height: 850, borderRadius: "50%", background: `radial-gradient(circle, ${t.ambientLight1} 0%, transparent 70%)`, filter: "blur(110px)", opacity: 0.9 * ambientBreathe, transform: `translate(-50%, -50%) translate(${light1X}px, ${light1Y}px)`, willChange: "transform, opacity" }} />
      <div style={{ position: "absolute", top: "68%", left: "50%", width: 750, height: 750, borderRadius: "50%", background: `radial-gradient(circle, ${t.ambientLight2} 0%, transparent 65%)`, filter: "blur(120px)", opacity: 0.7 * ambientBreathe, transform: `translate(-50%, -50%) translate(${light2X}px, ${light2Y}px)`, willChange: "transform, opacity" }} />

      <div style={{ position: "absolute", top: `${lyricStageCenterY}px`, left: "50%", width: 700, height: 420, borderRadius: "50%", background: `radial-gradient(ellipse, ${t.accentGlow} 0%, transparent 70%)`, filter: "blur(80px)", opacity: vocalPulse, transform: `translate(-50%, -50%) scale(${1 + vocalPulse * 0.3})`, willChange: "transform, opacity" }} />

      {particles.map((p) => {
        const cy = (p.y - frame * p.speed) % 1920;
        const ny = cy < 0 ? cy + 1920 : cy;
        const dx = Math.sin(frame / 60 + p.driftPhase) * p.driftRadius;
        return (
          <div
            key={p.id}
            style={{ position: "absolute", left: `${p.x + dx}px`, top: `${ny}px`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", backgroundColor: t.particleColor, opacity: p.opacity, filter: `blur(${p.blur}px)`, pointerEvents: "none", boxShadow: `0 0 ${p.size * 2}px ${t.particleGlow}` }}
          />
        );
      })}

      <Img
        src="data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: t.filmGrainOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,${t.vignetteStrength}) 100%)`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
