#!/usr/bin/env node
/**
 * generate-blog-image.js
 * Generates a blog cover image via Google Imagen API.
 *
 * Usage:
 *   node scripts/generate-blog-image.js "<topic>" <slug>
 *
 * Examples:
 *   node scripts/generate-blog-image.js "design debt" design-debt-hidden-cost
 *   node scripts/generate-blog-image.js "AI-first product design" ai-first-design
 *
 * Output:
 *   Preview: /tmp/blog-cover-preview-<slug>.png
 *   Final:   assets/images/blog/<slug>-cover.jpg  (after approval)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const [key, ...val] = line.split('=');
      if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY not set in .env');
  process.exit(1);
}

const [,, topic, slug] = process.argv;
if (!topic || !slug) {
  console.error('Usage: node scripts/generate-blog-image.js "<topic>" <slug>');
  process.exit(1);
}

// Brand palette combos — described by name to avoid model rendering hex strings as text
const PALETTE_COMBOS = [
  { bg: 'soft periwinkle blue',  accent: 'warm burnt orange',    highlight: 'pure white' },
  { bg: 'pale mint green',       accent: 'warm burnt orange',    highlight: 'soft periwinkle blue' },
  { bg: 'light blush pink',      accent: 'warm burnt orange',    highlight: 'pale mint green' },
  { bg: 'soft lavender',         accent: 'warm burnt orange',    highlight: 'pale mint green' },
  { bg: 'warm cream white',      accent: 'warm burnt orange',    highlight: 'soft periwinkle blue' },
  { bg: 'pale sky blue',         accent: 'warm burnt orange',    highlight: 'dusty rose pink' },
];

function buildPrompt(topic, slug) {
  // Pick a combo deterministically based on slug so the same post always gets the same palette
  const idx = [...(slug || topic)].reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTE_COMBOS.length;
  const { bg, accent, highlight } = PALETTE_COMBOS[idx];

  return `Generate a modern abstract cover image for a blog post about ${topic}.

Style requirements:
- Background: ${bg}
- Primary shapes and elements: ${accent}
- Highlights and glows: ${highlight}
- Clean abstract composition — flowing lines, geometric shapes, layered UI panels, subtle glows, data visualization aesthetic
- Professional, contemporary feel suitable for a startup / product design blog header (16:9 wide format)

CRITICAL — THIS IS THE MOST IMPORTANT RULE:
- ZERO text of any kind — no letters, no words, no numbers, no labels, no annotations, no captions, no hex codes, no symbols
- Purely abstract and visual — no typography whatsoever
- If the image contains any text or characters it will be rejected

The composition should feel sophisticated and data-driven.`;
}

function callImagenAPI(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(`API error ${json.error.code}: ${json.error.message}`));
          const b64 = json.predictions?.[0]?.bytesBase64Encoded;
          if (!b64) return reject(new Error('No image data in response'));
          resolve(Buffer.from(b64, 'base64'));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Request timed out after 60s')); });
    req.write(body);
    req.end();
  });
}

async function main() {
  const prompt = buildPrompt(topic, slug);

  console.log(`\nGenerating cover image for: "${topic}"`);
  console.log('Model: imagen-4.0-generate-001');
  console.log('Prompt:', prompt.split('\n')[0] + '...\n');

  let imgBuffer;
  try {
    imgBuffer = await callImagenAPI(prompt);
  } catch (err) {
    console.error('Image generation failed:', err.message);
    process.exit(1);
  }

  // Save preview to /tmp
  const previewPath = `/tmp/blog-cover-preview-${slug}.png`;
  fs.writeFileSync(previewPath, imgBuffer);
  console.log(`Preview saved: ${previewPath}`);

  // Also save to assets dir ready for approval
  const assetDir = path.join(__dirname, '..', 'assets', 'images', 'blog');
  const assetPath = path.join(assetDir, `${slug}-cover.jpg`);
  fs.writeFileSync(assetPath, imgBuffer);
  console.log(`Asset saved:   ${assetPath}`);
  console.log(`\nfrontmatter:   coverImage: /assets/images/blog/${slug}-cover.jpg`);
  console.log('\nDone. Share the preview with the user for approval.');
}

main();
