import { useState } from "react";
import {
  Text,
  Badge,
  Button,
  Box,
  InlineStack,
  BlockStack,
  Icon,
} from "@shopify/polaris";
import {
  ViewIcon,
  SettingsIcon,
  CheckCircleIcon,
  ExternalIcon,
} from "@shopify/polaris-icons";
import { REAL_DIYAS } from "../assets/diyas/realDiyas.js";
import { REAL_LEAVES } from "../assets/leaves/realLeaves.js";
import { REAL_FLOWERS } from "../assets/flowers/realFlowers.js";

// Flower helper mirroring Studio engine
function getFlowerSrc(style, i) {
  const s = (style || "real_blend").toLowerCase();
  if (s === "real_marigold_orange") return REAL_FLOWERS.real_marigold_orange;
  if (s === "real_marigold_yellow") return REAL_FLOWERS.real_marigold_yellow;
  if (s === "real_blossom_pink") return REAL_FLOWERS.real_blossom_pink;
  if (s === "real_dahlia_sunset") return REAL_FLOWERS.real_dahlia_sunset;
  return i % 2 === 0 ? REAL_FLOWERS.real_marigold_orange : REAL_FLOWERS.real_marigold_yellow;
}

// Particles effect engine matching Studio
function LiveStorefrontParticles({ festival, density = 16, intensity = 80, isPaused = false }) {
  if (isPaused) return null;
  const festId = (festival?.id || "").toLowerCase();
  const count = Math.min(density, 18);

  if (festId.includes("halloween")) {
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18, opacity: intensity / 100, overflow: "hidden" }}>
        {[
          { left: "6%", top: "24%", size: 20, delay: "0s", duration: "7s" },
          { left: "90%", top: "28%", size: 22, delay: "2s", duration: "8s" },
        ].map((g, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: g.left,
              top: g.top,
              width: `${g.size}px`,
              height: `${Math.round(g.size * 1.2)}px`,
              opacity: 0.8,
              filter: "drop-shadow(0 0 8px rgba(255, 117, 24, 0.55))",
            }}
          >
            <svg viewBox="0 0 32 38" width="100%" height="100%">
              <path d="M 16 3 C 8 3 4 10 4 18 C 4 27 6 34 8 33 C 10 32 12 35 14 33 C 16 31 18 35 20 33 C 22 31 24 35 26 33 C 28 35 28 27 28 18 C 28 10 24 3 16 3 Z" fill="rgba(240, 235, 255, 0.92)" />
              <ellipse cx="11" cy="14" rx="2.2" ry="3" fill="#1A1528" />
              <ellipse cx="21" cy="14" rx="2.2" ry="3" fill="#1A1528" />
              <ellipse cx="16" cy="20" rx="1.8" ry="2.4" fill="#1A1528" />
            </svg>
          </div>
        ))}
      </div>
    );
  }

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
            }}
          >
            {i % 3 === 0 ? "🌸" : "♥"}
          </div>
        ))}
      </div>
    );
  }

  if (festId.includes("holi")) {
    const holiColors = ["#E91E63", "#FF9800", "#00E5FF", "#FFEB3B", "#76FF03"];
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
              filter: "blur(2px)",
            }}
          />
        ))}
      </div>
    );
  }

  // Default: Festive Golden & Auspicious Sparkles
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
            background: festival?.palette?.primary || "#FFD700",
            boxShadow: `0 0 5px ${festival?.palette?.glow || "rgba(255,215,0,0.6)"}`,
          }}
        />
      ))}
    </div>
  );
}

