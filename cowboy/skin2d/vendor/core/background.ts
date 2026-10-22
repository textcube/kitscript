// 배경 제거: 투명 처리 없이 흰색·크로마키색 배경으로 그린(또는 생성한) 스킨을 투명 PNG로 바꾼다.
// 캔버스에 의존하지 않는다. 픽셀 버퍼만 받는다.
//
// 1. 배경색 찾기: 이미지 테두리 1px 줄에서 가장 많은 색. 테두리의 60% 이상이 그 색이어야 배경으로 본다.
// 2. 지우는 방식
//    - 크로마키(초록·파랑·자홍처럼 채도가 높은 색): 이미지 전체에서 그 색을 지운다. 그림 속에 잘 안 쓰는 색이라
//      팔과 몸 사이처럼 갇힌 틈도 같이 지워진다.
//    - 흰색·회색 같은 무채색: 테두리와 각 영역 테두리에서 이어진 배경만 지운다(그림판의 채우기처럼).
//      외곽선으로 둘러싸인 눈 흰자·흰 털은 남는다.
// 3. 가장자리: 배경과 섞인 안티앨리어싱 픽셀은 반투명으로 만들고, 섞인 배경색을 빼서 원래 색을 되살린다
//    (흰 테두리·초록 테두리가 남지 않게).

import type { SkinSpec } from '../spec/types';
import { scaleRect } from '../spec/util';
import type { PixelData } from './validate';

export type KeyMode = 'chroma' | 'contiguous';

export interface BackgroundInfo {
  /** 찾은 배경색 #rrggbb */
  color: string;
  mode: KeyMode;
  /** 완전히 투명해진 픽셀 수 */
  cleared: number;
  /** 반투명이 된 가장자리 픽셀 수 */
  softened: number;
}

type RGB = [number, number, number];

/** 무채색 배경: 이 거리 안은 완전히 배경, outer 밖은 완전히 그림 (RGB 유클리드 거리) */
const NEUTRAL_TOL = { inner: 28, outer: 72 };
/** 크로마키 배경은 압축 노이즈·번짐이 커서 범위를 넓게 (배경 찾기용) */
const CHROMA_TOL = { inner: 56, outer: 120 };
/**
 * 크로마키 투명도: 픽셀의 채도 성분을 배경색 채도 방향에 투영한 비율 k (배경 = 1, 무채색·다른 색 = 0 근처).
 * k ≥ hi는 완전히 배경, k ≤ lo는 완전히 그림. 그 사이는 (lo,0)·(0.5,0.5)·(hi,1)을 잇는 직선이라
 * 그림과 배경이 반반 섞인 가장자리(k≈0.5)는 정확히 50% 투명이 되고, 색 되살리기도 맞는다.
 */
const CHROMA_K = { lo: 0.25, hi: 0.85 };
/** 테두리 중 이 비율 이상이 배경색이어야 배경으로 인정 */
const MIN_BORDER_COVERAGE = 0.6;

const dist = (d: Uint8ClampedArray, i: number, c: RGB) => Math.hypot(d[i] - c[0], d[i + 1] - c[1], d[i + 2] - c[2]);

/** 테두리에서 배경색을 찾는다. 배경이라고 보기 어려우면 null */
export function detectBackground(px: PixelData): { color: RGB; mode: KeyMode } | null {
  const { width: w, height: h, data } = px;
  const idx: number[] = [];
  for (let x = 0; x < w; x++) idx.push(x * 4, ((h - 1) * w + x) * 4);
  for (let y = 1; y < h - 1; y++) idx.push(y * w * 4, (y * w + w - 1) * 4);
  // 4비트로 묶어 가장 많은 묶음을 찾고, 그 묶음의 평균을 배경색으로
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (const i of idx) {
    if (data[i + 3] < 255) continue;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += data[i];
    e.g += data[i + 1];
    e.b += data[i + 2];
    buckets.set(key, e);
  }
  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const e of buckets.values()) if (!best || e.n > best.n) best = e;
  if (!best) return null;
  const color: RGB = [best.r / best.n, best.g / best.n, best.b / best.n];
  const mode: KeyMode = Math.max(...color) - Math.min(...color) >= 100 ? 'chroma' : 'contiguous';
  const tol = mode === 'chroma' ? CHROMA_TOL : NEUTRAL_TOL;
  const near = idx.filter((i) => dist(data, i, color) < tol.inner).length;
  return near / idx.length >= MIN_BORDER_COVERAGE ? { color, mode } : null;
}

