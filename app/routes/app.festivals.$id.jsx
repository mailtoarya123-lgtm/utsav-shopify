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
import { REAL_FLOWERS } from "../assets/flowers/realFlowers.js";
import { REAL_LEAVES } from "../assets/leaves/realLeaves.js";
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
      enableBanner: false,
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

// ─── Visual Selector Card: Corner Placement ─────────────────────────────────
function VisualPlacementSelector({ label, value, onChange, helpText }) {
  const options = [
    {
      value: "bottom_corners",
      title: "Both Bottom",
      subtitle: "Left & Right",
      badge: "Popular",
      leftDot: true,
      rightDot: true,
    },
    {
      value: "bottom_left",
      title: "Left Corner",
      subtitle: "Bottom-Left only",
      leftDot: true,
      rightDot: false,
    },
    {
      value: "bottom_right",
      title: "Right Corner",
      subtitle: "Bottom-Right only",
      leftDot: false,
      rightDot: true,
    },
    {
      value: "off",
      title: "Off",
      subtitle: "No corner motifs",
      isOff: true,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #008060" : "1.5px solid #E1E3E5",
                background: isSelected ? "#F0FDF4" : "#FFFFFF",
                boxShadow: isSelected ? "0 0 0 1px #008060, 0 2px 6px rgba(0, 128, 96, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                padding: "8px 10px",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {/* Mini Browser Screen Schematic */}
              <div
                style={{
                  height: "38px",
                  borderRadius: "5px",
                  background: isSelected ? "#E8F5E9" : "#F6F6F7",
                  border: isSelected ? "1px solid #A5D6A7" : "1px solid #E4E5E7",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "3px 4px",
                }}
              >
                <div style={{ height: "4px", background: "#D1D5DB", borderRadius: "2px", width: "100%", opacity: 0.7 }} />
                {opt.isOff ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9CA3AF", fontSize: "14px", fontWeight: 700 }}>
                    ⊘
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", paddingBottom: "1px" }}>
                    {opt.leftDot ? (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#FF9800",
                          boxShadow: "0 0 6px #FF9800, 0 0 10px #FFD54F",
                          border: "1px solid #FFE082",
                        }}
                      />
                    ) : <span />}
                    {opt.rightDot ? (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#FF9800",
                          boxShadow: "0 0 6px #FF9800, 0 0 10px #FFD54F",
                          border: "1px solid #FFE082",
                        }}
                      />
                    ) : <span />}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#008060" : "#202223" }}>
                    {opt.title}
                  </span>
                  {opt.badge && (
                    <span style={{ fontSize: "9px", background: "#E3F1DF", color: "#008060", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "10px", color: "#6D7175" }}>{opt.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
      {helpText && (
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>{helpText}</span>
      )}
    </div>
  );
}

// ─── Visual Selector Card: Corner Motif Size ────────────────────────────────
function VisualSizeSelector({ label, value, onChange, helpText }) {
  const options = [
    { value: "small", label: "Small", px: "56px", iconScale: 16, detail: "Subtle" },
    { value: "medium", label: "Medium", px: "76px", iconScale: 22, detail: "Standard", badge: "Default" },
    { value: "large", label: "Large", px: "96px", iconScale: 28, detail: "Majestic" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #008060" : "1.5px solid #E1E3E5",
                background: isSelected ? "#F0FDF4" : "#FFFFFF",
                boxShadow: isSelected ? "0 0 0 1px #008060, 0 2px 6px rgba(0, 128, 96, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                padding: "8px 6px",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: isSelected ? "#E8F5E9" : "#F6F6F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: `${opt.iconScale}px`, lineHeight: 1 }}>🪔</span>
              </div>
              <div>
                <div style={{ fontSize: "11.5px", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#008060" : "#202223" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: "9.5px", color: "#6D7175" }}>{opt.px}</div>
              </div>
              {opt.badge && (
                <span style={{ fontSize: "8.5px", background: "#E3F1DF", color: "#008060", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>
                  {opt.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {helpText && (
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>{helpText}</span>
      )}
    </div>
  );
}


function getFlowerSrc(style, i) {
  const s = (style || "real_blend").toLowerCase();
  if (s === "real_marigold_orange") return REAL_FLOWERS.real_marigold_orange;
  if (s === "real_marigold_yellow") return REAL_FLOWERS.real_marigold_yellow;
  if (s === "real_blossom_pink") return REAL_FLOWERS.real_blossom_pink;
  if (s === "real_dahlia_sunset") return REAL_FLOWERS.real_dahlia_sunset;
  return (i % 2 === 0) ? REAL_FLOWERS.real_marigold_orange : REAL_FLOWERS.real_marigold_yellow;
}

// ─── Visual Selector Card: Garland Architecture ────────────────────────────
function VisualGarlandLayoutSelector({ label, value, onChange, helpText }) {
  const options = [
    {
      value: "top_and_sides",
      title: "Top & Both Sides",
      subtitle: "Full Framing",
      badge: "Popular",
      topGarland: true,
      sideGarlands: true,
    },
    {
      value: "top_only",
      title: "Top Toran Only",
      subtitle: "Header Arch",
      topGarland: true,
      sideGarlands: false,
    },
    {
      value: "sides_only",
      title: "Side Cascades Only",
      subtitle: "Screen Margins",
      topGarland: false,
      sideGarlands: true,
    },
    {
      value: "off",
      title: "Off",
      subtitle: "No Framing",
      isOff: true,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #008060" : "1.5px solid #E1E3E5",
                background: isSelected ? "#F0FDF4" : "#FFFFFF",
                boxShadow: isSelected ? "0 0 0 1px #008060, 0 2px 6px rgba(0, 128, 96, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                padding: "8px 10px",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {/* Mini Schematic */}
              <div
                style={{
                  height: "38px",
                  borderRadius: "5px",
                  background: isSelected ? "#E8F5E9" : "#F6F6F7",
                  border: isSelected ? "1px solid #A5D6A7" : "1px solid #E4E5E7",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {opt.topGarland && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "5px",
                      background: "linear-gradient(90deg, #FF9800, #FFD54F, #FF9800)",
                      boxShadow: "0 1px 3px rgba(255,152,0,0.5)",
                    }}
                  />
                )}
                {opt.sideGarlands && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        left: "2px",
                        width: "3px",
                        bottom: "3px",
                        background: "linear-gradient(180deg, #2E7D32, #FF9800, #2E7D32)",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "2px",
                        width: "3px",
                        bottom: "3px",
                        background: "linear-gradient(180deg, #2E7D32, #FF9800, #2E7D32)",
                        borderRadius: "1px",
                      }}
                    />
                  </>
                )}
                {opt.isOff && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9CA3AF", fontSize: "14px", fontWeight: 700 }}>
                    ⊘
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#008060" : "#202223" }}>
                    {opt.title}
                  </span>
                  {opt.badge && (
                    <span style={{ fontSize: "9px", background: "#E3F1DF", color: "#008060", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "10px", color: "#6D7175" }}>{opt.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
      {helpText && (
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>{helpText}</span>
      )}
    </div>
  );
}


// ─── Visual Selector Card: Real Flower Style ───────────────────────────────
function VisualFlowerSelector({ label, value, onChange, helpText }) {
  const flowerOptions = [
    {
      value: "real_blend",
      title: "Auspicious Blend",
      subtitle: "Marigold & Daisy",
      badge: "Classic",
      preview: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", position: "relative" }}>
          <img src={REAL_FLOWERS.real_marigold_orange} alt="Orange" style={{ width: "30px", height: "30px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))", position: "relative", zIndex: 1, marginRight: "-10px" }} />
          <img src={REAL_FLOWERS.real_marigold_yellow} alt="Yellow" style={{ width: "30px", height: "30px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))", position: "relative", zIndex: 2 }} />
        </div>
      ),
    },
    {
      value: "real_marigold_orange",
      title: "Royal Saffron",
      subtitle: "Orange Marigold",
      preview: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <img src={REAL_FLOWERS.real_marigold_orange} alt="Royal Saffron" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }} />
        </div>
      ),
    },
    {
      value: "real_marigold_yellow",
      title: "Golden Sunburst",
      subtitle: "Yellow Daisy",
      preview: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <img src={REAL_FLOWERS.real_marigold_yellow} alt="Golden Daisy" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }} />
        </div>
      ),
    },
    {
      value: "real_blossom_pink",
      title: "Blush Blossom",
      subtitle: "Pastel Blossom",
      preview: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <img src={REAL_FLOWERS.real_blossom_pink} alt="Blush Blossom" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }} />
        </div>
      ),
    },
    {
      value: "real_dahlia_sunset",
      title: "Sunset Dahlia",
      subtitle: "Magenta & Gold",
      preview: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <img src={REAL_FLOWERS.real_dahlia_sunset} alt="Sunset Dahlia" style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label || "Real Flower Style"}</span>
        {helpText && <span style={{ fontSize: "11px", color: "#6D7175" }}>{helpText}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
        {flowerOptions.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #008060" : "1.5px solid #E1E3E5",
                background: isSelected ? "#F0FDF4" : "#FFFFFF",
                boxShadow: isSelected ? "0 0 0 1px #008060, 0 2px 6px rgba(0, 128, 96, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                padding: "8px 10px",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  height: "44px",
                  borderRadius: "5px",
                  background: isSelected ? "#E8F5E9" : "#F6F6F7",
                  border: isSelected ? "1px solid #A5D6A7" : "1px solid #E4E5E7",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {opt.preview}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#008060" : "#202223" }}>
                    {opt.title}
                  </span>
                  {opt.badge && (
                    <span style={{ fontSize: "9px", background: "#E3F1DF", color: "#008060", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "10px", color: "#6D7175", marginTop: "2px" }}>
                  {opt.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Visual Selector Card: Toran Docking Position ───────────────────────────
function VisualDockingSelector({ label, value, onChange, helpText }) {
  const options = [
    {
      value: "below_header",
      title: "Below Navigation",
      subtitle: "Recommended — 100% Transparent",
      badge: "Standard",
      isBelow: true,
    },
    {
      value: "top_fixed",
      title: "Top of Screen",
      subtitle: "Fixed 0px Ceiling",
      isBelow: false,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #008060" : "1.5px solid #E1E3E5",
                background: isSelected ? "#F0FDF4" : "#FFFFFF",
                boxShadow: isSelected ? "0 0 0 1px #008060, 0 2px 6px rgba(0, 128, 96, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                padding: "8px 10px",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {/* Mini Schematic */}
              <div
                style={{
                  height: "36px",
                  borderRadius: "5px",
                  background: isSelected ? "#E8F5E9" : "#F6F6F7",
                  border: isSelected ? "1px solid #A5D6A7" : "1px solid #E4E5E7",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {opt.isBelow ? (
                  <>
                    <div style={{ height: "12px", background: "#18181B", width: "100%", display: "flex", alignItems: "center", padding: "0 4px" }}>
                      <div style={{ width: "12px", height: "3px", background: "#FFFFFF", borderRadius: "1px", opacity: 0.8 }} />
                    </div>
                    <div style={{ height: "4px", background: "linear-gradient(90deg, #FF9800, #FFD54F, #FF9800)", width: "100%" }} />
                  </>
                ) : (
                  <>
                    <div style={{ height: "4px", background: "linear-gradient(90deg, #FF9800, #FFD54F, #FF9800)", width: "100%" }} />
                    <div style={{ height: "12px", background: "#18181B", width: "100%", display: "flex", alignItems: "center", padding: "0 4px" }}>
                      <div style={{ width: "12px", height: "3px", background: "#FFFFFF", borderRadius: "1px", opacity: 0.8 }} />
                    </div>
                  </>
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#008060" : "#202223" }}>
                    {opt.title}
                  </span>
                  {opt.badge && (
                    <span style={{ fontSize: "9px", background: "#E3F1DF", color: "#008060", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "10px", color: "#6D7175" }}>{opt.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
      {helpText && (
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>{helpText}</span>
      )}
    </div>
  );
}

// ─── Visual Selector Card: Corner Motif Style ───────────────────────────────
function VisualMotifSelector({ label, value, options = [], festival, onChange, helpText }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#202223" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                borderRadius: "8px",
                border: isSelected ? "2px solid #008060" : "1.5px solid #E1E3E5",
                background: isSelected ? "#F0FDF4" : "#FFFFFF",
                boxShadow: isSelected ? "0 0 0 1px #008060, 0 2px 6px rgba(0, 128, 96, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                padding: "8px",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: isSelected ? "#E8F5E9" : "#F6F6F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <DynamicCornerWidget festival={festival} size={28} cornerMotif={opt.value} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? "#008060" : "#202223",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={opt.label}
                >
                  {opt.label.replace(/^[^\s]+\s*/, "")}
                </span>
                <span style={{ fontSize: "9.5px", color: "#6D7175" }}>Authentic Symbol</span>
              </div>
            </div>
          );
        })}
      </div>
      {helpText && (
        <span style={{ fontSize: "11.5px", color: "#6D7175", lineHeight: "15px" }}>{helpText}</span>
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

// ─── Festival Corner Motif Catalog (Multiple Iconic Motifs per Festival) ──
export function getFestivalCornerMotifOptions(festivalId = "") {
  const fest = (festivalId || "").toLowerCase();

  // 1. Halloween
  if (fest.includes("halloween")) {
    return [
      { label: "🎃 Jack-o'-Lantern (Carved Pumpkin)", value: "jack_o_lantern" },
      { label: "👻 Spectral Ghost (Glowing Haunt)", value: "ghost" },
      { label: "🦇 Vampire Bat (Winged Silhouette)", value: "bat" },
      { label: "🧙‍♀️ Enchanted Witch Hat", value: "witch_hat" },
      { label: "💀 Haunted Candy Skull", value: "skull" },
    ];
  }

  // 2. Christmas
  if (fest.includes("christmas")) {
    return [
      { label: "⭐ Radiant Bethlehem Star", value: "star" },
      { label: "🌿 Pine Wreath & Red Ribbon", value: "wreath" },
      { label: "🔔 Golden Holiday Jingle Bell", value: "jingle_bell" },
      { label: "🎄 Evergreen Christmas Tree", value: "tree" },
      { label: "🍬 Festive Peppermint Cane", value: "candy_cane" },
    ];
  }

  // 3. Valentine's Day
  if (fest.includes("valentines")) {
    return [
      { label: "💖 Glowing Satin Heart", value: "heart" },
      { label: "🌹 Velvet Rose Blossom", value: "rose" },
      { label: "🏹 Cupid's Bow & Heart Arrow", value: "cupid" },
      { label: "✨ Dual Entwined Hearts", value: "double_heart" },
    ];
  }

  // 4. Lunar New Year
  if (fest.includes("lunar") || fest.includes("chinese")) {
    return [
      { label: "🏮 Red Silk Hanging Lantern", value: "lantern" },
      { label: "🪙 Golden Sycee Yuanbao Ingot", value: "sycee" },
      { label: "🧧 Auspicious Red Envelope (Hongbao)", value: "hongbao" },
      { label: "🪢 Mystic Endless Lucky Knot", value: "lucky_knot" },
    ];
  }

  // 5. Holi
  if (fest.includes("holi")) {
    return [
      { label: "🎨 Brass Pichkari & Gulal Bowl", value: "pichkari_bowl" },
      { label: "🌈 Sacred Gulal Color Thali", value: "gulal_thali" },
      { label: "💧 Vibrant Water Balloon Splatter", value: "water_splatter" },
    ];
  }

  // 6. Navratri
  if (fest.includes("navratri")) {
    return [
      { label: "💃 Crossed Wooden Dandiya Sticks", value: "dandiya" },
      { label: "🪔 Sacred Garba Clay Lamp", value: "garba_pot" },
      { label: "🔱 Divine Durga Trishul & Crescent", value: "trishul" },
    ];
  }

  // 7. Pongal
  if (fest.includes("pongal")) {
    return [
      { label: "🌾 Boiling Clay Pongal Pot & Milk", value: "pongal_pot" },
      { label: "🎋 Sweet Sugarcane Stalks", value: "sugarcane" },
      { label: "☀️ Surya Bhagavan Sun Disc", value: "surya_sun" },
    ];
  }

  // 8. Onam
  if (fest.includes("onam")) {
    return [
      { label: "🌸 Pookalam Floral Carpet Ring", value: "pookalam" },
      { label: "⛵ Aranmula Snake Boat (Vallam)", value: "snake_boat" },
      { label: "🪔 Kerala Nilavilakku Brass Lamp", value: "nilavilakku" },
    ];
  }

  // 9. Raksha Bandhan
  if (fest.includes("raksha") || fest.includes("rakhi")) {
    return [
      { label: "🧵 Royal Zari Rosette Rakhi", value: "royal_rakhi" },
      { label: "🦚 Peacock Feather Divine Rakhi", value: "peacock_rakhi" },
      { label: "🎁 Festive Shagun Gift Box", value: "shagun_gift" },
    ];
  }

  // 10. Ganesh Chaturthi
  if (fest.includes("ganesh")) {
    return [
      { label: "🐘 Sacred Clay Ganesha Silhouette", value: "ganesha_clay" },
      { label: "🥟 Golden Steamed Modak Prasadam", value: "modak_golden" },
      { label: "🪷 Lotus Throne & Durva Grass", value: "lotus_modak" },
    ];
  }

  // 11. Eid-ul-Fitr
  if (fest.includes("eid")) {
    return [
      { label: "🏮 Damascus Brass Fanoos Lantern", value: "fanoos" },
      { label: "🌙 Golden Hilal Crescent & Star", value: "crescent_star" },
      { label: "🕌 Arabesque Minaret Silhouette", value: "minaret" },
    ];
  }

  // 12. Thanksgiving
  if (fest.includes("thanksgiving")) {
    return [
      { label: "🎃 Harvest Field Pumpkin", value: "harvest_pumpkin" },
      { label: "🍂 Golden Autumn Maple Leaves & Acorn", value: "acorn_leaf" },
      { label: "🌽 Cornucopia Horn of Plenty", value: "cornucopia" },
    ];
  }

  // 13. Hanukkah
  if (fest.includes("hanukkah")) {
    return [
      { label: "🕎 Classical Nine-Branch Menorah", value: "menorah" },
      { label: "⭐ Radiant Star of David (Magen David)", value: "star_of_david" },
      { label: "🪙 Golden Dreidel & Gelt Coin", value: "dreidel" },
    ];
  }

  // 14. Vishu
  if (fest.includes("vishu")) {
    return [
      { label: "🪔 Traditional Cast Nilavilakku Lamp", value: "nilavilakku" },
      { label: "🌿 Golden Kanikonna Blossom Sprig", value: "kanikonna" },
      { label: "✨ Auspicious Vishukkani Uruli", value: "kani_uruli" },
    ];
  }

  // 15. New Year
  if (fest.includes("new-year") || fest.includes("newyear")) {
    return [
      { label: "🥂 Crystal Champagne Flutes Toast", value: "champagne" },
      { label: "⏰ Midnight Countdown Clock (12:00)", value: "clock" },
      { label: "🎆 Midnight Radiant Sparkler Star", value: "sparkler" },
    ];
  }

  // 16. Makar Sankranti
  if (fest.includes("sankranti") || fest.includes("uttarayan")) {
    return [
      { label: "🪁 Diamond Fighter Kite (Patang)", value: "kite" },
      { label: "🍯 Sweet Tilgul Sesame Bowl", value: "tilgul_pot" },
      { label: "☀️ Golden Uttarayan Sun Wheel", value: "sun_wheel" },
    ];
  }

  // 17. Dussehra
  if (fest.includes("dussehra") || fest.includes("vijayadashami")) {
    return [
      { label: "🏹 Golden Kodanda Bow & Arrow", value: "bow_arrow" },
      { label: "🌿 Auspicious Shami Sacred Leaves", value: "shami_leaf" },
      { label: "✨ Radiant Triumphant Victory Torch", value: "victory_torch" },
    ];
  }

  // 18. Easter
  if (fest.includes("easter")) {
    return [
      { label: "🐣 Decorated Pastel Spring Egg", value: "easter_egg" },
      { label: "🐰 Joyful Spring Easter Bunny", value: "bunny" },
      { label: "🌸 White Easter Lily Blossom", value: "easter_lily" },
    ];
  }

  // 19. Mid-Autumn
  if (fest.includes("mid-autumn") || fest.includes("mooncake")) {
    return [
      { label: "🥮 Luminous Golden Mooncake", value: "mooncake" },
      { label: "🌕 Full Harvest Moonlight Pearl", value: "harvest_moon" },
      { label: "🏮 Floating Sky Lantern", value: "sky_lantern" },
    ];
  }

  // 20. Vesak
  if (fest.includes("vesak") || fest.includes("buddha")) {
    return [
      { label: "🪷 Blooming Sacred Pink Lotus", value: "sacred_lotus" },
      { label: "☸️ Golden Eightfold Dhamma Wheel", value: "dhamma_wheel" },
      { label: "✨ Meditative Bodhi Leaf Aura", value: "bodhi_leaf" },
    ];
  }

  // 21. Durga Puja
  if (fest.includes("durga")) {
    return [
      { label: "🔱 Clay Dhunachi Incense Burner", value: "dhunachi" },
      { label: "🐚 Sacred White Shankha (Conch)", value: "shankha" },
      { label: "🌾 Swaying Autumn Kash Reeds", value: "kash_reed" },
    ];
  }

  // Default: Diwali & Indian Celebrations
  return [
    { label: "🌿 Auspicious Mango Leaf Bunch", value: "mango_bunch" },
    { label: "🪔 Royal Handcrafted Brass Diya", value: "royal_brass" },
    { label: "🏺 Rustic Terracotta Clay Diya", value: "terracotta_clay" },
    { label: "✨ Floating Marigold Floral Urli", value: "marigold_urli" },
    { label: "🔥 Hammered Antique Copper Diya", value: "antique_copper" },
    { label: "🌸 Auspicious Deepavali Rangoli Diya", value: "rangoli_diya" },
  ];
}

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
      cornerName: "Corner Motif Icon",
      cornerMotifLabel: "Corner Halloween Motif / Icon",
      cornerSizeLabel: "Corner Motif Size",
      cornerPlacementLabel: "Corner Motif Placement",
      secondaryToggleLabel: "Enable Soft Eerie Glow & Mist",
      secondaryToggleHelp: "Atmospheric amber candlelight flicker and subtle misty twilight luminescence.",
      lightsThemeLabel: "Eerie Lighting Palette",
      lightsThemeOptions: [
        { label: "Spooky Amber Candlelight (Warm)", value: "amber_radiance" },
        { label: "Mystic Violet Glow", value: "mystic_purple" },
        { label: "Phantom Emerald Slime", value: "phantom_green" },
        { label: "Moonlit Silver Fog", value: "pearl_white" },
      ],
      particleRadianceLabel: "Ghost Luminescence & Eerie Glow",
      particleRadianceHelp: "Controls the atmospheric opacity and spectral glow of floating ghosts and candlelight embers.",
      particleLabel: "Ghost Silhouette & Mist Density",
      particleHelp: "Controls the count of drifting ghost silhouettes and atmospheric embers at smooth 60 FPS.",
      particleUnit: " ghosts/wisps",
      audioLabel: "Atmospheric Chime / Eerie Soundscape",
      audioHelp: "Plays a gentle, subtle atmospheric chime on shopper interaction. Muted by default.",
      safeZoneHelp: "Prevents corner motifs from colliding with mobile bottom navigation bars or chat widgets.",
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
        {/* Spectral Ghosts hovering along safe gutters */}
        {[
          { left: "5%", top: "22%", size: 24, delay: "0s", duration: "7s", opacity: 0.8 },
          { left: "8%", top: "65%", size: 26, delay: "3.5s", duration: "8.5s", opacity: 0.75 },
          { left: "91%", top: "20%", size: 22, delay: "1.8s", duration: "7.8s", opacity: 0.8 },
          { left: "93%", top: "70%", size: 28, delay: "4s", duration: "9s", opacity: 0.7 },
        ].map((g, idx) => (
          <div
            key={`ghost-${idx}`}
            style={{
              position: "absolute",
              left: g.left,
              top: g.top,
              width: `${g.size}px`,
              height: `${Math.round(g.size * 1.25)}px`,
              opacity: g.opacity,
              filter: "drop-shadow(0 0 10px rgba(255, 117, 24, 0.55))",
              animation: `utsavGhostFloat ${g.duration} ease-in-out infinite alternate`,
              animationDelay: g.delay,
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 32 38" width="100%" height="100%">
              <path
                d="M 16 3 C 8 3 4 10 4 18 C 4 27 6 34 8 33 C 10 32 12 35 14 33 C 16 31 18 35 20 33 C 22 31 24 35 26 33 C 28 35 28 27 28 18 C 28 10 24 3 16 3 Z"
                fill="rgba(240, 235, 255, 0.92)"
              />
              <ellipse cx="11" cy="14" rx="2.2" ry="3" fill="#1A1528" />
              <ellipse cx="21" cy="14" rx="2.2" ry="3" fill="#1A1528" />
              <ellipse cx="16" cy="20" rx="1.8" ry="2.4" fill="#1A1528" />
            </svg>
          </div>
        ))}

        {/* Eerie Twilight Spectral Wisps (curved soft vapor instead of generic particles) */}
        {[...Array(Math.min(count, 12))].map((_, i) => (
          <div
            key={`wisp-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 19 + 7) % 88 + 6}%`,
              top: `${(i * 23 + 13) % 82 + 10}%`,
              width: `${(i % 3) * 6 + 18}px`,
              height: `${(i % 2) * 4 + 8}px`,
              borderRadius: "50%",
              background: i % 2 === 0
                ? "radial-gradient(ellipse, rgba(255, 117, 24, 0.45) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(170, 0, 255, 0.35) 0%, transparent 70%)",
              filter: "blur(2px)",
              animation: `utsavEeriePulse ${(i % 3) + 4}s ease-in-out infinite alternate`,
              pointerEvents: "none",
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

function DynamicFestivalHeaderWidget({ festival, isMobile, height = 32, withLights = true, lightsTheme = "warm_gold", garlandStyle = "real_blend" }) {
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
            <image href={REAL_LEAVES.real_mango_leaf} x={6} y={0} width={12} height={34} preserveAspectRatio="none" />
            <image href={REAL_LEAVES.real_mango_leaf} x={32} y={0} width={12} height={34} preserveAspectRatio="none" />
            <image href={REAL_LEAVES.real_mango_leaf} x={58} y={0} width={12} height={34} preserveAspectRatio="none" />
            <image href={REAL_LEAVES.real_mango_leaf} x={84} y={0} width={12} height={34} preserveAspectRatio="none" />

            <path d="M 0 5 Q 56 34 112 5" stroke="#C62828" strokeWidth="1.6" fill="none" opacity="0.7" />

            {/* Series Lights Wire Swag (BEHIND the flowers) */}
            {withLights && (
              <g>
                <path d="M 0 8 Q 56 37 112 8" stroke="#0D2B17" strokeWidth="1.4" fill="none" opacity="0.9" />
                <circle cx="14" cy="14" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#FF5252" : "#FFD700"} />
                <circle cx="38" cy="24" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#00E676" : "#FFD700"} />
                <circle cx="56" cy="28" r="3.2" fill={lightsTheme === "festive_multicolor" ? "#FFD700" : "#FFF9C4"} />
                <circle cx="74" cy="24" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#448AFF" : "#FFD700"} />
                <circle cx="98" cy="14" r="2.8" fill={lightsTheme === "festive_multicolor" ? "#E040FB" : "#FFD700"} />
              </g>
            )}

            {/* Real Cutout Photographic Flowers along the arc (ON TOP of wire) */}
            <image href={getFlowerSrc(garlandStyle, 0)} x={-7} y={-2} width={15} height={15} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc(garlandStyle, 1)} x={20} y={11} width={16} height={16} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc(garlandStyle, 2)} x={48} y={18} width={17} height={17} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc(garlandStyle, 3)} x={76} y={11} width={16} height={16} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc(garlandStyle, 4)} x={104} y={-2} width={15} height={15} preserveAspectRatio="xMidYMid meet" />
          </g>
        ))}
        {/* Top Left & Right Corner Mango Leaf Bunches */}
        <image href={REAL_LEAVES.real_leaf_bunch_left} x={0} y={0} width={42} height={42} preserveAspectRatio="xMidYMid meet" />
        <image href={REAL_LEAVES.real_leaf_bunch_right} x={518} y={0} width={42} height={42} preserveAspectRatio="xMidYMid meet" />
      </svg>
    </div>
  );
}

// ─── Dynamic Corner Widget (Multi-Motif Support Across All Festivals) ────────
function DynamicCornerWidget({ festival, size = 32, cornerMotif }) {
  const festId = (festival.id || "").toLowerCase();
  const motif = (cornerMotif || "").toLowerCase();

  if (motif === "mango_bunch" || motif === "leaves_bunch" || motif === "mango_leaves") {
    return (
      <div style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={REAL_LEAVES.real_leaf_bunch_motif} alt="Auspicious Mango Leaf Bunch" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0, 60, 15, 0.45))" }} />
      </div>
    );
  }

  // 1. Halloween Motifs
  if (festId.includes("halloween")) {
    if (motif === "ghost") {
      return (
        <svg width={size} height={Math.round(size * 1.05)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 10px rgba(224, 231, 255, 0.7))" }}>
          <circle cx="30" cy="30" r="22" fill="rgba(199, 210, 254, 0.3)" />
          <path d="M 16 34 C 16 16 44 16 44 34 C 44 48 38 52 35 48 C 32 44 28 54 24 48 C 20 44 16 52 16 34 Z" fill="#F1F5F9" />
          <ellipse cx="24" cy="28" rx="3.5" ry="4.5" fill="#0F172A" />
          <ellipse cx="36" cy="28" rx="3.5" ry="4.5" fill="#0F172A" />
          <ellipse cx="30" cy="38" rx="4" ry="6" fill="#0F172A" />
          <circle cx="25" cy="26" r="1.2" fill="#FFFFFF" />
          <circle cx="37" cy="26" r="1.2" fill="#FFFFFF" />
        </svg>
      );
    }
    if (motif === "bat") {
      return (
        <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 70 50" style={{ filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))" }}>
          <circle cx="35" cy="25" r="18" fill="rgba(147, 51, 234, 0.25)" />
          <path d="M 35 18 Q 42 6 56 10 Q 50 20 62 26 Q 48 28 42 38 Q 38 28 35 30 Q 32 28 28 38 Q 22 28 8 26 Q 20 20 14 10 Q 28 6 35 18 Z" fill="#18181B" />
          <circle cx="32" cy="22" r="1.5" fill="#EF4444" />
          <circle cx="38" cy="22" r="1.5" fill="#EF4444" />
        </svg>
      );
    }
    if (motif === "witch_hat") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(147, 51, 234, 0.7))" }}>
          <circle cx="30" cy="32" r="20" fill="rgba(147, 51, 234, 0.3)" />
          <ellipse cx="30" cy="46" rx="26" ry="6" fill="#18181B" />
          <path d="M 18 45 L 29 12 Q 33 6 42 8 Q 36 18 35 24 L 42 45 Z" fill="#27272A" />
          <path d="M 20 42 Q 30 40 40 42 L 41 45 Q 30 43 19 45 Z" fill="#9333EA" />
          <rect x="27" y="40.5" width="6" height="5" rx="1" fill="#FBBF24" />
        </svg>
      );
    }
    if (motif === "skull") {
      return (
        <svg width={size} height={Math.round(size * 1.05)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))" }}>
          <circle cx="30" cy="30" r="22" fill="rgba(251, 191, 36, 0.25)" />
          <path d="M 16 26 C 16 12 44 12 44 26 C 44 34 40 40 37 42 L 37 50 L 23 50 L 23 42 C 20 40 16 34 16 26 Z" fill="#F4F4F5" />
          <circle cx="23" cy="26" r="5" fill="#18181B" />
          <circle cx="37" cy="26" r="5" fill="#18181B" />
          <polygon points="30,32 27,38 33,38" fill="#18181B" />
          <line x1="26" y1="45" x2="26" y2="49" stroke="#18181B" strokeWidth="1.5" />
          <line x1="30" y1="45" x2="30" y2="49" stroke="#18181B" strokeWidth="1.5" />
          <line x1="34" y1="45" x2="34" y2="49" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );
    }
    // Default Halloween: Carved Jack-o'-Lantern
    return (
      <svg width={size} height={Math.round(size * 0.92)} viewBox="0 0 70 65" style={{ filter: "drop-shadow(0 0 12px rgba(255, 117, 24, 0.75))" }}>
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

  // 2. Christmas Motifs
  if (festId.includes("christmas")) {
    if (motif === "wreath") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(46, 125, 50, 0.7))" }}>
          <circle cx="30" cy="30" r="22" fill="none" stroke="#2E7D32" strokeWidth="8" strokeDasharray="6 3" />
          <circle cx="30" cy="30" r="14" fill="none" stroke="#1B5E20" strokeWidth="3" />
          <circle cx="22" cy="18" r="2.5" fill="#D32F2F" />
          <circle cx="38" cy="20" r="2.5" fill="#FFD700" />
          <circle cx="42" cy="34" r="2.5" fill="#D32F2F" />
          <circle cx="18" cy="36" r="2.5" fill="#FFD700" />
          <path d="M 25 44 C 20 48 23 54 27 52 L 30 46 L 33 52 C 37 54 40 48 35 44 Z" fill="#D32F2F" />
          <circle cx="30" cy="45" r="3" fill="#B71C1C" />
        </svg>
      );
    }
    if (motif === "jingle_bell") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.75))" }}>
          <circle cx="30" cy="30" r="20" fill="rgba(255, 215, 0, 0.3)" />
          <path d="M 20 38 C 20 20 40 20 40 38 Z" fill="#FFD700" />
          <rect x="17" y="38" width="26" height="5" rx="2" fill="#FFA000" />
          <circle cx="30" cy="46" r="3.5" fill="#FF8F00" />
          <path d="M 24 18 C 24 14 36 14 36 18 Z" fill="#D32F2F" />
        </svg>
      );
    }
    if (motif === "tree") {
      return (
        <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 10px rgba(46, 125, 50, 0.6))" }}>
          <polygon points="30,8 18,24 42,24" fill="#2E7D32" />
          <polygon points="30,18 14,36 46,36" fill="#1B5E20" />
          <polygon points="30,28 10,50 50,50" fill="#0D3B13" />
          <rect x="26" y="50" width="8" height="8" fill="#5D4037" />
          <circle cx="30" cy="8" r="3" fill="#FFD700" />
          <circle cx="24" cy="30" r="2" fill="#D32F2F" />
          <circle cx="36" cy="42" r="2" fill="#FFD700" />
        </svg>
      );
    }
    if (motif === "candy_cane") {
      return (
        <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 10px rgba(211, 47, 47, 0.6))" }}>
          <path d="M 36 54 L 36 24 C 36 12 20 12 20 22 L 20 26" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 36 54 L 36 24 C 36 12 20 12 20 22 L 20 26" stroke="#D32F2F" strokeWidth="8" strokeDasharray="5 5" strokeLinecap="round" fill="none" />
        </svg>
      );
    }
    // Default: Bethlehem Star
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))" }}>
        <polygon points="30,4 37,21 56,21 41,33 47,52 30,40 13,52 19,33 4,21 23,21" fill="#FFD700" opacity="0.9" />
        <circle cx="30" cy="30" r="14" fill="rgba(255, 215, 0, 0.25)" />
      </svg>
    );
  }

  // 3. Valentine's Day Motifs
  if (festId.includes("valentines")) {
    if (motif === "rose") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(225, 29, 72, 0.7))" }}>
          <circle cx="30" cy="30" r="20" fill="rgba(225, 29, 72, 0.3)" />
          <circle cx="30" cy="28" r="14" fill="#E11D48" />
          <path d="M 30 16 C 24 18 24 28 30 34 C 36 28 36 18 30 16 Z" fill="#BE123C" />
          <path d="M 24 22 Q 30 26 36 22" stroke="#FFF" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M 30 42 L 30 52 M 30 46 Q 38 44 40 48" stroke="#15803D" strokeWidth="2" fill="none" />
        </svg>
      );
    }
    if (motif === "cupid") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(244, 63, 94, 0.6))" }}>
          <path d="M 16 12 Q 38 30 16 48" stroke="#F43F5E" strokeWidth="3" fill="none" />
          <line x1="16" y1="12" x2="16" y2="48" stroke="#FDA4AF" strokeWidth="1" />
          <line x1="12" y1="30" x2="44" y2="30" stroke="#E11D48" strokeWidth="2.5" />
          <path d="M 44 30 C 44 26 50 24 52 28 C 54 24 60 26 60 30 C 60 36 52 40 52 40 C 52 40 44 36 44 30 Z" fill="#E11D48" transform="scale(0.7) translate(18, 5)" />
        </svg>
      );
    }
    // Default Valentine: Glowing Satin Heart
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(233, 30, 99, 0.7))" }}>
        <circle cx="30" cy="30" r="18" fill="rgba(233, 30, 99, 0.35)" />
        <path d="M 30 16 C 26 8 14 10 14 22 C 14 34 30 46 30 46 C 30 46 46 34 46 22 C 46 10 34 8 30 16 Z" fill="#E91E63" />
        <path d="M 30 20 C 27 14 18 15 18 24 C 18 32 30 41 30 41 C 30 41 42 32 42 24 C 42 15 33 14 30 20 Z" fill="#FF4081" />
      </svg>
    );
  }

  // 4. Lunar New Year Motifs
  if (festId.includes("lunar") || festId.includes("chinese")) {
    if (motif === "sycee") {
      return (
        <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 60 50" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))" }}>
          <ellipse cx="30" cy="20" rx="14" ry="7" fill="#FFE082" />
          <path d="M 10 22 C 16 38 44 38 50 22 C 56 16 48 10 42 16 C 36 12 24 12 18 16 C 12 10 4 16 10 22 Z" fill="#FFD700" />
          <ellipse cx="30" cy="20" rx="9" ry="4" fill="#FFC107" />
        </svg>
      );
    }
    if (motif === "hongbao") {
      return (
        <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 50 60" style={{ filter: "drop-shadow(0 0 10px rgba(220, 38, 38, 0.7))" }}>
          <rect x="8" y="8" width="34" height="46" rx="4" fill="#DC2626" />
          <path d="M 8 8 Q 25 24 42 8" fill="#B91C1C" />
          <circle cx="25" cy="26" r="7" fill="#FBBF24" />
          <text x="25" y="30" fontSize="8" fontWeight="bold" fill="#B91C1C" textAnchor="middle">福</text>
        </svg>
      );
    }
    // Default: Red Silk Lantern
    return (
      <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 60 80" style={{ filter: "drop-shadow(0 0 10px rgba(211, 47, 47, 0.7))" }}>
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

  // 5. Holi Motifs
  if (festId.includes("holi")) {
    if (motif === "gulal_thali") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(233, 30, 99, 0.6))" }}>
          <circle cx="30" cy="30" r="22" fill="#D4AF37" />
          <circle cx="30" cy="30" r="18" fill="#FFF8E1" />
          <circle cx="24" cy="24" r="5" fill="#E91E63" />
          <circle cx="36" cy="24" r="5" fill="#00E5FF" />
          <circle cx="30" cy="36" r="6" fill="#FFD700" />
        </svg>
      );
    }
    // Default Holi: Brass Pichkari & Gulal Bowl
    return (
      <svg width={size} height={Math.round(size * 0.9)} viewBox="0 0 70 65" style={{ filter: "drop-shadow(0 0 10px rgba(233, 30, 99, 0.5))" }}>
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

  // 6. Navratri Motifs
  if (festId.includes("navratri")) {
    if (motif === "trishul") {
      return (
        <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 60 70" style={{ filter: "drop-shadow(0 0 10px rgba(255, 140, 0, 0.7))" }}>
          <circle cx="30" cy="24" r="18" fill="rgba(255, 140, 0, 0.3)" />
          <line x1="30" y1="8" x2="30" y2="62" stroke="#D4AF37" strokeWidth="3" />
          <path d="M 18 16 Q 18 36 30 36 Q 42 36 42 16" stroke="#D4AF37" strokeWidth="3" fill="none" />
          <polygon points="30,4 27,12 33,12" fill="#D4AF37" />
          <polygon points="18,12 15,18 21,18" fill="#D4AF37" />
          <polygon points="42,12 39,18 45,18" fill="#D4AF37" />
        </svg>
      );
    }
    // Default Navratri: Crossed Dandiya
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(255, 111, 0, 0.6))" }}>
        <circle cx="30" cy="30" r="18" fill="rgba(255, 111, 0, 0.3)" />
        <line x1="10" y1="50" x2="50" y2="10" stroke="#FF8F00" strokeWidth="4" strokeLinecap="round" />
        <line x1="10" y1="10" x2="50" y2="50" stroke="#D81B60" strokeWidth="4" strokeLinecap="round" />
        <circle cx="30" cy="30" r="4" fill="#FFD700" />
      </svg>
    );
  }

  // 7. Pongal Motifs
  if (festId.includes("pongal")) {
    return (
      <svg width={size} height={Math.round(size * 1.05)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 10px rgba(251, 192, 45, 0.6))" }}>
        <circle cx="30" cy="36" r="20" fill="rgba(251, 192, 45, 0.3)" />
        <ellipse cx="30" cy="42" rx="18" ry="14" fill="#8D4925" />
        <ellipse cx="30" cy="28" rx="14" ry="5" fill="#FFF8E1" />
        <path d="M 22 26 Q 30 14 38 26" fill="#FFFFFF" />
        <line x1="44" y1="56" x2="54" y2="10" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Onam Motifs
  if (festId.includes("onam")) {
    if (motif === "snake_boat") {
      return (
        <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 70 50" style={{ filter: "drop-shadow(0 0 8px rgba(230, 81, 0, 0.6))" }}>
          <path d="M 6 32 Q 35 44 64 22 Q 58 36 35 38 Q 12 36 6 32 Z" fill="#8D4925" />
          <path d="M 62 22 Q 66 12 60 8 Q 56 14 58 24 Z" fill="#D4AF37" />
          {[18, 26, 34, 42, 50].map((x) => (
            <line key={x} x1={x} y1="34" x2={x + 4} y2="44" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>
      );
    }
    // Default Onam: Pookalam Floral Carpet
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(230, 81, 0, 0.6))" }}>
        <circle cx="30" cy="30" r="26" fill="#E65100" />
        <circle cx="30" cy="30" r="21" fill="#FFB300" />
        <circle cx="30" cy="30" r="15" fill="#FFF8E1" />
        <circle cx="30" cy="30" r="9" fill="#2E7D32" />
        <circle cx="30" cy="30" r="4" fill="#D84315" />
      </svg>
    );
  }

  // 9. Raksha Bandhan Motifs
  if (festId.includes("raksha") || festId.includes("rakhi")) {
    if (motif === "peacock_rakhi") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(0, 150, 136, 0.7))" }}>
          <line x1="4" y1="30" x2="56" y2="30" stroke="#FFD700" strokeWidth="2.5" />
          <ellipse cx="30" cy="30" rx="14" ry="18" fill="#00897B" />
          <ellipse cx="30" cy="30" rx="9" ry="12" fill="#1E88E5" />
          <circle cx="30" cy="30" r="5" fill="#FFD700" />
          <circle cx="30" cy="30" r="2.5" fill="#4A148C" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(211, 47, 47, 0.6))" }}>
        <line x1="6" y1="30" x2="54" y2="30" stroke="#D32F2F" strokeWidth="3" />
        <circle cx="30" cy="30" r="15" fill="#FFD700" />
        <circle cx="30" cy="30" r="10" fill="#D32F2F" />
        <circle cx="30" cy="30" r="5" fill="#FFF8E1" />
      </svg>
    );
  }

  // 10. Ganesh Chaturthi Motifs
  if (festId.includes("ganesh")) {
    if (motif === "modak_golden") {
      return (
        <svg width={size} height={Math.round(size * 1.05)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))" }}>
          <circle cx="30" cy="34" r="18" fill="rgba(255, 215, 0, 0.3)" />
          <path d="M 30 10 C 20 24 16 38 18 48 C 22 52 38 52 42 48 C 44 38 40 24 30 10 Z" fill="#FFD700" />
          <line x1="30" y1="12" x2="30" y2="48" stroke="#FFA000" strokeWidth="1.5" />
          <line x1="24" y1="22" x2="24" y2="46" stroke="#FFA000" strokeWidth="1.2" />
          <line x1="36" y1="22" x2="36" y2="46" stroke="#FFA000" strokeWidth="1.2" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(255, 140, 0, 0.6))" }}>
        <circle cx="30" cy="30" r="20" fill="rgba(255, 140, 0, 0.3)" />
        <path d="M 30 14 Q 38 14 38 26 Q 38 42 30 46 Q 22 42 22 26 Z" fill="#E65100" />
        <circle cx="28" cy="22" r="2.5" fill="#FFFDE7" />
        <path d="M 30 26 Q 34 34 40 34" stroke="#FFD700" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  // 11. Eid Damascus Brass Fanoos Motifs
  if (festId.includes("eid")) {
    if (motif === "crescent_star") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.85))" }}>
          <circle cx="30" cy="30" r="18" fill="rgba(255, 215, 0, 0.3)" />
          <path d="M 34 14 C 20 14 16 36 32 46 C 18 42 16 22 34 14 Z" fill="#FFD700" />
          <polygon points="36,22 38,28 44,28 39,32 41,38 36,34 31,38 33,32 28,28 34,28" fill="#FFFDE7" />
        </svg>
      );
    }
    return (
      <svg width={size} height={Math.round(size * 1.25)} viewBox="0 0 60 75" style={{ filter: "drop-shadow(0 0 12px rgba(212, 175, 55, 0.75))" }}>
        <circle cx="30" cy="36" r="18" fill="rgba(212, 175, 55, 0.35)" />
        <line x1="30" y1="4" x2="30" y2="14" stroke="#B78103" strokeWidth="1.5" />
        <polygon points="30,14 20,24 40,24" fill="#D4AF37" />
        <rect x="22" y="24" width="16" height="24" fill="#D4AF37" stroke="#996515" strokeWidth="0.8" />
        <circle cx="30" cy="36" r="3.5" fill="#FFD700" />
        <polygon points="22,48 38,48 30,58" fill="#B78103" />
      </svg>
    );
  }

  // 12. Thanksgiving Harvest Motifs
  if (festId.includes("thanksgiving")) {
    if (motif === "acorn_leaf") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(230, 81, 0, 0.6))" }}>
          <circle cx="30" cy="30" r="18" fill="rgba(216, 67, 21, 0.3)" />
          <path d="M 20 30 Q 14 14 30 14 Q 46 14 40 30 Q 30 46 20 30 Z" fill="#E65100" />
          <path d="M 22 28 Q 30 32 38 28" stroke="#FFE082" strokeWidth="1.2" fill="none" />
          <ellipse cx="30" cy="40" rx="8" ry="6" fill="#8D4925" />
        </svg>
      );
    }
    return (
      <svg width={size} height={Math.round(size * 0.9)} viewBox="0 0 70 65" style={{ filter: "drop-shadow(0 0 12px rgba(230, 81, 0, 0.65))" }}>
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
    if (motif === "star_of_david") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(33, 150, 243, 0.8))" }}>
          <circle cx="30" cy="30" r="20" fill="rgba(33, 150, 243, 0.25)" />
          <polygon points="30,10 46,38 14,38" stroke="#1976D2" strokeWidth="2.5" fill="none" />
          <polygon points="30,50 46,22 14,22" stroke="#2196F3" strokeWidth="2.5" fill="none" />
          <circle cx="30" cy="30" r="4" fill="#FFD700" />
        </svg>
      );
    }
    return (
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 70 75" style={{ filter: "drop-shadow(0 0 12px rgba(212, 175, 55, 0.75))" }}>
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
    if (motif === "kanikonna") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))" }}>
          <circle cx="30" cy="30" r="20" fill="rgba(255, 215, 0, 0.3)" />
          <path d="M 16 12 Q 32 30 46 48" stroke="#388E3C" strokeWidth="2" fill="none" />
          <circle cx="22" cy="18" r="4.5" fill="#FFD700" />
          <circle cx="32" cy="24" r="5" fill="#FFFF00" />
          <circle cx="26" cy="32" r="5.5" fill="#FFD700" />
          <circle cx="38" cy="36" r="4.5" fill="#FFEA00" />
          <circle cx="44" cy="46" r="3.5" fill="#FFD700" />
        </svg>
      );
    }
    return (
      <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 60 80" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.75))" }}>
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
    if (motif === "clock") {
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))" }}>
          <circle cx="30" cy="30" r="22" fill="#18181B" stroke="#FFD700" strokeWidth="2.5" />
          <circle cx="30" cy="30" r="18" fill="none" stroke="#FFE082" strokeWidth="0.8" />
          <line x1="30" y1="30" x2="30" y2="16" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
          <line x1="30" y1="30" x2="38" y2="22" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="30" cy="30" r="2.5" fill="#FFFFFF" />
        </svg>
      );
    }
    return (
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 60 65" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))" }}>
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
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 10px rgba(0, 176, 255, 0.6))" }}>
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
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 140, 0, 0.7))" }}>
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
      <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 60 70" style={{ filter: "drop-shadow(0 0 10px rgba(248, 187, 208, 0.6))" }}>
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

  // 19. Mid-Autumn Harvest Mooncake
  if (festId.includes("mid-autumn") || festId.includes("mooncake")) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 0 12px rgba(255, 213, 79, 0.75))" }}>
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
      <svg width={size} height={Math.round(size * 0.95)} viewBox="0 0 60 55" style={{ filter: "drop-shadow(0 0 12px rgba(248, 187, 208, 0.7))" }}>
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
      <svg width={size} height={Math.round(size * 1.2)} viewBox="0 0 60 72" style={{ filter: "drop-shadow(0 0 12px rgba(198, 40, 40, 0.65))" }}>
        <circle cx="30" cy="24" r="16" fill="rgba(198, 40, 40, 0.25)" />
        <path d="M 28 8 Q 24 16 32 20 Q 28 24 30 30" stroke="#ECEFF1" strokeWidth="2" fill="none" opacity="0.75" />
        <path d="M 32 10 Q 36 18 28 22 Q 32 26 30 30" stroke="#ECEFF1" strokeWidth="1.5" fill="none" opacity="0.6" />
        <polygon points="16,30 44,30 38,48 22,48" fill="#C85A27" stroke="#8D3B16" strokeWidth="1" />
        <rect x="27" y="48" width="6" height="14" fill="#8D3B16" />
        <ellipse cx="30" cy="62" rx="14" ry="4" fill="#C85A27" />
      </svg>
    );
  }

  // 22. Diwali & Indian Celebrations (Living Brass, Clay, Marigold, Copper)
  if (motif === "terracotta_clay") {
    return (
      <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 100 85" style={{ filter: "drop-shadow(0 0 12px rgba(255, 117, 24, 0.8))" }}>
        <circle cx="50" cy="30" r="22" fill="rgba(255, 117, 24, 0.45)" />
        <path d="M 50 8 C 43 22 40 32 50 42 C 60 32 57 22 50 8 Z" fill="#FF5722" />
        <path d="M 50 16 C 46 25 44 30 50 36 C 56 30 54 25 50 16 Z" fill="#FFFDE7" />
        <ellipse cx="50" cy="46" rx="36" ry="9" fill="#E64A19" />
        <path d="M 14 46 Q 16 68 50 70 Q 84 68 86 46 Z" fill="#BF360C" />
        <ellipse cx="50" cy="70" rx="18" ry="3.5" fill="#3E2723" />
      </svg>
    );
  }
  if (motif === "marigold_urli") {
    return (
      <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 100 85" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.85))" }}>
        <circle cx="50" cy="30" r="22" fill="rgba(255, 215, 0, 0.45)" />
        <path d="M 50 8 C 43 22 40 32 50 42 C 60 32 57 22 50 8 Z" fill="#FF9800" />
        <ellipse cx="50" cy="50" rx="42" ry="12" fill="#D4AF37" />
        <circle cx="26" cy="50" r="5" fill="#E65100" />
        <circle cx="38" cy="54" r="4.5" fill="#FFC107" />
        <circle cx="62" cy="54" r="4.5" fill="#FFC107" />
        <circle cx="74" cy="50" r="5" fill="#E65100" />
      </svg>
    );
  }
  if (motif === "antique_copper") {
    return (
      <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 100 85" style={{ filter: "drop-shadow(0 0 12px rgba(216, 67, 21, 0.8))" }}>
        <circle cx="50" cy="30" r="22" fill="rgba(216, 67, 21, 0.45)" />
        <path d="M 50 8 C 43 22 40 32 50 42 C 60 32 57 22 50 8 Z" fill="#FF6B35" />
        <ellipse cx="50" cy="46" rx="36" ry="9" fill="#D84315" />
        <path d="M 14 46 Q 16 68 50 70 Q 84 68 86 46 Z" fill="#872900" />
        <ellipse cx="50" cy="70" rx="18" ry="3.5" fill="#3E2723" />
      </svg>
    );
  }

  // Default: Classical Living Brass Diya
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 100 85" style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.85))" }}>
      <circle cx="50" cy="30" r="24" fill="rgba(255, 215, 0, 0.45)" />
      <path d="M 50 8 C 43 22 40 32 50 42 C 60 32 57 22 50 8 Z" fill="#FF6B35" />
      <path d="M 50 16 C 46 25 44 30 50 36 C 56 30 54 25 50 16 Z" fill="#FFFDE7" />
      <ellipse cx="50" cy="46" rx="36" ry="9" fill="#FFE082" />
      <path d="M 14 46 Q 16 68 50 70 Q 84 68 86 46 Z" fill="#D4AF37" />
      <ellipse cx="50" cy="70" rx="18" ry="3.5" fill="#5D4037" />
    </svg>
  );
}

