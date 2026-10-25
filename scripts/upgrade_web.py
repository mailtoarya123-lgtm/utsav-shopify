import re, sys

HELPER = r'''function buildSpiderWeb() {
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const n = 11;
  const spokes = [];
  for (let i = 0; i < n; i++) {
    const a = (2 + (i / (n - 1)) * 86 + (rnd() - 0.5) * 5) * Math.PI / 180;
    spokes.push({ a, len: 135 + rnd() * 115 });
  }
  const P = (sp, r) => [r * Math.cos(sp.a), r * Math.sin(sp.a) * 0.75];
  const f = (v) => v.toFixed(1);
  let out = "";
  spokes.forEach((sp) => {
    const [x, y] = P(sp, sp.len);
    const [mx, my] = P(sp, sp.len * 0.5);
    const cx = mx + (rnd() - 0.5) * 5, cy = my + (rnd() - 0.5) * 5 + 2.5;
    out += `<path d="M0 0 Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}" stroke="rgba(246,248,255,${(0.7 + rnd() * 0.2).toFixed(2)})" stroke-width="${(0.9 + rnd() * 0.3).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
  });
  let r = 13;
  let k = 0;
  while (r < 250) {
    for (let i = 0; i < n - 1; i++) {
      const A = spokes[i], B = spokes[i + 1];
      if (r > A.len || r > B.len) continue;
      if (rnd() < 0.07) continue;
      const rj = r * (1 + (rnd() - 0.5) * 0.05);
      const [x1, y1] = P(A, rj), [x2, y2] = P(B, rj * (1 + (rnd() - 0.5) * 0.04));
      const pull = 0.80 + rnd() * 0.06;
      const cx = (x1 + x2) / 2 * pull, cy = (y1 + y2) / 2 * pull;
      const op = Math.max(0.25, 0.8 - k * 0.04);
      out += `<path d="M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}" stroke="rgba(236,240,255,${op.toFixed(2)})" stroke-width="${(0.55 + rnd() * 0.25).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
      if (rnd() < 0.18) out += `<circle cx="${f(x2)}" cy="${f(y2)}" r="${(0.8 + rnd() * 0.7).toFixed(1)}" fill="#fff" opacity="${(0.5 + rnd() * 0.4).toFixed(2)}"/>`;
    }
    r *= 1.28 + rnd() * 0.12;
    k++;
  }
  return out;
}
'''

NEW_SVG_HTML = '<svg viewBox="0 0 260 190" preserveAspectRatio="xMinYMin meet" style="display:block; width:100%; height:100%; overflow:visible; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45));">${buildSpiderWeb()}</svg>'
NEW_SVG_JSX = '<svg viewBox="0 0 260 190" preserveAspectRatio="xMinYMin meet" style={{ display: "block", width: "100%", height: "100%", overflow: "visible", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }} dangerouslySetInnerHTML={{ __html: buildSpiderWeb() }} />'

pat = re.compile(r'<svg viewBox="0 0 220 120".*?</svg>', re.S)

def patch(path, jsx, anchor):
    s = open(path, encoding='utf-8').read()
    s, c = pat.subn(lambda m: NEW_SVG_JSX if jsx else NEW_SVG_HTML, s)
    s = s.replace('width: clamp(130px, 16vw, 220px); height: clamp(75px, 10vw, 120px);', 'width: clamp(150px, 18vw, 260px); height: clamp(110px, 13.2vw, 190px);')
    s = s.replace('width: isMobile ? "110px" : "180px", height: isMobile ? "65px" : "100px"', 'width: isMobile ? "120px" : "190px", height: isMobile ? "88px" : "139px"')
    s = s.replace('width: isMobile ? \\"110px\\" : \\"180px\\"', 'x')
    if 'function buildSpiderWeb' not in s:
        i = s.index(anchor)
        # insert at line start of anchor
        i = s.rfind('\n', 0, i) + 1
        s = s[:i] + HELPER + '\n' + s[i:]
    open(path, 'w', encoding='utf-8').write(s)
    print(path, 'replaced', c)

base = '/Users/Bharath/development/fx india/'
patch(base + 'extensions/utsav-app-block/assets/festive-effects.js', False, 'function getEfTopSVG(festId)')
patch(base + 'app/routes/app.festivals.$id.jsx', True, 'function DynamicFestivalHeaderWidget(')
s = open(base + 'snippets/utsav-festival.liquid', encoding='utf-8').read()
m = re.search(r'function \w+\(festId[^)]*\)\s*\{[^\n]*\n(?:(?!function ).*\n){0,6}?[^\n]*isHalloween', s)
print('liquid anchor search', bool(m))
