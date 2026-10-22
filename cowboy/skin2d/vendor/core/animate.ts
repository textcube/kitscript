// 모션 JSON + 시간 → 포즈 (보간, 이징). 캔버스에 의존하지 않는다.
//
// 보간 규칙
// - 속성(rot, x, y, sx, sy)마다 따로 본다. 키프레임에 그 속성이 없으면 그 속성에 대해서는 키가 아니다.
// - 두 키 사이의 이징은 앞 키의 ease를 쓴다(없으면 linear). step이면 다음 키까지 앞 값을 유지한다.
// - 루프 모션은 마지막 키 → 다음 바퀴의 첫 키로 이어서 보간한다. 그래서 마지막 키를 duration에
//   첫 키와 같은 값으로 두지 않아도 이음매가 생기지 않는다.
// - 루프가 아니면 첫 키 이전은 첫 값, 마지막 키 이후는 마지막 값.

import type { BoneTransform, Pose } from './skeleton';

export const EASE_NAMES = ['linear', 'inQuad', 'outQuad', 'inOutQuad', 'inOutSine', 'outBack', 'step'] as const;
export type Ease = (typeof EASE_NAMES)[number];

export const EASES: Record<Ease, (p: number) => number> = {
  linear: (p) => p,
  inQuad: (p) => p * p,
  outQuad: (p) => 1 - (1 - p) * (1 - p),
  inOutQuad: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: (p) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  },
  step: () => 0,
};

export const PROPS = ['rot', 'x', 'y', 'sx', 'sy'] as const;
export type Prop = (typeof PROPS)[number];

export interface Keyframe extends Partial<BoneTransform> {
  t: number;
  ease?: Ease;
}

export interface MotionEvent {
  t: number;
  type: string;
  [param: string]: unknown;
}

export interface Motion {
  id: string;
  /** 표시 이름 (선택) */
  name?: string;
  duration: number;
  loop: boolean;
  tracks: Record<string, Keyframe[]>;
  events?: MotionEvent[];
}

const DEFAULTS: Record<Prop, number> = { rot: 0, x: 0, y: 0, sx: 1, sy: 1 };

/** 모션 JSON을 검사하고 키를 시간순으로 정리한다. 문제가 있으면 예외 */
export function parseMotion(raw: unknown): Motion {
  const m = raw as Motion;
  const where = `모션 ${m?.id ?? '(id 없음)'}`;
  if (!m || typeof m.id !== 'string') throw new Error('모션에 id가 없어요');
  if (!(m.duration > 0)) throw new Error(`${where}: duration은 0보다 커야 해요`);
  if (typeof m.loop !== 'boolean') throw new Error(`${where}: loop는 true/false여야 해요`);
  const tracks: Record<string, Keyframe[]> = {};
  for (const [bone, keys] of Object.entries(m.tracks ?? {})) {
    if (!Array.isArray(keys) || keys.length === 0) throw new Error(`${where}: ${bone} 트랙이 비어 있어요`);
    for (const k of keys) {
      if (!(k.t >= 0 && k.t <= m.duration)) throw new Error(`${where}: ${bone}의 키 t=${k.t}가 0~${m.duration} 밖이에요`);
      if (k.ease && !EASE_NAMES.includes(k.ease)) throw new Error(`${where}: ${bone}의 이징 ${k.ease}는 지원하지 않아요`);
    }
    tracks[bone] = [...keys].sort((a, b) => a.t - b.t);
  }
  const events = [...(m.events ?? [])].sort((a, b) => a.t - b.t);
  for (const e of events) {
    if (!(e.t >= 0 && e.t <= m.duration)) throw new Error(`${where}: 이벤트 ${e.type} t=${e.t}가 범위 밖이에요`);
  }
  return { ...m, tracks, events };
}

/** 한 트랙에서 한 속성의 값. 그 속성을 가진 키가 없으면 undefined */
export function sampleProp(keys: Keyframe[], prop: Prop, t: number, duration: number, loop: boolean): number | undefined {
  const ks = keys.filter((k) => k[prop] !== undefined);
  if (ks.length === 0) return undefined;
  if (ks.length === 1) return ks[0][prop]!;
  const first = ks[0];
  const last = ks[ks.length - 1];

  let a: Keyframe;
  let b: Keyframe;
  let ta: number;
  let tb: number;
  if (t < first.t || t >= last.t) {
    if (!loop) return (t < first.t ? first : last)[prop]!;
    // 루프: 마지막 키 → 다음 바퀴 첫 키
    a = last;
    b = first;
    ta = last.t;
    tb = first.t + duration;
    if (t < first.t) t += duration;
    if (tb <= ta) return a[prop]!;
  } else {
    let i = 0;
    while (ks[i + 1].t <= t) i++;
    a = ks[i];
    b = ks[i + 1];
    ta = a.t;
    tb = b.t;
  }
  const va = a[prop]!;
  const vb = b[prop]!;
  const ease = EASES[a.ease ?? 'linear'];
  const p = tb > ta ? (t - ta) / (tb - ta) : 1;
  return va + (vb - va) * ease(Math.min(1, Math.max(0, p)));
}

/** 모션 시간(ms) → 포즈. 루프면 감고, 아니면 0~duration으로 자른다 */
export function samplePose(motion: Motion, t: number): Pose {
  const { duration, loop } = motion;
  const tt = loop ? ((t % duration) + duration) % duration : Math.min(duration, Math.max(0, t));
  const pose: Pose = {};
  for (const [bone, keys] of Object.entries(motion.tracks)) {
    const out: Partial<BoneTransform> = {};
    for (const prop of PROPS) {
      const v = sampleProp(keys, prop, tt, duration, loop);
      if (v !== undefined && v !== DEFAULTS[prop]) out[prop] = v;
    }
    pose[bone] = out;
  }
  return pose;
}
