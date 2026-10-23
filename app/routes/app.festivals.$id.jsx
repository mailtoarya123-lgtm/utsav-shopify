import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useCallback, useMemo } from "react";
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  InlineGrid,
  Box,
  Button,
  Badge,
  Divider,
  Select,
  TextField,
  Banner,
  Frame,
  Icon,
} from "@shopify/polaris";
import {
  ViewIcon,
  ExternalIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  getFestivalById,
  getFestivalGreetings,
  getDaysUntilFestival,
} from "../data/festivals";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const festivalId = params.id;

  const festival = getFestivalById(festivalId);
  if (!festival) {
    throw new Response("Festival not found", { status: 404 });
  }

  const [config, subscription] = await Promise.all([
    prisma.festivalConfig.findUnique({
      where: { shop_festivalId: { shop, festivalId } },
    }),
    prisma.subscriptionPlan.findUnique({
      where: { shop },
    }),
  ]);

  const plan = subscription?.plan || "free";

  const defaultGreeting = festival.banner?.defaultText || `Happy ${festival.name}!`;

  return json({
    festival,
    shop,
    config: config || {
      shop,
      festivalId,
      isActive: false,
      enableBanner: true,
      enableEffects: true,
      enableCountdown: true,
      enableColorSwap: true,
      enableAudio: true,
      enableWheel: true,
      language: "en",
      diyaSize: "medium",
      diyaPosition: "bottom_corners",
      fireworksFrequency: "subtle",
      kiteCount: 2,
      kiteSpeed: "gentle",
      moonPosition: "top_right",
      bannerText: defaultGreeting,
      customColors: null,
      scheduledStart: null,
      scheduledEnd: null,
    },
    plan,
  });
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const festivalId = params.id;
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "save" || actionType === "activate" || actionType === "deactivate") {
    const isActive = actionType === "activate" ? true : actionType === "deactivate" ? false : formData.get("isActive") === "true";
    const enableBanner = formData.get("enableBanner") === "true";
    const enableEffects = formData.get("enableEffects") === "true";
    const enableCountdown = formData.get("enableCountdown") === "true";
    const enableColorSwap = formData.get("enableColorSwap") === "true";
    const enableAudio = formData.get("enableAudio") === "true";
    const enableWheel = formData.get("enableWheel") === "true";
    const language = formData.get("language") || "en";
    const diyaSize = formData.get("diyaSize") || "medium";
    const diyaPosition = formData.get("diyaPosition") || "bottom_corners";
    const fireworksFrequency = formData.get("fireworksFrequency") || "subtle";
    const kiteCount = parseInt(formData.get("kiteCount") || "2", 10);
    const kiteSpeed = formData.get("kiteSpeed") || "gentle";
    const moonPosition = formData.get("moonPosition") || "top_right";
    const bannerText = formData.get("bannerText") || "";
    const customColors = formData.get("customColors") || null;
    const scheduledStartStr = formData.get("scheduledStart") || null;
    const scheduledEndStr = formData.get("scheduledEnd") || null;

    if (isActive) {
      await prisma.festivalConfig.updateMany({
        where: { shop, festivalId: { not: festivalId } },
        data: { isActive: false },
      });
    }

    await prisma.festivalConfig.upsert({
      where: { shop_festivalId: { shop, festivalId } },
      create: {
        shop,
        festivalId,
        isActive,
        enableBanner,
        enableEffects,
        enableCountdown,
        enableColorSwap,
        enableAudio,
        enableWheel,
        language,
        diyaSize,
        diyaPosition,
        fireworksFrequency,
        kiteCount,
        kiteSpeed,
        moonPosition,
        bannerText,
        customColors,
        scheduledStart: scheduledStartStr ? new Date(scheduledStartStr) : null,
        scheduledEnd: scheduledEndStr ? new Date(scheduledEndStr) : null,
      },
      update: {
        isActive,
        enableBanner,
        enableEffects,
        enableCountdown,
        enableColorSwap,
        enableAudio,
        enableWheel,
        language,
        diyaSize,
        diyaPosition,
        fireworksFrequency,
        kiteCount,
        kiteSpeed,
        moonPosition,
        bannerText,
        customColors,
        scheduledStart: scheduledStartStr ? new Date(scheduledStartStr) : null,
        scheduledEnd: scheduledEndStr ? new Date(scheduledEndStr) : null,
      },
    });
  }

  return json({ success: true });
};

