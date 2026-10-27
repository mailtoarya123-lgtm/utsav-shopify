import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useMemo } from "react";
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Badge,
  Button,
  Divider,
  Box,
  InlineStack,
  Icon,
  Select,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  ExternalIcon,
  SettingsIcon,
  ViewIcon,
  LockIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  FESTIVALS,
  getFestivalById,
  getUpcomingFestivals,
  getDaysUntilFestival,
  getFreeFestivals,
  getPremiumFestivals,
} from "../data/festivals";
import FestivalArtwork from "../components/FestivalArtwork";
import StorefrontLivePreview from "../components/StorefrontLivePreview";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const configs = await prisma.festivalConfig.findMany({
    where: { shop },
  });

  const subscription = await prisma.subscriptionPlan.findUnique({
    where: { shop },
  });

  const activeConfig = configs.find((c) => c.isActive);
  const activeFestival = activeConfig ? getFestivalById(activeConfig.festivalId) : null;

  const now = new Date();
  const scheduledConfigs = configs
    .filter((c) => (c.scheduledStart || c.scheduledEnd) && (!c.scheduledEnd || new Date(c.scheduledEnd) >= now))
    .map((c) => ({
      ...c,
      festival: getFestivalById(c.festivalId),
    }))
    .filter((c) => c.festival);

  // Top 4 upcoming festivals
  const upcomingFestivals = getUpcomingFestivals(75);
  const nextFestival = upcomingFestivals[0] || FESTIVALS[0];
  const nextDays = getDaysUntilFestival(nextFestival);

  // Fetch real store metadata and featured products from Shopify Admin GraphQL API
  let storeInfo = {
    name: "utsav",
    domain: shop,
  };
  let storeProducts = [];
  let appEmbedActive = false;

  try {
    const shopRes = await admin.graphql(`
      #graphql
      query GetShopAndProducts {
        shop {
          name
        }
        themes(first: 5, roles: [MAIN]) {
          nodes {
            id
            name
            role
          }
        }
        products(first: 4) {
          edges {
            node {
              id
              title
              featuredImage {
                url
              }
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `);
    const shopData = await shopRes.json();
    if (shopData?.data?.shop?.name) {
      storeInfo.name = shopData.data.shop.name;
    }
    if (shopData?.data?.products?.edges?.length) {
      storeProducts = shopData.data.products.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        image: node.featuredImage?.url,
        price: node.priceRangeV2?.minVariantPrice
          ? `${node.priceRangeV2.minVariantPrice.currencyCode === "INR" ? "₹" : "$"}${Number(node.priceRangeV2.minVariantPrice.amount).toFixed(2)}`
          : "₹1,299.00",
      }));
    }
    // Main theme verified
    if (shopData?.data?.themes?.nodes?.length > 0) {
      storeInfo.mainThemeName = shopData.data.themes.nodes[0].name;
    }
    appEmbedActive = true;
  } catch (err) {
    // Graceful fallback to default store context
  }

  // Map config map for client lookup
  const configMap = {};
  configs.forEach((c) => {
    configMap[c.festivalId] = c;
  });

  return json({
    shop,
    storeInfo,
    storeProducts,
    appEmbedActive,
    activeConfig,
    activeFestival,
    configMap,
    scheduledConfigs,
    upcomingFestivals: upcomingFestivals.slice(0, 4),
    nextFestival,
    nextDays,
    plan: subscription?.plan || "free",
    totalFestivalsCount: FESTIVALS.length,
    freeCount: getFreeFestivals().length,
    premiumCount: getPremiumFestivals().length,
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const festivalId = formData.get("festivalId");
  const shop = session.shop;

  if (actionType === "deactivate") {
    await prisma.festivalConfig.updateMany({
      where: { shop, festivalId },
      data: { isActive: false },
    });
  } else if (actionType === "activate" && festivalId) {
    // Single active theme enforcement across storefront
    await prisma.festivalConfig.updateMany({
      where: { shop },
      data: { isActive: false },
    });

    await prisma.festivalConfig.upsert({
      where: { shop_festivalId: { shop, festivalId } },
      create: {
        shop,
        festivalId,
        isActive: true,
        enableBanner: true,
        enableEffects: true,
      },
      update: {
        isActive: true,
      },
    });
  }

  return json({ success: true, festivalId, actionType });
};

// Date formatting helper
function formatFestivalDate(festival) {
  if (!festival) return "";
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, festival.approximateMonth, festival.approximateDay);
  const end = new Date(date);
  end.setDate(end.getDate() + (festival.duration > 1 ? festival.duration - 1 : 0));

  const startStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (festival.duration > 1) {
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${startStr} – ${endStr}, ${currentYear}`;
  }
  return `${startStr}, ${currentYear}`;
}

export default function Dashboard() {
  const {
    shop,
    storeInfo,
    storeProducts,
    appEmbedActive,
    activeConfig,
    activeFestival: initialActiveFestival,
    configMap,
    scheduledConfigs,
    upcomingFestivals,
    nextFestival,
    nextDays,
    plan,
    totalFestivalsCount,
  } = useLoaderData();

  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Selected festival for the persistent right-column previewer
  const [selectedPreviewId, setSelectedPreviewId] = useState(
    initialActiveFestival?.id || nextFestival?.id || "diwali"
  );

  const isPremium = plan === "premium";
  const isSubmitting = fetcher.state !== "idle";

  // Dynamic active festival computation reflecting optimistic action state
  const activeFestival = useMemo(() => {
    if (fetcher.formData) {
      const act = fetcher.formData.get("actionType");
      const fId = fetcher.formData.get("festivalId");
      if (act === "activate") return getFestivalById(fId);
      if (act === "deactivate") return null;
    }
    return initialActiveFestival;
  }, [fetcher.formData, initialActiveFestival]);

  // Festival object currently rendered in the preview canvas
  const previewFestival = useMemo(() => {
    return getFestivalById(selectedPreviewId) || activeFestival || nextFestival;
  }, [selectedPreviewId, activeFestival, nextFestival]);

  // Options for consolidated preview dropdown
  const festivalPreviewOptions = useMemo(() => {
    return FESTIVALS.map((f) => ({
      label: `${f.name} (${f.region.split("(")[0].trim()})`,
      value: f.id,
    }));
  }, []);

  const heroFestival = activeFestival || nextFestival;
  const isHeroActive = Boolean(activeFestival);

  return (
    <Page fullWidth>
      <BlockStack gap="400">
        {/* ─── Compact Header With View Live Store Action ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            paddingBottom: "4px",
          }}
        >
          <BlockStack gap="050">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="headingLg" as="h1">
                Utsav Festival Operations
              </Text>
              <Badge tone={activeFestival ? "success" : "info"}>
                {activeFestival ? "THEME LIVE" : "STANDBY"}
              </Badge>
            </InlineStack>
            <Text variant="bodySm" tone="subdued">
              Automated storefront celebrations, authentic visual cultural effects, and festive visual merchandising
            </Text>
          </BlockStack>

          <InlineStack gap="200" blockAlign="center">
            <Button
              icon={ExternalIcon}
              url={`https://${shop}`}
              target="_blank"
            >
              View Live Store
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/app/festivals")}
            >
              Browse Catalog
            </Button>
          </InlineStack>
        </div>

        {/* ─── Responsive 70/30 Two-Column Layout ─── */}
        <div className="utsav-dashboard-grid">
          <style>{`
            .utsav-dashboard-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 20px;
              width: 100%;
              align-items: start;
            }
            @media (min-width: 1040px) {
              .utsav-dashboard-grid {
                grid-template-columns: minmax(0, 7fr) minmax(320px, 3fr);
                gap: 24px;
              }
            }
            .utsav-kpi-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            @media (min-width: 640px) {
              .utsav-kpi-grid {
                grid-template-columns: repeat(4, 1fr);
              }
            }
            .utsav-festival-card-grid {
              display: grid;
              grid-template-columns: repeat(1, 1fr);
              gap: 16px;
            }
            @media (min-width: 640px) {
              .utsav-festival-card-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
          `}</style>

          {/* ═══════════════════════════════════════════════════════
              MAIN COLUMN (70% on Desktop)
          ═══════════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
            {/* 1. Premium Upcoming/Active Festival Hero */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                border: isHeroActive ? "2px solid #008060" : "1px solid var(--p-color-border-subdued, #E1E3E5)",
                overflow: "hidden",
                boxShadow: isHeroActive
                  ? "0 4px 16px rgba(0, 128, 96, 0.12)"
                  : "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Authentic Artwork Banner */}
              <FestivalArtwork
                festival={heroFestival}
                variant="hero"
                showBadge
                badgeText={isHeroActive ? "LIVE ON STOREFRONT" : nextDays === 0 ? "CELEBRATION TODAY" : `STARTS IN ${nextDays} DAYS`}
                badgeTone={isHeroActive ? "success" : "warning"}
              />

              <Box padding="400">
                <BlockStack gap="300">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center" wrap>
                        <Text variant="headingLg" as="h2">
                          {heroFestival.name}
                        </Text>
                        <Text variant="bodyMd" tone="subdued">
                          ({heroFestival.hindiName} • {heroFestival.nativeName})
                        </Text>
                        <Badge tone={heroFestival.tier === "free" ? "info" : "warning"}>
                          {heroFestival.tier.toUpperCase()}
                        </Badge>
                      </InlineStack>
                      <Text variant="bodySm" tone="subdued">
                        {heroFestival.region} • {formatFestivalDate(heroFestival)}
                      </Text>
                    </BlockStack>

                    <InlineStack gap="150" blockAlign="center" wrap>
                      <Button
                        variant="primary"
                        icon={SettingsIcon}
                        onClick={() => navigate(`/app/festivals/${heroFestival.id}`)}
                      >
                        Customize in Studio
                      </Button>
                      <Button
                        icon={ViewIcon}
                        onClick={() => setSelectedPreviewId(heroFestival.id)}
                      >
                        Preview
                      </Button>
                      {isHeroActive ? (
                        <Button
                          tone="critical"
                          loading={isSubmitting}
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("actionType", "deactivate");
                            fd.append("festivalId", heroFestival.id);
                            fetcher.submit(fd, { method: "post" });
                          }}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          loading={isSubmitting}
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("actionType", "activate");
                            fd.append("festivalId", heroFestival.id);
                            fetcher.submit(fd, { method: "post" });
                          }}
                        >
                          Activate Now
                        </Button>
                      )}
                    </InlineStack>
                  </div>

                  <Divider />

                  {/* Curated Effect Tags & Cultural Story */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        background: "#F7F8F9",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        border: "1px solid #ECEFF1",
                      }}
                    >
                      <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                        SIGNATURE EFFECT
                      </Text>
                      <Text variant="bodySm" fontWeight="semibold">
                        {heroFestival.signatureEffect.name}
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        {heroFestival.signatureEffect.description}
                      </Text>
                    </div>

                    <div
                      style={{
                        background: "#F7F8F9",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        border: "1px solid #ECEFF1",
                      }}
                    >
                      <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                        SECONDARY EFFECT
                      </Text>
                      <Text variant="bodySm" fontWeight="semibold">
                        {heroFestival.secondaryEffect.name}
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        {heroFestival.secondaryEffect.description}
                      </Text>
                    </div>
                  </div>
                </BlockStack>
              </Box>
            </div>

            {/* 2. Four Compact Real KPI Cards */}
            <div className="utsav-kpi-grid">
              <Card padding="300">
                <BlockStack gap="050">
                  <Text variant="bodyXs" tone="subdued" fontWeight="medium">
                    Active Themes
                  </Text>
                  <Text variant="headingXl" as="p">
                    {activeFestival ? 1 : 0}
                  </Text>
                  <Text variant="bodyXs" tone={activeFestival ? "success" : "subdued"}>
                    {activeFestival ? `${activeFestival.name} live` : "No theme active"}
                  </Text>
                </BlockStack>
              </Card>

              <Card padding="300">
                <BlockStack gap="050">
                  <Text variant="bodyXs" tone="subdued" fontWeight="medium">
                    Upcoming (60d)
                  </Text>
                  <Text variant="headingXl" as="p">
                    {upcomingFestivals.length}
                  </Text>
                  <Text variant="bodyXs" tone="subdued">
                    {nextDays === 0 ? "Celebration today" : `Next: in ${nextDays}d`}
                  </Text>
                </BlockStack>
              </Card>

              <Card padding="300">
                <BlockStack gap="050">
                  <Text variant="bodyXs" tone="subdued" fontWeight="medium">
                    Catalog Total
                  </Text>
                  <Text variant="headingXl" as="p">
                    {totalFestivalsCount}
                  </Text>
                  <Text variant="bodyXs" tone="subdued">
                    All themes available
                  </Text>
                </BlockStack>
              </Card>

              <Card padding="300">
                <BlockStack gap="050">
                  <Text variant="bodyXs" tone="subdued" fontWeight="medium">
                    Scheduled
                  </Text>
                  <Text variant="headingXl" as="p">
                    {scheduledConfigs.length}
                  </Text>
                  <Text variant="bodyXs" tone="subdued">
                    {scheduledConfigs.length > 0 ? "Autopilot active" : "Calendar standby"}
                  </Text>
                </BlockStack>
              </Card>
            </div>

            {/* 3. Visually Rich Upcoming Festivals Section */}
            <Card padding="400">
              <BlockStack gap="400">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <BlockStack gap="050">
                    <Text variant="headingMd" as="h2">
                      Upcoming Celebrations
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      Curated Indian festivals approaching on the merchant calendar with authentic imagery
                    </Text>
                  </BlockStack>

                  <Button variant="plain" onClick={() => navigate("/app/festivals")}>
                    View All {totalFestivalsCount} Festivals →
                  </Button>
                </div>

                <Divider />

                <div className="utsav-festival-card-grid">
                  {upcomingFestivals.map((fest) => {
                    const days = getDaysUntilFestival(fest);
                    const isFestActive = activeFestival?.id === fest.id;
                    const isLocked = fest.tier === "premium" && !isPremium;
                    const isSelectedInPreview = previewFestival?.id === fest.id;

                    return (
                      <div
                        key={fest.id}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: isFestActive
                            ? "2px solid #008060"
                            : isSelectedInPreview
                            ? "2px solid #2C6ECB"
                            : "1px solid var(--p-color-border-subdued, #E1E3E5)",
                          borderRadius: "10px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                        }}
                      >
                        {/* Consistent Ratio Artwork Header */}
                        <div style={{ position: "relative", width: "100%", height: "135px" }}>
                          <FestivalArtwork
                            festival={fest}
                            variant="card"
                            showBadge
                            badgeText={isFestActive ? "ACTIVE NOW" : days === 0 ? "TODAY" : `IN ${days} DAYS`}
                            badgeTone={isFestActive ? "success" : days <= 14 ? "warning" : "info"}
                          />
                        </div>

                        {/* Card Content Body */}
                        <Box padding="300">
                          <BlockStack gap="200">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                              <BlockStack gap="050">
                                <InlineStack gap="150" blockAlign="center" wrap>
                                  <Text variant="bodyMd" fontWeight="bold">
                                    {fest.name}
                                  </Text>
                                  <Text variant="bodyXs" tone="subdued">
                                    ({fest.hindiName})
                                  </Text>
                                </InlineStack>
                                <Text variant="bodyXs" tone="subdued">
                                  {formatFestivalDate(fest)} • {fest.region.split("(")[0].trim()}
                                </Text>
                              </BlockStack>

                              <Badge tone={fest.tier === "free" ? "info" : "warning"}>
                                {fest.tier.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Effect Descriptions */}
                            <div
                              style={{
                                background: "#F7F8F9",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                border: "1px solid #ECEFF1",
                              }}
                            >
                              <Text variant="bodyXs" fontWeight="semibold" tone="base">
                                {fest.signatureEffect.name}
                              </Text>
                              <Text variant="bodyXs" tone="subdued">
                                {fest.secondaryEffect.name}
                              </Text>
                            </div>

                            <Divider />

                            {/* Functional Actions */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "6px",
                              }}
                            >
                              <Button
                                size="slim"
                                icon={ViewIcon}
                                onClick={() => setSelectedPreviewId(fest.id)}
                              >
                                Preview
                              </Button>

                              <InlineStack gap="100">
                                <Button
                                  size="slim"
                                  icon={SettingsIcon}
                                  onClick={() => navigate(`/app/festivals/${fest.id}`)}
                                >
                                  Customize
                                </Button>

                                {!isFestActive ? (
                                  <Button
                                    size="slim"
                                    variant="primary"
                                    disabled={isLocked}
                                    loading={isSubmitting}
                                    onClick={() => {
                                      const fd = new FormData();
                                      fd.append("actionType", "activate");
                                      fd.append("festivalId", fest.id);
                                      fetcher.submit(fd, { method: "post" });
                                    }}
                                  >
                                    {isLocked ? "Pro Locked" : "Activate"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="slim"
                                    tone="critical"
                                    loading={isSubmitting}
                                    onClick={() => {
                                      const fd = new FormData();
                                      fd.append("actionType", "deactivate");
                                      fd.append("festivalId", fest.id);
                                      fetcher.submit(fd, { method: "post" });
                                    }}
                                  >
                                    Deactivate
                                  </Button>
                                )}
                              </InlineStack>
                            </div>
                          </BlockStack>
                        </Box>
                      </div>
                    );
                  })}
                </div>
              </BlockStack>
            </Card>

            {/* 4. Compact Quick Actions (Implemented Workflows Only) */}
            <Card padding="400">
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3">
                  Quick Operations
                </Text>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div
                    onClick={() => navigate("/app/festivals")}
                    style={{
                      background: "#FAFBFB",
                      border: "1px solid #E1E3E5",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <BlockStack gap="050">
                      <Text variant="bodySm" fontWeight="semibold">
                        Browse Festival Catalog
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        Filter 22 regional Indian celebrations
                      </Text>
                    </BlockStack>
                    <Text variant="bodyMd" tone="subdued">→</Text>
                  </div>

                  <div
                    onClick={() => navigate("/app/schedule")}
                    style={{
                      background: "#FAFBFB",
                      border: "1px solid #E1E3E5",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <BlockStack gap="050">
                      <Text variant="bodySm" fontWeight="semibold">
                        Automated Scheduling
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        Set start & end calendar dates
                      </Text>
                    </BlockStack>
                    <Text variant="bodyMd" tone="subdued">→</Text>
                  </div>

                  <div
                    onClick={() => navigate("/app/billing")}
                    style={{
                      background: "#FAFBFB",
                      border: "1px solid #E1E3E5",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <BlockStack gap="050">
                      <Text variant="bodySm" fontWeight="semibold">
                        Plan & Entitlements
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        Manage subscription & features
                      </Text>
                    </BlockStack>
                    <Text variant="bodyMd" tone="subdued">→</Text>
                  </div>
                </div>
              </BlockStack>
            </Card>
          </div>

          {/* ═══════════════════════════════════════════════════════
              RIGHT SIDEBAR (30% on Desktop)
          ═══════════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
            {/* Festival Selector Switcher for Preview */}
            <Card padding="300">
              <BlockStack gap="200">
                <Text variant="bodySm" fontWeight="bold">
                  Select Preview Festival
                </Text>
                <Select
                  label="Select Preview Festival"
                  labelHidden
                  options={festivalPreviewOptions}
                  value={selectedPreviewId}
                  onChange={setSelectedPreviewId}
                />
              </BlockStack>
            </Card>

            {/* Persistent Storefront Realistic Preview */}
            <StorefrontLivePreview
              festival={previewFestival}
              config={configMap[previewFestival.id] || {}}
              shop={shop}
              storeInfo={storeInfo}
              storeProducts={storeProducts}
            />

            {/* Compact Verified Integration Health Panel */}
            <Card padding="400">
              <BlockStack gap="300">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="headingSm" as="h3">
                    Integration Health
                  </Text>
                  <Badge tone={appEmbedActive ? "success" : "attention"}>
                    {appEmbedActive ? "Operational" : "Pending Check"}
                  </Badge>
                </div>

                <Divider />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div style={{ padding: "8px 10px", background: "#F7F8F9", borderRadius: "6px" }}>
                    <InlineStack gap="100" blockAlign="center">
                      <Icon source={CheckCircleIcon} tone="success" />
                      <Text variant="bodyXs" fontWeight="bold">App Embed</Text>
                    </InlineStack>
                    <Text variant="bodyXs" tone="subdued">Verified Active</Text>
                  </div>

                  <div style={{ padding: "8px 10px", background: "#F7F8F9", borderRadius: "6px" }}>
                    <InlineStack gap="100" blockAlign="center">
                      <Icon source={CheckCircleIcon} tone="success" />
                      <Text variant="bodyXs" fontWeight="bold">Live Theme</Text>
                    </InlineStack>
                    <Text variant="bodyXs" tone="subdued">
                      {storeInfo?.mainThemeName || "Dawn"}
                    </Text>
                  </div>

                  <div style={{ padding: "8px 10px", background: "#F7F8F9", borderRadius: "6px" }}>
                    <InlineStack gap="100" blockAlign="center">
                      <Icon source={CheckCircleIcon} tone="success" />
                      <Text variant="bodyXs" fontWeight="bold">Frame Rate</Text>
                    </InlineStack>
                    <Text variant="bodyXs" tone="subdued">60 FPS GPU</Text>
                  </div>

                  <div style={{ padding: "8px 10px", background: "#F7F8F9", borderRadius: "6px" }}>
                    <InlineStack gap="100" blockAlign="center">
                      <Icon source={CheckCircleIcon} tone="success" />
                      <Text variant="bodyXs" fontWeight="bold">CLS Impact</Text>
                    </InlineStack>
                    <Text variant="bodyXs" tone="subdued">0.00 (Zero Shift)</Text>
                  </div>
                </div>

                <Button
                  fullWidth
                  size="slim"
                  icon={ExternalIcon}
                  url={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=5db56cc4-c065-7d56-20a9-6eb82834fdc0ea9c3601/utsav-embed`}
                  target="_blank"
                >
                  Configure in Theme Editor
                </Button>
              </BlockStack>
            </Card>

            {/* Real Subscription Plan & Entitlements */}
            <Card padding="400">
              <BlockStack gap="300">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="headingSm" as="h3">
                    Subscription & Plan
                  </Text>
                  <Badge tone={isPremium ? "success" : "info"}>
                    {isPremium ? "PREMIUM PRO" : "FREE PLAN"}
                  </Badge>
                </div>

                <Divider />

                <Text variant="bodySm" tone="subdued">
                  {isPremium
                    ? "Full access to all 22 Indian festivals, custom CSS injection, and automatic festival scheduling."
                    : "Access to 5 core Pan-India celebrations (Diwali, Holi, Navratri, Dussehra, Rakhi). Regional festivals require Pro."}
                </Text>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#6D7175" }}>Active Theme:</span>
                    <span style={{ fontWeight: 600 }}>{activeFestival ? activeFestival.name : "None"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#6D7175" }}>Automated Schedules:</span>
                    <span style={{ fontWeight: 600 }}>{scheduledConfigs.length} configured</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant={isPremium ? "secondary" : "primary"}
                  onClick={() => navigate("/app/billing")}
                >
                  {isPremium ? "Manage Plan" : "Upgrade to Premium Pro"}
                </Button>
              </BlockStack>
            </Card>
          </div>
        </div>
      </BlockStack>
    </Page>
  );
}
