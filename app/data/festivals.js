// All 20+ Indian Festival Definitions for Utsav App
// Each festival has: id, name, hindiName, region, tier, dates, palette, effects, description

export const FESTIVALS = [
  // ============================================================
  // FREE TIER — Top 5
  // ============================================================
  {
    id: "diwali",
    name: "Diwali",
    hindiName: "दीवाली",
    emoji: "🪔",
    region: "Pan-India",
    tier: "free",
    description: "The Festival of Lights — the biggest festival in India, celebrating the victory of light over darkness.",
    // Month offsets: month is 0-indexed. Diwali falls in Oct/Nov (lunar)
    approximateMonth: 10, // October/November
    approximateDay: 1,
    duration: 5,
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
      type: "diyas",           // Falling diyas + fireworks
      particles: "sparks",
      animation: "glow-pulse",
    },
    banner: {
      defaultText: "✨ Happy Diwali! Light up your celebrations with our Diwali Sale! 🪔",
      defaultCta: "Shop Diwali Sale",
    },
    tags: ["lights", "sweets", "fireworks", "family"],
  },
  {
    id: "holi",
    name: "Holi",
    hindiName: "होली",
    emoji: "🎨",
    region: "Pan-India",
    tier: "free",
    description: "The Festival of Colors — a joyful spring festival celebrating love, color, and new beginnings.",
    approximateMonth: 2, // March
    approximateDay: 25,
    duration: 2,
    palette: {
      primary: "#FF69B4",      // Hot Pink
      secondary: "#00CED1",    // Dark Turquoise
      accent: "#FFD700",       // Gold
      background: "#1A0040",   // Deep violet
      text: "#FFFFFF",
      highlight: "#FF4500",    // Orange Red
      glow: "rgba(255, 105, 180, 0.6)",
    },
    effects: {
      type: "colors",          // Color burst / powder splashes
      particles: "colorPowder",
      animation: "color-burst",
    },
    banner: {
      defaultText: "🎨 Rang Barse! Happy Holi! Celebrate with vibrant deals! 🌈",
      defaultCta: "Shop Holi Offers",
    },
    tags: ["colors", "spring", "celebration", "gulal"],
  },
  {
    id: "navratri",
    name: "Navratri",
    hindiName: "नवरात्रि",
    emoji: "🕺",
    region: "Pan-India (especially Gujarat, Rajasthan)",
    tier: "free",
    description: "Nine nights of worship, garba dancing, and celebration of Goddess Durga.",
    approximateMonth: 9, // October
    approximateDay: 2,
    duration: 9,
    palette: {
      primary: "#FF4500",      // Orange Red
      secondary: "#FFD700",    // Gold
      accent: "#800080",       // Purple
      background: "#1A0020",   // Deep dark purple
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Pink
      glow: "rgba(255, 69, 0, 0.6)",
    },
    effects: {
      type: "garba",           // Spinning garba circles / dandiya sticks
      particles: "flowers",
      animation: "spin-circle",
    },
    banner: {
      defaultText: "🕺 Navratri Utsav! 9 nights of celebration with special offers! ✨",
      defaultCta: "Shop Navratri Sale",
    },
    tags: ["garba", "dandiya", "goddess", "dance"],
  },
  {
    id: "dussehra",
    name: "Dussehra",
    hindiName: "दशहरा",
    emoji: "🏹",
    region: "Pan-India",
    tier: "free",
    description: "Vijayadashami — celebrating the victory of good over evil, the defeat of Ravana.",
    approximateMonth: 9, // October
    approximateDay: 11,
    duration: 1,
    palette: {
      primary: "#FF8C00",      // Dark Orange
      secondary: "#006400",    // Dark Green
      accent: "#FFD700",       // Gold
      background: "#0D1A00",   // Very dark green
      text: "#FFFFFF",
      highlight: "#ADFF2F",    // Green Yellow
      glow: "rgba(255, 140, 0, 0.6)",
    },
    effects: {
      type: "arrows",          // Arrow + flames
      particles: "sparks",
      animation: "flame",
    },
    banner: {
      defaultText: "🏹 Happy Dussehra! Victory of Good over Evil — Celebrate with us! ✨",
      defaultCta: "Shop Dussehra Deals",
    },
    tags: ["victory", "rama", "ravana", "good over evil"],
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    hindiName: "रक्षाबंधन",
    emoji: "🎁",
    region: "Pan-India (especially North India)",
    tier: "free",
    description: "The bond of siblings — sisters tie rakhi on their brothers' wrists as a symbol of love and protection.",
    approximateMonth: 7, // August
    approximateDay: 19,
    duration: 1,
    palette: {
      primary: "#FF1493",      // Deep Pink
      secondary: "#FFD700",    // Gold
      accent: "#9400D3",       // Violet
      background: "#1A0030",   // Deep violet
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Hot Pink
      glow: "rgba(255, 20, 147, 0.6)",
    },
    effects: {
      type: "ribbons",         // Colorful ribbons / rakhi threads
      particles: "sparkles",
      animation: "float-ribbon",
    },
    banner: {
      defaultText: "🎁 Happy Raksha Bandhan! Celebrate the bond of love with special gifts! ❤️",
      defaultCta: "Shop Gift Ideas",
    },
    tags: ["siblings", "rakhi", "love", "protection", "family"],
  },

  // ============================================================
  // PREMIUM TIER
  // ============================================================
  {
    id: "pongal",
    name: "Pongal",
    hindiName: "पोंगल",
    emoji: "🌾",
    region: "Tamil Nadu, South India",
    tier: "premium",
    description: "South Indian harvest festival thanking the sun, rain, and farm animals for a bountiful harvest.",
    approximateMonth: 0, // January
    approximateDay: 14,
    duration: 4,
    palette: {
      primary: "#8B4513",      // Saddle Brown
      secondary: "#228B22",    // Forest Green
      accent: "#FFD700",       // Gold
      background: "#0D1A00",   // Dark green
      text: "#FFFFFF",
      highlight: "#FFFF00",    // Yellow
      glow: "rgba(139, 69, 19, 0.6)",
    },
    effects: {
      type: "harvest",         // Sugarcane, pot overflowing
      particles: "grains",
      animation: "overflow",
    },
    banner: {
      defaultText: "🌾 Happy Pongal! Thai Pongal Vazthukal! 🌞",
      defaultCta: "Shop Pongal Collection",
    },
    tags: ["harvest", "tamil", "sun", "sugarcane"],
  },
  {
    id: "makar-sankranti",
    name: "Makar Sankranti",
    hindiName: "मकर संक्रान्ति",
    emoji: "🪁",
    region: "Pan-India (varies by state)",
    tier: "premium",
    description: "The kite festival and harvest celebration marking the sun's transition into Capricorn.",
    approximateMonth: 0, // January
    approximateDay: 14,
    duration: 1,
    palette: {
      primary: "#FF4500",      // Orange Red
      secondary: "#1E90FF",    // Dodger Blue
      accent: "#FFD700",       // Gold
      background: "#001A40",   // Dark blue (sky)
      text: "#FFFFFF",
      highlight: "#87CEEB",    // Sky Blue
      glow: "rgba(255, 69, 0, 0.5)",
    },
    effects: {
      type: "kites",           // Flying kites in sky
      particles: "kites",
      animation: "kite-soar",
    },
    banner: {
      defaultText: "🪁 Happy Makar Sankranti! Til gud ghya, god god bola! 🌞",
      defaultCta: "Shop Sankranti Deals",
    },
    tags: ["kites", "sesame", "harvest", "sun"],
  },
  {
    id: "onam",
    name: "Onam",
    hindiName: "ओणम",
    emoji: "🌊",
    region: "Kerala",
    tier: "premium",
    description: "Kerala's biggest harvest festival — celebrated with boat races, pookalam (flower carpets), and feasts.",
    approximateMonth: 7, // August/September
    approximateDay: 20,
    duration: 10,
    palette: {
      primary: "#228B22",      // Forest Green
      secondary: "#FFD700",    // Gold
      accent: "#FF4500",       // Orange Red
      background: "#001A00",   // Very dark green
      text: "#FFFFFF",
      highlight: "#ADFF2F",    // Green Yellow
      glow: "rgba(34, 139, 34, 0.6)",
    },
    effects: {
      type: "pookalam",        // Flower carpet pattern
      particles: "flowers",
      animation: "petal-drop",
    },
    banner: {
      defaultText: "🌺 Happy Onam! Onashamsakal! Celebrate the harvest with joy! 🛶",
      defaultCta: "Shop Onam Offers",
    },
    tags: ["kerala", "harvest", "boat race", "flower carpet"],
  },
  {
    id: "durga-puja",
    name: "Durga Puja",
    hindiName: "दुर्गा पूजा",
    emoji: "🎭",
    region: "West Bengal, East India",
    tier: "premium",
    description: "Bengal's grandest festival — a 5-day celebration of Goddess Durga's victory over Mahishasura.",
    approximateMonth: 9, // October
    approximateDay: 5,
    duration: 5,
    palette: {
      primary: "#DC143C",      // Crimson
      secondary: "#FFD700",    // Gold
      accent: "#FF4500",       // Orange
      background: "#1A0000",   // Very dark red
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Pink
      glow: "rgba(220, 20, 60, 0.6)",
    },
    effects: {
      type: "dhak",            // Dhak beats, flowers, idol glow
      particles: "flowers",
      animation: "divine-glow",
    },
    banner: {
      defaultText: "🎭 Subho Bijoya! Happy Durga Puja! Celebrate the divine! 🌸",
      defaultCta: "Shop Puja Collection",
    },
    tags: ["bengal", "goddess durga", "pandal", "dhak"],
  },
  {
    id: "eid-ul-fitr",
    name: "Eid-ul-Fitr",
    hindiName: "ईद-उल-फ़ित्र",
    emoji: "☪️",
    region: "Pan-India",
    tier: "premium",
    description: "The festival of breaking the fast — celebrated at the end of Ramadan with prayers, feasts, and charity.",
    approximateMonth: 3, // April (varies yearly)
    approximateDay: 10,
    duration: 3,
    palette: {
      primary: "#006400",      // Dark Green
      secondary: "#C0C0C0",    // Silver
      accent: "#FFD700",       // Gold
      background: "#001A00",   // Very dark green
      text: "#FFFFFF",
      highlight: "#90EE90",    // Light Green
      glow: "rgba(0, 100, 0, 0.6)",
    },
    effects: {
      type: "crescent",        // Crescent moon and stars
      particles: "stars",
      animation: "star-twinkle",
    },
    banner: {
      defaultText: "☪️ Eid Mubarak! Wishing you joy, peace, and prosperity! 🌙",
      defaultCta: "Shop Eid Collection",
    },
    tags: ["eid", "ramadan", "celebration", "community"],
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    hindiName: "गणेश चतुर्थी",
    emoji: "🐘",
    region: "Maharashtra, Pan-India",
    tier: "premium",
    description: "10-day celebration of Lord Ganesha's birthday — the remover of obstacles.",
    approximateMonth: 7, // August/September
    approximateDay: 27,
    duration: 10,
    palette: {
      primary: "#FF8C00",      // Dark Orange
      secondary: "#FFD700",    // Gold
      accent: "#DC143C",       // Crimson
      background: "#1A0500",   // Dark orange-black
      text: "#FFFFFF",
      highlight: "#FFA500",    // Orange
      glow: "rgba(255, 140, 0, 0.6)",
    },
    effects: {
      type: "modak",           // Modaks, flowers, ganesha idol
      particles: "flowers",
      animation: "divine-glow",
    },
    banner: {
      defaultText: "🐘 Ganpati Bappa Morya! Happy Ganesh Chaturthi! 🙏",
      defaultCta: "Shop Festive Collection",
    },
    tags: ["ganesha", "maharashtra", "modak", "bappa"],
  },
  {
    id: "karva-chauth",
    name: "Karva Chauth",
    hindiName: "करवा चौथ",
    emoji: "🌙",
    region: "North India",
    tier: "premium",
    description: "A day-long fast by married women for the long life and prosperity of their husbands.",
    approximateMonth: 9, // October
    approximateDay: 20,
    duration: 1,
    palette: {
      primary: "#DC143C",      // Crimson
      secondary: "#FFD700",    // Gold
      accent: "#C0C0C0",       // Silver
      background: "#0D0020",   // Very dark blue-purple
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Pink
      glow: "rgba(220, 20, 60, 0.6)",
    },
    effects: {
      type: "moon",            // Full moon, diyas, sieve
      particles: "stars",
      animation: "moonrise",
    },
    banner: {
      defaultText: "🌙 Happy Karva Chauth! Celebrate love with special gifts! 💕",
      defaultCta: "Shop Gift Ideas",
    },
    tags: ["love", "moon", "north india", "married women"],
  },
  {
    id: "ugadi",
    name: "Ugadi / Gudi Padwa",
    hindiName: "उगादि / गुड़ी पड़वा",
    emoji: "🌸",
    region: "Andhra Pradesh, Karnataka, Telangana, Maharashtra",
    tier: "premium",
    description: "Telugu, Kannada, and Marathi New Year — celebrating new beginnings.",
    approximateMonth: 2, // March/April
    approximateDay: 30,
    duration: 1,
    palette: {
      primary: "#228B22",      // Forest Green
      secondary: "#FF4500",    // Orange Red
      accent: "#FFD700",       // Gold
      background: "#001A00",   // Dark green
      text: "#FFFFFF",
      highlight: "#FFFF00",    // Yellow
      glow: "rgba(34, 139, 34, 0.5)",
    },
    effects: {
      type: "mango",           // Mango leaves, gudi flag
      particles: "flowers",
      animation: "spring-bloom",
    },
    banner: {
      defaultText: "🌸 Happy Ugadi! Ugadi Subhakankshalu! New year, new beginnings! 🌿",
      defaultCta: "Shop New Year Collection",
    },
    tags: ["new year", "telugu", "kannada", "marathi"],
  },
  {
    id: "baisakhi",
    name: "Baisakhi / Vaisakhi",
    hindiName: "बैसाखी",
    emoji: "🌾",
    region: "Punjab, North India",
    tier: "premium",
    description: "Punjabi harvest festival and Sikh New Year — celebrated with bhangra, gidda, and langar.",
    approximateMonth: 3, // April
    approximateDay: 13,
    duration: 1,
    palette: {
      primary: "#FF8C00",      // Dark Orange
      secondary: "#006400",    // Dark Green
      accent: "#FFD700",       // Gold
      background: "#1A0A00",   // Dark brown-orange
      text: "#FFFFFF",
      highlight: "#ADFF2F",    // Green-Yellow
      glow: "rgba(255, 140, 0, 0.5)",
    },
    effects: {
      type: "bhangra",         // Bhangra dancers, wheat fields
      particles: "grains",
      animation: "dance",
    },
    banner: {
      defaultText: "🌾 Happy Baisakhi! Vaisakhi Diyan Lakh Lakh Vadhaiyan! 🎉",
      defaultCta: "Shop Baisakhi Sale",
    },
    tags: ["punjab", "sikh", "harvest", "bhangra"],
  },
  {
    id: "bihu",
    name: "Bihu",
    hindiName: "बिहू",
    emoji: "🌺",
    region: "Assam, Northeast India",
    tier: "premium",
    description: "Assam's biggest festival — a harvest celebration with traditional bihu dance and music.",
    approximateMonth: 3, // April
    approximateDay: 14,
    duration: 7,
    palette: {
      primary: "#DC143C",      // Crimson
      secondary: "#228B22",    // Green
      accent: "#FFD700",       // Gold
      background: "#001A00",   // Dark green
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Pink
      glow: "rgba(220, 20, 60, 0.5)",
    },
    effects: {
      type: "pepa",            // Pepa (horn), bamboo, silk
      particles: "flowers",
      animation: "folk-dance",
    },
    banner: {
      defaultText: "🌺 Happy Bihu! Shubo Bihu! Celebrate Assam's harvest festival! 🎊",
      defaultCta: "Shop Bihu Collection",
    },
    tags: ["assam", "northeast", "harvest", "bihu dance"],
  },
  {
    id: "saraswati-puja",
    name: "Saraswati Puja",
    hindiName: "सरस्वती पूजा",
    emoji: "📚",
    region: "West Bengal, East & South India",
    tier: "premium",
    description: "Worship of Goddess Saraswati — the goddess of knowledge, music, and arts.",
    approximateMonth: 1, // February
    approximateDay: 2,
    duration: 1,
    palette: {
      primary: "#FFFF00",      // Yellow
      secondary: "#FFFFFF",    // White
      accent: "#FFD700",       // Gold
      background: "#0D0D40",   // Dark blue
      text: "#FFFFFF",
      highlight: "#87CEEB",    // Sky Blue
      glow: "rgba(255, 255, 0, 0.5)",
    },
    effects: {
      type: "books",           // Books, veena, lotus, swan
      particles: "flowers",
      animation: "divine-glow",
    },
    banner: {
      defaultText: "📚 Happy Saraswati Puja! May knowledge and wisdom guide your path! 🌸",
      defaultCta: "Shop Learning Resources",
    },
    tags: ["knowledge", "education", "goddess saraswati", "bengal"],
  },
  {
    id: "janmashtami",
    name: "Janmashtami",
    hindiName: "जन्माष्टमी",
    emoji: "🦚",
    region: "Pan-India (especially Mathura, Vrindavan)",
    tier: "premium",
    description: "The birth of Lord Krishna — celebrated with dahi handi, devotional songs, and midnight celebrations.",
    approximateMonth: 7, // August
    approximateDay: 15,
    duration: 2,
    palette: {
      primary: "#1E90FF",      // Dodger Blue (Krishna's skin)
      secondary: "#FFD700",    // Gold
      accent: "#FFFF00",       // Yellow
      background: "#001A40",   // Dark blue
      text: "#FFFFFF",
      highlight: "#87CEEB",    // Sky Blue
      glow: "rgba(30, 144, 255, 0.6)",
    },
    effects: {
      type: "flute",           // Peacock feather, flute, butter pot
      particles: "flowers",
      animation: "divine-glow",
    },
    banner: {
      defaultText: "🦚 Happy Janmashtami! Jai Shri Krishna! Celebrate Lord Krishna's birth! 🙏",
      defaultCta: "Shop Janmashtami Collection",
    },
    tags: ["krishna", "mathura", "dahi handi", "flute"],
  },
  {
    id: "vishu",
    name: "Vishu",
    hindiName: "विशु",
    emoji: "🌟",
    region: "Kerala",
    tier: "premium",
    description: "Kerala's New Year — celebrated by viewing the auspicious Vishukkani arrangement.",
    approximateMonth: 3, // April
    approximateDay: 14,
    duration: 1,
    palette: {
      primary: "#FFD700",      // Gold
      secondary: "#228B22",    // Green
      accent: "#FF4500",       // Orange
      background: "#001A00",   // Dark green
      text: "#FFFFFF",
      highlight: "#FFFF00",    // Yellow
      glow: "rgba(255, 215, 0, 0.6)",
    },
    effects: {
      type: "kani",            // Golden cucumber, rice, flowers
      particles: "flowers",
      animation: "golden-glow",
    },
    banner: {
      defaultText: "🌟 Happy Vishu! Vishu Ashamsakal! A prosperous Kerala New Year! 🌺",
      defaultCta: "Shop Vishu Collection",
    },
    tags: ["kerala", "new year", "vishukkani", "prosperity"],
  },
  {
    id: "eid-ul-adha",
    name: "Eid-ul-Adha",
    hindiName: "ईद-उल-अधा",
    emoji: "🌙",
    region: "Pan-India",
    tier: "premium",
    description: "Bakra Eid — the festival of sacrifice, commemorating Ibrahim's devotion to God.",
    approximateMonth: 5, // June (varies yearly)
    approximateDay: 17,
    duration: 3,
    palette: {
      primary: "#006400",      // Dark Green
      secondary: "#FFD700",    // Gold
      accent: "#FFFFFF",       // White
      background: "#001A00",   // Very dark green
      text: "#FFFFFF",
      highlight: "#90EE90",    // Light Green
      glow: "rgba(0, 100, 0, 0.6)",
    },
    effects: {
      type: "crescent",
      particles: "stars",
      animation: "star-twinkle",
    },
    banner: {
      defaultText: "🌙 Eid Mubarak! Eid-ul-Adha Greetings! Celebrate with love! ✨",
      defaultCta: "Shop Eid Deals",
    },
    tags: ["eid", "bakra", "sacrifice", "community"],
  },
  {
    id: "christmas-india",
    name: "Christmas (Indian)",
    hindiName: "क्रिसमस",
    emoji: "⭐",
    region: "Goa, Kerala, Northeast India",
    tier: "premium",
    description: "Christmas with an Indian flavor — celebrated with midnight mass, plum cake, and carol singing.",
    approximateMonth: 11, // December
    approximateDay: 25,
    duration: 2,
    palette: {
      primary: "#DC143C",      // Crimson
      secondary: "#228B22",    // Forest Green
      accent: "#FFD700",       // Gold
      background: "#001A00",   // Dark green
      text: "#FFFFFF",
      highlight: "#FFFFFF",    // White
      glow: "rgba(220, 20, 60, 0.5)",
    },
    effects: {
      type: "stars",           // Stars, bells, indian-style decorations
      particles: "snowflakes",
      animation: "star-twinkle",
    },
    banner: {
      defaultText: "⭐ Merry Christmas! Celebrate with joy and Indian warmth! 🎄",
      defaultCta: "Shop Christmas Deals",
    },
    tags: ["christmas", "goa", "kerala", "northeast"],
  },
  {
    id: "new-year",
    name: "Indian New Year",
    hindiName: "नव वर्ष",
    emoji: "🎉",
    region: "Pan-India",
    tier: "premium",
    description: "Ringing in the New Year with fireworks, celebrations, and fresh beginnings.",
    approximateMonth: 11, // December 31 / January 1
    approximateDay: 31,
    duration: 2,
    palette: {
      primary: "#9400D3",      // Violet
      secondary: "#FFD700",    // Gold
      accent: "#FF4500",       // Orange
      background: "#0D001A",   // Very dark purple
      text: "#FFFFFF",
      highlight: "#FF69B4",    // Pink
      glow: "rgba(148, 0, 211, 0.6)",
    },
    effects: {
      type: "fireworks",
      particles: "sparks",
      animation: "fireworks-burst",
    },
    banner: {
      defaultText: "🎉 Happy New Year! Naya Saal Mubarak! New beginnings await! ✨",
      defaultCta: "Shop New Year Collection",
    },
    tags: ["new year", "celebration", "fireworks", "fresh start"],
  },
  {
    id: "ram-navami",
    name: "Ram Navami",
    hindiName: "राम नवमी",
    emoji: "🏹",
    region: "Pan-India",
    tier: "premium",
    description: "The birth anniversary of Lord Rama — celebrated with prayers, processions, and devotional singing.",
    approximateMonth: 3, // April
    approximateDay: 6,
    duration: 1,
    palette: {
      primary: "#FF8C00",      // Dark Orange
      secondary: "#FFD700",    // Gold
      accent: "#006400",       // Dark Green
      background: "#1A0500",   // Dark orange-black
      text: "#FFFFFF",
      highlight: "#ADFF2F",    // Green Yellow
      glow: "rgba(255, 140, 0, 0.6)",
    },
    effects: {
      type: "arrows",
      particles: "flowers",
      animation: "divine-glow",
    },
    banner: {
      defaultText: "🏹 Happy Ram Navami! Jai Shri Ram! May Lord Rama's blessings be with you! 🙏",
      defaultCta: "Shop Festive Collection",
    },
    tags: ["rama", "ayodhya", "devotion", "navami"],
  },
];

