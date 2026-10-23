import { useState } from "react";

// Image mapping for all 22 festivals to authentic photography
const FESTIVAL_IMAGES = {
  "diwali": "/festivals/diwali.jpg",
  "holi": "/festivals/holi.jpg",
  "navratri": "/festivals/navratri.jpg",
  "pongal": "/festivals/pongal.jpg",
  "onam": "/festivals/onam.jpg",
  "raksha-bandhan": "/festivals/raksha-bandhan.jpg",
  "ganesh-chaturthi": "/festivals/ganesh-chaturthi.jpg",
  "eid-ul-fitr": "/festivals/eid-ul-fitr.jpg",
  "christmas-india": "/festivals/christmas-india.jpg",
  "halloween": "/festivals/halloween.jpg",
  "valentines-day": "/festivals/valentines-day.jpg",
  "lunar-new-year": "/festivals/lunar-new-year.jpg",
  "hanukkah": "/festivals/hanukkah.jpg",
  "easter": "/festivals/easter.jpg",
  "thanksgiving": "/festivals/thanksgiving.jpg",
  "new-year": "/festivals/new-year.jpg",
  "mid-autumn": "/festivals/mid-autumn.jpg",
  "vesak": "/festivals/vesak.jpg",
  "vishu": "/festivals/vishu.jpg",
  "durga-puja": "/festivals/durga-puja.jpg",
  "makar-sankranti": "/festivals/makar-sankranti.jpg",
  "dussehra": "/festivals/dussehra.jpg",
};

/**
 * High-resolution authentic festival imagery component for Utsav.
 * Uses real photography and cinematic grading for all 22 festivals.
 * 
 * Variants:
 * - "hero": 180px height for Dashboard Active Festival Card
 * - "card": 135px height for Festival Catalog marketplace cards
 * - "thumb": 52px rounded avatar for compact lists and upcoming timelines
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

  const imageSrc = FESTIVAL_IMAGES[id] || `/festivals/${id}.jpg`;

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
