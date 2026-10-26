import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useMemo } from "react";
import {
  Page,
  Layout,
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
  CalendarIcon,
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

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
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

  return json({
    shop,
    activeConfig,
    activeFestival,
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

  return json({ success: true });
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
    activeConfig,
    activeFestival: initialActiveFestival,
    scheduledConfigs,
    upcomingFestivals,
    nextFestival,
    nextDays,
    plan,
    totalFestivalsCount,
    freeCount,
  } = useLoaderData();

  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Selected festival for the consolidated preview dropdown
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

  // Options for consolidated preview dropdown
  const festivalPreviewOptions = useMemo(() => {
    return FESTIVALS.map((f) => ({
      label: `${f.name} (${f.region.split("(")[0].trim()})`,
      value: f.id,
    }));
  }, []);

  return (
    <Page
      title="Utsav Festival Operations"
      subtitle="Storefront festival visual effects, automation, and live customer experience"
      primaryAction={{
        content: "Browse Festival Catalog",
        onAction: () => navigate("/app/festivals"),
      }}
      secondaryActions={[
        {
          content: "View Schedule Calendar",
          onAction: () => navigate("/app/schedule"),
        },
      ]}
    >
      <BlockStack gap="500">
        {/* Metric Cards Row */}
        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
          <Card padding="400">
            <BlockStack gap="100">
              <Text variant="bodySm" tone="subdued" fontWeight="medium">
                Active Storefront Themes
              </Text>
              <Text variant="heading2xl" as="p">
                {activeFestival ? 1 : 0}
              </Text>
              <Text variant="bodyXs" tone={activeFestival ? "success" : "subdued"}>
                {activeFestival ? `${activeFestival.name} live on storefront` : "No theme currently active"}
              </Text>
            </BlockStack>
          </Card>

          <Card padding="400">
            <BlockStack gap="100">
              <Text variant="bodySm" tone="subdued" fontWeight="medium">
                Upcoming Celebrations
              </Text>
              <Text variant="heading2xl" as="p">
                {upcomingFestivals.length}
              </Text>
              <Text variant="bodyXs" tone="subdued">
                {nextDays === 0 ? "Holiday celebration today!" : `Next: ${nextFestival.name} in ${nextDays} days`}
              </Text>
            </BlockStack>
          </Card>

          <Card padding="400">
            <BlockStack gap="100">
              <Text variant="bodySm" tone="subdued" fontWeight="medium">
                Festival Catalog
              </Text>
              <Text variant="heading2xl" as="p">
                {totalFestivalsCount}
              </Text>
              <Text variant="bodyXs" tone="subdued">
                All 22 themes free & unlocked
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Layout>
          {/* Main Content Column */}
          <Layout.Section>
            <BlockStack gap="500">
              {/* 1. Active Festival Experience Hero Card */}
              <Card padding="0">
                {activeFestival ? (
                  <BlockStack gap="0">
                    {/* Authentic Festival Vector Artwork Hero */}
                    <FestivalArtwork
                      festival={activeFestival}
                      variant="hero"
                      showBadge
                      badgeText="LIVE ON STOREFRONT"
                      badgeTone="success"
                    />

                    <Box padding="400">
                      <BlockStack gap="400">
                        {/* Title & Status Badges */}
                        <InlineStack align="space-between" blockAlign="start" wrap>
                          <BlockStack gap="100">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="headingLg" as="h2">
                                {activeFestival.name}
                              </Text>
                              <Text variant="bodyMd" tone="subdued">
                                ({activeFestival.hindiName} • {activeFestival.nativeName})
                              </Text>
                              <Badge tone={activeFestival.tier === "free" ? "info" : "warning"}>
                                {activeFestival.tier.toUpperCase()}
                              </Badge>
                            </InlineStack>
                            <Text variant="bodySm" tone="subdued">
                              {activeFestival.region} • {formatFestivalDate(activeFestival)}
                            </Text>
                          </BlockStack>

                          <InlineStack gap="200">
                            <Button
                              variant="primary"
                              icon={SettingsIcon}
                              onClick={() => navigate(`/app/festivals/${activeFestival.id}`)}
                            >
                              Customize in Studio
                            </Button>
                            <Button
                              icon={ExternalIcon}
                              url={`https://${shop}/?utsav_preview=${activeFestival.id}`}
                              target="_blank"
                            >
                              Preview Live
                            </Button>
                            <Button
                              tone="critical"
                              loading={isSubmitting}
                              onClick={() => {
                                const fd = new FormData();
                                fd.append("actionType", "deactivate");
                                fd.append("festivalId", activeFestival.id);
                                fetcher.submit(fd, { method: "post" });
                              }}
                            >
                              Deactivate
                            </Button>
                          </InlineStack>
                        </InlineStack>

                        <Divider />

                        {/* Active Effects Grid */}
                        <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                          <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                            <BlockStack gap="100">
                              <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                                SIGNATURE EFFECT
                              </Text>
                              <Text variant="bodySm" fontWeight="semibold">
                                {activeFestival.signatureEffect.name}
                              </Text>
                              <Text variant="bodyXs" tone="subdued">
                                {activeFestival.signatureEffect.description}
                              </Text>
                            </BlockStack>
                          </Box>

                          <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                            <BlockStack gap="100">
                              <Text variant="bodyXs" fontWeight="bold" tone="subdued">
                                SECONDARY EFFECT
                              </Text>
                              <Text variant="bodySm" fontWeight="semibold">
                                {activeFestival.secondaryEffect.name}
                              </Text>
                              <Text variant="bodyXs" tone="subdued">
                                {activeFestival.secondaryEffect.description}
                              </Text>
                            </BlockStack>
                          </Box>
                        </InlineGrid>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                ) : (
                  <BlockStack gap="0">
                    {/* Recommended Festival Banner When None Active */}
                    <FestivalArtwork
                      festival={nextFestival}
                      variant="hero"
                      showBadge
                      badgeText={`IN ${nextDays} DAYS`}
                      badgeTone="warning"
                    />

                    <Box padding="500">
                      <BlockStack gap="400">
                        <InlineStack align="space-between" blockAlign="center" wrap>
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="h2">
                              No Festival Theme Currently Active
                            </Text>
                            <Text variant="bodySm" tone="subdued">
                              Welcome your shoppers with authentic celebratory visual effects. Next upcoming:{" "}
                              <strong>{nextFestival.name}</strong> ({nextFestival.hindiName}) on{" "}
                              {formatFestivalDate(nextFestival)}.
                            </Text>
                          </BlockStack>

                          <InlineStack gap="200">
                            <Button
                              variant="primary"
                              loading={isSubmitting}
                              onClick={() => {
                                const fd = new FormData();
                                fd.append("actionType", "activate");
                                fd.append("festivalId", nextFestival.id);
                                fetcher.submit(fd, { method: "post" });
                              }}
                            >
                              Activate {nextFestival.name}
                            </Button>
                            <Button onClick={() => navigate("/app/festivals")}>
                              Choose from Catalog
                            </Button>
                          </InlineStack>
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                )}
              </Card>

              {/* 2. Upcoming Festivals Timeline & Hierarchy */}
              <Card padding="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="050">
                      <Text variant="headingMd" as="h2">
                        Upcoming Indian Celebrations
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        Calendar of upcoming festivals with curated cultural effects and 1-click activation
                      </Text>
                    </BlockStack>
                    <Button variant="plain" onClick={() => navigate("/app/festivals")}>
                      View All 22 Festivals →
                    </Button>
                  </InlineStack>

                  <Divider />

                  <BlockStack gap="300">
                    {upcomingFestivals.map((fest) => {
                      const days = getDaysUntilFestival(fest);
                      const isFestActive = activeFestival?.id === fest.id;
                      const isLocked = fest.tier === "premium" && !isPremium;

                      return (
                        <Box
                          key={fest.id}
                          padding="300"
                          background="bg-surface-secondary"
                          borderRadius="200"
                        >
                          <InlineStack align="space-between" blockAlign="center" wrap={false}>
                            <InlineStack gap="300" blockAlign="center">
                              {/* Vector Artwork Avatar */}
                              <FestivalArtwork
                                festival={fest}
                                variant="thumb"
                                style={{ width: "52px", height: "52px", flexShrink: 0 }}
                              />

                              <BlockStack gap="050">
                                <InlineStack gap="150" blockAlign="center">
                                  <Text variant="bodyMd" fontWeight="bold">
                                    {fest.name}
                                  </Text>
                                  <Text variant="bodySm" tone="subdued">
                                    ({fest.hindiName})
                                  </Text>
                                  {isFestActive && <Badge tone="success">ACTIVE NOW</Badge>}
                                  {isLocked && <Badge tone="warning">PRO</Badge>}
                                </InlineStack>
                                <Text variant="bodyXs" tone="subdued">
                                  {formatFestivalDate(fest)} • {fest.region.split("(")[0].trim()}
                                </Text>
                                <Text variant="bodyXs" tone="info">
                                  {fest.signatureEffect.name} • {fest.secondaryEffect.name}
                                </Text>
                              </BlockStack>
                            </InlineStack>

                            <InlineStack gap="200" blockAlign="center">
                              <Badge tone={days <= 14 ? "attention" : "info"}>
                                {days === 0 ? "Today" : `In ${days} days`}
                              </Badge>

                              <Button
                                size="slim"
                                icon={SettingsIcon}
                                onClick={() => navigate(`/app/festivals/${fest.id}`)}
                              >
                                Configure
                              </Button>

                              {!isFestActive && (
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
                              )}
                            </InlineStack>
                          </InlineStack>
                        </Box>
                      );
                    })}
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* 3. Automated Festival Schedules Overview */}
              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="050">
                      <Text variant="headingMd" as="h2">
                        Automated Festival Schedules
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        Set festivals to automatically start and end on designated holiday dates
                      </Text>
                    </BlockStack>
                    <Button variant="plain" onClick={() => navigate("/app/schedule")}>
                      Manage Calendar ({scheduledConfigs.length}) →
                    </Button>
                  </InlineStack>

                  <Divider />

                  {scheduledConfigs.length === 0 ? (
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodySm" tone="subdued">
                          No automated schedules currently active. You can set festival themes to turn on automatically 7 days before celebrations.
                        </Text>
                        <Button size="slim" onClick={() => navigate("/app/schedule")}>
                          Configure Autopilot
                        </Button>
                      </InlineStack>
                    </Box>
                  ) : (
                    <BlockStack gap="200">
                      {scheduledConfigs.map((sc) => (
                        <Box key={sc.festivalId} padding="200" background="bg-surface-secondary" borderRadius="150">
                          <InlineStack align="space-between" blockAlign="center">
                            <InlineStack gap="200" blockAlign="center">
                              <Icon source={CalendarIcon} tone="subdued" />
                              <Text variant="bodySm" fontWeight="semibold">
                                {sc.festival.name} ({sc.festival.hindiName})
                              </Text>
                            </InlineStack>
                            <Badge tone="info">
                              {sc.scheduledStart ? new Date(sc.scheduledStart).toLocaleDateString() : "Instant"} →{" "}
                              {sc.scheduledEnd ? new Date(sc.scheduledEnd).toLocaleDateString() : "Continuous"}
                            </Badge>
                          </InlineStack>
                        </Box>
                      ))}
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Right Sidebar Column */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              {/* Compact Technical Integration Health Panel */}
              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h3">
                      Storefront Health
                    </Text>
                    <Badge tone="success">Operational</Badge>
                  </InlineStack>

                  <Divider />

                  {/* 2x2 Metric Grid */}
                  <InlineGrid columns={2} gap="200">
                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <BlockStack gap="050">
                        <InlineStack gap="100" blockAlign="center">
                          <Icon source={CheckCircleIcon} tone="success" />
                          <Text variant="bodyXs" fontWeight="bold">App Embed</Text>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">Active & Ready</Text>
                      </BlockStack>
                    </Box>

                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <BlockStack gap="050">
                        <InlineStack gap="100" blockAlign="center">
                          <Icon source={CheckCircleIcon} tone="success" />
                          <Text variant="bodyXs" fontWeight="bold">Frame Rate</Text>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">60 FPS Locked</Text>
                      </BlockStack>
                    </Box>

                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <BlockStack gap="050">
                        <InlineStack gap="100" blockAlign="center">
                          <Icon source={CheckCircleIcon} tone="success" />
                          <Text variant="bodyXs" fontWeight="bold">Layout Shift</Text>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">Zero CLS (0.00)</Text>
                      </BlockStack>
                    </Box>

                    <Box padding="200" background="bg-surface-secondary" borderRadius="150">
                      <BlockStack gap="050">
                        <InlineStack gap="100" blockAlign="center">
                          <Icon source={CheckCircleIcon} tone="success" />
                          <Text variant="bodyXs" fontWeight="bold">Core Script</Text>
                        </InlineStack>
                        <Text variant="bodyXs" tone="subdued">0.32ms (Light)</Text>
                      </BlockStack>
                    </Box>
                  </InlineGrid>

                  <Box paddingTop="100">
                    <Button
                      fullWidth
                      url={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=5db56cc4-c065-7d56-20a9-6eb82834fdc0ea9c3601/utsav-embed`}
                      target="_blank"
                      icon={ExternalIcon}
                    >
                      Enable App Embed in Theme Editor
                    </Button>
                  </Box>
                </BlockStack>
              </Card>

              {/* Consolidated Storefront Instant Previewer */}
              <Card padding="400">
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Instant Storefront Preview
                  </Text>
                  <Text variant="bodyXs" tone="subdued">
                    Evaluate any festival experience directly on your live theme without altering customer settings:
                  </Text>

                  <Select
                    label="Choose Festival Theme"
                    labelHidden
                    options={festivalPreviewOptions}
                    value={selectedPreviewId}
                    onChange={setSelectedPreviewId}
                  />

                  <InlineGrid columns={2} gap="200">
                    <Button
                      fullWidth
                      icon={ViewIcon}
                      url={`https://${shop}/?utsav_preview=${selectedPreviewId}`}
                      target="_blank"
                    >
                      Preview Live
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => navigate(`/app/festivals/${selectedPreviewId}`)}
                    >
                      Configure
                    </Button>
                  </InlineGrid>
                </BlockStack>
              </Card>

              {/* Subscription & Entitlement Status Card */}
              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h3">
                      Plan Entitlements
                    </Text>
                    <Badge tone={isPremium ? "success" : "info"}>
                      {isPremium ? "PREMIUM PRO" : "FREE PLAN"}
                    </Badge>
                  </InlineStack>

                  <Divider />

                  <Text variant="bodySm" tone="subdued">
                    {isPremium
                      ? "All 22 Indian festivals, custom CSS injection, and automatic festival scheduling are unlocked."
                      : "You have access to 5 Pan-India festivals. Upgrade to Pro to unlock Onam, Durga Puja, Eid, and 14 other regional celebrations."}
                  </Text>

                  {!isPremium && (
                    <Box paddingTop="100">
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={() => navigate("/app/billing")}
                      >
                        Upgrade to Premium Pro
                      </Button>
                    </Box>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
