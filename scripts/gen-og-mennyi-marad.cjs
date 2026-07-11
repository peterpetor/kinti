// OG-megosztás-kép a „Mennyi marad?" kalkulátorhoz (1200×630) — a gen-og-meghivo
// mintája (krém háttér + dombok + Kinti-pin + Georgia-headline). A tervező a
// legmegosztósabb felület (FB-kommentbe dobott linkek) — az egyedi kép a
// kattintási arányt emeli az og-default helyett. Futtatás: node scripts/gen-og-mennyi-marad.cjs
const sharp = require('sharp');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4ede0"/>
  <path d="M0 630 L0 440 L230 250 L430 420 L650 210 L880 430 L1050 310 L1200 420 L1200 630 Z" fill="#ece2cf"/>
  <path d="M0 630 L0 510 L270 370 L530 510 L770 370 L1010 510 L1200 390 L1200 630 Z" fill="#e6dcc6" opacity="0.65"/>
  <g transform="translate(537,52) scale(2.2)">
    <clipPath id="kintiPin"><path d="M24 2.5C13.8 2.5 6.5 10.4 6.5 20.4c0 9 8.2 18 14.8 24.3a3.8 3.8 0 0 0 5.4 0c6.6-6.3 14.8-15.3 14.8-24.3 0-10-7.3-17.9-17.5-17.9z"/></clipPath>
    <g clip-path="url(#kintiPin)">
      <rect x="4" y="0" width="40" height="16" fill="#c8392e"/>
      <rect x="4" y="16" width="40" height="16" fill="#f4ede0"/>
      <rect x="4" y="32" width="40" height="16" fill="#1d4434"/>
    </g>
    <path d="M24 2.5C13.8 2.5 6.5 10.4 6.5 20.4c0 9 8.2 18 14.8 24.3a3.8 3.8 0 0 0 5.4 0c6.6-6.3 14.8-15.3 14.8-24.3 0-10-7.3-17.9-17.5-17.9z" fill="none" stroke="#1d4434" stroke-width="2.4"/>
    <circle cx="24" cy="20" r="5.2" fill="#f4ede0" stroke="#1d4434" stroke-width="2.4"/>
  </g>
  <text x="600" y="268" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="bold" fill="#1d4434">Mennyi marad a fizetésedből?</text>
  <text x="600" y="326" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#5c6d63">Bruttó bér + család + város → ami a hónap végén marad</text>
  <!-- számítás-folyam pill: bruttó → nettó eredmény -->
  <g>
    <rect x="255" y="376" width="300" height="86" rx="28" fill="#ffffff" stroke="#d9cfba" stroke-width="2"/>
    <text x="405" y="416" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#5c6d63">bruttó</text>
    <text x="405" y="448" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#0e1f17">3 170 €</text>
    <text x="600" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold" fill="#5c6d63">→</text>
    <rect x="645" y="376" width="300" height="86" rx="28" fill="#1d4434"/>
    <text x="795" y="416" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#cfe0d6">marad kb.</text>
    <text x="795" y="448" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#ffffff">1 286 € / hó</text>
  </g>
  <text x="600" y="524" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#94a097">Németország · Ausztria · Svájc · Hollandia — ingyenes kalkulátor</text>
  <text x="600" y="584" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="bold" fill="#1d4434">kinti<tspan fill="#c8392e">.app</tspan></text>
</svg>`;
sharp(Buffer.from(svg)).png().toFile('public/icons/og-mennyi-marad.png')
  .then(i => console.log('written og-mennyi-marad.png', i.width + 'x' + i.height, i.size + ' bytes'))
  .catch(e => { console.error(e); process.exit(1); });
