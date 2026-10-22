// 스킨 규격의 모양. 값은 규격 파일(skin-v0.ts 등)에만 있고, 나머지 코드는 이 타입만 안다.
// 다른 등신용 규격(skin-v0-tall 등)은 같은 모양의 상수를 하나 더 만들면 된다.

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 부위 id. 규격마다 다를 수 있으므로 문자열로 둔다. */
export type PartId = string;

/** 루트 뼈의 id. 모션 트랙에서 캐릭터 전체(발밑 기준)를 움직일 때 쓴다. */
export const ROOT = 'root';

export interface Fallback {
  /** 비어 있을 때 대신 쓸 부위 */
  from: PartId;
  /** 밝기 배율 (0.7 = 70%) */
  brightness: number;
}

export interface PartSpec {
  id: PartId;
  /** 사람이 읽는 이름 */
  name: string;
  /** 스킨 이미지 안의 영역 (배율 1 px) */
  rect: Rect;
  required: boolean;
  /** 자기 회전축. 영역 로컬 좌표 */
  pivot: Vec2;
  /** 부모 뼈. 'root'면 루트에 붙는다 */
  parent: PartId;
  /** 부모 영역 로컬 좌표에서 이 부위의 pivot이 놓이는 위치 */
  anchor: Vec2;
  /** 가이드에 쓰는 기준점 이름 (예: '목', '어깨') */
  pivotLabel: string;
  /** 비어 있을 때의 대체 동작. 없으면 그리지 않는다 */
  fallback?: Fallback;
  /** 기존 모션의 부위 트랙을 공유한다. 자기 트랙이 있으면 우선한다. */
  motionSource?: PartId;
  /** Rest proportions applied around the pivot, before child attachment. */
  restScale?: Vec2;
}

export interface SkinSpec {
  id: string;
  /** 배율 1의 캔버스 한 변 (px) */
  baseSize: number;
  /** 부위 목록. 부모가 자식보다 먼저 온다 */
  parts: PartSpec[];
  /** 어느 부위도 아니지만 다른 버전을 위해 남겨둔 영역 */
  reserved: Rect[];
  /** 뒤 → 앞 */
  drawOrder: PartId[];
}
