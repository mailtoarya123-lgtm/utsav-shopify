// Global Festival Library for Utsav App
// Culturally authentic, uniquely engineered festival experiences.
// Each festival has: id, aliases, name, hindiName/nativeName, region, tier, dates,
// culturalContext, signatureEffect, secondaryEffect, sampleProducts, palette, banner, tags.

export const FESTIVALS = [
  // ============================================================
  // 1. DIWALI (Deepavali) — Festival of Lights
  // ============================================================
  {
    id: "diwali",
    aliases: ["deepavali", "diwali-lights"],
    name: "Diwali",
    hindiName: "दीवाली",
    nativeName: "தீபாவளி / దీపావళి",
    emoji: "🪔",
    region: "Pan-India & Global Diaspora",
    tier: "free",
    description: "The Festival of Lights celebrating the victory of light over darkness and good over evil.",
    approximateMonth: 10, // October/November
    approximateDay: 1,
    duration: 5,
    culturalContext: "Sacred celebration marking Lord Rama's return to Ayodhya and Goddess Lakshmi's blessing. Expressed through warm clay and brass lamps (diyas), intricate rangolis, and electric series lights across doorways.",
    signatureEffect: {
      id: "living_brass_diya",
      name: "Living Brass Diya",
      description: "Artisanal hand-beaten brass oil lamps with gentle flickering flame physics and atmospheric warm halos.",
      visualType: "diya",
    },
    secondaryEffect: {
      id: "golden_sparkles",
      name: "Golden Sparkles & Series Lights",
      description: "Twinkling golden ambient dust particles and realistic catenary electric fairy lights wired along the toran.",
      visualType: "sparkles",
    },
    sampleProducts: [
      {
        title: "Akhand Brass Diya",
        price: "₹1,499",
        tag: "Bestseller",
        iconType: "diya",
      },
      {
        title: "Marigold Door Toran",
        price: "₹899",
        tag: "Handmade",
        iconType: "toran",
      },
    ],
    palette: {
      primary: "#FFD700",      // Gold
      secondary: "#FF6B35",    // Warm Orange
      accent: "#8B0000",       // Deep Red
      background: "#1A0A00",   // Deep dark brown
      text: "#FFFFFF",
      highlight: "#FFF8DC",    // Cornsilk
      glow: "rgba(255, 215, 0, 0.6)",
    },
    effects: {
      type: "diyas",
      particles: "sparks",
      animation: "glow-pulse",
    },
    banner: {
      defaultText: "✨ Happy Diwali! Light up your celebrations with our festive sale! 🪔",
      defaultCta: "Shop Diwali Sale",
    },
    tags: ["lights", "sweets", "diyas", "fireworks", "family"],
  },

  // ============================================================
  // 2. HOLI — Festival of Colors
  // ============================================================
  {
    id: "holi",
    aliases: ["dhuleti", "dol-yatra"],
    name: "Holi",
    hindiName: "होली",
    nativeName: "রঙিন হোলি",
    emoji: "🎨",
    region: "Pan-India & Global",
    tier: "free",
    description: "The Festival of Colors — a joyful celebration of divine love, spring harvest, and forgiveness.",
    approximateMonth: 2, // March
    approximateDay: 25,
    duration: 2,
    culturalContext: "Honors the divine romance of Radha-Krishna and the triumph of Prahlada. Celebrated with organic botanical powders (gulal), music, and spring festivities without generic mess.",
    signatureEffect: {
      id: "color_bloom",
      name: "Color Bloom",
      description: "Organic soft radial color blooms in magenta, turquoise, and saffron expanding gracefully upon storefront entry.",
      visualType: "color_bloom",
    },
    secondaryEffect: {
      id: "powder_particles",
      name: "Powder-Inspired Particles",
      description: "Gentle floating herbal gulal powder mist drifting lazily across the storefront backdrop.",
      visualType: "powder_particles",
    },
    sampleProducts: [
      {
        title: "Organic Herbal Gulal Set",
        price: "₹699",
        tag: "Eco-Friendly",
        iconType: "gulal",
      },
      {
        title: "Handcrafted Brass Pichkari",
        price: "₹1,499",
        tag: "Artisanal",
        iconType: "pichkari",
      },
    ],
    palette: {
      primary: "#FF1493",      // Deep Pink
      secondary: "#00CED1",    // Turquoise
      accent: "#FFD700",       // Saffron Gold
      background: "#180033",   // Royal Violet
      text: "#FFFFFF",
      highlight: "#FF4500",    // Vermillion
      glow: "rgba(255, 20, 147, 0.5)",
    },
    effects: {
      type: "colors",
      particles: "colorPowder",
      animation: "color-burst",
    },
    banner: {
      defaultText: "🎨 Rang Barse! Happy Holi! Celebrate with joyful vibrant savings! 🌈",
      defaultCta: "Shop Holi Offers",
    },
    tags: ["colors", "spring", "celebration", "gulal"],
  },

  // ============================================================
  // 3. NAVRATRI — Nine Divine Nights
  // ============================================================
  {
    id: "navratri",
    aliases: ["sharad-navratri", "garba"],
    name: "Navratri",
    hindiName: "नवरात्रि",
    nativeName: "નવરાત્રી ઉત્સવ",
    emoji: "💃",
    region: "Pan-India (Gujarat, Rajasthan, Maharashtra)",
    tier: "free",
    description: "Nine nights honoring the Divine Feminine (Maa Durga) through sacred music, fasting, and rhythmic Garba-Dandiya dance.",
    approximateMonth: 9, // October
    approximateDay: 2,
    duration: 9,
    culturalContext: "Celebrates Goddess Durga's victory over Mahishasura. Characterized by mirror-work chaniya cholis, rhythmic crossed dandiya sticks, and devotional concentric dance circles.",
    signatureEffect: {
      id: "rhythmic_motifs",
      name: "Decorative Rhythmic Motifs",
      description: "Intricate mirrored mandalas and crossed lacquer-carved dandiya stick motifs framing the storefront.",
      visualType: "dandiya_mandala",
    },
    secondaryEffect: {
      id: "warm_festive_lights",
      name: "Warm Festive Lights",
      description: "Vibrant rhythmic pulsing fairy lights tuned to festive 8-count garba beats.",
      visualType: "rhythmic_lights",
    },
    sampleProducts: [
      {
        title: "Hand-Carved Dandiya Pair",
        price: "₹799",
        tag: "Traditional",
        iconType: "dandiya",
      },
      {
        title: "Embroidered Chaniya Choli",
        price: "₹3,499",
        tag: "Festive Wear",
        iconType: "garment",
      },
    ],
    palette: {
      primary: "#FF4500",      // Saffron Vermillion
      secondary: "#FFD700",    // Royal Gold
      accent: "#9400D3",       // Festive Purple
      background: "#1A0020",   // Deep dark purple
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Hot Pink
      glow: "rgba(255, 69, 0, 0.6)",
    },
    effects: {
      type: "garba",
      particles: "flowers",
      animation: "spin-circle",
    },
    banner: {
      defaultText: "💃 Happy Navratri! Celebrate 9 nights of divine grace and festive deals! ✨",
      defaultCta: "Shop Navratri Sale",
    },
    tags: ["garba", "dandiya", "goddess", "dance"],
  },

  // ============================================================
  // 4. PONGAL & MAKAR SANKRANTI — Harvest Celebrations
  // ============================================================
  {
    id: "pongal",
    aliases: ["thai-pongal", "makar-sankranti", "sankranti"],
    name: "Pongal",
    hindiName: "पोंगल",
    nativeName: "தைப்பொங்கல் / సంక్రాంతి",
    emoji: "🌾",
    region: "Tamil Nadu, Andhra Pradesh, Telangana & South India",
    tier: "free",
    description: "Four-day harvest festival giving thanks to Surya (the Sun), nature, and farm animals for abundant crops.",
    approximateMonth: 0, // January
    approximateDay: 14,
    duration: 4,
    culturalContext: "Celebrates the boiling over of new rice and jaggery in traditional clay pots (Pongalo Pongal), welcoming prosperity with sacred rice-powder Kolam geometric art and tall sugarcane stalks.",
    signatureEffect: {
      id: "animated_kolam",
      name: "Animated Kolam Reveal",
      description: "Sacred geometric white rice flour kolam drawing itself seamlessly across the page entrance.",
      visualType: "kolam_reveal",
    },
    secondaryEffect: {
      id: "sugarcane_decor",
      name: "Sugarcane Decorations",
      description: "Fresh harvest purple sugarcane stalks and turmeric leaf bunches framing the store headers.",
      visualType: "sugarcane",
    },
    sampleProducts: [
      {
        title: "Traditional Clay Pongal Pot",
        price: "₹950",
        tag: "Auspicious",
        iconType: "pot",
      },
      {
        title: "Fresh Sugarcane & Turmeric Set",
        price: "₹450",
        tag: "Harvest",
        iconType: "harvest",
      },
    ],
    palette: {
      primary: "#FF8C00",      // Harvest Amber
      secondary: "#2E7D32",    // Sugarcane Green
      accent: "#FFD700",       // Sun Yellow
      background: "#0E1805",   // Dark foliage
      text: "#FFFFFF",
      highlight: "#FFF9C4",    // Cream
      glow: "rgba(255, 140, 0, 0.6)",
    },
    effects: {
      type: "kolam",
      particles: "grains",
      animation: "grow-reveal",
    },
    banner: {
      defaultText: "🌾 Happy Pongal! May prosperity overflow in your home and life! 🍯",
      defaultCta: "Shop Harvest Specials",
    },
    tags: ["pongal", "harvest", "kolam", "sugarcane"],
  },

  // ============================================================
  // 5. ONAM — Grand Kerala Harvest Festival
  // ============================================================
  {
    id: "onam",
    aliases: ["thiruvonam", "onam-festival"],
    name: "Onam",
    hindiName: "ओणम",
    nativeName: "ഓണം ആശംസകൾ",
    emoji: "🌺",
    region: "Kerala & Malayali Diaspora",
    tier: "free",
    description: "Kerala's grand national harvest festival welcoming the mythological King Mahabali back to his beloved land.",
    approximateMonth: 7, // August/September
    approximateDay: 28,
    duration: 10,
    culturalContext: "Marked by Athapookalam (concentric floral floor carpets laid out over 10 days), Vallam Kali snake boat races, traditional Kasavu attire, and Grand Onasadya feasts.",
    signatureEffect: {
      id: "pookalam_floral_reveal",
      name: "Pookalam Floral Reveal",
      description: "Intricately detailed concentric floral carpet revealing expanding petals of marigold, chethi, and shankupushpam.",
      visualType: "pookalam",
    },
    secondaryEffect: {
      id: "floating_petals",
      name: "Floating Petals",
      description: "Soft fragrant marigold and jasmine petals drifting gracefully downward across store content.",
      visualType: "floating_petals",
    },
    sampleProducts: [
      {
        title: "Kasavu Handwoven Gold Saree",
        price: "₹3,299",
        tag: "Traditional",
        iconType: "saree",
      },
      {
        title: "Hand-Beaten Brass Urli",
        price: "₹1,650",
        tag: "Artisanal",
        iconType: "urli",
      },
    ],
    palette: {
      primary: "#D4AF37",      // Royal Kasavu Gold
      secondary: "#1B5E20",    // Banana Leaf Green
      accent: "#E65100",       // Marigold Saffron
      background: "#081C08",   // Deep Palm Green
      text: "#FFFFFF",
      highlight: "#FFFDE7",    // Cream White
      glow: "rgba(212, 175, 55, 0.5)",
    },
    effects: {
      type: "pookalam",
      particles: "petals",
      animation: "petal-drift",
    },
    banner: {
      defaultText: "🌺 Happy Onam! Celebrate Kerala's grand harvest festival with royal deals! 🌊",
      defaultCta: "Shop Onam Collection",
    },
    tags: ["kerala", "pookalam", "harvest", "king-mahabali"],
  },

  // ============================================================
  // 6. RAKSHA BANDHAN — Sibling Bond of Protection
  // ============================================================
  {
    id: "raksha-bandhan",
    aliases: ["rakhi"],
    name: "Raksha Bandhan",
    hindiName: "रक्षाबंधन",
    nativeName: "રક્ષાબંધન",
    emoji: "🎁",
    region: "Pan-India",
    tier: "free",
    description: "Sacred festival celebrating the timeless bond of mutual love, trust, and protection between brothers and sisters.",
    approximateMonth: 7, // August
    approximateDay: 19,
    duration: 1,
    culturalContext: "Sisters tie a protective sacred thread (Rakhi) of silk, silver, or kalawa on their brother's wrist, sharing sweets and receiving heartfelt blessings and gifts.",
    signatureEffect: {
      id: "rakhi_ribbon_animation",
      name: "Rakhi Ribbon Animation",
      description: "Silken red-and-gold resham thread weaving smoothly into an auspicious medallion motif.",
      visualType: "rakhi_ribbon",
    },
    secondaryEffect: {
      id: "gift_reveal",
      name: "Gift Reveal",
      description: "Delicate golden shagun gift box reveal with auspicious tilak and rice grain accents.",
      visualType: "gift_reveal",
    },
    sampleProducts: [
      {
        title: "Handcrafted Silk Resham Rakhi",
        price: "₹499",
        tag: "Auspicious",
        iconType: "rakhi",
      },
      {
        title: "Gourmet Shagun Gift Hamper",
        price: "₹1,850",
        tag: "Bestseller",
        iconType: "hamper",
      },
    ],
    palette: {
      primary: "#C2185B",      // Festive Crimson
      secondary: "#FFD700",    // Royal Gold
      accent: "#E64A19",       // Vermillion
      background: "#1A000E",   // Deep Wine
      text: "#FFFFFF",
      highlight: "#FFEBEE",    // Soft Pearl
      glow: "rgba(194, 24, 91, 0.5)",
    },
    effects: {
      type: "rakhi",
      particles: "sparkles",
      animation: "ribbon-weave",
    },
    banner: {
      defaultText: "🎁 Happy Raksha Bandhan! Celebrate the sacred bond of sibling love with gifts! 💕",
      defaultCta: "Shop Rakhi Gifts",
    },
    tags: ["rakhi", "siblings", "family", "gifts"],
  },

  // ============================================================
  // 7. GANESH CHATURTHI — Arrival of Ganesha
  // ============================================================
  {
    id: "ganesh-chaturthi",
    aliases: ["vinayaka-chavithi"],
    name: "Ganesh Chaturthi",
    hindiName: "गणेश चतुर्थी",
    nativeName: "गणपती बाप्पा मोरया",
    emoji: "🌺",
    region: "Pan-India (Maharashtra, Karnataka, Telangana)",
    tier: "premium",
    description: "Ten-day festival celebrating the birth of Lord Ganesha, the harbinger of wisdom, prosperity, and remover of obstacles.",
    approximateMonth: 8, // September
    approximateDay: 7,
    duration: 10,
    culturalContext: "Celebrated with clay idols of Ganesha installed in homes and grand pandals, adorned with sacred red hibiscus flowers, fresh durva grass stalks, and offering of sweet modaks.",
    signatureEffect: {
      id: "floral_garland",
      name: "Sacred Floral Garland",
      description: "Garlands woven with sacred red hibiscus and 21 blades of fresh green durva grass framing the store.",
      visualType: "hibiscus_garland",
    },
    secondaryEffect: {
      id: "gentle_golden_glow",
      name: "Gentle Golden Glow",
      description: "Serene atmospheric divine aura radiating softly from page focal points.",
      visualType: "golden_glow",
    },
    sampleProducts: [
      {
        title: "Eco-Friendly Clay Ganesha",
        price: "₹1,899",
        tag: "Artisanal",
        iconType: "ganesha",
      },
      {
        title: "Cast Brass Modak Mould Set",
        price: "₹699",
        tag: "Traditional",
        iconType: "modak",
      },
    ],
    palette: {
      primary: "#D32F2F",      // Hibiscus Red
      secondary: "#FF8F00",    // Marigold Saffron
      accent: "#FFD700",       // Divine Gold
      background: "#180604",   // Deep Maroon
      text: "#FFFFFF",
      highlight: "#FFF3E0",    // Warm Ivory
      glow: "rgba(211, 47, 47, 0.5)",
    },
    effects: {
      type: "hibiscus",
      particles: "durva",
      animation: "divine-pulse",
    },
    banner: {
      defaultText: "🌺 Happy Ganesh Chaturthi! Ganpati Bappa Morya! May obstacles be removed! 🙏",
      defaultCta: "Shop Festive Decor",
    },
    tags: ["ganesha", "bappa", "modak", "hibiscus"],
  },

  // ============================================================
  // 8. EID AL-FITR — Celebration of Gratitude & Peace
  // ============================================================
  {
    id: "eid-ul-fitr",
    aliases: ["eid-al-fitr", "eid", "eid-mubarak"],
    name: "Eid al-Fitr",
    hindiName: "ईद-उल-फ़ितर",
    nativeName: "عید الفطر مبارک",
    emoji: "🌙",
    region: "Global & Pan-India",
    tier: "free",
    description: "Festival marking the culmination of the blessed month of Ramadan, dedicated to communal prayers, charity, and joyful fellowship.",
    approximateMonth: 3, // Lunar April (approximate)
    approximateDay: 10,
    duration: 3,
    culturalContext: "Dignified and culturally respectful. Avoids generic clip-art; highlights authentic handcrafted brass Fanoos lanterns with geometric Islamic filigree and tranquil moonlit illumination honoring the Hilal crescent sighting.",
    signatureEffect: {
      id: "crescent_ornament",
      name: "Crescent-Inspired Ornament",
      description: "Handcrafted Damascus brass Fanoos lantern with intricate geometric cuts swaying gently from the header.",
      visualType: "fanoos_lantern",
    },
    secondaryEffect: {
      id: "moonlit_illumination",
      name: "Moonlit Illumination",
      description: "Tranquil celestial starfield shimmer with silver and soft emerald moonlit radiance.",
      visualType: "moonlit_stars",
    },
    sampleProducts: [
      {
        title: "Damascus Brass Fanoos Lantern",
        price: "₹2,199",
        tag: "Artisanal",
        iconType: "fanoos",
      },
      {
        title: "Pure Royal Oud & Rose Attar",
        price: "₹1,850",
        tag: "Luxury",
        iconType: "attar",
      },
    ],
    palette: {
      primary: "#D4AF37",      // Antique Brass Gold
      secondary: "#00695C",    // Rich Emerald
      accent: "#B0BEC5",       // Moonlit Silver
      background: "#031412",   // Midnight Teal
      text: "#FFFFFF",
      highlight: "#E0F2F1",    // Pale Mint
      glow: "rgba(0, 105, 92, 0.4)",
    },
    effects: {
      type: "fanoos",
      particles: "moonlitStars",
      animation: "lantern-sway",
    },
    banner: {
      defaultText: "🌙 Eid Mubarak! Wishing you and your loved ones peace, joy, and blessed celebrations! 🌟",
      defaultCta: "Shop Eid Specials",
    },
    tags: ["eid", "fanoos", "crescent", "ramadan", "charity"],
  },

  // ============================================================
  // 9. CHRISTMAS — Season of Peace & Joy
  // ============================================================
  {
    id: "christmas-india",
    aliases: ["christmas", "xmas", "christmas-global"],
    name: "Christmas",
    hindiName: "क्रिसमस",
    nativeName: "Merry Christmas",
    emoji: "⭐",
    region: "Global & Indian Coastal/Northeast (Goa, Kerala, Meghalaya)",
    tier: "premium",
    description: "Celebration of love, generosity, and peace, adorned with fragrant evergreen pine, delicate snowfall, and twinkling lights.",
    approximateMonth: 11, // December
    approximateDay: 25,
    duration: 3,
    culturalContext: "Celebrated universally across cultures and communities with midnight hymns, star paper lanterns, plum cake, and evergreens. Uses clean minimal winter aesthetics.",
    signatureEffect: {
      id: "minimal_snowfall",
      name: "Minimal Snowfall",
      description: "Delicate, non-intrusive geometric SVG snowflakes drifting gently with subtle natural wind turbulence.",
      visualType: "snowfall",
    },
    secondaryEffect: {
      id: "twinkling_lights",
      name: "Twinkling Holiday Lights",
      description: "Warm holiday fairy lights woven across a top evergreen pine garland with gentle pulse cycles.",
      visualType: "holiday_lights",
    },
    sampleProducts: [
      {
        title: "Evergreen Holiday Wreath",
        price: "₹1,899",
        tag: "Handcrafted",
        iconType: "wreath",
      },
      {
        title: "Winter Star Glass Lantern",
        price: "₹1,299",
        tag: "Festive",
        iconType: "winter_star",
      },
    ],
    palette: {
      primary: "#C62828",      // Holly Berry Crimson
      secondary: "#2E7D32",    // Pine Needle Green
      accent: "#FFD700",       // Warm Gold
      background: "#08160C",   // Deep Winter Pine
      text: "#FFFFFF",
      highlight: "#FFFFFF",    // Crisp Snow White
      glow: "rgba(198, 40, 40, 0.45)",
    },
    effects: {
      type: "snowfall",
      particles: "snowflakes",
      animation: "snow-drift",
    },
    banner: {
      defaultText: "⭐ Merry Christmas! Celebrate the season of warmth, peace, and holiday gifting! 🎄",
      defaultCta: "Shop Holiday Collection",
    },
    tags: ["christmas", "snow", "lights", "winter", "holiday"],
  },

  // ============================================================
  // 10. HALLOWEEN — Atmospheric Autumn Night
  // ============================================================
  {
    id: "halloween",
    aliases: ["all-hallows-eve"],
    name: "Halloween",
    hindiName: "हैलोवीन",
    nativeName: "Happy Halloween",
    emoji: "🎃",
    region: "Global",
    tier: "premium",
    description: "Autumn evening celebration of mystery, costumes, and folklore with playful eerie ambiance.",
    approximateMonth: 9, // October
    approximateDay: 31,
    duration: 1,
    culturalContext: "Roots in ancient harvest festivals. Clean, sophisticated modern execution featuring gentle drifting silhouettes and amber glow without tacky jumpscares.",
    signatureEffect: {
      id: "ghost_silhouette",
      name: "Floating Ghost Silhouette",
      description: "Friendly translucent spectral silhouette floating softly across the store margins with smooth sinusoidal wave motion.",
      visualType: "ghost_drift",
    },
    secondaryEffect: {
      id: "soft_eerie_glow",
      name: "Soft Eerie Glow",
      description: "Atmospheric amber candlelight flicker and subtle misty twilight luminescence.",
      visualType: "eerie_glow",
    },
    sampleProducts: [
      {
        title: "Artisan Ceramic Ghost",
        price: "₹999",
        tag: "Hand-Cast",
        iconType: "ghost",
      },
      {
        title: "Spooky Amber Glass Lantern",
        price: "₹1,299",
        tag: "Atmospheric",
        iconType: "amber_lantern",
      },
    ],
    palette: {
      primary: "#FF7518",      // Pumpkin Orange
      secondary: "#6A0DAD",    // Mystic Violet
      accent: "#228B22",       // Slime Green
      background: "#0D0A14",   // Midnight Obsidian
      text: "#FFFFFF",
      highlight: "#FFD700",    // Candle Flame
      glow: "rgba(255, 117, 24, 0.5)",
    },
    effects: {
      type: "ghost",
      particles: "amberSparks",
      animation: "float-drift",
    },
    banner: {
      defaultText: "🎃 Spooktacular Deals! Treat yourself to enchanting Halloween savings! 👻",
      defaultCta: "Shop Halloween Specials",
    },
    tags: ["halloween", "autumn", "spooky", "pumpkin"],
  },

  // ============================================================
  // 11. VALENTINE'S DAY — Celebration of Love
  // ============================================================
  {
    id: "valentines-day",
    aliases: ["valentine", "valentines"],
    name: "Valentine's Day",
    hindiName: "वैलेंटाइन डे",
    nativeName: "Valentine's Day",
    emoji: "💝",
    region: "Global",
    tier: "premium",
    description: "Celebration of romantic love, deep companionship, and cherished personal bonds.",
    approximateMonth: 1, // February
    approximateDay: 14,
    duration: 2,
    culturalContext: "Celebrated worldwide with flowers, handwritten notes, and tokens of affection. Minimalist and refined satin and outline motifs.",
    signatureEffect: {
      id: "heart_outline",
      name: "Heart Outline Animation",
      description: "Refined mathematical SVG bezier heart path gracefully drawing itself with a warm pulsating shimmer.",
      visualType: "heart_contour",
    },
    secondaryEffect: {
      id: "ribbon_reveal",
      name: "Ribbon Reveal",
      description: "Satin silk ribbon unwrapping gently across headers with falling rose petals.",
      visualType: "ribbon_petals",
    },
    sampleProducts: [
      {
        title: "Satin Ribbon Gift Box",
        price: "₹1,250",
        tag: "Luxury",
        iconType: "gift_box",
      },
      {
        title: "Rose Gold Keepsake Pendant",
        price: "₹2,899",
        tag: "Bestseller",
        iconType: "jewelry",
      },
    ],
    palette: {
      primary: "#E91E63",      // Rose Pink
      secondary: "#C2185B",    // Deep Ruby
      accent: "#FFD700",       // Champagne Gold
      background: "#18050D",   // Velvet Burgundy
      text: "#FFFFFF",
      highlight: "#FCE4EC",    // Blush White
      glow: "rgba(233, 30, 99, 0.45)",
    },
    effects: {
      type: "heart",
      particles: "rosePetals",
      animation: "heart-pulse",
    },
    banner: {
      defaultText: "💝 From the Heart! Discover curated gifts for the ones you adore! 💕",
      defaultCta: "Shop Valentine's Gifts",
    },
    tags: ["love", "valentines", "gifts", "hearts"],
  },

  // ============================================================
  // 12. LUNAR NEW YEAR (Spring Festival)
  // ============================================================
  {
    id: "lunar-new-year",
    aliases: ["chinese-new-year", "spring-festival"],
    name: "Lunar New Year",
    hindiName: "चंद्र नव वर्ष",
    nativeName: "新年快乐 / 春节",
    emoji: "🏮",
    region: "East Asia, Southeast Asia & Global",
    tier: "premium",
    description: "Grand spring celebration of family reunion, good fortune, and new beginnings marked by the lunar calendar.",
    approximateMonth: 0, // January/February
    approximateDay: 29,
    duration: 15,
    culturalContext: "Celebrates hope, fortune (Fu), and prosperity with auspicious red paper-cuts, traditional hanging silk lanterns with golden tassels, and family feasts.",
    signatureEffect: {
      id: "red_lantern_sway",
      name: "Red Lantern Sway",
      description: "Auspicious scarlet silk lanterns with golden fringe swaying with pendulum physics from the upper viewport corners.",
      visualType: "lantern_sway",
    },
    secondaryEffect: {
      id: "golden_particles",
      name: "Golden Particles",
      description: "Shimmering gold foil leaf dust particles ascending gently like auspicious fireworks.",
      visualType: "gold_particles",
    },
    sampleProducts: [
      {
        title: "Silk Tassel Red Lantern",
        price: "₹1,150",
        tag: "Auspicious",
        iconType: "red_lantern",
      },
      {
        title: "Imperial Gold Foil Tea Set",
        price: "₹2,499",
        tag: "Premium",
        iconType: "tea_set",
      },
    ],
    palette: {
      primary: "#D32F2F",      // Imperial Vermillion
      secondary: "#FFD700",    // Auspicious Gold
      accent: "#B71C1C",       // Deep Crimson
      background: "#1A0505",   // Lacquer Red-Black
      text: "#FFFFFF",
      highlight: "#FFF8E1",    // Warm Silk
      glow: "rgba(211, 47, 47, 0.5)",
    },
    effects: {
      type: "lantern",
      particles: "goldDust",
      animation: "lantern-pendulum",
    },
    banner: {
      defaultText: "🏮 Gong Xi Fa Cai! Wishing you abundant prosperity and joy in the New Year! 🧧",
      defaultCta: "Shop Spring Festival",
    },
    tags: ["lunar", "lanterns", "spring", "prosperity"],
  },

  // ============================================================
  // 13. HANUKKAH — Festival of Lights
  // ============================================================
  {
    id: "hanukkah",
    aliases: ["chanukah", "festival-of-dedication"],
    name: "Hanukkah",
    hindiName: "हनुक्का",
    nativeName: "חֲנֻכָּה שַׂמֵחַ",
    emoji: "🕎",
    region: "Jewish Diaspora & Global",
    tier: "premium",
    description: "Eight-day Jewish Festival of Lights celebrating the miracle of the oil that burned for eight days in the Holy Temple.",
    approximateMonth: 11, // December (Hebrew Kislev)
    approximateDay: 14,
    duration: 8,
    culturalContext: "Dignified celebration centered on kindling the Menorah (Hanukkiah), singing Maoz Tzur, spinning dreidels, and enjoying olive-oil delicacies with family.",
    signatureEffect: {
      id: "candlelight_atmosphere",
      name: "Candlelight Atmosphere",
      description: "Handcrafted olive-wood nine-branch Menorah with warm, sacred flickering candlelight illuminating the viewport corners.",
      visualType: "menorah_candles",
    },
    secondaryEffect: {
      id: "subtle_light_shimmer",
      name: "Subtle Light Shimmer",
      description: "Tranquil blue-and-silver radiant starlight shimmer honoring the eight nights of dedication.",
      visualType: "silver_shimmer",
    },
    sampleProducts: [
      {
        title: "Olive Wood Nine-Branch Menorah",
        price: "₹3,200",
        tag: "Handcrafted",
        iconType: "menorah",
      },
      {
        title: "Dipped Beeswax Hanukkah Candles",
        price: "₹850",
        tag: "Natural",
        iconType: "candles",
      },
    ],
    palette: {
      primary: "#1565C0",      // Deep Star Blue
      secondary: "#FFD700",    // Menorah Candle Gold
      accent: "#ECEFF1",       // Sterling Silver
      background: "#081226",   // Deep Sapphire Night
      text: "#FFFFFF",
      highlight: "#E3F2FD",    // Soft Light
      glow: "rgba(21, 101, 192, 0.45)",
    },
    effects: {
      type: "menorah",
      particles: "candleFlicker",
      animation: "candle-glow",
    },
    banner: {
      defaultText: "🕎 Hanukkah Sameach! May the Menorah lights bring warmth and peace to your home! 🕯️",
      defaultCta: "Shop Hanukkah Collection",
    },
    tags: ["hanukkah", "menorah", "lights", "miracle"],
  },

  // ============================================================
  // 14. EASTER — Spring Celebration of Renewal
  // ============================================================
  {
    id: "easter",
    aliases: ["easter-sunday", "resurrection-sunday"],
    name: "Easter",
    hindiName: "ईस्टर",
    nativeName: "Happy Easter",
    emoji: "🌸",
    region: "Global",
    tier: "premium",
    description: "Joyful celebration of rebirth, hope, and new beginnings accompanying the arrival of spring.",
    approximateMonth: 3, // March/April
    approximateDay: 12,
    duration: 2,
    culturalContext: "Celebrated with church bells, sunrise services, pastel flower arrangements, and gathering of family over traditional spring feasts.",
    signatureEffect: {
      id: "pastel_motifs",
      name: "Pastel Decorative Motifs",
      description: "Delicate botanical spring motifs in soft lavender, blush pink, and mint framing the storefront.",
      visualType: "pastel_botanicals",
    },
    secondaryEffect: {
      id: "spring_petals",
      name: "Spring Petals",
      description: "Gentle cherry blossom and tulip petals swirling softly on initial page entrance.",
      visualType: "spring_petals",
    },
    sampleProducts: [
      {
        title: "Pastel Ceramic Easter Basket",
        price: "₹1,350",
        tag: "Artisanal",
        iconType: "easter_basket",
      },
      {
        title: "Hand-Painted Floral Keepsake",
        price: "₹950",
        tag: "Spring",
        iconType: "keepsake",
      },
    ],
    palette: {
      primary: "#AB47BC",      // Soft Lilac
      secondary: "#F48FB1",    // Pastel Pink
      accent: "#80CBC4",       // Spring Mint
      background: "#180D1C",   // Velvet Twilight
      text: "#FFFFFF",
      highlight: "#FFF9C4",    // Pale Buttercup
      glow: "rgba(171, 71, 188, 0.4)",
    },
    effects: {
      type: "spring",
      particles: "blossomPetals",
      animation: "blossom-drift",
    },
    banner: {
      defaultText: "🌸 Happy Easter! Celebrate renewal, joy, and fresh spring savings! 🌿",
      defaultCta: "Shop Easter Collection",
    },
    tags: ["easter", "spring", "renewal", "flowers"],
  },

  // ============================================================
  // 15. THANKSGIVING — Harvest of Gratitude
  // ============================================================
  {
    id: "thanksgiving",
    aliases: ["thanksgiving-day"],
    name: "Thanksgiving",
    hindiName: "थैंक्सगिविंग",
    nativeName: "Happy Thanksgiving",
    emoji: "🍁",
    region: "North America & Global",
    tier: "premium",
    description: "Annual day of giving thanks for the blessings of harvest, family warmth, and community.",
    approximateMonth: 10, // November
    approximateDay: 28,
    duration: 2,
    culturalContext: "Traditional gathering of loved ones around a shared feast, sharing gratitude and surrounded by warm harvest table decor and autumn leaves.",
    signatureEffect: {
      id: "autumn_leaf_drift",
      name: "Autumn Leaf Drift",
      description: "Crisp amber oak and scarlet maple leaves drifting smoothly with 3D rotation and settling gracefully.",
      visualType: "autumn_leaves",
    },
    secondaryEffect: {
      id: "warm_ambient_lighting",
      name: "Warm Ambient Lighting",
      description: "Rich amber hearth glow and soft golden candlelight halo over storefront elements.",
      visualType: "hearth_glow",
    },
    sampleProducts: [
      {
        title: "Artisan Ceramic Pumpkin Server",
        price: "₹1,750",
        tag: "Handcrafted",
        iconType: "pumpkin",
      },
      {
        title: "Spiced Cider & Amber Candle",
        price: "₹899",
        tag: "Seasonal",
        iconType: "candle",
      },
    ],
    palette: {
      primary: "#D84315",      // Burnt Saffron Amber
      secondary: "#E65100",    // Harvest Orange
      accent: "#8D6E63",       // Rustic Wood
      background: "#1A0903",   // Hearthside Chestnut
      text: "#FFFFFF",
      highlight: "#FFE082",    // Warm Butter
      glow: "rgba(216, 67, 21, 0.5)",
    },
    effects: {
      type: "autumn",
      particles: "leaves",
      animation: "leaf-tumbling",
    },
    banner: {
      defaultText: "🍁 Happy Thanksgiving! A season to give thanks and share joyful memories! 🦃",
      defaultCta: "Shop Harvest Deals",
    },
    tags: ["thanksgiving", "harvest", "gratitude", "autumn"],
  },

  // ============================================================
  // 16. NEW YEAR — Midnight Countdown & Fireworks
  // ============================================================
  {
    id: "new-year",
    aliases: ["new-years-eve", "nye", "new-year-global"],
    name: "New Year",
    hindiName: "नव वर्ष",
    nativeName: "Happy New Year",
    emoji: "🎉",
    region: "Global & Pan-India",
    tier: "premium",
    description: "Ringing in fresh beginnings and resolutions worldwide at midnight with dazzling lights and celebration.",
    approximateMonth: 11, // December 31 / Jan 1
    approximateDay: 31,
    duration: 2,
    culturalContext: "Global celebration of fresh aspirations, countdowns, and midnight toasts, marked by micro fireworks and celebratory golden confetti.",
    signatureEffect: {
      id: "micro_fireworks",
      name: "Micro Fireworks",
      description: "Refined aerial chrysanthemum fireworks bursting gently over the storefront hero banner.",
      visualType: "fireworks_chrysanthemum",
    },
    secondaryEffect: {
      id: "countdown_celebration",
      name: "Countdown Celebration",
      description: "Sleek countdown timer banner with golden cascade confetti celebrating the milestone.",
      visualType: "countdown_confetti",
    },
    sampleProducts: [
      {
        title: "Celebration Crystal Flute Pair",
        price: "₹2,499",
        tag: "Premium",
        iconType: "flute",
      },
      {
        title: "Midnight Countdown Party Box",
        price: "₹1,650",
        tag: "Limited",
        iconType: "party_box",
      },
    ],
    palette: {
      primary: "#FFD700",      // Champagne Gold
      secondary: "#7B1FA2",    // Midnight Purple
      accent: "#00E5FF",       // Electric Cyan
      background: "#080612",   // Midnight Obsidian
      text: "#FFFFFF",
      highlight: "#FFFFFF",    // Starlight
      glow: "rgba(255, 215, 0, 0.55)",
    },
    effects: {
      type: "fireworks",
      particles: "confetti",
      animation: "firework-burst",
    },
    banner: {
      defaultText: "🎉 Happy New Year! Step into 2026 with exclusive celebration discounts! 🥂",
      defaultCta: "Shop New Year Sale",
    },
    tags: ["new-year", "fireworks", "celebration", "countdown"],
  },

  // ============================================================
  // 17. MID-AUTUMN FESTIVAL — Harvest Moon & Lanterns
  // ============================================================
  {
    id: "mid-autumn",
    aliases: ["moon-festival", "mooncake-festival"],
    name: "Mid-Autumn Festival",
    hindiName: "मध्य-शरद उत्सव",
    nativeName: "中秋节快乐 / 추석",
    emoji: "🥮",
    region: "East & Southeast Asia",
    tier: "premium",
    description: "Celebration of family togetherness, gratitude, and the full harvest moon, accompanied by lanterns and mooncakes.",
    approximateMonth: 8, // September/October
    approximateDay: 17,
    duration: 3,
    culturalContext: "Centuries-old harvest festival dedicated to admiring the luminous full moon, sharing sweet mooncakes, and releasing paper lanterns into the night.",
    signatureEffect: {
      id: "moonlight_glow",
      name: "Moonlight Glow",
      description: "Serene celestial harvest full moon radiating silver luminescence across the storefront background.",
      visualType: "harvest_moon",
    },
    secondaryEffect: {
      id: "lantern_movement",
      name: "Lantern Movement",
      description: "Artisanal paper lanterns floating gently upward toward the night sky with soft amber wicks.",
      visualType: "floating_lanterns",
    },
    sampleProducts: [
      {
        title: "Artisanal Wooden Mooncake Box",
        price: "₹1,950",
        tag: "Traditional",
        iconType: "mooncake",
      },
      {
        title: "Handmade Bamboo Paper Lantern",
        price: "₹850",
        tag: "Artisanal",
        iconType: "paper_lantern",
      },
    ],
    palette: {
      primary: "#FFD54F",      // Harvest Moon Gold
      secondary: "#1A237E",    // Midnight Indigo
      accent: "#D81B60",       // Peony Crimson
      background: "#080B1E",   // Deep Celestial Sky
      text: "#FFFFFF",
      highlight: "#FFFDE7",    // Moonlit Silver
      glow: "rgba(255, 213, 79, 0.45)",
    },
    effects: {
      type: "moon",
      particles: "floatingLanterns",
      animation: "moon-radiance",
    },
    banner: {
      defaultText: "🥮 Happy Mid-Autumn Festival! May the full moon bring harmony and happiness! 🏮",
      defaultCta: "Shop Mooncake Sets",
    },
    tags: ["mid-autumn", "mooncake", "lanterns", "full-moon"],
  },

  // ============================================================
  // 18. VESAK — Buddha Day & Enlightenment
  // ============================================================
  {
    id: "vesak",
    aliases: ["buddha-purnima", "vesak-day"],
    name: "Vesak",
    hindiName: "बुद्ध पूर्णिमा",
    nativeName: "Buddha Jayanti / വസന്ത്",
    emoji: "🪷",
    region: "South & Southeast Asia & Global",
    tier: "premium",
    description: "The most sacred Buddhist festival commemorating the birth, enlightenment (Bodhi), and Parinirvana of Gautama Buddha.",
    approximateMonth: 4, // May full moon
    approximateDay: 23,
    duration: 1,
    culturalContext: "Marked by meditation, generosity, acts of loving-kindness, and lighting lanterns and candles symbolizing the light of Dhamma dispelling ignorance.",
    signatureEffect: {
      id: "lotus_decoration",
      name: "Lotus-Inspired Decoration",
      description: "Sacred pristine blooming lotus flower unfolding gracefully from the corners with serene geometry.",
      visualType: "sacred_lotus",
    },
    secondaryEffect: {
      id: "gentle_illumination",
      name: "Gentle Illumination",
      description: "Peaceful warm halo and bodhi leaf silhouette radiance spreading tranquil light.",
      visualType: "bodhi_light",
    },
    sampleProducts: [
      {
        title: "Cast Brass Blooming Lotus Urli",
        price: "₹1,850",
        tag: "Handcrafted",
        iconType: "lotus_urli",
      },
      {
        title: "Tranquil Bodhi Leaf Oil Lamp",
        price: "₹1,299",
        tag: "Meditative",
        iconType: "bodhi_lamp",
      },
    ],
    palette: {
      primary: "#F57C00",      // Saffron Ochre
      secondary: "#F8BBD0",    // Lotus Petal Pink
      accent: "#FFD700",       // Golden Aura
      background: "#120B05",   // Teakwood Dusk
      text: "#FFFFFF",
      highlight: "#FFF8E1",    // Warm Jasmine
      glow: "rgba(245, 124, 0, 0.45)",
    },
    effects: {
      type: "lotus",
      particles: "softLight",
      animation: "lotus-bloom",
    },
    banner: {
      defaultText: "🪷 Happy Vesak! May peace, compassion, and enlightenment blossom in your life! 🙏",
      defaultCta: "Shop Meditative Decor",
    },
    tags: ["vesak", "buddha", "lotus", "peace", "enlightenment"],
  },

  // ============================================================
  // 19. VISHU — Kerala New Year
  // ============================================================
  {
    id: "vishu",
    aliases: ["vishu-kani"],
    name: "Vishu",
    hindiName: "विशु",
    nativeName: "വിഷു ആശംസകൾ",
    emoji: "🌟",
    region: "Kerala & Malayali Diaspora",
    tier: "premium",
    description: "Kerala's astrological New Year marking the spring equinox, celebrated by viewing the auspicious Vishukkani at dawn.",
    approximateMonth: 3, // April
    approximateDay: 14,
    duration: 1,
    culturalContext: "Traditional dawn viewing of the Vishukkani (golden cucumber, raw rice, Betel leaves, sacred mirror, coins, and golden Kanikonna flowers) beside the holy Nilavilakku lamp to ensure prosperity for the entire year.",
    signatureEffect: {
      id: "kanikonna_cascades",
      name: "Golden Kanikonna Blossom Cascades",
      description: "Lush hanging golden yellow Cassia fistula (Kanikonna) floral garlands framing the entrance arch.",
      visualType: "kanikonna_blossoms",
    },
    secondaryEffect: {
      id: "nilavilakku_glow",
      name: "Traditional Nilavilakku Lamp Glow",
      description: "Authentic Kerala cast-brass Nilavilakku floor lamp with a steady, sacred golden flame.",
      visualType: "nilavilakku_lamp",
    },
    sampleProducts: [
      {
        title: "Vishu Kani Brass Urli",
        price: "₹2,499",
        tag: "Auspicious",
        iconType: "urli",
      },
      {
        title: "Cast Brass Nilavilakku Lamp",
        price: "₹1,799",
        tag: "Traditional",
        iconType: "nilavilakku",
      },
    ],
    palette: {
      primary: "#FFD700",      // Kanikonna Gold
      secondary: "#2E7D32",    // Plantain Green
      accent: "#FF6D00",       // Deep Amber
      background: "#0A1A0A",   // Coconut Grove Night
      text: "#FFFFFF",
      highlight: "#FFFF8D",    // Radiant Yellow
      glow: "rgba(255, 215, 0, 0.6)",
    },
    effects: {
      type: "kani",
      particles: "kanikonnaPetals",
      animation: "golden-sway",
    },
    banner: {
      defaultText: "🌟 Happy Vishu! Vishu Ashamsakal! A prosperous and blessed Kerala New Year! 🌺",
      defaultCta: "Shop Vishu Specials",
    },
    tags: ["kerala", "vishu", "kanikonna", "nilavilakku", "new-year"],
  },

  // ============================================================
  // 20. DURGA PUJA — Grand Bengali Festival of Maa Durga
  // ============================================================
  {
    id: "durga-puja",
    aliases: ["sharodotsav"],
    name: "Durga Puja",
    hindiName: "दुर्गा पूजा",
    nativeName: "শুভ শারদীয়া",
    emoji: "🔱",
    region: "Bengal, Odisha, Assam & Global",
    tier: "premium",
    description: "Grand ten-day celebration of the victory of Goddess Durga, revered for majestic pandals, art, and devotional Dhunachi dance.",
    approximateMonth: 9, // October
    approximateDay: 8,
    duration: 5,
    culturalContext: "Celebrated with profound devotion and artistic grandeur. Characterized by autumn Kash flowers, rhythmic Dhak drumbeats, and aromatic holy smoke from clay Dhunachi incense burners during evening aarti.",
    signatureEffect: {
      id: "dhunachi_incense",
      name: "Dhunachi Holy Incense",
      description: "Clay Dhunachi burner releasing soft swirling tendrils of sacred coconut-husk and camphor smoke.",
      visualType: "dhunachi_smoke",
    },
    secondaryEffect: {
      id: "kash_flowers_aarti",
      name: "Kash Flowers & Aarti Radiance",
      description: "Silky white autumn Kash reeds swaying gently with warm brass aarti lamp glow.",
      visualType: "kash_flowers",
    },
    sampleProducts: [
      {
        title: "Hand-Carved Dhunachi Incense Burner",
        price: "₹1,250",
        tag: "Sacred",
        iconType: "dhunachi",
      },
      {
        title: "Pure Dhuno Incense Flakes",
        price: "₹499",
        tag: "Artisanal",
        iconType: "incense",
      },
    ],
    palette: {
      primary: "#C62828",      // Sindoor Red
      secondary: "#FFD700",    // Royal Gold
      accent: "#ECEFF1",       // Kash Flower White
      background: "#160507",   // Crimson Night
      text: "#FFFFFF",
      highlight: "#FFFDE7",    // Cream
      glow: "rgba(198, 40, 40, 0.55)",
    },
    effects: {
      type: "durga",
      particles: "dhunoSmoke",
      animation: "smoke-swirl",
    },
    banner: {
      defaultText: "🔱 Subho Sharodiya! May Maa Durga bless your life with strength, grace, and joy! 🌺",
      defaultCta: "Shop Pujo Collection",
    },
    tags: ["durga", "pujo", "dhunachi", "kash", "bengal"],
  },

  // ============================================================
  // 21. MAKAR SANKRANTI — Kites of Uttarayan
  // ============================================================
  {
    id: "makar-sankranti",
    aliases: ["uttarayan", "kite-festival"],
    name: "Makar Sankranti",
    hindiName: "मकर संक्रांति",
    nativeName: "ઉત્તરાયણ / సంక్రాంతి",
    emoji: "🪁",
    region: "Gujarat, Maharashtra, Rajasthan & Pan-India",
    tier: "premium",
    description: "Sun-transit festival welcoming longer sunny days with vibrant kite-flying battles and sweet sesame treats.",
    approximateMonth: 0, // January
    approximateDay: 14,
    duration: 2,
    culturalContext: "Celebrates the Sun's northern journey (Uttarayan). Rooftops echo with joyful shouts of 'Kai Po Che!' as colorful tissue-paper kites dance across bright winter skies.",
    signatureEffect: {
      id: "soaring_kites",
      name: "Soaring Artisanal Kites",
      description: "Handcrafted diamond kites soaring dynamically with realistic aerodynamic tugs and string physics.",
      visualType: "flying_kites",
    },
    secondaryEffect: {
      id: "golden_sunshine",
      name: "Golden Sunshine & Sesame Warmth",
      description: "Crisp winter sun rays and warm amber accents honoring the harvest.",
      visualType: "sun_rays",
    },
    sampleProducts: [
      {
        title: "Handcrafted Bamboo & Tissue Kites (Pack of 6)",
        price: "₹550",
        tag: "Festive",
        iconType: "kite",
      },
      {
        title: "Brass Til-Gud Sweet Box",
        price: "₹1,150",
        tag: "Artisanal",
        iconType: "sweet_box",
      },
    ],
    palette: {
      primary: "#FF6D00",      // Kite Saffron
      secondary: "#00B0FF",    // Clear Sky Blue
      accent: "#FFD700",       // Sunshine Gold
      background: "#08101E",   // Crisp Morning Sky
      text: "#FFFFFF",
      highlight: "#FFF9C4",    // Sunbeam
      glow: "rgba(255, 109, 0, 0.5)",
    },
    effects: {
      type: "kites",
      particles: "kiteDust",
      animation: "kite-glide",
    },
    banner: {
      defaultText: "🪁 Kai Po Che! Happy Makar Sankranti! Soar high with vibrant festive savings! ☀️",
      defaultCta: "Shop Sankranti Sale",
    },
    tags: ["sankranti", "kites", "uttarayan", "harvest"],
  },

  // ============================================================
  // 22. DUSSEHRA (Vijayadashami) — Triumph of Good
  // ============================================================
  {
    id: "dussehra",
    aliases: ["vijayadashami"],
    name: "Dussehra",
    hindiName: "दशहरा",
    nativeName: "விஜயதசமி / విజయదశమి",
    emoji: "🏹",
    region: "Pan-India",
    tier: "free",
    description: "Celebration of the triumph of virtue over vice, Lord Rama's defeat of Ravana, and auspicious new beginnings.",
    approximateMonth: 9, // October
    approximateDay: 11,
    duration: 1,
    culturalContext: "Celebrated with Ramlila performances, burning of effigies symbolizing inner negativity, and worship of tools and knowledge (Shami tree / Vidyarambham).",
    signatureEffect: {
      id: "golden_bow_arrows",
      name: "Golden Bow & Arrow Motifs",
      description: "Artisanal golden bow-and-arrow emblem with auspicious Shami leaf garlands.",
      visualType: "bow_motif",
    },
    secondaryEffect: {
      id: "triumphant_glow",
      name: "Triumphant Radiant Glow",
      description: "Aura of golden victory embers illuminating banner and header elements.",
      visualType: "victory_glow",
    },
    sampleProducts: [
      {
        title: "Brass Kodanda Rama Idol",
        price: "₹2,100",
        tag: "Sacred",
        iconType: "rama_idol",
      },
      {
        title: "Auspicious Shami Leaf Gold Charm",
        price: "₹1,450",
        tag: "Bestseller",
        iconType: "charm",
      },
    ],
    palette: {
      primary: "#FF8C00",      // Flame Amber
      secondary: "#1B5E20",    // Shami Leaf Green
      accent: "#FFD700",       // Victory Gold
      background: "#120800",   // Twilight Saffron
      text: "#FFFFFF",
      highlight: "#FFF8E1",    // Warm Glow
      glow: "rgba(255, 140, 0, 0.6)",
    },
    effects: {
      type: "arrows",
      particles: "embers",
      animation: "triumph-pulse",
    },
    banner: {
      defaultText: "🏹 Happy Dussehra! May righteousness, wisdom, and victory illuminate your path! ✨",
      defaultCta: "Shop Dussehra Specials",
    },
    tags: ["dussehra", "vijayadashami", "victory", "ram"],
  },
];

