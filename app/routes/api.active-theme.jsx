import { json } from "@remix-run/node";
import prisma from "../db.server";
import { getFestivalById } from "../data/festivals";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop");
  const previewParam = url.searchParams.get("preview");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  if (!shopParam) {
    return json({ active: false, error: "Missing shop parameter" }, { headers: corsHeaders });
  }

  const shopClean = shopParam.replace(/^https?:\/\//, "").split("/")[0].trim().toLowerCase();

  try {
    const now = new Date();

    // ─── 1. Instant Preview Mode for Live Storefront ────────────────────────
    if (previewParam) {
      const previewId = previewParam.toLowerCase();
      const previewConfig = await prisma.festivalConfig.findFirst({
        where: {
          shop: { contains: shopClean.split(".")[0] },
          festivalId: previewId,
        },
      });

      const festival = getFestivalById(previewId);

      if (previewConfig) {
        let custom = {};
        if (previewConfig.customColors) {
          try { custom = JSON.parse(previewConfig.customColors); } catch(e) {}
        }
        return json({
          active: true,
          isPreview: true,
          festivalId: previewId,
          config: {
            ...previewConfig,
            ...custom,
            festivalName: festival ? festival.name : undefined,
            festivalEmoji: festival ? festival.emoji : undefined,
            palette: festival ? festival.palette : undefined,
          },
          festival: festival ? {
            name: festival.name,
            hindiName: festival.hindiName,
            emoji: festival.emoji,
            palette: festival.palette,
            signatureEffect: festival.signatureEffect,
            secondaryEffect: festival.secondaryEffect,
          } : null,
        }, { headers: corsHeaders });
      }

      // Return default festival structure if no database record yet
      return json({
        active: true,
        isPreview: true,
        festivalId: previewId,
        config: {
          festivalId: previewId,
          festivalName: festival ? festival.name : "Festival",
          festivalEmoji: festival ? festival.emoji : "🪔",
          palette: festival ? festival.palette : undefined,
          enableEffects: true,
          enableBanner: false,
          garlandLayout: "top_and_sides",
          garlandPlacement: "below_header",
          garlandScrollMode: "natural_scroll",
          enableSeriesLights: previewId.includes("diwali"),
          seriesLightsTheme: "warm_gold",
          seriesLightsMode: "twinkle",
          diyaStyle: "royal_brass",
          flameGlow: "sacred_flicker",
          diyaSize: "medium",
          diyaPosition: "bottom_corners",
          diyaMarginX: 18,
          diyaMarginY: 18,
          diyaHideOnMobile: false,
        },
        festival: festival ? {
          name: festival.name,
          hindiName: festival.hindiName,
          emoji: festival.emoji,
          palette: festival.palette,
        } : null,
      }, { headers: corsHeaders });
    }

    // ─── 2. Manually Active Theme ──────────────────────────────────────────
    let activeConfig = await prisma.festivalConfig.findFirst({
      where: {
        shop: { contains: shopClean.split(".")[0] },
        isActive: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // ─── 3. Automated Scheduled Campaign ───────────────────────────────────
    if (!activeConfig) {
      const scheduledConfig = await prisma.festivalConfig.findFirst({
        where: {
          shop: { contains: shopClean.split(".")[0] },
          scheduledStart: { lte: now },
          OR: [
            { scheduledEnd: null },
            { scheduledEnd: { gte: now } },
          ],
        },
        orderBy: { updatedAt: "desc" },
      });

      if (scheduledConfig) {
        activeConfig = scheduledConfig;
      }
    }

    // Auto-deactivate any config whose schedule has expired
    await prisma.festivalConfig.updateMany({
      where: {
        shop: { contains: shopClean.split(".")[0] },
        isActive: true,
        scheduledEnd: { lt: now },
      },
      data: { isActive: false },
    });

    if (!activeConfig) {
      return json({ active: false }, { headers: corsHeaders });
    }

    let custom = {};
    if (activeConfig.customColors) {
      try { custom = JSON.parse(activeConfig.customColors); } catch(e) {}
    }

    const festival = getFestivalById(activeConfig.festivalId);

    return json({
      active: true,
      festivalId: activeConfig.festivalId,
      config: {
        ...activeConfig,
        ...custom,
        festivalName: festival ? festival.name : undefined,
        festivalEmoji: festival ? festival.emoji : undefined,
        palette: festival ? festival.palette : undefined,
      },
      festival: festival ? {
        name: festival.name,
        hindiName: festival.hindiName,
        emoji: festival.emoji,
        palette: festival.palette,
        signatureEffect: festival.signatureEffect,
        secondaryEffect: festival.secondaryEffect,
      } : null,
    }, { headers: corsHeaders });
  } catch (err) {
    return json({ active: false, error: err.message }, { headers: corsHeaders });
  }
};
