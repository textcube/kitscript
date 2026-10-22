// 스킨 이미지 → 부위별 소스 사각형 (배율 반영, 대체 동작 포함).
// 픽셀을 자르지는 않는다. "어느 부위를 스킨 이미지의 어디에서 가져와 얼마나 어둡게 그릴지"만 계산한다.

import type { PartId, Rect, SkinSpec } from '../spec/types';
import { scaleRect } from '../spec/util';

export interface PartSlice {
  id: PartId;
  /** 그릴지 여부. 비어 있고 대체 동작도 없으면 false */
  visible: boolean;
  /** 스킨 이미지 안의 소스 사각형 (배율 반영 px). visible=false면 null */
  src: Rect | null;
  /** 실제로 픽셀을 가져오는 부위 (대체 동작이면 다른 부위) */
  from: PartId;
  /** 밝기 배율. 1이면 원본 그대로 */
  brightness: number;
  /** 그려지는 크기 (배율 1 단위). 소스가 다른 부위여도 자기 영역 크기로 그린다 */
  size: { w: number; h: number };
}

export interface SlicePlan {
  scale: number;
  parts: Record<PartId, PartSlice>;
}

/**
 * @param filled validateSkin이 센 부위별 불투명 픽셀 수
 */
export function slicePlan(spec: SkinSpec, scale: number, filled: Record<PartId, number>): SlicePlan {
  const parts: Record<PartId, PartSlice> = {};
  const byId = new Map(spec.parts.map((p) => [p.id, p]));
  for (const part of spec.parts) {
    const size = { w: part.rect.w, h: part.rect.h };
    if ((filled[part.id] ?? 0) > 0) {
      parts[part.id] = { id: part.id, visible: true, src: scaleRect(part.rect, scale), from: part.id, brightness: 1, size };
      continue;
    }
    const fb = part.fallback;
    const source = fb ? byId.get(fb.from) : undefined;
    if (fb && source && (filled[source.id] ?? 0) > 0) {
      parts[part.id] = {
        id: part.id,
        visible: true,
        src: scaleRect(source.rect, scale),
        from: source.id,
        brightness: fb.brightness,
        size,
      };
      continue;
    }
    parts[part.id] = { id: part.id, visible: false, src: null, from: part.id, brightness: 1, size };
  }
  return { scale, parts };
}
