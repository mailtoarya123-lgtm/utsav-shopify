import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
import { getFreeFestivals, getPremiumFestivals } from "../data/festivals";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const subscription = await prisma.subscriptionPlan.findUnique({ where: { shop } });
  return json({ plan: subscription?.plan || "free", shop });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "subscribe_premium") {
    // In production: create a Shopify recurring charge via Billing API
    // const response = await admin.graphql(`
    //   mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean, $lineItems: [AppSubscriptionLineItemInput!]!) {
    //     appSubscriptionCreate(name: $name, returnUrl: $returnUrl, test: $test, lineItems: $lineItems) {
    //       appSubscription { id }
    //       confirmationUrl
    //       userErrors { field message }
    //     }
    //   }
    // `, { variables: { ... } });
    // For now, simulate upgrade
    await prisma.subscriptionPlan.upsert({
      where: { shop },
      create: { shop, plan: "premium", status: "active" },
      update: { plan: "premium", status: "active" },
    });
  } else if (actionType === "cancel_premium") {
    await prisma.subscriptionPlan.update({
      where: { shop },
      data: { plan: "free", status: "cancelled" },
    });
  }

  return json({ success: true });
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    emoji: "🆓",
    price: "₹0",
    priceSub: "forever",
    description: "Perfect for getting started with Indian festival themes",
    color: "#228B22",
    features: [
      `${getFreeFestivals().length} festivals (Diwali, Holi, Navratri, Dussehra, Raksha Bandhan)`,
      "Festival banners",
      "Color theme swap",
      "Manual activate/deactivate",
      "Basic countdown timer",
    ],
    limitations: [
      "No animated effects",
      "No scheduling",
      "No regional festivals (Onam, Bihu, etc.)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    emoji: "✨",
    price: "₹499",
    priceSub: "/ month",
    description: "Unlock all 20+ Indian festivals with full customization",
    color: "#FFD700",
    features: [
      `All ${getFreeFestivals().length + getPremiumFestivals().length} festivals including regional ones`,
      "All animated effects (diyas, colors, kites, flowers)",
      "Auto-scheduling with start/end dates",
      "Live storefront preview",
      "Custom color overrides",
      "Countdown timer widgets",
      "Priority support",
      "Early access to new festivals",
    ],
    limitations: [],
    recommended: true,
  },
];

