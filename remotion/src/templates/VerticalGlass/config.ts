import { loadFont } from "@remotion/google-fonts/Outfit";

export const { fontFamily: outfitFontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const VERTICAL_GLASS_CONFIG = {
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },
  defaultImage: "1.png",
  layout: {
    playerWidth: 460,
    playerTopY: 140,
    playerRadius: 36,
  },
  typography: {
    fontFamily: outfitFontFamily,
    filename: {
      fontSize: "18px",
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
    lyric: {
      fontSize: "62px",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      lineHeight: 1.15,
    },
    timestamp: {
      fontSize: "16px",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  effects: {
    particleCount: 50,
    filmGrainOpacity: 0.045,
    vignetteStrength: 0.5,
  },
};
