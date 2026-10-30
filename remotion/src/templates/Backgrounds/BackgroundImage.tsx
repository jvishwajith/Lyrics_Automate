import React, { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BACKGROUNDS_CONFIG } from "./config";

interface BackgroundImageProps {
  imageName?: string;
  introDurationSeconds?: number;
  textColor?: string;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  imageName,
  introDurationSeconds = 0,
  textColor = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eff = BACKGROUNDS_CONFIG.effects;
  const targetImage = imageName || BACKGROUNDS_CONFIG.defaultImage;

  const IMAGE_FADE_FRAMES = Math.min(fps * 1.2, introDurationSeconds * fps * 0.6);
  const imageOpacity = IMAGE_FADE_FRAMES > 0
    ? interpolate(frame, [0, IMAGE_FADE_FRAMES], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (t) => t * (2 - t),
      })
    : 1;

  const particles = useMemo(() => {
    return Array.from({ length: eff.particleCount }, (_, i) => {
      const s0 = (i * 9301 + 49297) % 233280;
      const s1 = (s0 * 9301 + 49297) % 233280;
      const s2 = (s1 * 9301 + 49297) % 233280;
      const s3 = (s2 * 9301 + 49297) % 233280;
      const s4 = (s3 * 9301 + 49297) % 233280;
      const s5 = (s4 * 9301 + 49297) % 233280;
      const r1 = s0 / 233280;
      const r2 = s1 / 233280;
      const r3 = s2 / 233280;
      const r4 = s3 / 233280;
      const r5 = s4 / 233280;
      const r6 = s5 / 233280;

      const angle = r4 * Math.PI * 2;
      return {
        id: i,
        x: r1 * 1080,
        y: r2 * 1920,
        size: 2 + r3 * 4,
        vx: Math.cos(angle) * (0.25 + r5 * 0.45),
        vy: Math.sin(angle) * (0.25 + r5 * 0.45),
        opacity: 0.12 + r6 * 0.22,
        blur: r3 > 0.65 ? 1.5 : 0.4,
        wobbleAmp: 12 + r2 * 28,
        wobbleFreq: 0.018 + r1 * 0.022,
        wobblePhase: r6 * Math.PI * 2,
      };
    });
  }, [eff.particleCount]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      <Img
        src={staticFile(`backgrounds/${targetImage}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: imageOpacity,
        }}
      />

      {particles.map((p) => {
        const rawX = (p.x + p.vx * frame) % 1080;
        const rawY = (p.y + p.vy * frame) % 1920;
        const px = rawX < 0 ? rawX + 1080 : rawX;
        const py = rawY < 0 ? rawY + 1920 : rawY;
        const wobble = Math.sin(frame * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
        const finalX = px + wobble * (p.vy / (Math.abs(p.vx) + Math.abs(p.vy) + 0.001));
        const finalY = py - wobble * (p.vx / (Math.abs(p.vx) + Math.abs(p.vy) + 0.001));

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${finalX}px`,
              top: `${finalY}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              backgroundColor: textColor,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
              pointerEvents: "none",
              boxShadow: `0 0 ${p.size * 3}px ${p.size * 0.6}px ${textColor}, 0 0 ${p.size * 6}px ${textColor}`,
            }}
          />
        );
      })}

      <Img
        src="data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: eff.filmGrainOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0, 0, 0, ${eff.vignetteStrength}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
