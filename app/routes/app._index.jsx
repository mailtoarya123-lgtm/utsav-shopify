import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
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
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  FESTIVALS,
  getUpcomingFestivals,
  getDaysUntilFestival,
} from "../data/festivals";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Get active festival configs for this shop
  const activeConfigs = await prisma.festivalConfig.findMany({
    where: { shop, isActive: true },
  });

  // Get subscription plan
  const subscription = await prisma.subscriptionPlan.findUnique({
    where: { shop },
  });

  const upcomingFestivals = getUpcomingFestivals(45);
  const activeFestivalIds = activeConfigs.map((c) => c.festivalId);

  return json({
    shop,
    activeConfigs,
    activeFestivalIds,
    upcomingFestivals,
    plan: subscription?.plan || "free",
    totalFestivals: FESTIVALS.length,
    activeFestivalsCount: activeConfigs.length,
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const festivalId = formData.get("festivalId");
  const shop = session.shop;

  if (action === "deactivate") {
    await prisma.festivalConfig.updateMany({
      where: { shop, festivalId },
      data: { isActive: false },
    });
    // Remove injected CSS/JS from theme
    // (In production: call Theme Assets API to remove festival.css)
  }

  return json({ success: true });
};

export default function Dashboard() {
  const {
    shop,
    activeFestivalIds,
    upcomingFestivals,
    plan,
    totalFestivals,
    activeFestivalsCount,
  } = useLoaderData();
  const navigate = useNavigate();

  const isPremium = plan === "premium";

  return (
    <Page
      title="🪔 Utsav — Indian Festival Themes"
      subtitle="Celebrate every Indian festival with your customers"
      primaryAction={{
        content: "Browse All Festivals",
        onAction: () => navigate("/app/festivals"),
      }}
    >
      <BlockStack gap="600">
        {/* Welcome Banner */}
        {!isPremium && (
          <Banner
            title="🎉 Upgrade to Premium — unlock 15+ more festivals!"
            action={{
              content: "Upgrade Now",
              onAction: () => navigate("/app/billing"),
            }}
            tone="info"
          >
            <p>
              You're on the Free plan with access to 5 festivals. Upgrade to
              Premium to unlock Onam, Durga Puja, Eid, Ganesh Chaturthi, and 11
              more regional Indian festivals!
            </p>
          </Banner>
        )}

        {/* Stats Row */}
        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
          <StatCard
            emoji="🎊"
            title="Active Themes"
            value={activeFestivalsCount}
            subtitle="Festival themes live on your store"
            color="#FF6B35"
          />
          <StatCard
            emoji="📅"
            title="Upcoming Festivals"
            value={upcomingFestivals.length}
            subtitle="Festivals in the next 45 days"
            color="#FFD700"
          />
          <StatCard
            emoji="🪔"
            title="Total Festivals"
            value={totalFestivals}
            subtitle={`${isPremium ? "All" : "5 free +"} festivals available`}
            color="#9400D3"
          />
        </InlineGrid>

        <Layout>
          <Layout.Section>
            {/* Upcoming Festivals */}
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                🗓️ Upcoming Festivals
              </Text>
              {upcomingFestivals.length === 0 ? (
                <Card>
                  <Box padding="800">
                    <BlockStack gap="200" align="center" inlineAlign="center">
                      <Text variant="headingMd" tone="subdued">
                        No festivals in the next 45 days
                      </Text>
                      <Button onClick={() => navigate("/app/festivals")}>
                        Browse All Festivals
                      </Button>
                    </BlockStack>
                  </Box>
                </Card>
              ) : (
                <BlockStack gap="300">
                  {upcomingFestivals.slice(0, 5).map((festival) => (
                    <UpcomingFestivalCard
                      key={festival.id}
                      festival={festival}
                      isActive={activeFestivalIds.includes(festival.id)}
                      isPremium={isPremium}
                      onActivate={() =>
                        navigate(`/app/festivals/${festival.id}`)
                      }
                    />
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            {/* Active Themes Panel */}
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                ✅ Active Themes
              </Text>
              <Card>
                {activeFestivalsCount === 0 ? (
                  <Box padding="600">
                    <BlockStack gap="300" inlineAlign="center">
                      <Text variant="headingMd" as="p" alignment="center">
                        🎪
                      </Text>
                      <Text tone="subdued" as="p" alignment="center">
                        No active festival themes yet. Activate a festival to
                        start decorating your store!
                      </Text>
                      <Button
                        variant="primary"
                        onClick={() => navigate("/app/festivals")}
                      >
                        Activate a Festival
                      </Button>
                    </BlockStack>
                  </Box>
                ) : (
                  <BlockStack gap="0">
                    {activeFestivalIds.map((id, index) => {
                      const festival = FESTIVALS.find((f) => f.id === id);
                      if (!festival) return null;
                      return (
                        <Box key={id} padding="400" borderBlockEndWidth={index < activeFestivalIds.length - 1 ? "025" : "0"} borderColor="border">
                          <InlineStack align="space-between" blockAlign="center">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="headingMd">{festival.emoji}</Text>
                              <BlockStack gap="0">
                                <Text variant="bodyMd" fontWeight="semibold">{festival.name}</Text>
                                <Text variant="bodySm" tone="subdued">{festival.region}</Text>
                              </BlockStack>
                            </InlineStack>
                            <Badge tone="success">Live</Badge>
                          </InlineStack>
                        </Box>
                      );
                    })}
                  </BlockStack>
                )}
              </Card>

              {/* Quick Tips */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    💡 Quick Tips
                  </Text>
                  <Divider />
                  <BlockStack gap="200">
                    <Text variant="bodySm">
                      🕐 <strong>Schedule ahead:</strong> Activate themes 7
                      days before the festival for maximum impact.
                    </Text>
                    <Text variant="bodySm">
                      🎨 <strong>Custom colors:</strong> Tweak palettes to
                      match your brand in the festival settings.
                    </Text>
                    <Text variant="bodySm">
                      👁️ <strong>Preview first:</strong> Always preview before
                      going live on your storefront.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

function StatCard({ emoji, title, value, subtitle, color }) {
  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Text variant="headingXl" as="span">
              {emoji}
            </Text>
            <Text
              variant="heading2xl"
              as="span"
              fontWeight="bold"
            >
              {value}
            </Text>
          </InlineStack>
          <Text variant="headingMd" as="h3" fontWeight="semibold">
            {title}
          </Text>
          <Text variant="bodySm" tone="subdued">
            {subtitle}
          </Text>
        </BlockStack>
      </Box>
    </Card>
  );
}

function UpcomingFestivalCard({ festival, isActive, isPremium, onActivate }) {
  const isLocked = festival.tier === "premium" && !isPremium;
  const urgency =
    festival.daysUntil <= 3
      ? "critical"
      : festival.daysUntil <= 7
        ? "warning"
        : "info";

  return (
    <Card>
      <Box padding="400">
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <InlineStack gap="400" blockAlign="center">
            <Box
              background="bg-surface-secondary"
              borderRadius="200"
              padding="300"
              minWidth="48px"
            >
              <Text variant="headingXl" as="span" alignment="center">
                {festival.emoji}
              </Text>
            </Box>
            <BlockStack gap="100">
              <InlineStack gap="200" blockAlign="center">
                <Text variant="headingMd" fontWeight="semibold">
                  {festival.name}
                </Text>
                {isLocked && <Badge tone="warning">Premium</Badge>}
                {isActive && <Badge tone="success">Live</Badge>}
              </InlineStack>
              <Text variant="bodySm" tone="subdued">
                {festival.region}
              </Text>
              <Badge tone={urgency}>
                {festival.daysUntil === 0
                  ? "🎉 Today!"
                  : festival.daysUntil === 1
                    ? "🔔 Tomorrow!"
                    : `📅 In ${festival.daysUntil} days`}
              </Badge>
            </BlockStack>
          </InlineStack>
          <Button
            variant={isActive ? "secondary" : "primary"}
            disabled={isLocked}
            onClick={onActivate}
          >
            {isActive ? "Configure" : isLocked ? "🔒 Upgrade" : "Activate"}
          </Button>
        </InlineStack>
      </Box>
    </Card>
  );
}
