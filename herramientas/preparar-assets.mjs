import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const FONTS_DIR = path.resolve('docs/assets/fonts');
const IMG_DIR = path.resolve('docs/assets/img');
const OBRAS_DIR = path.resolve('docs/assets/img/obras');

// Ensure directories exist
[FONTS_DIR, IMG_DIR, OBRAS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Helper to download binary files
async function downloadFile(url, destPath) {
  console.log(`Descargando: ${url} -> ${path.basename(destPath)}`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} al descargar ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
  console.log(`  ✓ Guardado (${buffer.length} bytes)`);
  return buffer;
}

// Helper to download Google Font WOFF2
async function downloadGoogleFont(family, weight, italic, filename) {
  const italicStr = italic ? '1' : '0';
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@${italicStr},${weight}&display=swap`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WOFF2'
    }
  });
  const css = await res.text();
  const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  if (!match) throw new Error(`No se encontró WOFF2 en CSS de ${family}`);
  const woff2Url = match[1];
  const destPath = path.join(FONTS_DIR, filename);
  await downloadFile(woff2Url, destPath);
}

async function main() {
  console.log('--- 1. DESCARGA DE FUENTES WOFF2 (Self-Hosted) ---');
  await downloadGoogleFont('Instrument Serif', 400, false, 'InstrumentSerif-Regular.woff2');
  await downloadGoogleFont('Instrument Serif', 400, true, 'InstrumentSerif-Italic.woff2');
  
  await downloadGoogleFont('Archivo', 300, false, 'Archivo-Light.woff2');
  await downloadGoogleFont('Archivo', 400, false, 'Archivo-Regular.woff2');
  await downloadGoogleFont('Archivo', 500, false, 'Archivo-Medium.woff2');

  await downloadGoogleFont('DM Mono', 300, false, 'DMMono-Light.woff2');
  await downloadGoogleFont('DM Mono', 400, false, 'DMMono-Regular.woff2');
  await downloadGoogleFont('DM Mono', 500, false, 'DMMono-Medium.woff2');

  console.log('\n--- 2. PROCESAMIENTO DE LOGO & FAVICONS ---');
  const logoPath = path.resolve('logo.jpg');
  if (fs.existsSync(logoPath)) {
    // Favicon 32x32 & 48x48
    await sharp(logoPath).resize(32, 32).toFile(path.join(IMG_DIR, 'favicon-32.png'));
    await sharp(logoPath).resize(180, 180).toFile(path.join(IMG_DIR, 'apple-touch-icon.png'));
    await sharp(logoPath).resize(512, 512).toFile(path.join(IMG_DIR, 'logo-512.png'));
    await sharp(logoPath).resize(1200, 630, { fit: 'cover' }).toFile(path.join(IMG_DIR, 'og-image.jpg'));
    console.log('  ✓ Logos y favicons generados');
  }

  console.log('\n--- 3. TEXTURA LUNAR (Dominio Público NASA) ---');
  // High quality equirectangular moon map (CGI Moon Kit / NASA Public Domain)
  const moonUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Moon_map_with_names.jpg/2048px-Moon_map_with_names.jpg';
  // Standard equirectangular albedo map (clean)
  const moonAlbedoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Moon_albedo_map.jpg/2048px-Moon_albedo_map.jpg';
  
  const moonRawPath = path.join(IMG_DIR, 'luna-albedo-raw.jpg');
  try {
    await downloadFile(moonAlbedoUrl, moonRawPath);
  } catch (e) {
    console.log('Fallback a textura alternativa NASA...');
    await downloadFile('https://images-assets.nasa.gov/image/PIA13517/PIA13517~orig.jpg', moonRawPath);
  }

  // Convert moon texture to WebP and JPEG
  await sharp(moonRawPath)
    .resize(2048, 1024, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(path.join(IMG_DIR, 'luna-albedo.webp'));

  await sharp(moonRawPath)
    .resize(2048, 1024, { fit: 'cover' })
    .jpeg({ quality: 82 })
    .toFile(path.join(IMG_DIR, 'luna-albedo.jpg'));

  // Poster fallback for moon hero when WebGL is disabled or unsupported
  await sharp(moonRawPath)
    .resize(1200, 1200, { fit: 'contain', background: { r: 8, g: 11, b: 16, alpha: 1 } })
    .avif({ quality: 55 })
    .toFile(path.join(IMG_DIR, 'luna-poster.avif'));

  await sharp(moonRawPath)
    .resize(1200, 1200, { fit: 'contain', background: { r: 8, g: 11, b: 16, alpha: 1 } })
    .webp({ quality: 75 })
    .toFile(path.join(IMG_DIR, 'luna-poster.webp'));

  fs.unlinkSync(moonRawPath);
  console.log('  ✓ Texturas lunares preparadas');

  console.log('\n--- 4. DESCARGA Y PROCESAMIENTO DE 14 FOTOGRAFÍAS CURADAS ---');
  // High quality Unsplash photograph IDs matching dark chiaroscuro, editorial, night blue hour, analog film style
  const photoUrls = [
    { id: 'hero', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2400&q=85', title: 'Retrato Hero - Claroscuro' },
    { id: 'obra-01', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2400&q=85', title: 'Retrato Autor 01' },
    { id: 'obra-02', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2400&q=85', title: 'Editorial Nocturno' },
    { id: 'obra-03', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=2400&q=85', title: 'Sombra y Luz Análoga' },
    { id: 'obra-04', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=2400&q=85', title: 'Estudio Chiaroscuro' },
    { id: 'obra-05', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=2400&q=85', title: 'Serie 120mm CDMX' },
    { id: 'obra-06', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=2400&q=85', title: 'Hora Azul Estudio' },
    { id: 'obra-07', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=2400&q=85', title: 'Silueta Lunar' },
    { id: 'obra-08', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=2400&q=85', title: 'Retrato Tinta' },
    { id: 'obra-09', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=2400&q=85', title: 'Campaña Nocturna' },
    { id: 'obra-10', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=2400&q=85', title: 'Fotografía de Autor' },
    { id: 'obra-11', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=2400&q=85', title: 'Noche Brutalista' },
    { id: 'obra-12', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=2400&q=85', title: 'Estudio Taller' },
    { id: 'estudio', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85', title: 'Taller de Revelado' }
  ];

  const metadataList = [];

  for (const item of photoUrls) {
    const tempPath = path.join(OBRAS_DIR, `${item.id}-temp.jpg`);
    await downloadFile(item.url, tempPath);

    // Verify download size
    const stats = fs.statSync(tempPath);
    if (stats.size < 200 * 1024) {
      throw new Error(`La imagen ${item.id} se descargó corrupta (< 200KB)`);
    }

    // Extract dominant color for placeholder
    const { channels } = await sharp(tempPath).stats();
    const dominantColor = `rgb(${Math.round(channels[0].mean)}, ${Math.round(channels[1].mean)}, ${Math.round(channels[2].mean)})`;

    // Process into 3 widths (900, 1600, 2400) x 3 formats (avif, webp, jpg)
    const widths = [900, 1600, 2400];
    for (const w of widths) {
      await sharp(tempPath)
        .resize(w, null, { withoutEnlargement: true })
        .avif({ quality: 50, effort: 4 })
        .toFile(path.join(OBRAS_DIR, `${item.id}-${w}.avif`));

      await sharp(tempPath)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(path.join(OBRAS_DIR, `${item.id}-${w}.webp`));

      await sharp(tempPath)
        .resize(w, null, { withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(path.join(OBRAS_DIR, `${item.id}-${w}.jpg`));
    }

    fs.unlinkSync(tempPath);
    console.log(`  ✓ Procesada imagen ${item.id} en 3 anchos x 3 formatos (Color dominante: ${dominantColor})`);

    metadataList.push({
      id: item.id,
      title: item.title,
      dominantColor,
      url: item.url
    });
  }

  // Save manifest
  fs.writeFileSync(path.join(IMG_DIR, 'fotos-manifest.json'), JSON.stringify(metadataList, null, 2));
  console.log('\n--- ASSETS COMPLETADOS EXITOSAMENTE ---');
}

main().catch(err => {
  console.error('Error fatal procesando assets:', err);
  process.exit(1);
});
