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
  const { admin, session } = await authenticate.admin(request);
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

  let storeInfo = {
    name: "utsav",
    domain: shop,
  };
  let storeProducts = [];

  try {
    const shopRes = await admin.graphql(`
      #graphql
      query GetShopAndProducts {
        shop {
          name
        }
        products(first: 6) {
          edges {
            node {
              id
              title
              featuredImage {
                url
              }
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `);
    const shopData = await shopRes.json();
    if (shopData?.data?.shop?.name) {
      storeInfo.name = shopData.data.shop.name;
    }
    if (shopData?.data?.products?.edges?.length) {
      storeProducts = shopData.data.products.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        image: node.featuredImage?.url,
        price: node.priceRangeV2?.minVariantPrice
          ? `${node.priceRangeV2.minVariantPrice.currencyCode === "INR" ? "₹" : "$"}${Number(node.priceRangeV2.minVariantPrice.amount).toFixed(2)}`
          : "$885.00",
      }));
    }
  } catch (err) {
    // Graceful fallback to user Dawn theme defaults
  }

  return json({
    festival,
    shop,
    storeInfo,
    storeProducts,
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
        where: {
          shop: { contains: shop.split(".")[0] },
          festivalId: { not: festivalId },
        },
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
  // New Merchant-Friendly Categories
  visual_decor: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-5 8a5 5 0 019.9-1H16a6 6 0 11-12 0h1.1A5 5 0 015 10z" />
    </svg>
  ),
  floating_effects: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  ),
  discounts_offers: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 000-1.414l-7-7A1 1 0 0010 0.586H3a2 2 0 00-2 2v7a1 1 0 00.293.707l7 7a1 1 0 001.414 0l8-8zm-12.414-5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    </svg>
  ),
  urgency_timers: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  banner_announcements: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.39l6.553 3.276A1 1 0 0018 15V3z" />
    </svg>
  ),
  theme_colors: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
    </svg>
  ),
  dates_schedule: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  store_settings: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
    </svg>
  ),
  // Legacy aliases
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

