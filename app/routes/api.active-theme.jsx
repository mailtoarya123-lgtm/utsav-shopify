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
    const activeConfigs = await prisma.festivalConfig.findMany({
      where: { shop, isActive: true },
    });

    if (!activeConfigs || activeConfigs.length === 0) {
      return json({ active: false }, { headers: corsHeaders });
    }

    const activeConfig = activeConfigs[0];
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
