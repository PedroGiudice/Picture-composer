/**
 * Client-side Mosaic Generation Algorithm
 * Substitutes pure GenAI composition to ensure pixel-perfect 
 * recreation using specific user-provided dataset.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface SourceImage {
  color: RGB;
  img: HTMLImageElement;
  usageCount: number;
}

const TILE_WIDTH = 30;
const TILE_HEIGHT = 30;

export const getAverageColor = (img: HTMLImageElement): RGB => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = TILE_WIDTH;
  canvas.height = TILE_HEIGHT;
  if (!ctx) return { r: 0, g: 0, b: 0 };
  ctx.drawImage(img, 0, 0, TILE_WIDTH, TILE_HEIGHT);
  try {
    const imageData = ctx.getImageData(0, 0, TILE_WIDTH, TILE_HEIGHT);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return {
      r: Math.floor(r / count),
      g: Math.floor(g / count),
      b: Math.floor(b / count)
    };
  } catch (e) {
    return { r: 0, g: 0, b: 0 };
  }
};

const colorDistance = (c1: RGB, c2: RGB) => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + 
    Math.pow(c1.g - c2.g, 2) + 
    Math.pow(c1.b - c2.b, 2)
  );
};

export const generateMosaic = async (
  targetFile: File,
  sourceFiles: File[],
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sourceAnalysis: SourceImage[] = [];
      const objectUrls: string[] = [];

      // Optimize: batch processing for source images could be added, but for now 
      // we just ensure we track usage.
      for (let i = 0; i < sourceFiles.length; i++) {
        const url = URL.createObjectURL(sourceFiles[i]);
        objectUrls.push(url);
        const img = new Image();
        img.src = url;
        await img.decode();
        const color = getAverageColor(img);
        sourceAnalysis.push({ color, img, usageCount: 0 });
        onProgress((i / sourceFiles.length) * 30);
      }

      const targetUrl = URL.createObjectURL(targetFile);
      objectUrls.push(targetUrl);
      const targetImg = new Image();
      targetImg.src = targetUrl;
      await targetImg.decode();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No context');

      const MAX_WIDTH = 2000;
      const scale = Math.min(1, MAX_WIDTH / targetImg.width);
      canvas.width = targetImg.width * scale;
      canvas.height = targetImg.height * scale;

      ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / TILE_WIDTH);
      const rows = Math.ceil(canvas.height / TILE_HEIGHT);
      
      const USAGE_PENALTY = 20; // Increase distance by this amount per usage
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * TILE_WIDTH;
          const y = row * TILE_HEIGHT;
          const patchW = Math.min(TILE_WIDTH, canvas.width - x);
          const patchH = Math.min(TILE_HEIGHT, canvas.height - y);
          
          if (patchW <= 0 || patchH <= 0) continue;

          const imageData = ctx.getImageData(x, y, patchW, patchH);
          const data = imageData.data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          
          const targetColor = {
            r: Math.floor(r / count),
            g: Math.floor(g / count),
            b: Math.floor(b / count)
          };

          // Find best match with usage penalty and randomness
          let bestMatch = sourceAnalysis[0];
          let minScore = Infinity;

          // Optimization: Check a subset if we have too many files, 
          // or just iterate all since N is usually < 1000.
          // For very large N, we might want a spatial index (e.g. k-d tree), 
          // but strictly color-based linear scan is fast enough for < 2000 items in JS.
          
          // We select top K candidates to add randomness
          const candidates = [];
          
          for (const source of sourceAnalysis) {
            const rawDist = colorDistance(targetColor, source.color);
            // Score = Distance + (Usage * Penalty)
            // This discourages reuse of the exact same image too often
            const score = rawDist + (source.usageCount * USAGE_PENALTY);
            
            candidates.push({ source, score });
          }
          
          // Sort by score and pick from top 3
          candidates.sort((a, b) => a.score - b.score);
          
          // Pick randomly from the top 3 (or fewer if not available)
          const topK = Math.min(candidates.length, 3);
          const selectedIndex = Math.floor(Math.random() * topK);
          bestMatch = candidates[selectedIndex].source;
          
          // Increment usage
          bestMatch.usageCount++;

          ctx.drawImage(bestMatch.img, x, y, TILE_WIDTH, TILE_HEIGHT);
        }
        
        // Progress update and yield to main thread to avoid freezing UI
        const currentProgress = 30 + ((row / rows) * 70);
        onProgress(currentProgress);
        if (row % 5 === 0) await new Promise(r => setTimeout(r, 0));
      }

      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      objectUrls.forEach(url => URL.revokeObjectURL(url));
      resolve(finalDataUrl);
    } catch (err) {
      reject(err);
    }
  });
};