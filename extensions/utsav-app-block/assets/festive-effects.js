/**
 * Utsav — Indian Festival Themes
 * High-End Minimalist Storefront Effects Engine
 * Stationary Corner Diyas, Subtle Aerial Fireworks, Realistic Series Lights, Soaring Kites & Hilal Crescent Moon
 */

(function () {
  "use strict";

  function teardownExistingEffects() {
    if (window.__UTSAV_SNIPPET_ACTIVE__) {
      return;
    }
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

  // Returns a parent for fixed/absolute overlays that is not trapped by theme
  // transforms/filters (which would make position:fixed relative to a wrapper).
  function getOverlayHost() {
    const body = document.body;
    if (!body) return document.documentElement;
    const cs = window.getComputedStyle ? window.getComputedStyle(body) : null;
    const traps = cs && (
      (cs.transform && cs.transform !== "none") ||
      (cs.filter && cs.filter !== "none") ||
      (cs.perspective && cs.perspective !== "none") ||
      (cs.backdropFilter && cs.backdropFilter !== "none") ||
      /paint|layout|strict|content/.test(cs.contain || "") ||
      /transform|filter|perspective/.test(cs.willChange || "")
    );
    return traps ? document.documentElement : body;
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

    // 🪔 Diya / Corner Motif Customizations
    const cornerMotif = (config.cornerMotif && config.cornerMotif !== "default") ? config.cornerMotif : (config.diyaStyle || "royal_brass");
    const diyaStyle = cornerMotif;
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
    const garlandStyle = config.garlandStyle || "real_blend";
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

      
    const REAL_LEAVES = {
      real_mango_leaf: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAABICAYAAADs+TUPAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAASAAAAADaJrpmAAAPuklEQVRYCaWZe4wd9XXHzzzv3Ofeu08/1sbGXmE3sXiYKor7QBClNFFJ1SSlSSs1cv4AqVUhoWrSqlJxQ6oqVVRaGtKQlIKQ0qKQB+AkpBIogAhtGhIiTAEHExw/Ftu7e/fufc17pp8z+2DXdlva/vAwc+c3c87vnPM933N+s8alT3/6Y7WJzc2tdv3ux2ZunJPzRp7nJrdywzDy86aEuRr3LI4+8+n58/rbnH/95PyxYe/2I5754fUP8LKhwnkxu5jwlWd9zjFHhWed9e+vXpvd148+6L9w9N+cM2d+/1/yM1WdUOGckGtkqw9e7Mx8yjFkTldf5b3K+c+ZcujJxD43f2t0+uSuv379iQ+sPvA/CV99buWslvQ51Ooah7p143Du/t1bxx6/4/uH8tzeOPPWf6nlHCMcoxyFnDVNfzr3wN+F7c7g71/4wgffusiNT2K1gmGJu2rRMijQpL5TJIj3+YPXjD/x6R/tzw9f4Eud/98O5DbUAo1+SV8Ofu++p/IgPNF/+eyf6O//z0C4AqVQkHDh6w09fCv9lBGHf/S+H332D/cfvun/bIm6C7lvKM41SfRHRT7/ZHVfsHD5eJ64YaX22Wal/uzIP737Zrn7bZuYf8uDhZq6WEa6FmTe9m/Zf9pMHOMTY1lkDMSTs2Z8eS9Z+IJY4fPmPTN/6z3wyzv/Oy0rXlCZa5m/pgBt2b1zT+yOquWZ2WBB7DSU1HAlG4ZiVEc35RPTt8Se++yWRz7yvospUeHc11VvyPw1BfrSTH3819xa2WpnoXTDtuwYn5FSeYTlOJKbVUntbNN8fPLBzY/81vvXK1GX6G8Vvv6+Xq9TkBsV17vONCwZLY1IExi7blkO7LxWdo3ulabdEscahXiM8rnBiX/0vnTVdSpgRfiaS/Te+rGm4Ppn722Jae0xTVCbJeJZpgzjgYhbka3eiOysjkujPiF2ZbNk9bGRqFr92tQ3PvSu812yXrherykYq0VXtTxv0gNPVackDpa4eSJWdVQy05LJSkt2lcekgUKxa5I1m81B2XjgV5+/c8f5Qtf/XlNgZNkNlm0YNjqrtictty5TTlk8uySTpSYu8mTSKsvuyoRMoqhk1GRgBlt+3D5y78dPPlteL3T99YqC3IjS4OokTcVG4IhdwbeZQIukeS5RuSyGbUtsG1IxDNnhjMjWkW0sZEzmorPXPfji33xsvdD114WC38zFDPK0btquIEoiIBonkYA3aVjYZHqSJ4nUnYrYrkdkM/F0Mbgrd5rSs9xPHHjujl3rBa9eL1vw0kMjrpgTVpJKmsaSZBnQxNUoq+N/AzSVTVem1G0gzCvXJMI6L8lx3YhUKLkVq/KhVaHrz8sK4oXdaR5PBnHAiylOyaVil6XEUUWBoHBIwAfRQGIQNo4Lt1VGZRQL7FIZMNhSLnkfuOvVbxekuV5BURSiYPjzmWeYKcxR1gA7NbExoRMuAVdXSpYjmePhKtyH6yIWYqCwxRzBkaUolqPGmStBoNb1+9crKCwoWeb2SgnBpbqUERYTg07Uk8XEl0EWEeiUeBBkrDMtSzJcF0ahDIOhxBxZHMrJsCP/0Z+9lcRr5ocOLXsGTcVFbjqvWQhIs7QI7kCDTCBtwxTXtKWKUgt31HDNFJCtlypQoQWCBnKqPyftYVuCflveiJf2ffKnX90v13ykgaI3S6ZZKn8/DKIkgIMGGUEGPWUCWyMGWUrAERQUK+4XsaiBpon6mGytjUmZXInDruSd09IdvGY9fPrJX5DjxwMWX5RMMz+TV68bfc+rgeRHu5JIjPAqgk2me2FP2n5HwjQSkzzwKRt63Y2HOC2XTU5V9lQnpVWewnUVSXsLcvzkc1cZB68NoJAUK6hopY5z0+FZ6aXx8QwhIwjPgWqQBJQ5XIbHHZRpoCMC3zBLYhOHhDl1qZEmUsaVAr1I5hKT5FL57qHVzgQFzWb85zftD/w4GGtAy8IKU14KgaOdkYH8lyFAlSJOYgLqWZ7UXLpGl3pBvgxRhjacwtmyZtzTz+xdQdIbsI8x+MUXvtyadKrbPZqLfhZIgLAmAS1WnYSyOFgQo5KJT/YupT5ZbUHdjjRLNfKkJEPcujhcQKYreT30CNgMRr+obipMGTPCmmma9W40lC6rqJMLFu4YEINVyihx30Ao0iUiFnAXdBEXi7iytU3G3ao8P/+K9IxQRscmfEOeLoJcKGglrV7bWOyeTYP6mFmRUVyVsPIYAQpXF0hq45TBS3EMRUAbPvMB7sxiXAeHbadmbN36DvkZlRC/eWdWfFTkwf1X/kanlyUvKmNmkS/toCs+viZNC16KTWJAQDUeCb42iEkFJQ6CfWDd4flBOBQSXfZN7pSZ5pYtK/J5Y2W0E382ZkXzsS+ng47MJUARHtLsVo7qFHAlT4Zd/N2RIcnokIQN5g3sO9tfkDbJFoY+iowDq3KXM5mldqL+yPHBnBzzF3gZQrOqoCgt+AhcCT2GDHFLnwQJ4KMAiuigKCRuHixQwqLT/H761BF5bu6V9+956uP7VEkRg4Pfva803318r29lssubkrd7E8AO9iSgIXYbNA0OR8QL/YjgkuVafCKuozyQEnMJ8dKonsbCfu8n3mYpX87PI4UF3zz1jXcNg/k9u9wJhI+LycoDhGtdoJTCrJAWUNQeMwZdudYLckT93ychF6K+zA7aMu8vEXRcZFdltD79Th5ftqCX9K7Z2thhvL08iVtIHLIX6iB3oA7ObkHLJspS6Qd9sWJTNtXHi4QLsSsgNxaAbRe3ReGC5PB2Nytdf+8rz9QLF5USZ2p3SYVTanAJ+yKQZkmD2qsZ2od7uuRE4LByrFkM+ySaRZVzoA2nIMWqB5qiJSxjR9XpyWwyN317eOemQoHV7S/ZYSxew5XQAYJgv0XQYoIaUQ8M5R5yQF2m0O0BYSMcyAS8BZWSfCQegbdRCDORBwMgIe7Z9olmEQO/0/vasNcTzytLxatKE56xUaIVTNHTzVmd1ggFOtCNsaaDFaeGizI3XKKiDQl+H2RB29o9UreNPOPfoNgfSPDKkWfccuNhu+wVkLPwO1S7DEsCqW6ZhI5HCPBIZUTGEFCFtzSLlwYdaStX+X3x1EAsymN2UcAZ/F22nGgPSVrZdNkn/Sjpa2AhAFlg7Yus3KGgjHr1Ag0RJdQn032sM3BZq9yQsSpFB4vVnYqzquZ7pNVCRVdpQFfGt6+46SdZanzFB0ZFLUbJWLkJ/1tFn7QISnyUK034IGmJpJofLMoSrgpAV1ZpUg4aYhke2d0Sm2JkuNVaEeRVJZbTvGNueOKGJSOe0NbEJnALCDjHyufBuwMJelCfQfnUghOgDEpmKfiGayAFSOhp4dKM8muWMlu3OrrLLBTdv/fDxwdifW4Ideb4/gzd9QmC1ybANVy1RZU6TtG7lhK+IBDUFP/nA+DpE2AOqpWEVoKCTKZtt6suguRZ1soYrY3el/jB0ikK+VGf7MxDGcPHWhbntZ3HHTEkZ+D7UnWCLm+U7gMDWIjgthxLcY3I+GaZaExXVIF+zFjdZZoP7/7oKUPs7xzLezLA75e6TbFYbRto9smJFEVRQNLBnoFPQUpBS5l9Q2Oa1qYhQgeivL13ap+4rcmXdJfJnWLolrUmh3LDtOxHYla7zWlAcrl04KUhuBAUEU64iieh8Jxgp71zEi+dAZ1wUGOTWLVpoaCLiVv3je7MCt+jhDDk+tXElW3fq5bSZM7FrtTK5Wf+Ih0HQSXQZadODXBIQIILqeUaBz1gXuF3Qj03ag26SU9ePv4DWZqfhbVWhirhCGXJTMxhsB0x8gbC28Qixq/j5Za0YMkca1wgaOE6k6AbcBYMh6IejdScZFiTRZ2CUU3LS9YUrCm67YD/6tzLl0QQF/0wGxJbttSmpEb3cA7W1FzQgp9AgBkxyR32D40JFKEcBAkL0mBrt3H1jnf0L1Bw0z33OL3O2esHFJMMtFzR2iXjPDyPQJr3Ave6UaHjKtxjkCtZMoCDcJM2X1AKKJC4c6adGO6JCxQ8ZX/LqzmN7RP1rbK5MiYTFn0PKx0gUIObqs9jhAU+0KQF1YaLmBTMoEQHZIUdURikTzx61R/MXqDg6Ecf7V8xvf/xX5qckT1gPKIUzma+pBpEdQvsYhFEQzfnyMohOdED4kMb/3TvgNuckafU7RcoYAV5bXrfbTWpHKmUXCjCZx+wICbnUTYmdUUrNJDzu3ib+iy0krAfSYi4ZT257TZ+cHEF3D182W/PO2bj4Lw/XHptcEKycJH9cYvWMZEzdB0uApX0MIuggm49qzm09cKO1HLKL07teecL/6UCnfiHvb/zw5PDhc/04nkou0ndTWUQLBaNWW47cBsrJhRK24V0coUNHPdLrN79zPFrD+ke4SIu0rsro704/y1zGKX6MSSkY7B4nCrM6hEKsrxqSyruCLWFyLLr0SJjp42j07/yZ19dlXFhDFZmsNhoWtU+/XGoRUipmDpT5ICWzgwqiUAWjbaU2ek47iixYO/QGD/y6sx7tYUqxkUVQBuEOpdd5t7Ttls/bmhvqn4GIfoNw1KqwDUZgQ7JgZTmy4OLytgXdWcr2KMRubgChBdKlToee+8t4ebGtscc8qAIJN8qBkAVMEIVbEAwTGh1gjgiV7QOx7KjuvlwfmhZhmpYs0BXvSJ8w7efptd4MPcHSc6uftkKNlW6k4HzjdFpKHkL7itJWq3SRmaPHPvgo/8st0sTWQWRFv9TTTpYNV7eOF5/6d+rid0zqC5gP6M2qPUogOByuMlsTcnUxCXSNaGHOLvLGDO6CNcdfyFrrWSqSzaKXv4VtRcaea9PM5QWKBLalZh+yIIOCveQxQ0+ux3YdMXJ7Zt3/FDfUlbWxaKoaLw2lMzzldhB6Xumb55w6YcsaDqlhGZhIGkfn5Mbeq9S4RtNmjz403d/UT8rrx9VjYFCSkumWrMWk9Wnuof+tT3W2nnrpuoULdE8m3IKzaAH0eGB/qKkw1l6odJwesvbvrT6jp6RpbRXfJjVSqajKJlMbIiLTpy9+fAj3c7pvxSfP5AElEot7lQ2bc4BsJwLenfc93MHj+mzOlYXqm5agyT3tTaT78VfMzZ8llFcGyfju6xF6zsy4DEfqJLNxugWKbf2fvPYj+/9K31GV63CVTBHEdM1l+gNDlVARonHg8VfQ7guxuIfP7502e4bf91eSO8UjDQqVXEnpqOpSy7/lBwqAqouQcSFSFwR8eZJV8Ghf5dRPK8tYvmJ3LD+4urPmffdkDe/fvPXmS9Wrec3Jbx5dd7LyxMrq9A/MmiutngZxlkdRp7O7LzNKU8+WWpt/gpr1okNybn6pJ4vqkAnUKIvUapEobcxAW98KJrs77u9fmLqqPpen9V3Ljb+E9UM8KPp1BZsAAAAAElFTkSuQmCC",
      real_leaf_bunch_left: "data:image/png;base64,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",
      real_leaf_bunch_right: "data:image/png;base64,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",
      real_leaf_bunch_motif: "data:image/png;base64,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"
    };
    const REAL_FLOWERS = {
      orange: "data:image/png;base64,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",
      yellow: "data:image/png;base64,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",
      pink: "data:image/png;base64,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",
      dahlia: "data:image/png;base64,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"
    };

    function getFlowerHref(style, i) {
      const s = (style || "real_blend").toLowerCase();
      if (s === "real_marigold_orange") return "#utsavEfRealFlowerOrange";
      if (s === "real_marigold_yellow") return "#utsavEfRealFlowerYellow";
      if (s === "real_blossom_pink") return "#utsavEfRealFlowerPink";
      if (s === "real_dahlia_sunset") return "#utsavEfRealFlowerDahlia";
      return (i % 2 === 0) ? "#utsavEfRealFlowerOrange" : "#utsavEfRealFlowerYellow";
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
            <!-- Realistic Indian Marigold (Genda Phool) 3D Radial Gradients -->
            
            <!-- Real Photographic Cutout Flower Definitions -->
            <image id="utsavEfRealFlowerOrange" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>
            <image id="utsavEfRealFlowerYellow" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>
            <image id="utsavEfRealFlowerPink" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>
            <image id="utsavEfRealFlowerDahlia" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACQMUbvAAATMUlEQVR4Ae1aCYxdZ3k9/92Xt7/ZxzNje2acTJzEcTZKSNSYlLpNxJICYWmjNpWoKEWtWglQ90WolcoSNSpUFS0o0FKaEAiCxKLgOESJE2rqxjGOk4wz49ln3szbt7vfnhcwOAlCZGZsVOldafTem3f/e///3POd7zvf/4Du0UWgi0AXgS4CXQS6CHQR6CLQRaCLQBeBLgJdBLoIdBH4mRH4qziWikunbyjPnfjNpVNH9//MAy/iieIi3utlt5qentatVuVeXZJv16JAcwKn4EnGwR37r3/6/BNXXnjiNsvAWNPXvzE0fu38+d9djPfSxbjJT7qHPFP4nURJvCuca2rtMzWYFb9PrbU+PT39sH7u/IXHD31IqzceFK3oU7ZX/17hhcN3nfvuYr3+XAB6+OGHdaXovy9abEGZd6CuuPAXqkg0wtcn58y3dRY/99DX/sBu+n8vCm3Fm+F5hUpvXG3+1sUC5tx9LmiIxdQYIUR07mbnXk9/6ek96fbc9+3UuoqCDXnVRmjWYIzkUDOVh+op6U+Sq+UnNSGsyNUhV5sQQx6cgeyiK439kZW2xz3bOTYwvvfwuWteqNcLAtDs7GzGdsS/qK7Y5dXc2dBzH2zeYtw/KSbdzkKKT3/yD5P+3CcDbxVx3AOcHkd42oIy3gPf0kuO35xNhNo1vrQBOelCTCsIBvldagByIgElp8GxYtfTw09K6d6PDg0Ntf7fALRyfLo3iNwH0krypqjuQHJjxHWGUKv5pKurv6e8fXpZf/Jbz+rlSi7aSAGaC8kgg2Z3QHUnIJk6gnYTfn8VYvAxyGYBceMGRCffhEiXEZkBfNtEkAWMoQTqiO4cu+aaf7tQACnbfeFKubg/LdSbauU6rEBH1HQQuz4sP349nNo3xUNLx025mQtnJMQLApIeQe4jkMkChJuDqPUgzs8RmKOI5rl8JKBOnEEgEbyFFGLFQpQN4TYcIFYBJdq93Ws4/3rbDlBUD9pO04Xa8hAUG0j4KiKvgSD2YThBr5GrHow0FWI1RDzfibgQ8AJIdgyhki2hCwXPIj7TRrCcgNA0yLZEgM4AL0wAPTyv1YYeMtQSgJxTg4Wjzw9bti1y/vCauFb45y9wq++3P4up2WnUw6IWuQidNfjNKqRyCLFYQVgswmt4wDogmj5Dx0VU9hGuVvm/OtBeI1zPEoh1RHMRxBIgLbcgFiTIrQCgWEdrS5ArDdhNDVHRhV4LP2iV2t+Xq/VTNfW5766ffuaarYJy/vhtZ9DYdU14qe+3jbCIcCQGKmTQsoF4mvpRIGgbHhQ1hBR6EOCiQzKi2iB72oDF9/UaUKoTQIXvBYQdIN4gyyIHUWOVIRdDS49CchSGLoFfrQzGvkWxt2Baqf1tp37P7OyRW3btOsAY3PqxrQDdd18sB9V7PpHuLezwVjxIHZ2ocNERk+WOCKGQWO+0oY3G4DsoeodlnELYhhA1RFUKc5WaFbEyaFgQngNBHYfPsRsNhK4DPZcjmwhOI0awtorAI9jNfsSOikptDeYe+waplX8PR31u6/CQwdtxkXPXuOMOEcpx7XJvnWxYt6EWEpA2HITrZcjlGtSAMePNEw/WNXIAJVOErJUAtYRYW6P+zBOsNQpLhd+XKcBr1CACFngIV4rQkgxFi3o03II/PA1Pe54sjCCtE+hlnuszI7aZBcsUsm06tswgFoPq3BMnbpQqrRv91dpOb/XMgG424KwWgSUKLNJA3YdfW4JqhNCiKpzlCtThLERfCXJAloXU1YRPxjCUGJUioD7ZZE+C7GPd4zapXwaf5kQ/xMAyx81CZFuw03y+1gqcw/ugiVEoUpoy1lrGLvFf24QP57+Fg+CIpWPH/92MpI9ZXnjAqDb3B8tN2xoRnGyE4GwZwUIdcqxAUSSGyDzTegEINhBpdYLUYnrnw9YZcnkikyQ4BAIcKyn8X68gs2S4vgfVJNiBi7hSeUmToiWmsDqr8B0tyMoo1Ap1SZf9MCl+t++W6/57C8t62dAtMejMsePvTATSO/xCHeE8w2KjhGClStlpI7evD/peKk1rBt50AWpahtrbi1AqQ2MdA7lBkPgySDAanBMtqqQSJNbEcedzJ1mrlOQCLUijhbjNe7SSTPFDiHwOZKGojSmQhI3WGqtwstM3/Fooy0OrX37yzZEZPTN02xvmXrbaTXzYEkDCd94W1UO5Nb8BbY6mc4HhUo5Qn24jXg+Qu9SCdsUIlGwEf/p5Pv0mlGGyJCsj1hlGvHvA6ljm4hBQyF9SRIYVsxnIpJiZXyox05khC06SvaEjbjKzmayzBpNQemw0T9nwT1QR9C0iErm8bvR8IkwpaDealYX7v/OVVk79i0tuuYHit7ljSyH2gV+/K2W58lvRYpjUWPWuVxBU6ojLTdSPLcLxqjAHrJfYo+xkPWPPIQxLDCem5zwnrAmUVjSEdZUsUFCcNhGFglrFDBVo1CSyS/pBFoyLzFwhGZMzII/0QiEbPdqY+hEKM/8fKzKFXYEn0YpwvOhTDDsU+12nFeSmxh959NFHifprP7ZkVqcfntalxtL92XL85nCZGanMJzm7CufsEoJ6BV7E7DTQRupKCdnLZejDFFh9hpU12cO5OmUZ1UUTjRkFMhlVK+ro6WvDIHi1qoaBqRp0LlaqUotKGuLWDkj+ONk3jAZ1qXqiSGuSYXajj+vhd319iEcT8HbavK+AN1OCL2FduXz4yl3XX7/62uFhIt3MoHNjJm+ddKefmv6NdrB8dzKff29clw0xXod+BS1CR/9Zm0S1KnxvBc3nV9FiQaiOdFgQQ/YFGnUJ7RJ1RmYGy0sw+0KyQkV1jt8bPppkjXlpADnLZG5rFHwLzeUyas+uwF2TIcWDXADFK2QRygwY+dQpQS1SXHq5JCSZc2iGeuR5FK3NHVsCqHPLyddN1k8eu/8L7Wbz9cPXt6fkxBqkChe85lFzWC2rtBaCjl72EMk1BCWB8oqEKsFrrpjQI+rPICWol+FkUaMp0CpDz1tSsTxNOyEx3Su8Vpm11coLiNdYRLb6YdhjFOgE5M4gQV3SfLZCaH5TBjNeGlJgwGt6aLeDv5688UYWWJs7tgTQ9MNH9yufr348Kqy+0Z6YhbxrA9IcTeiST1vBYpAunmrCFfOVBR40ifoSwWQPLaRWuGrABTC7aXz6TOuyTGefYvCREf6GwNoyS4VZYHg8hp5lYclyQMkxk9V7KNoZXp9/FDOhDVHIM0CKNVciRbEmO18s1Oib//KSP33XP+BDmwOnM2rTAJ09dvxX1ZLzBT1U814yRHqKNqHCp7loQKxQhJsEJmbdIuirOm2JThjRnwktgmWTMWUFp8+q6KM7HyZjXOInyCYlZqXMjOZIAtl+FUkWiwkrRDLTyWTUIWOQ7Y7dtBbDZCibbY1+SFofRCbDhyDQdtfR2KgWWgP2O/e8/92P4c/evXl0NgvQqVOnEv7a+j+arsi7NcZ7g7qipynABMXgHwu+Du1BM8lUxKcqMXOxl5Nn8ZIvQSOLIjoJW2NLpG4grEVQQglGkppBVXXLMfxqjCTrIldpo1Ime5pkn8eQbfBBtIu0HxTiDtJ9EZpuBasnj6NVLiLg+epgKm9JO++Z/uKX/3byve+4bysIbYpBhcsKTt90Y62+0NodzJbJmDraXxcYupUZ5Vo2yZYJSpk1kUM2gYswaCvsLKtim+2OUyg9VcLqbIxdQwJFLn7mOYEBZh0jp6MdROwl0UEQX4cWZPcUa6FOlDKlY6MXUbsPYbVNc79CR0/tlWQofUmo7OYGTzagKzbDwpCVWrhPLvv/Of3lQ/sn8safiwMHeJXXfmwKoAPiQPDsg99cM1kdt7JsQzg+2v/jYWHRRWqfDCvNtE1GgIsKGS7REhtmqzMMq7OkTRPmkITxK2Os06E3SDJVT2J9XUGhGKHaitHHBplNL5Zh6Npkn5xmaC0RMTb4hbwDipVDwEZcSO8aOwxbAjk4NYjk1BCKXyNDY4q0TMYGEuuq9keek5QvEpqTrx2eLWiQF1kfqcuurAz0HEzYWU3pbcHbYAo+UkRprQJ3aQU+G2Z2ooq+xDIzjAdjTx7GThZ6uXlmJwouJSTBNki15mFxlimeIbRvSoZmslXS0SoKd7RAkjRS1BhSaSzDRppJAaMvs3po2WymdxaJdYbkBsuLvRrMm21UDpWhWhH0vAkhWUvKUHJuM+B0xmyKQZ2BV/3aTS/w5S2nH/zOFaHZulqytTFZS92FUnun36ggakVIjvRg7NpeTnIM0ZBJDaHR9E6Rcb3UJBWmuQx7J6/C/nTGaNOLBUgwVeuZCG2GmQa2ZuvsQb/IsNVpTgcmIPUzZBPUKu4YdbKd7JlslhlsprH+cQKkXkfZK2S4G5JlFd+LmhE9tXvidTQtmzs2DdC520297Rc71D156jMPvVVvNvNCNaHZnPy4jeE7JyG12M8xufFXZlXdpOlUWfE6/RRpZjfTZGFIDREb6JnouNQksx5LBMlkNU0zxo1FOPs6ZRSZQ3PbablmBlmCMr33qHT7ChnE0GNpJMhGOcdLROxA5lNenEjO12P/P8pG5hPcm+MVNndsGaDObU/d9+3L1IJ7r2bYySAmELqK/jtv4usCXK0AizVKvE6gYqZjJ00QKOIp0j+mZswUoba5w5HOkXVjXCzTm0HGCAIhVghKjttCA6ymVtjkr7JeasCXE7CY7sHtn5fUvLN7RMFvZ9w5p+T9cTiaPGFdcfncwL6B5uZg+fGobQGIT/BDtm6kg6gBM9ELf4Wpd3Gern0OyXGm/wafqsKCLmA4dDYdKL6SzFYITWrlf49ilKkqZmMfzFAAQ5I+K/JZErBeEBK7iRWDux6XIWAvTKnWsbixyus/g/xVe6BzN1bzDHZHlMPYPfGe4b1Xr/94eVt/t2WAjhw5YkQr7QO+okJNZCnO66hW1xA8UEZ2ykZqP7Wj05PmYmObsZC3yQhaD0XBC48fgnpyAcqlN7PgY0egQX1RyTC/RhfPNgb31dQUM9Eyi0w1Dzljsl27hoHLhnDskRNYP7YKeyyFzN5B6Lv796Ik0eZ29ky272Au3tpx8/rNPonxRJBUUPaLqKII45IeJAZ3obWaYlOduxN5Vo6jOqRrMgQji7A3g1Pf+R42npqhZ0tyY4OiGzEtOwSITTG4bHto3G6OGGrRKOTh/Et9IEkZpNcagtVjIHkdayLKuBn005DqzHjmgOSFH93aal49essACTbqRX/mww2/WbaG+5CYmkBieCfs0RFoO0awdEyuOTSc0ZSBViLE0jMFPP3PT2Dp0bPIW5Nw1tKos5ck5TLMYtQUgiJSNusjB88dPU6BJ4D9IxA7aGOY1aTsCLef2Qq5cQz6UIptjwbbs0m47LBFQjr44rceH331Mjf/ny2HWOfWV91ww9Lxr37rffVIeo8w5SGpx2pLcuIZNTPw9TOH5z648ZhzuwTuaRWYTKoBvFYIMz8MLcyiEbRQPFlF/wFahyZDkIyT2M8pfW8Vc4enkdxxArt+6SCiJJW42CIIZFt+EIZaRmZPSPFmH0nqZEDqta4n3GbjRk6pUxhuy7EtAHVmcvXtb3qALw9wouw9vNQPw5FPfW4greXeqNZoDcoVJLnr4Fn8YQIcWEzXUoNVsp5nV9BH6S1F5K6mEa3q8NM1nD28CE3OYOZr32W/OoGx226CPsnxLTbps0kEL7Z9uS+tptJskNGXBGzTslTl/ra2si3I/PAi2wbQjyb1Q3A6n4117Vcy2f50EG5AJTiCbsghYxKDI/wVhwatY1ZzeUSrEc7evQbjnwZg7dNw5vMF1J4PYVhpnqNh9dtPw3OieOS333BIGdOz7chtqXtH/y46XUw5Ed5L3l1pDCR1Jxnfs+/gwUd/NJdteLP9AJ03KTuduEJnApO5U6oaJruHBWhKFqqdgi+4w0pX7630QKNB7XQG1z/rQZsoYeMJhksfd1BdDXaWBpiZTK4KMf/Aix/b//H3vRKAr3YyKQsE5aoDBxrYWnfjvNn/4O0FBUikE5GkURzYUPfL/KECnbdpjrBNxDaGqRdj3bXM0QFT5U9glH6Nrj2BkO1WsCNoD9NmsElksYCUGUL6YC+zWY5p7tXHgQPbsw//6itvwYv9pIu98n+BJT0tJZld2PxyA7r43o4wW8w8tYVoNHNHXK/ebYeJX2jZDdBQkllJ1JLeZzBTvzWZFcOd5r6aoDMnQHFPOpZ7rcIr73GhP285zf+0CWoZ/VBZad7rJ3wnOzXG7JOFk1MOR5OZX77mrlufCoZTjymX90O5bhjm3jE4O5Nfmvvw2z+gjo98LLlnN8yJHRDcolZ301bk7I1oIDfz0+53Ib7rlLgX/Dj57cffZATmdUHLfeLk7YuP3yHuoK+giX/kkUtkNzykSnY2aMufdvfm/mZyctI9EsdKz79+87Np07qz07sO5NALRPS5qXcefP8Fn+wrbnBRAHrFPV/2ceHU0ZzX1hLj1778R+IdkPq+8fjvK1q8o+25X7Ev3XmsA97LBnc/dBHoItBFoItAF4EuAl0Eugh0Eegi0EWgi0AXgS4CXQS6CLxWBP4PG/l0wKRlppUAAAAASUVORK5CYII=" width="24" height="24" x="-12" y="-12"/>

            <radialGradient id="utsavEfGendaOrangeGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#FFE082"/>
              <stop offset="22%" stop-color="#FFA726"/>
              <stop offset="52%" stop-color="#FB8C00"/>
              <stop offset="82%" stop-color="#E65100"/>
              <stop offset="100%" stop-color="#BF360C"/>
            </radialGradient>
            <radialGradient id="utsavEfGendaYellowGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="20%" stop-color="#FFF9C4"/>
              <stop offset="48%" stop-color="#FFEB3B"/>
              <stop offset="78%" stop-color="#FFB300"/>
              <stop offset="100%" stop-color="#E65100"/>
            </radialGradient>

            <!-- Realistic Ruffled Marigold Petal with Crenated Tip -->
            <path id="utsavEfRuffledPetal" d="M 0 0 C -3.2 -4 -4.8 -9 -2.5 -13.5 C -1 -14.2 0 -13.5 0 -14.5 C 0 -13.5 1 -14.2 2.5 -13.5 C 4.8 -9 3.2 -4 0 0 Z"/>

            <g id="utsavEfPetalQuad">
              <use href="#utsavEfRuffledPetal"/>
              <use href="#utsavEfRuffledPetal" transform="rotate(90)"/>
              <use href="#utsavEfRuffledPetal" transform="rotate(180)"/>
              <use href="#utsavEfRuffledPetal" transform="rotate(270)"/>
            </g>

            <g id="utsavEfPetalTier16">
              <use href="#utsavEfPetalQuad"/>
              <use href="#utsavEfPetalQuad" transform="rotate(22.5)"/>
              <use href="#utsavEfPetalQuad" transform="rotate(45)"/>
              <use href="#utsavEfPetalQuad" transform="rotate(67.5)"/>
            </g>

            <!-- Realistic Saffron Marigold -->
            <g id="utsavEfGendaOrange">
              <path d="M -5 -3 L -13 0 L -5 3 L 0 6 L 5 3 L 13 0 L 5 -3 L 0 -6 Z" fill="#1B5E20" opacity="0.9"/>
              <g fill="url(#utsavEfGendaOrangeGrad)" stroke="#A72A00" stroke-width="0.35">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <g fill="#FF8F00" stroke="#B73200" stroke-width="0.3" transform="scale(0.82) rotate(11.25)">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <g fill="#FFA726" stroke="#D84315" stroke-width="0.3" transform="scale(0.63) rotate(22.5)">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <g fill="#FFB74D" transform="scale(0.44) rotate(33.75)">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <circle cx="0" cy="0" r="3.6" fill="#BF360C"/>
              <circle cx="-0.8" cy="-0.8" r="2.2" fill="#FFE082"/>
              <circle cx="0" cy="0" r="1.1" fill="#FF9800"/>
            </g>

            <!-- Realistic Golden Yellow Marigold -->
            <g id="utsavEfGendaYellow">
              <path d="M -5 -3 L -13 0 L -5 3 L 0 6 L 5 3 L 13 0 L 5 -3 L 0 -6 Z" fill="#1B5E20" opacity="0.9"/>
              <g fill="url(#utsavEfGendaYellowGrad)" stroke="#B77300" stroke-width="0.35">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <g fill="#FFC107" stroke="#C67D00" stroke-width="0.3" transform="scale(0.82) rotate(11.25)">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <g fill="#FFD54F" stroke="#E69500" stroke-width="0.3" transform="scale(0.63) rotate(22.5)">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <g fill="#FFF59D" transform="scale(0.44) rotate(33.75)">
                <use href="#utsavEfPetalTier16"/>
              </g>
              <circle cx="0" cy="0" r="3.6" fill="#E65100"/>
              <circle cx="-0.8" cy="-0.8" r="2.2" fill="#FFFFFF"/>
              <circle cx="0" cy="0" r="1.1" fill="#FFCA28"/>
            </g>

            <g id="utsavEfMangoLeaf">
              <image href="${REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="58" preserveAspectRatio="none" style="filter: drop-shadow(0 2px 4px rgba(0,40,10,0.35));"/>
            </g>
            <g id="utsavEfLeafBunchLeft">
              <image href="${REAL_LEAVES.real_leaf_bunch_left}" x="0" y="0" width="84" height="84" preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 4px 10px rgba(0,40,10,0.5));"/>
            </g>
            <g id="utsavEfLeafBunchRight">
              <image href="${REAL_LEAVES.real_leaf_bunch_right}" x="-84" y="0" width="84" height="84" preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 4px 10px rgba(0,40,10,0.5));"/>
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
            <!-- Series Lights Wire Swag (BEHIND the flowers) -->
            ${overlayLights ? `<g id="utsavEfSeriesLightsOverlay">${overlayLights}</g>` : ""}
            <pattern id="utsavEfToranUnit" width="160" height="68" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="160" height="4" fill="url(#utsavEfKalawaRope)"/>
              <use href="#utsavEfMangoLeaf" x="12" y="2" transform="rotate(-6 12 2)"/>
              <use href="#utsavEfMangoLeaf" x="38" y="2" transform="rotate(-3 38 2)"/>
              <use href="#utsavEfMangoLeaf" x="64" y="2" transform="rotate(0 64 2)"/>
              <use href="#utsavEfMangoLeaf" x="96" y="2" transform="rotate(0 96 2)"/>
              <use href="#utsavEfMangoLeaf" x="122" y="2" transform="rotate(3 122 2)"/>
              <use href="#utsavEfMangoLeaf" x="148" y="2" transform="rotate(6 148 2)"/>
              <path d="M 0 8 Q 80 48 160 8" stroke="#E65100" stroke-width="2.5" fill="none" opacity="0.6"/>
              <use href="${getFlowerHref(garlandStyle, 0)}" x="0" y="14"/>
              <use href="${getFlowerHref(garlandStyle, 1)}" x="24" y="26"/>
              <use href="${getFlowerHref(garlandStyle, 2)}" x="50" y="40"/>
              <use href="${getFlowerHref(garlandStyle, 3)}" x="80" y="47"/>
              <use href="${getFlowerHref(garlandStyle, 4)}" x="110" y="40"/>
              <use href="${getFlowerHref(garlandStyle, 5)}" x="136" y="26"/>
              <use href="${getFlowerHref(garlandStyle, 6)}" x="160" y="14"/>
              <use href="${getFlowerHref(garlandStyle, 7)}" x="0" y="26"/>
              <use href="#utsavEfBrassBell" x="0" y="38"/>
              <use href="${getFlowerHref(garlandStyle, 8)}" x="160" y="26"/>
              <use href="#utsavEfBrassBell" x="160" y="38"/>
            </pattern>
            <rect width="100%" height="68" fill="url(#utsavEfToranUnit)"/>
            <!-- Top Left & Right Corner Mango Leaf Bunches -->
            <use href="#utsavEfLeafBunchLeft" x="0" y="0"/>
            <use href="#utsavEfLeafBunchRight" x="100%" y="0"/>
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
            const xOffset = (idx % 2 === 0) ? 8 : 36;
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
            
            <!-- Real Photographic Cutout Flower Definitions -->
            <image id="utsavEfRealFlowerOrangeSide" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>
            <image id="utsavEfRealFlowerYellowSide" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>
            <image id="utsavEfRealFlowerPinkSide" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>
            <image id="utsavEfRealFlowerDahliaSide" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>

            <radialGradient id="utsavEfSideGendaOrangeGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#FFE082"/>
              <stop offset="22%" stop-color="#FFA726"/>
              <stop offset="52%" stop-color="#FB8C00"/>
              <stop offset="82%" stop-color="#E65100"/>
              <stop offset="100%" stop-color="#BF360C"/>
            </radialGradient>
            <radialGradient id="utsavEfSideGendaYellowGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="20%" stop-color="#FFF9C4"/>
              <stop offset="48%" stop-color="#FFEB3B"/>
              <stop offset="78%" stop-color="#FFB300"/>
              <stop offset="100%" stop-color="#E65100"/>
            </radialGradient>

            <path id="utsavEfSideRuffledPetal" d="M 0 0 C -3.2 -4 -4.8 -9 -2.5 -13.5 C -1 -14.2 0 -13.5 0 -14.5 C 0 -13.5 1 -14.2 2.5 -13.5 C 4.8 -9 3.2 -4 0 0 Z"/>

            <g id="utsavEfSidePetalQuad">
              <use href="#utsavEfSideRuffledPetal"/>
              <use href="#utsavEfSideRuffledPetal" transform="rotate(90)"/>
              <use href="#utsavEfSideRuffledPetal" transform="rotate(180)"/>
              <use href="#utsavEfSideRuffledPetal" transform="rotate(270)"/>
            </g>

            <g id="utsavEfSidePetalTier16">
              <use href="#utsavEfSidePetalQuad"/>
              <use href="#utsavEfSidePetalQuad" transform="rotate(22.5)"/>
              <use href="#utsavEfSidePetalQuad" transform="rotate(45)"/>
              <use href="#utsavEfSidePetalQuad" transform="rotate(67.5)"/>
            </g>

            <g id="utsavEfGendaOrangeSide">
              <path d="M -5 -3 L -13 0 L -5 3 L 0 6 L 5 3 L 13 0 L 5 -3 L 0 -6 Z" fill="#1B5E20" opacity="0.9"/>
              <g fill="url(#utsavEfSideGendaOrangeGrad)" stroke="#A72A00" stroke-width="0.35">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <g fill="#FF8F00" stroke="#B73200" stroke-width="0.3" transform="scale(0.82) rotate(11.25)">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <g fill="#FFA726" stroke="#D84315" stroke-width="0.3" transform="scale(0.63) rotate(22.5)">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <g fill="#FFB74D" transform="scale(0.44) rotate(33.75)">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <circle cx="0" cy="0" r="3.6" fill="#BF360C"/>
              <circle cx="-0.8" cy="-0.8" r="2.2" fill="#FFE082"/>
              <circle cx="0" cy="0" r="1.1" fill="#FF9800"/>
            </g>

            <g id="utsavEfGendaYellowSide">
              <path d="M -5 -3 L -13 0 L -5 3 L 0 6 L 5 3 L 13 0 L 5 -3 L 0 -6 Z" fill="#1B5E20" opacity="0.9"/>
              <g fill="url(#utsavEfSideGendaYellowGrad)" stroke="#B77300" stroke-width="0.35">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <g fill="#FFC107" stroke="#C67D00" stroke-width="0.3" transform="scale(0.82) rotate(11.25)">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <g fill="#FFD54F" stroke="#E69500" stroke-width="0.3" transform="scale(0.63) rotate(22.5)">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <g fill="#FFF59D" transform="scale(0.44) rotate(33.75)">
                <use href="#utsavEfSidePetalTier16"/>
              </g>
              <circle cx="0" cy="0" r="3.6" fill="#E65100"/>
              <circle cx="-0.8" cy="-0.8" r="2.2" fill="#FFFFFF"/>
              <circle cx="0" cy="0" r="1.1" fill="#FFCA28"/>
            </g>

            <g id="utsavEfMangoLeafSide">
              <image href="${REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="58" preserveAspectRatio="none" style="filter: drop-shadow(0 2px 4px rgba(0,40,10,0.35));"/>
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
            <!-- Corner Mango Leaf Bunch Anchor -->
            <use href="${isLeft ? '#utsavEfLeafBunchLeft' : '#utsavEfLeafBunchRight'}" x="${isLeft ? 0 : 44}" y="0" transform="${isLeft ? 'translate(-8, -4)' : 'translate(-36, -4)'}"/>
            <!-- 1. Vertical Hanging Kalawa Cord (BEHIND FLOWERS) -->
            <line x1="22" y1="0" x2="22" y2="400" stroke="#D32F2F" stroke-width="2.5"/>

            <!-- 2. Series Lights Wiring (BEHIND FLOWERS) -->
            ${hasLights ? `
              <path d="M 22 10 Q 8 70 22 130 Q 36 190 22 250 Q 8 310 22 370" stroke="#0D2B17" stroke-width="1.8" fill="none" opacity="0.95"/>
              <path d="M 22 12 Q 10 72 22 132 Q 34 192 22 252 Q 10 312 22 372" stroke="#1B4D2E" stroke-width="1.2" fill="none" opacity="0.8"/>
            ` : ""}

            <!-- 3. Mango Leaves (BEHIND FLOWERS) -->
            <use href="#utsavEfMangoLeafSide" x="22" y="68" transform="rotate(-35 22 68)"/>
            <use href="#utsavEfMangoLeafSide" x="22" y="158" transform="rotate(35 22 158)"/>
            <use href="#utsavEfMangoLeafSide" x="22" y="248" transform="rotate(-35 22 248)"/>

            <!-- 4. Series Lights Bulbs -->
            ${hasLights ? sideBulbs : ""}

            <!-- 5. Real Cutout Flowers (ON TOP of thread and wiring) -->
            ${[16, 46, 76, 106, 136, 166, 196, 226, 256, 286, 316, 346, 374, 392].map((y, i) => `
              <use href="${getFlowerHref(garlandStyle, i)}" x="22" y="${y}"/>
            `).join('')}

            <!-- 6. Brass Bell Finial -->
            <use href="#utsavEfBrassBellSide" x="22" y="406"/>
          </svg>
        `;
      }

      if (garlandLayout === "top_and_sides" || garlandLayout === "top_only") {
        const topGarland = document.createElement("div");
        topGarland.id = "utsav-top-garland";
        topGarland.style.cssText = "position: relative; width: 100%; height: 0 !important; overflow: visible !important; z-index: 12 !important; pointer-events: none !important; display: block; background: transparent !important;";
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
        getOverlayHost().appendChild(leftGarland);

        const rightGarland = document.createElement("div");
        rightGarland.id = "utsav-garland-right";
        rightGarland.className = "utsav-side-garland";
        rightGarland.innerHTML = getEfSideSVG(festivalId, false);
        getOverlayHost().appendChild(rightGarland);
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
          leftEl.style.zIndex = "12";
          leftEl.style.pointerEvents = "none";
          leftEl.style.top = (isSticky ? (topEl ? topEl.style.top : dockTop + "px") : (dockTop + "px"));
        }
        if (rightEl) {
          rightEl.style.position = isSticky ? "fixed" : "absolute";
          rightEl.style.zIndex = "12";
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

      function getEfCornerSVG(festId, width, motifChoice) {
        const fest = (festId || "").toLowerCase();
        const motif = (motifChoice || cornerMotif || "").toLowerCase();

        // 1. Halloween Motifs
        if (fest.includes("halloween")) {
          if (motif === "ghost") {
            return `
              <svg width="${width}" height="${Math.round(width * 1.05)}" viewBox="0 0 60 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(224, 231, 255, 0.85));">
                <circle cx="30" cy="30" r="22" fill="rgba(199, 210, 254, 0.35)"/>
                <path d="M 16 34 C 16 16 44 16 44 34 C 44 48 38 52 35 48 C 32 44 28 54 24 48 C 20 44 16 52 16 34 Z" fill="#F1F5F9"/>
                <ellipse cx="24" cy="28" rx="3.5" ry="4.5" fill="#0F172A"/>
                <ellipse cx="36" cy="28" rx="3.5" ry="4.5" fill="#0F172A"/>
                <ellipse cx="30" cy="38" rx="4" ry="6" fill="#0F172A"/>
                <circle cx="25" cy="26" r="1.2" fill="#FFFFFF"/>
                <circle cx="37" cy="26" r="1.2" fill="#FFFFFF"/>
              </svg>
            `;
          }
          if (motif === "bat") {
            return `
              <svg width="${width}" height="${Math.round(width * 0.7)}" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.75));">
                <circle cx="35" cy="25" r="18" fill="rgba(147, 51, 234, 0.3)"/>
                <path d="M 35 18 Q 42 6 56 10 Q 50 20 62 26 Q 48 28 42 38 Q 38 28 35 30 Q 32 28 28 38 Q 22 28 8 26 Q 20 20 14 10 Q 28 6 35 18 Z" fill="#18181B"/>
                <circle cx="32" cy="22" r="1.5" fill="#EF4444"/>
                <circle cx="38" cy="22" r="1.5" fill="#EF4444"/>
              </svg>
            `;
          }
          if (motif === "witch_hat") {
            return `
              <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(147, 51, 234, 0.8));">
                <circle cx="30" cy="32" r="20" fill="rgba(147, 51, 234, 0.35)"/>
                <ellipse cx="30" cy="46" rx="26" ry="6" fill="#18181B"/>
                <path d="M 18 45 L 29 12 Q 33 6 42 8 Q 36 18 35 24 L 42 45 Z" fill="#27272A"/>
                <path d="M 20 42 Q 30 40 40 42 L 41 45 Q 30 43 19 45 Z" fill="#9333EA"/>
                <rect x="27" y="40.5" width="6" height="5" rx="1" fill="#FBBF24"/>
              </svg>
            `;
          }
          if (motif === "skull") {
            return `
              <svg width="${width}" height="${Math.round(width * 1.05)}" viewBox="0 0 60 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.75));">
                <circle cx="30" cy="30" r="22" fill="rgba(251, 191, 36, 0.3)"/>
                <path d="M 16 26 C 16 12 44 12 44 26 C 44 34 40 40 37 42 L 37 50 L 23 50 L 23 42 C 20 40 16 34 16 26 Z" fill="#F4F4F5"/>
                <circle cx="23" cy="26" r="5" fill="#18181B"/>
                <circle cx="37" cy="26" r="5" fill="#18181B"/>
                <polygon points="30,32 27,38 33,38" fill="#18181B"/>
                <line x1="26" y1="45" x2="26" y2="49" stroke="#18181B" stroke-width="1.5"/>
                <line x1="30" y1="45" x2="30" y2="49" stroke="#18181B" stroke-width="1.5"/>
                <line x1="34" y1="45" x2="34" y2="49" stroke="#18181B" stroke-width="1.5"/>
              </svg>
            `;
          }
          // Default: Carved Jack-o'-Lantern
          return `
            <svg width="${width}" height="${Math.round(width * 0.92)}" viewBox="0 0 70 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(255, 117, 24, 0.75));">
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

        // 2. Christmas Motifs
        if (fest.includes("christmas")) {
          if (motif === "wreath") {
            return `
              <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(46, 125, 50, 0.75));">
                <circle cx="30" cy="30" r="22" fill="none" stroke="#2E7D32" stroke-width="8" stroke-dasharray="6 3"/>
                <circle cx="30" cy="30" r="14" fill="none" stroke="#1B5E20" stroke-width="3"/>
                <circle cx="22" cy="18" r="2.5" fill="#D32F2F"/>
                <circle cx="38" cy="20" r="2.5" fill="#FFD700"/>
                <circle cx="42" cy="34" r="2.5" fill="#D32F2F"/>
                <circle cx="18" cy="36" r="2.5" fill="#FFD700"/>
                <path d="M 25 44 C 20 48 23 54 27 52 L 30 46 L 33 52 C 37 54 40 48 35 44 Z" fill="#D32F2F"/>
                <circle cx="30" cy="45" r="3" fill="#B71C1C"/>
              </svg>
            `;
          }
          if (motif === "jingle_bell") {
            return `
              <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 14px rgba(255, 215, 0, 0.8));">
                <circle cx="30" cy="30" r="20" fill="rgba(255, 215, 0, 0.35)"/>
                <path d="M 20 38 C 20 20 40 20 40 38 Z" fill="#FFD700"/>
                <rect x="17" y="38" width="26" height="5" rx="2" fill="#FFA000"/>
                <circle cx="30" cy="46" r="3.5" fill="#FF8F00"/>
                <path d="M 24 18 C 24 14 36 14 36 18 Z" fill="#D32F2F"/>
              </svg>
            `;
          }
          if (motif === "tree") {
            return `
              <svg width="${width}" height="${Math.round(width * 1.1)}" viewBox="0 0 60 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(46, 125, 50, 0.7));">
                <polygon points="30,8 18,24 42,24" fill="#2E7D32"/>
                <polygon points="30,18 14,36 46,36" fill="#1B5E20"/>
                <polygon points="30,28 10,50 50,50" fill="#0D3B13"/>
                <rect x="26" y="50" width="8" height="8" fill="#5D4037"/>
                <circle cx="30" cy="8" r="3" fill="#FFD700"/>
                <circle cx="24" cy="30" r="2" fill="#D32F2F"/>
                <circle cx="36" cy="42" r="2" fill="#FFD700"/>
              </svg>
            `;
          }
          if (motif === "candy_cane") {
            return `
              <svg width="${width}" height="${Math.round(width * 1.1)}" viewBox="0 0 60 65" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(211, 47, 47, 0.7));">
                <path d="M 36 54 L 36 24 C 36 12 20 12 20 22 L 20 26" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>
                <path d="M 36 54 L 36 24 C 36 12 20 12 20 22 L 20 26" stroke="#D32F2F" stroke-width="8" stroke-dasharray="5 5" stroke-linecap="round" fill="none"/>
              </svg>
            `;
          }
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));">
              <polygon points="30,4 37,21 56,21 41,33 47,52 30,40 13,52 19,33 4,21 23,21" fill="#FFD700"/>
              <polygon points="30,12 35,23 47,23 37,30 41,42 30,35 19,42 23,30 13,23 25,23" fill="#FFFDE7"/>
              <circle cx="30" cy="30" r="14" fill="rgba(255, 215, 0, 0.3)"/>
            </svg>
          `;
        }

        // 3. Valentine's Day Motifs
        if (fest.includes("valentines")) {
          if (motif === "rose") {
            return `
              <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(225, 29, 72, 0.75));">
                <circle cx="30" cy="30" r="20" fill="rgba(225, 29, 72, 0.3)"/>
                <circle cx="30" cy="28" r="14" fill="#E11D48"/>
                <path d="M 30 16 C 24 18 24 28 30 34 C 36 28 36 18 30 16 Z" fill="#BE123C"/>
                <path d="M 24 22 Q 30 26 36 22" stroke="#FFF" stroke-width="1" fill="none" opacity="0.6"/>
                <path d="M 30 42 L 30 52 M 30 46 Q 38 44 40 48" stroke="#15803D" stroke-width="2" fill="none"/>
              </svg>
            `;
          }
          if (motif === "cupid") {
            return `
              <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.65));">
                <path d="M 16 12 Q 38 30 16 48" stroke="#F43F5E" stroke-width="3" fill="none"/>
                <line x1="16" y1="12" x2="16" y2="48" stroke="#FDA4AF" stroke-width="1"/>
                <line x1="12" y1="30" x2="44" y2="30" stroke="#E11D48" stroke-width="2.5"/>
                <path d="M 44 30 C 44 26 50 24 52 28 C 54 24 60 26 60 30 C 60 36 52 40 52 40 C 52 40 44 36 44 30 Z" fill="#E11D48" transform="scale(0.7) translate(18, 5)"/>
              </svg>
            `;
          }
          return `
            <svg width="${width}" height="${width}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(233, 30, 99, 0.7));">
              <circle cx="30" cy="30" r="18" fill="rgba(233, 30, 99, 0.35)"/>
              <path d="M 30 16 C 26 8 14 10 14 22 C 14 34 30 46 30 46 C 30 46 46 34 46 22 C 46 10 34 8 30 16 Z" fill="#E91E63"/>
              <path d="M 30 20 C 27 14 18 15 18 24 C 18 32 30 41 30 41 C 30 41 42 32 42 24 C 42 15 33 14 30 20 Z" fill="#FF4081"/>
            </svg>
          `;
        }

        // 4. Lunar New Year Motifs
        if (fest.includes("lunar") || fest.includes("chinese")) {
          if (motif === "sycee") {
            return `
              <svg width="${width}" height="${Math.round(width * 0.85)}" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.85));">
                <ellipse cx="30" cy="20" rx="14" ry="7" fill="#FFE082"/>
                <path d="M 10 22 C 16 38 44 38 50 22 C 56 16 48 10 42 16 C 36 12 24 12 18 16 C 12 10 4 16 10 22 Z" fill="#FFD700"/>
                <ellipse cx="30" cy="20" rx="9" ry="4" fill="#FFC107"/>
              </svg>
            `;
          }
          if (motif === "hongbao") {
            return `
              <svg width="${width}" height="${Math.round(width * 1.15)}" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.75));">
                <rect x="8" y="8" width="34" height="46" rx="4" fill="#DC2626"/>
                <path d="M 8 8 Q 25 24 42 8" fill="#B91C1C"/>
                <circle cx="25" cy="26" r="7" fill="#FBBF24"/>
                <text x="25" y="30" font-size="8" font-weight="bold" fill="#B91C1C" text-anchor="middle">福</text>
              </svg>
            `;
          }
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
        decor.style.cssText = "position: fixed !important; display: block !important; width: " + sizePx + "px !important; height: auto !important; pointer-events: auto !important; cursor: pointer !important; z-index: 2147483640 !important; filter: drop-shadow(0 4px 16px var(--utsav-glow, rgba(255, 117, 24, 0.75))); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);";
        Object.assign(decor.style, coords);
        decor.innerHTML = getEfCornerSVG(festivalId, sizePx, cornerMotif);
        decor.addEventListener("click", triggerBlessing);
        decor.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerBlessing(e);
          }
        });
        decorContainer.appendChild(decor);
      }

      const pos = (diyaPosition || "bottom_corners").toLowerCase();
      if (pos === "bottom_corners" || pos === "bottom_left") {
        attachCornerDecor({ bottom: diyaMarginY + "px", left: diyaMarginX + "px" });
      }
      if (pos === "bottom_corners" || pos === "bottom_right") {
        attachCornerDecor({ bottom: diyaMarginY + "px", right: diyaMarginX + "px" });
      }

      getOverlayHost().appendChild(decorContainer);
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

      // Ambient Spectral Wisps & Twilight Mist (Non-particle fluid atmospheric feel)
      for (let i = 0; i < 8; i++) {
        const wisp = document.createElement("div");
        const w = (i % 3) * 12 + 28;
        const h = (i % 2) * 6 + 14;
        wisp.style.cssText = "position: absolute; left: " + ((i * 21 + 11) % 86 + 7) + "%; top: " + ((i * 23 + 15) % 80 + 10) + "%; width: " + w + "px; height: " + h + "px; border-radius: 50%; background: " + (i % 2 === 0 ? "radial-gradient(ellipse, rgba(255, 117, 24, 0.4) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(170, 0, 255, 0.3) 0%, transparent 70%)") + "; filter: blur(3px); animation: utsavEeriePulse " + ((i % 3) + 4) + "s ease-in-out infinite alternate; pointer-events: none;";
        ghostContainer.appendChild(wisp);
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
      }, 500);
    })();
  }

  // ─── BOOTSTRAPPER: Cloud Fetch + Local Config Merge (DOM Safe) ─────────────
  function bootstrapper() {
    if (window.__UTSAV_SNIPPET_ACTIVE__) {
      return;
    }
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
