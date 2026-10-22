import type { PixelData } from '../core/validate';

/** 예약 영역 우하단의 4px. PNG만으로 레이어 형식을 식별하며 캐릭터에는 그리지 않는다. */
export const LAYERED_MARKER = { x: 252, y: 255, colors: ['#534b32', '#6c6179', '#657273', '#000001'] } as const;

export function paintLayeredMarker(ctx: CanvasRenderingContext2D, scale: number): void {
  ctx.save(); ctx.setTransform(scale, 0, 0, scale, 0, 0);
  LAYERED_MARKER.colors.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(LAYERED_MARKER.x + i, LAYERED_MARKER.y, 1, 1); });
  ctx.restore();
}

export function hasLayeredMarker(px: PixelData): boolean {
  return hasMarker(px, LAYERED_MARKER.colors);
}

const SD_COLORS = ['#534432', '#636869', '#626973', '#000002'] as const;
export function paintSDMarker(ctx: CanvasRenderingContext2D, scale: number): void {
  ctx.save(); ctx.setTransform(scale, 0, 0, scale, 0, 0);
  SD_COLORS.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(LAYERED_MARKER.x + i, LAYERED_MARKER.y, 1, 1); });
  ctx.restore();
}
export function hasSDMarker(px: PixelData): boolean { return hasMarker(px, SD_COLORS); }
function hasMarker(px: PixelData, colors: readonly string[]): boolean {
  const scale = px.width / 256;
  if (px.height !== px.width || !Number.isInteger(scale) || scale < 1) return false;
  return colors.every((color, i) => {
    const rgb = parseInt(color.slice(1), 16);
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const at = (((LAYERED_MARKER.y * scale + dy) * px.width) + (LAYERED_MARKER.x + i) * scale + dx) * 4;
      if (px.data[at] !== (rgb >> 16) || px.data[at + 1] !== ((rgb >> 8) & 255) || px.data[at + 2] !== (rgb & 255) || px.data[at + 3] !== 255) return false;
    }
    return true;
  });
}
