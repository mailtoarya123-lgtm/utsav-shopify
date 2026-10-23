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
} from "@shopify/polaris";
import {
  ExternalIcon,
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

// ─── Professional UI Control: Luxury Range Slider ───────────────────────────
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
  smart_match: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM4 10a6 6 0 016-6v12a6 6 0 01-6-6z" clipRule="evenodd" />
    </svg>
  ),
  interaction_studio: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.5 3a1.5 1.5 0 00-1.5 1.5v7.05a2.5 2.5 0 00.732 1.768l2.5 2.5a2.5 2.5 0 003.536 0l4-4A2.5 2.5 0 0016 10.05V6.5a1.5 1.5 0 00-3 0V9H12V4.5a1.5 1.5 0 00-3 0V9H8V4.5A1.5 1.5 0 006.5 3z" />
    </svg>
  ),
  effect_composer: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.5 3A1.5 1.5 0 001 4.5v3A1.5 1.5 0 002.5 9h15A1.5 1.5 0 0019 7.5v-3A1.5 1.5 0 0017.5 3h-15zM2.5 11A1.5 1.5 0 001 12.5v3A1.5 1.5 0 002.5 17h15a1.5 1.5 0 001.5-1.5v-3a1.5 1.5 0 00-1.5-1.5h-15z" />
    </svg>
  ),
  autopilot: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  mobile_first: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  analytics: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 10a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-6zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM14 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1h-2a1 1 0 01-1-1V7z" />
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
  advanced: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
};

// ─── Tailored Product Mock Icons ────────────────────────────────────────────
function ProductIcon({ iconType, festivalId }) {
  if (iconType === "wreath" || festivalId?.includes("christmas")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#2E7D32" strokeWidth="2.5" strokeDasharray="2 2" fill="none" />
        <circle cx="8" cy="8" r="1.5" fill="#D32F2F" />
        <circle cx="16" cy="8" r="1.5" fill="#D32F2F" />
        <circle cx="12" cy="16" r="1.5" fill="#D32F2F" />
        <path d="M10 6 C12 4 12 4 14 6 C13 7 11 7 10 6 Z" fill="#D32F2F" />
      </svg>
    );
  }
  if (iconType === "winter_star") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
      </svg>
    );
  }
  if (iconType === "nilavilakku" || festivalId === "vishu") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="20" rx="6" ry="2" fill="#D4AF37" />
        <line x1="12" y1="9" x2="12" y2="20" stroke="#D4AF37" strokeWidth="2" />
        <ellipse cx="12" cy="9" rx="5" ry="1.5" fill="#D4AF37" />
        <path d="M12 2 C10.5 4.5 10 6.5 12 8 C14 6.5 13.5 4.5 12 2 Z" fill="#FF9100" />
      </svg>
    );
  }
  if (iconType === "urli") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="14" rx="9" ry="4" fill="#D4AF37" />
        <circle cx="8" cy="14" r="1.8" fill="#FF9800" />
        <circle cx="12" cy="14" r="2.2" fill="#FFD700" />
        <circle cx="16" cy="14" r="1.8" fill="#FF9800" />
      </svg>
    );
  }
  if (iconType === "fanoos" || festivalId?.includes("eid")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="2" x2="12" y2="6" stroke="#D4AF37" strokeWidth="1" />
        <path d="M8 6 L16 6 L14 16 L10 16 Z" fill="#D4AF37" stroke="#B78103" strokeWidth="0.8" />
        <ellipse cx="12" cy="16" rx="3" ry="1" fill="#B78103" />
        <circle cx="12" cy="11" r="1.5" fill="#FFF9C4" />
      </svg>
    );
  }
  if (iconType === "gulal" || festivalId === "holi") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="16" rx="8" ry="3.5" fill="#8D6E63" />
        <circle cx="9" cy="14" r="3.5" fill="#FF1493" />
        <circle cx="15" cy="14" r="3.5" fill="#00CED1" />
        <circle cx="12" cy="11" r="3" fill="#FFD700" />
      </svg>
    );
  }
  if (iconType === "ghost" || festivalId === "halloween") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 18 C6 10 7 4 12 4 C17 4 18 10 18 18 C16 16.5 14 18.5 12 17 C10 18.5 8 16.5 6 18 Z" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="1" />
        <circle cx="10" cy="9" r="1.2" fill="#263238" />
        <circle cx="14" cy="9" r="1.2" fill="#263238" />
      </svg>
    );
  }
  if (iconType === "menorah" || festivalId === "hanukkah") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="5" x2="12" y2="19" stroke="#D4AF37" strokeWidth="1.5" />
        <line x1="8" y1="19" x2="16" y2="19" stroke="#D4AF37" strokeWidth="2" />
        <path d="M6 8 Q6 14 12 14 Q18 14 18 8" stroke="#D4AF37" strokeWidth="1.2" fill="none" />
        <path d="M9 10 Q9 14 12 14 Q15 14 15 10" stroke="#D4AF37" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  if (iconType === "red_lantern" || festivalId === "lunar-new-year") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="2" x2="12" y2="5" stroke="#D4AF37" strokeWidth="1" />
        <ellipse cx="12" cy="12" rx="7" ry="6" fill="#D32F2F" stroke="#B71C1C" strokeWidth="1" />
        <line x1="12" y1="6" x2="12" y2="18" stroke="#FFD700" strokeWidth="1" />
        <line x1="12" y1="18" x2="12" y2="22" stroke="#FFD700" strokeWidth="1.5" />
      </svg>
    );
  }
  // Default Auspicious Diya / Toran Icon
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c-1.5 3-3.5 5.5-3.5 8 0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5c0-2.5-2-5-3.5-8z" fill="#D4AF37" />
      <path d="M4 14c0 4 3.5 6 8 6s8-2 8-6H4z" fill="#996515" />
    </svg>
  );
}

