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

  const bulbColor = lightsTheme === "festive_multicolor"
    ? ["#FF9100", "#FF1744", "#00E676", "#FFD700", "#00E5FF"]
    : lightsTheme === "amber_radiance"
    ? ["#FF8F00", "#FFA000", "#FF8F00", "#FF6D00", "#FFA000"]
    : lightsTheme === "pearl_white"
    ? ["#FFFFFF", "#FFFDE7", "#FFFFFF", "#FFFDE7", "#FFFFFF"]
    : ["#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700"];

  return (
    <svg width="100%" height="56" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="widgetKalawa" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D32F2F" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#D32F2F" />
        </linearGradient>
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

          {/* Series Lights */}
          {showLights && (
            <>
              <path d="M 0 8 Q 70 42 140 8" stroke="#FFE082" strokeWidth="1" fill="none" opacity="0.8" />
              {[
                { cx: 16, cy: 16, c: bulbColor[0] },
                { cx: 40, cy: 26, c: bulbColor[1 % bulbColor.length] },
                { cx: 70, cy: 30, c: bulbColor[2 % bulbColor.length] },
                { cx: 100, cy: 26, c: bulbColor[3 % bulbColor.length] },
                { cx: 124, cy: 16, c: bulbColor[4 % bulbColor.length] },
              ].map((b, bIdx) => (
                <g key={bIdx}>
                  <circle cx={b.cx} cy={b.cy} r="3" fill={b.c} />
                  <circle cx={b.cx} cy={b.cy} r="6.5" fill={b.c} opacity="0.35" />
                </g>
              ))}
            </>
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
  const sizePx = size === "small" ? 56 : size === "large" ? 95 : 74;
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
  const [seriesLightsTheme, setSeriesLightsTheme] = useState(customSettings.seriesLightsTheme || "warm_gold");
  const [seriesLightsMode, setSeriesLightsMode] = useState(customSettings.seriesLightsMode || "twinkle");

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
        seriesLightsTheme,
        seriesLightsMode,
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
      seriesLightsTheme,
      seriesLightsMode,
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
                    minHeight: "580px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: canvasWidth,
                      maxWidth: "100%",
                      background: "#FFFFFF",
                      borderRadius: viewport === "desktop" ? "4px" : "16px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "width 0.3s ease",
                      border: viewport === "mobile" ? "8px solid #2B2D42" : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Announcement Bar */}
                    {!showOriginal && enableBanner && (
                      <div
                        style={{
                          background: "linear-gradient(90deg, #1A0A00 0%, #2A1502 50%, #1A0A00 100%)",
                          color: "#FFF8DC",
                          padding: "8px 16px",
                          fontSize: "12px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
                        }}
                      >
                        <span>{bannerText}</span>
                        <span
                          style={{
                            background: "rgba(212, 175, 55, 0.2)",
                            border: "1px solid #D4AF37",
                            color: "#FFD700",
                            borderRadius: "10px",
                            padding: "1px 8px",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          UTSAV25
                        </span>
                      </div>
                    )}

                    {/* Top Toran (if top_fixed) */}
                    {!showOriginal && enableEffects && garlandPlacement === "top_fixed" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
                      <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: "56px" }}>
                        <ToranPreviewWidget
                          festivalId={festival.id}
                          garlandStyle={garlandStyle}
                          withLights={isDiwali && seriesLightsTheme !== "off"}
                          lightsTheme={seriesLightsTheme}
                          lightsMode={seriesLightsMode}
                        />
                      </div>
                    )}

                    {/* Simulated Store Navigation (100% Unobstructed) */}
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #EEEEEE",
                        position: "relative",
                        zIndex: 10,
                        background: "#FFFFFF",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: "18px", color: "#111" }}>
                        {festival.emoji} LUXE STORE
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#444", fontWeight: 500 }}>
                        <span style={{ color: "#000", fontWeight: 600 }}>Home</span>
                        <span>Catalog</span>
                        <span>Festive Edit</span>
                        <span>Contact</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", fontSize: "14px", color: "#333" }}>
                        <span>🔍</span>
                        <span>🛒 (2)</span>
                      </div>
                    </div>

                    {/* Top Toran (if below_header - Doorway Threshold Docking) */}
                    {!showOriginal && enableEffects && garlandPlacement === "below_header" && (garlandLayout === "top_and_sides" || garlandLayout === "top_only") && (
                      <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: "56px", marginTop: `${garlandOffset}px` }}>
                        <ToranPreviewWidget
                          festivalId={festival.id}
                          garlandStyle={garlandStyle}
                          withLights={isDiwali && seriesLightsTheme !== "off"}
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
                              <SideGarlandPreviewWidget withLights={isDiwali && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} />
                            </div>
                            <div style={{ position: "absolute", top: garlandPlacement === "below_header" ? "116px" : "60px", right: "6px", zIndex: 11, pointerEvents: "none" }}>
                              <SideGarlandPreviewWidget withLights={isDiwali && seriesLightsTheme !== "off"} lightsTheme={seriesLightsTheme} />
                            </div>
                          </>
                        )}

                        {/* 3. Realistic Diya (Diwali Only) */}
                        {isDiwali && (
                          <>
                            {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_left" || diyaPosition === "all_four") && (
                              <div style={{ position: "absolute", bottom: "14px", left: "18px", zIndex: 15 }}>
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={diyaSize} />
                              </div>
                            )}
                            {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_right" || diyaPosition === "all_four") && (
                              <div style={{ position: "absolute", bottom: "14px", right: "18px", zIndex: 15 }}>
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={diyaSize} />
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* Simulated Store Hero */}
                    <div
                      style={{
                        padding: "40px 24px",
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
                      <div style={{ fontSize: "28px", fontWeight: 800, color: "#111", marginBottom: "8px" }}>
                        {festival.name} Collection
                      </div>
                      <div style={{ fontSize: "14px", color: "#666", maxWidth: "400px", margin: "0 auto 20px" }}>
                        Celebrate auspicious traditions with handcrafted artisanal home decor and festive apparel.
                      </div>
                      <button
                        style={{
                          background: "#111",
                          color: "#FFF",
                          padding: "10px 24px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Shop Now →
                      </button>
                    </div>

                    {/* Product Cards Row */}
                    <div style={{ padding: "24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      {[
                        { title: "Brass Akhand Diya", price: "₹1,499" },
                        { title: "Handwoven Marigold Toran", price: "₹899" },
                      ].map((prod, i) => (
                        <div key={i} style={{ border: "1px solid #E0E0E0", borderRadius: "8px", padding: "12px" }}>
                          <div style={{ height: "90px", background: "#F0F0F0", borderRadius: "4px", marginBottom: "8px" }} />
                          <div style={{ fontSize: "12px", fontWeight: 600 }}>{prod.title}</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>{prod.price}</div>
                        </div>
                      ))}
                    </div>
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
                            <Select
                              label="Lights Glow Palette"
                              options={[
                                { label: "🌟 Royal Warm Gold (2700K)", value: "warm_gold" },
                                { label: "🌈 Multi-Color Festive Jewels", value: "festive_multicolor" },
                                { label: "🕯️ Deep Amber Radiance", value: "amber_radiance" },
                                { label: "⚪ Moonlit Pearl White", value: "pearl_white" },
                                { label: "🚫 Floral Only (No Lights)", value: "off" },
                              ]}
                              value={seriesLightsTheme}
                              onChange={(val) => { setSeriesLightsTheme(val); markDirty(); }}
                            />
                            <Select
                              label="Light Animation Mode"
                              options={[
                                { label: "✨ Gentle Twinkle & Shimmer", value: "twinkle" },
                                { label: "⚡ Cascading Chaser Wave", value: "chaser" },
                                { label: "💡 Steady Luminous Glow", value: "steady" },
                              ]}
                              value={seriesLightsMode}
                              onChange={(val) => { setSeriesLightsMode(val); markDirty(); }}
                            />

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
                              ]}
                              value={diyaSize}
                              onChange={(val) => { setDiyaSize(val); markDirty(); }}
                            />
                            <Select
                              label="Corner Placement"
                              options={[
                                { label: "Both Bottom Corners", value: "bottom_corners" },
                                { label: "Bottom-Right Corner Only", value: "bottom_right" },
                                { label: "Bottom-Left Corner Only", value: "bottom_left" },
                                { label: "Top Corners", value: "top_corners" },
                                { label: "All 4 Corners", value: "all_four" },
                              ]}
                              value={diyaPosition}
                              onChange={(val) => { setDiyaPosition(val); markDirty(); }}
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
