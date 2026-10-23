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
function ToranPreviewWidget({ festivalId, garlandStyle, withLights, lightsTheme, lightsMode, height = 42 }) {
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
    <svg width="100%" height={height} viewBox="0 0 560 58" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
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
function SideGarlandPreviewWidget({ withLights, lightsTheme, height = 130, width = 20 }) {
  const showLights = withLights && lightsTheme !== "off";
  return (
    <svg width={width} height={height} viewBox="0 0 34 260" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
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

function DiyaPreviewWidget({ style, flameGlow, size }) {
  const sizePx = typeof size === "number"
    ? size
    : size === "micro"
    ? 22
    : size === "small"
    ? 26
    : size === "large"
    ? 44
    : size === "xlarge"
    ? 52
    : 34;
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
  const isMobile = deviceType === "mobile";

  const flexRatio = isDesktop ? "2.6" : "1.0";
  const maxW = isDesktop ? "560px" : "195px";
  const minW = isDesktop ? "380px" : "145px";
  const aspectRatio = isDesktop ? "16 / 10" : "9 / 19.5";
  const titleLabel = isDesktop ? "Desktop" : "Mobile";
  const resLabel = isDesktop ? "16:10 • 1440×900" : "9:19.5 • 375×812";

  // Dynamic Diya Sizing & Viewport Positioning
  const diyaMultiplier =
    diyaSize === "small"
      ? 0.75
      : diyaSize === "large"
      ? 1.25
      : diyaSize === "xlarge"
      ? 1.5
      : 1.0;
  const baseDiyaPx = isMobile ? 18 : 28;
  const effectiveDiyaPx = Math.round(baseDiyaPx * diyaMultiplier);
  const scaledMarginX = Math.round((diyaMarginX || 0) * 0.25) + (isMobile ? 3 : 6);
  const scaledMarginY = Math.round((diyaMarginY || 0) * 0.25) + (isMobile ? 3 : 6);

  return (
    <div
      style={{
        flex: `${flexRatio} 1 0px`,
        maxWidth: maxW,
        minWidth: minW,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Device Viewport Header Pill */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px 8px 4px",
          color: "#5C5F62",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          textTransform: "uppercase",
        }}
      >
        <span>{titleLabel}</span>
        <span style={{ fontSize: "9px", color: "#8C9196", fontWeight: 500 }}>{resLabel}</span>
      </div>

      {/* Frame Container with Fixed Hardware Aspect Ratio */}
      <div
        style={{
          width: "100%",
          aspectRatio: aspectRatio,
          background: "#FFFFFF",
          borderRadius: isMobile ? "24px" : "8px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
          position: "relative",
          overflow: "hidden",
          border: isMobile ? "6px solid #1A1C1E" : "1px solid #DCE0E5",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Safari Browser Chrome (Desktop) */}
        {isDesktop && (
          <div
            style={{
              background: "#F1F2F4",
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid #DCE0E5",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FF5F56", display: "inline-block" }} />
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
            </div>
            <div
              style={{
                flex: 1,
                background: "#FFFFFF",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "9px",
                color: "#555",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: "1px solid #E1E3E6",
                minWidth: 0,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6D7175" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>luxestore.myshopify.com</span>
            </div>
          </div>
        )}

        {/* Mobile Dynamic Island & Status Bar */}
        {isMobile && (
          <div style={{ background: "#000000", color: "#FFFFFF", padding: "3px 10px 2px", flexShrink: 0 }}>
            <div
              style={{
                width: "42px",
                height: "9px",
                background: "#1E1E1E",
                borderRadius: "5px",
                margin: "0 auto 2px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", fontWeight: 600 }}>
              <span>9:41</span>
              <span style={{ fontSize: "7px", opacity: 0.8 }}>LTE 100%</span>
            </div>
          </div>
        )}

        {/* Announcement Bar */}
        {!showOriginal && enableBanner && (
          <div
            style={{
              background: "linear-gradient(90deg, #1A0A00 0%, #2A1502 50%, #1A0A00 100%)",
              color: "#FFF8DC",
              padding: isMobile ? "2px 6px" : "4px 8px",
              fontSize: isMobile ? "7.5px" : "8.5px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {bannerText || "Happy Diwali! Celebrate with artisanal decor."}
            </span>
            <span
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid #D4AF37",
                color: "#FFD700",
                borderRadius: "4px",
                padding: "0 4px",
                fontSize: "7px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              UTSAV25
            </span>
          </div>
        )}

        {/* Top Toran (if top_fixed) */}
        {!showOriginal && enableEffects && garlandPlacement === "top_fixed" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
          <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: isMobile ? "20px" : "32px", flexShrink: 0 }}>
            <ToranPreviewWidget
              festivalId={festival.id}
              garlandStyle={garlandStyle}
              withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"}
              lightsTheme={seriesLightsTheme}
              lightsMode={seriesLightsMode}
              height={isMobile ? 20 : 32}
            />
          </div>
        )}

        {/* Store Navigation Bar */}
        <div
          style={{
            padding: isMobile ? "4px 8px" : "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #EEEEEE",
            position: "relative",
            zIndex: 10,
            background: "#FFFFFF",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, flexShrink: 0 }}>
            {isMobile && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" style={{ flexShrink: 0 }}>
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
            <div style={{ fontWeight: 800, fontSize: isMobile ? "9px" : "11px", color: "#111", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>
              LUXE STORE
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {isDesktop && (
            <div style={{ display: "flex", gap: "10px", fontSize: "8.5px", color: "#555", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}>
              <span style={{ color: "#000", fontWeight: 700 }}>Home</span>
              <span>Festive Collection</span>
              <span>Diwali Specials</span>
              <span>Pooja Sets</span>
              <span>Artisanal Decor</span>
            </div>
          )}

          {/* Search + Cart */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "8.5px", color: "#333", flexShrink: 0 }}>
            {isDesktop && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span>(2)</span>
            </div>
          </div>
        </div>

        {/* Viewport Storefront Body Container */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Scrollable Storefront Content */}
          <div style={{ flex: 1, overflowY: "auto", position: "relative", scrollbarWidth: "none" }}>
            {/* Below-header Toran */}
            {!showOriginal && enableEffects && garlandPlacement === "below_header" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
              <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: isMobile ? "20px" : "32px", marginTop: `${Math.round(garlandOffset * 0.5)}px` }}>
                <ToranPreviewWidget
                  festivalId={festival.id}
                  garlandStyle={garlandStyle}
                  withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"}
                  lightsTheme={seriesLightsTheme}
                  lightsMode={seriesLightsMode}
                  height={isMobile ? 20 : 32}
                />
              </div>
            )}

            {/* Side Garlands */}
            {!showOriginal && enableEffects && !isMobile && (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") && (
              <>
                <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "26px" : "2px", left: "2px", zIndex: 11, pointerEvents: "none" }}>
                  <SideGarlandPreviewWidget withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} height={120} width={14} />
                </div>
                <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "26px" : "2px", right: "2px", zIndex: 11, pointerEvents: "none" }}>
                  <SideGarlandPreviewWidget withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} height={120} width={14} />
                </div>
              </>
            )}

            {/* Hero Section */}
            <div
              style={{
                padding: isMobile ? "8px 6px 6px" : "14px 12px 10px",
                textAlign: "center",
                background: "linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "1px 5px",
                  background: "#E8F5E9",
                  color: "#2E7D32",
                  borderRadius: "5px",
                  fontSize: "7px",
                  fontWeight: 700,
                  marginBottom: "2px",
                }}
              >
                FESTIVE EXCLUSIVE
              </div>
              <div
                style={{
                  fontSize: isMobile ? "10px" : "13.5px",
                  fontWeight: 800,
                  color: "#111",
                  marginBottom: "2px",
                  letterSpacing: "-0.2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {festival.name} Collection
              </div>
              <div
                style={{
                  fontSize: isMobile ? "7.5px" : "8.5px",
                  color: "#666",
                  maxWidth: "280px",
                  margin: "0 auto 5px",
                  lineHeight: "1.2",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Handcrafted auspicious artisanal decor
              </div>
              <button
                style={{
                  background: "#111",
                  color: "#FFF",
                  padding: isMobile ? "3px 9px" : "4px 12px",
                  borderRadius: "4px",
                  border: "none",
                  fontSize: isMobile ? "8px" : "8.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Shop Collection
              </button>
            </div>

            {/* Product Catalog Grid (Includes 36px bottom padding so products are never blocked by corner diyas) */}
            <div
              style={{
                padding: "6px 8px 36px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              {[
                {
                  title: "Akhand Diya",
                  price: "₹1,499",
                  tag: "Bestseller",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6q9 12 18 0" stroke="#C62828" strokeWidth="2" fill="none"/>
                      <circle cx="6" cy="10" r="2.5" fill="#E65100"/>
                      <circle cx="12" cy="12" r="3" fill="#FF8F00"/>
                      <circle cx="18" cy="10" r="2.5" fill="#E65100"/>
                    </svg>
                  ),
                },
              ].map((prod, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #E8ECEF",
                    borderRadius: "5px",
                    padding: "6px",
                    background: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      height: isMobile ? "34px" : "42px",
                      background: "linear-gradient(135deg, #F9F9FB 0%, #ECEFF1 100%)",
                      borderRadius: "3px",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {prod.icon}
                  </div>
                  <div style={{ fontSize: "6.5px", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "1px" }}>
                    {prod.tag}
                  </div>
                  <div style={{ fontSize: "8.5px", fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {prod.title}
                  </div>
                  <div style={{ fontSize: "8px", color: "#777", marginTop: "1px", fontWeight: 500 }}>
                    {prod.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Home Swipe Bar */}
            {isMobile && (
              <div style={{ padding: "2px 0 4px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "42px", height: "3px", background: "#333", borderRadius: "2px" }} />
              </div>
            )}
          </div>

          {/* Viewport-Anchored Corner Diyas (Fixed to device screen corners like live storefront) */}
          {!showOriginal && enableEffects && isDiwali && (!isMobile || !diyaHideOnMobile) && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }}>
              {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_left" || diyaPosition === "all_four") && (
                <div style={{ position: "absolute", bottom: `${scaledMarginY}px`, left: `${scaledMarginX}px` }}>
                  <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={effectiveDiyaPx} />
                </div>
              )}
              {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_right" || diyaPosition === "all_four") && (
                <div style={{ position: "absolute", bottom: `${scaledMarginY}px`, right: `${scaledMarginX}px` }}>
                  <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={effectiveDiyaPx} />
                </div>
              )}
              {(diyaPosition === "top_corners" || diyaPosition === "top_left" || diyaPosition === "all_four") && (
                <div style={{ position: "absolute", top: `${scaledMarginY + 2}px`, left: `${scaledMarginX}px` }}>
                  <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={effectiveDiyaPx} />
                </div>
              )}
              {(diyaPosition === "top_corners" || diyaPosition === "top_right" || diyaPosition === "all_four") && (
                <div style={{ position: "absolute", top: `${scaledMarginY + 2}px`, right: `${scaledMarginX}px` }}>
                  <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={effectiveDiyaPx} />
                </div>
              )}
            </div>
          )}
        </div>
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

          {/* ─── 2-Column Studio Workspace ──────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px minmax(0, 1fr)",
              gap: "16px",
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

            {/* ─── COLUMN 2: Main Studio Canvas (Showcase + Divided Controls Below) ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
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

                {/* Side-by-Side Full-Width Zero-Scroll Showcase Stage (Desktop & Mobile) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: "20px",
                    padding: "20px 16px",
                    background: "#F1F2F4",
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

            {/* ─── DIVIDED SECTION CONTROLS (Positioned below preview for minimal scroll) ─── */}

            {/* 1. VISUAL EFFECTS ENGINE (Divided into 4 Modular Cards in a 2-Column Grid) */}
            {activeSection === "visual_effects" && (
              <BlockStack gap="300">
                {/* Master Effects Toggle Banner */}
                <Card padding="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="300" blockAlign="center">
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          background: enableEffects ? "#E3F1DF" : "#F1F2F4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: enableEffects ? "#008060" : "#6D7175",
                        }}
                      >
                        {CLEAN_ICONS.visual_effects}
                      </div>
                      <BlockStack gap="050">
                        <InlineStack gap="150" blockAlign="center">
                          <Text variant="headingSm" as="h4">
                            Storefront Visual Effects Engine
                          </Text>
                          <Badge tone={enableEffects ? "success" : "subdued"}>
                            {enableEffects ? "Active on Storefront" : "Effects Disabled"}
                          </Badge>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">
                          Master toggle for all festive decorations, entrance toran, series lights, and corner diyas
                        </Text>
                      </BlockStack>
                    </InlineStack>

                    <ToggleSwitch
                      label=""
                      checked={enableEffects}
                      onChange={(val) => { setEnableEffects(val); markDirty(); }}
                    />
                  </InlineStack>
                </Card>

                {/* 4 Divided Cards in Responsive 2-Column Grid */}
                {enableEffects && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                      gap: "16px",
                      alignItems: "start",
                      width: "100%",
                    }}
                  >
                    {/* CARD 1: Toran Garland & Border Cascades */}
                    <Card padding="400">
                      <BlockStack gap="300">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingSm" as="h4">Toran Garland & Borders</Text>
                          <Badge tone="info">Store Entrance</Badge>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">
                          Auspicious mango leaf kalawa arches and marigold strings framing your storefront
                        </Text>
                        <Divider />

                        <Select
                          label="Garland Layout"
                          options={[
                            { label: "Top Toran & Both Side Cascades", value: "top_and_sides" },
                            { label: "Top Toran Only (Header Arch)", value: "top_only" },
                            { label: "Side Cascades Only (Pillars)", value: "sides_only" },
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
                      </BlockStack>
                    </Card>

                    {/* CARD 2: Series Fairy Lights (Diwali Exclusive) */}
                    <Card padding="400">
                      <BlockStack gap="300">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingSm" as="h4">Series Lights (Ladi / Fairy Lights)</Text>
                          <Badge tone={isDiwali ? "attention" : "subdued"}>
                            {isDiwali ? "Diwali Feature" : "Festival Specific"}
                          </Badge>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">
                          Illuminated electric fairy lights physically wired along the catenary toran garland
                        </Text>
                        <Divider />

                        {isDiwali ? (
                          <>
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
                          </>
                        ) : (
                          <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                            <Text variant="bodyXs" tone="subdued">
                              Series fairy lights are designed exclusively for Diwali. Holy mango leaf & marigold entrance torans are active for this festival.
                            </Text>
                          </Box>
                        )}
                      </BlockStack>
                    </Card>

                    {/* CARD 3: Artisanal Diya Engine */}
                    <Card padding="400">
                      <BlockStack gap="300">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingSm" as="h4">Artisanal Diya Engine</Text>
                          <Badge tone="success">Living Flame</Badge>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">
                          Auspicious sacred lamps with glowing wicks, atmospheric halos, and custom placement
                        </Text>
                        <Divider />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                              { label: "X-Large (116px — Akhand)", value: "xlarge" },
                            ]}
                            value={diyaSize}
                            onChange={(val) => { setDiyaSize(val); markDirty(); }}
                          />
                        </div>

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

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <LuxurySlider
                            label="Horizontal Margin"
                            value={diyaMarginX}
                            min={0}
                            max={80}
                            step={1}
                            unit="px"
                            onChange={(val) => { setDiyaMarginX(val); markDirty(); }}
                          />
                          <LuxurySlider
                            label="Vertical Margin"
                            value={diyaMarginY}
                            min={0}
                            max={80}
                            step={1}
                            unit="px"
                            onChange={(val) => { setDiyaMarginY(val); markDirty(); }}
                          />
                        </div>

                        <ToggleSwitch
                          label="Hide Diyas on Mobile Screens (<480px)"
                          checked={diyaHideOnMobile}
                          onChange={(val) => { setDiyaHideOnMobile(val); markDirty(); }}
                          helpText="Prevents corner diyas from overlapping mobile sticky Add-to-Cart or chat buttons"
                        />
                      </BlockStack>
                    </Card>

                    {/* CARD 4: Fireworks & Atmospheric FX */}
                    <Card padding="400">
                      <BlockStack gap="300">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingSm" as="h4">Fireworks & Ambient FX</Text>
                          <Badge tone="magic">Celestial Glow</Badge>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">
                          Celestial skyward fireworks bursts, soundscapes, and shopper interactive blessings
                        </Text>
                        <Divider />

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

                        <ToggleSwitch
                          label="Interactive Tap-to-Bless (Shopper Diya Blessing)"
                          checked={interactiveBlessing}
                          onChange={(val) => { setInteractiveBlessing(val); markDirty(); }}
                          helpText="Shoppers can tap corner diyas to receive auspicious greetings and floral sparks"
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
                    </Card>
                  </div>
                )}
              </BlockStack>
            )}

            {/* 2. BANNER & MESSAGING SECTION */}
            {activeSection === "banner" && (
              <Card padding="400">
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
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
                        multiline={2}
                        autoComplete="off"
                      />
                    </div>
                  )}
                </BlockStack>
              </Card>
            )}

            {/* 3. OVERVIEW & STATUS SECTION */}
            {activeSection === "overview" && (
              <Card padding="400">
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Festival Overview & Status
                  </Text>
                  <Divider />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <Text variant="bodyXs" tone="subdued">FESTIVAL</Text>
                      <Text variant="bodyMd" fontWeight="bold">{festival.name}</Text>
                      <Text variant="bodyXs" tone="subdued">{festival.hindiName}</Text>
                    </Box>
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <Text variant="bodyXs" tone="subdued">REGION & TIER</Text>
                      <Text variant="bodyMd" fontWeight="bold">{festival.region}</Text>
                      <Text variant="bodyXs" tone="subdued">{festival.tier.toUpperCase()} Tier</Text>
                    </Box>
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <Text variant="bodyXs" tone="subdued">STORE EMBED STATUS</Text>
                      <Text variant="bodyMd" fontWeight="bold" tone={isActive ? "success" : "subdued"}>
                        {isActive ? "Active on Live Store" : "Draft / Inactive"}
                      </Text>
                    </Box>
                  </div>
                  <Text variant="bodySm">{festival.description}</Text>
                  <Divider />
                  <InlineStack align="end">
                    <Button
                      variant="primary"
                      onClick={() => handleSave(!isActive)}
                    >
                      {isActive ? "Deactivate Theme" : "Activate on Store"}
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* 4. SOUND & INTERACTION SECTION */}
            {activeSection === "sound_interaction" && (
              <Card padding="400">
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Sound & Interaction
                  </Text>
                  <Divider />
                  <ToggleSwitch
                    label="Interactive Tap-to-Bless (Shopper Diya Blessing)"
                    checked={interactiveBlessing}
                    onChange={(val) => { setInteractiveBlessing(val); markDirty(); }}
                    helpText="Shoppers can tap corner diyas to receive auspicious greetings and floral sparks"
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
              </Card>
            )}

            {/* 5. SCHEDULING SECTION */}
            {activeSection === "scheduling" && (
              <Card padding="400">
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Automated Scheduling
                  </Text>
                  <Divider />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                  </div>
                  <Text variant="bodyXs" tone="subdued">
                    The theme will automatically appear on your storefront when the start date arrives and shut off after the end date.
                  </Text>
                </BlockStack>
              </Card>
            )}

            {/* 6. ADVANCED & SAFETY SECTION */}
            {activeSection === "advanced" && (
              <Card padding="400">
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Conversion & Performance Safety
                  </Text>
                  <Divider />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <Text variant="bodyXs" tone="success" fontWeight="bold">Non-Blocking Interactions</Text>
                      <Text variant="bodyXs" tone="subdued">Garlands and effects use pointer-events: none</Text>
                    </Box>
                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <Text variant="bodyXs" tone="success" fontWeight="bold">Mobile Responsive Guard</Text>
                      <Text variant="bodyXs" tone="subdued">Side garlands auto-suppressed under 640px</Text>
                    </Box>
                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <Text variant="bodyXs" tone="success" fontWeight="bold">Accessibility Compliant</Text>
                      <Text variant="bodyXs" tone="subdued">prefers-reduced-motion halts animation loops</Text>
                    </Box>
                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <Text variant="bodyXs" tone="success" fontWeight="bold">Zero Layout Shifts</Text>
                      <Text variant="bodyXs" tone="subdued">Fixed overlays do not push theme DOM elements</Text>
                    </Box>
                  </div>
                </BlockStack>
              </Card>
            )}

            {/* 7. COLORS & MATERIALS SECTION */}
            {activeSection === "colors" && (
              <Card padding="400">
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
                      <Text variant="bodyXs" tone="subdued">Primary Festive Accent</Text>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: festival.palette.primary, border: "1px solid #ccc", marginTop: "4px" }} />
                    </div>
                    <div>
                      <Text variant="bodyXs" tone="subdued">Secondary Festive Accent</Text>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: festival.palette.secondary, border: "1px solid #ccc", marginTop: "4px" }} />
                    </div>
                  </InlineGrid>
                </BlockStack>
              </Card>
            )}
          </div>
        </div>
        </BlockStack>
      </Page>
    </Frame>
  );
}