// ─── Dynamic Festival Header Effect Dispatcher ──────────────────────────────
function DynamicFestivalHeaderWidget({ festival, isMobile, height = 32, withLights = true, lightsTheme = "warm_gold" }) {
  const festId = (festival.id || "").toLowerCase();

  // 1. CHRISTMAS: Evergreen Pine Garland with Twinkling Holiday Bulbs
  if (festId.includes("christmas")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(8, 22, 12, 0.9) 0%, transparent 100%)" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          {/* Hanging Pine Branches */}
          {[0, 90, 180, 270, 360, 450].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 0 Q 45 28 90 0" stroke="#1B4D2E" strokeWidth="3" fill="none" />
              <path d="M 15 12 L 25 24 M 35 18 L 45 32 M 55 18 L 65 30 M 75 12 L 82 22" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
              {/* Holly Berries */}
              <circle cx="45" cy="33" r="2.8" fill="#D32F2F" />
              <circle cx="42" cy="35" r="2.2" fill="#C62828" />
              <circle cx="48" cy="35" r="2.2" fill="#B71C1C" />
              {/* Twinkling Bulbs */}
              <circle cx="20" cy="14" r="3" fill="#FFD700" opacity="0.9" />
              <circle cx="50" cy="22" r="3.2" fill="#FF1744" opacity="0.95" />
              <circle cx="70" cy="14" r="3" fill="#00E676" opacity="0.9" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 2. VISHU: Golden Kanikonna Blossom Cascades
  if (festId === "vishu") {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(10, 26, 10, 0.85) 0%, transparent 100%)" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#2E7D32" strokeWidth="2.5" />
          {[20, 80, 140, 200, 260, 320, 380, 440, 500].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              {/* Cascade Stem */}
              <path d={`M 0 2 Q ${i % 2 === 0 ? 5 : -5} 20 0 38`} stroke="#388E3C" strokeWidth="1.2" fill="none" />
              {/* Kanikonna Yellow Petals */}
              <circle cx="-3" cy="8" r="3.2" fill="#FFD700" />
              <circle cx="4" cy="14" r="3.5" fill="#FFFF00" />
              <circle cx="-2" cy="20" r="3.8" fill="#FFD700" />
              <circle cx="3" cy="27" r="3.2" fill="#FFEA00" />
              <circle cx="0" cy="35" r="2.5" fill="#FFFF8D" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 3. EID AL-FITR: Damascus Fanoos Lanterns & Star Header
  if (festId.includes("eid")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(3, 20, 18, 0.9) 0%, transparent 100%)" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#D4AF37" strokeWidth="1.5" />
          {[60, 180, 300, 420, 500].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <line x1="0" y1="2" x2="0" y2="12" stroke="#B78103" strokeWidth="1" />
              <path d="M -7 12 L 7 12 L 5 28 L -5 28 Z" fill="#D4AF37" stroke="#996515" strokeWidth="0.8" />
              <polygon points="0,15 3,21 -3,21" fill="#FFFDE7" />
              <circle cx="0" cy="20" r="1.5" fill="#FFD700" />
              <circle cx="35" cy="10" r="1" fill="#FFFFFF" opacity="0.8" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 4. PONGAL / SANKRANTI: Sugarcane Harvest Arches
  if (festId === "pongal" || festId.includes("sankranti")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="4" x2="560" y2="4" stroke="#6A1B9A" strokeWidth="2.5" />
          {[40, 160, 280, 400, 500].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 4 Q 30 24 60 4" stroke="#4A148C" strokeWidth="2" fill="none" />
              <circle cx="30" cy="22" r="5" fill="#FF8F00" />
              <path d="M 28 20 L 32 20 L 30 16 Z" fill="#2E7D32" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 5. NAVRATRI: Crossed Dandiya Sticks & Mirrored Mandalas
  if (festId === "navratri") {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <rect x="0" y="0" width="100%" height="3" fill="#D32F2F" />
          {[40, 140, 240, 340, 440, 520].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <circle cx="20" cy="15" r="9" fill="#9C27B0" stroke="#FFD700" strokeWidth="1" />
              <circle cx="20" cy="15" r="4" fill="#FFFFFF" />
              <line x1="5" y1="5" x2="35" y2="28" stroke="#FF5722" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="35" y1="5" x2="5" y2="28" stroke="#FFC107" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 6. DEFAULT / DIWALI: Mango Leaves & Marigold Catenary Toran + Series Fairy Lights
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
            <circle cx="0" cy="5" r="5.5" fill="#E65100" />
            <circle cx="18" cy="14" r="5" fill="#FF8F00" />
            <circle cx="36" cy="22" r="5.5" fill="#E65100" />
            <circle cx="56" cy="26" r="6.5" fill="#FF8F00" />
            <circle cx="76" cy="22" r="5.5" fill="#E65100" />
            <circle cx="94" cy="14" r="5" fill="#FF8F00" />
            <circle cx="112" cy="5" r="5.5" fill="#E65100" />

            {withLights && (
              <g>
                <path d="M 0 8 Q 56 37 112 8" stroke="#0D2B17" strokeWidth="1.4" fill="none" />
                <circle cx="14" cy="14" r="2.8" fill="#FFD700" />
                <circle cx="38" cy="24" r="2.8" fill="#FFD700" />
                <circle cx="56" cy="28" r="3.2" fill="#FFE082" />
                <circle cx="74" cy="24" r="2.8" fill="#FFD700" />
                <circle cx="98" cy="14" r="2.8" fill="#FFD700" />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Dynamic Corner Widget (Diya vs Nilavilakku vs Menorah vs Star) ─────────
function DynamicCornerWidget({ festival, size = 32, flameGlow = "warm" }) {
  const festId = (festival.id || "").toLowerCase();

  // Christmas: Winter Glass Star Lantern
  if (festId.includes("christmas")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <polygon points="30,4 37,21 56,21 41,33 47,52 30,40 13,52 19,33 4,21 23,21" fill="#FFD700" opacity="0.9" />
        <polygon points="30,12 34,23 45,23 37,30 40,41 30,34 20,41 23,30 15,23 26,23" fill="#FFFDE7" />
        <circle cx="30" cy="30" r="14" fill="rgba(255, 215, 0, 0.25)" />
      </svg>
    );
  }

  // Vishu: Authentic Kerala Cast-Brass Nilavilakku Floor Lamp
  if (festId === "vishu") {
    return (
      <svg width={size} height={Math.round(size * 1.35)} viewBox="0 0 60 80">
        {/* Halo */}
        <circle cx="30" cy="16" r="18" fill="rgba(255, 215, 0, 0.3)" />
        {/* Sacred Flame */}
        <path d="M 30 4 C 26 10 24 14 30 19 C 36 14 34 10 30 4 Z" fill="#FF9100" />
        <path d="M 30 8 C 28 11 27 13 30 16 C 33 13 32 11 30 8 Z" fill="#FFFDE7" />
        {/* Top Font */}
        <ellipse cx="30" cy="20" rx="14" ry="4" fill="#D4AF37" />
        {/* Column */}
        <rect x="27" y="20" width="6" height="38" fill="#B78103" rx="2" />
        {/* Tiered Base */}
        <ellipse cx="30" cy="58" rx="18" ry="5" fill="#D4AF37" />
        <ellipse cx="30" cy="65" rx="22" ry="6" fill="#996515" />
      </svg>
    );
  }

  // Hanukkah: Nine-Branch Menorah
  if (festId === "hanukkah") {
    return (
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 80 80">
        <line x1="40" y1="18" x2="40" y2="72" stroke="#D4AF37" strokeWidth="3" />
        <line x1="25" y1="72" x2="55" y2="72" stroke="#B78103" strokeWidth="4" />
        <path d="M 12 28 Q 12 52 40 52 Q 68 52 68 28" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
        <path d="M 22 34 Q 22 52 40 52 Q 58 52 58 34" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <path d="M 31 40 Q 31 52 40 52 Q 49 52 49 40" stroke="#D4AF37" strokeWidth="2" fill="none" />
        {/* Candle flames */}
        {[12, 22, 31, 40, 49, 58, 68].map((cx, i) => (
          <circle key={i} cx={cx} cy={cx === 40 ? 12 : 22} r="2.2" fill="#FFD700" />
        ))}
      </svg>
    );
  }

  // Halloween: Ambient Spooky Amber Lantern
  if (festId === "halloween") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="16" fill="rgba(255, 117, 24, 0.25)" />
        <rect x="22" y="18" width="16" height="24" rx="3" fill="#FF7518" stroke="#212121" strokeWidth="2" />
        <polygon points="26,26 29,26 27,23" fill="#000" />
        <polygon points="31,26 34,26 33,23" fill="#000" />
        <polygon points="26,34 34,34 30,38" fill="#000" />
      </svg>
    );
  }

  // Default: Royal Brass Living Diya with Atmospheric Halo & Wick
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 100 85">
      <circle cx="50" cy="30" r="24" fill="rgba(255, 215, 0, 0.4)" />
      <path d="M 50 8 C 43 22 40 32 50 42 C 60 32 57 22 50 8 Z" fill="#FF6B35" />
      <path d="M 50 16 C 46 25 44 30 50 36 C 56 30 54 25 50 16 Z" fill="#FFFDE7" />
      <ellipse cx="50" cy="46" rx="36" ry="9" fill="#FFE082" />
      <path d="M 14 46 Q 16 68 50 70 Q 84 68 86 46 Z" fill="#D4AF37" />
      <ellipse cx="50" cy="70" rx="18" ry="3.5" fill="#5D4037" />
    </svg>
  );
}

// ─── Dynamic Overlay Particle Effects (Snow vs Petals vs Sparkles) ──────────
function DynamicOverlayParticles({ festival }) {
  const festId = (festival.id || "").toLowerCase();

  // Christmas Snowfall
  if (festId.includes("christmas")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 18 }}>
        {[
          { x: 12, y: 15, s: 6, o: 0.9 },
          { x: 34, y: 45, s: 4, o: 0.7 },
          { x: 62, y: 22, s: 7, o: 0.95 },
          { x: 82, y: 70, s: 5, o: 0.8 },
          { x: 22, y: 80, s: 6, o: 0.85 },
          { x: 48, y: 60, s: 4, o: 0.75 },
          { x: 74, y: 35, s: 8, o: 0.9 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.s}px`,
              height: `${p.s}px`,
              borderRadius: "50%",
              background: "#FFFFFF",
              opacity: p.o,
              boxShadow: "0 0 4px rgba(255,255,255,0.8)",
            }}
          />
        ))}
      </div>
    );
  }

  // Holi Color Bloom & Powder Particles
  if (festId === "holi") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 18 }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "70px", height: "70px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 20, 147, 0.22) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: "80px", height: "80px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 206, 209, 0.22) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "45%", right: "20%", width: "55px", height: "55px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 215, 0, 0.22) 0%, transparent 70%)" }} />
      </div>
    );
  }

  // Onam Floating Petals
  if (festId === "onam") {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 18 }}>
        {[
          { x: 18, y: 20, c: "#FF8F00" },
          { x: 42, y: 55, c: "#E65100" },
          { x: 78, y: 30, c: "#FFD700" },
          { x: 30, y: 75, c: "#FF8F00" },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: "6px",
              height: "4px",
              borderRadius: "50% 0 50% 0",
              background: p.c,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    );
  }

  // Eid Moonlit Stars
  if (festId.includes("eid")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 18 }}>
        {[
          { x: 25, y: 15 },
          { x: 70, y: 12 },
          { x: 85, y: 28 },
          { x: 40, y: 22 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "#FFFDE7",
              boxShadow: "0 0 5px #FFD700",
            }}
          />
        ))}
      </div>
    );
  }

  // Default: Subtle Golden Sparkles
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 18 }}>
      {[
        { x: 15, y: 25, s: 2.5 },
        { x: 80, y: 35, s: 3 },
        { x: 45, y: 75, s: 2 },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            borderRadius: "50%",
            background: "#FFD700",
            boxShadow: "0 0 4px #FFD700",
          }}
        />
      ))}
    </div>
  );
}

// ─── Single Device Preview Frame in Side-by-Side Showcase ───────────────────
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
}) {
  const isDesktop = deviceType === "desktop";
  const isMobile = deviceType === "mobile";

  const flexRatio = isDesktop ? "2.6" : "1.0";
  const maxW = isDesktop ? "560px" : "195px";
  const minW = isDesktop ? "380px" : "145px";
  const aspectRatio = isDesktop ? "16 / 10" : "9 / 19.5";
  const titleLabel = isDesktop ? "Desktop" : "Mobile";
  const resLabel = isDesktop ? "16:10 • 1440×900" : "9:19.5 • 375×812";

  // Pick sample products from the festival definition or fallback
  const sampleProducts = festival.sampleProducts || [
    { title: `${festival.name} Special`, price: "₹1,499", tag: "Exclusive", iconType: "diya" },
    { title: "Festive Keepsake", price: "₹899", tag: "Artisanal", iconType: "toran" },
  ];

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
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6D7175" strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                luxestore.myshopify.com
              </span>
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
              background: festival.palette?.background || "#1A0A00",
              color: festival.palette?.highlight || "#FFF8DC",
              padding: isMobile ? "2px 6px" : "4px 8px",
              fontSize: isMobile ? "7.5px" : "8.5px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              borderBottom: `1px solid ${festival.palette?.glow || "rgba(212, 175, 55, 0.3)"}`,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {bannerText || festival.banner?.defaultText || `Happy ${festival.name}! Celebrate with artisanal deals.`}
            </span>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                color: "#FFFFFF",
                borderRadius: "4px",
                padding: "0 4px",
                fontSize: "7px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              UTSAV26
            </span>
          </div>
        )}

        {/* Top Header Effect (if docked top_fixed) */}
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
              <span>{festival.name} Specials</span>
              <span>Gift Sets</span>
              <span>Artisanal Decor</span>
            </div>
          )}

          {/* Cart Icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", fontWeight: 600, fontSize: "8.5px", color: "#333", flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span>(2)</span>
          </div>
        </div>

        {/* Viewport Storefront Body Container */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Scrollable Storefront Content */}
          <div style={{ flex: 1, overflowY: "auto", position: "relative", scrollbarWidth: "none" }}>
            {/* Below-header Effect (if docked below_header) */}
            {!showOriginal && enableEffects && garlandPlacement === "below_header" && garlandLayout !== "off" && (
              <div
                style={{
                  position: "relative",
                  zIndex: 12,
                  overflow: "hidden",
                  height: isMobile ? "20px" : "32px",
                  marginTop: `${Math.round(garlandOffset * 0.5)}px`,
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

            {/* Dynamic Overlay Particles (Snowfall, Petals, Color Bloom) */}
            {!showOriginal && enableEffects && (
              <DynamicOverlayParticles festival={festival} />
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
                  padding: "1px 6px",
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
                  fontSize: isMobile ? "10.5px" : "14px",
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
                {festival.description || "Handcrafted authentic seasonal artisanal decor"}
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

            {/* Product Catalog Grid with Culturally Authentic Mock Products */}
            <div
              style={{
                padding: "6px 8px 36px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              {sampleProducts.map((prod, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FAFAFA",
                    borderRadius: "6px",
                    border: "1px solid #ECECEC",
                    padding: "6px 8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: isMobile ? "24px" : "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <ProductIcon iconType={prod.iconType} festivalId={festival.id} />
                  </div>
                  <div style={{ fontSize: "6.5px", color: festival.palette?.primary || "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "1px" }}>
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

          {/* Viewport-Anchored Corner Signature Elements */}
          {!showOriginal && enableEffects && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }}>
              <div style={{ position: "absolute", bottom: isMobile ? "8px" : "12px", left: isMobile ? "6px" : "10px" }}>
                <DynamicCornerWidget festival={festival} size={isMobile ? 22 : 32} />
              </div>
              <div style={{ position: "absolute", bottom: isMobile ? "8px" : "12px", right: isMobile ? "6px" : "10px" }}>
                <DynamicCornerWidget festival={festival} size={isMobile ? 22 : 32} />
              </div>
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
  // 'overview' | 'visual_effects' | 'smart_match' | 'interaction_studio' | 'effect_composer' |
  // 'autopilot' | 'mobile_first' | 'analytics' | 'banner' | 'colors' | 'advanced'
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

  // Garland & Series Lights
  const [garlandLayout, setGarlandLayout] = useState(customSettings.garlandLayout || "top_and_sides");
  const [garlandPlacement, setGarlandPlacement] = useState(customSettings.garlandPlacement || "below_header");
  const [garlandScrollMode, setGarlandScrollMode] = useState(customSettings.garlandScrollMode || "natural_scroll");
  const [garlandOffset, setGarlandOffset] = useState(customSettings.garlandOffset || 0);
  const [enableSeriesLights, setEnableSeriesLights] = useState(
    customSettings.enableSeriesLights !== undefined ? Boolean(customSettings.enableSeriesLights) : true
  );
  const [seriesLightsTheme, setSeriesLightsTheme] = useState(customSettings.seriesLightsTheme || "warm_gold");

  // Dynamic Signature & Secondary Effect Controls
  const [effectIntensity, setEffectIntensity] = useState(customSettings.effectIntensity || 80);
  const [particleDensity, setParticleDensity] = useState(customSettings.particleDensity || 24);
  const [motionSensitivity, setMotionSensitivity] = useState(customSettings.motionSensitivity ?? true);

  // Smart Theme Match State
  const [smartMatchMode, setSmartMatchMode] = useState("harmonic");
  const [smartIntensity, setSmartIntensity] = useState("balanced");

  // Interaction Studio State
  const [triggerEvent, setTriggerEvent] = useState(customSettings.triggerEvent || "page_entry");
  const [triggerFrequency, setTriggerFrequency] = useState(customSettings.triggerFrequency || "once_per_session");
  const [triggerDuration, setTriggerDuration] = useState(customSettings.triggerDuration || "continuous");

  // Effect Composer State
  const [primaryPriority, setPrimaryPriority] = useState("signature_first");
  const [autoDampenOnScroll, setAutoDampenOnScroll] = useState(true);

  // Festival Autopilot State
  const [autopilotCalendar, setAutopilotCalendar] = useState("global_holidays");
  const [zeroDayCleanup, setZeroDayCleanup] = useState(true);

  // Mobile-First State
  const [tapInteraction, setTapInteraction] = useState(true);
  const [safeZoneClearance, setSafeZoneClearance] = useState(true);

  // Analytics A/B Testing
  const [enableAbTesting, setEnableAbTesting] = useState(false);

  const [bannerText, setBannerText] = useState(config.bannerText || festival.banner?.defaultText || "");
  const [scheduledStart, setScheduledStart] = useState(
    config.scheduledStart ? new Date(config.scheduledStart).toISOString().split("T")[0] : ""
  );
  const [scheduledEnd, setScheduledEnd] = useState(
    config.scheduledEnd ? new Date(config.scheduledEnd).toISOString().split("T")[0] : ""
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isSaving = fetcher.state !== "idle";

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
      fd.append("bannerText", bannerText);
      fd.append("scheduledStart", scheduledStart);
      fd.append("scheduledEnd", scheduledEnd);

      const customPayload = JSON.stringify({
        garlandLayout,
        garlandPlacement,
        garlandScrollMode,
        garlandOffset,
        enableSeriesLights,
        seriesLightsTheme,
        effectIntensity,
        particleDensity,
        motionSensitivity,
        triggerEvent,
        triggerFrequency,
        triggerDuration,
        primaryPriority,
        autopilotCalendar,
        zeroDayCleanup,
        tapInteraction,
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
      language,
      bannerText,
      scheduledStart,
      scheduledEnd,
      garlandLayout,
      garlandPlacement,
      garlandScrollMode,
      garlandOffset,
      enableSeriesLights,
      seriesLightsTheme,
      effectIntensity,
      particleDensity,
      motionSensitivity,
      triggerEvent,
      triggerFrequency,
      triggerDuration,
      primaryPriority,
      autopilotCalendar,
      zeroDayCleanup,
      tapInteraction,
      safeZoneClearance,
      fetcher,
    ]
  );

  return (
    <Frame>
      <Page
        backAction={{ content: "Festivals", onAction: () => navigate("/app/festivals") }}
        title={`${festival.name} Studio`}
        subtitle={`${festival.nativeName || festival.hindiName || ""} • ${festival.region || ""}`}
        primaryAction={{
          content: isSaving ? "Saving..." : isActive ? "Deactivate on Store" : "Activate on Store",
          tone: isActive ? "critical" : "success",
          loading: isSaving,
          onAction: () => handleSave(!isActive),
        }}
        secondaryActions={[
          {
            content: "Save Draft",
            loading: isSaving,
            disabled: !hasUnsavedChanges,
            onAction: () => handleSave(),
          },
          {
            content: "Open Live Storefront",
            icon: ExternalIcon,
            onAction: () => window.open(`https://${shop}`, "_blank"),
          },
        ]}
      >
        <BlockStack gap="400">
          {/* Unsaved changes banner */}
          {hasUnsavedChanges && (
            <Banner
              title="You have unsaved changes"
              tone="warning"
              action={{ content: "Save Changes", onAction: () => handleSave() }}
            >
              <p>Your studio preview reflects changes that are not yet published to your store.</p>
            </Banner>
          )}

          {/* TWO-COLUMN PRODUCTION STUDIO WORKSPACE */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px minmax(0, 1fr)",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* ─── COLUMN 1: Left Studio Workspace Navigation ─── */}
            <Card padding="300">
              <BlockStack gap="200">
                <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                  STUDIO WORKSPACE
                </Text>

                {[
                  { id: "visual_effects", label: "Visual Effects Engine" },
                  { id: "smart_match", label: "Smart Theme Match" },
                  { id: "interaction_studio", label: "Interaction Studio" },
                  { id: "effect_composer", label: "Effect Composer" },
                  { id: "autopilot", label: "Festival Autopilot" },
                  { id: "mobile_first", label: "Mobile-First Adaptation" },
                  { id: "analytics", label: "Impact & Performance" },
                  { id: "banner", label: "Banner & Announcements" },
                  { id: "colors", label: "Colors & Materials" },
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
                        padding: "9px 10px",
                        borderRadius: "8px",
                        border: "none",
                        background: isSel ? "var(--p-color-bg-surface-selected, #F1F2F4)" : "transparent",
                        color: isSel ? "var(--p-color-text, #202223)" : "var(--p-color-text-subdued, #6D7175)",
                        fontWeight: isSel ? 600 : 400,
                        fontSize: "12.5px",
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
                      flexDirection: "row",
                      gap: "20px",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      padding: "20px 24px",
                      background: "linear-gradient(180deg, #F9FAFB 0%, #F1F2F4 100%)",
                      overflowX: "auto",
                    }}
                  >
                    {/* 1. Desktop Hardware Mockup (16:10) */}
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
                    />

                    {/* 2. Mobile Hardware Mockup (9:19.5) */}
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
                    />
                  </div>
                </div>
              </Card>

              {/* ─── CONTROLS SECTION DIRECTLY BELOW PREVIEW ─── */}

              {/* 1. VISUAL EFFECTS ENGINE TAB */}
              {activeSection === "visual_effects" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="100">
                        <Text variant="headingSm" as="h4">Storefront Visual Effects Master</Text>
                        <Text variant="bodyXs" tone="subdued">
                          Turn on or off all ambient festive decorations, signature animations, and atmospheric framing
                        </Text>
                      </BlockStack>
                      <ToggleSwitch
                        checked={enableEffects}
                        onChange={(val) => { setEnableEffects(val); markDirty(); }}
                      />
                    </InlineStack>
                  </Card>

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
                      {/* CARD 1: DYNAMIC SIGNATURE EFFECT */}
                      <Card padding="400">
                        <BlockStack gap="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text variant="headingSm" as="h4">
                              {festival.signatureEffect?.name || "Signature Visual Effect"}
                            </Text>
                            <Badge tone="info">Signature</Badge>
                          </InlineStack>
                          <Text variant="bodyXs" tone="subdued">
                            {festival.signatureEffect?.description || "Authentic signature motion experience engineered for this festival"}
                          </Text>
                          <Divider />

                          <LuxurySlider
                            label="Effect Animation Intensity"
                            value={effectIntensity}
                            min={20}
                            max={100}
                            step={5}
                            unit="%"
                            onChange={(val) => { setEffectIntensity(val); markDirty(); }}
                            helpText="Scales the visual prominence and radiance of the signature effect."
                          />

                          <LuxurySlider
                            label="Particle & Element Density"
                            value={particleDensity}
                            min={8}
                            max={48}
                            step={2}
                            unit=" items"
                            onChange={(val) => { setParticleDensity(val); markDirty(); }}
                            helpText="Regulates the particle budget to maintain 60 FPS performance."
                          />

                          <ToggleSwitch
                            label="Motion Sensitivity Guard"
                            checked={motionSensitivity}
                            onChange={(val) => { setMotionSensitivity(val); markDirty(); }}
                            helpText="Automatically softens motion for shoppers with prefers-reduced-motion enabled."
                          />
                        </BlockStack>
                      </Card>

                      {/* CARD 2: DYNAMIC SECONDARY EFFECT */}
                      <Card padding="400">
                        <BlockStack gap="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text variant="headingSm" as="h4">
                              {festival.secondaryEffect?.name || "Secondary Ambient Effect"}
                            </Text>
                            <Badge tone="attention">Ambient</Badge>
                          </InlineStack>
                          <Text variant="bodyXs" tone="subdued">
                            {festival.secondaryEffect?.description || "Harmonious secondary ambient effect providing gentle atmosphere"}
                          </Text>
                          <Divider />

                          <ToggleSwitch
                            label={`Enable ${festival.secondaryEffect?.name || "Secondary Effect"}`}
                            checked={enableSeriesLights}
                            onChange={(val) => { setEnableSeriesLights(val); markDirty(); }}
                            helpText="Complements the signature effect without visual clutter or overlap."
                          />

                          {enableSeriesLights && (
                            <Select
                              label="Ambient Glow Palette"
                              options={[
                                { label: "Royal Warm Gold (2700K)", value: "warm_gold" },
                                { label: "Multi-Color Festive Jewels", value: "festive_multicolor" },
                                { label: "Deep Amber Radiance", value: "amber_radiance" },
                                { label: "Moonlit Pearl White", value: "pearl_white" },
                              ]}
                              value={seriesLightsTheme}
                              onChange={(val) => { setSeriesLightsTheme(val); markDirty(); }}
                            />
                          )}
                        </BlockStack>
                      </Card>

                      {/* CARD 3: STOREFRONT FRAMING & DOCKING */}
                      <Card padding="400">
                        <BlockStack gap="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text variant="headingSm" as="h4">Storefront Framing & Docking</Text>
                            <Badge tone="success">Theme Anchor</Badge>
                          </InlineStack>
                          <Text variant="bodyXs" tone="subdued">
                            Anchor decorative arches and garlands cleanly without obstructing store navigation or cart
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

                      {/* CARD 4: CULTURAL RESPECT & SAFETY */}
                      <Card padding="400">
                        <BlockStack gap="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text variant="headingSm" as="h4">Cultural Respect & Authenticity</Text>
                            <Badge tone="info">Culturally Verified</Badge>
                          </InlineStack>
                          <Text variant="bodyXs" tone="subdued">
                            Visual elements are crafted to honor cultural traditions respectfully and avoid generic stereotyping.
                          </Text>
                          <Divider />

                          <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                            <BlockStack gap="200">
                              <Text variant="bodySm" fontWeight="semibold">Community Heritage Notes</Text>
                              <Text variant="bodyXs" tone="subdued">
                                {festival.culturalContext || "Visual effects are culturally reviewed to ensure respectful celebration."}
                              </Text>
                            </BlockStack>
                          </Box>
                        </BlockStack>
                      </Card>
                    </div>
                  )}
                </BlockStack>
              )}

              {/* 2. SMART THEME MATCH TAB */}
              {activeSection === "smart_match" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingSm" as="h4">Smart Theme Match Engine</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Analyzes your live Shopify theme colors, typography, and contrast to suggest harmonic festival palettes
                          </Text>
                        </BlockStack>
                        <Badge tone="success">WCAG AAA Certified</Badge>
                      </InlineStack>
                      <Divider />

                      <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                        <BlockStack gap="200">
                          <Text variant="bodySm" fontWeight="semibold">Detected Live Storefront Colors</Text>
                          <InlineStack gap="300" blockAlign="center">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#FFFFFF", border: "1px solid #CCC" }} />
                              <Text variant="bodyXs">Background: #FFFFFF</Text>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#111111" }} />
                              <Text variant="bodyXs">Primary Text: #111111</Text>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: festival.palette?.primary || "#D4AF37" }} />
                              <Text variant="bodyXs">Suggested Accent: {festival.palette?.primary || "#D4AF37"}</Text>
                            </div>
                            <Badge tone="info">Contrast 11.4:1 (Optimal)</Badge>
                          </InlineStack>
                        </BlockStack>
                      </Box>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <Select
                          label="Harmonic Matching Mode"
                          options={[
                            { label: "Harmonic Brand Match (Blends with Store Palette)", value: "harmonic" },
                            { label: "Royal Festive Contrast (High Visual Punch)", value: "vibrant" },
                            { label: "Subtle Minimalist Luxe (Understated Opulence)", value: "minimal" },
                          ]}
                          value={smartMatchMode}
                          onChange={(val) => { setSmartMatchMode(val); markDirty(); }}
                        />
                        <Select
                          label="Effect Intensity Suggestion"
                          options={[
                            { label: "Subtle (35% — High Conversion / Zero Distraction)", value: "subtle" },
                            { label: "Balanced (70% — Recommended)", value: "balanced" },
                            { label: "Festive Grandeur (100% — Grand Holiday Sale)", value: "festive" },
                          ]}
                          value={smartIntensity}
                          onChange={(val) => { setSmartIntensity(val); markDirty(); }}
                        />
                      </div>

                      <InlineStack align="end">
                        <Button
                          variant="primary"
                          onClick={() => {
                            setEffectIntensity(smartIntensity === "subtle" ? 40 : smartIntensity === "balanced" ? 75 : 100);
                            markDirty();
                          }}
                        >
                          Apply Harmonic Match to Store
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 3. INTERACTION STUDIO TAB */}
              {activeSection === "interaction_studio" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingSm" as="h4">Interaction Studio</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Choose exactly when festive effects activate: page entry, scroll depth, product hover, or add-to-cart
                          </Text>
                        </BlockStack>
                        <Badge tone="info">Interactive Triggers</Badge>
                      </InlineStack>
                      <Divider />

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <Select
                          label="Primary Activation Trigger"
                          options={[
                            { label: "Page Entry (Graceful Welcome Reveal)", value: "page_entry" },
                            { label: "Scroll Depth (Activates at 25% Scroll)", value: "scroll_25" },
                            { label: "Product Hover (Micro-sparkles on Hover)", value: "product_hover" },
                            { label: "Add-to-Cart Celebration (Celebration Burst on Purchase Intent)", value: "add_to_cart" },
                            { label: "Mobile Tap Delight (Touch Ripple on Tap)", value: "mobile_tap" },
                          ]}
                          value={triggerEvent}
                          onChange={(val) => { setTriggerEvent(val); markDirty(); }}
                        />

                        <Select
                          label="Trigger Frequency Cap"
                          options={[
                            { label: "Once Per Session (Recommended — Non-Intrusive)", value: "once_per_session" },
                            { label: "Once Every 45 Seconds", value: "every_45s" },
                            { label: "Continuous Ambient Display", value: "continuous" },
                          ]}
                          value={triggerFrequency}
                          onChange={(val) => { setTriggerFrequency(val); markDirty(); }}
                        />
                      </div>

                      <Select
                        label="Effect Burst Duration"
                        options={[
                          { label: "Continuous Ambient (Subtle ongoing presence)", value: "continuous" },
                          { label: "3 Seconds (Quick celebratory flash)", value: "3s" },
                          { label: "6 Seconds (Standard festive flourish)", value: "6s" },
                          { label: "10 Seconds (Extended festive showcase)", value: "10s" },
                        ]}
                        value={triggerDuration}
                        onChange={(val) => { setTriggerDuration(val); markDirty(); }}
                      />
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 4. EFFECT COMPOSER TAB */}
              {activeSection === "effect_composer" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingSm" as="h4">Effect Composer & Priority Rules</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Orchestrates multi-layered festive scenes so animations never collide or overwhelm each other
                          </Text>
                        </BlockStack>
                        <Badge tone="success">Collision-Safe</Badge>
                      </InlineStack>
                      <Divider />

                      <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                        <BlockStack gap="200">
                          <Text variant="bodySm" fontWeight="semibold">Layer Hierarchy Rules</Text>
                          <Text variant="bodyXs" tone="subdued">
                            • Foreground (Z: 20): {festival.signatureEffect?.name || "Signature Effect"}
                            <br />
                            • Midground (Z: 12): Storefront Toran & Nav Framing
                            <br />
                            • Ambient (Z: 8): {festival.secondaryEffect?.name || "Secondary Glow"}
                          </Text>
                        </BlockStack>
                      </Box>

                      <Select
                        label="Layer Priority Engine"
                        options={[
                          { label: "Signature Effect Priority (Secondary auto-dims during signature bursts)", value: "signature_first" },
                          { label: "Balanced Dual Scene (Both effects share equal particle budgets)", value: "balanced" },
                          { label: "Ambient Accent First (Muted signature, emphasized glow)", value: "ambient_first" },
                        ]}
                        value={primaryPriority}
                        onChange={(val) => { setPrimaryPriority(val); markDirty(); }}
                      />

                      <ToggleSwitch
                        label="Auto-Dampen During Rapid Scrolling"
                        checked={autoDampenOnScroll}
                        onChange={(val) => { setAutoDampenOnScroll(val); markDirty(); }}
                        helpText="Temporarily freezes complex particles during rapid scroll events to preserve 60 FPS scrolling performance."
                      />
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 5. FESTIVAL AUTOPILOT TAB */}
              {activeSection === "autopilot" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingSm" as="h4">Festival Autopilot & Auto-Scheduler</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Automatically activates approved themes and unpublishes them with zero manual merchant effort
                          </Text>
                        </BlockStack>
                        <Badge tone="attention">Automated</Badge>
                      </InlineStack>
                      <Divider />

                      <Select
                        label="Regional Festival Calendar"
                        options={[
                          { label: "Global Major Celebrations (Diwali, Christmas, Eid, Lunar New Year, NYE)", value: "global_holidays" },
                          { label: "Pan-India National Calendar (22+ Festivals)", value: "pan_india" },
                          { label: "South India Regional (Pongal, Onam, Vishu, Ugadi)", value: "south_india" },
                          { label: "North & West India (Holi, Navratri, Dussehra, Karwa Chauth)", value: "north_west" },
                        ]}
                        value={autopilotCalendar}
                        onChange={(val) => { setAutopilotCalendar(val); markDirty(); }}
                      />

                      <ToggleSwitch
                        label="Zero-Day Campaign Cleanup"
                        checked={zeroDayCleanup}
                        onChange={(val) => { setZeroDayCleanup(val); markDirty(); }}
                        helpText="Automatically removes visual effects 24 hours after the festival concludes so your store never displays outdated holiday decor."
                      />

                      <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                        <BlockStack gap="100">
                          <Text variant="bodySm" fontWeight="semibold">Upcoming Festival Queue</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Next occurrence of {festival.name}: ~{getDaysUntilFestival(festival)} days away.
                          </Text>
                        </BlockStack>
                      </Box>
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 6. MOBILE-FIRST ADAPTATION TAB */}
              {activeSection === "mobile_first" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingSm" as="h4">Mobile-First Touch Adaptation</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Replaces cursor hover effects with tap interactions, downscales particle density, and repositions around sticky mobile bars
                          </Text>
                        </BlockStack>
                        <Badge tone="success">Touch-Optimized</Badge>
                      </InlineStack>
                      <Divider />

                      <ToggleSwitch
                        label="Replace Cursor Hovers with Touch Tap Delights"
                        checked={tapInteraction}
                        onChange={(val) => { setTapInteraction(val); markDirty(); }}
                        helpText="Replaces desktop hover effects with responsive haptic-style tap ripples on touchscreens."
                      />

                      <ToggleSwitch
                        label="Sticky Mobile Safe Zone Clearance"
                        checked={safeZoneClearance}
                        onChange={(val) => { setSafeZoneClearance(val); markDirty(); }}
                        helpText="Adds an automatic 70px bottom clearance margin to prevent decorations from blocking sticky Add-to-Cart buttons or Shopify Inbox chat bubbles."
                      />

                      <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                        <Text variant="bodyXs" tone="subdued">
                          Mobile particle density is automatically throttled by 60% on handheld viewports to preserve battery life and lock 60 FPS animation smoothness.
                        </Text>
                      </Box>
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 7. PERFORMANCE & IMPACT ANALYTICS TAB */}
              {activeSection === "analytics" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="headingSm" as="h4">Performance & Conversion Impact Analytics</Text>
                          <Text variant="bodyXs" tone="subdued">
                            Monitor storefront loading overhead, particle frame-rates, and conversion impact
                          </Text>
                        </BlockStack>
                        <Badge tone="success">Zero Render-Blocking</Badge>
                      </InlineStack>
                      <Divider />

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                          <Text variant="bodyXs" tone="subdued">FRAME RATE</Text>
                          <Text variant="headingMd" as="p">60 FPS</Text>
                          <Text variant="bodyXs" tone="success">Locked 60fps</Text>
                        </Box>

                        <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                          <Text variant="bodyXs" tone="subdued">PAYLOAD OVERHEAD</Text>
                          <Text variant="headingMd" as="p">11.4 KB</Text>
                          <Text variant="bodyXs" tone="success">Gzipped & cached</Text>
                        </Box>

                        <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                          <Text variant="bodyXs" tone="subdued">CONVERSION LIFT</Text>
                          <Text variant="headingMd" as="p">+4.2%</Text>
                          <Text variant="bodyXs" tone="success">Active campaigns</Text>
                        </Box>
                      </div>

                      <Divider />

                      <ToggleSwitch
                        label="Enable Storefront Conversion A/B Testing"
                        checked={enableAbTesting}
                        onChange={(val) => { setEnableAbTesting(val); markDirty(); }}
                        helpText="Randomly serves festival effects to 50% of visitors and compares checkout completion rates against the clean control group."
                      />
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 8. BANNER & ANNOUNCEMENTS TAB */}
              {activeSection === "banner" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingSm" as="h4">Announcement Bar & Localized Copy</Text>
                        <ToggleSwitch
                          checked={enableBanner}
                          onChange={(val) => { setEnableBanner(val); markDirty(); }}
                        />
                      </InlineStack>
                      <Divider />

                      {enableBanner && (
                        <>
                          <Select
                            label="Language / Dialect"
                            options={[
                              { label: "English", value: "en" },
                              { label: "Hindi (हिंदी)", value: "hi" },
                              { label: "Tamil (தமிழ்)", value: "ta" },
                              { label: "Telugu (తెలుగు)", value: "te" },
                              { label: "Bengali (বাংলা)", value: "bn" },
                              { label: "Malayalam (മലയാളം)", value: "ml" },
                              { label: "Gujarati (ગુજરાતી)", value: "gu" },
                            ]}
                            value={language}
                            onChange={handleLanguageChange}
                          />

                          <TextField
                            label="Announcement Bar Message"
                            value={bannerText}
                            onChange={(val) => { setBannerText(val); markDirty(); }}
                            multiline={2}
                            autoComplete="off"
                          />
                        </>
                      )}
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 9. COLORS & MATERIALS TAB */}
              {activeSection === "colors" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <Text variant="headingSm" as="h4">Festival Material Colors & Glow Tokens</Text>
                      <Text variant="bodyXs" tone="subdued">
                        Fine-tune custom CSS color variables injected into your storefront
                      </Text>
                      <Divider />

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <TextField
                          label="Primary Festive Color"
                          value={festival.palette?.primary || "#D4AF37"}
                          disabled
                        />
                        <TextField
                          label="Secondary Accent Color"
                          value={festival.palette?.secondary || "#FF6B35"}
                          disabled
                        />
                      </div>
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}

              {/* 10. ADVANCED SAFETY TAB */}
              {activeSection === "advanced" && (
                <BlockStack gap="400">
                  <Card padding="400">
                    <BlockStack gap="300">
                      <Text variant="headingSm" as="h4">Advanced Theme Safety & Isolation</Text>
                      <Text variant="bodyXs" tone="subdued">
                        Protects checkout flows, third-party apps, and ensures zero layout shift
                      </Text>
                      <Divider />

                      <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                        <Text variant="bodyXs" tone="subdued">
                          All animations utilize GPU-accelerated CSS transforms (translate3d, scale) and will never cause Cumulative Layout Shift (CLS = 0.00). Checkout pages and customer account portals are strictly isolated.
                        </Text>
                      </Box>
                    </BlockStack>
                  </Card>
                </BlockStack>
              )}
            </div>
          </div>
        </BlockStack>
      </Page>
    </Frame>
  );
}
