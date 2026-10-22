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
  Box,
  InlineStack,
  Divider,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { FESTIVALS, getFestivalById } from "../data/festivals";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const configs = await prisma.festivalConfig.findMany({ where: { shop } });

  const scheduledConfigs = configs
    .filter(c => c.scheduledStart || c.scheduledEnd)
    .map(c => {
      const festival = getFestivalById(c.festivalId);
      return { ...c, festival };
    })
    .filter(c => c.festival);

  return json({ scheduledConfigs, shop });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const festivalId = formData.get("festivalId");
  const clearSchedule = formData.get("clearSchedule") === "true";

  if (clearSchedule) {
    await prisma.festivalConfig.update({
      where: { shop_festivalId: { shop, festivalId } },
      data: { scheduledStart: null, scheduledEnd: null },
    });
  }

  return json({ success: true });
};

export default function Schedule() {
  const { scheduledConfigs } = useLoaderData();
  const navigate = useNavigate();

  // Build timeline: all festivals with upcoming dates
  const today = new Date();
  const upcomingAll = FESTIVALS.map(festival => {
    const festDate = new Date(today.getFullYear(), festival.approximateMonth, festival.approximateDay);
    if (festDate < today) festDate.setFullYear(today.getFullYear() + 1);
    const daysUntil = Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));
    return { ...festival, nextDate: festDate, daysUntil };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  const scheduledMap = {};
  scheduledConfigs.forEach(c => { scheduledMap[c.festivalId] = c; });

  return (
    <Page
      title="📅 Festival Schedule"
      subtitle="View and manage auto-activation schedules for all festivals"
      backAction={{ content: "Dashboard", url: "/app" }}
      primaryAction={{
        content: "+ Schedule a Festival",
        onAction: () => navigate("/app/festivals"),
      }}
    >
      <BlockStack gap="600">
        {scheduledConfigs.length > 0 && (
          <>
            <Text variant="headingLg" as="h2">⚡ Scheduled Themes</Text>
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
              {scheduledConfigs.map(config => (
                <ScheduledCard
                  key={config.festivalId}
                  config={config}
                  festival={config.festival}
                  onEdit={() => navigate(`/app/festivals/${config.festivalId}`)}
                />
              ))}
            </InlineGrid>
            <Divider />
          </>
        )}

        <Text variant="headingLg" as="h2">🗓️ Full Festival Calendar ({new Date().getFullYear()})</Text>
        <Card>
          <BlockStack gap="0">
            {upcomingAll.map((festival, index) => {
              const isScheduled = !!scheduledMap[festival.id];
              const isActive = scheduledMap[festival.id]?.isActive;
              const isToday = festival.daysUntil === 0;
              const isThisWeek = festival.daysUntil <= 7;

              return (
                <Box
                  key={festival.id}
                  padding="400"
                  borderBlockEndWidth={index < upcomingAll.length - 1 ? "025" : "0"}
                  borderColor="border"
                  background={isToday ? "bg-surface-success-subdued" : isThisWeek ? "bg-surface-warning-subdued" : "bg-surface"}
                >
                  <InlineStack align="space-between" blockAlign="center" wrap={false}>
                    <InlineStack gap="400" blockAlign="center">
                      <Box minWidth="48px">
                        <Text variant="headingXl" as="span">{festival.emoji}</Text>
                      </Box>
                      <BlockStack gap="050">
                        <InlineStack gap="200" blockAlign="center">
                          <Text variant="bodyMd" fontWeight="semibold">{festival.name}</Text>
                          <Badge tone={festival.tier === "free" ? "success" : "warning"}>
                            {festival.tier === "free" ? "Free" : "Premium"}
                          </Badge>
                          {isActive && <Badge tone="success">Live</Badge>}
                          {isScheduled && !isActive && <Badge>Scheduled</Badge>}
                        </InlineStack>
                        <Text variant="bodySm" tone="subdued">{festival.region}</Text>
                      </BlockStack>
                    </InlineStack>
                    <InlineStack gap="300" blockAlign="center">
                      <BlockStack gap="050" inlineAlign="end">
                        <Text variant="bodyMd" fontWeight="semibold">
                          {festival.nextDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                        <Badge tone={isToday ? "success" : isThisWeek ? "warning" : "info"}>
                          {isToday ? "🎉 Today!" : isThisWeek ? `⚡ ${festival.daysUntil}d away` : `${festival.daysUntil}d`}
                        </Badge>
                      </BlockStack>
                      <Button
                        size="slim"
                        onClick={() => navigate(`/app/festivals/${festival.id}`)}
                      >
                        {isScheduled ? "Edit" : "Configure"}
                      </Button>
                    </InlineStack>
                  </InlineStack>
                </Box>
              );
            })}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

function ScheduledCard({ config, festival, onEdit }) {
  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="headingXl">{festival.emoji}</Text>
              <Text variant="headingMd" fontWeight="semibold">{festival.name}</Text>
            </InlineStack>
            <Badge tone={config.isActive ? "success" : "info"}>
              {config.isActive ? "🟢 Live" : "📅 Scheduled"}
            </Badge>
          </InlineStack>
          <Divider />
          <BlockStack gap="150">
            {config.scheduledStart && (
              <InlineStack align="space-between">
                <Text variant="bodySm" tone="subdued">Activates</Text>
                <Text variant="bodySm" fontWeight="semibold">
                  {new Date(config.scheduledStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Text>
              </InlineStack>
            )}
            {config.scheduledEnd && (
              <InlineStack align="space-between">
                <Text variant="bodySm" tone="subdued">Deactivates</Text>
                <Text variant="bodySm" fontWeight="semibold">
                  {new Date(config.scheduledEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Text>
              </InlineStack>
            )}
          </BlockStack>
          <Button onClick={onEdit} size="slim">Edit Schedule</Button>
        </BlockStack>
      </Box>
    </Card>
  );
}
