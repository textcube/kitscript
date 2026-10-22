// SKIN2D 스킨 규격 v0 — 단일 기준.
// 렌더러·검증기·템플릿 생성기가 모두 여기서 읽는다. 값은 SPEC.md 2장과 1:1로 맞춘다.
// 값을 바꿔야 할 이유가 생기면 바꾸지 말고 NOTES.md에 적는다.

import type { PartSpec, SkinSpec } from './types';

/** 2.1 기본 캔버스 한 변 */
export const BASE_SIZE = 256;

const LEG_PIVOT = { x: 16, y: 6 };
const LEG_RECT_H = 64;

/**
 * 2.4 torso는 "발밑 기준 위로 다리 길이만큼" 루트에 붙는다.
 * 다리 길이 = 다리의 골반 기준점에서 다리 영역 아래 끝까지 = 64 - 6 = 58.
 * 그래서 다리 영역의 아래 끝이 바닥선(루트 y=0)에 닿는다.
 */
export const LEG_LENGTH = LEG_RECT_H - LEG_PIVOT.y;

const parts: PartSpec[] = [
  {
    id: 'torso',
    name: '몸통',
    rect: { x: 0, y: 96, w: 64, h: 64 },
    required: true,
    pivot: { x: 32, y: 58 },
    pivotLabel: '골반',
    parent: 'root',
    anchor: { x: 0, y: -LEG_LENGTH },
  },
  {
    id: 'head',
    name: '머리',
    rect: { x: 0, y: 0, w: 96, h: 96 },
    required: true,
    pivot: { x: 48, y: 90 },
    pivotLabel: '목',
    parent: 'torso',
    anchor: { x: 32, y: 6 },
  },
  {
    // head와 같은 위치·같은 변환을 따른다: 부모가 head이고, head의 pivot 위치에
    // 자기 pivot(같은 값)을 맞추므로 자기 변환이 0이면 head의 월드 변환과 정확히 같다.
    id: 'hair_back',
    name: '뒷머리',
    rect: { x: 96, y: 0, w: 96, h: 96 },
    required: false,
    pivot: { x: 48, y: 90 },
    pivotLabel: '목',
    parent: 'head',
    anchor: { x: 48, y: 90 },
  },
  {
    id: 'arm_f',
    name: '앞팔',
    rect: { x: 64, y: 96, w: 32, h: 64 },
    required: true,
    pivot: { x: 16, y: 6 },
    pivotLabel: '어깨',
    parent: 'torso',
    anchor: { x: 32, y: 14 },
  },
  {
    id: 'arm_b',
    name: '뒷팔',
    rect: { x: 96, y: 96, w: 32, h: 64 },
    required: false,
    pivot: { x: 16, y: 6 },
    pivotLabel: '어깨',
    parent: 'torso',
    anchor: { x: 32, y: 14 },
    fallback: { from: 'arm_f', brightness: 0.7 },
  },
  {
    id: 'leg_f',
    name: '앞다리',
    rect: { x: 128, y: 96, w: 32, h: LEG_RECT_H },
    required: true,
    pivot: LEG_PIVOT,
    pivotLabel: '골반',
    parent: 'torso',
    anchor: { x: 32, y: 58 },
  },
  {
    id: 'leg_b',
    name: '뒷다리',
    rect: { x: 160, y: 96, w: 32, h: LEG_RECT_H },
    required: false,
    pivot: LEG_PIVOT,
    pivotLabel: '골반',
    parent: 'torso',
    anchor: { x: 32, y: 58 },
    fallback: { from: 'leg_f', brightness: 0.7 },
  },
  {
    id: 'weapon',
    name: '무기',
    rect: { x: 192, y: 96, w: 64, h: 64 },
    required: false,
    pivot: { x: 12, y: 52 },
    pivotLabel: '손잡이',
    parent: 'arm_f',
    anchor: { x: 16, y: 58 },
  },
  {
    id: 'extra',
    name: '부가 부위',
    rect: { x: 192, y: 0, w: 64, h: 96 },
    required: false,
    pivot: { x: 8, y: 48 },
    pivotLabel: '부착점',
    parent: 'torso',
    anchor: { x: 8, y: 50 },
  },
];

export const SKIN_V0: SkinSpec = {
  id: 'skin-v0',
  baseSize: BASE_SIZE,
  parts,
  reserved: [{ x: 0, y: 160, w: 256, h: 96 }],
  drawOrder: ['arm_b', 'leg_b', 'hair_back', 'extra', 'torso', 'leg_f', 'head', 'weapon', 'arm_f'],
};
