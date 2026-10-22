// SKIN2D's original atlas validation, slicing, keyframes and skeletal renderer.
import { SKIN_V0 } from './vendor/spec/skin-v0';
import { SKIN_SD } from './vendor/spec/skin-v1';
import { paintSDMarker } from './vendor/spec/marker';
export { CHAPTERS, levelFor, drawWorld } from './world';
import { loadSkin, type PreparedSkin } from './vendor/core/skin';
import { parseMotion, samplePose } from './vendor/core/animate';
import { drawCharacter } from './vendor/core/render';
import { apply, chain, mul, scale, translate, worldTransforms, type Mat } from './vendor/core/skeleton';
import idle from './vendor/motions/idle.json';
import walk from './vendor/motions/walk.json';
import run from './vendor/motions/run.json';
import shoot from './vendor/motions/shoot.json';
import hit from './vendor/motions/hit.json';
import die from './vendor/motions/die.json';

const motions = Object.fromEntries([idle, walk, run, shoot, hit, die].map(raw => [raw.id, parseMotion(raw)]));
const palette = {
  cowboy: ['#ffdcc1', '#407caa', '#d76661', '#ffe3a1'],
  ranger: ['#e9c69d', '#4b8e7b', '#e8b96a', '#d2f0c2'],
  huntress: ['#ffddcf', '#9a6a9e', '#69cfc0', '#ffe0a0'],
  walker: ['#a5bd75', '#415342', '#d6cfa1', '#dc795e'],
  runner: ['#b1a3d4', '#3e345e', '#89769f', '#fd9d7d'],
  brute: ['#bca785', '#574c42', '#947e55', '#ffc572'],
  swarm: ['#80b7b4', '#284852', '#579092', '#f2bc70'],
};

/** 512px SD atlas: large expressive faces, layered hats and compact limbs. */
function makeAtlas(kind: keyof typeof palette): HTMLCanvasElement {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const c=canvas.getContext('2d')!;c.scale(2,2);
  const [skin,coat,accent,light]=palette[kind];
  const hero=['cowboy','ranger','huntress'].includes(kind),ink='#343249';
  const finish=(color:string)=>{c.fillStyle=color;c.fill();c.strokeStyle=ink;c.lineWidth=1.7;c.lineJoin='round';c.stroke();};
  const box=(x:number,y:number,w:number,h:number,color:string,r=4)=>{c.beginPath();c.roundRect(x,y,w,h,r);finish(color);};
  const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);finish(color);};
  const poly=(points:number[][],color:string)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();finish(color);};
  for(const part of SKIN_SD.parts){
    c.save();c.beginPath();c.rect(part.rect.x,part.rect.y,part.rect.w,part.rect.h);c.clip();c.translate(part.rect.x,part.rect.y);
    if(part.id==='head'){
      box(40,77,16,19,skin);oval(48,55,35,32,skin);
      if(hero){
        oval(14,58,5,8,skin);oval(82,58,5,8,skin);
        poly([[14,47],[16,29],[35,19],[67,24],[81,43],[67,36],[60,46],[48,33],[34,43],[26,36]],kind==='huntress'?'#9b5466':kind==='ranger'?'#6a4d41':'#7e5949');
        for(const x of [36,63]){oval(x,57,4.5,7,ink);oval(x+1.2,54.5,1.2,2,'#fff9e9');}
        c.strokeStyle=ink;c.lineWidth=1.5;c.beginPath();c.moveTo(43,74);c.quadraticCurveTo(49,79,57,73);c.stroke();
        c.fillStyle='#e5a29d66';c.beginPath();c.ellipse(25,68,6,3,0,0,7);c.ellipse(73,68,6,3,0,0,7);c.fill();
      }else if(kind==='walker'){
        oval(34,54,8,10,ink);oval(63,54,8,10,ink);poly([[48,64],[43,71],[53,71]],'#6b6a65');
        box(32,75,33,9,light,3);for(let x=39;x<64;x+=7){c.fillStyle=ink;c.fillRect(x,76,1,7);}
        box(16,22,64,13,coat);poly([[39,19],[43,11],[59,13],[64,23]],coat);
      }else if(kind==='runner'){
        poly([[17,42],[12,8],[38,30]],coat);poly([[58,28],[83,8],[79,48]],coat);
        oval(34,55,7,6,ink);oval(64,55,7,6,ink);oval(35,54,2,2,light);oval(65,54,2,2,light);
        poly([[18,67],[48,59],[79,67],[65,84],[30,84]],accent);
      }else if(kind==='brute'){
        box(11,20,75,62,coat,15);box(18,38,62,25,ink,8);box(26,46,46,8,'#ffcd7d',4);
        box(10,12,16,24,light,5);box(71,12,16,24,light,5);box(28,68,38,10,accent,3);
      }else{
        poly([[18,46],[10,12],[37,34]],coat);poly([[59,33],[86,13],[78,48]],coat);
        oval(35,54,7,9,light);oval(62,54,7,9,light);oval(35,55,3,5,ink);oval(62,55,3,5,ink);
        poly([[37,73],[43,82],[49,73],[55,82],[62,72]],'#fff4dc');
      }
    }else if(part.id==='headwear'&&hero){
      const hat=kind==='cowboy'?'#ad794e':kind==='ranger'?'#547968':'#75546e';
      box(24,7,49,30,hat,12);box(24,26,49,10,accent,2);oval(48,38,44,7,hat);
      poly([[45,21],[48,15],[51,21],[58,22],[53,27],[54,33],[48,30],[42,33],[43,27],[38,22]],light);
      if(kind==='ranger')poly([[68,17],[86,2],[79,25]],light);
    }else if(part.id==='hair'&&kind==='huntress'){
      box(17,40,12,45,'#9b5466',6);box(69,41,12,45,'#9b5466',6);oval(22,78,6,8,accent);
    }else if(part.id==='torso'){
      box(10,3,44,44,coat,10);
      if(hero){
        poly([[12,4],[25,7],[25,34],[9,38]],'#e6cda5');poly([[51,4],[39,7],[39,34],[55,38]],'#e6cda5');
        poly([[18,4],[45,4],[33,21]],accent);box(10,35,44,8,ink,2);box(28,35,10,8,light,2);
        oval(43,23,4,4,light);
      }else if(kind==='walker'){
        for(let y=12;y<32;y+=8){box(17,y,30,4,light,2);}box(29,5,5,30,light,2);
      }else if(kind==='brute'){
        box(12,7,40,28,accent,7);oval(32,21,8,8,'#ffcb80');oval(32,21,3,3,'#fff5c6');box(11,35,43,9,ink,3);
      }else{poly([[11,4],[51,4],[43,33],[31,42],[19,33]],accent);box(12,35,40,7,ink,2);}
    }else if(part.id.startsWith('arm')){
      box(8,1,16,25,coat,7);box(8,22,16,9,accent,3);oval(16,34,8,6,hero?skin:light);
      if(kind==='brute')box(4,4,24,17,accent,6);
    }else if(part.id.startsWith('leg')){
      box(8,1,17,27,hero?'#566d94':coat,5);box(6,24,23,15,hero?'#694d4b':ink,4);box(18,29,12,9,hero?'#694d4b':ink,3);
      if(hero){c.fillStyle=light;c.fillRect(9,26,4,3);}
    }else if(part.id==='backgear'&&kind==='swarm'){
      poly([[5,48],[1,9],[43,22],[62,10],[59,55],[40,38],[25,63]],coat);
    }
    c.restore();
  }
  paintSDMarker(c,2);
  return canvas;
}

