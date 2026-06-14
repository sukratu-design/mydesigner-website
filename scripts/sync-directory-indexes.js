const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const INDEX_PAGES = [
  ['services.html', 'services/index.html'],
];

for (const [source, target] of INDEX_PAGES) {
  const sourcePath = path.join(ROOT, source);
  const targetPath = path.join(ROOT, target);
  const html = fs.readFileSync(sourcePath, 'utf8')
    .replaceAll('href="css/styles.css"', 'href="/css/styles.css"')
    .replaceAll('href="css/variables.css"', 'href="/css/variables.css"')
    .replaceAll('href="js/main.js"', 'href="/js/main.js"')
    .replaceAll('src="js/main.js"', 'src="/js/main.js"');

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, html);
  console.log(`Synced ${target}`);
}