// ─── Dynamic Festival Terminology Adapter ───────────────────────────────────
export function getFestivalTerminology(festivalId = "") {
  const fest = (festivalId || "").toLowerCase();

  // 1. Halloween
  if (fest.includes("halloween")) {
    return {
      headerCategory: "Header Framing",
      headerBadge: "Spiderweb Lace",
      headerArchitectureLabel: "Spiderweb Lace Architecture",
      headerArchitectureOptions: [
        { label: "Top Spiderweb & Side Web Cascades", value: "top_and_sides" },
        { label: "Top Spiderweb Only (Header Arch)", value: "top_only" },
        { label: "Side Cascades Only (Screen Margins)", value: "sides_only" },
        { label: "Off (No Web Framing)", value: "off" },
      ],
      dockingPositionLabel: "Web Docking Position",
      dockingHelp: "Prevents spiderwebs from obstructing your logo, navigation menu, or cart.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Jack-o'-Lantern",
      cornerSizeLabel: "Corner Jack-o'-Lantern Size",
      cornerPlacementLabel: "Corner Jack-o'-Lantern Placement",
      secondaryToggleLabel: "Enable Soft Eerie Glow & Mist",
      secondaryToggleHelp: "Atmospheric amber candlelight flicker and subtle misty twilight luminescence.",
      lightsThemeLabel: "Eerie Lighting Palette",
      lightsThemeOptions: [
        { label: "Spooky Amber Candlelight (Warm)", value: "amber_radiance" },
        { label: "Mystic Violet Glow", value: "mystic_purple" },
        { label: "Phantom Emerald Slime", value: "phantom_green" },
        { label: "Moonlit Silver Fog", value: "pearl_white" },
      ],
      particleLabel: "Spectral Particle Budget",
      particleHelp: "Controls ghost silhouette and floating ember density at smooth 60 FPS.",
      audioLabel: "Atmospheric Chime / Eerie Soundscape",
      audioHelp: "Plays a gentle, subtle atmospheric chime on shopper interaction. Muted by default.",
      safeZoneHelp: "Prevents corner Jack-o'-Lanterns from colliding with mobile bottom navigation bars or chat widgets.",
    };
  }

  // 2. Christmas
  if (fest.includes("christmas")) {
    return {
      headerCategory: "Holiday Garlands",
      headerBadge: "Pine & Holly",
      headerArchitectureLabel: "Evergreen Garland Architecture",
      headerArchitectureOptions: [
        { label: "Top Pine Garland & Side Cascades", value: "top_and_sides" },
        { label: "Top Pine Garland Only (Header Arch)", value: "top_only" },
        { label: "Side Pine Swags Only", value: "sides_only" },
        { label: "Off (No Garland)", value: "off" },
      ],
      dockingPositionLabel: "Garland Docking Position",
      dockingHelp: "Prevents pine garland from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Holiday Star",
      cornerSizeLabel: "Corner Star / Wreath Size",
      cornerPlacementLabel: "Corner Star / Wreath Placement",
      secondaryToggleLabel: "Enable Twinkling Holiday Lights",
      secondaryToggleHelp: "Twinkling Christmas tree bulbs and gentle falling snowfall.",
      lightsThemeLabel: "Holiday Lights Color Theme",
      lightsThemeOptions: [
        { label: "Festive Multi-Color Jewels", value: "festive_multicolor" },
        { label: "Warm Gold Fairylight (2700K)", value: "warm_gold" },
        { label: "Winter Snowflake White", value: "pearl_white" },
      ],
      particleLabel: "Snowfall Flake Budget",
      particleHelp: "Maintains smooth 60 FPS performance while snowflakes drift.",
      audioLabel: "Jingle Bell Greeting (Audio)",
      audioHelp: "Gentle holiday chime on first customer interaction. Muted by default.",
      safeZoneHelp: "Prevents holiday corner stars from colliding with mobile bottom navigation or chat widgets.",
    };
  }

  // 3. Valentine's Day
  if (fest.includes("valentines")) {
    return {
      headerCategory: "Header Ribbons",
      headerBadge: "Satin Swag",
      headerArchitectureLabel: "Ribbon Swag Architecture",
      headerArchitectureOptions: [
        { label: "Top Ribbon Swags & Side Streamers", value: "top_and_sides" },
        { label: "Top Ribbon Swags Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Ribbons)", value: "off" },
      ],
      dockingPositionLabel: "Ribbon Docking Position",
      dockingHelp: "Prevents ribbons from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Glowing Heart",
      cornerSizeLabel: "Corner Heart Motif Size",
      cornerPlacementLabel: "Corner Heart Motif Placement",
      secondaryToggleLabel: "Enable Ribbon Reveal & Petals",
      secondaryToggleHelp: "Floating heart bokeh, rose petals, and romantic luminescence.",
      lightsThemeLabel: "Romance Palette",
      lightsThemeOptions: [
        { label: "Rose Gold & Ruby", value: "festive_multicolor" },
        { label: "Warm Candlelit Gold", value: "warm_gold" },
        { label: "Pastel Pink Blossom", value: "amber_radiance" },
      ],
      particleLabel: "Floating Petal Budget",
      particleHelp: "Controls drifting rose petals and heart bokeh particles at 60 FPS.",
      audioLabel: "Soft Harp Chord (Audio)",
      audioHelp: "Gentle romantic acoustic chord on interaction.",
      safeZoneHelp: "Prevents corner heart motifs from colliding with mobile navigation.",
    };
  }

  // 4. Lunar New Year
  if (fest.includes("lunar") || fest.includes("chinese")) {
    return {
      headerCategory: "Lantern Strings",
      headerBadge: "Red Lanterns",
      headerArchitectureLabel: "Lantern String Architecture",
      headerArchitectureOptions: [
        { label: "Top Lantern String & Side Tassels", value: "top_and_sides" },
        { label: "Top Lantern String Only", value: "top_only" },
        { label: "Side Tassels Only", value: "sides_only" },
        { label: "Off (No Lanterns)", value: "off" },
      ],
      dockingPositionLabel: "Lantern Docking Position",
      dockingHelp: "Prevents lanterns from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Red Silk Lantern",
      cornerSizeLabel: "Corner Red Lantern Size",
      cornerPlacementLabel: "Corner Red Lantern Placement",
      secondaryToggleLabel: "Enable Golden Sparkles & Coin Drift",
      secondaryToggleHelp: "Auspicious gold coins and red lantern sway animation.",
      lightsThemeLabel: "Auspicious Palette",
      lightsThemeOptions: [
        { label: "Imperial Gold & Vermilion", value: "warm_gold" },
        { label: "Ruby Red Glow", value: "festive_multicolor" },
      ],
      particleLabel: "Golden Sparkle Budget",
      particleHelp: "Controls golden particle count at 60 FPS.",
      audioLabel: "Festive Gong / Guzheng Chord (Audio)",
      audioHelp: "Plays gentle celebratory acoustic chime.",
      safeZoneHelp: "Prevents corner red lanterns from colliding with mobile navigation.",
    };
  }

  // 5. Eid al-Fitr
  if (fest.includes("eid")) {
    return {
      headerCategory: "Fanoos Lanterns",
      headerBadge: "Damascus Swag",
      headerArchitectureLabel: "Lantern Swag Architecture",
      headerArchitectureOptions: [
        { label: "Top Fanoos Swag & Side Garlands", value: "top_and_sides" },
        { label: "Top Fanoos Swag Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Lanterns)", value: "off" },
      ],
      dockingPositionLabel: "Lantern Docking Position",
      dockingHelp: "Prevents lanterns from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Damascus Fanoos",
      cornerSizeLabel: "Corner Fanoos Lantern Size",
      cornerPlacementLabel: "Corner Fanoos Lantern Placement",
      secondaryToggleLabel: "Enable Moonlit Illumination",
      secondaryToggleHelp: "Silver star shimmer and ambient moonlit glow.",
      lightsThemeLabel: "Moonlit Illumination Theme",
      lightsThemeOptions: [
        { label: "Moonlit Silver Pearl", value: "pearl_white" },
        { label: "Warm Damascus Gold", value: "warm_gold" },
        { label: "Emerald Oasis Glow", value: "festive_multicolor" },
      ],
      particleLabel: "Star Shimmer Budget",
      particleHelp: "Controls celestial sparkle density at 60 FPS.",
      audioLabel: "Oud Melody / Chime (Audio)",
      audioHelp: "Gentle acoustic chime on first customer interaction.",
      safeZoneHelp: "Prevents corner Fanoos lanterns from colliding with mobile navigation.",
    };
  }

  // 6. Vishu
  if (fest === "vishu") {
    return {
      headerCategory: "Kanikonna Cascades",
      headerBadge: "Golden Blossoms",
      headerArchitectureLabel: "Blossom Garland Architecture",
      headerArchitectureOptions: [
        { label: "Top Kanikonna & Side Cascades", value: "top_and_sides" },
        { label: "Top Kanikonna Arch Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Blossoms)", value: "off" },
      ],
      dockingPositionLabel: "Blossom Docking Position",
      dockingHelp: "Prevents blossoms from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Nilavilakku Lamp",
      cornerSizeLabel: "Corner Nilavilakku Size",
      cornerPlacementLabel: "Corner Nilavilakku Placement",
      secondaryToggleLabel: "Enable Vishu Kani Glow",
      secondaryToggleHelp: "Golden blossom particles and ceremonial oil lamp radiance.",
      lightsThemeLabel: "Blossom Radiance Theme",
      lightsThemeOptions: [
        { label: "Warm Golden Yellow", value: "warm_gold" },
        { label: "Deep Amber Radiance", value: "amber_radiance" },
      ],
      particleLabel: "Blossom Petal Budget",
      particleHelp: "Controls falling golden blossom petals at 60 FPS.",
      audioLabel: "Auspicious Temple Bell (Audio)",
      audioHelp: "Plays gentle bronze bell chime on first interaction.",
      safeZoneHelp: "Prevents corner Nilavilakku lamps from colliding with mobile navigation.",
    };
  }

  // 7. Thanksgiving
  if (fest.includes("thanksgiving")) {
    return {
      headerCategory: "Autumn Foliage",
      headerBadge: "Maple Garland",
      headerArchitectureLabel: "Autumn Foliage Architecture",
      headerArchitectureOptions: [
        { label: "Top Foliage & Side Leaf Cascades", value: "top_and_sides" },
        { label: "Top Foliage Arch Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Foliage)", value: "off" },
      ],
      dockingPositionLabel: "Foliage Docking Position",
      dockingHelp: "Prevents foliage from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Harvest Pumpkin",
      cornerSizeLabel: "Corner Harvest Pumpkin Size",
      cornerPlacementLabel: "Corner Harvest Pumpkin Placement",
      secondaryToggleLabel: "Enable Warm Ambient Lighting",
      secondaryToggleHelp: "Warm golden twilight glow and drifting autumn leaves.",
      lightsThemeLabel: "Harvest Palette",
      lightsThemeOptions: [
        { label: "Deep Amber Radiance", value: "amber_radiance" },
        { label: "Warm Golden Hearth", value: "warm_gold" },
      ],
      particleLabel: "Drifting Leaf Budget",
      particleHelp: "Controls falling autumn leaf density at 60 FPS.",
      audioLabel: "Hearth Chime (Audio)",
      audioHelp: "Plays gentle acoustic tone on shopper interaction.",
      safeZoneHelp: "Prevents corner harvest pumpkins from colliding with mobile navigation.",
    };
  }

  // 8. Hanukkah
  if (fest.includes("hanukkah")) {
    return {
      headerCategory: "Header Bunting",
      headerBadge: "Silver & Blue",
      headerArchitectureLabel: "Bunting Architecture",
      headerArchitectureOptions: [
        { label: "Top Bunting & Side Swags", value: "top_and_sides" },
        { label: "Top Bunting Only", value: "top_only" },
        { label: "Side Swags Only", value: "sides_only" },
        { label: "Off (No Bunting)", value: "off" },
      ],
      dockingPositionLabel: "Bunting Docking Position",
      dockingHelp: "Prevents bunting from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Menorah",
      cornerSizeLabel: "Corner Menorah Size",
      cornerPlacementLabel: "Corner Menorah Placement",
      secondaryToggleLabel: "Enable Candlelight Atmosphere",
      secondaryToggleHelp: "Nine-candle Menorah flicker and subtle sapphire light shimmer.",
      lightsThemeLabel: "Festival of Lights Theme",
      lightsThemeOptions: [
        { label: "Sapphire & Silver Shimmer", value: "pearl_white" },
        { label: "Golden Candlelight (2700K)", value: "warm_gold" },
      ],
      particleLabel: "Candle Sparkle Budget",
      particleHelp: "Controls subtle shimmering light particle budget.",
      audioLabel: "Gentle Chime (Audio)",
      audioHelp: "Subtle celebratory chime on interaction.",
      safeZoneHelp: "Prevents corner menorah from colliding with mobile navigation.",
    };
  }

  // 9. Holi
  if (fest.includes("holi")) {
    return {
      headerCategory: "Festive Bunting",
      headerBadge: "Color Swags",
      headerArchitectureLabel: "Color Swag Architecture",
      headerArchitectureOptions: [
        { label: "Top Color Bunting & Side Pom-Poms", value: "top_and_sides" },
        { label: "Top Bunting Only", value: "top_only" },
        { label: "Side Swags Only", value: "sides_only" },
        { label: "Off (No Bunting)", value: "off" },
      ],
      dockingPositionLabel: "Bunting Docking Position",
      dockingHelp: "Prevents colorful swags from obstructing your store header.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Pichkari & Gulal Bowl",
      cornerSizeLabel: "Corner Pichkari / Bowl Size",
      cornerPlacementLabel: "Corner Pichkari Placement",
      secondaryToggleLabel: "Enable Organic Gulal Powder Bloom",
      secondaryToggleHelp: "Vibrant organic powder blooms and cheerful colorful celebratory splatters.",
      lightsThemeLabel: "Gulal Palette Theme",
      lightsThemeOptions: [
        { label: "Vibrant Gulal Multi-Color", value: "festive_multicolor" },
        { label: "Kesari Saffron Glow", value: "amber_radiance" },
      ],
      particleLabel: "Powder Particle Budget",
      particleHelp: "Controls drifting colored powder puffs at smooth 60 FPS.",
      audioLabel: "Festive Dhol & Chime (Audio)",
      audioHelp: "Joyful celebratory percussion chime on shopper interaction.",
      safeZoneHelp: "Prevents corner pichkari bowl from colliding with mobile navigation.",
    };
  }

  // 10. Navratri
  if (fest.includes("navratri")) {
    return {
      headerCategory: "Mirrored Bandhanwar",
      headerBadge: "Garba Mirrors",
      headerArchitectureLabel: "Bandhanwar Architecture",
      headerArchitectureOptions: [
        { label: "Top Mirrored Bandhanwar & Side Tassels", value: "top_and_sides" },
        { label: "Top Bandhanwar Only", value: "top_only" },
        { label: "Side Tassels Only", value: "sides_only" },
        { label: "Off (No Bandhanwar)", value: "off" },
      ],
      dockingPositionLabel: "Bandhanwar Docking Position",
      dockingHelp: "Prevents bandhanwar from obstructing your logo or navigation menu.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Carved Dandiya Sticks",
      cornerSizeLabel: "Corner Dandiya Sticks Size",
      cornerPlacementLabel: "Corner Dandiya Placement",
      secondaryToggleLabel: "Enable Warm Festive Garba Lights",
      secondaryToggleHelp: "Twinkling garba catenary lights and celebratory rhythmic aura.",
      lightsThemeLabel: "Garba Lights Theme",
      lightsThemeOptions: [
        { label: "Warm Royal Gold (2700K)", value: "warm_gold" },
        { label: "Navratri Jewel Multi-Color", value: "festive_multicolor" },
      ],
      particleLabel: "Rhythmic Spark Budget",
      particleHelp: "Controls energetic Garba celebration sparks at 60 FPS.",
      audioLabel: "Dandiya Strike Chime (Audio)",
      audioHelp: "Rhythmic wooden dandiya tap sound on shopper interaction.",
      safeZoneHelp: "Prevents corner dandiya sticks from colliding with mobile navigation.",
    };
  }

  // 11. Pongal
  if (fest.includes("pongal")) {
    return {
      headerCategory: "Sugarcane & Turmeric Arch",
      headerBadge: "Sugarcane",
      headerArchitectureLabel: "Harvest Arch Architecture",
      headerArchitectureOptions: [
        { label: "Top Sugarcane & Side Stalks", value: "top_and_sides" },
        { label: "Top Sugarcane Arch Only", value: "top_only" },
        { label: "Side Stalks Only", value: "sides_only" },
        { label: "Off (No Arch)", value: "off" },
      ],
      dockingPositionLabel: "Arch Docking Position",
      dockingHelp: "Prevents sugarcane arch from obstructing your header.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Clay Pongal Pot",
      cornerSizeLabel: "Corner Pongal Pot Size",
      cornerPlacementLabel: "Corner Pongal Pot Placement",
      secondaryToggleLabel: "Enable Kolam Reveal & Harvest Grains",
      secondaryToggleHelp: "Sacred white rice flour Kolam geometric reveal and golden grains.",
      lightsThemeLabel: "Harvest Glow Theme",
      lightsThemeOptions: [
        { label: "Golden Sunlight Glow", value: "warm_gold" },
        { label: "Jaggery Amber Radiance", value: "amber_radiance" },
      ],
      particleLabel: "Kolam Particle Budget",
      particleHelp: "Controls geometric rice kolam sparkle count at 60 FPS.",
      audioLabel: "Traditional Nadaswaram Chime (Audio)",
      audioHelp: "Celebratory festive nadaswaram chime on interaction.",
      safeZoneHelp: "Prevents corner Pongal pots from colliding with mobile navigation.",
    };
  }

  // 12. Onam
  if (fest.includes("onam")) {
    return {
      headerCategory: "Palm Thoranam",
      headerBadge: "Kuruthola",
      headerArchitectureLabel: "Thoranam Architecture",
      headerArchitectureOptions: [
        { label: "Top Palm Thoranam & Side Garlands", value: "top_and_sides" },
        { label: "Top Thoranam Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Thoranam)", value: "off" },
      ],
      dockingPositionLabel: "Thoranam Docking Position",
      dockingHelp: "Prevents palm thoranam from obstructing your header.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Pookalam Floral Carpet",
      cornerSizeLabel: "Corner Pookalam Size",
      cornerPlacementLabel: "Corner Pookalam Placement",
      secondaryToggleLabel: "Enable Pookalam Petal Reveal",
      secondaryToggleHelp: "Drifting marigold and jasmine flower petals with sacred center glow.",
      lightsThemeLabel: "Floral Glow Theme",
      lightsThemeOptions: [
        { label: "Marigold Gold (2700K)", value: "warm_gold" },
        { label: "Saffron Radiance", value: "amber_radiance" },
      ],
      particleLabel: "Petal Particle Budget",
      particleHelp: "Controls falling marigold and jasmine petal density at 60 FPS.",
      audioLabel: "Chenda Melam Rhythm Chime (Audio)",
      audioHelp: "Festive Kerala percussion greeting chime.",
      safeZoneHelp: "Prevents corner Pookalam carpets from colliding with mobile navigation.",
    };
  }

  // 13. Raksha Bandhan
  if (fest.includes("raksha") || fest.includes("rakhi")) {
    return {
      headerCategory: "Silk Kalawa Threads",
      headerBadge: "Mauli Ribbon",
      headerArchitectureLabel: "Kalawa Ribbon Architecture",
      headerArchitectureOptions: [
        { label: "Top Kalawa & Side Streamers", value: "top_and_sides" },
        { label: "Top Kalawa Threads Only", value: "top_only" },
        { label: "Side Streamers Only", value: "sides_only" },
        { label: "Off (No Ribbons)", value: "off" },
      ],
      dockingPositionLabel: "Ribbon Docking Position",
      dockingHelp: "Prevents ribbons from obstructing navigation.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Royal Rakhi Rosette",
      cornerSizeLabel: "Corner Rakhi Size",
      cornerPlacementLabel: "Corner Rakhi Placement",
      secondaryToggleLabel: "Enable Ribbon Reveal & Gift Sparkles",
      secondaryToggleHelp: "Auspicious silk ribbon unfold animation and golden gift sparkles.",
      lightsThemeLabel: "Sacred Thread Palette",
      lightsThemeOptions: [
        { label: "Sacred Saffron & Crimson", value: "amber_radiance" },
        { label: "Royal Gold Sparkle", value: "warm_gold" },
      ],
      particleLabel: "Ribbon Sparkle Budget",
      particleHelp: "Controls shimmering silk thread sparkles at 60 FPS.",
      audioLabel: "Gentle Sitar Chord (Audio)",
      audioHelp: "Acoustic sitar chord on first interaction.",
      safeZoneHelp: "Prevents corner Rakhi rosettes from colliding with mobile navigation.",
    };
  }

  // 14. Ganesh Chaturthi
  if (fest.includes("ganesh")) {
    return {
      headerCategory: "Hibiscus & Durva Garland",
      headerBadge: "Floral Garland",
      headerArchitectureLabel: "Floral Garland Architecture",
      headerArchitectureOptions: [
        { label: "Top Hibiscus Garland & Side Cascades", value: "top_and_sides" },
        { label: "Top Hibiscus Garland Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Garland)", value: "off" },
      ],
      dockingPositionLabel: "Garland Docking Position",
      dockingHelp: "Prevents floral garland from obstructing header.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Clay Ganesha & Modak",
      cornerSizeLabel: "Corner Ganesha Motif Size",
      cornerPlacementLabel: "Corner Ganesha Placement",
      secondaryToggleLabel: "Enable Gentle Golden Glow & Blessings",
      secondaryToggleHelp: "Divine golden aura, sacred modak radiance, and falling hibiscus petals.",
      lightsThemeLabel: "Divine Aura Theme",
      lightsThemeOptions: [
        { label: "Saffron & Royal Gold", value: "warm_gold" },
        { label: "Deep Amber Radiance", value: "amber_radiance" },
      ],
      particleLabel: "Blessing Particle Budget",
      particleHelp: "Controls falling red hibiscus petals and golden blessings at 60 FPS.",
      audioLabel: "Shankh & Aarti Bell (Audio)",
      audioHelp: "Gentle auspicious shankh resonance chime on interaction.",
      safeZoneHelp: "Prevents corner Ganesha emblems from colliding with mobile navigation.",
    };
  }

  // 15. Easter
  if (fest.includes("easter")) {
    return {
      headerCategory: "Spring Floral Vines",
      headerBadge: "Pastel Vines",
      headerArchitectureLabel: "Floral Vine Architecture",
      headerArchitectureOptions: [
        { label: "Top Pastel Vine & Side Floral Swags", value: "top_and_sides" },
        { label: "Top Floral Vine Only", value: "top_only" },
        { label: "Side Swags Only", value: "sides_only" },
        { label: "Off (No Vines)", value: "off" },
      ],
      dockingPositionLabel: "Vine Docking Position",
      dockingHelp: "Prevents spring vines from obstructing your header.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Decorated Easter Egg",
      cornerSizeLabel: "Corner Easter Egg Size",
      cornerPlacementLabel: "Corner Easter Egg Placement",
      secondaryToggleLabel: "Enable Spring Petals & Butterflies",
      secondaryToggleHelp: "Drifting pastel flower petals and soft spring garden luminescence.",
      lightsThemeLabel: "Pastel Spring Palette",
      lightsThemeOptions: [
        { label: "Pastel Meadow Multi-Color", value: "festive_multicolor" },
        { label: "Morning Jasmine White", value: "pearl_white" },
      ],
      particleLabel: "Spring Petal Budget",
      particleHelp: "Controls drifting pastel flower petals at 60 FPS.",
      audioLabel: "Spring Birdsong & Chime (Audio)",
      audioHelp: "Gentle acoustic spring tone on customer interaction.",
      safeZoneHelp: "Prevents corner Easter eggs from colliding with mobile navigation.",
    };
  }

  // 16. New Year
  if (fest.includes("new-year") || fest.includes("newyear")) {
    return {
      headerCategory: "Champagne Bunting",
      headerBadge: "Gold Streamers",
      headerArchitectureLabel: "Bunting Architecture",
      headerArchitectureOptions: [
        { label: "Top Metallic Bunting & Side Streamers", value: "top_and_sides" },
        { label: "Top Bunting Only", value: "top_only" },
        { label: "Side Streamers Only", value: "sides_only" },
        { label: "Off (No Bunting)", value: "off" },
      ],
      dockingPositionLabel: "Bunting Docking Position",
      dockingHelp: "Prevents metallic bunting from obstructing navigation.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Champagne Flutes & Clock",
      cornerSizeLabel: "Corner Celebration Motif Size",
      cornerPlacementLabel: "Corner Celebration Placement",
      secondaryToggleLabel: "Enable Micro Fireworks & Confetti",
      secondaryToggleHelp: "Celebratory micro fireworks bursts, champagne sparkle, and gold confetti.",
      lightsThemeLabel: "Countdown Glow Palette",
      lightsThemeOptions: [
        { label: "Champagne Gold (2700K)", value: "warm_gold" },
        { label: "Times Square Multi-Color", value: "festive_multicolor" },
      ],
      particleLabel: "Confetti & Spark Budget",
      particleHelp: "Controls micro celebratory sparks and gold confetti at 60 FPS.",
      audioLabel: "Celebratory Chime / Chimes of Midnight",
      audioHelp: "Plays subtle celebratory chime on interaction.",
      safeZoneHelp: "Prevents corner champagne flutes from colliding with mobile navigation.",
    };
  }

  // 17. Mid-Autumn Festival
  if (fest.includes("mid-autumn") || fest.includes("mooncake")) {
    return {
      headerCategory: "Bamboo Lantern Strings",
      headerBadge: "Sky Lanterns",
      headerArchitectureLabel: "Lantern String Architecture",
      headerArchitectureOptions: [
        { label: "Top Lantern String & Side Tassels", value: "top_and_sides" },
        { label: "Top Lantern String Only", value: "top_only" },
        { label: "Side Tassels Only", value: "sides_only" },
        { label: "Off (No Lanterns)", value: "off" },
      ],
      dockingPositionLabel: "Lantern Docking Position",
      dockingHelp: "Prevents bamboo lanterns from obstructing navigation.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Harvest Moon & Mooncake",
      cornerSizeLabel: "Corner Harvest Moon Size",
      cornerPlacementLabel: "Corner Harvest Moon Placement",
      secondaryToggleLabel: "Enable Floating Sky Lanterns & Moon Radiance",
      secondaryToggleHelp: "Luminous harvest full moon glow and soft upward floating paper lanterns.",
      lightsThemeLabel: "Moonlight Theme",
      lightsThemeOptions: [
        { label: "Harvest Moonlit Gold", value: "warm_gold" },
        { label: "Silver Moonlight Glow", value: "pearl_white" },
      ],
      particleLabel: "Sky Lantern Particle Budget",
      particleHelp: "Controls floating miniature paper lanterns at 60 FPS.",
      audioLabel: "Guzheng Melodic Chime (Audio)",
      audioHelp: "Plays serene acoustic guzheng tone on interaction.",
      safeZoneHelp: "Prevents corner harvest moon motifs from colliding with mobile navigation.",
    };
  }

  // 18. Vesak
  if (fest.includes("vesak") || fest.includes("buddha")) {
    return {
      headerCategory: "Bodhi & Jasmine Garland",
      headerBadge: "Sacred Vines",
      headerArchitectureLabel: "Sacred Garland Architecture",
      headerArchitectureOptions: [
        { label: "Top Bodhi Garland & Side Cascades", value: "top_and_sides" },
        { label: "Top Bodhi Garland Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Garland)", value: "off" },
      ],
      dockingPositionLabel: "Garland Docking Position",
      dockingHelp: "Prevents garland from obstructing header.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Blooming Sacred Lotus",
      cornerSizeLabel: "Corner Lotus Motif Size",
      cornerPlacementLabel: "Corner Lotus Placement",
      secondaryToggleLabel: "Enable Gentle Illumination & Bodhi Radiance",
      secondaryToggleHelp: "Peaceful golden Dhamma light aura and floating sacred white lotus petals.",
      lightsThemeLabel: "Enlightenment Glow Theme",
      lightsThemeOptions: [
        { label: "Golden Saffron Ochre", value: "warm_gold" },
        { label: "Jasmine White Glow", value: "pearl_white" },
      ],
      particleLabel: "Lotus Petal Budget",
      particleHelp: "Controls peaceful lotus petal and soft light drift at 60 FPS.",
      audioLabel: "Singing Bowl Meditation Chime (Audio)",
      audioHelp: "Peaceful Tibetan singing bowl resonance on interaction.",
      safeZoneHelp: "Prevents corner blooming lotus from colliding with mobile navigation.",
    };
  }

  // 19. Durga Puja
  if (fest.includes("durga")) {
    return {
      headerCategory: "Alpana & Kash Garland",
      headerBadge: "Sharad Garland",
      headerArchitectureLabel: "Pujo Garland Architecture",
      headerArchitectureOptions: [
        { label: "Top Alpana Garland & Side Kash Reeds", value: "top_and_sides" },
        { label: "Top Alpana Garland Only", value: "top_only" },
        { label: "Side Kash Reeds Only", value: "sides_only" },
        { label: "Off (No Garland)", value: "off" },
      ],
      dockingPositionLabel: "Garland Docking Position",
      dockingHelp: "Prevents pujo garland from obstructing navigation.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Clay Dhunachi Burner",
      cornerSizeLabel: "Corner Dhunachi Size",
      cornerPlacementLabel: "Corner Dhunachi Placement",
      secondaryToggleLabel: "Enable Dhunachi Holy Incense & Smoke",
      secondaryToggleHelp: "Aromatic holy Dhuno incense smoke tendrils and swaying autumn Kash reeds.",
      lightsThemeLabel: "Pujo Aarti Glow Theme",
      lightsThemeOptions: [
        { label: "Sindoor Crimson & Gold", value: "amber_radiance" },
        { label: "Divine Aarti Warm Gold", value: "warm_gold" },
      ],
      particleLabel: "Smoke Tendril Particle Budget",
      particleHelp: "Controls holy incense smoke swirls and kash petals at 60 FPS.",
      audioLabel: "Dhak Drum & Kanshi Beat (Audio)",
      audioHelp: "Rhythmic festive Dhak drumbeat greeting on interaction.",
      safeZoneHelp: "Prevents corner Dhunachi burners from colliding with mobile navigation.",
    };
  }

  // 20. Makar Sankranti
  if (fest.includes("sankranti") || fest.includes("uttarayan")) {
    return {
      headerCategory: "Kite Streamers",
      headerBadge: "Uttarayan Kites",
      headerArchitectureLabel: "Kite Streamer Architecture",
      headerArchitectureOptions: [
        { label: "Top Kite Streamer & Side Manja Spools", value: "top_and_sides" },
        { label: "Top Kite Streamer Only", value: "top_only" },
        { label: "Side Kites Only", value: "sides_only" },
        { label: "Off (No Streamers)", value: "off" },
      ],
      dockingPositionLabel: "Streamer Docking Position",
      dockingHelp: "Prevents kite streamers from obstructing navigation.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Diamond Fighter Kite",
      cornerSizeLabel: "Corner Fighter Kite Size",
      cornerPlacementLabel: "Corner Fighter Kite Placement",
      secondaryToggleLabel: "Enable Soaring Kites & Golden Sunshine",
      secondaryToggleHelp: "Vibrant diamond fighter kites soaring in clear winter skies with golden rays.",
      lightsThemeLabel: "Winter Sunshine Theme",
      lightsThemeOptions: [
        { label: "Kite Saffron & Sky Gold", value: "warm_gold" },
        { label: "Clear Winter Sky Multi-Color", value: "festive_multicolor" },
      ],
      particleLabel: "Soaring Kite Dust Budget",
      particleHelp: "Controls soaring kite silhouettes and sunbeam sparkles at 60 FPS.",
      audioLabel: "Joyful Kai Po Che! Chime (Audio)",
      audioHelp: "Celebratory festival greeting chime on interaction.",
      safeZoneHelp: "Prevents corner fighter kites from colliding with mobile navigation.",
    };
  }

  // 21. Dussehra
  if (fest.includes("dussehra") || fest.includes("vijayadashami")) {
    return {
      headerCategory: "Shami Leaf Garland",
      headerBadge: "Victory Toran",
      headerArchitectureLabel: "Victory Toran Architecture",
      headerArchitectureOptions: [
        { label: "Top Shami Toran & Side Marigolds", value: "top_and_sides" },
        { label: "Top Shami Toran Only", value: "top_only" },
        { label: "Side Cascades Only", value: "sides_only" },
        { label: "Off (No Toran)", value: "off" },
      ],
      dockingPositionLabel: "Toran Docking Position",
      dockingHelp: "Prevents victory toran from obstructing navigation.",
      offsetLabel: "Vertical Alignment Fine-Tuning",
      cornerName: "Golden Bow & Arrow",
      cornerSizeLabel: "Corner Bow & Arrow Size",
      cornerPlacementLabel: "Corner Bow & Arrow Placement",
      secondaryToggleLabel: "Enable Triumphant Victory Glow",
      secondaryToggleHelp: "Radiant golden victory embers and auspicious Shami leaves honoring Lord Rama.",
      lightsThemeLabel: "Victory Aura Theme",
      lightsThemeOptions: [
        { label: "Flame Amber Radiance", value: "amber_radiance" },
        { label: "Royal Victory Gold", value: "warm_gold" },
      ],
      particleLabel: "Victory Ember Budget",
      particleHelp: "Controls triumphant golden embers and falling Shami leaves at 60 FPS.",
      audioLabel: "Triumphant Conch & Bell (Audio)",
      audioHelp: "Auspicious victory conch resonance on customer interaction.",
      safeZoneHelp: "Prevents corner bow and arrow emblem from colliding with mobile navigation.",
    };
  }

  // Default: Diwali & Classical Indian Celebrations
  return {
    headerCategory: "Garlands & Docking",
    headerBadge: "Toran",
    headerArchitectureLabel: "Garland / Toran Architecture",
    headerArchitectureOptions: [
      { label: "Top Toran & Both Side Cascades", value: "top_and_sides" },
      { label: "Top Toran Only (Header Arch)", value: "top_only" },
      { label: "Side Cascades Only (Pillars)", value: "sides_only" },
      { label: "Off (No Garland)", value: "off" },
    ],
    dockingPositionLabel: "Toran Docking Position",
    dockingHelp: "Prevents garland from obstructing your logo, navigation menu, or cart.",
    offsetLabel: "Vertical Alignment Fine-Tuning",
    cornerName: "Living Brass Diya",
    cornerSizeLabel: "Corner Diya / Motif Size",
    cornerPlacementLabel: "Corner Diya / Motif Placement",
    secondaryToggleLabel: "Enable Series Fairy Lights & Sparkles",
    secondaryToggleHelp: "Twinkling catenary fairy lights and glowing ambient particles.",
    lightsThemeLabel: "Series Lights Color Theme",
    lightsThemeOptions: [
      { label: "Warm Royal Gold (2700K)", value: "warm_gold" },
      { label: "Festive Multi-Color Jewels", value: "festive_multicolor" },
      { label: "Deep Amber Glow", value: "amber_radiance" },
      { label: "Moonlit Silver Pearl", value: "pearl_white" },
    ],
    particleLabel: "Ambient Particle Budget",
    particleHelp: "Maintains smooth 60 FPS performance across mobile and low-power devices.",
    audioLabel: "Auspicious Festive Chime (Audio)",
    audioHelp: "Plays a gentle, muted temple chime on first customer interaction. Muted by default.",
    safeZoneHelp: "Prevents corner diyas from colliding with mobile bottom navigation bars or chat widgets.",
  };
}