const atlases = Object.fromEntries(Object.keys(palette).map(kind => [kind, makeAtlas(kind as keyof typeof palette)]));
function prepare(canvas: HTMLCanvasElement): PreparedSkin {
  const loaded = loadSkin(canvas as unknown as ImageBitmap, SKIN_V0);
  if (!loaded.prepared) throw Error('Invalid bundled SKIN2D atlas: ' + JSON.stringify(loaded.validation));
  return loaded.prepared;
}
const skins = Object.fromEntries(Object.entries(atlases).map(([key, atlas]) => [key, prepare(atlas)]));
let playerSkin = skins.cowboy;
let pendingUpload = 0;

function rig(x:number, feet:number, angle:number, recoil:number, time:number, shotAge:number) {
  const pose = samplePose(motions[shotAge < 600 ? 'shoot' : 'idle'], shotAge < 600 ? shotAge : time);
  pose.root = {...pose.root, x:-recoil, y:Math.sin(time / 500)*2};
  pose.torso = {...pose.torso, rot:0};
  pose.arm_f = {...pose.arm_f, rot:angle*180/Math.PI-90};
  pose.arm_b = {...pose.arm_b, rot:angle*180/Math.PI-65};
  pose.weapon = {rot:0};
  return {pose, base:chain(translate(x,feet),scale(0.82))};
}

export function muzzle(x:number, feet:number, angle:number, recoil:number, time:number, shotAge:number, length:number) {
  const {pose,base} = rig(x,feet,angle,recoil,time,shotAge);
  const matrix = worldTransforms(playerSkin.spec,pose,base).weapon;
  const part = playerSkin.spec.parts.find(part=>part.id==='weapon')!;
  const grip = part.pivot;
  return apply(matrix,{x:grip.x,y:grip.y+(length+5)/0.82});
}

export function aimOrigin(x:number, feet:number, recoil:number, time:number) {
  const {pose,base}=rig(x,feet,0,recoil,time,600);
  const part=playerSkin.spec.parts.find(part=>part.id==='arm_f')!;
  return apply(worldTransforms(playerSkin.spec,pose,base).arm_f,part.pivot);
}