/**
 * 배경을 투명으로 바꾼 새 픽셀 버퍼를 돌려준다. 배경을 못 찾으면 null.
 * spec을 주면(크기가 규격에 맞을 때) 각 영역 테두리도 채우기 시작점으로 쓴다 — 영역마다 경계선을 그어 둔 그림 대비.
 */
export function removeBackground(px: PixelData, spec?: SkinSpec): { pixels: PixelData; info: BackgroundInfo } | null {
  const found = detectBackground(px);
  if (!found) return null;
  const { color, mode } = found;
  const tol = mode === 'chroma' ? CHROMA_TOL : NEUTRAL_TOL;
  const { width: w, height: h } = px;
  const src = px.data;
  const out = new Uint8ClampedArray(src);
  const n = w * h;

  // 각 픽셀의 "배경다움" 0~1 (1 = 완전히 배경)
  const bgness = new Float32Array(n);
  const d = new Float32Array(n);
  for (let p = 0; p < n; p++) d[p] = dist(src, p * 4, color);
  const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
  const smooth = (t: number) => {
    const u = clamp01(t);
    return u * u * (3 - 2 * u);
  };
  const target = new Uint8Array(n);
  if (mode === 'chroma') {
    const mean = (color[0] + color[1] + color[2]) / 3;
    const v = color.map((c) => c - mean);
    const vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    for (let p = 0; p < n; p++) {
      const i = p * 4;
      const m = (src[i] + src[i + 1] + src[i + 2]) / 3;
      const k = ((src[i] - m) * v[0] + (src[i + 1] - m) * v[1] + (src[i + 2] - m) * v[2]) / vv;
      bgness[p] = k <= 0.5 ? 0.5 * clamp01((k - CHROMA_K.lo) / (0.5 - CHROMA_K.lo)) : 0.5 + 0.5 * clamp01((k - 0.5) / (CHROMA_K.hi - 0.5));
      if (bgness[p] > 0) target[p] = 1;
    }
  } else {
    for (let p = 0; p < n; p++) bgness[p] = 1 - smooth((d[p] - tol.inner) / (tol.outer - tol.inner));
    const stack: number[] = [];
    const seed = (x: number, y: number) => {
      const p = y * w + x;
      if (d[p] < tol.inner && !target[p]) {
        target[p] = 1;
        stack.push(p);
      }
    };
    for (let x = 0; x < w; x++) (seed(x, 0), seed(x, h - 1));
    for (let y = 0; y < h; y++) (seed(0, y), seed(w - 1, y));
    const s = spec && w === h && w % spec.baseSize === 0 ? w / spec.baseSize : 0;
    if (spec && s) {
      for (const r0 of [...spec.parts.map((q) => q.rect), ...spec.reserved]) {
        const r = scaleRect(r0, s);
        for (let x = r.x; x < r.x + r.w; x++) (seed(x, r.y), seed(x, r.y + r.h - 1));
        for (let y = r.y; y < r.y + r.h; y++) (seed(r.x, y), seed(r.x + r.w - 1, y));
      }
    }
    // 완전한 배경(inner 안)을 통해서만 퍼진다. 가장자리 반투명 픽셀은 지우되 그 너머로 번지지 않는다.
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % w;
      const y = (p - x) / w;
      const visit = (q: number) => {
        if (target[q] || d[q] >= tol.outer) return;
        target[q] = 1;
        if (d[q] < tol.inner) stack.push(q);
      };
      if (x > 0) visit(p - 1);
      if (x < w - 1) visit(p + 1);
      if (y > 0) visit(p - w);
      if (y < h - 1) visit(p + w);
    }
  }

  let cleared = 0;
  let softened = 0;
  for (let p = 0; p < n; p++) {
    if (!target[p]) continue;
    const i = p * 4;
    const a = 1 - bgness[p];
    const alpha = (src[i + 3] / 255) * a;
    if (alpha <= 0.004) {
      out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
      cleared++;
      continue;
    }
    // 섞인 배경색 빼기: c = a·f + (1-a)·bg → f = (c - (1-a)·bg) / a
    for (let k = 0; k < 3; k++) out[i + k] = (src[i + k] - (1 - a) * color[k]) / a;
    out[i + 3] = Math.round(alpha * 255);
    softened++;
  }

  const hex = `#${color.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
  return { pixels: { width: w, height: h, data: out }, info: { color: hex, mode, cleared, softened } };
}