// ─── Toran Preview Component ────────────────────────────────────────────────
function ToranPreviewWidget({ festivalId, garlandStyle, withLights, lightsTheme, lightsMode }) {
  const isDiwali = (festivalId || "").includes("diwali");
  const showLights = isDiwali && withLights && lightsTheme !== "off";

  const bulbColors = lightsTheme === "festive_multicolor"
    ? ["#FF9100", "#FF1744", "#00E676", "#FFD700", "#00E5FF", "#FF4081"]
    : lightsTheme === "amber_radiance"
    ? ["#FF8F00", "#FF6D00", "#FFA000", "#FF8F00", "#FF6D00", "#FFA000"]
    : lightsTheme === "pearl_white"
    ? ["#FFFFFF", "#FFFDE7", "#FFFFFF", "#FFFDE7", "#FFFFFF", "#FFFDE7"]
    : ["#FFD700", "#FFE082", "#FFD700", "#FFCA28", "#FFD700", "#FFE082"];

  const glowColor = lightsTheme === "festive_multicolor"
    ? "rgba(255, 145, 0, 0.95)"
    : lightsTheme === "amber_radiance"
    ? "rgba(255, 120, 0, 0.95)"
    : lightsTheme === "pearl_white"
    ? "rgba(255, 255, 255, 0.95)"
    : "rgba(255, 215, 0, 0.95)";

  return (
    <svg width="100%" height="58" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="widgetKalawa" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D32F2F" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#D32F2F" />
        </linearGradient>
        <style>{`
          @keyframes utsavChaserWave {
            0%, 100% { opacity: 0.35; transform: scale(0.85); }
            50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 6px ${glowColor}); }
          }
          @keyframes utsavTwinkleWave {
            0%, 100% { opacity: 0.4; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 5px ${glowColor}); }
          }
          @keyframes utsavSteadyBreath {
            0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 3px ${glowColor}); }
            50% { opacity: 1; filter: drop-shadow(0 0 6px ${glowColor}); }
          }
          .utsav-chase-1 { animation: utsavChaserWave 1.8s ease-in-out infinite; animation-delay: 0s; transform-origin: center; }
          .utsav-chase-2 { animation: utsavChaserWave 1.8s ease-in-out infinite; animation-delay: 0.3s; transform-origin: center; }
          .utsav-chase-3 { animation: utsavChaserWave 1.8s ease-in-out infinite; animation-delay: 0.6s; transform-origin: center; }
          .utsav-chase-4 { animation: utsavChaserWave 1.8s ease-in-out infinite; animation-delay: 0.9s; transform-origin: center; }
          .utsav-chase-5 { animation: utsavChaserWave 1.8s ease-in-out infinite; animation-delay: 1.2s; transform-origin: center; }
          .utsav-chase-6 { animation: utsavChaserWave 1.8s ease-in-out infinite; animation-delay: 1.5s; transform-origin: center; }
          .utsav-twinkle-1 { animation: utsavTwinkleWave 1.6s ease-in-out infinite; animation-delay: 0s; transform-origin: center; }
          .utsav-twinkle-2 { animation: utsavTwinkleWave 1.6s ease-in-out infinite; animation-delay: 0.8s; transform-origin: center; }
          .utsav-twinkle-3 { animation: utsavTwinkleWave 1.6s ease-in-out infinite; animation-delay: 0.4s; transform-origin: center; }
          .utsav-steady { animation: utsavSteadyBreath 3s ease-in-out infinite; transform-origin: center; }
        `}</style>
      </defs>
      <rect x="0" y="0" width="100%" height="3.5" fill="url(#widgetKalawa)" />

      {/* Repeating scallops */}
      {[0, 140, 280, 420, 560, 700].map((startX, idx) => (
        <g key={idx} transform={`translate(${startX}, 0)`}>
          {/* Mango Leaves */}
          <path d="M 10 3 C 4 14 3 24 10 36 C 17 24 16 14 10 3 Z" fill="#2E7D32" />
          <path d="M 35 3 C 29 14 28 24 35 36 C 42 24 41 14 35 3 Z" fill="#2E7D32" />
          <path d="M 60 3 C 54 14 53 24 60 36 C 67 24 66 14 60 3 Z" fill="#2E7D32" />
          <path d="M 85 3 C 79 14 78 24 85 36 C 92 24 91 14 85 3 Z" fill="#2E7D32" />
          <path d="M 110 3 C 104 14 103 24 110 36 C 117 24 116 14 110 3 Z" fill="#2E7D32" />
          <path d="M 130 3 C 124 14 123 24 130 36 C 137 24 136 14 130 3 Z" fill="#2E7D32" />

          {/* Marigold Arc */}
          <path d="M 0 5 Q 70 38 140 5" stroke="#C62828" strokeWidth="1.6" fill="none" opacity="0.6" />
          <circle cx="0" cy="5" r="7" fill="#E65100" />
          <circle cx="20" cy="14" r="6" fill="#FF8F00" />
          <circle cx="42" cy="23" r="6.5" fill="#E65100" />
          <circle cx="70" cy="27" r="7.5" fill="#FF8F00" />
          <circle cx="98" cy="23" r="6.5" fill="#E65100" />
          <circle cx="120" cy="14" r="6" fill="#FF8F00" />
          <circle cx="140" cy="5" r="7" fill="#E65100" />

          {/* Brass Bell */}
          <path d="M 66 28 L 74 28 L 72 37 L 68 37 Z" fill="#D4AF37" />
          <circle cx="70" cy="38" r="1.5" fill="#FFC107" />

          {/* Realistic Series Lights Wiring (Diwali Only) */}
          {showLights && (
            <g>
              {/* Twin Dark-Green Electric Catenary Wire Swag */}
              <path d="M 0 9 Q 70 42 140 9" stroke="#0D2B17" strokeWidth="1.8" fill="none" opacity="0.95" />
              <path d="M 0 11 Q 70 44 140 11" stroke="#1B4D2E" strokeWidth="1.2" fill="none" opacity="0.75" />

              {/* Physically Wired Bulbs with Socket Collars, Teardrop Capsules, and Glowing Filaments */}
              {[
                { cx: 12, cy: 13, c: bulbColors[0], ch: "utsav-chase-1", tw: "utsav-twinkle-1" },
                { cx: 34, cy: 24, c: bulbColors[1 % bulbColors.length], ch: "utsav-chase-2", tw: "utsav-twinkle-2" },
                { cx: 62, cy: 32, c: bulbColors[2 % bulbColors.length], ch: "utsav-chase-3", tw: "utsav-twinkle-3" },
                { cx: 78, cy: 32, c: bulbColors[3 % bulbColors.length], ch: "utsav-chase-4", tw: "utsav-twinkle-1" },
                { cx: 106, cy: 24, c: bulbColors[4 % bulbColors.length], ch: "utsav-chase-5", tw: "utsav-twinkle-2" },
                { cx: 128, cy: 13, c: bulbColors[5 % bulbColors.length], ch: "utsav-chase-6", tw: "utsav-twinkle-3" },
              ].map((b, bIdx) => {
                const animClass = lightsMode === "chaser" ? b.ch : lightsMode === "steady" ? "utsav-steady" : b.tw;
                return (
                  <g key={bIdx}>
                    {/* Dark forest green socket fixture clipping to wire */}
                    <rect x={b.cx - 1.5} y={b.cy} width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" strokeWidth="0.5" />
                    {/* Animated Teardrop Capsule Bulb Assembly */}
                    <g className={animClass} style={{ transformOrigin: `${b.cx}px ${b.cy + 6}px` }}>
                      <circle cx={b.cx} cy={b.cy + 5.5} r="7.5" fill={b.c} opacity="0.32" />
                      <path
                        d={`M ${b.cx} ${b.cy + 2.5} C ${b.cx + 2.8} ${b.cy + 4} ${b.cx + 2.5} ${b.cy + 8} ${b.cx} ${b.cy + 9.5} C ${b.cx - 2.5} ${b.cy + 8} ${b.cx - 2.8} ${b.cy + 4} ${b.cx} ${b.cy + 2.5} Z`}
                        fill={b.c}
                      />
                      <ellipse cx={b.cx} cy={b.cy + 5.5} rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95" />
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── Side Garland Preview Widget ────────────────────────────────────────────
function SideGarlandPreviewWidget({ withLights, lightsTheme }) {
  const showLights = withLights && lightsTheme !== "off";
  return (
    <svg width="34" height="260" viewBox="0 0 34 260" xmlns="http://www.w3.org/2000/svg">
      <line x1="17" y1="0" x2="17" y2="245" stroke="#D32F2F" strokeWidth="2" />
      <circle cx="17" cy="14" r="7" fill="#FF8F00" />
      <circle cx="17" cy="36" r="7" fill="#E65100" />
      <circle cx="17" cy="58" r="7" fill="#FF8F00" />
      <circle cx="17" cy="80" r="7" fill="#E65100" />
      <circle cx="17" cy="102" r="7" fill="#FF8F00" />
      <circle cx="17" cy="124" r="7" fill="#E65100" />
      <circle cx="17" cy="146" r="7" fill="#FF8F00" />
      <circle cx="17" cy="168" r="7" fill="#E65100" />
      <circle cx="17" cy="190" r="7" fill="#FF8F00" />
      <circle cx="17" cy="212" r="7" fill="#E65100" />
      <path d="M 12 230 L 22 230 L 20 242 L 14 242 Z" fill="#D4AF37" />
      <circle cx="17" cy="244" r="2" fill="#FFC107" />

      {showLights && (
        <>
          <circle cx="11" cy="25" r="2.8" fill="#FFD700" />
          <circle cx="23" cy="47" r="2.8" fill="#FFD700" />
          <circle cx="11" cy="69" r="2.8" fill="#FFD700" />
          <circle cx="23" cy="91" r="2.8" fill="#FFD700" />
          <circle cx="11" cy="113" r="2.8" fill="#FFD700" />
          <circle cx="23" cy="135" r="2.8" fill="#FFD700" />
          <circle cx="11" cy="157" r="2.8" fill="#FFD700" />
          <circle cx="23" cy="179" r="2.8" fill="#FFD700" />
        </>
      )}
    </svg>
  );
}

// ─── Realistic Diya Preview Widget ──────────────────────────────────────────
function DiyaPreviewWidget({ style, flameGlow, size }) {
  const sizePx = size === "small" ? 56 : size === "large" ? 95 : size === "xlarge" ? 116 : 74;
  const isUrli = style === "marigold_urli" || style === "festive_ornamental";
  const isCopper = style === "antique_copper";
  const isMinimal = style === "minimal_contemporary";
  const isTerracotta = style === "terracotta_clay";

  const glowRadius = flameGlow === "divine_aura" ? 38 : flameGlow === "sparkling_wick" ? 28 : 22;

  return (
    <svg width={sizePx} height={Math.round(sizePx * 0.82)} viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="diyaAuraPreview" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF6B35" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flameGradPreview" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF3D00" />
          <stop offset="35%" stopColor="#FF9100" />
          <stop offset="75%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Atmospheric Halo */}
      <circle cx="60" cy="36" r={glowRadius} fill="url(#diyaAuraPreview)" />

      {/* Living Flame */}
      <path d="M 60 8 C 52 24 47 36 47 45 C 47 54 53 58 60 58 C 67 58 73 54 73 45 C 73 36 68 24 60 8 Z" fill="url(#flameGradPreview)" />
      <path d="M 60 18 C 55 28 52 37 52 44 C 52 50 55 54 60 54 C 65 54 68 50 68 44 C 68 37 65 28 60 18 Z" fill="#FFFDE7" opacity="0.95" />
      <line x1="60" y1="45" x2="60" y2="58" stroke="#3E2723" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="60" cy="45" r="1.5" fill="#FF5252" />

      {/* Vessel Body */}
      {isTerracotta ? (
        <g>
          <ellipse cx="60" cy="58" rx="42" ry="11" fill="#E07A5F" />
          <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="#C85A27" />
          <path d="M 28 58 Q 60 63 92 58" stroke="#8D3B16" strokeWidth="1.6" fill="none" />
          <ellipse cx="60" cy="86" rx="22" ry="4" fill="#541F09" />
        </g>
      ) : isCopper ? (
        <g>
          <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FF8A65" />
          <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="#D84315" />
          <path d="M 22 60 Q 32 66 42 60 Q 52 66 62 60 Q 72 66 82 60 Q 92 66 98 60" stroke="#BF360C" strokeWidth="1.3" fill="none" opacity="0.85" />
          <ellipse cx="60" cy="86" rx="22" ry="4" fill="#3E2723" />
        </g>
      ) : isMinimal ? (
        <g>
          <ellipse cx="60" cy="58" rx="40" ry="8" fill="#424242" />
          <path d="M 20 58 Q 22 83 60 85 Q 98 83 100 58 Z" fill="#1A1A1A" />
          <path d="M 20 58 Q 60 62 100 58" stroke="#D4AF37" strokeWidth="1.2" fill="none" />
          <ellipse cx="60" cy="85" rx="16" ry="3" fill="#0A0A0A" />
        </g>
      ) : isUrli ? (
        <g>
          <ellipse cx="60" cy="62" rx="48" ry="14" fill="#E5C158" />
          <ellipse cx="60" cy="62" rx="44" ry="12" fill="#2E1B0E" />
          <circle cx="26" cy="62" r="7" fill="#FF9800" />
          <circle cx="36" cy="69" r="6" fill="#FFC107" />
          <circle cx="84" cy="69" r="6" fill="#FFC107" />
          <circle cx="94" cy="62" r="7" fill="#FF9800" />
          <circle cx="60" cy="71" r="6.5" fill="#FF5722" />
          <path d="M 40 60 Q 42 78 60 80 Q 78 78 80 60 Z" fill="#D4AF37" />
          <ellipse cx="60" cy="81" rx="18" ry="3.5" fill="#5D4037" />
        </g>
      ) : (
        /* Royal Brass (Default) */
        <g>
          <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FFE082" />
          <path d="M 18 58 Q 20 83 60 85 Q 100 83 102 58 Z" fill="#D4AF37" />
          <path d="M 24 61 Q 33 67 42 61 Q 51 67 60 61 Q 69 67 78 61 Q 87 67 96 61" stroke="#FFE082" strokeWidth="1.2" fill="none" opacity="0.75" />
          <ellipse cx="60" cy="85" rx="22" ry="4" fill="#5D4037" />
        </g>
      )}
    </svg>
  );
}

// ─── Professional UI Control: Luxury Toggle Switch ─────────────────────────
function ToggleSwitch({ label, checked, onChange, helpText, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "4px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          gap: "12px",
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 500, color: disabled ? "#8C9196" : "#202223" }}>
          {label}
        </span>
        <div
          role="switch"
          aria-checked={checked}
          style={{
            width: "38px",
            height: "22px",
            borderRadius: "11px",
            background: checked ? "#008060" : "#D2D5D8",
            position: "relative",
            transition: "background 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
            boxShadow: checked ? "0 1px 3px rgba(0, 128, 96, 0.3)" : "none",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#FFFFFF",
              position: "absolute",
              top: "3px",
              left: checked ? "19px" : "3px",
              transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      </div>
      {helpText && (
        <span style={{ fontSize: "12px", color: "#6D7175", lineHeight: "16px" }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

// ─── Professional UI Control: Range Slider with Live Badge ──────────────────
function LuxurySlider({ label, value, min, max, step = 1, unit = "px", onChange, helpText }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "#202223" }}>{label}</span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#008060",
            background: "#E3F1DF",
            padding: "2px 8px",
            borderRadius: "6px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value > 0 && unit === "px" ? `+${value}${unit}` : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#008060",
          cursor: "pointer",
          height: "6px",
          borderRadius: "3px",
          background: "#E1E3E5",
          outline: "none",
        }}
      />
      {helpText && (
        <span style={{ fontSize: "12px", color: "#6D7175", lineHeight: "15px" }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

// ─── Clean Minimalist SVG Icons (Zero Toy Emojis) ───────────────────────────
const CLEAN_ICONS = {
  overview: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
    </svg>
  ),
  visual_effects: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
    </svg>
  ),
  banner: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.39l6.553 3.276A1 1 0 0018 15V3z" />
    </svg>
  ),
  colors: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
    </svg>
  ),
  sound_interaction: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  ),
  scheduling: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  advanced: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
};

// ─── Single Device Preview Frame in Side-by-Side Showcase ───────────────────
function DeviceStorefrontMock({
  deviceType,
  festival,
  showOriginal,
  enableEffects,
  garlandPlacement,
  garlandLayout,
  garlandStyle,
  enableSeriesLights,
  seriesLightsTheme,
  seriesLightsMode,
  garlandOffset,
  diyaStyle,
  flameGlow,
  diyaSize,
  diyaPosition,
  diyaMarginX,
  diyaMarginY,
  diyaHideOnMobile,
  enableBanner,
  bannerText,
}) {
  const isDiwali = (festival.id || "").includes("diwali");
  const isDesktop = deviceType === "desktop";
  const isTablet = deviceType === "tablet";
  const isMobile = deviceType === "mobile";

  const flexRatio = isDesktop ? "1.45" : isTablet ? "1.05" : "0.78";
  const titleLabel = isDesktop ? "Desktop" : isTablet ? "Tablet" : "Mobile";
  const resLabel = isDesktop ? "1440 × 900" : isTablet ? "768 × 1024" : "375 × 812";

  return (
    <div style={{ flex: `${flexRatio} 1 0px`, minWidth: 0, display: "flex", flexDirection: "column" }}>
      {/* Device Viewport Header Pill */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px 8px 4px",
          color: "#5C5F62",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
        }}
      >
        <span>{titleLabel}</span>
        <span style={{ fontSize: "10px", color: "#8C9196", fontWeight: 500 }}>{resLabel}</span>
      </div>

      {/* Frame Container */}
      <div
        style={{
          width: "100%",
          background: "#FFFFFF",
          borderRadius: isMobile ? "28px" : isTablet ? "16px" : "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          position: "relative",
          overflow: "hidden",
          border: isMobile ? "7px solid #1A1C1E" : isTablet ? "7px solid #2B2D42" : "1px solid #DCE0E5",
        }}
      >
        {/* Safari Browser Chrome (Desktop) */}
        {isDesktop && (
          <div
            style={{
              background: "#F1F2F4",
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid #DCE0E5",
            }}
          >
            <div style={{ display: "flex", gap: "5px" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#FF5F56", display: "inline-block" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
            </div>
            <div
              style={{
                flex: 1,
                background: "#FFFFFF",
                borderRadius: "5px",
                padding: "2px 10px",
                fontSize: "10px",
                color: "#555",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: "1px solid #E1E3E6",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6D7175" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span style={{ fontWeight: 500 }}>luxestore.myshopify.com</span>
            </div>
          </div>
        )}

        {/* Tablet Sensor Bezel */}
        {isTablet && (
          <div style={{ background: "#2B2D42", height: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4A4D68", display: "inline-block" }} />
          </div>
        )}

        {/* Mobile Dynamic Island & Status Bar */}
        {isMobile && (
          <div style={{ background: "#000000", color: "#FFFFFF", padding: "4px 14px 4px" }}>
            <div
              style={{
                width: "64px",
                height: "14px",
                background: "#1E1E1E",
                borderRadius: "8px",
                margin: "0 auto 3px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", fontWeight: 600 }}>
              <span>9:41</span>
              <span style={{ fontSize: "9px", opacity: 0.8 }}>LTE 100%</span>
            </div>
          </div>
        )}

        {/* Announcement Bar */}
        {!showOriginal && enableBanner && (
          <div
            style={{
              background: "linear-gradient(90deg, #1A0A00 0%, #2A1502 50%, #1A0A00 100%)",
              color: "#FFF8DC",
              padding: isMobile ? "5px 10px" : "7px 14px",
              fontSize: isMobile ? "10px" : "11px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {bannerText || "Happy Diwali! Celebrate with artisanal pooja decor."}
            </span>
            <span
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid #D4AF37",
                color: "#FFD700",
                borderRadius: "8px",
                padding: "1px 6px",
                fontSize: "9px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              UTSAV25
            </span>
          </div>
        )}

        {/* Top Toran (if top_fixed) */}
        {!showOriginal && enableEffects && garlandPlacement === "top_fixed" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
          <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: isMobile ? "46px" : "54px" }}>
            <ToranPreviewWidget
              festivalId={festival.id}
              garlandStyle={garlandStyle}
              withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"}
              lightsTheme={seriesLightsTheme}
              lightsMode={seriesLightsMode}
            />
          </div>
        )}

        {/* Store Navigation Bar */}
        <div
          style={{
            padding: isMobile ? "10px 12px" : "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #EEEEEE",
            position: "relative",
            zIndex: 10,
            background: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isMobile && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
            <div style={{ fontWeight: 800, fontSize: isMobile ? "13px" : "15px", color: "#111", letterSpacing: "0.5px" }}>
              LUXE STORE
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {isDesktop && (
            <div style={{ display: "flex", gap: "14px", fontSize: "11px", color: "#555", fontWeight: 500 }}>
              <span style={{ color: "#000", fontWeight: 700, borderBottom: "2px solid #D4AF37", paddingBottom: "2px" }}>Home</span>
              <span style={{ cursor: "pointer" }}>Festive Edit</span>
              <span style={{ cursor: "pointer" }}>Diwali Specials</span>
              <span style={{ cursor: "pointer" }}>Pooja Sets</span>
              <span style={{ cursor: "pointer" }}>Contact</span>
            </div>
          )}

          {/* Tablet Compact Nav */}
          {isTablet && (
            <div style={{ display: "flex", gap: "10px", fontSize: "10px", color: "#555", fontWeight: 500 }}>
              <span style={{ color: "#000", fontWeight: 700 }}>Home</span>
              <span>Festive</span>
              <span>Diwali</span>
              <span>Contact</span>
            </div>
          )}

          {/* Search + Cart */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#333" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <div style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>(2)</span>
            </div>
          </div>
        </div>

        {/* Top Toran (if below_header) */}
        {!showOriginal && enableEffects && garlandPlacement === "below_header" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
          <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: isMobile ? "46px" : "54px", marginTop: `${garlandOffset}px` }}>
            <ToranPreviewWidget
              festivalId={festival.id}
              garlandStyle={garlandStyle}
              withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"}
              lightsTheme={seriesLightsTheme}
              lightsMode={seriesLightsMode}
            />
          </div>
        )}

        {/* Side Garlands & Corner Diyas */}
        {!showOriginal && enableEffects && (
          <>
            {!isMobile && (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") && (
              <>
                <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "106px" : "54px", left: "4px", zIndex: 11, pointerEvents: "none" }}>
                  <SideGarlandPreviewWidget withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} />
                </div>
                <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "106px" : "54px", right: "4px", zIndex: 11, pointerEvents: "none" }}>
                  <SideGarlandPreviewWidget withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} />
                </div>
              </>
            )}

            {isDiwali && (!isMobile || !diyaHideOnMobile) && (
              <>
                {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_left" || diyaPosition === "all_four") && (
                  <div style={{ position: "absolute", bottom: `${diyaMarginY}px`, left: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                    <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={isMobile ? "small" : diyaSize} />
                  </div>
                )}
                {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_right" || diyaPosition === "all_four") && (
                  <div style={{ position: "absolute", bottom: `${diyaMarginY}px`, right: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                    <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={isMobile ? "small" : diyaSize} />
                  </div>
                )}
                {(diyaPosition === "top_corners" || diyaPosition === "top_left" || diyaPosition === "all_four") && (
                  <div style={{ position: "absolute", top: `${diyaMarginY + 50}px`, left: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                    <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={isMobile ? "small" : diyaSize} />
                  </div>
                )}
                {(diyaPosition === "top_corners" || diyaPosition === "top_right" || diyaPosition === "all_four") && (
                  <div style={{ position: "absolute", top: `${diyaMarginY + 50}px`, right: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                    <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={isMobile ? "small" : diyaSize} />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Hero Section */}
        <div
          style={{
            padding: isMobile ? "24px 14px" : "36px 20px",
            textAlign: "center",
            background: "linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "3px 10px",
              background: "#E8F5E9",
              color: "#2E7D32",
              borderRadius: "10px",
              fontSize: "10px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            FESTIVE SEASON EXCLUSIVE
          </div>
          <div
            style={{
              fontSize: isMobile ? "18px" : isTablet ? "22px" : "26px",
              fontWeight: 800,
              color: "#111",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            {festival.name} Collection
          </div>
          <div
            style={{
              fontSize: isMobile ? "11px" : "12px",
              color: "#666",
              maxWidth: "340px",
              margin: "0 auto 16px",
              lineHeight: "1.4",
            }}
          >
            Celebrate auspicious traditions with handcrafted artisanal decor.
          </div>
          <button
            style={{
              background: "#111",
              color: "#FFF",
              padding: isMobile ? "9px 18px" : "8px 22px",
              borderRadius: "5px",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Shop Collection
          </button>
        </div>

        {/* Product Catalog Grid with Vector Silhouettes */}
        <div
          style={{
            padding: isMobile ? "8px" : "12px 10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: isMobile ? "6px" : "8px",
          }}
        >
          {[
            {
              title: "Brass Akhand Diya",
              price: "₹1,499",
              tag: "Bestseller",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-1.5 3-3.5 5.5-3.5 8 0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5c0-2.5-2-5-3.5-8z" fill="#D4AF37"/>
                  <path d="M4 14c0 4 3.5 6 8 6s8-2 8-6H4z" fill="#996515"/>
                </svg>
              ),
            },
            {
              title: "Marigold Toran",
              price: "₹899",
              tag: "Handmade",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6q9 12 18 0" stroke="#C62828" strokeWidth="2" fill="none"/>
                  <circle cx="6" cy="10" r="2.5" fill="#E65100"/>
                  <circle cx="12" cy="12" r="3" fill="#FF8F00"/>
                  <circle cx="18" cy="10" r="2.5" fill="#E65100"/>
                </svg>
              ),
            },
          ]
            .slice(0, 2)
            .map((prod, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #E8ECEF",
                  borderRadius: "6px",
                  padding: "10px",
                  background: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    height: isMobile ? "68px" : "80px",
                    background: "linear-gradient(135deg, #F9F9FB 0%, #ECEFF1 100%)",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {prod.icon}
                </div>
                <div style={{ fontSize: "9px", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
                  {prod.tag}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {prod.title}
                </div>
                <div style={{ fontSize: "11px", color: "#777", marginTop: "2px", fontWeight: 500 }}>
                  {prod.price}
                </div>
              </div>
            ))}
        </div>

        {/* Mobile Home Swipe Bar */}
        {isMobile && (
          <div style={{ padding: "8px 0 6px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "90px", height: "3px", background: "#333", borderRadius: "2px" }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Festival Studio Workspace Component ──────────────────────────────
export default function FestivalConfig() {
  const { festival, shop, config, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Active section in Left Navigation:
  // 'overview' | 'visual_effects' | 'banner' | 'colors' | 'sound_interaction' | 'scheduling' | 'advanced'
  const [activeSection, setActiveSection] = useState("visual_effects");

  // Animation Playback: true = playing, false = paused
  const [isPlaying, setIsPlaying] = useState(true);

  // Before / After comparison toggle
  const [showOriginal, setShowOriginal] = useState(false);

  // Form State
  const [isActive, setIsActive] = useState(config.isActive);
  const [enableBanner, setEnableBanner] = useState(config.enableBanner ?? true);
  const [enableEffects, setEnableEffects] = useState(config.enableEffects ?? true);
  const [enableCountdown, setEnableCountdown] = useState(config.enableCountdown ?? true);
  const [enableColorSwap, setEnableColorSwap] = useState(config.enableColorSwap ?? true);
  const [enableAudio, setEnableAudio] = useState(config.enableAudio ?? true);
  const [language, setLanguage] = useState(config.language || "en");

  const customSettings = useMemo(() => {
    try {
      return config.customColors ? JSON.parse(config.customColors) : {};
    } catch (e) {
      return {};
    }
  }, [config.customColors]);

  const [diyaStyle, setDiyaStyle] = useState(customSettings.diyaStyle || "royal_brass");
  const [flameGlow, setFlameGlow] = useState(customSettings.flameGlow || "sacred_flicker");
  const [diyaSize, setDiyaSize] = useState(config.diyaSize || "medium");
  const [diyaPosition, setDiyaPosition] = useState(config.diyaPosition || "bottom_corners");
  const [fireworksStyle, setFireworksStyle] = useState(customSettings.fireworksStyle || "kamuro_willow");
  const [fireworksFrequency, setFireworksFrequency] = useState(config.fireworksFrequency || "subtle");
  const [fireworksSound, setFireworksSound] = useState(customSettings.fireworksSound || "muted");
  const [interactiveBlessing, setInteractiveBlessing] = useState(customSettings.interactiveBlessing ?? true);

  // Garland & Series Lights
  const [garlandLayout, setGarlandLayout] = useState(customSettings.garlandLayout || "top_and_sides");
  const [garlandPlacement, setGarlandPlacement] = useState(customSettings.garlandPlacement || "below_header");
  const [garlandScrollMode, setGarlandScrollMode] = useState(customSettings.garlandScrollMode || "natural_scroll");
  const [garlandOffset, setGarlandOffset] = useState(customSettings.garlandOffset || 0);
  const [garlandStyle, setGarlandStyle] = useState(customSettings.garlandStyle || "mango_marigold");
  const [enableSeriesLights, setEnableSeriesLights] = useState(
    customSettings.enableSeriesLights !== undefined
      ? Boolean(customSettings.enableSeriesLights)
      : (customSettings.seriesLightsTheme !== "off" && (festival.id || "").includes("diwali"))
  );
  const [seriesLightsTheme, setSeriesLightsTheme] = useState(customSettings.seriesLightsTheme || "warm_gold");
  const [seriesLightsMode, setSeriesLightsMode] = useState(customSettings.seriesLightsMode || "twinkle");

  // Granular Diya Margins & Mobile Display
  const [diyaMarginX, setDiyaMarginX] = useState(customSettings.diyaMarginX !== undefined ? Number(customSettings.diyaMarginX) : 18);
  const [diyaMarginY, setDiyaMarginY] = useState(customSettings.diyaMarginY !== undefined ? Number(customSettings.diyaMarginY) : 18);
  const [diyaHideOnMobile, setDiyaHideOnMobile] = useState(Boolean(customSettings.diyaHideOnMobile));

  const [bannerText, setBannerText] = useState(config.bannerText || festival.banner?.defaultText || "");
  const [scheduledStart, setScheduledStart] = useState(
    config.scheduledStart ? new Date(config.scheduledStart).toISOString().split("T")[0] : ""
  );
  const [scheduledEnd, setScheduledEnd] = useState(
    config.scheduledEnd ? new Date(config.scheduledEnd).toISOString().split("T")[0] : ""
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isSaving = fetcher.state !== "idle";

  // Mark changes dirty
  const markDirty = () => setHasUnsavedChanges(true);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    markDirty();
    const greetings = getFestivalGreetings(festival.id);
    if (greetings && greetings[newLang]) {
      setBannerText(greetings[newLang]);
    }
  };

  const handleSave = useCallback(
    (newActiveState = null) => {
      const activeVal = newActiveState !== null ? newActiveState : isActive;
      const fd = new FormData();
      fd.append("actionType", "save");
      fd.append("isActive", String(activeVal));
      fd.append("enableBanner", String(enableBanner));
      fd.append("enableEffects", String(enableEffects));
      fd.append("enableCountdown", String(enableCountdown));
      fd.append("enableColorSwap", String(enableColorSwap));
      fd.append("enableAudio", String(enableAudio));
      fd.append("language", language);
      fd.append("diyaSize", diyaSize);
      fd.append("diyaPosition", diyaPosition);
      fd.append("fireworksFrequency", fireworksFrequency);
      fd.append("bannerText", bannerText);
      fd.append("scheduledStart", scheduledStart);
      fd.append("scheduledEnd", scheduledEnd);

      const customPayload = JSON.stringify({
        diyaStyle,
        flameGlow,
        fireworksStyle,
        fireworksSound,
        interactiveBlessing,
        garlandLayout,
        garlandPlacement,
        garlandScrollMode,
        garlandOffset,
        garlandStyle,
        enableSeriesLights,
        seriesLightsTheme,
        seriesLightsMode,
        diyaMarginX,
        diyaMarginY,
        diyaHideOnMobile,
      });
      fd.append("customColors", customPayload);

      fetcher.submit(fd, { method: "post" });
      if (newActiveState !== null) setIsActive(newActiveState);
      setHasUnsavedChanges(false);
    },
    [
      isActive,
      enableBanner,
      enableEffects,
      enableCountdown,
      enableColorSwap,
      enableAudio,
      language,
      diyaSize,
      diyaPosition,
      fireworksFrequency,
      bannerText,
      scheduledStart,
      scheduledEnd,
      diyaStyle,
      flameGlow,
      fireworksStyle,
      fireworksSound,
      interactiveBlessing,
      garlandLayout,
      garlandPlacement,
      garlandScrollMode,
      garlandOffset,
      garlandStyle,
      enableSeriesLights,
      seriesLightsTheme,
      seriesLightsMode,
      diyaMarginX,
      diyaMarginY,
      diyaHideOnMobile,
      fetcher,
    ]
  );

  const isDiwali = festival.id.includes("diwali");
  const isDussehra = festival.id.includes("dussehra");
  const isSankranti = festival.id.includes("sankranti") || festival.id.includes("pongal");

  return (
    <Frame>
      <Page
        fullWidth
        title={`${festival.name} Studio`}
        subtitle={`${festival.hindiName} • ${festival.region}`}
        backAction={{ content: "Festival Catalog", url: "/app/festivals" }}
        primaryAction={{
          content: isActive ? "Theme Active" : "Activate on Store",
          tone: isActive ? "success" : undefined,
          variant: "primary",
          loading: isSaving,
          onClick: () => handleSave(!isActive),
        }}
        secondaryActions={[
          {
            content: "Save Draft",
            loading: isSaving,
            disabled: !hasUnsavedChanges,
            onClick: () => handleSave(),
          },
          {
            content: "Open Live Storefront",
            url: `https://${shop}/?utsav_preview=${festival.id}`,
            target: "_blank",
            icon: ExternalIcon,
          },
        ]}
      >
        <BlockStack gap="400">
          {hasUnsavedChanges && (
            <Banner tone="warning">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodySm">You have unsaved changes in your festival studio settings.</Text>
                <Button size="slim" variant="primary" onClick={() => handleSave()}>
                  Save Changes
                </Button>
              </InlineStack>
            </Banner>
          )}

          {/* ─── 3-Column Studio Workspace ──────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "190px minmax(0, 1fr) 310px",
              gap: "14px",
              minHeight: "720px",
              alignItems: "start",
              width: "100%",
            }}
          >
            {/* ─── COLUMN 1: Settings Navigation (Left, 190px) ─────────────── */}
            <Card padding="300">
              <BlockStack gap="200">
                <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                  STUDIO WORKSPACE
                </Text>

                {[
                  { id: "overview", label: "Overview & Status" },
                  { id: "visual_effects", label: "Visual Effects Engine" },
                  { id: "banner", label: "Banner & Announcements" },
                  { id: "colors", label: "Colors & Materials" },
                  { id: "sound_interaction", label: "Sound & Interaction" },
                  { id: "scheduling", label: "Scheduling & Automation" },
                  { id: "advanced", label: "Advanced Safety" },
                ].map((item) => {
                  const isSel = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: isSel ? "var(--p-color-bg-surface-selected, #F1F2F4)" : "transparent",
                        color: isSel ? "var(--p-color-text, #202223)" : "var(--p-color-text-subdued, #6D7175)",
                        fontWeight: isSel ? 600 : 400,
                        fontSize: "13px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", opacity: isSel ? 1 : 0.7 }}>
                        {CLEAN_ICONS[item.id]}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <Divider />

                <Box padding="200">
                  <BlockStack gap="100">
                    <Text variant="bodyXs" tone="subdued">
                      STORE THEME STATUS
                    </Text>
                    <InlineStack gap="100" blockAlign="center">
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: isActive ? "#00A65A" : "#8C9196",
                        }}
                      />
                      <Text variant="bodySm" fontWeight="semibold">
                        {isActive ? "Published Live" : "Unpublished Draft"}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* ─── COLUMN 2: Multi-Device Responsive Showcase (Center) ─────── */}
            <Card padding="0">
              <div style={{ minWidth: 0 }}>
                {/* Showcase Top Control Bar */}
                <Box padding="300" background="bg-surface-secondary" borderBlockEndWidth="025" borderColor="border">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="headingSm" as="h4">
                        Multi-Device Responsive Showcase
                      </Text>
                      <Badge tone="info">Live Sync</Badge>
                    </InlineStack>

                    {/* Play/Pause & Before/After controls */}
                    <InlineStack gap="200" blockAlign="center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{
                          padding: "5px 12px",
                          fontSize: "12px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          background: "#FFF",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 500,
                        }}
                        title={isPlaying ? "Pause animations" : "Play animations"}
                      >
                        {isPlaying ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        style={{
                          padding: "5px 12px",
                          fontSize: "12px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          background: showOriginal ? "#FFF2E2" : "#FFF",
                          cursor: "pointer",
                          color: showOriginal ? "#C05621" : "#202223",
                          fontWeight: showOriginal ? 600 : 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>{showOriginal ? "Showing Original (Off)" : "Before / After"}</span>
                      </button>
                    </InlineStack>
                  </InlineStack>
                </Box>

                {/* Side-by-Side Full-Width Zero-Scroll Showcase Stage */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "16px 12px",
                    background: "#F1F2F4",
                    alignItems: "flex-start",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <DeviceStorefrontMock
                    deviceType="desktop"
                    festival={festival}
                    showOriginal={showOriginal}
                    enableEffects={enableEffects}
                    garlandPlacement={garlandPlacement}
                    garlandLayout={garlandLayout}
                    garlandStyle={garlandStyle}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    seriesLightsMode={seriesLightsMode}
                    garlandOffset={garlandOffset}
                    diyaStyle={diyaStyle}
                    flameGlow={flameGlow}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    diyaMarginX={diyaMarginX}
                    diyaMarginY={diyaMarginY}
                    diyaHideOnMobile={diyaHideOnMobile}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                  />

                  <DeviceStorefrontMock
                    deviceType="tablet"
                    festival={festival}
                    showOriginal={showOriginal}
                    enableEffects={enableEffects}
                    garlandPlacement={garlandPlacement}
                    garlandLayout={garlandLayout}
                    garlandStyle={garlandStyle}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    seriesLightsMode={seriesLightsMode}
                    garlandOffset={garlandOffset}
                    diyaStyle={diyaStyle}
                    flameGlow={flameGlow}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    diyaMarginX={diyaMarginX}
                    diyaMarginY={diyaMarginY}
                    diyaHideOnMobile={diyaHideOnMobile}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                  />

                  <DeviceStorefrontMock
                    deviceType="mobile"
                    festival={festival}
                    showOriginal={showOriginal}
                    enableEffects={enableEffects}
                    garlandPlacement={garlandPlacement}
                    garlandLayout={garlandLayout}
                    garlandStyle={garlandStyle}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    seriesLightsMode={seriesLightsMode}
                    garlandOffset={garlandOffset}
                    diyaStyle={diyaStyle}
                    flameGlow={flameGlow}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    diyaMarginX={diyaMarginX}
                    diyaMarginY={diyaMarginY}
                    diyaHideOnMobile={diyaHideOnMobile}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                  />
                </div>
              </div>
            </Card>

            {/* ─── COLUMN 3: Contextual Property Inspector (Right, 320px) ───── */}
            <Card padding="400">
              <BlockStack gap="400">
                {/* 1. VISUAL EFFECTS INSPECTOR */}
                {activeSection === "visual_effects" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Visual Effects Properties
                    </Text>
                    <Divider />

                    <ToggleSwitch
                      label="Enable Storefront Visual Effects"
                      checked={enableEffects}
                      onChange={(val) => { setEnableEffects(val); markDirty(); }}
                      helpText="Master toggle for all festive decorations, garlands, and storefront overlays"
                    />

                    {enableEffects && (
                      <>
                        <Divider />
                        <Text variant="bodySm" fontWeight="bold">Toran Garland & Borders</Text>
                        <Select
                          label="Garland Layout"
                          options={[
                            { label: "Top Toran & Both Side Cascades", value: "top_and_sides" },
                            { label: "Top Toran Only", value: "top_only" },
                            { label: "Side Cascades Only", value: "sides_only" },
                            { label: "Off (No Garland)", value: "off" },
                          ]}
                          value={garlandLayout}
                          onChange={(val) => { setGarlandLayout(val); markDirty(); }}
                        />

                        <Select
                          label="Garland Docking Position"
                          helpText="Prevents garland from overlapping store logo, navigation menu, or cart."
                          options={[
                            { label: "Below Store Navigation (Recommended — No Menu Overlap)", value: "below_header" },
                            { label: "Top of Screen (Fixed 0px)", value: "top_fixed" },
                          ]}
                          value={garlandPlacement}
                          onChange={(val) => { setGarlandPlacement(val); markDirty(); }}
                        />

                        <Select
                          label="Garland Scroll Behavior"
                          options={[
                            { label: "Natural Scroll (Entrance Toran — Scrolls With Hero Banner)", value: "natural_scroll" },
                            { label: "Sticky (Stays Docked Beneath Sticky Header)", value: "sticky" },
                          ]}
                          value={garlandScrollMode}
                          onChange={(val) => { setGarlandScrollMode(val); markDirty(); }}
                        />

                        <LuxurySlider
                          label="Vertical Alignment Fine-Tuning"
                          value={garlandOffset}
                          min={-50}
                          max={50}
                          step={1}
                          unit="px"
                          onChange={(val) => { setGarlandOffset(val); markDirty(); }}
                          helpText="Nudge the toran up or down in pixels (-50px to +50px) to match your custom theme."
                        />

                        {isDiwali && (
                          <>
                            <Divider />
                            <Text variant="bodySm" fontWeight="bold">Series Lights (Diwali Only)</Text>
                            <ToggleSwitch
                              label="Enable Series Lights (Ladi / Fairy Lights)"
                              checked={enableSeriesLights}
                              onChange={(val) => { setEnableSeriesLights(val); markDirty(); }}
                              helpText="Adds illuminated electric fairy lights intertwined along the toran garland"
                            />
                            {enableSeriesLights && (
                              <>
                                <Select
                                  label="Lights Glow Palette"
                                  options={[
                                    { label: "Royal Warm Gold (2700K)", value: "warm_gold" },
                                    { label: "Multi-Color Festive Jewels", value: "festive_multicolor" },
                                    { label: "Deep Amber Radiance", value: "amber_radiance" },
                                    { label: "Moonlit Pearl White", value: "pearl_white" },
                                  ]}
                                  value={seriesLightsTheme}
                                  onChange={(val) => { setSeriesLightsTheme(val); markDirty(); }}
                                />
                                <Select
                                  label="Light Animation Mode"
                                  options={[
                                    { label: "Cascading Chaser Wave", value: "chaser" },
                                    { label: "Gentle Twinkle & Shimmer", value: "twinkle" },
                                    { label: "Steady Luminous Glow", value: "steady" },
                                  ]}
                                  value={seriesLightsMode}
                                  onChange={(val) => { setSeriesLightsMode(val); markDirty(); }}
                                />
                              </>
                            )}

                            <Divider />
                            <Text variant="bodySm" fontWeight="bold">Realistic Diya Engine</Text>
                            <Select
                              label="Artisanal Diya Style"
                              options={[
                                { label: "Royal Brass (राजसी पीतल)", value: "royal_brass" },
                                { label: "Earthen Terracotta (मिट्टी का दीया)", value: "terracotta_clay" },
                                { label: "Antique Copper (प्राचीन तांबा)", value: "antique_copper" },
                                { label: "Minimal Contemporary (आधुनिक)", value: "minimal_contemporary" },
                                { label: "Marigold Urli (गेंदा फूल अर्ली)", value: "marigold_urli" },
                              ]}
                              value={diyaStyle}
                              onChange={(val) => { setDiyaStyle(val); markDirty(); }}
                            />
                            <Select
                              label="Diya Dimensions"
                              options={[
                                { label: "Small (56px — Minimal)", value: "small" },
                                { label: "Medium (74px — Standard)", value: "medium" },
                                { label: "Large (95px — Majestic)", value: "large" },
                                { label: "X-Large (116px — Akhand Maha Diya)", value: "xlarge" },
                              ]}
                              value={diyaSize}
                              onChange={(val) => { setDiyaSize(val); markDirty(); }}
                            />
                            <Select
                              label="Corner Placement"
                              options={[
                                { label: "Both Bottom Corners (Auspicious Grounding)", value: "bottom_corners" },
                                { label: "Bottom-Left Corner Only", value: "bottom_left" },
                                { label: "Bottom-Right Corner Only", value: "bottom_right" },
                                { label: "Both Top Corners", value: "top_corners" },
                                { label: "Top-Left Corner Only", value: "top_left" },
                                { label: "Top-Right Corner Only", value: "top_right" },
                                { label: "All 4 Corners (Full Celestial Frame)", value: "all_four" },
                              ]}
                              value={diyaPosition}
                              onChange={(val) => { setDiyaPosition(val); markDirty(); }}
                            />
                            <LuxurySlider
                              label="Horizontal Diya Margin"
                              value={diyaMarginX}
                              min={0}
                              max={80}
                              step={1}
                              unit="px"
                              onChange={(val) => { setDiyaMarginX(val); markDirty(); }}
                              helpText="Distance from left and right screen borders"
                            />
                            <LuxurySlider
                              label="Vertical Diya Margin"
                              value={diyaMarginY}
                              min={0}
                              max={80}
                              step={1}
                              unit="px"
                              onChange={(val) => { setDiyaMarginY(val); markDirty(); }}
                              helpText="Distance from top and bottom screen borders"
                            />
                            <ToggleSwitch
                              label="Hide Diyas on Mobile Screens (<480px)"
                              checked={diyaHideOnMobile}
                              onChange={(val) => { setDiyaHideOnMobile(val); markDirty(); }}
                              helpText="Prevents corner diyas from overlapping mobile sticky Add-to-Cart or chat buttons"
                            />

                            <Divider />
                            <Text variant="bodySm" fontWeight="bold">Fireworks Engine</Text>
                            <Select
                              label="Fireworks Frequency"
                              options={[
                                { label: "Off (No Fireworks)", value: "off" },
                                { label: "Subtle (Burst every 8.5s)", value: "subtle" },
                                { label: "Moderate (Burst every 4.5s)", value: "moderate" },
                                { label: "Celebratory (Burst every 2.4s)", value: "celebratory" },
                              ]}
                              value={fireworksFrequency}
                              onChange={(val) => { setFireworksFrequency(val); markDirty(); }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </BlockStack>
                )}

                {/* 2. BANNER & MESSAGING INSPECTOR */}
                {activeSection === "banner" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Banner & Announcement
                    </Text>
                    <Divider />
                    <ToggleSwitch
                      label="Show Announcement Bar on Storefront"
                      checked={enableBanner}
                      onChange={(val) => { setEnableBanner(val); markDirty(); }}
                      helpText="Displays festive discount announcement strip across top of store"
                    />
                    {enableBanner && (
                      <>
                        <Select
                          label="Greeting Language"
                          options={[
                            { label: "English", value: "en" },
                            { label: "हिंदी (Hindi)", value: "hi" },
                            { label: "ગુજરાતી (Gujarati)", value: "gu" },
                            { label: "मराठी (Marathi)", value: "mr" },
                            { label: "தமிழ் (Tamil)", value: "ta" },
                            { label: "తెలుగు (Telugu)", value: "te" },
                            { label: "বাংলা (Bengali)", value: "bn" },
                            { label: "ਪੰਜਾਬੀ (Punjabi)", value: "pa" },
                          ]}
                          value={language}
                          onChange={handleLanguageChange}
                        />
                        <TextField
                          label="Banner Message"
                          value={bannerText}
                          onChange={(val) => { setBannerText(val); markDirty(); }}
                          multiline={3}
                          autoComplete="off"
                        />
                      </>
                    )}
                  </BlockStack>
                )}

                {/* 3. OVERVIEW & STATUS INSPECTOR */}
                {activeSection === "overview" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Festival Overview
                    </Text>
                    <Divider />
                    <Text variant="bodySm"><strong>Festival:</strong> {festival.name}</Text>
                    <Text variant="bodySm"><strong>Regional Name:</strong> {festival.hindiName}</Text>
                    <Text variant="bodySm"><strong>Region:</strong> {festival.region}</Text>
                    <Text variant="bodySm"><strong>Tier:</strong> {festival.tier.toUpperCase()}</Text>
                    <Text variant="bodySm"><strong>Description:</strong> {festival.description}</Text>
                    <Divider />
                    <Button
                      fullWidth
                      variant="primary"
                      onClick={() => handleSave(!isActive)}
                    >
                      {isActive ? "Deactivate Theme" : "Activate Theme"}
                    </Button>
                  </BlockStack>
                )}

                {/* 4. SOUND & INTERACTION INSPECTOR */}
                {activeSection === "sound_interaction" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Sound & Interaction
                    </Text>
                    <Divider />
                    <ToggleSwitch
                      label="Interactive Tap-to-Bless (Shopper Diya Blessing)"
                      checked={interactiveBlessing}
                      onChange={(val) => { setInteractiveBlessing(val); markDirty(); }}
                      helpText="Shoppers can tap corner diyas to receive auspicious greetings"
                    />
                    <Select
                      label="Festive Soundscape (Web Audio Synthesizer)"
                      options={[
                        { label: "Silent (100% Muted — Default)", value: "muted" },
                        { label: "Auspicious Temple Bells on Diya Tap", value: "temple_bells" },
                      ]}
                      value={fireworksSound}
                      onChange={(val) => { setFireworksSound(val); markDirty(); }}
                    />
                  </BlockStack>
                )}

                {/* 5. SCHEDULING INSPECTOR */}
                {activeSection === "scheduling" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Automated Scheduling
                    </Text>
                    <Divider />
                    <TextField
                      label="Activation Start Date"
                      type="date"
                      value={scheduledStart}
                      onChange={(val) => { setScheduledStart(val); markDirty(); }}
                      autoComplete="off"
                    />
                    <TextField
                      label="Deactivation End Date"
                      type="date"
                      value={scheduledEnd}
                      onChange={(val) => { setScheduledEnd(val); markDirty(); }}
                      autoComplete="off"
                    />
                    <Text variant="bodyXs" tone="subdued">
                      The theme will automatically appear on your storefront when the start date arrives and shut off after the end date.
                    </Text>
                  </BlockStack>
                )}

                {/* 6. ADVANCED & SAFETY INSPECTOR */}
                {activeSection === "advanced" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Conversion & Performance Safety
                    </Text>
                    <Divider />
                    <Text variant="bodyXs" tone="success">
                      Non-Blocking: Garlands and effects use pointer-events: none
                    </Text>
                    <Text variant="bodyXs" tone="success">
                      Mobile Optimization: Side garlands auto-suppressed under 640px
                    </Text>
                    <Text variant="bodyXs" tone="success">
                      Accessibility: prefers-reduced-motion stops animation loops
                    </Text>
                    <Text variant="bodyXs" tone="success">
                      Zero Layout Shifts: Fixed overlays do not push theme DOM
                    </Text>
                  </BlockStack>
                )}

                {/* 7. COLORS & MATERIALS INSPECTOR */}
                {activeSection === "colors" && (
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                      Theme Palette Tokens
                    </Text>
                    <Divider />
                    <ToggleSwitch
                      label="Swap CSS Variables with Festival Colors"
                      checked={enableColorSwap}
                      onChange={(val) => { setEnableColorSwap(val); markDirty(); }}
                      helpText="Injects curated festive accents into theme design tokens"
                    />
                    <InlineGrid columns={2} gap="200">
                      <div>
                        <Text variant="bodyXs" tone="subdued">Primary</Text>
                        <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: festival.palette.primary, border: "1px solid #ccc" }} />
                      </div>
                      <div>
                        <Text variant="bodyXs" tone="subdued">Secondary</Text>
                        <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: festival.palette.secondary, border: "1px solid #ccc" }} />
                      </div>
                    </InlineGrid>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </div>
        </BlockStack>
      </Page>
    </Frame>
  );
}
