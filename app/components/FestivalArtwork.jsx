import { useState } from "react";

// Curated high-resolution photorealistic images for all Utsav festivals
const GENERATED_FESTIVAL_IMAGES = {
  "christmas": "/festivals/christmas.jpg",
  "christmas-india": "/festivals/christmas.jpg",
  "new-year": "/festivals/new-year.jpg",
  "pongal": "/festivals/pongal.jpg",
  "makar-sankranti": "/festivals/makar-sankranti.jpg",
  "ganesh-chaturthi": "/festivals/ganesh-chaturthi.jpg",
  "onam": "/festivals/onam.jpg",
  "dussehra": "/festivals/dussehra.jpg",
  "easter": "/festivals/easter.jpg",
  "vishu": "/festivals/vishu.jpg",
  "mid-autumn": "/festivals/mid-autumn.jpg",
  "vesak": "/festivals/vesak.jpg",
  "raksha-bandhan": "/festivals/raksha-bandhan.jpg",
  "diwali": "/festivals/diwali.jpg",
  "durga-puja": "/festivals/durga-puja.jpg",
  "eid-ul-fitr": "/festivals/eid-ul-fitr.jpg",
  "halloween": "/festivals/halloween.jpg",
  "hanukkah": "/festivals/hanukkah.jpg",
  "holi": "/festivals/holi.jpg",
  "lunar-new-year": "/festivals/lunar-new-year.jpg",
  "navratri": "/festivals/navratri.jpg",
  "thanksgiving": "/festivals/thanksgiving.jpg",
  "valentines-day": "/festivals/valentines-day.jpg",
};

// Bespoke vector art disabled in favor of authentic real photography
function renderArtisticIllustration() {
  return null;
}

/**
 * High-resolution authentic festival imagery component for Utsav.
 * Uses real photography and cinematic grading for all 22 festivals.
 */
export default function FestivalArtwork({
  festival,
  variant = "card",
  className = "",
  style = {},
  showBadge = false,
  badgeText = null,
  badgeTone = "success",
}) {
  const [imageError, setImageError] = useState(false);

  if (!festival) return null;
  const id = (festival.id || "").toLowerCase();

  const isHero = variant === "hero";
  const isThumb = variant === "thumb";

  const height = isHero ? 180 : isThumb ? 52 : 135;
  const width = isThumb ? 52 : "100%";

  const p = festival.palette || {};
  const bg1 = p.background || "#160A02";
  const bg2 = p.secondary ? `${p.secondary}44` : "#3D1A00";

  // Always render authentic real photorealistic images across all festival cards and heroes
  const normalizedId = (id === "christmas-india" || id === "christmas") ? "christmas" : id;
  const imageSrc = GENERATED_FESTIVAL_IMAGES[id] || GENERATED_FESTIVAL_IMAGES[normalizedId] || `/festivals/${normalizedId}.jpg`;

  return (
    <div
      className={`utsav-festival-artwork ${className}`}
      style={{
        position: "relative",
        width: width,
        height: `${height}px`,
        borderRadius: isThumb ? "10px" : "10px 10px 0 0",
        overflow: "hidden",
        backgroundColor: bg1,
        background: `linear-gradient(135deg, ${bg1} 0%, #110702 50%, ${bg2} 100%)`,
        boxShadow: isThumb ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
        ...style,
      }}
    >
      {!imageError ? (
        <img
          src={imageSrc}
          alt={festival.name}
          loading="lazy"
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            transition: "transform 0.5s ease",
          }}
        />
      ) : (
        /* Fallback gradient with subtle ambient glow if image offline */
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle at center, ${p.primary || "#FFD700"}22 0%, ${bg1} 70%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: isThumb ? "22px" : "36px", opacity: 0.9 }}>
            {festival.emoji || "✨"}
          </span>
        </div>
      )}

      {/* Cinematic Vignette Overlay to ensure text & badge legibility */}
      {!isThumb && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Optional Badge overlay inside artwork */}
      {showBadge && badgeText && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor:
              badgeTone === "success"
                ? "#008060"
                : badgeTone === "warning"
                ? "#D97706"
                : "#2563EB",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.25)",
            zIndex: 3,
          }}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
}
