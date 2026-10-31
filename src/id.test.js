import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createId} from './id.js';

function withCrypto(t,crypto){
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:crypto});
 t.after(()=>Object.defineProperty(globalThis,'crypto',descriptor));
}

test('prefere randomUUID nativo preservando seu contexto',t=>{
 const native={randomUUID(){assert.equal(this,native);return 'native-id'},getRandomValues(){assert.fail('fallback desnecessário')}};
 withCrypto(t,native);
 assert.equal(createId(),'native-id');
});

test('fallback em HTTP produz UUID v4 com os bits RFC 4122 e preserva os bytes aleatórios',t=>{
 let calls=0;
 const fallback={getRandomValues(bytes){assert.equal(this,fallback);assert.ok(bytes instanceof Uint8Array);assert.equal(bytes.length,16);calls++;bytes.set(Array.from({length:16},(_,i)=>i*17));return bytes}};
 withCrypto(t,fallback);
 assert.equal(createId(),'00112233-4455-4677-8899-aabbccddeeff');
 assert.equal(calls,1);
});

test('fallback gera identificadores válidos e distintos com getRandomValues',t=>{
 withCrypto(t,{getRandomValues:webcrypto.getRandomValues.bind(webcrypto)});
 const ids=Array.from({length:2048},()=>createId());
 assert.ok(ids.every(id=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)));
 assert.equal(new Set(ids).size,ids.length);
});
