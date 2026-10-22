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
    diyaSize = "medium", // small | medium | large
    diyaPosition = "bottom_corners", // bottom_corners | bottom_left | bottom_right | top_corners
    // 🎆 Fireworks Customizations
    fireworksFrequency = "subtle", // off | subtle | moderate | celebratory
    // 🪁 Kite Customizations
    kiteCount = 2, // 1 | 2 | 4
    kiteSpeed = "gentle", // gentle | moderate
    // 🌙 Moon Customizations
    moonPosition = "top_right", // top_right | top_left
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

  // ─── 4. Architectural Corner Accents (Diwali Diya, Eid Moon, Sankranti Kites) ───
  if (enableEffects) {
    const decorContainer = document.createElement("div");
    decorContainer.id = "utsav-corner-container";

    // ─── A. DIWALI: Handcrafted Brass Diya (Size & Position Customizable) ───
    if (festivalId.includes("diwali")) {
      const sizeMap = {
        small: { width: 60, height: 50 },
        medium: { width: 85, height: 70 },
        large: { width: 110, height: 90 },
      };
      const dims = sizeMap[diyaSize] || sizeMap.medium;

      const diyaSVG = `
        <svg class="utsav-diya-svg" viewBox="0 0 120 100" width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="utsavFlameGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFD700" stop-opacity="0.8"/>
              <stop offset="50%" stop-color="#FF6B35" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="utsavFlameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#FF4500"/>
              <stop offset="40%" stop-color="#FFA500"/>
              <stop offset="80%" stop-color="#FFD700"/>
              <stop offset="100%" stop-color="#FFFFFF"/>
            </linearGradient>
            <linearGradient id="utsavDiyaBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#E5C158"/>
              <stop offset="50%" stop-color="#B8860B"/>
              <stop offset="100%" stop-color="#7B5604"/>
            </linearGradient>
          </defs>

          <!-- Ambient Flame Glow -->
          <circle cx="60" cy="38" r="32" fill="url(#utsavFlameGlow)" class="utsav-diya-glow"/>

          <!-- Flickering Flame -->
          <g class="utsav-diya-flame">
            <path d="M 60 12 C 54 26 50 36 50 44 C 50 52 54 56 60 56 C 66 56 70 52 70 44 C 70 36 66 26 60 12 Z" fill="url(#utsavFlameCore)"/>
            <path d="M 60 22 C 56 30 54 38 54 44 C 54 49 56 52 60 52 C 64 52 66 49 66 44 C 66 38 64 30 60 22 Z" fill="#FFFBE6"/>
            <ellipse cx="60" cy="50" rx="3" ry="3.5" fill="#4FC3F7" opacity="0.85"/>
            <line x1="60" y1="48" x2="60" y2="58" stroke="#3E2723" stroke-width="2.2" stroke-linecap="round"/>
          </g>

          <!-- Diya Bowl -->
          <ellipse cx="60" cy="58" rx="42" ry="11" fill="#D4AF37"/>
          <ellipse cx="60" cy="58" rx="36" ry="8" fill="#8C6D1F"/>
          <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="url(#utsavDiyaBody)"/>
          <path d="M 26 65 Q 60 76 94 65" stroke="#FFE082" stroke-width="1.5" fill="none" opacity="0.6"/>
          <ellipse cx="60" cy="87" rx="22" ry="5" fill="#7B5604"/>
        </svg>
      `;

      if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_left") {
        const leftDiya = document.createElement("div");
        leftDiya.className = "utsav-corner-decor utsav-corner-bottom-left";
        leftDiya.innerHTML = diyaSVG;
        decorContainer.appendChild(leftDiya);
      }

      if (diyaPosition === "bottom_corners" || diyaPosition === "bottom_right") {
        const rightDiya = document.createElement("div");
        rightDiya.className = "utsav-corner-decor utsav-corner-bottom-right";
        rightDiya.innerHTML = diyaSVG;
        decorContainer.appendChild(rightDiya);
      }

      if (diyaPosition === "top_corners") {
        const topLeft = document.createElement("div");
        topLeft.className = "utsav-corner-decor utsav-corner-top-left";
        topLeft.innerHTML = diyaSVG;
        decorContainer.appendChild(topLeft);

        const topRight = document.createElement("div");
        topRight.className = "utsav-corner-decor utsav-corner-top-right";
        topRight.innerHTML = diyaSVG;
        decorContainer.appendChild(topRight);
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
