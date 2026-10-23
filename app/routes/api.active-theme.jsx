import { json } from "@remix-run/node";
import prisma from "../db.server";
import { getFestivalById } from "../data/festivals";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!shop) {
    return json({ active: false, error: "Missing shop parameter" }, { headers: corsHeaders });
  }

  try {
    const now = new Date();

    // 1. Check for manually active configuration
    let activeConfig = await prisma.festivalConfig.findFirst({
      where: { shop, isActive: true },
    });

    // 2. If no manual active theme, check scheduled window
    if (!activeConfig) {
      const scheduledConfig = await prisma.festivalConfig.findFirst({
        where: {
          shop,
          scheduledStart: { lte: now },
          OR: [
            { scheduledEnd: null },
            { scheduledEnd: { gte: now } },
          ],
        },
      });

      if (scheduledConfig) {
        activeConfig = scheduledConfig;
      }
    }

    // 3. Auto-deactivate any config whose schedule has expired
    await prisma.festivalConfig.updateMany({
      where: {
        shop,
        isActive: true,
        scheduledEnd: { lt: now },
      },
      data: { isActive: false },
    });

    if (!activeConfig) {
      return json({ active: false }, { headers: corsHeaders });
    }

    const festival = getFestivalById(activeConfig.festivalId);

    return json({
      active: true,
      festivalId: activeConfig.festivalId,
      config: activeConfig,
      festival: festival ? {
        name: festival.name,
        hindiName: festival.hindiName,
        emoji: festival.emoji,
        palette: festival.palette,
      } : null,
    }, { headers: corsHeaders });
  } catch (err) {
    return json({ active: false, error: err.message }, { headers: corsHeaders });
  }
};
