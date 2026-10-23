import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Badge,
  Button,
  Tabs,
  Box,
  InlineStack,
  TextField,
  EmptyState,
  Divider,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  FESTIVALS,
  getFreeFestivals,
  getPremiumFestivals,
  getDaysUntilFestival,
} from "../data/festivals";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const configs = await prisma.festivalConfig.findMany({ where: { shop } });
  const subscription = await prisma.subscriptionPlan.findUnique({ where: { shop } });

  const configMap = {};
  configs.forEach((c) => {
    configMap[c.festivalId] = c;
  });

  return json({
    configMap,
    plan: subscription?.plan || "free",
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const festivalId = formData.get("festivalId");
  const actionType = formData.get("actionType"); // "activate" | "deactivate"

  if (!festivalId) return json({ error: "Missing festivalId" }, { status: 400 });

  const isActive = actionType === "activate";

  // If activating this festival, optionally deactivate others to keep 1 active theme at a time
  if (isActive) {
    await prisma.festivalConfig.updateMany({
      where: { shop },
      data: { isActive: false },
    });
  }

  await prisma.festivalConfig.upsert({
    where: { shop_festivalId: { shop, festivalId } },
    create: {
      shop,
      festivalId,
      isActive,
      enableBanner: true,
      enableEffects: true,
      enableCountdown: true,
      enableColorSwap: true,
      enableAudio: true,
      enableWheel: true,
      language: "en",
      diyaSize: "medium",
      diyaPosition: "bottom_corners",
      fireworksFrequency: "subtle",
      kiteCount: 2,
      kiteSpeed: "gentle",
      moonPosition: "top_right",
    },
    update: {
      isActive,
    },
  });

  return json({ success: true, festivalId, isActive });
};

export default function Festivals() {
  const { configMap, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const isPremium = plan === "premium";

  // Optimistic UI updates from fetcher if currently submitting
  const currentConfigMap = { ...configMap };
  if (fetcher.formData) {
    const festId = fetcher.formData.get("festivalId");
    const actType = fetcher.formData.get("actionType");
    if (festId) {
      if (actType === "activate") {
        Object.keys(currentConfigMap).forEach((k) => {
          if (currentConfigMap[k]) currentConfigMap[k] = { ...currentConfigMap[k], isActive: false };
        });
      }
      currentConfigMap[festId] = {
        ...(currentConfigMap[festId] || {}),
        isActive: actType === "activate",
      };
    }
  }

  const tabs = [
    { id: "all", content: `All (${FESTIVALS.length})` },
    { id: "free", content: `Free (${getFreeFestivals().length})` },
    { id: "premium", content: `Premium (${getPremiumFestivals().length})` },
    {
      id: "active",
      content: `Active (${Object.values(currentConfigMap).filter((c) => c?.isActive).length})`,
    },
  ];

  const getFilteredFestivals = () => {
    let festivals = FESTIVALS;
    if (selectedTab === 1) festivals = getFreeFestivals();
    else if (selectedTab === 2) festivals = getPremiumFestivals();
    else if (selectedTab === 3) festivals = FESTIVALS.filter((f) => currentConfigMap[f.id]?.isActive);

    if (searchValue) {
      const q = searchValue.toLowerCase();
      festivals = festivals.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.hindiName.includes(q) ||
          f.region.toLowerCase().includes(q) ||
          f.tags.some((t) => t.includes(q))
      );
    }
    return festivals;
  };

  const filtered = getFilteredFestivals();

  return (
    <Page
      title="🎊 Festival Library"
      subtitle="Browse and activate Indian festival themes for your store"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <TextField
              placeholder="Search festivals by name, region, or tags..."
              value={searchValue}
              onChange={setSearchValue}
              prefix={<SearchIcon />}
              clearButton
              onClearButtonClick={() => setSearchValue("")}
              autoComplete="off"
            />
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
          </BlockStack>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            heading="No festivals found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Try a different search term or clear the filter.</p>
          </EmptyState>
        ) : (
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
            {filtered.map((festival) => (
              <FestivalCard
                key={festival.id}
                festival={festival}
                config={currentConfigMap[festival.id]}
                isPremium={isPremium}
                fetcher={fetcher}
                onConfigure={() => navigate(`/app/festivals/${festival.id}`)}
              />
            ))}
          </InlineGrid>
        )}
      </BlockStack>
    </Page>
  );
}

function FestivalCard({ festival, config, isPremium, fetcher, onConfigure }) {
  const isLocked = festival.tier === "premium" && !isPremium;
  const isActive = config?.isActive || false;
  const daysUntil = getDaysUntilFestival(festival);
  const isSubmitting =
    fetcher.state !== "idle" && fetcher.formData?.get("festivalId") === festival.id;

  const { primary, secondary, accent } = festival.palette;

  const handleToggleActive = (e) => {
    e.stopPropagation();
    if (isLocked) {
      onConfigure();
      return;
    }
    const fd = new FormData();
    fd.append("festivalId", festival.id);
    fd.append("actionType", isActive ? "deactivate" : "activate");
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <Card>
      {/* Color Swatch Header */}
      <div
        onClick={onConfigure}
        style={{
          height: "80px",
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${accent} 100%)`,
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
          position: "relative",
          cursor: "pointer",
        }}
      >
        {festival.emoji}
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "#00a65a",
              color: "#fff",
              borderRadius: "12px",
              padding: "2px 10px",
              fontSize: "11px",
              fontWeight: 700,
              boxShadow: "0 0 10px rgba(0, 166, 90, 0.8)",
            }}
          >
            ● LIVE
          </div>
        )}
        {isLocked && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.6)",
              color: "#FFD700",
              borderRadius: "12px",
              padding: "2px 10px",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            🔒 PREMIUM
          </div>
        )}
      </div>

      <Box padding="400">
        <BlockStack gap="300">
          <div onClick={onConfigure} style={{ cursor: "pointer" }}>
            <BlockStack gap="100">
              <InlineStack align="space-between">
                <Text variant="headingMd" fontWeight="semibold">
                  {festival.name}
                </Text>
                <Text variant="bodySm" tone="subdued">
                  {festival.hindiName}
                </Text>
              </InlineStack>
              <Text variant="bodySm" tone="subdued">
                📍 {festival.region}
              </Text>
            </BlockStack>
          </div>

          <Text variant="bodySm" tone="subdued">
            {festival.description}
          </Text>

          <Divider />

          <InlineStack align="space-between" blockAlign="center">
            <Badge tone={daysUntil <= 7 ? "warning" : "info"}>
              {daysUntil === 0 ? "Today! 🎉" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil}d away`}
            </Badge>
            <Text variant="bodySm" tone="subdued">
              {festival.duration}d festival
            </Text>
          </InlineStack>

          {/* Color Palette Preview */}
          <InlineStack gap="100">
            {Object.values(festival.palette)
              .slice(0, 5)
              .map((color, i) => (
                <div
                  key={i}
                  title={color}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: color,
                    border: "2px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    flexShrink: 0,
                  }}
                />
              ))}
          </InlineStack>

          <InlineStack gap="200" wrap={false}>
            <div style={{ flex: 1 }}>
              <Button
                variant={isActive ? "secondary" : "primary"}
                tone={isActive ? "critical" : undefined}
                disabled={isLocked}
                loading={isSubmitting}
                onClick={handleToggleActive}
                fullWidth
              >
                {isActive ? "⏹ Deactivate" : isLocked ? "🔒 Upgrade" : "🪔 Activate"}
              </Button>
            </div>
            <Button onClick={onConfigure} variant="tertiary">
              ⚙️ Customize
            </Button>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
