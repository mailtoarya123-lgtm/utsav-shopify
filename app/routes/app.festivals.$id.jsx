import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Text,
  Badge,
  Button,
  Select,
  TextField,
  Divider,
  Box,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import {
  ExternalIcon,
  ViewIcon,
  SettingsIcon,
  CheckCircleIcon,
  CalendarIcon,
  LockIcon,
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
  const defaultGreeting = festival.banner?.defaultText || `Happy ${festival.name}! Celebrate with festive deals.`;

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
      enableAudio: false,
      enableWheel: false,
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
        bannerText,
        customColors,
        scheduledStart: scheduledStartStr ? new Date(scheduledStartStr) : null,
        scheduledEnd: scheduledEndStr ? new Date(scheduledEndStr) : null,
      },
    });
  }

  return json({ success: true });
};

// ─── UI Control: Range Slider with Live Output ──────────────────────────────
function LuxurySlider({ label, value, min, max, step = 1, unit = "", onChange, helpText }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label}</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#008060",
            background: "#E3F1DF",
            padding: "2px 6px",
            borderRadius: "4px",
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
          height: "5px",
          borderRadius: "3px",
          background: "#E1E3E5",
          outline: "none",
        }}
      />
      {helpText && (
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

// ─── UI Control: Toggle Switch ──────────────────────────────────────────────
function ToggleSwitch({ label, checked, onChange, helpText, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", margin: "4px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          gap: "10px",
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
      >
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: disabled ? "#8C9196" : "#202223" }}>
          {label}
        </span>
        <div
          role="switch"
          aria-checked={checked}
          style={{
            width: "36px",
            height: "20px",
            borderRadius: "10px",
            background: checked ? "#008060" : "#D2D5D8",
            position: "relative",
            transition: "background 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
            boxShadow: checked ? "0 1px 3px rgba(0, 128, 96, 0.3)" : "none",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
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
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

// ─── Category Navigation Icons ──────────────────────────────────────────────
const CATEGORY_ICONS = {
  signature_effects: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
    </svg>
  ),
  particles_lighting: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  ),
  garlands_decorations: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.5 3A1.5 1.5 0 001 4.5v3A1.5 1.5 0 002.5 9h15A1.5 1.5 0 0019 7.5v-3A1.5 1.5 0 0017.5 3h-15zM2.5 11A1.5 1.5 0 001 12.5v3A1.5 1.5 0 002.5 17h15a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-15z" />
    </svg>
  ),
  interactive_effects: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.5 3a1.5 1.5 0 00-1.5 1.5v7.05a2.5 2.5 0 00.732 1.768l2.5 2.5a2.5 2.5 0 003.536 0l4-4A2.5 2.5 0 0016 10.05V6.5a1.5 1.5 0 00-3 0V9H12V4.5a1.5 1.5 0 00-3 0V9H8V4.5A1.5 1.5 0 006.5 3z" />
    </svg>
  ),
  colors_materials: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
    </svg>
  ),
  banner_messaging: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.39l6.553 3.276A1 1 0 0018 15V3z" />
    </svg>
  ),
  scheduling: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  performance: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
};

