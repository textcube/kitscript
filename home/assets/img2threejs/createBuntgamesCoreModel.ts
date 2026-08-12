import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [clampAlbedoChannel((value >> 16) & 255), clampAlbedoChannel((value >> 8) & 255), clampAlbedoChannel(value & 255)];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampAlbedoChannel(value: number): number {
  return Math.max(30, Math.min(240, Math.round(value)));
}

function clampPbrF0(value: number): number {
  return Math.max(0.02, Math.min(1, value));
}

function clampPbrIor(value: number): number {
  return Math.max(1, Math.min(2.5, value));
}

function clampPbrMetalness(value: number): number {
  return value >= 0.5 ? 1 : 0;
}

function clampedAlbedoColor(spec: SculptMaterialSpec): THREE.Color {
  const source = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const [red, green, blue] = hexToRgb(source);
  return new THREE.Color(red / 255, green / 255, blue / 255);
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [clampAlbedoChannel(Number(match[1])), clampAlbedoChannel(Number(match[2])), clampAlbedoChannel(Number(match[3]))];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions, denseComponent = false): THREE.MeshPhysicalMaterial {
  const textures = makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : clampedAlbedoColor(spec),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clampPbrMetalness(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: clampPbrIor(readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: clampPbrIor(readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clampPbrF0(readLayerNumber(spec.specularF0 ?? spec.f0 ?? spec.specularIntensity, ['base', 'value'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
    flatShading: spec.flatShading === true,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const denseMesh = denseComponent || spec.denseMesh === true || spec.geometryDensity === 'dense' || spec.topologyClass === 'dense';
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    const effectiveBumpScale = denseMesh ? Math.max(0.05, bumpScale) : bumpScale;
    if (effectiveBumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = effectiveBumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    const effectiveDisplacementScale = denseMesh ? Math.max(0.005, displacementScale) : displacementScale;
    if (effectiveDisplacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = effectiveDisplacementScale;
      material.displacementBias = -effectiveDisplacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrConstraints = { albedoRange: [30, 240], binaryMetalness: true, f0Range: [0.02, 1], iorRange: [1, 2.5] };
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.userData.referenceMaterialId = spec.referenceMaterialId ?? spec.materialReference?.profileId ?? null;
  material.userData.materialEvidence = spec.materialEvidence ?? null;
  material.userData.validationViews = spec.materialReference?.validationViews ?? [];
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// Generated from ObjectSculptSpec target: BUNTGAMES Core
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createBUNTGAMESCoreModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "BUNTGAMES Core";
  root.userData.reconstructionEvidence = {"itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": {"solved": false, "fovDegrees": 40.0, "aspect": 1.0, "orientation": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}, "positionHint": [0.0, 0.0, 3.0], "note": "For likeness work, solve the reference camera (forge/stage1_intake/solve_camera_pose.py) so the review render aligns with the photo and the reference can be projected. Confirm by overlay review."}, "approximationNotes": []};
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["chassis-black"] = createSculptMaterial(
    "chassis-black",
    {"id": "chassis-black", "name": "Powder-coated black chassis", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#111513", "color": "#111513", "albedo": {"dominant": "#111513", "secondary": [], "samplingNotes": "solid observed color region; no baked-light projection"}, "colorVariation": {"palette": ["#111513"], "pattern": "subtle procedural powder variation", "amplitude": 0.025, "heightCorrelation": 0.05}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2.0, 2.0], "anisotropy": 8, "texelDensityIntent": "Preserve stable world/object-scale detail; do not stretch micro detail with component scale."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2.0, "amplitude": 0.42, "role": "broad color and height breakup"}, {"id": "meso", "frequency": 12.0, "amplitude": 0.22, "role": "ridges, pores, grain, dents, or equivalent visible relief"}, {"id": "micro", "frequency": 56.0, "amplitude": 0.08, "role": "highlight breakup visible under grazing light"}], "roughness": {"base": 0.36, "variation": 0.08, "map": "independent-procedural-chassis-black-roughness", "localResponse": "slightly lower on exposed bevels, higher in seams"}, "metalness": {"base": 0.68, "variation": 0.04}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.35, "scale": 24.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.36, "contactShadowBias": 0.45, "notes": "independent cavity response at seams and contacts"}, "wear": {"edgeWear": 0.025, "scratches": [], "chips": []}, "dirt": {"amount": 0.015, "cavityBias": 0.6, "color": "#070908"}, "localOverrides": [{"id": "chassis-edge-wear", "region": "exposed chamfers", "roughness": 0.24, "evidenceRef": "full-object"}], "shaderNotes": ["Prefer MeshPhysicalMaterial when clearcoat, sheen, transmission, or thin-surface response is observed; otherwise use MeshStandardMaterial-compatible PBR channels.", "Generate albedo, roughness, height/normal, and AO independently; never alias albedo into roughness.", "Use normal/bump/displacement only when they map to observed surface relief.", "Use displacement geometry when the observed relief changes the close-up silhouette; texture-only relief is insufficient there."], "notes": "Procedural browser material. Reference PBR maps intentionally not claimed because source lighting is baked.", "qualityTier": "realtime"},
    options
  );
  materialMap["gunmetal"] = createSculptMaterial(
    "gunmetal",
    {"id": "gunmetal", "name": "Anodized gunmetal rails", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#343A37", "color": "#343A37", "albedo": {"dominant": "#343A37", "secondary": [], "samplingNotes": "solid observed color region; no baked-light projection"}, "colorVariation": {"palette": ["#343A37"], "pattern": "subtle procedural powder variation", "amplitude": 0.025, "heightCorrelation": 0.05}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2.0, 2.0], "anisotropy": 8, "texelDensityIntent": "Preserve stable world/object-scale detail; do not stretch micro detail with component scale."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2.0, "amplitude": 0.42, "role": "broad color and height breakup"}, {"id": "meso", "frequency": 12.0, "amplitude": 0.22, "role": "ridges, pores, grain, dents, or equivalent visible relief"}, {"id": "micro", "frequency": 56.0, "amplitude": 0.08, "role": "highlight breakup visible under grazing light"}], "roughness": {"base": 0.24, "variation": 0.08, "map": "independent-procedural-gunmetal-roughness", "localResponse": "slightly lower on exposed bevels, higher in seams"}, "metalness": {"base": 0.88, "variation": 0.04}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.35, "scale": 24.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.36, "contactShadowBias": 0.45, "notes": "independent cavity response at seams and contacts"}, "wear": {"edgeWear": 0.025, "scratches": [], "chips": []}, "dirt": {"amount": 0.015, "cavityBias": 0.6, "color": "#070908"}, "localOverrides": [{"id": "rail-brush", "region": "ring and rail faces", "roughness": 0.2, "evidenceRef": "full-object"}], "shaderNotes": ["Prefer MeshPhysicalMaterial when clearcoat, sheen, transmission, or thin-surface response is observed; otherwise use MeshStandardMaterial-compatible PBR channels.", "Generate albedo, roughness, height/normal, and AO independently; never alias albedo into roughness.", "Use normal/bump/displacement only when they map to observed surface relief.", "Use displacement geometry when the observed relief changes the close-up silhouette; texture-only relief is insufficient there."], "notes": "Procedural browser material. Reference PBR maps intentionally not claimed because source lighting is baked.", "qualityTier": "realtime"},
    options
  );
  materialMap["safety-orange"] = createSculptMaterial(
    "safety-orange",
    {"id": "safety-orange", "name": "Satin safety orange latches", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#FF4B19", "color": "#FF4B19", "albedo": {"dominant": "#FF4B19", "secondary": [], "samplingNotes": "solid observed color region; no baked-light projection"}, "colorVariation": {"palette": ["#FF4B19"], "pattern": "subtle procedural powder variation", "amplitude": 0.025, "heightCorrelation": 0.05}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2.0, 2.0], "anisotropy": 8, "texelDensityIntent": "Preserve stable world/object-scale detail; do not stretch micro detail with component scale."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2.0, "amplitude": 0.42, "role": "broad color and height breakup"}, {"id": "meso", "frequency": 12.0, "amplitude": 0.22, "role": "ridges, pores, grain, dents, or equivalent visible relief"}, {"id": "micro", "frequency": 56.0, "amplitude": 0.08, "role": "highlight breakup visible under grazing light"}], "roughness": {"base": 0.3, "variation": 0.08, "map": "independent-procedural-safety-orange-roughness", "localResponse": "slightly lower on exposed bevels, higher in seams"}, "metalness": {"base": 0.32, "variation": 0.04}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.35, "scale": 24.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.36, "contactShadowBias": 0.45, "notes": "independent cavity response at seams and contacts"}, "wear": {"edgeWear": 0.025, "scratches": [], "chips": []}, "dirt": {"amount": 0.015, "cavityBias": 0.6, "color": "#070908"}, "localOverrides": [{"id": "orange-brackets", "region": "module retainers and control lever", "roughness": 0.26, "evidenceRef": "full-object"}], "shaderNotes": ["Prefer MeshPhysicalMaterial when clearcoat, sheen, transmission, or thin-surface response is observed; otherwise use MeshStandardMaterial-compatible PBR channels.", "Generate albedo, roughness, height/normal, and AO independently; never alias albedo into roughness.", "Use normal/bump/displacement only when they map to observed surface relief.", "Use displacement geometry when the observed relief changes the close-up silhouette; texture-only relief is insufficient there."], "notes": "Procedural browser material. Reference PBR maps intentionally not claimed because source lighting is baked.", "qualityTier": "realtime"},
    options
  );
  materialMap["acid-core"] = createSculptMaterial(
    "acid-core",
    {"id": "acid-core", "name": "Acid chartreuse energy glass", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#C8FF24", "color": "#C8FF24", "albedo": {"dominant": "#C8FF24", "secondary": [], "samplingNotes": "solid observed color region; no baked-light projection"}, "colorVariation": {"palette": ["#C8FF24"], "pattern": "subtle procedural powder variation", "amplitude": 0.025, "heightCorrelation": 0.05}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2.0, 2.0], "anisotropy": 8, "texelDensityIntent": "Preserve stable world/object-scale detail; do not stretch micro detail with component scale."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2.0, "amplitude": 0.42, "role": "broad color and height breakup"}, {"id": "meso", "frequency": 12.0, "amplitude": 0.22, "role": "ridges, pores, grain, dents, or equivalent visible relief"}, {"id": "micro", "frequency": 56.0, "amplitude": 0.08, "role": "highlight breakup visible under grazing light"}], "roughness": {"base": 0.12, "variation": 0.08, "map": "independent-procedural-acid-core-roughness", "localResponse": "slightly lower on exposed bevels, higher in seams"}, "metalness": {"base": 0.08, "variation": 0.04}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.35, "scale": 24.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.36, "contactShadowBias": 0.45, "notes": "independent cavity response at seams and contacts"}, "wear": {"edgeWear": 0.025, "scratches": [], "chips": []}, "dirt": {"amount": 0.015, "cavityBias": 0.6, "color": "#070908"}, "localOverrides": [{"id": "core-lens.glass-response", "region": "central lens", "roughness": 0.08, "clearcoat": 1.0, "clearcoatRoughness": 0.06, "evidenceRef": "detail-zones/zone-r1c1.png"}, {"id": "cartridge-face.color-panels", "region": "upper inset face", "roughness": 0.2, "evidenceRef": "detail-zones/zone-r0c1.png"}], "shaderNotes": ["Prefer MeshPhysicalMaterial when clearcoat, sheen, transmission, or thin-surface response is observed; otherwise use MeshStandardMaterial-compatible PBR channels.", "Generate albedo, roughness, height/normal, and AO independently; never alias albedo into roughness.", "Use normal/bump/displacement only when they map to observed surface relief.", "Use displacement geometry when the observed relief changes the close-up silhouette; texture-only relief is insufficient there."], "notes": "Procedural browser material. Reference PBR maps intentionally not claimed because source lighting is baked.", "qualityTier": "realtime"},
    options
  );
  materialMap["pcb-green"] = createSculptMaterial(
    "pcb-green",
    {"id": "pcb-green", "name": "Dark green circuit substrate", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#173A2A", "color": "#173A2A", "albedo": {"dominant": "#173A2A", "secondary": [], "samplingNotes": "solid observed color region; no baked-light projection"}, "colorVariation": {"palette": ["#173A2A"], "pattern": "subtle procedural powder variation", "amplitude": 0.025, "heightCorrelation": 0.05}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2.0, 2.0], "anisotropy": 8, "texelDensityIntent": "Preserve stable world/object-scale detail; do not stretch micro detail with component scale."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2.0, "amplitude": 0.42, "role": "broad color and height breakup"}, {"id": "meso", "frequency": 12.0, "amplitude": 0.22, "role": "ridges, pores, grain, dents, or equivalent visible relief"}, {"id": "micro", "frequency": 56.0, "amplitude": 0.08, "role": "highlight breakup visible under grazing light"}], "roughness": {"base": 0.52, "variation": 0.08, "map": "independent-procedural-pcb-green-roughness", "localResponse": "slightly lower on exposed bevels, higher in seams"}, "metalness": {"base": 0.12, "variation": 0.04}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.35, "scale": 24.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.36, "contactShadowBias": 0.45, "notes": "independent cavity response at seams and contacts"}, "wear": {"edgeWear": 0.025, "scratches": [], "chips": []}, "dirt": {"amount": 0.015, "cavityBias": 0.6, "color": "#070908"}, "localOverrides": [{"id": "pcb-traces", "region": "lateral module boards", "roughness": 0.42, "evidenceRef": "full-object"}], "shaderNotes": ["Prefer MeshPhysicalMaterial when clearcoat, sheen, transmission, or thin-surface response is observed; otherwise use MeshStandardMaterial-compatible PBR channels.", "Generate albedo, roughness, height/normal, and AO independently; never alias albedo into roughness.", "Use normal/bump/displacement only when they map to observed surface relief.", "Use displacement geometry when the observed relief changes the close-up silhouette; texture-only relief is insufficient there."], "notes": "Procedural browser material. Reference PBR maps intentionally not claimed because source lighting is baked.", "qualityTier": "realtime"},
    options
  );
  materialMap["contact-gold"] = createSculptMaterial(
    "contact-gold",
    {"id": "contact-gold", "name": "Metallic connector contacts", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#D8B15A", "color": "#D8B15A", "albedo": {"dominant": "#D8B15A", "secondary": [], "samplingNotes": "solid observed color region; no baked-light projection"}, "colorVariation": {"palette": ["#D8B15A"], "pattern": "subtle procedural powder variation", "amplitude": 0.025, "heightCorrelation": 0.05}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2.0, 2.0], "anisotropy": 8, "texelDensityIntent": "Preserve stable world/object-scale detail; do not stretch micro detail with component scale."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2.0, "amplitude": 0.42, "role": "broad color and height breakup"}, {"id": "meso", "frequency": 12.0, "amplitude": 0.22, "role": "ridges, pores, grain, dents, or equivalent visible relief"}, {"id": "micro", "frequency": 56.0, "amplitude": 0.08, "role": "highlight breakup visible under grazing light"}], "roughness": {"base": 0.18, "variation": 0.08, "map": "independent-procedural-contact-gold-roughness", "localResponse": "slightly lower on exposed bevels, higher in seams"}, "metalness": {"base": 0.95, "variation": 0.04}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.35, "scale": 24.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.36, "contactShadowBias": 0.45, "notes": "independent cavity response at seams and contacts"}, "wear": {"edgeWear": 0.025, "scratches": [], "chips": []}, "dirt": {"amount": 0.015, "cavityBias": 0.6, "color": "#070908"}, "localOverrides": [{"id": "contact-polish", "region": "upper and lower contacts", "roughness": 0.13, "evidenceRef": "full-object"}], "shaderNotes": ["Prefer MeshPhysicalMaterial when clearcoat, sheen, transmission, or thin-surface response is observed; otherwise use MeshStandardMaterial-compatible PBR channels.", "Generate albedo, roughness, height/normal, and AO independently; never alias albedo into roughness.", "Use normal/bump/displacement only when they map to observed surface relief.", "Use displacement geometry when the observed relief changes the close-up silhouette; texture-only relief is insufficient there."], "notes": "Procedural browser material. Reference PBR maps intentionally not claimed because source lighting is baked.", "qualityTier": "realtime"},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const attachment_root_0 = null;
  const endpoint_root_0 = makeAttachmentEndpoint(attachment_root_0);
  const node_root_0 = new THREE.Group();
  node_root_0.name = "Root chassis__pivot";
  node_root_0.scale.set(1, 1, 1);
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_root_0.position.set(0.0, 0.0, 0.0);
    node_root_0.rotation.set(0.0, 0.0, 0.0);
  }
  node_root_0.userData.sculptComponent = {"id": "root", "name": "Root chassis", "level": "macro", "role": "body", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": null, "attachment": null, "dimensions": {"width": 4.8, "height": 5.6, "depth": 1.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "root-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.8, 5.6, 1.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "chassis-black"}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "root-chassis.fastener-system", "kind": "fastener"}, {"id": "root-chassis.vent-ribs", "kind": "ridge"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_root_0.userData.actionProfile = {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "root-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.8, 5.6, 1.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "chassis-black"}};
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0
    ? new THREE.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_root_0) {
    mesh_root_0Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_root_0 = new THREE.Mesh(
    mesh_root_0Geometry,
    materialMap["chassis-black"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_root_0.name = "Root chassis";
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = {"id": "root", "name": "Root chassis", "level": "macro", "role": "body", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": null, "attachment": null, "dimensions": {"width": 4.8, "height": 5.6, "depth": 1.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "root-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.8, 5.6, 1.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "chassis-black"}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "root-chassis.fastener-system", "kind": "fastener"}, {"id": "root-chassis.vent-ribs", "kind": "ridge"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = {"type": "box", "offset": [0, 0, 0], "scale": [4.8, 5.6, 1.3], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const socket_root_root_socket_0 = new THREE.Object3D();
  socket_root_root_socket_0.name = "root-socket";
  socket_root_root_socket_0.position.set(0.0, 0.0, 0.0);
  socket_root_root_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_root_root_socket_0.userData.socket = {"id": "root-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_root_0.add(socket_root_root_socket_0);
  sockets["root:root-socket"] = socket_root_root_socket_0;

  const attachment_upper_cartridge_1 = null;
  const endpoint_upper_cartridge_1 = makeAttachmentEndpoint(attachment_upper_cartridge_1);
  const node_upper_cartridge_1 = new THREE.Group();
  node_upper_cartridge_1.name = "Upper cartridge__pivot";
  node_upper_cartridge_1.scale.set(1, 1, 1);
  if (endpoint_upper_cartridge_1) {
    node_upper_cartridge_1.position.copy(endpoint_upper_cartridge_1.start);
    node_upper_cartridge_1.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_upper_cartridge_1.position.set(0.0, 3.55, 0.05);
    node_upper_cartridge_1.rotation.set(0.0, 0.0, 0.0);
  }
  node_upper_cartridge_1.userData.sculptComponent = {"id": "upper-cartridge", "name": "Upper cartridge", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 3.8, "height": 2.1, "depth": 0.8, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 3.55, 0.05], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "upper-cartridge-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.8, 2.1, 0.8], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "upper-cartridge", "seamRefs": [], "detachableFragments": ["upper-cartridge"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 3.55, 0.05], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "upper-cartridge.edge-chamfer", "kind": "bevel"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_upper_cartridge_1.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "upper-cartridge-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.8, 2.1, 0.8], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "upper-cartridge", "seamRefs": [], "detachableFragments": ["upper-cartridge"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 3.55, 0.05], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_upper_cartridge_1);
  nodes["upper-cartridge"] = node_upper_cartridge_1;
  const mesh_upper_cartridge_1Geometry = endpoint_upper_cartridge_1
    ? new THREE.CylinderGeometry(endpoint_upper_cartridge_1.endRadius, endpoint_upper_cartridge_1.baseRadius, endpoint_upper_cartridge_1.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_upper_cartridge_1) {
    mesh_upper_cartridge_1Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_upper_cartridge_1 = new THREE.Mesh(
    mesh_upper_cartridge_1Geometry,
    materialMap["chassis-black"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_upper_cartridge_1.name = "Upper cartridge";
  if (endpoint_upper_cartridge_1) {
    mesh_upper_cartridge_1.position.copy(endpoint_upper_cartridge_1.midpoint);
    mesh_upper_cartridge_1.quaternion.copy(endpoint_upper_cartridge_1.quaternion);
  }
  mesh_upper_cartridge_1.castShadow = options.castShadow ?? true;
  mesh_upper_cartridge_1.receiveShadow = options.receiveShadow ?? true;
  mesh_upper_cartridge_1.userData.sculptComponent = {"id": "upper-cartridge", "name": "Upper cartridge", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 3.8, "height": 2.1, "depth": 0.8, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 3.55, 0.05], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "upper-cartridge-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.8, 2.1, 0.8], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "upper-cartridge", "seamRefs": [], "detachableFragments": ["upper-cartridge"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 3.55, 0.05], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "upper-cartridge.edge-chamfer", "kind": "bevel"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_upper_cartridge_1.add(mesh_upper_cartridge_1);
  meshes["upper-cartridge"] = mesh_upper_cartridge_1;
  colliders["upper-cartridge"] = {"type": "box", "offset": [0, 0, 0], "scale": [3.8, 2.1, 0.8], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["upper-cartridge"] ??= [];
  destructionGroups["upper-cartridge"].push(node_upper_cartridge_1);
  const socket_upper_cartridge_upper_cartridge_socket_0 = new THREE.Object3D();
  socket_upper_cartridge_upper_cartridge_socket_0.name = "upper-cartridge-socket";
  socket_upper_cartridge_upper_cartridge_socket_0.position.set(0.0, 0.0, 0.0);
  socket_upper_cartridge_upper_cartridge_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_upper_cartridge_upper_cartridge_socket_0.userData.socket = {"id": "upper-cartridge-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_upper_cartridge_1.add(socket_upper_cartridge_upper_cartridge_socket_0);
  sockets["upper-cartridge:upper-cartridge-socket"] = socket_upper_cartridge_upper_cartridge_socket_0;

  const attachment_energy_core_2 = null;
  const endpoint_energy_core_2 = makeAttachmentEndpoint(attachment_energy_core_2);
  const node_energy_core_2 = new THREE.Group();
  node_energy_core_2.name = "Energy core assembly__pivot";
  node_energy_core_2.scale.set(1, 1, 1);
  if (endpoint_energy_core_2) {
    node_energy_core_2.position.copy(endpoint_energy_core_2.start);
    node_energy_core_2.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_energy_core_2.position.set(0.0, 0.3, 0.95);
    node_energy_core_2.rotation.set(0.0, 0.0, 0.0);
  }
  node_energy_core_2.userData.sculptComponent = {"id": "energy-core", "name": "Energy core assembly", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 2.55, "height": 2.55, "depth": 0.85, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.3, 0.95], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "energy-core-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [2.55, 2.55, 0.85], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "energy-core", "seamRefs": [], "detachableFragments": ["energy-core"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.3, 0.95], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "gunmetal", "materialLayers": ["gunmetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "energy-core.radial-ring-system", "kind": "contour"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(52, 58, 55, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_energy_core_2.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "energy-core-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [2.55, 2.55, 0.85], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "energy-core", "seamRefs": [], "detachableFragments": ["energy-core"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.3, 0.95], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_energy_core_2);
  nodes["energy-core"] = node_energy_core_2;
  const mesh_energy_core_2Geometry = endpoint_energy_core_2
    ? new THREE.CylinderGeometry(endpoint_energy_core_2.endRadius, endpoint_energy_core_2.baseRadius, endpoint_energy_core_2.length, 16, 6)
    : new THREE.SphereGeometry(0.5, 32, 20);
  if (!endpoint_energy_core_2) {
    mesh_energy_core_2Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_energy_core_2 = new THREE.Mesh(
    mesh_energy_core_2Geometry,
    materialMap["gunmetal"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_energy_core_2.name = "Energy core assembly";
  if (endpoint_energy_core_2) {
    mesh_energy_core_2.position.copy(endpoint_energy_core_2.midpoint);
    mesh_energy_core_2.quaternion.copy(endpoint_energy_core_2.quaternion);
  }
  mesh_energy_core_2.castShadow = options.castShadow ?? true;
  mesh_energy_core_2.receiveShadow = options.receiveShadow ?? true;
  mesh_energy_core_2.userData.sculptComponent = {"id": "energy-core", "name": "Energy core assembly", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 2.55, "height": 2.55, "depth": 0.85, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.3, 0.95], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "energy-core-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [2.55, 2.55, 0.85], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "energy-core", "seamRefs": [], "detachableFragments": ["energy-core"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.3, 0.95], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "gunmetal", "materialLayers": ["gunmetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "energy-core.radial-ring-system", "kind": "contour"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(52, 58, 55, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_energy_core_2.add(mesh_energy_core_2);
  meshes["energy-core"] = mesh_energy_core_2;
  colliders["energy-core"] = {"type": "box", "offset": [0, 0, 0], "scale": [2.55, 2.55, 0.85], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["energy-core"] ??= [];
  destructionGroups["energy-core"].push(node_energy_core_2);
  const socket_energy_core_energy_core_socket_0 = new THREE.Object3D();
  socket_energy_core_energy_core_socket_0.name = "energy-core-socket";
  socket_energy_core_energy_core_socket_0.position.set(0.0, 0.0, 0.0);
  socket_energy_core_energy_core_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_energy_core_energy_core_socket_0.userData.socket = {"id": "energy-core-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_energy_core_2.add(socket_energy_core_energy_core_socket_0);
  sockets["energy-core:energy-core-socket"] = socket_energy_core_energy_core_socket_0;

  const attachment_left_module_wing_3 = null;
  const endpoint_left_module_wing_3 = makeAttachmentEndpoint(attachment_left_module_wing_3);
  const node_left_module_wing_3 = new THREE.Group();
  node_left_module_wing_3.name = "Left circuit module__pivot";
  node_left_module_wing_3.scale.set(1, 1, 1);
  if (endpoint_left_module_wing_3) {
    node_left_module_wing_3.position.copy(endpoint_left_module_wing_3.start);
    node_left_module_wing_3.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_left_module_wing_3.position.set(-3.05, 0.25, 0.25);
    node_left_module_wing_3.rotation.set(0.0, 0.0, 0.0);
  }
  node_left_module_wing_3.userData.sculptComponent = {"id": "left-module-wing", "name": "Left circuit module", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 1.15, "height": 2.7, "depth": 0.55, "units": "relative", "confidence": 0.88}, "transform": {"position": [-3.05, 0.25, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "left-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "left-module-wing", "seamRefs": [], "detachableFragments": ["left-module-wing"], "breakImpulse": 2.0, "debrisMaterial": "pcb-green"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [-3.05, 0.25, 0.25], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "pcb-green", "materialLayers": ["pcb-green"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "left-module-wing.pcb-detail", "kind": "linework"}, {"id": "module-wings.orange-brackets", "kind": "ridge"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(23, 58, 42, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_left_module_wing_3.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "left-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "left-module-wing", "seamRefs": [], "detachableFragments": ["left-module-wing"], "breakImpulse": 2.0, "debrisMaterial": "pcb-green"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [-3.05, 0.25, 0.25], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_left_module_wing_3);
  nodes["left-module-wing"] = node_left_module_wing_3;
  const mesh_left_module_wing_3Geometry = endpoint_left_module_wing_3
    ? new THREE.CylinderGeometry(endpoint_left_module_wing_3.endRadius, endpoint_left_module_wing_3.baseRadius, endpoint_left_module_wing_3.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_left_module_wing_3) {
    mesh_left_module_wing_3Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_left_module_wing_3 = new THREE.Mesh(
    mesh_left_module_wing_3Geometry,
    materialMap["pcb-green"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_left_module_wing_3.name = "Left circuit module";
  if (endpoint_left_module_wing_3) {
    mesh_left_module_wing_3.position.copy(endpoint_left_module_wing_3.midpoint);
    mesh_left_module_wing_3.quaternion.copy(endpoint_left_module_wing_3.quaternion);
  }
  mesh_left_module_wing_3.castShadow = options.castShadow ?? true;
  mesh_left_module_wing_3.receiveShadow = options.receiveShadow ?? true;
  mesh_left_module_wing_3.userData.sculptComponent = {"id": "left-module-wing", "name": "Left circuit module", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 1.15, "height": 2.7, "depth": 0.55, "units": "relative", "confidence": 0.88}, "transform": {"position": [-3.05, 0.25, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "left-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "left-module-wing", "seamRefs": [], "detachableFragments": ["left-module-wing"], "breakImpulse": 2.0, "debrisMaterial": "pcb-green"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [-3.05, 0.25, 0.25], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "pcb-green", "materialLayers": ["pcb-green"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "left-module-wing.pcb-detail", "kind": "linework"}, {"id": "module-wings.orange-brackets", "kind": "ridge"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(23, 58, 42, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_left_module_wing_3.add(mesh_left_module_wing_3);
  meshes["left-module-wing"] = mesh_left_module_wing_3;
  colliders["left-module-wing"] = {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["left-module-wing"] ??= [];
  destructionGroups["left-module-wing"].push(node_left_module_wing_3);
  const socket_left_module_wing_left_module_wing_socket_0 = new THREE.Object3D();
  socket_left_module_wing_left_module_wing_socket_0.name = "left-module-wing-socket";
  socket_left_module_wing_left_module_wing_socket_0.position.set(0.0, 0.0, 0.0);
  socket_left_module_wing_left_module_wing_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_left_module_wing_left_module_wing_socket_0.userData.socket = {"id": "left-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_left_module_wing_3.add(socket_left_module_wing_left_module_wing_socket_0);
  sockets["left-module-wing:left-module-wing-socket"] = socket_left_module_wing_left_module_wing_socket_0;

  const attachment_right_module_wing_4 = null;
  const endpoint_right_module_wing_4 = makeAttachmentEndpoint(attachment_right_module_wing_4);
  const node_right_module_wing_4 = new THREE.Group();
  node_right_module_wing_4.name = "Right circuit module__pivot";
  node_right_module_wing_4.scale.set(1, 1, 1);
  if (endpoint_right_module_wing_4) {
    node_right_module_wing_4.position.copy(endpoint_right_module_wing_4.start);
    node_right_module_wing_4.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_right_module_wing_4.position.set(3.05, 0.25, 0.25);
    node_right_module_wing_4.rotation.set(0.0, 0.0, 0.0);
  }
  node_right_module_wing_4.userData.sculptComponent = {"id": "right-module-wing", "name": "Right circuit module", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 1.15, "height": 2.7, "depth": 0.55, "units": "relative", "confidence": 0.88}, "transform": {"position": [3.05, 0.25, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "right-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "right-module-wing", "seamRefs": [], "detachableFragments": ["right-module-wing"], "breakImpulse": 2.0, "debrisMaterial": "pcb-green"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [3.05, 0.25, 0.25], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "pcb-green", "materialLayers": ["pcb-green"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "right-module-wing.pcb-detail", "kind": "linework"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(23, 58, 42, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_right_module_wing_4.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "right-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "right-module-wing", "seamRefs": [], "detachableFragments": ["right-module-wing"], "breakImpulse": 2.0, "debrisMaterial": "pcb-green"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [3.05, 0.25, 0.25], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_right_module_wing_4);
  nodes["right-module-wing"] = node_right_module_wing_4;
  const mesh_right_module_wing_4Geometry = endpoint_right_module_wing_4
    ? new THREE.CylinderGeometry(endpoint_right_module_wing_4.endRadius, endpoint_right_module_wing_4.baseRadius, endpoint_right_module_wing_4.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_right_module_wing_4) {
    mesh_right_module_wing_4Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_right_module_wing_4 = new THREE.Mesh(
    mesh_right_module_wing_4Geometry,
    materialMap["pcb-green"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_right_module_wing_4.name = "Right circuit module";
  if (endpoint_right_module_wing_4) {
    mesh_right_module_wing_4.position.copy(endpoint_right_module_wing_4.midpoint);
    mesh_right_module_wing_4.quaternion.copy(endpoint_right_module_wing_4.quaternion);
  }
  mesh_right_module_wing_4.castShadow = options.castShadow ?? true;
  mesh_right_module_wing_4.receiveShadow = options.receiveShadow ?? true;
  mesh_right_module_wing_4.userData.sculptComponent = {"id": "right-module-wing", "name": "Right circuit module", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 1.15, "height": 2.7, "depth": 0.55, "units": "relative", "confidence": 0.88}, "transform": {"position": [3.05, 0.25, 0.25], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "right-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "right-module-wing", "seamRefs": [], "detachableFragments": ["right-module-wing"], "breakImpulse": 2.0, "debrisMaterial": "pcb-green"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [3.05, 0.25, 0.25], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "pcb-green", "materialLayers": ["pcb-green"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "right-module-wing.pcb-detail", "kind": "linework"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(23, 58, 42, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_right_module_wing_4.add(mesh_right_module_wing_4);
  meshes["right-module-wing"] = mesh_right_module_wing_4;
  colliders["right-module-wing"] = {"type": "box", "offset": [0, 0, 0], "scale": [1.15, 2.7, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["right-module-wing"] ??= [];
  destructionGroups["right-module-wing"].push(node_right_module_wing_4);
  const socket_right_module_wing_right_module_wing_socket_0 = new THREE.Object3D();
  socket_right_module_wing_right_module_wing_socket_0.name = "right-module-wing-socket";
  socket_right_module_wing_right_module_wing_socket_0.position.set(0.0, 0.0, 0.0);
  socket_right_module_wing_right_module_wing_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_right_module_wing_right_module_wing_socket_0.userData.socket = {"id": "right-module-wing-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_right_module_wing_4.add(socket_right_module_wing_right_module_wing_socket_0);
  sockets["right-module-wing:right-module-wing-socket"] = socket_right_module_wing_right_module_wing_socket_0;

  const attachment_control_deck_5 = null;
  const endpoint_control_deck_5 = makeAttachmentEndpoint(attachment_control_deck_5);
  const node_control_deck_5 = new THREE.Group();
  node_control_deck_5.name = "Sloped control deck__pivot";
  node_control_deck_5.scale.set(1, 1, 1);
  if (endpoint_control_deck_5) {
    node_control_deck_5.position.copy(endpoint_control_deck_5.start);
    node_control_deck_5.rotation.set(-0.18, 0.0, 0.0);
  } else {
    node_control_deck_5.position.set(0.0, -3.35, 0.75);
    node_control_deck_5.rotation.set(-0.18, 0.0, 0.0);
  }
  node_control_deck_5.userData.sculptComponent = {"id": "control-deck", "name": "Sloped control deck", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 4.4, "height": 1.65, "depth": 0.62, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, -3.35, 0.75], "rotation": [-0.18, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "control-deck-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 1.65, 0.62], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "control-deck", "seamRefs": [], "detachableFragments": ["control-deck"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, -3.35, 0.75], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "gunmetal", "materialLayers": ["gunmetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "control-deck.interface-bank", "kind": "groove"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(52, 58, 55, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_control_deck_5.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "control-deck-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 1.65, 0.62], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "control-deck", "seamRefs": [], "detachableFragments": ["control-deck"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, -3.35, 0.75], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_control_deck_5);
  nodes["control-deck"] = node_control_deck_5;
  const mesh_control_deck_5Geometry = endpoint_control_deck_5
    ? new THREE.CylinderGeometry(endpoint_control_deck_5.endRadius, endpoint_control_deck_5.baseRadius, endpoint_control_deck_5.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_control_deck_5) {
    mesh_control_deck_5Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_control_deck_5 = new THREE.Mesh(
    mesh_control_deck_5Geometry,
    materialMap["gunmetal"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_control_deck_5.name = "Sloped control deck";
  if (endpoint_control_deck_5) {
    mesh_control_deck_5.position.copy(endpoint_control_deck_5.midpoint);
    mesh_control_deck_5.quaternion.copy(endpoint_control_deck_5.quaternion);
  }
  mesh_control_deck_5.castShadow = options.castShadow ?? true;
  mesh_control_deck_5.receiveShadow = options.receiveShadow ?? true;
  mesh_control_deck_5.userData.sculptComponent = {"id": "control-deck", "name": "Sloped control deck", "level": "macro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 4.4, "height": 1.65, "depth": 0.62, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, -3.35, 0.75], "rotation": [-0.18, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "control-deck-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 1.65, 0.62], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "control-deck", "seamRefs": [], "detachableFragments": ["control-deck"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, -3.35, 0.75], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "gunmetal", "materialLayers": ["gunmetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "control-deck.interface-bank", "kind": "groove"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(52, 58, 55, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_control_deck_5.add(mesh_control_deck_5);
  meshes["control-deck"] = mesh_control_deck_5;
  colliders["control-deck"] = {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 1.65, 0.62], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["control-deck"] ??= [];
  destructionGroups["control-deck"].push(node_control_deck_5);
  const socket_control_deck_control_deck_socket_0 = new THREE.Object3D();
  socket_control_deck_control_deck_socket_0.name = "control-deck-socket";
  socket_control_deck_control_deck_socket_0.position.set(0.0, 0.0, 0.0);
  socket_control_deck_control_deck_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_control_deck_control_deck_socket_0.userData.socket = {"id": "control-deck-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_control_deck_5.add(socket_control_deck_control_deck_socket_0);
  sockets["control-deck:control-deck-socket"] = socket_control_deck_control_deck_socket_0;

  const attachment_base_plinth_6 = null;
  const endpoint_base_plinth_6 = makeAttachmentEndpoint(attachment_base_plinth_6);
  const node_base_plinth_6 = new THREE.Group();
  node_base_plinth_6.name = "Base plinth__pivot";
  node_base_plinth_6.scale.set(1, 1, 1);
  if (endpoint_base_plinth_6) {
    node_base_plinth_6.position.copy(endpoint_base_plinth_6.start);
    node_base_plinth_6.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_base_plinth_6.position.set(0.0, -4.55, 0.1);
    node_base_plinth_6.rotation.set(0.0, 0.0, 0.0);
  }
  node_base_plinth_6.userData.sculptComponent = {"id": "base-plinth", "name": "Base plinth", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 5.7, "height": 1.2, "depth": 1.15, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, -4.55, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-plinth-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [5.7, 1.2, 1.15], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-plinth", "seamRefs": [], "detachableFragments": ["base-plinth"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, -4.55, 0.1], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "base-plinth.connector-bays", "kind": "groove"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_plinth_6.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-plinth-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [5.7, 1.2, 1.15], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-plinth", "seamRefs": [], "detachableFragments": ["base-plinth"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, -4.55, 0.1], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_base_plinth_6);
  nodes["base-plinth"] = node_base_plinth_6;
  const mesh_base_plinth_6Geometry = endpoint_base_plinth_6
    ? new THREE.CylinderGeometry(endpoint_base_plinth_6.endRadius, endpoint_base_plinth_6.baseRadius, endpoint_base_plinth_6.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_base_plinth_6) {
    mesh_base_plinth_6Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_base_plinth_6 = new THREE.Mesh(
    mesh_base_plinth_6Geometry,
    materialMap["chassis-black"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_base_plinth_6.name = "Base plinth";
  if (endpoint_base_plinth_6) {
    mesh_base_plinth_6.position.copy(endpoint_base_plinth_6.midpoint);
    mesh_base_plinth_6.quaternion.copy(endpoint_base_plinth_6.quaternion);
  }
  mesh_base_plinth_6.castShadow = options.castShadow ?? true;
  mesh_base_plinth_6.receiveShadow = options.receiveShadow ?? true;
  mesh_base_plinth_6.userData.sculptComponent = {"id": "base-plinth", "name": "Base plinth", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 5.7, "height": 1.2, "depth": 1.15, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, -4.55, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-plinth-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [5.7, 1.2, 1.15], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-plinth", "seamRefs": [], "detachableFragments": ["base-plinth"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, -4.55, 0.1], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "base-plinth.connector-bays", "kind": "groove"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_plinth_6.add(mesh_base_plinth_6);
  meshes["base-plinth"] = mesh_base_plinth_6;
  colliders["base-plinth"] = {"type": "box", "offset": [0, 0, 0], "scale": [5.7, 1.2, 1.15], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["base-plinth"] ??= [];
  destructionGroups["base-plinth"].push(node_base_plinth_6);
  const socket_base_plinth_base_plinth_socket_0 = new THREE.Object3D();
  socket_base_plinth_base_plinth_socket_0.name = "base-plinth-socket";
  socket_base_plinth_base_plinth_socket_0.position.set(0.0, 0.0, 0.0);
  socket_base_plinth_base_plinth_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_base_plinth_base_plinth_socket_0.userData.socket = {"id": "base-plinth-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_base_plinth_6.add(socket_base_plinth_base_plinth_socket_0);
  sockets["base-plinth:base-plinth-socket"] = socket_base_plinth_base_plinth_socket_0;

  const attachment_cartridge_face_7 = null;
  const endpoint_cartridge_face_7 = makeAttachmentEndpoint(attachment_cartridge_face_7);
  const node_cartridge_face_7 = new THREE.Group();
  node_cartridge_face_7.name = "Cartridge color face__pivot";
  node_cartridge_face_7.scale.set(1, 1, 1);
  if (endpoint_cartridge_face_7) {
    node_cartridge_face_7.position.copy(endpoint_cartridge_face_7.start);
    node_cartridge_face_7.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_cartridge_face_7.position.set(0.0, 0.15000000000000036, 0.45);
    node_cartridge_face_7.rotation.set(0.0, 0.0, 0.0);
  }
  node_cartridge_face_7.userData.sculptComponent = {"id": "cartridge-face", "name": "Cartridge color face", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "upper-cartridge", "attachment": null, "dimensions": {"width": 3.1, "height": 1.35, "depth": 0.12, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.15000000000000036, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "cartridge-face-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.1, 1.35, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "cartridge-face", "seamRefs": [], "detachableFragments": ["cartridge-face"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "upper-cartridge", "parentSocket": "upper-cartridge-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.15000000000000036, 0.45], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_cartridge_face_7.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "cartridge-face-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.1, 1.35, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "cartridge-face", "seamRefs": [], "detachableFragments": ["cartridge-face"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "upper-cartridge", "parentSocket": "upper-cartridge-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.15000000000000036, 0.45], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["upper-cartridge"] ?? root).add(node_cartridge_face_7);
  nodes["cartridge-face"] = node_cartridge_face_7;
  const mesh_cartridge_face_7Geometry = endpoint_cartridge_face_7
    ? new THREE.CylinderGeometry(endpoint_cartridge_face_7.endRadius, endpoint_cartridge_face_7.baseRadius, endpoint_cartridge_face_7.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_cartridge_face_7) {
    mesh_cartridge_face_7Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_cartridge_face_7 = new THREE.Mesh(
    mesh_cartridge_face_7Geometry,
    materialMap["acid-core"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_cartridge_face_7.name = "Cartridge color face";
  if (endpoint_cartridge_face_7) {
    mesh_cartridge_face_7.position.copy(endpoint_cartridge_face_7.midpoint);
    mesh_cartridge_face_7.quaternion.copy(endpoint_cartridge_face_7.quaternion);
  }
  mesh_cartridge_face_7.castShadow = options.castShadow ?? true;
  mesh_cartridge_face_7.receiveShadow = options.receiveShadow ?? true;
  mesh_cartridge_face_7.userData.sculptComponent = {"id": "cartridge-face", "name": "Cartridge color face", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "upper-cartridge", "attachment": null, "dimensions": {"width": 3.1, "height": 1.35, "depth": 0.12, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.15000000000000036, 0.45], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "cartridge-face-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.1, 1.35, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "cartridge-face", "seamRefs": [], "detachableFragments": ["cartridge-face"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "upper-cartridge", "parentSocket": "upper-cartridge-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.15000000000000036, 0.45], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_cartridge_face_7.add(mesh_cartridge_face_7);
  meshes["cartridge-face"] = mesh_cartridge_face_7;
  colliders["cartridge-face"] = {"type": "box", "offset": [0, 0, 0], "scale": [3.1, 1.35, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["cartridge-face"] ??= [];
  destructionGroups["cartridge-face"].push(node_cartridge_face_7);
  const socket_cartridge_face_cartridge_face_socket_0 = new THREE.Object3D();
  socket_cartridge_face_cartridge_face_socket_0.name = "cartridge-face-socket";
  socket_cartridge_face_cartridge_face_socket_0.position.set(0.0, 0.0, 0.0);
  socket_cartridge_face_cartridge_face_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_cartridge_face_cartridge_face_socket_0.userData.socket = {"id": "cartridge-face-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_cartridge_face_7.add(socket_cartridge_face_cartridge_face_socket_0);
  sockets["cartridge-face:cartridge-face-socket"] = socket_cartridge_face_cartridge_face_socket_0;

  const attachment_upper_connector_8 = null;
  const endpoint_upper_connector_8 = makeAttachmentEndpoint(attachment_upper_connector_8);
  const node_upper_connector_8 = new THREE.Group();
  node_upper_connector_8.name = "Upper gold contact rail__pivot";
  node_upper_connector_8.scale.set(1, 1, 1);
  if (endpoint_upper_connector_8) {
    node_upper_connector_8.position.copy(endpoint_upper_connector_8.start);
    node_upper_connector_8.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_upper_connector_8.position.set(0.0, 2.5, 0.55);
    node_upper_connector_8.rotation.set(0.0, 0.0, 0.0);
  }
  node_upper_connector_8.userData.sculptComponent = {"id": "upper-connector", "name": "Upper gold contact rail", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 3.35, "height": 0.32, "depth": 0.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 2.5, 0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "upper-connector-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.35, 0.32, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "upper-connector", "seamRefs": [], "detachableFragments": ["upper-connector"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 2.5, 0.55], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "upper-connector.gold-contact-row", "kind": "linework"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_upper_connector_8.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "upper-connector-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.35, 0.32, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "upper-connector", "seamRefs": [], "detachableFragments": ["upper-connector"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 2.5, 0.55], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_upper_connector_8);
  nodes["upper-connector"] = node_upper_connector_8;
  const mesh_upper_connector_8Geometry = endpoint_upper_connector_8
    ? new THREE.CylinderGeometry(endpoint_upper_connector_8.endRadius, endpoint_upper_connector_8.baseRadius, endpoint_upper_connector_8.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_upper_connector_8) {
    mesh_upper_connector_8Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_upper_connector_8 = new THREE.Mesh(
    mesh_upper_connector_8Geometry,
    materialMap["contact-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_upper_connector_8.name = "Upper gold contact rail";
  if (endpoint_upper_connector_8) {
    mesh_upper_connector_8.position.copy(endpoint_upper_connector_8.midpoint);
    mesh_upper_connector_8.quaternion.copy(endpoint_upper_connector_8.quaternion);
  }
  mesh_upper_connector_8.castShadow = options.castShadow ?? true;
  mesh_upper_connector_8.receiveShadow = options.receiveShadow ?? true;
  mesh_upper_connector_8.userData.sculptComponent = {"id": "upper-connector", "name": "Upper gold contact rail", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 3.35, "height": 0.32, "depth": 0.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 2.5, 0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "upper-connector-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.35, 0.32, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "upper-connector", "seamRefs": [], "detachableFragments": ["upper-connector"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 2.5, 0.55], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "upper-connector.gold-contact-row", "kind": "linework"}], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_upper_connector_8.add(mesh_upper_connector_8);
  meshes["upper-connector"] = mesh_upper_connector_8;
  colliders["upper-connector"] = {"type": "box", "offset": [0, 0, 0], "scale": [3.35, 0.32, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["upper-connector"] ??= [];
  destructionGroups["upper-connector"].push(node_upper_connector_8);
  const socket_upper_connector_upper_connector_socket_0 = new THREE.Object3D();
  socket_upper_connector_upper_connector_socket_0.name = "upper-connector-socket";
  socket_upper_connector_upper_connector_socket_0.position.set(0.0, 0.0, 0.0);
  socket_upper_connector_upper_connector_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_upper_connector_upper_connector_socket_0.userData.socket = {"id": "upper-connector-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_upper_connector_8.add(socket_upper_connector_upper_connector_socket_0);
  sockets["upper-connector:upper-connector-socket"] = socket_upper_connector_upper_connector_socket_0;

  const attachment_core_outer_ring_9 = null;
  const endpoint_core_outer_ring_9 = makeAttachmentEndpoint(attachment_core_outer_ring_9);
  const node_core_outer_ring_9 = new THREE.Group();
  node_core_outer_ring_9.name = "Core outer ring__pivot";
  node_core_outer_ring_9.scale.set(1, 1, 1);
  if (endpoint_core_outer_ring_9) {
    node_core_outer_ring_9.position.copy(endpoint_core_outer_ring_9.start);
    node_core_outer_ring_9.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_outer_ring_9.position.set(0.0, 0.0, 0.47);
    node_core_outer_ring_9.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_outer_ring_9.userData.sculptComponent = {"id": "core-outer-ring", "name": "Core outer ring", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 3.05, "height": 3.05, "depth": 0.32, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.47], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-outer-ring-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.05, 3.05, 0.32], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-outer-ring", "seamRefs": [], "detachableFragments": ["core-outer-ring"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.47], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "gunmetal", "materialLayers": ["gunmetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(52, 58, 55, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_outer_ring_9.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-outer-ring-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.05, 3.05, 0.32], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-outer-ring", "seamRefs": [], "detachableFragments": ["core-outer-ring"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.47], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_outer_ring_9);
  nodes["core-outer-ring"] = node_core_outer_ring_9;
  const mesh_core_outer_ring_9Geometry = endpoint_core_outer_ring_9
    ? new THREE.CylinderGeometry(endpoint_core_outer_ring_9.endRadius, endpoint_core_outer_ring_9.baseRadius, endpoint_core_outer_ring_9.length, 16, 6)
    : new THREE.TorusGeometry(0.45, 0.08, 12, 48);
  if (!endpoint_core_outer_ring_9) {
    mesh_core_outer_ring_9Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_outer_ring_9 = new THREE.Mesh(
    mesh_core_outer_ring_9Geometry,
    materialMap["gunmetal"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_outer_ring_9.name = "Core outer ring";
  if (endpoint_core_outer_ring_9) {
    mesh_core_outer_ring_9.position.copy(endpoint_core_outer_ring_9.midpoint);
    mesh_core_outer_ring_9.quaternion.copy(endpoint_core_outer_ring_9.quaternion);
  }
  mesh_core_outer_ring_9.castShadow = options.castShadow ?? true;
  mesh_core_outer_ring_9.receiveShadow = options.receiveShadow ?? true;
  mesh_core_outer_ring_9.userData.sculptComponent = {"id": "core-outer-ring", "name": "Core outer ring", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 3.05, "height": 3.05, "depth": 0.32, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.47], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-outer-ring-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.05, 3.05, 0.32], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-outer-ring", "seamRefs": [], "detachableFragments": ["core-outer-ring"], "breakImpulse": 2.0, "debrisMaterial": "gunmetal"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.47], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "gunmetal", "materialLayers": ["gunmetal"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(52, 58, 55, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_outer_ring_9.add(mesh_core_outer_ring_9);
  meshes["core-outer-ring"] = mesh_core_outer_ring_9;
  colliders["core-outer-ring"] = {"type": "box", "offset": [0, 0, 0], "scale": [3.05, 3.05, 0.32], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-outer-ring"] ??= [];
  destructionGroups["core-outer-ring"].push(node_core_outer_ring_9);
  const socket_core_outer_ring_core_outer_ring_socket_0 = new THREE.Object3D();
  socket_core_outer_ring_core_outer_ring_socket_0.name = "core-outer-ring-socket";
  socket_core_outer_ring_core_outer_ring_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_outer_ring_core_outer_ring_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_outer_ring_core_outer_ring_socket_0.userData.socket = {"id": "core-outer-ring-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_outer_ring_9.add(socket_core_outer_ring_core_outer_ring_socket_0);
  sockets["core-outer-ring:core-outer-ring-socket"] = socket_core_outer_ring_core_outer_ring_socket_0;

  const attachment_core_lens_10 = null;
  const endpoint_core_lens_10 = makeAttachmentEndpoint(attachment_core_lens_10);
  const node_core_lens_10 = new THREE.Group();
  node_core_lens_10.name = "Core smoked lens__pivot";
  node_core_lens_10.scale.set(1, 1, 1);
  if (endpoint_core_lens_10) {
    node_core_lens_10.position.copy(endpoint_core_lens_10.start);
    node_core_lens_10.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_lens_10.position.set(0.0, 0.0, 0.6000000000000001);
    node_core_lens_10.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_lens_10.userData.sculptComponent = {"id": "core-lens", "name": "Core smoked lens", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 1.85, "height": 1.85, "depth": 0.22, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.6000000000000001], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-lens-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.85, 1.85, 0.22], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-lens", "seamRefs": [], "detachableFragments": ["core-lens"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.6000000000000001], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_lens_10.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-lens-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.85, 1.85, 0.22], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-lens", "seamRefs": [], "detachableFragments": ["core-lens"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.6000000000000001], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_lens_10);
  nodes["core-lens"] = node_core_lens_10;
  const mesh_core_lens_10Geometry = endpoint_core_lens_10
    ? new THREE.CylinderGeometry(endpoint_core_lens_10.endRadius, endpoint_core_lens_10.baseRadius, endpoint_core_lens_10.length, 16, 6)
    : new THREE.SphereGeometry(0.5, 32, 20);
  if (!endpoint_core_lens_10) {
    mesh_core_lens_10Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_lens_10 = new THREE.Mesh(
    mesh_core_lens_10Geometry,
    materialMap["acid-core"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_lens_10.name = "Core smoked lens";
  if (endpoint_core_lens_10) {
    mesh_core_lens_10.position.copy(endpoint_core_lens_10.midpoint);
    mesh_core_lens_10.quaternion.copy(endpoint_core_lens_10.quaternion);
  }
  mesh_core_lens_10.castShadow = options.castShadow ?? true;
  mesh_core_lens_10.receiveShadow = options.receiveShadow ?? true;
  mesh_core_lens_10.userData.sculptComponent = {"id": "core-lens", "name": "Core smoked lens", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 1.85, "height": 1.85, "depth": 0.22, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.6000000000000001], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-lens-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.85, 1.85, 0.22], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-lens", "seamRefs": [], "detachableFragments": ["core-lens"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.6000000000000001], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_lens_10.add(mesh_core_lens_10);
  meshes["core-lens"] = mesh_core_lens_10;
  colliders["core-lens"] = {"type": "box", "offset": [0, 0, 0], "scale": [1.85, 1.85, 0.22], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-lens"] ??= [];
  destructionGroups["core-lens"].push(node_core_lens_10);
  const socket_core_lens_core_lens_socket_0 = new THREE.Object3D();
  socket_core_lens_core_lens_socket_0.name = "core-lens-socket";
  socket_core_lens_core_lens_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_lens_core_lens_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_lens_core_lens_socket_0.userData.socket = {"id": "core-lens-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_lens_10.add(socket_core_lens_core_lens_socket_0);
  sockets["core-lens:core-lens-socket"] = socket_core_lens_core_lens_socket_0;

  const attachment_core_crystal_11 = null;
  const endpoint_core_crystal_11 = makeAttachmentEndpoint(attachment_core_crystal_11);
  const node_core_crystal_11 = new THREE.Group();
  node_core_crystal_11.name = "Core faceted emitter__pivot";
  node_core_crystal_11.scale.set(1, 1, 1);
  if (endpoint_core_crystal_11) {
    node_core_crystal_11.position.copy(endpoint_core_crystal_11.start);
    node_core_crystal_11.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_crystal_11.position.set(0.0, 0.0, 0.77);
    node_core_crystal_11.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_crystal_11.userData.sculptComponent = {"id": "core-crystal", "name": "Core faceted emitter", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.75, "height": 0.75, "depth": 0.48, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.77], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-crystal-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.75, 0.75, 0.48], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-crystal", "seamRefs": [], "detachableFragments": ["core-crystal"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.77], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_crystal_11.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-crystal-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.75, 0.75, 0.48], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-crystal", "seamRefs": [], "detachableFragments": ["core-crystal"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.77], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_crystal_11);
  nodes["core-crystal"] = node_core_crystal_11;
  const mesh_core_crystal_11Geometry = endpoint_core_crystal_11
    ? new THREE.CylinderGeometry(endpoint_core_crystal_11.endRadius, endpoint_core_crystal_11.baseRadius, endpoint_core_crystal_11.length, 16, 6)
    : new THREE.SphereGeometry(0.5, 32, 20);
  if (!endpoint_core_crystal_11) {
    mesh_core_crystal_11Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_crystal_11 = new THREE.Mesh(
    mesh_core_crystal_11Geometry,
    materialMap["acid-core"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_crystal_11.name = "Core faceted emitter";
  if (endpoint_core_crystal_11) {
    mesh_core_crystal_11.position.copy(endpoint_core_crystal_11.midpoint);
    mesh_core_crystal_11.quaternion.copy(endpoint_core_crystal_11.quaternion);
  }
  mesh_core_crystal_11.castShadow = options.castShadow ?? true;
  mesh_core_crystal_11.receiveShadow = options.receiveShadow ?? true;
  mesh_core_crystal_11.userData.sculptComponent = {"id": "core-crystal", "name": "Core faceted emitter", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.75, "height": 0.75, "depth": 0.48, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.77], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-crystal-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.75, 0.75, 0.48], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-crystal", "seamRefs": [], "detachableFragments": ["core-crystal"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.77], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_crystal_11.add(mesh_core_crystal_11);
  meshes["core-crystal"] = mesh_core_crystal_11;
  colliders["core-crystal"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.75, 0.75, 0.48], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-crystal"] ??= [];
  destructionGroups["core-crystal"].push(node_core_crystal_11);
  const socket_core_crystal_core_crystal_socket_0 = new THREE.Object3D();
  socket_core_crystal_core_crystal_socket_0.name = "core-crystal-socket";
  socket_core_crystal_core_crystal_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_crystal_core_crystal_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_crystal_core_crystal_socket_0.userData.socket = {"id": "core-crystal-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_crystal_11.add(socket_core_crystal_core_crystal_socket_0);
  sockets["core-crystal:core-crystal-socket"] = socket_core_crystal_core_crystal_socket_0;

  const attachment_left_retainer_12 = null;
  const endpoint_left_retainer_12 = makeAttachmentEndpoint(attachment_left_retainer_12);
  const node_left_retainer_12 = new THREE.Group();
  node_left_retainer_12.name = "Left orange retainer__pivot";
  node_left_retainer_12.scale.set(1, 1, 1);
  if (endpoint_left_retainer_12) {
    node_left_retainer_12.position.copy(endpoint_left_retainer_12.start);
    node_left_retainer_12.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_left_retainer_12.position.set(0.6999999999999997, 0.0, 0.5);
    node_left_retainer_12.rotation.set(0.0, 0.0, 0.0);
  }
  node_left_retainer_12.userData.sculptComponent = {"id": "left-retainer", "name": "Left orange retainer", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "left-module-wing", "attachment": null, "dimensions": {"width": 0.28, "height": 2.25, "depth": 0.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.6999999999999997, 0.0, 0.5], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "left-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "left-retainer", "seamRefs": [], "detachableFragments": ["left-retainer"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "left-module-wing", "parentSocket": "left-module-wing-socket", "localStart": [0, 0, 0], "localEnd": [0.6999999999999997, 0.0, 0.5], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_left_retainer_12.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "left-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "left-retainer", "seamRefs": [], "detachableFragments": ["left-retainer"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "left-module-wing", "parentSocket": "left-module-wing-socket", "localStart": [0, 0, 0], "localEnd": [0.6999999999999997, 0.0, 0.5], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["left-module-wing"] ?? root).add(node_left_retainer_12);
  nodes["left-retainer"] = node_left_retainer_12;
  const mesh_left_retainer_12Geometry = endpoint_left_retainer_12
    ? new THREE.CylinderGeometry(endpoint_left_retainer_12.endRadius, endpoint_left_retainer_12.baseRadius, endpoint_left_retainer_12.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_left_retainer_12) {
    mesh_left_retainer_12Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_left_retainer_12 = new THREE.Mesh(
    mesh_left_retainer_12Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_left_retainer_12.name = "Left orange retainer";
  if (endpoint_left_retainer_12) {
    mesh_left_retainer_12.position.copy(endpoint_left_retainer_12.midpoint);
    mesh_left_retainer_12.quaternion.copy(endpoint_left_retainer_12.quaternion);
  }
  mesh_left_retainer_12.castShadow = options.castShadow ?? true;
  mesh_left_retainer_12.receiveShadow = options.receiveShadow ?? true;
  mesh_left_retainer_12.userData.sculptComponent = {"id": "left-retainer", "name": "Left orange retainer", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "left-module-wing", "attachment": null, "dimensions": {"width": 0.28, "height": 2.25, "depth": 0.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.6999999999999997, 0.0, 0.5], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "left-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "left-retainer", "seamRefs": [], "detachableFragments": ["left-retainer"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "left-module-wing", "parentSocket": "left-module-wing-socket", "localStart": [0, 0, 0], "localEnd": [0.6999999999999997, 0.0, 0.5], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_left_retainer_12.add(mesh_left_retainer_12);
  meshes["left-retainer"] = mesh_left_retainer_12;
  colliders["left-retainer"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["left-retainer"] ??= [];
  destructionGroups["left-retainer"].push(node_left_retainer_12);
  const socket_left_retainer_left_retainer_socket_0 = new THREE.Object3D();
  socket_left_retainer_left_retainer_socket_0.name = "left-retainer-socket";
  socket_left_retainer_left_retainer_socket_0.position.set(0.0, 0.0, 0.0);
  socket_left_retainer_left_retainer_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_left_retainer_left_retainer_socket_0.userData.socket = {"id": "left-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_left_retainer_12.add(socket_left_retainer_left_retainer_socket_0);
  sockets["left-retainer:left-retainer-socket"] = socket_left_retainer_left_retainer_socket_0;

  const attachment_right_retainer_13 = null;
  const endpoint_right_retainer_13 = makeAttachmentEndpoint(attachment_right_retainer_13);
  const node_right_retainer_13 = new THREE.Group();
  node_right_retainer_13.name = "Right orange retainer__pivot";
  node_right_retainer_13.scale.set(1, 1, 1);
  if (endpoint_right_retainer_13) {
    node_right_retainer_13.position.copy(endpoint_right_retainer_13.start);
    node_right_retainer_13.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_right_retainer_13.position.set(-0.6999999999999997, 0.0, 0.5);
    node_right_retainer_13.rotation.set(0.0, 0.0, 0.0);
  }
  node_right_retainer_13.userData.sculptComponent = {"id": "right-retainer", "name": "Right orange retainer", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "right-module-wing", "attachment": null, "dimensions": {"width": 0.28, "height": 2.25, "depth": 0.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.6999999999999997, 0.0, 0.5], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "right-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "right-retainer", "seamRefs": [], "detachableFragments": ["right-retainer"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "right-module-wing", "parentSocket": "right-module-wing-socket", "localStart": [0, 0, 0], "localEnd": [-0.6999999999999997, 0.0, 0.5], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_right_retainer_13.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "right-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "right-retainer", "seamRefs": [], "detachableFragments": ["right-retainer"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "right-module-wing", "parentSocket": "right-module-wing-socket", "localStart": [0, 0, 0], "localEnd": [-0.6999999999999997, 0.0, 0.5], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["right-module-wing"] ?? root).add(node_right_retainer_13);
  nodes["right-retainer"] = node_right_retainer_13;
  const mesh_right_retainer_13Geometry = endpoint_right_retainer_13
    ? new THREE.CylinderGeometry(endpoint_right_retainer_13.endRadius, endpoint_right_retainer_13.baseRadius, endpoint_right_retainer_13.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_right_retainer_13) {
    mesh_right_retainer_13Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_right_retainer_13 = new THREE.Mesh(
    mesh_right_retainer_13Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_right_retainer_13.name = "Right orange retainer";
  if (endpoint_right_retainer_13) {
    mesh_right_retainer_13.position.copy(endpoint_right_retainer_13.midpoint);
    mesh_right_retainer_13.quaternion.copy(endpoint_right_retainer_13.quaternion);
  }
  mesh_right_retainer_13.castShadow = options.castShadow ?? true;
  mesh_right_retainer_13.receiveShadow = options.receiveShadow ?? true;
  mesh_right_retainer_13.userData.sculptComponent = {"id": "right-retainer", "name": "Right orange retainer", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "right-module-wing", "attachment": null, "dimensions": {"width": 0.28, "height": 2.25, "depth": 0.3, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.6999999999999997, 0.0, 0.5], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "right-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "right-retainer", "seamRefs": [], "detachableFragments": ["right-retainer"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "right-module-wing", "parentSocket": "right-module-wing-socket", "localStart": [0, 0, 0], "localEnd": [-0.6999999999999997, 0.0, 0.5], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_right_retainer_13.add(mesh_right_retainer_13);
  meshes["right-retainer"] = mesh_right_retainer_13;
  colliders["right-retainer"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.28, 2.25, 0.3], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["right-retainer"] ??= [];
  destructionGroups["right-retainer"].push(node_right_retainer_13);
  const socket_right_retainer_right_retainer_socket_0 = new THREE.Object3D();
  socket_right_retainer_right_retainer_socket_0.name = "right-retainer-socket";
  socket_right_retainer_right_retainer_socket_0.position.set(0.0, 0.0, 0.0);
  socket_right_retainer_right_retainer_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_right_retainer_right_retainer_socket_0.userData.socket = {"id": "right-retainer-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_right_retainer_13.add(socket_right_retainer_right_retainer_socket_0);
  sockets["right-retainer:right-retainer-socket"] = socket_right_retainer_right_retainer_socket_0;

  const attachment_control_screen_14 = null;
  const endpoint_control_screen_14 = makeAttachmentEndpoint(attachment_control_screen_14);
  const node_control_screen_14 = new THREE.Group();
  node_control_screen_14.name = "Control display__pivot";
  node_control_screen_14.scale.set(1, 1, 1);
  if (endpoint_control_screen_14) {
    node_control_screen_14.position.copy(endpoint_control_screen_14.start);
    node_control_screen_14.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_control_screen_14.position.set(0.0, 0.10000000000000009, 0.4099999999999999);
    node_control_screen_14.rotation.set(0.0, 0.0, 0.0);
  }
  node_control_screen_14.userData.sculptComponent = {"id": "control-screen", "name": "Control display", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "control-deck", "attachment": null, "dimensions": {"width": 1.65, "height": 0.72, "depth": 0.12, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.10000000000000009, 0.4099999999999999], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "control-screen-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.65, 0.72, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "control-screen", "seamRefs": [], "detachableFragments": ["control-screen"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.10000000000000009, 0.4099999999999999], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_control_screen_14.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "control-screen-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.65, 0.72, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "control-screen", "seamRefs": [], "detachableFragments": ["control-screen"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.10000000000000009, 0.4099999999999999], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["control-deck"] ?? root).add(node_control_screen_14);
  nodes["control-screen"] = node_control_screen_14;
  const mesh_control_screen_14Geometry = endpoint_control_screen_14
    ? new THREE.CylinderGeometry(endpoint_control_screen_14.endRadius, endpoint_control_screen_14.baseRadius, endpoint_control_screen_14.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_control_screen_14) {
    mesh_control_screen_14Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_control_screen_14 = new THREE.Mesh(
    mesh_control_screen_14Geometry,
    materialMap["acid-core"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_control_screen_14.name = "Control display";
  if (endpoint_control_screen_14) {
    mesh_control_screen_14.position.copy(endpoint_control_screen_14.midpoint);
    mesh_control_screen_14.quaternion.copy(endpoint_control_screen_14.quaternion);
  }
  mesh_control_screen_14.castShadow = options.castShadow ?? true;
  mesh_control_screen_14.receiveShadow = options.receiveShadow ?? true;
  mesh_control_screen_14.userData.sculptComponent = {"id": "control-screen", "name": "Control display", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "control-deck", "attachment": null, "dimensions": {"width": 1.65, "height": 0.72, "depth": 0.12, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.10000000000000009, 0.4099999999999999], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "control-screen-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.65, 0.72, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "control-screen", "seamRefs": [], "detachableFragments": ["control-screen"], "breakImpulse": 2.0, "debrisMaterial": "acid-core"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.10000000000000009, 0.4099999999999999], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "acid-core", "materialLayers": ["acid-core"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(200, 255, 36, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "glass", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_control_screen_14.add(mesh_control_screen_14);
  meshes["control-screen"] = mesh_control_screen_14;
  colliders["control-screen"] = {"type": "box", "offset": [0, 0, 0], "scale": [1.65, 0.72, 0.12], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["control-screen"] ??= [];
  destructionGroups["control-screen"].push(node_control_screen_14);
  const socket_control_screen_control_screen_socket_0 = new THREE.Object3D();
  socket_control_screen_control_screen_socket_0.name = "control-screen-socket";
  socket_control_screen_control_screen_socket_0.position.set(0.0, 0.0, 0.0);
  socket_control_screen_control_screen_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_control_screen_control_screen_socket_0.userData.socket = {"id": "control-screen-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_control_screen_14.add(socket_control_screen_control_screen_socket_0);
  sockets["control-screen:control-screen-socket"] = socket_control_screen_control_screen_socket_0;

  const attachment_slider_bank_15 = null;
  const endpoint_slider_bank_15 = makeAttachmentEndpoint(attachment_slider_bank_15);
  const node_slider_bank_15 = new THREE.Group();
  node_slider_bank_15.name = "Control slider bank__pivot";
  node_slider_bank_15.scale.set(1, 1, 1);
  if (endpoint_slider_bank_15) {
    node_slider_bank_15.position.copy(endpoint_slider_bank_15.start);
    node_slider_bank_15.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_slider_bank_15.position.set(1.45, 0.10000000000000009, 0.41999999999999993);
    node_slider_bank_15.rotation.set(0.0, 0.0, 0.0);
  }
  node_slider_bank_15.userData.sculptComponent = {"id": "slider-bank", "name": "Control slider bank", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "control-deck", "attachment": null, "dimensions": {"width": 1.2, "height": 0.72, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [1.45, 0.10000000000000009, 0.41999999999999993], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "slider-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.2, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "slider-bank", "seamRefs": [], "detachableFragments": ["slider-bank"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [1.45, 0.10000000000000009, 0.41999999999999993], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_slider_bank_15.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "slider-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.2, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "slider-bank", "seamRefs": [], "detachableFragments": ["slider-bank"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [1.45, 0.10000000000000009, 0.41999999999999993], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["control-deck"] ?? root).add(node_slider_bank_15);
  nodes["slider-bank"] = node_slider_bank_15;
  const mesh_slider_bank_15Geometry = endpoint_slider_bank_15
    ? new THREE.CylinderGeometry(endpoint_slider_bank_15.endRadius, endpoint_slider_bank_15.baseRadius, endpoint_slider_bank_15.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_slider_bank_15) {
    mesh_slider_bank_15Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_slider_bank_15 = new THREE.Mesh(
    mesh_slider_bank_15Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_slider_bank_15.name = "Control slider bank";
  if (endpoint_slider_bank_15) {
    mesh_slider_bank_15.position.copy(endpoint_slider_bank_15.midpoint);
    mesh_slider_bank_15.quaternion.copy(endpoint_slider_bank_15.quaternion);
  }
  mesh_slider_bank_15.castShadow = options.castShadow ?? true;
  mesh_slider_bank_15.receiveShadow = options.receiveShadow ?? true;
  mesh_slider_bank_15.userData.sculptComponent = {"id": "slider-bank", "name": "Control slider bank", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "control-deck", "attachment": null, "dimensions": {"width": 1.2, "height": 0.72, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [1.45, 0.10000000000000009, 0.41999999999999993], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "slider-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1.2, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "slider-bank", "seamRefs": [], "detachableFragments": ["slider-bank"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [1.45, 0.10000000000000009, 0.41999999999999993], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_slider_bank_15.add(mesh_slider_bank_15);
  meshes["slider-bank"] = mesh_slider_bank_15;
  colliders["slider-bank"] = {"type": "box", "offset": [0, 0, 0], "scale": [1.2, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["slider-bank"] ??= [];
  destructionGroups["slider-bank"].push(node_slider_bank_15);
  const socket_slider_bank_slider_bank_socket_0 = new THREE.Object3D();
  socket_slider_bank_slider_bank_socket_0.name = "slider-bank-socket";
  socket_slider_bank_slider_bank_socket_0.position.set(0.0, 0.0, 0.0);
  socket_slider_bank_slider_bank_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_slider_bank_slider_bank_socket_0.userData.socket = {"id": "slider-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_slider_bank_15.add(socket_slider_bank_slider_bank_socket_0);
  sockets["slider-bank:slider-bank-socket"] = socket_slider_bank_slider_bank_socket_0;

  const attachment_button_bank_16 = null;
  const endpoint_button_bank_16 = makeAttachmentEndpoint(attachment_button_bank_16);
  const node_button_bank_16 = new THREE.Group();
  node_button_bank_16.name = "Control button bank__pivot";
  node_button_bank_16.scale.set(1, 1, 1);
  if (endpoint_button_bank_16) {
    node_button_bank_16.position.copy(endpoint_button_bank_16.start);
    node_button_bank_16.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_button_bank_16.position.set(-1.45, 0.10000000000000009, 0.41999999999999993);
    node_button_bank_16.rotation.set(0.0, 0.0, 0.0);
  }
  node_button_bank_16.userData.sculptComponent = {"id": "button-bank", "name": "Control button bank", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "control-deck", "attachment": null, "dimensions": {"width": 0.72, "height": 0.72, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-1.45, 0.10000000000000009, 0.41999999999999993], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "button-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "button-bank", "seamRefs": [], "detachableFragments": ["button-bank"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [-1.45, 0.10000000000000009, 0.41999999999999993], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_button_bank_16.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "button-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "button-bank", "seamRefs": [], "detachableFragments": ["button-bank"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [-1.45, 0.10000000000000009, 0.41999999999999993], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["control-deck"] ?? root).add(node_button_bank_16);
  nodes["button-bank"] = node_button_bank_16;
  const mesh_button_bank_16Geometry = endpoint_button_bank_16
    ? new THREE.CylinderGeometry(endpoint_button_bank_16.endRadius, endpoint_button_bank_16.baseRadius, endpoint_button_bank_16.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_button_bank_16) {
    mesh_button_bank_16Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_button_bank_16 = new THREE.Mesh(
    mesh_button_bank_16Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_button_bank_16.name = "Control button bank";
  if (endpoint_button_bank_16) {
    mesh_button_bank_16.position.copy(endpoint_button_bank_16.midpoint);
    mesh_button_bank_16.quaternion.copy(endpoint_button_bank_16.quaternion);
  }
  mesh_button_bank_16.castShadow = options.castShadow ?? true;
  mesh_button_bank_16.receiveShadow = options.receiveShadow ?? true;
  mesh_button_bank_16.userData.sculptComponent = {"id": "button-bank", "name": "Control button bank", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "control-deck", "attachment": null, "dimensions": {"width": 0.72, "height": 0.72, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-1.45, 0.10000000000000009, 0.41999999999999993], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "button-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "button-bank", "seamRefs": [], "detachableFragments": ["button-bank"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "control-deck", "parentSocket": "control-deck-socket", "localStart": [0, 0, 0], "localEnd": [-1.45, 0.10000000000000009, 0.41999999999999993], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_button_bank_16.add(mesh_button_bank_16);
  meshes["button-bank"] = mesh_button_bank_16;
  colliders["button-bank"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.72, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["button-bank"] ??= [];
  destructionGroups["button-bank"].push(node_button_bank_16);
  const socket_button_bank_button_bank_socket_0 = new THREE.Object3D();
  socket_button_bank_button_bank_socket_0.name = "button-bank-socket";
  socket_button_bank_button_bank_socket_0.position.set(0.0, 0.0, 0.0);
  socket_button_bank_button_bank_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_button_bank_button_bank_socket_0.userData.socket = {"id": "button-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_button_bank_16.add(socket_button_bank_button_bank_socket_0);
  sockets["button-bank:button-bank-socket"] = socket_button_bank_button_bank_socket_0;

  const attachment_connector_bank_17 = null;
  const endpoint_connector_bank_17 = makeAttachmentEndpoint(attachment_connector_bank_17);
  const node_connector_bank_17 = new THREE.Group();
  node_connector_bank_17.name = "Triple contact bank__pivot";
  node_connector_bank_17.scale.set(1, 1, 1);
  if (endpoint_connector_bank_17) {
    node_connector_bank_17.position.copy(endpoint_connector_bank_17.start);
    node_connector_bank_17.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_connector_bank_17.position.set(0.0, 0.0, 0.62);
    node_connector_bank_17.rotation.set(0.0, 0.0, 0.0);
  }
  node_connector_bank_17.userData.sculptComponent = {"id": "connector-bank", "name": "Triple contact bank", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 3.15, "height": 0.52, "depth": 0.2, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.62], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "connector-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.15, 0.52, 0.2], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "connector-bank", "seamRefs": [], "detachableFragments": ["connector-bank"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.62], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_connector_bank_17.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "connector-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.15, 0.52, 0.2], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "connector-bank", "seamRefs": [], "detachableFragments": ["connector-bank"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.62], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["base-plinth"] ?? root).add(node_connector_bank_17);
  nodes["connector-bank"] = node_connector_bank_17;
  const mesh_connector_bank_17Geometry = endpoint_connector_bank_17
    ? new THREE.CylinderGeometry(endpoint_connector_bank_17.endRadius, endpoint_connector_bank_17.baseRadius, endpoint_connector_bank_17.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_connector_bank_17) {
    mesh_connector_bank_17Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_connector_bank_17 = new THREE.Mesh(
    mesh_connector_bank_17Geometry,
    materialMap["contact-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_connector_bank_17.name = "Triple contact bank";
  if (endpoint_connector_bank_17) {
    mesh_connector_bank_17.position.copy(endpoint_connector_bank_17.midpoint);
    mesh_connector_bank_17.quaternion.copy(endpoint_connector_bank_17.quaternion);
  }
  mesh_connector_bank_17.castShadow = options.castShadow ?? true;
  mesh_connector_bank_17.receiveShadow = options.receiveShadow ?? true;
  mesh_connector_bank_17.userData.sculptComponent = {"id": "connector-bank", "name": "Triple contact bank", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 3.15, "height": 0.52, "depth": 0.2, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0.0, 0.62], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "connector-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [3.15, 0.52, 0.2], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "connector-bank", "seamRefs": [], "detachableFragments": ["connector-bank"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.0, 0.62], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_connector_bank_17.add(mesh_connector_bank_17);
  meshes["connector-bank"] = mesh_connector_bank_17;
  colliders["connector-bank"] = {"type": "box", "offset": [0, 0, 0], "scale": [3.15, 0.52, 0.2], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["connector-bank"] ??= [];
  destructionGroups["connector-bank"].push(node_connector_bank_17);
  const socket_connector_bank_connector_bank_socket_0 = new THREE.Object3D();
  socket_connector_bank_connector_bank_socket_0.name = "connector-bank-socket";
  socket_connector_bank_connector_bank_socket_0.position.set(0.0, 0.0, 0.0);
  socket_connector_bank_connector_bank_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_connector_bank_connector_bank_socket_0.userData.socket = {"id": "connector-bank-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_connector_bank_17.add(socket_connector_bank_connector_bank_socket_0);
  sockets["connector-bank:connector-bank-socket"] = socket_connector_bank_connector_bank_socket_0;

  const attachment_rear_shell_18 = null;
  const endpoint_rear_shell_18 = makeAttachmentEndpoint(attachment_rear_shell_18);
  const node_rear_shell_18 = new THREE.Group();
  node_rear_shell_18.name = "Inferred rear shell__pivot";
  node_rear_shell_18.scale.set(1, 1, 1);
  if (endpoint_rear_shell_18) {
    node_rear_shell_18.position.copy(endpoint_rear_shell_18.start);
    node_rear_shell_18.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_rear_shell_18.position.set(0.0, 0.0, -0.9);
    node_rear_shell_18.rotation.set(0.0, 0.0, 0.0);
  }
  node_rear_shell_18.userData.sculptComponent = {"id": "rear-shell", "name": "Inferred rear shell", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.7, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 4.4, "height": 5.2, "depth": 0.55, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0, -0.9], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "rear-shell-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 5.2, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "rear-shell", "seamRefs": [], "detachableFragments": ["rear-shell"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0, -0.9], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_rear_shell_18.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "rear-shell-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 5.2, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "rear-shell", "seamRefs": [], "detachableFragments": ["rear-shell"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0, -0.9], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["root"] ?? root).add(node_rear_shell_18);
  nodes["rear-shell"] = node_rear_shell_18;
  const mesh_rear_shell_18Geometry = endpoint_rear_shell_18
    ? new THREE.CylinderGeometry(endpoint_rear_shell_18.endRadius, endpoint_rear_shell_18.baseRadius, endpoint_rear_shell_18.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_rear_shell_18) {
    mesh_rear_shell_18Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_rear_shell_18 = new THREE.Mesh(
    mesh_rear_shell_18Geometry,
    materialMap["chassis-black"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rear_shell_18.name = "Inferred rear shell";
  if (endpoint_rear_shell_18) {
    mesh_rear_shell_18.position.copy(endpoint_rear_shell_18.midpoint);
    mesh_rear_shell_18.quaternion.copy(endpoint_rear_shell_18.quaternion);
  }
  mesh_rear_shell_18.castShadow = options.castShadow ?? true;
  mesh_rear_shell_18.receiveShadow = options.receiveShadow ?? true;
  mesh_rear_shell_18.userData.sculptComponent = {"id": "rear-shell", "name": "Inferred rear shell", "level": "meso", "role": "part", "importance": 0.85, "confidence": 0.7, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "root", "attachment": null, "dimensions": {"width": 4.4, "height": 5.2, "depth": 0.55, "units": "relative", "confidence": 0.88}, "transform": {"position": [0, 0, -0.9], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "rear-shell-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 5.2, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "rear-shell", "seamRefs": [], "detachableFragments": ["rear-shell"], "breakImpulse": 2.0, "debrisMaterial": "chassis-black"}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0, -0.9], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "chassis-black", "materialLayers": ["chassis-black"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(17, 21, 19, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_rear_shell_18.add(mesh_rear_shell_18);
  meshes["rear-shell"] = mesh_rear_shell_18;
  colliders["rear-shell"] = {"type": "box", "offset": [0, 0, 0], "scale": [4.4, 5.2, 0.55], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["rear-shell"] ??= [];
  destructionGroups["rear-shell"].push(node_rear_shell_18);
  const socket_rear_shell_rear_shell_socket_0 = new THREE.Object3D();
  socket_rear_shell_rear_shell_socket_0.name = "rear-shell-socket";
  socket_rear_shell_rear_shell_socket_0.position.set(0.0, 0.0, 0.0);
  socket_rear_shell_rear_shell_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_rear_shell_rear_shell_socket_0.userData.socket = {"id": "rear-shell-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_rear_shell_18.add(socket_rear_shell_rear_shell_socket_0);
  sockets["rear-shell:rear-shell-socket"] = socket_rear_shell_rear_shell_socket_0;

  const attachment_core_clamp_1_19 = null;
  const endpoint_core_clamp_1_19 = makeAttachmentEndpoint(attachment_core_clamp_1_19);
  const node_core_clamp_1_19 = new THREE.Group();
  node_core_clamp_1_19.name = "Radial core clamp 1__pivot";
  node_core_clamp_1_19.scale.set(1, 1, 1);
  if (endpoint_core_clamp_1_19) {
    node_core_clamp_1_19.position.copy(endpoint_core_clamp_1_19.start);
    node_core_clamp_1_19.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_clamp_1_19.position.set(1.27, 0.0, 0.73);
    node_core_clamp_1_19.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_clamp_1_19.userData.sculptComponent = {"id": "core-clamp-1", "name": "Radial core clamp 1", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [1.27, 0.0, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-1", "seamRefs": [], "detachableFragments": ["core-clamp-1"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [1.27, 0.0, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_1_19.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-1", "seamRefs": [], "detachableFragments": ["core-clamp-1"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [1.27, 0.0, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_clamp_1_19);
  nodes["core-clamp-1"] = node_core_clamp_1_19;
  const mesh_core_clamp_1_19Geometry = endpoint_core_clamp_1_19
    ? new THREE.CylinderGeometry(endpoint_core_clamp_1_19.endRadius, endpoint_core_clamp_1_19.baseRadius, endpoint_core_clamp_1_19.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_core_clamp_1_19) {
    mesh_core_clamp_1_19Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_clamp_1_19 = new THREE.Mesh(
    mesh_core_clamp_1_19Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_clamp_1_19.name = "Radial core clamp 1";
  if (endpoint_core_clamp_1_19) {
    mesh_core_clamp_1_19.position.copy(endpoint_core_clamp_1_19.midpoint);
    mesh_core_clamp_1_19.quaternion.copy(endpoint_core_clamp_1_19.quaternion);
  }
  mesh_core_clamp_1_19.castShadow = options.castShadow ?? true;
  mesh_core_clamp_1_19.receiveShadow = options.receiveShadow ?? true;
  mesh_core_clamp_1_19.userData.sculptComponent = {"id": "core-clamp-1", "name": "Radial core clamp 1", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [1.27, 0.0, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-1", "seamRefs": [], "detachableFragments": ["core-clamp-1"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [1.27, 0.0, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_1_19.add(mesh_core_clamp_1_19);
  meshes["core-clamp-1"] = mesh_core_clamp_1_19;
  colliders["core-clamp-1"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-clamp-1"] ??= [];
  destructionGroups["core-clamp-1"].push(node_core_clamp_1_19);
  const socket_core_clamp_1_core_clamp_1_socket_0 = new THREE.Object3D();
  socket_core_clamp_1_core_clamp_1_socket_0.name = "core-clamp-1-socket";
  socket_core_clamp_1_core_clamp_1_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_clamp_1_core_clamp_1_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_clamp_1_core_clamp_1_socket_0.userData.socket = {"id": "core-clamp-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_clamp_1_19.add(socket_core_clamp_1_core_clamp_1_socket_0);
  sockets["core-clamp-1:core-clamp-1-socket"] = socket_core_clamp_1_core_clamp_1_socket_0;

  const attachment_core_clamp_2_20 = null;
  const endpoint_core_clamp_2_20 = makeAttachmentEndpoint(attachment_core_clamp_2_20);
  const node_core_clamp_2_20 = new THREE.Group();
  node_core_clamp_2_20.name = "Radial core clamp 2__pivot";
  node_core_clamp_2_20.scale.set(1, 1, 1);
  if (endpoint_core_clamp_2_20) {
    node_core_clamp_2_20.position.copy(endpoint_core_clamp_2_20.start);
    node_core_clamp_2_20.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_clamp_2_20.position.set(0.6349973066761331, 1.0998538177930999, 0.73);
    node_core_clamp_2_20.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_clamp_2_20.userData.sculptComponent = {"id": "core-clamp-2", "name": "Radial core clamp 2", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.6349973066761331, 1.0998538177930999, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-2", "seamRefs": [], "detachableFragments": ["core-clamp-2"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0.6349973066761331, 1.0998538177930999, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_2_20.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-2", "seamRefs": [], "detachableFragments": ["core-clamp-2"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0.6349973066761331, 1.0998538177930999, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_clamp_2_20);
  nodes["core-clamp-2"] = node_core_clamp_2_20;
  const mesh_core_clamp_2_20Geometry = endpoint_core_clamp_2_20
    ? new THREE.CylinderGeometry(endpoint_core_clamp_2_20.endRadius, endpoint_core_clamp_2_20.baseRadius, endpoint_core_clamp_2_20.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_core_clamp_2_20) {
    mesh_core_clamp_2_20Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_clamp_2_20 = new THREE.Mesh(
    mesh_core_clamp_2_20Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_clamp_2_20.name = "Radial core clamp 2";
  if (endpoint_core_clamp_2_20) {
    mesh_core_clamp_2_20.position.copy(endpoint_core_clamp_2_20.midpoint);
    mesh_core_clamp_2_20.quaternion.copy(endpoint_core_clamp_2_20.quaternion);
  }
  mesh_core_clamp_2_20.castShadow = options.castShadow ?? true;
  mesh_core_clamp_2_20.receiveShadow = options.receiveShadow ?? true;
  mesh_core_clamp_2_20.userData.sculptComponent = {"id": "core-clamp-2", "name": "Radial core clamp 2", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.6349973066761331, 1.0998538177930999, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-2", "seamRefs": [], "detachableFragments": ["core-clamp-2"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0.6349973066761331, 1.0998538177930999, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_2_20.add(mesh_core_clamp_2_20);
  meshes["core-clamp-2"] = mesh_core_clamp_2_20;
  colliders["core-clamp-2"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-clamp-2"] ??= [];
  destructionGroups["core-clamp-2"].push(node_core_clamp_2_20);
  const socket_core_clamp_2_core_clamp_2_socket_0 = new THREE.Object3D();
  socket_core_clamp_2_core_clamp_2_socket_0.name = "core-clamp-2-socket";
  socket_core_clamp_2_core_clamp_2_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_clamp_2_core_clamp_2_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_clamp_2_core_clamp_2_socket_0.userData.socket = {"id": "core-clamp-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_clamp_2_20.add(socket_core_clamp_2_core_clamp_2_socket_0);
  sockets["core-clamp-2:core-clamp-2-socket"] = socket_core_clamp_2_core_clamp_2_socket_0;

  const attachment_core_clamp_3_21 = null;
  const endpoint_core_clamp_3_21 = makeAttachmentEndpoint(attachment_core_clamp_3_21);
  const node_core_clamp_3_21 = new THREE.Group();
  node_core_clamp_3_21.name = "Radial core clamp 3__pivot";
  node_core_clamp_3_21.scale.set(1, 1, 1);
  if (endpoint_core_clamp_3_21) {
    node_core_clamp_3_21.position.copy(endpoint_core_clamp_3_21.start);
    node_core_clamp_3_21.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_clamp_3_21.position.set(-0.6350053866363102, 1.0998491528127257, 0.73);
    node_core_clamp_3_21.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_clamp_3_21.userData.sculptComponent = {"id": "core-clamp-3", "name": "Radial core clamp 3", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.6350053866363102, 1.0998491528127257, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-3", "seamRefs": [], "detachableFragments": ["core-clamp-3"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-0.6350053866363102, 1.0998491528127257, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_3_21.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-3", "seamRefs": [], "detachableFragments": ["core-clamp-3"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-0.6350053866363102, 1.0998491528127257, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_clamp_3_21);
  nodes["core-clamp-3"] = node_core_clamp_3_21;
  const mesh_core_clamp_3_21Geometry = endpoint_core_clamp_3_21
    ? new THREE.CylinderGeometry(endpoint_core_clamp_3_21.endRadius, endpoint_core_clamp_3_21.baseRadius, endpoint_core_clamp_3_21.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_core_clamp_3_21) {
    mesh_core_clamp_3_21Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_clamp_3_21 = new THREE.Mesh(
    mesh_core_clamp_3_21Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_clamp_3_21.name = "Radial core clamp 3";
  if (endpoint_core_clamp_3_21) {
    mesh_core_clamp_3_21.position.copy(endpoint_core_clamp_3_21.midpoint);
    mesh_core_clamp_3_21.quaternion.copy(endpoint_core_clamp_3_21.quaternion);
  }
  mesh_core_clamp_3_21.castShadow = options.castShadow ?? true;
  mesh_core_clamp_3_21.receiveShadow = options.receiveShadow ?? true;
  mesh_core_clamp_3_21.userData.sculptComponent = {"id": "core-clamp-3", "name": "Radial core clamp 3", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.6350053866363102, 1.0998491528127257, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-3", "seamRefs": [], "detachableFragments": ["core-clamp-3"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-0.6350053866363102, 1.0998491528127257, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_3_21.add(mesh_core_clamp_3_21);
  meshes["core-clamp-3"] = mesh_core_clamp_3_21;
  colliders["core-clamp-3"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-clamp-3"] ??= [];
  destructionGroups["core-clamp-3"].push(node_core_clamp_3_21);
  const socket_core_clamp_3_core_clamp_3_socket_0 = new THREE.Object3D();
  socket_core_clamp_3_core_clamp_3_socket_0.name = "core-clamp-3-socket";
  socket_core_clamp_3_core_clamp_3_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_clamp_3_core_clamp_3_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_clamp_3_core_clamp_3_socket_0.userData.socket = {"id": "core-clamp-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_clamp_3_21.add(socket_core_clamp_3_core_clamp_3_socket_0);
  sockets["core-clamp-3:core-clamp-3-socket"] = socket_core_clamp_3_core_clamp_3_socket_0;

  const attachment_core_clamp_4_22 = null;
  const endpoint_core_clamp_4_22 = makeAttachmentEndpoint(attachment_core_clamp_4_22);
  const node_core_clamp_4_22 = new THREE.Group();
  node_core_clamp_4_22.name = "Radial core clamp 4__pivot";
  node_core_clamp_4_22.scale.set(1, 1, 1);
  if (endpoint_core_clamp_4_22) {
    node_core_clamp_4_22.position.copy(endpoint_core_clamp_4_22.start);
    node_core_clamp_4_22.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_clamp_4_22.position.set(-1.2699999999657292, -9.329940961866345e-06, 0.73);
    node_core_clamp_4_22.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_clamp_4_22.userData.sculptComponent = {"id": "core-clamp-4", "name": "Radial core clamp 4", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-1.2699999999657292, -9.329940961866345e-06, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-4", "seamRefs": [], "detachableFragments": ["core-clamp-4"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-1.2699999999657292, -9.329940961866345e-06, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_4_22.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-4", "seamRefs": [], "detachableFragments": ["core-clamp-4"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-1.2699999999657292, -9.329940961866345e-06, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_clamp_4_22);
  nodes["core-clamp-4"] = node_core_clamp_4_22;
  const mesh_core_clamp_4_22Geometry = endpoint_core_clamp_4_22
    ? new THREE.CylinderGeometry(endpoint_core_clamp_4_22.endRadius, endpoint_core_clamp_4_22.baseRadius, endpoint_core_clamp_4_22.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_core_clamp_4_22) {
    mesh_core_clamp_4_22Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_clamp_4_22 = new THREE.Mesh(
    mesh_core_clamp_4_22Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_clamp_4_22.name = "Radial core clamp 4";
  if (endpoint_core_clamp_4_22) {
    mesh_core_clamp_4_22.position.copy(endpoint_core_clamp_4_22.midpoint);
    mesh_core_clamp_4_22.quaternion.copy(endpoint_core_clamp_4_22.quaternion);
  }
  mesh_core_clamp_4_22.castShadow = options.castShadow ?? true;
  mesh_core_clamp_4_22.receiveShadow = options.receiveShadow ?? true;
  mesh_core_clamp_4_22.userData.sculptComponent = {"id": "core-clamp-4", "name": "Radial core clamp 4", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-1.2699999999657292, -9.329940961866345e-06, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-4", "seamRefs": [], "detachableFragments": ["core-clamp-4"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-1.2699999999657292, -9.329940961866345e-06, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_4_22.add(mesh_core_clamp_4_22);
  meshes["core-clamp-4"] = mesh_core_clamp_4_22;
  colliders["core-clamp-4"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-clamp-4"] ??= [];
  destructionGroups["core-clamp-4"].push(node_core_clamp_4_22);
  const socket_core_clamp_4_core_clamp_4_socket_0 = new THREE.Object3D();
  socket_core_clamp_4_core_clamp_4_socket_0.name = "core-clamp-4-socket";
  socket_core_clamp_4_core_clamp_4_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_clamp_4_core_clamp_4_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_clamp_4_core_clamp_4_socket_0.userData.socket = {"id": "core-clamp-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_clamp_4_22.add(socket_core_clamp_4_core_clamp_4_socket_0);
  sockets["core-clamp-4:core-clamp-4-socket"] = socket_core_clamp_4_core_clamp_4_socket_0;

  const attachment_core_clamp_5_23 = null;
  const endpoint_core_clamp_5_23 = makeAttachmentEndpoint(attachment_core_clamp_5_23);
  const node_core_clamp_5_23 = new THREE.Group();
  node_core_clamp_5_23.name = "Radial core clamp 5__pivot";
  node_core_clamp_5_23.scale.set(1, 1, 1);
  if (endpoint_core_clamp_5_23) {
    node_core_clamp_5_23.position.copy(endpoint_core_clamp_5_23.start);
    node_core_clamp_5_23.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_clamp_5_23.position.set(-0.6349892266816851, -1.0998584827141151, 0.73);
    node_core_clamp_5_23.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_clamp_5_23.userData.sculptComponent = {"id": "core-clamp-5", "name": "Radial core clamp 5", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.6349892266816851, -1.0998584827141151, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-5-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-5", "seamRefs": [], "detachableFragments": ["core-clamp-5"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-0.6349892266816851, -1.0998584827141151, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_5_23.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-5-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-5", "seamRefs": [], "detachableFragments": ["core-clamp-5"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-0.6349892266816851, -1.0998584827141151, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_clamp_5_23);
  nodes["core-clamp-5"] = node_core_clamp_5_23;
  const mesh_core_clamp_5_23Geometry = endpoint_core_clamp_5_23
    ? new THREE.CylinderGeometry(endpoint_core_clamp_5_23.endRadius, endpoint_core_clamp_5_23.baseRadius, endpoint_core_clamp_5_23.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_core_clamp_5_23) {
    mesh_core_clamp_5_23Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_clamp_5_23 = new THREE.Mesh(
    mesh_core_clamp_5_23Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_clamp_5_23.name = "Radial core clamp 5";
  if (endpoint_core_clamp_5_23) {
    mesh_core_clamp_5_23.position.copy(endpoint_core_clamp_5_23.midpoint);
    mesh_core_clamp_5_23.quaternion.copy(endpoint_core_clamp_5_23.quaternion);
  }
  mesh_core_clamp_5_23.castShadow = options.castShadow ?? true;
  mesh_core_clamp_5_23.receiveShadow = options.receiveShadow ?? true;
  mesh_core_clamp_5_23.userData.sculptComponent = {"id": "core-clamp-5", "name": "Radial core clamp 5", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.6349892266816851, -1.0998584827141151, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-5-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-5", "seamRefs": [], "detachableFragments": ["core-clamp-5"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [-0.6349892266816851, -1.0998584827141151, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_5_23.add(mesh_core_clamp_5_23);
  meshes["core-clamp-5"] = mesh_core_clamp_5_23;
  colliders["core-clamp-5"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-clamp-5"] ??= [];
  destructionGroups["core-clamp-5"].push(node_core_clamp_5_23);
  const socket_core_clamp_5_core_clamp_5_socket_0 = new THREE.Object3D();
  socket_core_clamp_5_core_clamp_5_socket_0.name = "core-clamp-5-socket";
  socket_core_clamp_5_core_clamp_5_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_clamp_5_core_clamp_5_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_clamp_5_core_clamp_5_socket_0.userData.socket = {"id": "core-clamp-5-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_clamp_5_23.add(socket_core_clamp_5_core_clamp_5_socket_0);
  sockets["core-clamp-5:core-clamp-5-socket"] = socket_core_clamp_5_core_clamp_5_socket_0;

  const attachment_core_clamp_6_24 = null;
  const endpoint_core_clamp_6_24 = makeAttachmentEndpoint(attachment_core_clamp_6_24);
  const node_core_clamp_6_24 = new THREE.Group();
  node_core_clamp_6_24.name = "Radial core clamp 6__pivot";
  node_core_clamp_6_24.scale.set(1, 1, 1);
  if (endpoint_core_clamp_6_24) {
    node_core_clamp_6_24.position.copy(endpoint_core_clamp_6_24.start);
    node_core_clamp_6_24.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_core_clamp_6_24.position.set(0.6350134665622168, -1.0998444877729927, 0.73);
    node_core_clamp_6_24.rotation.set(0.0, 0.0, 0.0);
  }
  node_core_clamp_6_24.userData.sculptComponent = {"id": "core-clamp-6", "name": "Radial core clamp 6", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.6350134665622168, -1.0998444877729927, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-6-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-6", "seamRefs": [], "detachableFragments": ["core-clamp-6"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0.6350134665622168, -1.0998444877729927, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_6_24.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-6-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-6", "seamRefs": [], "detachableFragments": ["core-clamp-6"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0.6350134665622168, -1.0998444877729927, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["energy-core"] ?? root).add(node_core_clamp_6_24);
  nodes["core-clamp-6"] = node_core_clamp_6_24;
  const mesh_core_clamp_6_24Geometry = endpoint_core_clamp_6_24
    ? new THREE.CylinderGeometry(endpoint_core_clamp_6_24.endRadius, endpoint_core_clamp_6_24.baseRadius, endpoint_core_clamp_6_24.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_core_clamp_6_24) {
    mesh_core_clamp_6_24Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_core_clamp_6_24 = new THREE.Mesh(
    mesh_core_clamp_6_24Geometry,
    materialMap["safety-orange"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_core_clamp_6_24.name = "Radial core clamp 6";
  if (endpoint_core_clamp_6_24) {
    mesh_core_clamp_6_24.position.copy(endpoint_core_clamp_6_24.midpoint);
    mesh_core_clamp_6_24.quaternion.copy(endpoint_core_clamp_6_24.quaternion);
  }
  mesh_core_clamp_6_24.castShadow = options.castShadow ?? true;
  mesh_core_clamp_6_24.receiveShadow = options.receiveShadow ?? true;
  mesh_core_clamp_6_24.userData.sculptComponent = {"id": "core-clamp-6", "name": "Radial core clamp 6", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "energy-core", "attachment": null, "dimensions": {"width": 0.22, "height": 0.55, "depth": 0.18, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.6350134665622168, -1.0998444877729927, 0.73], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "core-clamp-6-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "core-clamp-6", "seamRefs": [], "detachableFragments": ["core-clamp-6"], "breakImpulse": 2.0, "debrisMaterial": "safety-orange"}, "attachmentContract": {"parentId": "energy-core", "parentSocket": "energy-core-socket", "localStart": [0, 0, 0], "localEnd": [0.6350134665622168, -1.0998444877729927, 0.73], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "safety-orange", "materialLayers": ["safety-orange"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(255, 75, 25, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_core_clamp_6_24.add(mesh_core_clamp_6_24);
  meshes["core-clamp-6"] = mesh_core_clamp_6_24;
  colliders["core-clamp-6"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.22, 0.55, 0.18], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["core-clamp-6"] ??= [];
  destructionGroups["core-clamp-6"].push(node_core_clamp_6_24);
  const socket_core_clamp_6_core_clamp_6_socket_0 = new THREE.Object3D();
  socket_core_clamp_6_core_clamp_6_socket_0.name = "core-clamp-6-socket";
  socket_core_clamp_6_core_clamp_6_socket_0.position.set(0.0, 0.0, 0.0);
  socket_core_clamp_6_core_clamp_6_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_core_clamp_6_core_clamp_6_socket_0.userData.socket = {"id": "core-clamp-6-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_core_clamp_6_24.add(socket_core_clamp_6_core_clamp_6_socket_0);
  sockets["core-clamp-6:core-clamp-6-socket"] = socket_core_clamp_6_core_clamp_6_socket_0;

  const attachment_base_port_1_25 = null;
  const endpoint_base_port_1_25 = makeAttachmentEndpoint(attachment_base_port_1_25);
  const node_base_port_1_25 = new THREE.Group();
  node_base_port_1_25.name = "Base port detail 1__pivot";
  node_base_port_1_25.scale.set(1, 1, 1);
  if (endpoint_base_port_1_25) {
    node_base_port_1_25.position.copy(endpoint_base_port_1_25.start);
    node_base_port_1_25.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_base_port_1_25.position.set(-1.05, 0.0, 0.76);
    node_base_port_1_25.rotation.set(0.0, 0.0, 0.0);
  }
  node_base_port_1_25.userData.sculptComponent = {"id": "base-port-1", "name": "Base port detail 1", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [-1.05, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-1", "seamRefs": [], "detachableFragments": ["base-port-1"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [-1.05, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_1_25.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-1", "seamRefs": [], "detachableFragments": ["base-port-1"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [-1.05, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["base-plinth"] ?? root).add(node_base_port_1_25);
  nodes["base-port-1"] = node_base_port_1_25;
  const mesh_base_port_1_25Geometry = endpoint_base_port_1_25
    ? new THREE.CylinderGeometry(endpoint_base_port_1_25.endRadius, endpoint_base_port_1_25.baseRadius, endpoint_base_port_1_25.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_base_port_1_25) {
    mesh_base_port_1_25Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_base_port_1_25 = new THREE.Mesh(
    mesh_base_port_1_25Geometry,
    materialMap["contact-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_base_port_1_25.name = "Base port detail 1";
  if (endpoint_base_port_1_25) {
    mesh_base_port_1_25.position.copy(endpoint_base_port_1_25.midpoint);
    mesh_base_port_1_25.quaternion.copy(endpoint_base_port_1_25.quaternion);
  }
  mesh_base_port_1_25.castShadow = options.castShadow ?? true;
  mesh_base_port_1_25.receiveShadow = options.receiveShadow ?? true;
  mesh_base_port_1_25.userData.sculptComponent = {"id": "base-port-1", "name": "Base port detail 1", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [-1.05, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-1", "seamRefs": [], "detachableFragments": ["base-port-1"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [-1.05, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_1_25.add(mesh_base_port_1_25);
  meshes["base-port-1"] = mesh_base_port_1_25;
  colliders["base-port-1"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["base-port-1"] ??= [];
  destructionGroups["base-port-1"].push(node_base_port_1_25);
  const socket_base_port_1_base_port_1_socket_0 = new THREE.Object3D();
  socket_base_port_1_base_port_1_socket_0.name = "base-port-1-socket";
  socket_base_port_1_base_port_1_socket_0.position.set(0.0, 0.0, 0.0);
  socket_base_port_1_base_port_1_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_base_port_1_base_port_1_socket_0.userData.socket = {"id": "base-port-1-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_base_port_1_25.add(socket_base_port_1_base_port_1_socket_0);
  sockets["base-port-1:base-port-1-socket"] = socket_base_port_1_base_port_1_socket_0;

  const attachment_base_port_2_26 = null;
  const endpoint_base_port_2_26 = makeAttachmentEndpoint(attachment_base_port_2_26);
  const node_base_port_2_26 = new THREE.Group();
  node_base_port_2_26.name = "Base port detail 2__pivot";
  node_base_port_2_26.scale.set(1, 1, 1);
  if (endpoint_base_port_2_26) {
    node_base_port_2_26.position.copy(endpoint_base_port_2_26.start);
    node_base_port_2_26.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_base_port_2_26.position.set(-0.35, 0.0, 0.76);
    node_base_port_2_26.rotation.set(0.0, 0.0, 0.0);
  }
  node_base_port_2_26.userData.sculptComponent = {"id": "base-port-2", "name": "Base port detail 2", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.35, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-2", "seamRefs": [], "detachableFragments": ["base-port-2"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [-0.35, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_2_26.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-2", "seamRefs": [], "detachableFragments": ["base-port-2"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [-0.35, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["base-plinth"] ?? root).add(node_base_port_2_26);
  nodes["base-port-2"] = node_base_port_2_26;
  const mesh_base_port_2_26Geometry = endpoint_base_port_2_26
    ? new THREE.CylinderGeometry(endpoint_base_port_2_26.endRadius, endpoint_base_port_2_26.baseRadius, endpoint_base_port_2_26.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_base_port_2_26) {
    mesh_base_port_2_26Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_base_port_2_26 = new THREE.Mesh(
    mesh_base_port_2_26Geometry,
    materialMap["contact-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_base_port_2_26.name = "Base port detail 2";
  if (endpoint_base_port_2_26) {
    mesh_base_port_2_26.position.copy(endpoint_base_port_2_26.midpoint);
    mesh_base_port_2_26.quaternion.copy(endpoint_base_port_2_26.quaternion);
  }
  mesh_base_port_2_26.castShadow = options.castShadow ?? true;
  mesh_base_port_2_26.receiveShadow = options.receiveShadow ?? true;
  mesh_base_port_2_26.userData.sculptComponent = {"id": "base-port-2", "name": "Base port detail 2", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [-0.35, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-2", "seamRefs": [], "detachableFragments": ["base-port-2"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [-0.35, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_2_26.add(mesh_base_port_2_26);
  meshes["base-port-2"] = mesh_base_port_2_26;
  colliders["base-port-2"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["base-port-2"] ??= [];
  destructionGroups["base-port-2"].push(node_base_port_2_26);
  const socket_base_port_2_base_port_2_socket_0 = new THREE.Object3D();
  socket_base_port_2_base_port_2_socket_0.name = "base-port-2-socket";
  socket_base_port_2_base_port_2_socket_0.position.set(0.0, 0.0, 0.0);
  socket_base_port_2_base_port_2_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_base_port_2_base_port_2_socket_0.userData.socket = {"id": "base-port-2-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_base_port_2_26.add(socket_base_port_2_base_port_2_socket_0);
  sockets["base-port-2:base-port-2-socket"] = socket_base_port_2_base_port_2_socket_0;

  const attachment_base_port_3_27 = null;
  const endpoint_base_port_3_27 = makeAttachmentEndpoint(attachment_base_port_3_27);
  const node_base_port_3_27 = new THREE.Group();
  node_base_port_3_27.name = "Base port detail 3__pivot";
  node_base_port_3_27.scale.set(1, 1, 1);
  if (endpoint_base_port_3_27) {
    node_base_port_3_27.position.copy(endpoint_base_port_3_27.start);
    node_base_port_3_27.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_base_port_3_27.position.set(0.35, 0.0, 0.76);
    node_base_port_3_27.rotation.set(0.0, 0.0, 0.0);
  }
  node_base_port_3_27.userData.sculptComponent = {"id": "base-port-3", "name": "Base port detail 3", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.35, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-3", "seamRefs": [], "detachableFragments": ["base-port-3"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [0.35, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_3_27.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-3", "seamRefs": [], "detachableFragments": ["base-port-3"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [0.35, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["base-plinth"] ?? root).add(node_base_port_3_27);
  nodes["base-port-3"] = node_base_port_3_27;
  const mesh_base_port_3_27Geometry = endpoint_base_port_3_27
    ? new THREE.CylinderGeometry(endpoint_base_port_3_27.endRadius, endpoint_base_port_3_27.baseRadius, endpoint_base_port_3_27.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_base_port_3_27) {
    mesh_base_port_3_27Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_base_port_3_27 = new THREE.Mesh(
    mesh_base_port_3_27Geometry,
    materialMap["contact-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_base_port_3_27.name = "Base port detail 3";
  if (endpoint_base_port_3_27) {
    mesh_base_port_3_27.position.copy(endpoint_base_port_3_27.midpoint);
    mesh_base_port_3_27.quaternion.copy(endpoint_base_port_3_27.quaternion);
  }
  mesh_base_port_3_27.castShadow = options.castShadow ?? true;
  mesh_base_port_3_27.receiveShadow = options.receiveShadow ?? true;
  mesh_base_port_3_27.userData.sculptComponent = {"id": "base-port-3", "name": "Base port detail 3", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [0.35, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-3", "seamRefs": [], "detachableFragments": ["base-port-3"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [0.35, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_3_27.add(mesh_base_port_3_27);
  meshes["base-port-3"] = mesh_base_port_3_27;
  colliders["base-port-3"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["base-port-3"] ??= [];
  destructionGroups["base-port-3"].push(node_base_port_3_27);
  const socket_base_port_3_base_port_3_socket_0 = new THREE.Object3D();
  socket_base_port_3_base_port_3_socket_0.name = "base-port-3-socket";
  socket_base_port_3_base_port_3_socket_0.position.set(0.0, 0.0, 0.0);
  socket_base_port_3_base_port_3_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_base_port_3_base_port_3_socket_0.userData.socket = {"id": "base-port-3-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_base_port_3_27.add(socket_base_port_3_base_port_3_socket_0);
  sockets["base-port-3:base-port-3-socket"] = socket_base_port_3_base_port_3_socket_0;

  const attachment_base_port_4_28 = null;
  const endpoint_base_port_4_28 = makeAttachmentEndpoint(attachment_base_port_4_28);
  const node_base_port_4_28 = new THREE.Group();
  node_base_port_4_28.name = "Base port detail 4__pivot";
  node_base_port_4_28.scale.set(1, 1, 1);
  if (endpoint_base_port_4_28) {
    node_base_port_4_28.position.copy(endpoint_base_port_4_28.start);
    node_base_port_4_28.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_base_port_4_28.position.set(1.05, 0.0, 0.76);
    node_base_port_4_28.rotation.set(0.0, 0.0, 0.0);
  }
  node_base_port_4_28.userData.sculptComponent = {"id": "base-port-4", "name": "Base port detail 4", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [1.05, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-4", "seamRefs": [], "detachableFragments": ["base-port-4"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [1.05, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_4_28.userData.actionProfile = {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-4", "seamRefs": [], "detachableFragments": ["base-port-4"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [1.05, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}};
  (nodes["base-plinth"] ?? root).add(node_base_port_4_28);
  nodes["base-port-4"] = node_base_port_4_28;
  const mesh_base_port_4_28Geometry = endpoint_base_port_4_28
    ? new THREE.CylinderGeometry(endpoint_base_port_4_28.endRadius, endpoint_base_port_4_28.baseRadius, endpoint_base_port_4_28.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_base_port_4_28) {
    mesh_base_port_4_28Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_base_port_4_28 = new THREE.Mesh(
    mesh_base_port_4_28Geometry,
    materialMap["contact-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_base_port_4_28.name = "Base port detail 4";
  if (endpoint_base_port_4_28) {
    mesh_base_port_4_28.position.copy(endpoint_base_port_4_28.midpoint);
    mesh_base_port_4_28.quaternion.copy(endpoint_base_port_4_28.quaternion);
  }
  mesh_base_port_4_28.castShadow = options.castShadow ?? true;
  mesh_base_port_4_28.receiveShadow = options.receiveShadow ?? true;
  mesh_base_port_4_28.userData.sculptComponent = {"id": "base-port-4", "name": "Base port detail 4", "level": "micro", "role": "part", "importance": 0.85, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Hard-surface part represented by a continuous procedural primitive with real depth.", "geometryDescriptor": {"topologyIntent": "low-poly blockout with bevel-ready edges", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.035, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "base-plinth", "attachment": null, "dimensions": {"width": 0.5, "height": 0.28, "depth": 0.16, "units": "relative", "confidence": 0.88}, "transform": {"position": [1.05, 0.0, 0.76], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "part", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.5}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "base-port-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "base-port-4", "seamRefs": [], "detachableFragments": ["base-port-4"], "breakImpulse": 2.0, "debrisMaterial": "contact-gold"}, "attachmentContract": {"parentId": "base-plinth", "parentSocket": "base-plinth-socket", "localStart": [0, 0, 0], "localEnd": [1.05, 0.0, 0.76], "contactType": "overlap", "overlap": 0.025, "gapTolerance": 0.015, "contactNormal": [0, 0, 1]}}, "material": "contact-gold", "materialLayers": ["contact-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.08, "microRoughness": 0.04, "bumpAmplitude": 0.015, "normalPattern": "independent powder or brushed field", "displacementPattern": "", "occlusionPattern": "seams and component contacts", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(216, 177, 90, 1)", "secondaryAlbedo": "rgba(8, 10, 9, 1)", "materialClass": "metal", "materialClassConfidence": 0.9, "finish": "procedural PBR", "evidenceRef": "full-object"}};
  node_base_port_4_28.add(mesh_base_port_4_28);
  meshes["base-port-4"] = mesh_base_port_4_28;
  colliders["base-port-4"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.5, 0.28, 0.16], "isTrigger": false, "notes": "simplified interaction proxy"};
  destructionGroups["base-port-4"] ??= [];
  destructionGroups["base-port-4"].push(node_base_port_4_28);
  const socket_base_port_4_base_port_4_socket_0 = new THREE.Object3D();
  socket_base_port_4_base_port_4_socket_0.name = "base-port-4-socket";
  socket_base_port_4_base_port_4_socket_0.position.set(0.0, 0.0, 0.0);
  socket_base_port_4_base_port_4_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_base_port_4_base_port_4_socket_0.userData.socket = {"id": "base-port-4-socket", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0]};
  node_base_port_4_28.add(socket_base_port_4_base_port_4_socket_0);
  sockets["base-port-4:base-port-4-socket"] = socket_base_port_4_base_port_4_socket_0;

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "realtime-interactive-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": false, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createBUNTGAMESCoreLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "BUNTGAMES Core look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = ["key light: neutral white directional area light from upper-front-left, intensity 3.2", "fill light: cool dim hemisphere/environment light, intensity 0.55", "rim light: acid-chartreuse point rim behind core, intensity 2.4; ACES filmic tone mapping, exposure 1.05; soft ground contact shadow and ambient occlusion"];
  lights.userData.lookDevTargets = {"qualityPriority": "realtime-interactive-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": false, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createBUNTGAMESCoreEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function frameBUNTGAMESCoreCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createBUNTGAMESCorePresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}

export function configureBUNTGAMESCoreRenderer(renderer: THREE.WebGLRenderer): void {
  // Load-bearing for view-dependent finishes (anodized / Doppler): without ACES + sRGB
  // the environment reflection reads flat/washed instead of a believable metal response.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export function createBUNTGAMESCoreInspectControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
): OrbitControls {
  // View-dependent finishes only read correctly once the user orbits — their color
  // comes from the environment reflection, not albedo, so free rotation matters here.
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  return controls;
}