// ─── Dynamic Culturally Authentic Particles Overlay ─────────────────────────
function DynamicOverlayParticles({ festival, density = 16, intensity = 80, customColor }) {
  const festId = (festival.id || "").toLowerCase();
  const count = Math.min(density, 20);

  // 1. Halloween: Floating Ghost Silhouettes + Upward Amber Sparks
  if (festId.includes("halloween")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[
          { left: "6%", top: "25%", size: 21, delay: "0s", duration: "7s", opacity: 0.75 },
          { left: "10%", top: "68%", size: 23, delay: "3.5s", duration: "8.5s", opacity: 0.7 },
          { left: "90%", top: "22%", size: 19, delay: "1.8s", duration: "7.8s", opacity: 0.75 },
        ].map((g, idx) => (
          <div
            key={`ghost-${idx}`}
            style={{
              position: "absolute",
              left: g.left,
              top: g.top,
              width: `${g.size}px`,
              height: `${Math.round(g.size * 1.2)}px`,
              opacity: g.opacity,
              filter: "drop-shadow(0 0 8px rgba(255, 117, 24, 0.45))",
              animation: `utsavGhostFloat ${g.duration} ease-in-out infinite alternate`,
              animationDelay: g.delay,
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 32 38" width="100%" height="100%">
              <path
                d="M 16 3 C 8 3 4 10 4 18 C 4 27 6 34 8 33 C 10 32 12 35 14 33 C 16 31 18 35 20 33 C 22 31 24 35 26 33 C 28 35 28 27 28 18 C 28 10 24 3 16 3 Z"
                fill="rgba(240, 235, 255, 0.9)"
              />
              <ellipse cx="11" cy="14" rx="2.2" ry="3" fill="#1A1528" />
              <ellipse cx="21" cy="14" rx="2.2" ry="3" fill="#1A1528" />
              <ellipse cx="16" cy="20" rx="1.8" ry="2.4" fill="#1A1528" />
            </svg>
          </div>
        ))}
        {[...Array(count)].map((_, i) => (
          <div
            key={`ember-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 17 + 5) % 90 + 5}%`,
              top: `${(i * 23 + 11) % 85 + 8}%`,
              width: `${(i % 3) + 2.5}px`,
              height: `${(i % 3) + 2.5}px`,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#FF7518" : "#FFD700",
              boxShadow: "0 0 5px rgba(255, 117, 24, 0.8)",
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    );
  }

  // 2. Christmas: Soft Falling Snowflakes
  if (festId.includes("christmas")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`snow-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 21 + 7) % 92 + 4}%`,
              top: `${(i * 19 + 5) % 88 + 6}%`,
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.9)",
              opacity: (i % 3) === 0 ? 0.95 : 0.65,
            }}
          />
        ))}
      </div>
    );
  }

  // 3. Valentine's Day: Soft Floating Heart Bokeh & Rose Petals
  if (festId.includes("valentines")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`heart-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 19 + 6) % 90 + 5}%`,
              top: `${(i * 23 + 8) % 86 + 6}%`,
              fontSize: `${(i % 3) * 3 + 8}px`,
              color: i % 2 === 0 ? "#FF4081" : "#FF80AB",
              opacity: 0.7,
              filter: "drop-shadow(0 0 4px rgba(255, 64, 129, 0.5))",
            }}
          >
            {i % 3 === 0 ? "🌸" : "♥"}
          </div>
        ))}
      </div>
    );
  }

  // 4. Thanksgiving: Drifting Autumn Leaves
  if (festId.includes("thanksgiving")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`leaf-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 23 + 4) % 90 + 5}%`,
              top: `${(i * 19 + 7) % 86 + 7}%`,
              fontSize: `${(i % 3) * 2 + 10}px`,
              opacity: 0.75,
              transform: `rotate(${(i * 45) % 360}deg)`,
            }}
          >
            {i % 2 === 0 ? "🍁" : "🍂"}
          </div>
        ))}
      </div>
    );
  }

  // 5. Holi: Drifting Multi-Color Organic Gulal Powder Clouds
  if (festId.includes("holi")) {
    const holiColors = ["#E91E63", "#FF9800", "#00E5FF", "#FFEB3B", "#76FF03", "#9C27B0"];
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`gulal-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 19 + 4) % 88 + 6}%`,
              top: `${(i * 23 + 9) % 84 + 8}%`,
              width: `${(i % 4) * 4 + 7}px`,
              height: `${(i % 4) * 4 + 7}px`,
              borderRadius: "50%",
              background: holiColors[i % holiColors.length],
              opacity: 0.55,
              filter: "blur(2.5px)",
            }}
          />
        ))}
      </div>
    );
  }

  // 6. Onam: Floating Marigold and Jasmine Petals
  if (festId.includes("onam")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`petal-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 21 + 5) % 90 + 5}%`,
              top: `${(i * 17 + 8) % 86 + 6}%`,
              width: `${(i % 3) + 4}px`,
              height: `${(i % 3) + 6}px`,
              borderRadius: "50% 0 50% 50%",
              background: i % 3 === 0 ? "#FFF8E1" : i % 3 === 1 ? "#FFB300" : "#FF6F00",
              opacity: 0.8,
              transform: `rotate(${(i * 37) % 360}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  // 7. Lunar New Year: Golden Fortune Coins & Sparkles
  if (festId.includes("lunar") || festId.includes("chinese")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`coin-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 19 + 5) % 90 + 5}%`,
              top: `${(i * 27 + 6) % 85 + 7}%`,
              width: i % 2 === 0 ? "8px" : "4px",
              height: i % 2 === 0 ? "8px" : "4px",
              borderRadius: "50%",
              border: i % 2 === 0 ? "1px solid #FFD700" : "none",
              background: i % 2 === 0 ? "rgba(255, 215, 0, 0.4)" : "#FFD700",
              boxShadow: "0 0 5px rgba(255, 215, 0, 0.7)",
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    );
  }

  // 8. New Year: Celebratory Confetti & Micro Sparkles
  if (festId.includes("new-year") || festId.includes("newyear")) {
    const nyColors = ["#FFD700", "#E0E0E0", "#FF4081", "#00E5FF", "#76FF03"];
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 17 + 8) % 92 + 4}%`,
              top: `${(i * 23 + 4) % 86 + 6}%`,
              width: `${(i % 2) * 2 + 3}px`,
              height: `${(i % 3) * 3 + 5}px`,
              background: nyColors[i % nyColors.length],
              opacity: 0.8,
              transform: `rotate(${(i * 55) % 360}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  // Default: Radiant Festive Sparkles (Diwali, Navratri, Ganesh Chaturthi, Pongal, Vishu, etc.)
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100 }}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 19) % 92 + 4}%`,
            top: `${(i * 27) % 85 + 5}%`,
            width: `${(i % 3) + 2.5}px`,
            height: `${(i % 3) + 2.5}px`,
            borderRadius: "50%",
            background: customColor || festival.palette?.primary || "#FFD700",
            boxShadow: `0 0 4px ${festival.palette?.glow || "rgba(255,215,0,0.6)"}`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Dynamic Header Garland & Lights Dispatcher ─────────────────────────────
