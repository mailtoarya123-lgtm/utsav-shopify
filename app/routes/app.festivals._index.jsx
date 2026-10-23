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
  Tabs,
  Box,
  InlineStack,
  TextField,
  Select,
  Divider,
  Modal,
} from "@shopify/polaris";
import {
  SearchIcon,
  ViewIcon,
  SettingsIcon,
  ExternalIcon,
  LockIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  FESTIVALS,
  getFreeFestivals,
  getPremiumFestivals,
  getDaysUntilFestival,
} from "../data/festivals";
import FestivalArtwork from "../components/FestivalArtwork";

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
    shop,
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

  if (isActive) {
    // Single active theme rule
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
    },
    update: {
      isActive,
    },
  });

  return json({ success: true, festivalId, isActive });
};

// Format approximate holiday calendar date with current year
function getFormattedFestivalDate(festival) {
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

export default function FestivalLibrary() {
  const { shop, configMap, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState("upcoming");

  // In-admin preview modal state
  const [previewFestival, setPreviewFestival] = useState(null);

  const isPremium = plan === "premium";
  const isSubmitting = fetcher.state !== "idle";

  // Compute live active ID dynamically reflecting optimistic action state
  const activeFestivalId = useMemo(() => {
    if (fetcher.formData) {
      const act = fetcher.formData.get("actionType");
      const fId = fetcher.formData.get("festivalId");
      if (act === "activate") return fId;
      if (act === "deactivate") return null;
    }
    const found = Object.keys(configMap).find((k) => configMap[k]?.isActive);
    return found || null;
  }, [configMap, fetcher.formData]);

  const tabs = [
    { id: "all", content: `All Festivals (${FESTIVALS.length})` },
    { id: "free", content: `Free Included (${getFreeFestivals().length})` },
    { id: "premium", content: `Premium Catalog (${getPremiumFestivals().length})` },
    { id: "active", content: `Active on Store (${activeFestivalId ? 1 : 0})` },
  ];

  const regionOptions = useMemo(() => {
    const set = new Set();
    FESTIVALS.forEach((f) => {
      const firstWord = f.region.split("(")[0].trim();
      set.add(firstWord);
    });
    return [
      { label: "All Regions", value: "all" },
      ...Array.from(set).map((r) => ({ label: r, value: r })),
    ];
  }, []);

  const filteredFestivals = useMemo(() => {
    let list = [...FESTIVALS];

    // Tab filter
    if (selectedTab === 1) list = list.filter((f) => f.tier === "free");
    else if (selectedTab === 2) list = list.filter((f) => f.tier === "premium");
    else if (selectedTab === 3) list = list.filter((f) => f.id === activeFestivalId);

    // Region filter
    if (selectedRegion !== "all") {
      list = list.filter((f) => f.region.toLowerCase().includes(selectedRegion.toLowerCase()));
    }

    // Search query filter
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.hindiName && f.hindiName.includes(q)) ||
          (f.nativeName && f.nativeName.toLowerCase().includes(q)) ||
          f.region.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.signatureEffect?.name && f.signatureEffect.name.toLowerCase().includes(q)) ||
          (f.secondaryEffect?.name && f.secondaryEffect.name.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "upcoming") {
      list.sort((a, b) => getDaysUntilFestival(a) - getDaysUntilFestival(b));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tier") {
      list.sort((a, b) => a.tier.localeCompare(b.tier));
    }

    return list;
  }, [selectedTab, selectedRegion, searchValue, sortBy, activeFestivalId]);

  return (
    <Page
      title="Festival Catalog"
      subtitle="Explore 22 authentic Indian festival experiences with curated visual effects and cultural traditions"
      backAction={{ content: "Dashboard", url: "/app" }}
      primaryAction={{
        content: "View Schedule Calendar",
        onAction: () => navigate("/app/schedule"),
      }}
    >
      <BlockStack gap="500">
        {/* Search, Filter Tabs & Sort Controls */}
        <Card padding="400">
          <BlockStack gap="400">
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
            <Divider />

            <InlineGrid columns={{ xs: 1, sm: "2fr 1fr 1fr" }} gap="300">
              <TextField
                label="Search festivals"
                labelHidden
                placeholder="Search by festival, native name, region, or effect (e.g. Diya, Kolam, Kanikonna)..."
                value={searchValue}
                onChange={setSearchValue}
                prefix={<SearchIcon />}
                clearButton
                onClearButtonClick={() => setSearchValue("")}
                autoComplete="off"
              />
              <Select
                label="Filter by Region"
                labelHidden
                options={regionOptions}
                value={selectedRegion}
                onChange={setSelectedRegion}
              />
              <Select
                label="Sort Order"
                labelHidden
                options={[
                  { label: "Sort: Upcoming Soonest", value: "upcoming" },
                  { label: "Sort: Alphabetical (A-Z)", value: "name" },
                  { label: "Sort: Tier (Free / Pro)", value: "tier" },
                ]}
                value={sortBy}
                onChange={setSortBy}
              />
            </InlineGrid>
          </BlockStack>
        </Card>

        {/* Festival Cards Grid */}
        {filteredFestivals.length === 0 ? (
          <Card padding="600">
            <BlockStack gap="300" align="center" inlineAlign="center">
              <Text variant="headingMd" tone="subdued" alignment="center">
                No festival themes found matching your criteria
              </Text>
              <Text variant="bodySm" tone="subdued" alignment="center">
                Try searching for a different holiday name or reset your filters.
              </Text>
              <Button
                onClick={() => {
                  setSearchValue("");
                  setSelectedRegion("all");
                  setSelectedTab(0);
                }}
              >
                Reset All Filters
              </Button>
            </BlockStack>
          </Card>
        ) : (
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
            {filteredFestivals.map((festival) => {
              const isActive = activeFestivalId === festival.id;
              const isLocked = festival.tier === "premium" && !isPremium;
              const daysUntil = getDaysUntilFestival(festival);
              const dateRange = getFormattedFestivalDate(festival);

              const p = festival.palette || {};
              const swatchColors = [
                p.primary || "#FFD700",
                p.secondary || "#FF6B35",
                p.accent || "#8B0000",
                p.background || "#1A0A00",
              ];

              return (
                <div
                  key={festival.id}
                  style={{
                    backgroundColor: "var(--p-color-bg-surface, #FFFFFF)",
                    border: isActive
                      ? "2px solid #008060"
                      : "1px solid var(--p-color-border-subdued, #E1E3E5)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(0, 128, 96, 0.15)"
                      : "0 1px 3px rgba(0, 0, 0, 0.05)",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  {/* Dedicated Authentic Artwork Banner */}
                  <div style={{ position: "relative" }}>
                    <FestivalArtwork
                      festival={festival}
                      variant="card"
                    />

                    {/* Left Status Badge Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        zIndex: 2,
                      }}
                    >
                      {isActive ? (
                        <div
                          style={{
                            backgroundColor: "#008060",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: "9px" }}>●</span> LIVE
                        </div>
                      ) : isLocked ? (
                        <div
                          style={{
                            backgroundColor: "#D97706",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          PRO
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#2563EB",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          }}
                        >
                          FREE
                        </div>
                      )}
                    </div>

                    {/* Right Days Away Countdown Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 2,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {daysUntil === 0 ? "Today" : `In ${daysUntil} days`}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <Box padding="400">
                    <BlockStack gap="300">
                      {/* Title & Native Names */}
                      <BlockStack gap="050">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingMd" fontWeight="bold">
                            {festival.name}
                          </Text>
                          <Text variant="bodySm" tone="subdued">
                            {festival.hindiName}
                          </Text>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">
                          {festival.nativeName}
                        </Text>
                      </BlockStack>

                      {/* Date & Region Metadata */}
                      <BlockStack gap="050">
                        <Text variant="bodyXs" fontWeight="medium">
                          {dateRange}
                        </Text>
                        <Text variant="bodyXs" tone="subdued">
                          {festival.region}
                        </Text>
                      </BlockStack>

                      {/* Compact Curated Effect Tags */}
                      <Box
                        padding="200"
                        background="bg-surface-secondary"
                        borderRadius="150"
                      >
                        <BlockStack gap="050">
                          <Text variant="bodyXs" fontWeight="semibold">
                            ✨ {festival.signatureEffect.name}
                          </Text>
                          <Text variant="bodyXs" tone="subdued">
                            ✦ {festival.secondaryEffect.name}
                          </Text>
                        </BlockStack>
                      </Box>

                      {/* Harmonious Color Swatches */}
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodyXs" tone="subdued">
                          Palette Harmony:
                        </Text>
                        <InlineStack gap="100" blockAlign="center">
                          {swatchColors.map((hex, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                backgroundColor: hex,
                                border: "1px solid rgba(0,0,0,0.15)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                              }}
                              title={hex}
                            />
                          ))}
                        </InlineStack>
                      </InlineStack>

                      <Divider />

                      {/* Action Controls Row */}
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="150">
                          <Button
                            size="slim"
                            icon={ViewIcon}
                            onClick={() => setPreviewFestival(festival)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="slim"
                            icon={SettingsIcon}
                            onClick={() => navigate(`/app/festivals/${festival.id}`)}
                          >
                            Customize
                          </Button>
                        </InlineStack>

                        <div>
                          {isActive ? (
                            <Button
                              size="slim"
                              tone="critical"
                              loading={isSubmitting}
                              onClick={() => {
                                const fd = new FormData();
                                fd.append("actionType", "deactivate");
                                fd.append("festivalId", festival.id);
                                fetcher.submit(fd, { method: "post" });
                              }}
                            >
                              Deactivate
                            </Button>
                          ) : isLocked ? (
                            <Button
                              size="slim"
                              icon={LockIcon}
                              onClick={() => navigate("/app/billing")}
                            >
                              Upgrade
                            </Button>
                          ) : (
                            <Button
                              size="slim"
                              variant="primary"
                              loading={isSubmitting}
                              onClick={() => {
                                const fd = new FormData();
                                fd.append("actionType", "activate");
                                fd.append("festivalId", festival.id);
                                fetcher.submit(fd, { method: "post" });
                              }}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                </div>
              );
            })}
          </InlineGrid>
        )}

        {/* Real Interactive Effect Preview Modal */}
        {previewFestival && (
          <Modal
            open={Boolean(previewFestival)}
            onClose={() => setPreviewFestival(null)}
            title={`Preview ${previewFestival.name} Experience`}
            primaryAction={{
              content: "Customize in Studio",
              icon: SettingsIcon,
              onAction: () => {
                const id = previewFestival.id;
                setPreviewFestival(null);
                navigate(`/app/festivals/${id}`);
              },
            }}
            secondaryActions={[
              {
                content: "Open Live Storefront Preview",
                icon: ExternalIcon,
                url: `https://${shop}/?utsav_preview=${previewFestival.id}`,
                external: true,
              },
            ]}
          >
            <Modal.Section>
              <BlockStack gap="400">
                {/* Hero Artwork Preview inside Modal */}
                <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                  <FestivalArtwork
                    festival={previewFestival}
                    variant="hero"
                    showBadge
                    badgeText={previewFestival.tier.toUpperCase()}
                    badgeTone={previewFestival.tier === "free" ? "info" : "warning"}
                  />
                </div>

                {/* Cultural & Effect Breakdown */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" fontWeight="bold">
                      {previewFestival.name} ({previewFestival.hindiName})
                    </Text>
                    <Badge tone="info">{previewFestival.region}</Badge>
                  </InlineStack>
                  <Text variant="bodySm" tone="subdued">
                    {previewFestival.culturalContext}
                  </Text>
                </BlockStack>

                <Divider />

                <InlineGrid columns={2} gap="300">
                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="100">
                      <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                        SIGNATURE EFFECT
                      </Text>
                      <Text variant="bodySm" fontWeight="semibold">
                        {previewFestival.signatureEffect.name}
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        {previewFestival.signatureEffect.description}
                      </Text>
                    </BlockStack>
                  </Box>

                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="100">
                      <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                        SECONDARY EFFECT
                      </Text>
                      <Text variant="bodySm" fontWeight="semibold">
                        {previewFestival.secondaryEffect.name}
                      </Text>
                      <Text variant="bodyXs" tone="subdued">
                        {previewFestival.secondaryEffect.description}
                      </Text>
                    </BlockStack>
                  </Box>
                </InlineGrid>

                {/* Store Announcement Banner Preview */}
                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="100">
                    <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                      STOREFRONT ANNOUNCEMENT BANNER
                    </Text>
                    <Text variant="bodySm">
                      {previewFestival.banner.defaultText}
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Modal.Section>
          </Modal>
        )}
      </BlockStack>
    </Page>
  );
}
