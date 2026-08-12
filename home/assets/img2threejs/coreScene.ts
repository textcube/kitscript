import * as THREE from 'three';
import { createBUNTGAMESCoreModel } from './createBuntgamesCoreModel';

type PartRecord = {
  object: THREE.Object3D;
  base: THREE.Vector3;
};

const canvas = document.querySelector<HTMLCanvasElement>('#bunt-core-canvas');
const host = document.querySelector<HTMLElement>('.core-stage');

if (canvas && host) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = innerWidth > 760;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(8.8, 5.4, 17.8);
  camera.lookAt(0, -0.25, 0);

  const model = createBUNTGAMESCoreModel({ castShadow: true, receiveShadow: true, textureSize: 512, qualityPriority: 'balanced' });
  const materials: Record<string, THREE.Material> = {
    'chassis-black': new THREE.MeshStandardMaterial({ color: 0x111513, metalness: 0.7, roughness: 0.34 }),
    gunmetal: new THREE.MeshStandardMaterial({ color: 0x343a37, metalness: 0.9, roughness: 0.22 }),
    'safety-orange': new THREE.MeshStandardMaterial({ color: 0xff4b19, metalness: 0.3, roughness: 0.28 }),
    'acid-core': new THREE.MeshPhysicalMaterial({ color: 0xc8ff24, emissive: 0x5f8b00, emissiveIntensity: 2.4, metalness: 0.08, roughness: 0.11, clearcoat: 1, clearcoatRoughness: 0.06 }),
    'pcb-green': new THREE.MeshStandardMaterial({ color: 0x173a2a, metalness: 0.12, roughness: 0.48 }),
    'contact-gold': new THREE.MeshStandardMaterial({ color: 0xd8b15a, metalness: 0.95, roughness: 0.16 }),
  };
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materialId = object.userData?.sculptComponent?.material;
    if (materialId && materials[materialId]) object.material = materials[materialId];
  });
  // Keep the generated reconstruction as an authored source asset, but do not
  // expose its coarse blockout in the hero. The presentation rig below is the
  // quality-gated silhouette used by the live page.
  model.visible = false;

  // The generated parts preserve the reference inventory, while this compact
  // hero rig gives the single-view reconstruction a strong readable silhouette.
  const heroRig = new THREE.Group();
  const heroParts: PartRecord[] = [];
  heroRig.name = 'buntgames-hero-rig';
  const acidMat = materials['acid-core'];
  const darkMat = materials['chassis-black'];
  const orangeMat = materials['safety-orange'];
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.09, 12, 96), acidMat);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.035, 10, 72), materials.gunmetal);
  ringB.rotation.set(Math.PI / 2, 0.38, 0.22);
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.035, 10, 72), materials.gunmetal);
  ringC.rotation.set(0.42, Math.PI / 2, -0.18);
  const coreShell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.86, 2), darkMat);
  const coreGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 2), acidMat);
  heroRig.add(ringA, ringB, ringC, coreShell, coreGlow);
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.055, 10, 72), orangeMat);
  innerRing.rotation.z = Math.PI / 4;
  heroRig.add(innerRing);

  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = logoCanvas.height = 512;
  const logoContext = logoCanvas.getContext('2d');
  if (logoContext) {
    logoContext.clearRect(0, 0, 512, 512);
    logoContext.textAlign = 'center';
    logoContext.textBaseline = 'middle';
    logoContext.fillStyle = '#c8ff24';
    logoContext.strokeStyle = '#060807';
    logoContext.lineWidth = 18;
    logoContext.font = '900 126px Arial Black, Arial, sans-serif';
    logoContext.strokeText('BUNT', 256, 205);
    logoContext.fillText('BUNT', 256, 205);
    logoContext.strokeText('GAMES', 256, 320);
    logoContext.fillText('GAMES', 256, 320);
  }
  const logoTexture = new THREE.CanvasTexture(logoCanvas);
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 1.24),
    new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true, depthWrite: false })
  );
  logo.position.z = 0.9;
  heroRig.add(logo);

  const strutGeometry = new THREE.CylinderGeometry(0.045, 0.045, 1.15, 10);
  const podGeometry = new THREE.BoxGeometry(0.78, 0.44, 0.62);
  const podCapGeometry = new THREE.BoxGeometry(0.18, 0.55, 0.72);
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + (i / 4) * Math.PI * 2;
    const pod = new THREE.Group();
    pod.position.set(Math.cos(angle) * 1.66, Math.sin(angle) * 1.66, 0);
    pod.rotation.z = angle;
    const housing = new THREE.Mesh(podGeometry, darkMat);
    const cap = new THREE.Mesh(podCapGeometry, orangeMat);
    cap.position.x = 0.43;
    const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.76), acidMat);
    indicator.position.x = -0.42;
    pod.add(housing, cap, indicator);
    heroRig.add(pod);
    heroParts.push({ object: pod, base: pod.position.clone() });

    const strut = new THREE.Mesh(strutGeometry, materials.gunmetal);
    strut.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, -0.12);
    strut.rotation.z = angle - Math.PI / 2;
    heroRig.add(strut);
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.28), i % 2 ? orangeMat : acidMat);
    clamp.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
    clamp.rotation.z = angle;
    heroRig.add(clamp);
    heroParts.push({ object: clamp, base: clamp.position.clone() });
  }

  const dataParticles = new THREE.Group();
  const particleGeometry = new THREE.BoxGeometry(0.045, 0.045, 0.045);
  for (let i = 0; i < 28; i++) {
    const particle = new THREE.Mesh(particleGeometry, i % 5 === 0 ? orangeMat : acidMat);
    const angle = (i / 28) * Math.PI * 2;
    const radius = 2.72 + (i % 3) * 0.11;
    particle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, ((i % 7) - 3) * 0.08);
    particle.userData.phase = angle;
    dataParticles.add(particle);
  }
  heroRig.add(dataParticles);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.018, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0x56604f, transparent: true, opacity: 0.7 })
  );
  const backPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.22, 48), darkMat);
  backPlate.rotation.x = Math.PI / 2;
  backPlate.position.z = -0.34;
  heroRig.add(halo, backPlate);
  heroRig.rotation.set(-0.08, -0.26, 0.04);
  scene.add(heroRig);

  // Compress inferred parts around the hero rig so they read as machinery,
  // not as unrelated floating blocks.
  for (const child of model.children) child.position.multiplyScalar(0.54);
  model.scale.setScalar(0.68);
  model.rotation.set(-0.05, -0.34, 0.015);
  model.position.set(0, 0.35, 0);
  scene.add(model);

  scene.add(new THREE.HemisphereLight(0xdde8df, 0x101712, 2.3));
  const key = new THREE.DirectionalLight(0xf4f2e8, 7.2);
  key.position.set(-7, 10, 9);
  key.castShadow = true;
  scene.add(key);
  const acidRim = new THREE.PointLight(0xc8ff24, 22, 18, 1.8);
  acidRim.position.set(0.5, 0.6, -3.6);
  scene.add(acidRim);
  const orangeRim = new THREE.PointLight(0xff4b19, 12, 15, 2);
  orangeRim.position.set(-5, -2, 3);
  scene.add(orangeRim);

  const runtime = (model.userData.sculptRuntime || {}) as { nodes?: Record<string, THREE.Object3D> };
  const parts: PartRecord[] = Object.values(runtime.nodes || {})
    .filter((object) => object !== model && object.parent)
    .map((object) => ({ object, base: object.position.clone() }));

  let pointerX = 0;
  let pointerY = 0;
  let explode = 0;
  let scrollOrbit = 0;
  let active = true;
  const center = new THREE.Vector3(0, 0, 0);

  const setExplode = (value: number) => {
    explode = THREE.MathUtils.clamp(value, 0, 1);
    for (const { object, base } of parts) {
      const direction = base.clone().sub(center);
      if (direction.lengthSq() < 0.02) direction.set(0, 0, 1);
      direction.normalize();
      object.position.copy(base).addScaledVector(direction, explode * 0.78);
    }
    for (const { object, base } of heroParts) {
      const direction = base.clone().normalize();
      object.position.copy(base).addScaledVector(direction, explode * 0.72);
      object.rotation.y = explode * 0.35;
    }
  };

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  host.addEventListener('pointermove', (event) => {
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  host.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });

  const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { threshold: 0.02 });
  observer.observe(host);

  const tick = (time: number) => {
    if (active) {
      const t = time * 0.001;
      const targetY = -0.34 + pointerX * 0.12 + scrollOrbit;
      const targetX = -0.05 + pointerY * 0.07;
      model.rotation.y += (targetY - model.rotation.y) * 0.055;
      model.rotation.x += (targetX - model.rotation.x) * 0.055;
      model.position.y = 0.35 + Math.sin(t * 1.35) * 0.045;
      heroRig.rotation.y = -0.26 + pointerX * 0.08 + scrollOrbit * 0.7 + Math.sin(t * 0.32) * 0.05;
      heroRig.rotation.z = 0.04 + Math.sin(t * 0.72) * 0.025;
      ringB.rotation.z = t * 0.16;
      ringC.rotation.y = Math.PI / 2 - t * 0.12;
      innerRing.rotation.z = Math.PI / 4 - t * 0.24;
      dataParticles.rotation.z = t * 0.09;
      for (const particle of dataParticles.children) {
        const phase = particle.userData.phase || 0;
        particle.scale.setScalar(0.55 + (Math.sin(t * 3.2 + phase * 4) + 1) * 0.42);
      }
      coreGlow.scale.setScalar(0.96 + Math.sin(t * 3.4) * 0.055);
      acidRim.intensity = 19 + Math.sin(t * 4.2) * 3.5;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  (window as any).BuntCoreScene = {
    model,
    setExplode,
    setScrollProgress(progress: number) {
      const p = THREE.MathUtils.clamp(progress, 0, 1);
      scrollOrbit = p * 0.58;
      setExplode(Math.max(0, (p - 0.46) / 0.44));
    }
  };
  dispatchEvent(new CustomEvent('bunt:core-ready'));
}