function buildSpiderWeb() {
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const n = 11;
  const spokes = [];
  for (let i = 0; i < n; i++) {
    const a = (2 + (i / (n - 1)) * 86 + (rnd() - 0.5) * 5) * Math.PI / 180;
    spokes.push({ a, len: 135 + rnd() * 115 });
  }
  const P = (sp, r) => [r * Math.cos(sp.a), r * Math.sin(sp.a) * 0.75];
  const f = (v) => v.toFixed(1);
  let out = "";
  spokes.forEach((sp) => {
    const [x, y] = P(sp, sp.len);
    const [mx, my] = P(sp, sp.len * 0.5);
    const cx = mx + (rnd() - 0.5) * 5, cy = my + (rnd() - 0.5) * 5 + 2.5;
    out += `<path d="M0 0 Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}" stroke="rgba(246,248,255,${(0.7 + rnd() * 0.2).toFixed(2)})" stroke-width="${(0.9 + rnd() * 0.3).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
  });
  let r = 13;
  let k = 0;
  while (r < 250) {
    for (let i = 0; i < n - 1; i++) {
      const A = spokes[i], B = spokes[i + 1];
      if (r > A.len || r > B.len) continue;
      if (rnd() < 0.07) continue;
      const rj = r * (1 + (rnd() - 0.5) * 0.05);
      const [x1, y1] = P(A, rj), [x2, y2] = P(B, rj * (1 + (rnd() - 0.5) * 0.04));
      const pull = 0.80 + rnd() * 0.06;
      const cx = (x1 + x2) / 2 * pull, cy = (y1 + y2) / 2 * pull;
      const op = Math.max(0.25, 0.8 - k * 0.04);
      out += `<path d="M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}" stroke="rgba(236,240,255,${op.toFixed(2)})" stroke-width="${(0.55 + rnd() * 0.25).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
      if (rnd() < 0.18) out += `<circle cx="${f(x2)}" cy="${f(y2)}" r="${(0.8 + rnd() * 0.7).toFixed(1)}" fill="#fff" opacity="${(0.5 + rnd() * 0.4).toFixed(2)}"/>`;
    }
    r *= 1.28 + rnd() * 0.12;
    k++;
  }
  return out;
}

