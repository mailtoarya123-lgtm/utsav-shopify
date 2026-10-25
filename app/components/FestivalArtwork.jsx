import { useState } from "react";

// Curated high-resolution images generated specifically for Utsav
const GENERATED_FESTIVAL_IMAGES = {
  "halloween": "/festivals/halloween.jpg",
  "thanksgiving": "/festivals/thanksgiving.jpg",
  "hanukkah": "/festivals/hanukkah.jpg",
};

/**
 * Renders bespoke cultural vector artwork for festivals.
 * Crafted with glowing gradients, cultural silhouettes, and festive ornaments.
 */
function renderArtisticIllustration(id, festival, isThumb) {
  const p = festival?.palette || {};
  const primary = p.primary || "#FFD700";
  const secondary = p.secondary || "#FF7518";
  const accent = p.accent || "#8B0000";
  const bg = p.background || "#110702";

  switch (id) {
    case "christmas":
    case "christmas-india":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`xmas-bg-${id}`} cx="50%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#1E392A" />
              <stop offset="50%" stopColor="#0B1D12" />
              <stop offset="100%" stopColor="#050E08" />
            </radialGradient>
            <radialGradient id={`star-glow-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF9D2" />
              <stop offset="40%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`tree-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E6B47" />
              <stop offset="100%" stopColor="#133821" />
            </linearGradient>
            <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="400" height="225" fill={`url(#xmas-bg-${id})`} />
          {/* Ambient Glow */}
          <circle cx="200" cy="110" r="100" fill="#FFD700" opacity="0.12" />
          {/* Christmas Tree Silhouettes */}
          <polygon points="200,42 235,90 220,90 250,135 230,135 265,185 135,185 170,135 150,135 180,90 165,90" fill={`url(#tree-grad-${id})`} />
          {/* Trunk */}
          <rect x="192" y="185" width="16" height="22" rx="2" fill="#4A2511" />
          {/* Glowing Top Star */}
          <circle cx="200" cy="40" r="24" fill={`url(#star-glow-${id})`} />
          <path d="M 200,28 L 204,37 L 213,38 L 206,44 L 208,53 L 200,48 L 192,53 L 194,44 L 187,38 L 196,37 Z" fill="#FFEAA7" filter={`url(#glow-${id})`} />
          {/* Glowing Baubles */}
          <circle cx="185" cy="105" r="4.5" fill="#E74C3C" filter={`url(#glow-${id})`} />
          <circle cx="215" cy="115" r="4" fill="#FFD700" filter={`url(#glow-${id})`} />
          <circle cx="170" cy="148" r="5" fill="#3498DB" filter={`url(#glow-${id})`} />
          <circle cx="205" cy="155" r="4.5" fill="#E74C3C" filter={`url(#glow-${id})`} />
          <circle cx="230" cy="160" r="5" fill="#FFD700" filter={`url(#glow-${id})`} />
          {/* Fairy Lights Swags */}
          <path d="M 175,90 Q 200,105 225,90" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeDasharray="3 4" filter={`url(#glow-${id})`} opacity="0.8" />
          <path d="M 160,135 Q 200,155 240,135" fill="none" stroke="#FFEAA7" strokeWidth="1.2" strokeDasharray="3 4" filter={`url(#glow-${id})`} opacity="0.85" />
          {/* Gift Boxes under tree */}
          <rect x="150" y="188" width="22" height="18" rx="2" fill="#E74C3C" />
          <line x1="161" y1="188" x2="161" y2="206" stroke="#FFD700" strokeWidth="2" />
          <line x1="150" y1="197" x2="172" y2="197" stroke="#FFD700" strokeWidth="2" />
          <rect x="228" y="184" width="26" height="22" rx="2" fill="#FFD700" />
          <line x1="241" y1="184" x2="241" y2="206" stroke="#E74C3C" strokeWidth="2" />
          <line x1="228" y1="195" x2="254" y2="195" stroke="#E74C3C" strokeWidth="2" />
          {/* Snow Dust */}
          <circle cx="60" cy="40" r="1.5" fill="#FFF" opacity="0.6" />
          <circle cx="90" cy="80" r="2" fill="#FFF" opacity="0.7" />
          <circle cx="340" cy="50" r="1.5" fill="#FFF" opacity="0.6" />
          <circle cx="310" cy="100" r="2" fill="#FFF" opacity="0.75" />
          <circle cx="80" cy="160" r="1.5" fill="#FFF" opacity="0.5" />
          <circle cx="320" cy="170" r="2" fill="#FFF" opacity="0.6" />
        </svg>
      );

    case "new-year":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`ny-bg-${id}`} cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#1B0C30" />
              <stop offset="60%" stopColor="#0B0515" />
              <stop offset="100%" stopColor="#030108" />
            </radialGradient>
            <radialGradient id={`firework-gold-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF0" />
              <stop offset="30%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`firework-cyan-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#9C27B0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#ny-bg-${id})`} />
          {/* Fireworks Bursts */}
          <circle cx="140" cy="75" r="60" fill={`url(#firework-gold-${id})`} opacity="0.6" />
          <circle cx="280" cy="65" r="55" fill={`url(#firework-cyan-${id})`} opacity="0.55" />
          {/* Burst Rays */}
          <g stroke="#FFD700" strokeWidth="1.5" opacity="0.85">
            <line x1="140" y1="75" x2="140" y2="35" />
            <line x1="140" y1="75" x2="140" y2="115" />
            <line x1="140" y1="75" x2="100" y2="75" />
            <line x1="140" y1="75" x2="180" y2="75" />
            <line x1="140" y1="75" x2="112" y2="47" />
            <line x1="140" y1="75" x2="168" y2="103" />
            <line x1="140" y1="75" x2="168" y2="47" />
            <line x1="140" y1="75" x2="112" y2="103" />
          </g>
          <g stroke="#00E5FF" strokeWidth="1.5" opacity="0.8">
            <line x1="280" y1="65" x2="280" y2="30" />
            <line x1="280" y1="65" x2="280" y2="100" />
            <line x1="280" y1="65" x2="245" y2="65" />
            <line x1="280" y1="65" x2="315" y2="65" />
            <line x1="280" y1="65" x2="255" y2="40" />
            <line x1="280" y1="65" x2="305" y2="90" />
            <line x1="280" y1="65" x2="305" y2="40" />
            <line x1="280" y1="65" x2="255" y2="90" />
          </g>
          {/* Toasting Champagne Flutes */}
          <g transform="translate(160, 110)">
            {/* Left Glass */}
            <path d="M 28,25 Q 26,55 35,62 L 35,90 L 25,92 L 45,92 L 35,90 L 35,62 Q 44,55 42,25 Z" fill="rgba(255,215,0,0.3)" stroke="#FFD700" strokeWidth="1.5" transform="rotate(-15, 35, 60)" />
            {/* Right Glass */}
            <path d="M 48,25 Q 46,55 55,62 L 55,90 L 45,92 L 65,92 L 55,90 L 55,62 Q 64,55 62,25 Z" fill="rgba(255,215,0,0.3)" stroke="#FFD700" strokeWidth="1.5" transform="rotate(15, 55, 60)" />
            {/* Clink Spark */}
            <circle cx="45" cy="40" r="4" fill="#FFF" />
          </g>
          {/* Sparkles */}
          <circle cx="80" cy="140" r="1.5" fill="#FFD700" opacity="0.8" />
          <circle cx="330" cy="130" r="2" fill="#FFD700" opacity="0.8" />
          <circle cx="210" cy="40" r="2" fill="#FFF" opacity="0.9" />
        </svg>
      );

    case "makar-sankranti":
    case "pongal":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <linearGradient id={`sky-bg-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E88E5" />
              <stop offset="60%" stopColor="#64B5F6" />
              <stop offset="100%" stopColor="#FFF9C4" />
            </linearGradient>
            <radialGradient id={`sun-glow-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF" />
              <stop offset="40%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#sky-bg-${id})`} />
          {/* Radiant Golden Sun (Surya Dev) */}
          <circle cx="80" cy="65" r="45" fill={`url(#sun-glow-${id})`} />
          <circle cx="80" cy="65" r="22" fill="#FFF9C4" />
          {/* Flying Diamond Kites */}
          {/* Main Bright Red Kite */}
          <g transform="translate(230, 45) rotate(22)">
            <polygon points="35,0 70,35 35,70 0,35" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
            <polygon points="35,0 70,35 35,35" fill="#FFB300" opacity="0.85" />
            <polygon points="0,35 35,35 35,70" fill="#FFB300" opacity="0.85" />
            <line x1="35" y1="0" x2="35" y2="70" stroke="#FFF" strokeWidth="1" />
            <path d="M 0,35 Q 35,50 70,35" fill="none" stroke="#FFF" strokeWidth="1" />
            <polygon points="35,70 42,82 28,82" fill="#D32F2F" />
            {/* Kite Tail & Thread */}
            <path d="M 35,82 Q 45,100 30,120 T 50,150" fill="none" stroke="#FFD54F" strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
          {/* Second Emerald Kite */}
          <g transform="translate(140, 95) rotate(-18)">
            <polygon points="25,0 50,25 25,50 0,25" fill="#43A047" stroke="#1B5E20" strokeWidth="1" />
            <polygon points="25,0 50,25 25,25" fill="#FFEB3B" opacity="0.85" />
            <line x1="25" y1="0" x2="25" y2="50" stroke="#FFF" strokeWidth="0.8" />
            <path d="M 0,25 Q 25,35 50,25" fill="none" stroke="#FFF" strokeWidth="0.8" />
            <polygon points="25,50 30,60 20,60" fill="#2E7D32" />
            <path d="M 25,60 Q 35,75 20,95" fill="none" stroke="#FFC107" strokeWidth="1.2" strokeDasharray="2 2" />
          </g>
          {/* Distant Colorful Kites */}
          <polygon points="330,30 342,42 330,54 318,42" fill="#8E24AA" opacity="0.75" />
          <polygon points="280,130 290,140 280,150 270,140" fill="#FB8C00" opacity="0.8" />
        </svg>
      );

    case "easter":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <linearGradient id={`easter-bg-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E0F7FA" />
              <stop offset="60%" stopColor="#FFF8E1" />
              <stop offset="100%" stopColor="#E8F5E9" />
            </linearGradient>
            <linearGradient id={`egg-pink-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F8BBD0" />
              <stop offset="100%" stopColor="#EC407A" />
            </linearGradient>
            <linearGradient id={`egg-blue-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B3E5FC" />
              <stop offset="100%" stopColor="#0288D1" />
            </linearGradient>
            <linearGradient id={`egg-gold-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF59D" />
              <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#easter-bg-${id})`} />
          {/* Spring Sunshine */}
          <circle cx="340" cy="50" r="35" fill="#FFF9C4" opacity="0.7" />
          {/* Spring Grass & Flowers at base */}
          <path d="M 0,185 Q 100,175 200,185 T 400,185 L 400,225 L 0,225 Z" fill="#A5D6A7" />
          <path d="M 0,195 Q 100,188 200,195 T 400,195 L 400,225 L 0,225 Z" fill="#81C784" />
          {/* Decorated Easter Eggs Centerpiece */}
          {/* Left Blue Egg */}
          <g transform="translate(130, 95) rotate(-15)">
            <ellipse cx="35" cy="50" rx="26" ry="36" fill={`url(#egg-blue-${id})`} />
            <path d="M 12,45 Q 35,35 58,45" fill="none" stroke="#FFF" strokeWidth="2.5" />
            <path d="M 14,58 Q 35,48 56,58" fill="none" stroke="#FFF" strokeWidth="2.5" strokeDasharray="3 3" />
          </g>
          {/* Right Gold Egg */}
          <g transform="translate(205, 98) rotate(15)">
            <ellipse cx="35" cy="50" rx="26" ry="36" fill={`url(#egg-gold-${id})`} />
            <path d="M 14,42 Q 35,32 56,42" fill="none" stroke="#FFF" strokeWidth="2.5" />
            <circle cx="35" cy="58" r="4" fill="#FFF" />
            <circle cx="24" cy="56" r="3" fill="#FFF" />
            <circle cx="46" cy="56" r="3" fill="#FFF" />
          </g>
          {/* Centerpiece Pink Egg */}
          <g transform="translate(165, 80)">
            <ellipse cx="35" cy="52" rx="29" ry="40" fill={`url(#egg-pink-${id})`} />
            <path d="M 8,42 Q 35,30 62,42" fill="none" stroke="#FFF" strokeWidth="3" />
            <path d="M 10,58 Q 35,46 60,58" fill="none" stroke="#FFF" strokeWidth="3" />
            <polygon points="35,28 37,34 43,34 38,38 40,44 35,40 30,44 32,38 27,34 33,34" fill="#FFF" />
          </g>
          {/* Spring Flower Blossoms */}
          <circle cx="70" cy="180" r="6" fill="#F48FB1" />
          <circle cx="70" cy="180" r="2.5" fill="#FFEB3B" />
          <circle cx="330" cy="185" r="7" fill="#CE93D8" />
          <circle cx="330" cy="185" r="3" fill="#FFF" />
          {/* Butterflies */}
          <path d="M 90,70 Q 95,65 100,70 Q 95,75 90,70 Z" fill="#AB47BC" />
        </svg>
      );

    case "vishu":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`vishu-bg-${id}`} cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#2A1604" />
              <stop offset="70%" stopColor="#120800" />
              <stop offset="100%" stopColor="#050200" />
            </radialGradient>
            <linearGradient id={`gold-metal-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
            <radialGradient id={`konna-glow-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="60%" stopColor="#FDD835" />
              <stop offset="100%" stopColor="#F57F17" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#vishu-bg-${id})`} />
          {/* Warm Halo */}
          <circle cx="200" cy="115" r="85" fill="#FFB300" opacity="0.18" />
          {/* Traditional Kerala Brass Uruli (Vessel) */}
          <ellipse cx="200" cy="165" rx="75" ry="22" fill={`url(#gold-metal-${id})`} />
          <ellipse cx="200" cy="163" rx="71" ry="18" fill="#5D2E0C" />
          <ellipse cx="200" cy="161" rx="68" ry="15" fill="#FFE082" opacity="0.35" />
          {/* Uruli Handles */}
          <path d="M 125,163 Q 115,163 115,170 Q 115,177 125,177" fill="none" stroke="#FFB300" strokeWidth="3" />
          <path d="M 275,163 Q 285,163 285,170 Q 285,177 275,177" fill="none" stroke="#FFB300" strokeWidth="3" />
          {/* Kanikonna Yellow Golden Shower Flowers Cascading */}
          <g fill={`url(#konna-glow-${id})`}>
            {/* Hanging Branches from top */}
            <circle cx="160" cy="70" r="10" />
            <circle cx="175" cy="85" r="11" />
            <circle cx="190" cy="100" r="12" />
            <circle cx="175" cy="115" r="10" />
            <circle cx="210" cy="75" r="11" />
            <circle cx="225" cy="90" r="13" />
            <circle cx="240" cy="105" r="11" />
            <circle cx="220" cy="120" r="12" />
            <circle cx="200" cy="130" r="12" />
            <circle cx="185" cy="140" r="9" />
            <circle cx="215" cy="142" r="9" />
          </g>
          {/* Golden Yellow Petals Detail */}
          <g fill="#FFF59D">
            <circle cx="160" cy="70" r="4" />
            <circle cx="175" cy="85" r="4.5" />
            <circle cx="190" cy="100" r="5" />
            <circle cx="225" cy="90" r="5" />
            <circle cx="200" cy="130" r="4.5" />
          </g>
          {/* Nilavilakku (Sacred Brass Kerala Oil Lamp) on side */}
          <g transform="translate(65, 80)">
            <ellipse cx="25" cy="105" rx="20" ry="6" fill={`url(#gold-metal-${id})`} />
            <rect x="23" y="45" width="4" height="60" fill={`url(#gold-metal-${id})`} />
            <ellipse cx="25" cy="45" rx="14" ry="4" fill={`url(#gold-metal-${id})`} />
            {/* Lamp Flame */}
            <ellipse cx="25" cy="35" rx="4" ry="9" fill="#FFF59D" />
            <ellipse cx="25" cy="36" rx="2.5" ry="6" fill="#FF5722" />
          </g>
          {/* Golden Rice Grain & Coin Harvest Accents */}
          <circle cx="170" cy="165" r="4" fill="#FFD700" />
          <circle cx="230" cy="165" r="4" fill="#FFD700" />
        </svg>
      );

    case "ganesh-chaturthi":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`ganesh-bg-${id}`} cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#4A0E17" />
              <stop offset="60%" stopColor="#20050A" />
              <stop offset="100%" stopColor="#0B0103" />
            </radialGradient>
            <radialGradient id={`ganesh-halo-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="40%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`gold-grad-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#ganesh-bg-${id})`} />
          {/* Sacred Aura Prabha (Prabhavali) */}
          <circle cx="200" cy="100" r="75" fill={`url(#ganesh-halo-${id})`} opacity="0.65" />
          <circle cx="200" cy="100" r="65" fill="none" stroke="#FFD54F" strokeWidth="2" strokeDasharray="4 3" opacity="0.75" />
          {/* Majestic Lord Ganesha Sacred Silhouette & Crown */}
          {/* Crown (Mukut) */}
          <path d="M 185,45 L 200,18 L 215,45 L 210,60 L 190,60 Z" fill={`url(#gold-grad-${id})`} />
          <circle cx="200" cy="38" r="4" fill="#D32F2F" />
          {/* Elephant Ears */}
          <path d="M 180,75 C 135,65 130,115 175,120 Z" fill={`url(#gold-grad-${id})`} opacity="0.95" />
          <path d="M 220,75 C 265,65 270,115 225,120 Z" fill={`url(#gold-grad-${id})`} opacity="0.95" />
          {/* Face & Curved Trunk (Vakratunda) */}
          <ellipse cx="200" cy="85" rx="22" ry="26" fill={`url(#gold-grad-${id})`} />
          <path d="M 194,95 C 194,130 178,145 190,150 C 205,155 212,138 206,120 L 206,95 Z" fill={`url(#gold-grad-${id})`} />
          {/* Sacred Tilak / Trishul Mark on Forehead */}
          <path d="M 196,70 Q 200,66 204,70 L 200,82 Z" fill="#D32F2F" />
          <circle cx="200" cy="84" r="2.5" fill="#FFEB3B" />
          {/* Auspicious Golden Modak in Tray */}
          <g transform="translate(145, 150)">
            <ellipse cx="15" cy="20" rx="16" ry="6" fill="#FFB300" />
            <path d="M 7,18 C 7,8 15,2 15,2 C 15,2 23,8 23,18 Z" fill="#FFE082" stroke="#FFB300" strokeWidth="1" />
          </g>
          {/* Hibiscus (Japa Pushpa) Sacred Red Flowers */}
          <circle cx="260" cy="165" r="10" fill="#E53935" />
          <circle cx="260" cy="165" r="4" fill="#FFEB3B" />
          <circle cx="120" cy="165" r="9" fill="#E53935" />
          <circle cx="120" cy="165" r="3.5" fill="#FFEB3B" />
        </svg>
      );

    case "onam":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`onam-bg-${id}`} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1E3314" />
              <stop offset="70%" stopColor="#0E1A08" />
              <stop offset="100%" stopColor="#040902" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#onam-bg-${id})`} />
          {/* Ambient Glow */}
          <circle cx="200" cy="112" r="90" fill="#FFD700" opacity="0.12" />
          {/* Grand Pookkalam (Intricate Sacred Floral Carpet) */}
          <g transform="translate(200, 112)">
            {/* Outer Marigold Orange Ring */}
            <circle cx="0" cy="0" r="82" fill="#E65100" />
            {/* Yellow Marigold Ring with Petal Serrations */}
            <circle cx="0" cy="0" r="74" fill="#FFB300" />
            <circle cx="0" cy="0" r="66" fill="#FDD835" />
            {/* Deep Violet Petal Ring */}
            <circle cx="0" cy="0" r="56" fill="#6A1B9A" />
            {/* White Jasmine Petal Ring */}
            <circle cx="0" cy="0" r="46" fill="#F5F5F5" />
            {/* Scarlet Rose Ring */}
            <circle cx="0" cy="0" r="36" fill="#C62828" />
            {/* Center Golden Core with Traditional Brass Nilavilakku */}
            <circle cx="0" cy="0" r="24" fill="#FFD54F" />
            <circle cx="0" cy="0" r="16" fill="#FF8F00" />
            {/* Central Living Flame */}
            <circle cx="0" cy="0" r="7" fill="#FFE082" />
            <ellipse cx="0" cy="-3" rx="4" ry="8" fill="#FFF59D" />
            <ellipse cx="0" cy="-2" rx="2" ry="5" fill="#E65100" />
            {/* Floral Mandala Rays (8 geometric petals) */}
            <path d="M 0,-56 L 6,-46 L -6,-46 Z" fill="#FFEB3B" />
            <path d="M 0,56 L 6,46 L -6,46 Z" fill="#FFEB3B" />
            <path d="M -56,0 L -46,6 L -46,-6 Z" fill="#FFEB3B" />
            <path d="M 56,0 L 46,6 L 46,-6 Z" fill="#FFEB3B" />
            <path d="M -40,-40 L -30,-36 L -36,-30 Z" fill="#FFEB3B" />
            <path d="M 40,-40 L 30,-36 L 36,-30 Z" fill="#FFEB3B" />
            <path d="M -40,40 L -30,36 L -36,30 Z" fill="#FFEB3B" />
            <path d="M 40,40 L 30,36 L 36,30 Z" fill="#FFEB3B" />
          </g>
          {/* Fresh Green Banana Leaf Platter in corners */}
          <path d="M 0,225 Q 50,180 100,200 L 0,225 Z" fill="#388E3C" opacity="0.6" />
          <path d="M 400,225 Q 350,180 300,200 L 400,225 Z" fill="#388E3C" opacity="0.6" />
        </svg>
      );

    case "mid-autumn":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`moon-bg-${id}`} cx="60%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#1A237E" />
              <stop offset="60%" stopColor="#0D1142" />
              <stop offset="100%" stopColor="#05061B" />
            </radialGradient>
            <radialGradient id={`full-moon-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FFF9C4" />
              <stop offset="85%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`lantern-red-${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B71C1C" />
              <stop offset="40%" stopColor="#FF1744" />
              <stop offset="100%" stopColor="#B71C1C" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#moon-bg-${id})`} />
          {/* Giant Radiant Full Harvest Moon */}
          <circle cx="260" cy="85" r="58" fill={`url(#full-moon-${id})`} />
          <circle cx="260" cy="85" r="42" fill="#FFFDE7" opacity="0.95" />
          {/* Traditional Glowing Red Silk Lanterns */}
          {/* Left Large Lantern */}
          <g transform="translate(85, 30)">
            <line x1="30" y1="0" x2="30" y2="25" stroke="#FFD700" strokeWidth="2" />
            <rect x="18" y="25" width="24" height="6" rx="2" fill="#FFD700" />
            <ellipse cx="30" cy="65" rx="26" ry="34" fill={`url(#lantern-red-${id})`} />
            <rect x="20" y="98" width="20" height="6" rx="2" fill="#FFD700" />
            {/* Tassel */}
            <line x1="30" y1="104" x2="30" y2="135" stroke="#FFD700" strokeWidth="2" />
            <circle cx="30" cy="138" r="3" fill="#D50000" />
          </g>
          {/* Right Floating Lantern */}
          <g transform="translate(150, 60) scale(0.65)">
            <line x1="30" y1="0" x2="30" y2="25" stroke="#FFD700" strokeWidth="2" />
            <ellipse cx="30" cy="65" rx="26" ry="34" fill={`url(#lantern-red-${id})`} />
            <line x1="30" y1="104" x2="30" y2="135" stroke="#FFD700" strokeWidth="2" />
          </g>
          {/* Delicately Embossed Golden Mooncake at base */}
          <g transform="translate(230, 140)">
            <ellipse cx="40" cy="35" rx="36" ry="18" fill="#8D4925" />
            <ellipse cx="40" cy="28" rx="34" ry="16" fill="#D78848" />
            <ellipse cx="40" cy="27" rx="26" ry="12" fill="#E69C5A" />
            <circle cx="40" cy="27" r="8" fill="#F0B27A" stroke="#8D4925" strokeWidth="1" />
          </g>
          {/* Delicate Autumn Osmanthus Blossoms */}
          <circle cx="170" cy="170" r="3" fill="#FFE082" />
          <circle cx="185" cy="165" r="2.5" fill="#FFE082" />
          <circle cx="330" cy="175" r="3.5" fill="#FFE082" />
        </svg>
      );

    case "dussehra":
      return (
        <svg viewBox="0 0 400 225" width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`dussehra-bg-${id}`} cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#3E1103" />
              <stop offset="60%" stopColor="#1B0601" />
              <stop offset="100%" stopColor="#080200" />
            </radialGradient>
            <linearGradient id={`flame-grad-${id}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#D50000" />
              <stop offset="50%" stopColor="#FF6D00" />
              <stop offset="100%" stopColor="#FFD600" />
            </linearGradient>
            <linearGradient id={`bow-gold-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="50%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#dussehra-bg-${id})`} />
          {/* Victory Sunset & Bonfire Glow */}
          <circle cx="200" cy="120" r="85" fill="#FF6D00" opacity="0.25" />
          {/* Divine Golden Bow (Kodanda) & Flaming Arrow of Lord Rama */}
          <g transform="translate(125, 45)">
            {/* The Great Curved Bow */}
            <path d="M 20,130 C 5,80 5,40 20,0" fill="none" stroke={`url(#bow-gold-${id})`} strokeWidth="4.5" strokeLinecap="round" />
            {/* Bow String */}
            <line x1="20" y1="0" x2="20" y2="130" stroke="#FFF" strokeWidth="1.2" opacity="0.8" />
            {/* The Flaming Arrow of Righteousness (Dharma) */}
            <line x1="15" y1="65" x2="160" y2="65" stroke={`url(#bow-gold-${id})`} strokeWidth="3" />
            {/* Arrowhead */}
            <polygon points="175,65 155,56 160,65 155,74" fill="#FFD600" />
            {/* Arrow Fletching */}
            <polygon points="15,65 5,58 8,65 5,72" fill="#FF6D00" />
            {/* Fiery Trail */}
            <circle cx="170" cy="65" r="10" fill="#FFD600" opacity="0.4" />
          </g>
          {/* Sacred Victory Apta Leaves (Sona / Golden Leaves) */}
          <g fill="#FFD54F" opacity="0.85">
            <path d="M 60,165 C 45,150 45,185 60,195 C 75,185 75,150 60,165 Z" />
            <path d="M 330,165 C 315,150 315,185 330,195 C 345,185 345,150 330,165 Z" />
          </g>
          {/* Celebratory Victory Sparkles */}
          <circle cx="95" cy="50" r="2" fill="#FFD600" />
          <circle cx="310" cy="45" r="2" fill="#FFD600" />
          <circle cx="285" cy="130" r="2.5" fill="#FFAB00" />
        </svg>
      );

    default:
      return null;
  }
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

  // Check if we have bespoke vector art for this festival
  const vectorArt = renderArtisticIllustration(id, festival, isThumb);

  // If we have bespoke vector art, render it directly for rich, authentic cultural visuals
  if (vectorArt) {
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
          boxShadow: isThumb ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
          ...style,
        }}
      >
        {vectorArt}

        {/* Cinematic Vignette Overlay to ensure text & badge legibility */}
        {!isThumb && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.6) 100%)",
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

  // Otherwise, use photographic imagery from public/festivals
  const imageSrc = GENERATED_FESTIVAL_IMAGES[id] || `/festivals/${id}.jpg`;

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
