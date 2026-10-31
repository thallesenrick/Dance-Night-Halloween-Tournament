import * as THREE from 'three';
import {FaceLandmarker,FilesetResolver} from '@mediapipe/tasks-vision';
export const faceEffects=[{id:'none',name:'Sem efeito',icon:'◯'},{id:'bunny',name:'Coelhinho',icon:'🐰'},{id:'hearts',name:'Corações',icon:'💕'},{id:'skulls',name:'Caveiras',icon:'💀'},{id:'devil',name:'Chifrinhos',icon:'😈'},{id:'cat',name:'Gatinho',icon:'🐱'},{id:'angel',name:'Anjinho',icon:'😇'}];
const material=(color,metalness=.1)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.32});
function mesh(group,geometry,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m}
function ball(group,mat,x,y,z,sx,sy=sx,sz=sx){return mesh(group,new THREE.SphereGeometry(1,24,16),mat,x,y,z,sx,sy,sz)}
function heartGeometry(){const s=new THREE.Shape();s.moveTo(0,-.45);s.bezierCurveTo(-.15,-.3,-.6,0,-.5,.3);s.bezierCurveTo(-.4,.6,-.1,.65,0,.35);s.bezierCurveTo(.1,.65,.4,.6,.5,.3);s.bezierCurveTo(.6,0,.15,-.3,0,-.45);const g=new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.055,bevelThickness:.055});g.center();return g}
function skull(){const g=new THREE.Group(),bone=material('#f5e4ce'),dark=material('#382338');ball(g,bone,0,.035,0,.15,.17,.12);mesh(g,new THREE.BoxGeometry(.19,.12,.17),bone,0,-.1,0);for(const x of [-.061,.061])ball(g,dark,x,.045,.104,.044,.05,.026);mesh(g,new THREE.ConeGeometry(.025,.046,3),dark,0,-.025,.128).rotation.z=Math.PI;for(let i=0;i<5;i++)mesh(g,new THREE.BoxGeometry(.005,.043,.012),dark,(i-2)*.03,-.13,.09);return g}
function disposeObject(group){const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}
export function buildAccessory(id){
 const root=new THREE.Group();root.userData.animate=()=>{};
 const cream=material('#fff0df'),pink=material('#e88fbd'),gold=material('#ffd476',.65);
 // All accessories are modeled meshes with depth, light and their own animation.
 if(id==='bunny'){
  const ears=[];
  for(const side of [-1,1]){const pivot=new THREE.Group();pivot.position.set(side*.26,.04,0);root.add(pivot);ball(pivot,cream,0,.32,0,.13,.4,.085);ball(pivot,pink,0,.33,.075,.075,.3,.025);ears.push(pivot)}
  root.userData.animate=t=>ears.forEach((e,i)=>{e.rotation.z=(i?-.12:.12)+Math.sin(t*2.5+i)*.12;e.rotation.x=Math.sin(t*2+i)*.12});
 }else if(id==='hearts'){
  const hearts=Array.from({length:6},(_,i)=>{const m=mesh(root,heartGeometry(),material(i%2?'#f3b0cc':'#e64b91',.3));m.scale.setScalar(.2);return m});
  root.userData.animate=t=>hearts.forEach((h,i)=>{const a=i/6*Math.PI*2+t*.65;h.position.set(Math.cos(a)*.68,.13+Math.sin(a)*.27,Math.sin(a)*.15);h.rotation.y=Math.sin(t*1.5+i)*.45;h.rotation.z=Math.sin(t+i)*.18;h.scale.setScalar(.17+Math.sin(t*3+i)*.025)});
 }else if(id==='skulls'){
  const skulls=Array.from({length:3},()=>{const g=skull();root.add(g);return g});
  root.userData.animate=t=>skulls.forEach((s,i)=>{const a=(i-1)*1.05;s.position.set(Math.sin(a)*.7,.16+Math.cos(a)*.2+Math.sin(t*2+i)*.055,.04);s.rotation.y=Math.sin(t*1.4+i)*.4;s.rotation.z=Math.sin(t+i)*.12});
 }else if(id==='devil'){
  const red=material('#b92a59',.35),horns=[];
  for(const side of [-1,1]){const g=new THREE.Group();g.position.set(side*.34,.02,0);root.add(g);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(side*.04,.16,0),new THREE.Vector3(side*.01,.32,-.02),new THREE.Vector3(-side*.09,.45,0)]);const geo=new THREE.TubeGeometry(curve,24,.08,12,false);const pos=geo.attributes.position;for(let ring=0;ring<=24;ring++){const center=curve.getPointAt(ring/24);for(let j=0;j<=12;j++){const index=ring*13+j;const v=new THREE.Vector3().fromBufferAttribute(pos,index).sub(center).multiplyScalar(1-ring/24*.94).add(center);pos.setXYZ(index,v.x,v.y,v.z)}}geo.computeVertexNormals();mesh(g,geo,red);horns.push(g)}
  root.userData.animate=t=>horns.forEach((h,i)=>h.rotation.z=Math.sin(t*2+i)*.06);
 }else if(id==='cat'){
  const fur=material('#3d2b43'),ears=[];
  const triangle=new THREE.Shape();triangle.moveTo(-.16,0);triangle.lineTo(0,.37);triangle.lineTo(.16,0);triangle.closePath();
  for(const side of [-1,1]){const g=new THREE.Group();g.position.set(side*.32,0,0);g.rotation.z=-side*.2;root.add(g);mesh(g,new THREE.ExtrudeGeometry(triangle,{depth:.08,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2,steps:1}),fur);mesh(g,new THREE.ShapeGeometry(triangle),pink,0,.045,.11,.63,.68,1);ears.push(g)}
  const nose=ball(root,pink,0,-.42,.18,.065,.045,.04);
  for(const side of [-1,1])for(let i=0;i<3;i++){const line=mesh(root,new THREE.CylinderGeometry(.006,.006,.28,8),cream,side*.32,-.44+i*.045,.13);line.rotation.z=side*(Math.PI/2+(i-1)*.17)}
  root.userData.animate=t=>{ears.forEach((e,i)=>e.rotation.z=(i?-.2:.2)+Math.sin(t*2+i)*.08);nose.scale.x=.065+Math.sin(t*3)*.003};
 }else if(id==='angel'){
  const halo=mesh(root,new THREE.TorusGeometry(.48,.035,16,64),gold,0,.24,0);halo.rotation.x=1.12;
  const stars=Array.from({length:5},(_,i)=>ball(root,gold,0,0,0,.025));
  root.userData.animate=t=>{halo.position.y=.25+Math.sin(t*1.5)*.05;halo.rotation.z=t*.3;stars.forEach((s,i)=>{const a=t+i*1.25;s.position.set(Math.cos(a)*.62,.18+Math.sin(a*2)*.18,Math.sin(a)*.2);s.scale.setScalar(.015+(Math.sin(t*3+i)+1)*.012)})};
 }
 // Release unused palette materials as well as scene-owned ones on disposal.
 root.userData.palette=[cream,pink,gold];return root;
}
export async function createFaceEffects(video,canvas,onStatus){
 let detector,renderer;
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setClearColor(0,0);renderer.setPixelRatio(1);
  const assets=await FilesetResolver.forVisionTasks('/face-effects/wasm');
  detector=await FaceLandmarker.createFromOptions(assets,{baseOptions:{modelAssetPath:'/face-effects/face_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numFaces:1,minFaceDetectionConfidence:.55,minTrackingConfidence:.55});
 }catch(error){renderer?.dispose();throw error}
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,1,1,0,-3000,3000),anchor=new THREE.Group();scene.add(anchor);scene.add(new THREE.HemisphereLight(0xffe6d9,0x584576,2.4));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-1,2,4);scene.add(light);
 let accessory=null,active='none',frame=0,lastDetect=-Infinity,lastVideo=-1,lastSeen=-Infinity,lastTimestamp=-1,closed=false,found=false,width=0,height=0;
 const setEffect=id=>{if(accessory){anchor.remove(accessory);disposeObject(accessory);accessory.userData.palette.forEach(m=>m.dispose())}active=id;found=false;lastSeen=-Infinity;lastVideo=-1;lastDetect=-Infinity;accessory=buildAccessory(id);anchor.add(accessory);anchor.visible=false};
 setEffect('none');
 function render(now=performance.now()){
  if(closed)return;
  if(video.readyState>=2&&video.videoWidth){
   const w=video.videoWidth,h=video.videoHeight;
   if(w!==width||h!==height){width=w;height=h;const ratio=Math.min(1,1280/w);renderer.setSize(Math.round(w*ratio),Math.round(h*ratio),false);camera.right=w;camera.top=h;camera.updateProjectionMatrix()}
   if(active!=='none'&&now-lastDetect>85&&video.currentTime!==lastVideo){
    lastDetect=now;lastVideo=video.currentTime;
    try{lastTimestamp=Math.max(now,lastTimestamp+1);const points=detector.detectForVideo(video,lastTimestamp).faceLandmarks[0];if(points){lastSeen=now;const forehead=points[10],left=points[33],right=points[263],nose=points[1];const dx=(right.x-left.x)*w,dy=-(right.y-left.y)*h;const faceWidth=Math.hypot((points[454].x-points[234].x)*w,(points[454].y-points[234].y)*h);const pos=new THREE.Vector3(forehead.x*w,h-forehead.y*h,0);if(!anchor.visible)anchor.position.copy(pos);else anchor.position.lerp(pos,.6);const size=Math.max(40,faceWidth);anchor.scale.lerp(new THREE.Vector3(size,size,size),.65);anchor.rotation.z=Math.atan2(dy,dx);anchor.rotation.y=THREE.MathUtils.clamp((nose.x-(left.x+right.x)/2)/Math.max(.02,Math.abs(right.x-left.x))*1.4,-.65,.65)}}catch(error){console.error('Face tracking failed:',error);onStatus('error')}
   }
   const visible=active!=='none'&&now-lastSeen<350;anchor.visible=visible;
   if(visible!==found){found=visible;onStatus(visible?'tracking':'searching')}
   accessory?.userData.animate(now/1000);renderer.render(scene,camera);
  }
 }
 const tick=now=>{render(now);if(!closed)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);
 return {setEffect,render,dispose(){closed=true;cancelAnimationFrame(frame);detector.close();if(accessory){disposeObject(accessory);accessory.userData.palette.forEach(m=>m.dispose())}renderer.dispose()}};
}


