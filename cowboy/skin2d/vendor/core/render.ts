// 포즈 + 부위 → 캔버스 그리기.
// 캐릭터는 먼저 "캐릭터 레이어"에 그린 뒤 화면에 합성한다. 레이어를 따로 두는 이유:
//   1) flash 연출 — 캐릭터 실루엣만 단색으로 덮으려면 캐릭터만 있는 판이 필요하다.
//   2) 픽셀아트 모드 — 스킨 원본 해상도로 레이어에 그린 뒤 정수 배로 nearest-neighbor 확대해야
//      회전한 부위까지 같은 픽셀 격자를 공유한다.

import type { PartId, SkinSpec, Vec2 } from '../spec/types';
import { apply, boneSegments, chain, mul, scale, translate, worldTransforms, type Mat, type Pose } from './skeleton';
import type { PreparedSkin } from './skin';

export type PartPainters = Partial<Record<PartId, (ctx: CanvasRenderingContext2D, worlds: Record<PartId, Mat>) => void>>;

export interface Actor {
  skin: PreparedSkin;
  pose: Pose;
  /** 월드 x 위치 (배율 1 단위) */
  x: number;
  /** 월드 y 위치 (발밑, 위가 음수). 무대에서는 0, 게임에서 점프·발판 높이 */
  y?: number;
  /** true면 왼쪽을 본다 */
  flip: boolean;
  /** 게임의 장착 무기 등도 부위 순서와 캐릭터 레이어 안에서 그린다. */
  partPainters?: PartPainters;
}

export interface ViewInput {
  /** 대상 캔버스 크기 (장치 px) */
  width: number;
  height: number;
  /** 월드 원점(발밑·바닥선)이 놓일 장치 px 위치 */
  origin: Vec2;
  /** 월드 1 단위 = 장치 몇 px */
  zoom: number;
  pixel: boolean;
  /** 픽셀아트 모드에서 레이어 해상도의 기준이 되는 스킨 배율 (보통 가장 큰 스킨 배율) */
  skinScale: number;
}

export interface View {
  /** 월드 → 장치 px */
  camera: Mat;
  /** 실제로 적용된 확대 (픽셀아트 모드에서는 정수 배 스냅 결과) */
  zoom: number;
  layer: { width: number; height: number; k: number; camera: Mat };
  pixel: boolean;
}

export function resolveView(v: ViewInput): View {
  if (!v.pixel) {
    const camera = chain(translate(v.origin.x, v.origin.y), scale(v.zoom));
    return { camera, zoom: v.zoom, pixel: false, layer: { width: v.width, height: v.height, k: 1, camera } };
  }
  // 레이어 1px = 스킨 원본 1px. 레이어를 k배(정수) 확대해 화면에 붙인다.
  const L = v.skinScale;
  const k = Math.max(1, Math.round(v.zoom / L));
  const layerCamera = chain(translate(Math.round(v.origin.x / k), Math.round(v.origin.y / k)), scale(L));
  return {
    camera: mul(scale(k), layerCamera),
    zoom: k * L,
    pixel: true,
    layer: { width: Math.ceil(v.width / k), height: Math.ceil(v.height / k), k, camera: layerCamera },
  };
}

export interface Flash {
  color: string;
  /** 0~1 */
  alpha: number;
}

/** 배우의 발밑 좌표계 행렬 (카메라 · 위치 · 좌우 반전) */
export function actorBase(camera: Mat, actor: Pick<Actor, 'x' | 'y' | 'flip'>): Mat {
  return chain(camera, translate(actor.x, actor.y ?? 0), scale(actor.flip ? -1 : 1, 1));
}

/** 한 캐릭터를 ctx의 현재 변환과 무관하게 base 행렬 기준으로 그린다 */
export function drawCharacter(ctx: CanvasRenderingContext2D, skin: PreparedSkin, pose: Pose, base: Mat, painters?: PartPainters): void {
  const worlds = worldTransforms(skin.spec, pose, base);
  for (const id of skin.spec.drawOrder) {
    const paint = painters?.[id];
    if (paint) {
      ctx.save(); paint(ctx, worlds); ctx.restore();
      continue;
    }
    const part = skin.parts[id];
    if (!part?.image) continue;
    ctx.setTransform(...worlds[id]);
    ctx.drawImage(part.image, 0, 0, part.size.w, part.size.h);
  }
}

/**
 * 캐릭터 레이어는 크기별로 하나씩 재사용한다. 스테이지와 라이브러리 카드가 한 프레임에 번갈아 그려도
 * 캔버스를 매번 다시 할당하지 않게.
 */
const layers = new Map<string, HTMLCanvasElement>();

function layerOf(w: number, h: number): HTMLCanvasElement {
  const key = `${w}x${h}`;
  let c = layers.get(key);
  if (!c) {
    if (layers.size > 8) layers.clear(); // 창 크기를 자주 바꾸면 쌓이지 않게
    c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    layers.set(key, c);
  }
  const ctx = c.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return c;
}

