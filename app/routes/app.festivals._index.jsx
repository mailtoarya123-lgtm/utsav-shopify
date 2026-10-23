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
} from "@shopify/polaris";
import {
  SearchIcon,
  ViewIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
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

// Culturally refined SVG emblem for each festival
function FestivalEmblem({ festivalId }) {
  const id = festivalId.toLowerCase();

  if (id.includes("diwali")) {
    return (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#2A1605" stroke="#D4AF37" strokeWidth="1.2"/>
        <path d="M 24 10 C 21 16 19 20 19 24 C 19 27 21 29 24 29 C 27 29 29 27 29 24 C 29 20 27 16 24 10 Z" fill="#FF9100"/>
        <path d="M 24 14 C 22 18 21 21 21 24 C 21 26 22 27 24 27 C 26 27 27 26 27 24 C 27 21 26 18 24 14 Z" fill="#FFFDE7"/>
        <path d="M 12 28 Q 13 36 24 37 Q 35 36 36 28 Z" fill="#D4AF37"/>
        <ellipse cx="24" cy="28" rx="12" ry="3" fill="#FFE082"/>
      </svg>
    );
  }

  if (id.includes("dussehra")) {
    return (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#142608" stroke="#81C784" strokeWidth="1.2"/>
        <path d="M 14 34 Q 34 34 34 14" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="14" y1="34" x2="34" y2="14" stroke="#FFF59D" strokeWidth="1" strokeDasharray="2 2"/>
        <path d="M 18 30 L 32 16 M 32 16 L 27 16 M 32 16 L 32 21" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  if (id.includes("sankranti") || id.includes("pongal")) {
    return (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#0A2239" stroke="#FFB300" strokeWidth="1.2"/>
        <polygon points="24,10 34,22 24,34 14,22" fill="#FFC107"/>
        <polygon points="24,10 34,22 24,22" fill="#FF9800"/>
        <line x1="24" y1="10" x2="24" y2="34" stroke="#FFFFFF" strokeWidth="1.2"/>
        <path d="M 14 22 Q 24 17 34 22" stroke="#FFFFFF" strokeWidth="1.2" fill="none"/>
        <polygon points="24,34 21,39 27,39" fill="#E91E63"/>
      </svg>
    );
  }

  if (id.includes("holi")) {
    return (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#200A38" stroke="#FF4081" strokeWidth="1.2"/>
        <circle cx="20" cy="20" r="7" fill="#E040FB" opacity="0.8"/>
        <circle cx="28" cy="22" r="6" fill="#00E5FF" opacity="0.8"/>
        <circle cx="23" cy="28" r="6" fill="#FFD700" opacity="0.8"/>
        <ellipse cx="24" cy="35" rx="10" ry="3.5" fill="#B388FF"/>
      </svg>
    );
  }

  if (id.includes("eid")) {
    return (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#032B1E" stroke="#00E676" strokeWidth="1.2"/>
        <path d="M 28 14 C 20 15 15 22 17 30 C 19 36 26 38 31 34 C 23 35 18 28 20 22 C 22 18 25 15 28 14 Z" fill="#D4AF37"/>
        <polygon points="31,18 32,21 35,21 32,23 33,26 31,24 29,26 30,23 27,21 30,21" fill="#FFF8E7"/>
      </svg>
    );
  }

  // Default Classical Temple Lotus / Mandala Motif
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#1C1824" stroke="#D4AF37" strokeWidth="1.2"/>
      <circle cx="24" cy="24" r="14" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="24" cy="24" r="5" fill="#D4AF37"/>
      <circle cx="24" cy="14" r="2.5" fill="#FF8F00"/>
      <circle cx="24" cy="34" r="2.5" fill="#FF8F00"/>
      <circle cx="14" cy="24" r="2.5" fill="#FF8F00"/>
      <circle cx="34" cy="24" r="2.5" fill="#FF8F00"/>
    </svg>
  );
}

// Format approximate holiday calendar date with current/next year
function getFormattedFestivalDate(festival) {
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

  const isPremium = plan === "premium";

  // Compute live active ID dynamically
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
    { id: "free", content: `Included in Free (${getFreeFestivals().length})` },
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
          f.hindiName.includes(q) ||
          f.region.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "upcoming") {
      list.sort((a, b) => getDaysUntilFestival(a) - getDaysUntilFestival(b));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [selectedTab, selectedRegion, searchValue, sortBy, activeFestivalId]);

  return (
    <Page
      title="Festival Catalog"
      subtitle="Explore 22 authentic Indian festival themes with curated visual effects and cultural traditions"
      backAction={{ content: "Dashboard", url: "/app" }}
      primaryAction={{
        content: "View Schedule Calendar",
        onAction: () => navigate("/app/schedule"),
      }}
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
            <Divider />

            <InlineGrid columns={{ xs: 1, sm: "2fr 1fr 1fr" }} gap="300">
              <TextField
                label="Search festivals"
                labelHidden
                placeholder="Search by name (e.g. Diwali, Onam, Pongal), region, or keyword..."
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
                  { label: "Sort by: Upcoming Date", value: "upcoming" },
                  { label: "Sort by: Alphabetical (A-Z)", value: "name" },
                ]}
                value={sortBy}
                onChange={setSortBy}
              />
            </InlineGrid>
          </BlockStack>
        </Card>

        {filteredFestivals.length === 0 ? (
          <Card>
            <Box padding="800">
              <BlockStack gap="300" align="center" inlineAlign="center">
                <Text variant="headingMd" tone="subdued">
                  No festivals found matching your filters
                </Text>
                <Button onClick={() => { setSearchValue(""); setSelectedRegion("all"); setSelectedTab(0); }}>
                  Reset Filters
                </Button>
              </BlockStack>
            </Box>
          </Card>
        ) : (
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
            {filteredFestivals.map((festival) => {
              const isActive = activeFestivalId === festival.id;
              const isLocked = festival.tier === "premium" && !isPremium;
              const daysUntil = getDaysUntilFestival(festival);
              const dateRange = getFormattedFestivalDate(festival);

              const effectsList = festival.id === "diwali"
                ? "Toran Garland • Series Lights • Artisanal Diyas • Fireworks"
                : festival.id === "dussehra"
                ? "Toran Garland • Mango Leaves • Marigold Cascades"
                : festival.id.includes("sankranti") || festival.id.includes("pongal")
                ? "Harvest Toran • Mango Leaves • Celebratory Kites"
                : "Atmospheric Vignette • Festive Banner • Cultural Particles";

              return (
                <Card key={festival.id} padding="400">
                  <BlockStack gap="300">
                    {/* Header Row: Cultural Emblem & Badges */}
                    <InlineStack align="space-between" blockAlign="start">
                      <InlineStack gap="300" blockAlign="center">
                        <FestivalEmblem festivalId={festival.id} />
                        <BlockStack gap="050">
                          <Text variant="headingMd" fontWeight="bold">
                            {festival.name}
                          </Text>
                          <Text variant="bodySm" tone="subdued">
                            {festival.hindiName}
                          </Text>
                        </BlockStack>
                      </InlineStack>

                      <BlockStack gap="100" inlineAlign="end">
                        {isActive && <Badge tone="success">● LIVE</Badge>}
                        {isLocked ? (
                          <Badge tone="warning">PRO</Badge>
                        ) : (
                          <Badge tone="info">{festival.tier === "free" ? "FREE" : "UNLOCKED"}</Badge>
                        )}
                      </BlockStack>
                    </InlineStack>

                    <Divider />

                    {/* Festival Context & Date Range */}
                    <BlockStack gap="100">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodyXs" fontWeight="semibold" tone="subdued">
                          DATE
                        </Text>
                        <Text variant="bodyXs" fontWeight="medium">
                          {dateRange}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodyXs" fontWeight="semibold" tone="subdued">
                          REGION
                        </Text>
                        <Text variant="bodyXs" fontWeight="medium">
                          {festival.region.split("(")[0].trim()}
                        </Text>
                      </InlineStack>

                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodyXs" fontWeight="semibold" tone="subdued">
                          SCHEDULE
                        </Text>
                        <Text variant="bodyXs" tone={daysUntil <= 14 ? "success" : "subdued"}>
                          {daysUntil === 0 ? "Today" : `In ${daysUntil} days`}
                        </Text>
                      </InlineStack>
                    </BlockStack>

                    {/* Effects Summary Box */}
                    <Box padding="200" background="bg-surface-secondary" borderRadius="200">
                      <Text variant="bodyXs" tone="subdued">
                        ✨ <strong>Included Effects:</strong> {effectsList}
                      </Text>
                    </Box>

                    {/* Action Buttons */}
                    <InlineStack gap="200" align="end">
                      <Button
                        size="slim"
                        url={`https://${shop}/?utsav_preview=${festival.id}`}
                        target="_blank"
                        icon={ViewIcon}
                      >
                        Preview
                      </Button>
                      <Button
                        size="slim"
                        onClick={() => navigate(`/app/festivals/${festival.id}`)}
                        icon={SettingsIcon}
                      >
                        Customize
                      </Button>
                      {isActive ? (
                        <Button
                          size="slim"
                          tone="critical"
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("actionType", "deactivate");
                            fd.append("festivalId", festival.id);
                            fetcher.submit(fd, { method: "post" });
                          }}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="slim"
                          variant="primary"
                          disabled={isLocked}
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("actionType", "activate");
                            fd.append("festivalId", festival.id);
                            fetcher.submit(fd, { method: "post" });
                          }}
                        >
                          {isLocked ? "Upgrade" : "Activate"}
                        </Button>
                      )}
                    </InlineStack>
                  </BlockStack>
                </Card>
              );
            })}
          </InlineGrid>
        )}
      </BlockStack>
    </Page>
  );
}
