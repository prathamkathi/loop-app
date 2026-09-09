/**
 * Post-export web automation for LOOP.
 * Generates PWA manifest.json, injects meta tags, Google Fonts, and copies icons to dist/.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir) || !fs.existsSync(indexHtmlPath)) {
  console.error('[Error] dist/index.html not found. Run expo export -p web first.');
  process.exit(1);
}

// 1. Copy icon assets into dist for PWA and Apple Touch Icon
const assetsDir = path.join(rootDir, 'assets');
const distAssetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

const copyFile = (src, dest) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
};

copyFile(path.join(assetsDir, 'icon.png'), path.join(distDir, 'icon.png'));
copyFile(path.join(assetsDir, 'icon.png'), path.join(distAssetsDir, 'icon.png'));
copyFile(path.join(assetsDir, 'favicon.png'), path.join(distDir, 'favicon.png'));
copyFile(path.join(assetsDir, 'favicon.png'), path.join(distAssetsDir, 'favicon.png'));

// 2. Generate dist/manifest.json
const manifest = {
  name: 'Loop | IIT Delhi Events',
  short_name: 'Loop',
  description: 'Real-time IIT Delhi campus events, fests, hackathons, and announcements.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#0A0A0C',
  theme_color: '#0A0A0C',
  icons: [
    {
      src: '/icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/favicon.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
  ],
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ Generated dist/manifest.json');

// 3. Inject PWA tags and Google Fonts into dist/index.html
let html = fs.readFileSync(indexHtmlPath, 'utf8');

const headTags = [];


if (!html.includes('manifest.json')) {
  headTags.push('  <link rel="manifest" href="/manifest.json" />');
}

if (!html.includes('name="theme-color"')) {
  headTags.push('  <meta name="theme-color" content="#0A0A0C" />');
}

if (!html.includes('name="mobile-web-app-capable"')) {
  headTags.push('  <meta name="mobile-web-app-capable" content="yes" />');
}

if (!html.includes('name="apple-mobile-web-app-capable"')) {
  headTags.push(
    '  <meta name="apple-mobile-web-app-capable" content="yes" />\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n  <meta name="apple-mobile-web-app-title" content="Loop" />\n  <link rel="apple-touch-icon" href="/icon.png" />'
  );
}

if (headTags.length > 0) {
  const insertBefore = html.includes('<link rel="icon"') ? '<link rel="icon"' : '</head>';
  html = html.replace(insertBefore, `${headTags.join('\n')}\n  ${insertBefore}`);
  fs.writeFileSync(indexHtmlPath, html);
  console.log(`✓ Injected ${headTags.length} PWA and styling tags into dist/index.html`);
} else {
  console.log('✓ dist/index.html is already up to date');
}