/** 배우들을 캐릭터 레이어에 그리고 flash를 입혀 ctx에 합성한다 */
export function renderActors(ctx: CanvasRenderingContext2D, view: View, actors: Actor[], flash: Flash | null = null): void {
  const { layer } = view;
  // 아직 배치되지 않은 화면(폭 0)에서는 그릴 것이 없다. 0px 캔버스를 drawImage하면 예외가 난다.
  if (layer.width < 1 || layer.height < 1) return;
  const layerCanvas = layerOf(layer.width, layer.height);
  const lctx = layerCanvas.getContext('2d')!;
  lctx.imageSmoothingEnabled = !view.pixel;
  lctx.imageSmoothingQuality = 'high';
  for (const a of actors) drawCharacter(lctx, a.skin, a.pose, actorBase(layer.camera, a), a.partPainters);
  if (flash && flash.alpha > 0) {
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalCompositeOperation = 'source-atop';
    lctx.globalAlpha = Math.min(1, flash.alpha);
    lctx.fillStyle = flash.color;
    lctx.fillRect(0, 0, layer.width, layer.height);
    lctx.globalAlpha = 1;
    lctx.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = !view.pixel;
  ctx.drawImage(layerCanvas, 0, 0, layer.width * layer.k, layer.height * layer.k);
  ctx.restore();
}

const BONE_COLORS: Record<string, string> = {
  torso: '#ff4d6d',
  head: '#ffb703',
  hair_back: '#fb8500',
  hair: '#fb8500',
  headwear: '#ffd166',
  tail: '#f15bb5',
  backgear: '#9b5de5',
  arm_f: '#3a86ff',
  arm_b: '#8ecae6',
  leg_f: '#2ec27e',
  leg_b: '#a7e8bd',
  weapon: '#c77dff',
  extra: '#f15bb5',
};

/** 본 보기: 부위 사각형(점선), 뼈 선, 관절 점. 렌더와 같은 행렬로 계산하므로 기준점과 정확히 겹친다 */
export function drawBones(ctx: CanvasRenderingContext2D, view: View, actors: Actor[], dpr: number): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const a of actors) {
    const spec: SkinSpec = a.skin.spec;
    const worlds = worldTransforms(spec, a.pose, actorBase(view.camera, a));
    // 부위 영역 사각형
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.lineWidth = 1 * dpr;
    for (const p of spec.parts) {
      if (!a.skin.parts[p.id]?.image) continue;
      const m = worlds[p.id];
      const pts = [
        { x: 0, y: 0 },
        { x: p.rect.w, y: 0 },
        { x: p.rect.w, y: p.rect.h },
        { x: 0, y: p.rect.h },
      ].map((q) => apply(m, q));
      ctx.strokeStyle = withAlpha(BONE_COLORS[p.id] ?? '#ffffff', 0.55);
      ctx.beginPath();
      pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
      ctx.closePath();
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // 뼈
    const drawn = (id: PartId) => !!a.skin.parts[id]?.image;
    for (const seg of boneSegments(spec, worlds)) {
      if (!drawn(seg.id)) continue;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 4 * dpr;
      line(ctx, seg.from, seg.to);
      ctx.strokeStyle = BONE_COLORS[seg.id] ?? '#ffffff';
      ctx.lineWidth = 2 * dpr;
      line(ctx, seg.from, seg.to);
    }
    // 관절 (회전축)
    for (const p of spec.parts) {
      if (!drawn(p.id)) continue;
      const j = apply(worlds[p.id], p.pivot);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 3.2 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // 발밑 (루트)
    const root = apply(worlds.root, { x: 0, y: 0 });
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2 * dpr;
    line(ctx, { x: root.x - 7 * dpr, y: root.y }, { x: root.x + 7 * dpr, y: root.y });
    line(ctx, { x: root.x, y: root.y - 7 * dpr }, { x: root.x, y: root.y + 7 * dpr });
  }
  ctx.restore();
}

function line(ctx: CanvasRenderingContext2D, a: Vec2, b: Vec2): void {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** 포즈의 월드 범위 (배율 1 단위, 발밑 원점). 불투명 픽셀 범위 기준. 내보내기 크롭용 */
export function poseBounds(skin: PreparedSkin, pose: Pose, base: Mat): { x0: number; y0: number; x1: number; y1: number } | null {
  const worlds = worldTransforms(skin.spec, pose, base);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const id of Object.keys(skin.parts) as PartId[]) {
    const b = skin.parts[id].bounds;
    if (!b) continue;
    for (const q of [
      { x: b.x, y: b.y },
      { x: b.x + b.w, y: b.y },
      { x: b.x + b.w, y: b.y + b.h },
      { x: b.x, y: b.y + b.h },
    ]) {
      const p = apply(worlds[id], q);
      if (p.x < x0) x0 = p.x;
      if (p.y < y0) y0 = p.y;
      if (p.x > x1) x1 = p.x;
      if (p.y > y1) y1 = p.y;
    }
  }
  return Number.isFinite(x0) ? { x0, y0, x1, y1 } : null;
}
