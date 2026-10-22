// 스킨 이미지 → 검증 결과 (오류/경고 목록).
// 캔버스에 의존하지 않는다. 픽셀 버퍼(RGBA)만 받으므로 Node 테스트에서 그대로 돈다.

import type { PartId, Rect, SkinSpec } from '../spec/types';
import { scaleRect } from '../spec/util';
import { hasLayeredMarker, hasSDMarker } from '../spec/marker';

/** ImageData와 같은 모양. 브라우저의 ImageData를 그대로 넘겨도 된다. */
export interface PixelData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type IssueCode =
  | 'size-not-square'
  | 'size-not-multiple'
  | 'required-empty'
  | 'optional-empty'
  | 'outside-regions'
  | 'no-alpha'
  | 'reserved-used';

/** 문장을 만드는 데 필요한 값. 문장은 i18n(formatIssue)이 만든다 */
export interface IssueParams {
  width?: number;
  height?: number;
  base?: number;
  /** 예약·영역 밖 픽셀 수 */
  count?: number;
  /** 비어 있을 때 대신 쓰는 부위와 밝기 */
  fallbackFrom?: PartId;
  brightness?: number;
}

export interface Issue {
  severity: 'error' | 'warning';
  code: IssueCode;
  part?: PartId;
  params?: IssueParams;
}

export interface ValidationResult {
  /** 오류가 하나도 없으면 true (경고는 있어도 로드한다) */
  ok: boolean;
  /** 배율 s = width / baseSize. 크기 오류면 0 */
  scale: number;
  issues: Issue[];
  /** 부위별 알파 > 0 픽셀 수 */
  filled: Record<PartId, number>;
}

/** 영역 안의 알파 > 0 픽셀 수 */
export function countOpaque(px: PixelData, r: Rect): number {
  let n = 0;
  const { width, data } = px;
  for (let y = r.y; y < r.y + r.h; y++) {
    let i = (y * width + r.x) * 4 + 3;
    for (let x = 0; x < r.w; x++, i += 4) if (data[i] > 0) n++;
  }
  return n;
}

/** 크기 규칙만 본다. 배율을 돌려주거나, 위반이면 이슈를 돌려준다. */
export function checkSize(width: number, height: number, spec: SkinSpec): { scale: number } | Issue {
  const b = spec.baseSize;
  if (width !== height) return { severity: 'error', code: 'size-not-square', params: { width, height } };
  if (width < b || width % b !== 0) return { severity: 'error', code: 'size-not-multiple', params: { width, height, base: b } };
  return { scale: width / b };
}

export function validateSkin(px: PixelData, spec: SkinSpec): ValidationResult {
  const issues: Issue[] = [];
  const filled: Record<PartId, number> = {};

  const size = checkSize(px.width, px.height, spec);
  if ('severity' in size) {
    return { ok: false, scale: 0, issues: [size], filled };
  }
  const s = size.scale;

  for (const part of spec.parts) {
    const n = countOpaque(px, scaleRect(part.rect, s));
    filled[part.id] = n;
    if (n > 0) continue;
    if (part.required) {
      issues.push({ severity: 'error', code: 'required-empty', part: part.id });
    } else {
      const fb = part.fallback;
      issues.push({
        severity: 'warning',
        code: 'optional-empty',
        part: part.id,
        params: fb ? { fallbackFrom: fb.from, brightness: fb.brightness } : {},
      });
    }
  }

  const reservedCount = spec.reserved.reduce((n, r) => n + countOpaque(px, scaleRect(r, s)), 0)
    - ((spec.id === 'skin-v1' && hasLayeredMarker(px) || spec.id === 'skin-sd' && hasSDMarker(px)) ? 4 * s * s : 0);
  if (reservedCount > 0) issues.push({ severity: 'warning', code: 'reserved-used', params: { count: reservedCount } });

  const outside = countOutside(px, spec, s);
  if (outside > 0) issues.push({ severity: 'warning', code: 'outside-regions', params: { count: outside } });

  if (!hasTransparency(px)) issues.push({ severity: 'warning', code: 'no-alpha' });

  return { ok: !issues.some((i) => i.severity === 'error'), scale: s, issues, filled };
}

/** 부위·예약 영역 어디에도 속하지 않는 불투명 픽셀 수 */
export function countOutside(px: PixelData, spec: SkinSpec, s: number): number {
  const covered = new Uint8Array(px.width * px.height);
  for (const r0 of [...spec.parts.map((p) => p.rect), ...spec.reserved]) {
    const r = scaleRect(r0, s);
    for (let y = r.y; y < r.y + r.h; y++) covered.fill(1, y * px.width + r.x, y * px.width + r.x + r.w);
  }
  let n = 0;
  for (let i = 0; i < covered.length; i++) if (!covered[i] && px.data[i * 4 + 3] > 0) n++;
  return n;
}

export function hasTransparency(px: PixelData): boolean {
  const { data } = px;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
}
