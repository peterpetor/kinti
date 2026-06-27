const sharp = require('sharp');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4ede0"/>
  <path d="M0 630 L0 440 L230 250 L430 420 L650 210 L880 430 L1050 310 L1200 420 L1200 630 Z" fill="#ece2cf"/>
  <path d="M0 630 L0 510 L270 370 L530 510 L770 370 L1010 510 L1200 390 L1200 630 Z" fill="#e6dcc6" opacity="0.65"/>
  <g transform="translate(537,66) scale(2.5)">
    <clipPath id="kintiPin"><path d="M24 2.5C13.8 2.5 6.5 10.4 6.5 20.4c0 9 8.2 18 14.8 24.3a3.8 3.8 0 0 0 5.4 0c6.6-6.3 14.8-15.3 14.8-24.3 0-10-7.3-17.9-17.5-17.9z"/></clipPath>
    <g clip-path="url(#kintiPin)">
      <rect x="4" y="0" width="40" height="16" fill="#c8392e"/>
      <rect x="4" y="16" width="40" height="16" fill="#f4ede0"/>
      <rect x="4" y="32" width="40" height="16" fill="#1d4434"/>
    </g>
    <path d="M24 2.5C13.8 2.5 6.5 10.4 6.5 20.4c0 9 8.2 18 14.8 24.3a3.8 3.8 0 0 0 5.4 0c6.6-6.3 14.8-15.3 14.8-24.3 0-10-7.3-17.9-17.5-17.9z" fill="none" stroke="#1d4434" stroke-width="2.4"/>
    <circle cx="24" cy="20" r="5.2" fill="#f4ede0" stroke="#1d4434" stroke-width="2.4"/>
  </g>
  <text x="600" y="330" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="94" font-weight="bold" fill="#1d4434">Küldj egy magyart</text>
  <text x="600" y="392" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="33" fill="#5c6d63">Ismersz mást, aki kint él? Hívd meg a Kintire — ingyen, fiók nélkül.</text>
  <text x="600" y="556" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="bold" fill="#1d4434">kinti<tspan fill="#c8392e">.app</tspan></text>
</svg>`;
sharp(Buffer.from(svg)).png().toFile('public/icons/og-meghivo.png')
  .then(i => console.log('written og-meghivo.png', i.width + 'x' + i.height, i.size + ' bytes'))
  .catch(e => { console.error(e); process.exit(1); });
