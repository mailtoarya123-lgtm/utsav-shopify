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
  Checkbox,
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

// ─── Main Festival Studio Workspace Component ──────────────────────────────
export default function FestivalConfig() {
  const { festival, shop, config, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Active section in Left Navigation:
  // 'overview' | 'visual_effects' | 'banner' | 'colors' | 'sound_interaction' | 'scheduling' | 'advanced'
  const [activeSection, setActiveSection] = useState("visual_effects");

  // Device Viewport Simulation: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState("desktop");

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

  // Viewport width styling
  const canvasWidth = viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%";

  return (
    <Frame>
      <Page
        title={`${festival.name} Studio`}
        subtitle={`${festival.hindiName} • ${festival.region}`}
        backAction={{ content: "Festival Catalog", url: "/app/festivals" }}
        primaryAction={{
          content: isActive ? "✓ Theme Active" : "▶ Activate on Store",
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
              gridTemplateColumns: "220px minmax(400px, 1fr) 320px",
              gap: "16px",
              minHeight: "720px",
              alignItems: "start",
            }}
          >
            {/* ─── COLUMN 1: Settings Navigation (Left, 220px) ─────────────── */}
            <Card padding="300">
              <BlockStack gap="200">
                <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                  STUDIO WORKSPACE
                </Text>

                {[
                  { id: "overview", label: "Overview & Status", icon: "📋" },
                  { id: "visual_effects", label: "Visual Effects Engine", icon: "✨" },
                  { id: "banner", label: "Banner & Announcements", icon: "🎌" },
                  { id: "colors", label: "Colors & Materials", icon: "🎨" },
                  { id: "sound_interaction", label: "Sound & Interaction", icon: "🔔" },
                  { id: "scheduling", label: "Scheduling & Automation", icon: "📅" },
                  { id: "advanced", label: "Advanced Safety", icon: "⚡" },
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
                      <span>{item.icon}</span>
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

            {/* ─── COLUMN 2: Live Storefront Preview (Center) ───────────────── */}
            <Card padding="0">
              <BlockStack gap="0">
                {/* Viewport Control Bar */}
                <Box padding="300" background="bg-surface-secondary" borderBlockEndWidth="025" borderColor="border">
                  <InlineStack align="space-between" blockAlign="center">
                    {/* Viewport Switcher */}
                    <InlineStack gap="100">
                      {[
                        { id: "desktop", label: "🖥️ Desktop" },
                        { id: "tablet", label: "📱 Tablet" },
                        { id: "mobile", label: "📱 Mobile" },
                      ].map((vp) => (
                        <button
                          key={vp.id}
                          onClick={() => setViewport(vp.id)}
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            border: "1px solid",
                            borderColor: viewport === vp.id ? "#2C6ECB" : "rgba(0,0,0,0.15)",
                            background: viewport === vp.id ? "#EBF5FA" : "#FFF",
                            color: viewport === vp.id ? "#2C6ECB" : "#202223",
                            cursor: "pointer",
                            fontWeight: viewport === vp.id ? 600 : 400,
                          }}
                        >
                          {vp.label}
                        </button>
                      ))}
                    </InlineStack>

                    {/* Play/Pause & Before/After controls */}
                    <InlineStack gap="200" blockAlign="center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          background: "#FFF",
                          cursor: "pointer",
                        }}
                        title={isPlaying ? "Pause animations" : "Play animations"}
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </button>

                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          background: showOriginal ? "#FFF2E2" : "#FFF",
                          cursor: "pointer",
                          color: showOriginal ? "#C05621" : "#202223",
                          fontWeight: showOriginal ? 600 : 400,
                        }}
                      >
                        {showOriginal ? "Showing Before (Off)" : "Before / After"}
                      </button>
                    </InlineStack>
                  </InlineStack>
                </Box>

                {/* Simulated Live Storefront Frame */}
                <div
                  style={{
                    padding: "24px",
                    background: "#E5E8EC",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    minHeight: "640px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: viewport === "mobile" ? "360px" : viewport === "tablet" ? "580px" : "100%",
                      maxWidth: "100%",
                      background: "#FFFFFF",
                      borderRadius: viewport === "mobile" ? "38px" : viewport === "tablet" ? "22px" : "8px",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.18)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: viewport === "mobile" ? "9px solid #1A1C1E" : viewport === "tablet" ? "9px solid #2B2D42" : "1px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    {/* ─── DESKTOP BROWSER CHROME (Safari Mockup) ────────────────── */}
                    {viewport === "desktop" && (
                      <div
                        style={{
                          background: "#F1F2F4",
                          padding: "8px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          borderBottom: "1px solid #DCE0E5",
                        }}
                      >
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56", display: "inline-block" }} />
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
                        </div>
                        <div
                          style={{
                            flex: 1,
                            background: "#FFFFFF",
                            borderRadius: "6px",
                            padding: "3px 12px",
                            fontSize: "11px",
                            color: "#555",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            border: "1px solid #E1E3E6",
                          }}
                        >
                          <span>🔒</span>
                          <span style={{ fontWeight: 500 }}>https://luxestore-diwali.myshopify.com</span>
                          <span style={{ color: "#999", marginLeft: "auto", cursor: "pointer" }}>↻</span>
                        </div>
                      </div>
                    )}

                    {/* ─── TABLET SENSOR BEZEL ──────────────────────────────────── */}
                    {viewport === "tablet" && (
                      <div style={{ background: "#2B2D42", height: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4A4D68", display: "inline-block" }} />
                      </div>
                    )}

                    {/* ─── MOBILE PHONE STATUS BAR & DYNAMIC ISLAND ─────────────── */}
                    {viewport === "mobile" && (
                      <div style={{ background: "#000000", color: "#FFFFFF", padding: "4px 16px 6px" }}>
                        <div
                          style={{
                            width: "84px",
                            height: "18px",
                            background: "#1E1E1E",
                            borderRadius: "10px",
                            margin: "0 auto 4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0D0D0D" }} />
                          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#222" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: 600 }}>
                          <span>9:41</span>
                          <div style={{ display: "flex", gap: "5px", fontSize: "10px" }}>
                            <span>5G</span>
                            <span>📶</span>
                            <span>🔋 100%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Announcement Bar */}
                    {!showOriginal && enableBanner && (
                      <div
                        style={{
                          background: "linear-gradient(90deg, #1A0A00 0%, #2A1502 50%, #1A0A00 100%)",
                          color: "#FFF8DC",
                          padding: viewport === "mobile" ? "6px 12px" : "8px 16px",
                          fontSize: viewport === "mobile" ? "11px" : "12px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bannerText}</span>
                        <span
                          style={{
                            background: "rgba(212, 175, 55, 0.2)",
                            border: "1px solid #D4AF37",
                            color: "#FFD700",
                            borderRadius: "10px",
                            padding: "1px 7px",
                            fontSize: "10px",
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
                      <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: "58px" }}>
                        <ToranPreviewWidget
                          festivalId={festival.id}
                          garlandStyle={garlandStyle}
                          withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"}
                          lightsTheme={seriesLightsTheme}
                          lightsMode={seriesLightsMode}
                        />
                      </div>
                    )}

                    {/* ─── AUTHENTIC STORE NAVIGATION ────────────────────────────── */}
                    <div
                      style={{
                        padding: viewport === "mobile" ? "12px 16px" : "14px 22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #EEEEEE",
                        position: "relative",
                        zIndex: 10,
                        background: "#FFFFFF",
                      }}
                    >
                      {/* Left side: Hamburger on Mobile, Logo on Desktop/Tablet */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {viewport === "mobile" && (
                          <span style={{ fontSize: "16px", cursor: "pointer", color: "#222" }}>☰</span>
                        )}
                        <div style={{ fontWeight: 800, fontSize: viewport === "mobile" ? "15px" : "18px", color: "#111", letterSpacing: "0.5px" }}>
                          {festival.emoji} LUXE STORE
                        </div>
                      </div>

                      {/* Desktop Horizontal Navigation Links */}
                      {viewport === "desktop" && (
                        <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#555", fontWeight: 500 }}>
                          <span style={{ color: "#000", fontWeight: 700, borderBottom: "2px solid #D4AF37", paddingBottom: "2px" }}>Home</span>
                          <span style={{ cursor: "pointer" }}>Festive Edit</span>
                          <span style={{ cursor: "pointer" }}>Diwali Specials</span>
                          <span style={{ cursor: "pointer" }}>Pooja Sets</span>
                          <span style={{ cursor: "pointer" }}>About Us</span>
                          <span style={{ cursor: "pointer" }}>Contact</span>
                        </div>
                      )}

                      {/* Tablet Compact Nav */}
                      {viewport === "tablet" && (
                        <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "#555", fontWeight: 500 }}>
                          <span style={{ color: "#000", fontWeight: 700 }}>Home</span>
                          <span>Festive Edit</span>
                          <span>Diwali Specials</span>
                          <span>Contact</span>
                        </div>
                      )}

                      {/* Right Icons: Search + Cart */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#333" }}>
                        {viewport === "desktop" && (
                          <div style={{ background: "#F4F5F7", borderRadius: "16px", padding: "4px 12px", fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>🔍</span>
                            <span>Search pooja decor...</span>
                          </div>
                        )}
                        {viewport !== "desktop" && <span>🔍</span>}
                        <span style={{ fontWeight: 600 }}>🛍️ (2)</span>
                      </div>
                    </div>

                    {/* Top Toran (if below_header - Doorway Threshold Docking) */}
                    {!showOriginal && enableEffects && garlandPlacement === "below_header" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
                      <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: "58px", marginTop: `${garlandOffset}px` }}>
                        <ToranPreviewWidget
                          festivalId={festival.id}
                          garlandStyle={garlandStyle}
                          withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"}
                          lightsTheme={seriesLightsTheme}
                          lightsMode={seriesLightsMode}
                        />
                      </div>
                    )}

                    {!showOriginal && enableEffects && (
                      <>
                        {/* 2. Side Garlands (Hidden on Mobile) */}
                        {viewport !== "mobile" && (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") && (
                          <>
                            <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "116px" : "60px", left: "6px", zIndex: 11, pointerEvents: "none" }}>
                              <SideGarlandPreviewWidget withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} />
                            </div>
                            <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "116px" : "60px", right: "6px", zIndex: 11, pointerEvents: "none" }}>
                              <SideGarlandPreviewWidget withLights={isDiwali && enableSeriesLights && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} />
                            </div>
                          </>
                        )}

                        {/* 3. Realistic Diya (Diwali Only) with Customizable Margins & Placements */}
                        {isDiwali && (viewport !== "mobile" || !diyaHideOnMobile) && (
                          <>
                            {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_left" || diyaPosition === "all_four") && (
                              <div style={{ position: "absolute", bottom: `${diyaMarginY}px`, left: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={viewport === "mobile" ? "small" : diyaSize} />
                              </div>
                            )}
                            {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_right" || diyaPosition === "all_four") && (
                              <div style={{ position: "absolute", bottom: `${diyaMarginY}px`, right: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={viewport === "mobile" ? "small" : diyaSize} />
                              </div>
                            )}
                            {(diyaPosition === "top_corners" || diyaPosition === "top_left" || diyaPosition === "all_four") && (
                              <div style={{ position: "absolute", top: `${diyaMarginY + 54}px`, left: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={viewport === "mobile" ? "small" : diyaSize} />
                              </div>
                            )}
                            {(diyaPosition === "top_corners" || diyaPosition === "top_right" || diyaPosition === "all_four") && (
                              <div style={{ position: "absolute", top: `${diyaMarginY + 54}px`, right: `${diyaMarginX}px`, zIndex: 15, pointerEvents: "none" }}>
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={viewport === "mobile" ? "small" : diyaSize} />
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* ─── RESPONSIVE STORE HERO ─────────────────────────────────── */}
                    <div
                      style={{
                        padding: viewport === "mobile" ? "28px 16px" : "44px 24px",
                        textAlign: "center",
                        background: "linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          background: "#E8F5E9",
                          color: "#2E7D32",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          marginBottom: "12px",
                        }}
                      >
                        FESTIVE SEASON EXCLUSIVE
                      </div>
                      <div
                        style={{
                          fontSize: viewport === "mobile" ? "22px" : viewport === "tablet" ? "26px" : "32px",
                          fontWeight: 800,
                          color: "#111",
                          marginBottom: "8px",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {festival.name} Collection
                      </div>
                      <div
                        style={{
                          fontSize: viewport === "mobile" ? "13px" : "14px",
                          color: "#666",
                          maxWidth: "420px",
                          margin: "0 auto 20px",
                          lineHeight: "1.5",
                        }}
                      >
                        Celebrate auspicious traditions with handcrafted artisanal home decor and festive apparel.
                      </div>
                      <button
                        style={{
                          background: "#111",
                          color: "#FFF",
                          padding: viewport === "mobile" ? "12px 24px" : "10px 28px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          width: viewport === "mobile" ? "100%" : "auto",
                        }}
                      >
                        Shop Now →
                      </button>
                    </div>

                    {/* ─── RESPONSIVE PRODUCT CATALOG FEED ──────────────────────── */}
                    <div
                      style={{
                        padding: viewport === "mobile" ? "16px" : "24px 22px",
                        display: "grid",
                        gridTemplateColumns: viewport === "mobile" ? "1fr 1fr" : viewport === "tablet" ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                        gap: viewport === "mobile" ? "10px" : "14px",
                      }}
                    >
                      {[
                        { title: "Brass Akhand Diya", price: "₹1,499", tag: "Bestseller" },
                        { title: "Marigold Toran", price: "₹899", tag: "Handmade" },
                        { title: "Pooja Thali Set", price: "₹2,199", tag: "Pure Brass" },
                        { title: "Mitti Diya (Set of 12)", price: "₹499", tag: "Terracotta" },
                      ]
                        .slice(0, viewport === "mobile" ? 2 : viewport === "tablet" ? 3 : 4)
                        .map((prod, i) => (
                          <div
                            key={i}
                            style={{
                              border: "1px solid #E8ECEF",
                              borderRadius: "8px",
                              padding: "12px",
                              background: "#FFFFFF",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                            }}
                          >
                            <div
                              style={{
                                height: viewport === "mobile" ? "80px" : "100px",
                                background: "linear-gradient(135deg, #F9F9FB 0%, #ECEFF1 100%)",
                                borderRadius: "6px",
                                marginBottom: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                              }}
                            >
                              {i === 0 ? "🪔" : i === 1 ? "🌿" : i === 2 ? "✨" : "🧱"}
                            </div>
                            <div style={{ fontSize: "10px", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
                              {prod.tag}
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {prod.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#777", marginTop: "2px", fontWeight: 500 }}>
                              {prod.price}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* ─── MOBILE HOME SWIPE INDICATOR BAR ───────────────────────── */}
                    {viewport === "mobile" && (
                      <div style={{ padding: "10px 0 6px", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "110px", height: "4px", background: "#333", borderRadius: "2px" }} />
                      </div>
                    )}
                  </div>
                </div>
              </BlockStack>
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

                    <Checkbox
                      label="Enable Storefront Visual Effects"
                      checked={enableEffects}
                      onChange={(val) => { setEnableEffects(val); markDirty(); }}
                    />

                    {enableEffects && (
                      <>
                        <Text variant="bodySm" fontWeight="bold">🌿 Toran Garland & Borders</Text>
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
                            { label: "🌿 Below Store Navigation (Recommended — No Menu Overlap)", value: "below_header" },
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

                        <TextField
                          label="Vertical Alignment Fine-Tuning (px)"
                          type="number"
                          value={String(garlandOffset)}
                          onChange={(val) => { setGarlandOffset(parseInt(val, 10) || 0); markDirty(); }}
                          helpText="Nudge the toran up or down in pixels (e.g. 0, -10, +15) to match your custom theme."
                          autoComplete="off"
                        />

                        {isDiwali && (
                          <>
                            <Divider />
                            <Text variant="bodySm" fontWeight="bold">💡 Series Lights (Diwali Only)</Text>
                            <Checkbox
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
                                    { label: "🌟 Royal Warm Gold (2700K)", value: "warm_gold" },
                                    { label: "🌈 Multi-Color Festive Jewels", value: "festive_multicolor" },
                                    { label: "🕯️ Deep Amber Radiance", value: "amber_radiance" },
                                    { label: "⚪ Moonlit Pearl White", value: "pearl_white" },
                                  ]}
                                  value={seriesLightsTheme}
                                  onChange={(val) => { setSeriesLightsTheme(val); markDirty(); }}
                                />
                                <Select
                                  label="Light Animation Mode"
                                  options={[
                                    { label: "⚡ Cascading Chaser Wave", value: "chaser" },
                                    { label: "✨ Gentle Twinkle & Shimmer", value: "twinkle" },
                                    { label: "💡 Steady Luminous Glow", value: "steady" },
                                  ]}
                                  value={seriesLightsMode}
                                  onChange={(val) => { setSeriesLightsMode(val); markDirty(); }}
                                />
                              </>
                            )}

                            <Divider />
                            <Text variant="bodySm" fontWeight="bold">🪔 Realistic Diya Engine</Text>
                            <Select
                              label="Artisanal Diya Style"
                              options={[
                                { label: "🏺 Royal Brass (राजसी पीतल)", value: "royal_brass" },
                                { label: "🧱 Earthen Terracotta (मिट्टी का दीया)", value: "terracotta_clay" },
                                { label: "🪓 Antique Copper (प्राचीन तांबा)", value: "antique_copper" },
                                { label: "📐 Minimal Contemporary (आधुनिक)", value: "minimal_contemporary" },
                                { label: "🌸 Marigold Urli (गेंदा फूल अर्ली)", value: "marigold_urli" },
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
                            <InlineGrid columns={2} gap="200">
                              <TextField
                                label="Horizontal Offset (px)"
                                type="number"
                                value={String(diyaMarginX)}
                                onChange={(val) => { setDiyaMarginX(parseInt(val, 10) || 0); markDirty(); }}
                                helpText="Distance from side edge"
                                autoComplete="off"
                              />
                              <TextField
                                label="Vertical Offset (px)"
                                type="number"
                                value={String(diyaMarginY)}
                                onChange={(val) => { setDiyaMarginY(parseInt(val, 10) || 0); markDirty(); }}
                                helpText="Distance from top/bottom"
                                autoComplete="off"
                              />
                            </InlineGrid>
                            <Checkbox
                              label="Hide Diyas on Mobile Screens (<480px)"
                              checked={diyaHideOnMobile}
                              onChange={(val) => { setDiyaHideOnMobile(val); markDirty(); }}
                              helpText="Prevents corner diyas from overlapping mobile sticky Add-to-Cart or chat buttons"
                            />

                            <Divider />
                            <Text variant="bodySm" fontWeight="bold">🎆 Fireworks Engine</Text>
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
                    <Checkbox
                      label="Show Announcement Bar on Storefront"
                      checked={enableBanner}
                      onChange={(val) => { setEnableBanner(val); markDirty(); }}
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
                    <Checkbox
                      label="Interactive Tap-to-Bless (Shopper Diya Blessing)"
                      checked={interactiveBlessing}
                      onChange={(val) => { setInteractiveBlessing(val); markDirty(); }}
                      helpText="Shoppers can tap corner diyas to receive auspicious greetings"
                    />
                    <Select
                      label="Festive Soundscape (Web Audio Synthesizer)"
                      options={[
                        { label: "🔇 Silent (100% Muted — Default)", value: "muted" },
                        { label: "🔔 Auspicious Temple Bells on Diya Tap", value: "temple_bells" },
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
                      ✓ Non-Blocking: Garlands and effects use pointer-events: none
                    </Text>
                    <Text variant="bodyXs" tone="success">
                      ✓ Mobile Optimization: Side garlands auto-suppressed under 640px
                    </Text>
                    <Text variant="bodyXs" tone="success">
                      ✓ Accessibility: prefers-reduced-motion stops animation loops
                    </Text>
                    <Text variant="bodyXs" tone="success">
                      ✓ Zero Layout Shifts: Fixed overlays do not push theme DOM
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
                    <Checkbox
                      label="Swap CSS Variables with Festival Colors"
                      checked={enableColorSwap}
                      onChange={(val) => { setEnableColorSwap(val); markDirty(); }}
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