export default function Billing() {
  const { plan } = useLoaderData();
  const fetcher = useFetcher();
  const isSaving = fetcher.state !== "idle";

  return (
    <Page
      title="💳 Plans & Pricing"
      subtitle="Choose the right plan for your store"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <BlockStack gap="600">
        {plan === "premium" && (
          <Banner title="✨ You're on the Premium plan!" tone="success">
            <p>You have access to all 20+ Indian festival themes. Thank you for supporting Utsav!</p>
          </Banner>
        )}

        {fetcher.data?.success && (
          <Banner title="✅ Plan updated successfully!" tone="success" />
        )}

        <InlineGrid columns={{ xs: 1, sm: 2 }} gap="500">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              isCurrentPlan={plan === p.id}
              onSelect={() => {
                const fd = new FormData();
                fd.append("actionType", p.id === "premium" ? "subscribe_premium" : "cancel_premium");
                fetcher.submit(fd, { method: "post" });
              }}
              isSaving={isSaving}
            />
          ))}
        </InlineGrid>

        {/* Feature comparison table */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h2">📊 Feature Comparison</Text>
            <Divider />
            <FeatureComparisonTable />
          </BlockStack>
        </Card>

        {/* FAQ */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h2">❓ Frequently Asked Questions</Text>
            <Divider />
            <BlockStack gap="400">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! You can cancel your Premium plan anytime from this page. Your store will revert to the Free plan at the end of the billing period.",
                },
                {
                  q: "Are new festivals added automatically?",
                  a: "Yes! Premium subscribers get access to all new festivals as soon as they're added to the app — at no extra cost.",
                },
                {
                  q: "Will this slow down my store?",
                  a: "No. All festival scripts are loaded asynchronously and optimized for performance. Our effects use CSS animations and lightweight JavaScript.",
                },
                {
                  q: "Which themes does it work with?",
                  a: "Utsav works with all Shopify themes including Dawn, Debut, Brooklyn, and any custom Online Store 2.0 theme.",
                },
              ].map((faq, i) => (
                <BlockStack key={i} gap="100">
                  <Text variant="bodyMd" fontWeight="semibold">{faq.q}</Text>
                  <Text variant="bodySm" tone="subdued">{faq.a}</Text>
                </BlockStack>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

function PlanCard({ plan, isCurrentPlan, onSelect, isSaving }) {
  return (
    <Card>
      <div style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
      }}>
        {plan.recommended && (
          <div style={{
            background: `linear-gradient(90deg, #FFD700, #FF6B35)`,
            color: "#1A0A00",
            textAlign: "center",
            padding: "6px",
            fontWeight: 700,
            fontSize: "13px",
          }}>
            ⭐ MOST POPULAR
          </div>
        )}
        <Box padding="500">
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="headingXl">{plan.emoji}</Text>
              <BlockStack gap="0">
                <Text variant="headingXl" fontWeight="bold">{plan.name}</Text>
                <Text variant="bodySm" tone="subdued">{plan.description}</Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="100" blockAlign="baseline">
              <Text variant="heading2xl" fontWeight="bold"
                tone={plan.id === "premium" ? undefined : "success"}
              >
                {plan.price}
              </Text>
              <Text variant="bodySm" tone="subdued">{plan.priceSub}</Text>
            </InlineStack>

            <Divider />

            <BlockStack gap="200">
              {plan.features.map((f, i) => (
                <InlineStack key={i} gap="200" blockAlign="center">
                  <Text variant="bodySm" tone="success">✅</Text>
                  <Text variant="bodySm">{f}</Text>
                </InlineStack>
              ))}
              {plan.limitations.map((f, i) => (
                <InlineStack key={i} gap="200" blockAlign="center">
                  <Text variant="bodySm" tone="subdued">❌</Text>
                  <Text variant="bodySm" tone="subdued">{f}</Text>
                </InlineStack>
              ))}
            </BlockStack>

            <Button
              variant={isCurrentPlan ? "secondary" : "primary"}
              disabled={isCurrentPlan}
              loading={isSaving}
              onClick={onSelect}
              fullWidth
              tone={plan.id === "premium" && !isCurrentPlan ? undefined : undefined}
            >
              {isCurrentPlan
                ? "✓ Current Plan"
                : plan.id === "premium"
                  ? "🚀 Upgrade to Premium"
                  : "Downgrade to Free"}
            </Button>
          </BlockStack>
        </Box>
      </div>
    </Card>
  );
}

function FeatureComparisonTable() {
  const rows = [
    { feature: "Number of festivals", free: "5", premium: "20+" },
    { feature: "Diwali & Holi themes", free: "✅", premium: "✅" },
    { feature: "Regional festivals (Onam, Bihu, etc.)", free: "❌", premium: "✅" },
    { feature: "Eid & Christmas themes", free: "❌", premium: "✅" },
    { feature: "Animated effects", free: "❌", premium: "✅" },
    { feature: "Festival banners", free: "✅", premium: "✅" },
    { feature: "Color theme swap", free: "✅", premium: "✅" },
    { feature: "Countdown timer", free: "Basic", premium: "Advanced" },
    { feature: "Auto-scheduling", free: "❌", premium: "✅" },
    { feature: "Live preview", free: "❌", premium: "✅" },
    { feature: "Custom color overrides", free: "❌", premium: "✅" },
    { feature: "Support", free: "Email", premium: "Priority" },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
            <th style={{ textAlign: "left", padding: "12px 8px", color: "#666", fontWeight: 600 }}>Feature</th>
            <th style={{ textAlign: "center", padding: "12px 8px", color: "#228B22", fontWeight: 700 }}>🆓 Free</th>
            <th style={{ textAlign: "center", padding: "12px 8px", color: "#B8860B", fontWeight: 700 }}>✨ Premium</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
              <td style={{ padding: "10px 8px", fontSize: "14px", color: "#333" }}>{row.feature}</td>
              <td style={{ textAlign: "center", padding: "10px 8px", fontSize: "14px" }}>{row.free}</td>
              <td style={{ textAlign: "center", padding: "10px 8px", fontSize: "14px", fontWeight: row.premium === "✅" ? 600 : undefined }}>{row.premium}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
