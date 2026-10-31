import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root=fileURLToPath(new URL('../',import.meta.url));
const destination=path.join(root,'exports','Halloween-Ball-Tablet.html');
const selectedEngine=new Set(['vision_wasm_nosimd_internal.js','vision_wasm_nosimd_internal.wasm']);
const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.js':'application/javascript','.wasm':'application/wasm','.task':'application/octet-stream'};
const assets={};
async function collect(directory){
 for(const item of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,item.name);
  if(item.isDirectory()){await collect(file);continue}
  const extension=path.extname(file);if(!mime[extension])continue;
  if(file.includes(path.join('face-effects','wasm'))&&!selectedEngine.has(item.name))continue;
  const key='/'+path.relative(path.join(root,'public'),file).split(path.sep).join('/');
  assets[key]={mime:mime[extension],data:(await fs.readFile(file)).toString('base64')};
 }
}
await collect(path.join(root,'public'));
const notices=[];
for(const [name,licenseFile] of [['react','LICENSE'],['react-dom','LICENSE'],['scheduler','LICENSE'],['framer-motion','LICENSE.md'],['motion-dom','LICENSE.md'],['motion-utils','LICENSE.md'],['lucide-react','LICENSE'],['three','LICENSE'],['tailwindcss','LICENSE']]){
 const directory=path.join(root,'node_modules',name),metadata=JSON.parse(await fs.readFile(path.join(directory,'package.json'),'utf8'));
 notices.push({name,version:metadata.version,license:metadata.license,text:await fs.readFile(path.join(directory,licenseFile),'utf8')});
}
notices.push({name:'MediaPipe Tasks Vision',license:'Apache-2.0',modifications:'The offline export embeds the noSIMD runtime/model and disables remote usage logging.',text:await fs.readFile(path.join(root,'licenses','Apache-2.0.txt'),'utf8')});
for(const [name,file] of [['Berkshire Swash','public/fonts/OFL-BerkshireSwash.txt'],['React Bits ShapeGrid','src/vendor/react-bits/LICENSE.md']])notices.push({name,text:await fs.readFile(path.join(root,file),'utf8')});
let embeddedFaceEffects=false,disabledRemoteLogging=false;
const result=await build({
 root,configFile:false,base:'/',plugins:[tailwindcss(),{
  name:'portable-face-effects',enforce:'pre',transform(code,id){
   const normalizedId=path.normalize(id.split('?')[0]);
   if(normalizedId===path.join(root,'node_modules','@mediapipe','tasks-vision','vision_bundle.mjs')){
    // The standalone file must never create the SDK's remote telemetry logger.
    const logger='this.m=new Ch(r)';
    if(code.split(logger).length!==2)throw Error('MediaPipe logging changed. Review the offline export before updating.');
    disabledRemoteLogging=true;
    return code.replace(logger,'this.m={error:true,i:[],close(){},flush(done){done?.()}}');
   }
   if(normalizedId===path.join(root,'src','faceEffects.js')){
    const loader="const assets=await FilesetResolver.forVisionTasks('/face-effects/wasm');";
    const model="modelAssetPath:'/face-effects/face_landmarker.task'";
    if(!code.includes(loader)||!code.includes(model))throw Error('Face-effect initialization changed. Update the tablet exporter.');
    embeddedFaceEffects=true;
    return code.replace(loader,'const assets=window.__HALLOWEEN_PORTABLE__.faceFileset();').replace(model,'modelAssetBuffer:window.__HALLOWEEN_PORTABLE__.modelBuffer()');
   }
   if(normalizedId===path.join(root,'src','main.jsx'))return code.replace('Memória cheia. Exporte o torneio para preservar os dados.','Este modo de abertura não permite salvar o progresso. Mantenha esta aba aberta para preservar o torneio.');
  }
 }],
 build:{write:false,copyPublicDir:false,assetsInlineLimit:Infinity,cssCodeSplit:false,target:'es2022',minify:'esbuild',rollupOptions:{input:path.join(root,'src','main.jsx'),output:{format:'iife',name:'HalloweenBallTablet',inlineDynamicImports:true}}}
});
if(!embeddedFaceEffects)throw Error('The offline camera assets were not linked into the bundle.');
if(!disabledRemoteLogging)throw Error('Remote camera logging was not disabled in the offline bundle.');
const output=Array.isArray(result)?result[0].output:result.output;
const chunks=output.filter(item=>item.type==='chunk');if(chunks.length!==1)throw Error('Portable export must have exactly one JavaScript bundle.');
let javascript=chunks[0].code;
const css=output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>String(item.source)).join('\n');
for(const key of Object.keys(assets))for(const quote of ['"',"'",'`'])javascript=javascript.replaceAll(quote+key+quote,`window.__HALLOWEEN_PORTABLE__.url(${JSON.stringify(key)})`);
const missing=[...javascript.matchAll(/["'](\/[^"']+\.(?:png|jpe?g|svg|ttf|woff2?|task|wasm))["']/g)].map(match=>match[1]).filter(key=>!assets[key]);
if(missing.length)throw Error('Unpacked resources: '+missing.join(', '));
const escapeScript=text=>text.replace(/<\/script/gi,'<\\/script');
const bootstrap=String.raw`
(function(){
 'use strict';
 function read(id){const element=document.getElementById(id),value=JSON.parse(element.textContent);element.remove();return value}
 const assets=read('portable-assets'),urls=new Map();
 function bytes(key){const asset=assets[key];if(!asset)throw Error('Missing offline asset: '+key);const raw=atob(asset.data),data=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)data[i]=raw.charCodeAt(i);return data}
 function url(key){if(!urls.has(key)){const asset=assets[key];if(!asset)throw Error('Missing offline asset: '+key);urls.set(key,URL.createObjectURL(new Blob([bytes(key)],{type:asset.mime})))}return urls.get(key)}
 window.__HALLOWEEN_PORTABLE__={url,bytes,modelBuffer(){return bytes('/face-effects/face_landmarker.task')},faceFileset(){return {wasmLoaderPath:url('/face-effects/wasm/vision_wasm_nosimd_internal.js'),wasmBinaryPath:url('/face-effects/wasm/vision_wasm_nosimd_internal.wasm')}}};
 if(typeof crypto.randomUUID!=='function')Object.defineProperty(crypto,'randomUUID',{value(){const values=crypto.getRandomValues(new Uint8Array(16));values[6]=(values[6]&15)|64;values[8]=(values[8]&63)|128;const hex=Array.from(values,value=>value.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20)}});
 const style=document.createElement('style');style.textContent=read('portable-css').replace(/url\(\s*(["']?)(\/[^"')]+)\1\s*\)/g,(match,quote,key)=>assets[key]?'url("'+url(key)+'")':match);document.head.appendChild(style);
})();`;
const html=`<!doctype html>\n<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"><meta name="theme-color" content="#170d19"><meta name="application-name" content="Halloween Ball Night"><title>Halloween Ball Night · Tablet</title><style>html,body{margin:0;background:#170d19;color:#f5e9d5;font-family:system-ui,sans-serif}.portable-loading{min-height:100dvh;display:grid;place-content:center;text-align:center;gap:12px}.portable-loading strong{font-size:25px}.portable-loading span{font-size:14px;color:#d4aec8}noscript{display:block;padding:24px;line-height:1.6}</style></head><body><div id="root"><div class="portable-loading" role="status"><strong>Halloween Ball Night ✦</strong><span>Preparando a pista…</span></div></div><noscript>Abra este arquivo em um navegador com JavaScript ativado, como o Chrome no Android.</noscript><script id="portable-assets" type="application/json">${escapeScript(JSON.stringify(assets))}</script><script id="portable-css" type="application/json">${escapeScript(JSON.stringify(css))}</script><script>${escapeScript(bootstrap)}</script><script>${escapeScript(javascript)}</script></body></html>\n`;
const licensedHtml=html.replace('</body>',`<script id="portable-licenses" type="application/json">${escapeScript(JSON.stringify(notices))}</script></body>`);
await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,licensedHtml,'utf8');
await fs.writeFile(path.join(root,'exports','COMO-USAR-NO-TABLET.txt'),`HALLOWEEN BALL NIGHT — ANDROID\n\n1. Copie o arquivo Halloween-Ball-Tablet.html para o tablet (Downloads, por exemplo).\n2. Abra o arquivo em um navegador com JavaScript, como o Chrome. Evite apenas visualizar a prévia do arquivo.\n3. O aplicativo, as imagens, a fonte e os efeitos estão dentro do HTML. Não é preciso instalar Node, abrir o Vite ou manter o computador ligado.\n4. O torneio e as músicas editadas ficam no armazenamento do navegador desse tablet. O arquivo começa com a lista original de músicas; ele não copia automaticamente os dados de outro navegador.\n5. Câmera e efeitos dependem de o navegador permitir a câmera ao abrir um arquivo local. Se a câmera for bloqueada, use “Ou envie uma foto” no cadastro.\n6. Para manter a versão atual do app no arquivo, gere-o novamente com npm run export:tablet.\n`,'utf8');
console.log('HTML exportado: '+destination);console.log('Tamanho: '+(Buffer.byteLength(licensedHtml)/1024/1024).toFixed(1)+' MB; '+Object.keys(assets).length+' recursos incorporados.');
