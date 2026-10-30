import { loadFont } from "@remotion/google-fonts/Outfit";

export const { fontFamily: outfitFontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const BACKGROUNDS_CONFIG = {
  video: {
    width: 1080,
    height: 1920,
    fps: 30,
  },
  defaultImage: "1.png",
  layout: {
    playerWidth: 780,
    playerHeight: 360,
    playerTopY: 310,
    playerRadius: 46,
  },
  typography: {
    fontFamily: outfitFontFamily,
    filename: {
      fontSize: "22px",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    lyric: {
      fontSize: "66px",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      lineHeight: 1.15,
    },
    timestamp: {
      fontSize: "20px",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  effects: {
    particleCount: 50,
    particleColor: "rgba(255, 255, 255, 0.8)",
    filmGrainOpacity: 0.045,
    vignetteStrength: 0.5,
  },
};
