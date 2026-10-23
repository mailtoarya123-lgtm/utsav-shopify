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
  InlineGrid,
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

  const customSettings = (() => {
    try {
      return config.customColors ? JSON.parse(config.customColors) : {};
    } catch (e) {
      return {};
    }
  })();

  const [diyaStyle, setDiyaStyle] = useState(customSettings.diyaStyle || "royal_brass");
  const [flameGlow, setFlameGlow] = useState(customSettings.flameGlow || "sacred_flicker");
  const [diyaSize, setDiyaSize] = useState(config.diyaSize || "medium");
  const [diyaPosition, setDiyaPosition] = useState(config.diyaPosition || "bottom_corners");
  const [fireworksStyle, setFireworksStyle] = useState(customSettings.fireworksStyle || "kamuro_willow");
  const [fireworksFrequency, setFireworksFrequency] = useState(config.fireworksFrequency || "subtle");
  const [fireworksSound, setFireworksSound] = useState(customSettings.fireworksSound || "muted");
  const [interactiveBlessing, setInteractiveBlessing] = useState(customSettings.interactiveBlessing ?? true);
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

    const customPayload = JSON.stringify({
      diyaStyle,
      flameGlow,
      fireworksStyle,
      fireworksSound,
      interactiveBlessing,
    });
    fd.append("customColors", customPayload);

    fetcher.submit(fd, { method: "post" });
    if (activate !== null) setIsActive(activate);
  }, [isActive, enableBanner, enableEffects, enableCountdown, enableColorSwap, enableAudio, enableWheel, language, diyaSize, diyaPosition, fireworksFrequency, kiteCount, kiteSpeed, moonPosition, bannerText, scheduledStart, scheduledEnd, diyaStyle, flameGlow, fireworksStyle, fireworksSound, interactiveBlessing]);

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
                        <BlockStack gap="500">
                          {/* Live Visual Sandbox Preview */}
                          <Box padding="300" background="bg-surface-secondary" borderRadius="300">
                            <BlockStack gap="200">
                              <InlineStack align="space-between">
                                <Text variant="bodySm" fontWeight="bold">✨ Real-Time Diya & Flame Preview</Text>
                                <Badge tone="info">Conversion-Safe Stationary</Badge>
                              </InlineStack>
                              <div
                                style={{
                                  height: "125px",
                                  borderRadius: "8px",
                                  background: "radial-gradient(ellipse at 50% 90%, #2A1502 0%, #100600 70%, #080300 100%)",
                                  position: "relative",
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid rgba(212, 175, 55, 0.3)",
                                }}
                              >
                                <DiyaPreviewWidget style={diyaStyle} flameGlow={flameGlow} size={diyaSize} />
                              </div>
                            </BlockStack>
                          </Box>

                          {/* 1. Diya Craftsmanship & Material */}
                          <BlockStack gap="300">
                            <Text variant="bodyMd" fontWeight="semibold">🏺 Diya Craftsmanship & Material</Text>
                            <Select
                              label="Diya Art Style"
                              options={[
                                { label: "🏺 Royal Brass (राजसी पीतल) — Molten gold reflections & carved scalloped rim", value: "royal_brass" },
                                { label: "🧱 Earthen Terracotta (मिट्टी का दीया) — Rustic warm red clay & handmade edge", value: "terracotta_clay" },
                                { label: "🪙 Shimmering Silver (चांदी का दीया) — Moonlit silver with diamond jewel flame", value: "silver_filigree" },
                                { label: "🌸 Floral Marigold Urli (गेंदा फूल अर्ली) — Floating brass bowl with fresh petals", value: "marigold_urli" },
                              ]}
                              value={diyaStyle}
                              onChange={setDiyaStyle}
                              helpText="Select authentic artisanal material and texture for storefront diyas"
                            />
                          </BlockStack>

                          {/* 2. Diya Placement & Size */}
                          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                            <Select
                              label="Diya Dimensions"
                              options={[
                                { label: "Small (60px — Subtle & Minimal)", value: "small" },
                                { label: "Medium (85px — Standard Balanced Luxury)", value: "medium" },
                                { label: "Large (115px — Grand Majestic Presence)", value: "large" },
                              ]}
                              value={diyaSize}
                              onChange={setDiyaSize}
                              helpText="Fixed dimensions of stationary diyas"
                            />
                            <Select
                              label="Diya Placement"
                              options={[
                                { label: "Both Bottom Corners (Classic)", value: "bottom_corners" },
                                { label: "Bottom-Right Corner Only (Chat Widget Safe)", value: "bottom_right" },
                                { label: "Bottom-Left Corner Only", value: "bottom_left" },
                                { label: "Top Corners (Under Header)", value: "top_corners" },
                                { label: "All 4 Corners (Majestic Quad Lighting)", value: "all_four" },
                              ]}
                              value={diyaPosition}
                              onChange={setDiyaPosition}
                              helpText="Positions where diyas remain peacefully lit"
                            />
                          </InlineGrid>

                          {/* 3. Flame Glow Aura */}
                          <Select
                            label="Flame Glow & Atmosphere"
                            options={[
                              { label: "🕯️ Sacred Temple Warmth — Gentle living flame with breathing golden halo", value: "sacred_flicker" },
                              { label: "🌟 Divine Radiance — Broad warm ambient glow illuminating screen corners", value: "divine_aura" },
                              { label: "✨ Akhand Jyoti (Sparkling Wick) — Micro-sparks rising from pure cotton wick", value: "sparkling_wick" },
                            ]}
                            value={flameGlow}
                            onChange={setFlameGlow}
                            helpText="Illumination atmosphere and halo warmth generated by the diyas"
                          />

                          {/* 4. Interactive Shopper Blessing */}
                          <Checkbox
                            label="Enable Tap-to-Bless (Shopper Diya Blessing)"
                            helpText="When shoppers click or tap any diya, a gentle burst of golden sparkles floats up with an auspicious Diwali greeting"
                            checked={interactiveBlessing}
                            onChange={setInteractiveBlessing}
                          />

                          <Divider />

                          {/* 5. Fireworks Options */}
                          <Text variant="bodyMd" fontWeight="semibold">🎆 Aerial Fireworks Sparkles (आतिशबाज़ी)</Text>
                          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                            <Select
                              label="Fireworks Visual Style"
                              options={[
                                { label: "🎋 Golden Kamuro Willow — Cascading golden glitter waterfall trails (Luxury)", value: "kamuro_willow" },
                                { label: "🌸 Rangoli Multi-Color Peony — Festive bursts in saffron, magenta & emerald", value: "peony_multicolor" },
                                { label: "✨ Corner Anar Sparkle Fountain — Soft fountains rising above corner diyas", value: "anar_fountain" },
                                { label: "🌀 Golden Chakri Whirl — Soft spinning rings of golden spark spirals", value: "chakri_whirl" },
                                { label: "⭐ Starlight Twinkle — Subtle gentle twinkling stars in upper margins", value: "starlight_twinkle" },
                              ]}
                              value={fireworksStyle}
                              onChange={setFireworksStyle}
                              helpText="Visual artistic style of aerial festival fireworks"
                            />
                            <Select
                              label="Fireworks Burst Frequency"
                              options={[
                                { label: "Off (Quiet Candlelight Only — No Fireworks)", value: "off" },
                                { label: "Subtle (1 Burst every 8.5s — Recommended for E-commerce)", value: "subtle" },
                                { label: "Moderate (Burst every 4.5s — Balanced Celebration)", value: "moderate" },
                                { label: "Celebratory (Burst every 2.2s — Full Grand Night)", value: "celebratory" },
                              ]}
                              value={fireworksFrequency}
                              onChange={setFireworksFrequency}
                              helpText="Controls time between aerial spark bursts in the upper sky margins"
                            />
                          </InlineGrid>

                          <Select
                            label="Festive Soundscape (Opt-in Web Audio)"
                            options={[
                              { label: "🔇 Silent & Respectful (100% Muted — Default)", value: "muted" },
                              { label: "🔔 Auspicious Temple Bells on Burst (Gentle meditative chime)", value: "temple_bells" },
                            ]}
                            value={fireworksSound}
                            onChange={setFireworksSound}
                            helpText="Audio accompaniment. Zero external MP3 downloads; synthesized via Web Audio."
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

