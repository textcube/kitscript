// 골격 트리, 포즈 → 월드 변환 계산. 캔버스에 의존하지 않는다.
//
// 각 부위의 그림은 자기 영역 로컬 좌표(0,0)~(w,h)에 있다. 부위의 로컬 변환은
//   translate(anchor + offset) · rotate(rot) · scale(sx, sy) · translate(-pivot)
// 즉 "자기 회전축을 부모의 부착 위치에 놓고, 회전축을 중심으로 돌리고 늘린다".
// 루트는 발밑(바닥선 위의 한 점)이고, 루트 변환은 발밑을 중심으로 적용된다.

import { ROOT, type PartId, type SkinSpec, type Vec2 } from '../spec/types';

/** 2D 아핀 행렬 [a, b, c, d, e, f] — canvas setTransform과 같은 순서 */
export type Mat = [number, number, number, number, number, number];

export const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];

export function mul(m: Mat, n: Mat): Mat {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

export function translate(x: number, y: number): Mat {
  return [1, 0, 0, 1, x, y];
}

export function scale(sx: number, sy = sx): Mat {
  return [sx, 0, 0, sy, 0, 0];
}

/** 도 단위. 화면 좌표(y 아래)에서 양수 = 시계 방향 */
export function rotate(deg: number): Mat {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, 0, 0];
}

export function apply(m: Mat, p: Vec2): Vec2 {
  return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] };
}

export function chain(...ms: Mat[]): Mat {
  return ms.reduce((acc, m) => mul(acc, m), IDENTITY);
}

export interface BoneTransform {
  rot: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
}

export const REST: BoneTransform = { rot: 0, x: 0, y: 0, sx: 1, sy: 1 };

/** 뼈 id → 변환. 빠진 뼈·값은 기본값(0 / 1) */
export type Pose = Record<string, Partial<BoneTransform>>;

function full(t: Partial<BoneTransform> | undefined): BoneTransform {
  return t ? { ...REST, ...t } : REST;
}

export function boneLocal(t: Partial<BoneTransform> | undefined): Mat {
  const b = full(t);
  return chain(translate(b.x, b.y), rotate(b.rot), scale(b.sx, b.sy));
}

/**
 * 포즈 → 뼈별 월드 행렬. 결과 행렬은 부위 영역 로컬 좌표를 월드(발밑 원점, 배율 1 px)로 옮긴다.
 * 'root' 항목은 발밑 좌표계 자체의 행렬.
 */
export function worldTransforms(spec: SkinSpec, pose: Pose, base: Mat = IDENTITY): Record<PartId, Mat> {
  const out: Record<PartId, Mat> = {};
  out[ROOT] = mul(base, boneLocal(pose[ROOT]));
  for (const part of spec.parts) {
    const parent = out[part.parent];
    if (!parent) throw new Error(`${part.id}의 부모 ${part.parent}가 먼저 계산되지 않았어요`);
    const local = chain(
      translate(part.anchor.x, part.anchor.y),
      boneLocal(pose[part.id] ?? (part.motionSource ? pose[part.motionSource] : undefined)),
      scale(part.restScale?.x ?? 1, part.restScale?.y ?? 1),
      translate(-part.pivot.x, -part.pivot.y),
    );
    out[part.id] = mul(parent, local);
  }
  return out;
}

/** 부위 회전축의 월드 위치 */
export function jointWorld(spec: SkinSpec, worlds: Record<PartId, Mat>, id: PartId): Vec2 {
  const part = spec.parts.find((p) => p.id === id)!;
  return apply(worlds[id], part.pivot);
}

/**
 * 본 보기용 선분 목록: 각 부위의 회전축에서 자식 부착점들로, 자식이 없으면 영역 반대편 끝으로.
 */
export function boneSegments(spec: SkinSpec, worlds: Record<PartId, Mat>): { id: PartId; from: Vec2; to: Vec2 }[] {
  const segs: { id: PartId; from: Vec2; to: Vec2 }[] = [];
  for (const part of spec.parts) {
    const m = worlds[part.id];
    const from = apply(m, part.pivot);
    const kids = spec.parts.filter((c) => c.parent === part.id);
    const targets = kids
      .map((c) => c.anchor)
      .filter((a) => a.x !== part.pivot.x || a.y !== part.pivot.y);
    if (targets.length === 0) targets.push(tipOf(part.rect.w, part.rect.h, part.pivot));
    for (const t of targets) segs.push({ id: part.id, from, to: apply(m, t) });
  }
  return segs;
}

/** 회전축에서 영역 중심 방향으로 영역 가장자리까지 간 점 */
function tipOf(w: number, h: number, p: Vec2): Vec2 {
  const dx = w / 2 - p.x;
  const dy = h / 2 - p.y;
  if (dx === 0 && dy === 0) return { x: w / 2, y: 0 };
  const tx = dx > 0 ? (w - p.x) / dx : dx < 0 ? -p.x / dx : Infinity;
  const ty = dy > 0 ? (h - p.y) / dy : dy < 0 ? -p.y / dy : Infinity;
  const t = Math.min(tx, ty);
  return { x: p.x + dx * t, y: p.y + dy * t };
}
