"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { resolveEffect, resolvePreset } from "./backdropPresets";

type BackdropToken = {
  preset: string;
  skyGradient: string[];
  silhouetteColor?: string;
  overlayEffect?: string;
  overlayColor?: string;
};

type Props = {
  token: BackdropToken;
  children: ReactNode;
  /** Fill the Bookle modal shell (not the full browser viewport). */
  fullPage?: boolean;
};

export default function Backdrop({ token, children, fullPage = false }: Props) {
  const preset = useMemo(() => resolvePreset(token.preset), [token.preset]);
  const effect = useMemo(
    () => resolveEffect(token.overlayEffect),
    [token.overlayEffect],
  );

  const skyStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: `linear-gradient(to bottom, ${token.skyGradient.join(", ")})`,
    ...(fullPage
      ? { flex: 1, minHeight: 0, height: "100%" }
      : { width: "100%", height: "100%" }),
  };

  const silhouetteColor = token.silhouetteColor || "#5b4e8c";
  const overlayColor = token.overlayColor || "#b08fce";

  return (
    <div style={skyStyle}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 100% 70% at 50% -10%, rgba(251, 246, 238, 0.55), transparent 55%)",
          mixBlendMode: "soft-light",
        }}
      />

      {preset.overlayStyle ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            ...preset.overlayStyle,
          }}
        />
      ) : null}

      {effect ? (
        <div
          className={effect.className}
          style={
            {
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              "--overlay-color": overlayColor,
            } as CSSProperties
          }
        />
      ) : null}

      {preset.silhouetteType === "clipPath" ? (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: preset.silhouetteHeight || "40%",
            backgroundColor: silhouetteColor,
            clipPath: preset.clipPath,
            pointerEvents: "none",
            opacity: 0.88,
          }}
        />
      ) : null}
      {preset.silhouetteType === "radial" && preset.silhouetteStyle ? (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: preset.silhouetteStyle.height,
            background: preset.silhouetteStyle.background,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {children}
    </div>
  );
}
