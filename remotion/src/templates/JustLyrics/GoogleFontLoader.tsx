import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { getAvailableFonts } from "@remotion/google-fonts";

interface GoogleFontLoaderProps {
  fontFamily: string;
}

const loadedFontFamilies = new Set<string>();

export const GoogleFontLoader: React.FC<GoogleFontLoaderProps> = ({ fontFamily }) => {
  const cleanFamily = (fontFamily || "Outfit").trim();
  const [handle] = useState(() =>
    delayRender(`Loading Google Font: ${cleanFamily}`, {
      timeoutInMilliseconds: 25000,
    })
  );

  useEffect(() => {
    if (!cleanFamily || loadedFontFamilies.has(cleanFamily.toLowerCase())) {
      continueRender(handle);
      return;
    }

    let isDone = false;
    const finish = () => {
      if (!isDone) {
        isDone = true;
        loadedFontFamilies.add(cleanFamily.toLowerCase());
        continueRender(handle);
      }
    };

    const timer = setTimeout(finish, 15000);

    const loadAsync = async () => {
      try {
        const available = getAvailableFonts();
        const norm = cleanFamily.toLowerCase().replace(/[\s_-]+/g, "");
        const matched = available.find(
          (f) =>
            f.fontFamily.toLowerCase() === cleanFamily.toLowerCase() ||
            f.fontFamily.toLowerCase().replace(/[\s_-]+/g, "") === norm ||
            f.importName.toLowerCase() === norm
        );

        if (matched) {
          const mod = await matched.load();
          if (mod && typeof mod.loadFont === "function") {
            const fontResult = mod.loadFont();
            if (fontResult && typeof fontResult.waitUntilDone === "function") {
              await fontResult.waitUntilDone();
            }
            clearTimeout(timer);
            finish();
            return;
          }
        }

        const fontQuery = encodeURIComponent(cleanFamily).replace(/%20/g, "+");
        const linkId = `google-font-${fontQuery.toLowerCase()}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement("link");
          link.id = linkId;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
          link.onload = () => {
            if ("fonts" in document) {
              document.fonts
                .load(`1em "${cleanFamily}"`)
                .then(() => {
                  clearTimeout(timer);
                  finish();
                })
                .catch(() => {
                  clearTimeout(timer);
                  finish();
                });
            } else {
              clearTimeout(timer);
              finish();
            }
          };
          link.onerror = () => {
            clearTimeout(timer);
            finish();
          };
          document.head.appendChild(link);
        } else {
          clearTimeout(timer);
          finish();
        }
      } catch (err) {
        console.warn("Failed to load font:", cleanFamily, err);
        clearTimeout(timer);
        finish();
      }
    };

    loadAsync();

    return () => {
      clearTimeout(timer);
    };
  }, [cleanFamily, handle]);

  return null;
};
