/**
 * Utsav — Indian Festival Themes
 * High-End Minimalist Storefront Effects Engine
 * Stationary Corner Diyas, Subtle Aerial Fireworks, Soaring Kites & Hilal Crescent Moon
 */

(function () {
  "use strict";

  const FESTIVAL_CONFIG = window.__UTSAV_CONFIG__ || {};
  const {
    festivalId = "diwali",
    palette = {
      primary: "#D4AF37",
      secondary: "#FF6B35",
      accent: "#8B0000",
      background: "#1A0A00",
      glow: "rgba(212, 175, 55, 0.35)",
    },
    enableEffects = true,
    enableBanner = true,
    enableCountdown = true,
    enableColorSwap = true,
    enableAudio = true,
    enableWheel = true,
    bannerText = "",
    couponCode = "",
    countdownTarget = null,
    festivalName = "Festival",
    festivalEmoji = "🪔",
    // 🪔 Diya Customizations
    diyaStyle = "royal_brass", // royal_brass | terracotta_clay | antique_copper | minimal_contemporary | marigold_urli
    flameGlow = "warm_radiance", // warm_radiance | divine_aura | sparkling_wick
    diyaSize = "medium", // small | medium | large
    diyaPosition = "bottom_corners", // bottom_corners | bottom_left | bottom_right | top_corners
    // 🎆 Fireworks Customizations
    fireworksFrequency = "subtle", // off | subtle | moderate | celebratory
    // 🪁 Kite Customizations
    kiteCount = 2, // 1 | 2 | 4
    kiteSpeed = "gentle", // gentle | moderate
    // 🌙 Moon Customizations
    moonPosition = "top_right", // top_right | top_left
    // 🌿 Garland & Series Lights Customizations
    garlandLayout = "top_and_sides", // top_and_sides | top_only | sides_only | off
    garlandPlacement = "below_header", // below_header | top_fixed
    garlandScrollMode = "natural_scroll", // natural_scroll | sticky
    garlandOffset = 0,
    garlandStyle = "mango_marigold",
    seriesLightsTheme = "warm_gold", // warm_gold | festive_multicolor | amber_radiance | pearl_white | off
    seriesLightsMode = "twinkle",    // twinkle | chaser | steady
  } = FESTIVAL_CONFIG;

  // ─── 1. Apply Subtle Luxury CSS Color Variables ──────────────────────────────
  if (enableColorSwap && palette) {
    const root = document.documentElement;
    root.style.setProperty("--utsav-primary", palette.primary || "#D4AF37");
    root.style.setProperty("--utsav-secondary", palette.secondary || "#FF6B35");
    root.style.setProperty("--utsav-accent", palette.accent || "#8B0000");
    root.style.setProperty("--utsav-bg", palette.background || "#111318");
    root.style.setProperty("--utsav-glow", palette.glow || "rgba(212, 175, 55, 0.35)");
  }

  // ─── 2. Inject Editorial Minimalist Banner ───────────────────────────────────
  if (enableBanner && bannerText) {
    const banner = document.createElement("div");
    banner.id = "utsav-festival-banner";
    banner.innerHTML = `
      <div class="utsav-banner-inner">
        <span class="utsav-banner-tag">${festivalEmoji} ${festivalName.split(" ")[0]}</span>
        <span class="utsav-banner-text">${bannerText}</span>
        ${
          couponCode
            ? `<button class="utsav-coupon-pill" onclick="navigator.clipboard.writeText('${couponCode}'); this.textContent='✓ Copied!';">
                <span>Code:</span> <strong>${couponCode}</strong>
               </button>`
            : ""
        }
        <button class="utsav-banner-close" onclick="document.getElementById('utsav-festival-banner').remove()" aria-label="Close">×</button>
      </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // ─── 3. Atmospheric Corner Vignette & Ambient Warmth ─────────────────────────
  if (enableEffects) {
    const vignette = document.createElement("div");
    vignette.className = "utsav-ambient-vignette";
    vignette.id = "utsav-ambient-vignette";

    if (festivalId.includes("diwali")) {
      vignette.style.background = `
        radial-gradient(circle at 4% 96%, rgba(255, 170, 0, 0.14) 0%, transparent 30%),
        radial-gradient(circle at 96% 96%, rgba(255, 170, 0, 0.14) 0%, transparent 30%)
      `;
    } else if (festivalId.includes("holi")) {
      vignette.style.background = `
        radial-gradient(circle at 2% 2%, rgba(255, 20, 147, 0.10) 0%, transparent 28%),
        radial-gradient(circle at 98% 98%, rgba(0, 206, 209, 0.10) 0%, transparent 28%)
      `;
    } else if (festivalId.includes("eid")) {
      const isRight = moonPosition === "top_right";
      vignette.style.background = `
        radial-gradient(circle at ${isRight ? "96%" : "4%"} 4%, rgba(0, 176, 116, 0.12) 0%, transparent 32%)
      `;
    } else if (festivalId.includes("onam")) {
      vignette.style.background = `
        radial-gradient(circle at 4% 96%, rgba(46, 204, 113, 0.12) 0%, transparent 32%)
      `;
    }
    document.body.appendChild(vignette);
  }

  // ─── 3.5 Inject Top Toran & Side Garlands (Dussehra, Sankranti, Diwali) ─────
  if (enableEffects && garlandLayout !== "off") {
    const isDiwali = festivalId.includes("diwali");
    const isDussehra = festivalId.includes("dussehra");
    const isSankranti = festivalId.includes("sankranti") || festivalId.includes("pongal");

    if (isDiwali || isDussehra || isSankranti) {
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
            <path d="M 0 0 C -6 14 -7 28 0 42 C 7 28 6 14 0 0 Z" fill="#2E7D32"/>
            <path d="M 0 2 L 0 39" stroke="#81C784" stroke-width="1.2" stroke-linecap="round"/>
          </g>
          <g id="utsavEfMangoPair">
            <path d="M 0 0 C -12 6 -24 16 -32 28 C -22 26 -12 18 0 8 Z" fill="#2E7D32"/>
            <path d="M 0 0 C 12 6 24 16 32 28 C 22 26 12 18 0 8 Z" fill="#2E7D32"/>
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

      if (garlandLayout === "top_and_sides" || garlandLayout === "top_only") {
        const topGarland = document.createElement("div");
        topGarland.id = "utsav-top-garland";

        const hasLights = isDiwali && seriesLightsTheme !== "off";
        let bulbMarkup = "";
        if (hasLights) {
          const bCol = seriesLightsTheme === "amber_radiance" ? "#FF8F00" : seriesLightsTheme === "pearl_white" ? "#FFFFFF" : "#FFD700";
          const glow = seriesLightsTheme === "amber_radiance" ? "rgba(255, 120, 0, 0.95)" : "rgba(255, 215, 0, 0.95)";
          bulbMarkup = `
            <path d="M 0 10 Q 80 50 160 10" stroke="#FFE082" stroke-width="1.2" fill="none" opacity="0.85"/>
            <g class="utsav-bulb-twinkle-1" style="--utsav-bulb-glow:${glow};">
              <circle cx="14" cy="22" r="3.2" fill="${bCol}"/>
              <circle cx="14" cy="22" r="7" fill="${bCol}" opacity="0.3"/>
            </g>
            <g class="utsav-bulb-twinkle-2" style="--utsav-bulb-glow:${glow};">
              <circle cx="36" cy="35" r="3.2" fill="${bCol}"/>
              <circle cx="36" cy="35" r="7" fill="${bCol}" opacity="0.3"/>
            </g>
            <g class="utsav-bulb-twinkle-3" style="--utsav-bulb-glow:${glow};">
              <circle cx="64" cy="44" r="3.2" fill="${bCol}"/>
              <circle cx="64" cy="44" r="7" fill="${bCol}" opacity="0.3"/>
            </g>
            <g class="utsav-bulb-twinkle-1" style="--utsav-bulb-glow:${glow};">
              <circle cx="96" cy="44" r="3.2" fill="${bCol}"/>
              <circle cx="96" cy="44" r="7" fill="${bCol}" opacity="0.3"/>
            </g>
            <g class="utsav-bulb-twinkle-2" style="--utsav-bulb-glow:${glow};">
              <circle cx="124" cy="35" r="3.2" fill="${bCol}"/>
              <circle cx="124" cy="35" r="7" fill="${bCol}" opacity="0.3"/>
            </g>
            <g class="utsav-bulb-twinkle-3" style="--utsav-bulb-glow:${glow};">
              <circle cx="146" cy="22" r="3.2" fill="${bCol}"/>
              <circle cx="146" cy="22" r="7" fill="${bCol}" opacity="0.3"/>
            </g>
          `;
        }

        topGarland.innerHTML = `
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
              ${bulbMarkup}
            </pattern>
            <rect width="100%" height="68" fill="url(#utsavEfToranUnit)"/>
          </svg>
        `;
        document.body.appendChild(topGarland);
      }

      if (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") {
        const sideSVG = `
          <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            ${getDefs()}
            <line x1="22" y1="0" x2="22" y2="400" stroke="#D32F2F" stroke-width="2.5"/>
            <use href="#utsavEfGendaYellow" x="22" y="16"/>
            <use href="#utsavEfGendaOrange" x="22" y="46"/>
            <use href="#utsavEfMangoPair" x="22" y="76"/>
            <use href="#utsavEfGendaYellow" x="22" y="76"/>
            <use href="#utsavEfGendaOrange" x="22" y="106"/>
            <use href="#utsavEfGendaYellow" x="22" y="136"/>
            <use href="#utsavEfMangoPair" x="22" y="166"/>
            <use href="#utsavEfGendaOrange" x="22" y="166"/>
            <use href="#utsavEfGendaYellow" x="22" y="196"/>
            <use href="#utsavEfGendaOrange" x="22" y="226"/>
            <use href="#utsavEfMangoPair" x="22" y="256"/>
            <use href="#utsavEfGendaYellow" x="22" y="256"/>
            <use href="#utsavEfGendaOrange" x="22" y="286"/>
            <use href="#utsavEfGendaYellow" x="22" y="316"/>
            <use href="#utsavEfGendaOrange" x="22" y="346"/>
            <use href="#utsavEfGendaYellow" x="22" y="374"/>
            <use href="#utsavEfGendaOrange" x="22" y="392"/>
            <use href="#utsavEfBrassBell" x="22" y="406"/>
          </svg>
        `;

        const leftGarland = document.createElement("div");
        leftGarland.id = "utsav-garland-left";
        leftGarland.className = "utsav-side-garland";
        leftGarland.innerHTML = sideSVG;
        document.body.appendChild(leftGarland);

        const rightGarland = document.createElement("div");
        rightGarland.id = "utsav-garland-right";
        rightGarland.className = "utsav-side-garland";
        rightGarland.innerHTML = sideSVG;
        document.body.appendChild(rightGarland);
      }

      function computeHeaderDockOffset() {
        if (garlandPlacement === "top_fixed") {
          return parseInt(garlandOffset, 10) || 0;
        }
        const mainEl = document.getElementById("MainContent") || document.querySelector("main");
        if (mainEl && mainEl.offsetTop > 0) {
          return mainEl.offsetTop + (parseInt(garlandOffset, 10) || 0);
        }
        const header = document.querySelector(
          ".header-group, sticky-header, .header-wrapper, #shopify-section-header, header.header, .site-header"
        );
        if (header) {
          const rect = header.getBoundingClientRect();
          const pageBottom = rect.bottom + window.scrollY;
          if (pageBottom > 0) {
            return Math.round(pageBottom) + (parseInt(garlandOffset, 10) || 0);
          }
        }
        return parseInt(garlandOffset, 10) || 0;
      }

      function positionGarlands() {
        const topEl = document.getElementById("utsav-top-garland");
        const leftEl = document.getElementById("utsav-garland-left");
        const rightEl = document.getElementById("utsav-garland-right");
        const dockTop = computeHeaderDockOffset();
        const isSticky = garlandScrollMode === "sticky";

        if (topEl) {
          topEl.style.position = isSticky ? "fixed" : "absolute";
          if (isSticky) {
            const header = document.querySelector("sticky-header, .header-wrapper, header.header");
            const hRect = header ? header.getBoundingClientRect() : null;
            topEl.style.top = (hRect ? Math.max(0, hRect.bottom) : dockTop) + "px";
          } else {
            topEl.style.top = dockTop + "px";
          }
        }
        if (leftEl) {
          leftEl.style.position = isSticky ? "fixed" : "absolute";
          leftEl.style.top = (isSticky ? (topEl ? topEl.style.top : dockTop + "px") : (dockTop + "px"));
        }
        if (rightEl) {
          rightEl.style.position = isSticky ? "fixed" : "absolute";
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
  }

  // ─── 4. Architectural Corner Accents (Diwali Diya, Eid Moon, Sankranti Kites) ───
  if (enableEffects) {
    const decorContainer = document.createElement("div");
    decorContainer.id = "utsav-corner-container";

    // ─── A. DIWALI: Realistic Multi-Material Diya with Tap-to-Bless ────────
    if (festivalId.includes("diwali")) {
      const sizeMap = {
        small: { width: 64, height: 52 },
        medium: { width: 90, height: 74 },
        large: { width: 116, height: 95 },
      };
      const dims = sizeMap[diyaSize] || sizeMap.medium;

      function getDiyaMarkup(style) {
        let body = "";
        if (style === "terracotta_clay") {
          body = `
            <ellipse cx="60" cy="58" rx="42" ry="11" fill="#E07A5F"/>
            <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="url(#utsavClayGrad)"/>
            <path d="M 28 58 Q 60 63 92 58" stroke="#8D3B16" stroke-width="1.6" fill="none"/>
            <ellipse cx="60" cy="86" rx="22" ry="4" fill="#541F09"/>
          `;
        } else if (style === "antique_copper") {
          body = `
            <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FF8A65"/>
            <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="url(#utsavCopperGrad)"/>
            <path d="M 22 60 Q 32 66 42 60 Q 52 66 62 60 Q 72 66 82 60 Q 92 66 98 60" stroke="#BF360C" stroke-width="1.3" fill="none" opacity="0.85"/>
            <ellipse cx="60" cy="86" rx="22" ry="4" fill="#3E2723"/>
          `;
        } else if (style === "minimal_contemporary") {
          body = `
            <ellipse cx="60" cy="58" rx="40" ry="8" fill="#424242"/>
            <path d="M 20 58 Q 22 83 60 85 Q 98 83 100 58 Z" fill="url(#utsavMinimalGrad)"/>
            <path d="M 20 58 Q 60 62 100 58" stroke="#D4AF37" stroke-width="1.2" fill="none"/>
            <ellipse cx="60" cy="85" rx="16" ry="3" fill="#111111"/>
          `;
        } else if (style === "marigold_urli" || style === "festive_ornamental") {
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
          // Royal Brass Default
          body = `
            <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FFE082"/>
            <path d="M 18 58 Q 20 83 60 85 Q 100 83 102 58 Z" fill="url(#utsavBrassGrad)"/>
            <path d="M 24 61 Q 33 67 42 61 Q 51 67 60 61 Q 69 67 78 61 Q 87 67 96 61" stroke="#FFE082" stroke-width="1.2" fill="none" opacity="0.75"/>
            <ellipse cx="60" cy="85" rx="22" ry="4" fill="#5D4037"/>
          `;
        }

        const glowFilter = flameGlow === "divine_aura" 
          ? "drop-shadow(0 0 20px rgba(255, 170, 0, 0.95))" 
          : "drop-shadow(0 0 10px rgba(255, 140, 0, 0.82))";

        return `
          <svg class="utsav-diya-svg" viewBox="0 0 120 100" width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg" style="filter: ${glowFilter};">
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

      function playTempleBell() {
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

      function triggerBlessing(e) {
        const blessings = [
          "✨ Shubh Deepavali! May Lakshmi bless your home with prosperity.",
          "🪔 Sacred Light ignited! May joy and good fortune illuminate your year.",
          "🌟 Auspicious Blessings from Utsav! Happy Diwali!",
          "🕉️ Om Shanti: May the divine light bring wellness and peace."
        ];
        const toast = document.createElement("div");
        toast.className = "utsav-blessing-toast";
        toast.textContent = blessings[Math.floor(Math.random() * blessings.length)];
        const rect = (e.currentTarget || e.target).getBoundingClientRect();
        toast.style.left = (rect.left + rect.width / 2) + "px";
        toast.style.top = (rect.top - 24) + "px";
        document.body.appendChild(toast);
        playTempleBell();
        setTimeout(() => toast.remove(), 2700);
      }

      function attachDiya(className) {
        const diya = document.createElement("div");
        diya.className = "utsav-corner-decor " + className;
        diya.setAttribute("role", "button");
        diya.setAttribute("tabindex", "0");
        diya.setAttribute("aria-label", "Light and receive blessing from Diwali Diya");
        diya.title = "Tap for Festive Blessing ✨";
        diya.innerHTML = getDiyaMarkup(diyaStyle);
        diya.addEventListener("click", triggerBlessing);
        diya.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerBlessing(e);
          }
        });
        decorContainer.appendChild(diya);
      }

      if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_left") {
        attachDiya("utsav-corner-bottom-left");
      }
      if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_right") {
        attachDiya("utsav-corner-bottom-right");
      }
      if (diyaPosition === "top_corners") {
        attachDiya("utsav-corner-top-left");
        attachDiya("utsav-corner-top-right");
      }
    }

    // ─── B. EID: Celestial Crescent Moon & Star (Position Customizable) ───
    else if (festivalId.includes("eid")) {
      const isRight = moonPosition !== "top_left";
      const crescent = document.createElement("div");
      crescent.className = `utsav-corner-decor ${isRight ? "utsav-corner-top-right" : "utsav-corner-top-left"}`;
      crescent.innerHTML = `
        <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(212, 175, 55, 0.6));">
          <!-- Crescent Moon Body -->
          <path d="M 50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 65.5 90 78.8 81.2 85.3 68.4 C 62.4 71.3 42 53.2 42 29.5 C 42 22.3 45 15.5 50 10 Z" fill="url(#utsavGoldMoon)" opacity="0.95"/>
          <!-- Solitary Star -->
          <polygon points="68,26 71,34 80,34 73,39 76,47 68,42 61,47 64,39 57,34 66,34" fill="#FFF2B2" opacity="0.95"/>
          <defs>
            <linearGradient id="utsavGoldMoon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE885"/>
              <stop offset="60%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#996515"/>
            </linearGradient>
          </defs>
        </svg>
      `;
      decorContainer.appendChild(crescent);
    }

    // ─── C. ONAM: Botanical Pookkalam Mandala ───
    else if (festivalId.includes("onam")) {
      const pookkalam = document.createElement("div");
      pookkalam.className = "utsav-corner-decor utsav-corner-bottom-left";
      pookkalam.innerHTML = `
        <svg width="85" height="85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="90" r="60" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
          <circle cx="10" cy="90" r="44" stroke="#2ECC71" stroke-width="2" opacity="0.7"/>
          <circle cx="10" cy="90" r="28" fill="#F39C12" opacity="0.5"/>
          <circle cx="10" cy="90" r="14" fill="#E74C3C" opacity="0.8"/>
        </svg>
      `;
      decorContainer.appendChild(pookkalam);
    }

    // ─── D. INDEPENDENCE DAY: Sleek Satin Ribbon ───
    else if (festivalId.includes("independence")) {
      const ribbon = document.createElement("div");
      ribbon.className = "utsav-tiranga-ribbon";
      document.body.insertBefore(ribbon, document.body.firstChild);
    }

    document.body.appendChild(decorContainer);
  }

  // ─── 5. PONGAL & MAKAR SANKRANTI: Soaring Kites (Count & Speed Customizable) ───
  if (enableEffects && (festivalId.includes("pongal") || festivalId.includes("sankranti"))) {
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
          <!-- Diamond Body -->
          <polygon points="50,5 95,50 50,95 5,50" fill="${c.body}"/>
          <polygon points="50,5 95,50 50,50" fill="${c.accent}" opacity="0.6"/>
          <!-- Curved Bow Spine (Kaap & Thadda) -->
          <line x1="50" y1="5" x2="50" y2="95" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8"/>
          <path d="M 5,50 Q 50,30 95,50" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.8"/>
          <!-- Tail Tassel (Punchh) -->
          <polygon points="50,95 44,110 56,110" fill="${c.tail}"/>
          <!-- Thread (Manja line) -->
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

        // Reset if kite soars off-screen
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

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(kiteAnimId);
      else renderKites();
    });
  }

  // ─── 6. DIWALI: Subtle Golden Aerial Fireworks & Willow Sparkles ─────────────
  if (
    enableEffects &&
    festivalId.includes("diwali") &&
    fireworksFrequency !== "off"
  ) {
    const canvas = document.createElement("canvas");
    canvas.id = "utsav-effects-canvas";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // Fireworks particles array
    let sparks = [];

    // Frequency timing in milliseconds
    const freqIntervals = {
      subtle: 7500, // every 7.5 seconds
      moderate: 4200, // every 4.2 seconds
      celebratory: 2200, // every 2.2 seconds
    };
    const intervalMs = freqIntervals[fireworksFrequency] || 7500;

    function launchSubtleFirework() {
      // Confine burst exclusively to upper 40% margins to protect product cards!
      const burstX =
        Math.random() < 0.5
          ? 60 + Math.random() * (window.innerWidth * 0.3) // Left margin
          : window.innerWidth * 0.65 + Math.random() * (window.innerWidth * 0.28); // Right margin

      const burstY = 70 + Math.random() * (window.innerHeight * 0.28);

      const colors = ["#FFD700", "#FFDF73", "#FFA500", "#FFF8DC", "#FF8C00"];
      const particleCount = 28 + Math.floor(Math.random() * 14);

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 2.4;
        sparks.push({
          x: burstX,
          y: burstY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.2 + Math.random() * 1.6,
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.012,
        });
      }
    }

    // Initial gentle firework after 1.5 seconds
    setTimeout(launchSubtleFirework, 1500);
    const fireworkTimer = setInterval(launchSubtleFirework, intervalMs);

    let fwAnimId;
    function renderFireworks() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96; // Air resistance deceleration
        s.vy *= 0.96;
        s.vy += 0.035; // Gentle downward gravity
        s.alpha -= s.decay;

        if (s.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.restore();
        } else {
          sparks.splice(i, 1);
        }
      }

      fwAnimId = requestAnimationFrame(renderFireworks);
    }
    renderFireworks();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(fwAnimId);
      } else {
        renderFireworks();
      }
    });
  }

  // ─── 7. Minimalist Slim Countdown Pill Widget ────────────────────────────────
  if (enableCountdown && countdownTarget) {
    const target = new Date(countdownTarget);
    const widget = document.createElement("div");
    widget.id = "utsav-countdown";

    function update() {
      const diff = target - new Date();
      if (diff <= 0) {
        widget.remove();
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60)) / (1000 * 60));

      widget.innerHTML = `
        <span class="cd-label">Countdown</span>
        <span class="cd-timer">${days}d ${hours}h ${mins}m</span>
        <button class="cd-close" onclick="document.getElementById('utsav-countdown').remove()" aria-label="Dismiss">×</button>
      `;
    }

    document.body.appendChild(widget);
    update();
    setInterval(update, 30000);
  }

  // ─── 8. Discrete Shubh Labh Offer Button ────────────────────────────────────
  if (enableWheel) {
    const wheelTrigger = document.createElement("button");
    wheelTrigger.id = "utsav-wheel-trigger";
    wheelTrigger.innerHTML = `<span>✨</span> <span>Shubh Labh</span>`;
    wheelTrigger.style.cssText = `
      position: fixed; bottom: 20px; left: 110px; z-index: 9995;
      background: rgba(17, 19, 24, 0.88); backdrop-filter: blur(12px);
      border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 999px;
      padding: 8px 16px; color: #D4AF37; font-size: 12px; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; gap: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4); transition: all 0.2s ease;
    `;
    wheelTrigger.onmouseenter = () => {
      wheelTrigger.style.borderColor = "#D4AF37";
      wheelTrigger.style.background = "rgba(212, 175, 55, 0.15)";
    };
    wheelTrigger.onmouseleave = () => {
      wheelTrigger.style.borderColor = "rgba(212, 175, 55, 0.4)";
      wheelTrigger.style.background = "rgba(17, 19, 24, 0.88)";
    };
    document.body.appendChild(wheelTrigger);
  }
})();
