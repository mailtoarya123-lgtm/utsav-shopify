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
      "utsav-kites-container",
      "utsav-snow-canvas",
      "utsav-fireworks-canvas",
      "utsav-countdown",
      "utsav-wheel-trigger",
    ].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function startFestiveEngine(rawConfig) {
    teardownExistingEffects();

    const config = rawConfig || {};
    const festivalId = (config.festivalId || "diwali").toLowerCase();
    const isDiwali = festivalId.includes("diwali");
    const isDussehra = festivalId.includes("dussehra");
    const isSankranti = festivalId.includes("sankranti") || festivalId.includes("pongal");
    const isEid = festivalId.includes("eid");
    const isChristmas = festivalId.includes("christmas");
    const isVishu = festivalId === "vishu";

    const palette = config.palette || {
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
    const bannerText = config.bannerText || "";
    const couponCode = config.couponCode || "";
    const countdownTarget = config.countdownTarget || null;
    const festivalName = config.festivalName || "Festival";
    const festivalEmoji = config.festivalEmoji || "🪔";

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

    // ─── 3.5 Inject Top Toran & Side Garlands (Dussehra, Sankranti, Diwali) ─────
    if (enableEffects && garlandLayout !== "off") {
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

        if (garlandLayout === "top_and_sides" || garlandLayout === "top_only") {
          const topGarland = document.createElement("div");
          topGarland.id = "utsav-top-garland";

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
              <!-- Realistic Dual Dark-Green Catenary Swag Wires -->
              <path d="M 0 9 Q 80 43 160 9" stroke="#0D2B17" stroke-width="1.8" fill="none" opacity="0.95"/>
              <path d="M 0 11 Q 80 45 160 11" stroke="#1B4D2E" stroke-width="1.2" fill="none" opacity="0.75"/>

              <!-- 6 Physically Wired Micro-LED Bulbs with Socket Fixtures -->
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
              </pattern>
              <rect width="100%" height="68" fill="url(#utsavEfToranUnit)"/>
              ${overlayLights ? `<g id="utsavEfSeriesLightsOverlay">${overlayLights}</g>` : ""}
            </svg>
          `;
          document.body.appendChild(topGarland);
        }

        if (garlandLayout === "top_and_sides" || garlandLayout === "sides_only") {
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

          const getSideSVG = (isLeft) => `
            <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              ${getDefs()}
              <line x1="22" y1="0" x2="22" y2="400" stroke="#D32F2F" stroke-width="2.5"/>
              <use href="#utsavEfGendaYellow" x="22" y="16"/>
              <use href="#utsavEfGendaOrange" x="22" y="46"/>
              <use href="#utsavEfMangoLeaf" x="22" y="68" transform="rotate(-35 22 68)"/>
              <use href="#utsavEfGendaYellow" x="22" y="76"/>
              <use href="#utsavEfGendaOrange" x="22" y="106"/>
              <use href="#utsavEfGendaYellow" x="22" y="136"/>
              <use href="#utsavEfMangoLeaf" x="22" y="158" transform="rotate(35 22 158)"/>
              <use href="#utsavEfGendaOrange" x="22" y="166"/>
              <use href="#utsavEfGendaYellow" x="22" y="196"/>
              <use href="#utsavEfGendaOrange" x="22" y="226"/>
              <use href="#utsavEfMangoLeaf" x="22" y="248" transform="rotate(-35 22 248)"/>
              <use href="#utsavEfGendaYellow" x="22" y="256"/>
              <use href="#utsavEfGendaOrange" x="22" y="286"/>
              <use href="#utsavEfGendaYellow" x="22" y="316"/>
              <use href="#utsavEfGendaOrange" x="22" y="346"/>
              <use href="#utsavEfGendaYellow" x="22" y="374"/>
              <use href="#utsavEfGendaOrange" x="22" y="392"/>
              <use href="#utsavEfBrassBell" x="22" y="406"/>

              ${hasLights ? `
                <path d="M 22 10 Q 10 70 22 130 Q 34 190 22 250 Q 10 310 22 370" stroke="#0D2B17" stroke-width="1.8" fill="none" opacity="0.9"/>
                <path d="M 22 12 Q 12 72 22 132 Q 32 192 22 252 Q 12 312 22 372" stroke="#1B4D2E" stroke-width="1.2" fill="none" opacity="0.7"/>
                ${sideBulbs}
              ` : ""}
            </svg>
          `;

          const leftGarland = document.createElement("div");
          leftGarland.id = "utsav-garland-left";
          leftGarland.className = "utsav-side-garland";
          leftGarland.innerHTML = getSideSVG(true);
          document.body.appendChild(leftGarland);

          const rightGarland = document.createElement("div");
          rightGarland.id = "utsav-garland-right";
          rightGarland.className = "utsav-side-garland";
          rightGarland.innerHTML = getSideSVG(false);
          document.body.appendChild(rightGarland);
        }

        function computeHeaderDockOffset() {
          if (garlandPlacement === "top_fixed") {
            return garlandOffset;
          }
          const mainEl = document.getElementById("MainContent") || document.querySelector("main");
          if (mainEl && mainEl.offsetTop > 0) {
            return mainEl.offsetTop + garlandOffset;
          }
          const header = document.querySelector(
            ".header-group, sticky-header, .header-wrapper, #shopify-section-header, header.header, .site-header"
          );
          if (header) {
            const rect = header.getBoundingClientRect();
            const pageBottom = rect.bottom + window.scrollY;
            if (pageBottom > 0) {
              return Math.round(pageBottom) + garlandOffset;
            }
          }
          return garlandOffset;
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

      // ─── 3.6 Inject Christmas Evergreen Garland ────────────────────────────
      else if (isChristmas && (garlandLayout === "top_and_sides" || garlandLayout === "top_only")) {
        const topGarland = document.createElement("div");
        topGarland.id = "utsav-top-garland";
        topGarland.style.cssText = "position: absolute; left: 0; width: 100%; z-index: 9992; pointer-events: none;";
        topGarland.innerHTML = `
          <svg viewBox="0 0 1200 52" width="100%" height="45" preserveAspectRatio="none" style="display:block;">
            <path d="M 0 5 Q 600 32 1200 5" stroke="#1B4D2E" stroke-width="4" fill="none"/>
            ${[40, 140, 240, 340, 440, 540, 640, 740, 840, 940, 1040, 1140].map((x, i) => `
              <g transform="translate(${x}, 14)">
                <circle cx="0" cy="0" r="4.5" fill="${i % 3 === 0 ? '#FF1744' : i % 3 === 1 ? '#FFD700' : '#00E676'}" class="utsav-bulb-twinkle-1" style="filter: drop-shadow(0 0 6px #FFD700);"/>
                <circle cx="-5" cy="5" r="2.5" fill="#D32F2F"/>
                <circle cx="5" cy="5" r="2.5" fill="#D32F2F"/>
              </g>
            `).join('')}
          </svg>
        `;
        document.body.appendChild(topGarland);
      }

      // ─── 3.7 Inject Vishu Golden Kanikonna Blossom Cascades ─────────────────
      else if (isVishu && (garlandLayout === "top_and_sides" || garlandLayout === "top_only")) {
        const topGarland = document.createElement("div");
        topGarland.id = "utsav-top-garland";
        topGarland.style.cssText = "position: absolute; left: 0; width: 100%; z-index: 9992; pointer-events: none;";
        topGarland.innerHTML = `
          <svg viewBox="0 0 1200 56" width="100%" height="48" preserveAspectRatio="none" style="display:block;">
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
        document.body.appendChild(topGarland);
      }
    }

    // ─── 4. Architectural Corner Accents (Diwali Diya, Eid Moon, Vishu Lamp) ───
    if (enableEffects) {
      const decorContainer = document.createElement("div");
      decorContainer.id = "utsav-corner-container";

      // ─── A. DIWALI: Realistic Multi-Material Diya with Granular Positioning ──
      if (isDiwali && (!diyaHideOnMobile || window.innerWidth > 480)) {
        const sizeMap = {
          small: { width: 56, height: 46 },
          medium: { width: 76, height: 62 },
          large: { width: 96, height: 78 },
          xlarge: { width: 116, height: 95 },
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
            : flameGlow === "sparkling_wick"
            ? "drop-shadow(0 0 14px rgba(255, 230, 90, 0.9))"
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

        function attachDiya(coords) {
          const diya = document.createElement("div");
          diya.className = "utsav-corner-decor";
          diya.setAttribute("role", "button");
          diya.setAttribute("tabindex", "0");
          diya.setAttribute("aria-label", "Light and receive blessing from Diwali Diya");
          diya.title = "Tap for Festive Blessing ✨";
          diya.style.position = "fixed";
          diya.style.zIndex = "9991";
          Object.assign(diya.style, coords);
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

        if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_left" || diyaPosition === "all_four") {
          attachDiya({ bottom: diyaMarginY + "px", left: diyaMarginX + "px" });
        }
        if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_right" || diyaPosition === "all_four") {
          attachDiya({ bottom: diyaMarginY + "px", right: diyaMarginX + "px" });
        }
        if (diyaPosition === "top_corners" || diyaPosition === "top_left" || diyaPosition === "all_four") {
          attachDiya({ top: diyaMarginY + "px", left: diyaMarginX + "px" });
        }
        if (diyaPosition === "top_corners" || diyaPosition === "top_right" || diyaPosition === "all_four") {
          attachDiya({ top: diyaMarginY + "px", right: diyaMarginX + "px" });
        }
      }

      // ─── B. EID: Celestial Crescent Moon & Star ─────────────────────────
      else if (isEid) {
        const isRight = moonPosition !== "top_left";
        const crescent = document.createElement("div");
        crescent.className = `utsav-corner-decor ${isRight ? "utsav-corner-top-right" : "utsav-corner-top-left"}`;
        crescent.innerHTML = `
          <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(212, 175, 55, 0.6));">
            <path d="M 50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 65.5 90 78.8 81.2 85.3 68.4 C 62.4 71.3 42 53.2 42 29.5 C 42 22.3 45 15.5 50 10 Z" fill="url(#utsavGoldMoon)" opacity="0.95"/>
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

      // ─── C. VISHU: Traditional Nilavilakku Floor Lamp ───────────────────
      else if (isVishu) {
        const nilavilakku = document.createElement("div");
        nilavilakku.className = "utsav-corner-decor utsav-corner-bottom-left";
        nilavilakku.style.cssText = "position: fixed; bottom: 20px; left: 24px; z-index: 9990; pointer-events: none;";
        nilavilakku.innerHTML = `
          <svg width="60" height="85" viewBox="0 0 60 85">
            <circle cx="30" cy="18" r="20" fill="rgba(255, 215, 0, 0.35)"/>
            <path d="M 30 4 C 26 10 24 15 30 20 C 36 15 34 10 30 4 Z" fill="#FF9100"/>
            <path d="M 30 9 C 28 12 27 15 30 18 C 33 15 32 12 30 9 Z" fill="#FFFDE7"/>
            <ellipse cx="30" cy="22" rx="15" ry="4.5" fill="#D4AF37"/>
            <rect x="27" y="22" width="6" height="42" fill="#B78103" rx="2"/>
            <ellipse cx="30" cy="64" rx="20" ry="5.5" fill="#D4AF37"/>
            <ellipse cx="30" cy="72" rx="24" ry="7" fill="#996515"/>
          </svg>
        `;
        decorContainer.appendChild(nilavilakku);
      }

      document.body.appendChild(decorContainer);
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
  }

  // ─── BOOTSTRAPPER: Cloud Fetch + Local Config Merge ────────────────────────
  const shopDomain =
    (window.Shopify && window.Shopify.shop) ||
    (window.__UTSAV_CONFIG__ && window.__UTSAV_CONFIG__.shopDomain) ||
    window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const previewFest = urlParams.get("utsav_preview");

  if (previewFest) {
    startFestiveEngine(Object.assign({}, window.__UTSAV_CONFIG__, { festivalId: previewFest, enableEffects: true }));
    fetch("https://utsav-shopify.onrender.com/api/active-theme?shop=" + encodeURIComponent(shopDomain) + "&preview=" + encodeURIComponent(previewFest) + "&_t=" + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.active && data.config) {
          startFestiveEngine(Object.assign({}, window.__UTSAV_CONFIG__, data.config, { festivalId: data.festivalId || previewFest }));
        }
      })
      .catch(function () {});
  } else {
    fetch("https://utsav-shopify.onrender.com/api/active-theme?shop=" + encodeURIComponent(shopDomain) + "&_t=" + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.active === true && data.config) {
          startFestiveEngine(Object.assign({}, window.__UTSAV_CONFIG__, data.config, { festivalId: data.festivalId || "diwali" }));
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
})();
