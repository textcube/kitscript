// 스킨 로드의 단일 진입점. 무엇이 만든 PNG든(사람, 기본 스킨 생성기, 나중의 AI 변환)
// ImageBitmap 하나로 들어와 같은 검증·슬라이스 경로를 탄다.

import type { PartId, Rect, SkinSpec } from '../spec/types';
import { skinSpecForPixels } from '../spec/skin-v1';
import { removeBackground, type BackgroundInfo } from './background';
import { slicePlan, type PartSlice, type SlicePlan } from './slice';
import { hasTransparency, validateSkin, type PixelData, type ValidationResult } from './validate';

export type SkinSource = ImageBitmap;

export interface PreparedPart extends PartSlice {
  /** 잘라낸(필요하면 어둡게 만든) 부위 그림. 크기 = 소스 사각형 */
  image: HTMLCanvasElement | null;
  /** 불투명 픽셀이 차지하는 범위 (부위 로컬, 배율 1 단위). 내보내기 크롭용 */
  bounds: Rect | null;
}

export interface PreparedSkin {
  spec: SkinSpec;
  scale: number;
  plan: SlicePlan;
  parts: Record<PartId, PreparedPart>;
}

export interface LoadedSkin {
  /** PNG에서 결정된 규격. 가이드·얼굴 편집·무기 보충에도 같은 규격을 쓴다. */
  spec: SkinSpec;
  /** 전체 이미지 (영역 하이라이트·재다운로드용). 배경을 지웠다면 지운 결과 */
  image: HTMLCanvasElement;
  /** 배경을 투명으로 바꿨다면 그 내용 */
  background: BackgroundInfo | null;
  validation: ValidationResult;
  /** 검증을 통과했을 때만 있다 */
  prepared: PreparedSkin | null;
}

export interface LoadOptions {
  /**
   * 투명 픽셀이 하나도 없는 이미지(흰색·크로마키 배경)면 배경을 찾아 투명으로 바꾼다.
   * 이미 투명한 곳이 있는 PNG는 건드리지 않는다.
   */
  removeBackground?: boolean;
}

export function loadSkin(source: SkinSource, spec: SkinSpec, opts: LoadOptions = {}): LoadedSkin {
  const image = document.createElement('canvas');
  image.width = source.width;
  image.height = source.height;
  const ctx = image.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0);
  let pixels: PixelData = ctx.getImageData(0, 0, image.width, image.height);
  spec = skinSpecForPixels(pixels, spec);
  let background: BackgroundInfo | null = null;
  if (opts.removeBackground && !hasTransparency(pixels)) {
    const keyed = removeBackground(pixels, spec);
    if (keyed) {
      pixels = keyed.pixels;
      background = keyed.info;
      ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height), 0, 0);
    }
  }
  const validation = validateSkin(pixels, spec);
  const prepared = validation.ok ? prepareSkin(pixels, spec, validation) : null;
  return { image, validation, prepared, background, spec };
}

/** 파일·Blob(드래그 앤 드롭, 붙여넣기)을 ImageBitmap으로. 색 변환 없이 픽셀 그대로 읽는다 */
export function decodeImage(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
}

/** 로드 실패 때도 디코더의 그래픽 메모리를 반환한다. */
export async function loadSkinBlob(blob: Blob, spec: SkinSpec, opts: LoadOptions = {}): Promise<LoadedSkin> {
  const bitmap = await decodeImage(blob);
  try {
    return loadSkin(bitmap, spec, opts);
  } finally {
    bitmap.close();
  }
}

export function prepareSkin(px: PixelData, spec: SkinSpec, v: ValidationResult): PreparedSkin {
  const plan = slicePlan(spec, v.scale, v.filled);
  const parts: Record<PartId, PreparedPart> = {};
  for (const id of Object.keys(plan.parts)) {
    const slice = plan.parts[id];
    if (!slice.visible || !slice.src) {
      parts[id] = { ...slice, image: null, bounds: null };
      continue;
    }
    const { x, y, w, h } = slice.src;
    const out = new ImageData(w, h);
    for (let row = 0; row < h; row++) {
      const from = ((y + row) * px.width + x) * 4;
      out.data.set(px.data.subarray(from, from + w * 4), row * w * 4);
    }
    if (slice.brightness !== 1) {
      const k = slice.brightness;
      for (let i = 0; i < out.data.length; i += 4) {
        out.data[i] *= k;
        out.data[i + 1] *= k;
        out.data[i + 2] *= k;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.putImageData(out, 0, 0);
    parts[id] = { ...slice, image: canvas, bounds: opaqueBounds(out, v.scale) };
  }
  return { spec, scale: v.scale, plan, parts };
}

function opaqueBounds(img: ImageData, s: number): Rect | null {
  let x0 = img.width;
  let y0 = img.height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (img.data[(y * img.width + x) * 4 + 3] === 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;
  return { x: x0 / s, y: y0 / s, w: (x1 + 1 - x0) / s, h: (y1 + 1 - y0) / s };
}