// Helper: Get festival by ID or Alias
export function getFestivalById(id) {
  if (!id) return null;
  const cleanId = String(id).toLowerCase().trim();
  return (
    FESTIVALS.find(
      (f) =>
        f.id === cleanId ||
        (f.aliases && f.aliases.includes(cleanId)) ||
        f.id.replace(/-/g, "") === cleanId.replace(/-/g, "")
    ) || null
  );
}

// Helper: Get upcoming festivals within the next N days
export function getUpcomingFestivals(daysAhead = 60) {
  const today = new Date();
  const upcoming = [];

  for (const festival of FESTIVALS) {
    let festDate = new Date(
      today.getFullYear(),
      festival.approximateMonth,
      festival.approximateDay
    );

    if (festDate < today) {
      festDate.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      upcoming.push({ ...festival, daysUntil, nextDate: festDate });
    }
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

// Helper: Get all free festivals
export function getFreeFestivals() {
  return FESTIVALS.filter((f) => f.tier === "free");
}

// Helper: Get all premium festivals
export function getPremiumFestivals() {
  return FESTIVALS.filter((f) => f.tier === "premium");
}

// Helper: Get festival days until next occurrence
export function getDaysUntilFestival(festival) {
  if (!festival) return 0;
  const today = new Date();
  let festDate = new Date(
    today.getFullYear(),
    festival.approximateMonth,
    festival.approximateDay
  );
  if (festDate < today) {
    festDate.setFullYear(today.getFullYear() + 1);
  }
  return Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));
}

