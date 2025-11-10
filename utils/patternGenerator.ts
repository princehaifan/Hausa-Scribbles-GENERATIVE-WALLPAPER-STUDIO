import { createRNG } from './rng';

const HAUSA_PALETTES = [
  ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'], // Nautical
  ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'], // Earth
  ['#003049', '#D62828', '#F77F00', '#FCBF49', '#EAE2B7'], // Sunset
  ['#5F0F40', '#9A031E', '#FB8B24', '#E36414', '#0F4C5C'], // Deep
  ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C', '#D90429'], // Urban
  ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'], // Savanna
];

const MOTIFS = ['zigzag', 'diamonds', 'triangles', 'circles', 'waves', 'crescents', 'grid'];

export const drawPattern = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  density: number = 1
) => {
  const rand = createRNG(seed);

  // 1. Background
  const palette = HAUSA_PALETTES[Math.floor(rand() * HAUSA_PALETTES.length)];
  const bgColor = palette[Math.floor(rand() * palette.length)];
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Layers of Motifs
  const layers = 3 + Math.floor(rand() * 4); // 3 to 6 layers

  for (let layer = 0; layer < layers; layer++) {
    const motif = MOTIFS[Math.floor(rand() * MOTIFS.length)];
    const color = palette[Math.floor(rand() * palette.length)];
    const alpha = 0.2 + rand() * 0.6;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 + rand() * 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const baseCount = 10 + Math.floor(rand() * 40); // Base number of shapes
    const count = Math.floor(baseCount * density); // Scale by density
    
    // Scatter logic
    for (let i = 0; i < count; i++) {
      const x = rand() * width;
      const y = rand() * height;
      const size = 40 + rand() * (Math.min(width, height) * 0.3);
      const rotation = rand() * Math.PI * 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      drawMotif(ctx, motif, size, rand);
      
      ctx.restore();
    }
    ctx.restore();
  }

  // 3. The "Scribble" Overlay (Signature style)
  drawScribbles(ctx, width, height, palette, rand, density);
};

const drawMotif = (
  ctx: CanvasRenderingContext2D, 
  motif: string, 
  size: number, 
  rand: () => number
) => {
  const isFilled = rand() > 0.6; // 40% chance of stroke only

  switch (motif) {
    case 'zigzag':
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      for (let j = 0; j < 4; j++) {
        ctx.lineTo(-size/2 + (j+1) * (size/4), (j % 2 === 0 ? -1 : 1) * size/4);
      }
      ctx.stroke();
      break;
    
    case 'diamonds':
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      isFilled ? ctx.fill() : ctx.stroke();
      break;
    
    case 'triangles':
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      isFilled ? ctx.fill() : ctx.stroke();
      break;
    
    case 'circles':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      isFilled ? ctx.fill() : ctx.stroke();
      // Add a concentric ring sometimes
      if (rand() > 0.5) {
        ctx.beginPath();
        ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    
    case 'waves':
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.bezierCurveTo(-size / 4, -size / 2, size / 4, size / 2, size / 2, 0);
      ctx.stroke();
      break;
    
    case 'crescents':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.save();
      ctx.translate(size / 5, 0);
      ctx.beginPath();
      ctx.arc(0, 0, size / 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(0, 0, size/2, 0, Math.PI * 2); // Re-stroke outline if needed, or just fill
      if (isFilled) {
          // Re-draw crescent for fill
          ctx.fill(); 
      } else {
          ctx.stroke();
      }
      break;

    case 'grid':
      const step = size / 4;
      ctx.beginPath();
      for(let k = -size/2; k <= size/2; k += step) {
        ctx.moveTo(k, -size/2);
        ctx.lineTo(k, size/2);
        ctx.moveTo(-size/2, k);
        ctx.lineTo(size/2, k);
      }
      ctx.stroke();
      break;
  }
};

const drawScribbles = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  palette: string[], 
  rand: () => number,
  density: number
) => {
  const baseScribbleCount = 15;
  const scribbleCount = Math.floor(baseScribbleCount * density);

  ctx.save();
  ctx.globalAlpha = 0.6;
  
  for (let i = 0; i < scribbleCount; i++) {
    ctx.strokeStyle = palette[Math.floor(rand() * palette.length)];
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    
    let x = rand() * width;
    let y = rand() * height;
    ctx.moveTo(x, y);

    const segments = 5 + Math.floor(rand() * 10);
    for (let j = 0; j < segments; j++) {
      x += (rand() - 0.5) * 200;
      y += (rand() - 0.5) * 200;
      // Boundary check roughly
      x = Math.max(0, Math.min(width, x));
      y = Math.max(0, Math.min(height, y));
      
      // Use quadratic curves for a more organic "hand drawn" feel
      const cpX = x + (rand() - 0.5) * 50;
      const cpY = y + (rand() - 0.5) * 50;
      ctx.quadraticCurveTo(cpX, cpY, x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
};