// Live Header Toran Arch Matching Studio Engine
function LiveStorefrontToran({ festival, isMobile = false }) {
  const festId = (festival?.id || "").toLowerCase();

  if (festId.includes("christmas")) {
    return (
      <div style={{ width: "100%", height: isMobile ? "24px" : "32px", position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 560 48" preserveAspectRatio="none">
          {[0, 90, 180, 270, 360, 450].map((x, i) => (
            <g key={i} transform={`translate(${x}, 0)`}>
              <path d="M 0 0 Q 45 28 90 0" stroke="#1B4D2E" strokeWidth="3" fill="none" />
              <path d="M 15 12 L 25 24 M 35 18 L 45 32 M 55 18 L 65 30 M 75 12 L 82 22" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
              <circle cx="45" cy="33" r="2.8" fill="#D32F2F" />
              <circle cx="20" cy="14" r="3" fill="#FFD700" />
              <circle cx="50" cy="22" r="3" fill="#00E676" />
              <circle cx="70" cy="14" r="3" fill="#FFD700" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  // Master Indian Toran (Diwali, Navratri, Dussehra, Onam, Pongal, Ganesh, etc.)
  return (
    <div style={{ width: "100%", height: isMobile ? "26px" : "34px", position: "relative", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 560 48" preserveAspectRatio="none">
        <rect x="0" y="0" width="100%" height="3" fill="#C62828" />
        {[0, 112, 224, 336, 448].map((startX, idx) => (
          <g key={idx} transform={`translate(${startX}, 0)`}>
            <image href={REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf} x={6} y={0} width={14} height={36} preserveAspectRatio="xMidYMin meet" transform="rotate(-5 13 0)" />
            <image href={REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf} x={32} y={0} width={14} height={36} preserveAspectRatio="xMidYMin meet" transform="rotate(-2 39 0)" />
            <image href={REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf} x={58} y={0} width={14} height={36} preserveAspectRatio="xMidYMin meet" transform="rotate(2 65 0)" />
            <image href={REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf} x={84} y={0} width={14} height={36} preserveAspectRatio="xMidYMin meet" transform="rotate(5 91 0)" />

            <path d="M 0 5 Q 56 34 112 5" stroke="#C62828" strokeWidth="1.6" fill="none" opacity="0.7" />

            <g>
              <path d="M 0 8 Q 56 37 112 8" stroke="#0D2B17" strokeWidth="1.4" fill="none" opacity="0.9" />
              <circle cx="14" cy="14" r="2.8" fill="#FFD700" />
              <circle cx="38" cy="24" r="2.8" fill="#FFD700" />
              <circle cx="56" cy="28" r="3.2" fill="#FFF9C4" />
              <circle cx="74" cy="24" r="2.8" fill="#FFD700" />
              <circle cx="98" cy="14" r="2.8" fill="#FFD700" />
            </g>

            {/* Real Cutout Flowers along arc */}
            <image href={getFlowerSrc("real_blend", 0)} x={-7} y={-2} width={15} height={15} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc("real_blend", 1)} x={20} y={11} width={16} height={16} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc("real_blend", 2)} x={48} y={18} width={17} height={17} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc("real_blend", 3)} x={76} y={11} width={16} height={16} preserveAspectRatio="xMidYMid meet" />
            <image href={getFlowerSrc("real_blend", 4)} x={104} y={-2} width={15} height={15} preserveAspectRatio="xMidYMid meet" />

            {/* Auspicious Brass Bell between arcs */}
            <line x1={0} y1={5} x2={0} y2={18} stroke="#D32F2F" strokeWidth={1.2} />
            <circle cx={0} cy={17} r={1.5} fill="#D4AF37" />
            <path d="M -3 18 C -2.5 21 -4 23.5 -4 25 L 4 25 C 4 23.5 2.5 21 3 18 Z" fill="#D4AF37" />
            <circle cx={0} cy={26} r={1} fill="#FFE082" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Corner Diya / Auspicious Motif
function LiveCornerMotif({ festival, size = 30, motifKey }) {
  const festId = (festival?.id || "").toLowerCase();
  const motif = motifKey || "marigold_urli";

  if (festId.includes("halloween")) {
    return (
      <svg width={size} height={Math.round(size * 0.9)} viewBox="0 0 70 65" style={{ filter: "drop-shadow(0 0 10px rgba(255, 117, 24, 0.75))" }}>
        <ellipse cx="35" cy="38" rx="28" ry="22" fill="#FF7518" />
        <polygon points="24,28 30,34 22,35" fill="#FFF59D" />
        <polygon points="46,28 48,35 40,34" fill="#FFF59D" />
        <polygon points="35,34 38,39 32,39" fill="#FFF59D" />
        <path d="M 21 44 Q 35 55 49 44 Q 44 51 35 51 Q 26 51 21 44 Z" fill="#FFF59D" />
      </svg>
    );
  }

  const diyaImg = REAL_DIYAS[motif] || REAL_DIYAS.marigold_urli || REAL_DIYAS.royal_crimson;

  return (
    <div style={{ width: `${size}px`, height: `${Math.round(size * 0.85)}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={diyaImg}
        alt="Authentic Festive Diya"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 0 8px rgba(255, 170, 0, 0.7))",
        }}
      />
    </div>
  );
}

export default function StorefrontLivePreview({
  festival,
  config = {},
  shop = "utsav-demo.myshopify.com",
  storeInfo = { name: "Rajesh Crafts India" },
  storeProducts = [],
}) {
  const [deviceMode, setDeviceMode] = useState("desktop");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  const isDesktop = deviceMode === "desktop";
  const isMobile = deviceMode === "mobile";

  const cornerMotif = config.cornerMotif || config.diyaStyle || "marigold_urli";
  const numDiyaSize = config.diyaSize === "small" ? 22 : config.diyaSize === "large" ? 38 : 28;
  const diyaPosition = config.diyaPosition || "bottom_corners";
  const enableBanner = config.enableBanner ?? true;
  const bannerText = config.bannerText || festival?.banner?.defaultText || `Happy ${festival?.name || "Festive Season"}! Special Deals Today`;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--p-color-border-subdued, #E1E3E5)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Header Toolbar */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #E1E3E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          background: "#FAFBFB",
        }}
      >
        <InlineStack gap="150" blockAlign="center">
          <Text variant="headingSm" as="h3">
            Storefront Preview
          </Text>
          <Badge tone={showOriginal ? "attention" : "success"}>
            {showOriginal ? "Original Store" : "Effects Active"}
          </Badge>
        </InlineStack>

        {/* Viewport switch & Comparison controls */}
        <InlineStack gap="100" blockAlign="center">
          <div style={{ display: "inline-flex", background: "#ECEFF1", borderRadius: "6px", padding: "2px" }}>
            <button
              onClick={() => setDeviceMode("desktop")}
              style={{
                border: "none",
                background: isDesktop ? "#FFFFFF" : "transparent",
                color: isDesktop ? "#1A1C1E" : "#5C5F62",
                fontWeight: isDesktop ? 600 : 500,
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: isDesktop ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Desktop
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              style={{
                border: "none",
                background: isMobile ? "#FFFFFF" : "transparent",
                color: isMobile ? "#1A1C1E" : "#5C5F62",
                fontWeight: isMobile ? 600 : 500,
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: isMobile ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Mobile
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause visual animations" : "Play animations"}
            style={{
              border: "1px solid #D2D5D8",
              background: "#FFFFFF",
              borderRadius: "5px",
              padding: "3px 7px",
              fontSize: "11px",
              cursor: "pointer",
              color: "#202223",
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            onClick={() => setShowOriginal(!showOriginal)}
            title="Toggle between festive theme and base store"
            style={{
              border: showOriginal ? "1px solid #FF9800" : "1px solid #D2D5D8",
              background: showOriginal ? "#FFF3E0" : "#FFFFFF",
              borderRadius: "5px",
              padding: "3px 7px",
              fontSize: "11px",
              fontWeight: showOriginal ? 600 : 500,
              cursor: "pointer",
              color: showOriginal ? "#B76E00" : "#202223",
            }}
          >
            {showOriginal ? "Reset" : "Before/After"}
          </button>
        </InlineStack>
      </div>

      {/* 2. Device Viewport Wrapper */}
      <div
        style={{
          padding: "16px",
          background: "#F4F6F8",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "360px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: isDesktop ? "100%" : "260px",
            maxWidth: isDesktop ? "460px" : "280px",
            margin: "0 auto",
            transition: "all 0.25s ease",
          }}
        >
          {/* Device Dimension Tag */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              fontWeight: 600,
              color: "#6D7175",
              padding: "0 2px 4px",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            <span>{isDesktop ? "Desktop (Shopify Dawn)" : "Mobile Device (iOS)"}</span>
            <span>{isDesktop ? "1440 × 900" : "375 × 812"}</span>
          </div>

          {/* Device Frame */}
          <div
            style={{
              width: "100%",
              aspectRatio: isDesktop ? "16 / 11" : "9 / 18",
              background: "#FFFFFF",
              borderRadius: isMobile ? "20px" : "6px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              position: "relative",
              overflow: "hidden",
              border: isMobile ? "5px solid #1A1C1E" : "1px solid #DCE0E5",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Desktop Safari Chrome */}
            {isDesktop && (
              <div
                style={{
                  background: "#F1F2F4",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderBottom: "1px solid #DCE0E5",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: "3px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF5F56", display: "inline-block" }} />
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    borderRadius: "3px",
                    padding: "1px 6px",
                    fontSize: "8.5px",
                    color: "#555",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "1px solid #E1E3E6",
                  }}
                >
                  <span>🔒 {shop}</span>
                </div>
              </div>
            )}

            {/* Mobile Notch Bar */}
            {isMobile && (
              <div style={{ background: "#000000", color: "#FFFFFF", padding: "2px 8px 1px", flexShrink: 0 }}>
                <div style={{ width: "36px", height: "7px", background: "#1E1E1E", borderRadius: "4px", margin: "0 auto 1px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "7px", fontWeight: 600 }}>
                  <span>9:41</span>
                  <span>5G 100%</span>
                </div>
              </div>
            )}

            {/* Festive Announcement Banner */}
            {!showOriginal && enableBanner && (
              <div
                style={{
                  backgroundColor: festival?.palette?.secondary || "#FF6B35",
                  color: "#FFFFFF",
                  fontSize: isMobile ? "8px" : "9.5px",
                  fontWeight: 600,
                  padding: "4px 8px",
                  textAlign: "center",
                  letterSpacing: "0.2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <span>{bannerText}</span>
                <span
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    fontSize: isMobile ? "7px" : "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  FESTIVE
                </span>
              </div>
            )}

            {/* Store Navigation Bar (Shopify Dawn) */}
            <div
              style={{
                padding: isMobile ? "5px 8px" : "7px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #E5E7EB",
                background: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", gap: "8px", fontSize: isMobile ? "7.5px" : "9px", color: "#18181B", fontWeight: 500 }}>
                <span style={{ textDecoration: "underline", fontWeight: 600 }}>Home</span>
                <span>Catalog</span>
                <span>Contact</span>
              </div>

              <div style={{ fontWeight: 800, fontSize: isMobile ? "10px" : "12px", color: "#09090B" }}>
                {storeInfo?.name || "Store"}
              </div>

              <div style={{ display: "flex", gap: "6px", color: "#18181B", fontSize: "9px" }}>
                <span>🔍</span>
                <span>🛍️</span>
              </div>
            </div>

            {/* Storefront Canvas Body */}
            <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                {/* Draped Floral Toran */}
                {!showOriginal && (
                  <div style={{ position: "relative", zIndex: 14, overflow: "visible", width: "100%", height: 0, pointerEvents: "none" }}>
                    <LiveStorefrontToran festival={festival} isMobile={isMobile} />
                  </div>
                )}

                {/* Ambient Particles */}
                {!showOriginal && (
                  <LiveStorefrontParticles
                    festival={festival}
                    density={14}
                    intensity={80}
                    isPaused={!isPlaying}
                  />
                )}

                {/* Hero Banner Section */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: isMobile ? "120px" : "150px",
                    backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.03)), url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: isMobile ? "0 10px" : "0 18px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.96)",
                      backdropFilter: "blur(4px)",
                      padding: isMobile ? "7px 10px" : "10px 14px",
                      borderRadius: "2px",
                      maxWidth: isMobile ? "140px" : "180px",
                      textAlign: "left",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                      position: "relative",
                      zIndex: 20,
                    }}
                  >
                    <div style={{ fontSize: isMobile ? "9.5px" : "12px", fontWeight: 800, color: "#121212", margin: "0 0 2px 0", lineHeight: 1.15 }}>
                      Shop Festive Collections
                    </div>
                    <div style={{ fontSize: isMobile ? "6.5px" : "7.5px", color: "#4B5563", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                      Discover celebratory artisan crafts curated for {festival?.name || "celebrations"}.
                    </div>
                    <button
                      style={{
                        background: "#121212",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "2px",
                        padding: "3px 8px",
                        fontSize: isMobile ? "6.5px" : "7.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Shop now
                    </button>
                  </div>
                </div>

                {/* Featured Products Mini Grid */}
                <div style={{ padding: "10px", background: "#FFFFFF" }}>
                  <div style={{ fontSize: isMobile ? "9px" : "11px", fontWeight: 700, color: "#121212", marginBottom: "6px" }}>
                    Featured products
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                    }}
                  >
                    {(storeProducts && storeProducts.length > 0 ? storeProducts.slice(0, 2) : [
                      { title: "Artisan Bell Toran", price: "₹899.00" },
                      { title: "Brass Diya Urli", price: "₹1,499.00" },
                    ]).map((prod, i) => (
                      <div key={i} style={{ textAlign: "left", position: "relative" }}>
                        <div
                          style={{
                            background: "#F4F4F5",
                            borderRadius: "3px",
                            height: isMobile ? "70px" : "85px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden",
                            marginBottom: "3px",
                          }}
                        >
                          {prod.image ? (
                            <img src={prod.image} alt={prod.title} style={{ maxWidth: "80%", maxHeight: "85%", objectFit: "contain" }} />
                          ) : (
                            <div style={{ fontSize: "18px" }}>🪔</div>
                          )}
                        </div>
                        <div style={{ fontSize: isMobile ? "7px" : "8px", fontWeight: 600, color: "#18181B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {prod.title}
                        </div>
                        <div style={{ fontSize: isMobile ? "6.5px" : "7.5px", fontWeight: 700, color: "#18181B" }}>
                          {prod.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Living Corner Diyas / Auspicious Motifs */}
                {!showOriginal && (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 27 }}>
                    {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_left") && (
                      <div style={{ position: "absolute", bottom: isMobile ? "6px" : "10px", left: isMobile ? "6px" : "10px" }}>
                        <LiveCornerMotif festival={festival} size={numDiyaSize} motifKey={cornerMotif} />
                      </div>
                    )}
                    {(diyaPosition === "bottom_corners" || diyaPosition === "bottom_right") && (
                      <div style={{ position: "absolute", bottom: isMobile ? "6px" : "10px", right: isMobile ? "6px" : "10px" }}>
                        <LiveCornerMotif festival={festival} size={numDiyaSize} motifKey={cornerMotif} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Actions */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #E1E3E5",
          background: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text variant="bodyXs" tone="subdued">
          {festival ? `${festival.name} theme rendered with live CSS/SVG effects` : "Select a festival"}
        </Text>
        <Button
          size="slim"
          icon={ExternalIcon}
          url={`https://${shop}/?utsav_preview=${festival?.id || "diwali"}`}
          target="_blank"
        >
          Open In New Tab
        </Button>
      </div>
    </div>
  );
}
