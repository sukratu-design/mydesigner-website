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

function buildPrompt(topic) {
  return `Generate a modern abstract cover image for a blog post about ${topic}.

Style requirements:
- Warm orange gradient background (light amber orange to deep burnt orange)
- Strictly monochromatic orange palette — all elements must be in shades of light orange, pale orange, cream, white, or soft golden only
- NO blue, NO grey, NO green, NO purple, NO contrasting colors of any kind — only orange tones and white/cream
- Clean abstract composition with UI wireframe or data visualization aesthetic — flowing lines, geometric shapes, subtle glows
- Absolutely NO TEXT, NO LETTERS, NO NUMBERS, NO LABELS, NO ANNOTATIONS anywhere in the image
- Pure visual/abstract only — zero typographic elements of any kind
- Professional, contemporary design feel
- Should work as a blog header image

The composition should feel sophisticated and data-driven, matching a startup/product design audience.
IMPORTANT: Monochromatic orange and white only. Zero text. Zero contrasting colors.`;
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
  const prompt = buildPrompt(topic);

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