export function drawPlayer(ctx:CanvasRenderingContext2D, x:number, feet:number, angle:number, recoil:number, time:number, shotAge:number, length:number, weapon:number) {
  const {pose,base} = rig(x,feet,angle,recoil,time,shotAge);
  const t=ctx.getTransform(); const camera:Mat=[t.a,t.b,t.c,t.d,t.e,t.f];
  ctx.save();
  drawCharacter(ctx,playerSkin,pose,mul(camera,base),{weapon:(c,worlds)=>{
    c.setTransform(...worlds.weapon);
    const grip=playerSkin.spec.parts.find(part=>part.id==='weapon')!.pivot;
    c.translate(grip.x,grip.y);c.rotate(Math.PI/2);c.scale(1/0.82,1/0.82);
    c.fillStyle=weapon===3?'#ba4333':'#343640';c.fillRect(-5,-5,length+5,10);
    c.fillStyle='#c5bc9f';c.fillRect(3,-5,length-3,2);
    c.fillStyle='#70472d';c.fillRect(-5,2,10,12);
    if(weapon===4) {c.fillStyle='#777e85';c.fillRect(10,-8,length-10,3);c.fillRect(10,6,length-10,3);}
  }});
  ctx.restore();
}

export function drawEnemy(ctx:CanvasRenderingContext2D, enemy:any) {
  const motion=enemy.deathAt!==undefined?'die':enemy.hitFlash>0?'hit':enemy.typeKey==='runner'?'run':'walk';
  const motionTime=motion==='die'?performance.now()-enemy.deathAt:motion==='hit' ? Math.max(0,5-enemy.hitFlash)*motions.hit.duration/5 : enemy.walkTick*18;
  const pose=samplePose(motions[motion],motionTime);
  if(enemy.isCharging && motion!=='die')pose.root={...pose.root,rot:-8};
  const k=enemy.size/100;
  const t=ctx.getTransform();const camera:Mat=[t.a,t.b,t.c,t.d,t.e,t.f];
  ctx.save();
  if(motion==='die')ctx.globalAlpha*=Math.max(0,1-motionTime/750);
  if(enemy.hitFlash>0)ctx.filter='brightness(2)';
  drawCharacter(ctx,skins[enemy.typeKey]||skins.walker,pose,mul(camera,chain(translate(enemy.x,enemy.y+enemy.size*1.1),scale(-k,k))),enemy.isBoss?{headwear:(c,worlds)=>{
    c.setTransform(...worlds.headwear);c.fillStyle=enemy.color;c.strokeStyle='#343249';c.lineWidth=2;
    c.beginPath();c.moveTo(22,22);c.lineTo(18,4);c.lineTo(36,12);c.lineTo(48,0);c.lineTo(60,12);c.lineTo(79,4);c.lineTo(74,22);c.closePath();c.fill();c.stroke();
  }}:undefined);
  ctx.restore();
}

export async function importPlayer(file:File) {
  const generation=++pendingUpload;
  if(file.size>8*1024*1024)throw Error('8MB 이하 PNG를 선택하세요.');
  const header=new Uint8Array(await file.slice(0,24).arrayBuffer());
  if(header.length<24 || [137,80,78,71,13,10,26,10].some((byte,i)=>header[i]!==byte))throw Error('PNG 이미지 파일을 선택하세요.');
  const view=new DataView(header.buffer);
  const width=view.getUint32(16),height=view.getUint32(20);
  if(width!==height || width<256 || width>1024 || width%256!==0)throw Error('256·512·768·1024px 정사각형 SKIN2D PNG를 선택하세요.');
  let source:ImageBitmap|HTMLImageElement;
  let release=()=>{};
  try {
    if(typeof createImageBitmap==='function') {
      const bitmap=await createImageBitmap(file);source=bitmap;release=()=>bitmap.close();
    } else {
      const url=URL.createObjectURL(file);release=()=>URL.revokeObjectURL(url);
      const image=new Image();image.src=url;await image.decode();source=image;
    }
    if(generation!==pendingUpload)return false;
    const loaded=loadSkin(source as ImageBitmap,SKIN_V0,{removeBackground:true});
    if(!loaded.prepared)throw Error('필수 부위가 비어 있습니다. SKIN2D 템플릿에 맞춰 그려주세요.');
    if(generation===pendingUpload){playerSkin=loaded.prepared;return true;}
    return false;
  }catch(error){
    if(error instanceof Error && error.message.includes('SKIN2D'))throw error;
    throw Error('이미지를 읽을 수 없습니다. 정상적인 PNG 파일을 선택하세요.');
  }finally{release();}
}
export function resetPlayer(){pendingUpload++;playerSkin=skins.cowboy;}
export function selectHero(id:string){if(!HEROES.some(hero=>hero.id===id))return;pendingUpload++;playerSkin=skins[id];}
export const HEROES=[{id:'cowboy',name:'해질녘 보안관',role:'황야의 수호자'},{id:'ranger',name:'숲바람 정찰병',role:'철로를 지키는 명사수'},{id:'huntress',name:'별빛 사냥꾼',role:'광산의 길잡이'}];
export function portrait(id:string){const c=document.createElement('canvas');c.width=120;c.height=160;drawCharacter(c.getContext('2d')!,skins[id]||playerSkin,{},chain(translate(60,153),scale(0.8)));return c.toDataURL();}
export function downloadAtlas(){
  const a=document.createElement('a');a.download='cowboy-skin2d.png';a.href=atlases.cowboy.toDataURL('image/png');a.click();
}
export const info={format:'SKIN2D',spec:SKIN_SD.id,motions:Object.keys(motions),characters:Object.keys(skins)};