// Multilingual festive greetings for store announcements
export const MULTILINGUAL_GREETINGS = {
  diwali: {
    en: "✨ Happy Diwali! Illuminate your celebrations with our festive discounts! 🪔",
    hi: "✨ शुभ दीपावली! आपके जीवन में सुख, शांति और समृद्धि आए। विशेष दिवाली छूट! 🪔",
    ta: "✨ இனிய தீபாவளி நல்வாழ்த்துகள்! எங்கள் சிறப்பு சலுகைகளுடன் கொண்டாடுங்கள்! 🪔",
    te: "✨ దీపావళి శుభాకాంక్షలు! మా ప్రత్యేక పండుగ ఆఫర్లతో సంతోషంగా జరుపుకోండి! 🪔",
    bn: "✨ শুভ দীপাবলি! আপনার জীবন সুখ ও সমৃদ্ধিতে ভরে উঠুক। উৎসবের বিশেষ ছাড়! 🪔",
  },
  holi: {
    en: "🎨 Happy Holi! Drench your shopping in vibrant festive savings! 🌈",
    hi: "🎨 होली की हार्दिक शुभकामनाएं! रंगों के इस पावन पर्व पर पाइए महाबचत! 🌈",
    ta: "🎨 மகிழ்ச்சியான ஹோலி நல்வாழ்த்துகள்! வண்ணமயமான சலுகைகளை பெறுங்கள்! 🌈",
    te: "🎨 హోలీ పండుగ శుభాకాంక్షలు! రంగుల పండుగపై అద్భుతమైన ఆఫర్లు! 🌈",
  },
  navratri: {
    en: "💃 Happy Navratri! Celebrate 9 divine nights of grace, garba and festive deals! ✨",
    hi: "💃 शुभ नवरात्रि! मां भगवती की असीम कृपा आप पर बनी रहे। नवरात्रि विशेष सेल! ✨",
    gu: "💃 નવરાત્રી ઉત્સવની હાર્દિક શુભકામનાઓ! ગરબા અને ઉત્સવની વિશેષ ખરીદી! ✨",
  },
  "eid-ul-fitr": {
    en: "🌙 Eid Mubarak! Wishing you peace, joy and grand celebrations with exclusive discounts! 🌟",
    ur: "🌙 عید مبارک! اللہ تعالی آپ پر اپنی خصوصی رحمتیں اور برکتیں نازل فرمائے۔ 🌟",
    hi: "🌙 ईद मुबारक! आपको और आपके परिवार को सुख, शांति और खुशहाली मिले! 🌟",
  },
  "christmas-india": {
    en: "⭐ Merry Christmas! Celebrate the season of warmth, peace, and holiday gifting! 🎄",
    hi: "⭐ क्रिसमस की हार्दिक शुभकामनाएं! प्रभु यीशु का आशीष सदा बना रहे! 🎄",
  },
  vishu: {
    en: "🌟 Happy Vishu! Vishu Ashamsakal! A prosperous Kerala New Year! 🌺",
    ml: "🌟 ഹൃദയം നിറഞ്ഞ വിഷു ആശംസകൾ! സമൃദ്ധിയുടെയും നന്മയുടെയും പുലരി! 🌸",
  },
  onam: {
    en: "🌺 Happy Onam! Celebrate Kerala's grand harvest festival with royal festive deals! 🌊",
    ml: "🌺 ഹൃദയം നിറഞ്ഞ തിരുവോണാശംസകൾ! സമൃദ്ധിയുടെയും സന്തോഷത്തിന്റെയും പൊന്നോണം! 🌸",
  },
};

export function getFestivalGreetings(festivalId) {
  const fest = getFestivalById(festivalId);
  const id = fest ? fest.id : festivalId;
  return MULTILINGUAL_GREETINGS[id] || MULTILINGUAL_GREETINGS.diwali;
}
