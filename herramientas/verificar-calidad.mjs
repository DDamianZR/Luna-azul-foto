import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('.git') && !fullPath.includes('node_modules') && !fullPath.includes('.system_generated')) {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const isTextFile = f => /\.(html|css|js|mjs|json|md|txt|vert|frag|gitattributes)$/i.test(f);

console.log('--- AUDITORÍA DE CALIDAD Y GREPS DE AUDITORÍA ---');

// 1. Cero rutas absolutas en docs/
const docsFiles = walk('docs').filter(isTextFile);
let absMatches = [];
docsFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(src=["']\/|href=["']\/|url\(["']?\/)/.test(line) && !line.includes('mailto:') && !line.includes('#')) {
      absMatches.push(`${f}:${idx + 1}: ${line.trim()}`);
    }
  });
});
console.log(`1. Rutas absolutas en docs/: ${absMatches.length} ${absMatches.length === 0 ? '✓ OK' : '✗ DETECTADAS'}`);
if (absMatches.length > 0) console.log(absMatches);

// 2. Cero referencias a herramientas de IA
const repoFiles = walk('.').filter(isTextFile).filter(f => !f.includes('PROMPT-ANTIGRAVITY-LUNA-AZUL-v2.md') && !f.endsWith('.log') && !f.includes('verificar-calidad.mjs'));
let aiMatches = [];
repoFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(claude|antigravity|copilot|gpt|\bllm\b|generado por|ai-generated)/i.test(line)) {
      aiMatches.push(`${f}:${idx + 1}: ${line.trim()}`);
    }
  });
});
console.log(`2. Referencias a IA en repo: ${aiMatches.length} ${aiMatches.length === 0 ? '✓ OK' : '✗ DETECTADAS'}`);
if (aiMatches.length > 0) console.log(aiMatches);

// 3. Cero TODO / FIXME
let todoMatches = [];
docsFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(TODO|FIXME|XXX)/.test(line)) {
      todoMatches.push(`${f}:${idx + 1}: ${line.trim()}`);
    }
  });
});
console.log(`3. TODO / FIXME en docs/: ${todoMatches.length} ${todoMatches.length === 0 ? '✓ OK' : '✗ DETECTADAS'}`);
if (todoMatches.length > 0) console.log(todoMatches);

// 4. .nojekyll existe
const nojekyllExists = fs.existsSync('docs/.nojekyll');
console.log(`4. .nojekyll existe: ${nojekyllExists ? '✓ OK' : '✗ FALTANTE'}`);
