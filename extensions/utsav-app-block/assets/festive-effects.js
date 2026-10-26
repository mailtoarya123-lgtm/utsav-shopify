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
    const cornerMotif = (config.cornerMotif && config.cornerMotif !== "default") ? config.cornerMotif : (config.diyaStyle && config.diyaStyle !== "default" ? config.diyaStyle : "marigold_urli");
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
      "real_mango_leaf": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAABQCAMAAAA9SeWxAAADAFBMVEVMaXFLiR+QuGVlkCFRkB75+vfs8unr/9dwiiP1+fNNhRtijx5Heheeu0R3nDldjRxVhByOu4R8qFZ5pERYkR9MhBRolyFGZBeTszNXixxjlyqJtXtyoE9aiDvKyR/09u13pCXx/O5ekyCWtC1Wgi5ym1Bmlilnk0xklB5ekxpUhiA6XQ9jkxpyoylQgBNbkyNOfCFCbhqWwICgxXuPsDZSixtVkh13piFMeg9/iR+NtCWIsCNEdRlsnzdzoSNaiRaqzFyYxZlJdxmHtXpciieNuDtbliKCsWSMuGVWjhrf2izCxiyLkBd+iTiKtXpDehJ9qWprnBqdw1udwVCOu3ugmh9JeSRikC3QvBR6qV5qlTe0z3ybw4Zjk0auz5BajixQfxlKhxs6cBlCexlFfhxJhBk/dBc7bRU5ahk2bBVGgRlBfxg7chVJgx9Ogh5KeCdPfR4wZBQ1ZhU+eBdKhxlJfhlQih0/dhtBbyI7bB5YkCBelCEvXRREdCglVBBNiRlTjhxJfx1MehpilCVWiC+MuIlWlB9ajhxsoSVFeBksWhQpXBFsmS4fUQ1OjhpWiRxelx5lnR81aBlKex1JdhtPgRZEeR9aiSZXhTiHtIZPhxlbkiFFdBxfmyNNgyVhjChHfCJokStsmDxclydcjUhXiRVYiECArnt4pnJrmltCdxc7dxValyBDcBlXjiRUhCspVxBNfCNViiJllB9ciRtfjk19ojC2xCxBcBZxoCFejCKdyZtzozhPfC6YwoWQvY6gu0yBrVuAq2N0o2dvnWRRhR1VghxgkDWCrSdOfydUgjKYtT6UtUan06QoYRGEsGxnljRlk1WhujiIs119rG6pyIJpl1I/cxx1pyNDch9klz5chSWOuHRmlUdgjz9nnTSRuW+eypCduURJehRIezWBqkx2my6fszCgwXCYuWBRgCNfkBqFpjiQr0CWwpJOgD1jkUaszY+Uv3ySqjSryW1YjFWMrlBTh0xgk15omkptpUGpwUdzoVzb1SPA35uku0A6APldAAAA73RSTlMA/gQh/gsJAQIG/hKcIj2OMP79/e9B/gtJXcP+/v7+G2cSnAwqn1b+reb8UXeb7rtuso5ML9rWu4Bnm9DG7OrMFv7kqt950ORa9mit+Mra9Ibc5JXMy8Pd+8rSutq0XNj57P///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v/////////////////////////////////+//7//////////////rgPytEAAAAJcEhZcwAAA+gAAAPoAbV7UmsAAAclSURBVEjHdZZ1VFtZHsdvQiB5uLRQKNB26jrTdnfcd2ZnVmdWZtZ3z3kv7h7iCQmSkBRIkFDc3d2KFC1OKZS629RtZOXsDdAC3e495/3xzuf9vvf3u/e+3/cCsDCIRPiAX/wckBZeEVfwwiCBt375Fvzk5YMEdv+KCEhEgGxwewn0/mqzE7pCSCSu0EAQgAfr/ujlnJWIEJ1wmSJQCf+Xf+8gkUiA+OLErggJHPhPeKIPDP2fZF0RcHDsQXhhYTAguSGrGdEVePx17ER48uV9vs4PVw1kEzhw8eKJ8MLLyR8EIfgXIPj84fquB+HfNCQf9iGSnuktlbjls+LitBPN7EhIt4Hn1FkQsuFPMzO9Zx43M9iXd8X/2OM5XQjc2uvfMwEjTWxMvyvdZwUkAV9//6OlfcUnmusbJBKJdo3vMiWCrUeOHi0tLXl8fTy+PpnpHv3K8qzA+8iD4pIZ/+OPr2uEemU85dAaF4BfXEQi+MnYXb8Lx/1Lb1zX2GQcRbo2+tmsMLDL7+HD9X0FBTemVXQqh6NQHnqWMAy8eORuVMnsuScXpsdRNgdH0RkIwQsQ1u93sb0rqrhv+9TN5nKGLIsp1lblvx7kpHjw5dhH7XejJo5fvdrd3FqP5UCoVVSshZAEgn491v4RzKdn9tsbj8YbAtsw5mGpLtNZDR54t7d3nbmwvqS0qOjGIw0jx/ANhanVVbzu4VQ90L7+zJG0tJK+2e9uPtLQUlLI6TqxjlCxDSaE/z1kXWlRkE51X7cKqSIRBmshRL8KoUvoRFdUVFRace/VgEvNhTlXUjAy1q/UOVcJvNbjB1nxxNOA+09uDl2+lj03R9ZTtEoCwReAv/lByZnjPd/Lrnx385pV3tBApSa7i6XK6LUg6LOZEqgYWppFLnry9Jo1Qm6KLyujiClSCD0Cvi8I7Smdmq06O/vt0yZNxDyNOsAlu0sJ0cHAt6ouL7Tx6NR2uKEFl5qsEShVhnJ3UQiEimCwrSMvrLGoYKqvpDdgcnqaLbehMhlKgflk7gE+HY2NRUUFjdsDLJ337jRZcmk2mUzEkioJmTvAjvNFRY6CxjyLUa2+133anHdNwhBhTLHOkBkCQk51Ou4V5GXz1BG8e6PZ1ohTHckoi4ITp1f8FPy5OqzRkVurnp/n8dSjuVZhVrUhvhzuGg7CPww7zlp4nTBumGe7kzsuR8kcJ8Xh8kPAJw5H6jG1ep7XeSyCPpItoLMxrj4mHgrD8/mJMa9znme/1ek4dzr1n6kCVETW93MMMSxx/jbwsdF4rDKj2jiYe5qu7jYIUBlZr5dmGRTMHw6CrwcddntSdW7bvNl8pXvIICnHmBSmnmvQ/vB34Gk8xhtObauVx1lVVy7dgodEjGEYmVOnzP8c7B928LLbMuTCGo1KPsIzo9zWGJGI6Z7FPX8Q7K8Nyx3gR1bSzWYhf5qnEaDkwHpMwiXrJ73A/nN5qbTIBjtdzudzR6przDaMkx4ogcL/2Ay2TmzntVRGmuwDdI18dDhOSJ/TcxSBTBYBHrCtPYMZlZWV/CSVtUbdbWEzUBmm1eqULMIOeL5Sa5My7AMZZpiQ+naqpU0kokh1FKkify8Au5OSKvl8Ot1cY1bJbwvU/h0UsULLZEnzPwVgS2VGkt1Gj7CpVHHVl+SC+6EdUhaHxeJkrgPA42M+n8GIiBCo6EmTI3RhivFsAEWEYbj3PgTA7d3+JBrNZhMktZgdd9h0NMdxqkMkYhH2Ov9Pz/wMWguNHim0qs6OslE0Zdg4WFXOIqyD/xgIPm9qocoiVVaN/P5IIRtNycnKqnNnrXH2bMTlPX0ZNVKg0Qhz7t92t3DZZD2ZXCV+1anqRgqp0g8w4mpUNDSsKU7dm1dO5nDcD21cgMBTsStSGKcSMuRhTTVx/3poYHFwuJ/9aLFfvJZYR6XRGHS0drJpnF536nw6jkAIQRabosuafhqNyjZFosamMowplabrcNELqgCagieXxmZL7ALBoIUB2wGBoDi002uxuZHAWhN1Tg8ZOpkbR7akE6KVCa8gyFKzJb0ronJRoVBuzBbIqmIzKxLqvcGSB+DBmxR9GYOG0qstMkya2ZqQuBcgz/v02sN8aguVZjvN1acnJCZm7vTasIn4rBd77IxPlkj0puwMRkJsYmLsRrDJFSw5Ggm8kXhYGpOK3jKlKGNjY9/Ar+j/eLBxSGHoT0GzuZTE2JMn4X64Epf7/+Z3Wtu4vLlUvS4hduht6K/LEIa+PRRTV4vyGZji5DubVxs6CaxrLTTUkfm0spj3nSuOuK2E+A9iLPUmPrVsn/fCViGrrHxPfWBMWa2IunthaTYhyz5HxAOX91tj7LWY52IRCHH1LeB3owZ77Re+K+1vuRqv38bauZ7QpF5yu8CDT08m79sCSKtvD0u6bh/+pvDNl4kuuv2eBpf/A+GaBPm4vHCn+S8SNwF0dOPcdgAAAABJRU5ErkJggg==",
      "real_mango_leaf_1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAABQCAMAAAA9SeWxAAADAFBMVEVMaXFLiR+QuGVlkCFRkB75+vfs8unr/9dwiiP1+fNNhRtijx5Heheeu0R3nDldjRxVhByOu4R8qFZ5pERYkR9MhBRolyFGZBeTszNXixxjlyqJtXtyoE9aiDvKyR/09u13pCXx/O5ekyCWtC1Wgi5ym1Bmlilnk0xklB5ekxpUhiA6XQ9jkxpyoylQgBNbkyNOfCFCbhqWwICgxXuPsDZSixtVkh13piFMeg9/iR+NtCWIsCNEdRlsnzdzoSNaiRaqzFyYxZlJdxmHtXpciieNuDtbliKCsWSMuGVWjhrf2izCxiyLkBd+iTiKtXpDehJ9qWprnBqdw1udwVCOu3ugmh9JeSRikC3QvBR6qV5qlTe0z3ybw4Zjk0auz5BajixQfxlKhxs6cBlCexlFfhxJhBk/dBc7bRU5ahk2bBVGgRlBfxg7chVJgx9Ogh5KeCdPfR4wZBQ1ZhU+eBdKhxlJfhlQih0/dhtBbyI7bB5YkCBelCEvXRREdCglVBBNiRlTjhxJfx1MehpilCVWiC+MuIlWlB9ajhxsoSVFeBksWhQpXBFsmS4fUQ1OjhpWiRxelx5lnR81aBlKex1JdhtPgRZEeR9aiSZXhTiHtIZPhxlbkiFFdBxfmyNNgyVhjChHfCJokStsmDxclydcjUhXiRVYiECArnt4pnJrmltCdxc7dxValyBDcBlXjiRUhCspVxBNfCNViiJllB9ciRtfjk19ojC2xCxBcBZxoCFejCKdyZtzozhPfC6YwoWQvY6gu0yBrVuAq2N0o2dvnWRRhR1VghxgkDWCrSdOfydUgjKYtT6UtUan06QoYRGEsGxnljRlk1WhujiIs119rG6pyIJpl1I/cxx1pyNDch9klz5chSWOuHRmlUdgjz9nnTSRuW+eypCduURJehRIezWBqkx2my6fszCgwXCYuWBRgCNfkBqFpjiQr0CWwpJOgD1jkUaszY+Uv3ySqjSryW1YjFWMrlBTh0xgk15omkptpUGpwUdzoVzb1SPA35uku0A6APldAAAA73RSTlMA/gQh/gsJAQIG/hKcIj2OMP79/e9B/gtJXcP+/v7+G2cSnAwqn1b+reb8UXeb7rtuso5ML9rWu4Bnm9DG7OrMFv7kqt950ORa9mit+Mra9Ibc5JXMy8Pd+8rSutq0XNj57P///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v/////////////////////////////////+//7//////////////rgPytEAAAAJcEhZcwAAA+gAAAPoAbV7UmsAAAclSURBVEjHdZZ1VFtZHsdvQiB5uLRQKNB26jrTdnfcd2ZnVmdWZtZ3z3kv7h7iCQmSkBRIkFDc3d2KFC1OKZS629RtZOXsDdAC3e495/3xzuf9vvf3u/e+3/cCsDCIRPiAX/wckBZeEVfwwiCBt375Fvzk5YMEdv+KCEhEgGxwewn0/mqzE7pCSCSu0EAQgAfr/ujlnJWIEJ1wmSJQCf+Xf+8gkUiA+OLErggJHPhPeKIPDP2fZF0RcHDsQXhhYTAguSGrGdEVePx17ER48uV9vs4PVw1kEzhw8eKJ8MLLyR8EIfgXIPj84fquB+HfNCQf9iGSnuktlbjls+LitBPN7EhIt4Hn1FkQsuFPMzO9Zx43M9iXd8X/2OM5XQjc2uvfMwEjTWxMvyvdZwUkAV9//6OlfcUnmusbJBKJdo3vMiWCrUeOHi0tLXl8fTy+PpnpHv3K8qzA+8iD4pIZ/+OPr2uEemU85dAaF4BfXEQi+MnYXb8Lx/1Lb1zX2GQcRbo2+tmsMLDL7+HD9X0FBTemVXQqh6NQHnqWMAy8eORuVMnsuScXpsdRNgdH0RkIwQsQ1u93sb0rqrhv+9TN5nKGLIsp1lblvx7kpHjw5dhH7XejJo5fvdrd3FqP5UCoVVSshZAEgn491v4RzKdn9tsbj8YbAtsw5mGpLtNZDR54t7d3nbmwvqS0qOjGIw0jx/ANhanVVbzu4VQ90L7+zJG0tJK+2e9uPtLQUlLI6TqxjlCxDSaE/z1kXWlRkE51X7cKqSIRBmshRL8KoUvoRFdUVFRace/VgEvNhTlXUjAy1q/UOVcJvNbjB1nxxNOA+09uDl2+lj03R9ZTtEoCwReAv/lByZnjPd/Lrnx385pV3tBApSa7i6XK6LUg6LOZEqgYWppFLnry9Jo1Qm6KLyujiClSCD0Cvi8I7Smdmq06O/vt0yZNxDyNOsAlu0sJ0cHAt6ouL7Tx6NR2uKEFl5qsEShVhnJ3UQiEimCwrSMvrLGoYKqvpDdgcnqaLbehMhlKgflk7gE+HY2NRUUFjdsDLJ337jRZcmk2mUzEkioJmTvAjvNFRY6CxjyLUa2+133anHdNwhBhTLHOkBkCQk51Ou4V5GXz1BG8e6PZ1ohTHckoi4ITp1f8FPy5OqzRkVurnp/n8dSjuVZhVrUhvhzuGg7CPww7zlp4nTBumGe7kzsuR8kcJ8Xh8kPAJw5H6jG1ep7XeSyCPpItoLMxrj4mHgrD8/mJMa9znme/1ek4dzr1n6kCVETW93MMMSxx/jbwsdF4rDKj2jiYe5qu7jYIUBlZr5dmGRTMHw6CrwcddntSdW7bvNl8pXvIICnHmBSmnmvQ/vB34Gk8xhtObauVx1lVVy7dgodEjGEYmVOnzP8c7B928LLbMuTCGo1KPsIzo9zWGJGI6Z7FPX8Q7K8Nyx3gR1bSzWYhf5qnEaDkwHpMwiXrJ73A/nN5qbTIBjtdzudzR6przDaMkx4ogcL/2Ay2TmzntVRGmuwDdI18dDhOSJ/TcxSBTBYBHrCtPYMZlZWV/CSVtUbdbWEzUBmm1eqULMIOeL5Sa5My7AMZZpiQ+naqpU0kokh1FKkify8Au5OSKvl8Ot1cY1bJbwvU/h0UsULLZEnzPwVgS2VGkt1Gj7CpVHHVl+SC+6EdUhaHxeJkrgPA42M+n8GIiBCo6EmTI3RhivFsAEWEYbj3PgTA7d3+JBrNZhMktZgdd9h0NMdxqkMkYhH2Ov9Pz/wMWguNHim0qs6OslE0Zdg4WFXOIqyD/xgIPm9qocoiVVaN/P5IIRtNycnKqnNnrXH2bMTlPX0ZNVKg0Qhz7t92t3DZZD2ZXCV+1anqRgqp0g8w4mpUNDSsKU7dm1dO5nDcD21cgMBTsStSGKcSMuRhTTVx/3poYHFwuJ/9aLFfvJZYR6XRGHS0drJpnF536nw6jkAIQRabosuafhqNyjZFosamMowplabrcNELqgCagieXxmZL7ALBoIUB2wGBoDi002uxuZHAWhN1Tg8ZOpkbR7akE6KVCa8gyFKzJb0ronJRoVBuzBbIqmIzKxLqvcGSB+DBmxR9GYOG0qstMkya2ZqQuBcgz/v02sN8aguVZjvN1acnJCZm7vTasIn4rBd77IxPlkj0puwMRkJsYmLsRrDJFSw5Ggm8kXhYGpOK3jKlKGNjY9/Ar+j/eLBxSGHoT0GzuZTE2JMn4X64Epf7/+Z3Wtu4vLlUvS4hduht6K/LEIa+PRRTV4vyGZji5DubVxs6CaxrLTTUkfm0spj3nSuOuK2E+A9iLPUmPrVsn/fCViGrrHxPfWBMWa2IunthaTYhyz5HxAOX91tj7LWY52IRCHH1LeB3owZ77Re+K+1vuRqv38bauZ7QpF5yu8CDT08m79sCSKtvD0u6bh/+pvDNl4kuuv2eBpf/A+GaBPm4vHCn+S8SNwF0dOPcdgAAAABJRU5ErkJggg==",
      "real_mango_leaf_2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAABQCAMAAAAndQU/AAACqVBMVEVMaXFYnQWvz1VdjRlqqiBnmhpeow+IyT9YXAeg/3ff5KVQhRV1siplpxRnqCVvrDFDigA4hgCdylJMjwR8tThYnA5QmALd66hiog1nqApxsRRRkgdcnhWEoxPO4ZFChglcmQFnjzFZiCJXngE7ewiCuxdnmh1DjgBRkwNXmgNcmQqYxWZCgwuOwihamwo9hQKCnBmv012LtxiOtCPT6aLT5pqfwzpCgwJRhRcsdwA5eAWw1m8/hwLJ5KBVlwjE4pZJigVWmwVKkwJMjgNRmwRvtANqqQxIkAI9fwVgoQSv13lVnQLQ6ahanB2JvEqcxl9VmAljpBVboANWnAavvFvH03a9y27A0WCKpRuSqiKLnyygszmNrRB7qAltoQMzbw2bxzxKkgI6dxCEuiJysgpjqQady0KGwCZhmQBBkQGhylZ3si2q0l+x2HDM56eBuzeXxF6214dCigNrrCdwqzFoqAqTw0yw1IS7246GtzaGsENelRxHiAFJmAA1fgBhpwJWngGHulJPmgF9tUWKvkiMvlE/iQBkqg1ysR1boANYoQGEuU+At0pPlgBZpAJpqxZjpCGGvjt+uTI+kwBnqwZlqQOQwF212VdgpQpKkwKBuEKRwk+cyjpvriuHvEyIvkFusCJMigRlpAVrrgZRnwA+jgCUxFVTmgKdzEd+uCNInABEkgBsrxJ1sTZrqipbqgJ6sz9EhAeq00Oy1k5krwSQwVWPwj+EuzZ7tRSPwkd3syV+tzp4tDmPxDFzth6ZyFpzsQijzjaTw1+ZyBufymeAuA6HviqLvVpxrjei0G6p0XpcowGYxzRzuwV2rwt8tQe53mSfy2F0rj2y2Yd2uxWh0VmKvgaOvw2jzVup1VG944+mzyqIxR2Xx0ed0Vdiohtmpx13sTHO6aP+lz/7AAAAx3RSTlMA/BAF/iX+AwEBBw79/v7+/f7+/f3+0R9vwv42/olhuP1Ah+KF/Bv9Xbwv/lb+SZ9vZZu0NEMg0dP9+JF5qvniafHkfMT+ed/+sP718v3nga/p1J/TUrstU9JL1i/G9Teh9NU00ZLtwf7pcFrcxsvHr9uO/MCtvryWWRp/+////////////////////////////////v////////////7////////////////////////////////////////////////////+xCSZHwAAAAlwSFlzAAAD6AAAA+gBtXtSawAAA+VJREFUOMtdVOVfI1cUvQlDJoE4ARanpbA4XXeXsm51d3fvhyQTdyVODAIJFtzdbXe7Xve/pG+KdLLv25zfO+fcO/edC7B2WPB0PuBAPU8+RQWYkPrCM+gaBUh+jk4FcHh+B/UbAY/nQVIi8GyCCQ55LyIhqmje7kSTpO30RKD8JZxKweHEy6kJtsw9jTmUG0x4pUF3kFIHDo+lFRb8T2FCyusNDa8lb3JweKT2XVP7ls1ScXi0p7BQXLbBQYy9kkaT6dwGBzF6JN/rtkpPr3MQo4EfaaQRWWs3mIDv7RFMx3TXj5X8hyBGg0SwoDPpnGs+pMc+749OHU2ftW5SIOGbbjk6HPrDpA/63/vV/PYfphmNjv6jqB/Uh7pWIp8bnvTEpGdI1aQ9EonAMjcaauXoi+hII3n/PrVOOjdoYGdraMkIqJRs9ZrMvw4alxmc0WoE1Ij5aqJjZjGqCNA0p5FEhloib9L22lQjSp75DEB5rcAUM7f2CpcUbLs2gwWVzTRNJBLuE87KltMtV1LhoDncQXjsfYN3ogZejMiBa/cZJkY45B50DdT7MH0pfNVPwwJDv/cJ513GMXbXCSjTfDE+1DrW99PsgKpbe/8alIXjo5yAyt0ypTIouP1ZcHLSouP6ordHgvVRJdt8Fa5qcrnxeqG7RSXzhewdGVDE4PlsNpXbpowOdIsmsuB4wDfaaaxwD8XHRqaCoa/hig3rVLjm3Yv2bl7YNvUNXIzzuoNT0d5sS6udiz34Fi4ajfUhkax32kN4tJjtEnwZDGJchWvGada3t0snv4PL9sPpy4bZmQghbhKLneVw2ZvW6VOqbuivm9vMbedKoEadG8B4hgmpWNzU1paBptLOMOUqjDek8rpmeVsNwNFYmtUYHPA75eK6ZnElQLUpvTukXJqQSqVNde+VAOTwOVrGXYPfQjhP9Z8kR33Mw7irqG/RajscN99Co2ZmiLExpcuPYfbF33aQw/68KzugkPlHO8eVLR+moFFWn3LEZTK/dlwmWzlCAruFd1bnVRMeTFlx72OSknn+n1WZoopzwSo6e4h8zPTz91xLhqpGTueF8UvkM0z5bLUi+PcC4U23Yh8ggAWfrogw6zAR46s9byAAhy2WtFzrsFftrTtOJpMJOZK0P/+6RTQL6gpIE7QongizrdkE6rZ0/Wkf+INrXZA2dRWtJRWHXSsizrBDc/OdtUgxgfWJJr01m91yYDNApc204qHg2Z3roSNlu4pHfjm0GVxUSqTqwZFMSviZH/3sf5+yYXDIv12cTFkGLKC//SYk7o9Xtz+0k7ZtSwBYsDP/ISBzV8LGQaobVfwLKHVcO5Ka/bgAAAAASUVORK5CYII=",
      "real_mango_leaf_3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAABQCAMAAACksTwEAAACZFBMVEVMaXH9//38//j8/fv////+//z9//3+//pOtSpYqST////////9//10xCb6/f3I6HP////7/vkdiACHz0v///8mmwHz++qR0l5ywC5MqwIvnAGEy0iEy0FbuARWtQOAuDg4mgFBlAs3mgk8mAc/lgcwlQZ0tBuR0lGLyTyIzzOByzpHsAFNpBM6oAKg1GGGyFWMzj1WrxOp4mNIqguEzz8tkgSc10ggiwDG17BmtBAkkACFvxRAqAM6oA6J0UcieANAnxaZ1EN3wzBitCtdtxRruiczigJargya2GRisQ5drC5KshGR0VaJzE8wlQlivCE6kwSLz0uJzFA8oQsXcgAsgAE7mAk/qgOAzixYqxdfvg+FzTKCyUaBxkWZ0w0viwJzrgGBuhtWkABYpC8idAJ3sw1TtgeByzl7w0ZqwhJmuht9yDmLxRdxtjyV0zdwvT0rjAEojQeM0lGCx096xTwghAJBnwN9xUdFpQKKzlUYgAB0vz0uiwSP0ldzvh6Jz1CDy0NsvyFnvRIagwAmiAKb2mN9xkFhuQ5RtAFwwSckjwBJowYwlAJUrQiP1FJ+yDyU1F9VqAtuuxmX1mGGy1CS1FiY12eX1EpdsRhtwxuR0UlPoAuKzT6f2m+Y1lsSewBvvDEpkQAvjgB0vzh4wUFDmgQ+qgOK2UB6wCd3wjiP21BJnwqIz0Of2FaD1TSa1U8/sAFoty0VfQFisyNRpwlVpxFGnQpqyQo5kwJ4xTJ2zhpLtAM0pAJivgd9xy85pgBVqhhSvARnwAxltiCMzV5YvwOW3F43jASm3Wxluhp70Syh40TeIlHFAAAAwHRSTlMACwMJAgYMAQEDBBAO/ggFDxT+/hn+Hvp4/v3+KP7+Dv40cUIdUUenHm7+/lf8HPyR/TXv/mNP/Q+v57rf/v3+FHZkfL37naTfzPqUt8LUOe+H4Kj+/oG5uX3n9fA7y7Ol9CzTcJft1MjNua2lm+Hs+dv////////////////////////////////////////////////////+/////////////////////////////////////////////////v44DeH1AAAACXBIWXMAAAPoAAAD6AG1e1JrAAAGBUlEQVRIx6WW51vUWBTG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",
      "real_leaf_bunch_motif": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAMAAAAPdrEwAAADAFBMVEVMaXErMh8pKCwpKikuMCMqLB8pNB4CAAFYiht2qhooKyhepRYqKykoLSNSiyAnKidJZRtnshVhoB6PvW9ajyxcnRpwpiJVgBpxpTFxrChBZhNopSJmqxc+YhF1qUJxrxlvthw/YxBRcR1IdBEqKipHcBVbfih6oytlkx1OgBBprR1DaRNOiRmJsl1pmB95mjdUgBhjih9qphtFdQ1WfxxIbhJPfhKIu1ZXhR5bjB5wjTd5pjsqKiuMp0J4jzUmKSVrhDZ8py2LsEx0fDAqKiopLiVhnRdgmRplnhhAag1ThxiTozx/nydOghQrLSiiuSl9pFtfjydjhhlGdxI4Ww2Aqk1tlzN4mzJrpBtQiRRnlSx5ui07YAljjB2euEQ9bQo+bQxdiRp+pERnihBUhhMoTwpelBsqUAmiti5AeAhKeBAqPh00VAkUOQI6bA0gTAUyYgpViCcoVwdKgxkxbQs8axQrWwlGfRtXmxhBbx5AdxguXwsiUgQ1aRE/bBlXjiQ2ZgpBfBZMgB9Ffg6CrmgpYAcmUwhxokpAbxA1ZBE8cgswXhBRjhlFchVahS9oniFgqxGKtmuVwXlOdylOhCJPhxKCrmNEghVBdw1KeSNVgiZJjhAeRgQkWQZVkRItZglHcSRgli43cQ8+gA6FsW5blhKbxoI9ZRtThR5IehdQlRR5sEJGdiBnkC1IdxJZpA1dmSJ3sC1TnQ10pFNAdBEyaAs9cRaVwnB3o1hHhxWNvGNcnxI6ZhV9qWA6eQ5PfxouVxFQfiVqoCpfjDF8r1ZsmUhikTqPvHZQehsqUAxVlBxuuhdpoxY2YBWLuHSAqD2Iukd1njtkmhg4dQ9zvxhsojp6tSgzcwpmk0FnlSJLdhxqnEB4qVVclR1vlzOLr0NgkiVnnjKDtGBSfS5eiiVYfhmDslKUw16StlIXPgJbjxVajBtwnFF/tTyLxTqFuC55pl5chCJrpTB+xSN3uh+fwVFJhAucwGRDiAyPx1KbyHix12Spy25CYgyezj6bzVbL2om7AAAA9XRSTlMAEDpDBgsXAQMBMf4nHv5LIv7+/v7+/o79/lb+/Sv+/v46NG1SqkT9v/79Sv3+koFOa9+ZYIO9/bV6WsJfbDGeO+XOGmlXo9/Gt91GyMyB7Lnzzt1x5bim7+/Z/turqfPI5fT49Y3zo8n37cLw5////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////hZYQZQAAAAJcEhZcwAAA+gAAAPoAbV7UmsAABZCSURBVFjDlVkFVFvbtt0JCQnuToEKUFoodXe3W5dbua7vvf+jJCEJSXBLCO7FLWhxd9ciBVq8UFpoqXt7733v75MgSel9Y/wzOgrsnDMzz9przSUb4IDUhQNycgBZweFkVpUPATxeYWEFj8fBVdROrORmyRo4cVn84CHl2RWAk0HeiZIsSGHjgfJBFeQX7No1yLXNAguAAh4ioyU3Iffi8WD36XPI72orMAuA8yh4RTTq81VIVgWNwqqv3XZ4fVtvb1tbW6/Z+sMWGIBCq+CAggJefMHvP3D6B0gAi1bEyrzw7KWohl34AycBxoGl5iuPrjdq620z09DwU9JR8tNoe927fo3eRnX5eX4H1E+c/kkR4HGIQXGLsRXlVGRWcZALZu2lnF4Ia6yk5HdTyU/pZq69jp+fhtnr16/NzAz27bi868SJ7baXT57+909qEBktJw9kdw+H/FM8hAEyF3zPpUdfP3ujYbzKGMH0yy27aV+Wa6/k5+fX/+bas3//+w/k2m+7bjfq9+ebIBG0HA4svrAApSL7hdDK295Adm/aNPx0dBDsm2UQOPemksHrZ//5448///zzfWlRyEacAlD49qfRExBCBQUWYyuryS0CRh1+/fqaWZuGmYafn07rzZs37XPTcnVynr99/+efRVoBt7T8tYrOqMM7sd/uu74PpbxC8QvAOHDq1J75dWTLFRSAxfrea9euma3ShCb280uKzs2N9tXtHJu28W8KCGgKuNWkpeVvi0F843dLuV2n5U/tOQX/+BwZB9T2oOdcX/wxZuNRs16NVdfeaCDWgIzLenx9awdGPepdb90KSA5ogpQD9i9D7oa+sQLs/h17cI/yItY4nOK8jXCQrvq6jRuP9vZqmK7yQ/jevJmk2d4+MEDW1m70cPW/FeDv36TVJDEGBg92jT04BBQwJ3cvpozE4EGU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"
    };
    const REAL_FLOWERS = {
      orange: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACQMUbvAAAoSUlEQVR4AdV8e5hcVZXvOufUOfWu6ur3M53uvBMggURAQAmggzABnavBuQoq3ut4YbyOzigzvoPzOfcKfo4DMx8jMzCAgpiMzFyICGIkIAQwLwJ50kl3+pF+V3dV17vqPO5v7T67ctKpIHzf/ecerex99t5r773WXu99GqJ38TiO4x8eHg6+C5D/74eqQFr1YoF3Rb4v7EO7efz48cqWLVsYRuGx3vEeOG7nuUUp29+ulPMw3MJxW7du1bhNjpH9C99l+7spMYeP1+Tfu4Grjq21idHR0ZBsl2UVwK1wu+xz69UNyPaFMPyOPt5w9ZDctiqsF8adtzqW359//nmGNyRRXfjqGC+87HPnEQe6sL/mu1y4r6/Pj/pZgNwvAb112calO4fqmaMmkl4Yb92F53Wqa3G/p/2Muhf23dbdOQWXvmNYBmLkvAByc1x622W9VnutNjneW9aam7mAxbnWHLLNhdNczqlyrXfuWnXPen5eB+/v6gCrc8qNVBtQmZycjNRqr9XGcOdq984px2GsIAiXsr8WvGzbs2ePzobD1YsS5A+WDO/+/jDnuANrbgh9Ovd7EOCJDfzOGs/jztHOSPs8c5wFK/skZow4zyfbaxFA9ssx/M7ruKUggJzPWy6Aq+6l5hie0LMAs5rcFCOlLwDitirFuY6fWABldUNuXXJCdQ5u9863sL5ly5lE984p9+iFkfOh5LV4H9U9yPFyjHz3lm69ehD8vuBRmP0NbuQF+NTkSfE7/xYAiHHSiqGfJxcE8+oKF7ZKaDkH2msS6Ja7nfDMiRPx0f7D3Y886zRjN8qX/s2pIxDsXDDunqtr8DjvT/ZLeLev1mGetYaEwRyKXEDB40hEvCUPln2oS+7hRts77u3rTBjMv9EJDD58eEmDfTJ5639cn15zIVVu73z8/NDY1n/Vxl5vsv2JSDm67mWjMrzbjrQsdyLv/+4P939uaNP5ZH3lTdKeWPfY1ebc+FjzlX+1f+F6LlLKzp071auuusr09ntxOFe7Cw+KzNNBwtQ8Ue8k3jqA/CMjI2pXV1fB2/6H6hMT2ZbAybvW2bmRTyrZU9dGKke1bN0Hn0yu/pf7Wo9f82Bo9uXzyIak+0NwRXFOuoV6hcrqyrFMx91/dyqy8Zc9v736O5Hy0KcLFV/KXnLNN/b0/NNjV/UoKXdtxoMPmLlIBZKY4P/NUyWQpNjbTcuL33nnnfSd73yHOajKcV5YHrN3715tw4YNlaNHp6IFf6PWe/Rj98asvTeTViA7lyVVKZNJzVRouOZANPfLtVY6SxQPkWJEyBF8CQZQiqT5ClQIbiqao/Gx6ImHe0zHIkV1SOvtpULzlQfKxeBPd0X/6f7rCjvzyjvkGi9+3n2zisDvLKlg+ROKmRFmAP65fkHVB0Kb79ChQwbG2Js2bWIxE4oX7UKmXVhtYGAgwGPi8fUqm14r3Kh3j/33OyK+V262gKzl85PT0EqmEiGNZik68vhacyZDVMaBF0vkVHJEVhHTV4gyBTJPmWS89ctA6OgjPeUyWvNYLu6jilamYPrZtfHUf9793sxf/+VvFm0MYy9Sl+rsv7l78klfjveKn8DJ1Ze8VzSJ9tDmzZuF9eN9o00wDutaRrBKNQZgCmOwvW3btqocg2vs1atXmwy4fv16Zl/ZV+Uinufpk4t9oy98f1W4gVq6/rbTXNNFKaN4/EKVQAQlQKSBrvi/41PJLlbI4lmAOBUdcjIgSjZPSgbcxESbQueMQ+aESTa4xi4R+SIY2xgmNeTDBtAfSFMg9buuJ18R4iX3ZC1duhSTicfav3+/bOe9inaXU+QYHlhas2YN74Q6OzvLkg7Hjh0rC0qxF+pVbEwIOYiB3EfIN+o298kxXKJNnaCJQGD77XcG87u/YOvL+vPRy7fY5312Ivr7P3raoP6QozeBQ7CnuQzZMxYVplUyGjXSA9h3BTiomEZHHUzpzIFgJYcqIAqBmKqmkGra5OtCX0sc6AhcSCtnKRe4/tdfPPbkxx78awVUrf1gj6yXBCO4+5UDGU9vu3iXuPEgwVZolVQWXi/evZwhJnMnPoPbPBNZU09/6SPx8Zf/ylEnoSeGV+kjb/58NjN7wKaQ5sxa5JhT0DEKWVPgihQIkLcpl1eorgPTM4mxpAP6OXkQRqCqgG7QN2GHrJxDqk8hHzN8Pg8CYT4LW4Ret/XQ8IN7KM9qgTnfu3fsTxAGbbbcK/dzO1ZkHLkumAR1tmBV/PidHx74Th9JtOqEAnCj45t56uNfiOV3/G+bUmSVwf4VH059ihL9j6yloQk/ZXHyQJJFSQ0qICAWBnLmnE3lcSYWZsIROSBYOQ3CQA2VCygr7KeBJlkQlgWCiVLAQLZ40FuOL0qOHthxz60UvummmywvcVyk5J7d12rBeLMu1Q4fPlx1ZGWvdx6fS1EUtbkGfoW2ceNGPhlJXXEC/A6DpiT/5ra/iI7+7i6fMqra9TqpEIvKjEqVpE5KPkeWDZ3SMk8UCwTQwpCkhEqlYRAE2iyXUogZw4CI2XAeSuAgywJBQBkdqblySaESdHcQouhkga9Pg6WzSAVwSWstlyIX7/7dCFVueMoJPdC+/Qb16C+Cjl1oshvXpA8TPYTNMmmFfyO5BXsXEsPv0K3SJWDWqvpBklg4inlg2eAlFNfxMGHOOImxsTFoXMr/j8tvXaNO7PuulUqqjqqRWrBhhBzKjStUyGgw6SASWMOoA1FC6CurVE5ZZMRV8sccKoAzSuASC1yTAAEqRbyDe5hRsFUxJjsnpA/HDQKlbFIaDHLSBVI76shqfO9/Nv/09vHhD9xxsX70xTvCR6ev91sTpNgVmi5MUGTs03uV9u69tXDjNi+uTJxajyBQrQ5uA1BVubnv0pMWjqLS9XHFME/4yQpQaRDHDJ2Rz/CJQzygJ8o4J5+pUAZ6J9EBDrEsiB/m1Rzy1xOFwRGppEK5OYUiMYCjj2GYe1gxAwMqg+siQZAL+7cslbR0GX0gdGR51ll7x31Du6/9enD3vq/Uh2Z0y+/AKOpkWjoFlSkK7P/GT6ZOvP6RpiXr3gIuoEdNKWEa1BJPRnleSaNkYCFCPJHomf+nFlmr/YovnnemZ8tGwAyaUYPmBkpUAjfwAOY727KpiDI/p1Io7sD42IiywDmwUGq9Sgp7JRCvAoxSCdzj2BAvJgS2oMOrgYTCFXDIAIFMDRyKdjNbIW1xjCq9tzqzv/jx3aHB322INBSpqED34djMkkp62CK/c5T03MCq2T797u1vOJ/BSqlaRALewn1x8RZ0kDTAi+CQM+IqbvT8MO/pB+1MaZbf+cR9bOk4NOm0ks6TL2iTHtEoVq+QAcR9qsoWGiKE/NEUUXqW9aKPcmmcPjgslWRjxFwCQoJKRRCNCUOAU6CPNF2lNLtPUKG+MHQaxlbmTFLq4GzWL6fMoYEo7bp/gxEqURlJh+yUQvlZ6LKITcEuELMxCn+kTOHCqze+1370PRInxkYSQJbcx+14ROl5P9uKSSAu8RPe6TysmFjdCs8bE7DdoebmprLZfunPHF8AyrlCCsSiAAsaaQLHRKFkDYdCsFqsbJNjNsw2TLWhkgn3KwdfJweFzk60AhPOxokpr/gAB3+oAu5jMx9EeEY8L5S37Qd3dDRR+sgkpf79hxSOg2MhUpPD4LCKQ7FWEKcHp5PAD5rdzoD7CidJHXtyJQfKvGf5ADc+MWb26gO8qnVZqbrfsoGp5wKruMEQ1OZ3/JTpaQpv20ZGasc3r85s/cRt0z//7JeKpZ5MXl9WYD8vrJsUMGzi0CrcqlAj9A7rFkOH/oGaPXHQJiOkkRGAYgaxmDjsHPpBwCKIxhykQSNoUNglEEcHF4UhmlkgynwW7g5Csas0sWeEEo02lRSNpkH4ugRR/VKss6SOlAQoms+Qw7IdgKEAWZQTb92c/MIXvzfx5o4lwEOYdUQKQFWxOYRCmw/vAkeuu7RgQmj8Dw9EUVuJcXy1ePFiPlxrZnz/KnrmW3eYffs+FTbySgCWyLE1ysC6RFqL8G2gTCvQOxAh7JHiLdA1wC01QTTar9LstA+iY9J5F0HE4DyW4RBpUDoOK3Loj/oYxNIPqkGJZ6GcAyBkIqHQ0AmHFq2GO9BbT4efzpKvkKdAAuI6Z1Fru0LRTsB1xUlBCOLkp8GW0HU++GIhP80egmF4q0CxxgCle6578rlLtn3ulgsIQg/CuXi7BGGOEnqY2902IWJVvmIiyQ4u+R3EYYdfaHm7b2dTwjr46VhoXCkiZBg9kqeRY1nKTORpph8mGMTB1sAhDkVw8kUQCZxPsWaixSthyVodymQNGh5ENgOi50CM2KJBv5KNrVXYD+HzhZWC1wDOcGhiUqUAYrBQZ5jeeqVEaaxVRn9yxqZmECcMH8vXGoasIGYbnSJ73IRTitBE91PqhEapQ2U4kxrlC0WKp165dtPgbX+ifJ59cOEoohAlMwnzM+PPhBIP489mHOW8ruG6mwsWg1wvk3WO05d0Ykb2pc86wbytt/iobolKrWDrxiaHfOCcqRHEllPgEIg/u04wOuAA1CEqZVbAIEBdwqZ66InhU36EGRrGoJ23ws4DKJKFU4i1YKYBC7ErWxolZx1qXwmiHnNo6E04RUGVclD8LR0gGtY22hhXpE/GEONlLNLi0IfNcZo+Bo7dk6Uw/C8D+jDQ5KNgbMofzO/66vAd+7oBZHO0jpLX5FDEAL7sOMPLEDl3nfHm2ZmdWISYY5gwJm+SH3iZFZZNrkfKxXrKjX6MNNhspBwU9majUIo4XSMEPYKZkv3YYNRPdZ0IAzI4UegiFchCeIWjiGwP1YOlAEpjoz7q6DA5rJrnIHjIafhF0Sg4CWKXgBswMKRQezcQTRt05PdZ8ofhPMITb2tRKdoIU94OGwLFbaeLpER18rXUw0FVaPg3OSoOFqihGYq7CTCtQCBsYC0fBfTUktDQg7fd+dOLvrp69Usljt8YPzwm8GVa8MP0EHUmkKAgR/QI9TWkCjhUFp1MQdStwZST0NJ7O1VLGbfTTq8JkilAiLlEQTCJKkUw0gLyE3tMSk0GKLE0QLF2GHCwtoLgtALu0MBRCeglvFFy0qCZmQD5AmX4RzD9tkqTOShlMEkjxiThDpTgF5HfoEMgTggL1DdC8TdCfBssCrXC3EOj21jT195OFSVMIwcyNPbKNPnKFUo0zHOhDW42wa2KXyNfPTIBILBmz24KXkhbNt+4GUcoxIoVsCQUmvhM5/WyIBC3uOmOqtPkEoe7SB/fv8R58dvbC0dfi8/mNJhfEBhE8SM6Z7PtgzI14MXG2mCW4Q9NDOXoyBvYVFyn9guC1LYICFVAiDSICI6J1PEcFo0nA6RBQYPXYK0wPgaigxAmbH7/GFFPr58Gj5UpAi5tbgfj1iE3UAexQizHWkQLhmHmYzSyv0Dje4fJShUpDAKE66DgURrgRqMVhqABIU8AShtp3KK5qOC0XnZH4SXK0Y0CPcEMoub+4xJnPhPg7ZB1V9QEFblt6nf/uNx54fu/11Ij8WIRlMGUGnwXpj0Low3dbkPX8Eo+mGYN73n4OWPj4IRZcA4Qb1+hUUe3TdGQSbmkQ5NjSKOVDJou4pcyaXEbtDOmXpSw6GC/SXGIWEtEoemJArV0QtHXg8gx6JNEgJRIHFYuRGNQwOP7Zqg8W0QwC4UN4sbAJHE4q0GEMhqIqUAKjYCfyiHIZN3aJzJNn3vsmfym3958qQJeFQ+jcBaRQAPQCU6zO+hti/FMpjn4xB+/HJ7dtdSBHnA4FkKgWU5DWNiBYyUMxWmVUbLOwW8+loIHDP8mjYh9AtnBLALTGJzIzm4QEmNmU0iYxf00OqdDlVSouxF6DFZ6vKjSxcsqdOgEUUdbhdo7LMABh3CEpqdDUNZFSvYBPzinISjzYAjEYQLB4/axdYSSM1CG2qKktbVOG40Nz5gtH/h5eN03n8WRVhxODff0cG6XOI/EqRKuS6JwXT5VEZMNtUpf36Pnh/XhpVYIp5fglKdBQUAGWZchu2fDrJhzJTJhRSwQBHZAxFAVOGucYg5FFWrqUAnqiCYRYuzfi7b6ILUioxjRIDagaBTzVXI2zc7AOCw26ciwRjnYjHDQElH+QJ9BRw9CTGeQZoXmZ6IwEWDQqYj8Ux6Kcc40KILsZCSMgFaPk9W72THrlz7jW7zx2+GvXjAO3FiFsFUuMjFcXKu6hzmG27yEekcEcnKnUiYSNXYZ/jJ8DB9OSEGcA/ZBts+kCjipjODDtnF6WEDjOAwBpj+GPQAECwoRNEGwRLNFbW0ajSXL1D9q0CSSQecthShOWDQM7lkB94ED2npc/YRhBRTLoBw86YlTsIzZEjVDfAIBA+4EuA8WLAh9psOEmlkk32A5zaJFaRDZnoVDOfqQEm0M3Gx2/MtHU3+65qHM1vu/uX1vDMTZwtzjINeuuPlppkvNR1KxZqdsHBsbawq9+InXYrS/x/RHcGogAzw7J1+hCuS/ghREmXNBEDPWR4gARH6enT3OHvKPlZUDApYgPgVYqwmkOfb169Ta6qOVdRAVdhVALDjAIIpFx0dh8pDkfxFco2HiLnjUS7sVamkFh8B8++sNEMWi5JESzYwyl8FiinVh1gHK9SLIkONMJvYbbw6T3r1mb3jdjV/+VefXXv2z9cKUM4pMg6q+5QbvU4tAAsAzSHn2gBNam7vn0sSJ7z/lMyeCJXBLOatBZDTET/OxVSgOlo/AAwbHWBCxCnLOZWzOZPGDs8M3GCwQwJpMhCej0xoNTvopBi4rJiu0otuiAQSdBpCbRcqkjOjdRs5jBgm4tV0m9cAStiyDPwVH0EbyPzdQoFLGhkeOcAYcVynBi8cB6TAebMF0iKClIuyBizE3jTWgK9nKl3ou2f/Cxl3X9D1B6S1bhIPIx1c164y3FDVR539cmRNV/sf7oI8noE/9gIJ3J67eGZ14cUMaztjcDCJsxGDzXANLAZOv+zlNwVKF00QQakRxcxFG6gGiwtlCjuARoVC6ACVfQZyEtr6kSsuQcZyYzlMPdFJ/2k8zOYveB6t3AimSwbECXbnCofNXwYVoRKyFvdhQzjYMAqZFIIygFhkYDodhs0jDPpQADgpKW8WBsY6yodsIoqdqJmX9H5wqXPKNT7Ysv+I5xovxA0GEHnLpwEtImsxHrpJiLjF4AJYW8QrHYc424LxkA5J6pT/6VSl5bL1jTXBWU/gnTBQdpx6EiWW/QwtDRhAHleH85ZCfyUyB/aGnmHABxGfLICa2qdHhwzaNwBm8cLFOOnTa8XSYilDYFy5VaTrro18eKVILiLumW8fxlpFPAjeCDX1YjzMCwWbEaAhYfUEO3nDqIvWMuIszdfIHXeiAC5UQcuUIR2beQEB96vkmxYnevGfUeXlDu5Ln8GJ8fFxvaWkRWVLUQ6jnmSb8HRRf+3DMAXTFI1mNzZ4wfTzwZC7XfFn/f/tR+Y1fb0rOZJUQNtbUjvgmaiF7B42kwY0v6zQHRzA/hGT6LE4UGfhwg0qN3T4KdwVEot6EuIwfhoN4zESMVKb3rsaNGdLbGWQBF0UrdHjYojlE6C3IO79nkU5vDFWoDZ768uXQPYuQSUR+ie/K8hkVoYpK2VwZUTTiv4hB8VaD6hGXheGZ+w2sr/HVEFAoQxFpFRrar9DkfhgJ+GHqrNqz/Q0KAHdmAAi/+AnOkcRxmSXHVow1ubrgvh10mWc7/mbHOPaEUTi26yNGccaIRHQqzUHEwHwZ6KAy4qVCEvKfzYHl2JmD17sIsdKyMBmdUOhwEitIk5583aSJA3DojBL1rkKKAhH+7IRCo1NlermvTF0xZAVx+HvGkdCfLFAzdNOVqyBOSBoVKwF8yKBTCASPwVmMZEpUP1OEbnFodrJMs+M5OvmWQm/B1Ks6iITblebeMDV2IfZCsFrOF8iBd96+QqfxIbhTYwdXfuGKn7QQ3YKkrrjbRSEeVifiDo3fmDlqKWkhl+gXFOVBz51w4uc9ddlr9YU9K0rwc1ITuAGDP8NixsEoZwDDSFpFEA6El8BadMQQo0WQIi3S0O4sjezOwG8qU+9KRPSLoRegS8DzULQOTYMT+gZ9SK+qdGoO3ICsQxA6BXkVWtEDzgGSBbgEvngMF4fABmY/tixGIfg65nSaykh/FGdMykMfZhFZsTJGuggizrkqtreI6Vg+cN71DXBRIHZ1y9dS4PKPbeq46is7YOrLzBySIFzKB1zEmZgzH25k7uESPdAuVDhwmPQNqy+a8h3bs6IMnyQOQtRBxJgx+YZTR6zkRwZRbQmR5W+gwqyPhnYkwdYZCkB/LF1B1NQNmiB8UDvigIEeSs5RCEFpC8SjPlGhUxM4eZxuANLOaZKlq8ApCBU0ZA4ibSGa7cuSGaqnusYindoxi5RGPbWvi8LhNHA/n6EYXA2+cmJvnvNMNtYoYK9ZTszxpQCEKQV/rRHxXLithayOK4u41xPEYSY4kwrzb9x+FoHQJcw8d+IpcpQ/NUWzVrR+l9rZfgWsqpBphe+H4WiorKrqwiBMK1yORblTz/c1D+yZgnnP07IVCCt6oVQhFnyfpXZ1kFWA0zhyCvEZwhA/OK1coPhyP1Wgy2YmbVrSC90G7znQ4Sc/fB9Hj1E5WaS6ZQGaPTBF0/l66rnKpum9o3T8F0GK9waobSmsJt8lcPAM57ECdWtjHRb3GLiGUWJVND2C1Aliw8L04AG9MHGUzTyYh8VKEAj4VusMhIfvcM98uNHb0tzcjC+2lPJY376HM6XDN0TVN1cxu5IDfo+GkGZoTVnxtU8rLR/cf/JnP7ll4KXp5joo3GWXIe5CRlBBdlFpjZLS0YgoHZH7wREQDPF7pIXMqRIFYogmG5FLHp+jpoYMNS7XRV66rCLzlkhglwH4RvjY4a1BaliGlMibk3Qi1Ui9lyeofnGahveU6Cj+OqJtXQJ5ashSFt8ggVs4c8CefQDWNcDRfwVKPVWmaFcv+a/94e0d66455eLJxGFuYIp4cRdEq6mDJIEAxFQUA7lt5MhrDbH09h/4lcGQ6mRPlGKXa07rdT/xJw/ohx64Z/vk7t3tnd0OdfZAlJAt1DgNAmWptESQVUS8tC9NYTtN+spmKsIX0hCqaE0gTryexp/pR06rROHV9Qgj4OTlIRfN7aQaSFXgeyJ75Djl35qCL6TT2P4iZY0G6r0MnGbOUoqzjX0alaCkEj0GNXUhTAnCAwdj2EgDWyDY8BFwMVyP6JoLn/Ld9NItoH2GCbIQR4m7LAWBvIO4zp2SMN6+eSBxK4AxHIzBz/n9j97f99j9T6SPHGnoXeWjRBNbVjh18Hn8S6BM6gJIt/op+SZuONKTSLwHyEw0UmVgkgJdIeglEAvEG3vyKHWuhALvbMI9WACfvyCFGqgjNYxwnSCeQLR85BAh/U5RI0tDe8pUDMapey2CXWQusojVJgaQqYQY5UAIFT4Ue/ZIPEBx85ckYNS1l/1z+CvPfa3vOcps3jz/Gc88Tuf+l2WuSoxawyShTvcplYGBk3xFohf7f7Xi5BMPPVIePNqw5DxNuP0ZuPYhiJa/B2lZpB/MikETryMdOoar4Hoo0LogFY9Oko4UKYQAiIQpNziL08b3P74Krmtwv8b/4/sfE4oDOkrB5x4O5EZvbiBrPElpWLvONVD6cMsP7kQqZTIKx5GofalFy9Y61LPEpKhepvwkFPoAUiMoA80tpfjF/+U+q45ymzcr1c9kJEMwfrLOpazX0kFirBdAEglAOu7K1B7kUu552vF/qP/he/0zh7ubViKaxgdOHCAmFkOHw1oRPOpyBbmbXTD/uQkKNcJBq/NRqX9O3LgqSKypcL3h+lFuCCkMMAqLpQLF74CoWBOEgWfMd/SgJStzTr/GOgwaP5QjDUp88fklOvhyml7/jUHn/emHqWN5HwVHjsD3QfoEeqcFOo9dEQX6rLji/Y+91HHbkc+fdooZRX6E/hEVV51IfLntLAKhDXQ4rXvkYLQxt5mPPvqoEMHWFRD/lw90J2LwnJFvrsP1S3QRcsRIjisIp9Pwb/p35qk+VKFoQ4V0WC0LnmAF4UcAYiZC7VgCKYwsFSeRQWyDfoS649yxDXlQcemnIE/kwO9iTpvP7ENnNcapcfEUTZ5AIm2DTmuvhpLelaOpozkn8pkfbPWr/5DXjL4PJQqpNgvcOKMve9Vou2g8cdGnfvj5pfMRg4uf5BheQChqt0Rx+hEE8hIEXaDJvGLmUvbx163wuHki0fYrXLpWor0vFPKDy9vWwFogbUFBmOss8sg7i0jez1IDkuzxNtx0MHfAWGVOYVyHTpUUrFczvGwQsnxqkopp3FAs5l3CrOMrWKhOKGhcBOI6yS5CeUAHKfwBKCsUxFyBrhiBAHRqD1EruHfFeodOHXlWGXikuHLftTuv/6+XHPhW5fivr3Wm+kORy7/6kwcP9Orrl+DrrjMf5oIqfmd2CSQFHQQ3eDslQbxt3jr38zvfDB2677YfJcYe/2KoHV4xvNjcHLzhffh2p1ChRUvhBcCP4cg+gquXApx6G2kOH5tcZCFDaztxbRSh5L5hGvhtkdZeARGF35JHsp5Ns9YF14A/1kxCByGTqeoc87Hego7iz0LgLmf7s5Qa0eFOICY0LMrMhSh/3u13Lvnk/7pTsKN34566xEE2SYaQ796SxUY8AJJ1VsBV0ePJ3J/8uwzuw3GCK/z6EzlE3tMHsnRiZ5YGX01TPFKhlZc41LEOFAQjcm7ahL3LIluoI/AsIXYKNgNRP6L0fJomj+IDKz+Ig1lt+CqcorXhnXMeha8B+Dqb2OTjYwQFV7UKckGYhZxYHUVWxOBN27j6nk/ExaP4Bnt0x8bHjlED79lFTeLHeIj7dzSIL+tQqvwFnQdHSYMqKEfzPJgjWlRFboRvFnkyJoS4cuZ31JnlRB8+FCdn/Xradsk9r1ycOfrT6MxrNxvREu6u4H/AzOvIDDKiTBgDRJmbRIkEVj6Ni0akTJWmCAiHjxxwbT0xYFNXJ8/ORgsEwRY56cYCB9IILrKhbB3kjhQHQScGKEF8ZcYDw3WI8H3UXE7T1BFgjaSd3x5d+77ZXyQU5aNJd9+c7+HMhMSBfR/+cW5a4IM+MQZtTARO9cgvefkLHgGIQjw8iXhABDGhfMcNK++XH/5WWlQ2ryY7evPjX7d71+3oWoeM3XJkGMEKxWnoHYw2oHuwJjgN1zCtGjxa4LQYCjqAmA3KefQgEmrQTXyPzyJrQt0glSS+D+LrV5wS0wmuQXu5qG+YVfgaFqldypbxPTVuNQrTIiDlz4mbl+C1CJGcma4b2n7vg88PgMvxgEMkTgpyP4w8ARcuhGSgFDQAYZgBHODN7+LBeHxcC7MnO9HKlGZWwbbmP7r2vMs+vhlgivM9vpLsXD+zfsOXv549ds+/RXK7V/uRq1YWNVIhvH6fUdy3Vi1MaQaCWE3HfT1SJY4B5xB6aeyNApVbPrS3wd6x1gikWJBEBMMKHceLLAEsGC4X8ckhUia5/Iyx6SnM9ymfHx+GImIXn67pbMPBVeB/H8IRIx6kEdyVWc2p0BS+6cIewcfV3LONj8WZY5gAVT8IdYEXt7t04NhfPPxxOYuRpLDbzKd+2sxXGz2ViYkJ/lyfs248WQXZuf7WJf5r1eSDf6bGmrpNLbL997679l0wevWexsALdSbiMXzGCvaA84j9mtNlGuxvGuq86bo/t379wm/w8QOu7fmWFoRBwMmROKgEJxH6ZQyKfgru5Y0btw0e3tG5tPHNq/l6KYfEP1CC4reQoeQ0Br6PRF4jTbFSw6pLHhv37Jer7qFzVVgvrngf9Iuww9vGdSYQA1TbmTjVlwUV9DGLYrjCiabqg9QlVLB4vi0bnxq9K5QJveemgFO4J1I5uJIQ21oV5IV9NtIguCZKXPTU3Ppbk/X7/r6iVSbF1x8lJLygUiA2QBy+Fa43qA5fdqRPUDps2PsnL/vbrw+9/r2fdvl2L51CGiOJL2mjsHx8YTjqf9/o+GBfOLr60mc/eerH9x5cPe/zyP3IEnsHGqcZwFuXY7xlVd5kI0/AP35nYNnuKcUC8r3WGLSp55VOGr2fuOu52Qt+cMubb7UlD71gU3JApSMvVOjYya5y+4dueeAfHqdBvT6xJ4hvG01wwfAQkluIo/iaqIKQJX8KYsmJnFjjxD8nN82sufqPXxu74LtXzLZ++N/bz2+ze6F3Ykihas290803fPUT4Q/8z0varvvzzx/aouDvLYSOl9usWfLeJa7uAImvLIWCOhchvGwp4DEZWzWW2epfxCxYQI6ze3p6xFeli86/fO9wsfOBk302vfJslo4fClDDZTds62u/8cT9n4f+W3bjs0q8WVzb8PX0vgNIsCNm4W+H+IvWzFS9Td1X/uwvfw3bjufSD1wzeW9g2+cqa265Jrz+yscC7/nIK8XFH/1o2wXXvXjFiTv6ei68ih3CKoJiQwv+qbVndwgzhlTeC6AWvDJ15Z8SyS60iSQ/98mfp++siXnMwIATOPD4Ny7d9bVLH33hL9a+8doPP/MIf04j4XYNO8HUtj+5b+zbMef/fNhw/v7CoPPMx+PO6PcanekfLXcGn7nvjs1bz/yYVMKCx1X6zPzHmVhL/Ak5fzJ4ur92zd27xslAicfCsjakp5UB3A8cq6eBNp/3r5F5OI/zgJ1R5b7T/60PR9t6yIn8eA9n2s58hoed+ue+fPGrW6/3Ow+8T3Me+uiy3LFf3Pnxoe3fet8e5MN5XQlRaz20CVXBffjBcZh/ao319rnjpfNYExeBHA88F9uhj0+EvzpjZ/KspxYst8mBteZFf/WyTo77j7tuXxeZG/8bxUyn1YaOp19c+fBzW26Y/9xYjuFy4Xp8YPDLeL4S+jRkG3zu34tVdakXfuEccj4uuY/3662LBWWDBOZ391elrtsn2JLreOSYKjHmmwUSAk7OK+eS/ecs8ZdDQmww4J2yv2ev1f2g7Yz1eT25By7lO193ed+5XT6yXb6fs/QORF3ooHMO9nRIOJTM/mcRUQ7lcXKsbFtYyn5Zcr+3vvCd+zy/s4iAPqF7JIHkXBJm4friXQ5a2In2WqdRtWLe8bUWONe8Es4L4x27oH6WOwL4M4gu5/GWvAbeZZAtl+Q2qbOqxHPHVteRY3iAiGYxQJw03r3U500InwgxClNdjEdbkaNgnpQfF0a8Q4bFBrhtvnfelXDHMbzYFJ8et/G8HrmXMNwlx4p53TVEm/fk3XaFv8bleRgQD88jORPBW3WPsk2O47IazQPedv+gWRgFgQP/4y5YHSgXZTOPOv/XFXhj4q+aPe/cJvp4A55Ni7EujEAIdYG4p+S1vOtV6zwXPwvhPbDyAKsw3Ocixn28phzjJbicl/sY9oxxEsZdW8B7ASTQGRO7Zl78ty3cCeVpSsT5b80lu0pY/lqC/0yb3+U4/nsIznbJNcUG+UWOQ1UclBgw334GAXgc97nj5Vqi5Hb3P5dxBuLcvvCR63nn4THyfWG9Cs8DPJ1VWZQDZL98lyXaxUnIdy65Tb4zXK0x3n4Xhsf5vNbLO4bnccd5D6Rad7ldOIsSzltKeHcOOVd1b95+L1wVEY/8si8g5NY7kPt5koUT8VgvLMMshK81Rs4lYbnEz9y4caNIP3jXducU66Mu9Ic7XuyT68uWLSuhrAkr4eWcPN7TJuuy++3LhQSQo8/Vfq5+Fk/mBtn/bkvvem9X5z75e6dreOf7QzBnISCpuxDwXO1y3ML+RAJfWZ1OVslh77j0zvdO6u94Ygz0zveH4P4vsNsENZKhHrkAAAAASUVORK5CYII=",
      yellow: "data:image/png;base64,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",
      pink: "data:image/png;base64,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",
      dahlia: "data:image/png;base64,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"
    };
    const REAL_DIYAS = {"royal_crimson":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABMCAMAAADN28B/AAADAFBMVEVMaXHm5O3cuofr0pmKZUKkhV3//+bszJzSs1NSKBzXtXsWExPyvmnz1qPq0qA8JxSVeWDFpnvoy5lENTByJimzlWvLr4P/xzReRULy5MHFnF7//+4kICL888/s2J1aQDGccla6m3SfdEj57Mnw3Kz//9s8KiXz3pzx2IzXuY0ZERHdx5+me0S0az3Fbkw5My/4xFT+/Jj+9IRIMCbv1pr889C9mV6XZ0VMOCm5PTj8ujpoQSf811jxmzlEKhf36Lz/+NaZRiyeWD6EXDfEqHosLTAcHB74xlf6xlQ2FBBJKRjwjiz743bcdiNLKhfqz5uXakW4nXLFqX7DoGindE7cvImdDxn77Jb7v0XIXyHWuYr+++DTqmp+clzbql7502L77YzVdTD6sDv//OKJUDLXs3vHc01jRCThpUb59ML8wzwqAgNXLhIXBQI2AQMdCgRMKBBODQ9dBQkqEgZXDhJcNBRnQyAvAgMxFwlBIg45HgxSEhdOLhQjEAc+AgQfAgGujmRyTypeOhk3GAlNBAcNBAJ7DRZUKA9CGgtZJxlvQhs2BgZkBgwlAwJvSCVWBAkIBgd0NiB+XDphLxpgDhKOHSZ2CRFKFBc6CwhcFxdmOxaoMjsNDAycLjlxEhiad1NGJA9GAwZqBQ1DDgxUNBcwCgdnRydZPiKHWihPGRimLDD//swXDgqPZDKHFiB+Ghx9UityUTVPIxFiJhNkPSBpLhoxJh2bISqyNkCqR1WGYTgUFBSDIymGUzdvChJoHB9pFhW2PUe6SVLAWWTp1bD+6W/BUFPTtIbnxY91GRqiP0qEQyzCanIeGhh3TCOmg1SANCKTNCObTjihQy8qKiusakrv0JuSLDZ6QSaQRCiOWjmpdVy8hE/+tC1LHRFrOiiTcEWvX2uZaTfMk3PEiGLJkVj++6/3kyWjHCD/00IrHRGtVGCRSTaOFRibbEisUjSWGBqzhFtENCa0eUf//ryRQUHv2KTOqXCWAw/9oyX/5VyUa0bOnXa6Uj3hqo5QQzrtTg2hAAAA+nRSTlMAB/5j/v3+AwIC/e85IUf+D/72T/78/v4n/v7+uv4WPCH+/v4v/p2WfP7h/v7+/vyd/v6O1lH0/mH7udb+ie7sbofJs7t11uJ/y7jovf3ctmZCf+HS0/7tXf6gktP4/rvYuNy9zluA+Nf8+v/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+bVBxMAAAAAlwSFlzAAAD6AAAA+gBtXtSawAACldJREFUWMOtl3dYU1kWwB9LMImDIFJUBgug2LuOujrqjGV673X7/kNIQiDVJJAC6QlJKEkooYRQQwkBpCPSexmlCMqg2MbeZ5yZ3fOCzM7sOrvOt+9HvvcF3ns/znn3vnPPRZCngoDgNy9FMISAuL82D44YCp+/iKkQcfnzhDuGQsh44WV3BI+h8OXvvvsYOyGM8etbtm7GUui+teAChkI8svruyruvYznKr6+cs/KPLthlvOKjOXPmfLQUu4xfvvDsnGcvYDgR/3AXhAWuGI0KAZn/UgEI56zCTOi+twCe4bPbMXuEH7cUrATh/qVYCZ9vKSgAZYEHNjkTkM0tFy5cKFiJ1agQkN+3bNm6dcvdgtWYCb9rAbbcXYWZ8PLey5f3tmzBULgQ2LsVs5Q3L1w4MTGxsAWzQXl54cTFi99OvITRMoVH3Ce+feONi9++5IJV9Zr/2sVPbrxx8Xmsqg0syq+92P/Jn+ZjJ1zuvkz2AkLEbgUgIt4Vi7AV7npmPvZCDDsRInL4GRcMOxEX1wOHvjiwwwWjGAnIuwvur1mzLvgzbGLEI+9Eu7mVl+10az6AgZEAPl9f83Wtduy67/4dyP/79hEIyDvvebnVjdWmldiCvMCI/+1B4gkEPAHvBPq4d738osdKRmM1DSPVZr/gA3gEPwtcRACekJXz7BNOEZEVh9r8+uq6uooimfzykRKzV/BfVjxpnhKIjwNAfjn9XVxcls5bMW+exwoPD3cPV49P/fx8cdqRrqI0TbiCbNR27YxuXvLZDte/ubrCaXcPD/RiuOnnQ4gg81Z4uLquXrXqrbfe2r59+wKUU+2nTrW3t7d5+Qb1asv7Y+uV9Y2RBrKxq66uz6t55ZL7c/2n/R/4+/s/B7z33ueHDn26erUr+EH37gdw/ynn/e3tv/sXbX5evm44tb5c25Gp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","terracotta_clay":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABMCAMAAADN28B/AAADAFBMVEVMaXEjBgD+/v7PvK/flmzakGXTy8P71LmUaEgbAADcnXjNdUjLm4bep4jcl3DWi2H++/QIAADarpjdmHDgon/fo3eufmiyhHThmnKvjn1ePiwdEAlqQDPhmWyveWB2QisyHRMSBQHHnIrcnnvw6NptRzKPXUgMAAAKAQClblXy9PCbZErv6NzKlHrv6uO3iXY+HhGAVEQeCAGWY04TAgDdlWr///+wfmr69ejv8/Ly5tdwRC44GQqOWUSmfGn8+/j+/vwRAQDjuZP11JazhnbH0M/GimR7TTezeF7cl1D65Lv///+DMg2ALwqISCyHNRF8LQiLSi99KgKALAN6KAN5KwNvNBiOUjiGMAFQIAeJTjN9LQPdlGjhm219QSZ3JwJyOh5+PSF2JQGARCmLNxLom22ERSl5Oh1vOR+RPBeNOhZrMRSHRSleKQ6FQiVHGQOLSCuNTzQuCwFyIgGQVjyBQCR6PSCUVDllLRBYJAmFSC2VQBvhmGx1Nxp1PCByNhnun3CBMAKeSSCHSzA5EwJqNBqVVz0UAgCZRB/fl2iARyxgLBSeYEeNTTF8RCrDckuYYEaHNgihZEunbVOfWDl3PiObXULMe1LmnnKHOhgUDAuydFiXXEDdkWIIBARkMBe3Z0Hjlmd/NRe0emKKUjnQf1P//O9aJw+TWkKsVjCiTiixXDGFPh3XjmRDGwmCSzOucWB/MxCaUi+3Yzn//vieaU54QCZOIw89EwOmZ06vYDvMgVrdjF8fBAAeDwuWTSvXhVg7HhO/bD8nEw2ubFDTh12ZMgCQOw/FfVKuUx/++uKueFwyFQqpcVmNMgbqpnSmYkGmaVudYVK3gWmmUiuAORm4bUrtmGNGIhP3q2yOQBmSRB0mGRX99dT97ab80FelbEpWKRaPRiPflFV4MwvzoWH8w0P93nVXFgHWfkmYPQq+d1X+9b36zHv7sy5bMR/ljFPRcSb+54nBhmplJQbZfjV6VD9HNy86LSX6pSTquX/uyZ3yoE/2nyv0jBv43LVoRaqiAAAAkXRSTlMA/f0Z/v4MAgIBhv4/SdT++KQnvl+nm3v8MPwRIerO/lpyWG3f+8mGOfA+VSuf/LKYhdmqxfG65+qek7TJ62dWbumKwNaQwePyhdP////////////////////////////////////////////////////////////////////////////////////////////+jW+6sgAAAAlwSFlzAAAD6AAAA+gBtXtSawAAC+VJREFUWMOtmAdYE9kWx2clIaH7FOy9u7vq9t7bK5QEQgDDJJQQSkQWdgNoCCEEQUINEJrUhLKhdxBQQFC6NAuKBXt3XcvWt+WdOwF1FXbxffl/MJn6m/85994zMxfD/l4U7MV33jGCHy2JgumsKSxcsxCjag34/ObNm2s/15pFCqb7+ZrNhWZ6mJ72Yn67t3fpEq3FDMRPbvXefkGbQLNbs8/+W2tJhOR92jv7jJn2Og5G/U/h7MJPMe1FrLumdnbtGqq2LFIxnbcA+JaOtoAw9GabzzKf/aKWgbXPaw/4/CxzIH6oRaA5An6kPeCHgJtl/o72gB8RwLe1AKRQqBQKBXubAL4Bm5odev8HiPLwOgpGeWMC+KhrIvJMRy6V+vBcXZ05hkampp/MJhrlLf3Vq02NDOfo6FImzvx7r5P31Z1jtFrfbK7xUhKJxxs9WWiOdOby6CiPJyItNZ5rpm9qqEOZ8Dr9ECMOUXSM9M2MF6RJJBKecl9bgYGBgbKWcNh7HdZTC9raDvEkkjTR0rn6q+agS6YJHu2mzDE1m7sUTueRyg6lxsfn1jQVFfX0XDQngIV3e3qKikqacuPjU5tNyDy45+vG+ka6EPxTNvXQTXRM576OYFnAOp7bdLRYGhkZ5NV1o/Mi0EC1dztvDLi5eUVKi4uKmo53N5eRcZ6EZKxvSMGeqObgjmJotjRNwsbJQAOYNNLLjWbJcGQwHAY6Zea1s2bVzjL/vnPAgWFjw7C0oPGDIouLagBqQgLmXFNd7HGTgDOaK5LwFuAmBYgWybewpNuCnJxsbRgOnYPmtYWFhbXmFzsRz8aGSadbImhkMYTfXIaT0tKMV+tiVL2H4c4BnIiEg7kaRKMzbeEaJpMJQFsA/mJeWNjbW2h+ERzb2Noybeng3BJk4YWQqWULFqTxjI0mWhV4pq/zcJJsXwHggtws6YQA5uQKcrJhdP7XvPcMqHAQDIJrVydbJkAtwaYl2CzKjT9EWrCAt0CfokchHkH6SqVMJjuU2l50imYBJzk6Mp1cv9bI1dXWBoBnbp09e7b3lwGGrStxFyRbTeC0sWJk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","marigold_urli":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABLCAMAAADQ3vDHAAADAFBMVEVMaXHyhgKWmpmysbEvGQPX19bMycXUcyC9vbtALiTvpAGztLT9/f3y7+ryrQDh3tYJBAD0tQjzuBD4uQnjciLEOxEPDA77xAb7uwnfVRL4vAD7xwX8vwj6vgEoGhTTUxP8vgb8zAbGRBT8lCTWmxrUZBv8ygj+7oLbdSn6vQzpxCJDJAPRhRX6xQn6yAvDehTOVxMaFA3dgSy6aBOUWjf9pSK/Tg17PQmoXxL8wgL8yQb+rR7oezL8ySrieSH8zgn1pDj0ex+3TRH1oRadMgtnNRXenhK2eBPljC393TWiTAvhVA2Kka2kbg/LpBv95lGJOwn1uy/4kBq8WQykNQr942m3mRqgZwyxLBKjWBH8xzf91h3+qyOJNAno1RjaTg7yZA/PghK+dA75tjTxnEj4yZbKYBiaZArauSfFnTTjmRHRthj+ixZsIgBxJAFyKwb9eRKKMAF7KgKXOgGPNgKBKwD+lxd1JQDwbBRnIAH+gRT+khf3xxi8XATteSTPfRPqsRf+nRiJPgf30xuSPwaANwvhmxb/oxnqYBL2zRrywhrfjBbSegHZaxbJdBTxdRjSShN7MQXaSBDCZwL6hRv53Br+qhmGNwnLbgNiHgDcgRShQQKvTQH+/v38bBH8shqOQxLz2h34fhb3jRrYuRvLlBy5LxPmaRe0VAF2MwyVSQ/4dhTmkhLzgxhbGQDPQRHBbhadUBfZkRXwuRmoRwH+6RuaQwTKWRPZXBPkvhrlpRfCMhH4vBbsng/GfxzZwyLpVRJUEwDpnC/wzBqCMgXlSxDskye+ThLneBfmgRrThQ/cdxTZrxrNuRfMdQLCixnNihjOoR7Lrhb3nxrtiiG+YSH25SSvUxL78CH//MD4XxCyWx3MNhBoJwaeSwzeox3ylyLr0hniigHGYQDRcidiJwO4dxjYfgC+qRnXkyd+QhaWUwn/+aCvZhbssyb/rjTJaST//97///H3WBD/+R9JEgCvjBD+4k/9ykyIXhWXZyGxPxW+nhb00zE6BgC4jjIAqsOyAAAA8XRSTlMAAwYMCRMRAQ8DCAkbGQ8XERcfMP7+GnpE/ieXWTsm/WPE+/7+/rj+/U7+RreLp/6zMff+GI0nX/5sr7NE/GLVdpFN5oU506n95WLBJPyl8OfhuZNv+3KE9tTu3/Ct1NXi49PM3TLtr62X6PH////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+zpv8EwAAAAlwSFlzAAAD6AAAA+gBtXtSawAADqJJREFUWMOlmAdYE/m2wIeENJJsUAmKuqAIgoBiL2tZe9ft69a75Za9731pRgghAVIghYQUYgDJSgttIXSkVylSlSagFFH3WbB33f7OBOSqu+p7epLJl0zO/Oa0OWfmj+AxeCwOR6ThsTQMDkdAnhIMhUKkkmlUhEQl4nB4HIaIx9OINBwWRwb1p3UJNAqeSiQieCyZSCZisFgsnozHI88oUSlEIp4Cu4kYDCgRMaBLhjcei6U9o4vgKTgikfLkHhKR8KwSmUrFUagY5M9CJD+7h0Sj4KhU5CWCweOIJIRAsCGMyYt0SUQcnvwSHgGxsbGxe2Nc7OzgF/I6ApahuEmTJoNMmjSGfD2end0bQJs+BWT69MmTrETCqwPHeNOnvDkN5M0pj4mvzrNBeYCbOXPWrJkz5wHytYiEcd68WaumgqyaNXOalfiqTlsNnDwdeFPnzwCZP3UVECdbia9uoJU3Y8Fbc+e+tWDG1FXz3nx1E8cMnDJt5tT5C+bOfmfH7LlAnIWa+IrVOA6cN2v+jLmzd1zzeBuI81/HRBSIerxq/oLZb79z+vSOt2e/NWPqzHHg/4WAwZJJTwPREM6cOuOt2W973L79DpgIQPAZgBgyFvMSHAlHoVBoTxKfAH5+Le6OhxU4ywrEUykU6kv6AHQe6HxEhEjAQk8hIGQyyW4CuON0XNy1zyeAeGhqWAoOIWPIZNAlYLBoH3q6G5EpeCIRS8UhOCKeiMPCBl180uMk77gdF3f6c2sM0TRTaUQi9HECFo/qol0cDsDCtyfaF5lCxdMwNDgrFcYBDpq8FWnN8oK5H92Ji7u9w5rlKZPtMFRo9lg8lURANfEoiEhD1XFwmokQQrPH48BlAh6DxaMOYJeuWbd+2eq/v/feZ2s94gD4cO1nn73399XL1s9b808imYDDkWyIZAweQ8ZjiFgilgwjhIj5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","antique_copper":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAMAAAD886zOAAADAFBMVEVMaXHRViXOUyKTaDxxNB7UUh92NyBvUkPTvZLWVSPRUB1qMBynfUzaWCTYUx6GTDrCdkeBRjPCjVTUXCatVjeNXjm9gkuNZTiGVTG6mV50PSlqPCWThIWydUq2h1XRRjWkVjS3fE+NUj/BpWnANSvMmWPUl2eYcESNVjjSmlu3UTfMYT+hckfy7s3XrnLMom16QS5lVEOCSizEjV9UOSyGXjN8VyupNyGRXT6db1HTpGSXZURFHxFfQELRp3bJsG/eWyrMsYx6TUCshFq0jV+xg1pUMCFMRy/Qr32fd059UkO9lWZIIhVRKx5kNia/nnGKXU/KlWzYwpLOsYWjiXVWlVSZcl+WZ1Ly4KV8RjViWkJIXTfGMRiee1y9mG3Oq31ZLh63hVrOrH2zi2KQfGCSWEizmIG3i1mYXUiTnWSmclFpUzmASTeBQSt+PymERC7///6HRTCJSjN8PCW2YljLZjHLVCazLgl3OSPVYi3RdDu3Z13MXyzOWyaEQirLWCrUfUGuMw3NbTPOgV/FmV7OkVi1XFHco26xPBDbsHxfKxrSiFPSXSutX0HEUiTITyHbZimbVDm4Nw/WajHadjS4RS7klUjBZz3HglDGWjF9RinfmGbJWR+RSzLIQSylWEPlPjTeazuzRRe+QRLihz7VZj7CXTqqRy+2bEHnol3ASh7JdU3IbkGzYTeMRi2oaT7ppk+2W0F5QybUi2PorWnol1vx547DflnKeV3ciV6SXkj+/PTzz3PCYCjwtV3MaErwclDecViuaWOtWlK1ZlGdXzrOgE3SVTfAUT/Yk1Fos2D57Lz8+db68ZzCX0jbhk753XbMVBbjkoCYTi/Aa1TGb1pQSi/oi2ngekHSwXjaunLkXEveMiTtoIHuvoX8+Ofh1IDBeXnwuq3bfGtNfDb984LQYFOpkE/vvm7q092AjUmFtl7ogWCcKge2PCBiXiugY3VubjjkTUXdwcmPcFCQh0C9lb5kX53z18ucUlSosFa1pduMeayjbI2Zi8+INh4OZ6h+AAAA9XRSTlMA/v7+/v7+AwH+/v3+/v7+/v7+/v7+/v7+/v7+DP7+/v7+/v7+/f7+/v7+/v4V/v39LP7+Sv79/v79/v7iFfv+/mKJ+/7lrJ2U/snrxnPbknzZTncs/l7QJPJs2/6rqLLwvt3OkrFD3dn95+Pc//////////////////////////////////////////////////////7////////////////////////////+/////////////////////////////////////////////////////////////////////////////////////////////////rMrToAAAAAJcEhZcwAAA+gAAAPoAbV7UmsAAAusSURBVEjHlZcHWFpnF8cvkkS0GBFx7723xtVo9m6SJvmSjqTpTtvvAwSECIIgQ6QIahTBvffee8VtjCZm773TjO799FzM06crTb5zF7zc93f/57znvZwXQf5mOBxOe/V54w0f6x3b9u/fsHLnO6+//h562b9t5S60XXuDri4OeZHhdNG7cD4+Prs2HIjyW7tZVn9qniT2rX94ptJF1nhqvpIYdWBz1Np3PoZbtMx/heK0v+rueO/19zevkVVN3mhu9HXwtKsleni0FxNcXEy9VCQXov3w7Uo/p7WgeaU1gkM1PFccDvFZueGdD2QOqhu3T9i61Fe0unp4uErk8vH2Y03ycY1ELvGABi9PB/HY5I1Jhe/afTt3+Cz0/IfIIYj1yverBqUaB7+q0IpWiWRqvLaOyeRyuWzjrFtNxuwUHp/LZdbVaiQSYtBsqH2EaZV0kLQZdALzb/IQ6x0bDtj6upBUzlWmEommjpnN52OM2WBpaWl9R/rgbGxsjMFgdFhKZUWdRuJKVDirKoN8bQ9s2GGN/EkkGrvl+01VIle1KbFK46JRZ7N0FusZG/OeATOP9h7NNDA2TuHxeHl5Ojr6Ovqp2WqNxFQRRFSLRCqb93f9nhwL8nx2fkb07fRUOXe6tBKyWZjFixdj9DAYXkpKCpudkVY2EzOTZcBmo0Aei6UDSH19HVY2wUXs4OzsaRNlsXrDG7+LBPLKzfVyPwKRWC9xrc3G6AFusY4OxpjHQ3kArO6N6W1Ly0CBfB6fr0WiUJ1sgmuQgmhr40KoD9qJLGgEfdvXiEmeswWVDlJNRYoB8PRAHQuTksKFjcfOTGuLiYm5nJaZweYCjMcCJMpDn8uvMJU6VDrPejr4rdm+oBGH2xZkahEhIVR2ymq9jJfq6Wl5GBb043M4wmqOoOwyAI9k9g0IBVwBh89VKlmoyMXg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","royal_brass":"data:image/png;base64,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"};


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
            <image id="utsavEfRealFlowerDahlia" href="data:image/png;base64,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" width="24" height="24" x="-12" y="-12"/>

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

            <g id="utsavEfMangoLeaf1">
              <image href="${REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="56" preserveAspectRatio="none"/>
            </g>
            <g id="utsavEfMangoLeaf2">
              <image href="${REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="56" preserveAspectRatio="none"/>
            </g>
            <g id="utsavEfMangoLeaf3">
              <image href="${REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="56" preserveAspectRatio="none"/>
            </g>
            <g id="utsavEfMangoLeaf">
              <use href="#utsavEfMangoLeaf1"/>
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
          <svg width="100%" height="68" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible;">
            ${getDefs()}
            <!-- Series Lights Wire Swag (BEHIND the flowers) -->
            ${overlayLights ? `<g id="utsavEfSeriesLightsOverlay">${overlayLights}</g>` : ""}
            <pattern id="utsavEfToranUnit" width="160" height="68" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="160" height="4" fill="url(#utsavEfKalawaRope)"/>
              <use href="#utsavEfMangoLeaf1" x="12" y="2" transform="rotate(-6 12 2)"/>
              <use href="#utsavEfMangoLeaf1" x="38" y="2" transform="rotate(-3 38 2)"/>
              <use href="#utsavEfMangoLeaf1" x="64" y="2" transform="rotate(0 64 2)"/>
              <use href="#utsavEfMangoLeaf1" x="96" y="2" transform="rotate(0 96 2)"/>
              <use href="#utsavEfMangoLeaf1" x="122" y="2" transform="rotate(3 122 2)"/>
              <use href="#utsavEfMangoLeaf1" x="148" y="2" transform="rotate(6 148 2)"/>
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
            <svg viewBox="-16 0 76 440" width="76" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible;">
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
            <image id="utsavEfRealFlowerDahliaSide" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACQMUbvAAATMUlEQVR4Ae1aCYxdZ3k9/92Xt7/ZxzNje2acTJzEcTZKSNSYlLpNxJICYWmjNpWoKEWtWglQ90WolcoSNSpUFS0o0FKaEAiCxKLgOESJE2rqxjGOk4wz49ln3szbt7vfnhcwOAlCZGZsVOldafTem3f/e///3POd7zvf/4Du0UWgi0AXgS4CXQS6CHQR6CLQRaCLQBeBLgJdBLoIdBH4mRH4qziWikunbyjPnfjNpVNH9//MAy/iieIi3utlt5qentatVuVeXZJv16JAcwKn4EnGwR37r3/6/BNXXnjiNsvAWNPXvzE0fu38+d9djPfSxbjJT7qHPFP4nURJvCuca2rtMzWYFb9PrbU+PT39sH7u/IXHD31IqzceFK3oU7ZX/17hhcN3nfvuYr3+XAB6+OGHdaXovy9abEGZd6CuuPAXqkg0wtcn58y3dRY/99DX/sBu+n8vCm3Fm+F5hUpvXG3+1sUC5tx9LmiIxdQYIUR07mbnXk9/6ek96fbc9+3UuoqCDXnVRmjWYIzkUDOVh+op6U+Sq+UnNSGsyNUhV5sQQx6cgeyiK439kZW2xz3bOTYwvvfwuWteqNcLAtDs7GzGdsS/qK7Y5dXc2dBzH2zeYtw/KSbdzkKKT3/yD5P+3CcDbxVx3AOcHkd42oIy3gPf0kuO35xNhNo1vrQBOelCTCsIBvldagByIgElp8GxYtfTw09K6d6PDg0Ntf7fALRyfLo3iNwH0krypqjuQHJjxHWGUKv5pKurv6e8fXpZf/Jbz+rlSi7aSAGaC8kgg2Z3QHUnIJk6gnYTfn8VYvAxyGYBceMGRCffhEiXEZkBfNtEkAWMoQTqiO4cu+aaf7tQACnbfeFKubg/LdSbauU6rEBH1HQQuz4sP349nNo3xUNLx025mQtnJMQLApIeQe4jkMkChJuDqPUgzs8RmKOI5rl8JKBOnEEgEbyFFGLFQpQN4TYcIFYBJdq93Ws4/3rbDlBUD9pO04Xa8hAUG0j4KiKvgSD2YThBr5GrHow0FWI1RDzfibgQ8AJIdgyhki2hCwXPIj7TRrCcgNA0yLZEgM4AL0wAPTyv1YYeMtQSgJxTg4Wjzw9bti1y/vCauFb45y9wq++3P4up2WnUw6IWuQidNfjNKqRyCLFYQVgswmt4wDogmj5Dx0VU9hGuVvm/OtBeI1zPEoh1RHMRxBIgLbcgFiTIrQCgWEdrS5ArDdhNDVHRhV4LP2iV2t+Xq/VTNfW5766ffuaarYJy/vhtZ9DYdU14qe+3jbCIcCQGKmTQsoF4mvpRIGgbHhQ1hBR6EOCiQzKi2iB72oDF9/UaUKoTQIXvBYQdIN4gyyIHUWOVIRdDS49CchSGLoFfrQzGvkWxt2Baqf1tp37P7OyRW3btOsAY3PqxrQDdd18sB9V7PpHuLezwVjxIHZ2ocNERk+WOCKGQWO+0oY3G4DsoeodlnELYhhA1RFUKc5WaFbEyaFgQngNBHYfPsRsNhK4DPZcjmwhOI0awtorAI9jNfsSOikptDeYe+waplX8PR31u6/CQwdtxkXPXuOMOEcpx7XJvnWxYt6EWEpA2HITrZcjlGtSAMePNEw/WNXIAJVOErJUAtYRYW6P+zBOsNQpLhd+XKcBr1CACFngIV4rQkgxFi3o03II/PA1Pe54sjCCtE+hlnuszI7aZBcsUsm06tswgFoPq3BMnbpQqrRv91dpOb/XMgG424KwWgSUKLNJA3YdfW4JqhNCiKpzlCtThLERfCXJAloXU1YRPxjCUGJUioD7ZZE+C7GPd4zapXwaf5kQ/xMAyx81CZFuw03y+1gqcw/ugiVEoUpoy1lrGLvFf24QP57+Fg+CIpWPH/92MpI9ZXnjAqDb3B8tN2xoRnGyE4GwZwUIdcqxAUSSGyDzTegEINhBpdYLUYnrnw9YZcnkikyQ4BAIcKyn8X68gs2S4vgfVJNiBi7hSeUmToiWmsDqr8B0tyMoo1Ap1SZf9MCl+t++W6/57C8t62dAtMejMsePvTATSO/xCHeE8w2KjhGClStlpI7evD/peKk1rBt50AWpahtrbi1AqQ2MdA7lBkPgySDAanBMtqqQSJNbEcedzJ1mrlOQCLUijhbjNe7SSTPFDiHwOZKGojSmQhI3WGqtwstM3/Fooy0OrX37yzZEZPTN02xvmXrbaTXzYEkDCd94W1UO5Nb8BbY6mc4HhUo5Qn24jXg+Qu9SCdsUIlGwEf/p5Pv0mlGGyJCsj1hlGvHvA6ljm4hBQyF9SRIYVsxnIpJiZXyox05khC06SvaEjbjKzmayzBpNQemw0T9nwT1QR9C0iErm8bvR8IkwpaDealYX7v/OVVk79i0tuuYHit7ljSyH2gV+/K2W58lvRYpjUWPWuVxBU6ojLTdSPLcLxqjAHrJfYo+xkPWPPIQxLDCem5zwnrAmUVjSEdZUsUFCcNhGFglrFDBVo1CSyS/pBFoyLzFwhGZMzII/0QiEbPdqY+hEKM/8fKzKFXYEn0YpwvOhTDDsU+12nFeSmxh959NFHifprP7ZkVqcfntalxtL92XL85nCZGanMJzm7CufsEoJ6BV7E7DTQRupKCdnLZejDFFh9hpU12cO5OmUZ1UUTjRkFMhlVK+ro6WvDIHi1qoaBqRp0LlaqUotKGuLWDkj+ONk3jAZ1qXqiSGuSYXajj+vhd319iEcT8HbavK+AN1OCL2FduXz4yl3XX7/62uFhIt3MoHNjJm+ddKefmv6NdrB8dzKff29clw0xXod+BS1CR/9Zm0S1KnxvBc3nV9FiQaiOdFgQQ/YFGnUJ7RJ1RmYGy0sw+0KyQkV1jt8bPppkjXlpADnLZG5rFHwLzeUyas+uwF2TIcWDXADFK2QRygwY+dQpQS1SXHq5JCSZc2iGeuR5FK3NHVsCqHPLyddN1k8eu/8L7Wbz9cPXt6fkxBqkChe85lFzWC2rtBaCjl72EMk1BCWB8oqEKsFrrpjQI+rPICWol+FkUaMp0CpDz1tSsTxNOyEx3Su8Vpm11coLiNdYRLb6YdhjFOgE5M4gQV3SfLZCaH5TBjNeGlJgwGt6aLeDv5688UYWWJs7tgTQ9MNH9yufr348Kqy+0Z6YhbxrA9IcTeiST1vBYpAunmrCFfOVBR40ifoSwWQPLaRWuGrABTC7aXz6TOuyTGefYvCREf6GwNoyS4VZYHg8hp5lYclyQMkxk9V7KNoZXp9/FDOhDVHIM0CKNVciRbEmO18s1Oib//KSP33XP+BDmwOnM2rTAJ09dvxX1ZLzBT1U814yRHqKNqHCp7loQKxQhJsEJmbdIuirOm2JThjRnwktgmWTMWUFp8+q6KM7HyZjXOInyCYlZqXMjOZIAtl+FUkWiwkrRDLTyWTUIWOQ7Y7dtBbDZCibbY1+SFofRCbDhyDQdtfR2KgWWgP2O/e8/92P4c/evXl0NgvQqVOnEv7a+j+arsi7NcZ7g7qipynABMXgHwu+Du1BM8lUxKcqMXOxl5Nn8ZIvQSOLIjoJW2NLpG4grEVQQglGkppBVXXLMfxqjCTrIldpo1Ime5pkn8eQbfBBtIu0HxTiDtJ9EZpuBasnj6NVLiLg+epgKm9JO++Z/uKX/3byve+4bysIbYpBhcsKTt90Y62+0NodzJbJmDraXxcYupUZ5Vo2yZYJSpk1kUM2gYswaCvsLKtim+2OUyg9VcLqbIxdQwJFLn7mOYEBZh0jp6MdROwl0UEQX4cWZPcUa6FOlDKlY6MXUbsPYbVNc79CR0/tlWQofUmo7OYGTzagKzbDwpCVWrhPLvv/Of3lQ/sn8safiwMHeJXXfmwKoAPiQPDsg99cM1kdt7JsQzg+2v/jYWHRRWqfDCvNtE1GgIsKGS7REhtmqzMMq7OkTRPmkITxK2Os06E3SDJVT2J9XUGhGKHaitHHBplNL5Zh6Npkn5xmaC0RMTb4hbwDipVDwEZcSO8aOwxbAjk4NYjk1BCKXyNDY4q0TMYGEuuq9keek5QvEpqTrx2eLWiQF1kfqcuurAz0HEzYWU3pbcHbYAo+UkRprQJ3aQU+G2Z2ooq+xDIzjAdjTx7GThZ6uXlmJwouJSTBNki15mFxlimeIbRvSoZmslXS0SoKd7RAkjRS1BhSaSzDRppJAaMvs3po2WymdxaJdYbkBsuLvRrMm21UDpWhWhH0vAkhWUvKUHJuM+B0xmyKQZ2BV/3aTS/w5S2nH/zOFaHZulqytTFZS92FUnun36ggakVIjvRg7NpeTnIM0ZBJDaHR9E6Rcb3UJBWmuQx7J6/C/nTGaNOLBUgwVeuZCG2GmQa2ZuvsQb/IsNVpTgcmIPUzZBPUKu4YdbKd7JlslhlsprH+cQKkXkfZK2S4G5JlFd+LmhE9tXvidTQtmzs2DdC520297Rc71D156jMPvVVvNvNCNaHZnPy4jeE7JyG12M8xufFXZlXdpOlUWfE6/RRpZjfTZGFIDREb6JnouNQksx5LBMlkNU0zxo1FOPs6ZRSZQ3PbablmBlmCMr33qHT7ChnE0GNpJMhGOcdLROxA5lNenEjO12P/P8pG5hPcm+MVNndsGaDObU/d9+3L1IJ7r2bYySAmELqK/jtv4usCXK0AizVKvE6gYqZjJ00QKOIp0j+mZswUoba5w5HOkXVjXCzTm0HGCAIhVghKjttCA6ymVtjkr7JeasCXE7CY7sHtn5fUvLN7RMFvZ9w5p+T9cTiaPGFdcfncwL6B5uZg+fGobQGIT/BDtm6kg6gBM9ELf4Wpd3Gern0OyXGm/wafqsKCLmA4dDYdKL6SzFYITWrlf49ilKkqZmMfzFAAQ5I+K/JZErBeEBK7iRWDux6XIWAvTKnWsbixyus/g/xVe6BzN1bzDHZHlMPYPfGe4b1Xr/94eVt/t2WAjhw5YkQr7QO+okJNZCnO66hW1xA8UEZ2ykZqP7Wj05PmYmObsZC3yQhaD0XBC48fgnpyAcqlN7PgY0egQX1RyTC/RhfPNgb31dQUM9Eyi0w1Dzljsl27hoHLhnDskRNYP7YKeyyFzN5B6Lv796Ik0eZ29ky272Au3tpx8/rNPonxRJBUUPaLqKII45IeJAZ3obWaYlOduxN5Vo6jOqRrMgQji7A3g1Pf+R42npqhZ0tyY4OiGzEtOwSITTG4bHto3G6OGGrRKOTh/Et9IEkZpNcagtVjIHkdayLKuBn005DqzHjmgOSFH93aal49essACTbqRX/mww2/WbaG+5CYmkBieCfs0RFoO0awdEyuOTSc0ZSBViLE0jMFPP3PT2Dp0bPIW5Nw1tKos5ck5TLMYtQUgiJSNusjB88dPU6BJ4D9IxA7aGOY1aTsCLef2Qq5cQz6UIptjwbbs0m47LBFQjr44rceH331Mjf/ny2HWOfWV91ww9Lxr37rffVIeo8w5SGpx2pLcuIZNTPw9TOH5z648ZhzuwTuaRWYTKoBvFYIMz8MLcyiEbRQPFlF/wFahyZDkIyT2M8pfW8Vc4enkdxxArt+6SCiJJW42CIIZFt+EIZaRmZPSPFmH0nqZEDqta4n3GbjRk6pUxhuy7EtAHVmcvXtb3qALw9wouw9vNQPw5FPfW4greXeqNZoDcoVJLnr4Fn8YQIcWEzXUoNVsp5nV9BH6S1F5K6mEa3q8NM1nD28CE3OYOZr32W/OoGx226CPsnxLTbps0kEL7Z9uS+tptJskNGXBGzTslTl/ra2si3I/PAi2wbQjyb1Q3A6n4117Vcy2f50EG5AJTiCbsghYxKDI/wVhwatY1ZzeUSrEc7evQbjnwZg7dNw5vMF1J4PYVhpnqNh9dtPw3OieOS333BIGdOz7chtqXtH/y46XUw5Ed5L3l1pDCR1Jxnfs+/gwUd/NJdteLP9AJ03KTuduEJnApO5U6oaJruHBWhKFqqdgi+4w0pX7630QKNB7XQG1z/rQZsoYeMJhksfd1BdDXaWBpiZTK4KMf/Aix/b//H3vRKAr3YyKQsE5aoDBxrYWnfjvNn/4O0FBUikE5GkURzYUPfL/KECnbdpjrBNxDaGqRdj3bXM0QFT5U9glH6Nrj2BkO1WsCNoD9NmsElksYCUGUL6YC+zWY5p7tXHgQPbsw//6itvwYv9pIu98n+BJT0tJZld2PxyA7r43o4wW8w8tYVoNHNHXK/ebYeJX2jZDdBQkllJ1JLeZzBTvzWZFcOd5r6aoDMnQHFPOpZ7rcIr73GhP285zf+0CWoZ/VBZad7rJ3wnOzXG7JOFk1MOR5OZX77mrlufCoZTjymX90O5bhjm3jE4O5Nfmvvw2z+gjo98LLlnN8yJHRDcolZ301bk7I1oIDfz0+53Ib7rlLgX/Dj57cffZATmdUHLfeLk7YuP3yHuoK+giX/kkUtkNzykSnY2aMufdvfm/mZyctI9EsdKz79+87Np07qz07sO5NALRPS5qXcefP8Fn+wrbnBRAHrFPV/2ceHU0ZzX1hLj1778R+IdkPq+8fjvK1q8o+25X7Ev3XmsA97LBnc/dBHoItBFoItAF4EuAl0Eugh0Eegi0EWgi0AXgS4CXQS6CLxWBP4PG/l0wKRlppUAAAAASUVORK5CYII=" width="24" height="24" x="-12" y="-12"/>

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

            <g id="utsavEfMangoLeafSide1">
              <image href="${REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="56" preserveAspectRatio="xMidYMin meet"/>
            </g>
            <g id="utsavEfMangoLeafSide2">
              <image href="${REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="56" preserveAspectRatio="xMidYMin meet"/>
            </g>
            <g id="utsavEfMangoLeafSide3">
              <image href="${REAL_LEAVES.real_mango_leaf_1 || REAL_LEAVES.real_mango_leaf}" x="-10" y="0" width="20" height="56" preserveAspectRatio="xMidYMin meet"/>
            </g>
            <g id="utsavEfMangoLeafSide">
              <use href="#utsavEfMangoLeafSide1"/>
            </g>
            <g id="utsavEfBrassBellSide">
              <path d="M -6 0 C -5 6 -8 11 -8 13 L 8 13 C 8 11 5 6 6 0 Z" fill="#D4AF37"/>
              <ellipse cx="0" cy="13" rx="8" ry="2" fill="#B78103"/>
              <circle cx="0" cy="15" r="2.2" fill="#FFE082"/>
            </g>
          </defs>
        `;

        const efSideFlowers = [16, 40, 64, 88, 112, 136, 160, 184, 208, 232, 256, 280, 304, 328, 352, 376];
        const efSideLeaves = [28, 64, 100, 136, 172, 208, 244, 280, 316, 352];

        return `
          <svg viewBox="0 0 44 440" width="44" height="440" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            ${getDefs()}
            <!-- 1. Vertical Hanging Kalawa Cord (BEHIND FLOWERS) -->
            <line x1="22" y1="0" x2="22" y2="408" stroke="#D32F2F" stroke-width="2.8"/>

            <!-- 2. Series Lights Wiring (BEHIND FLOWERS) -->
            ${hasLights ? `
              <path d="M 22 10 Q 8 60 22 110 Q 36 160 22 210 Q 8 260 22 310 Q 36 360 22 385" stroke="#0D2B17" stroke-width="1.8" fill="none" opacity="0.95"/>
              <path d="M 22 12 Q 10 62 22 112 Q 34 162 22 212 Q 10 262 22 312 Q 34 362 22 387" stroke="#1B4D2E" stroke-width="1.2" fill="none" opacity="0.8"/>
            ` : ""}

            <!-- 3. Mango Leaves (Equal size authentic leaves, BEHIND FLOWERS) -->
            ${efSideLeaves.map((y, i) => `
              <use href="#utsavEfMangoLeafSide1" x="22" y="${y - 8}" transform="rotate(${i % 2 === 0 ? -32 : 32} 22 ${y - 8})"/>
            `).join('')}

            <!-- 4. Series Lights Bulbs -->
            ${hasLights ? sideBulbs : ""}

            <!-- 5. Real Cutout Flowers (Dense, zero-gap garland ON TOP of thread and wiring) -->
            ${efSideFlowers.map((y, i) => `
              <use href="${getFlowerHref(garlandStyle, i)}" x="22" y="${y}"/>
            `).join('')}

            <!-- 6. Brass Bell Finial connected directly to bottom flower -->
            <line x1="22" y1="376" x2="22" y2="408" stroke="#D32F2F" stroke-width="3"/>
            <circle cx="22" cy="402" r="3.2" fill="#D4AF37" stroke="#996515" stroke-width="0.8"/>
            <use href="#utsavEfBrassBellSide" x="22" y="405" transform="scale(1.2) translate(-3, -2)"/>
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

        // 22. Diwali / Default: Authentic Real Diya (Living Flame & Glow)
        const diyaKey = (motif && motif !== "default" ? motif : (diyaStyle && diyaStyle !== "default" ? diyaStyle : "marigold_urli")).toLowerCase();
        const imgSrc = REAL_DIYAS[diyaKey] || (
          diyaKey === "terracotta_clay" ? REAL_DIYAS.terracotta_clay :
          diyaKey === "marigold_urli" || diyaKey === "festive_ornamental" || diyaKey === "rangoli_diya" ? REAL_DIYAS.marigold_urli :
          diyaKey === "antique_copper" ? REAL_DIYAS.antique_copper :
          diyaKey === "royal_brass" ? REAL_DIYAS.royal_brass :
          diyaKey === "royal_crimson" ? REAL_DIYAS.royal_crimson :
          REAL_DIYAS.marigold_urli
        );

        const glowFilter = flameGlow === "divine_aura"
          ? "drop-shadow(0 0 20px rgba(255, 170, 0, 0.95))"
          : flameGlow === "sparkling_wick"
          ? "drop-shadow(0 0 14px rgba(255, 230, 90, 0.9))"
          : "drop-shadow(0 0 10px rgba(255, 140, 0, 0.82))";

        const height = Math.round(width * 0.82);

        return `
          <svg class="utsav-diya-svg" viewBox="0 0 80 66" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="filter: ${glowFilter};">
            <image href="${imgSrc}" x="0" y="0" width="80" height="66" preserveAspectRatio="xMidYMid meet"/>
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
    const urlDiya = urlParams.get("diya") || urlParams.get("utsav_diya") || urlParams.get("corner_motif") || urlParams.get("diya_style");

    // ─── Real-time Live Sync across tabs / windows ───────────
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const syncChannel = new BroadcastChannel("utsav_preview_sync");
        syncChannel.onmessage = function (ev) {
          if (ev && ev.data && (ev.data.cornerMotif || ev.data.diyaStyle || ev.data.garlandStyle || ev.data.garlandLayout)) {
            const incoming = ev.data;
            const targetFest = incoming.festivalId || previewFest || "diwali";
            const meta = FESTIVAL_META[targetFest.toLowerCase()] || {};
            const merged = Object.assign({}, window.__UTSAV_CONFIG__, incoming, {
              festivalId: targetFest,
              festivalName: meta.name || targetFest,
              festivalEmoji: meta.emoji || "✨",
              enableEffects: true
            });
            startFestiveEngine(merged);
          }
        };
      }
    } catch (_) {}

    window.addEventListener("storage", function (e) {
      if (e.key === "utsav_preview_sync" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data && (data.cornerMotif || data.diyaStyle)) {
            const targetFest = data.festivalId || previewFest || "diwali";
            const meta = FESTIVAL_META[targetFest.toLowerCase()] || {};
            const merged = Object.assign({}, window.__UTSAV_CONFIG__, data, {
              festivalId: targetFest,
              festivalName: meta.name || targetFest,
              festivalEmoji: meta.emoji || "✨",
              enableEffects: true
            });
            startFestiveEngine(merged);
          }
        } catch (_) {}
      }
      if (e.key === "utsav_preview_corner_motif" && e.newValue) {
        const targetFest = previewFest || "diwali";
        const meta = FESTIVAL_META[targetFest.toLowerCase()] || {};
        startFestiveEngine(Object.assign({}, window.__UTSAV_CONFIG__, {
          festivalId: targetFest,
          festivalName: meta.name || targetFest,
          festivalEmoji: meta.emoji || "✨",
          enableEffects: true,
          cornerMotif: e.newValue,
          diyaStyle: e.newValue
        }));
      }
    });

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "UTSAV_CONFIG_UPDATE") {
        const targetFest = e.data.festivalId || previewFest || "diwali";
        const meta = FESTIVAL_META[targetFest.toLowerCase()] || {};
        const merged = Object.assign({}, window.__UTSAV_CONFIG__, e.data, {
          festivalId: targetFest,
          festivalName: meta.name || targetFest,
          festivalEmoji: meta.emoji || "✨",
          enableEffects: true
        });
        startFestiveEngine(merged);
      }
    });

    if (previewFest) {
      const initMeta = FESTIVAL_META[previewFest.toLowerCase()] || {};
      const initCfg = Object.assign({}, window.__UTSAV_CONFIG__, {
        festivalId: previewFest,
        festivalName: initMeta.name || previewFest,
        festivalEmoji: initMeta.emoji || "✨",
        enableEffects: true,
        diyaPosition: "bottom_corners",
        diyaSize: "medium",
        diyaMarginX: 18,
        diyaMarginY: 18
      });
      if (urlDiya) {
        initCfg.cornerMotif = urlDiya;
        initCfg.diyaStyle = urlDiya;
      }
      startFestiveEngine(initCfg);

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
            if (urlDiya) {
              merged.cornerMotif = urlDiya;
              merged.diyaStyle = urlDiya;
            }
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
            if (urlDiya) {
              merged.cornerMotif = urlDiya;
              merged.diyaStyle = urlDiya;
            }
            startFestiveEngine(merged);
          } else if (data && data.active === false) {
            teardownExistingEffects();
          } else {
            const defCfg = Object.assign({}, window.__UTSAV_CONFIG__ || {});
            if (urlDiya) {
              defCfg.cornerMotif = urlDiya;
              defCfg.diyaStyle = urlDiya;
            }
            startFestiveEngine(defCfg);
          }
        })
        .catch(function () {
          const defCfg = Object.assign({}, window.__UTSAV_CONFIG__ || {});
          if (urlDiya) {
            defCfg.cornerMotif = urlDiya;
            defCfg.diyaStyle = urlDiya;
          }
          startFestiveEngine(defCfg);
        });
    }
  }

  if (document.readyState === "loading" || !document.body) {
    document.addEventListener("DOMContentLoaded", bootstrapper);
  } else {
    bootstrapper();
  }
})();
