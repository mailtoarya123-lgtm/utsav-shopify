import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Badge,
  Button,
  Box,
  InlineStack,
  TextField,
  Checkbox,
  Banner,
  Divider,
  Modal,
  Frame,
  Select,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getFestivalById, getFestivalGreetings } from "../data/festivals";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const festivalId = params.id;

  const festival = getFestivalById(festivalId);
  if (!festival) throw new Response("Festival not found", { status: 404 });

  const subscription = await prisma.subscriptionPlan.findUnique({ where: { shop } });
  const plan = subscription?.plan || "free";

  // Lock premium festivals for free users
  if (festival.tier === "premium" && plan !== "premium") {
    return redirect("/app/billing");
  }

  let config = await prisma.festivalConfig.findUnique({
    where: { shop_festivalId: { shop, festivalId } },
  });

  // Create default config if not exists
  if (!config) {
    config = {
      festivalId,
      isActive: false,
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
      bannerText: festival.banner.defaultText,
      customColors: null,
      scheduledStart: null,
      scheduledEnd: null,
    };
  }

  return json({ festival, config, plan });
};

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const festivalId = params.id;
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "save") {
    const isActive = formData.get("isActive") === "true";
    const enableBanner = formData.get("enableBanner") === "true";
    const enableEffects = formData.get("enableEffects") === "true";
    const enableCountdown = formData.get("enableCountdown") === "true";
    const enableColorSwap = formData.get("enableColorSwap") === "true";
    const enableAudio = formData.get("enableAudio") === "true";
    const enableWheel = formData.get("enableWheel") === "true";
    const language = formData.get("language") || "en";
    const diyaSize = formData.get("diyaSize") || "medium";
    const diyaPosition = formData.get("diyaPosition") || "bottom_corners";
    const fireworksFrequency = formData.get("fireworksFrequency") || "subtle";
    const kiteCount = parseInt(formData.get("kiteCount") || "2", 10);
    const kiteSpeed = formData.get("kiteSpeed") || "gentle";
    const moonPosition = formData.get("moonPosition") || "top_right";
    const bannerText = formData.get("bannerText") || "";
    const customColors = formData.get("customColors") || null;
    const scheduledStartStr = formData.get("scheduledStart") || null;
    const scheduledEndStr = formData.get("scheduledEnd") || null;

    await prisma.festivalConfig.upsert({
      where: { shop_festivalId: { shop, festivalId } },
      create: {
        shop,
        festivalId,
        isActive,
        enableBanner,
        enableEffects,
        enableCountdown,
        enableColorSwap,
        enableAudio,
        enableWheel,
        language,
        diyaSize,
        diyaPosition,
        fireworksFrequency,
        kiteCount,
        kiteSpeed,
        moonPosition,
        bannerText,
        customColors,
        scheduledStart: scheduledStartStr ? new Date(scheduledStartStr) : null,
        scheduledEnd: scheduledEndStr ? new Date(scheduledEndStr) : null,
      },
      update: {
        isActive,
        enableBanner,
        enableEffects,
        enableCountdown,
        enableColorSwap,
        enableAudio,
        enableWheel,
        language,
        diyaSize,
        diyaPosition,
        fireworksFrequency,
        kiteCount,
        kiteSpeed,
        moonPosition,
        bannerText,
        customColors,
        scheduledStart: scheduledStartStr ? new Date(scheduledStartStr) : null,
        scheduledEnd: scheduledEndStr ? new Date(scheduledEndStr) : null,
      },
    });
  }

  return json({ success: true });
};