function DynamicFestivalHeaderWidget({ festival, isMobile, height = 32, withLights = true, lightsTheme = "warm_gold" }) {
  const festId = (festival.id || "").toLowerCase();

  // 1. Halloween Spiderweb Lace & Mist (Responsive Corner Cobwebs & Active Alive Arachnid Rig)
  if (festId.includes("halloween")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "visible", background: "transparent" }}>
        <div className="utsav-spiderweb-wrapper" style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
          {/* Central Sagging Gossamer Silk Swags */}
          <div className="utsav-web-catenary-wrap" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <svg width="100%" height={height} viewBox="0 0 1000 50" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
              <path d="M 0 3 Q 150 18 300 4 Q 450 22 600 5 Q 800 20 1000 3" stroke="rgba(240, 244, 255, 0.75)" strokeWidth="1.3" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }} />
              <path d="M 0 5 Q 100 28 200 6 Q 360 32 520 8 Q 700 30 880 7 Q 940 22 1000 5" stroke="rgba(220, 210, 245, 0.55)" strokeWidth="0.95" fill="none" />
              <path d="M 120 14 Q 280 38 440 12 Q 600 36 760 10 Q 920 34 1000 14" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="0.8" strokeDasharray="4,2" fill="none" />
            </svg>
          </div>

          {/* Left Corner Radial Cobweb (Fixed aspect ratio, never stretches) */}
          <div className="utsav-corner-web utsav-corner-web--left" style={{ position: "absolute", left: 0, top: 0, width: isMobile ? "120px" : "190px", height: isMobile ? "88px" : "139px", pointerEvents: "none" }}>
            <svg viewBox="0 0 260 190" preserveAspectRatio="xMinYMin meet" style={{ display: "block", width: "100%", height: "100%", overflow: "visible", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }} dangerouslySetInnerHTML={{ __html: buildSpiderWeb() }} />
          </div>

          {/* Right Corner Radial Cobweb (Mirrored, never stretches) */}
          <div className="utsav-corner-web utsav-corner-web--right" style={{ position: "absolute", right: 0, top: 0, width: isMobile ? "120px" : "190px", height: isMobile ? "88px" : "139px", pointerEvents: "none", transform: "scaleX(-1)" }}>
            <svg viewBox="0 0 260 190" preserveAspectRatio="xMinYMin meet" style={{ display: "block", width: "100%", height: "100%", overflow: "visible", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }} dangerouslySetInnerHTML={{ __html: buildSpiderWeb() }} />
          </div>

          {/* Left Resident Spider */}
          <div className="utsav-left-spider" style={{ position: "absolute", left: isMobile ? "35px" : "60px", top: isMobile ? "12px" : "20px", width: "24px", height: "24px", pointerEvents: "none" }}>
            <div className="utsav-left-spider-creature" style={{ width: "100%", height: "100%" }}>
              <svg viewBox="0 0 32 32" style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}>
                <g className="utsav-spider-leg-a">
                  <path d="M 14 12 Q 7 7 4 9 L 2 15" stroke="#120E18" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 13 15 Q 5 15 3 20 L 4 26" stroke="#120E18" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 19 14 Q 26 11 29 15 L 30 21" stroke="#120E18" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 18 16 Q 25 20 26 26 L 24 31" stroke="#120E18" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </g>
                <g className="utsav-spider-leg-b">
                  <path d="M 14 13 Q 6 11 3 15 L 2 21" stroke="#120E18" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 14 16 Q 7 20 5 26 L 7 31" stroke="#120E18" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M 18 12 Q 25 7 28 9 L 30 15" stroke="#120E18" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 19 15 Q 27 15 29 20 L 28 26" stroke="#120E18" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                </g>
                <ellipse cx="16" cy="20" rx="4.8" ry="6.2" fill="#110D17" stroke="#2B1E38" strokeWidth="0.7" />
                <polygon points="16,16 14,18.5 18,18.5" fill="#FF7518" opacity="0.95" />
                <circle cx="16" cy="13" r="3" fill="#171220" stroke="#322244" strokeWidth="0.6" />
                <circle cx="14.8" cy="11.8" r="0.6" fill="#FF4500" />
                <circle cx="17.2" cy="11.8" r="0.6" fill="#FF4500" />
              </svg>
            </div>
          </div>

          {/* Hero Dropping, Swaying, Climbing & Scrawling Spider Rig */}
          <div className="utsav-spider-rig" style={{ position: "absolute", right: isMobile ? "24px" : "80px", top: 0, width: "36px", height: "160px", pointerEvents: "none" }}>
            <div className="utsav-spider-silk" style={{ left: "18px" }}></div>
            <div className="utsav-spider-creature" style={{ width: "36px", height: "36px" }}>
              <svg viewBox="0 0 44 44" style={{ width: "100%", height: "100%", overflow: "visible", display: "block", position: "relative", zIndex: 2 }}>
                <g transform="rotate(180 22 22)">
                  <path d="M 20 14 Q 19 11 18 12 M 24 14 Q 25 11 26 12" stroke="#14101A" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <g className="utsav-spider-leg-a">
                    <path d="M 19 16 Q 10 9 6 12 L 3 19" stroke="#14101A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 18 19 Q 8 19 5 25 L 7 34" stroke="#14101A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 25 18 Q 35 14 39 20 L 41 28" stroke="#14101A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 25 21 Q 34 26 36 34 L 33 42" stroke="#14101A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <g className="utsav-spider-leg-b">
                    <path d="M 19 18 Q 9 14 5 20 L 3 28" stroke="#14101A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 19 21 Q 10 26 8 34 L 11 42" stroke="#14101A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 25 16 Q 34 9 38 12 L 41 19" stroke="#14101A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M 26 19 Q 36 19 39 25 L 37 34" stroke="#14101A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <ellipse cx="22" cy="18" rx="4.2" ry="4.8" fill="#16111E" stroke="#2F213E" strokeWidth="0.8" />
                  <circle cx="20.7" cy="15.2" r="0.9" fill="#FF4500" />
                  <circle cx="23.3" cy="15.2" r="0.9" fill="#FF4500" />
                  <ellipse cx="22" cy="27" rx="6.8" ry="9" fill="#110C17" stroke="#2F213E" strokeWidth="1" />
                  <polygon points="22,22 19.2,25.5 24.8,25.5" fill="#FF7518" opacity="0.95" />
                  <polygon points="22,29 19.2,25.5 24.8,25.5" fill="#FF7518" opacity="0.95" />
                  <circle cx="18.5" cy="28" r="0.8" fill="#FFB74D" opacity="0.8" />
                  <circle cx="25.5" cy="28" r="0.8" fill="#FFB74D" opacity="0.8" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Christmas Pine & Holly
  if (festId.includes("christmas")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
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

  // 3. Valentine's Day Ribbon Swags
  if (festId.includes("valentines")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#E91E63" strokeWidth="1.5" />
          {[0, 80, 160, 240, 320, 400, 480].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 2 Q 40 26 80 2" stroke="#C2185B" strokeWidth="2.5" fill="none" />
              <path d="M 8 2 Q 40 22 72 2" stroke="#FF80AB" strokeWidth="1.2" fill="none" />
              <circle cx="40" cy="27" r="2.5" fill="#E91E63" />
              {withLights && <circle cx="40" cy="16" r="2.5" fill="#FFF8E1" />}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 4. Lunar New Year Red Lantern String
  if (festId.includes("lunar") || festId.includes("chinese")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#D32F2F" strokeWidth="2" />
          {[40, 120, 200, 280, 360, 440, 520].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <line x1="0" y1="2" x2="0" y2="12" stroke="#B71C1C" strokeWidth="1" />
              <rect x="-6" y="12" width="12" height="18" rx="4" fill="#D32F2F" stroke="#FFD700" strokeWidth="0.8" />
              <line x1="0" y1="30" x2="0" y2="38" stroke="#FFD700" strokeWidth="1.2" />
              {withLights && <circle cx="0" cy="21" r="2" fill="#FFF9C4" />}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 5. Holi Color Bunting & Pom-Poms
  if (festId.includes("holi")) {
    const pomColors = ["#E91E63", "#FF9800", "#FFEB3B", "#00E5FF", "#76FF03"];
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <path d="M 0 4 Q 280 20 560 4" stroke="#FF4081" strokeWidth="1.8" fill="none" />
          {[20, 80, 140, 200, 260, 320, 380, 440, 500].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <line x1="0" y1="4" x2="0" y2="18" stroke="#E0E0E0" strokeWidth="0.8" />
              <circle cx="0" cy="22" r="5.5" fill={pomColors[i % pomColors.length]} />
              <circle cx="0" cy="22" r="2.5" fill="#FFFFFF" opacity="0.6" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 6. Pongal Sugarcane & Turmeric Foliage
  if (festId.includes("pongal")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="3" x2="560" y2="3" stroke="#2E7D32" strokeWidth="3" />
          {[30, 110, 190, 270, 350, 430, 510].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M -12 3 Q 0 24 12 3" stroke="#1B5E20" strokeWidth="2.2" fill="none" />
              <circle cx="0" cy="18" r="3.2" fill="#FBC02D" />
              <line x1="0" y1="3" x2="0" y2="32" stroke="#388E3C" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 7. Onam Palm Thoranam (Kuruthola)
  if (festId.includes("onam")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#558B2F" strokeWidth="2" />
          {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <polygon points="-4,2 0,26 4,2" fill="#7CB342" />
              {i % 2 === 0 && <circle cx="0" cy="29" r="3" fill="#FFB300" />}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 8. Vishu Golden Kanikonna
  if (festId === "vishu") {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
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

  // 9. Eid Damascus Fanoos
  if (festId.includes("eid")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
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

  // 10. Thanksgiving Autumn Foliage
  if (festId.includes("thanksgiving")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#795548" strokeWidth="2" />
          {[30, 90, 150, 210, 270, 330, 390, 450, 510].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 2 Q 15 18 0 32" stroke="#D84315" strokeWidth="2" fill="none" />
              <circle cx="-3" cy="12" r="3" fill="#E65100" />
              <circle cx="4" cy="20" r="3.5" fill="#F57F17" />
              <circle cx="-2" cy="28" r="2.8" fill="#BF360C" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 11. Hanukkah Star of David Bunting
  if (festId.includes("hanukkah")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#1565C0" strokeWidth="1.5" />
          {[40, 120, 200, 280, 360, 440, 520].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <line x1="0" y1="2" x2="0" y2="10" stroke="#90CAF9" strokeWidth="1" />
              <polygon points="0,10 7,22 -7,22" stroke="#1976D2" strokeWidth="1" fill="none" />
              <polygon points="0,24 7,12 -7,12" stroke="#1976D2" strokeWidth="1" fill="none" />
              {withLights && <circle cx="0" cy="17" r="2" fill="#E0F7FA" />}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 12. New Year Champagne Streamers
  if (festId.includes("new-year") || festId.includes("newyear")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#FFD700" strokeWidth="1.8" />
          {[30, 90, 150, 210, 270, 330, 390, 450, 510].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d={`M 0 2 Q ${i % 2 === 0 ? 8 : -8} 16 0 32`} stroke="#FFE082" strokeWidth="1.2" fill="none" />
              <polygon points="0,32 -3,24 3,24" fill="#FFD700" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 14. Easter Spring Floral Vines & Pastel Eggs
  if (festId.includes("easter")) {
    const eggColors = ["#F8BBD0", "#B2EBF2", "#FFF9C4", "#D1C4E9", "#C8E6C9"];
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <path d="M 0 6 Q 280 22 560 6" stroke="#81C784" strokeWidth="2.2" fill="none" />
          {[35, 105, 175, 245, 315, 385, 455, 525].map((x, i) => (
            <g key={i} transform={`translate(${x}, 10)`}>
              <line x1="0" y1="0" x2="0" y2="10" stroke="#A5D6A7" strokeWidth="1" />
              <ellipse cx="0" cy="16" rx="5" ry="7" fill={eggColors[i % eggColors.length]} stroke="#81C784" strokeWidth="0.8" />
              <circle cx="-5" cy="5" r="2.2" fill="#F48FB1" />
              <circle cx="5" cy="5" r="2.2" fill="#FFF59D" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 15. Mid-Autumn Bamboo & Paper Lantern Strings
  if (festId.includes("mid-autumn") || festId.includes("mooncake")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="3" x2="560" y2="3" stroke="#8D6E63" strokeWidth="2" />
          {[40, 120, 200, 280, 360, 440, 520].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <line x1="0" y1="3" x2="0" y2="12" stroke="#FFD54F" strokeWidth="1" />
              <circle cx="0" cy="20" r="7.5" fill="#FFB74D" stroke="#E65100" strokeWidth="0.8" />
              <line x1="0" y1="27.5" x2="0" y2="36" stroke="#D81B60" strokeWidth="1.2" />
              {withLights && <circle cx="0" cy="20" r="2.2" fill="#FFFDE7" />}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 16. Vesak Sacred Bodhi Leaf & Jasmine Garland
  if (festId.includes("vesak") || festId.includes("buddha")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <path d="M 0 4 Q 280 20 560 4" stroke="#FB8C00" strokeWidth="1.8" fill="none" />
          {[30, 90, 150, 210, 270, 330, 390, 450, 510].map((x, i) => (
            <g key={i} transform={`translate(${x}, 4)`}>
              <path d="M 0 0 C -6 8 -7 18 0 26 C 7 18 6 8 0 0 Z" fill="#43A047" />
              <circle cx="0" cy="28" r="3" fill="#FFFFFF" />
              <circle cx="0" cy="28" r="1.5" fill="#FFE082" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 17. Durga Puja Kash Reeds & Alpana Border
  if (festId.includes("durga")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <rect x="0" y="0" width="100%" height="3.5" fill="#C62828" />
          {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540].map((x, i) => (
            <g key={i} transform={`translate(${x}, 3.5)`}>
              <polygon points="0,0 -8,14 8,14" fill="#B71C1C" />
              <circle cx="0" cy="8" r="2.5" fill="#FFFDE7" />
              <line x1="0" y1="14" x2="0" y2="28" stroke="#ECEFF1" strokeWidth="1.2" opacity="0.85" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 18. Raksha Bandhan Silk Kalawa & Mauli Thread Swags
  if (festId.includes("raksha") || festId.includes("rakhi")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <line x1="0" y1="2" x2="560" y2="2" stroke="#D32F2F" strokeWidth="2.5" />
          {[0, 80, 160, 240, 320, 400, 480].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 2 Q 40 24 80 2" stroke="#FFC107" strokeWidth="1.6" fill="none" />
              <path d="M 10 2 Q 40 18 70 2" stroke="#D32F2F" strokeWidth="1.2" fill="none" />
              <circle cx="40" cy="24" r="3.5" fill="#FFD700" />
              <circle cx="40" cy="24" r="1.8" fill="#D32F2F" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 19. Navratri Mirrored Bandhanwar & Gold Gota
  if (festId.includes("navratri")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <rect x="0" y="0" width="100%" height="4" fill="#FF4500" />
          {[0, 70, 140, 210, 280, 350, 420, 490].map((x, i) => (
            <g key={i} transform={`translate(${x}, 4)`}>
              <polygon points="0,0 35,26 70,0" fill={i % 2 === 0 ? "#C2185B" : "#FF6F00"} />
              <circle cx="35" cy="13" r="4.5" fill="#E0E0E0" stroke="#FFD700" strokeWidth="0.8" />
              <circle cx="35" cy="27" r="2.2" fill="#FFD700" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 20. Ganesh Chaturthi Hibiscus & Durva Grass Arch
  if (festId.includes("ganesh")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <path d="M 0 5 Q 280 22 560 5" stroke="#2E7D32" strokeWidth="3" fill="none" />
          {[35, 105, 175, 245, 315, 385, 455, 525].map((x, i) => (
            <g key={i} transform={`translate(${x}, 8)`}>
              <circle cx="0" cy="8" r="6" fill="#D32F2F" />
              <circle cx="0" cy="8" r="2.5" fill="#FFEB3B" />
              <path d="M -8 14 Q 0 4 8 14" stroke="#43A047" strokeWidth="2" fill="none" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 21. Dussehra Shami Leaves & Marigold Victory Toran
  if (festId.includes("dussehra") || festId.includes("vijayadashami")) {
    return (
      <div style={{ width: "100%", height: `${height}px`, position: "relative", overflow: "hidden", background: "transparent" }}>
        <svg width="100%" height={height} viewBox="0 0 560 48" preserveAspectRatio="none">
          <rect x="0" y="0" width="100%" height="3.5" fill="#1B5E20" />
          {[0, 80, 160, 240, 320, 400, 480].map((x, i) => (
            <g key={i} transform={`translate(${x}, 3.5)`}>
              <path d="M 0 0 Q 40 22 80 0" stroke="#FF8F00" strokeWidth="2" fill="none" />
              <circle cx="40" cy="22" r="5" fill="#E65100" />
              <circle cx="40" cy="22" r="2.5" fill="#FFD700" />
              <ellipse cx="20" cy="10" rx="3" ry="7" fill="#2E7D32" transform="rotate(-20 20 10)" />
              <ellipse cx="60" cy="10" rx="3" ry="7" fill="#2E7D32" transform="rotate(20 60 10)" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // 22. Diwali Master Toran: Authentic Mango Leaves + Marigolds + Golden Series Lights
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

// ─── Dynamic Corner Widget (22 Culturally Authentic Motifs) ──────────────────
function DynamicCornerWidget({ festival, size = 32 }) {
  const festId = (festival.id || "").toLowerCase();

  // 1. Halloween Jack-o'-Lantern
  if (festId.includes("halloween")) {
    return (
      <svg width={size} height={Math.round(size * 0.92)} viewBox="0 0 70 65">
        <circle cx="35" cy="36" r="24" fill="rgba(255, 117, 24, 0.45)" />
        <path d="M 33 14 C 33 8 36 3 41 2 C 39 6 38 10 36 14 Z" fill="#2E7D32" />
        <ellipse cx="35" cy="38" rx="28" ry="22" fill="#FF7518" />
        <ellipse cx="23" cy="38" rx="16" ry="21" fill="#E65100" opacity="0.35" />
        <ellipse cx="47" cy="38" rx="16" ry="21" fill="#E65100" opacity="0.35" />
        <ellipse cx="35" cy="38" rx="12" ry="21" fill="#FFA726" opacity="0.4" />
        <polygon points="24,28 30,34 22,35" fill="#FFF59D" />
        <polygon points="46,28 48,35 40,34" fill="#FFF59D" />
        <polygon points="35,34 38,39 32,39" fill="#FFF59D" />
        <path d="M 21 44 Q 35 55 49 44 Q 44 51 35 51 Q 26 51 21 44 Z" fill="#FFF59D" />
        <rect x="29" y="46" width="3" height="3" fill="#BF360C" />
        <rect x="38" y="48" width="3" height="3" fill="#BF360C" />
      </svg>
    );
  }

  // 2. Christmas Bethlehem Star
  if (festId.includes("christmas")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <polygon points="30,4 37,21 56,21 41,33 47,52 30,40 13,52 19,33 4,21 23,21" fill="#FFD700" opacity="0.9" />
        <circle cx="30" cy="30" r="14" fill="rgba(255, 215, 0, 0.25)" />
      </svg>
    );
  }

  // 3. Valentine's Day Glowing Heart
  if (festId.includes("valentines")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="18" fill="rgba(233, 30, 99, 0.35)" />
        <path d="M 30 16 C 26 8 14 10 14 22 C 14 34 30 46 30 46 C 30 46 46 34 46 22 C 46 10 34 8 30 16 Z" fill="#E91E63" />
        <path d="M 30 20 C 27 14 18 15 18 24 C 18 32 30 41 30 41 C 30 41 42 32 42 24 C 42 15 33 14 30 20 Z" fill="#FF4081" />
      </svg>
    );
  }

  // 4. Lunar New Year Red Silk Lantern
  if (festId.includes("lunar") || festId.includes("chinese")) {
    return (
      <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 60 80">
        <circle cx="30" cy="35" r="18" fill="rgba(211, 47, 47, 0.35)" />
        <line x1="30" y1="5" x2="30" y2="16" stroke="#FFD700" strokeWidth="2" />
        <rect x="22" y="14" width="16" height="5" rx="2" fill="#FFD700" />
        <ellipse cx="30" cy="36" rx="18" ry="17" fill="#D32F2F" />
        <line x1="22" y1="19" x2="22" y2="53" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
        <line x1="38" y1="19" x2="38" y2="53" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
        <rect x="22" y="53" width="16" height="5" rx="2" fill="#FFD700" />
        <line x1="30" y1="58" x2="30" y2="76" stroke="#FFD700" strokeWidth="2.5" />
      </svg>
    );
  }

  // 5. Holi Brass Pichkari & Gulal Bowl
  if (festId.includes("holi")) {
    return (
      <svg width={size} height={Math.round(size * 0.9)} viewBox="0 0 70 65">
        <circle cx="35" cy="35" r="20" fill="rgba(233, 30, 99, 0.3)" />
        <ellipse cx="35" cy="46" rx="22" ry="8" fill="#D4AF37" />
        <circle cx="28" cy="44" r="6" fill="#E91E63" />
        <circle cx="42" cy="44" r="6" fill="#00E5FF" />
        <circle cx="35" cy="41" r="5" fill="#FFEB3B" />
        <line x1="14" y1="46" x2="48" y2="12" stroke="#B78103" strokeWidth="4" strokeLinecap="round" />
        <line x1="48" y1="12" x2="56" y2="6" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 6. Navratri Crossed Wooden Dandiya Sticks
  if (festId.includes("navratri")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="18" fill="rgba(255, 111, 0, 0.3)" />
        <line x1="10" y1="50" x2="50" y2="10" stroke="#FF8F00" strokeWidth="4" strokeLinecap="round" />
        <line x1="10" y1="10" x2="50" y2="50" stroke="#D81B60" strokeWidth="4" strokeLinecap="round" />
        <circle cx="30" cy="30" r="4" fill="#FFD700" />
      </svg>
    );
  }

  // 7. Pongal Clay Pot & Sugarcane
  if (festId.includes("pongal")) {
    return (
      <svg width={size} height={Math.round(size * 1.05)} viewBox="0 0 60 65">
        <circle cx="30" cy="36" r="20" fill="rgba(251, 192, 45, 0.3)" />
        <ellipse cx="30" cy="42" rx="18" ry="14" fill="#8D4925" />
        <ellipse cx="30" cy="28" rx="14" ry="5" fill="#FFF8E1" />
        <path d="M 22 26 Q 30 14 38 26" fill="#FFFFFF" />
        <line x1="44" y1="56" x2="54" y2="10" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Onam Pookalam Floral Carpet
  if (festId.includes("onam")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" fill="#E65100" />
        <circle cx="30" cy="30" r="21" fill="#FFB300" />
        <circle cx="30" cy="30" r="15" fill="#FFF8E1" />
        <circle cx="30" cy="30" r="9" fill="#2E7D32" />
        <circle cx="30" cy="30" r="4" fill="#D84315" />
      </svg>
    );
  }

  // 9. Raksha Bandhan Royal Golden Rakhi
  if (festId.includes("raksha") || festId.includes("rakhi")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <line x1="6" y1="30" x2="54" y2="30" stroke="#D32F2F" strokeWidth="3" />
        <circle cx="30" cy="30" r="15" fill="#FFD700" />
        <circle cx="30" cy="30" r="10" fill="#D32F2F" />
        <circle cx="30" cy="30" r="5" fill="#FFF8E1" />
      </svg>
    );
  }

  // 10. Ganesh Chaturthi Clay Ganesha & Modak
  if (festId.includes("ganesh")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="20" fill="rgba(255, 140, 0, 0.3)" />
        <path d="M 30 14 Q 38 14 38 26 Q 38 42 30 46 Q 22 42 22 26 Z" fill="#E65100" />
        <circle cx="28" cy="22" r="2.5" fill="#FFFDE7" />
        <path d="M 30 26 Q 34 34 40 34" stroke="#FFD700" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  // 11. Eid Damascus Brass Fanoos
  if (festId.includes("eid")) {
    return (
      <svg width={size} height={Math.round(size * 1.25)} viewBox="0 0 60 75">
        <circle cx="30" cy="36" r="18" fill="rgba(212, 175, 55, 0.35)" />
        <line x1="30" y1="4" x2="30" y2="14" stroke="#B78103" strokeWidth="1.5" />
        <polygon points="30,14 20,24 40,24" fill="#D4AF37" />
        <rect x="22" y="24" width="16" height="24" fill="#D4AF37" stroke="#996515" strokeWidth="0.8" />
        <circle cx="30" cy="36" r="3.5" fill="#FFD700" />
        <polygon points="22,48 38,48 30,58" fill="#B78103" />
      </svg>
    );
  }

  // 12. Thanksgiving Harvest Pumpkin
  if (festId.includes("thanksgiving")) {
    return (
      <svg width={size} height={Math.round(size * 0.9)} viewBox="0 0 70 65">
        <circle cx="35" cy="36" r="22" fill="rgba(230, 81, 0, 0.35)" />
        <path d="M 33 14 C 33 8 36 3 41 2 C 39 6 38 10 36 14 Z" fill="#4E342E" />
        <ellipse cx="35" cy="38" rx="28" ry="22" fill="#E65100" />
        <ellipse cx="23" cy="38" rx="16" ry="21" fill="#BF360C" opacity="0.35" />
        <ellipse cx="47" cy="38" rx="16" ry="21" fill="#BF360C" opacity="0.35" />
        <ellipse cx="35" cy="38" rx="12" ry="21" fill="#F57C00" opacity="0.5" />
      </svg>
    );
  }

  // 13. Hanukkah Menorah
  if (festId.includes("hanukkah")) {
    return (
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 70 75">
        <line x1="35" y1="20" x2="35" y2="65" stroke="#D4AF37" strokeWidth="3" />
        <ellipse cx="35" cy="65" rx="14" ry="4" fill="#D4AF37" />
        <path d="M 15 28 Q 15 48 35 48 Q 55 48 55 28" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <path d="M 22 34 Q 22 44 35 44 Q 48 44 48 34" stroke="#D4AF37" strokeWidth="1.6" fill="none" />
        {[15, 22, 29, 35, 41, 48, 55].map((x, i) => (
          <circle key={i} cx={x} cy={x === 35 ? 16 : 24} r="2" fill="#FFF59D" />
        ))}
      </svg>
    );
  }

  // 14. Vishu Kerala Nilavilakku
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

  // 15. New Year Champagne Flutes
  if (festId.includes("new-year") || festId.includes("newyear")) {
    return (
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 60 65">
        <circle cx="30" cy="32" r="18" fill="rgba(255, 215, 0, 0.3)" />
        <path d="M 22 16 L 26 34 L 26 48 L 20 50 L 32 50 L 26 48 L 26 34 Z" fill="#FFD700" opacity="0.8" />
        <path d="M 38 16 L 34 34 L 34 48 L 28 50 L 40 50 L 34 48 L 34 34 Z" fill="#FFE082" opacity="0.8" />
        <circle cx="30" cy="22" r="3" fill="#FFFFFF" />
      </svg>
    );
  }

  // 16. Makar Sankranti Diamond Fighter Kite
  if (festId.includes("sankranti") || festId.includes("uttarayan")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="18" fill="rgba(0, 176, 255, 0.3)" />
        <polygon points="30,8 50,30 30,52 10,30" fill="#FF6D00" />
        <line x1="30" y1="8" x2="30" y2="52" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M 10 30 Q 30 18 50 30" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  // 17. Dussehra Golden Bow & Arrow
  if (festId.includes("dussehra") || festId.includes("vijayadashami")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="18" fill="rgba(255, 140, 0, 0.35)" />
        <path d="M 16 12 Q 38 30 16 48" stroke="#FFD700" strokeWidth="3" fill="none" />
        <line x1="16" y1="12" x2="16" y2="48" stroke="#FFE082" strokeWidth="1.2" />
        <line x1="12" y1="30" x2="48" y2="30" stroke="#FF6D00" strokeWidth="2.5" />
        <polygon points="48,30 40,26 40,34" fill="#FFD700" />
      </svg>
    );
  }

  // 18. Easter Decorated Pastel Egg
  if (festId.includes("easter")) {
    return (
      <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 60 70">
        <circle cx="30" cy="38" r="18" fill="rgba(248, 187, 208, 0.35)" />
        <ellipse cx="30" cy="38" rx="20" ry="26" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="1.5" />
        <path d="M 12 36 Q 30 46 48 36" stroke="#80DEEA" strokeWidth="2.5" fill="none" />
        <path d="M 14 26 Q 30 36 46 26" stroke="#FFF59D" strokeWidth="2.5" fill="none" />
        <circle cx="30" cy="46" r="3" fill="#CE93D8" />
        <circle cx="22" cy="42" r="2.5" fill="#C8E6C9" />
        <circle cx="38" cy="42" r="2.5" fill="#C8E6C9" />
      </svg>
    );
  }

  // 19. Mid-Autumn Harvest Moon & Mooncake
  if (festId.includes("mid-autumn") || festId.includes("mooncake")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="24" fill="rgba(255, 213, 79, 0.35)" />
        <circle cx="30" cy="30" r="18" fill="#FFD54F" />
        <circle cx="30" cy="30" r="14" fill="#FFA000" stroke="#FFD54F" strokeWidth="1" />
        <path d="M 24 24 Q 30 20 36 24 Q 40 30 36 36 Q 30 40 24 36 Q 20 30 24 24 Z" fill="#FF8F00" opacity="0.6" />
      </svg>
    );
  }

  // 20. Vesak Blooming Sacred Lotus
  if (festId.includes("vesak") || festId.includes("buddha")) {
    return (
      <svg width={size} height={Math.round(size * 0.95)} viewBox="0 0 60 55">
        <circle cx="30" cy="30" r="18" fill="rgba(248, 187, 208, 0.35)" />
        <path d="M 30 10 C 24 22 22 36 30 44 C 38 36 36 22 30 10 Z" fill="#F48FB1" />
        <path d="M 22 22 C 14 28 14 38 24 44 C 28 38 26 28 22 22 Z" fill="#F8BBD0" />
        <path d="M 38 22 C 46 28 46 38 36 44 C 32 38 34 28 38 22 Z" fill="#F8BBD0" />
        <circle cx="30" cy="44" r="3" fill="#FFD54F" />
      </svg>
    );
  }

  // 21. Durga Puja Clay Dhunachi Incense Burner
  if (festId.includes("durga")) {
    return (
      <svg width={size} height={Math.round(size * 1.2)} viewBox="0 0 60 72">
        <circle cx="30" cy="24" r="16" fill="rgba(198, 40, 40, 0.25)" />
        <path d="M 28 8 Q 24 16 32 20 Q 28 24 30 30" stroke="#ECEFF1" strokeWidth="2" fill="none" opacity="0.75" />
        <path d="M 32 10 Q 36 18 28 22 Q 32 26 30 30" stroke="#ECEFF1" strokeWidth="1.5" fill="none" opacity="0.6" />
        <polygon points="16,30 44,30 38,48 22,48" fill="#C85A27" stroke="#8D3B16" strokeWidth="1" />
        <rect x="27" y="48" width="6" height="14" fill="#8D3B16" />
        <ellipse cx="30" cy="62" rx="14" ry="4" fill="#C85A27" />
      </svg>
    );
  }

  // 22. Classical Living Brass Diya (Diwali & Indian Festivals Default)
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
  promoCode = "UTSAV26",
  diyaSize,
  diyaPosition,
  particleDensity,
  effectIntensity,
  customPrimaryColor,
  storeInfo,
  storeProducts,
  // Discount props
  enableDiscount = true,
  discountType = "percentage",
  discountValue = 10,
  discountScope = "collection",
  discountCollection = "Snowboards",
  discountBadgeText = "🎃 10% OFF",
  discountAudience = "all",
  activeCategory = "visual_decor",
  // Urgency Timer props
  enableUrgencyTimer = true,
  enableFestiveTimer = true,
  enableCartTimer = true,
  enableProductTimer = true,
  cartTimerMinutes = 15,
  cartTimerUrgencyText = "🔥 Items reserved in cart for [TIME] — checkout before deals expire!",
  bannerStyle = {},
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
        <style>{`
          @keyframes utsavGhostFloat {
            0% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-7px) translateX(5px); }
            100% { transform: translateY(4px) translateX(-3px); }
          }
        `}</style>
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
              background:
                bannerStyle.bgType === "solid" ? (bannerStyle.bgColor || "#1A0A00")
                : bannerStyle.bgType === "gradient" ? `linear-gradient(${bannerStyle.gradientAngle || 90}deg, ${bannerStyle.bgColor || "#1A0A00"}, ${bannerStyle.bgColor2 || "#FF7518"})`
                : (festival.palette?.background || "#1A0A00"),
              color: bannerStyle.textColor || festival.palette?.highlight || "#FFF8DC",
              padding: ({ compact: isMobile ? "1px 6px" : "2px 8px", large: isMobile ? "7px 6px" : "10px 8px" })[bannerStyle.size] || (isMobile ? "3px 6px" : "5px 8px"),
              fontSize: `${(Number(bannerStyle.fontSize) || 13) * (isMobile ? 0.62 : 0.73)}px`,
              fontWeight: bannerStyle.bold ? 700 : 500,
              textTransform: bannerStyle.uppercase ? "uppercase" : "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: ({ left: "flex-start", right: "flex-end" })[bannerStyle.align] || "center",
              gap: "6px",
              borderBottom: bannerStyle.showBorder === false ? "none" : `1px solid ${bannerStyle.borderColor || festival.palette?.glow || "rgba(212, 175, 55, 0.3)"}`,
              flexShrink: 0,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {bannerText || festival.banner?.defaultText || `Happy ${festival.name}! Celebrate with special discounts.`}
            </span>
            {bannerStyle.ctaText && (
              <span style={{ background: bannerStyle.accentColor || "#FF7518", color: "#fff", borderRadius: "999px", padding: "0 6px", fontSize: "7.5px", fontWeight: 700, flexShrink: 0 }}>
                {bannerStyle.ctaText}
              </span>
            )}
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
              {promoCode || "UTSAV26"}
            </span>
            {enableUrgencyTimer && enableFestiveTimer && (
              <span
                style={{
                  background: "rgba(255, 117, 24, 0.25)",
                  border: "1px solid rgba(255, 117, 24, 0.5)",
                  color: "#FFD700",
                  borderRadius: "3px",
                  padding: "0 4px",
                  fontSize: "7.5px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ⏳ 02d:14h:32m
              </span>
            )}
            {enableDiscount && (
              <span
                style={{
                  background: "#FF7518",
                  color: "#FFFFFF",
                  borderRadius: "3px",
                  padding: "0 4px",
                  fontSize: "7.5px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                🏷️ {discountValue}% OFF
              </span>
            )}
          </div>
        )}

        {/* Top-Fixed Garland (if selected) */}
        {!showOriginal && enableEffects && garlandPlacement === "top_fixed" && garlandLayout !== "off" && (
          <div style={{ position: "relative", zIndex: 14, overflow: "visible", width: "100%", height: 0, flexShrink: 0, pointerEvents: "none" }}>
            <DynamicFestivalHeaderWidget
              festival={festival}
              isMobile={isMobile}
              height={isMobile ? 20 : 32}
              withLights={enableSeriesLights}
              lightsTheme={seriesLightsTheme}
            />
          </div>
        )}

        {/* Real Store Navigation Bar (Shopify Dawn Theme) */}
        <div
          style={{
            padding: isMobile ? "6px 10px" : "9px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E5E7EB",
            background: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          {/* Left: Nav Links */}
          <div style={{ display: "flex", gap: isMobile ? "8px" : "14px", fontSize: isMobile ? "8px" : "10px", color: "#18181B", fontWeight: 500 }}>
            <span style={{ textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 600 }}>Home</span>
            <span>Catalog</span>
            <span>Contact</span>
          </div>

          {/* Center: Store Brand Name */}
          <div style={{ fontWeight: 800, fontSize: isMobile ? "12px" : "15px", color: "#09090B", letterSpacing: "0.2px" }}>
            {storeInfo?.name || "utsav"}
          </div>

          {/* Right: Search, Account, Cart Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px", color: "#18181B" }}>
            <svg width={isMobile ? "11" : "13"} height={isMobile ? "11" : "13"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <svg width={isMobile ? "11" : "13"} height={isMobile ? "11" : "13"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <svg width={isMobile ? "11" : "13"} height={isMobile ? "11" : "13"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
        </div>

        {/* Scrollable Storefront Body */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", position: "relative", scrollbarWidth: "none" }}>
            {/* Below-Header Garland (Recommended) - Draped with 100% Transparency */}
            {!showOriginal && enableEffects && garlandPlacement === "below_header" && garlandLayout !== "off" && (
              <div
                style={{
                  position: "relative",
                  zIndex: 14,
                  overflow: "visible",
                  width: "100%",
                  height: 0,
                  marginTop: `${Math.round(garlandOffset * 0.4)}px`,
                  pointerEvents: "none",
                }}
              >
                <DynamicFestivalHeaderWidget
                  festival={festival}
                  isMobile={isMobile}
                  height={isMobile ? 22 : 36}
                  withLights={enableSeriesLights}
                  lightsTheme={seriesLightsTheme}
                />
              </div>
            )}

            {/* Dynamic Culturally Authentic Particles Overlay */}
            {!showOriginal && enableEffects && (
              <DynamicOverlayParticles
                festival={festival}
                density={particleDensity}
                intensity={effectIntensity}
                customColor={customPrimaryColor}
              />
            )}

            {/* Real Store Hero Image Banner (Shopify Dawn Snowboard Theme) */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: isMobile ? "150px" : "210px",
                backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.02)), url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                padding: isMobile ? "0 14px" : "0 28px",
              }}
            >
              {/* Dawn Left Overlay Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(6px)",
                  padding: isMobile ? "9px 12px" : "15px 18px",
                  borderRadius: "2px",
                  maxWidth: isMobile ? "160px" : "240px",
                  textAlign: "left",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                  position: "relative",
                  zIndex: 20,
                }}
              >
                <div style={{ fontSize: isMobile ? "11px" : "15px", fontWeight: 800, color: "#121212", margin: "0 0 3px 0", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                  Generated test data
                </div>
                <div style={{ fontSize: isMobile ? "7.5px" : "9px", color: "#4B5563", margin: "0 0 8px 0", lineHeight: 1.35 }}>
                  A theme and populated test store by Shopify to help you test commerce primitives.
                </div>
                <button
                  style={{
                    background: "#121212",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "2px",
                    padding: isMobile ? "3px 8px" : "4px 12px",
                    fontSize: isMobile ? "7.5px" : "9px",
                    fontWeight: 600,
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 30,
                    pointerEvents: "auto",
                  }}
                >
                  Shop products
                </button>
              </div>
            </div>

            {/* Featured Products Section (Shopify Dawn Snowboards) */}
            <div style={{ padding: isMobile ? "12px 10px 40px" : "16px 16px 45px", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: isMobile ? "11px" : "14px", fontWeight: 700, color: "#121212", textAlign: "left" }}>
                  Featured products {enableDiscount && discountScope === "collection" && (
                    <span style={{ fontSize: "10px", fontWeight: 500, color: "#FF7518" }}>
                      ({discountCollection})
                    </span>
                  )}
                </div>
                {enableDiscount && (
                  <span style={{ fontSize: "9px", color: "#FF7518", fontWeight: 600 }}>
                    🏷️ Event Deals Active
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr",
                  gap: isMobile ? "8px" : "12px",
                }}
              >
                {(storeProducts && storeProducts.length > 0 ? storeProducts.slice(0, 3) : [
                  {
                    title: "The Complete Snowboard",
                    price: "$885.00",
                    colors: ["#38EF7D", "#11998E"],
                  },
                  {
                    title: "The Multi-location Snowboard",
                    price: "$785.00",
                    colors: ["#4A90E2", "#9013FE"],
                  },
                  {
                    title: "The Collection Snowboard",
                    price: "$920.00",
                    colors: ["#F5A623", "#F8E71C"],
                  },
                ]).map((prod, i) => {
                  let finalPrice = prod.price;
                  let originalPrice = null;
                  if (enableDiscount) {
                    const numericPrice = parseFloat(prod.price.replace(/[^0-9.]/g, "")) || 800;
                    let discAmount = 0;
                    if (discountType === "percentage") {
                      discAmount = numericPrice * (discountValue / 100);
                    } else if (discountType === "fixed_amount") {
                      discAmount = discountValue;
                    } else if (discountType === "cart_size") {
                      discAmount = numericPrice >= discountMinSpend ? numericPrice * (discountValue / 100) : 0;
                    }
                    const discountedNum = Math.max(0, numericPrice - discAmount);
                    const prefix = prod.price.startsWith("₹") ? "₹" : "$";
                    finalPrice = `${prefix}${discountedNum.toFixed(2)}`;
                    originalPrice = prod.price;
                  }

                  return (
                    <div key={i} style={{ textAlign: "left", cursor: "pointer", position: "relative" }}>
                      <div
                        style={{
                          background: "#F4F4F5",
                          borderRadius: "4px",
                          height: isMobile ? "95px" : "125px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                          marginBottom: "5px",
                        }}
                      >
                        {prod.image ? (
                          <img src={prod.image} alt={prod.title} style={{ maxWidth: "80%", maxHeight: "85%", objectFit: "contain" }} />
                        ) : (
                          <div
                            style={{
                              width: "32px",
                              height: "85px",
                              borderRadius: "16px",
                              background: `linear-gradient(135deg, ${prod.colors?.[0] || '#00C9FF'} 0%, ${prod.colors?.[1] || '#92FE9D'} 100%)`,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: "rotate(-12deg)",
                            }}
                          >
                            <div style={{ width: "16px", height: "3px", background: "rgba(255,255,255,0.7)", borderRadius: "2px" }}></div>
                          </div>
                        )}
                        {/* Festive Discount Tag on Product */}
                        {enableDiscount && (
                          <span
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "#FF7518",
                              color: "#FFFFFF",
                              padding: isMobile ? "1px 4px" : "2px 6px",
                              borderRadius: "3px",
                              fontSize: isMobile ? "6.5px" : "8px",
                              fontWeight: 700,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              zIndex: 5,
                            }}
                          >
                            {discountBadgeText || `-${discountValue}%`}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: isMobile ? "8px" : "9.5px", fontWeight: 600, color: "#18181B", lineHeight: 1.25 }}>
                        {prod.title}
                      </div>
                      <div style={{ fontSize: isMobile ? "7.5px" : "9px", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        {originalPrice && (
                          <span style={{ textDecoration: "line-through", color: "#9CA3AF" }}>
                            {originalPrice}
                          </span>
                        )}
                        <span style={{ fontWeight: 700, color: "#18181B" }}>
                          {finalPrice}
                        </span>
                      </div>
                      {/* Flash Deal Urgency Text */}
                      {enableUrgencyTimer && enableProductTimer && (
                        <div style={{ fontSize: isMobile ? "6px" : "7.5px", color: "#DC2626", fontWeight: 600, marginTop: "2px" }}>
                          ⚡ Flash deal: 4 left in stock!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Floating Cart Urgency Reservation Pill (Only shown when configuring Urgency Timers as a preview of the Cart Page) */}
          {!showOriginal && enableUrgencyTimer && enableCartTimer && activeCategory === "urgency_timers" && (
            <div
              style={{
                position: "absolute",
                bottom: isMobile ? "8px" : "12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(18, 18, 18, 0.94)",
                color: "#FFFFFF",
                border: "1px solid #FF7518",
                borderRadius: "20px",
                padding: isMobile ? "3px 8px" : "4px 12px",
                fontSize: isMobile ? "7.5px" : "9px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                zIndex: 35,
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                backdropFilter: "blur(6px)",
              }}
            >
              <span>🔥</span>
              <span>Cart reserved for <strong style={{ color: "#FFD700", fontFamily: "monospace" }}>14:52</strong></span>
              <span style={{ background: "#FF7518", padding: "1px 5px", borderRadius: "10px", fontSize: isMobile ? "6.5px" : "7.5px" }}>Checkout</span>
            </div>
          )}

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
  const { festival, shop, storeInfo, storeProducts, config, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Active Category in Left Navigation
  const [activeCategory, setActiveCategory] = useState("visual_decor");

  // Device Mode: "desktop" | "mobile" | "side_by_side"
  const [deviceMode, setDeviceMode] = useState("side_by_side");

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

  // 🏷️ Festival Discounts & Offers State
  const [enableDiscount, setEnableDiscount] = useState(
    customSettings.discount?.enabled !== undefined ? Boolean(customSettings.discount.enabled) : true
  );
  const [discountType, setDiscountType] = useState(customSettings.discount?.type || "percentage");
  const [discountValue, setDiscountValue] = useState(Number(customSettings.discount?.value) || 10);
  const [discountScope, setDiscountScope] = useState(customSettings.discount?.scope || "collection");
  const [discountCollection, setDiscountCollection] = useState(customSettings.discount?.collection || "Snowboards");
  const [discountMinSpend, setDiscountMinSpend] = useState(Number(customSettings.discount?.minSpend) || 50);
  const [discountBadgeText, setDiscountBadgeText] = useState(() => {
    const raw = customSettings.discount?.badgeText;
    if (raw && !raw.includes("HALLOWEEN DEAL") && !raw.includes("FESTIVE DISCOUNT")) {
      return raw;
    }
    return `${festival.emoji || "🎃"} 10% OFF`;
  });
  const [discountAutoApply, setDiscountAutoApply] = useState(customSettings.discount?.autoApply ?? true);
  const [discountAudience, setDiscountAudience] = useState(customSettings.discount?.audience || "all");

  // 📣 Announcement Bar Style (persisted inside customColors JSON as `bannerStyle`)
  const [bannerStyle, setBannerStyle] = useState({
    bgType: "theme",
    bgColor: "#1A0A00",
    bgColor2: "#FF7518",
    gradientAngle: 90,
    textColor: "#F1F5F9",
    accentColor: "#FF7518",
    borderColor: "",
    showBorder: true,
    fontSize: 13,
    fontFamily: "inherit",
    bold: false,
    uppercase: false,
    letterSpacing: 0,
    size: "regular",
    align: "center",
    fullWidth: false,
    sticky: false,
    animation: "none",
    ctaText: "",
    ctaLink: "/collections/all",
    showCoupon: true,
    dismissible: true,
    extraMessages: "",
    rotateSeconds: 5,
    showOn: "all",
    hideOnMobile: false,
    hideOnDesktop: false,
    ...(customSettings.bannerStyle || {}),
  });
  const updateBanner = (key, val) => {
    setBannerStyle((prev) => ({ ...prev, [key]: val }));
    markDirty();
  };

  // ⏳ Urgency & Countdown Timers State
  const [enableUrgencyTimer, setEnableUrgencyTimer] = useState(
    customSettings.urgencyTimers?.enabled !== undefined ? Boolean(customSettings.urgencyTimers.enabled) : true
  );
  const [enableFestiveTimer, setEnableFestiveTimer] = useState(customSettings.urgencyTimers?.festiveTimer ?? true);
  const [enableCartTimer, setEnableCartTimer] = useState(customSettings.urgencyTimers?.cartTimer ?? true);
  const [enableProductTimer, setEnableProductTimer] = useState(customSettings.urgencyTimers?.productTimer ?? true);
  const [cartTimerMinutes, setCartTimerMinutes] = useState(Number(customSettings.urgencyTimers?.cartMinutes) || 15);
  const [cartTimerPosition, setCartTimerPosition] = useState(
    customSettings.urgencyTimers?.cartPosition || "above_checkout"
  );
  const [cartTimerUrgencyText, setCartTimerUrgencyText] = useState(
    customSettings.urgencyTimers?.cartText || "🔥 Items reserved in cart for [TIME] — checkout before deals expire!"
  );

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
    setEnableDiscount(true);
    setDiscountValue(10);
    setEnableUrgencyTimer(true);
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
        discount: {
          enabled: enableDiscount,
          type: discountType,
          value: discountValue,
          scope: discountScope,
          collection: discountCollection,
          minSpend: discountMinSpend,
          audience: discountAudience,
          badgeText: discountBadgeText,
          autoApply: discountAutoApply,
        },
        bannerStyle,
        urgencyTimers: {
          enabled: enableUrgencyTimer,
          festiveTimer: enableFestiveTimer,
          cartTimer: enableCartTimer,
          cartPosition: cartTimerPosition,
          productTimer: enableProductTimer,
          cartMinutes: cartTimerMinutes,
          cartText: cartTimerUrgencyText,
        },
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
      enableDiscount,
      discountType,
      discountValue,
      discountScope,
      discountCollection,
      discountMinSpend,
      discountAudience,
      discountBadgeText,
      discountAutoApply,
      enableUrgencyTimer,
      enableFestiveTimer,
      enableCartTimer,
      enableProductTimer,
      cartTimerMinutes,
      cartTimerPosition,
      cartTimerUrgencyText,
      bannerStyle,
      fetcher,
    ]
  );

  const terminology = getFestivalTerminology(festival?.id);

  // 8 Merchant-Friendly Categories with Intuitive Plain-Language Labels
  const categories = [
    { id: "visual_decor", label: "Festive Visuals & Decor", badge: garlandLayout !== "off" ? terminology.headerBadge : "Off" },
    { id: "floating_effects", label: "Falling & Floating Effects", badge: enableEffects ? "Active" : "Off" },
    { id: "discounts_offers", label: "Festival Discounts & Offers", badge: enableDiscount ? `${discountValue}% OFF` : "Off" },
    { id: "urgency_timers", label: "Urgency & Countdown Timers", badge: enableUrgencyTimer ? "Active" : "Off" },
    { id: "banner_announcements", label: "Announcement Banner", badge: enableBanner ? "Visible" : "Hidden" },
    { id: "theme_colors", label: "Colors & Atmosphere", badge: "WCAG AAA" },
    { id: "dates_schedule", label: "Dates & Scheduling", badge: scheduledStart ? "Scheduled" : "Manual" },
    { id: "store_settings", label: "Storefront & CTA Protection", badge: "Protected" },
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
          <a
            href={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=5db56cc4-c065-7d56-20a9-6eb82834fdc0ea9c3601/utsav-embed`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const themeUrl = `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=5db56cc4-c065-7d56-20a9-6eb82834fdc0ea9c3601/utsav-embed`;
              try {
                if (window.shopify && typeof window.shopify.open === "function") {
                  e.preventDefault();
                  window.shopify.open(themeUrl, "_blank");
                  return;
                }
              } catch (_) {}
              try {
                window.open(themeUrl, "_blank", "noopener,noreferrer");
              } catch (_) {}
            }}
            style={{
              textDecoration: "none",
              background: "#F1F8F5",
              border: "1px solid #95C9B4",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#008060",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            title="Open Shopify Theme Customizer to turn ON Utsav App Embed and click Save"
          >
            <span>⚙️ Enable in Theme</span>
            <span style={{ fontSize: "11px" }}>↗</span>
          </a>

          <a
            href={`https://${shop}/?utsav_preview=${festival.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const liveUrl = `https://${shop}/?utsav_preview=${festival.id}`;
              try {
                if (window.shopify && typeof window.shopify.open === "function") {
                  e.preventDefault();
                  window.shopify.open(liveUrl, "_blank");
                  return;
                }
              } catch (_) {}
              try {
                window.open(liveUrl, "_blank", "noopener,noreferrer");
              } catch (_) {}
            }}
            style={{
              textDecoration: "none",
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
          </a>

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

          {/* 1. FESTIVE VISUALS & DECOR CATEGORY */}
          {(activeCategory === "visual_decor" || activeCategory === "garlands_decorations" || activeCategory === "signature_effects") && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <ToggleSwitch
                  label={`Enable ${festival.name} Visual Decor`}
                  checked={enableEffects}
                  onChange={(val) => { setEnableEffects(val); markDirty(); }}
                  helpText="Drapes authentic spiderwebs, garlands, and corner motifs across your storefront."
                />
              </Box>

              {enableEffects && (
                <>
                  <Select
                    label={terminology.headerArchitectureLabel || "Spiderweb & Garland Architecture"}
                    options={terminology.headerArchitectureOptions || [
                      { label: "Top Spiderweb & Side Web Cascades", value: "top_and_sides" },
                      { label: "Top Spiderweb Only (Header Arch)", value: "top_only" },
                      { label: "Side Cascades Only (Screen Margins)", value: "sides_only" },
                      { label: "Off (No Web Framing)", value: "off" },
                    ]}
                    value={garlandLayout}
                    onChange={(val) => { setGarlandLayout(val); markDirty(); }}
                  />

                  <Select
                    label={terminology.dockingPositionLabel || "Framing Docking Position"}
                    helpText={terminology.dockingHelp || "Prevents framing from obstructing your logo or navigation menu."}
                    options={[
                      { label: "Below Navigation (Recommended — 100% Transparent)", value: "below_header" },
                      { label: "Top of Screen (Fixed 0px)", value: "top_fixed" },
                    ]}
                    value={garlandPlacement}
                    onChange={(val) => { setGarlandPlacement(val); markDirty(); }}
                  />

                  <LuxurySlider
                    label={terminology.offsetLabel || "Vertical Alignment Fine-Tuning"}
                    value={garlandOffset}
                    min={-40}
                    max={40}
                    step={2}
                    unit="px"
                    onChange={(val) => { setGarlandOffset(val); markDirty(); }}
                    helpText="Nudge the framing up or down in pixels to match your theme's exact header."
                  />

                  <Select
                    label={terminology.cornerPlacementLabel || "Corner Motif Placement"}
                    options={[
                      { label: "Bottom Corners (Default — Elegant)", value: "bottom_corners" },
                      { label: "Top Corners", value: "top_corners" },
                      { label: "All 4 Corners", value: "all_corners" },
                    ]}
                    value={diyaPosition}
                    onChange={(val) => { setDiyaPosition(val); markDirty(); }}
                  />

                  <Select
                    label={terminology.cornerSizeLabel || "Corner Motif Size"}
                    options={[
                      { label: "Subtle (Small)", value: "small" },
                      { label: "Balanced (Medium — Recommended)", value: "medium" },
                      { label: "Grand (Large)", value: "large" },
                    ]}
                    value={diyaSize}
                    onChange={(val) => { setDiyaSize(val); markDirty(); }}
                  />
                </>
              )}
            </BlockStack>
          )}

          {/* 2. FALLING & FLOATING EFFECTS CATEGORY */}
          {(activeCategory === "floating_effects" || activeCategory === "particles_lighting") && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <ToggleSwitch
                  label={`Enable Floating ${festival.id.includes("halloween") ? "Ghosts & Embers" : "Particles & Sparks"}`}
                  checked={enableSeriesLights}
                  onChange={(val) => { setEnableSeriesLights(val); markDirty(); }}
                  helpText="Ambient floating silhouettes that hover gently in safe margins without covering products."
                />
              </Box>

              {enableSeriesLights && (
                <>
                  <LuxurySlider
                    label="Particle Radiance & Intensity"
                    value={effectIntensity}
                    min={20}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(val) => { setEffectIntensity(val); markDirty(); }}
                    helpText="Controls the opacity and glow intensity of floating ghosts and embers."
                  />

                  <LuxurySlider
                    label={terminology.particleLabel || "Particle Density Budget"}
                    value={particleDensity}
                    min={6}
                    max={36}
                    step={2}
                    unit=" particles"
                    onChange={(val) => { setParticleDensity(val); markDirty(); }}
                    helpText="Maintains smooth 60 FPS performance across mobile and desktop."
                  />

                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#008060", fontSize: "14px" }}>🛡️</span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#202223" }}>CTA Safe Gutters Active</div>
                        <div style={{ fontSize: "11px", color: "#6D7175" }}>
                          Ghosts are constrained to peripheral gutters (outer 15% margins), never floating over Add to Cart or Buy Now buttons.
                        </div>
                      </div>
                    </div>
                  </Box>

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

          {/* 3. FESTIVAL DISCOUNTS & OFFERS CATEGORY */}
          {activeCategory === "discounts_offers" && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <ToggleSwitch
                  label={`Enable ${festival.name} Event Discount`}
                  checked={enableDiscount}
                  onChange={(val) => { setEnableDiscount(val); markDirty(); }}
                  helpText="Automatically displays discounted prices, sale badges, and promotional tags."
                />
              </Box>

              {enableDiscount && (
                <>
                  <Select
                    label="Discount Adjustment Type"
                    options={[
                      { label: "Percentage Off (e.g. 10%, 15%, 20%)", value: "percentage" },
                      { label: "Fixed Money Amount Off (e.g. $10, $25 Off)", value: "fixed_amount" },
                      { label: "Cart Spend Tier (Spend $X, Get Discount)", value: "cart_size" },
                    ]}
                    value={discountType}
                    onChange={(val) => { setDiscountType(val); markDirty(); }}
                  />

                  <TextField
                    label={discountType === "percentage" ? "Discount Percentage (%)" : "Discount Amount ($ / ₹)"}
                    type="number"
                    value={String(discountValue)}
                    onChange={(val) => { setDiscountValue(Number(val) || 0); markDirty(); }}
                    autoComplete="off"
                    helpText={discountType === "percentage" ? "Example: 10 for 10% off items." : "Example: 15 for $15 off."}
                  />

                  <Select
                    label="Applies To / Scope"
                    options={[
                      { label: "Specific Collection (Recommended — e.g. Snowboards)", value: "collection" },
                      { label: "All Store Products", value: "all" },
                      { label: "Featured Products Only", value: "specific_products" },
                    ]}
                    value={discountScope}
                    onChange={(val) => { setDiscountScope(val); markDirty(); }}
                  />

                  {discountScope === "collection" && (
                    <TextField
                      label="Target Collection Name"
                      value={discountCollection}
                      onChange={(val) => { setDiscountCollection(val); markDirty(); }}
                      autoComplete="off"
                      helpText="Products matching this collection will display sale badges and discounts."
                    />
                  )}

                  {discountType === "cart_size" && (
                    <TextField
                      label="Minimum Cart Spend ($ / ₹)"
                      type="number"
                      value={String(discountMinSpend)}
                      onChange={(val) => { setDiscountMinSpend(Number(val) || 0); markDirty(); }}
                      autoComplete="off"
                      helpText="Discount activates when cart total exceeds this value (e.g. $50)."
                    />
                  )}

                  <Select
                    label="Target Audience (Who Sees This Discount)"
                    options={[
                      { label: "All Store Visitors (Default)", value: "all" },
                      { label: "First-Time / New Visitors Only", value: "new_visitors" },
                      { label: "Returning Loyal Shoppers Only", value: "returning" },
                      { label: "High-Value Carts (Over Threshold)", value: "cart_threshold" },
                    ]}
                    value={discountAudience}
                    onChange={(val) => { setDiscountAudience(val); markDirty(); }}
                    helpText="Control which segment of shoppers receives this festive incentive."
                  />

                  <TextField
                    label="Sale Badge Tag Text"
                    value={discountBadgeText}
                    onChange={(val) => { setDiscountBadgeText(val); markDirty(); }}
                    autoComplete="off"
                    helpText="Displayed as a festive badge on product cards and banner."
                  />

                  <ToggleSwitch
                    label="Auto-Apply Discount at Checkout"
                    checked={discountAutoApply}
                    onChange={(val) => { setDiscountAutoApply(val); markDirty(); }}
                    helpText="Applies coupon code directly to shopper's checkout link."
                  />
                </>
              )}
            </BlockStack>
          )}

          {/* 4. URGENCY & COUNTDOWN TIMERS CATEGORY */}
          {activeCategory === "urgency_timers" && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <ToggleSwitch
                  label="Enable Urgency & Countdown Timers"
                  checked={enableUrgencyTimer}
                  onChange={(val) => { setEnableUrgencyTimer(val); markDirty(); }}
                  helpText="Creates psychological urgency with countdowns to boost conversion rates."
                />
              </Box>

              {enableUrgencyTimer && (
                <>
                  <ToggleSwitch
                    label="General Festive Holiday Countdown"
                    checked={enableFestiveTimer}
                    onChange={(val) => { setEnableFestiveTimer(val); markDirty(); }}
                    helpText="Shows live ticking countdown in the announcement bar (e.g. 02d : 14h : 32m : 18s)."
                  />

                  <ToggleSwitch
                    label="Add-to-Cart / Cart Reservation Timer"
                    checked={enableCartTimer}
                    onChange={(val) => { setEnableCartTimer(val); markDirty(); }}
                    helpText="Displays a sleek reservation pill ('🔥 Items reserved in cart for 14:59') to drive fast checkout."
                  />

                  {enableCartTimer && (
                    <>
                      <Select
                        label="Cart Reservation Duration"
                        options={[
                          { label: "10 Minutes (High Urgency)", value: 10 },
                          { label: "15 Minutes (Recommended Balance)", value: 15 },
                          { label: "30 Minutes (Relaxed Urgency)", value: 30 },
                        ]}
                        value={cartTimerMinutes}
                        onChange={(val) => { setCartTimerMinutes(Number(val)); markDirty(); }}
                      />

                      <Select
                        label="Cart Timer Placement"
                        options={[
                          { label: "Above Checkout Button (Inside Cart Drawer)", value: "above_checkout" },
                          { label: "Above Subtotal Row (Inside Cart Drawer)", value: "above_subtotal" },
                          { label: "Top of Cart Drawer (Header)", value: "drawer_top" },
                          { label: "Bottom-Right Floating Pill", value: "floating_bottom_right" },
                          { label: "Top-Right Floating Pill", value: "floating_top_right" },
                        ]}
                        value={cartTimerPosition}
                        onChange={(val) => { setCartTimerPosition(val); markDirty(); }}
                        helpText="Choose where the cart reservation timer appears so it never obstructs your checkout buttons."
                      />

                      <TextField
                        label="Cart Urgency Banner Text"
                        value={cartTimerUrgencyText}
                        onChange={(val) => { setCartTimerUrgencyText(val); markDirty(); }}
                        autoComplete="off"
                        helpText="Use [TIME] as placeholder for live ticking minutes:seconds."
                      />
                    </>
                  )}

                  <ToggleSwitch
                    label="Product Page Flash Deal Urgency"
                    checked={enableProductTimer}
                    onChange={(val) => { setEnableProductTimer(val); markDirty(); }}
                    helpText="Shows live '⚡ Flash deal: 4 left in stock' indicators above purchase buttons."
                  />
                </>
              )}
            </BlockStack>
          )}

          {/* 5. ANNOUNCEMENT BANNER CATEGORY */}
          {(activeCategory === "banner_announcements" || activeCategory === "banner_messaging") && (
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

                  <Divider />
                  <Text variant="headingSm" as="h3">Rotating Messages</Text>
                  <TextField
                    label="Extra Messages (one per line)"
                    value={bannerStyle.extraMessages}
                    onChange={(val) => updateBanner("extraMessages", val)}
                    multiline={3}
                    autoComplete="off"
                    helpText="Optional. These rotate with the main copy, fading between messages."
                  />
                  {bannerStyle.extraMessages.trim() && (
                    <LuxurySlider label="Seconds per message" value={Number(bannerStyle.rotateSeconds) || 5} min={2} max={15} step={1} unit="s" onChange={(v) => updateBanner("rotateSeconds", v)} />
                  )}

                  <Divider />
                  <Text variant="headingSm" as="h3">Call-to-Action Button</Text>
                  <TextField label="Button Text" value={bannerStyle.ctaText} onChange={(val) => updateBanner("ctaText", val)} autoComplete="off" helpText="Leave empty to hide the button." />
                  {bannerStyle.ctaText && (
                    <TextField label="Button Link" value={bannerStyle.ctaLink} onChange={(val) => updateBanner("ctaLink", val)} autoComplete="off" placeholder="/collections/all" />
                  )}
                  <ToggleSwitch label="Show Promo Code Badge" checked={bannerStyle.showCoupon !== false} onChange={(val) => updateBanner("showCoupon", val)} helpText="Hide the copy-code badge while keeping the code active." />

                  <Divider />
                  <Text variant="headingSm" as="h3">Colors & Background</Text>
                  <Select
                    label="Background Style"
                    options={[
                      { label: "Festival Theme Color (Default)", value: "theme" },
                      { label: "Solid Color", value: "solid" },
                      { label: "Two-Color Gradient", value: "gradient" },
                    ]}
                    value={bannerStyle.bgType}
                    onChange={(val) => updateBanner("bgType", val)}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      bannerStyle.bgType !== "theme" && ["bgColor", bannerStyle.bgType === "gradient" ? "Gradient Start" : "Background"],
                      bannerStyle.bgType === "gradient" && ["bgColor2", "Gradient End"],
                      ["textColor", "Text Color"],
                      ["accentColor", "Button & Code Accent"],
                    ].filter(Boolean).map(([key, label]) => (
                      <label key={key} style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontWeight: 600 }}>
                        {label}
                        <input type="color" value={bannerStyle[key] || "#000000"} onChange={(e) => updateBanner(key, e.target.value)} style={{ width: "100%", height: "34px", border: "1px solid #c9cccf", borderRadius: "8px", padding: "2px", background: "#fff", cursor: "pointer" }} />
                      </label>
                    ))}
                  </div>
                  {bannerStyle.bgType === "gradient" && (
                    <LuxurySlider label="Gradient Angle" value={Number(bannerStyle.gradientAngle) || 90} min={0} max={360} step={15} unit="°" onChange={(v) => updateBanner("gradientAngle", v)} />
                  )}
                  <ToggleSwitch label="Bottom Border Line" checked={bannerStyle.showBorder !== false} onChange={(val) => updateBanner("showBorder", val)} />

                  <Divider />
                  <Text variant="headingSm" as="h3">Typography & Size</Text>
                  <LuxurySlider label="Font Size" value={Number(bannerStyle.fontSize) || 13} min={10} max={22} step={1} unit="px" onChange={(v) => updateBanner("fontSize", v)} />
                  <LuxurySlider label="Letter Spacing" value={Number(bannerStyle.letterSpacing) || 0} min={0} max={4} step={0.5} unit="px" onChange={(v) => updateBanner("letterSpacing", v)} />
                  <Select
                    label="Font"
                    options={[
                      { label: "Match My Store Theme", value: "inherit" },
                      { label: "Modern Sans (System)", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
                      { label: "Elegant Serif", value: "Georgia, 'Times New Roman', serif" },
                      { label: "Monospace", value: "'Courier New', monospace" },
                    ]}
                    value={bannerStyle.fontFamily}
                    onChange={(val) => updateBanner("fontFamily", val)}
                  />
                  <ToggleSwitch label="Bold Text" checked={Boolean(bannerStyle.bold)} onChange={(val) => updateBanner("bold", val)} />
                  <ToggleSwitch label="UPPERCASE Text" checked={Boolean(bannerStyle.uppercase)} onChange={(val) => updateBanner("uppercase", val)} />
                  <Select
                    label="Bar Height"
                    options={[
                      { label: "Compact (Slim)", value: "compact" },
                      { label: "Regular", value: "regular" },
                      { label: "Large (Hero)", value: "large" },
                    ]}
                    value={bannerStyle.size}
                    onChange={(val) => updateBanner("size", val)}
                  />
                  <Select
                    label="Content Alignment"
                    options={[
                      { label: "Center", value: "center" },
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                    ]}
                    value={bannerStyle.align}
                    onChange={(val) => updateBanner("align", val)}
                  />
                  <ToggleSwitch label="Full-Width Content" checked={Boolean(bannerStyle.fullWidth)} onChange={(val) => updateBanner("fullWidth", val)} helpText="Off keeps content in a centered 1200px column." />

                  <Divider />
                  <Text variant="headingSm" as="h3">Motion & Behavior</Text>
                  <Select
                    label="Animation"
                    options={[
                      { label: "None", value: "none" },
                      { label: "Scrolling Marquee", value: "marquee" },
                      { label: "Shimmer Sweep (Festival Theme background)", value: "shimmer" },
                      { label: "Gentle Pulse", value: "pulse" },
                    ]}
                    value={bannerStyle.animation}
                    onChange={(val) => updateBanner("animation", val)}
                  />
                  <ToggleSwitch label="Stick to Top While Scrolling" checked={Boolean(bannerStyle.sticky)} onChange={(val) => updateBanner("sticky", val)} />
                  <ToggleSwitch label="Allow Visitors to Close It" checked={bannerStyle.dismissible !== false} onChange={(val) => updateBanner("dismissible", val)} />

                  <Divider />
                  <Text variant="headingSm" as="h3">Where It Appears</Text>
                  <Select
                    label="Pages"
                    options={[
                      { label: "All Pages", value: "all" },
                      { label: "Home Page Only", value: "home" },
                    ]}
                    value={bannerStyle.showOn}
                    onChange={(val) => updateBanner("showOn", val)}
                  />
                  <ToggleSwitch label="Hide on Mobile" checked={Boolean(bannerStyle.hideOnMobile)} onChange={(val) => updateBanner("hideOnMobile", val)} />
                  <ToggleSwitch label="Hide on Desktop" checked={Boolean(bannerStyle.hideOnDesktop)} onChange={(val) => updateBanner("hideOnDesktop", val)} />
                </>
              )}
            </BlockStack>
          )}

          {/* 6. THEME COLORS & ATMOSPHERE CATEGORY */}
          {(activeCategory === "theme_colors" || activeCategory === "colors_materials") && (
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
                helpText="Custom color applied to festive badges and lighting corona."
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

          {/* 7. DATES & SCHEDULING CATEGORY */}
          {(activeCategory === "dates_schedule" || activeCategory === "scheduling") && (
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

          {/* 8. STORE SETTINGS & CTA PROTECTION CATEGORY */}
          {(activeCategory === "store_settings" || activeCategory === "performance") && (
            <BlockStack gap="400">
              <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="150">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#008060", fontSize: "14px" }}>🛡️</span>
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>CTA Button Safe-Zone Protection</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#008060" }}>✓ Add to Cart & Buy Now buttons locked to z-index 99999</div>
                  <div style={{ fontSize: "11.5px", color: "#008060" }}>✓ Zero click interference or overlay blockage</div>
                  <div style={{ fontSize: "11.5px", color: "#008060" }}>✓ 60 FPS GPU-accelerated canvas (0.00 CLS)</div>
                </BlockStack>
              </Box>

              <ToggleSwitch
                label="Mobile Safe Zone Clearance"
                checked={safeZoneClearance}
                onChange={(val) => { setSafeZoneClearance(val); markDirty(); }}
                helpText="Prevents corner motifs from colliding with mobile bottom navigation bars or chat widgets."
              />

              <ToggleSwitch
                label="Celebratory Soundscape Chime"
                checked={enableAudio}
                onChange={(val) => { setEnableAudio(val); markDirty(); }}
                helpText="Subtle festive chime on shopper interaction. Muted by default."
              />

              <ToggleSwitch
                label="Mobile Tap Celebration Ripples"
                checked={tapInteraction}
                onChange={(val) => { setTapInteraction(val); markDirty(); }}
                helpText="Shoppers tapping screen trigger gentle ripples of festive sparkles."
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
                promoCode={promoCode}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
                storeInfo={storeInfo}
                storeProducts={storeProducts}
                enableDiscount={enableDiscount}
                discountType={discountType}
                discountValue={discountValue}
                discountScope={discountScope}
                discountCollection={discountCollection}
                discountBadgeText={discountBadgeText}
                discountAudience={discountAudience}
                enableUrgencyTimer={enableUrgencyTimer}
                enableFestiveTimer={enableFestiveTimer}
                enableCartTimer={enableCartTimer}
                enableProductTimer={enableProductTimer}
                cartTimerMinutes={cartTimerMinutes}
                cartTimerUrgencyText={cartTimerUrgencyText}
                bannerStyle={bannerStyle}
                activeCategory={activeCategory}
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
                promoCode={promoCode}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
                storeInfo={storeInfo}
                storeProducts={storeProducts}
                enableDiscount={enableDiscount}
                discountType={discountType}
                discountValue={discountValue}
                discountScope={discountScope}
                discountCollection={discountCollection}
                discountBadgeText={discountBadgeText}
                discountAudience={discountAudience}
                enableUrgencyTimer={enableUrgencyTimer}
                enableFestiveTimer={enableFestiveTimer}
                enableCartTimer={enableCartTimer}
                enableProductTimer={enableProductTimer}
                cartTimerMinutes={cartTimerMinutes}
                cartTimerUrgencyText={cartTimerUrgencyText}
                bannerStyle={bannerStyle}
                activeCategory={activeCategory}
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
                    promoCode={promoCode}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    particleDensity={particleDensity}
                    effectIntensity={effectIntensity}
                    customPrimaryColor={customPrimaryColor}
                    storeInfo={storeInfo}
                    storeProducts={storeProducts}
                    enableDiscount={enableDiscount}
                    discountType={discountType}
                    discountValue={discountValue}
                    discountScope={discountScope}
                    discountCollection={discountCollection}
                    discountBadgeText={discountBadgeText}
                    discountAudience={discountAudience}
                    enableUrgencyTimer={enableUrgencyTimer}
                    enableFestiveTimer={enableFestiveTimer}
                    enableCartTimer={enableCartTimer}
                    enableProductTimer={enableProductTimer}
                    cartTimerMinutes={cartTimerMinutes}
                    cartTimerUrgencyText={cartTimerUrgencyText}
                bannerStyle={bannerStyle}
                    activeCategory={activeCategory}
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
                    promoCode={promoCode}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    particleDensity={particleDensity}
                    effectIntensity={effectIntensity}
                    customPrimaryColor={customPrimaryColor}
                    storeInfo={storeInfo}
                    storeProducts={storeProducts}
                    enableDiscount={enableDiscount}
                    discountType={discountType}
                    discountValue={discountValue}
                    discountScope={discountScope}
                    discountCollection={discountCollection}
                    discountBadgeText={discountBadgeText}
                    discountAudience={discountAudience}
                    enableUrgencyTimer={enableUrgencyTimer}
                    enableFestiveTimer={enableFestiveTimer}
                    enableCartTimer={enableCartTimer}
                    enableProductTimer={enableProductTimer}
                    cartTimerMinutes={cartTimerMinutes}
                    cartTimerUrgencyText={cartTimerUrgencyText}
                bannerStyle={bannerStyle}
                    activeCategory={activeCategory}
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
                storeInfo={storeInfo}
                storeProducts={storeProducts}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
