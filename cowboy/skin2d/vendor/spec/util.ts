import { ROOT, type PartId, type PartSpec, type Rect, type SkinSpec } from './types';

export function partMap(spec: SkinSpec): Map<PartId, PartSpec> {
  return new Map(spec.parts.map((p) => [p.id, p]));
}

export function scaleRect(r: Rect, s: number): Rect {
  return { x: r.x * s, y: r.y * s, w: r.w * s, h: r.h * s };
}

/**
 * 규격 상수 자체의 정합성 검사. 새 규격 파일을 추가했을 때 테스트에서 돌린다.
 * 문제 목록을 돌려주고, 비어 있으면 정상.
 */
export function checkSpec(spec: SkinSpec): string[] {
  const problems: string[] = [];
  const seen = new Set<PartId>();
  const ids = new Set(spec.parts.map((p) => p.id));
  for (const p of spec.parts) {
    if (seen.has(p.id)) problems.push(`부위 id 중복: ${p.id}`);
    if (p.parent !== ROOT && !seen.has(p.parent)) {
      problems.push(`${p.id}의 부모 ${p.parent}가 앞에 정의되지 않음`);
    }
    const { rect } = p;
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > spec.baseSize || rect.y + rect.h > spec.baseSize) {
      problems.push(`${p.id} 영역이 캔버스를 벗어남`);
    }
    if (p.pivot.x < 0 || p.pivot.y < 0 || p.pivot.x > rect.w || p.pivot.y > rect.h) {
      problems.push(`${p.id} pivot이 자기 영역 밖`);
    }
    if (p.fallback && !ids.has(p.fallback.from)) problems.push(`${p.id} 대체 부위 ${p.fallback.from} 없음`);
    seen.add(p.id);
  }
  const all = [...spec.parts.map((p) => p.rect), ...spec.reserved];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (rectsOverlap(all[i], all[j])) problems.push(`영역 겹침: ${i}번과 ${j}번`);
    }
  }
  const order = new Set(spec.drawOrder);
  if (order.size !== spec.drawOrder.length) problems.push('그리기 순서에 중복');
  for (const id of ids) if (!order.has(id)) problems.push(`그리기 순서에 ${id} 없음`);
  for (const id of order) if (!ids.has(id)) problems.push(`그리기 순서의 ${id}는 없는 부위`);
  return problems;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
