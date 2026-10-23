/**
 * Culturally authentic vector artwork for all 22 Indian & Global festivals.
 * Renders high-fidelity SVG motifs, authentic festival color palettes,
 * and decorative atmospheric elements.
 * 
 * Variants:
 * - "hero": 180px height for the Dashboard Active Festival Card
 * - "card": 120px height for the Festival Catalog cards
 * - "thumb": 48px or 56px square/rounded avatar for compact lists
 */
export default function FestivalArtwork({
  festival,
  variant = "card",
  className = "",
  style = {},
  showBadge = false,
  badgeText = null,
  badgeTone = "success",
}) {
  if (!festival) return null;
  const id = (festival.id || "").toLowerCase();

  const isHero = variant === "hero";
  const isThumb = variant === "thumb";

  const height = isHero ? 180 : isThumb ? 56 : 124;
  const width = isThumb ? 56 : "100%";

  // Render motif based on festival ID
  const renderMotif = () => {
    switch (id) {
      // 1. DIWALI — Living Brass Diya & Golden Sparkles
      case "diwali":
        return (
          <g>
            <defs>
              <radialGradient id="diwali-flame-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#FFB300" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF6D00" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="diwali-brass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFB300" />
                <stop offset="100%" stopColor="#8D6E18" />
              </linearGradient>
            </defs>
            {/* Ambient flame halo */}
            <circle cx="100" cy="55" r="45" fill="url(#diwali-flame-glow)" />
            {/* Fairy light string along top */}
            <path d="M 0,15 Q 50,28 100,16 Q 150,28 200,15" stroke="rgba(255,215,0,0.4)" strokeWidth="1" fill="none" />
            <circle cx="25" cy="21" r="2.5" fill="#FFE082" />
            <circle cx="50" cy="27" r="2.5" fill="#FFB300" />
            <circle cx="75" cy="22" r="2.5" fill="#FFE082" />
            <circle cx="100" cy="16" r="2.5" fill="#FFF" />
            <circle cx="125" cy="22" r="2.5" fill="#FFE082" />
            <circle cx="150" cy="27" r="2.5" fill="#FFB300" />
            <circle cx="175" cy="21" r="2.5" fill="#FFE082" />
            {/* Living Brass Diya Body */}
            <ellipse cx="100" cy="85" rx="34" ry="12" fill="url(#diwali-brass)" />
            <path d="M 66,85 Q 100,105 134,85 Q 120,98 100,99 Q 80,98 66,85 Z" fill="#6D4C0E" />
            <ellipse cx="100" cy="84" rx="28" ry="7" fill="#E65100" opacity="0.6" />
            <circle cx="100" cy="82" r="4" fill="#3E2723" />
            {/* Multi-layered Flame */}
            <path d="M 100,45 C 92,60 90,70 100,80 C 110,70 108,60 100,45 Z" fill="#FF6D00" />
            <path d="M 100,52 C 95,64 94,72 100,78 C 106,72 105,64 100,52 Z" fill="#FFD54F" />
            <path d="M 100,60 C 97,68 97,73 100,76 C 103,73 103,68 100,60 Z" fill="#FFFFFF" />
            {/* Sparkle clusters */}
            <path d="M 40,40 L 42,46 L 48,48 L 42,50 L 40,56 L 38,50 L 32,48 L 38,46 Z" fill="#FFD700" opacity="0.8" />
            <path d="M 160,45 L 161,50 L 166,51 L 161,53 L 160,58 L 158,53 L 154,51 L 158,50 Z" fill="#FFD700" opacity="0.75" />
            <circle cx="150" cy="80" r="1.5" fill="#FFFDE7" opacity="0.8" />
            <circle cx="55" cy="75" r="1.5" fill="#FFFDE7" opacity="0.8" />
          </g>
        );

      // 2. HOLI — Color Bloom & Powder Particles
      case "holi":
        return (
          <g>
            <defs>
              <radialGradient id="holi-pink" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#FF4081" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#C2185B" stopOpacity="0.2" />
              </radialGradient>
              <radialGradient id="holi-cyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0097A7" stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="holi-gold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFEA00" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FF9100" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            {/* Swirling color blooms */}
            <circle cx="70" cy="65" r="32" fill="url(#holi-pink)" />
            <circle cx="130" cy="60" r="30" fill="url(#holi-cyan)" />
            <circle cx="100" cy="75" r="28" fill="url(#holi-gold)" />
            {/* Brass Gulal Bowl */}
            <path d="M 75,85 Q 100,105 125,85 Z" fill="#FFB300" stroke="#FFE082" strokeWidth="1" />
            <ellipse cx="100" cy="85" rx="25" ry="6" fill="#D81B60" />
            {/* Powder splatters */}
            <circle cx="45" cy="40" r="5" fill="#FF4081" opacity="0.7" />
            <circle cx="35" cy="55" r="3" fill="#00E5FF" opacity="0.6" />
            <circle cx="160" cy="35" r="4.5" fill="#FFD600" opacity="0.8" />
            <circle cx="150" cy="78" r="3.5" fill="#FF4081" opacity="0.7" />
            <circle cx="85" cy="30" r="3" fill="#00E5FF" opacity="0.7" />
            <circle cx="115" cy="32" r="2.5" fill="#FFEA00" opacity="0.8" />
          </g>
        );

      // 3. NAVRATRI — Rhythmic Dandiya & Garba Glow
      case "navratri":
        return (
          <g>
            <defs>
              <linearGradient id="dandiya-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6D00" />
                <stop offset="50%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#DD2C00" />
              </linearGradient>
              <linearGradient id="dandiya-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E676" />
                <stop offset="50%" stopColor="#FFD600" />
                <stop offset="100%" stopColor="#2979FF" />
              </linearGradient>
            </defs>
            {/* Rhythmic circular soundwave rings */}
            <circle cx="100" cy="65" r="42" stroke="rgba(255, 215, 0, 0.25)" strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
            <circle cx="100" cy="65" r="28" stroke="rgba(255, 109, 0, 0.3)" strokeWidth="1" fill="none" />
            {/* Crossed Dandiya sticks */}
            <rect x="70" y="42" width="60" height="7" rx="3.5" transform="rotate(35 100 65)" fill="url(#dandiya-1)" stroke="#FFF" strokeWidth="0.8" />
            <rect x="70" y="42" width="60" height="7" rx="3.5" transform="rotate(-35 100 65)" fill="url(#dandiya-2)" stroke="#FFF" strokeWidth="0.8" />
            {/* Central mirror medallion */}
            <circle cx="100" cy="65" r="9" fill="#FFFDE7" stroke="#FFD700" strokeWidth="2" />
            <circle cx="100" cy="65" r="5" fill="#E91E63" />
            {/* Hanging bells & tassels */}
            <circle cx="65" cy="85" r="3.5" fill="#FFD700" />
            <circle cx="135" cy="85" r="3.5" fill="#FFD700" />
            <path d="M 65,88 L 65,96" stroke="#FF6D00" strokeWidth="1.5" />
            <path d="M 135,88 L 135,96" stroke="#FF6D00" strokeWidth="1.5" />
          </g>
        );

      // 4. PONGAL — Overflowing Pot & Sugarcane
      case "pongal":
        return (
          <g>
            {/* Flanking Sugarcane Stalks */}
            <path d="M 45,95 Q 52,50 48,20" stroke="#2E7D32" strokeWidth="3" fill="none" strokeLinecap="round" />
            <line x1="43" y1="40" x2="52" y2="40" stroke="#81C784" strokeWidth="1.5" />
            <line x1="44" y1="65" x2="53" y2="65" stroke="#81C784" strokeWidth="1.5" />
            <path d="M 48,20 Q 35,15 30,22" stroke="#4CAF50" strokeWidth="2" fill="none" />
            <path d="M 155,95 Q 148,50 152,20" stroke="#2E7D32" strokeWidth="3" fill="none" strokeLinecap="round" />
            <line x1="147" y1="40" x2="156" y2="40" stroke="#81C784" strokeWidth="1.5" />
            <line x1="148" y1="65" x2="157" y2="65" stroke="#81C784" strokeWidth="1.5" />
            <path d="M 152,20 Q 165,15 170,22" stroke="#4CAF50" strokeWidth="2" fill="none" />
            {/* Traditional Clay / Brass Pot */}
            <path d="M 80,65 Q 70,88 100,94 Q 130,88 120,65 Z" fill="#8D4925" stroke="#D7CCC8" strokeWidth="1" />
            <ellipse cx="100" cy="65" rx="18" ry="4" fill="#6D3212" />
            {/* Frothing boiling rice/milk (Pongalo Pongal) */}
            <path d="M 82,65 Q 90,56 100,56 Q 110,56 118,65 Q 124,72 120,77 Q 114,80 110,72 Q 102,68 96,72 Q 88,76 84,72 Z" fill="#FFF9C4" stroke="#FFF59D" strokeWidth="0.8" />
            {/* Sacred Turmeric leaf around neck */}
            <path d="M 78,66 Q 100,71 122,66" stroke="#FFD600" strokeWidth="2.5" fill="none" />
          </g>
        );

      // 5. ONAM — Pookalam Floral Mandala & Vilakku
      case "onam":
        return (
          <g>
            {/* Concentric Pookalam Rings */}
            <circle cx="100" cy="62" r="38" fill="none" stroke="#E65100" strokeWidth="2.5" />
            <circle cx="100" cy="62" r="32" fill="#FFFDE7" opacity="0.1" />
            <circle cx="100" cy="62" r="28" fill="none" stroke="#FFD600" strokeWidth="3" strokeDasharray="3 3" />
            <circle cx="100" cy="62" r="20" fill="none" stroke="#D81B60" strokeWidth="3" />
            <circle cx="100" cy="62" r="12" fill="#FF8F00" />
            {/* Kerala Brass Lamp in Center */}
            <ellipse cx="100" cy="64" rx="8" ry="3" fill="#FFE082" />
            <path d="M 100,50 C 97,56 96,60 100,64 C 104,60 103,56 100,50 Z" fill="#FF6D00" />
            <circle cx="100" cy="58" r="1.5" fill="#FFF" />
            {/* Surrounding Petal Accents */}
            <circle cx="100" cy="21" r="3" fill="#FFD600" />
            <circle cx="100" cy="103" r="3" fill="#FFD600" />
            <circle cx="59" cy="62" r="3" fill="#FFD600" />
            <circle cx="141" cy="62" r="3" fill="#FFD600" />
          </g>
        );

      // 6. RAKSHA BANDHAN — Sacred Rakhi & Silk Ribbon
      case "raksha-bandhan":
        return (
          <g>
            {/* Silk Thread Ribbon */}
            <path d="M 20,62 Q 60,78 100,62 Q 140,46 180,62" stroke="#D81B60" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 20,64 Q 60,80 100,64 Q 140,48 180,64" stroke="#FFD700" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Rakhi Medallion */}
            <circle cx="100" cy="62" r="22" fill="#B71C1C" stroke="#FFD700" strokeWidth="2.5" />
            <circle cx="100" cy="62" r="16" fill="#FFFDE7" stroke="#FF8F00" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="100" cy="62" r="10" fill="#FFD700" />
            <circle cx="100" cy="62" r="5" fill="#C2185B" />
            {/* Bead Drops */}
            <circle cx="70" cy="68" r="3.5" fill="#FFD700" />
            <circle cx="130" cy="56" r="3.5" fill="#FFD700" />
          </g>
        );

      // 7. GANESH CHATURTHI — Sacred Modak & Garland
      case "ganesh-chaturthi":
        return (
          <g>
            {/* Saffron Aura */}
            <circle cx="100" cy="60" r="35" fill="rgba(255, 145, 0, 0.2)" />
            {/* Hibiscus Garland Arc */}
            <path d="M 60,35 Q 100,75 140,35" stroke="#C62828" strokeWidth="3" fill="none" strokeDasharray="6 4" />
            <circle cx="70" cy="46" r="3.5" fill="#FFD600" />
            <circle cx="100" cy="60" r="4" fill="#C62828" />
            <circle cx="130" cy="46" r="3.5" fill="#FFD600" />
            {/* Sacred Modak */}
            <path d="M 100,42 C 92,54 84,68 88,80 C 92,86 108,86 112,80 C 116,68 108,54 100,42 Z" fill="#FFE082" stroke="#FFB300" strokeWidth="1.5" />
            <line x1="100" y1="48" x2="100" y2="82" stroke="#FF8F00" strokeWidth="1" strokeLinecap="round" />
            <line x1="94" y1="58" x2="93" y2="80" stroke="#FF8F00" strokeWidth="1" strokeLinecap="round" />
            <line x1="106" y1="58" x2="107" y2="80" stroke="#FF8F00" strokeWidth="1" strokeLinecap="round" />
          </g>
        );

      // 8. EID AL-FITR — Crescent Moon & Fanoos Lantern
      case "eid-ul-fitr":
        return (
          <g>
            {/* Delicate Starlight */}
            <circle cx="45" cy="35" r="1.5" fill="#FFFDE7" />
            <circle cx="65" cy="25" r="1.2" fill="#FFFDE7" />
            <circle cx="160" cy="30" r="1.5" fill="#FFFDE7" />
            <circle cx="140" cy="45" r="1.2" fill="#FFFDE7" />
            {/* Filigree Crescent Moon */}
            <path d="M 115,30 C 92,34 85,58 92,76 C 96,86 106,92 118,92 C 102,90 94,74 97,58 C 100,42 110,34 115,30 Z" fill="#FFD700" />
            {/* Hanging Fanoos Lantern */}
            <line x1="135" y1="15" x2="135" y2="40" stroke="#FFD700" strokeWidth="1" />
            <polygon points="131,40 139,40 142,48 128,48" fill="#FFB300" />
            <rect x="129" y="48" width="12" height="18" rx="2" fill="#FFF9C4" stroke="#FF8F00" strokeWidth="1" />
            <circle cx="135" cy="57" r="3" fill="#FF6D00" />
            <polygon points="128,66 142,66 135,74" fill="#FFB300" />
          </g>
        );

      // 9. CHRISTMAS — Pine Garlands & Snowflakes
      case "christmas-india":
        return (
          <g>
            {/* Twinkling fairy wire */}
            <path d="M 0,20 Q 50,35 100,22 Q 150,35 200,20" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
            <circle cx="35" cy="28" r="2.5" fill="#FF5252" />
            <circle cx="70" cy="28" r="2.5" fill="#FFD700" />
            <circle cx="100" cy="22" r="2.5" fill="#69F0AE" />
            <circle cx="130" cy="28" r="2.5" fill="#FFD700" />
            <circle cx="165" cy="28" r="2.5" fill="#FF5252" />
            {/* Festive Pine Tree Silhouette */}
            <polygon points="100,32 116,52 84,52" fill="#1B5E20" />
            <polygon points="100,46 122,68 78,68" fill="#2E7D32" />
            <polygon points="100,60 128,88 72,88" fill="#388E3C" />
            <rect x="96" y="88" width="8" height="10" fill="#4E342E" />
            {/* Tree Topper Star */}
            <polygon points="100,24 102,29 108,29 103,33 105,38 100,35 95,38 97,33 92,29 98,29" fill="#FFD700" />
            {/* Snowflakes */}
            <path d="M 45,60 L 55,60 M 50,55 L 50,65 M 46,56 L 54,64 M 46,64 L 54,56" stroke="#FFF" strokeWidth="0.8" />
            <path d="M 150,65 L 160,65 M 155,60 L 155,70 M 151,61 L 159,69 M 151,69 L 159,61" stroke="#FFF" strokeWidth="0.8" />
          </g>
        );

      // 10. HALLOWEEN — Pumpkin Silhouette & Eerie Glow
      case "halloween":
        return (
          <g>
            <circle cx="140" cy="35" r="18" fill="#FFF9C4" opacity="0.3" />
            {/* Pumpkin Body */}
            <ellipse cx="100" cy="65" rx="30" ry="24" fill="#E65100" />
            <ellipse cx="100" cy="65" rx="16" ry="24" fill="#EF6C00" />
            <ellipse cx="100" cy="65" rx="7" ry="24" fill="#F57C00" />
            {/* Pumpkin Stem */}
            <path d="M 98,42 Q 102,32 108,34" stroke="#33691E" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Carved Glowing Eyes & Mouth */}
            <polygon points="90,56 96,62 88,62" fill="#FFD600" />
            <polygon points="110,56 112,62 104,62" fill="#FFD600" />
            <polygon points="100,66 103,70 97,70" fill="#FFD600" />
            <path d="M 88,74 Q 100,82 112,74 Q 100,88 88,74 Z" fill="#FFD600" />
          </g>
        );

      // 11. VALENTINE'S DAY — Heart Outline & Ribbon
      case "valentines-day":
        return (
          <g>
            {/* Soft floating mini hearts */}
            <path d="M 50,45 C 50,42 47,38 43,38 C 39,38 37,42 37,45 C 37,51 43,56 43,56 C 43,56 50,51 50,45 Z" fill="#F48FB1" opacity="0.7" />
            <path d="M 155,50 C 155,47 152,43 148,43 C 144,43 142,47 142,50 C 142,56 148,61 148,61 C 148,61 155,56 155,50 Z" fill="#F48FB1" opacity="0.7" />
            {/* Main Layered Heart */}
            <path d="M 100,86 C 100,86 70,68 70,50 C 70,38 80,32 90,36 C 96,38 100,44 100,44 C 100,44 104,38 110,36 C 120,32 130,38 130,50 C 130,68 100,86 100,86 Z" fill="#E91E63" stroke="#FFD700" strokeWidth="2" />
            <path d="M 100,80 C 100,80 76,64 76,50 C 76,41 84,37 91,40 C 96,42 100,48 100,48 C 100,48 104,42 109,40 C 116,37 124,41 124,50 C 124,64 100,80 100,80 Z" fill="#C2185B" />
          </g>
        );

      // 12. LUNAR NEW YEAR — Red Lantern & Golden Blossom
      case "lunar-new-year":
        return (
          <g>
            <line x1="100" y1="15" x2="100" y2="35" stroke="#FFD700" strokeWidth="1.5" />
            {/* Red Lantern Body */}
            <ellipse cx="100" cy="58" rx="26" ry="24" fill="#D32F2F" stroke="#FFD700" strokeWidth="1.5" />
            <ellipse cx="100" cy="58" rx="14" ry="24" fill="none" stroke="#FFD700" strokeWidth="1" />
            <line x1="100" y1="34" x2="100" y2="82" stroke="#FFD700" strokeWidth="1" />
            {/* Gold Caps */}
            <rect x="88" y="32" width="24" height="5" rx="1" fill="#FFD700" />
            <rect x="88" y="81" width="24" height="5" rx="1" fill="#FFD700" />
            {/* Tassels */}
            <line x1="95" y1="86" x2="95" y2="100" stroke="#FFD700" strokeWidth="1.5" />
            <line x1="100" y1="86" x2="100" y2="103" stroke="#D32F2F" strokeWidth="2" />
            <line x1="105" y1="86" x2="105" y2="100" stroke="#FFD700" strokeWidth="1.5" />
            {/* Plum Blossom Branch */}
            <circle cx="50" cy="40" r="4" fill="#FF80AB" />
            <circle cx="150" cy="45" r="4" fill="#FF80AB" />
          </g>
        );

      // 13. HANUKKAH — Menorah & Candlelight
      case "hanukkah":
        return (
          <g>
            {/* Menorah Base */}
            <line x1="75" y1="90" x2="125" y2="90" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <path d="M 100,90 L 100,45" stroke="#FFD700" strokeWidth="3" />
            {/* Menorah Arms */}
            <path d="M 70,55 Q 70,75 100,75 Q 130,75 130,55" stroke="#FFD700" strokeWidth="2" fill="none" />
            <path d="M 80,58 Q 80,70 100,70 Q 120,70 120,58" stroke="#FFD700" strokeWidth="2" fill="none" />
            <path d="M 90,62 Q 90,66 100,66 Q 110,66 110,62" stroke="#FFD700" strokeWidth="2" fill="none" />
            {/* Candle Flames */}
            {[70, 80, 90, 100, 110, 120, 130].map((x, idx) => (
              <circle key={idx} cx={x} cy={x === 100 ? 40 : 50} r="2.5" fill="#FFD54F" />
            ))}
          </g>
        );

      // 14. EASTER — Pastel Motifs & Spring Bloom
      case "easter":
        return (
          <g>
            {/* Spring Blossom Petals */}
            <circle cx="45" cy="45" r="5" fill="#F8BBD0" />
            <circle cx="155" cy="50" r="5" fill="#E1BEE7" />
            {/* Decorated Easter Egg */}
            <path d="M 100,32 C 82,32 72,55 72,70 C 72,84 84,92 100,92 C 116,92 128,84 128,70 C 128,55 118,32 100,32 Z" fill="#B3E5FC" stroke="#FFF" strokeWidth="1.5" />
            <path d="M 74,62 Q 100,70 126,62" stroke="#FFD54F" strokeWidth="3" fill="none" />
            <path d="M 73,72 Q 100,80 127,72" stroke="#F48FB1" strokeWidth="3" fill="none" />
            <circle cx="100" cy="50" r="3" fill="#FFF" />
          </g>
        );

      // 15. THANKSGIVING — Autumn Foliage
      case "thanksgiving":
        return (
          <g>
            {/* Warm sunlight burst */}
            <circle cx="100" cy="60" r="35" fill="rgba(255, 179, 0, 0.2)" />
            {/* Central Maple Leaf */}
            <path d="M 100,35 L 105,48 L 118,45 L 112,56 L 126,64 L 112,68 L 114,80 L 100,74 L 86,80 L 88,68 L 74,64 L 88,56 L 82,45 L 95,48 Z" fill="#E65100" stroke="#FFB300" strokeWidth="1" />
            <line x1="100" y1="74" x2="100" y2="92" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
            {/* Side Leaves */}
            <path d="M 55,60 Q 65,45 80,55 Q 70,70 55,60 Z" fill="#F57C00" opacity="0.8" />
            <path d="M 145,60 Q 135,45 120,55 Q 130,70 145,60 Z" fill="#D84315" opacity="0.8" />
          </g>
        );

      // 16. NEW YEAR — Midnight Fireworks & Sparkle
      case "new-year":
        return (
          <g>
            {/* Golden Starburst Firework */}
            <circle cx="80" cy="50" r="3" fill="#FFF" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = 80 + Math.cos(rad) * 25;
              const y2 = 50 + Math.sin(rad) * 25;
              return <line key={i} x1={80} y1={50} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="1.2" strokeDasharray="3 2" />;
            })}
            {/* Cyan Accent Firework */}
            <circle cx="130" cy="65" r="2.5" fill="#FFF" />
            {[20, 65, 110, 155, 200, 245, 290, 335].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = 130 + Math.cos(rad) * 20;
              const y2 = 65 + Math.sin(rad) * 20;
              return <line key={i} x1={130} y1={65} x2={x2} y2={y2} stroke="#00E5FF" strokeWidth="1" strokeDasharray="2 2" />;
            })}
          </g>
        );

      // 17. MID-AUTUMN — Harvest Moon & Lantern
      case "mid-autumn":
        return (
          <g>
            {/* Giant Full Harvest Moon */}
            <circle cx="100" cy="60" r="36" fill="#FFF59D" />
            <circle cx="100" cy="60" r="36" fill="rgba(255, 215, 0, 0.3)" />
            {/* Soft moon craters */}
            <circle cx="90" cy="50" r="6" fill="#FFF9C4" opacity="0.7" />
            <circle cx="112" cy="65" r="8" fill="#FFF9C4" opacity="0.7" />
            {/* Drifting Clouds */}
            <path d="M 50,70 Q 75,60 100,72 Q 125,62 150,70" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Small floating paper lantern */}
            <rect x="140" y="40" width="10" height="14" rx="2" fill="#D32F2F" />
            <circle cx="145" cy="47" r="2" fill="#FFEB3B" />
          </g>
        );

      // 18. VESAK — Sacred Lotus & Bodhi Light
      case "vesak":
        return (
          <g>
            {/* Golden Bodhi Leaf Aura */}
            <path d="M 100,20 C 125,40 130,65 100,85 C 70,65 75,40 100,20 Z" fill="rgba(255, 179, 0, 0.25)" />
            {/* Blooming Lotus Petals */}
            <path d="M 100,50 C 92,62 82,72 82,80 C 92,80 100,75 100,75 C 100,75 108,80 118,80 C 118,72 108,62 100,50 Z" fill="#F8BBD0" />
            <path d="M 100,56 C 94,65 88,72 88,78 C 96,78 100,74 100,74 C 100,74 104,78 112,78 C 112,72 106,65 100,56 Z" fill="#F48FB1" />
            <path d="M 100,60 C 96,67 92,72 92,76 C 97,76 100,74 100,74 C 100,74 103,76 108,76 C 108,72 104,67 100,60 Z" fill="#FFFFFF" />
            {/* Lotus Base */}
            <ellipse cx="100" cy="82" rx="26" ry="5" fill="#388E3C" />
          </g>
        );

      // 19. VISHU — Kanikonna Flowers & Nilavilakku
      case "vishu":
        return (
          <g>
            {/* Hanging Golden Kanikonna Cascades */}
            <path d="M 40,15 Q 50,45 42,70" stroke="#388E3C" strokeWidth="1.5" fill="none" />
            <circle cx="45" cy="30" r="3.5" fill="#FFD600" />
            <circle cx="48" cy="42" r="3.5" fill="#FFEA00" />
            <circle cx="43" cy="54" r="3" fill="#FFD600" />
            <circle cx="40" cy="65" r="2.5" fill="#FFEB3B" />
            <path d="M 160,15 Q 150,45 158,70" stroke="#388E3C" strokeWidth="1.5" fill="none" />
            <circle cx="155" cy="30" r="3.5" fill="#FFD600" />
            <circle cx="152" cy="42" r="3.5" fill="#FFEA00" />
            <circle cx="157" cy="54" r="3" fill="#FFD600" />
            <circle cx="160" cy="65" r="2.5" fill="#FFEB3B" />
            {/* Kerala Nilavilakku Lamp */}
            <ellipse cx="100" cy="90" rx="18" ry="5" fill="#FFB300" stroke="#FFE082" strokeWidth="1" />
            <rect x="98" y="55" width="4" height="35" fill="#FFB300" />
            <ellipse cx="100" cy="55" rx="14" ry="4" fill="#FF8F00" />
            {/* Lamp Crown Flame */}
            <path d="M 100,38 C 96,44 95,49 100,54 C 105,49 104,44 100,38 Z" fill="#FF6D00" />
            <circle cx="100" cy="47" r="1.5" fill="#FFFDE7" />
          </g>
        );

      // 20. DURGA PUJA — Dhunachi Smoke & Trishul
      case "durga-puja":
        return (
          <g>
            {/* Swirling Holy Smoke Plumes */}
            <path d="M 100,45 Q 85,30 95,15 Q 110,25 100,45 Z" fill="rgba(255,255,255,0.2)" />
            <path d="M 105,50 Q 125,35 115,20 Q 95,30 105,50 Z" fill="rgba(255,255,255,0.25)" />
            {/* Golden Trishul (Trident) */}
            <path d="M 100,28 L 100,58" stroke="#FFD700" strokeWidth="2.5" />
            <path d="M 88,34 Q 88,48 100,48 Q 112,48 112,34" stroke="#FFD700" strokeWidth="2" fill="none" />
            <polygon points="100,24 97,29 103,29" fill="#FFD700" />
            <polygon points="88,31 85,36 91,36" fill="#FFD700" />
            <polygon points="112,31 109,36 115,36" fill="#FFD700" />
            {/* Clay Dhunachi Burner */}
            <path d="M 86,58 L 114,58 L 106,75 L 94,75 Z" fill="#8D4925" stroke="#D7CCC8" strokeWidth="1" />
            <rect x="97" y="75" width="6" height="15" fill="#6D3212" />
            <ellipse cx="100" cy="90" rx="14" ry="4" fill="#8D4925" />
          </g>
        );

      // 21. MAKAR SANKRANTI — Soaring Kites
      case "makar-sankranti":
        return (
          <g>
            {/* Golden Sunrays */}
            <circle cx="160" cy="30" r="15" fill="#FFF59D" opacity="0.6" />
            {/* Large Soaring Diamond Kite */}
            <g transform="rotate(-15 95 55)">
              <polygon points="95,25 120,55 95,85 70,55" fill="#FF6D00" stroke="#FFF" strokeWidth="1" />
              <polygon points="95,25 120,55 95,55" fill="#FF9100" />
              <line x1="95" y1="25" x2="95" y2="85" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 70,55 Q 95,45 120,55" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
              {/* Triangular Kite Tail */}
              <polygon points="95,85 90,95 100,95" fill="#00E5FF" />
              {/* Kite String */}
              <path d="M 95,65 Q 60,85 30,110" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" fill="none" />
            </g>
            {/* Small Background Kite */}
            <g transform="rotate(20 145 65)">
              <polygon points="145,50 157,65 145,80 133,65" fill="#00E5FF" stroke="#FFF" strokeWidth="0.8" />
              <polygon points="145,80 142,86 148,86" fill="#FF4081" />
            </g>
          </g>
        );

      // 22. DUSSEHRA — Golden Kodanda Bow & Victory Arrow
      case "dussehra":
        return (
          <g>
            {/* Victory Aura */}
            <circle cx="100" cy="60" r="36" fill="rgba(255, 109, 0, 0.2)" />
            {/* Kodanda Golden Bow */}
            <path d="M 68,88 Q 100,32 132,88" stroke="#FFD700" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <line x1="68" y1="88" x2="132" y2="88" stroke="#FFE082" strokeWidth="1" strokeDasharray="3 2" />
            {/* Pulled Arrow */}
            <line x1="100" y1="90" x2="100" y2="35" stroke="#FF3D00" strokeWidth="2" strokeLinecap="round" />
            <polygon points="100,30 96,38 104,38" fill="#FFD700" />
            {/* Shami leaf garlands */}
            <path d="M 60,35 Q 80,45 100,35 Q 120,45 140,35" stroke="#2E7D32" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
          </g>
        );

      // Default classical lotus / diya fallback
      default:
        return (
          <g>
            <circle cx="100" cy="60" r="32" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <circle cx="100" cy="60" r="12" fill="#FFB300" opacity="0.3" />
            <ellipse cx="100" cy="72" rx="22" ry="7" fill="#FFB300" />
            <path d="M 100,45 C 94,56 94,64 100,70 C 106,64 106,56 100,45 Z" fill="#FF6D00" />
            <circle cx="100" cy="58" r="2" fill="#FFF" />
          </g>
        );
    }
  };

  // Extract palette colors or provide rich defaults
  const p = festival.palette || {};
  const bg1 = p.background || "#160A02";
  const bg2 = p.secondary ? `${p.secondary}33` : "#3D1A00";
  const primaryColor = p.primary || "#FFD700";

  return (
    <div
      className={`utsav-festival-artwork ${className}`}
      style={{
        position: "relative",
        width: width,
        height: `${height}px`,
        borderRadius: isThumb ? "12px" : "8px 8px 0 0",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${bg1} 0%, #0D0500 50%, ${bg2} 100%)`,
        boxShadow: isThumb ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
        aria-hidden="true"
      >
        {/* Subtle background star dust texture */}
        <circle cx="20" cy="20" r="1" fill="#FFF" opacity="0.3" />
        <circle cx="80" cy="15" r="1.2" fill="#FFF" opacity="0.4" />
        <circle cx="180" cy="25" r="1" fill="#FFF" opacity="0.3" />
        <circle cx="160" cy="90" r="1" fill="#FFF" opacity="0.25" />
        <circle cx="30" cy="95" r="1.2" fill="#FFF" opacity="0.3" />

        {/* Dynamic Festival Specific Motif */}
        {renderMotif()}

        {/* Ambient bottom gradient shade to blend into card surface */}
        {!isThumb && (
          <rect
            x="0"
            y="95"
            width="200"
            height="25"
            fill="url(#utsav-bottom-shade)"
            opacity="0.8"
          />
        )}

        <defs>
          <linearGradient id="utsav-bottom-shade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Optional Badge overlay inside artwork */}
      {showBadge && badgeText && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            backgroundColor: badgeTone === "success" ? "#1B5E20" : badgeTone === "warning" ? "#E65100" : "#1A237E",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
}