export default function FestivalConfig() {
  const { festival, config, plan } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [isActive, setIsActive] = useState(config.isActive);
  const [enableBanner, setEnableBanner] = useState(config.enableBanner ?? true);
  const [enableEffects, setEnableEffects] = useState(config.enableEffects ?? true);
  const [enableCountdown, setEnableCountdown] = useState(config.enableCountdown ?? true);
  const [enableColorSwap, setEnableColorSwap] = useState(config.enableColorSwap ?? true);
  const [enableAudio, setEnableAudio] = useState(config.enableAudio ?? true);
  const [enableWheel, setEnableWheel] = useState(config.enableWheel ?? true);
  const [language, setLanguage] = useState(config.language || "en");
  const [diyaSize, setDiyaSize] = useState(config.diyaSize || "medium");
  const [diyaPosition, setDiyaPosition] = useState(config.diyaPosition || "bottom_corners");
  const [fireworksFrequency, setFireworksFrequency] = useState(config.fireworksFrequency || "subtle");
  const [kiteCount, setKiteCount] = useState(String(config.kiteCount || 2));
  const [kiteSpeed, setKiteSpeed] = useState(config.kiteSpeed || "gentle");
  const [moonPosition, setMoonPosition] = useState(config.moonPosition || "top_right");
  const [bannerText, setBannerText] = useState(config.bannerText || festival.banner.defaultText);
  const [scheduledStart, setScheduledStart] = useState(
    config.scheduledStart ? new Date(config.scheduledStart).toISOString().split("T")[0] : ""
  );
  const [scheduledEnd, setScheduledEnd] = useState(
    config.scheduledEnd ? new Date(config.scheduledEnd).toISOString().split("T")[0] : ""
  );
  const [showPreview, setShowPreview] = useState(false);

  const isSaving = fetcher.state !== "idle";

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    const greetings = getFestivalGreetings(festival.id);
    if (greetings && greetings[newLang]) {
      setBannerText(greetings[newLang]);
    }
  }, [festival.id]);

  const handleSave = useCallback((activate = null) => {
    const activeState = activate !== null ? activate : isActive;
    const fd = new FormData();
    fd.append("actionType", "save");
    fd.append("isActive", String(activeState));
    fd.append("enableBanner", String(enableBanner));
    fd.append("enableEffects", String(enableEffects));
    fd.append("enableCountdown", String(enableCountdown));
    fd.append("enableColorSwap", String(enableColorSwap));
    fd.append("enableAudio", String(enableAudio));
    fd.append("enableWheel", String(enableWheel));
    fd.append("language", language);
    fd.append("diyaSize", diyaSize);
    fd.append("diyaPosition", diyaPosition);
    fd.append("fireworksFrequency", fireworksFrequency);
    fd.append("kiteCount", kiteCount);
    fd.append("kiteSpeed", kiteSpeed);
    fd.append("moonPosition", moonPosition);
    fd.append("bannerText", bannerText);
    fd.append("scheduledStart", scheduledStart);
    fd.append("scheduledEnd", scheduledEnd);
    fetcher.submit(fd, { method: "post" });
    if (activate !== null) setIsActive(activate);
  }, [isActive, enableBanner, enableEffects, enableCountdown, enableColorSwap, enableAudio, enableWheel, language, diyaSize, diyaPosition, fireworksFrequency, kiteCount, kiteSpeed, moonPosition, bannerText, scheduledStart, scheduledEnd]);

  const { primary, secondary, accent, background, text } = festival.palette;

  return (
    <Frame>
      <Page
        title={`${festival.emoji} ${festival.name}`}
        subtitle={festival.description}
        backAction={{ content: "Festival Library", url: "/app/festivals" }}
        primaryAction={{
          content: isActive ? "⏹ Deactivate Theme" : "▶ Activate Theme",
          onAction: () => handleSave(!isActive),
          loading: isSaving,
          tone: isActive ? "critical" : undefined,
        }}
        secondaryActions={[
          {
            content: "👁 Preview",
            onAction: () => setShowPreview(true),
          },
          {
            content: "💾 Save Settings",
            onAction: () => handleSave(),
            loading: isSaving,
          },
        ]}
      >
        <BlockStack gap="600">
          {/* Status Banner */}
          {isActive && (
            <Banner
              title={`🎉 ${festival.name} theme is LIVE on your store!`}
              tone="success"
            >
              <p>Your customers can see the {festival.name} theme right now. Deactivate when the festival ends.</p>
            </Banner>
          )}

          {fetcher.data?.success && (
            <Banner title="✅ Settings saved successfully!" tone="success" />
          )}

          <Layout>
            <Layout.Section>
              <BlockStack gap="500">
                {/* Theme Preview */}
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">🎨 Color Theme Preview</Text>
                    <div
                      style={{
                        height: "120px",
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${background} 0%, ${primary}40 50%, ${secondary}40 100%)`,
                        border: `2px solid ${primary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        padding: "20px",
                        boxShadow: `0 8px 32px ${festival.palette.glow}`,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "48px" }}>{festival.emoji}</div>
                        <div style={{ color: primary, fontWeight: 700, fontSize: "18px", fontFamily: "Poppins, sans-serif" }}>
                          {festival.name}
                        </div>
                        <div style={{ color: secondary, fontSize: "13px" }}>
                          {festival.hindiName}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[primary, secondary, accent, background, text].map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                              width: "24px", height: "24px", borderRadius: "6px",
                              background: c, border: "2px solid rgba(255,255,255,0.3)"
                            }} />
                            <span style={{ color: "#fff", fontSize: "11px", fontFamily: "monospace" }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </BlockStack>
                </Card>

                {/* Feature Toggles */}
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">⚙️ Theme Features</Text>
                    <Divider />
                    <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                      <FeatureToggle
                        emoji="🎌"
                        title="Festival Banner"
                        subtitle="Show an announcement banner at the top of your store"
                        checked={enableBanner}
                        onChange={setEnableBanner}
                      />
                      <FeatureToggle
                        emoji="✨"
                        title="Animated Effects"
                        subtitle={`Falling ${festival.effects.type} animation on the storefront`}
                        checked={enableEffects}
                        onChange={setEnableEffects}
                      />
                      <FeatureToggle
                        emoji="⏰"
                        title="Countdown Timer"
                        subtitle="Show a countdown widget until the festival"
                        checked={enableCountdown}
                        onChange={setEnableCountdown}
                      />
                      <FeatureToggle
                        emoji="🎨"
                        title="Color Theme Swap"
                        subtitle="Apply festival colors to your store's CSS variables"
                        checked={enableColorSwap}
                        onChange={setEnableColorSwap}
                      />
                      <FeatureToggle
                        emoji="🔔"
                        title="Festive Soundscapes"
                        subtitle="Synthesized auspicious temple bells & dhol beats via Web Audio"
                        checked={enableAudio}
                        onChange={setEnableAudio}
                      />
                      <FeatureToggle
                        emoji="🎡"
                        title="Shubh Labh Wheel"
                        subtitle="Gamified spin-the-wheel with festive coupon rewards"
                        checked={enableWheel}
                        onChange={setEnableWheel}
                      />
                    </InlineGrid>
                  </BlockStack>
                </Card>

                {/* Banner Text & Language */}
                {enableBanner && (
                  <Card>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h3">🎌 Banner Message & Language</Text>
                      <Select
                        label="Regional Language"
                        options={[
                          { label: "🌐 English", value: "en" },
                          { label: "🇮🇳 हिन्दी (Hindi)", value: "hi" },
                          { label: "தமிழ் (Tamil)", value: "ta" },
                          { label: "తెలుగు (Telugu)", value: "te" },
                          { label: "বাংলা (Bengali)", value: "bn" },
                          { label: "मराठी (Marathi)", value: "mr" },
                          { label: "ગુજરાતી (Gujarati)", value: "gu" },
                        ]}
                        value={language}
                        onChange={handleLanguageChange}
                        helpText="Selecting a language auto-populates culturally authentic festive greetings"
                      />
                      <TextField
                        label="Banner Text"
                        value={bannerText}
                        onChange={setBannerText}
                        multiline={2}
                        helpText="This message will appear in the announcement bar on your storefront."
                        maxLength={200}
                        showCharacterCount
                        autoComplete="off"
                      />
                      <Button
                        variant="plain"
                        onClick={() => setBannerText(festival.banner.defaultText)}
                      >
                        Reset to default English message
                      </Button>
                    </BlockStack>
                  </Card>
                )}

                {/* Cultural Visual Customizer */}
                {enableEffects && (
                  <Card>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h3">
                        🎨 Cultural Visual Customizer ({festival.name})
                      </Text>
                      <Divider />

                      {/* Diwali Customizations */}
                      {festival.id.includes("diwali") && (
                        <BlockStack gap="400">
                          <Text variant="bodyMd" fontWeight="semibold">🪔 Stationary Diya Settings</Text>
                          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                            <Select
                              label="Diya Dimensions"
                              options={[
                                { label: "Small (60px — Subtle)", value: "small" },
                                { label: "Medium (85px — Standard)", value: "medium" },
                                { label: "Large (110px — Prominent)", value: "large" },
                              ]}
                              value={diyaSize}
                              onChange={setDiyaSize}
                              helpText="Fixed dimensions of stationary brass diyas"
                            />
                            <Select
                              label="Diya Placement"
                              options={[
                                { label: "Both Bottom Corners (Classic)", value: "bottom_corners" },
                                { label: "Bottom-Left Corner Only", value: "bottom_left" },
                                { label: "Bottom-Right Corner Only", value: "bottom_right" },
                                { label: "Top Corners (Under Header)", value: "top_corners" },
                              ]}
                              value={diyaPosition}
                              onChange={setDiyaPosition}
                              helpText="Positions where diyas remain peacefully lit"
                            />
                          </InlineGrid>
                          <Divider />
                          <Text variant="bodyMd" fontWeight="semibold">🎆 Aerial Fireworks Sparkles</Text>
                          <Select
                            label="Fireworks Burst Frequency"
                            options={[
                              { label: "Off (Pure Quiet Candlelight - No Fireworks)", value: "off" },
                              { label: "Subtle (1 Willow Burst every 7.5s - Recommended)", value: "subtle" },
                              { label: "Moderate (Burst every 4.2s)", value: "moderate" },
                              { label: "Celebratory (Burst every 2.2s)", value: "celebratory" },
                            ]}
                            value={fireworksFrequency}
                            onChange={setFireworksFrequency}
                            helpText="Subtle golden aerial willow sparklers bursting gently in the upper margins"
                          />
                        </BlockStack>
                      )}

                      {/* Pongal & Makar Sankranti Customizations */}
                      {(festival.id.includes("pongal") || festival.id.includes("sankranti")) && (
                        <BlockStack gap="400">
                          <Text variant="bodyMd" fontWeight="semibold">🪁 Soaring Kites Settings</Text>
                          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                            <Select
                              label="Kites in Flight"
                              options={[
                                { label: "1 Kite (Minimalist & Clean)", value: "1" },
                                { label: "2 Kites (Balanced Sky)", value: "2" },
                                { label: "4 Kites (Festive Celebration)", value: "4" },
                              ]}
                              value={kiteCount}
                              onChange={setKiteCount}
                              helpText="Authentic fighter kites soaring gently across upper sky"
                            />
                            <Select
                              label="Wind Flight Pace"
                              options={[
                                { label: "Gentle Breeze (Slow & Peaceful)", value: "gentle" },
                                { label: "Active Breeze (Moderate Flight)", value: "moderate" },
                              ]}
                              value={kiteSpeed}
                              onChange={setKiteSpeed}
                              helpText="Controls sway and traversal pace across the sky"
                            />
                          </InlineGrid>
                        </BlockStack>
                      )}

                      {/* Eid Customizations */}
                      {festival.id.includes("eid") && (
                        <BlockStack gap="400">
                          <Text variant="bodyMd" fontWeight="semibold">🌙 Celestial Crescent Moon Settings</Text>
                          <Select
                            label="Crescent Moon Position"
                            options={[
                              { label: "Top-Right Corner (Traditional)", value: "top_right" },
                              { label: "Top-Left Corner", value: "top_left" },
                            ]}
                            value={moonPosition}
                            onChange={setMoonPosition}
                            helpText="Placement of the luminous golden crescent moon & star"
                          />
                        </BlockStack>
                      )}
                    </BlockStack>
                  </Card>
                )}
              </BlockStack>
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <BlockStack gap="400">
                {/* Schedule */}
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">📅 Schedule</Text>
                    <Text variant="bodySm" tone="subdued">
                      Set auto-activation dates. Leave blank to control manually.
                    </Text>
                    <Divider />
                    <TextField
                      label="Activate On"
                      type="date"
                      value={scheduledStart}
                      onChange={setScheduledStart}
                      autoComplete="off"
                      helpText="Theme will auto-activate on this date"
                    />
                    <TextField
                      label="Deactivate On"
                      type="date"
                      value={scheduledEnd}
                      onChange={setScheduledEnd}
                      autoComplete="off"
                      helpText="Theme will auto-deactivate on this date"
                    />
                  </BlockStack>
                </Card>

                {/* Festival Info */}
                <Card>
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">ℹ️ Festival Info</Text>
                    <Divider />
                    <BlockStack gap="200">
                      <InfoRow label="Region" value={festival.region} />
                      <InfoRow label="Duration" value={`${festival.duration} days`} />
                      <InfoRow label="Effect Type" value={festival.effects.type} />
                      <InfoRow label="Tier" value={
                        <Badge tone={festival.tier === "free" ? "success" : "warning"}>
                          {festival.tier === "free" ? "Free" : "Premium"}
                        </Badge>
                      } />
                    </BlockStack>
                    <Divider />
                    <Text variant="bodySm">
                      <strong>Tags:</strong>{" "}
                      {festival.tags.map((t, i) => (
                        <span key={i}>
                          <Badge key={t}>{t}</Badge>{" "}
                        </span>
                      ))}
                    </Text>
                  </BlockStack>
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>

      {/* Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Preview — ${festival.name} Theme`}
        large
      >
        <Modal.Section>
          <StorefrontPreview
            festival={festival}
            config={{
              enableBanner,
              enableEffects,
              enableCountdown,
              bannerText,
              diyaSize,
              diyaPosition,
              fireworksFrequency,
              kiteCount,
              moonPosition,
            }}
          />
        </Modal.Section>
      </Modal>
    </Frame>
  );
}

function FeatureToggle({ emoji, title, subtitle, checked, onChange }) {
  return (
    <Box
      background={checked ? "bg-surface-success" : "bg-surface-secondary"}
      borderRadius="200"
      padding="400"
      borderWidth="025"
      borderColor={checked ? "border-success" : "border"}
    >
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200">
            <Text variant="headingMd">{emoji}</Text>
            <Text variant="bodyMd" fontWeight="semibold">{title}</Text>
          </InlineStack>
          <Checkbox label="" checked={checked} onChange={() => onChange(!checked)} />
        </InlineStack>
        <Text variant="bodySm" tone="subdued">{subtitle}</Text>
      </BlockStack>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <InlineStack align="space-between">
      <Text variant="bodySm" tone="subdued">{label}</Text>
      {typeof value === "string" ? (
        <Text variant="bodySm" fontWeight="semibold">{value}</Text>
      ) : value}
    </InlineStack>
  );
}

function StorefrontPreview({ festival, config }) {
  const { primary, secondary, accent, background, text, glow } = festival.palette;

  const diyaPx = config.diyaSize === "small" ? "28px" : config.diyaSize === "large" ? "52px" : "38px";
  const pos = config.diyaPosition || "bottom_corners";
  const showLeftDiya = pos === "bottom_corners" || pos === "bottom_left" || pos === "top_corners";
  const showRightDiya = pos === "bottom_corners" || pos === "bottom_right" || pos === "top_corners";
  const isTopDiya = pos === "top_corners";

  return (
    <div style={{
      fontFamily: "Inter, sans-serif",
      background: "#f5f5f5",
      borderRadius: "12px",
      overflow: "hidden",
      border: "2px solid #e0e0e0",
      position: "relative",
    }}>
      {/* Festival Banner */}
      {config.enableBanner && (
        <div style={{
          background: `linear-gradient(90deg, ${background} 0%, ${primary}dd 50%, ${secondary}dd 100%)`,
          color: "#fff",
          padding: "12px 20px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          boxShadow: `0 2px 16px ${glow}`,
        }}>
          <span style={{ fontSize: "20px" }}>{festival.emoji}</span>
          <span>{config.bannerText}</span>
          <span style={{ fontSize: "20px" }}>{festival.emoji}</span>
        </div>
      )}

      {/* Mock store header */}
      <div style={{
        background: background,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `2px solid ${primary}44`,
      }}>
        <div style={{ color: primary, fontWeight: 800, fontSize: "22px", fontFamily: "Poppins, sans-serif" }}>
          {festival.emoji} MyStore
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Home", "Products", "Sale", "About"].map(item => (
            <span key={item} style={{ color: secondary, fontSize: "14px", fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Hero section */}
      <div style={{
        background: `linear-gradient(135deg, ${background} 0%, ${primary}33 100%)`,
        padding: "48px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {config.enableCountdown && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: `${primary}22`,
            border: `1px solid ${primary}66`,
            borderRadius: "24px",
            padding: "8px 20px",
            marginBottom: "20px",
            color: primary,
            fontSize: "14px",
            fontWeight: 600,
          }}>
            ⏰ {festival.name} in 7 days!
          </div>
        )}
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>{festival.emoji}</div>
        <div style={{ color: primary, fontSize: "36px", fontWeight: 800, fontFamily: "Poppins, sans-serif", marginBottom: "8px" }}>
          {festival.name} Sale
        </div>
        <div style={{ color: secondary, fontSize: "18px", marginBottom: "24px" }}>
          {festival.hindiName} — Celebrate with special offers
        </div>
        <div style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          color: "#fff",
          padding: "14px 32px",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "16px",
          boxShadow: `0 4px 20px ${glow}`,
          cursor: "pointer",
        }}>
          Shop {festival.name} Collection →
        </div>

        {/* Dynamic Cultural Visuals */}
        {config.enableEffects && (
          <>
            {/* Diwali Stationary Diyas */}
            {festival.id.includes("diwali") && (
              <>
                {showLeftDiya && (
                  <div style={{
                    position: "absolute",
                    bottom: isTopDiya ? "auto" : "12px",
                    top: isTopDiya ? "12px" : "auto",
                    left: "18px",
                    filter: `drop-shadow(0 0 16px ${primary})`,
                    pointerEvents: "none",
                  }}>
                    <span style={{ fontSize: diyaPx }}>🪔</span>
                  </div>
                )}
                {showRightDiya && (
                  <div style={{
                    position: "absolute",
                    bottom: isTopDiya ? "auto" : "12px",
                    top: isTopDiya ? "12px" : "auto",
                    right: "18px",
                    filter: `drop-shadow(0 0 16px ${primary})`,
                    pointerEvents: "none",
                  }}>
                    <span style={{ fontSize: diyaPx }}>🪔</span>
                  </div>
                )}
                {config.fireworksFrequency !== "off" && (
                  <div style={{ position: "absolute", top: "18px", right: "60px", pointerEvents: "none", opacity: 0.85 }}>
                    <span style={{ fontSize: "24px" }}>✨ 🎆</span>
                  </div>
                )}
              </>
            )}

            {/* Pongal & Sankranti Flying Kites */}
            {(festival.id.includes("pongal") || festival.id.includes("sankranti")) && (
              <div style={{ position: "absolute", top: "24px", right: "40px", pointerEvents: "none" }}>
                <span style={{ fontSize: "32px", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}>🪁</span>
              </div>
            )}

            {/* Eid Crescent Moon */}
            {festival.id.includes("eid") && (
              <div style={{
                position: "absolute",
                top: "20px",
                right: config.moonPosition === "top_left" ? "auto" : "24px",
                left: config.moonPosition === "top_left" ? "24px" : "auto",
                pointerEvents: "none",
                filter: `drop-shadow(0 0 14px ${primary})`,
              }}>
                <span style={{ fontSize: "36px" }}>🌙 ✨</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mock product grid */}
      <div style={{ padding: "24px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: `1px solid ${primary}33`,
              boxShadow: `0 2px 12px ${glow}`,
            }}>
              <div style={{
                height: "100px",
                background: `linear-gradient(135deg, ${primary}44, ${secondary}44)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
              }}>
                🛍️
              </div>
              <div style={{ padding: "12px" }}>
                <div style={{ fontWeight: 600, color: "#333", marginBottom: "4px" }}>Product {i}</div>
                <div style={{ color: primary, fontWeight: 700 }}>₹999</div>
                <div style={{
                  background: `${accent}22`,
                  color: accent,
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  display: "inline-block",
                  marginTop: "8px",
                  fontWeight: 600,
                }}>
                  🎉 Festival Offer
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
