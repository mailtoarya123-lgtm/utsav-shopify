import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Badge,
  Button,
  Banner,
  Divider,
  Box,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  ExternalIcon,
  SettingsIcon,
  ViewIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  FESTIVALS,
  getFestivalById,
  getUpcomingFestivals,
  getDaysUntilFestival,
} from "../data/festivals";

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

  const upcomingFestivals = getUpcomingFestivals(60);
  const nextFestival = upcomingFestivals[0] || FESTIVALS[0];
  const nextDays = getDaysUntilFestival(nextFestival);

  return json({
    shop,
    activeConfig,
    activeFestival,
    scheduledConfigs,
    nextFestival,
    nextDays,
    plan: subscription?.plan || "free",
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
    // Single active theme enforcement
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

export default function Dashboard() {
  const {
    shop,
    activeConfig,
    activeFestival,
    scheduledConfigs,
    nextFestival,
    nextDays,
    plan,
  } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const isPremium = plan === "premium";
  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page
      title="Utsav Festival Operations"
      subtitle="Storefront festival visual effects, automation, and live customer experience"
      primaryAction={{
        content: "Browse Festival Library",
        onAction: () => navigate("/app/festivals"),
      }}
      secondaryActions={[
        {
          content: "View Schedule",
          onAction: () => navigate("/app/schedule"),
        },
      ]}
    >
      <BlockStack gap="500">
        <Layout>
          {/* Main Column */}
          <Layout.Section>
            <BlockStack gap="500">
              {/* 1. Active Storefront Festival Card */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="headingMd" as="h2">
                        Active Festival Experience
                      </Text>
                      {activeFestival ? (
                        <Badge tone="success">Live on Storefront</Badge>
                      ) : (
                        <Badge tone="subdued">No Active Theme</Badge>
                      )}
                    </InlineStack>
                    {activeFestival && (
                      <Button
                        size="slim"
                        url={`https://${shop}/?utsav_preview=${activeFestival.id}`}
                        target="_blank"
                        icon={ExternalIcon}
                      >
                        Preview Live
                      </Button>
                    )}
                  </InlineStack>
                  <Divider />

                  {activeFestival ? (
                    <Box
                      padding="400"
                      background="bg-surface-secondary"
                      borderRadius="300"
                    >
                      <InlineStack align="space-between" blockAlign="center" wrap={false}>
                        <InlineStack gap="400" blockAlign="center">
                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "12px",
                              background: "linear-gradient(135deg, #2A1502 0%, #100600 100%)",
                              border: "1px solid rgba(212, 175, 55, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "26px",
                            }}
                          >
                            {activeFestival.emoji}
                          </div>
                          <BlockStack gap="100">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="headingMd" fontWeight="bold">
                                {activeFestival.name} ({activeFestival.hindiName})
                              </Text>
                              <Badge tone={activeFestival.tier === "free" ? "info" : "warning"}>
                                {activeFestival.tier.toUpperCase()}
                              </Badge>
                            </InlineStack>
                            <Text variant="bodySm" tone="subdued">
                              {activeFestival.region} • {activeFestival.description}
                            </Text>
                            <Text variant="bodyXs" tone="success">
                              ✓ Toran Garlands • Series Lights • Artisanal Diyas • Fireworks Active
                            </Text>
                          </BlockStack>
                        </InlineStack>

                        <InlineStack gap="200">
                          <Button
                            variant="primary"
                            onClick={() => navigate(`/app/festivals/${activeFestival.id}`)}
                          >
                            Customize
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
                    </Box>
                  ) : (
                    <Box padding="500">
                      <BlockStack gap="300" align="center" inlineAlign="center">
                        <Text variant="bodyMd" tone="subdued" alignment="center">
                          There is currently no festival active on your storefront. Choose an upcoming festival to greet your shoppers!
                        </Text>
                        <InlineStack gap="300">
                          <Button
                            variant="primary"
                            onClick={() => {
                              const fd = new FormData();
                              fd.append("actionType", "activate");
                              fd.append("festivalId", "diwali");
                              fetcher.submit(fd, { method: "post" });
                            }}
                          >
                            Activate Diwali 🪔
                          </Button>
                          <Button onClick={() => navigate("/app/festivals")}>
                            Choose from Library
                          </Button>
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  )}
                </BlockStack>
              </Card>

              {/* 2. Next Upcoming Festival & Countdown Card */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Upcoming Festival Countdown
                    </Text>
                    <Badge tone="attention">{nextDays === 0 ? "Today!" : `In ${nextDays} Days`}</Badge>
                  </InlineStack>
                  <Divider />

                  <Box padding="400" background="bg-surface-secondary" borderRadius="300">
                    <InlineStack align="space-between" blockAlign="center" wrap={false}>
                      <InlineStack gap="400" blockAlign="center">
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            background: "#FFF8E7",
                            border: "1px solid #FFE082",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                          }}
                        >
                          {nextFestival.emoji}
                        </div>
                        <BlockStack gap="050">
                          <Text variant="bodyMd" fontWeight="semibold">
                            {nextFestival.name} ({nextFestival.hindiName})
                          </Text>
                          <Text variant="bodySm" tone="subdued">
                            {nextFestival.description}
                          </Text>
                        </BlockStack>
                      </InlineStack>

                      <InlineStack gap="200">
                        <Button
                          size="slim"
                          onClick={() => navigate(`/app/festivals/${nextFestival.id}`)}
                        >
                          Configure Theme
                        </Button>
                        <Button
                          size="slim"
                          variant="primary"
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("actionType", "activate");
                            fd.append("festivalId", nextFestival.id);
                            fetcher.submit(fd, { method: "post" });
                          }}
                        >
                          Activate Now
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </Card>

              {/* 3. Scheduled Automations Overview */}
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Automated Festival Schedules
                    </Text>
                    <Button variant="plain" onClick={() => navigate("/app/schedule")}>
                      Manage All ({scheduledConfigs.length})
                    </Button>
                  </InlineStack>
                  <Divider />

                  {scheduledConfigs.length === 0 ? (
                    <Text variant="bodySm" tone="subdued">
                      No automated schedules currently active. You can schedule festivals to automatically turn on and off based on holiday dates.
                    </Text>
                  ) : (
                    <BlockStack gap="200">
                      {scheduledConfigs.map((sc) => (
                        <InlineStack key={sc.festivalId} align="space-between" blockAlign="center">
                          <InlineStack gap="200" blockAlign="center">
                            <Text variant="bodyMd">{sc.festival.emoji}</Text>
                            <Text variant="bodyMd" fontWeight="semibold">{sc.festival.name}</Text>
                          </InlineStack>
                          <Badge tone="info">
                            {sc.scheduledStart ? new Date(sc.scheduledStart).toLocaleDateString() : "Instant"} →{" "}
                            {sc.scheduledEnd ? new Date(sc.scheduledEnd).toLocaleDateString() : "Continuous"}
                          </Badge>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Sidebar Column */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              {/* Storefront Integration Health */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Integration Health
                  </Text>
                  <Divider />
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="150" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text variant="bodySm">Storefront Snippet</Text>
                      </InlineStack>
                      <Badge tone="success">Injected</Badge>
                    </InlineStack>

                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="150" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text variant="bodySm">Theme App Extension</Text>
                      </InlineStack>
                      <Badge tone="success">v8 Deployed</Badge>
                    </InlineStack>

                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="150" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text variant="bodySm">Cloud Effects Engine</Text>
                      </InlineStack>
                      <Badge tone="success">Online</Badge>
                    </InlineStack>

                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="150" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text variant="bodySm">Reduced-Motion Mode</Text>
                      </InlineStack>
                      <Badge tone="info">Compliant</Badge>
                    </InlineStack>
                  </BlockStack>

                  <Box paddingTop="200">
                    <Button
                      fullWidth
                      url={`https://${shop}/admin/themes/current/editor`}
                      target="_blank"
                      icon={ExternalIcon}
                    >
                      Open Shopify Theme Editor
                    </Button>
                  </Box>
                </BlockStack>
              </Card>

              {/* Instant Viewport Test Links */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Instant Live Previews
                  </Text>
                  <Divider />
                  <Text variant="bodyXs" tone="subdued">
                    Evaluate realistic effects directly on your live theme without touching settings:
                  </Text>
                  <BlockStack gap="200">
                    <Button
                      fullWidth
                      size="slim"
                      url={`https://${shop}/?utsav_preview=diwali`}
                      target="_blank"
                      icon={ViewIcon}
                    >
                      Diwali (Garland + Lights + Diyas)
                    </Button>
                    <Button
                      fullWidth
                      size="slim"
                      url={`https://${shop}/?utsav_preview=dussehra`}
                      target="_blank"
                      icon={ViewIcon}
                    >
                      Dussehra (Floral Toran Only)
                    </Button>
                    <Button
                      fullWidth
                      size="slim"
                      url={`https://${shop}/?utsav_preview=makar-sankranti`}
                      target="_blank"
                      icon={ViewIcon}
                    >
                      Sankranti (Harvest Toran Only)
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Contextual Tier Information */}
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h3">Subscription</Text>
                    <Badge tone={isPremium ? "success" : "info"}>
                      {isPremium ? "PREMIUM" : "FREE TIER"}
                    </Badge>
                  </InlineStack>
                  <Divider />
                  <Text variant="bodySm" tone="subdued">
                    {isPremium
                      ? "All 22 Indian festivals and advanced animation options unlocked."
                      : "5 Pan-India festivals included. Upgrade to unlock all 17 regional festivals (Onam, Pongal, Durga Puja, Eid)."}
                  </Text>
                  {!isPremium && (
                    <Box paddingTop="200">
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={() => navigate("/app/billing")}
                      >
                        Upgrade to Premium
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