// Helper: Get festival by ID
export function getFestivalById(id) {
  return FESTIVALS.find((f) => f.id === id) || null;
}

// Helper: Get upcoming festivals within the next N days
export function getUpcomingFestivals(daysAhead = 30) {
  const today = new Date();
  const upcoming = [];

  for (const festival of FESTIVALS) {
    // Build festival date for current year
    const festDate = new Date(
      today.getFullYear(),
      festival.approximateMonth,
      festival.approximateDay
    );

    // Also check next year if already passed
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
  const today = new Date();
  const festDate = new Date(
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
    en: "✨ Happy Diwali! Illuminate your celebrations with our grand festive discounts! 🪔",
    hi: "✨ शुभ दीपावली! आपके जीवन में सुख, शांति और समृद्धि आए। विशेष दिवाली छूट का लाभ उठाएं! 🪔",
    ta: "✨ இனிய தீபாவளி நல்வாழ்த்துகள்! எங்கள் சிறப்பு சலுகைகளுடன் கொண்டாடுங்கள்! 🪔",
    te: "✨ దీపావళి శుభాకాంక్షలు! మా ప్రత్యేక పండుగ ఆఫర్లతో సంతోషంగా జరుపుకోండి! 🪔",
    bn: "✨ শুভ দীপাবলি! আপনার জীবন সুখ ও সমৃদ্ধিতে ভরে উঠুক। উৎসবের বিশেষ ছাড়! 🪔",
    mr: "✨ दिवाळीच्या मनःपूर्वक हार्दिक शुभेच्छा! उत्सवाच्या विशेष ऑफर्सचा आनंद घ्या! 🪔",
    gu: "✨ દિવાળીની હાર્દિક શુભકામનાઓ! વિશેષ દિવાળી ઑફર્સ સાથે ખરીદી કરો! 🪔",
  },
  holi: {
    en: "🎨 Happy Holi! Drench your shopping in vibrant festive savings! 🌈",
    hi: "🎨 होली की हार्दिक शुभकामनाएं! रंगों के इस पावन पर्व पर पाइए महाबचत! 🌈",
    ta: "🎨 மகிழ்ச்சியான ஹோலி நல்வாழ்த்துகள்! வண்ணமயமான சலுகைகளை பெறுங்கள்! 🌈",
    te: "🎨 హోలీ పండుగ శుభాకాంక్షలు! రంగుల పండుగపై అద్భుతమైన ఆఫర్లు! 🌈",
    bn: "🎨 শুভ হোলি ও দোল উৎসব! রঙিন ছাড়ের সাথে মেতে উঠুন! 🌈",
    mr: "🎨 होळीच्या मनःपूर्वक शुभेच्छा! रंगांच्या उत्सवात मिळवा धमाकेदार ऑफर्स! 🌈",
    gu: "🎨 હોળીની હાર્દિક શુભેચ્છાઓ! ધૂળેટીના પર્વ પર મહા છૂટ! 🌈",
  },
  navratri: {
    en: "💃 Happy Navratri! Celebrate 9 divine nights of grace, garba and festive deals! ✨",
    hi: "💃 शुभ नवरात्रि! मां भगवती की असीम कृपा आप पर बनी रहे। नवरात्रि विशेष सेल! ✨",
    gu: "💃 નવરાત્રી ઉત્સવની હાર્દિક શુભકામનાઓ! ગરબા અને ઉત્સવની વિશેષ ખરીદી! ✨",
    bn: "💃 শুভ শারদীয়া ও দুর্গোৎসব! মায়ের আশীর্বাদ আপনার পরিবারে সর্বদা বর্ষিত হোক! ✨",
    mr: "💃 नवरात्रोत्सवाच्या सर्वांना हार्दिक शुभेच्छा! मंगलमय खरेदीची सुवर्णसंधी! ✨",
  },
  eid_ul_fitr: {
    en: "🌙 Eid Mubarak! Wishing you peace, joy and grand celebrations with exclusive discounts! 🌟",
    hi: "🌙 ईद मुबारक! आपको और आपके परिवार को सुख, शांति और खुशहाली मिले! 🌟",
    ur: "🌙 عید مبارک! اللہ تعالی آپ پر اپنی خصوصی رحمتیں اور برکتیں نازل فرمائے۔ 🌟",
    ta: "🌙 ஈத் முபாரக்! உங்கள் வாழ்வில் அமைதியும் மகிழ்ச்சியும் நிலவ வாழ்த்துகள்! 🌟",
    bn: "🌙 ঈদ মোবারক! আনন্দ ও সৌহার্দ্যের সাথে ঈদ উদযাপন করুন বিশেষ ছাড়ে! 🌟",
  },
  pongal_sankranti: {
    en: "🌾 Happy Pongal & Makar Sankranti! Celebrate the bounty of harvest with special festive treats! 🪁",
    ta: "🌾 இனிய தைப்பொங்கல் நல்வாழ்த்துகள்! பொங்கலோ பொங்கல்! சிறப்பு சலுகைகள்! 🍯",
    te: "🌾 భోగి మరియు మకర సంక్రాంతి శుభాకాంక్షలు! పండుగ ప్రత్యేక రాయితీలు! 🪁",
    hi: "🌾 मकर संक्रांति और पोंगल की हार्दिक शुभकामनाएं! नई फसल की नई सौगात! 🪁",
    mr: "🌾 मकर संक्रांतीच्या गोड गोड शुभेच्छा! तिळगूळ घ्या गोड गोड बोला! 🪁",
    gu: "🌾 ઉત્તરાયણ અને મકરસંક્રાંતિની હાર્દિક શુભેચ્છાઓ! કાઈ પો છે! 🪁",
  },
  onam: {
    en: "🌺 Happy Onam! Celebrate Kerala's grand harvest festival with royal festive deals! 🌊",
    ml: "🌺 ഹൃദയം നിറഞ്ഞ തിരുവോണാശംസകൾ! സമൃദ്ധിയുടെയും സന്തോഷത്തിന്റെയും പൊന്നോണം! 🌸",
    ta: "🌺 இனிய ஓணம் திருநாள் நல்வாழ்த்துகள்! 🌸",
    hi: "🌺 ओणम के पावन पर्व की हार्दिक शुभकामनाएं! 🌸",
  },
  ganesh_chaturthi: {
    en: "🐘 Happy Ganesh Chaturthi! May Lord Ganesha bless your life with wisdom and success! 🌺",
    mr: "🐘 गणेशोत्सवाच्या सर्वांना मनःपूर्वक हार्दिक शुभेच्छा! गणपती बाप्पा मोरया! 🌺",
    hi: "🐘 गणेश चतुर्थी की हार्दिक शुभकामनाएं! विघ्नहर्ता आपके सारे संकट हरें! 🌺",
    te: "🐘 వినాయక చవితి శుభాకాంక్షలు! గణపతి బప్పా మోరియా! 🌺",
  },
  raksha_bandhan: {
    en: "🎁 Happy Raksha Bandhan! Celebrate the sacred bond of sibling love with memorable gifts! 💕",
    hi: "🎁 रक्षाबंधन की हार्दिक शुभकामनाएं! भाई-बहन के अटूट स्नेह का पावन पर्व! 💕",
    mr: "🎁 रक्षाबंधनच्या सर्व भावंडांना हार्दिक शुभेच्छा! 💕",
    gu: "🎁 રક્ષાબંધનની પવિત્ર શુભેચ્છાઓ! 💕",
  },
  independence_day: {
    en: "🇮🇳 Happy Independence Day! Celebrate freedom with our Grand Tiranga Sale! 🕊️",
    hi: "🇮🇳 स्वतंत्रता दिवस की हार्दिक शुभकामनाएं! जय हिंद, वन्दे मातरम्! विशेष आज़ादी सेल! 🕊️",
    ta: "🇮🇳 சுதந்திர தின நல்வாழ்த்துகள்! வந்தே மாதரம்! 🕊️",
    te: "🇮🇳 స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు! జై హింద్! 🕊️",
    bn: "🇮🇳 স্বাধীনতা দিবসের আন্তরিক শুভেচ্ছা! বন্দে মাতরম! 🕊️",
  },
};

export function getFestivalGreetings(festivalId) {
  return MULTILINGUAL_GREETINGS[festivalId] || MULTILINGUAL_GREETINGS.diwali;
}