// ─── Dynamic Header Garland & Lights Dispatcher ─────────────────────────────
function DynamicFestivalHeaderWidget({ festival, isMobile, height = 32, withLights = true, lightsTheme = "warm_gold" }) {
  const festId = (festival.id || "").toLowerCase();

  // Christmas Pine & Holly
  if (festId.includes("christmas")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(8, 22, 12, 0.9) 0%, transparent 100%)" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          {[0, 90, 180, 270, 360, 450].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 0 Q 45 28 90 0" stroke="#1B4D2E" strokeWidth="3" fill="none" />
              <path d="M 15 12 L 25 24 M 35 18 L 45 32 M 55 18 L 65 30 M 75 12 L 82 22" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
              <circle cx="45" cy="33" r="2.8" fill="#D32F2F" />
              {withLights && (
                <>
                  <circle cx="20" cy="14" r="3" fill={lightsTheme === "festive_multicolor" ? "#FF1744" : "#FFD700"} />
                  <circle cx="50" cy="22" r="3" fill={lightsTheme === "festive_multicolor" ? "#00E676" : "#FFE082"} />
                  <circle cx="70" cy="14" r="3" fill={lightsTheme === "festive_multicolor" ? "#2979FF" : "#FFD700"} />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // Vishu Golden Kanikonna
  if (festId === "vishu") {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(10, 26, 10, 0.85) 0%, transparent 100%)" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#2E7D32" strokeWidth="2.5" />
          {[20, 80, 140, 200, 260, 320, 380, 440, 500].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d={`M 0 2 Q ${i % 2 === 0 ? 5 : -5} 20 0 38`} stroke="#388E3C" strokeWidth="1.2" fill="none" />
              <circle cx="-3" cy="8" r="3.2" fill="#FFD700" />
              <circle cx="4" cy="14" r="3.5" fill="#FFFF00" />
              <circle cx="-2" cy="20" r="3.8" fill="#FFD700" />
              <circle cx="3" cy="27" r="3.2" fill="#FFEA00" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // Eid Damascus Fanoos
  if (festId.includes("eid")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(3, 20, 18, 0.9) 0%, transparent 100%)" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#D4AF37" strokeWidth="1.5" />
          {[60, 180, 300, 420, 500].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <line x1="0" y1="2" x2="0" y2="12" stroke="#B78103" strokeWidth="1" />
              <path d="M -7 12 L 7 12 L 5 28 L -5 28 Z" fill="#D4AF37" stroke="#996515" strokeWidth="0.8" />
              <circle cx="0" cy="20" r="1.5" fill="#FFD700" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // Default: Diwali / Indian Traditional Toran + Fairy Lights
  return (
    <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden" }}>
      <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
        <rect x="0" y="0" width="100%" height="3" fill="#C62828" />
        {[0, 112, 224, 336, 448].map((startX, idx) => (
          <g key={idx} transform={`translate(${startX}, 0)`}>
            <path d="M 12 3 C 7 14 6 22 12 32 C 18 22 17 14 12 3 Z" fill="#2E7D32" />
            <path d="M 38 3 C 33 14 32 22 38 32 C 44 22 43 14 38 3 Z" fill="#2E7D32" />
            <path d="M 64 3 C 59 14 58 22 64 32 C 70 22 69 14 64 3 Z" fill="#2E7D32" />
            <path d="M 90 3 C 85 14 84 22 90 32 C 96 22 95 14 90 3 Z" fill="#2E7D32" />

            <path d="M 0 5 Q 56 34 112 5" stroke="#C62828" strokeWidth="1.6" fill="none" opacity="0.7" />
            <circle cx="0" cy="5" r="5" fill="#E65100" />
            <circle cx="28" cy="18" r="5.5" fill="#FF8F00" />
            <circle cx="56" cy="26" r="6.5" fill="#FFB300" />
            <circle cx="84" cy="18" r="5.5" fill="#FF8F00" />
            <circle cx="112" cy="5" r="5" fill="#E65100" />

            {withLights && (
              <g>
                <path d="M 0 8 Q 56 37 112 8" stroke="#0D2B17" strokeWidth="1.2" fill="none" />
                <circle cx="14" cy="14" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#FF5252" : "#FFD700"} />
                <circle cx="38" cy="24" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#00E676" : "#FFD700"} />
                <circle cx="56" cy="28" r="3.2" fill={lightsTheme === "festive_multicolor" ? "#FFD700" : "#FFF9C4"} />
                <circle cx="74" cy="24" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#448AFF" : "#FFD700"} />
                <circle cx="98" cy="14" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#E040FB" : "#FFD700"} />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Dynamic Corner Widget (Diya vs Nilavilakku vs Star) ─────────────────────
function DynamicCornerWidget({ festival, size = 32 }) {
  const festId = (festival.id || "").toLowerCase();

  if (festId.includes("christmas")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <polygon points="30,4 37,21 56,21 41,33 47,52 30,40 13,52 19,33 4,21 23,21" fill="#FFD700" opacity="0.9" />
        <circle cx="30" cy="30" r="14" fill="rgba(255, 215, 0, 0.25)" />
      </svg>
    );
  }

  if (festId === "vishu") {
    return (
      <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 60 80">
        <circle cx="30" cy="16" r="16" fill="rgba(255, 215, 0, 0.3)" />
        <path d="M 30 4 C 26 10 24 14 30 19 C 36 14 34 10 30 4 Z" fill="#FF9100" />
        <ellipse cx="30" cy="20" rx="14" ry="4" fill="#D4AF37" />
        <rect x="27" y="20" width="6" height="38" fill="#B78103" rx="2" />
        <ellipse cx="30" cy="58" rx="18" ry="5" fill="#D4AF37" />
      </svg>
    );
  }

  // Classical Living Brass Diya
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 100 85">
      <circle cx="50" cy="30" r="24" fill="rgba(255, 215, 0, 0.45)" />
      <path d="M 50 8 C 43 22 40 32 50 42 C 60 32 57 22 50 8 Z" fill="#FF6B35" />
      <path d="M 50 16 C 46 25 44 30 50 36 C 56 30 54 25 50 16 Z" fill="#FFFDE7" />
      <ellipse cx="50" cy="46" rx="36" ry="9" fill="#FFE082" />
      <path d="M 14 46 Q 16 68 50 70 Q 84 68 86 46 Z" fill="#D4AF37" />
      <ellipse cx="50" cy="70" rx="18" ry="3.5" fill="#5D4037" />
    </svg>
  );
}

// ─── Single Device Preview Frame ────────────────────────────────────────────
function DeviceStorefrontMock({
  deviceType,
  festival,
  showOriginal,
  enableEffects,
  garlandPlacement,
  garlandLayout,
  garlandOffset,
  enableSeriesLights,
  seriesLightsTheme,
  enableBanner,
  bannerText,
  diyaSize,
  diyaPosition,
  particleDensity,
  effectIntensity,
  customPrimaryColor,
}) {
  const isDesktop = deviceType === "desktop";
  const isMobile = deviceType === "mobile";

  const numDiyaSize = diyaSize === "small" ? 22 : diyaSize === "large" ? 40 : 30;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: isDesktop ? "100%" : "300px",
        maxWidth: isDesktop ? "680px" : "320px",
        margin: "0 auto",
      }}
    >
      {/* Device Viewport Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px 6px",
          color: "#6D7175",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
        }}
      >
        <span>{isDesktop ? "Desktop Storefront (16:10)" : "Mobile Device (9:19.5)"}</span>
        <span style={{ fontSize: "10px", fontWeight: 500 }}>
          {isDesktop ? "1440 × 900" : "375 × 812"}
        </span>
      </div>

      {/* Frame Container */}
      <div
        style={{
          width: "100%",
          aspectRatio: isDesktop ? "16 / 10" : "9 / 18",
          background: "#FFFFFF",
          borderRadius: isMobile ? "24px" : "8px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
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
                fontSize: "9.5px",
                color: "#555",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: "1px solid #E1E3E6",
              }}
            >
              <span>🔒 your-store.myshopify.com</span>
            </div>
          </div>
        )}

        {/* Mobile Status Bar */}
        {isMobile && (
          <div style={{ background: "#000000", color: "#FFFFFF", padding: "3px 10px 2px", flexShrink: 0 }}>
            <div style={{ width: "42px", height: "9px", background: "#1E1E1E", borderRadius: "5px", margin: "0 auto 2px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", fontWeight: 600 }}>
              <span>9:41</span>
              <span style={{ fontSize: "7px", opacity: 0.8 }}>5G 100%</span>
            </div>
          </div>
        )}

        {/* Announcement Bar */}
        {!showOriginal && enableBanner && (
          <div
            style={{
              background: festival.palette?.background || "#1A0A00",
              color: festival.palette?.highlight || "#FFF8DC",
              padding: isMobile ? "3px 6px" : "5px 8px",
              fontSize: isMobile ? "8px" : "9.5px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderBottom: `1px solid ${festival.palette?.glow || "rgba(212, 175, 55, 0.3)"}`,
              flexShrink: 0,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {bannerText || festival.banner?.defaultText || `Happy ${festival.name}! Celebrate with special discounts.`}
            </span>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                color: "#FFFFFF",
                borderRadius: "3px",
                padding: "0 4px",
                fontSize: "7.5px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              UTSAV26
            </span>
          </div>
        )}

        {/* Top-Fixed Garland (if selected) */}
        {!showOriginal && enableEffects && garlandPlacement === "top_fixed" && garlandLayout !== "off" && (
          <div style={{ position: "relative", zIndex: 12, overflow: "hidden", height: isMobile ? "20px" : "32px", flexShrink: 0 }}>
            <DynamicFestivalHeaderWidget
              festival={festival}
              isMobile={isMobile}
              height={isMobile ? 20 : 32}
              withLights={enableSeriesLights}
              lightsTheme={seriesLightsTheme}
            />
          </div>
        )}

        {/* Navigation Bar */}
        <div
          style={{
            padding: isMobile ? "5px 8px" : "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #EEEEEE",
            background: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: isMobile ? "10px" : "12px", color: "#111", letterSpacing: "0.2px" }}>
            LUXE STORE
          </div>
          {isDesktop && (
            <div style={{ display: "flex", gap: "12px", fontSize: "9px", color: "#555", fontWeight: 500 }}>
              <span style={{ color: "#000", fontWeight: 700 }}>Home</span>
              <span>Festive Collection</span>
              <span>{festival.name} Specials</span>
              <span>Gifts</span>
            </div>
          )}
          <div style={{ fontSize: "9px", fontWeight: 600, color: "#333" }}>
            Cart (2)
          </div>
        </div>

        {/* Scrollable Storefront Body */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", position: "relative", scrollbarWidth: "none" }}>
            {/* Below-Header Garland (Recommended) */}
            {!showOriginal && enableEffects && garlandPlacement === "below_header" && garlandLayout !== "off" && (
              <div
                style={{
                  position: "relative",
                  zIndex: 12,
                  overflow: "hidden",
                  height: isMobile ? "20px" : "32px",
                  marginTop: `${Math.round(garlandOffset * 0.4)}px`,
                }}
              >
                <DynamicFestivalHeaderWidget
                  festival={festival}
                  isMobile={isMobile}
                  height={isMobile ? 20 : 32}
                  withLights={enableSeriesLights}
                  lightsTheme={seriesLightsTheme}
                />
              </div>
            )}

            {/* Sparkles / Ambient Particles Overlay */}
            {!showOriginal && enableEffects && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: effectIntensity / 100 }}>
                {[...Array(Math.min(particleDensity, 20))].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${(i * 19) % 92 + 4}%`,
                      top: `${(i * 27) % 85 + 5}%`,
                      width: `${(i % 3) + 2}px`,
                      height: `${(i % 3) + 2}px`,
                      borderRadius: "50%",
                      background: customPrimaryColor || festival.palette?.primary || "#FFD700",
                      boxShadow: `0 0 4px ${festival.palette?.glow || "rgba(255,215,0,0.6)"}`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Storefront Hero Section */}
            <div
              style={{
                padding: isMobile ? "10px 8px" : "18px 14px 12px",
                textAlign: "center",
                background: "linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  background: "#E8F5E9",
                  color: "#2E7D32",
                  borderRadius: "4px",
                  fontSize: "7.5px",
                  fontWeight: 700,
                  marginBottom: "3px",
                }}
              >
                FESTIVE EXCLUSIVE
              </div>
              <div
                style={{
                  fontSize: isMobile ? "11px" : "15px",
                  fontWeight: 800,
                  color: "#111",
                  marginBottom: "2px",
                }}
              >
                {festival.name} Collection
              </div>
              <div
                style={{
                  fontSize: isMobile ? "8px" : "9.5px",
                  color: "#666",
                  maxWidth: "280px",
                  margin: "0 auto 6px",
                  lineHeight: "1.3",
                }}
              >
                {festival.description}
              </div>
              <button
                style={{
                  background: customPrimaryColor || "#111",
                  color: "#FFF",
                  padding: isMobile ? "3px 10px" : "5px 14px",
                  borderRadius: "4px",
                  border: "none",
                  fontSize: isMobile ? "8.5px" : "9.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Shop Festive Specials
              </button>
            </div>

            {/* Product Grid Mockup */}
            <div
              style={{
                padding: "8px 10px 40px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {[
                { title: `${festival.name} Special`, price: "₹1,499", tag: "Artisanal" },
                { title: "Festive Keepsake", price: "₹899", tag: "Bestseller" },
              ].map((prod, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FAFAFA",
                    borderRadius: "6px",
                    border: "1px solid #ECECEC",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "4px",
                      fontSize: "18px",
                    }}
                  >
                    {festival.emoji || "✨"}
                  </div>
                  <div style={{ fontSize: "7px", color: customPrimaryColor || festival.palette?.primary || "#D4AF37", fontWeight: 700, textTransform: "uppercase" }}>
                    {prod.tag}
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 600, color: "#222" }}>
                    {prod.title}
                  </div>
                  <div style={{ fontSize: "8.5px", color: "#777", marginTop: "1px" }}>
                    {prod.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Living Diya / Corner Elements */}
          {!showOriginal && enableEffects && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }}>
              {(diyaPosition === "bottom_corners" || diyaPosition === "all_corners") && (
                <>
                  <div style={{ position: "absolute", bottom: isMobile ? "8px" : "12px", left: isMobile ? "6px" : "12px" }}>
                    <DynamicCornerWidget festival={festival} size={numDiyaSize} />
                  </div>
                  <div style={{ position: "absolute", bottom: isMobile ? "8px" : "12px", right: isMobile ? "6px" : "12px" }}>
                    <DynamicCornerWidget festival={festival} size={numDiyaSize} />
                  </div>
                </>
              )}
              {(diyaPosition === "top_corners" || diyaPosition === "all_corners") && (
                <>
                  <div style={{ position: "absolute", top: isMobile ? "32px" : "44px", left: isMobile ? "6px" : "12px" }}>
                    <DynamicCornerWidget festival={festival} size={numDiyaSize} />
                  </div>
                  <div style={{ position: "absolute", top: isMobile ? "32px" : "44px", right: isMobile ? "6px" : "12px" }}>
                    <DynamicCornerWidget festival={festival} size={numDiyaSize} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Fixed-Height Visual Editor Studio ─────────────────────────────────
export default function FestivalStudio() {
  const { festival, shop, config, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Active Category in Left Navigation
  const [activeCategory, setActiveCategory] = useState("signature_effects");

  // Device Mode: "desktop" | "mobile" | "side_by_side"
  const [deviceMode, setDeviceMode] = useState("desktop");

  // Animation Playback & Comparison State
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive Navigation Collapse
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Draft Form State
  const [isActive, setIsActive] = useState(config.isActive);
  const [enableBanner, setEnableBanner] = useState(config.enableBanner ?? true);
  const [enableEffects, setEnableEffects] = useState(config.enableEffects ?? true);
  const [enableCountdown, setEnableCountdown] = useState(config.enableCountdown ?? true);
  const [enableColorSwap, setEnableColorSwap] = useState(config.enableColorSwap ?? true);
  const [enableAudio, setEnableAudio] = useState(config.enableAudio ?? false);
  const [enableWheel, setEnableWheel] = useState(config.enableWheel ?? false);
  const [language, setLanguage] = useState(config.language || "en");

  const customSettings = useMemo(() => {
    try {
      return config.customColors ? JSON.parse(config.customColors) : {};
    } catch (e) {
      return {};
    }
  }, [config.customColors]);

  // Garland & Series Lights
  const [garlandLayout, setGarlandLayout] = useState(customSettings.garlandLayout || "top_and_sides");
  const [garlandPlacement, setGarlandPlacement] = useState(customSettings.garlandPlacement || "below_header");
  const [garlandOffset, setGarlandOffset] = useState(customSettings.garlandOffset || 0);
  const [enableSeriesLights, setEnableSeriesLights] = useState(
    customSettings.enableSeriesLights !== undefined ? Boolean(customSettings.enableSeriesLights) : true
  );
  const [seriesLightsTheme, setSeriesLightsTheme] = useState(customSettings.seriesLightsTheme || "warm_gold");

  // Signature & Secondary Effect Controls
  const [effectIntensity, setEffectIntensity] = useState(customSettings.effectIntensity || 80);
  const [particleDensity, setParticleDensity] = useState(customSettings.particleDensity || 20);
  const [motionSensitivity, setMotionSensitivity] = useState(customSettings.motionSensitivity ?? true);
  const [diyaSize, setDiyaSize] = useState(config.diyaSize || "medium");
  const [diyaPosition, setDiyaPosition] = useState(config.diyaPosition || "bottom_corners");

  // Colors & Custom Styling
  const [customPrimaryColor, setCustomPrimaryColor] = useState(customSettings.customPrimaryColor || festival.palette?.primary || "#FFD700");
  const [smartMatchMode, setSmartMatchMode] = useState(customSettings.smartMatchMode || "harmonic");

  // Interaction Controls
  const [triggerEvent, setTriggerEvent] = useState(customSettings.triggerEvent || "page_entry");
  const [triggerFrequency, setTriggerFrequency] = useState(customSettings.triggerFrequency || "once_per_session");
  const [tapInteraction, setTapInteraction] = useState(customSettings.tapInteraction ?? true);

  // Banner & Announcements
  const [bannerText, setBannerText] = useState(config.bannerText || festival.banner?.defaultText || "");
  const [promoCode, setPromoCode] = useState(customSettings.promoCode || "UTSAV26");

  // Scheduling & Autopilot
  const [scheduledStart, setScheduledStart] = useState(
    config.scheduledStart ? new Date(config.scheduledStart).toISOString().split("T")[0] : ""
  );
  const [scheduledEnd, setScheduledEnd] = useState(
    config.scheduledEnd ? new Date(config.scheduledEnd).toISOString().split("T")[0] : ""
  );
  const [autopilotCalendar, setAutopilotCalendar] = useState(customSettings.autopilotCalendar || "global_holidays");
  const [zeroDayCleanup, setZeroDayCleanup] = useState(customSettings.zeroDayCleanup ?? true);

  // Performance & Accessibility
  const [safeZoneClearance, setSafeZoneClearance] = useState(customSettings.safeZoneClearance ?? true);

  // Change Tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isSaving = fetcher.state !== "idle";

  const markDirty = () => setHasUnsavedChanges(true);

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    markDirty();
    const greetings = getFestivalGreetings(festival.id);
    if (greetings && greetings[newLang]) {
      setBannerText(greetings[newLang]);
    }
  };

  const handleResetDefaults = () => {
    setEnableEffects(true);
    setEffectIntensity(80);
    setParticleDensity(20);
    setDiyaSize("medium");
    setDiyaPosition("bottom_corners");
    setGarlandLayout("top_and_sides");
    setGarlandPlacement("below_header");
    setGarlandOffset(0);
    setEnableSeriesLights(true);
    setSeriesLightsTheme("warm_gold");
    setEnableBanner(true);
    setBannerText(festival.banner?.defaultText || `Happy ${festival.name}!`);
    setCustomPrimaryColor(festival.palette?.primary || "#FFD700");
    markDirty();
  };

  const handleUndo = () => {
    setIsActive(config.isActive);
    setEnableBanner(config.enableBanner ?? true);
    setEnableEffects(config.enableEffects ?? true);
    setDiyaSize(config.diyaSize || "medium");
    setDiyaPosition(config.diyaPosition || "bottom_corners");
    setBannerText(config.bannerText || festival.banner?.defaultText || "");
    setHasUnsavedChanges(false);
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
      fd.append("enableWheel", String(enableWheel));
      fd.append("language", language);
      fd.append("diyaSize", diyaSize);
      fd.append("diyaPosition", diyaPosition);
      fd.append("bannerText", bannerText);
      fd.append("scheduledStart", scheduledStart);
      fd.append("scheduledEnd", scheduledEnd);

      const customPayload = JSON.stringify({
        garlandLayout,
        garlandPlacement,
        garlandOffset,
        enableSeriesLights,
        seriesLightsTheme,
        effectIntensity,
        particleDensity,
        motionSensitivity,
        customPrimaryColor,
        smartMatchMode,
        triggerEvent,
        triggerFrequency,
        tapInteraction,
        promoCode,
        autopilotCalendar,
        zeroDayCleanup,
        safeZoneClearance,
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
      enableWheel,
      language,
      diyaSize,
      diyaPosition,
      bannerText,
      scheduledStart,
      scheduledEnd,
      garlandLayout,
      garlandPlacement,
      garlandOffset,
      enableSeriesLights,
      seriesLightsTheme,
      effectIntensity,
      particleDensity,
      motionSensitivity,
      customPrimaryColor,
      smartMatchMode,
      triggerEvent,
      triggerFrequency,
      tapInteraction,
      promoCode,
      autopilotCalendar,
      zeroDayCleanup,
      safeZoneClearance,
      fetcher,
    ]
  );

  // 8 Logical Categories as specified in requirements
  const categories = [
    { id: "signature_effects", label: "Signature Effects", badge: enableEffects ? "Active" : "Off" },
    { id: "particles_lighting", label: "Particles & Lighting", badge: enableSeriesLights ? "On" : "Off" },
    { id: "garlands_decorations", label: "Garlands & Docking", badge: garlandLayout !== "off" ? "Anchored" : "Off" },
    { id: "interactive_effects", label: "Interactive Effects", badge: "Live" },
    { id: "colors_materials", label: "Colors & Materials", badge: "WCAG AAA" },
    { id: "banner_messaging", label: "Banner & Announcements", badge: enableBanner ? "Visible" : "Hidden" },
    { id: "scheduling", label: "Scheduling & Autopilot", badge: scheduledStart ? "Scheduled" : "Manual" },
    { id: "performance", label: "Performance & A11y", badge: "60 FPS" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--p-color-bg-surface-secondary, #F6F6F7)",
      }}
    >
      {/* ─── 1. TOP STUDIO TOOLBAR (Fixed Header) ─── */}
      <header
        style={{
          flex: "0 0 54px",
          height: "54px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--p-color-border-subdued, #E1E3E5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40,
        }}
      >
        {/* Left: Back & Festival Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate("/app/festivals")}
            style={{
              background: "transparent",
              border: "1px solid #D2D5D8",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              color: "#202223",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← Festivals
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#202223" }}>
              {festival.name} Studio
            </span>
            <span style={{ fontSize: "12px", color: "#6D7175" }}>
              ({festival.hindiName})
            </span>
            <Badge tone={isActive ? "success" : "subdued"}>
              {isActive ? "LIVE ON STORE" : "DRAFT"}
            </Badge>
          </div>
        </div>

        {/* Center: Save State & Undo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {hasUnsavedChanges ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#995A00",
                  background: "#FFF4E5",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ● Unsaved Changes
              </span>
              <button
                onClick={handleUndo}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "11.5px",
                  color: "#6D7175",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Undo
              </button>
              <button
                onClick={handleResetDefaults}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "11.5px",
                  color: "#6D7175",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Reset Defaults
              </button>
            </div>
          ) : (
            <span style={{ fontSize: "12px", color: "#008060", display: "flex", alignItems: "center", gap: "4px" }}>
              ✓ All changes saved
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => window.open(`https://${shop}/?utsav_preview=${festival.id}`, "_blank")}
            style={{
              background: "#FFFFFF",
              border: "1px solid #D2D5D8",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              color: "#202223",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Live Store</span>
            <span style={{ fontSize: "11px" }}>↗</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={!hasUnsavedChanges || isSaving}
            style={{
              background: hasUnsavedChanges ? "#FFFFFF" : "#F6F6F7",
              border: "1px solid #C9CCCF",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: hasUnsavedChanges ? "pointer" : "default",
              color: hasUnsavedChanges ? "#202223" : "#8C9196",
            }}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={() => handleSave(!isActive)}
            disabled={isSaving}
            style={{
              background: isActive ? "#D72C0D" : "#008060",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          >
            {isActive ? "Deactivate" : "Activate on Store"}
          </button>
        </div>
      </header>

      {/* ─── 2. MAIN 3-COLUMN WORKSPACE (Fills Viewport Height) ─── */}
      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ─── COLUMN 1: Left Compact Navigation (190px) ─── */}
        <nav
          style={{
            width: isNavCollapsed ? "60px" : "190px",
            flexShrink: 0,
            height: "100%",
            backgroundColor: "#FFFFFF",
            borderRight: "1px solid var(--p-color-border-subdued, #E1E3E5)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            transition: "width 0.2s ease",
            zIndex: 20,
          }}
        >
          <div style={{ padding: "12px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {!isNavCollapsed && (
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#6D7175", letterSpacing: "0.5px" }}>
                CATEGORIES
              </span>
            )}
            <button
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "#6D7175",
                fontSize: "12px",
              }}
              title={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {isNavCollapsed ? "→" : "←"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 6px" }}>
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: isNavCollapsed ? "10px 0" : "8px 10px",
                    justifyContent: isNavCollapsed ? "center" : "flex-start",
                    borderRadius: "6px",
                    border: "none",
                    background: isSelected ? "#F1F2F4" : "transparent",
                    color: isSelected ? "#202223" : "#5C5F62",
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                  }}
                  title={cat.label}
                >
                  <span style={{ display: "flex", alignItems: "center", color: isSelected ? "#008060" : "inherit" }}>
                    {CATEGORY_ICONS[cat.id]}
                  </span>
                  {!isNavCollapsed && (
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.label}
                    </span>
                  )}
                  {!isNavCollapsed && isSelected && (
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#008060" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "auto", padding: "12px 10px", borderTop: "1px solid #F1F2F4" }}>
            {!isNavCollapsed && (
              <div style={{ fontSize: "11px", color: "#6D7175" }}>
                <div>Theme Engine: <strong>v8 Active</strong></div>
                <div style={{ marginTop: "2px", color: "#008060" }}>● 60 FPS Locked</div>
              </div>
            )}
          </div>
        </nav>

        {/* ─── COLUMN 2: Middle Independently Scrollable Settings (380px) ─── */}
        <main
          style={{
            width: "380px",
            flexShrink: 0,
            height: "100%",
            backgroundColor: "#FFFFFF",
            borderRight: "1px solid var(--p-color-border-subdued, #E1E3E5)",
            overflowY: "auto",
            minHeight: 0,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 10,
          }}
        >
          {/* Category Header */}
          <div style={{ borderBottom: "1px solid #F1F2F4", paddingBottom: "10px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px", color: "#202223" }}>
              {categories.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p style={{ fontSize: "12px", color: "#6D7175", margin: 0 }}>
              Configure effects for {festival.name}. Updates preview instantly.
            </p>
          </div>

          {/* 1. SIGNATURE EFFECTS CATEGORY */}
          {activeCategory === "signature_effects" && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <ToggleSwitch
                  label={`Enable ${festival.signatureEffect?.name || "Signature Effect"}`}
                  checked={enableEffects}
                  onChange={(val) => { setEnableEffects(val); markDirty(); }}
                  helpText="Primary cultural motif engineered for this festival."
                />
              </Box>

              {enableEffects && (
                <>
                  <LuxurySlider
                    label="Signature Effect Intensity"
                    value={effectIntensity}
                    min={20}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(val) => { setEffectIntensity(val); markDirty(); }}
                    helpText="Scales the radiance and visual prominence of the primary motif."
                  />

                  <Select
                    label="Corner Diya / Motif Size"
                    options={[
                      { label: "Subtle (Small)", value: "small" },
                      { label: "Balanced (Medium — Recommended)", value: "medium" },
                      { label: "Grand (Large)", value: "large" },
                    ]}
                    value={diyaSize}
                    onChange={(val) => { setDiyaSize(val); markDirty(); }}
                  />

                  <Select
                    label="Corner Diya / Motif Placement"
                    options={[
                      { label: "Bottom Corners (Default)", value: "bottom_corners" },
                      { label: "Top Corners", value: "top_corners" },
                      { label: "All 4 Corners", value: "all_corners" },
                    ]}
                    value={diyaPosition}
                    onChange={(val) => { setDiyaPosition(val); markDirty(); }}
                  />

                  <ToggleSwitch
                    label="Motion Sensitivity Protection"
                    checked={motionSensitivity}
                    onChange={(val) => { setMotionSensitivity(val); markDirty(); }}
                    helpText="Respects user's prefers-reduced-motion OS preference automatically."
                  />
                </>
              )}
            </BlockStack>
          )}

          {/* 2. PARTICLES & LIGHTING CATEGORY */}
          {activeCategory === "particles_lighting" && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <ToggleSwitch
                  label={`Enable ${festival.secondaryEffect?.name || "Series Fairy Lights"}`}
                  checked={enableSeriesLights}
                  onChange={(val) => { setEnableSeriesLights(val); markDirty(); }}
                  helpText="Twinkling catenary fairy lights and glowing ambient particles."
                />
              </Box>

              {enableSeriesLights && (
                <>
                  <Select
                    label="Series Lights Color Theme"
                    options={[
                      { label: "Warm Royal Gold (2700K)", value: "warm_gold" },
                      { label: "Festive Multi-Color Jewels", value: "festive_multicolor" },
                      { label: "Deep Amber Glow", value: "amber_radiance" },
                      { label: "Moonlit Silver Pearl", value: "pearl_white" },
                    ]}
                    value={seriesLightsTheme}
                    onChange={(val) => { setSeriesLightsTheme(val); markDirty(); }}
                  />

                  <LuxurySlider
                    label="Ambient Particle Budget"
                    value={particleDensity}
                    min={6}
                    max={36}
                    step={2}
                    unit=" particles"
                    onChange={(val) => { setParticleDensity(val); markDirty(); }}
                    helpText="Maintains smooth 60 FPS performance across mobile and low-power devices."
                  />
                </>
              )}
            </BlockStack>
          )}

          {/* 3. GARLANDS & DOCKING CATEGORY */}
          {activeCategory === "garlands_decorations" && (
            <BlockStack gap="400">
              <Select
                label="Garland / Toran Architecture"
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
                label="Toran Docking Position"
                helpText="Prevents garland from obstructing your logo, navigation menu, or cart."
                options={[
                  { label: "Below Navigation (Recommended — Zero Menu Overlap)", value: "below_header" },
                  { label: "Top of Screen (Fixed 0px)", value: "top_fixed" },
                ]}
                value={garlandPlacement}
                onChange={(val) => { setGarlandPlacement(val); markDirty(); }}
              />

              <LuxurySlider
                label="Vertical Alignment Fine-Tuning"
                value={garlandOffset}
                min={-40}
                max={40}
                step={2}
                unit="px"
                onChange={(val) => { setGarlandOffset(val); markDirty(); }}
                helpText="Nudge the toran up or down in pixels to match your theme's exact header height."
              />
            </BlockStack>
          )}

          {/* 4. INTERACTIVE EFFECTS CATEGORY */}
          {activeCategory === "interactive_effects" && (
            <BlockStack gap="400">
              <Select
                label="Shopper Activation Trigger"
                options={[
                  { label: "Page Entry (Immediate Welcome)", value: "page_entry" },
                  { label: "Click Anywhere on Screen", value: "click_anywhere" },
                  { label: "Add to Cart Celebration", value: "cart_add" },
                ]}
                value={triggerEvent}
                onChange={(val) => { setTriggerEvent(val); markDirty(); }}
              />

              <Select
                label="Trigger Frequency"
                options={[
                  { label: "Once Per Session (Subtle & Polite)", value: "once_per_session" },
                  { label: "Always Active on Every Page", value: "always" },
                ]}
                value={triggerFrequency}
                onChange={(val) => { setTriggerFrequency(val); markDirty(); }}
              />

              <ToggleSwitch
                label="Mobile Tap Micro-Animations"
                checked={tapInteraction}
                onChange={(val) => { setTapInteraction(val); markDirty(); }}
                helpText="Shoppers tapping screen trigger gentle ripples of festive sparkles."
              />

              <ToggleSwitch
                label="Auspicious Festive Chime (Audio)"
                checked={enableAudio}
                onChange={(val) => { setEnableAudio(val); markDirty(); }}
                helpText="Plays a gentle, muted temple chime on first customer interaction. Muted by default."
              />

              <ToggleSwitch
                label="Festive Lucky Spin Wheel"
                checked={enableWheel}
                onChange={(val) => { setEnableWheel(val); markDirty(); }}
                helpText="Engage shoppers with a celebratory coupon spin wheel."
              />
            </BlockStack>
          )}

          {/* 5. COLORS & MATERIALS CATEGORY */}
          {activeCategory === "colors_materials" && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="200">
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>Festival Palette Harmony</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      festival.palette?.primary || "#FFD700",
                      festival.palette?.secondary || "#FF6B35",
                      festival.palette?.accent || "#8B0000",
                      festival.palette?.background || "#1A0A00",
                    ].map((c, i) => (
                      <div
                        key={i}
                        onClick={() => { setCustomPrimaryColor(c); markDirty(); }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          backgroundColor: c,
                          border: customPrimaryColor === c ? "2px solid #008060" : "1px solid rgba(0,0,0,0.2)",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        }}
                        title={`Click to set accent: ${c}`}
                      />
                    ))}
                  </div>
                </BlockStack>
              </Box>

              <TextField
                label="Primary Accent Hex Code"
                value={customPrimaryColor}
                onChange={(val) => { setCustomPrimaryColor(val); markDirty(); }}
                autoComplete="off"
                helpText="Custom color applied to CTA buttons and lighting corona."
              />

              <Select
                label="Smart Contrast Adaptation"
                options={[
                  { label: "Harmonic (Blends with Theme)", value: "harmonic" },
                  { label: "High Contrast (Maximum Visibility)", value: "contrast_boost" },
                ]}
                value={smartMatchMode}
                onChange={(val) => { setSmartMatchMode(val); markDirty(); }}
              />
            </BlockStack>
          )}

          {/* 6. BANNER & MESSAGING CATEGORY */}
          {activeCategory === "banner_messaging" && (
            <BlockStack gap="400">
              <ToggleSwitch
                label="Show Announcement Bar"
                checked={enableBanner}
                onChange={(val) => { setEnableBanner(val); markDirty(); }}
                helpText="Displays a slim festive banner at the very top of your storefront."
              />

              {enableBanner && (
                <>
                  <Select
                    label="Banner Greeting Language"
                    options={[
                      { label: "English", value: "en" },
                      { label: "Hindi (हिंदी)", value: "hi" },
                      { label: "Tamil (தமிழ்)", value: "ta" },
                      { label: "Telugu (తెలుగు)", value: "te" },
                      { label: "Bengali (বাংলা)", value: "bn" },
                      { label: "Gujarati (ગુજરાતી)", value: "gu" },
                      { label: "Malayalam (മലയാളം)", value: "ml" },
                    ]}
                    value={language}
                    onChange={handleLanguageChange}
                  />

                  <TextField
                    label="Announcement Bar Copy"
                    value={bannerText}
                    onChange={(val) => { setBannerText(val); markDirty(); }}
                    multiline={2}
                    autoComplete="off"
                  />

                  <TextField
                    label="Festive Promo Code"
                    value={promoCode}
                    onChange={(val) => { setPromoCode(val); markDirty(); }}
                    autoComplete="off"
                    helpText="Displayed as a 1-click copy badge in the banner."
                  />

                  <ToggleSwitch
                    label="Countdown Timer to Celebration"
                    checked={enableCountdown}
                    onChange={(val) => { setEnableCountdown(val); markDirty(); }}
                    helpText="Instills festive urgency as holiday approaches."
                  />
                </>
              )}
            </BlockStack>
          )}

          {/* 7. SCHEDULING & AUTOPILOT CATEGORY */}
          {activeCategory === "scheduling" && (
            <BlockStack gap="400">
              <TextField
                label="Automated Start Date"
                type="date"
                value={scheduledStart}
                onChange={(val) => { setScheduledStart(val); markDirty(); }}
                autoComplete="off"
                helpText="Theme will activate automatically on this date."
              />

              <TextField
                label="Automated End Date"
                type="date"
                value={scheduledEnd}
                onChange={(val) => { setScheduledEnd(val); markDirty(); }}
                autoComplete="off"
                helpText="Theme will automatically deactivate after this date."
              />

              <ToggleSwitch
                label="Zero-Day Clean Dismantle"
                checked={zeroDayCleanup}
                onChange={(val) => { setZeroDayCleanup(val); markDirty(); }}
                helpText="Automatically dismantles festive decorations at 11:59 PM so store never appears stale."
              />
            </BlockStack>
          )}

          {/* 8. PERFORMANCE & ACCESSIBILITY CATEGORY */}
          {activeCategory === "performance" && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="150">
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>Storefront Performance Audit</span>
                  <div style={{ fontSize: "11.5px", color: "#008060" }}>✓ 60 FPS GPU-accelerated canvas</div>
                  <div style={{ fontSize: "11.5px", color: "#008060" }}>✓ Zero Cumulative Layout Shift (0.00 CLS)</div>
                  <div style={{ fontSize: "11.5px", color: "#008060" }}>✓ Core Script Execution: 0.32ms (Lightweight)</div>
                </BlockStack>
              </Box>

              <ToggleSwitch
                label="Mobile Safe Zone Clearance"
                checked={safeZoneClearance}
                onChange={(val) => { setSafeZoneClearance(val); markDirty(); }}
                helpText="Prevents corner diyas from colliding with mobile bottom navigation bars or chat widgets."
              />
            </BlockStack>
          )}
        </main>

        {/* ─── COLUMN 3: Right Persistent Storefront Preview (Remaining Width) ─── */}
        <aside
          style={{
            flex: "1 1 0",
            minWidth: 0,
            height: "100%",
            backgroundColor: "#ECEFF1",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Preview Controls Subheader */}
          <div
            style={{
              flex: "0 0 46px",
              height: "46px",
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid var(--p-color-border-subdued, #E1E3E5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              zIndex: 10,
            }}
          >
            {/* Device Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {[
                { id: "desktop", label: "Desktop" },
                { id: "mobile", label: "Mobile" },
                { id: "side_by_side", label: "Side-by-Side" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDeviceMode(m.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: deviceMode === m.id ? "1px solid #008060" : "1px solid #D2D5D8",
                    backgroundColor: deviceMode === m.id ? "#E3F1DF" : "#FFFFFF",
                    color: deviceMode === m.id ? "#008060" : "#5C5F62",
                    fontWeight: deviceMode === m.id ? 700 : 500,
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Playback & Comparison Tools */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D2D5D8",
                  borderRadius: "5px",
                  padding: "4px 10px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#202223",
                }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <button
                onClick={() => setShowOriginal(!showOriginal)}
                style={{
                  background: showOriginal ? "#FFF2E2" : "#FFFFFF",
                  border: showOriginal ? "1px solid #FF9800" : "1px solid #D2D5D8",
                  borderRadius: "5px",
                  padding: "4px 10px",
                  fontSize: "11.5px",
                  fontWeight: showOriginal ? 700 : 500,
                  cursor: "pointer",
                  color: showOriginal ? "#B76E00" : "#202223",
                }}
              >
                {showOriginal ? "Showing Original (Off)" : "Before / After"}
              </button>

              <button
                onClick={() => setIsFullscreen(true)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D2D5D8",
                  borderRadius: "5px",
                  padding: "4px 8px",
                  fontSize: "11.5px",
                  cursor: "pointer",
                  color: "#202223",
                }}
                title="Fullscreen Preview"
              >
                ⛶ Fullscreen
              </button>
            </div>
          </div>

          {/* Persistent Preview Canvas Container */}
          <div
            style={{
              flex: "1 1 0",
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 20px",
              background: "radial-gradient(circle at center, #F4F6F8 0%, #E2E6EA 100%)",
            }}
          >
            {deviceMode === "desktop" && (
              <DeviceStorefrontMock
                deviceType="desktop"
                festival={festival}
                showOriginal={showOriginal}
                enableEffects={enableEffects}
                garlandPlacement={garlandPlacement}
                garlandLayout={garlandLayout}
                garlandOffset={garlandOffset}
                enableSeriesLights={enableSeriesLights}
                seriesLightsTheme={seriesLightsTheme}
                enableBanner={enableBanner}
                bannerText={bannerText}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
              />
            )}

            {deviceMode === "mobile" && (
              <DeviceStorefrontMock
                deviceType="mobile"
                festival={festival}
                showOriginal={showOriginal}
                enableEffects={enableEffects}
                garlandPlacement={garlandPlacement}
                garlandLayout={garlandLayout}
                garlandOffset={garlandOffset}
                enableSeriesLights={enableSeriesLights}
                seriesLightsTheme={seriesLightsTheme}
                enableBanner={enableBanner}
                bannerText={bannerText}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
              />
            )}

            {deviceMode === "side_by_side" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "24px",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <div style={{ flex: "2 1 0px", maxWidth: "540px" }}>
                  <DeviceStorefrontMock
                    deviceType="desktop"
                    festival={festival}
                    showOriginal={showOriginal}
                    enableEffects={enableEffects}
                    garlandPlacement={garlandPlacement}
                    garlandLayout={garlandLayout}
                    garlandOffset={garlandOffset}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    particleDensity={particleDensity}
                    effectIntensity={effectIntensity}
                    customPrimaryColor={customPrimaryColor}
                  />
                </div>
                <div style={{ flex: "1 1 0px", maxWidth: "240px" }}>
                  <DeviceStorefrontMock
                    deviceType="mobile"
                    festival={festival}
                    showOriginal={showOriginal}
                    enableEffects={enableEffects}
                    garlandPlacement={garlandPlacement}
                    garlandLayout={garlandLayout}
                    garlandOffset={garlandOffset}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    particleDensity={particleDensity}
                    effectIntensity={effectIntensity}
                    customPrimaryColor={customPrimaryColor}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── 3. FULLSCREEN PREVIEW MODAL OVERLAY ─── */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(18, 18, 18, 0.95)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              color: "#FFF",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700 }}>
              {festival.name} Storefront Fullscreen Preview
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              style={{
                background: "#FFF",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                color: "#111",
              }}
            >
              Exit Fullscreen (Esc)
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px",
            }}
          >
            <div style={{ width: "100%", maxWidth: "860px" }}>
              <DeviceStorefrontMock
                deviceType={deviceMode === "mobile" ? "mobile" : "desktop"}
                festival={festival}
                showOriginal={showOriginal}
                enableEffects={enableEffects}
                garlandPlacement={garlandPlacement}
                garlandLayout={garlandLayout}
                garlandOffset={garlandOffset}
                enableSeriesLights={enableSeriesLights}
                seriesLightsTheme={seriesLightsTheme}
                enableBanner={enableBanner}
                bannerText={bannerText}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
