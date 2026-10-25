/**
 * Utsav — Indian Festival Themes
 * High-End Minimalist Storefront Effects Engine
 * Stationary Corner Diyas, Subtle Aerial Fireworks, Realistic Series Lights, Soaring Kites & Hilal Crescent Moon
 */

(function () {
  "use strict";

  function teardownExistingEffects() {
    [
      "utsav-festival-banner",
      "utsav-ambient-vignette",
      "utsav-top-garland",
      "utsav-garland-left",
      "utsav-garland-right",
      "utsav-corner-container",
      "utsav-ghost-container",
      "utsav-kites-container",
      "utsav-snow-canvas",
      "utsav-fireworks-canvas",
      "utsav-wheel-trigger",
    ].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll(".utsav-discount-badge").forEach(function (b) {
      b.remove();
    });
  }

  const FESTIVAL_META = {
    "halloween": { name: "Halloween", emoji: "🎃", defaultBanner: "🎃 Spooktacular Deals! Treat yourself to enchanting Halloween savings! 👻" },
    "christmas": { name: "Christmas", emoji: "🎄", defaultBanner: "⭐ Merry Christmas! Celebrate the season of warmth, peace, and holiday gifting! 🎄" },
    "christmas-india": { name: "Christmas", emoji: "🎄", defaultBanner: "⭐ Merry Christmas! Celebrate the season of warmth, peace, and holiday gifting! 🎄" },
    "diwali": { name: "Diwali", emoji: "🪔", defaultBanner: "✨ Happy Diwali! Celebrate the festival of lights with exclusive blessings & offers!" },
    "holi": { name: "Holi", emoji: "🎨", defaultBanner: "🌈 Happy Holi! Splash into joyous celebrations with vibrant festive discounts!" },
    "navratri": { name: "Navratri", emoji: "💃", defaultBanner: "🌺 Shubh Navratri! Celebrate 9 nights of devotion, garba & grand offers!" },
    "valentines": { name: "Valentine's", emoji: "💖", defaultBanner: "💖 Spread Love! Discover exquisite Valentine's specials for someone special!" },
    "lunar-new-year": { name: "Lunar New Year", emoji: "🏮", defaultBanner: "🏮 Happy Lunar New Year! Wishing you boundless prosperity, luck & happiness!" },
    "hanukkah": { name: "Hanukkah", emoji: "🕎", defaultBanner: "🕎 Happy Hanukkah! May your days be illuminated with light, joy & peace!" },
    "easter": { name: "Easter", emoji: "🐣", defaultBanner: "🐣 Happy Easter! Spring into fresh renewal & delightful festive treats!" },
    "thanksgiving": { name: "Thanksgiving", emoji: "🦃", defaultBanner: "🍂 Happy Thanksgiving! Harvest blessings and gratitude-filled holiday specials!" },
    "new-year": { name: "New Year", emoji: "🥂", defaultBanner: "🥂 Happy New Year! Welcome a brilliant new beginning with celebratory perks!" },
    "pongal": { name: "Pongal", emoji: "🌾", defaultBanner: "🌾 Happy Pongal! Overflowing abundance, joy & prosperity to your family!" },
    "onam": { name: "Onam", emoji: "🌸", defaultBanner: "🌸 Happy Onam! Celebrate the grand harvest homecoming of King Mahabali!" },
    "raksha-bandhan": { name: "Raksha Bandhan", emoji: "🧵", defaultBanner: "🧵 Happy Raksha Bandhan! Cherish eternal sibling love with heartfelt gifts!" },
    "ganesh-chaturthi": { name: "Ganesh Chaturthi", emoji: "🐘", defaultBanner: "🌺 Ganpati Bappa Morya! May Lord Ganesha bestow wisdom, health & success!" },
    "eid": { name: "Eid al-Fitr", emoji: "🌙", defaultBanner: "🌙 Eid Mubarak! Peace, blessings, and prosperity to you and family!" },
    "mid-autumn": { name: "Mid-Autumn", emoji: "🥮", defaultBanner: "🥮 Happy Mid-Autumn Festival! Harmonious reunions under the full harvest moon!" },
    "vesak": { name: "Vesak Day", emoji: "🪷", defaultBanner: "🪷 Happy Vesak Day! May universal peace, compassion & mindfulness shine on all!" },
    "vishu": { name: "Vishu", emoji: "🌿", defaultBanner: "🌿 Happy Vishu! Golden Kani blossoms and auspicious new year beginnings!" },
    "durga-puja": { name: "Durga Puja", emoji: "🔱", defaultBanner: "🔱 Shubho Sharodiya! Divine strength, victory & blessings from Maa Durga!" },
    "makar-sankranti": { name: "Makar Sankranti", emoji: "🪁", defaultBanner: "🪁 Happy Makar Sankranti! Soar high with auspicious sunshine & sweet revdis!" },
    "dussehra": { name: "Dussehra", emoji: "🏹", defaultBanner: "🏹 Happy Dussehra! Celebrating the eternal triumph of righteousness and courage!" }
  };

  function startFestiveEngine(rawConfig) {
    teardownExistingEffects();

    const config = rawConfig || {};
    const festivalId = (config.festivalId || "diwali").toLowerCase();
    const meta = FESTIVAL_META[festivalId] || (festivalId.includes("halloween") ? FESTIVAL_META["halloween"] : (festivalId.includes("christmas") ? FESTIVAL_META["christmas"] : FESTIVAL_META["diwali"]));
    const isDiwali = festivalId.includes("diwali");
    const isDussehra = festivalId.includes("dussehra");
    const isSankranti = festivalId.includes("sankranti") || festivalId.includes("pongal");
    const isEid = festivalId.includes("eid");
    const isChristmas = festivalId.includes("christmas");
    const isVishu = festivalId === "vishu";

    const palette = config.palette || meta.palette || {
      primary: "#D4AF37",
      secondary: "#FF6B35",
      accent: "#8B0000",
      background: "#1A0A00",
      glow: "rgba(212, 175, 55, 0.35)",
    };

    const enableEffects = config.enableEffects !== undefined ? Boolean(config.enableEffects) : true;
    const enableBanner = config.enableBanner !== undefined ? Boolean(config.enableBanner) : false;
    const enableCountdown = Boolean(config.enableCountdown);
    const enableColorSwap = config.enableColorSwap !== undefined ? Boolean(config.enableColorSwap) : true;
    const enableAudio = config.enableAudio !== undefined ? Boolean(config.enableAudio) : true;
    const enableWheel = Boolean(config.enableWheel);

    const festivalName = (config.festivalName && !config.festivalName.toLowerCase().includes("diwali"))
      ? config.festivalName
      : (festivalId.includes("diwali") ? (config.festivalName || "Diwali") : meta.name);
    const festivalEmoji = (config.festivalEmoji && config.festivalEmoji !== "🪔")
      ? config.festivalEmoji
      : (festivalId.includes("diwali") ? (config.festivalEmoji || "🪔") : meta.emoji);

    const bannerText = config.bannerText || meta.defaultBanner || (festivalName ? `✨ Celebrate ${festivalName} with Festive Offers!` : "");
    const couponCode = config.couponCode || config.promoCode || "";
    const countdownTarget = config.countdownTarget || null;

    // 🪔 Diya Customizations
    const diyaStyle = config.diyaStyle || "royal_brass";
    const flameGlow = config.flameGlow || "warm_radiance";
    const diyaSize = config.diyaSize || "medium";
    const diyaPosition = config.diyaPosition || "bottom_corners";
    const diyaMarginX = config.diyaMarginX !== undefined ? Number(config.diyaMarginX) : 18;
    const diyaMarginY = config.diyaMarginY !== undefined ? Number(config.diyaMarginY) : 18;
    const diyaHideOnMobile = Boolean(config.diyaHideOnMobile);

    // 🎆 Fireworks Customizations
    const fireworksFrequency = config.fireworksFrequency || "subtle";

    // 🪁 Kite Customizations
    const kiteCount = config.kiteCount || 2;
    const kiteSpeed = config.kiteSpeed || "gentle";

    // 🌙 Moon Customizations
    const moonPosition = config.moonPosition || "top_right";

    // 🌿 Garland & Series Lights Customizations
    const garlandLayout = config.garlandLayout || "top_and_sides";
    const garlandPlacement = config.garlandPlacement || "below_header";
    const garlandScrollMode = config.garlandScrollMode || "natural_scroll";
    const garlandOffset = parseInt(config.garlandOffset, 10) || 0;
    const enableSeriesLights = config.enableSeriesLights !== undefined
      ? Boolean(config.enableSeriesLights)
      : (config.seriesLightsTheme !== "off" && isDiwali);
    const seriesLightsTheme = config.seriesLightsTheme || "warm_gold";
    const seriesLightsMode = config.seriesLightsMode || "twinkle";

    // ─── 1. Apply Subtle Luxury CSS Color Variables ──────────────────────────────
    if (enableColorSwap && palette) {
      const root = document.documentElement;
      root.style.setProperty("--utsav-primary", palette.primary || "#D4AF37");
      root.style.setProperty("--utsav-secondary", palette.secondary || "#FF6B35");
      root.style.setProperty("--utsav-accent", palette.accent || "#8B0000");
      root.style.setProperty("--utsav-bg", palette.background || "#111318");
      root.style.setProperty("--utsav-glow", palette.glow || "rgba(212, 175, 55, 0.35)");
    }

    // ─── 2. Atmospheric Corner Vignette & Ambient Warmth ─────────────────────────
    if (enableEffects && isDiwali) {
      const vignette = document.createElement("div");
      vignette.className = "utsav-ambient-vignette";
      vignette.id = "utsav-ambient-vignette";
      vignette.style.background = `
        radial-gradient(circle at 4% 96%, rgba(255, 170, 0, 0.14) 0%, transparent 30%),
        radial-gradient(circle at 96% 96%, rgba(255, 170, 0, 0.14) 0%, transparent 30%)
      `;
      document.body.appendChild(vignette);
    }

    // ─── 3.5 Inject Top Toran & Side Garlands (Culturally Tailored for All 22 Festivals) ───
    if (enableEffects && garlandLayout !== "off") {
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

      function getEfTopSVG(festId) {
        const fest = (festId || "").toLowerCase();

        // 1. Halloween: Fully Responsive Gossamer Cobwebs with Active Alive Dropping & Scrawling Arachnid
        if (fest.includes("halloween")) {
          return `
            <div class="utsav-spiderweb-wrapper">
              <!-- Central Draped Silk Swags (Flexible catenary curves across header) -->
              <div class="utsav-web-catenary-wrap">
                <svg width="100%" height="50" viewBox="0 0 1000 50" preserveAspectRatio="none" style="display:block; width:100%; height:100%; pointer-events:none; overflow:visible;">
                  <path d="M 0 3 Q 150 18 300 4 Q 450 22 600 5 Q 800 20 1000 3" stroke="rgba(240, 244, 255, 0.75)" stroke-width="1.3" fill="none" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45));"/>
                  <path d="M 0 5 Q 100 28 200 6 Q 360 32 520 8 Q 700 30 880 7 Q 940 22 1000 5" stroke="rgba(220, 210, 245, 0.55)" stroke-width="0.95" fill="none"/>
                  <path d="M 120 14 Q 280 38 440 12 Q 600 36 760 10 Q 920 34 1000 14" stroke="rgba(255, 255, 255, 0.35)" stroke-width="0.8" stroke-dasharray="4,2" fill="none"/>
                </svg>
              </div>

              <!-- Left Corner Natural Radial Cobweb (Fixed aspect ratio, anchored to top-left corner) -->
              <div class="utsav-corner-web utsav-corner-web--left" style="position: absolute; left: 0; top: 0; width: clamp(150px, 18vw, 260px); height: clamp(110px, 13.2vw, 190px);">
                <svg viewBox="0 0 260 190" preserveAspectRatio="xMinYMin meet" style="display:block; width:100%; height:100%; overflow:visible; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45));">${buildSpiderWeb()}</svg>
              </div>

              <!-- Right Corner Natural Radial Cobweb (Mirrored, anchored to top-right corner) -->
              <div class="utsav-corner-web utsav-corner-web--right" style="position: absolute; right: 0; top: 0; width: clamp(150px, 18vw, 260px); height: clamp(110px, 13.2vw, 190px); transform: scaleX(-1);">
                <svg viewBox="0 0 260 190" preserveAspectRatio="xMinYMin meet" style="display:block; width:100%; height:100%; overflow:visible; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45));">${buildSpiderWeb()}</svg>
              </div>

              <!-- Left Corner Resident Active Spider (Creeps along web spoke) -->
              <div class="utsav-left-spider" style="left: clamp(40px, 9vw, 95px); top: clamp(16px, 3.5vw, 34px); width: 28px; height: 28px;">
                <div class="utsav-left-spider-creature" style="width: 100%; height: 100%;">
                  <svg viewBox="0 0 32 32" style="width: 100%; height: 100%; overflow: visible; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                    <g class="utsav-spider-leg-a">
                      <path d="M 14 12 Q 7 7 4 9 L 2 15" stroke="#120E18" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                      <path d="M 13 15 Q 5 15 3 20 L 4 26" stroke="#120E18" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                      <path d="M 19 14 Q 26 11 29 15 L 30 21" stroke="#120E18" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                      <path d="M 18 16 Q 25 20 26 26 L 24 31" stroke="#120E18" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                    </g>
                    <g class="utsav-spider-leg-b">
                      <path d="M 14 13 Q 6 11 3 15 L 2 21" stroke="#120E18" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                      <path d="M 14 16 Q 7 20 5 26 L 7 31" stroke="#120E18" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                      <path d="M 18 12 Q 25 7 28 9 L 30 15" stroke="#120E18" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                      <path d="M 19 15 Q 27 15 29 20 L 28 26" stroke="#120E18" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                    </g>
                    <ellipse cx="16" cy="20" rx="4.8" ry="6.2" fill="#110D17" stroke="#2B1E38" stroke-width="0.7"/>
                    <polygon points="16,16 14,18.5 18,18.5" fill="#FF7518" opacity="0.95"/>
                    <polygon points="16,21 14,18.5 18,18.5" fill="#FF7518" opacity="0.95"/>
                    <circle cx="16" cy="13" r="3" fill="#171220" stroke="#322244" stroke-width="0.6"/>
                    <circle cx="14.8" cy="11.8" r="0.6" fill="#FF4500" class="utsav-spider-eye"/>
                    <circle cx="17.2" cy="11.8" r="0.6" fill="#FF4500" class="utsav-spider-eye"/>
                  </svg>
                </div>
              </div>

              <!-- Hero Active Spider Rig: Alive, Suddenly Bungee Drops, Sways, Climbs Up, & Scrawls Along Web -->
              <div class="utsav-spider-rig">
                <div class="utsav-spider-silk"></div>
                <div class="utsav-spider-creature" title="Spooky Arachnid — click or hover!">
                  <svg viewBox="0 0 44 44" style="width: 100%; height: 100%; overflow: visible; display: block; position: relative; z-index: 2;">
                    <g transform="rotate(180 22 22)">
                      <path d="M 20 14 Q 19 11 18 12 M 24 14 Q 25 11 26 12" stroke="#14101A" stroke-width="1.3" stroke-linecap="round" fill="none"/>
                      <g class="utsav-spider-leg-a">
                        <path d="M 19 16 Q 10 9 6 12 L 3 19" stroke="#14101A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M 18 19 Q 8 19 5 25 L 7 34" stroke="#14101A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M 25 18 Q 35 14 39 20 L 41 28" stroke="#14101A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M 25 21 Q 34 26 36 34 L 33 42" stroke="#14101A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                      </g>
                      <g class="utsav-spider-leg-b">
                        <path d="M 19 18 Q 9 14 5 20 L 3 28" stroke="#14101A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M 19 21 Q 10 26 8 34 L 11 42" stroke="#14101A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M 25 16 Q 34 9 38 12 L 41 19" stroke="#14101A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M 26 19 Q 36 19 39 25 L 37 34" stroke="#14101A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                      </g>
                      <ellipse cx="22" cy="18" rx="4.2" ry="4.8" fill="#16111E" stroke="#2F213E" stroke-width="0.8"/>
                      <circle cx="20.7" cy="15.2" r="0.9" fill="#FF4500" class="utsav-spider-eye"/>
                      <circle cx="23.3" cy="15.2" r="0.9" fill="#FF4500" class="utsav-spider-eye"/>
                      <circle cx="19.5" cy="17" r="0.5" fill="#FFD700"/>
                      <circle cx="24.5" cy="17" r="0.5" fill="#FFD700"/>
                      <ellipse cx="22" cy="27" rx="6.8" ry="9" fill="#110C17" stroke="#2F213E" stroke-width="1"/>
                      <polygon points="22,22 19.2,25.5 24.8,25.5" fill="#FF7518" opacity="0.95"/>
                      <polygon points="22,29 19.2,25.5 24.8,25.5" fill="#FF7518" opacity="0.95"/>
                      <ellipse cx="22" cy="31.5" rx="1.8" ry="2.6" fill="#FF3D00" opacity="0.9"/>
                      <circle cx="18.5" cy="28" r="0.8" fill="#FFB74D" opacity="0.8"/>
                      <circle cx="25.5" cy="28" r="0.8" fill="#FFB74D" opacity="0.8"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          `;
        }

        // 2. Christmas: Evergreen Pine & Holly Swag with Twinkling Holiday Bulbs
        if (fest.includes("christmas")) {
          const holidayColors = ["#FF1744", "#FFD700", "#00E676", "#2979FF"];
          return `
            <svg width="100%" height="54" viewBox="0 0 1200 54" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 5 Q 600 32 1200 5" stroke="#1B4D2E" stroke-width="4.5" fill="none"/>
              ${[40, 140, 240, 340, 440, 540, 640, 740, 840, 940, 1040, 1140].map((x, i) => `
                <g transform="translate(${x}, 14)">
                  <path d="M -12 -6 L 0 0 L -12 6" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M 12 -6 L 0 0 L 12 6" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round"/>
                  <circle cx="0" cy="0" r="4.5" fill="${holidayColors[i % holidayColors.length]}" class="utsav-bulb-twinkle-1" style="filter: drop-shadow(0 0 6px #FFD700);"/>
                  <circle cx="-5" cy="5" r="2.5" fill="#D32F2F"/>
                  <circle cx="5" cy="5" r="2.5" fill="#D32F2F"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 3. Valentine's Day: Pink & Scarlet Ribbon Swags with Floating Hearts
        if (fest.includes("valentines")) {
          return `
            <svg width="100%" height="50" viewBox="0 0 1200 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 6 Q 600 26 1200 6" stroke="#E91E63" stroke-width="2.5" fill="none"/>
              ${[50, 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150].map((x) => `
                <g transform="translate(${x}, 12)">
                  <path d="M 0 0 C -4 -6 -10 -4 -10 2 C -10 7 0 14 0 14 C 0 14 10 7 10 2 C 10 -4 4 -6 0 0 Z" fill="#FF4081"/>
                  <circle cx="0" cy="0" r="1.5" fill="#FFF"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 4. Lunar New Year: Imperial Red & Gold Cord with Lucky Coins
        if (fest.includes("lunar") || fest.includes("chinese")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="4" x2="1200" y2="4" stroke="#D32F2F" stroke-width="3"/>
              ${[40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160].map((x) => `
                <g transform="translate(${x}, 0)">
                  <line x1="0" y1="4" x2="0" y2="16" stroke="#FFD700" stroke-width="1.4"/>
                  <circle cx="0" cy="22" r="6" fill="#FFD700" stroke="#B78103" stroke-width="1"/>
                  <rect x="-2" y="20" width="4" height="4" fill="#8B0000"/>
                  <line x1="0" y1="28" x2="0" y2="42" stroke="#D32F2F" stroke-width="2"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 5. Holi: Festive Color Bunting with Gulal Pom-Poms
        if (fest.includes("holi")) {
          const pomColors = ["#E91E63", "#FF9800", "#FFEB3B", "#00E5FF", "#76FF03"];
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 5 Q 600 24 1200 5" stroke="#FF4081" stroke-width="2" fill="none"/>
              ${[30, 110, 190, 270, 350, 430, 510, 590, 670, 750, 830, 910, 990, 1070, 1150].map((x, i) => `
                <g transform="translate(${x}, 0)">
                  <line x1="0" y1="5" x2="0" y2="20" stroke="#E0E0E0" stroke-width="0.9"/>
                  <circle cx="0" cy="26" r="7" fill="${pomColors[i % pomColors.length]}"/>
                  <circle cx="0" cy="26" r="3" fill="#FFFFFF" opacity="0.6"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 6. Pongal: Sugarcane & Turmeric Foliage Arch
        if (fest.includes("pongal")) {
          return `
            <svg width="100%" height="54" viewBox="0 0 1200 54" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="4" x2="1200" y2="4" stroke="#2E7D32" stroke-width="3"/>
              ${[40, 140, 240, 340, 440, 540, 640, 740, 840, 940, 1040, 1140].map((x) => `
                <g transform="translate(${x}, 0)">
                  <path d="M -14 4 Q 0 28 14 4" stroke="#1B5E20" stroke-width="2.5" fill="none"/>
                  <circle cx="0" cy="22" r="3.8" fill="#FBC02D"/>
                  <line x1="0" y1="4" x2="0" y2="38" stroke="#388E3C" stroke-width="1.8"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 7. Onam: Palm Kuruthola Thoranam
        if (fest.includes("onam")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="3" x2="1200" y2="3" stroke="#558B2F" stroke-width="2.5"/>
              ${[25, 75, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575, 625, 675, 725, 775, 825, 875, 925, 975, 1025, 1075, 1125, 1175].map((x, i) => `
                <g transform="translate(${x}, 0)">
                  <polygon points="-5,3 0,30 5,3" fill="#7CB342"/>
                  ${i % 2 === 0 ? '<circle cx="0" cy="34" r="3.5" fill="#FFB300"/>' : ''}
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 8. Vishu: Golden Kanikonna Blossom Cascades
        if (fest === "vishu") {
          return `
            <svg width="100%" height="56" viewBox="0 0 1200 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="4" x2="1200" y2="4" stroke="#2E7D32" stroke-width="3"/>
              ${[35, 125, 215, 305, 395, 485, 575, 665, 755, 845, 935, 1025, 1115].map((x) => `
                <g transform="translate(${x}, 4)">
                  <path d="M 0 0 Q 8 20 0 42" stroke="#388E3C" stroke-width="1.8" fill="none"/>
                  <circle cx="-4" cy="10" r="4.2" fill="#FFD700"/>
                  <circle cx="5" cy="18" r="4.8" fill="#FFFF00"/>
                  <circle cx="-3" cy="25" r="4.8" fill="#FFD700"/>
                  <circle cx="4" cy="34" r="4.2" fill="#FFEA00"/>
                  <circle cx="0" cy="42" r="3.2" fill="#FFFF8D"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 9. Eid: Damascus Fanoos Lanterns & Golden Crescent Chain
        if (fest.includes("eid")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="3" x2="1200" y2="3" stroke="#D4AF37" stroke-width="1.8"/>
              ${[60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140].map((x) => `
                <g transform="translate(${x}, 0)">
                  <line x1="0" y1="3" x2="0" y2="14" stroke="#B78103" stroke-width="1.2"/>
                  <path d="M -8 14 L 8 14 L 6 32 L -6 32 Z" fill="#D4AF37" stroke="#996515" stroke-width="1"/>
                  <circle cx="0" cy="23" r="2.2" fill="#FFD700" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 10. Thanksgiving: Autumn Foliage (Oak & Maple leaves)
        if (fest.includes("thanksgiving")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="3" x2="1200" y2="3" stroke="#795548" stroke-width="2.5"/>
              ${[40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160].map((x, i) => `
                <g transform="translate(${x}, 0)">
                  <path d="M 0 3 Q ${i % 2 === 0 ? 18 : -18} 20 0 36" stroke="#D84315" stroke-width="2.2" fill="none"/>
                  <circle cx="-4" cy="14" r="3.5" fill="#E65100"/>
                  <circle cx="5" cy="24" r="4" fill="#F57F17"/>
                  <circle cx="-2" cy="32" r="3.2" fill="#BF360C"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 11. Hanukkah: Sapphire Blue & Silver Bunting
        if (fest.includes("hanukkah")) {
          return `
            <svg width="100%" height="50" viewBox="0 0 1200 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="2" x2="1200" y2="2" stroke="#1565C0" stroke-width="2"/>
              ${[50, 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150].map((x) => `
                <g transform="translate(${x}, 0)">
                  <line x1="0" y1="2" x2="0" y2="12" stroke="#90CAF9" stroke-width="1.2"/>
                  <polygon points="0,12 8,26 -8,26" stroke="#1976D2" stroke-width="1.2" fill="none"/>
                  <polygon points="0,28 8,14 -8,14" stroke="#1976D2" stroke-width="1.2" fill="none"/>
                  <circle cx="0" cy="20" r="2.5" fill="#E0F7FA" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 12. Easter: Spring Floral Vines & Pastel Eggs
        if (fest.includes("easter")) {
          const eggColors = ["#F8BBD0", "#B2EBF2", "#FFF9C4", "#D1C4E9", "#C8E6C9"];
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 6 Q 600 24 1200 6" stroke="#81C784" stroke-width="2.5" fill="none"/>
              ${[40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160].map((x, i) => `
                <g transform="translate(${x}, 8)">
                  <line x1="0" y1="0" x2="0" y2="12" stroke="#A5D6A7" stroke-width="1"/>
                  <ellipse cx="0" cy="18" rx="6" ry="8" fill="${eggColors[i % eggColors.length]}" stroke="#81C784" stroke-width="0.9"/>
                  <circle cx="-6" cy="6" r="2.5" fill="#F48FB1"/>
                  <circle cx="6" cy="6" r="2.5" fill="#FFF59D"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 13. New Year: Champagne Metallic Streamers
        if (fest.includes("new-year") || fest.includes("newyear")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="2" x2="1200" y2="2" stroke="#FFD700" stroke-width="2"/>
              ${[35, 115, 195, 275, 355, 435, 515, 595, 675, 755, 835, 915, 995, 1075, 1155].map((x, i) => `
                <g transform="translate(${x}, 0)">
                  <path d="M 0 2 Q ${i % 2 === 0 ? 10 : -10} 18 0 36" stroke="#FFE082" stroke-width="1.4" fill="none"/>
                  <polygon points="0,36 -4,27 4,27" fill="#FFD700"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 14. Mid-Autumn: Bamboo Pole & Sky Lantern Strings
        if (fest.includes("mid-autumn") || fest.includes("mooncake")) {
          return `
            <svg width="100%" height="54" viewBox="0 0 1200 54" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="3" x2="1200" y2="3" stroke="#8D6E63" stroke-width="2.2"/>
              ${[50, 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150].map((x) => `
                <g transform="translate(${x}, 0)">
                  <line x1="0" y1="3" x2="0" y2="14" stroke="#FFD54F" stroke-width="1.2"/>
                  <circle cx="0" cy="22" r="8.5" fill="#FFB74D" stroke="#E65100" stroke-width="1"/>
                  <line x1="0" y1="30.5" x2="0" y2="42" stroke="#D81B60" stroke-width="1.4"/>
                  <circle cx="0" cy="22" r="2.5" fill="#FFFDE7" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 15. Vesak: Sacred Bodhi Leaf & Jasmine Garland
        if (fest.includes("vesak") || fest.includes("buddha")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 4 Q 600 22 1200 4" stroke="#FB8C00" stroke-width="2" fill="none"/>
              ${[35, 115, 195, 275, 355, 435, 515, 595, 675, 755, 835, 915, 995, 1075, 1155].map((x) => `
                <g transform="translate(${x}, 4)">
                  <path d="M 0 0 C -7 9 -8 20 0 29 C 8 20 7 9 0 0 Z" fill="#43A047"/>
                  <circle cx="0" cy="31" r="3.5" fill="#FFFFFF"/>
                  <circle cx="0" cy="31" r="1.8" fill="#FFE082"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 16. Durga Puja: Alpana Border & Kash Reeds
        if (fest.includes("durga")) {
          return `
            <svg width="100%" height="50" viewBox="0 0 1200 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <rect x="0" y="0" width="100%" height="4" fill="#C62828"/>
              ${[20, 70, 120, 170, 220, 270, 320, 370, 420, 470, 520, 570, 620, 670, 720, 770, 820, 870, 920, 970, 1020, 1070, 1120, 1170].map((x) => `
                <g transform="translate(${x}, 4)">
                  <polygon points="0,0 -9,16 9,16" fill="#B71C1C"/>
                  <circle cx="0" cy="9" r="2.8" fill="#FFFDE7"/>
                  <line x1="0" y1="16" x2="0" y2="32" stroke="#ECEFF1" stroke-width="1.4" opacity="0.85"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 17. Raksha Bandhan: Silk Kalawa & Mauli Thread Swags
        if (fest.includes("raksha") || fest.includes("rakhi")) {
          return `
            <svg width="100%" height="50" viewBox="0 0 1200 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <line x1="0" y1="2" x2="1200" y2="2" stroke="#D32F2F" stroke-width="3"/>
              ${[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100].map((x) => `
                <g transform="translate(${x}, 0)">
                  <path d="M 0 2 Q 50 26 100 2" stroke="#FFC107" stroke-width="1.8" fill="none"/>
                  <path d="M 12 2 Q 50 20 88 2" stroke="#D32F2F" stroke-width="1.4" fill="none"/>
                  <circle cx="50" cy="26" r="4" fill="#FFD700"/>
                  <circle cx="50" cy="26" r="2" fill="#D32F2F"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 18. Navratri: Mirrored Bandhanwar & Gold Gota
        if (fest.includes("navratri")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <rect x="0" y="0" width="100%" height="4.5" fill="#FF4500"/>
              ${[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040, 1120].map((x, i) => `
                <g transform="translate(${x}, 4.5)">
                  <polygon points="0,0 40,28 80,0" fill="${i % 2 === 0 ? '#C2185B' : '#FF6F00'}"/>
                  <circle cx="40" cy="14" r="5" fill="#E0E0E0" stroke="#FFD700" stroke-width="0.9"/>
                  <circle cx="40" cy="29" r="2.5" fill="#FFD700"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 19. Ganesh Chaturthi: Hibiscus Flowers & Sacred Durva Grass Arch
        if (fest.includes("ganesh")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 5 Q 600 24 1200 5" stroke="#2E7D32" stroke-width="3.5" fill="none"/>
              ${[40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160].map((x) => `
                <g transform="translate(${x}, 8)">
                  <circle cx="0" cy="8" r="7" fill="#D32F2F"/>
                  <circle cx="0" cy="8" r="3" fill="#FFEB3B"/>
                  <path d="M -9 16 Q 0 5 9 16" stroke="#43A047" stroke-width="2.2" fill="none"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 20. Makar Sankranti: Flying Kite Streamers
        if (fest.includes("sankranti") || fest.includes("uttarayan")) {
          const kiteColors = ["#FF6D00", "#00B0FF", "#FFD700", "#FF1744", "#00E676"];
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <path d="M 0 5 Q 600 20 1200 5" stroke="#00B0FF" stroke-width="1.8" fill="none"/>
              ${[45, 135, 225, 315, 405, 495, 585, 675, 765, 855, 945, 1035, 1125].map((x, i) => `
                <g transform="translate(${x}, 15)">
                  <polygon points="0,-9 8,0 0,9 -8,0" fill="${kiteColors[i % kiteColors.length]}"/>
                  <line x1="0" y1="9" x2="0" y2="18" stroke="#FFFFFF" stroke-width="0.9" opacity="0.6"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 21. Dussehra: Shami Leaf Garland & Marigold Victory Toran
        if (fest.includes("dussehra") || fest.includes("vijayadashami")) {
          return `
            <svg width="100%" height="52" viewBox="0 0 1200 52" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block; background: transparent;">
              <rect x="0" y="0" width="100%" height="4" fill="#1B5E20"/>
              ${[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100].map((x) => `
                <g transform="translate(${x}, 4)">
                  <path d="M 0 0 Q 50 25 100 0" stroke="#FF8F00" stroke-width="2.2" fill="none"/>
                  <circle cx="50" cy="25" r="5.5" fill="#E65100"/>
                  <circle cx="50" cy="25" r="2.8" fill="#FFD700"/>
                  <ellipse cx="25" cy="12" rx="3.5" ry="8" fill="#2E7D32" transform="rotate(-20 25 12)"/>
                  <ellipse cx="75" cy="12" rx="3.5" ry="8" fill="#2E7D32" transform="rotate(20 75 12)"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 22. Diwali Master Toran (Mango Leaves, Marigolds & Electric Series Lights)
        const hasLights = isDiwali && enableSeriesLights && seriesLightsTheme !== "off";
        let overlayLights = "";

        if (hasLights) {
          let bulbColors = ["#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700"];
          let glowColor = "rgba(255, 215, 0, 0.95)";

          if (seriesLightsTheme === "festive_multicolor") {
            bulbColors = ["#FF9100", "#FF1744", "#00E676", "#FFD700", "#00E5FF", "#FF4081"];
            glowColor = "rgba(255, 145, 0, 0.95)";
          } else if (seriesLightsTheme === "amber_radiance") {
            bulbColors = ["#FF8F00", "#FF6D00", "#FFA000", "#FF8F00", "#FF6D00", "#FFA000"];
            glowColor = "rgba(255, 120, 0, 0.95)";
          } else if (seriesLightsTheme === "pearl_white") {
            bulbColors = ["#FFFFFF", "#FFFDE7", "#FFFFFF", "#FFFDE7", "#FFFFFF", "#FFFDE7"];
            glowColor = "rgba(255, 255, 255, 0.95)";
          }

          const animClass1 = seriesLightsMode === "chaser" ? "utsav-bulb-chase-1" : seriesLightsMode === "steady" ? "" : "utsav-bulb-twinkle-1";
          const animClass2 = seriesLightsMode === "chaser" ? "utsav-bulb-chase-2" : seriesLightsMode === "steady" ? "" : "utsav-bulb-twinkle-2";
          const animClass3 = seriesLightsMode === "chaser" ? "utsav-bulb-chase-3" : seriesLightsMode === "steady" ? "" : "utsav-bulb-twinkle-3";
          const animClass4 = seriesLightsMode === "chaser" ? "utsav-bulb-chase-4" : seriesLightsMode === "steady" ? "" : "utsav-bulb-twinkle-1";
          const animClass5 = seriesLightsMode === "chaser" ? "utsav-bulb-chase-5" : seriesLightsMode === "steady" ? "" : "utsav-bulb-twinkle-2";
          const animClass6 = seriesLightsMode === "chaser" ? "utsav-bulb-chase-6" : seriesLightsMode === "steady" ? "" : "utsav-bulb-twinkle-3";

          const scallopLights = `
            <path d="M 0 9 Q 80 43 160 9" stroke="#0D2B17" stroke-width="1.8" fill="none" opacity="0.95"/>
            <path d="M 0 11 Q 80 45 160 11" stroke="#1B4D2E" stroke-width="1.2" fill="none" opacity="0.75"/>
            <g class="${animClass1}" style="--utsav-bulb-glow:${glowColor};">
              <rect x="12" y="13" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
              <circle cx="13.5" cy="18.5" r="7.5" fill="${bulbColors[0]}" opacity="0.32"/>
              <path d="M 13.5 15.5 C 16.3 17 16 21 13.5 22.5 C 11 21 10.7 17 13.5 15.5 Z" fill="${bulbColors[0]}"/>
              <ellipse cx="13.5" cy="18.5" rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95"/>
            </g>
            <g class="${animClass2}" style="--utsav-bulb-glow:${glowColor};">
              <rect x="36" y="24" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
              <circle cx="37.5" cy="29.5" r="7.5" fill="${bulbColors[1]}" opacity="0.32"/>
              <path d="M 37.5 26.5 C 40.3 28 40 32 37.5 33.5 C 35 32 34.7 28 37.5 26.5 Z" fill="${bulbColors[1]}"/>
              <ellipse cx="37.5" cy="29.5" rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95"/>
            </g>
            <g class="${animClass3}" style="--utsav-bulb-glow:${glowColor};">
              <rect x="68" y="32" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
              <circle cx="69.5" cy="37.5" r="7.5" fill="${bulbColors[2]}" opacity="0.32"/>
              <path d="M 69.5 34.5 C 72.3 36 72 40 69.5 41.5 C 67 40 66.7 36 69.5 34.5 Z" fill="${bulbColors[2]}"/>
              <ellipse cx="69.5" cy="37.5" rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95"/>
            </g>
            <g class="${animClass4}" style="--utsav-bulb-glow:${glowColor};">
              <rect x="92" y="32" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
              <circle cx="93.5" cy="37.5" r="7.5" fill="${bulbColors[3]}" opacity="0.32"/>
              <path d="M 93.5 34.5 C 96.3 36 96 40 93.5 41.5 C 91 40 90.7 36 93.5 34.5 Z" fill="${bulbColors[3]}"/>
              <ellipse cx="93.5" cy="37.5" rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95"/>
            </g>
            <g class="${animClass5}" style="--utsav-bulb-glow:${glowColor};">
              <rect x="122" y="24" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
              <circle cx="123.5" cy="29.5" r="7.5" fill="${bulbColors[4]}" opacity="0.32"/>
              <path d="M 123.5 26.5 C 126.3 28 126 32 123.5 33.5 C 121 32 120.7 28 123.5 26.5 Z" fill="${bulbColors[4]}"/>
              <ellipse cx="123.5" cy="29.5" rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95"/>
            </g>
            <g class="${animClass6}" style="--utsav-bulb-glow:${glowColor};">
              <rect x="146" y="13" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
              <circle cx="147.5" cy="18.5" r="7.5" fill="${bulbColors[5]}" opacity="0.32"/>
              <path d="M 147.5 15.5 C 150.3 17 150 21 147.5 22.5 C 145 21 144.7 17 147.5 15.5 Z" fill="${bulbColors[5]}"/>
              <ellipse cx="147.5" cy="18.5" rx="1.1" ry="2" fill="#FFFFFF" opacity="0.95"/>
            </g>
          `;

          const repeatCount = Math.max(16, Math.ceil((window.innerWidth || 1920) / 160) + 1);
          for (let i = 0; i < repeatCount; i++) {
            overlayLights += `<g transform="translate(${i * 160}, 0)">${scallopLights}</g>`;
          }
        }

        const getDefs = () => `
          <defs>
            <g id="utsavEfGendaOrange">
              <circle cx="0" cy="0" r="11" fill="#E65100"/>
              <circle cx="-5" cy="-4" r="5.5" fill="#F57C00"/>
              <circle cx="5" cy="-4" r="5.5" fill="#FB8C00"/>
              <circle cx="-5" cy="4" r="5.5" fill="#E65100"/>
              <circle cx="5" cy="4" r="5.5" fill="#F57C00"/>
              <circle cx="0" cy="-6" r="5" fill="#FFA726"/>
              <circle cx="0" cy="6" r="5" fill="#FB8C00"/>
              <circle cx="-6" cy="0" r="5" fill="#F57C00"/>
              <circle cx="6" cy="0" r="5" fill="#FFA726"/>
              <circle cx="0" cy="0" r="6" fill="#FFB74D"/>
              <circle cx="0" cy="0" r="3" fill="#FFE082"/>
            </g>
            <g id="utsavEfGendaYellow">
              <circle cx="0" cy="0" r="11" fill="#FF8F00"/>
              <circle cx="-5" cy="-4" r="5.5" fill="#FFA000"/>
              <circle cx="5" cy="-4" r="5.5" fill="#FFB300"/>
              <circle cx="-5" cy="4" r="5.5" fill="#FF8F00"/>
              <circle cx="5" cy="4" r="5.5" fill="#FFA000"/>
              <circle cx="0" cy="-6" r="5" fill="#FFC107"/>
              <circle cx="0" cy="6" r="5" fill="#FFB300"/>
              <circle cx="-6" cy="0" r="5" fill="#FFA000"/>
              <circle cx="6" cy="0" r="5" fill="#FFD54F"/>
              <circle cx="0" cy="0" r="6" fill="#FFEB3B"/>
              <circle cx="0" cy="0" r="3" fill="#FFFDE7"/>
            </g>
            <g id="utsavEfMangoLeaf">
              <path d="M 0 0 C -7 12 -6 28 0 42 C 6 28 7 12 0 0 Z" fill="#1B5E20"/>
              <path d="M 0 2 L 0 39" stroke="#81C784" stroke-width="1.2" stroke-linecap="round"/>
            </g>
            <g id="utsavEfBrassBell">
              <path d="M -6 0 C -5 6 -8 11 -8 13 L 8 13 C 8 11 5 6 6 0 Z" fill="#D4AF37"/>
              <ellipse cx="0" cy="13" rx="8" ry="2" fill="#B78103"/>
              <circle cx="0" cy="15" r="2.2" fill="#FFE082"/>
              <line x1="0" y1="16" x2="0" y2="22" stroke="#D32F2F" stroke-width="1.5"/>
            </g>
            <linearGradient id="utsavEfKalawaRope" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#D32F2F"/>
              <stop offset="50%" stop-color="#FFC107"/>
              <stop offset="100%" stop-color="#D32F2F"/>
            </linearGradient>
          </defs>
        `;

        return `
          <svg width="100%" height="68" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            ${getDefs()}
            <pattern id="utsavEfToranUnit" width="160" height="68" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="160" height="4" fill="url(#utsavEfKalawaRope)"/>
              <use href="#utsavEfMangoLeaf" x="12" y="2" transform="rotate(-6 12 2)"/>
              <use href="#utsavEfMangoLeaf" x="38" y="2" transform="rotate(-3 38 2)"/>
              <use href="#utsavEfMangoLeaf" x="64" y="2" transform="rotate(0 64 2)"/>
              <use href="#utsavEfMangoLeaf" x="96" y="2" transform="rotate(0 96 2)"/>
              <use href="#utsavEfMangoLeaf" x="122" y="2" transform="rotate(3 122 2)"/>
              <use href="#utsavEfMangoLeaf" x="148" y="2" transform="rotate(6 148 2)"/>
              <path d="M 0 8 Q 80 48 160 8" stroke="#E65100" stroke-width="2.5" fill="none" opacity="0.6"/>
              <use href="#utsavEfGendaYellow" x="0" y="14"/>
              <use href="#utsavEfGendaOrange" x="24" y="26"/>
              <use href="#utsavEfGendaYellow" x="50" y="40"/>
              <use href="#utsavEfGendaOrange" x="80" y="47"/>
              <use href="#utsavEfGendaYellow" x="110" y="40"/>
              <use href="#utsavEfGendaOrange" x="136" y="26"/>
              <use href="#utsavEfGendaYellow" x="160" y="14"/>
              <use href="#utsavEfGendaOrange" x="0" y="26"/>
              <use href="#utsavEfBrassBell" x="0" y="38"/>
              <use href="#utsavEfGendaOrange" x="160" y="26"/>
              <use href="#utsavEfBrassBell" x="160" y="38"/>
            </pattern>
            <rect width="100%" height="68" fill="url(#utsavEfToranUnit)"/>
            ${overlayLights ? `<g id="utsavEfSeriesLightsOverlay">${overlayLights}</g>` : ""}
          </svg>
        `;
      }

      function getEfSideSVG(festId, isLeft) {
        const fest = (festId || "").toLowerCase();

        // 1. Halloween: Hanging Web Garland with Spiders & Amber Lanterns
        if (fest.includes("halloween")) {
          return `
            <svg viewBox="0 0 48 480" width="48" height="480" xmlns="http://www.w3.org/2000/svg" style="display:block; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.45));">
              <line x1="24" y1="0" x2="24" y2="470" stroke="#FF7518" stroke-width="2.4" opacity="0.9"/>
              <line x1="24" y1="0" x2="24" y2="470" stroke="#1C1428" stroke-width="1.2" opacity="0.75"/>
              ${[35, 95, 155, 215, 275, 335, 395, 455].map((y, i) => `
                <g transform="translate(24, ${y})">
                  <path d="M ${i % 2 === 0 ? '-16' : '16'} -16 Q 0 0 ${i % 2 === 0 ? '16' : '-16'} 16" stroke="#2D1B4E" stroke-width="2" fill="none" opacity="0.9"/>
                  <path d="M ${i % 2 === 0 ? '-16' : '16'} -16 Q 0 0 ${i % 2 === 0 ? '16' : '-16'} 16" stroke="#FF7518" stroke-width="1.2" fill="none" opacity="0.8"/>
                  <circle cx="${i % 2 === 0 ? -14 : 14}" cy="0" r="3" fill="#FFD700" style="filter: drop-shadow(0 0 5px #FFD700);"/>
                  ${i % 2 === 0 ? `
                    <circle cx="0" cy="0" r="6.5" fill="#FF7518" stroke="#1A1528" stroke-width="1" style="filter: drop-shadow(0 0 5px #FF7518);"/>
                    <circle cx="-2" cy="-1" r="1" fill="#FFF59D"/>
                    <circle cx="2" cy="-1" r="1" fill="#FFF59D"/>
                    <path d="M -2 2 Q 0 4 2 2" stroke="#1A1528" stroke-width="0.8" fill="none"/>
                  ` : `
                    <ellipse cx="0" cy="0" rx="4.5" ry="5.5" fill="#1C1428" stroke="#FF7518" stroke-width="0.9" style="filter: drop-shadow(0 0 4px #FF7518);"/>
                    <path d="M -4 -3 Q -9 -6 -11 -4 M 4 -3 Q 9 -6 11 -4 M -4 3 Q -9 6 -11 4 M 4 3 Q 9 6 11 4" stroke="#FF7518" stroke-width="1" fill="none"/>
                  `}
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 2. Christmas: Vertical Pine & Holly Swag with Twinkling Holiday Bulbs
        if (fest.includes("christmas")) {
          const holidayColors = ["#FF1744", "#FFD700", "#00E676", "#2979FF"];
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#1B4D2E" stroke-width="3"/>
              ${[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((y, i) => `
                <g transform="translate(22, ${y})">
                  <path d="M ${i % 2 === 0 ? '-12' : '12'} -8 L 0 0 L ${i % 2 === 0 ? '-12' : '12'} 8" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round"/>
                  <circle cx="0" cy="0" r="4" fill="${holidayColors[i % holidayColors.length]}" class="utsav-bulb-twinkle-1"/>
                  <circle cx="${i % 2 === 0 ? '6' : '-6'}" cy="4" r="2.2" fill="#D32F2F"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 3. Valentine's Day: Satin Ribbon Streamer with Hearts
        if (fest.includes("valentines")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#E91E63" stroke-width="2"/>
              ${[25, 75, 125, 175, 225, 275, 325, 375].map((y) => `
                <g transform="translate(22, ${y})">
                  <path d="M 0 -4 C -3 -8 -7 -7 -7 -2 C -7 2 0 8 0 8 C 0 8 7 2 7 -2 C 7 -7 3 -8 0 -4 Z" fill="#FF4081"/>
                  <circle cx="0" cy="0" r="1.5" fill="#FFF"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 4. Lunar New Year: Hanging Red Lanterns & Lucky Tassels
        if (fest.includes("lunar") || fest.includes("chinese")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#D32F2F" stroke-width="2.5"/>
              ${[45, 125, 205, 285, 365].map((y) => `
                <g transform="translate(22, ${y})">
                  <ellipse cx="0" cy="0" rx="9" ry="8" fill="#D32F2F"/>
                  <line x1="-5" y1="-8" x2="-5" y2="8" stroke="#FFD700" stroke-width="0.8"/>
                  <line x1="5" y1="-8" x2="5" y2="8" stroke="#FFD700" stroke-width="0.8"/>
                  <line x1="0" y1="8" x2="0" y2="20" stroke="#FFD700" stroke-width="1.5"/>
                  <circle cx="0" cy="0" r="2" fill="#FFE082" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 5. Holi: Hanging Gulal Drops
        if (fest.includes("holi")) {
          const pomColors = ["#E91E63", "#FF9800", "#FFEB3B", "#00E5FF", "#76FF03"];
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#FF4081" stroke-width="1.8"/>
              ${[30, 80, 130, 180, 230, 280, 330, 380].map((y, i) => `
                <circle cx="22" cy="${y}" r="6.5" fill="${pomColors[i % pomColors.length]}"/>
                <circle cx="22" cy="${y}" r="2" fill="#FFFFFF" opacity="0.6"/>
              `).join('')}
            </svg>
          `;
        }

        // 6. Pongal: Sugarcane Stalk & Foliage
        if (fest.includes("pongal")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#1B5E20" stroke-width="3"/>
              ${[40, 100, 160, 220, 280, 340, 400].map((y, i) => `
                <g transform="translate(22, ${y})">
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#2E7D32" stroke-width="2"/>
                  <circle cx="${i % 2 === 0 ? '-8' : '8'}" cy="-4" r="3" fill="#FBC02D"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 7. Onam: Hanging Kuruthola Palm Fronds
        if (fest.includes("onam")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#558B2F" stroke-width="2"/>
              ${[30, 75, 120, 165, 210, 255, 300, 345, 390].map((y, i) => `
                <polygon points="22,${y - 12} ${i % 2 === 0 ? 32 : 12},${y} 22,${y + 12}" fill="#7CB342"/>
              `).join('')}
            </svg>
          `;
        }

        // 8. Vishu: Golden Kanikonna Blossoms
        if (fest === "vishu") {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#2E7D32" stroke-width="2.5"/>
              ${[30, 80, 130, 180, 230, 280, 330, 380].map((y) => `
                <g transform="translate(22, ${y})">
                  <circle cx="-5" cy="0" r="4" fill="#FFD700"/>
                  <circle cx="5" cy="0" r="4.5" fill="#FFFF00"/>
                  <circle cx="0" cy="6" r="3.5" fill="#FFEA00"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 9. Eid: Damascus Brass Lantern Swags
        if (fest.includes("eid")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#D4AF37" stroke-width="1.8"/>
              ${[45, 125, 205, 285, 365].map((y) => `
                <g transform="translate(22, ${y})">
                  <path d="M -7 -10 L 7 -10 L 5 8 L -5 8 Z" fill="#D4AF37" stroke="#996515" stroke-width="0.9"/>
                  <circle cx="0" cy="-1" r="2.2" fill="#FFD700" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 10. Thanksgiving: Falling Autumn Leaves
        if (fest.includes("thanksgiving")) {
          const leafColors = ["#E65100", "#F57F17", "#BF360C", "#D84315"];
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#795548" stroke-width="2"/>
              ${[35, 95, 155, 215, 275, 335, 395].map((y, i) => `
                <ellipse cx="${i % 2 === 0 ? 16 : 28}" cy="${y}" rx="5" ry="9" fill="${leafColors[i % leafColors.length]}" transform="rotate(${i % 2 === 0 ? 25 : -25} ${i % 2 === 0 ? 16 : 28} ${y})"/>
              `).join('')}
            </svg>
          `;
        }

        // 11. Hanukkah: Sapphire Star Swags
        if (fest.includes("hanukkah")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#1565C0" stroke-width="2"/>
              ${[40, 110, 180, 250, 320, 390].map((y) => `
                <g transform="translate(22, ${y})">
                  <polygon points="0,-7 6,5 -6,5" stroke="#1976D2" stroke-width="1.2" fill="none"/>
                  <polygon points="0,7 6,-5 -6,-5" stroke="#1976D2" stroke-width="1.2" fill="none"/>
                  <circle cx="0" cy="0" r="2" fill="#E0F7FA" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 12. Easter: Pastel Egg Streamers
        if (fest.includes("easter")) {
          const eggColors = ["#F8BBD0", "#B2EBF2", "#FFF9C4", "#D1C4E9", "#C8E6C9"];
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#81C784" stroke-width="2"/>
              ${[35, 95, 155, 215, 275, 335, 395].map((y, i) => `
                <ellipse cx="22" cy="${y}" rx="6" ry="8" fill="${eggColors[i % eggColors.length]}" stroke="#81C784" stroke-width="0.8"/>
              `).join('')}
            </svg>
          `;
        }

        // 13. New Year: Golden Sparkle Drops
        if (fest.includes("new-year") || fest.includes("newyear")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#FFD700" stroke-width="1.8"/>
              ${[30, 80, 130, 180, 230, 280, 330, 380].map((y) => `
                <g transform="translate(22, ${y})">
                  <polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#FFD700"/>
                  <circle cx="0" cy="0" r="1.5" fill="#FFF"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 14. Mid-Autumn: Sky Lanterns
        if (fest.includes("mid-autumn") || fest.includes("mooncake")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#8D6E63" stroke-width="2"/>
              ${[45, 125, 205, 285, 365].map((y) => `
                <g transform="translate(22, ${y})">
                  <circle cx="0" cy="0" r="7.5" fill="#FFB74D" stroke="#E65100" stroke-width="0.9"/>
                  <line x1="0" y1="7.5" x2="0" y2="16" stroke="#D81B60" stroke-width="1.2"/>
                  <circle cx="0" cy="0" r="2" fill="#FFFDE7" class="utsav-bulb-twinkle-1"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 15. Vesak: Jasmine & Lotus Bud Drops
        if (fest.includes("vesak") || fest.includes("buddha")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#FB8C00" stroke-width="1.8"/>
              ${[30, 80, 130, 180, 230, 280, 330, 380].map((y) => `
                <g transform="translate(22, ${y})">
                  <path d="M 0 -7 C -4 0 -4 5 0 8 C 4 5 4 0 0 -7 Z" fill="#43A047"/>
                  <circle cx="0" cy="9" r="2.8" fill="#FFFFFF"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 16. Durga Puja: Kash Reeds & Crimson Swags
        if (fest.includes("durga")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#C62828" stroke-width="2.5"/>
              ${[35, 95, 155, 215, 275, 335, 395].map((y) => `
                <g transform="translate(22, ${y})">
                  <polygon points="-6,0 6,0 0,10" fill="#B71C1C"/>
                  <line x1="0" y1="10" x2="0" y2="24" stroke="#ECEFF1" stroke-width="1.5"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 17. Raksha Bandhan: Silk Kalawa Streamers
        if (fest.includes("raksha") || fest.includes("rakhi")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#D32F2F" stroke-width="2.5"/>
              ${[30, 80, 130, 180, 230, 280, 330, 380].map((y) => `
                <circle cx="22" cy="${y}" r="4" fill="#FFD700"/>
                <circle cx="22" cy="${y}" r="2" fill="#D32F2F"/>
              `).join('')}
            </svg>
          `;
        }

        // 18. Navratri: Mirrored Bandhanwar Drops
        if (fest.includes("navratri")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#FF4500" stroke-width="2.5"/>
              ${[35, 95, 155, 215, 275, 335, 395].map((y, i) => `
                <g transform="translate(22, ${y})">
                  <polygon points="-8,-6 8,-6 0,8" fill="${i % 2 === 0 ? '#C2185B' : '#FF6F00'}"/>
                  <circle cx="0" cy="0" r="3" fill="#E0E0E0" stroke="#FFD700" stroke-width="0.8"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 19. Ganesh Chaturthi: Hibiscus Flowers
        if (fest.includes("ganesh")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#2E7D32" stroke-width="2.5"/>
              ${[30, 80, 130, 180, 230, 280, 330, 380].map((y) => `
                <g transform="translate(22, ${y})">
                  <circle cx="0" cy="0" r="6" fill="#D32F2F"/>
                  <circle cx="0" cy="0" r="2.5" fill="#FFEB3B"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 20. Makar Sankranti: Kite Streamers
        if (fest.includes("sankranti") || fest.includes("uttarayan")) {
          const kiteColors = ["#FF6D00", "#00B0FF", "#FFD700", "#FF1744"];
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#00B0FF" stroke-width="1.8"/>
              ${[40, 110, 180, 250, 320, 390].map((y, i) => `
                <polygon points="22,${y - 8} 30,${y} 22,${y + 8} 14,${y}" fill="${kiteColors[i % kiteColors.length]}"/>
              `).join('')}
            </svg>
          `;
        }

        // 21. Dussehra: Shami Leaf & Marigold Toran
        if (fest.includes("dussehra") || fest.includes("vijayadashami")) {
          return `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <line x1="22" y1="0" x2="22" y2="420" stroke="#1B5E20" stroke-width="2.5"/>
              ${[35, 95, 155, 215, 275, 335, 395].map((y, i) => `
                <g transform="translate(22, ${y})">
                  <circle cx="0" cy="0" r="5" fill="#E65100"/>
                  <ellipse cx="${i % 2 === 0 ? '-8' : '8'}" cy="0" rx="3" ry="6" fill="#2E7D32"/>
                </g>
              `).join('')}
            </svg>
          `;
        }

        // 22. Diwali Master Side Garland (Mango Leaves, Marigolds & Electric Series Lights)
        const hasLights = isDiwali && enableSeriesLights && seriesLightsTheme !== "off";
        let sideBulbs = "";

        if (hasLights) {
          let bulbColor = "#FFD700";
          let glowColor = "rgba(255, 215, 0, 0.95)";
          if (seriesLightsTheme === "festive_multicolor") {
            glowColor = "rgba(255, 145, 0, 0.95)";
          } else if (seriesLightsTheme === "amber_radiance") {
            bulbColor = "#FF8F00";
            glowColor = "rgba(255, 120, 0, 0.95)";
          } else if (seriesLightsTheme === "pearl_white") {
            bulbColor = "#FFFFFF";
            glowColor = "rgba(255, 255, 255, 0.95)";
          }

          const yPositions = [32, 62, 92, 122, 152, 182, 212, 242, 272, 302, 332, 362];
          const multiColors = ["#FF9100", "#FF1744", "#00E676", "#FFD700", "#00E5FF", "#FF4081"];

          sideBulbs = yPositions.map((y, idx) => {
            const color = seriesLightsTheme === "festive_multicolor" ? multiColors[idx % multiColors.length] : bulbColor;
            const animClass = (idx % 2 === 0) ? "utsav-bulb-twinkle-1" : "utsav-bulb-twinkle-2";
            const xOffset = (idx % 2 === 0) ? 14 : 28;
            return `
              <g class="${animClass}" style="--utsav-bulb-glow:${glowColor};">
                <rect x="${xOffset - 1.5}" y="${y - 4}" width="3" height="3.5" rx="0.6" fill="#0A1F12" stroke="#143D23" stroke-width="0.5"/>
                <circle cx="${xOffset}" cy="${y + 2}" r="7" fill="${color}" opacity="0.32"/>
                <path d="M ${xOffset} ${y - 1} C ${xOffset + 2.5} ${y + 1} ${xOffset + 2.2} ${y + 5} ${xOffset} ${y + 6.5} C ${xOffset - 2.2} ${y + 5} ${xOffset - 2.5} ${y + 1} ${xOffset} ${y - 1} Z" fill="${color}"/>
                <ellipse cx="${xOffset}" cy="${y + 2.5}" rx="1" ry="1.8" fill="#FFFFFF" opacity="0.95"/>
              </g>
            `;
          }).join("");
        }

        const getDefs = () => `
          <defs>
            <g id="utsavEfGendaOrangeSide">
              <circle cx="0" cy="0" r="11" fill="#E65100"/>
              <circle cx="-5" cy="-4" r="5.5" fill="#F57C00"/>
              <circle cx="5" cy="-4" r="5.5" fill="#FB8C00"/>
              <circle cx="0" cy="0" r="6" fill="#FFB74D"/>
            </g>
            <g id="utsavEfGendaYellowSide">
              <circle cx="0" cy="0" r="11" fill="#FF8F00"/>
              <circle cx="-5" cy="-4" r="5.5" fill="#FFA000"/>
              <circle cx="5" cy="-4" r="5.5" fill="#FFB300"/>
              <circle cx="0" cy="0" r="6" fill="#FFEB3B"/>
            </g>
            <g id="utsavEfMangoLeafSide">
              <path d="M 0 0 C -7 12 -6 28 0 42 C 6 28 7 12 0 0 Z" fill="#1B5E20"/>
              <path d="M 0 2 L 0 39" stroke="#81C784" stroke-width="1.2" stroke-linecap="round"/>
            </g>
            <g id="utsavEfBrassBellSide">
              <path d="M -6 0 C -5 6 -8 11 -8 13 L 8 13 C 8 11 5 6 6 0 Z" fill="#D4AF37"/>
              <ellipse cx="0" cy="13" rx="8" ry="2" fill="#B78103"/>
              <circle cx="0" cy="15" r="2.2" fill="#FFE082"/>
            </g>
          </defs>
        `;

        return `
          <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            ${getDefs()}
            <line x1="22" y1="0" x2="22" y2="400" stroke="#D32F2F" stroke-width="2.5"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="16"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="46"/>
            <use href="#utsavEfMangoLeafSide" x="22" y="68" transform="rotate(-35 22 68)"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="76"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="106"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="136"/>
            <use href="#utsavEfMangoLeafSide" x="22" y="158" transform="rotate(35 22 158)"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="166"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="196"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="226"/>
            <use href="#utsavEfMangoLeafSide" x="22" y="248" transform="rotate(-35 22 248)"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="256"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="286"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="316"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="346"/>
            <use href="#utsavEfGendaYellowSide" x="22" y="374"/>
            <use href="#utsavEfGendaOrangeSide" x="22" y="392"/>
            <use href="#utsavEfBrassBellSide" x="22" y="406"/>
            ${hasLights ? `
              <path d="M 22 10 Q 10 70 22 130 Q 34 190 22 250 Q 10 310 22 370" stroke="#0D2B17" stroke-width="1.8" fill="none" opacity="0.9"/>
              <path d="M 22 12 Q 12 72 22 132 Q 32 192 22 252 Q 12 312 22 372" stroke="#1B4D2E" stroke-width="1.2" fill="none" opacity="0.7"/>
              ${sideBulbs}
            ` : ""}
          </svg>
        `;
      }

      if (garlandLayout === "top_and_sides" || garlandLayout === "top_only") {
        const topGarland = document.createElement("div");
        topGarland.id = "utsav-top-garland";
        topGarland.style.cssText = "position: relative; width: 100%; height: 0 !important; overflow: visible !important; z-index: 9998; pointer-events: none !important; display: block; background: transparent !important;";
        topGarland.innerHTML = getEfTopSVG(festivalId);

        const header = document.querySelector("sticky-header, .header-wrapper, #shopify-section-header, header.header, .shopify-section-group-header-group, header");
        if (header && garlandPlacement === "below_header") {
          header.insertAdjacentElement("afterend", topGarland);
        } else {
          document.body.prepend(topGarland);
          topGarland.style.position = "absolute";
          topGarland.style.top = "0";
        }
      }

      if (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") {
        const leftGarland = document.createElement("div");
        leftGarland.id = "utsav-garland-left";
        leftGarland.className = "utsav-side-garland";
        leftGarland.innerHTML = getEfSideSVG(festivalId, true);
        document.body.appendChild(leftGarland);

        const rightGarland = document.createElement("div");
        rightGarland.id = "utsav-garland-right";
        rightGarland.className = "utsav-side-garland";
        rightGarland.innerHTML = getEfSideSVG(festivalId, false);
        document.body.appendChild(rightGarland);
      }

      function computeHeaderDockOffset() {
        const banner = document.getElementById("utsav-festival-banner");
        const bannerH = banner && Number.isFinite(banner.offsetHeight) && banner.offsetHeight > 0
          ? banner.offsetHeight
          : (enableBanner ? 38 : 0);
        const offsetVal = Number(garlandOffset) || 0;
        if (garlandPlacement === "top_fixed") {
          return bannerH + offsetVal;
        }
        const header = document.querySelector(
          "sticky-header, .header-wrapper, #shopify-section-header, header.header, .header-group, .section-header, .site-header, header"
        );
        let headerBottom = 0;
        if (header) {
          const rect = header.getBoundingClientRect();
          if (rect && Number.isFinite(rect.bottom) && (rect.bottom + (window.scrollY || 0)) > bannerH) {
            headerBottom = Math.round(rect.bottom + (window.scrollY || 0));
          } else if (header.offsetHeight > 20) {
            headerBottom = bannerH + header.offsetHeight;
          }
        }
        if (!headerBottom) {
          const mainEl = document.getElementById("MainContent") || document.querySelector("main");
          if (mainEl && mainEl.offsetTop > bannerH) {
            headerBottom = mainEl.offsetTop;
          } else {
            headerBottom = bannerH + 72;
          }
        }
        return Math.max(bannerH, headerBottom + offsetVal);
      }

      function positionGarlands() {
        const topEl = document.getElementById("utsav-top-garland");
        const leftEl = document.getElementById("utsav-garland-left");
        const rightEl = document.getElementById("utsav-garland-right");
        const dockTop = computeHeaderDockOffset();
        const isSticky = garlandScrollMode === "sticky";

        if (topEl) {
          topEl.style.height = "0";
          topEl.style.overflow = "visible";
          topEl.style.background = "transparent";
          topEl.style.pointerEvents = "none";
          if (garlandPlacement === "top_fixed") {
            topEl.style.position = isSticky ? "fixed" : "absolute";
            topEl.style.top = "0";
          }
        }

        if (leftEl) {
          leftEl.style.position = isSticky ? "fixed" : "absolute";
          leftEl.style.zIndex = "9997";
          leftEl.style.pointerEvents = "none";
          leftEl.style.top = (isSticky ? (topEl ? topEl.style.top : dockTop + "px") : (dockTop + "px"));
        }
        if (rightEl) {
          rightEl.style.position = isSticky ? "fixed" : "absolute";
          rightEl.style.zIndex = "9997";
          rightEl.style.pointerEvents = "none";
          rightEl.style.top = (isSticky ? (topEl ? topEl.style.top : dockTop + "px") : (dockTop + "px"));
        }
      }

      positionGarlands();
      window.addEventListener("resize", positionGarlands);
      setTimeout(positionGarlands, 150);
      setTimeout(positionGarlands, 800);

      if (window.ResizeObserver) {
        const observed = document.querySelector(".header-group, sticky-header, .header-wrapper, header, #MainContent");
        if (observed) {
          const ro = new ResizeObserver(() => positionGarlands());
          ro.observe(observed);
        }
      }
    }

    // ─── 4. Architectural Corner Accents (Culturally Tailored for All 22 Festivals) ───
    if (enableEffects && (!diyaHideOnMobile || window.innerWidth > 480)) {
      const decorContainer = document.createElement("div");
      decorContainer.id = "utsav-corner-container";
      decorContainer.style.cssText = "position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; pointer-events: none !important; z-index: 99995 !important; overflow: visible !important;";

      const sizeMap = {
        small: 56,
        medium: 76,
        large: 96,
        xlarge: 116,
      };
      const sizePx = sizeMap[diyaSize] || 76;

      function playTempleBell() {
        if (!enableAudio) return;
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.2);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch (e) {}
      }

      function getFestivalBlessing(festId) {
        const fest = (festId || "").toLowerCase();
        if (fest.includes("halloween")) return "🎃 Happy Halloween! Spooky treats & haunting joy to you!";
        if (fest.includes("christmas")) return "🎄 Merry Christmas! May peace, warmth, and joy fill your home.";
        if (fest.includes("valentines")) return "💖 Happy Valentine's Day! Sending love, warmth, and gratitude.";
        if (fest.includes("lunar") || fest.includes("chinese")) return "🧧 Gong Xi Fa Cai! Wishing you abundant wealth and good fortune.";
        if (fest.includes("holi")) return "🎨 Happy Holi! May vibrant colors fill your life with boundless joy.";
        if (fest.includes("navratri")) return "💃 Happy Navratri! May Divine Maa Durga bless you with strength.";
        if (fest.includes("pongal")) return "🌾 Happy Pongal! May your harvest and fortunes overflow.";
        if (fest.includes("onam")) return "🌸 Happy Onam! Prosperity, harmony, and joy in every petal.";
        if (fest.includes("raksha") || fest.includes("rakhi")) return "🧵 Happy Raksha Bandhan! Celebrating pure bonds of love & protection.";
        if (fest.includes("ganesh")) return "🐘 Ganpati Bappa Morya! May Lord Ganesha remove all obstacles.";
        if (fest.includes("eid")) return "🌙 Eid Mubarak! Peace, blessings, and prosperity to you and family.";
        if (fest.includes("thanksgiving")) return "🦃 Happy Thanksgiving! Grateful for blessings, abundance, and warmth.";
        if (fest.includes("hanukkah")) return "🕎 Chag Sameach! May the festival of lights illuminate your days.";
        if (fest === "vishu") return "✨ Happy Vishu! Auspicious beginnings and golden Kani blessings.";
        if (fest.includes("new-year") || fest.includes("newyear")) return "🥂 Happy New Year! Here is to new beginnings and boundless success.";
        if (fest.includes("sankranti") || fest.includes("uttarayan")) return "🪁 Happy Makar Sankranti! May your aspirations soar like the kites.";
        if (fest.includes("dussehra") || fest.includes("vijayadashami")) return "🏹 Shubh Dussehra! Victory of light and righteousness over darkness.";
        if (fest.includes("easter")) return "🐣 Happy Easter! Wishing you renewal, hope, and springtime joy.";
        if (fest.includes("mid-autumn") || fest.includes("mooncake")) return "🥮 Happy Mid-Autumn Festival! Family reunion under the luminous moon.";
        if (fest.includes("vesak") || fest.includes("buddha")) return "🪷 Happy Vesak Day! May peace, compassion, and enlightenment guide you.";
        if (fest.includes("durga")) return "🔱 Subho Bijoya & Durga Puja blessings! Joy, triumph, and vitality.";
        return "✨ Shubh Deepavali! May divine light illuminate your path with prosperity.";
      }

      function triggerBlessing(e) {
        const toast = document.createElement("div");
        toast.className = "utsav-blessing-toast";
        toast.textContent = getFestivalBlessing(festivalId);
        const rect = (e.currentTarget || e.target).getBoundingClientRect();
        toast.style.left = (rect.left + rect.width / 2) + "px";
        toast.style.top = (rect.top - 24) + "px";
        document.body.appendChild(toast);
        playTempleBell();
        setTimeout(() => toast.remove(), 2700);
      }

      function getEfCornerSVG(festId, width) {
        const fest = (festId || "").toLowerCase();

        // 1. Halloween: Carved Jack-o'-Lantern
        if (fest.includes("halloween")) {
          return `
            <svg width="${width}" height="${Math.round(width * 0.92)}" viewBox="0 0 70 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(255, 117, 24, 0.7));">
              <circle cx="35" cy="36" r="24" fill="rgba(255, 117, 24, 0.45)"/>
              <path d="M 33 14 C 33 8 36 3 41 2 C 39 6 38 10 36 14 Z" fill="#2E7D32"/>
              <ellipse cx="35" cy="38" rx="28" ry="22" fill="#FF7518"/>
              <ellipse cx="23" cy="38" rx="16" ry="21" fill="#E65100" opacity="0.35"/>
              <ellipse cx="47" cy="38" rx="16" ry="21" fill="#E65100" opacity="0.35"/>
              <ellipse cx="35" cy="38" rx="12" ry="21" fill="#FFA726" opacity="0.4"/>
              <polygon points="24,28 30,34 22,35" fill="#FFF59D"/>
              <polygon points="46,28 48,35 40,34" fill="#FFF59D"/>
              <polygon points="35,34 38,39 32,39" fill="#FFF59D"/>
              <path d="M 21 44 Q 35 55 49 44 Q 44 51 35 51 Q 26 51 21 44 Z" fill="#FFF59D"/>
              <rect x="29" y="46" width="3" height="3" fill="#BF360C"/>
              <rect x="38" y="48" width="3" height="3" fill="#BF360C"/>
            </svg>
          `;
        }

        // 2. Christmas: Radiant Bethlehem Star
        if (fest.includes("christmas")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));">
              <polygon points="30,4 37,21 56,21 41,33 47,52 30,40 13,52 19,33 4,21 23,21" fill="#FFD700"/>
              <polygon points="30,12 35,23 47,23 37,30 41,42 30,35 19,42 23,30 13,23 25,23" fill="#FFFDE7"/>
              <circle cx="30" cy="30" r="14" fill="rgba(255, 215, 0, 0.3)"/>
            </svg>
          `;
        }

        // 3. Valentine's Day: Glowing Satin Heart
        if (fest.includes("valentines")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(233, 30, 99, 0.7));">
              <circle cx="30" cy="30" r="18" fill="rgba(233, 30, 99, 0.35)"/>
              <path d="M 30 16 C 26 8 14 10 14 22 C 14 34 30 46 30 46 C 30 46 46 34 46 22 C 46 10 34 8 30 16 Z" fill="#E91E63"/>
              <path d="M 30 20 C 27 14 18 15 18 24 C 18 32 30 41 30 41 C 30 41 42 32 42 24 C 42 15 33 14 30 20 Z" fill="#FF4081"/>
            </svg>
          `;
        }

        // 4. Lunar New Year: Red Silk Lantern
        if (fest.includes("lunar") || fest.includes("chinese")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.3)}" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(211, 47, 47, 0.7));">
              <circle cx="30" cy="35" r="18" fill="rgba(211, 47, 47, 0.35)"/>
              <line x1="30" y1="5" x2="30" y2="16" stroke="#FFD700" stroke-width="2"/>
              <rect x="22" y="14" width="16" height="5" rx="2" fill="#FFD700"/>
              <ellipse cx="30" cy="36" rx="18" ry="17" fill="#D32F2F"/>
              <line x1="22" y1="19" x2="22" y2="53" stroke="#FFD700" stroke-width="1" opacity="0.6"/>
              <line x1="38" y1="19" x2="38" y2="53" stroke="#FFD700" stroke-width="1" opacity="0.6"/>
              <rect x="22" y="53" width="16" height="5" rx="2" fill="#FFD700"/>
              <line x1="30" y1="58" x2="30" y2="76" stroke="#FFD700" stroke-width="2.5"/>
            </svg>
          `;
        }

        // 5. Holi: Brass Pichkari & Gulal Bowl
        if (fest.includes("holi")) {
          return `
            <svg width="${width}" height="${Math.round(width * 0.9)}" viewBox="0 0 70 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(233, 30, 99, 0.5));">
              <circle cx="35" cy="35" r="20" fill="rgba(233, 30, 99, 0.3)"/>
              <ellipse cx="35" cy="46" rx="22" ry="8" fill="#D4AF37"/>
              <circle cx="28" cy="44" r="6" fill="#E91E63"/>
              <circle cx="42" cy="44" r="6" fill="#00E5FF"/>
              <circle cx="35" cy="41" r="5" fill="#FFEB3B"/>
              <line x1="14" y1="46" x2="48" y2="12" stroke="#B78103" stroke-width="4" stroke-linecap="round"/>
              <line x1="48" y1="12" x2="56" y2="6" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          `;
        }

        // 6. Navratri: Crossed Wooden Dandiya Sticks
        if (fest.includes("navratri")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(255, 111, 0, 0.6));">
              <circle cx="30" cy="30" r="18" fill="rgba(255, 111, 0, 0.3)"/>
              <line x1="10" y1="50" x2="50" y2="10" stroke="#FF8F00" stroke-width="4" stroke-linecap="round"/>
              <line x1="10" y1="10" x2="50" y2="50" stroke="#D81B60" stroke-width="4" stroke-linecap="round"/>
              <circle cx="30" cy="30" r="4" fill="#FFD700"/>
            </svg>
          `;
        }

        // 7. Pongal: Clay Pot with Froth & Sugarcane
        if (fest.includes("pongal")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.05)}" viewBox="0 0 60 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(251, 192, 45, 0.5));">
              <circle cx="30" cy="36" r="20" fill="rgba(251, 192, 45, 0.3)"/>
              <ellipse cx="30" cy="42" rx="18" ry="14" fill="#8D4925"/>
              <ellipse cx="30" cy="28" rx="14" ry="5" fill="#FFF8E1"/>
              <path d="M 22 26 Q 30 14 38 26" fill="#FFFFFF"/>
              <line x1="44" y1="56" x2="54" y2="10" stroke="#2E7D32" stroke-width="3" stroke-linecap="round"/>
            </svg>
          `;
        }

        // 8. Onam: Pookalam Floral Carpet
        if (fest.includes("onam")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(230, 81, 0, 0.6));">
              <circle cx="30" cy="30" r="26" fill="#E65100"/>
              <circle cx="30" cy="30" r="21" fill="#FFB300"/>
              <circle cx="30" cy="30" r="15" fill="#FFF8E1"/>
              <circle cx="30" cy="30" r="9" fill="#2E7D32"/>
              <circle cx="30" cy="30" r="4" fill="#D84315"/>
            </svg>
          `;
        }

        // 9. Raksha Bandhan: Royal Golden Rakhi Rosette
        if (fest.includes("raksha") || fest.includes("rakhi")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(211, 47, 47, 0.6));">
              <line x1="6" y1="30" x2="54" y2="30" stroke="#D32F2F" stroke-width="3"/>
              <circle cx="30" cy="30" r="15" fill="#FFD700"/>
              <circle cx="30" cy="30" r="10" fill="#D32F2F"/>
              <circle cx="30" cy="30" r="5" fill="#FFF8E1"/>
            </svg>
          `;
        }

        // 10. Ganesh Chaturthi: Clay Ganesha & Modak
        if (fest.includes("ganesh")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 140, 0, 0.6));">
              <circle cx="30" cy="30" r="20" fill="rgba(255, 140, 0, 0.3)"/>
              <path d="M 30 14 Q 38 14 38 26 Q 38 42 30 46 Q 22 42 22 26 Z" fill="#E65100"/>
              <circle cx="28" cy="22" r="2.5" fill="#FFFDE7"/>
              <path d="M 30 26 Q 34 34 40 34" stroke="#FFD700" stroke-width="2.5" fill="none"/>
            </svg>
          `;
        }

        // 11. Eid: Damascus Brass Fanoos Lantern
        if (fest.includes("eid")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.25)}" viewBox="0 0 60 75" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.7));">
              <circle cx="30" cy="36" r="18" fill="rgba(212, 175, 55, 0.35)"/>
              <line x1="30" y1="4" x2="30" y2="14" stroke="#B78103" stroke-width="1.5"/>
              <polygon points="30,14 20,24 40,24" fill="#D4AF37"/>
              <rect x="22" y="24" width="16" height="24" fill="#D4AF37" stroke="#996515" stroke-width="0.8"/>
              <circle cx="30" cy="36" r="3.5" fill="#FFD700"/>
              <polygon points="22,48 38,48 30,58" fill="#B78103"/>
            </svg>
          `;
        }

        // 12. Thanksgiving: Harvest Pumpkin
        if (fest.includes("thanksgiving")) {
          return `
            <svg width="${width}" height="${Math.round(width * 0.9)}" viewBox="0 0 70 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(230, 81, 0, 0.6));">
              <circle cx="35" cy="36" r="22" fill="rgba(230, 81, 0, 0.35)"/>
              <path d="M 33 14 C 33 8 36 3 41 2 C 39 6 38 10 36 14 Z" fill="#4E342E"/>
              <ellipse cx="35" cy="38" rx="28" ry="22" fill="#E65100"/>
              <ellipse cx="23" cy="38" rx="16" ry="21" fill="#BF360C" opacity="0.35"/>
              <ellipse cx="47" cy="38" rx="16" ry="21" fill="#BF360C" opacity="0.35"/>
              <ellipse cx="35" cy="38" rx="12" ry="21" fill="#F57C00" opacity="0.5"/>
            </svg>
          `;
        }

        // 13. Hanukkah: Nine-Branch Menorah
        if (fest.includes("hanukkah")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.1)}" viewBox="0 0 70 75" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.7));">
              <line x1="35" y1="20" x2="35" y2="65" stroke="#D4AF37" stroke-width="3"/>
              <ellipse cx="35" cy="65" rx="14" ry="4" fill="#D4AF37"/>
              <path d="M 15 28 Q 15 48 35 48 Q 55 48 55 28" stroke="#D4AF37" stroke-width="2" fill="none"/>
              <path d="M 22 34 Q 22 44 35 44 Q 48 44 48 34" stroke="#D4AF37" stroke-width="1.6" fill="none"/>
              ${[15, 22, 29, 35, 41, 48, 55].map((x) => `
                <circle cx="${x}" cy="${x === 35 ? 16 : 24}" r="2" fill="#FFF59D"/>
              `).join('')}
            </svg>
          `;
        }

        // 14. Vishu: Kerala Nilavilakku Oil Lamp
        if (fest === "vishu") {
          return `
            <svg width="${width}" height="${Math.round(width * 1.3)}" viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(255, 215, 0, 0.75));">
              <circle cx="30" cy="18" r="20" fill="rgba(255, 215, 0, 0.35)"/>
              <path d="M 30 4 C 26 10 24 15 30 20 C 36 15 34 10 30 4 Z" fill="#FF9100"/>
              <path d="M 30 9 C 28 12 27 15 30 18 C 33 15 32 12 30 9 Z" fill="#FFFDE7"/>
              <ellipse cx="30" cy="22" rx="15" ry="4.5" fill="#D4AF37"/>
              <rect x="27" y="22" width="6" height="42" fill="#B78103" rx="2"/>
              <ellipse cx="30" cy="64" rx="20" ry="5.5" fill="#D4AF37"/>
              <ellipse cx="30" cy="72" rx="24" ry="7" fill="#996515"/>
            </svg>
          `;
        }

        // 15. New Year: Champagne Flutes
        if (fest.includes("new-year") || fest.includes("newyear")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.1)}" viewBox="0 0 60 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.7));">
              <circle cx="30" cy="32" r="18" fill="rgba(255, 215, 0, 0.3)"/>
              <path d="M 22 16 L 26 34 L 26 48 L 20 50 L 32 50 L 26 48 L 26 34 Z" fill="#FFD700" opacity="0.8"/>
              <path d="M 38 16 L 34 34 L 34 48 L 28 50 L 40 50 L 34 48 L 34 34 Z" fill="#FFE082" opacity="0.8"/>
              <circle cx="30" cy="22" r="3" fill="#FFFFFF"/>
            </svg>
          `;
        }

        // 16. Makar Sankranti: Diamond Fighter Kite
        if (fest.includes("sankranti") || fest.includes("uttarayan")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(0, 176, 255, 0.6));">
              <circle cx="30" cy="30" r="18" fill="rgba(0, 176, 255, 0.3)"/>
              <polygon points="30,8 50,30 30,52 10,30" fill="#FF6D00"/>
              <line x1="30" y1="8" x2="30" y2="52" stroke="#FFFFFF" stroke-width="1.5"/>
              <path d="M 10 30 Q 30 18 50 30" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>
            </svg>
          `;
        }

        // 17. Dussehra: Golden Bow & Arrow
        if (fest.includes("dussehra") || fest.includes("vijayadashami")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 140, 0, 0.7));">
              <circle cx="30" cy="30" r="18" fill="rgba(255, 140, 0, 0.35)"/>
              <path d="M 16 12 Q 38 30 16 48" stroke="#FFD700" stroke-width="3" fill="none"/>
              <line x1="16" y1="12" x2="16" y2="48" stroke="#FFE082" stroke-width="1.2"/>
              <line x1="12" y1="30" x2="48" y2="30" stroke="#FF6D00" stroke-width="2.5"/>
              <polygon points="48,30 40,26 40,34" fill="#FFD700"/>
            </svg>
          `;
        }

        // 18. Easter: Decorated Pastel Egg
        if (fest.includes("easter")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.15)}" viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(248, 187, 208, 0.6));">
              <circle cx="30" cy="38" r="18" fill="rgba(248, 187, 208, 0.35)"/>
              <ellipse cx="30" cy="38" rx="20" ry="26" fill="#F8BBD0" stroke="#F48FB1" stroke-width="1.5"/>
              <path d="M 12 36 Q 30 46 48 36" stroke="#80DEEA" stroke-width="2.5" fill="none"/>
              <path d="M 14 26 Q 30 36 46 26" stroke="#FFF59D" stroke-width="2.5" fill="none"/>
              <circle cx="30" cy="46" r="3" fill="#CE93D8"/>
              <circle cx="22" cy="42" r="2.5" fill="#C8E6C9"/>
              <circle cx="38" cy="42" r="2.5" fill="#C8E6C9"/>
            </svg>
          `;
        }

        // 19. Mid-Autumn: Harvest Moon & Mooncake
        if (fest.includes("mid-autumn") || fest.includes("mooncake")) {
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 213, 79, 0.7));">
              <circle cx="30" cy="30" r="24" fill="rgba(255, 213, 79, 0.35)"/>
              <circle cx="30" cy="30" r="18" fill="#FFD54F"/>
              <circle cx="30" cy="30" r="14" fill="#FFA000" stroke="#FFD54F" stroke-width="1"/>
              <path d="M 24 24 Q 30 20 36 24 Q 40 30 36 36 Q 30 40 24 36 Q 20 30 24 24 Z" fill="#FF8F00" opacity="0.6"/>
            </svg>
          `;
        }

        // 20. Vesak: Blooming Sacred Lotus
        if (fest.includes("vesak") || fest.includes("buddha")) {
          return `
            <svg width="${width}" height="${Math.round(width * 0.95)}" viewBox="0 0 60 55" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(248, 187, 208, 0.7));">
              <circle cx="30" cy="30" r="18" fill="rgba(248, 187, 208, 0.35)"/>
              <path d="M 30 10 C 24 22 22 36 30 44 C 38 36 36 22 30 10 Z" fill="#F48FB1"/>
              <path d="M 22 22 C 14 28 14 38 24 44 C 28 38 26 28 22 22 Z" fill="#F8BBD0"/>
              <path d="M 38 22 C 46 28 46 38 36 44 C 32 38 34 28 38 22 Z" fill="#F8BBD0"/>
              <circle cx="30" cy="44" r="3" fill="#FFD54F"/>
            </svg>
          `;
        }

        // 21. Durga Puja: Clay Dhunachi Incense Burner
        if (fest.includes("durga")) {
          return `
            <svg width="${width}" height="${Math.round(width * 1.2)}" viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(198, 40, 40, 0.7));">
              <circle cx="30" cy="24" r="16" fill="rgba(198, 40, 40, 0.25)"/>
              <path d="M 28 8 Q 24 16 32 20 Q 28 24 30 30" stroke="#ECEFF1" stroke-width="2" fill="none" opacity="0.75"/>
              <path d="M 32 10 Q 36 18 28 22 Q 32 26 30 30" stroke="#ECEFF1" stroke-width="1.5" fill="none" opacity="0.6"/>
              <polygon points="16,30 44,30 38,48 22,48" fill="#C85A27" stroke="#8D3B16" stroke-width="1"/>
              <rect x="27" y="48" width="6" height="14" fill="#8D3B16"/>
              <ellipse cx="30" cy="62" rx="14" ry="4" fill="#C85A27"/>
            </svg>
          `;
        }

        // 22. Diwali / Default: Living Brass Diya
        let body = "";
        if (diyaStyle === "terracotta_clay") {
          body = `
            <ellipse cx="60" cy="58" rx="42" ry="11" fill="#E07A5F"/>
            <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="url(#utsavClayGrad)"/>
            <path d="M 28 58 Q 60 63 92 58" stroke="#8D3B16" stroke-width="1.6" fill="none"/>
            <ellipse cx="60" cy="86" rx="22" ry="4" fill="#541F09"/>
          `;
        } else if (diyaStyle === "antique_copper") {
          body = `
            <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FF8A65"/>
            <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="url(#utsavCopperGrad)"/>
            <path d="M 22 60 Q 32 66 42 60 Q 52 66 62 60 Q 72 66 82 60 Q 92 66 98 60" stroke="#BF360C" stroke-width="1.3" fill="none" opacity="0.85"/>
            <ellipse cx="60" cy="86" rx="22" ry="4" fill="#3E2723"/>
          `;
        } else if (diyaStyle === "minimal_contemporary") {
          body = `
            <ellipse cx="60" cy="58" rx="40" ry="8" fill="#424242"/>
            <path d="M 20 58 Q 22 83 60 85 Q 98 83 100 58 Z" fill="url(#utsavMinimalGrad)"/>
            <path d="M 20 58 Q 60 62 100 58" stroke="#D4AF37" stroke-width="1.2" fill="none"/>
            <ellipse cx="60" cy="85" rx="16" ry="3" fill="#111111"/>
          `;
        } else if (diyaStyle === "marigold_urli" || diyaStyle === "festive_ornamental") {
          body = `
            <ellipse cx="60" cy="62" rx="48" ry="14" fill="#E5C158"/>
            <ellipse cx="60" cy="62" rx="44" ry="12" fill="#2E1B0E"/>
            <circle cx="26" cy="62" r="7" fill="#FF9800"/>
            <circle cx="36" cy="69" r="6" fill="#FFC107"/>
            <circle cx="84" cy="69" r="6" fill="#FFC107"/>
            <circle cx="94" cy="62" r="7" fill="#FF9800"/>
            <circle cx="60" cy="71" r="6.5" fill="#FF5722"/>
            <path d="M 40 60 Q 42 78 60 80 Q 78 78 80 60 Z" fill="url(#utsavBrassGrad)"/>
            <ellipse cx="60" cy="81" rx="18" ry="3.5" fill="#5D4037"/>
          `;
        } else {
          body = `
            <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FFE082"/>
            <path d="M 18 58 Q 20 83 60 85 Q 100 83 102 58 Z" fill="url(#utsavBrassGrad)"/>
            <path d="M 24 61 Q 33 67 42 61 Q 51 67 60 61 Q 69 67 78 61 Q 87 67 96 61" stroke="#FFE082" stroke-width="1.2" fill="none" opacity="0.75"/>
            <ellipse cx="60" cy="85" rx="22" ry="4" fill="#5D4037"/>
          `;
        }

        const glowFilter = flameGlow === "divine_aura"
          ? "drop-shadow(0 0 20px rgba(255, 170, 0, 0.95))"
          : flameGlow === "sparkling_wick"
          ? "drop-shadow(0 0 14px rgba(255, 230, 90, 0.9))"
          : "drop-shadow(0 0 10px rgba(255, 140, 0, 0.82))";

        const height = Math.round(width * 0.82);

        return `
          <svg class="utsav-diya-svg" viewBox="0 0 120 100" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="filter: ${glowFilter};">
            <defs>
              <radialGradient id="utsavAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FFD700" stop-opacity="0.9"/>
                <stop offset="60%" stop-color="#FF6B35" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="utsavFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#FF3D00"/>
                <stop offset="35%" stop-color="#FF9100"/>
                <stop offset="75%" stop-color="#FFD700"/>
                <stop offset="100%" stop-color="#FFFFFF"/>
              </linearGradient>
              <linearGradient id="utsavBrassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF59D"/>
                <stop offset="35%" stop-color="#D4AF37"/>
                <stop offset="75%" stop-color="#996515"/>
                <stop offset="100%" stop-color="#4E342E"/>
              </linearGradient>
              <linearGradient id="utsavClayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#E07A5F"/>
                <stop offset="40%" stop-color="#C85A27"/>
                <stop offset="80%" stop-color="#8D3B16"/>
                <stop offset="100%" stop-color="#4E2310"/>
              </linearGradient>
              <linearGradient id="utsavCopperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFAB91"/>
                <stop offset="35%" stop-color="#D84315"/>
                <stop offset="75%" stop-color="#872900"/>
                <stop offset="100%" stop-color="#3E2723"/>
              </linearGradient>
              <linearGradient id="utsavMinimalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#D4AF37"/>
                <stop offset="25%" stop-color="#2C2C2C"/>
                <stop offset="85%" stop-color="#1A1A1A"/>
                <stop offset="100%" stop-color="#0A0A0A"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="36" r="${flameGlow === 'divine_aura' ? 44 : 32}" fill="url(#utsavAura)"/>
            <g class="utsav-diya-flame">
              <path d="M 60 8 C 52 24 47 36 47 45 C 47 54 53 58 60 58 C 67 58 73 54 73 45 C 73 36 68 24 60 8 Z" fill="url(#utsavFlameGrad)"/>
              <path d="M 60 18 C 55 28 52 37 52 44 C 52 50 55 54 60 54 C 65 54 68 50 68 44 C 68 37 65 28 60 18 Z" fill="#FFFDE7" opacity="0.95"/>
              <line x1="60" y1="45" x2="60" y2="58" stroke="#3E2723" stroke-width="2.6" stroke-linecap="round"/>
              <circle cx="60" cy="45" r="1.5" fill="#FF5252"/>
            </g>
            ${body}
          </svg>
        `;
      }

      function attachCornerDecor(coords) {
        const decor = document.createElement("div");
        decor.className = "utsav-corner-decor";
        decor.setAttribute("role", "button");
        decor.setAttribute("tabindex", "0");
        decor.setAttribute("aria-label", `Tap for ${festivalName} festive greeting`);
        decor.title = "Tap for Festive Blessing ✨";
        decor.style.cssText = "position: fixed !important; pointer-events: auto !important; cursor: pointer !important; z-index: 99996 !important; filter: drop-shadow(0 4px 16px var(--utsav-glow, rgba(255, 117, 24, 0.75))); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);";
        Object.assign(decor.style, coords);
        decor.innerHTML = getEfCornerSVG(festivalId, sizePx);
        decor.addEventListener("click", triggerBlessing);
        decor.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerBlessing(e);
          }
        });
        decorContainer.appendChild(decor);
      }

      if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_left" || diyaPosition === "all_four" || diyaPosition === "all_corners") {
        attachCornerDecor({ bottom: diyaMarginY + "px", left: diyaMarginX + "px" });
      }
      if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_right" || diyaPosition === "all_four" || diyaPosition === "all_corners") {
        attachCornerDecor({ bottom: diyaMarginY + "px", right: diyaMarginX + "px" });
      }
      if (diyaPosition === "top_corners" || diyaPosition === "top_left" || diyaPosition === "all_four" || diyaPosition === "all_corners") {
        attachCornerDecor({ top: diyaMarginY + "px", left: diyaMarginX + "px" });
      }
      if (diyaPosition === "top_corners" || diyaPosition === "top_right" || diyaPosition === "all_four" || diyaPosition === "all_corners") {
        attachCornerDecor({ top: diyaMarginY + "px", right: diyaMarginX + "px" });
      }

      (document.documentElement || document.body).appendChild(decorContainer);
    }

    // ─── 4.4 HALLOWEEN: Floating Ghost Silhouettes & Ambient Eerie Mist ───────
    if (enableEffects && festivalId.includes("halloween")) {
      const ghostContainer = document.createElement("div");
      ghostContainer.id = "utsav-ghost-container";
      ghostContainer.style.cssText = "position: fixed; inset: 0; pointer-events: none; z-index: 9989; overflow: hidden;";

      // Eerie Twilight Luminescence & Amber Candlelight Glow
      const eerieMist = document.createElement("div");
      eerieMist.style.cssText = "position: absolute; inset: 0; background: radial-gradient(circle at 50% 20%, rgba(106, 13, 173, 0.16) 0%, transparent 60%), radial-gradient(circle at 50% 80%, rgba(255, 117, 24, 0.14) 0%, transparent 50%); animation: utsavEeriePulse 6s ease-in-out infinite alternate;";
      ghostContainer.appendChild(eerieMist);

      // Translucent Spectral Ghost Silhouettes (Safe peripheral gutters only)
      const ghosts = [
        { left: "5%", top: "25%", size: 36, delay: "0s", duration: "7s", opacity: 0.75 },
        { left: "8%", top: "68%", size: 34, delay: "3.5s", duration: "8.5s", opacity: 0.7 },
        { left: "91%", top: "24%", size: 38, delay: "1.8s", duration: "7.8s", opacity: 0.75 },
        { left: "94%", top: "72%", size: 40, delay: "4s", duration: "9s", opacity: 0.68 }
      ];

      ghosts.forEach(function (g) {
        const ghostEl = document.createElement("div");
        ghostEl.style.cssText = "position: absolute; left: " + g.left + "; top: " + g.top + "; width: " + g.size + "px; height: " + Math.round(g.size * 1.25) + "px; opacity: " + g.opacity + "; filter: drop-shadow(0 0 10px rgba(255, 117, 24, 0.55)); animation: utsavGhostFloat " + g.duration + " ease-in-out infinite alternate; animation-delay: " + g.delay + "; pointer-events: none;";
        ghostEl.innerHTML = '<svg viewBox="0 0 32 38" width="100%" height="100%">' +
          '<path d="M 16 3 C 8 3 4 10 4 18 C 4 27 6 34 8 33 C 10 32 12 35 14 33 C 16 31 18 35 20 33 C 22 31 24 35 26 33 C 28 35 28 27 28 18 C 28 10 24 3 16 3 Z" fill="rgba(240, 235, 255, 0.9)"/>' +
          '<ellipse cx="11" cy="14" rx="2.2" ry="3" fill="#1A1528"/>' +
          '<ellipse cx="21" cy="14" rx="2.2" ry="3" fill="#1A1528"/>' +
          '<ellipse cx="16" cy="20" rx="1.8" ry="2.4" fill="#1A1528"/>' +
        '</svg>';
        ghostContainer.appendChild(ghostEl);
      });

      // Floating Ember Particles
      for (let i = 0; i < 16; i++) {
        const ember = document.createElement("div");
        const size = (i % 3) + 2.5;
        ember.style.cssText = "position: absolute; left: " + ((i * 19 + 7) % 90 + 5) + "%; top: " + ((i * 23 + 11) % 85 + 8) + "%; width: " + size + "px; height: " + size + "px; border-radius: 50%; background: " + (i % 2 === 0 ? "#FF7518" : "#FFD700") + "; box-shadow: 0 0 6px rgba(255, 117, 24, 0.85); opacity: 0.8;";
        ghostContainer.appendChild(ember);
      }

      document.body.appendChild(ghostContainer);
    }

    // ─── 4.5 CHRISTMAS: Minimal Falling Snowflakes ──────────────────────────
    if (enableEffects && isChristmas) {
      const snowCanvas = document.createElement("canvas");
      snowCanvas.id = "utsav-snow-canvas";
      snowCanvas.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9988;";
      document.body.appendChild(snowCanvas);
      const ctx = snowCanvas.getContext("2d");
      function resize() {
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener("resize", resize);
      const flakes = [];
      const count = window.innerWidth < 600 ? 25 : 50;
      for (let i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 1.5 + Math.random() * 2.5,
          d: Math.random() * count,
          speed: 0.6 + Math.random() * 0.8,
          sway: Math.random() * 0.02,
        });
      }
      function renderSnow() {
        ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          ctx.moveTo(f.x, f.y);
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
          f.y += f.speed;
          f.x += Math.sin(f.d) * 0.5;
          f.d += f.sway;
          if (f.y > snowCanvas.height) {
            f.y = -10;
            f.x = Math.random() * snowCanvas.width;
          }
        }
        ctx.fill();
        requestAnimationFrame(renderSnow);
      }
      renderSnow();
    }

    // ─── 5. PONGAL & MAKAR SANKRANTI: Soaring Kites ─────────────────────────
    if (enableEffects && isSankranti) {
      const kiteContainer = document.createElement("div");
      kiteContainer.id = "utsav-kites-container";
      kiteContainer.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 9989; overflow: hidden;
      `;
      document.body.appendChild(kiteContainer);

      const speedVal = kiteSpeed === "moderate" ? 1.0 : 0.5;
      const count = Math.min(Math.max(parseInt(kiteCount, 10) || 2, 1), 4);

      const kiteColors = [
        { body: "#FFBF00", accent: "#E74C3C", tail: "#2ECC71" },
        { body: "#E74C3C", accent: "#3498DB", tail: "#FFD700" },
        { body: "#2ECC71", accent: "#FF8C00", tail: "#8E44AD" },
        { body: "#9B59B6", accent: "#FFD700", tail: "#1ABC9C" },
      ];

      const kites = [];

      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.style.cssText = `
          position: absolute; width: 44px; height: 44px;
          transition: transform 0.1s linear; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        `;

        const c = kiteColors[i % kiteColors.length];
        el.innerHTML = `
          <svg viewBox="0 0 100 100" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 95,50 50,95 5,50" fill="${c.body}"/>
            <polygon points="50,5 95,50 50,50" fill="${c.accent}" opacity="0.6"/>
            <line x1="50" y1="5" x2="50" y2="95" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8"/>
            <path d="M 5,50 Q 50,30 95,50" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.8"/>
            <polygon points="50,95 44,110 56,110" fill="${c.tail}"/>
            <path d="M 50,50 Q 30,120 10,200" stroke="rgba(255,255,255,0.4)" stroke-width="1" fill="none"/>
          </svg>
        `;

        kiteContainer.appendChild(el);

        kites.push({
          el,
          x: Math.random() * (window.innerWidth * 0.7),
          y: 80 + Math.random() * (window.innerHeight * 0.45),
          vx: (0.4 + Math.random() * 0.4) * speedVal,
          vy: (0.15 + Math.random() * 0.25) * speedVal,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.02 + Math.random() * 0.02,
          tilt: 12 + Math.random() * 10,
        });
      }

      let kiteAnimId;
      function renderKites() {
        kites.forEach((k) => {
          k.swayPhase += k.swaySpeed;
          k.x += k.vx + Math.sin(k.swayPhase) * 0.6;
          k.y -= k.vy + Math.cos(k.swayPhase) * 0.3;

          if (k.x > window.innerWidth + 50 || k.y < 30) {
            k.x = -40;
            k.y = window.innerHeight * 0.5 + Math.random() * 100;
          }

          const currentTilt = k.tilt + Math.sin(k.swayPhase) * 8;
          k.el.style.transform = `translate3d(${k.x}px, ${k.y}px, 0) rotate(${currentTilt}deg)`;
        });

        kiteAnimId = requestAnimationFrame(renderKites);
      }
      renderKites();
    }

    // ─── 6. DIWALI: Subtle Golden Aerial Fireworks ──────────────────────────
    if (enableEffects && isDiwali && fireworksFrequency !== "off") {
      const canvas = document.createElement("canvas");
      canvas.id = "utsav-fireworks-canvas";
      canvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        pointer-events: none; z-index: 9987;
      `;
      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const freqIntervalMap = {
        subtle: 8500,
        moderate: 4500,
        celebratory: 2400,
      };
      const intervalMs = freqIntervalMap[fireworksFrequency] || 6000;

      const particles = [];
      function createBurst(cx, cy) {
        const count = 38;
        const baseHue = 42 + Math.random() * 15;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
          const speed = 1.2 + Math.random() * 2.8;
          particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            decay: 0.012 + Math.random() * 0.01,
            radius: 1.2 + Math.random() * 1.4,
            hue: baseHue + (Math.random() - 0.5) * 10,
          });
        }
      }

      function launchFirework() {
        const cx = window.innerWidth * (0.2 + Math.random() * 0.6);
        const cy = window.innerHeight * (0.15 + Math.random() * 0.35);
        createBurst(cx, cy);
      }

      let fwTimer = setInterval(launchFirework, intervalMs);
      setTimeout(launchFirework, 800);

      let fwAnimId;
      function renderFireworks() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.035;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${p.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
          ctx.fill();
        }
        fwAnimId = requestAnimationFrame(renderFireworks);
      }
      renderFireworks();
    }

    // ─── 7. FESTIVAL DISCOUNTS & OFFERS ENGINE ─────────────────────────────────
    if (config.discount && config.discount.enabled) {
      const disc = config.discount;
      let shouldShowDiscount = true;

      // Audience Targeting Check
      if (disc.audience === "new_visitors") {
        if (localStorage.getItem("utsav_visited")) {
          shouldShowDiscount = false;
        } else {
          try { localStorage.setItem("utsav_visited", "true"); } catch (e) {}
        }
      } else if (disc.audience === "returning") {
        if (!localStorage.getItem("utsav_visited")) {
          shouldShowDiscount = false;
        }
        try { localStorage.setItem("utsav_visited", "true"); } catch (e) {}
      }

      if (shouldShowDiscount) {
        // Clean badge text: emoji + " 10% OFF" (remove any "HALLOWEEN DEAL" or similar wordings)
        let rawBadge = disc.badgeText || (disc.type === "fixed_amount" ? `$${disc.value || 10} OFF` : `${disc.value || 10}% OFF`);
        rawBadge = rawBadge.replace(/HALLOWEEN\s*DEAL/gi, "").replace(/EVENT\s*DEAL/gi, "").replace(/FESTIVE\s*DISCOUNT/gi, "").replace(/🏷️/g, "").trim();
        rawBadge = rawBadge.replace(/^[^a-zA-Z0-9$₹%]+/, "").trim();
        const badgeLabel = `${festivalEmoji || "🎃"} ${rawBadge || (disc.value || 10) + "% OFF"}`;

        // Inject discount badges onto prices across product cards and product pages (ONLY ONE per price container)
        function injectDiscountBadges() {
          const containers = document.querySelectorAll(".price, .product__price, [data-price-container]");
          containers.forEach(function (container) {
            if (container.querySelector(".utsav-discount-badge") || container.closest(".utsav-has-badge")) {
              return;
            }
            container.classList.add("utsav-has-badge");
            const badge = document.createElement("span");
            badge.className = "utsav-discount-badge";
            badge.textContent = badgeLabel;

            const target = container.querySelector(".price-item--sale, .price-item--regular, .price__sale, .price__regular") || container;
            target.appendChild(badge);
          });
        }
        injectDiscountBadges();
        setTimeout(injectDiscountBadges, 800);
        setTimeout(injectDiscountBadges, 2000);

        // Auto-apply discount to checkout links if requested
        if (disc.autoApply && (couponCode || "UTSAV26")) {
          const codeToApply = couponCode || "UTSAV26";
          document.querySelectorAll('a[href*="/checkout"]').forEach(function (a) {
            try {
              const url = new URL(a.href, window.location.origin);
              url.searchParams.set("discount", codeToApply);
              a.href = url.toString();
            } catch (e) {}
          });
        }
      }
    }

    // ─── CART LAYERING: keep cart drawer/page above festive decorations ─────────
    (function watchCartLayering() {
      const sel = "cart-drawer.active, cart-drawer[open], #CartDrawer.active, .cart-drawer.active, .drawer.active, [data-cart-drawer].is-open";
      const isCart = window.location.pathname.includes("/cart");
      setInterval(function () {
        document.body.classList.toggle("utsav-cart-open", !!document.querySelector(sel));
        document.body.classList.toggle("utsav-cart-page", isCart);
    })();
  }

  // ─── BOOTSTRAPPER: Cloud Fetch + Local Config Merge (DOM Safe) ─────────────
  function bootstrapper() {
    const shopDomain =
      (window.Shopify && window.Shopify.shop) ||
      (window.__UTSAV_CONFIG__ && window.__UTSAV_CONFIG__.shopDomain) ||
      window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const previewFest = urlParams.get("utsav_preview");

    if (previewFest) {
      const initMeta = FESTIVAL_META[previewFest.toLowerCase()] || {};
      startFestiveEngine(Object.assign({}, window.__UTSAV_CONFIG__, {
        festivalId: previewFest,
        festivalName: initMeta.name || previewFest,
        festivalEmoji: initMeta.emoji || "✨",
        enableEffects: true,
        diyaPosition: "bottom_corners",
        diyaSize: "medium",
        diyaMarginX: 18,
        diyaMarginY: 18
      }));

      fetch("https://utsav-shopify.onrender.com/api/active-theme?shop=" + encodeURIComponent(shopDomain) + "&preview=" + encodeURIComponent(previewFest) + "&_t=" + Date.now())
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.active && data.config) {
            const festInfo = data.festival || {};
            const activeId = data.festivalId || previewFest;
            const meta = FESTIVAL_META[activeId.toLowerCase()] || {};
            const merged = Object.assign({}, window.__UTSAV_CONFIG__, data.config, {
              festivalId: activeId,
              festivalName: (data.config && data.config.festivalName) || festInfo.name || meta.name,
              festivalEmoji: (data.config && data.config.festivalEmoji) || festInfo.emoji || meta.emoji,
              palette: (data.config && data.config.palette) || festInfo.palette,
            });
            startFestiveEngine(merged);
          }
        })
        .catch(function () {});
    } else {
      fetch("https://utsav-shopify.onrender.com/api/active-theme?shop=" + encodeURIComponent(shopDomain) + "&_t=" + Date.now())
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.active === true && data.config) {
            const festInfo = data.festival || {};
            const activeId = data.festivalId || "diwali";
            const meta = FESTIVAL_META[activeId.toLowerCase()] || {};
            const merged = Object.assign({}, window.__UTSAV_CONFIG__, data.config, {
              festivalId: activeId,
              festivalName: (data.config && data.config.festivalName) || festInfo.name || meta.name,
              festivalEmoji: (data.config && data.config.festivalEmoji) || festInfo.emoji || meta.emoji,
              palette: (data.config && data.config.palette) || festInfo.palette,
            });
            startFestiveEngine(merged);
          } else if (data && data.active === false) {
            teardownExistingEffects();
          } else {
            startFestiveEngine(window.__UTSAV_CONFIG__ || {});
          }
        })
        .catch(function () {
          startFestiveEngine(window.__UTSAV_CONFIG__ || {});
        });
    }
  }

  if (document.readyState === "loading" || !document.body) {
    document.addEventListener("DOMContentLoaded", bootstrapper);
  } else {
    bootstrapper();
  }
})();