// ─── Dynamic Side Cascade Widget (Vertical Hanging Pillars) ────────────────
function DynamicSideCascadeWidget({ festival, height = 180, width = 20, isLeft = true, withLights = true, lightsTheme = "warm_gold", garlandStyle = "real_blend" }) {
  const festId = (festival?.id || "").toLowerCase();
  const isDiwali = festId.includes("diwali");

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden", pointerEvents: "none" }}>
      <svg width={width} height={height} viewBox="0 0 44 440" style={{ display: "block", width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="dynSideOrangeGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="22%" stopColor="#FFA726" />
            <stop offset="52%" stopColor="#FB8C00" />
            <stop offset="82%" stopColor="#E65100" />
            <stop offset="100%" stopColor="#BF360C" />
          </radialGradient>
          <radialGradient id="dynSideYellowGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#FFF9C4" />
            <stop offset="48%" stopColor="#FFEB3B" />
            <stop offset="78%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#E65100" />
          </radialGradient>

          <path id="dynSidePetal" d="M 0 0 C -3.2 -4 -4.8 -9 -2.5 -13.5 C -1 -14.2 0 -13.5 0 -14.5 C 0 -13.5 1 -14.2 2.5 -13.5 C 4.8 -9 3.2 -4 0 0 Z" />

          <g id="dynSidePetalQuad">
            <use href="#dynSidePetal" />
            <use href="#dynSidePetal" transform="rotate(90)" />
            <use href="#dynSidePetal" transform="rotate(180)" />
            <use href="#dynSidePetal" transform="rotate(270)" />
          </g>

          <g id="dynSidePetalTier16">
            <use href="#dynSidePetalQuad" />
            <use href="#dynSidePetalQuad" transform="rotate(22.5)" />
            <use href="#dynSidePetalQuad" transform="rotate(45)" />
            <use href="#dynSidePetalQuad" transform="rotate(67.5)" />
          </g>

          <g id="dynSideGendaOrange">
            <path d="M -5 -3 L -13 0 L -5 3 L 0 6 L 5 3 L 13 0 L 5 -3 L 0 -6 Z" fill="#1B5E20" opacity="0.9" />
            <g fill="url(#dynSideOrangeGrad)" stroke="#A72A00" strokeWidth="0.35">
              <use href="#dynSidePetalTier16" />
            </g>
            <g fill="#FF8F00" stroke="#B73200" strokeWidth="0.3" transform="scale(0.82) rotate(11.25)">
              <use href="#dynSidePetalTier16" />
            </g>
            <g fill="#FFA726" stroke="#D84315" strokeWidth="0.3" transform="scale(0.63) rotate(22.5)">
              <use href="#dynSidePetalTier16" />
            </g>
            <g fill="#FFB74D" transform="scale(0.44) rotate(33.75)">
              <use href="#dynSidePetalTier16" />
            </g>
            <circle cx="0" cy="0" r="3.6" fill="#BF360C" />
            <circle cx="-0.8" cy="-0.8" r="2.2" fill="#FFE082" />
            <circle cx="0" cy="0" r="1.1" fill="#FF9800" />
          </g>

          <g id="dynSideGendaYellow">
            <path d="M -5 -3 L -13 0 L -5 3 L 0 6 L 5 3 L 13 0 L 5 -3 L 0 -6 Z" fill="#1B5E20" opacity="0.9" />
            <g fill="url(#dynSideYellowGrad)" stroke="#B77300" strokeWidth="0.35">
              <use href="#dynSidePetalTier16" />
            </g>
            <g fill="#FFC107" stroke="#C67D00" strokeWidth="0.3" transform="scale(0.82) rotate(11.25)">
              <use href="#dynSidePetalTier16" />
            </g>
            <g fill="#FFD54F" stroke="#E69500" strokeWidth="0.3" transform="scale(0.63) rotate(22.5)">
              <use href="#dynSidePetalTier16" />
            </g>
            <g fill="#FFF59D" transform="scale(0.44) rotate(33.75)">
              <use href="#dynSidePetalTier16" />
            </g>
            <circle cx="0" cy="0" r="3.6" fill="#E65100" />
            <circle cx="-0.8" cy="-0.8" r="2.2" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="1.1" fill="#FFCA28" />
          </g>
        </defs>

        {/* 1. Vertical Sacred Hanging Cord (BEHIND FLOWERS) */}
        <line x1="22" y1="0" x2="22" y2="400" stroke="#D32F2F" strokeWidth="2.5" />

        {/* 2. Series Lights Wire & Bulbs (BEHIND FLOWERS) */}
        {withLights && isDiwali && (
          <g>
            <path d="M 22 10 Q 8 70 22 130 Q 36 190 22 250 Q 8 310 22 370" stroke="#0D2B17" strokeWidth="1.8" fill="none" opacity="0.95" />
            <path d="M 22 12 Q 10 72 22 132 Q 34 192 22 252 Q 10 312 22 372" stroke="#1B4D2E" strokeWidth="1.2" fill="none" opacity="0.8" />
            {[32, 72, 112, 152, 192, 232, 272, 312, 352].map((y, idx) => (
              <circle
                key={idx}
                cx={idx % 2 === 0 ? 8 : 36}
                cy={y}
                r={3.4}
                fill={lightsTheme === "festive_multicolor" ? (["#FF5252", "#00E676", "#FFD700", "#448AFF", "#E040FB"][idx % 5]) : "#FFD700"}
              />
            ))}
          </g>
        )}

        {/* Corner Mango Leaf Bunch Anchor */}
        <image href={isLeft ? REAL_LEAVES.real_leaf_bunch_left : REAL_LEAVES.real_leaf_bunch_right} x={isLeft ? 0 : 8} y={-4} width={34} height={34} preserveAspectRatio="xMidYMid meet" />

        {/* 3. Real Mango Leaves (BEHIND FLOWERS) */}
        <image href={REAL_LEAVES.real_mango_leaf} x={12} y={64} width={18} height={48} transform="rotate(-35 22 88)" preserveAspectRatio="none" />
        <image href={REAL_LEAVES.real_mango_leaf} x={12} y={154} width={18} height={48} transform="rotate(35 22 178)" preserveAspectRatio="none" />
        <image href={REAL_LEAVES.real_mango_leaf} x={12} y={244} width={18} height={48} transform="rotate(-35 22 268)" preserveAspectRatio="none" />

        {/* 4. Real Cutout Photographic Flowers (ON TOP of thread and wiring) */}
        {[16, 46, 76, 106, 136, 166, 196, 226, 256, 286, 316, 346, 374, 392].map((y, i) => (
          <image
            key={i}
            href={getFlowerSrc(garlandStyle, i)}
            x={10}
            y={y - 12}
            width={24}
            height={24}
            preserveAspectRatio="xMidYMid meet"
          />
        ))}

        {/* 5. Brass Bell Finial */}
        <path d="M 16 406 C 17 412 14 417 14 419 L 30 419 C 30 417 27 412 28 406 Z" fill="#D4AF37" />
        <circle cx="22" cy="422" r="2.5" fill="#FFE082" />
      </svg>
    </div>
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
  garlandStyle = "real_blend",
  garlandOffset,
  enableSeriesLights,
  seriesLightsTheme,
  enableBanner,
  bannerText,
  promoCode = "UTSAV26",
  diyaSize,
  diyaPosition,
  cornerMotif,
  particleDensity,
  effectIntensity,
  customPrimaryColor,
  storeInfo,
  storeProducts,
  activeCategory = "visual_decor",
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

        {/* Storefront Header */}

        {/* Top-Fixed Garland (if selected) */}
        {!showOriginal && enableEffects && garlandPlacement === "top_fixed" && garlandLayout !== "off" && (
          <div style={{ position: "relative", zIndex: 14, overflow: "visible", width: "100%", height: 0, flexShrink: 0, pointerEvents: "none" }}>
            <DynamicFestivalHeaderWidget
              festival={festival}
              isMobile={isMobile}
              height={isMobile ? 20 : 32}
              withLights={enableSeriesLights}
              lightsTheme={seriesLightsTheme}
              garlandStyle={garlandStyle}
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
                  garlandStyle={garlandStyle}
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
                  Featured products
                </div>
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
                      </div>
                      <div style={{ fontSize: isMobile ? "8px" : "9.5px", fontWeight: 600, color: "#18181B", lineHeight: 1.25 }}>
                        {prod.title}
                      </div>
                      <div style={{ fontSize: isMobile ? "7.5px" : "9px", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontWeight: 700, color: "#18181B" }}>
                          {prod.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side Cascade Garlands (Left & Right Hanging Pillars) */}
          {!showOriginal && enableEffects && (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") && (
            <>
              <div style={{ position: "absolute", top: 0, left: isMobile ? "2px" : "6px", zIndex: 26, pointerEvents: "none" }}>
                <DynamicSideCascadeWidget
                  festival={festival}
                  height={isMobile ? 120 : 190}
                  width={isMobile ? 15 : 22}
                  isLeft={true}
                  withLights={enableSeriesLights}
                  lightsTheme={seriesLightsTheme}
                  garlandStyle={garlandStyle}
                />
              </div>
              <div style={{ position: "absolute", top: 0, right: isMobile ? "2px" : "6px", zIndex: 26, pointerEvents: "none" }}>
                <DynamicSideCascadeWidget
                  festival={festival}
                  height={isMobile ? 120 : 190}
                  width={isMobile ? 15 : 22}
                  isLeft={false}
                  withLights={enableSeriesLights}
                  lightsTheme={seriesLightsTheme}
                  garlandStyle={garlandStyle}
                />
              </div>
            </>
          )}

          {/* Living Diya / Corner Elements (Bottom Corners Only) */}
          {!showOriginal && enableEffects && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 27 }}>
              {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_left") && (
                <div style={{ position: "absolute", bottom: isMobile ? "8px" : "12px", left: isMobile ? "8px" : "14px" }}>
                  <DynamicCornerWidget festival={festival} size={numDiyaSize} cornerMotif={cornerMotif} />
                </div>
              )}
              {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_right") && (
                <div style={{ position: "absolute", bottom: isMobile ? "8px" : "12px", right: isMobile ? "8px" : "14px" }}>
                  <DynamicCornerWidget festival={festival} size={numDiyaSize} cornerMotif={cornerMotif} />
                </div>
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

  // Responsive Navigation Collapse (Collapsed by default)
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // Draft Form State
  const [isActive, setIsActive] = useState(config.isActive);
  const [enableBanner, setEnableBanner] = useState(config.enableBanner ?? false);
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
  const [garlandStyle, setGarlandStyle] = useState(customSettings.garlandStyle || "real_blend");
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
  const [cornerMotif, setCornerMotif] = useState(
    customSettings.cornerMotif || config.diyaStyle || "default"
  );

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
    setCornerMotif("default");
    setGarlandLayout("top_and_sides");
    setGarlandStyle("real_blend");
    setGarlandPlacement("below_header");
    setGarlandOffset(0);
    setEnableSeriesLights(true);
    setSeriesLightsTheme("warm_gold");
    setEnableBanner(false);
    setBannerText(festival.banner?.defaultText || `Happy ${festival.name}!`);
    setCustomPrimaryColor(festival.palette?.primary || "#FFD700");
    markDirty();
  };

  const handleUndo = () => {
    setIsActive(config.isActive);
    setEnableBanner(config.enableBanner ?? false);
    setEnableEffects(config.enableEffects ?? true);
    setDiyaSize(config.diyaSize || "medium");
    setDiyaPosition(config.diyaPosition || "bottom_corners");
    setCornerMotif(customSettings.cornerMotif || config.diyaStyle || "default");
    setBannerText(config.bannerText || festival.banner?.defaultText || "");
    setGarlandStyle(customSettings.garlandStyle || "real_blend");
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
        garlandStyle,
        garlandPlacement,
        garlandOffset,
        enableSeriesLights,
        seriesLightsTheme,
        effectIntensity,
        particleDensity,
        motionSensitivity,
        cornerMotif,
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
      cornerMotif,
      bannerText,
      scheduledStart,
      scheduledEnd,
      garlandLayout,
      garlandStyle,
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

  // Auto-save: persist edits shortly after the merchant stops changing settings,
  // so the live storefront never silently keeps an older config (e.g. "Top Toran Only").
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) return undefined;
    const t = setTimeout(() => handleSave(), 1000);
    return () => clearTimeout(t);
  }, [hasUnsavedChanges, isSaving, handleSave]);

  const terminology = getFestivalTerminology(festival?.id);

  // 5 Pure Festive Visual Categories (Decor, Effects, Colors, Scheduling, Store Settings)
  const categories = [
    { id: "visual_decor", label: "Festive Visuals & Decor", badge: garlandLayout !== "off" ? terminology.headerBadge : "Off" },
    { id: "floating_effects", label: "Falling & Floating Effects", badge: enableEffects ? "Active" : "Off" },
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
                  <VisualGarlandLayoutSelector
                    label={terminology.headerArchitectureLabel || "Spiderweb & Garland Architecture"}
                    value={garlandLayout}
                    onChange={(val) => { setGarlandLayout(val); markDirty(); }}
                    helpText="Choose how festive framing drapes across your storefront."
                  />

                  {garlandLayout !== "off" && !["halloween", "christmas", "thanksgiving", "hanukkah"].some(f => (festival?.id || "").toLowerCase().includes(f)) && (
                    <VisualFlowerSelector
                      label={terminology.flowerStyleLabel || "Real Flower Style"}
                      value={garlandStyle}
                      onChange={(val) => { setGarlandStyle(val); markDirty(); }}
                      helpText={terminology.flowerStyleHelp || "Authentic photographic flowers running over the sacred hanging thread."}
                    />
                  )}

                  <VisualDockingSelector
                    label={terminology.dockingPositionLabel || "Framing Docking Position"}
                    value={garlandPlacement}
                    onChange={(val) => { setGarlandPlacement(val); markDirty(); }}
                    helpText={terminology.dockingHelp || "Prevents framing from obstructing your logo or navigation menu."}
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

                  <VisualMotifSelector
                    label={terminology.cornerMotifLabel || "Corner Motif Icon / Style"}
                    options={getFestivalCornerMotifOptions(festival.id)}
                    festival={festival}
                    value={cornerMotif === "default" ? (getFestivalCornerMotifOptions(festival.id)[0]?.value || "default") : cornerMotif}
                    onChange={(val) => { setCornerMotif(val); markDirty(); }}
                    helpText="Choose which iconic festive symbol sits elegantly in the corners of your store."
                  />

                  <VisualPlacementSelector
                    label={terminology.cornerPlacementLabel || "Corner Motif Placement"}
                    value={diyaPosition}
                    onChange={(val) => { setDiyaPosition(val); markDirty(); }}
                    helpText="Select whether motifs sit in both bottom corners, one corner, or remain hidden."
                  />

                  <VisualSizeSelector
                    label={terminology.cornerSizeLabel || "Corner Motif Size"}
                    value={diyaSize}
                    onChange={(val) => { setDiyaSize(val); markDirty(); }}
                    helpText="Balanced (76px) is recommended for desktop and automatically scales for mobile."
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
                    label={terminology.particleRadianceLabel || "Particle Radiance & Intensity"}
                    value={effectIntensity}
                    min={20}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(val) => { setEffectIntensity(val); markDirty(); }}
                    helpText={terminology.particleRadianceHelp || "Controls the opacity and glow intensity of floating ghosts and embers."}
                  />

                  <LuxurySlider
                    label={terminology.particleLabel || "Particle Density Budget"}
                    value={particleDensity}
                    min={6}
                    max={36}
                    step={2}
                    unit={terminology.particleUnit || " particles"}
                    onChange={(val) => { setParticleDensity(val); markDirty(); }}
                    helpText={terminology.particleHelp || "Maintains smooth 60 FPS performance across mobile and desktop."}
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

          {/* 3. THEME COLORS & ATMOSPHERE CATEGORY */}
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
                garlandStyle={garlandStyle}
                garlandOffset={garlandOffset}
                enableSeriesLights={enableSeriesLights}
                seriesLightsTheme={seriesLightsTheme}
                enableBanner={enableBanner}
                bannerText={bannerText}
                promoCode={promoCode}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                cornerMotif={cornerMotif}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
                storeInfo={storeInfo}
                storeProducts={storeProducts}
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
                garlandStyle={garlandStyle}
                garlandOffset={garlandOffset}
                enableSeriesLights={enableSeriesLights}
                seriesLightsTheme={seriesLightsTheme}
                enableBanner={enableBanner}
                bannerText={bannerText}
                promoCode={promoCode}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                cornerMotif={cornerMotif}
                particleDensity={particleDensity}
                effectIntensity={effectIntensity}
                customPrimaryColor={customPrimaryColor}
                storeInfo={storeInfo}
                storeProducts={storeProducts}
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
                garlandStyle={garlandStyle}
                    garlandOffset={garlandOffset}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                    promoCode={promoCode}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    cornerMotif={cornerMotif}
                    particleDensity={particleDensity}
                    effectIntensity={effectIntensity}
                    customPrimaryColor={customPrimaryColor}
                    storeInfo={storeInfo}
                    storeProducts={storeProducts}
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
                garlandStyle={garlandStyle}
                    garlandOffset={garlandOffset}
                    enableSeriesLights={enableSeriesLights}
                    seriesLightsTheme={seriesLightsTheme}
                    enableBanner={enableBanner}
                    bannerText={bannerText}
                    promoCode={promoCode}
                    diyaSize={diyaSize}
                    diyaPosition={diyaPosition}
                    cornerMotif={cornerMotif}
                    particleDensity={particleDensity}
                    effectIntensity={effectIntensity}
                    customPrimaryColor={customPrimaryColor}
                    storeInfo={storeInfo}
                    storeProducts={storeProducts}
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
                garlandStyle={garlandStyle}
                garlandOffset={garlandOffset}
                enableSeriesLights={enableSeriesLights}
                seriesLightsTheme={seriesLightsTheme}
                enableBanner={enableBanner}
                bannerText={bannerText}
                diyaSize={diyaSize}
                diyaPosition={diyaPosition}
                cornerMotif={cornerMotif}
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
