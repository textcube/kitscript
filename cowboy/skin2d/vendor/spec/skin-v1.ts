import { SKIN_V0 } from './skin-v0';
import type { SkinSpec } from './types';
import { hasLayeredMarker, hasSDMarker } from './marker';
import type { PixelData } from '../core/validate';

/** PNG 한 장: 머리·헤어·모자/안경, 몸통·꼬리·망토/배낭을 독립적으로 그린다. */
export const SKIN_V1: SkinSpec = {
  id: 'skin-v1', baseSize: 256,
  parts: [
    ...SKIN_V0.parts.map(part => {
      if (part.id === 'hair_back') return { ...part, id: 'hair', name: '헤어', motionSource: 'hair_back' };
      if (part.id === 'extra') return { ...part, id: 'tail', name: '꼬리', motionSource: 'extra' };
      return part;
    }),
    { id: 'headwear', name: '모자 / 안경', rect: { x: 0, y: 160, w: 96, h: 96 }, required: false,
      pivot: { x: 48, y: 90 }, pivotLabel: '목', parent: 'head', anchor: { x: 48, y: 90 } },
    { id: 'backgear', name: '망토 / 배낭', rect: { x: 96, y: 160, w: 64, h: 96 }, required: false,
      pivot: { x: 8, y: 48 }, pivotLabel: '부착점', parent: 'torso', anchor: { x: 8, y: 50 }, motionSource: 'extra' },
  ],
  reserved: [{ x: 160, y: 160, w: 96, h: 96 }],
  drawOrder: ['arm_b', 'leg_b', 'tail', 'backgear', 'torso', 'leg_f', 'head', 'hair', 'headwear', 'weapon', 'arm_f'],
};

/** PNG 안의 식별점으로 구분한다. 추가 칸이 비어 있어도 헤어 순서를 정확하게 읽는다. */
export function skinSpecForPixels(pixels: PixelData, fallback: SkinSpec): SkinSpec {
  if (hasSDMarker(pixels)) return SKIN_SD;
  if (fallback.id !== SKIN_V0.id && fallback.id !== SKIN_V1.id) return fallback;
  return hasLayeredMarker(pixels) ? SKIN_V1 : SKIN_V0;
}

/** SD uses the same atlas cells, with shorter torso/limbs and an enlarged head. */
export const SKIN_SD: SkinSpec = {
  ...SKIN_V1, id: 'skin-sd',
  parts: SKIN_V1.parts.map(part => {
    switch (part.id) {
      case 'torso': return { ...part, rect: { ...part.rect, h: 48 }, pivot: { x: 32, y: 44 }, anchor: { x: 0, y: -34 } };
      case 'head': return { ...part, restScale: { x: 1.45, y: 1.45 } };
      case 'arm_f': case 'arm_b': return { ...part, rect: { ...part.rect, h: 40 }, anchor: { x: 32, y: 16 } };
      case 'leg_f': case 'leg_b': return { ...part, rect: { ...part.rect, h: 40 }, anchor: { x: 32, y: 44 } };
      case 'weapon': return { ...part, anchor: { x: 16, y: 34 } };
      case 'tail': case 'backgear': return { ...part, anchor: { x: 14, y: 38 } };
      default: return part;
    }
  }),
};