function DiyaPreviewWidget({ style = "royal_brass", flameGlow = "sacred_flicker", size = "medium" }) {
  const pixelSize = size === "small" ? 55 : size === "large" ? 95 : 75;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <svg
        viewBox="0 0 120 100"
        width={pixelSize}
        height={Math.round(pixelSize * 0.82)}
        style={{
          filter:
            flameGlow === "divine_aura"
              ? "drop-shadow(0 0 20px rgba(255, 180, 0, 0.95))"
              : flameGlow === "sparkling_wick"
              ? "drop-shadow(0 0 14px rgba(255, 230, 100, 0.9))"
              : "drop-shadow(0 0 10px rgba(255, 140, 0, 0.8))",
        }}
      >
        <defs>
          <radialGradient id="prevGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FF6B35" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="prevFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={style === "silver_filigree" ? "#00BCD4" : "#FF3D00"} />
            <stop offset="40%" stopColor={style === "silver_filigree" ? "#80DEEA" : "#FF9800"} />
            <stop offset="80%" stopColor="#FFF59D" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Brass Gradients */}
          <linearGradient id="prevBrass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="80%" stopColor="#996515" />
            <stop offset="100%" stopColor="#5D4037" />
          </linearGradient>

          {/* Terracotta Clay Gradients */}
          <linearGradient id="prevClay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E07A5F" />
            <stop offset="40%" stopColor="#C85A27" />
            <stop offset="80%" stopColor="#8D3B16" />
            <stop offset="100%" stopColor="#541F09" />
          </linearGradient>

          {/* Silver Filigree Gradients */}
          <linearGradient id="prevSilver" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#ECEFF1" />
            <stop offset="70%" stopColor="#B0BEC5" />
            <stop offset="100%" stopColor="#546E7A" />
          </linearGradient>
        </defs>

        {/* Aura glow */}
        <circle cx="60" cy="36" r={flameGlow === "divine_aura" ? 44 : 32} fill="url(#prevGlow)" />

        {/* Flame with dynamic flicker */}
        <g style={{ animation: "utsavFlameFlicker 1.6s ease-in-out infinite alternate", transformOrigin: "60px 48px" }}>
          <path
            d="M 60 10 C 53 25 48 36 48 44 C 48 53 53 57 60 57 C 67 57 72 53 72 44 C 72 36 67 25 60 10 Z"
            fill="url(#prevFlame)"
          />
          <path
            d="M 60 20 C 55 29 53 37 53 44 C 53 49 55 53 60 53 C 65 53 67 49 67 44 C 67 37 65 29 60 20 Z"
            fill="#FFFDE7"
          />
          <line x1="60" y1="46" x2="60" y2="58" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Body based on Style */}
        {style === "terracotta_clay" ? (
          <>
            <ellipse cx="60" cy="58" rx="42" ry="11" fill="#E07A5F" />
            <path d="M 18 58 Q 20 84 60 86 Q 100 84 102 58 Z" fill="url(#prevClay)" />
            {/* Clay artisanal rim notches */}
            <path d="M 28 58 Q 60 63 92 58" stroke="#8D3B16" strokeWidth="1.5" fill="none" />
            <ellipse cx="60" cy="86" rx="22" ry="4" fill="#541F09" />
          </>
        ) : style === "silver_filigree" ? (
          <>
            <ellipse cx="60" cy="58" rx="41" ry="10" fill="#ECEFF1" />
            <path d="M 19 58 Q 21 83 60 85 Q 99 83 101 58 Z" fill="url(#prevSilver)" />
            {/* Filigree ornamental pattern */}
            <path d="M 26 62 Q 40 74 60 62 Q 80 74 94 62" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.8" />
            <path d="M 35 70 Q 60 79 85 70" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.6" />
            <ellipse cx="60" cy="85" rx="20" ry="4" fill="#37474F" />
          </>
        ) : style === "marigold_urli" ? (
          <>
            {/* Urli Shallow Bowl */}
            <ellipse cx="60" cy="62" rx="48" ry="14" fill="#E5C158" />
            <ellipse cx="60" cy="62" rx="44" ry="12" fill="#3E2723" />
            {/* Marigold Petals */}
            <circle cx="28" cy="62" r="7" fill="#FF9800" />
            <circle cx="38" cy="69" r="6" fill="#FFC107" />
            <circle cx="82" cy="69" r="6" fill="#FFC107" />
            <circle cx="92" cy="62" r="7" fill="#FF9800" />
            <circle cx="60" cy="71" r="6" fill="#FF5722" />
            {/* Center brass lamp */}
            <path d="M 40 60 Q 42 78 60 80 Q 78 78 80 60 Z" fill="url(#prevBrass)" />
            <ellipse cx="60" cy="81" rx="18" ry="3.5" fill="#5D4037" />
          </>
        ) : (
          /* Royal Brass (Default) */
          <>
            <ellipse cx="60" cy="58" rx="42" ry="10" fill="#FFE082" />
            <path d="M 18 58 Q 20 83 60 85 Q 100 83 102 58 Z" fill="url(#prevBrass)" />
            {/* Scalloped decorative rim */}
            <path
              d="M 24 61 Q 33 67 42 61 Q 51 67 60 61 Q 69 67 78 61 Q 87 67 96 61"
              stroke="#FFE082"
              strokeWidth="1.2"
              fill="none"
              opacity="0.75"
            />
            <ellipse cx="60" cy="85" rx="22" ry="4" fill="#5D4037" />
          </>
        )}
      </svg>
      <div
        style={{
          marginTop: "6px",
          fontSize: "11px",
          color: "#FFD700",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        {style === "terracotta_clay"
          ? "🧱 Earthen Mitti Clay"
          : style === "silver_filigree"
          ? "🪙 Silver Filigree"
          : style === "marigold_urli"
          ? "🌸 Floral Marigold Urli"
          : "🏺 Royal Brass"}
      </div>
    </div>
  );
}

