const Km=()=>{};var bc={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hh=function(r){const t=[];let e=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?t[e++]=s:s<2048?(t[e++]=s>>6|192,t[e++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),t[e++]=s>>18|240,t[e++]=s>>12&63|128,t[e++]=s>>6&63|128,t[e++]=s&63|128):(t[e++]=s>>12|224,t[e++]=s>>6&63|128,t[e++]=s&63|128)}return t},Hm=function(r){const t=[];let e=0,n=0;for(;e<r.length;){const s=r[e++];if(s<128)t[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[e++];t[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[e++],o=r[e++],u=r[e++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|u&63)-65536;t[n++]=String.fromCharCode(55296+(c>>10)),t[n++]=String.fromCharCode(56320+(c&1023))}else{const i=r[e++],o=r[e++];t[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return t.join("")},dh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,t){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,u=o?r[s+1]:0,c=s+2<r.length,h=c?r[s+2]:0,f=i>>2,p=(i&3)<<4|u>>4;let g=(u&15)<<2|h>>6,b=h&63;c||(b=64,o||(g=64)),n.push(e[f],e[p],e[g],e[b])}return n.join("")},encodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(r):this.encodeByteArray(hh(r),t)},decodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(r):Hm(this.decodeStringToByteArray(r,t))},decodeStringToByteArray(r,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=e[r.charAt(s++)],u=s<r.length?e[r.charAt(s)]:0;++s;const h=s<r.length?e[r.charAt(s)]:64;++s;const p=s<r.length?e[r.charAt(s)]:64;if(++s,i==null||u==null||h==null||p==null)throw new Qm;const g=i<<2|u>>4;if(n.push(g),h!==64){const b=u<<4&240|h>>2;if(n.push(b),p!==64){const D=h<<6&192|p;n.push(D)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Qm extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Wm=function(r){const t=hh(r);return dh.encodeByteArray(t,!0)},ni=function(r){return Wm(r).replace(/\./g,"")},Xm=function(r){try{return dh.decodeString(r,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jm=()=>fh().__FIREBASE_DEFAULTS__,Ym=()=>{if(typeof process>"u"||typeof bc>"u")return;const r=bc.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Zm=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=r&&Xm(r[1]);return t&&JSON.parse(t)},ha=()=>{try{return Km()||Jm()||Ym()||Zm()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},tp=r=>{var t,e;return(e=(t=ha())==null?void 0:t.emulatorHosts)==null?void 0:e[r]},mh=r=>{const t=tp(r);if(!t)return;const e=t.lastIndexOf(":");if(e<=0||e+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const n=parseInt(t.substring(e+1),10);return t[0]==="["?[t.substring(1,e-1),n]:[t.substring(0,e),n]},ph=()=>{var r;return(r=ha())==null?void 0:r.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ep{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,n)=>{e?this.reject(e):this.resolve(n),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(e):t(e,n))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jn(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function da(r){return(await fetch(r,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gh(r,t){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const e={alg:"none",type:"JWT"},n=t||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...r};return[ni(JSON.stringify(e)),ni(JSON.stringify(o)),""].join(".")}const Dr={};function np(){const r={prod:[],emulator:[]};for(const t of Object.keys(Dr))Dr[t]?r.emulator.push(t):r.prod.push(t);return r}function rp(r){let t=document.getElementById(r),e=!1;return t||(t=document.createElement("div"),t.setAttribute("id",r),e=!0),{created:e,element:t}}let Sc=!1;function _h(r,t){if(typeof window>"u"||typeof document>"u"||!Jn(window.location.host)||Dr[r]===t||Dr[r]||Sc)return;Dr[r]=t;function e(g){return`__firebase__banner__${g}`}const n="__firebase__banner",i=np().prod.length>0;function o(){const g=document.getElementById(n);g&&g.remove()}function u(g){g.style.display="flex",g.style.background="#7faaf0",g.style.position="fixed",g.style.bottom="5px",g.style.left="5px",g.style.padding=".5em",g.style.borderRadius="5px",g.style.alignItems="center"}function c(g,b){g.setAttribute("width","24"),g.setAttribute("id",b),g.setAttribute("height","24"),g.setAttribute("viewBox","0 0 24 24"),g.setAttribute("fill","none"),g.style.marginLeft="-6px"}function h(){const g=document.createElement("span");return g.style.cursor="pointer",g.style.marginLeft="16px",g.style.fontSize="24px",g.innerHTML=" &times;",g.onclick=()=>{Sc=!0,o()},g}function f(g,b){g.setAttribute("id",b),g.innerText="Learn more",g.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",g.setAttribute("target","__blank"),g.style.paddingLeft="5px",g.style.textDecoration="underline"}function p(){const g=rp(n),b=e("text"),D=document.getElementById(b)||document.createElement("span"),x=e("learnmore"),V=document.getElementById(x)||document.createElement("a"),j=e("preprendIcon"),q=document.getElementById(j)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(g.created){const B=g.element;u(B),f(V,x);const z=h();c(q,j),B.append(q,D,V,z),document.body.appendChild(B)}i?(D.innerText="Preview backend disconnected.",q.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(q.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,D.innerText="Preview backend running in this workspace."),D.setAttribute("id",b)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ri(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function yh(){var t;const r=(t=ha())==null?void 0:t.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ih(){return!yh()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Th(){return!yh()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Eh(){try{return typeof indexedDB=="object"}catch{return!1}}function sp(){return new Promise((r,t)=>{try{let e=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),e||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{e=!1},s.onerror=()=>{var i;t(((i=s.error)==null?void 0:i.message)||"")}}catch(e){t(e)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ip="FirebaseError";class mn extends Error{constructor(t,e,n){super(e),this.code=t,this.customData=n,this.name=ip,Object.setPrototypeOf(this,mn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,wh.prototype.create)}}class wh{constructor(t,e,n){this.service=t,this.serviceName=e,this.errors=n}create(t,...e){const n=e[0]||{},s=`${this.service}/${t}`,i=this.errors[t],o=i?op(i,n):"Error",u=`${this.serviceName}: ${o} (${s}).`;return new mn(s,u,n)}}function op(r,t){return r.replace(ap,(e,n)=>{const s=t[n];return s!=null?String(s):`<${n}?>`})}const ap=/\{\$([^}]+)}/g;function jr(r,t){if(r===t)return!0;const e=Object.keys(r),n=Object.keys(t);for(const s of e){if(!n.includes(s))return!1;const i=r[s],o=t[s];if(Pc(i)&&Pc(o)){if(!jr(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!e.includes(s))return!1;return!0}function Pc(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function At(r){return r&&r._delegate?r._delegate:r}class xn{constructor(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const He="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class up{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const n=new ep;if(this.instancesDeferred.set(e,n),this.isInitialized(e)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:e});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(e).promise}getImmediate(t){const e=this.normalizeInstanceIdentifier(t==null?void 0:t.identifier),n=(t==null?void 0:t.optional)??!1;if(this.isInitialized(e)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:e})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(lp(t))try{this.getOrInitializeService({instanceIdentifier:He})}catch{}for(const[e,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(e);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(t=He){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...t.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=He){return this.instances.has(t)}getOptions(t=He){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,n=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:e});for(const[i,o]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(i);n===u&&o.resolve(s)}return s}onInit(t,e){const n=this.normalizeInstanceIdentifier(e),s=this.onInitCallbacks.get(n)??new Set;s.add(t),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&t(i,n),()=>{s.delete(t)}}invokeOnInitCallbacks(t,e){const n=this.onInitCallbacks.get(e);if(n)for(const s of n)try{s(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let n=this.instances.get(t);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:cp(t),options:e}),this.instances.set(t,n),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(n,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,n)}catch{}return n||null}normalizeInstanceIdentifier(t=He){return this.component?this.component.multipleInstances?t:He:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function cp(r){return r===He?void 0:r}function lp(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hp{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new up(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var J;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(J||(J={}));const dp={debug:J.DEBUG,verbose:J.VERBOSE,info:J.INFO,warn:J.WARN,error:J.ERROR,silent:J.SILENT},fp=J.INFO,mp={[J.DEBUG]:"log",[J.VERBOSE]:"log",[J.INFO]:"info",[J.WARN]:"warn",[J.ERROR]:"error"},pp=(r,t,...e)=>{if(t<r.logLevel)return;const n=new Date().toISOString(),s=mp[t];if(s)console[s](`[${n}]  ${r.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class Ah{constructor(t){this.name=t,this._logLevel=fp,this._logHandler=pp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in J))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?dp[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,J.DEBUG,...t),this._logHandler(this,J.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,J.VERBOSE,...t),this._logHandler(this,J.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,J.INFO,...t),this._logHandler(this,J.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,J.WARN,...t),this._logHandler(this,J.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,J.ERROR,...t),this._logHandler(this,J.ERROR,...t)}}const gp=(r,t)=>t.some(e=>r instanceof e);let Vc,Cc;function _p(){return Vc||(Vc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function yp(){return Cc||(Cc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const vh=new WeakMap,xo=new WeakMap,Rh=new WeakMap,_o=new WeakMap,fa=new WeakMap;function Ip(r){const t=new Promise((e,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",o)},i=()=>{e(ve(r.result)),s()},o=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",o)});return t.then(e=>{e instanceof IDBCursor&&vh.set(e,r)}).catch(()=>{}),fa.set(t,r),t}function Tp(r){if(xo.has(r))return;const t=new Promise((e,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",o),r.removeEventListener("abort",o)},i=()=>{e(),s()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",o),r.addEventListener("abort",o)});xo.set(r,t)}let No={get(r,t,e){if(r instanceof IDBTransaction){if(t==="done")return xo.get(r);if(t==="objectStoreNames")return r.objectStoreNames||Rh.get(r);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return ve(r[t])},set(r,t,e){return r[t]=e,!0},has(r,t){return r instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in r}};function Ep(r){No=r(No)}function wp(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const n=r.call(yo(this),t,...e);return Rh.set(n,t.sort?t.sort():[t]),ve(n)}:yp().includes(r)?function(...t){return r.apply(yo(this),t),ve(vh.get(this))}:function(...t){return ve(r.apply(yo(this),t))}}function Ap(r){return typeof r=="function"?wp(r):(r instanceof IDBTransaction&&Tp(r),gp(r,_p())?new Proxy(r,No):r)}function ve(r){if(r instanceof IDBRequest)return Ip(r);if(_o.has(r))return _o.get(r);const t=Ap(r);return t!==r&&(_o.set(r,t),fa.set(t,r)),t}const yo=r=>fa.get(r);function vp(r,t,{blocked:e,upgrade:n,blocking:s,terminated:i}={}){const o=indexedDB.open(r,t),u=ve(o);return n&&o.addEventListener("upgradeneeded",c=>{n(ve(o.result),c.oldVersion,c.newVersion,ve(o.transaction),c)}),e&&o.addEventListener("blocked",c=>e(c.oldVersion,c.newVersion,c)),u.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),u}const Rp=["get","getKey","getAll","getAllKeys","count"],bp=["put","add","delete","clear"],Io=new Map;function Dc(r,t){if(!(r instanceof IDBDatabase&&!(t in r)&&typeof t=="string"))return;if(Io.get(t))return Io.get(t);const e=t.replace(/FromIndex$/,""),n=t!==e,s=bp.includes(e);if(!(e in(n?IDBIndex:IDBObjectStore).prototype)||!(s||Rp.includes(e)))return;const i=async function(o,...u){const c=this.transaction(o,s?"readwrite":"readonly");let h=c.store;return n&&(h=h.index(u.shift())),(await Promise.all([h[e](...u),s&&c.done]))[0]};return Io.set(t,i),i}Ep(r=>({...r,get:(t,e,n)=>Dc(t,e)||r.get(t,e,n),has:(t,e)=>!!Dc(t,e)||r.has(t,e)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sp{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(Pp(e)){const n=e.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(e=>e).join(" ")}}function Pp(r){const t=r.getComponent();return(t==null?void 0:t.type)==="VERSION"}const ko="@firebase/app",xc="0.14.6";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ie=new Ah("@firebase/app"),Vp="@firebase/app-compat",Cp="@firebase/analytics-compat",Dp="@firebase/analytics",xp="@firebase/app-check-compat",Np="@firebase/app-check",kp="@firebase/auth",Op="@firebase/auth-compat",Mp="@firebase/database",Fp="@firebase/data-connect",Lp="@firebase/database-compat",Bp="@firebase/functions",Up="@firebase/functions-compat",qp="@firebase/installations",jp="@firebase/installations-compat",zp="@firebase/messaging",$p="@firebase/messaging-compat",Gp="@firebase/performance",Kp="@firebase/performance-compat",Hp="@firebase/remote-config",Qp="@firebase/remote-config-compat",Wp="@firebase/storage",Xp="@firebase/storage-compat",Jp="@firebase/firestore",Yp="@firebase/ai",Zp="@firebase/firestore-compat",tg="firebase",eg="12.6.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oo="[DEFAULT]",ng={[ko]:"fire-core",[Vp]:"fire-core-compat",[Dp]:"fire-analytics",[Cp]:"fire-analytics-compat",[Np]:"fire-app-check",[xp]:"fire-app-check-compat",[kp]:"fire-auth",[Op]:"fire-auth-compat",[Mp]:"fire-rtdb",[Fp]:"fire-data-connect",[Lp]:"fire-rtdb-compat",[Bp]:"fire-fn",[Up]:"fire-fn-compat",[qp]:"fire-iid",[jp]:"fire-iid-compat",[zp]:"fire-fcm",[$p]:"fire-fcm-compat",[Gp]:"fire-perf",[Kp]:"fire-perf-compat",[Hp]:"fire-rc",[Qp]:"fire-rc-compat",[Wp]:"fire-gcs",[Xp]:"fire-gcs-compat",[Jp]:"fire-fst",[Zp]:"fire-fst-compat",[Yp]:"fire-vertex","fire-js":"fire-js",[tg]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const si=new Map,rg=new Map,Mo=new Map;function Nc(r,t){try{r.container.addComponent(t)}catch(e){ie.debug(`Component ${t.name} failed to register with FirebaseApp ${r.name}`,e)}}function zr(r){const t=r.name;if(Mo.has(t))return ie.debug(`There were multiple attempts to register component ${t}.`),!1;Mo.set(t,r);for(const e of si.values())Nc(e,r);for(const e of rg.values())Nc(e,r);return!0}function ma(r,t){const e=r.container.getProvider("heartbeat").getImmediate({optional:!0});return e&&e.triggerHeartbeat(),r.container.getProvider(t)}function bh(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Re=new wh("app","Firebase",sg);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(t,e,n){this._isDeleted=!1,this._options={...t},this._config={...e},this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new xn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw Re.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sh=eg;function og(r,t={}){let e=r;typeof t!="object"&&(t={name:t});const n={name:Oo,automaticDataCollectionEnabled:!0,...t},s=n.name;if(typeof s!="string"||!s)throw Re.create("bad-app-name",{appName:String(s)});if(e||(e=ph()),!e)throw Re.create("no-options");const i=si.get(s);if(i){if(jr(e,i.options)&&jr(n,i.config))return i;throw Re.create("duplicate-app",{appName:s})}const o=new hp(s);for(const c of Mo.values())o.addComponent(c);const u=new ig(e,n,o);return si.set(s,u),u}function Ph(r=Oo){const t=si.get(r);if(!t&&r===Oo&&ph())return og();if(!t)throw Re.create("no-app",{appName:r});return t}function be(r,t,e){let n=ng[r]??r;e&&(n+=`-${e}`);const s=n.match(/\s|\//),i=t.match(/\s|\//);if(s||i){const o=[`Unable to register library "${n}" with version "${t}":`];s&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${t}" contains illegal characters (whitespace or "/")`),ie.warn(o.join(" "));return}zr(new xn(`${n}-version`,()=>({library:n,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ag="firebase-heartbeat-database",ug=1,$r="firebase-heartbeat-store";let To=null;function Vh(){return To||(To=vp(ag,ug,{upgrade:(r,t)=>{switch(t){case 0:try{r.createObjectStore($r)}catch(e){console.warn(e)}}}}).catch(r=>{throw Re.create("idb-open",{originalErrorMessage:r.message})})),To}async function cg(r){try{const e=(await Vh()).transaction($r),n=await e.objectStore($r).get(Ch(r));return await e.done,n}catch(t){if(t instanceof mn)ie.warn(t.message);else{const e=Re.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});ie.warn(e.message)}}}async function kc(r,t){try{const n=(await Vh()).transaction($r,"readwrite");await n.objectStore($r).put(t,Ch(r)),await n.done}catch(e){if(e instanceof mn)ie.warn(e.message);else{const n=Re.create("idb-set",{originalErrorMessage:e==null?void 0:e.message});ie.warn(n.message)}}}function Ch(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lg=1024,hg=30;class dg{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new mg(e),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var t,e;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Oc();if(((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>hg){const o=pg(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){ie.warn(n)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=Oc(),{heartbeatsToSend:n,unsentEntries:s}=fg(this._heartbeatsCache.heartbeats),i=ni(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(e){return ie.warn(e),""}}}function Oc(){return new Date().toISOString().substring(0,10)}function fg(r,t=lg){const e=[];let n=r.slice();for(const s of r){const i=e.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Mc(e)>t){i.dates.pop();break}}else if(e.push({agent:s.agent,dates:[s.date]}),Mc(e)>t){e.pop();break}n=n.slice(1)}return{heartbeatsToSend:e,unsentEntries:n}}class mg{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Eh()?sp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await cg(this.app);return e!=null&&e.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){const n=await this.read();return kc(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){const n=await this.read();return kc(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...t.heartbeats]})}else return}}function Mc(r){return ni(JSON.stringify({version:2,heartbeats:r})).length}function pg(r){if(r.length===0)return-1;let t=0,e=r[0].date;for(let n=1;n<r.length;n++)r[n].date<e&&(e=r[n].date,t=n);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gg(r){zr(new xn("platform-logger",t=>new Sp(t),"PRIVATE")),zr(new xn("heartbeat",t=>new dg(t),"PRIVATE")),be(ko,xc,r),be(ko,xc,"esm2020"),be("fire-js","")}gg("");var _g="firebase",yg="12.6.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */be(_g,yg,"app");var Fc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Se,Dh;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(T,_){function I(){}I.prototype=_.prototype,T.F=_.prototype,T.prototype=new I,T.prototype.constructor=T,T.D=function(w,E,R){for(var y=Array(arguments.length-2),kt=2;kt<arguments.length;kt++)y[kt-2]=arguments[kt];return _.prototype[E].apply(w,y)}}function e(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}t(n,e),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,_,I){I||(I=0);const w=Array(16);if(typeof _=="string")for(var E=0;E<16;++E)w[E]=_.charCodeAt(I++)|_.charCodeAt(I++)<<8|_.charCodeAt(I++)<<16|_.charCodeAt(I++)<<24;else for(E=0;E<16;++E)w[E]=_[I++]|_[I++]<<8|_[I++]<<16|_[I++]<<24;_=T.g[0],I=T.g[1],E=T.g[2];let R=T.g[3],y;y=_+(R^I&(E^R))+w[0]+3614090360&4294967295,_=I+(y<<7&4294967295|y>>>25),y=R+(E^_&(I^E))+w[1]+3905402710&4294967295,R=_+(y<<12&4294967295|y>>>20),y=E+(I^R&(_^I))+w[2]+606105819&4294967295,E=R+(y<<17&4294967295|y>>>15),y=I+(_^E&(R^_))+w[3]+3250441966&4294967295,I=E+(y<<22&4294967295|y>>>10),y=_+(R^I&(E^R))+w[4]+4118548399&4294967295,_=I+(y<<7&4294967295|y>>>25),y=R+(E^_&(I^E))+w[5]+1200080426&4294967295,R=_+(y<<12&4294967295|y>>>20),y=E+(I^R&(_^I))+w[6]+2821735955&4294967295,E=R+(y<<17&4294967295|y>>>15),y=I+(_^E&(R^_))+w[7]+4249261313&4294967295,I=E+(y<<22&4294967295|y>>>10),y=_+(R^I&(E^R))+w[8]+1770035416&4294967295,_=I+(y<<7&4294967295|y>>>25),y=R+(E^_&(I^E))+w[9]+2336552879&4294967295,R=_+(y<<12&4294967295|y>>>20),y=E+(I^R&(_^I))+w[10]+4294925233&4294967295,E=R+(y<<17&4294967295|y>>>15),y=I+(_^E&(R^_))+w[11]+2304563134&4294967295,I=E+(y<<22&4294967295|y>>>10),y=_+(R^I&(E^R))+w[12]+1804603682&4294967295,_=I+(y<<7&4294967295|y>>>25),y=R+(E^_&(I^E))+w[13]+4254626195&4294967295,R=_+(y<<12&4294967295|y>>>20),y=E+(I^R&(_^I))+w[14]+2792965006&4294967295,E=R+(y<<17&4294967295|y>>>15),y=I+(_^E&(R^_))+w[15]+1236535329&4294967295,I=E+(y<<22&4294967295|y>>>10),y=_+(E^R&(I^E))+w[1]+4129170786&4294967295,_=I+(y<<5&4294967295|y>>>27),y=R+(I^E&(_^I))+w[6]+3225465664&4294967295,R=_+(y<<9&4294967295|y>>>23),y=E+(_^I&(R^_))+w[11]+643717713&4294967295,E=R+(y<<14&4294967295|y>>>18),y=I+(R^_&(E^R))+w[0]+3921069994&4294967295,I=E+(y<<20&4294967295|y>>>12),y=_+(E^R&(I^E))+w[5]+3593408605&4294967295,_=I+(y<<5&4294967295|y>>>27),y=R+(I^E&(_^I))+w[10]+38016083&4294967295,R=_+(y<<9&4294967295|y>>>23),y=E+(_^I&(R^_))+w[15]+3634488961&4294967295,E=R+(y<<14&4294967295|y>>>18),y=I+(R^_&(E^R))+w[4]+3889429448&4294967295,I=E+(y<<20&4294967295|y>>>12),y=_+(E^R&(I^E))+w[9]+568446438&4294967295,_=I+(y<<5&4294967295|y>>>27),y=R+(I^E&(_^I))+w[14]+3275163606&4294967295,R=_+(y<<9&4294967295|y>>>23),y=E+(_^I&(R^_))+w[3]+4107603335&4294967295,E=R+(y<<14&4294967295|y>>>18),y=I+(R^_&(E^R))+w[8]+1163531501&4294967295,I=E+(y<<20&4294967295|y>>>12),y=_+(E^R&(I^E))+w[13]+2850285829&4294967295,_=I+(y<<5&4294967295|y>>>27),y=R+(I^E&(_^I))+w[2]+4243563512&4294967295,R=_+(y<<9&4294967295|y>>>23),y=E+(_^I&(R^_))+w[7]+1735328473&4294967295,E=R+(y<<14&4294967295|y>>>18),y=I+(R^_&(E^R))+w[12]+2368359562&4294967295,I=E+(y<<20&4294967295|y>>>12),y=_+(I^E^R)+w[5]+4294588738&4294967295,_=I+(y<<4&4294967295|y>>>28),y=R+(_^I^E)+w[8]+2272392833&4294967295,R=_+(y<<11&4294967295|y>>>21),y=E+(R^_^I)+w[11]+1839030562&4294967295,E=R+(y<<16&4294967295|y>>>16),y=I+(E^R^_)+w[14]+4259657740&4294967295,I=E+(y<<23&4294967295|y>>>9),y=_+(I^E^R)+w[1]+2763975236&4294967295,_=I+(y<<4&4294967295|y>>>28),y=R+(_^I^E)+w[4]+1272893353&4294967295,R=_+(y<<11&4294967295|y>>>21),y=E+(R^_^I)+w[7]+4139469664&4294967295,E=R+(y<<16&4294967295|y>>>16),y=I+(E^R^_)+w[10]+3200236656&4294967295,I=E+(y<<23&4294967295|y>>>9),y=_+(I^E^R)+w[13]+681279174&4294967295,_=I+(y<<4&4294967295|y>>>28),y=R+(_^I^E)+w[0]+3936430074&4294967295,R=_+(y<<11&4294967295|y>>>21),y=E+(R^_^I)+w[3]+3572445317&4294967295,E=R+(y<<16&4294967295|y>>>16),y=I+(E^R^_)+w[6]+76029189&4294967295,I=E+(y<<23&4294967295|y>>>9),y=_+(I^E^R)+w[9]+3654602809&4294967295,_=I+(y<<4&4294967295|y>>>28),y=R+(_^I^E)+w[12]+3873151461&4294967295,R=_+(y<<11&4294967295|y>>>21),y=E+(R^_^I)+w[15]+530742520&4294967295,E=R+(y<<16&4294967295|y>>>16),y=I+(E^R^_)+w[2]+3299628645&4294967295,I=E+(y<<23&4294967295|y>>>9),y=_+(E^(I|~R))+w[0]+4096336452&4294967295,_=I+(y<<6&4294967295|y>>>26),y=R+(I^(_|~E))+w[7]+1126891415&4294967295,R=_+(y<<10&4294967295|y>>>22),y=E+(_^(R|~I))+w[14]+2878612391&4294967295,E=R+(y<<15&4294967295|y>>>17),y=I+(R^(E|~_))+w[5]+4237533241&4294967295,I=E+(y<<21&4294967295|y>>>11),y=_+(E^(I|~R))+w[12]+1700485571&4294967295,_=I+(y<<6&4294967295|y>>>26),y=R+(I^(_|~E))+w[3]+2399980690&4294967295,R=_+(y<<10&4294967295|y>>>22),y=E+(_^(R|~I))+w[10]+4293915773&4294967295,E=R+(y<<15&4294967295|y>>>17),y=I+(R^(E|~_))+w[1]+2240044497&4294967295,I=E+(y<<21&4294967295|y>>>11),y=_+(E^(I|~R))+w[8]+1873313359&4294967295,_=I+(y<<6&4294967295|y>>>26),y=R+(I^(_|~E))+w[15]+4264355552&4294967295,R=_+(y<<10&4294967295|y>>>22),y=E+(_^(R|~I))+w[6]+2734768916&4294967295,E=R+(y<<15&4294967295|y>>>17),y=I+(R^(E|~_))+w[13]+1309151649&4294967295,I=E+(y<<21&4294967295|y>>>11),y=_+(E^(I|~R))+w[4]+4149444226&4294967295,_=I+(y<<6&4294967295|y>>>26),y=R+(I^(_|~E))+w[11]+3174756917&4294967295,R=_+(y<<10&4294967295|y>>>22),y=E+(_^(R|~I))+w[2]+718787259&4294967295,E=R+(y<<15&4294967295|y>>>17),y=I+(R^(E|~_))+w[9]+3951481745&4294967295,T.g[0]=T.g[0]+_&4294967295,T.g[1]=T.g[1]+(E+(y<<21&4294967295|y>>>11))&4294967295,T.g[2]=T.g[2]+E&4294967295,T.g[3]=T.g[3]+R&4294967295}n.prototype.v=function(T,_){_===void 0&&(_=T.length);const I=_-this.blockSize,w=this.C;let E=this.h,R=0;for(;R<_;){if(E==0)for(;R<=I;)s(this,T,R),R+=this.blockSize;if(typeof T=="string"){for(;R<_;)if(w[E++]=T.charCodeAt(R++),E==this.blockSize){s(this,w),E=0;break}}else for(;R<_;)if(w[E++]=T[R++],E==this.blockSize){s(this,w),E=0;break}}this.h=E,this.o+=_},n.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var _=1;_<T.length-8;++_)T[_]=0;_=this.o*8;for(var I=T.length-8;I<T.length;++I)T[I]=_&255,_/=256;for(this.v(T),T=Array(16),_=0,I=0;I<4;++I)for(let w=0;w<32;w+=8)T[_++]=this.g[I]>>>w&255;return T};function i(T,_){var I=u;return Object.prototype.hasOwnProperty.call(I,T)?I[T]:I[T]=_(T)}function o(T,_){this.h=_;const I=[];let w=!0;for(let E=T.length-1;E>=0;E--){const R=T[E]|0;w&&R==_||(I[E]=R,w=!1)}this.g=I}var u={};function c(T){return-128<=T&&T<128?i(T,function(_){return new o([_|0],_<0?-1:0)}):new o([T|0],T<0?-1:0)}function h(T){if(isNaN(T)||!isFinite(T))return p;if(T<0)return V(h(-T));const _=[];let I=1;for(let w=0;T>=I;w++)_[w]=T/I|0,I*=4294967296;return new o(_,0)}function f(T,_){if(T.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(T.charAt(0)=="-")return V(f(T.substring(1),_));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');const I=h(Math.pow(_,8));let w=p;for(let R=0;R<T.length;R+=8){var E=Math.min(8,T.length-R);const y=parseInt(T.substring(R,R+E),_);E<8?(E=h(Math.pow(_,E)),w=w.j(E).add(h(y))):(w=w.j(I),w=w.add(h(y)))}return w}var p=c(0),g=c(1),b=c(16777216);r=o.prototype,r.m=function(){if(x(this))return-V(this).m();let T=0,_=1;for(let I=0;I<this.g.length;I++){const w=this.i(I);T+=(w>=0?w:4294967296+w)*_,_*=4294967296}return T},r.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(D(this))return"0";if(x(this))return"-"+V(this).toString(T);const _=h(Math.pow(T,6));var I=this;let w="";for(;;){const E=z(I,_).g;I=j(I,E.j(_));let R=((I.g.length>0?I.g[0]:I.h)>>>0).toString(T);if(I=E,D(I))return R+w;for(;R.length<6;)R="0"+R;w=R+w}},r.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function D(T){if(T.h!=0)return!1;for(let _=0;_<T.g.length;_++)if(T.g[_]!=0)return!1;return!0}function x(T){return T.h==-1}r.l=function(T){return T=j(this,T),x(T)?-1:D(T)?0:1};function V(T){const _=T.g.length,I=[];for(let w=0;w<_;w++)I[w]=~T.g[w];return new o(I,~T.h).add(g)}r.abs=function(){return x(this)?V(this):this},r.add=function(T){const _=Math.max(this.g.length,T.g.length),I=[];let w=0;for(let E=0;E<=_;E++){let R=w+(this.i(E)&65535)+(T.i(E)&65535),y=(R>>>16)+(this.i(E)>>>16)+(T.i(E)>>>16);w=y>>>16,R&=65535,y&=65535,I[E]=y<<16|R}return new o(I,I[I.length-1]&-2147483648?-1:0)};function j(T,_){return T.add(V(_))}r.j=function(T){if(D(this)||D(T))return p;if(x(this))return x(T)?V(this).j(V(T)):V(V(this).j(T));if(x(T))return V(this.j(V(T)));if(this.l(b)<0&&T.l(b)<0)return h(this.m()*T.m());const _=this.g.length+T.g.length,I=[];for(var w=0;w<2*_;w++)I[w]=0;for(w=0;w<this.g.length;w++)for(let E=0;E<T.g.length;E++){const R=this.i(w)>>>16,y=this.i(w)&65535,kt=T.i(E)>>>16,Ue=T.i(E)&65535;I[2*w+2*E]+=y*Ue,q(I,2*w+2*E),I[2*w+2*E+1]+=R*Ue,q(I,2*w+2*E+1),I[2*w+2*E+1]+=y*kt,q(I,2*w+2*E+1),I[2*w+2*E+2]+=R*kt,q(I,2*w+2*E+2)}for(T=0;T<_;T++)I[T]=I[2*T+1]<<16|I[2*T];for(T=_;T<2*_;T++)I[T]=0;return new o(I,0)};function q(T,_){for(;(T[_]&65535)!=T[_];)T[_+1]+=T[_]>>>16,T[_]&=65535,_++}function B(T,_){this.g=T,this.h=_}function z(T,_){if(D(_))throw Error("division by zero");if(D(T))return new B(p,p);if(x(T))return _=z(V(T),_),new B(V(_.g),V(_.h));if(x(_))return _=z(T,V(_)),new B(V(_.g),_.h);if(T.g.length>30){if(x(T)||x(_))throw Error("slowDivide_ only works with positive integers.");for(var I=g,w=_;w.l(T)<=0;)I=W(I),w=W(w);var E=K(I,1),R=K(w,1);for(w=K(w,2),I=K(I,2);!D(w);){var y=R.add(w);y.l(T)<=0&&(E=E.add(I),R=y),w=K(w,1),I=K(I,1)}return _=j(T,E.j(_)),new B(E,_)}for(E=p;T.l(_)>=0;){for(I=Math.max(1,Math.floor(T.m()/_.m())),w=Math.ceil(Math.log(I)/Math.LN2),w=w<=48?1:Math.pow(2,w-48),R=h(I),y=R.j(_);x(y)||y.l(T)>0;)I-=w,R=h(I),y=R.j(_);D(R)&&(R=g),E=E.add(R),T=j(T,y)}return new B(E,T)}r.B=function(T){return z(this,T).h},r.and=function(T){const _=Math.max(this.g.length,T.g.length),I=[];for(let w=0;w<_;w++)I[w]=this.i(w)&T.i(w);return new o(I,this.h&T.h)},r.or=function(T){const _=Math.max(this.g.length,T.g.length),I=[];for(let w=0;w<_;w++)I[w]=this.i(w)|T.i(w);return new o(I,this.h|T.h)},r.xor=function(T){const _=Math.max(this.g.length,T.g.length),I=[];for(let w=0;w<_;w++)I[w]=this.i(w)^T.i(w);return new o(I,this.h^T.h)};function W(T){const _=T.g.length+1,I=[];for(let w=0;w<_;w++)I[w]=T.i(w)<<1|T.i(w-1)>>>31;return new o(I,T.h)}function K(T,_){const I=_>>5;_%=32;const w=T.g.length-I,E=[];for(let R=0;R<w;R++)E[R]=_>0?T.i(R+I)>>>_|T.i(R+I+1)<<32-_:T.i(R+I);return new o(E,T.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,Dh=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,Se=o}).apply(typeof Fc<"u"?Fc:typeof self<"u"?self:typeof window<"u"?window:{});var Os=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var xh,Sr,Nh,$s,Fo,kh,Oh,Mh;(function(){var r,t=Object.defineProperty;function e(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Os=="object"&&Os];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var n=e(this);function s(a,l){if(l)t:{var d=n;a=a.split(".");for(var m=0;m<a.length-1;m++){var v=a[m];if(!(v in d))break t;d=d[v]}a=a[a.length-1],m=d[a],l=l(m),l!=m&&l!=null&&t(d,a,{configurable:!0,writable:!0,value:l})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(l){var d=[],m;for(m in l)Object.prototype.hasOwnProperty.call(l,m)&&d.push([m,l[m]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function u(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function c(a,l,d){return a.call.apply(a.bind,arguments)}function h(a,l,d){return h=c,h.apply(null,arguments)}function f(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var m=d.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function p(a,l){function d(){}d.prototype=l.prototype,a.Z=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(m,v,S){for(var k=Array(arguments.length-2),G=2;G<arguments.length;G++)k[G-2]=arguments[G];return l.prototype[v].apply(m,k)}}var g=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function b(a){const l=a.length;if(l>0){const d=Array(l);for(let m=0;m<l;m++)d[m]=a[m];return d}return[]}function D(a,l){for(let m=1;m<arguments.length;m++){const v=arguments[m];var d=typeof v;if(d=d!="object"?d:v?Array.isArray(v)?"array":d:"null",d=="array"||d=="object"&&typeof v.length=="number"){d=a.length||0;const S=v.length||0;a.length=d+S;for(let k=0;k<S;k++)a[d+k]=v[k]}else a.push(v)}}class x{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return this.h>0?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function V(a){o.setTimeout(()=>{throw a},0)}function j(){var a=T;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class q{constructor(){this.h=this.g=null}add(l,d){const m=B.get();m.set(l,d),this.h?this.h.next=m:this.g=m,this.h=m}}var B=new x(()=>new z,a=>a.reset());class z{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let W,K=!1,T=new q,_=()=>{const a=Promise.resolve(void 0);W=()=>{a.then(I)}};function I(){for(var a;a=j();){try{a.h.call(a.g)}catch(d){V(d)}var l=B;l.j(a),l.h<100&&(l.h++,a.next=l.g,l.g=a)}K=!1}function w(){this.u=this.u,this.C=this.C}w.prototype.u=!1,w.prototype.dispose=function(){this.u||(this.u=!0,this.N())},w.prototype[Symbol.dispose]=function(){this.dispose()},w.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function E(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}E.prototype.h=function(){this.defaultPrevented=!0};var R=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,l),o.removeEventListener("test",d,l)}catch{}return a}();function y(a){return/^[\s\xa0]*$/.test(a)}function kt(a,l){E.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,l)}p(kt,E),kt.prototype.init=function(a,l){const d=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget,l||(d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement)),this.relatedTarget=l,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&kt.Z.h.call(this)},kt.prototype.h=function(){kt.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Ue="closure_listenable_"+(Math.random()*1e6|0),mm=0;function pm(a,l,d,m,v){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!m,this.ha=v,this.key=++mm,this.da=this.fa=!1}function Ts(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Es(a,l,d){for(const m in a)l.call(d,a[m],m,a)}function gm(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function Ru(a){const l={};for(const d in a)l[d]=a[d];return l}const bu="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Su(a,l){let d,m;for(let v=1;v<arguments.length;v++){m=arguments[v];for(d in m)a[d]=m[d];for(let S=0;S<bu.length;S++)d=bu[S],Object.prototype.hasOwnProperty.call(m,d)&&(a[d]=m[d])}}function ws(a){this.src=a,this.g={},this.h=0}ws.prototype.add=function(a,l,d,m,v){const S=a.toString();a=this.g[S],a||(a=this.g[S]=[],this.h++);const k=Hi(a,l,m,v);return k>-1?(l=a[k],d||(l.fa=!1)):(l=new pm(l,this.src,S,!!m,v),l.fa=d,a.push(l)),l};function Ki(a,l){const d=l.type;if(d in a.g){var m=a.g[d],v=Array.prototype.indexOf.call(m,l,void 0),S;(S=v>=0)&&Array.prototype.splice.call(m,v,1),S&&(Ts(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Hi(a,l,d,m){for(let v=0;v<a.length;++v){const S=a[v];if(!S.da&&S.listener==l&&S.capture==!!d&&S.ha==m)return v}return-1}var Qi="closure_lm_"+(Math.random()*1e6|0),Wi={};function Pu(a,l,d,m,v){if(Array.isArray(l)){for(let S=0;S<l.length;S++)Pu(a,l[S],d,m,v);return null}return d=Du(d),a&&a[Ue]?a.J(l,d,u(m)?!!m.capture:!1,v):_m(a,l,d,!1,m,v)}function _m(a,l,d,m,v,S){if(!l)throw Error("Invalid event type");const k=u(v)?!!v.capture:!!v;let G=Ji(a);if(G||(a[Qi]=G=new ws(a)),d=G.add(l,d,m,k,S),d.proxy)return d;if(m=ym(),d.proxy=m,m.src=a,m.listener=d,a.addEventListener)R||(v=k),v===void 0&&(v=!1),a.addEventListener(l.toString(),m,v);else if(a.attachEvent)a.attachEvent(Cu(l.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return d}function ym(){function a(d){return l.call(a.src,a.listener,d)}const l=Im;return a}function Vu(a,l,d,m,v){if(Array.isArray(l))for(var S=0;S<l.length;S++)Vu(a,l[S],d,m,v);else m=u(m)?!!m.capture:!!m,d=Du(d),a&&a[Ue]?(a=a.i,S=String(l).toString(),S in a.g&&(l=a.g[S],d=Hi(l,d,m,v),d>-1&&(Ts(l[d]),Array.prototype.splice.call(l,d,1),l.length==0&&(delete a.g[S],a.h--)))):a&&(a=Ji(a))&&(l=a.g[l.toString()],a=-1,l&&(a=Hi(l,d,m,v)),(d=a>-1?l[a]:null)&&Xi(d))}function Xi(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[Ue])Ki(l.i,a);else{var d=a.type,m=a.proxy;l.removeEventListener?l.removeEventListener(d,m,a.capture):l.detachEvent?l.detachEvent(Cu(d),m):l.addListener&&l.removeListener&&l.removeListener(m),(d=Ji(l))?(Ki(d,a),d.h==0&&(d.src=null,l[Qi]=null)):Ts(a)}}}function Cu(a){return a in Wi?Wi[a]:Wi[a]="on"+a}function Im(a,l){if(a.da)a=!0;else{l=new kt(l,this);const d=a.listener,m=a.ha||a.src;a.fa&&Xi(a),a=d.call(m,l)}return a}function Ji(a){return a=a[Qi],a instanceof ws?a:null}var Yi="__closure_events_fn_"+(Math.random()*1e9>>>0);function Du(a){return typeof a=="function"?a:(a[Yi]||(a[Yi]=function(l){return a.handleEvent(l)}),a[Yi])}function bt(){w.call(this),this.i=new ws(this),this.M=this,this.G=null}p(bt,w),bt.prototype[Ue]=!0,bt.prototype.removeEventListener=function(a,l,d,m){Vu(this,a,l,d,m)};function Dt(a,l){var d,m=a.G;if(m)for(d=[];m;m=m.G)d.push(m);if(a=a.M,m=l.type||l,typeof l=="string")l=new E(l,a);else if(l instanceof E)l.target=l.target||a;else{var v=l;l=new E(m,a),Su(l,v)}v=!0;let S,k;if(d)for(k=d.length-1;k>=0;k--)S=l.g=d[k],v=As(S,m,!0,l)&&v;if(S=l.g=a,v=As(S,m,!0,l)&&v,v=As(S,m,!1,l)&&v,d)for(k=0;k<d.length;k++)S=l.g=d[k],v=As(S,m,!1,l)&&v}bt.prototype.N=function(){if(bt.Z.N.call(this),this.i){var a=this.i;for(const l in a.g){const d=a.g[l];for(let m=0;m<d.length;m++)Ts(d[m]);delete a.g[l],a.h--}}this.G=null},bt.prototype.J=function(a,l,d,m){return this.i.add(String(a),l,!1,d,m)},bt.prototype.K=function(a,l,d,m){return this.i.add(String(a),l,!0,d,m)};function As(a,l,d,m){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();let v=!0;for(let S=0;S<l.length;++S){const k=l[S];if(k&&!k.da&&k.capture==d){const G=k.listener,_t=k.ha||k.src;k.fa&&Ki(a.i,k),v=G.call(_t,m)!==!1&&v}}return v&&!m.defaultPrevented}function Tm(a,l){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(l)>2147483647?-1:o.setTimeout(a,l||0)}function xu(a){a.g=Tm(()=>{a.g=null,a.i&&(a.i=!1,xu(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class Em extends w{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:xu(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ir(a){w.call(this),this.h=a,this.g={}}p(ir,w);var Nu=[];function ku(a){Es(a.g,function(l,d){this.g.hasOwnProperty(d)&&Xi(l)},a),a.g={}}ir.prototype.N=function(){ir.Z.N.call(this),ku(this)},ir.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Zi=o.JSON.stringify,wm=o.JSON.parse,Am=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Ou(){}function Mu(){}var or={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function to(){E.call(this,"d")}p(to,E);function eo(){E.call(this,"c")}p(eo,E);var qe={},Fu=null;function vs(){return Fu=Fu||new bt}qe.Ia="serverreachability";function Lu(a){E.call(this,qe.Ia,a)}p(Lu,E);function ar(a){const l=vs();Dt(l,new Lu(l))}qe.STAT_EVENT="statevent";function Bu(a,l){E.call(this,qe.STAT_EVENT,a),this.stat=l}p(Bu,E);function xt(a){const l=vs();Dt(l,new Bu(l,a))}qe.Ja="timingevent";function Uu(a,l){E.call(this,qe.Ja,a),this.size=l}p(Uu,E);function ur(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},l)}function cr(){this.g=!0}cr.prototype.ua=function(){this.g=!1};function vm(a,l,d,m,v,S){a.info(function(){if(a.g)if(S){var k="",G=S.split("&");for(let nt=0;nt<G.length;nt++){var _t=G[nt].split("=");if(_t.length>1){const It=_t[0];_t=_t[1];const Qt=It.split("_");k=Qt.length>=2&&Qt[1]=="type"?k+(It+"="+_t+"&"):k+(It+"=redacted&")}}}else k=null;else k=S;return"XMLHTTP REQ ("+m+") [attempt "+v+"]: "+l+`
`+d+`
`+k})}function Rm(a,l,d,m,v,S,k){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+v+"]: "+l+`
`+d+`
`+S+" "+k})}function _n(a,l,d,m){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+Sm(a,d)+(m?" "+m:"")})}function bm(a,l){a.info(function(){return"TIMEOUT: "+l})}cr.prototype.info=function(){};function Sm(a,l){if(!a.g)return l;if(!l)return null;try{const S=JSON.parse(l);if(S){for(a=0;a<S.length;a++)if(Array.isArray(S[a])){var d=S[a];if(!(d.length<2)){var m=d[1];if(Array.isArray(m)&&!(m.length<1)){var v=m[0];if(v!="noop"&&v!="stop"&&v!="close")for(let k=1;k<m.length;k++)m[k]=""}}}}return Zi(S)}catch{return l}}var Rs={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},qu={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},ju;function no(){}p(no,Ou),no.prototype.g=function(){return new XMLHttpRequest},ju=new no;function lr(a){return encodeURIComponent(String(a))}function Pm(a){var l=1;a=a.split(":");const d=[];for(;l>0&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function le(a,l,d,m){this.j=a,this.i=l,this.l=d,this.S=m||1,this.V=new ir(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new zu}function zu(){this.i=null,this.g="",this.h=!1}var $u={},ro={};function so(a,l,d){a.M=1,a.A=Ss(Ht(l)),a.u=d,a.R=!0,Gu(a,null)}function Gu(a,l){a.F=Date.now(),bs(a),a.B=Ht(a.A);var d=a.B,m=a.S;Array.isArray(m)||(m=[String(m)]),sc(d.i,"t",m),a.C=0,d=a.j.L,a.h=new zu,a.g=wc(a.j,d?l:null,!a.u),a.P>0&&(a.O=new Em(h(a.Y,a,a.g),a.P)),l=a.V,d=a.g,m=a.ba;var v="readystatechange";Array.isArray(v)||(v&&(Nu[0]=v.toString()),v=Nu);for(let S=0;S<v.length;S++){const k=Pu(d,v[S],m||l.handleEvent,!1,l.h||l);if(!k)break;l.g[k.key]=k}l=a.J?Ru(a.J):{},a.u?(a.v||(a.v="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,l)):(a.v="GET",a.g.ea(a.B,a.v,null,l)),ar(),vm(a.i,a.v,a.B,a.l,a.S,a.u)}le.prototype.ba=function(a){a=a.target;const l=this.O;l&&fe(a)==3?l.j():this.Y(a)},le.prototype.Y=function(a){try{if(a==this.g)t:{const G=fe(this.g),_t=this.g.ya(),nt=this.g.ca();if(!(G<3)&&(G!=3||this.g&&(this.h.h||this.g.la()||hc(this.g)))){this.K||G!=4||_t==7||(_t==8||nt<=0?ar(3):ar(2)),io(this);var l=this.g.ca();this.X=l;var d=Vm(this);if(this.o=l==200,Rm(this.i,this.v,this.B,this.l,this.S,G,l),this.o){if(this.U&&!this.L){e:{if(this.g){var m,v=this.g;if((m=v.g?v.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(m)){var S=m;break e}}S=null}if(a=S)_n(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,oo(this,a);else{this.o=!1,this.m=3,xt(12),je(this),hr(this);break t}}if(this.R){a=!0;let It;for(;!this.K&&this.C<d.length;)if(It=Cm(this,d),It==ro){G==4&&(this.m=4,xt(14),a=!1),_n(this.i,this.l,null,"[Incomplete Response]");break}else if(It==$u){this.m=4,xt(15),_n(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else _n(this.i,this.l,It,null),oo(this,It);if(Ku(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),G!=4||d.length!=0||this.h.h||(this.m=1,xt(16),a=!1),this.o=this.o&&a,!a)_n(this.i,this.l,d,"[Invalid Chunked Response]"),je(this),hr(this);else if(d.length>0&&!this.W){this.W=!0;var k=this.j;k.g==this&&k.aa&&!k.P&&(k.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),po(k),k.P=!0,xt(11))}}else _n(this.i,this.l,d,null),oo(this,d);G==4&&je(this),this.o&&!this.K&&(G==4?yc(this.j,this):(this.o=!1,bs(this)))}else $m(this.g),l==400&&d.indexOf("Unknown SID")>0?(this.m=3,xt(12)):(this.m=0,xt(13)),je(this),hr(this)}}}catch{}finally{}};function Vm(a){if(!Ku(a))return a.g.la();const l=hc(a.g);if(l==="")return"";let d="";const m=l.length,v=fe(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return je(a),hr(a),"";a.h.i=new o.TextDecoder}for(let S=0;S<m;S++)a.h.h=!0,d+=a.h.i.decode(l[S],{stream:!(v&&S==m-1)});return l.length=0,a.h.g+=d,a.C=0,a.h.g}function Ku(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function Cm(a,l){var d=a.C,m=l.indexOf(`
`,d);return m==-1?ro:(d=Number(l.substring(d,m)),isNaN(d)?$u:(m+=1,m+d>l.length?ro:(l=l.slice(m,m+d),a.C=m+d,l)))}le.prototype.cancel=function(){this.K=!0,je(this)};function bs(a){a.T=Date.now()+a.H,Hu(a,a.H)}function Hu(a,l){if(a.D!=null)throw Error("WatchDog timer not null");a.D=ur(h(a.aa,a),l)}function io(a){a.D&&(o.clearTimeout(a.D),a.D=null)}le.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(bm(this.i,this.B),this.M!=2&&(ar(),xt(17)),je(this),this.m=2,hr(this)):Hu(this,this.T-a)};function hr(a){a.j.I==0||a.K||yc(a.j,a)}function je(a){io(a);var l=a.O;l&&typeof l.dispose=="function"&&l.dispose(),a.O=null,ku(a.V),a.g&&(l=a.g,a.g=null,l.abort(),l.dispose())}function oo(a,l){try{var d=a.j;if(d.I!=0&&(d.g==a||ao(d.h,a))){if(!a.L&&ao(d.h,a)&&d.I==3){try{var m=d.Ba.g.parse(l)}catch{m=null}if(Array.isArray(m)&&m.length==3){var v=m;if(v[0]==0){t:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)xs(d),Cs(d);else break t;mo(d),xt(18)}}else d.xa=v[1],0<d.xa-d.K&&v[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=ur(h(d.Va,d),6e3));Xu(d.h)<=1&&d.ta&&(d.ta=void 0)}else $e(d,11)}else if((a.L||d.g==a)&&xs(d),!y(l))for(v=d.Ba.g.parse(l),l=0;l<v.length;l++){let nt=v[l];const It=nt[0];if(!(It<=d.K))if(d.K=It,nt=nt[1],d.I==2)if(nt[0]=="c"){d.M=nt[1],d.ba=nt[2];const Qt=nt[3];Qt!=null&&(d.ka=Qt,d.j.info("VER="+d.ka));const Ge=nt[4];Ge!=null&&(d.za=Ge,d.j.info("SVER="+d.za));const me=nt[5];me!=null&&typeof me=="number"&&me>0&&(m=1.5*me,d.O=m,d.j.info("backChannelRequestTimeoutMs_="+m)),m=d;const pe=a.g;if(pe){const ks=pe.g?pe.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ks){var S=m.h;S.g||ks.indexOf("spdy")==-1&&ks.indexOf("quic")==-1&&ks.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(uo(S,S.h),S.h=null))}if(m.G){const go=pe.g?pe.g.getResponseHeader("X-HTTP-Session-Id"):null;go&&(m.wa=go,st(m.J,m.G,go))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),m=d;var k=a;if(m.na=Ec(m,m.L?m.ba:null,m.W),k.L){Ju(m.h,k);var G=k,_t=m.O;_t&&(G.H=_t),G.D&&(io(G),bs(G)),m.g=k}else gc(m);d.i.length>0&&Ds(d)}else nt[0]!="stop"&&nt[0]!="close"||$e(d,7);else d.I==3&&(nt[0]=="stop"||nt[0]=="close"?nt[0]=="stop"?$e(d,7):fo(d):nt[0]!="noop"&&d.l&&d.l.qa(nt),d.A=0)}}ar(4)}catch{}}var Dm=class{constructor(a,l){this.g=a,this.map=l}};function Qu(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Wu(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Xu(a){return a.h?1:a.g?a.g.size:0}function ao(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function uo(a,l){a.g?a.g.add(l):a.h=l}function Ju(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}Qu.prototype.cancel=function(){if(this.i=Yu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Yu(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.G);return l}return b(a.i)}var Zu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function xm(a,l){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const m=a[d].indexOf("=");let v,S=null;m>=0?(v=a[d].substring(0,m),S=a[d].substring(m+1)):v=a[d],l(v,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function he(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let l;a instanceof he?(this.l=a.l,dr(this,a.j),this.o=a.o,this.g=a.g,fr(this,a.u),this.h=a.h,co(this,ic(a.i)),this.m=a.m):a&&(l=String(a).match(Zu))?(this.l=!1,dr(this,l[1]||"",!0),this.o=mr(l[2]||""),this.g=mr(l[3]||"",!0),fr(this,l[4]),this.h=mr(l[5]||"",!0),co(this,l[6]||"",!0),this.m=mr(l[7]||"")):(this.l=!1,this.i=new gr(null,this.l))}he.prototype.toString=function(){const a=[];var l=this.j;l&&a.push(pr(l,tc,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(pr(l,tc,!0),"@"),a.push(lr(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(pr(d,d.charAt(0)=="/"?Om:km,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",pr(d,Fm)),a.join("")},he.prototype.resolve=function(a){const l=Ht(this);let d=!!a.j;d?dr(l,a.j):d=!!a.o,d?l.o=a.o:d=!!a.g,d?l.g=a.g:d=a.u!=null;var m=a.h;if(d)fr(l,a.u);else if(d=!!a.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var v=l.h.lastIndexOf("/");v!=-1&&(m=l.h.slice(0,v+1)+m)}if(v=m,v==".."||v==".")m="";else if(v.indexOf("./")!=-1||v.indexOf("/.")!=-1){m=v.lastIndexOf("/",0)==0,v=v.split("/");const S=[];for(let k=0;k<v.length;){const G=v[k++];G=="."?m&&k==v.length&&S.push(""):G==".."?((S.length>1||S.length==1&&S[0]!="")&&S.pop(),m&&k==v.length&&S.push("")):(S.push(G),m=!0)}m=S.join("/")}else m=v}return d?l.h=m:d=a.i.toString()!=="",d?co(l,ic(a.i)):d=!!a.m,d&&(l.m=a.m),l};function Ht(a){return new he(a)}function dr(a,l,d){a.j=d?mr(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function fr(a,l){if(l){if(l=Number(l),isNaN(l)||l<0)throw Error("Bad port number "+l);a.u=l}else a.u=null}function co(a,l,d){l instanceof gr?(a.i=l,Lm(a.i,a.l)):(d||(l=pr(l,Mm)),a.i=new gr(l,a.l))}function st(a,l,d){a.i.set(l,d)}function Ss(a){return st(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function mr(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function pr(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,Nm),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Nm(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var tc=/[#\/\?@]/g,km=/[#\?:]/g,Om=/[#\?]/g,Mm=/[#\?@]/g,Fm=/#/g;function gr(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function ze(a){a.g||(a.g=new Map,a.h=0,a.i&&xm(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}r=gr.prototype,r.add=function(a,l){ze(this),this.i=null,a=yn(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function ec(a,l){ze(a),l=yn(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function nc(a,l){return ze(a),l=yn(a,l),a.g.has(l)}r.forEach=function(a,l){ze(this),this.g.forEach(function(d,m){d.forEach(function(v){a.call(l,v,m,this)},this)},this)};function rc(a,l){ze(a);let d=[];if(typeof l=="string")nc(a,l)&&(d=d.concat(a.g.get(yn(a,l))));else for(a=Array.from(a.g.values()),l=0;l<a.length;l++)d=d.concat(a[l]);return d}r.set=function(a,l){return ze(this),this.i=null,a=yn(this,a),nc(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},r.get=function(a,l){return a?(a=rc(this,a),a.length>0?String(a[0]):l):l};function sc(a,l,d){ec(a,l),d.length>0&&(a.i=null,a.g.set(yn(a,l),b(d)),a.h+=d.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(let m=0;m<l.length;m++){var d=l[m];const v=lr(d);d=rc(this,d);for(let S=0;S<d.length;S++){let k=v;d[S]!==""&&(k+="="+lr(d[S])),a.push(k)}}return this.i=a.join("&")};function ic(a){const l=new gr;return l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),l}function yn(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function Lm(a,l){l&&!a.j&&(ze(a),a.i=null,a.g.forEach(function(d,m){const v=m.toLowerCase();m!=v&&(ec(this,m),sc(this,v,d))},a)),a.j=l}function Bm(a,l){const d=new cr;if(o.Image){const m=new Image;m.onload=f(de,d,"TestLoadImage: loaded",!0,l,m),m.onerror=f(de,d,"TestLoadImage: error",!1,l,m),m.onabort=f(de,d,"TestLoadImage: abort",!1,l,m),m.ontimeout=f(de,d,"TestLoadImage: timeout",!1,l,m),o.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else l(!1)}function Um(a,l){const d=new cr,m=new AbortController,v=setTimeout(()=>{m.abort(),de(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:m.signal}).then(S=>{clearTimeout(v),S.ok?de(d,"TestPingServer: ok",!0,l):de(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(v),de(d,"TestPingServer: error",!1,l)})}function de(a,l,d,m,v){try{v&&(v.onload=null,v.onerror=null,v.onabort=null,v.ontimeout=null),m(d)}catch{}}function qm(){this.g=new Am}function lo(a){this.i=a.Sb||null,this.h=a.ab||!1}p(lo,Ou),lo.prototype.g=function(){return new Ps(this.i,this.h)};function Ps(a,l){bt.call(this),this.H=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Ps,bt),r=Ps.prototype,r.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=l,this.readyState=1,yr(this)},r.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const l={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(l.body=a),(this.H||o).fetch(new Request(this.D,l)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,_r(this)),this.readyState=0},r.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,yr(this)),this.g&&(this.readyState=3,yr(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;oc(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function oc(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}r.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.B.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?_r(this):yr(this),this.readyState==3&&oc(this)}},r.Oa=function(a){this.g&&(this.response=this.responseText=a,_r(this))},r.Na=function(a){this.g&&(this.response=a,_r(this))},r.ga=function(){this.g&&_r(this)};function _r(a){a.readyState=4,a.l=null,a.j=null,a.B=null,yr(a)}r.setRequestHeader=function(a,l){this.A.append(a,l)},r.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function yr(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Ps.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function ac(a){let l="";return Es(a,function(d,m){l+=m,l+=":",l+=d,l+=`\r
`}),l}function ho(a,l,d){t:{for(m in d){var m=!1;break t}m=!0}m||(d=ac(d),typeof a=="string"?d!=null&&lr(d):st(a,l,d))}function lt(a){bt.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(lt,bt);var jm=/^https?$/i,zm=["POST","PUT"];r=lt.prototype,r.Fa=function(a){this.H=a},r.ea=function(a,l,d,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():ju.g(),this.g.onreadystatechange=g(h(this.Ca,this));try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(S){uc(this,S);return}if(a=d||"",d=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var v in m)d.set(v,m[v]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const S of m.keys())d.set(S,m.get(S));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(d.keys()).find(S=>S.toLowerCase()=="content-type"),v=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(zm,l,void 0)>=0)||m||v||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,k]of d)this.g.setRequestHeader(S,k);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(S){uc(this,S)}};function uc(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.o=5,cc(a),Vs(a)}function cc(a){a.A||(a.A=!0,Dt(a,"complete"),Dt(a,"error"))}r.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,Dt(this,"complete"),Dt(this,"abort"),Vs(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Vs(this,!0)),lt.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?lc(this):this.Xa())},r.Xa=function(){lc(this)};function lc(a){if(a.h&&typeof i<"u"){if(a.v&&fe(a)==4)setTimeout(a.Ca.bind(a),0);else if(Dt(a,"readystatechange"),fe(a)==4){a.h=!1;try{const S=a.ca();t:switch(S){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break t;default:l=!1}var d;if(!(d=l)){var m;if(m=S===0){let k=String(a.D).match(Zu)[1]||null;!k&&o.self&&o.self.location&&(k=o.self.location.protocol.slice(0,-1)),m=!jm.test(k?k.toLowerCase():"")}d=m}if(d)Dt(a,"complete"),Dt(a,"success");else{a.o=6;try{var v=fe(a)>2?a.g.statusText:""}catch{v=""}a.l=v+" ["+a.ca()+"]",cc(a)}}finally{Vs(a)}}}}function Vs(a,l){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,l||Dt(a,"ready");try{d.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function fe(a){return a.g?a.g.readyState:0}r.ca=function(){try{return fe(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),wm(l)}};function hc(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function $m(a){const l={};a=(a.g&&fe(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(y(a[m]))continue;var d=Pm(a[m]);const v=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const S=l[v]||[];l[v]=S,S.push(d)}gm(l,function(m){return m.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ir(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function dc(a){this.za=0,this.i=[],this.j=new cr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Ir("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Ir("baseRetryDelayMs",5e3,a),this.Za=Ir("retryDelaySeedMs",1e4,a),this.Ta=Ir("forwardChannelMaxRetries",2,a),this.va=Ir("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Qu(a&&a.concurrentRequestLimit),this.Ba=new qm,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=dc.prototype,r.ka=8,r.I=1,r.connect=function(a,l,d,m){xt(0),this.W=a,this.H=l||{},d&&m!==void 0&&(this.H.OSID=d,this.H.OAID=m),this.F=this.X,this.J=Ec(this,null,this.W),Ds(this)};function fo(a){if(fc(a),a.I==3){var l=a.V++,d=Ht(a.J);if(st(d,"SID",a.M),st(d,"RID",l),st(d,"TYPE","terminate"),Tr(a,d),l=new le(a,a.j,l),l.M=2,l.A=Ss(Ht(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(l.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=l.A,d=!0),d||(l.g=wc(l.j,null),l.g.ea(l.A)),l.F=Date.now(),bs(l)}Tc(a)}function Cs(a){a.g&&(po(a),a.g.cancel(),a.g=null)}function fc(a){Cs(a),a.v&&(o.clearTimeout(a.v),a.v=null),xs(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Ds(a){if(!Wu(a.h)&&!a.m){a.m=!0;var l=a.Ea;W||_(),K||(W(),K=!0),T.add(l,a),a.D=0}}function Gm(a,l){return Xu(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=l.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=ur(h(a.Ea,a,l),Ic(a,a.D)),a.D++,!0)}r.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const v=new le(this,this.j,a);let S=this.o;if(this.U&&(S?(S=Ru(S),Su(S,this.U)):S=this.U),this.u!==null||this.R||(v.J=S,S=null),this.S)t:{for(var l=0,d=0;d<this.i.length;d++){e:{var m=this.i[d];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break e}m=void 0}if(m===void 0)break;if(l+=m,l>4096){l=d;break t}if(l===4096||d===this.i.length-1){l=d+1;break t}}l=1e3}else l=1e3;l=pc(this,v,l),d=Ht(this.J),st(d,"RID",a),st(d,"CVER",22),this.G&&st(d,"X-HTTP-Session-Id",this.G),Tr(this,d),S&&(this.R?l="headers="+lr(ac(S))+"&"+l:this.u&&ho(d,this.u,S)),uo(this.h,v),this.Ra&&st(d,"TYPE","init"),this.S?(st(d,"$req",l),st(d,"SID","null"),v.U=!0,so(v,d,null)):so(v,d,l),this.I=2}}else this.I==3&&(a?mc(this,a):this.i.length==0||Wu(this.h)||mc(this))};function mc(a,l){var d;l?d=l.l:d=a.V++;const m=Ht(a.J);st(m,"SID",a.M),st(m,"RID",d),st(m,"AID",a.K),Tr(a,m),a.u&&a.o&&ho(m,a.u,a.o),d=new le(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),l&&(a.i=l.G.concat(a.i)),l=pc(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),uo(a.h,d),so(d,m,l)}function Tr(a,l){a.H&&Es(a.H,function(d,m){st(l,m,d)}),a.l&&Es({},function(d,m){st(l,m,d)})}function pc(a,l,d){d=Math.min(a.i.length,d);const m=a.l?h(a.l.Ka,a.l,a):null;t:{var v=a.i;let G=-1;for(;;){const _t=["count="+d];G==-1?d>0?(G=v[0].g,_t.push("ofs="+G)):G=0:_t.push("ofs="+G);let nt=!0;for(let It=0;It<d;It++){var S=v[It].g;const Qt=v[It].map;if(S-=G,S<0)G=Math.max(0,v[It].g-100),nt=!1;else try{S="req"+S+"_"||"";try{var k=Qt instanceof Map?Qt:Object.entries(Qt);for(const[Ge,me]of k){let pe=me;u(me)&&(pe=Zi(me)),_t.push(S+Ge+"="+encodeURIComponent(pe))}}catch(Ge){throw _t.push(S+"type="+encodeURIComponent("_badmap")),Ge}}catch{m&&m(Qt)}}if(nt){k=_t.join("&");break t}}k=void 0}return a=a.i.splice(0,d),l.G=a,k}function gc(a){if(!a.g&&!a.v){a.Y=1;var l=a.Da;W||_(),K||(W(),K=!0),T.add(l,a),a.A=0}}function mo(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=ur(h(a.Da,a),Ic(a,a.A)),a.A++,!0)}r.Da=function(){if(this.v=null,_c(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=ur(h(this.Wa,this),a)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,xt(10),Cs(this),_c(this))};function po(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function _c(a){a.g=new le(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var l=Ht(a.na);st(l,"RID","rpc"),st(l,"SID",a.M),st(l,"AID",a.K),st(l,"CI",a.F?"0":"1"),!a.F&&a.ia&&st(l,"TO",a.ia),st(l,"TYPE","xmlhttp"),Tr(a,l),a.u&&a.o&&ho(l,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=Ss(Ht(l)),d.u=null,d.R=!0,Gu(d,a)}r.Va=function(){this.C!=null&&(this.C=null,Cs(this),mo(this),xt(19))};function xs(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function yc(a,l){var d=null;if(a.g==l){xs(a),po(a),a.g=null;var m=2}else if(ao(a.h,l))d=l.G,Ju(a.h,l),m=1;else return;if(a.I!=0){if(l.o)if(m==1){d=l.u?l.u.length:0,l=Date.now()-l.F;var v=a.D;m=vs(),Dt(m,new Uu(m,d)),Ds(a)}else gc(a);else if(v=l.m,v==3||v==0&&l.X>0||!(m==1&&Gm(a,l)||m==2&&mo(a)))switch(d&&d.length>0&&(l=a.h,l.i=l.i.concat(d)),v){case 1:$e(a,5);break;case 4:$e(a,10);break;case 3:$e(a,6);break;default:$e(a,2)}}}function Ic(a,l){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*l}function $e(a,l){if(a.j.info("Error code "+l),l==2){var d=h(a.bb,a),m=a.Ua;const v=!m;m=new he(m||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||dr(m,"https"),Ss(m),v?Bm(m.toString(),d):Um(m.toString(),d)}else xt(2);a.I=0,a.l&&a.l.pa(l),Tc(a),fc(a)}r.bb=function(a){a?(this.j.info("Successfully pinged google.com"),xt(2)):(this.j.info("Failed to ping google.com"),xt(1))};function Tc(a){if(a.I=0,a.ja=[],a.l){const l=Yu(a.h);(l.length!=0||a.i.length!=0)&&(D(a.ja,l),D(a.ja,a.i),a.h.i.length=0,b(a.i),a.i.length=0),a.l.oa()}}function Ec(a,l,d){var m=d instanceof he?Ht(d):new he(d);if(m.g!="")l&&(m.g=l+"."+m.g),fr(m,m.u);else{var v=o.location;m=v.protocol,l=l?l+"."+v.hostname:v.hostname,v=+v.port;const S=new he(null);m&&dr(S,m),l&&(S.g=l),v&&fr(S,v),d&&(S.h=d),m=S}return d=a.G,l=a.wa,d&&l&&st(m,d,l),st(m,"VER",a.ka),Tr(a,m),m}function wc(a,l,d){if(l&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Aa&&!a.ma?new lt(new lo({ab:d})):new lt(a.ma),l.Fa(a.L),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ac(){}r=Ac.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function Ns(){}Ns.prototype.g=function(a,l){return new Ft(a,l)};function Ft(a,l){bt.call(this),this.g=new dc(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.sa&&(a?a["X-WebChannel-Client-Profile"]=l.sa:a={"X-WebChannel-Client-Profile":l.sa}),this.g.U=a,(a=l&&l.Qb)&&!y(a)&&(this.g.u=a),this.A=l&&l.supportsCrossDomainXhr||!1,this.v=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!y(l)&&(this.g.G=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new In(this)}p(Ft,bt),Ft.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Ft.prototype.close=function(){fo(this.g)},Ft.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=Zi(a),a=d);l.i.push(new Dm(l.Ya++,a)),l.I==3&&Ds(l)},Ft.prototype.N=function(){this.g.l=null,delete this.j,fo(this.g),delete this.g,Ft.Z.N.call(this)};function vc(a){to.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){t:{for(const d in l){a=d;break t}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}p(vc,to);function Rc(){eo.call(this),this.status=1}p(Rc,eo);function In(a){this.g=a}p(In,Ac),In.prototype.ra=function(){Dt(this.g,"a")},In.prototype.qa=function(a){Dt(this.g,new vc(a))},In.prototype.pa=function(a){Dt(this.g,new Rc)},In.prototype.oa=function(){Dt(this.g,"b")},Ns.prototype.createWebChannel=Ns.prototype.g,Ft.prototype.send=Ft.prototype.o,Ft.prototype.open=Ft.prototype.m,Ft.prototype.close=Ft.prototype.close,Mh=function(){return new Ns},Oh=function(){return vs()},kh=qe,Fo={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Rs.NO_ERROR=0,Rs.TIMEOUT=8,Rs.HTTP_ERROR=6,$s=Rs,qu.COMPLETE="complete",Nh=qu,Mu.EventType=or,or.OPEN="a",or.CLOSE="b",or.ERROR="c",or.MESSAGE="d",bt.prototype.listen=bt.prototype.J,Sr=Mu,lt.prototype.listenOnce=lt.prototype.K,lt.prototype.getLastError=lt.prototype.Ha,lt.prototype.getLastErrorCode=lt.prototype.ya,lt.prototype.getStatus=lt.prototype.ca,lt.prototype.getResponseJson=lt.prototype.La,lt.prototype.getResponseText=lt.prototype.la,lt.prototype.send=lt.prototype.ea,lt.prototype.setWithCredentials=lt.prototype.Fa,xh=lt}).apply(typeof Os<"u"?Os:typeof self<"u"?self:typeof window<"u"?window:{});const Lc="@firebase/firestore",Bc="4.9.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}Et.UNAUTHENTICATED=new Et(null),Et.GOOGLE_CREDENTIALS=new Et("google-credentials-uid"),Et.FIRST_PARTY=new Et("first-party-uid"),Et.MOCK_USER=new Et("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yn="12.3.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const on=new Ah("@firebase/firestore");function bn(){return on.logLevel}function C(r,...t){if(on.logLevel<=J.DEBUG){const e=t.map(pa);on.debug(`Firestore (${Yn}): ${r}`,...e)}}function ft(r,...t){if(on.logLevel<=J.ERROR){const e=t.map(pa);on.error(`Firestore (${Yn}): ${r}`,...e)}}function Nn(r,...t){if(on.logLevel<=J.WARN){const e=t.map(pa);on.warn(`Firestore (${Yn}): ${r}`,...e)}}function pa(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(e){return JSON.stringify(e)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(r,t,e){let n="Unexpected state";typeof t=="string"?n=t:e=t,Fh(r,n,e)}function Fh(r,t,e){let n=`FIRESTORE (${Yn}) INTERNAL ASSERTION FAILED: ${t} (ID: ${r.toString(16)})`;if(e!==void 0)try{n+=" CONTEXT: "+JSON.stringify(e)}catch{n+=" CONTEXT: "+e}throw ft(n),new Error(n)}function L(r,t,e,n){let s="Unexpected state";typeof e=="string"?s=e:n=e,r||Fh(t,s,n)}function F(r,t){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends mn{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lh{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Ig{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(Et.UNAUTHENTICATED))}shutdown(){}}class Tg{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class Eg{constructor(t){this.t=t,this.currentUser=Et.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){L(this.o===void 0,42304);let n=this.i;const s=c=>this.i!==n?(n=this.i,e(c)):Promise.resolve();let i=new $t;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new $t,t.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const c=i;t.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},u=c=>{C("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(c=>u(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?u(c):(C("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new $t)}},0),o()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(n=>this.i!==t?(C("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(L(typeof n.accessToken=="string",31837,{l:n}),new Lh(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return L(t===null||typeof t=="string",2055,{h:t}),new Et(t)}}class wg{constructor(t,e,n){this.P=t,this.T=e,this.I=n,this.type="FirstParty",this.user=Et.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Ag{constructor(t,e,n){this.P=t,this.T=e,this.I=n}getToken(){return Promise.resolve(new wg(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable(()=>e(Et.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Uc{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class vg{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,bh(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){L(this.o===void 0,3512);const n=i=>{i.error!=null&&C("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,C("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?e(i.token):Promise.resolve()};this.o=i=>{t.enqueueRetryable(()=>n(i))};const s=i=>{C("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):C("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Uc(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(L(typeof e.token=="string",44558,{tokenResult:e}),this.m=e.token,new Uc(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rg(r){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(r);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let n=0;n<r;n++)e[n]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=Rg(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<e&&(n+=t.charAt(s[i]%62))}return n}}function $(r,t){return r<t?-1:r>t?1:0}function Lo(r,t){const e=Math.min(r.length,t.length);for(let n=0;n<e;n++){const s=r.charAt(n),i=t.charAt(n);if(s!==i)return Eo(s)===Eo(i)?$(s,i):Eo(s)?1:-1}return $(r.length,t.length)}const bg=55296,Sg=57343;function Eo(r){const t=r.charCodeAt(0);return t>=bg&&t<=Sg}function kn(r,t,e){return r.length===t.length&&r.every((n,s)=>e(n,t[s]))}function Bh(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qc="__name__";class Wt{constructor(t,e,n){e===void 0?e=0:e>t.length&&M(637,{offset:e,range:t.length}),n===void 0?n=t.length-e:n>t.length-e&&M(1746,{length:n,range:t.length-e}),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return Wt.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Wt?t.forEach(n=>{e.push(n)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let s=0;s<n;s++){const i=Wt.compareSegments(t.get(s),e.get(s));if(i!==0)return i}return $(t.length,e.length)}static compareSegments(t,e){const n=Wt.isNumericId(t),s=Wt.isNumericId(e);return n&&!s?-1:!n&&s?1:n&&s?Wt.extractNumericId(t).compare(Wt.extractNumericId(e)):Lo(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Se.fromString(t.substring(4,t.length-2))}}class Y extends Wt{construct(t,e,n){return new Y(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new N(P.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(s=>s.length>0))}return new Y(e)}static emptyPath(){return new Y([])}}const Pg=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class at extends Wt{construct(t,e,n){return new at(t,e,n)}static isValidIdentifier(t){return Pg.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),at.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===qc}static keyField(){return new at([qc])}static fromServerFormat(t){const e=[];let n="",s=0;const i=()=>{if(n.length===0)throw new N(P.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let o=!1;for(;s<t.length;){const u=t[s];if(u==="\\"){if(s+1===t.length)throw new N(P.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const c=t[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new N(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=c,s+=2}else u==="`"?(o=!o,s++):u!=="."||o?(n+=u,s++):(i(),s++)}if(i(),o)throw new N(P.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new at(e)}static emptyPath(){return new at([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(t){this.path=t}static fromPath(t){return new O(Y.fromString(t))}static fromName(t){return new O(Y.fromString(t).popFirst(5))}static empty(){return new O(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&Y.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return Y.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new O(new Y(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uh(r,t,e){if(!e)throw new N(P.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${t}.`)}function Vg(r,t,e,n){if(t===!0&&n===!0)throw new N(P.INVALID_ARGUMENT,`${r} and ${e} cannot be used together.`)}function jc(r){if(!O.isDocumentKey(r))throw new N(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function zc(r){if(O.isDocumentKey(r))throw new N(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function qh(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function vi(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const t=function(n){return n.constructor?n.constructor.name:null}(r);return t?`a custom ${t} object`:"an object"}}return typeof r=="function"?"a function":M(12329,{type:typeof r})}function Vt(r,t){if("_delegate"in r&&(r=r._delegate),!(r instanceof t)){if(t.name===r.constructor.name)throw new N(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=vi(r);throw new N(P.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return r}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gt(r,t){const e={typeString:r};return t&&(e.value=t),e}function as(r,t){if(!qh(r))throw new N(P.INVALID_ARGUMENT,"JSON must be an object");let e;for(const n in t)if(t[n]){const s=t[n].typeString,i="value"in t[n]?{value:t[n].value}:void 0;if(!(n in r)){e=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){e=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){e=`Expected '${n}' field to equal '${i.value}'`;break}}if(e)throw new N(P.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $c=-62135596800,Gc=1e6;class Z{static now(){return Z.fromMillis(Date.now())}static fromDate(t){return Z.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor((t-1e3*e)*Gc);return new Z(e,n)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new N(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new N(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<$c)throw new N(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new N(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Gc}_compareTo(t){return this.seconds===t.seconds?$(this.nanoseconds,t.nanoseconds):$(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Z._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(as(t,Z._jsonSchema))return new Z(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-$c;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Z._jsonSchemaVersion="firestore/timestamp/1.0",Z._jsonSchema={type:gt("string",Z._jsonSchemaVersion),seconds:gt("number"),nanoseconds:gt("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{static fromTimestamp(t){return new U(t)}static min(){return new U(new Z(0,0))}static max(){return new U(new Z(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const On=-1;class ii{constructor(t,e,n,s){this.indexId=t,this.collectionGroup=e,this.fields=n,this.indexState=s}}function Bo(r){return r.fields.find(t=>t.kind===2)}function Qe(r){return r.fields.filter(t=>t.kind!==2)}ii.UNKNOWN_ID=-1;class Gs{constructor(t,e){this.fieldPath=t,this.kind=e}}class Gr{constructor(t,e){this.sequenceNumber=t,this.offset=e}static empty(){return new Gr(0,zt.min())}}function jh(r,t){const e=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=U.fromTimestamp(n===1e9?new Z(e+1,0):new Z(e,n));return new zt(s,O.empty(),t)}function zh(r){return new zt(r.readTime,r.key,On)}class zt{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new zt(U.min(),O.empty(),On)}static max(){return new zt(U.max(),O.empty(),On)}}function _a(r,t){let e=r.readTime.compareTo(t.readTime);return e!==0?e:(e=O.comparator(r.documentKey,t.documentKey),e!==0?e:$(r.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $h="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Gh{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Oe(r){if(r.code!==P.FAILED_PRECONDITION||r.message!==$h)throw r;C("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&M(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new A((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(t,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(e,i).next(n,s)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof A?e:A.resolve(e)}catch(e){return A.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):A.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):A.reject(e)}static resolve(t){return new A((e,n)=>{e(t)})}static reject(t){return new A((e,n)=>{n(t)})}static waitFor(t){return new A((e,n)=>{let s=0,i=0,o=!1;t.forEach(u=>{++s,u.next(()=>{++i,o&&i===s&&e()},c=>n(c))}),o=!0,i===s&&e()})}static or(t){let e=A.resolve(!1);for(const n of t)e=e.next(s=>s?A.resolve(s):n());return e}static forEach(t,e){const n=[];return t.forEach((s,i)=>{n.push(e.call(this,s,i))}),this.waitFor(n)}static mapArray(t,e){return new A((n,s)=>{const i=t.length,o=new Array(i);let u=0;for(let c=0;c<i;c++){const h=c;e(t[h]).next(f=>{o[h]=f,++u,u===i&&n(o)},f=>s(f))}})}static doWhile(t,e){return new A((n,s)=>{const i=()=>{t()===!0?e().next(()=>{i()},s):n()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt="SimpleDb";class Ri{static open(t,e,n,s){try{return new Ri(e,t.transaction(s,n))}catch(i){throw new xr(e,i)}}constructor(t,e){this.action=t,this.transaction=e,this.aborted=!1,this.S=new $t,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{e.error?this.S.reject(new xr(t,e.error)):this.S.resolve()},this.transaction.onerror=n=>{const s=ya(n.target.error);this.S.reject(new xr(t,s))}}get D(){return this.S.promise}abort(t){t&&this.S.reject(t),this.aborted||(C(Lt,"Aborting transaction:",t?t.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}C(){const t=this.transaction;this.aborted||typeof t.commit!="function"||t.commit()}store(t){const e=this.transaction.objectStore(t);return new Dg(e)}}class Pe{static delete(t){return C(Lt,"Removing database:",t),Xe(fh().indexedDB.deleteDatabase(t)).toPromise()}static v(){if(!Eh())return!1;if(Pe.F())return!0;const t=ri(),e=Pe.M(t),n=0<e&&e<10,s=Kh(t),i=0<s&&s<4.5;return!(t.indexOf("MSIE ")>0||t.indexOf("Trident/")>0||t.indexOf("Edge/")>0||n||i)}static F(){var t;return typeof process<"u"&&((t=process.__PRIVATE_env)==null?void 0:t.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static O(t,e){return t.store(e)}static M(t){const e=t.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=e?e[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(t,e,n){this.name=t,this.version=e,this.N=n,this.B=null,Pe.M(ri())===12.2&&ft("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async L(t){return this.db||(C(Lt,"Opening database:",this.name),this.db=await new Promise((e,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;e(o)},s.onblocked=()=>{n(new xr(t,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?n(new N(P.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?n(new N(P.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):n(new xr(t,o))},s.onupgradeneeded=i=>{C(Lt,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.N.k(o,s.transaction,i.oldVersion,this.version).next(()=>{C(Lt,"Database upgrade to version "+this.version+" complete")})}})),this.q&&(this.db.onversionchange=e=>this.q(e)),this.db}$(t){this.q=t,this.db&&(this.db.onversionchange=e=>t(e))}async runTransaction(t,e,n,s){const i=e==="readonly";let o=0;for(;;){++o;try{this.db=await this.L(t);const u=Ri.open(this.db,t,i?"readonly":"readwrite",n),c=s(u).next(h=>(u.C(),h)).catch(h=>(u.abort(h),A.reject(h))).toPromise();return c.catch(()=>{}),await u.D,c}catch(u){const c=u,h=c.name!=="FirebaseError"&&o<3;if(C(Lt,"Transaction failed with error:",c.message,"Retrying:",h),this.close(),!h)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Kh(r){const t=r.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}class Cg{constructor(t){this.U=t,this.K=!1,this.W=null}get isDone(){return this.K}get G(){return this.W}set cursor(t){this.U=t}done(){this.K=!0}j(t){this.W=t}delete(){return Xe(this.U.delete())}}class xr extends N{constructor(t,e){super(P.UNAVAILABLE,`IndexedDB transaction '${t}' failed: ${e}`),this.name="IndexedDbTransactionError"}}function Me(r){return r.name==="IndexedDbTransactionError"}class Dg{constructor(t){this.store=t}put(t,e){let n;return e!==void 0?(C(Lt,"PUT",this.store.name,t,e),n=this.store.put(e,t)):(C(Lt,"PUT",this.store.name,"<auto-key>",t),n=this.store.put(t)),Xe(n)}add(t){return C(Lt,"ADD",this.store.name,t,t),Xe(this.store.add(t))}get(t){return Xe(this.store.get(t)).next(e=>(e===void 0&&(e=null),C(Lt,"GET",this.store.name,t,e),e))}delete(t){return C(Lt,"DELETE",this.store.name,t),Xe(this.store.delete(t))}count(){return C(Lt,"COUNT",this.store.name),Xe(this.store.count())}J(t,e){const n=this.options(t,e),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new A((o,u)=>{i.onerror=c=>{u(c.target.error)},i.onsuccess=c=>{o(c.target.result)}})}{const i=this.cursor(n),o=[];return this.H(i,(u,c)=>{o.push(c)}).next(()=>o)}}Y(t,e){const n=this.store.getAll(t,e===null?void 0:e);return new A((s,i)=>{n.onerror=o=>{i(o.target.error)},n.onsuccess=o=>{s(o.target.result)}})}Z(t,e){C(Lt,"DELETE ALL",this.store.name);const n=this.options(t,e);n.X=!1;const s=this.cursor(n);return this.H(s,(i,o,u)=>u.delete())}ee(t,e){let n;e?n=t:(n={},e=t);const s=this.cursor(n);return this.H(s,e)}te(t){const e=this.cursor({});return new A((n,s)=>{e.onerror=i=>{const o=ya(i.target.error);s(o)},e.onsuccess=i=>{const o=i.target.result;o?t(o.primaryKey,o.value).next(u=>{u?o.continue():n()}):n()}})}H(t,e){const n=[];return new A((s,i)=>{t.onerror=o=>{i(o.target.error)},t.onsuccess=o=>{const u=o.target.result;if(!u)return void s();const c=new Cg(u),h=e(u.primaryKey,u.value,c);if(h instanceof A){const f=h.catch(p=>(c.done(),A.reject(p)));n.push(f)}c.isDone?s():c.G===null?u.continue():u.continue(c.G)}}).next(()=>A.waitFor(n))}options(t,e){let n;return t!==void 0&&(typeof t=="string"?n=t:e=t),{index:n,range:e}}cursor(t){let e="next";if(t.reverse&&(e="prev"),t.index){const n=this.store.index(t.index);return t.X?n.openKeyCursor(t.range,e):n.openCursor(t.range,e)}return this.store.openCursor(t.range,e)}}function Xe(r){return new A((t,e)=>{r.onsuccess=n=>{const s=n.target.result;t(s)},r.onerror=n=>{const s=ya(n.target.error);e(s)}})}let Kc=!1;function ya(r){const t=Pe.M(ri());if(t>=12.2&&t<13){const e="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(e)>=0){const n=new N("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${e}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Kc||(Kc=!0,setTimeout(()=>{throw n},0)),n}}return r}const Nr="IndexBackfiller";class xg{constructor(t,e){this.asyncQueue=t,this.ne=e,this.task=null}start(){this.re(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}re(t){C(Nr,`Scheduled in ${t}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",t,async()=>{this.task=null;try{const e=await this.ne.ie();C(Nr,`Documents written: ${e}`)}catch(e){Me(e)?C(Nr,"Ignoring IndexedDB error during index backfill: ",e):await Oe(e)}await this.re(6e4)})}}class Ng{constructor(t,e){this.localStore=t,this.persistence=e}async ie(t=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",e=>this.se(e,t))}se(t,e){const n=new Set;let s=e,i=!0;return A.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(t).next(o=>{if(o!==null&&!n.has(o))return C(Nr,`Processing collection: ${o}`),this.oe(t,o,s).next(u=>{s-=u,n.add(o)});i=!1})).next(()=>e-s)}oe(t,e,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(t,e).next(s=>this.localStore.localDocuments.getNextDocuments(t,e,s,n).next(i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(t,o).next(()=>this._e(s,i)).next(u=>(C(Nr,`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(t,e,u))).next(()=>o.size)}))}_e(t,e){let n=t;return e.changes.forEach((s,i)=>{const o=zh(i);_a(o,n)>0&&(n=o)}),new zt(n.readTime,n.documentKey,Math.max(e.batchId,t.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=n=>this.ae(n),this.ue=n=>e.writeSequenceNumber(n))}ae(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ue&&this.ue(t),t}}Ot.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const en=-1;function us(r){return r==null}function Kr(r){return r===0&&1/r==-1/0}function Hh(r){return typeof r=="number"&&Number.isInteger(r)&&!Kr(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oi="";function Ct(r){let t="";for(let e=0;e<r.length;e++)t.length>0&&(t=Hc(t)),t=kg(r.get(e),t);return Hc(t)}function kg(r,t){let e=t;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":e+="";break;case oi:e+="";break;default:e+=i}}return e}function Hc(r){return r+oi+""}function Jt(r){const t=r.length;if(L(t>=2,64408,{path:r}),t===2)return L(r.charAt(0)===oi&&r.charAt(1)==="",56145,{path:r}),Y.emptyPath();const e=t-2,n=[];let s="";for(let i=0;i<t;){const o=r.indexOf(oi,i);switch((o<0||o>e)&&M(50515,{path:r}),r.charAt(o+1)){case"":const u=r.substring(i,o);let c;s.length===0?c=u:(s+=u,c=s,s=""),n.push(c);break;case"":s+=r.substring(i,o),s+="\0";break;case"":s+=r.substring(i,o+1);break;default:M(61167,{path:r})}i=o+2}return new Y(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const We="remoteDocuments",cs="owner",Tn="owner",Hr="mutationQueues",Og="userId",Gt="mutations",Qc="batchId",tn="userMutationsIndex",Wc=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ks(r,t){return[r,Ct(t)]}function Qh(r,t,e){return[r,Ct(t),e]}const Mg={},Mn="documentMutations",ai="remoteDocumentsV14",Fg=["prefixPath","collectionGroup","readTime","documentId"],Hs="documentKeyIndex",Lg=["prefixPath","collectionGroup","documentId"],Wh="collectionGroupIndex",Bg=["collectionGroup","readTime","prefixPath","documentId"],Qr="remoteDocumentGlobal",Uo="remoteDocumentGlobalKey",Fn="targets",Xh="queryTargetsIndex",Ug=["canonicalId","targetId"],Ln="targetDocuments",qg=["targetId","path"],Ia="documentTargetsIndex",jg=["path","targetId"],ui="targetGlobalKey",nn="targetGlobal",Wr="collectionParents",zg=["collectionId","parent"],Bn="clientMetadata",$g="clientId",bi="bundles",Gg="bundleId",Si="namedQueries",Kg="name",Ta="indexConfiguration",Hg="indexId",qo="collectionGroupIndex",Qg="collectionGroup",kr="indexState",Wg=["indexId","uid"],Jh="sequenceNumberIndex",Xg=["uid","sequenceNumber"],Or="indexEntries",Jg=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Yh="documentKeyIndex",Yg=["indexId","uid","orderedDocumentKey"],Pi="documentOverlays",Zg=["userId","collectionPath","documentId"],jo="collectionPathOverlayIndex",t_=["userId","collectionPath","largestBatchId"],Zh="collectionGroupOverlayIndex",e_=["userId","collectionGroup","largestBatchId"],Ea="globals",n_="name",td=[Hr,Gt,Mn,We,Fn,cs,nn,Ln,Bn,Qr,Wr,bi,Si],r_=[...td,Pi],ed=[Hr,Gt,Mn,ai,Fn,cs,nn,Ln,Bn,Qr,Wr,bi,Si,Pi],nd=ed,wa=[...nd,Ta,kr,Or],s_=wa,rd=[...wa,Ea],i_=rd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zo extends Gh{constructor(t,e){super(),this.le=t,this.currentSequenceNumber=e}}function yt(r,t){const e=F(r);return Pe.O(e.le,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xc(r){let t=0;for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t++;return t}function Fe(r,t){for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t(e,r[e])}function o_(r,t){const e=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&e.push(t(r[n],n,r));return e}function sd(r){for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(t,e){this.comparator=t,this.root=e||vt.EMPTY}insert(t,e){return new rt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,vt.BLACK,null,null))}remove(t){return new rt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,vt.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(n===0)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(t,n.key);if(s===0)return e+n.left.size;s<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Ms(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Ms(this.root,t,this.comparator,!1)}getReverseIterator(){return new Ms(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Ms(this.root,t,this.comparator,!0)}}class Ms{constructor(t,e,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!t.isEmpty();)if(i=e?n(t.key,e):1,e&&s&&(i*=-1),i<0)t=this.isReverse?t.left:t.right;else{if(i===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class vt{constructor(t,e,n,s,i){this.key=t,this.value=e,this.color=n??vt.RED,this.left=s??vt.EMPTY,this.right=i??vt.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,s,i){return new vt(t??this.key,e??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let s=this;const i=n(t,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(t,e,n),null):i===0?s.copy(null,e,null,null,null):s.copy(null,null,null,null,s.right.insert(t,e,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return vt.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,s=this;if(e(t,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(t,e),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),e(t,s.key)===0){if(s.right.isEmpty())return vt.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(t,e))}return s.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,vt.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,vt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw M(43730,{key:this.key,value:this.value});if(this.right.isRed())throw M(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw M(27949);return t+(this.isRed()?0:1)}}vt.EMPTY=null,vt.RED=!0,vt.BLACK=!1;vt.EMPTY=new class{constructor(){this.size=0}get key(){throw M(57766)}get value(){throw M(16141)}get color(){throw M(16727)}get left(){throw M(29726)}get right(){throw M(36894)}copy(t,e,n,s,i){return this}insert(t,e,n){return new vt(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et{constructor(t){this.comparator=t,this.data=new rt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,t[1])>=0)return;e(s.key)}}forEachWhile(t,e){let n;for(n=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Jc(this.data.getIterator())}getIteratorFrom(t){return new Jc(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(n=>{e=e.add(n)}),e}isEqual(t){if(!(t instanceof et)||this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new et(this.comparator);return e.data=t,e}}class Jc{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function En(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(t){this.fields=t,t.sort(at.comparator)}static empty(){return new Mt([])}unionWith(t){let e=new et(at.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new Mt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return kn(this.fields,t.fields,(e,n)=>e.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class id extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new id("Invalid base64 string: "+i):i}}(t);return new mt(e)}static fromUint8Array(t){const e=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(t);return new mt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return $(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}mt.EMPTY_BYTE_STRING=new mt("");const a_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function oe(r){if(L(!!r,39018),typeof r=="string"){let t=0;const e=a_.exec(r);if(L(!!e,46558,{timestamp:r}),e[1]){let s=e[1];s=(s+"000000000").substr(0,9),t=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:t}}return{seconds:it(r.seconds),nanos:it(r.nanos)}}function it(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function ae(r){return typeof r=="string"?mt.fromBase64String(r):mt.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const od="server_timestamp",ad="__type__",ud="__previous_value__",cd="__local_write_time__";function Aa(r){var e,n;return((n=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[ad])==null?void 0:n.stringValue)===od}function Vi(r){const t=r.mapValue.fields[ud];return Aa(t)?Vi(t):t}function Xr(r){const t=oe(r.mapValue.fields[cd].timestampValue);return new Z(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u_{constructor(t,e,n,s,i,o,u,c,h,f){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=u,this.longPollingOptions=c,this.useFetchStreams=h,this.isUsingEmulator=f}}const Jr="(default)";class an{constructor(t,e){this.projectId=t,this.database=e||Jr}static empty(){return new an("","")}get isDefaultDatabase(){return this.database===Jr}isEqual(t){return t instanceof an&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const va="__type__",ld="__max__",we={mapValue:{fields:{__type__:{stringValue:ld}}}},Ra="__vector__",Un="value",Qs={nullValue:"NULL_VALUE"};function De(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?Aa(r)?4:hd(r)?9007199254740991:Ci(r)?10:11:M(28295,{value:r})}function ne(r,t){if(r===t)return!0;const e=De(r);if(e!==De(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===t.booleanValue;case 4:return Xr(r).isEqual(Xr(t));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=oe(s.timestampValue),u=oe(i.timestampValue);return o.seconds===u.seconds&&o.nanos===u.nanos}(r,t);case 5:return r.stringValue===t.stringValue;case 6:return function(s,i){return ae(s.bytesValue).isEqual(ae(i.bytesValue))}(r,t);case 7:return r.referenceValue===t.referenceValue;case 8:return function(s,i){return it(s.geoPointValue.latitude)===it(i.geoPointValue.latitude)&&it(s.geoPointValue.longitude)===it(i.geoPointValue.longitude)}(r,t);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return it(s.integerValue)===it(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=it(s.doubleValue),u=it(i.doubleValue);return o===u?Kr(o)===Kr(u):isNaN(o)&&isNaN(u)}return!1}(r,t);case 9:return kn(r.arrayValue.values||[],t.arrayValue.values||[],ne);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},u=i.mapValue.fields||{};if(Xc(o)!==Xc(u))return!1;for(const c in o)if(o.hasOwnProperty(c)&&(u[c]===void 0||!ne(o[c],u[c])))return!1;return!0}(r,t);default:return M(52216,{left:r})}}function Yr(r,t){return(r.values||[]).find(e=>ne(e,t))!==void 0}function xe(r,t){if(r===t)return 0;const e=De(r),n=De(t);if(e!==n)return $(e,n);switch(e){case 0:case 9007199254740991:return 0;case 1:return $(r.booleanValue,t.booleanValue);case 2:return function(i,o){const u=it(i.integerValue||i.doubleValue),c=it(o.integerValue||o.doubleValue);return u<c?-1:u>c?1:u===c?0:isNaN(u)?isNaN(c)?0:-1:1}(r,t);case 3:return Yc(r.timestampValue,t.timestampValue);case 4:return Yc(Xr(r),Xr(t));case 5:return Lo(r.stringValue,t.stringValue);case 6:return function(i,o){const u=ae(i),c=ae(o);return u.compareTo(c)}(r.bytesValue,t.bytesValue);case 7:return function(i,o){const u=i.split("/"),c=o.split("/");for(let h=0;h<u.length&&h<c.length;h++){const f=$(u[h],c[h]);if(f!==0)return f}return $(u.length,c.length)}(r.referenceValue,t.referenceValue);case 8:return function(i,o){const u=$(it(i.latitude),it(o.latitude));return u!==0?u:$(it(i.longitude),it(o.longitude))}(r.geoPointValue,t.geoPointValue);case 9:return Zc(r.arrayValue,t.arrayValue);case 10:return function(i,o){var g,b,D,x;const u=i.fields||{},c=o.fields||{},h=(g=u[Un])==null?void 0:g.arrayValue,f=(b=c[Un])==null?void 0:b.arrayValue,p=$(((D=h==null?void 0:h.values)==null?void 0:D.length)||0,((x=f==null?void 0:f.values)==null?void 0:x.length)||0);return p!==0?p:Zc(h,f)}(r.mapValue,t.mapValue);case 11:return function(i,o){if(i===we.mapValue&&o===we.mapValue)return 0;if(i===we.mapValue)return 1;if(o===we.mapValue)return-1;const u=i.fields||{},c=Object.keys(u),h=o.fields||{},f=Object.keys(h);c.sort(),f.sort();for(let p=0;p<c.length&&p<f.length;++p){const g=Lo(c[p],f[p]);if(g!==0)return g;const b=xe(u[c[p]],h[f[p]]);if(b!==0)return b}return $(c.length,f.length)}(r.mapValue,t.mapValue);default:throw M(23264,{he:e})}}function Yc(r,t){if(typeof r=="string"&&typeof t=="string"&&r.length===t.length)return $(r,t);const e=oe(r),n=oe(t),s=$(e.seconds,n.seconds);return s!==0?s:$(e.nanos,n.nanos)}function Zc(r,t){const e=r.values||[],n=t.values||[];for(let s=0;s<e.length&&s<n.length;++s){const i=xe(e[s],n[s]);if(i)return i}return $(e.length,n.length)}function qn(r){return $o(r)}function $o(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(e){const n=oe(e);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(e){return ae(e).toBase64()}(r.bytesValue):"referenceValue"in r?function(e){return O.fromName(e).toString()}(r.referenceValue):"geoPointValue"in r?function(e){return`geo(${e.latitude},${e.longitude})`}(r.geoPointValue):"arrayValue"in r?function(e){let n="[",s=!0;for(const i of e.values||[])s?s=!1:n+=",",n+=$o(i);return n+"]"}(r.arrayValue):"mapValue"in r?function(e){const n=Object.keys(e.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${$o(e.fields[o])}`;return s+"}"}(r.mapValue):M(61005,{value:r})}function Ws(r){switch(De(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=Vi(r);return t?16+Ws(t):16;case 5:return 2*r.stringValue.length;case 6:return ae(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return function(n){return(n.values||[]).reduce((s,i)=>s+Ws(i),0)}(r.arrayValue);case 10:case 11:return function(n){let s=0;return Fe(n.fields,(i,o)=>{s+=i.length+Ws(o)}),s}(r.mapValue);default:throw M(13486,{value:r})}}function Zr(r,t){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${t.path.canonicalString()}`}}function Go(r){return!!r&&"integerValue"in r}function ts(r){return!!r&&"arrayValue"in r}function tl(r){return!!r&&"nullValue"in r}function el(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function Xs(r){return!!r&&"mapValue"in r}function Ci(r){var e,n;return((n=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[va])==null?void 0:n.stringValue)===Ra}function Mr(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const t={mapValue:{fields:{}}};return Fe(r.mapValue.fields,(e,n)=>t.mapValue.fields[e]=Mr(n)),t}if(r.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(r.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=Mr(r.arrayValue.values[e]);return t}return{...r}}function hd(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===ld}const dd={mapValue:{fields:{[va]:{stringValue:Ra},[Un]:{arrayValue:{}}}}};function c_(r){return"nullValue"in r?Qs:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?Zr(an.empty(),O.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Ci(r)?dd:{mapValue:{}}:M(35942,{value:r})}function l_(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?Zr(an.empty(),O.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?dd:"mapValue"in r?Ci(r)?{mapValue:{}}:we:M(61959,{value:r})}function nl(r,t){const e=xe(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?-1:!r.inclusive&&t.inclusive?1:0}function rl(r,t){const e=xe(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?1:!r.inclusive&&t.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(t){this.value=t}static empty(){return new Rt({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!Xs(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=Mr(e)}setAll(t){let e=at.emptyPath(),n={},s=[];t.forEach((o,u)=>{if(!e.isImmediateParentOf(u)){const c=this.getFieldsMap(e);this.applyChanges(c,n,s),n={},s=[],e=u.popLast()}o?n[u.lastSegment()]=Mr(o):s.push(u.lastSegment())});const i=this.getFieldsMap(e);this.applyChanges(i,n,s)}delete(t){const e=this.field(t.popLast());Xs(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return ne(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let s=e.mapValue.fields[t.get(n)];Xs(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=s),e=s}return e.mapValue.fields}applyChanges(t,e,n){Fe(e,(s,i)=>t[s]=i);for(const s of n)delete t[s]}clone(){return new Rt(Mr(this.value))}}function fd(r){const t=[];return Fe(r.fields,(e,n)=>{const s=new at([e]);if(Xs(n)){const i=fd(n.mapValue).fields;if(i.length===0)t.push(s);else for(const o of i)t.push(s.child(o))}else t.push(s)}),new Mt(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(t,e,n,s,i,o,u){this.key=t,this.documentType=e,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=u}static newInvalidDocument(t){return new ot(t,0,U.min(),U.min(),U.min(),Rt.empty(),0)}static newFoundDocument(t,e,n,s){return new ot(t,1,e,U.min(),n,s,0)}static newNoDocument(t,e){return new ot(t,2,e,U.min(),U.min(),Rt.empty(),0)}static newUnknownDocument(t,e){return new ot(t,3,e,U.min(),U.min(),Rt.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=Rt.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=Rt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof ot&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new ot(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(t,e){this.position=t,this.inclusive=e}}function sl(r,t,e){let n=0;for(let s=0;s<r.position.length;s++){const i=t[s],o=r.position[s];if(i.field.isKeyField()?n=O.comparator(O.fromName(o.referenceValue),e.key):n=xe(o,e.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function il(r,t){if(r===null)return t===null;if(t===null||r.inclusive!==t.inclusive||r.position.length!==t.position.length)return!1;for(let e=0;e<r.position.length;e++)if(!ne(r.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{constructor(t,e="asc"){this.field=t,this.dir=e}}function h_(r,t){return r.dir===t.dir&&r.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class md{}class Q extends md{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,n):new d_(t,e,n):e==="array-contains"?new p_(t,n):e==="in"?new Td(t,n):e==="not-in"?new g_(t,n):e==="array-contains-any"?new __(t,n):new Q(t,e,n)}static createKeyFieldInFilter(t,e,n){return e==="in"?new f_(t,n):new m_(t,n)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(xe(e,this.value)):e!==null&&De(this.value)===De(e)&&this.matchesComparison(xe(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return M(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class tt extends md{constructor(t,e){super(),this.filters=t,this.op=e,this.Pe=null}static create(t,e){return new tt(t,e)}matches(t){return zn(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function zn(r){return r.op==="and"}function Ko(r){return r.op==="or"}function ba(r){return pd(r)&&zn(r)}function pd(r){for(const t of r.filters)if(t instanceof tt)return!1;return!0}function Ho(r){if(r instanceof Q)return r.field.canonicalString()+r.op.toString()+qn(r.value);if(ba(r))return r.filters.map(t=>Ho(t)).join(",");{const t=r.filters.map(e=>Ho(e)).join(",");return`${r.op}(${t})`}}function gd(r,t){return r instanceof Q?function(n,s){return s instanceof Q&&n.op===s.op&&n.field.isEqual(s.field)&&ne(n.value,s.value)}(r,t):r instanceof tt?function(n,s){return s instanceof tt&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((i,o,u)=>i&&gd(o,s.filters[u]),!0):!1}(r,t):void M(19439)}function _d(r,t){const e=r.filters.concat(t);return tt.create(e,r.op)}function yd(r){return r instanceof Q?function(e){return`${e.field.canonicalString()} ${e.op} ${qn(e.value)}`}(r):r instanceof tt?function(e){return e.op.toString()+" {"+e.getFilters().map(yd).join(" ,")+"}"}(r):"Filter"}class d_ extends Q{constructor(t,e,n){super(t,e,n),this.key=O.fromName(n.referenceValue)}matches(t){const e=O.comparator(t.key,this.key);return this.matchesComparison(e)}}class f_ extends Q{constructor(t,e){super(t,"in",e),this.keys=Id("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class m_ extends Q{constructor(t,e){super(t,"not-in",e),this.keys=Id("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Id(r,t){var e;return(((e=t.arrayValue)==null?void 0:e.values)||[]).map(n=>O.fromName(n.referenceValue))}class p_ extends Q{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return ts(e)&&Yr(e.arrayValue,this.value)}}class Td extends Q{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&Yr(this.value.arrayValue,e)}}class g_ extends Q{constructor(t,e){super(t,"not-in",e)}matches(t){if(Yr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!Yr(this.value.arrayValue,e)}}class __ extends Q{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!ts(e)||!e.arrayValue.values)&&e.arrayValue.values.some(n=>Yr(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{constructor(t,e=null,n=[],s=[],i=null,o=null,u=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=u,this.Te=null}}function Qo(r,t=null,e=[],n=[],s=null,i=null,o=null){return new y_(r,t,e,n,s,i,o)}function un(r){const t=F(r);if(t.Te===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(n=>Ho(n)).join(","),e+="|ob:",e+=t.orderBy.map(n=>function(i){return i.field.canonicalString()+i.dir}(n)).join(","),us(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(n=>qn(n)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(n=>qn(n)).join(",")),t.Te=e}return t.Te}function ls(r,t){if(r.limit!==t.limit||r.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<r.orderBy.length;e++)if(!h_(r.orderBy[e],t.orderBy[e]))return!1;if(r.filters.length!==t.filters.length)return!1;for(let e=0;e<r.filters.length;e++)if(!gd(r.filters[e],t.filters[e]))return!1;return r.collectionGroup===t.collectionGroup&&!!r.path.isEqual(t.path)&&!!il(r.startAt,t.startAt)&&il(r.endAt,t.endAt)}function li(r){return O.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function hi(r,t){return r.filters.filter(e=>e instanceof Q&&e.field.isEqual(t))}function ol(r,t,e){let n=Qs,s=!0;for(const i of hi(r,t)){let o=Qs,u=!0;switch(i.op){case"<":case"<=":o=c_(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,u=!1;break;case"!=":case"not-in":o=Qs}nl({value:n,inclusive:s},{value:o,inclusive:u})<0&&(n=o,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const o=e.position[i];nl({value:n,inclusive:s},{value:o,inclusive:e.inclusive})<0&&(n=o,s=e.inclusive);break}}return{value:n,inclusive:s}}function al(r,t,e){let n=we,s=!0;for(const i of hi(r,t)){let o=we,u=!0;switch(i.op){case">=":case">":o=l_(i.value),u=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,u=!1;break;case"!=":case"not-in":o=we}rl({value:n,inclusive:s},{value:o,inclusive:u})>0&&(n=o,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const o=e.position[i];rl({value:n,inclusive:s},{value:o,inclusive:e.inclusive})>0&&(n=o,s=e.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(t,e=null,n=[],s=[],i=null,o="F",u=null,c=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=u,this.endAt=c,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function Ed(r,t,e,n,s,i,o,u){return new hs(r,t,e,n,s,i,o,u)}function ds(r){return new hs(r)}function ul(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function wd(r){return r.collectionGroup!==null}function Fr(r){const t=F(r);if(t.Ie===null){t.Ie=[];const e=new Set;for(const i of t.explicitOrderBy)t.Ie.push(i),e.add(i.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(o){let u=new et(at.comparator);return o.filters.forEach(c=>{c.getFlattenedFilters().forEach(h=>{h.isInequality()&&(u=u.add(h.field))})}),u})(t).forEach(i=>{e.has(i.canonicalString())||i.isKeyField()||t.Ie.push(new ci(i,n))}),e.has(at.keyField().canonicalString())||t.Ie.push(new ci(at.keyField(),n))}return t.Ie}function jt(r){const t=F(r);return t.Ee||(t.Ee=Ad(t,Fr(r))),t.Ee}function I_(r){const t=F(r);return t.de||(t.de=Ad(t,r.explicitOrderBy)),t.de}function Ad(r,t){if(r.limitType==="F")return Qo(r.path,r.collectionGroup,t,r.filters,r.limit,r.startAt,r.endAt);{t=t.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new ci(s.field,i)});const e=r.endAt?new jn(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new jn(r.startAt.position,r.startAt.inclusive):null;return Qo(r.path,r.collectionGroup,t,r.filters,r.limit,e,n)}}function Wo(r,t){const e=r.filters.concat([t]);return new hs(r.path,r.collectionGroup,r.explicitOrderBy.slice(),e,r.limit,r.limitType,r.startAt,r.endAt)}function di(r,t,e){return new hs(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),t,e,r.startAt,r.endAt)}function Di(r,t){return ls(jt(r),jt(t))&&r.limitType===t.limitType}function vd(r){return`${un(jt(r))}|lt:${r.limitType}`}function Sn(r){return`Query(target=${function(e){let n=e.path.canonicalString();return e.collectionGroup!==null&&(n+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(n+=`, filters: [${e.filters.map(s=>yd(s)).join(", ")}]`),us(e.limit)||(n+=", limit: "+e.limit),e.orderBy.length>0&&(n+=`, orderBy: [${e.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),e.startAt&&(n+=", startAt: ",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(s=>qn(s)).join(",")),e.endAt&&(n+=", endAt: ",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(s=>qn(s)).join(",")),`Target(${n})`}(jt(r))}; limitType=${r.limitType})`}function fs(r,t){return t.isFoundDocument()&&function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):O.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)}(r,t)&&function(n,s){for(const i of Fr(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(r,t)&&function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0}(r,t)&&function(n,s){return!(n.startAt&&!function(o,u,c){const h=sl(o,u,c);return o.inclusive?h<=0:h<0}(n.startAt,Fr(n),s)||n.endAt&&!function(o,u,c){const h=sl(o,u,c);return o.inclusive?h>=0:h>0}(n.endAt,Fr(n),s))}(r,t)}function Rd(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function bd(r){return(t,e)=>{let n=!1;for(const s of Fr(r)){const i=T_(s,t,e);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function T_(r,t,e){const n=r.field.isKeyField()?O.comparator(t.key,e.key):function(i,o,u){const c=o.data.field(i),h=u.data.field(i);return c!==null&&h!==null?xe(c,h):M(42886)}(r.field,t,e);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return M(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ue{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,t))return i}}has(t){return this.get(t)!==void 0}set(t,e){const n=this.mapKeyFn(t),s=this.inner[n];if(s===void 0)return this.inner[n]=[[t,e]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],t))return void(s[i]=[t,e]);s.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],t))return n.length===1?delete this.inner[e]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(t){Fe(this.inner,(e,n)=>{for(const[s,i]of n)t(s,i)})}isEmpty(){return sd(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const E_=new rt(O.comparator);function Ut(){return E_}const Sd=new rt(O.comparator);function Pr(...r){let t=Sd;for(const e of r)t=t.insert(e.key,e);return t}function Pd(r){let t=Sd;return r.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function Yt(){return Lr()}function Vd(){return Lr()}function Lr(){return new ue(r=>r.toString(),(r,t)=>r.isEqual(t))}const w_=new rt(O.comparator),A_=new et(O.comparator);function H(...r){let t=A_;for(const e of r)t=t.add(e);return t}const v_=new et($);function Sa(){return v_}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pa(r,t){if(r.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Kr(t)?"-0":t}}function Cd(r){return{integerValue:""+r}}function R_(r,t){return Hh(t)?Cd(t):Pa(r,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xi{constructor(){this._=void 0}}function b_(r,t,e){return r instanceof es?function(s,i){const o={fields:{[ad]:{stringValue:od},[cd]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Aa(i)&&(i=Vi(i)),i&&(o.fields[ud]=i),{mapValue:o}}(e,t):r instanceof $n?xd(r,t):r instanceof Gn?Nd(r,t):function(s,i){const o=Dd(s,i),u=cl(o)+cl(s.Ae);return Go(o)&&Go(s.Ae)?Cd(u):Pa(s.serializer,u)}(r,t)}function S_(r,t,e){return r instanceof $n?xd(r,t):r instanceof Gn?Nd(r,t):e}function Dd(r,t){return r instanceof ns?function(n){return Go(n)||function(i){return!!i&&"doubleValue"in i}(n)}(t)?t:{integerValue:0}:null}class es extends xi{}class $n extends xi{constructor(t){super(),this.elements=t}}function xd(r,t){const e=kd(t);for(const n of r.elements)e.some(s=>ne(s,n))||e.push(n);return{arrayValue:{values:e}}}class Gn extends xi{constructor(t){super(),this.elements=t}}function Nd(r,t){let e=kd(t);for(const n of r.elements)e=e.filter(s=>!ne(s,n));return{arrayValue:{values:e}}}class ns extends xi{constructor(t,e){super(),this.serializer=t,this.Ae=e}}function cl(r){return it(r.integerValue||r.doubleValue)}function kd(r){return ts(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P_{constructor(t,e){this.field=t,this.transform=e}}function V_(r,t){return r.field.isEqual(t.field)&&function(n,s){return n instanceof $n&&s instanceof $n||n instanceof Gn&&s instanceof Gn?kn(n.elements,s.elements,ne):n instanceof ns&&s instanceof ns?ne(n.Ae,s.Ae):n instanceof es&&s instanceof es}(r.transform,t.transform)}class C_{constructor(t,e){this.version=t,this.transformResults=e}}class ut{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new ut}static exists(t){return new ut(void 0,t)}static updateTime(t){return new ut(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Js(r,t){return r.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(r.updateTime):r.exists===void 0||r.exists===t.isFoundDocument()}class Ni{}function Od(r,t){if(!r.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return r.isNoDocument()?new tr(r.key,ut.none()):new Zn(r.key,r.data,ut.none());{const e=r.data,n=Rt.empty();let s=new et(at.comparator);for(let i of t.fields)if(!s.has(i)){let o=e.field(i);o===null&&i.length>1&&(i=i.popLast(),o=e.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new ce(r.key,n,new Mt(s.toArray()),ut.none())}}function D_(r,t,e){r instanceof Zn?function(s,i,o){const u=s.value.clone(),c=hl(s.fieldTransforms,i,o.transformResults);u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(r,t,e):r instanceof ce?function(s,i,o){if(!Js(s.precondition,i))return void i.convertToUnknownDocument(o.version);const u=hl(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(Md(s)),c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(r,t,e):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,t,e)}function Br(r,t,e,n){return r instanceof Zn?function(i,o,u,c){if(!Js(i.precondition,o))return u;const h=i.value.clone(),f=dl(i.fieldTransforms,c,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(r,t,e,n):r instanceof ce?function(i,o,u,c){if(!Js(i.precondition,o))return u;const h=dl(i.fieldTransforms,c,o),f=o.data;return f.setAll(Md(i)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(r,t,e,n):function(i,o,u){return Js(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):u}(r,t,e)}function x_(r,t){let e=null;for(const n of r.fieldTransforms){const s=t.data.field(n.field),i=Dd(n.transform,s||null);i!=null&&(e===null&&(e=Rt.empty()),e.set(n.field,i))}return e||null}function ll(r,t){return r.type===t.type&&!!r.key.isEqual(t.key)&&!!r.precondition.isEqual(t.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&kn(n,s,(i,o)=>V_(i,o))}(r.fieldTransforms,t.fieldTransforms)&&(r.type===0?r.value.isEqual(t.value):r.type!==1||r.data.isEqual(t.data)&&r.fieldMask.isEqual(t.fieldMask))}class Zn extends Ni{constructor(t,e,n,s=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class ce extends Ni{constructor(t,e,n,s,i=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Md(r){const t=new Map;return r.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const n=r.data.field(e);t.set(e,n)}}),t}function hl(r,t,e){const n=new Map;L(r.length===e.length,32656,{Re:e.length,Ve:r.length});for(let s=0;s<e.length;s++){const i=r[s],o=i.transform,u=t.data.field(i.field);n.set(i.field,S_(o,u,e[s]))}return n}function dl(r,t,e){const n=new Map;for(const s of r){const i=s.transform,o=e.data.field(s.field);n.set(s.field,b_(i,o,t))}return n}class tr extends Ni{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Va extends Ni{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ca{constructor(t,e,n,s){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(t.key)&&D_(i,t,n[s])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=Br(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=Br(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=Vd();return this.mutations.forEach(s=>{const i=t.get(s.key),o=i.overlayedDocument;let u=this.applyToLocalView(o,i.mutatedFields);u=e.has(s.key)?null:u;const c=Od(o,u);c!==null&&n.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(U.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),H())}isEqual(t){return this.batchId===t.batchId&&kn(this.mutations,t.mutations,(e,n)=>ll(e,n))&&kn(this.baseMutations,t.baseMutations,(e,n)=>ll(e,n))}}class Da{constructor(t,e,n,s){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=s}static from(t,e,n){L(t.mutations.length===n.length,58842,{me:t.mutations.length,fe:n.length});let s=function(){return w_}();const i=t.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new Da(t,e,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xa{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N_{constructor(t,e,n){this.alias=t,this.aggregateType=e,this.fieldPath=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k_{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var pt,X;function Fd(r){switch(r){case P.OK:return M(64938);case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0;default:return M(15467,{code:r})}}function Ld(r){if(r===void 0)return ft("GRPC error has no .code"),P.UNKNOWN;switch(r){case pt.OK:return P.OK;case pt.CANCELLED:return P.CANCELLED;case pt.UNKNOWN:return P.UNKNOWN;case pt.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case pt.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case pt.INTERNAL:return P.INTERNAL;case pt.UNAVAILABLE:return P.UNAVAILABLE;case pt.UNAUTHENTICATED:return P.UNAUTHENTICATED;case pt.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case pt.NOT_FOUND:return P.NOT_FOUND;case pt.ALREADY_EXISTS:return P.ALREADY_EXISTS;case pt.PERMISSION_DENIED:return P.PERMISSION_DENIED;case pt.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case pt.ABORTED:return P.ABORTED;case pt.OUT_OF_RANGE:return P.OUT_OF_RANGE;case pt.UNIMPLEMENTED:return P.UNIMPLEMENTED;case pt.DATA_LOSS:return P.DATA_LOSS;default:return M(39323,{code:r})}}(X=pt||(pt={}))[X.OK=0]="OK",X[X.CANCELLED=1]="CANCELLED",X[X.UNKNOWN=2]="UNKNOWN",X[X.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",X[X.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",X[X.NOT_FOUND=5]="NOT_FOUND",X[X.ALREADY_EXISTS=6]="ALREADY_EXISTS",X[X.PERMISSION_DENIED=7]="PERMISSION_DENIED",X[X.UNAUTHENTICATED=16]="UNAUTHENTICATED",X[X.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",X[X.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",X[X.ABORTED=10]="ABORTED",X[X.OUT_OF_RANGE=11]="OUT_OF_RANGE",X[X.UNIMPLEMENTED=12]="UNIMPLEMENTED",X[X.INTERNAL=13]="INTERNAL",X[X.UNAVAILABLE=14]="UNAVAILABLE",X[X.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O_(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M_=new Se([4294967295,4294967295],0);function fl(r){const t=O_().encode(r),e=new Dh;return e.update(t),new Uint8Array(e.digest())}function ml(r){const t=new DataView(r.buffer),e=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new Se([e,n],0),new Se([s,i],0)]}class Na{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new Vr(`Invalid padding: ${e}`);if(n<0)throw new Vr(`Invalid hash count: ${n}`);if(t.length>0&&this.hashCount===0)throw new Vr(`Invalid hash count: ${n}`);if(t.length===0&&e!==0)throw new Vr(`Invalid padding when bitmap length is 0: ${e}`);this.ge=8*t.length-e,this.pe=Se.fromNumber(this.ge)}ye(t,e,n){let s=t.add(e.multiply(Se.fromNumber(n)));return s.compare(M_)===1&&(s=new Se([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(t){return!!(this.bitmap[Math.floor(t/8)]&1<<t%8)}mightContain(t){if(this.ge===0)return!1;const e=fl(t),[n,s]=ml(e);for(let i=0;i<this.hashCount;i++){const o=this.ye(n,s,i);if(!this.we(o))return!1}return!0}static create(t,e,n){const s=t%8==0?0:8-t%8,i=new Uint8Array(Math.ceil(t/8)),o=new Na(i,s,e);return n.forEach(u=>o.insert(u)),o}insert(t){if(this.ge===0)return;const e=fl(t),[n,s]=ml(e);for(let i=0;i<this.hashCount;i++){const o=this.ye(n,s,i);this.Se(o)}}Se(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class Vr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(t,e,n,s,i){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const s=new Map;return s.set(t,ps.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new ms(U.min(),s,new rt($),Ut(),H())}}class ps{constructor(t,e,n,s,i){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new ps(n,e,H(),H(),H())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(t,e,n,s){this.be=t,this.removedTargetIds=e,this.key=n,this.De=s}}class Bd{constructor(t,e){this.targetId=t,this.Ce=e}}class Ud{constructor(t,e,n=mt.EMPTY_BYTE_STRING,s=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=s}}class pl{constructor(){this.ve=0,this.Fe=gl(),this.Me=mt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(t){t.approximateByteSize()>0&&(this.Oe=!0,this.Me=t)}ke(){let t=H(),e=H(),n=H();return this.Fe.forEach((s,i)=>{switch(i){case 0:t=t.add(s);break;case 2:e=e.add(s);break;case 1:n=n.add(s);break;default:M(38017,{changeType:i})}}),new ps(this.Me,this.xe,t,e,n)}qe(){this.Oe=!1,this.Fe=gl()}Qe(t,e){this.Oe=!0,this.Fe=this.Fe.insert(t,e)}$e(t){this.Oe=!0,this.Fe=this.Fe.remove(t)}Ue(){this.ve+=1}Ke(){this.ve-=1,L(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class F_{constructor(t){this.Ge=t,this.ze=new Map,this.je=Ut(),this.Je=Fs(),this.He=Fs(),this.Ye=new rt($)}Ze(t){for(const e of t.be)t.De&&t.De.isFoundDocument()?this.Xe(e,t.De):this.et(e,t.key,t.De);for(const e of t.removedTargetIds)this.et(e,t.key,t.De)}tt(t){this.forEachTarget(t,e=>{const n=this.nt(e);switch(t.state){case 0:this.rt(e)&&n.Le(t.resumeToken);break;case 1:n.Ke(),n.Ne||n.qe(),n.Le(t.resumeToken);break;case 2:n.Ke(),n.Ne||this.removeTarget(e);break;case 3:this.rt(e)&&(n.We(),n.Le(t.resumeToken));break;case 4:this.rt(e)&&(this.it(e),n.Le(t.resumeToken));break;default:M(56790,{state:t.state})}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.ze.forEach((n,s)=>{this.rt(s)&&e(s)})}st(t){const e=t.targetId,n=t.Ce.count,s=this.ot(e);if(s){const i=s.target;if(li(i))if(n===0){const o=new O(i.path);this.et(e,o,ot.newNoDocument(o,U.min()))}else L(n===1,20013,{expectedCount:n});else{const o=this._t(e);if(o!==n){const u=this.ut(t),c=u?this.ct(u,t,o):1;if(c!==0){this.it(e);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(e,h)}}}}}ut(t){const e=t.Ce.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=e;let o,u;try{o=ae(n).toUint8Array()}catch(c){if(c instanceof id)return Nn("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{u=new Na(o,s,i)}catch(c){return Nn(c instanceof Vr?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return u.ge===0?null:u}ct(t,e,n){return e.Ce.count===n-this.Pt(t,e.targetId)?0:2}Pt(t,e){const n=this.Ge.getRemoteKeysForTarget(e);let s=0;return n.forEach(i=>{const o=this.Ge.ht(),u=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;t.mightContain(u)||(this.et(e,i,null),s++)}),s}Tt(t){const e=new Map;this.ze.forEach((i,o)=>{const u=this.ot(o);if(u){if(i.current&&li(u.target)){const c=new O(u.target.path);this.It(c).has(o)||this.Et(o,c)||this.et(o,c,ot.newNoDocument(c,t))}i.Be&&(e.set(o,i.ke()),i.qe())}});let n=H();this.He.forEach((i,o)=>{let u=!0;o.forEachWhile(c=>{const h=this.ot(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(n=n.add(i))}),this.je.forEach((i,o)=>o.setReadTime(t));const s=new ms(t,e,this.Ye,this.je,n);return this.je=Ut(),this.Je=Fs(),this.He=Fs(),this.Ye=new rt($),s}Xe(t,e){if(!this.rt(t))return;const n=this.Et(t,e.key)?2:0;this.nt(t).Qe(e.key,n),this.je=this.je.insert(e.key,e),this.Je=this.Je.insert(e.key,this.It(e.key).add(t)),this.He=this.He.insert(e.key,this.dt(e.key).add(t))}et(t,e,n){if(!this.rt(t))return;const s=this.nt(t);this.Et(t,e)?s.Qe(e,1):s.$e(e),this.He=this.He.insert(e,this.dt(e).delete(t)),this.He=this.He.insert(e,this.dt(e).add(t)),n&&(this.je=this.je.insert(e,n))}removeTarget(t){this.ze.delete(t)}_t(t){const e=this.nt(t).ke();return this.Ge.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}Ue(t){this.nt(t).Ue()}nt(t){let e=this.ze.get(t);return e||(e=new pl,this.ze.set(t,e)),e}dt(t){let e=this.He.get(t);return e||(e=new et($),this.He=this.He.insert(t,e)),e}It(t){let e=this.Je.get(t);return e||(e=new et($),this.Je=this.Je.insert(t,e)),e}rt(t){const e=this.ot(t)!==null;return e||C("WatchChangeAggregator","Detected inactive target",t),e}ot(t){const e=this.ze.get(t);return e&&e.Ne?null:this.Ge.At(t)}it(t){this.ze.set(t,new pl),this.Ge.getRemoteKeysForTarget(t).forEach(e=>{this.et(t,e,null)})}Et(t,e){return this.Ge.getRemoteKeysForTarget(t).has(e)}}function Fs(){return new rt(O.comparator)}function gl(){return new rt(O.comparator)}const L_={asc:"ASCENDING",desc:"DESCENDING"},B_={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},U_={and:"AND",or:"OR"};class q_{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function Xo(r,t){return r.useProto3Json||us(t)?t:{value:t}}function Kn(r,t){return r.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function qd(r,t){return r.useProto3Json?t.toBase64():t.toUint8Array()}function j_(r,t){return Kn(r,t.toTimestamp())}function wt(r){return L(!!r,49232),U.fromTimestamp(function(e){const n=oe(e);return new Z(n.seconds,n.nanos)}(r))}function ka(r,t){return Jo(r,t).canonicalString()}function Jo(r,t){const e=function(s){return new Y(["projects",s.projectId,"databases",s.database])}(r).child("documents");return t===void 0?e:e.child(t)}function jd(r){const t=Y.fromString(r);return L(Xd(t),10190,{key:t.toString()}),t}function rs(r,t){return ka(r.databaseId,t.path)}function se(r,t){const e=jd(t);if(e.get(1)!==r.databaseId.projectId)throw new N(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+r.databaseId.projectId);if(e.get(3)!==r.databaseId.database)throw new N(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+r.databaseId.database);return new O(Gd(e))}function zd(r,t){return ka(r.databaseId,t)}function $d(r){const t=jd(r);return t.length===4?Y.emptyPath():Gd(t)}function Yo(r){return new Y(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Gd(r){return L(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function _l(r,t,e){return{name:rs(r,t),fields:e.value.mapValue.fields}}function z_(r,t,e){const n=se(r,t.name),s=wt(t.updateTime),i=t.createTime?wt(t.createTime):U.min(),o=new Rt({mapValue:{fields:t.fields}}),u=ot.newFoundDocument(n,s,i,o);return e&&u.setHasCommittedMutations(),e?u.setHasCommittedMutations():u}function $_(r,t){return"found"in t?function(n,s){L(!!s.found,43571),s.found.name,s.found.updateTime;const i=se(n,s.found.name),o=wt(s.found.updateTime),u=s.found.createTime?wt(s.found.createTime):U.min(),c=new Rt({mapValue:{fields:s.found.fields}});return ot.newFoundDocument(i,o,u,c)}(r,t):"missing"in t?function(n,s){L(!!s.missing,3894),L(!!s.readTime,22933);const i=se(n,s.missing),o=wt(s.readTime);return ot.newNoDocument(i,o)}(r,t):M(7234,{result:t})}function G_(r,t){let e;if("targetChange"in t){t.targetChange;const n=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:M(39313,{state:h})}(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],i=function(h,f){return h.useProto3Json?(L(f===void 0||typeof f=="string",58123),mt.fromBase64String(f||"")):(L(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),mt.fromUint8Array(f||new Uint8Array))}(r,t.targetChange.resumeToken),o=t.targetChange.cause,u=o&&function(h){const f=h.code===void 0?P.UNKNOWN:Ld(h.code);return new N(f,h.message||"")}(o);e=new Ud(n,s,i,u||null)}else if("documentChange"in t){t.documentChange;const n=t.documentChange;n.document,n.document.name,n.document.updateTime;const s=se(r,n.document.name),i=wt(n.document.updateTime),o=n.document.createTime?wt(n.document.createTime):U.min(),u=new Rt({mapValue:{fields:n.document.fields}}),c=ot.newFoundDocument(s,i,o,u),h=n.targetIds||[],f=n.removedTargetIds||[];e=new Ys(h,f,c.key,c)}else if("documentDelete"in t){t.documentDelete;const n=t.documentDelete;n.document;const s=se(r,n.document),i=n.readTime?wt(n.readTime):U.min(),o=ot.newNoDocument(s,i),u=n.removedTargetIds||[];e=new Ys([],u,o.key,o)}else if("documentRemove"in t){t.documentRemove;const n=t.documentRemove;n.document;const s=se(r,n.document),i=n.removedTargetIds||[];e=new Ys([],i,s,null)}else{if(!("filter"in t))return M(11601,{Rt:t});{t.filter;const n=t.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new k_(s,i),u=n.targetId;e=new Bd(u,o)}}return e}function ss(r,t){let e;if(t instanceof Zn)e={update:_l(r,t.key,t.value)};else if(t instanceof tr)e={delete:rs(r,t.key)};else if(t instanceof ce)e={update:_l(r,t.key,t.data),updateMask:Y_(t.fieldMask)};else{if(!(t instanceof Va))return M(16599,{Vt:t.type});e={verify:rs(r,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(n=>function(i,o){const u=o.transform;if(u instanceof es)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof $n)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof Gn)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof ns)return{fieldPath:o.field.canonicalString(),increment:u.Ae};throw M(20930,{transform:o.transform})}(0,n))),t.precondition.isNone||(e.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:j_(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:M(27497)}(r,t.precondition)),e}function Zo(r,t){const e=t.currentDocument?function(i){return i.updateTime!==void 0?ut.updateTime(wt(i.updateTime)):i.exists!==void 0?ut.exists(i.exists):ut.none()}(t.currentDocument):ut.none(),n=t.updateTransforms?t.updateTransforms.map(s=>function(o,u){let c=null;if("setToServerValue"in u)L(u.setToServerValue==="REQUEST_TIME",16630,{proto:u}),c=new es;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];c=new $n(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];c=new Gn(f)}else"increment"in u?c=new ns(o,u.increment):M(16584,{proto:u});const h=at.fromServerFormat(u.fieldPath);return new P_(h,c)}(r,s)):[];if(t.update){t.update.name;const s=se(r,t.update.name),i=new Rt({mapValue:{fields:t.update.fields}});if(t.updateMask){const o=function(c){const h=c.fieldPaths||[];return new Mt(h.map(f=>at.fromServerFormat(f)))}(t.updateMask);return new ce(s,i,o,e,n)}return new Zn(s,i,e,n)}if(t.delete){const s=se(r,t.delete);return new tr(s,e)}if(t.verify){const s=se(r,t.verify);return new Va(s,e)}return M(1463,{proto:t})}function K_(r,t){return r&&r.length>0?(L(t!==void 0,14353),r.map(e=>function(s,i){let o=s.updateTime?wt(s.updateTime):wt(i);return o.isEqual(U.min())&&(o=wt(i)),new C_(o,s.transformResults||[])}(e,t))):[]}function Kd(r,t){return{documents:[zd(r,t.path)]}}function Oa(r,t){const e={structuredQuery:{}},n=t.path;let s;t.collectionGroup!==null?(s=n,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=n.popLast(),e.structuredQuery.from=[{collectionId:n.lastSegment()}]),e.parent=zd(r,s);const i=function(h){if(h.length!==0)return Wd(tt.create(h,"and"))}(t.filters);i&&(e.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(f=>function(g){return{field:Ie(g.field),direction:W_(g.dir)}}(f))}(t.orderBy);o&&(e.structuredQuery.orderBy=o);const u=Xo(r,t.limit);return u!==null&&(e.structuredQuery.limit=u),t.startAt&&(e.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(t.endAt)),{ft:e,parent:s}}function H_(r,t,e,n){const{ft:s,parent:i}=Oa(r,t),o={},u=[];let c=0;return e.forEach(h=>{const f="aggregate_"+c++;o[f]=h.alias,h.aggregateType==="count"?u.push({alias:f,count:{}}):h.aggregateType==="avg"?u.push({alias:f,avg:{field:Ie(h.fieldPath)}}):h.aggregateType==="sum"&&u.push({alias:f,sum:{field:Ie(h.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:u,structuredQuery:s.structuredQuery},parent:s.parent},gt:o,parent:i}}function Hd(r){let t=$d(r.parent);const e=r.structuredQuery,n=e.from?e.from.length:0;let s=null;if(n>0){L(n===1,65062);const f=e.from[0];f.allDescendants?s=f.collectionId:t=t.child(f.collectionId)}let i=[];e.where&&(i=function(p){const g=Qd(p);return g instanceof tt&&ba(g)?g.getFilters():[g]}(e.where));let o=[];e.orderBy&&(o=function(p){return p.map(g=>function(D){return new ci(Pn(D.field),function(V){switch(V){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(D.direction))}(g))}(e.orderBy));let u=null;e.limit&&(u=function(p){let g;return g=typeof p=="object"?p.value:p,us(g)?null:g}(e.limit));let c=null;e.startAt&&(c=function(p){const g=!!p.before,b=p.values||[];return new jn(b,g)}(e.startAt));let h=null;return e.endAt&&(h=function(p){const g=!p.before,b=p.values||[];return new jn(b,g)}(e.endAt)),Ed(t,s,o,i,u,"F",c,h)}function Q_(r,t){const e=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return M(28987,{purpose:s})}}(t.purpose);return e==null?null:{"goog-listen-tags":e}}function Qd(r){return r.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const n=Pn(e.unaryFilter.field);return Q.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Pn(e.unaryFilter.field);return Q.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Pn(e.unaryFilter.field);return Q.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Pn(e.unaryFilter.field);return Q.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return M(61313);default:return M(60726)}}(r):r.fieldFilter!==void 0?function(e){return Q.create(Pn(e.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return M(58110);default:return M(50506)}}(e.fieldFilter.op),e.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(e){return tt.create(e.compositeFilter.filters.map(n=>Qd(n)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return M(1026)}}(e.compositeFilter.op))}(r):M(30097,{filter:r})}function W_(r){return L_[r]}function X_(r){return B_[r]}function J_(r){return U_[r]}function Ie(r){return{fieldPath:r.canonicalString()}}function Pn(r){return at.fromServerFormat(r.fieldPath)}function Wd(r){return r instanceof Q?function(e){if(e.op==="=="){if(el(e.value))return{unaryFilter:{field:Ie(e.field),op:"IS_NAN"}};if(tl(e.value))return{unaryFilter:{field:Ie(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(el(e.value))return{unaryFilter:{field:Ie(e.field),op:"IS_NOT_NAN"}};if(tl(e.value))return{unaryFilter:{field:Ie(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ie(e.field),op:X_(e.op),value:e.value}}}(r):r instanceof tt?function(e){const n=e.getFilters().map(s=>Wd(s));return n.length===1?n[0]:{compositeFilter:{op:J_(e.op),filters:n}}}(r):M(54877,{filter:r})}function Y_(r){const t=[];return r.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function Xd(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re{constructor(t,e,n,s,i=U.min(),o=U.min(),u=mt.EMPTY_BYTE_STRING,c=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=u,this.expectedCount=c}withSequenceNumber(t){return new re(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new re(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new re(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new re(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jd{constructor(t){this.yt=t}}function Z_(r,t){let e;if(t.document)e=z_(r.yt,t.document,!!t.hasCommittedMutations);else if(t.noDocument){const n=O.fromSegments(t.noDocument.path),s=ln(t.noDocument.readTime);e=ot.newNoDocument(n,s),t.hasCommittedMutations&&e.setHasCommittedMutations()}else{if(!t.unknownDocument)return M(56709);{const n=O.fromSegments(t.unknownDocument.path),s=ln(t.unknownDocument.version);e=ot.newUnknownDocument(n,s)}}return t.readTime&&e.setReadTime(function(s){const i=new Z(s[0],s[1]);return U.fromTimestamp(i)}(t.readTime)),e}function yl(r,t){const e=t.key,n={prefixPath:e.getCollectionPath().popLast().toArray(),collectionGroup:e.collectionGroup,documentId:e.path.lastSegment(),readTime:fi(t.readTime),hasCommittedMutations:t.hasCommittedMutations};if(t.isFoundDocument())n.document=function(i,o){return{name:rs(i,o.key),fields:o.data.value.mapValue.fields,updateTime:Kn(i,o.version.toTimestamp()),createTime:Kn(i,o.createTime.toTimestamp())}}(r.yt,t);else if(t.isNoDocument())n.noDocument={path:e.path.toArray(),readTime:cn(t.version)};else{if(!t.isUnknownDocument())return M(57904,{document:t});n.unknownDocument={path:e.path.toArray(),version:cn(t.version)}}return n}function fi(r){const t=r.toTimestamp();return[t.seconds,t.nanoseconds]}function cn(r){const t=r.toTimestamp();return{seconds:t.seconds,nanoseconds:t.nanoseconds}}function ln(r){const t=new Z(r.seconds,r.nanoseconds);return U.fromTimestamp(t)}function Je(r,t){const e=(t.baseMutations||[]).map(i=>Zo(r.yt,i));for(let i=0;i<t.mutations.length-1;++i){const o=t.mutations[i];if(i+1<t.mutations.length&&t.mutations[i+1].transform!==void 0){const u=t.mutations[i+1];o.updateTransforms=u.transform.fieldTransforms,t.mutations.splice(i+1,1),++i}}const n=t.mutations.map(i=>Zo(r.yt,i)),s=Z.fromMillis(t.localWriteTimeMs);return new Ca(t.batchId,s,e,n)}function Cr(r){const t=ln(r.readTime),e=r.lastLimboFreeSnapshotVersion!==void 0?ln(r.lastLimboFreeSnapshotVersion):U.min();let n;return n=function(i){return i.documents!==void 0}(r.query)?function(i){const o=i.documents.length;return L(o===1,1966,{count:o}),jt(ds($d(i.documents[0])))}(r.query):function(i){return jt(Hd(i))}(r.query),new re(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,t,e,mt.fromBase64String(r.resumeToken))}function Yd(r,t){const e=cn(t.snapshotVersion),n=cn(t.lastLimboFreeSnapshotVersion);let s;s=li(t.target)?Kd(r.yt,t.target):Oa(r.yt,t.target).ft;const i=t.resumeToken.toBase64();return{targetId:t.targetId,canonicalId:un(t.target),readTime:e,resumeToken:i,lastListenSequenceNumber:t.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Zd(r){const t=Hd({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?di(t,t.limit,"L"):t}function wo(r,t){return new xa(t.largestBatchId,Zo(r.yt,t.overlayMutation))}function Il(r,t){const e=t.path.lastSegment();return[r,Ct(t.path.popLast()),e]}function Tl(r,t,e,n){return{indexId:r,uid:t,sequenceNumber:e,readTime:cn(n.readTime),documentKey:Ct(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ty{getBundleMetadata(t,e){return El(t).get(e).next(n=>{if(n)return function(i){return{id:i.bundleId,createTime:ln(i.createTime),version:i.version}}(n)})}saveBundleMetadata(t,e){return El(t).put(function(s){return{bundleId:s.id,createTime:cn(wt(s.createTime)),version:s.version}}(e))}getNamedQuery(t,e){return wl(t).get(e).next(n=>{if(n)return function(i){return{name:i.name,query:Zd(i.bundledQuery),readTime:ln(i.readTime)}}(n)})}saveNamedQuery(t,e){return wl(t).put(function(s){return{name:s.name,readTime:cn(wt(s.readTime)),bundledQuery:s.bundledQuery}}(e))}}function El(r){return yt(r,bi)}function wl(r){return yt(r,Si)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ki{constructor(t,e){this.serializer=t,this.userId=e}static wt(t,e){const n=e.uid||"";return new ki(t,n)}getOverlay(t,e){return Er(t).get(Il(this.userId,e)).next(n=>n?wo(this.serializer,n):null)}getOverlays(t,e){const n=Yt();return A.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){const s=[];return n.forEach((i,o)=>{const u=new xa(e,o);s.push(this.St(t,u))}),A.waitFor(s)}removeOverlaysForBatchId(t,e,n){const s=new Set;e.forEach(o=>s.add(Ct(o.getCollectionPath())));const i=[];return s.forEach(o=>{const u=IDBKeyRange.bound([this.userId,o,n],[this.userId,o,n+1],!1,!0);i.push(Er(t).Z(jo,u))}),A.waitFor(i)}getOverlaysForCollection(t,e,n){const s=Yt(),i=Ct(e),o=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Er(t).J(jo,o).next(u=>{for(const c of u){const h=wo(this.serializer,c);s.set(h.getKey(),h)}return s})}getOverlaysForCollectionGroup(t,e,n,s){const i=Yt();let o;const u=IDBKeyRange.bound([this.userId,e,n],[this.userId,e,Number.POSITIVE_INFINITY],!0);return Er(t).ee({index:Zh,range:u},(c,h,f)=>{const p=wo(this.serializer,h);i.size()<s||p.largestBatchId===o?(i.set(p.getKey(),p),o=p.largestBatchId):f.done()}).next(()=>i)}St(t,e){return Er(t).put(function(s,i,o){const[u,c,h]=Il(i,o.mutation.key);return{userId:i,collectionPath:c,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:ss(s.yt,o.mutation)}}(this.serializer,this.userId,e))}}function Er(r){return yt(r,Pi)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ey{bt(t){return yt(t,Ea)}getSessionToken(t){return this.bt(t).get("sessionToken").next(e=>{const n=e==null?void 0:e.value;return n?mt.fromUint8Array(n):mt.EMPTY_BYTE_STRING})}setSessionToken(t,e){return this.bt(t).put({name:"sessionToken",value:e.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(){}Dt(t,e){this.Ct(t,e),e.vt()}Ct(t,e){if("nullValue"in t)this.Ft(e,5);else if("booleanValue"in t)this.Ft(e,10),e.Mt(t.booleanValue?1:0);else if("integerValue"in t)this.Ft(e,15),e.Mt(it(t.integerValue));else if("doubleValue"in t){const n=it(t.doubleValue);isNaN(n)?this.Ft(e,13):(this.Ft(e,15),Kr(n)?e.Mt(0):e.Mt(n))}else if("timestampValue"in t){let n=t.timestampValue;this.Ft(e,20),typeof n=="string"&&(n=oe(n)),e.xt(`${n.seconds||""}`),e.Mt(n.nanos||0)}else if("stringValue"in t)this.Ot(t.stringValue,e),this.Nt(e);else if("bytesValue"in t)this.Ft(e,30),e.Bt(ae(t.bytesValue)),this.Nt(e);else if("referenceValue"in t)this.Lt(t.referenceValue,e);else if("geoPointValue"in t){const n=t.geoPointValue;this.Ft(e,45),e.Mt(n.latitude||0),e.Mt(n.longitude||0)}else"mapValue"in t?hd(t)?this.Ft(e,Number.MAX_SAFE_INTEGER):Ci(t)?this.kt(t.mapValue,e):(this.qt(t.mapValue,e),this.Nt(e)):"arrayValue"in t?(this.Qt(t.arrayValue,e),this.Nt(e)):M(19022,{$t:t})}Ot(t,e){this.Ft(e,25),this.Ut(t,e)}Ut(t,e){e.xt(t)}qt(t,e){const n=t.fields||{};this.Ft(e,55);for(const s of Object.keys(n))this.Ot(s,e),this.Ct(n[s],e)}kt(t,e){var o,u;const n=t.fields||{};this.Ft(e,53);const s=Un,i=((u=(o=n[s].arrayValue)==null?void 0:o.values)==null?void 0:u.length)||0;this.Ft(e,15),e.Mt(it(i)),this.Ot(s,e),this.Ct(n[s],e)}Qt(t,e){const n=t.values||[];this.Ft(e,50);for(const s of n)this.Ct(s,e)}Lt(t,e){this.Ft(e,37),O.fromName(t).path.forEach(n=>{this.Ft(e,60),this.Ut(n,e)})}Ft(t,e){t.Mt(e)}Nt(t){t.Mt(2)}}Ye.Kt=new Ye;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wn=255;function ny(r){if(r===0)return 8;let t=0;return r>>4||(t+=4,r<<=4),r>>6||(t+=2,r<<=2),r>>7||(t+=1),t}function Al(r){const t=64-function(n){let s=0;for(let i=0;i<8;++i){const o=ny(255&n[i]);if(s+=o,o!==8)break}return s}(r);return Math.ceil(t/8)}class ry{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Wt(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Gt(n.value),n=e.next();this.zt()}jt(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Jt(n.value),n=e.next();this.Ht()}Yt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Gt(n);else if(n<2048)this.Gt(960|n>>>6),this.Gt(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Gt(480|n>>>12),this.Gt(128|63&n>>>6),this.Gt(128|63&n);else{const s=e.codePointAt(0);this.Gt(240|s>>>18),this.Gt(128|63&s>>>12),this.Gt(128|63&s>>>6),this.Gt(128|63&s)}}this.zt()}Zt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Jt(n);else if(n<2048)this.Jt(960|n>>>6),this.Jt(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Jt(480|n>>>12),this.Jt(128|63&n>>>6),this.Jt(128|63&n);else{const s=e.codePointAt(0);this.Jt(240|s>>>18),this.Jt(128|63&s>>>12),this.Jt(128|63&s>>>6),this.Jt(128|63&s)}}this.Ht()}Xt(t){const e=this.en(t),n=Al(e);this.tn(1+n),this.buffer[this.position++]=255&n;for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=255&e[s]}nn(t){const e=this.en(t),n=Al(e);this.tn(1+n),this.buffer[this.position++]=~(255&n);for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=~(255&e[s])}rn(){this.sn(wn),this.sn(255)}_n(){this.an(wn),this.an(255)}reset(){this.position=0}seed(t){this.tn(t.length),this.buffer.set(t,this.position),this.position+=t.length}un(){return this.buffer.slice(0,this.position)}en(t){const e=function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)}(t),n=!!(128&e[0]);e[0]^=n?255:128;for(let s=1;s<e.length;++s)e[s]^=n?255:0;return e}Gt(t){const e=255&t;e===0?(this.sn(0),this.sn(255)):e===wn?(this.sn(wn),this.sn(0)):this.sn(e)}Jt(t){const e=255&t;e===0?(this.an(0),this.an(255)):e===wn?(this.an(wn),this.an(0)):this.an(t)}zt(){this.sn(0),this.sn(1)}Ht(){this.an(0),this.an(1)}sn(t){this.tn(1),this.buffer[this.position++]=t}an(t){this.tn(1),this.buffer[this.position++]=~t}tn(t){const e=t+this.position;if(e<=this.buffer.length)return;let n=2*this.buffer.length;n<e&&(n=e);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class sy{constructor(t){this.cn=t}Bt(t){this.cn.Wt(t)}xt(t){this.cn.Yt(t)}Mt(t){this.cn.Xt(t)}vt(){this.cn.rn()}}class iy{constructor(t){this.cn=t}Bt(t){this.cn.jt(t)}xt(t){this.cn.Zt(t)}Mt(t){this.cn.nn(t)}vt(){this.cn._n()}}class wr{constructor(){this.cn=new ry,this.ln=new sy(this.cn),this.hn=new iy(this.cn)}seed(t){this.cn.seed(t)}Pn(t){return t===0?this.ln:this.hn}un(){return this.cn.un()}reset(){this.cn.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(t,e,n,s){this.Tn=t,this.In=e,this.En=n,this.dn=s}An(){const t=this.dn.length,e=t===0||this.dn[t-1]===255?t+1:t,n=new Uint8Array(e);return n.set(this.dn,0),e!==t?n.set([0],this.dn.length):++n[n.length-1],new Ze(this.Tn,this.In,this.En,n)}Rn(t,e,n){return{indexId:this.Tn,uid:t,arrayValue:Zs(this.En),directionalValue:Zs(this.dn),orderedDocumentKey:Zs(e),documentKey:n.path.toArray()}}Vn(t,e,n){const s=this.Rn(t,e,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function ge(r,t){let e=r.Tn-t.Tn;return e!==0?e:(e=vl(r.En,t.En),e!==0?e:(e=vl(r.dn,t.dn),e!==0?e:O.comparator(r.In,t.In)))}function vl(r,t){for(let e=0;e<r.length&&e<t.length;++e){const n=r[e]-t[e];if(n!==0)return n}return r.length-t.length}function Zs(r){return Th()?function(e){let n="";for(let s=0;s<e.length;s++)n+=String.fromCharCode(e[s]);return n}(r):r}function Rl(r){return typeof r!="string"?r:function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(r)}class bl{constructor(t){this.mn=new et((e,n)=>at.comparator(e.field,n.field)),this.collectionId=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment(),this.fn=t.orderBy,this.gn=[];for(const e of t.filters){const n=e;n.isInequality()?this.mn=this.mn.add(n):this.gn.push(n)}}get pn(){return this.mn.size>1}yn(t){if(L(t.collectionGroup===this.collectionId,49279),this.pn)return!1;const e=Bo(t);if(e!==void 0&&!this.wn(e))return!1;const n=Qe(t);let s=new Set,i=0,o=0;for(;i<n.length&&this.wn(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.mn.size>0){const u=this.mn.getIterator().getNext();if(!s.has(u.field.canonicalString())){const c=n[i];if(!this.Sn(u,c)||!this.bn(this.fn[o++],c))return!1}++i}for(;i<n.length;++i){const u=n[i];if(o>=this.fn.length||!this.bn(this.fn[o++],u))return!1}return!0}Dn(){if(this.pn)return null;let t=new et(at.comparator);const e=[];for(const n of this.gn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")e.push(new Gs(n.field,2));else{if(t.has(n.field))continue;t=t.add(n.field),e.push(new Gs(n.field,0))}for(const n of this.fn)n.field.isKeyField()||t.has(n.field)||(t=t.add(n.field),e.push(new Gs(n.field,n.dir==="asc"?0:1)));return new ii(ii.UNKNOWN_ID,this.collectionId,e,Gr.empty())}wn(t){for(const e of this.gn)if(this.Sn(e,t))return!0;return!1}Sn(t,e){if(t===void 0||!t.field.isEqual(e.fieldPath))return!1;const n=t.op==="array-contains"||t.op==="array-contains-any";return e.kind===2===n}bn(t,e){return!!t.field.isEqual(e.fieldPath)&&(e.kind===0&&t.dir==="asc"||e.kind===1&&t.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tf(r){var e,n;if(L(r instanceof Q||r instanceof tt,20012),r instanceof Q){if(r instanceof Td){const s=((n=(e=r.value.arrayValue)==null?void 0:e.values)==null?void 0:n.map(i=>Q.create(r.field,"==",i)))||[];return tt.create(s,"or")}return r}const t=r.filters.map(s=>tf(s));return tt.create(t,r.op)}function oy(r){if(r.getFilters().length===0)return[];const t=na(tf(r));return L(ef(t),7391),ta(t)||ea(t)?[t]:t.getFilters()}function ta(r){return r instanceof Q}function ea(r){return r instanceof tt&&ba(r)}function ef(r){return ta(r)||ea(r)||function(e){if(e instanceof tt&&Ko(e)){for(const n of e.getFilters())if(!ta(n)&&!ea(n))return!1;return!0}return!1}(r)}function na(r){if(L(r instanceof Q||r instanceof tt,34018),r instanceof Q)return r;if(r.filters.length===1)return na(r.filters[0]);const t=r.filters.map(n=>na(n));let e=tt.create(t,r.op);return e=mi(e),ef(e)?e:(L(e instanceof tt,64498),L(zn(e),40251),L(e.filters.length>1,57927),e.filters.reduce((n,s)=>Ma(n,s)))}function Ma(r,t){let e;return L(r instanceof Q||r instanceof tt,38388),L(t instanceof Q||t instanceof tt,25473),e=r instanceof Q?t instanceof Q?function(s,i){return tt.create([s,i],"and")}(r,t):Sl(r,t):t instanceof Q?Sl(t,r):function(s,i){if(L(s.filters.length>0&&i.filters.length>0,48005),zn(s)&&zn(i))return _d(s,i.getFilters());const o=Ko(s)?s:i,u=Ko(s)?i:s,c=o.filters.map(h=>Ma(h,u));return tt.create(c,"or")}(r,t),mi(e)}function Sl(r,t){if(zn(t))return _d(t,r.getFilters());{const e=t.filters.map(n=>Ma(r,n));return tt.create(e,"or")}}function mi(r){if(L(r instanceof Q||r instanceof tt,11850),r instanceof Q)return r;const t=r.getFilters();if(t.length===1)return mi(t[0]);if(pd(r))return r;const e=t.map(s=>mi(s)),n=[];return e.forEach(s=>{s instanceof Q?n.push(s):s instanceof tt&&(s.op===r.op?n.push(...s.filters):n.push(s))}),n.length===1?n[0]:tt.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ay{constructor(){this.Cn=new Fa}addToCollectionParentIndex(t,e){return this.Cn.add(e),A.resolve()}getCollectionParents(t,e){return A.resolve(this.Cn.getEntries(e))}addFieldIndex(t,e){return A.resolve()}deleteFieldIndex(t,e){return A.resolve()}deleteAllFieldIndexes(t){return A.resolve()}createTargetIndexes(t,e){return A.resolve()}getDocumentsMatchingTarget(t,e){return A.resolve(null)}getIndexType(t,e){return A.resolve(0)}getFieldIndexes(t,e){return A.resolve([])}getNextCollectionGroupToUpdate(t){return A.resolve(null)}getMinOffset(t,e){return A.resolve(zt.min())}getMinOffsetFromCollectionGroup(t,e){return A.resolve(zt.min())}updateCollectionGroup(t,e,n){return A.resolve()}updateIndexEntries(t,e){return A.resolve()}}class Fa{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e]||new et(Y.comparator),i=!s.has(n);return this.index[e]=s.add(n),i}has(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e];return s&&s.has(n)}getEntries(t){return(this.index[t]||new et(Y.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pl="IndexedDbIndexManager",Ls=new Uint8Array(0);class uy{constructor(t,e){this.databaseId=e,this.vn=new Fa,this.Fn=new ue(n=>un(n),(n,s)=>ls(n,s)),this.uid=t.uid||""}addToCollectionParentIndex(t,e){if(!this.vn.has(e)){const n=e.lastSegment(),s=e.popLast();t.addOnCommittedListener(()=>{this.vn.add(e)});const i={collectionId:n,parent:Ct(s)};return Vl(t).put(i)}return A.resolve()}getCollectionParents(t,e){const n=[],s=IDBKeyRange.bound([e,""],[Bh(e),""],!1,!0);return Vl(t).J(s).next(i=>{for(const o of i){if(o.collectionId!==e)break;n.push(Jt(o.parent))}return n})}addFieldIndex(t,e){const n=Ar(t),s=function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map(c=>[c.fieldPath.canonicalString(),c.kind])}}(e);delete s.indexId;const i=n.add(s);if(e.indexState){const o=vn(t);return i.next(u=>{o.put(Tl(u,this.uid,e.indexState.sequenceNumber,e.indexState.offset))})}return i.next()}deleteFieldIndex(t,e){const n=Ar(t),s=vn(t),i=An(t);return n.delete(e.indexId).next(()=>s.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0)))}deleteAllFieldIndexes(t){const e=Ar(t),n=An(t),s=vn(t);return e.Z().next(()=>n.Z()).next(()=>s.Z())}createTargetIndexes(t,e){return A.forEach(this.Mn(e),n=>this.getIndexType(t,n).next(s=>{if(s===0||s===1){const i=new bl(n).Dn();if(i!=null)return this.addFieldIndex(t,i)}}))}getDocumentsMatchingTarget(t,e){const n=An(t);let s=!0;const i=new Map;return A.forEach(this.Mn(e),o=>this.xn(t,o).next(u=>{s&&(s=!!u),i.set(o,u)})).next(()=>{if(s){let o=H();const u=[];return A.forEach(i,(c,h)=>{C(Pl,`Using index ${function(B){return`id=${B.indexId}|cg=${B.collectionGroup}|f=${B.fields.map(z=>`${z.fieldPath}:${z.kind}`).join(",")}`}(c)} to execute ${un(e)}`);const f=function(B,z){const W=Bo(z);if(W===void 0)return null;for(const K of hi(B,W.fieldPath))switch(K.op){case"array-contains-any":return K.value.arrayValue.values||[];case"array-contains":return[K.value]}return null}(h,c),p=function(B,z){const W=new Map;for(const K of Qe(z))for(const T of hi(B,K.fieldPath))switch(T.op){case"==":case"in":W.set(K.fieldPath.canonicalString(),T.value);break;case"not-in":case"!=":return W.set(K.fieldPath.canonicalString(),T.value),Array.from(W.values())}return null}(h,c),g=function(B,z){const W=[];let K=!0;for(const T of Qe(z)){const _=T.kind===0?ol(B,T.fieldPath,B.startAt):al(B,T.fieldPath,B.startAt);W.push(_.value),K&&(K=_.inclusive)}return new jn(W,K)}(h,c),b=function(B,z){const W=[];let K=!0;for(const T of Qe(z)){const _=T.kind===0?al(B,T.fieldPath,B.endAt):ol(B,T.fieldPath,B.endAt);W.push(_.value),K&&(K=_.inclusive)}return new jn(W,K)}(h,c),D=this.On(c,h,g),x=this.On(c,h,b),V=this.Nn(c,h,p),j=this.Bn(c.indexId,f,D,g.inclusive,x,b.inclusive,V);return A.forEach(j,q=>n.Y(q,e.limit).next(B=>{B.forEach(z=>{const W=O.fromSegments(z.documentKey);o.has(W)||(o=o.add(W),u.push(W))})}))}).next(()=>u)}return A.resolve(null)})}Mn(t){let e=this.Fn.get(t);return e||(t.filters.length===0?e=[t]:e=oy(tt.create(t.filters,"and")).map(n=>Qo(t.path,t.collectionGroup,t.orderBy,n.getFilters(),t.limit,t.startAt,t.endAt)),this.Fn.set(t,e),e)}Bn(t,e,n,s,i,o,u){const c=(e!=null?e.length:1)*Math.max(n.length,i.length),h=c/(e!=null?e.length:1),f=[];for(let p=0;p<c;++p){const g=e?this.Ln(e[p/h]):Ls,b=this.kn(t,g,n[p%h],s),D=this.qn(t,g,i[p%h],o),x=u.map(V=>this.kn(t,g,V,!0));f.push(...this.createRange(b,D,x))}return f}kn(t,e,n,s){const i=new Ze(t,O.empty(),e,n);return s?i:i.An()}qn(t,e,n,s){const i=new Ze(t,O.empty(),e,n);return s?i.An():i}xn(t,e){const n=new bl(e),s=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment();return this.getFieldIndexes(t,s).next(i=>{let o=null;for(const u of i)n.yn(u)&&(!o||u.fields.length>o.fields.length)&&(o=u);return o})}getIndexType(t,e){let n=2;const s=this.Mn(e);return A.forEach(s,i=>this.xn(t,i).next(o=>{o?n!==0&&o.fields.length<function(c){let h=new et(at.comparator),f=!1;for(const p of c.filters)for(const g of p.getFlattenedFilters())g.field.isKeyField()||(g.op==="array-contains"||g.op==="array-contains-any"?f=!0:h=h.add(g.field));for(const p of c.orderBy)p.field.isKeyField()||(h=h.add(p.field));return h.size+(f?1:0)}(i)&&(n=1):n=0})).next(()=>function(o){return o.limit!==null}(e)&&s.length>1&&n===2?1:n)}Qn(t,e){const n=new wr;for(const s of Qe(t)){const i=e.data.field(s.fieldPath);if(i==null)return null;const o=n.Pn(s.kind);Ye.Kt.Dt(i,o)}return n.un()}Ln(t){const e=new wr;return Ye.Kt.Dt(t,e.Pn(0)),e.un()}$n(t,e){const n=new wr;return Ye.Kt.Dt(Zr(this.databaseId,e),n.Pn(function(i){const o=Qe(i);return o.length===0?0:o[o.length-1].kind}(t))),n.un()}Nn(t,e,n){if(n===null)return[];let s=[];s.push(new wr);let i=0;for(const o of Qe(t)){const u=n[i++];for(const c of s)if(this.Un(e,o.fieldPath)&&ts(u))s=this.Kn(s,o,u);else{const h=c.Pn(o.kind);Ye.Kt.Dt(u,h)}}return this.Wn(s)}On(t,e,n){return this.Nn(t,e,n.position)}Wn(t){const e=[];for(let n=0;n<t.length;++n)e[n]=t[n].un();return e}Kn(t,e,n){const s=[...t],i=[];for(const o of n.arrayValue.values||[])for(const u of s){const c=new wr;c.seed(u.un()),Ye.Kt.Dt(o,c.Pn(e.kind)),i.push(c)}return i}Un(t,e){return!!t.filters.find(n=>n instanceof Q&&n.field.isEqual(e)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(t,e){const n=Ar(t),s=vn(t);return(e?n.J(qo,IDBKeyRange.bound(e,e)):n.J()).next(i=>{const o=[];return A.forEach(i,u=>s.get([u.indexId,this.uid]).next(c=>{o.push(function(f,p){const g=p?new Gr(p.sequenceNumber,new zt(ln(p.readTime),new O(Jt(p.documentKey)),p.largestBatchId)):Gr.empty(),b=f.fields.map(([D,x])=>new Gs(at.fromServerFormat(D),x));return new ii(f.indexId,f.collectionGroup,b,g)}(u,c))})).next(()=>o)})}getNextCollectionGroupToUpdate(t){return this.getFieldIndexes(t).next(e=>e.length===0?null:(e.sort((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:$(n.collectionGroup,s.collectionGroup)}),e[0].collectionGroup))}updateCollectionGroup(t,e,n){const s=Ar(t),i=vn(t);return this.Gn(t).next(o=>s.J(qo,IDBKeyRange.bound(e,e)).next(u=>A.forEach(u,c=>i.put(Tl(c.indexId,this.uid,o,n)))))}updateIndexEntries(t,e){const n=new Map;return A.forEach(e,(s,i)=>{const o=n.get(s.collectionGroup);return(o?A.resolve(o):this.getFieldIndexes(t,s.collectionGroup)).next(u=>(n.set(s.collectionGroup,u),A.forEach(u,c=>this.zn(t,s,c).next(h=>{const f=this.jn(i,c);return h.isEqual(f)?A.resolve():this.Jn(t,i,c,h,f)}))))})}Hn(t,e,n,s){return An(t).put(s.Rn(this.uid,this.$n(n,e.key),e.key))}Yn(t,e,n,s){return An(t).delete(s.Vn(this.uid,this.$n(n,e.key),e.key))}zn(t,e,n){const s=An(t);let i=new et(ge);return s.ee({index:Yh,range:IDBKeyRange.only([n.indexId,this.uid,Zs(this.$n(n,e))])},(o,u)=>{i=i.add(new Ze(n.indexId,e,Rl(u.arrayValue),Rl(u.directionalValue)))}).next(()=>i)}jn(t,e){let n=new et(ge);const s=this.Qn(e,t);if(s==null)return n;const i=Bo(e);if(i!=null){const o=t.data.field(i.fieldPath);if(ts(o))for(const u of o.arrayValue.values||[])n=n.add(new Ze(e.indexId,t.key,this.Ln(u),s))}else n=n.add(new Ze(e.indexId,t.key,Ls,s));return n}Jn(t,e,n,s,i){C(Pl,"Updating index entries for document '%s'",e.key);const o=[];return function(c,h,f,p,g){const b=c.getIterator(),D=h.getIterator();let x=En(b),V=En(D);for(;x||V;){let j=!1,q=!1;if(x&&V){const B=f(x,V);B<0?q=!0:B>0&&(j=!0)}else x!=null?q=!0:j=!0;j?(p(V),V=En(D)):q?(g(x),x=En(b)):(x=En(b),V=En(D))}}(s,i,ge,u=>{o.push(this.Hn(t,e,n,u))},u=>{o.push(this.Yn(t,e,n,u))}),A.waitFor(o)}Gn(t){let e=1;return vn(t).ee({index:Jh,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,s,i)=>{i.done(),e=s.sequenceNumber+1}).next(()=>e)}createRange(t,e,n){n=n.sort((o,u)=>ge(o,u)).filter((o,u,c)=>!u||ge(o,c[u-1])!==0);const s=[];s.push(t);for(const o of n){const u=ge(o,t),c=ge(o,e);if(u===0)s[0]=t.An();else if(u>0&&c<0)s.push(o),s.push(o.An());else if(c>0)break}s.push(e);const i=[];for(let o=0;o<s.length;o+=2){if(this.Zn(s[o],s[o+1]))return[];const u=s[o].Vn(this.uid,Ls,O.empty()),c=s[o+1].Vn(this.uid,Ls,O.empty());i.push(IDBKeyRange.bound(u,c))}return i}Zn(t,e){return ge(t,e)>0}getMinOffsetFromCollectionGroup(t,e){return this.getFieldIndexes(t,e).next(Cl)}getMinOffset(t,e){return A.mapArray(this.Mn(e),n=>this.xn(t,n).next(s=>s||M(44426))).next(Cl)}}function Vl(r){return yt(r,Wr)}function An(r){return yt(r,Or)}function Ar(r){return yt(r,Ta)}function vn(r){return yt(r,kr)}function Cl(r){L(r.length!==0,28825);let t=r[0].indexState.offset,e=t.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;_a(s,t)<0&&(t=s),e<s.largestBatchId&&(e=s.largestBatchId)}return new zt(t.readTime,t.documentKey,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},nf=41943040;class Pt{static withCacheSize(t){return new Pt(t,Pt.DEFAULT_COLLECTION_PERCENTILE,Pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,n){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rf(r,t,e){const n=r.store(Gt),s=r.store(Mn),i=[],o=IDBKeyRange.only(e.batchId);let u=0;const c=n.ee({range:o},(f,p,g)=>(u++,g.delete()));i.push(c.next(()=>{L(u===1,47070,{batchId:e.batchId})}));const h=[];for(const f of e.mutations){const p=Qh(t,f.key.path,e.batchId);i.push(s.delete(p)),h.push(f.key)}return A.waitFor(i).next(()=>h)}function pi(r){if(!r)return 0;let t;if(r.document)t=r.document;else if(r.unknownDocument)t=r.unknownDocument;else{if(!r.noDocument)throw M(14731);t=r.noDocument}return JSON.stringify(t).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Pt.DEFAULT_COLLECTION_PERCENTILE=10,Pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Pt.DEFAULT=new Pt(nf,Pt.DEFAULT_COLLECTION_PERCENTILE,Pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Pt.DISABLED=new Pt(-1,0,0);class Oi{constructor(t,e,n,s){this.userId=t,this.serializer=e,this.indexManager=n,this.referenceDelegate=s,this.Xn={}}static wt(t,e,n,s){L(t.uid!=="",64387);const i=t.isAuthenticated()?t.uid:"";return new Oi(i,e,n,s)}checkEmpty(t){let e=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return _e(t).ee({index:tn,range:n},(s,i,o)=>{e=!1,o.done()}).next(()=>e)}addMutationBatch(t,e,n,s){const i=Vn(t),o=_e(t);return o.add({}).next(u=>{L(typeof u=="number",49019);const c=new Ca(u,e,n,s),h=function(b,D,x){const V=x.baseMutations.map(q=>ss(b.yt,q)),j=x.mutations.map(q=>ss(b.yt,q));return{userId:D,batchId:x.batchId,localWriteTimeMs:x.localWriteTime.toMillis(),baseMutations:V,mutations:j}}(this.serializer,this.userId,c),f=[];let p=new et((g,b)=>$(g.canonicalString(),b.canonicalString()));for(const g of s){const b=Qh(this.userId,g.key.path,u);p=p.add(g.key.path.popLast()),f.push(o.put(h)),f.push(i.put(b,Mg))}return p.forEach(g=>{f.push(this.indexManager.addToCollectionParentIndex(t,g))}),t.addOnCommittedListener(()=>{this.Xn[u]=c.keys()}),A.waitFor(f).next(()=>c)})}lookupMutationBatch(t,e){return _e(t).get(e).next(n=>n?(L(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:e}),Je(this.serializer,n)):null)}er(t,e){return this.Xn[e]?A.resolve(this.Xn[e]):this.lookupMutationBatch(t,e).next(n=>{if(n){const s=n.keys();return this.Xn[e]=s,s}return null})}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return _e(t).ee({index:tn,range:s},(o,u,c)=>{u.userId===this.userId&&(L(u.batchId>=n,47524,{tr:n}),i=Je(this.serializer,u)),c.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(t){const e=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=en;return _e(t).ee({index:tn,range:e,reverse:!0},(s,i,o)=>{n=i.batchId,o.done()}).next(()=>n)}getAllMutationBatches(t){const e=IDBKeyRange.bound([this.userId,en],[this.userId,Number.POSITIVE_INFINITY]);return _e(t).J(tn,e).next(n=>n.map(s=>Je(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(t,e){const n=Ks(this.userId,e.path),s=IDBKeyRange.lowerBound(n),i=[];return Vn(t).ee({range:s},(o,u,c)=>{const[h,f,p]=o,g=Jt(f);if(h===this.userId&&e.path.isEqual(g))return _e(t).get(p).next(b=>{if(!b)throw M(61480,{nr:o,batchId:p});L(b.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:b.userId,batchId:p}),i.push(Je(this.serializer,b))});c.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new et($);const s=[];return e.forEach(i=>{const o=Ks(this.userId,i.path),u=IDBKeyRange.lowerBound(o),c=Vn(t).ee({range:u},(h,f,p)=>{const[g,b,D]=h,x=Jt(b);g===this.userId&&i.path.isEqual(x)?n=n.add(D):p.done()});s.push(c)}),A.waitFor(s).next(()=>this.rr(t,n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1,i=Ks(this.userId,n),o=IDBKeyRange.lowerBound(i);let u=new et($);return Vn(t).ee({range:o},(c,h,f)=>{const[p,g,b]=c,D=Jt(g);p===this.userId&&n.isPrefixOf(D)?D.length===s&&(u=u.add(b)):f.done()}).next(()=>this.rr(t,u))}rr(t,e){const n=[],s=[];return e.forEach(i=>{s.push(_e(t).get(i).next(o=>{if(o===null)throw M(35274,{batchId:i});L(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),n.push(Je(this.serializer,o))}))}),A.waitFor(s).next(()=>n)}removeMutationBatch(t,e){return rf(t.le,this.userId,e).next(n=>(t.addOnCommittedListener(()=>{this.ir(e.batchId)}),A.forEach(n,s=>this.referenceDelegate.markPotentiallyOrphaned(t,s))))}ir(t){delete this.Xn[t]}performConsistencyCheck(t){return this.checkEmpty(t).next(e=>{if(!e)return A.resolve();const n=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),s=[];return Vn(t).ee({range:n},(i,o,u)=>{if(i[0]===this.userId){const c=Jt(i[1]);s.push(c)}else u.done()}).next(()=>{L(s.length===0,56720,{sr:s.map(i=>i.canonicalString())})})})}containsKey(t,e){return sf(t,this.userId,e)}_r(t){return of(t).get(this.userId).next(e=>e||{userId:this.userId,lastAcknowledgedBatchId:en,lastStreamToken:""})}}function sf(r,t,e){const n=Ks(t,e.path),s=n[1],i=IDBKeyRange.lowerBound(n);let o=!1;return Vn(r).ee({range:i,X:!0},(u,c,h)=>{const[f,p,g]=u;f===t&&p===s&&(o=!0),h.done()}).next(()=>o)}function _e(r){return yt(r,Gt)}function Vn(r){return yt(r,Mn)}function of(r){return yt(r,Hr)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hn{constructor(t){this.ar=t}next(){return this.ar+=2,this.ar}static ur(){return new hn(0)}static cr(){return new hn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cy{constructor(t,e){this.referenceDelegate=t,this.serializer=e}allocateTargetId(t){return this.lr(t).next(e=>{const n=new hn(e.highestTargetId);return e.highestTargetId=n.next(),this.hr(t,e).next(()=>e.highestTargetId)})}getLastRemoteSnapshotVersion(t){return this.lr(t).next(e=>U.fromTimestamp(new Z(e.lastRemoteSnapshotVersion.seconds,e.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(t){return this.lr(t).next(e=>e.highestListenSequenceNumber)}setTargetsMetadata(t,e,n){return this.lr(t).next(s=>(s.highestListenSequenceNumber=e,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),e>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=e),this.hr(t,s)))}addTargetData(t,e){return this.Pr(t,e).next(()=>this.lr(t).next(n=>(n.targetCount+=1,this.Tr(e,n),this.hr(t,n))))}updateTargetData(t,e){return this.Pr(t,e)}removeTargetData(t,e){return this.removeMatchingKeysForTargetId(t,e.targetId).next(()=>Rn(t).delete(e.targetId)).next(()=>this.lr(t)).next(n=>(L(n.targetCount>0,8065),n.targetCount-=1,this.hr(t,n)))}removeTargets(t,e,n){let s=0;const i=[];return Rn(t).ee((o,u)=>{const c=Cr(u);c.sequenceNumber<=e&&n.get(c.targetId)===null&&(s++,i.push(this.removeTargetData(t,c)))}).next(()=>A.waitFor(i)).next(()=>s)}forEachTarget(t,e){return Rn(t).ee((n,s)=>{const i=Cr(s);e(i)})}lr(t){return xl(t).get(ui).next(e=>(L(e!==null,2888),e))}hr(t,e){return xl(t).put(ui,e)}Pr(t,e){return Rn(t).put(Yd(this.serializer,e))}Tr(t,e){let n=!1;return t.targetId>e.highestTargetId&&(e.highestTargetId=t.targetId,n=!0),t.sequenceNumber>e.highestListenSequenceNumber&&(e.highestListenSequenceNumber=t.sequenceNumber,n=!0),n}getTargetCount(t){return this.lr(t).next(e=>e.targetCount)}getTargetData(t,e){const n=un(e),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return Rn(t).ee({range:s,index:Xh},(o,u,c)=>{const h=Cr(u);ls(e,h.target)&&(i=h,c.done())}).next(()=>i)}addMatchingKeys(t,e,n){const s=[],i=Te(t);return e.forEach(o=>{const u=Ct(o.path);s.push(i.put({targetId:n,path:u})),s.push(this.referenceDelegate.addReference(t,n,o))}),A.waitFor(s)}removeMatchingKeys(t,e,n){const s=Te(t);return A.forEach(e,i=>{const o=Ct(i.path);return A.waitFor([s.delete([n,o]),this.referenceDelegate.removeReference(t,n,i)])})}removeMatchingKeysForTargetId(t,e){const n=Te(t),s=IDBKeyRange.bound([e],[e+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(t,e){const n=IDBKeyRange.bound([e],[e+1],!1,!0),s=Te(t);let i=H();return s.ee({range:n,X:!0},(o,u,c)=>{const h=Jt(o[1]),f=new O(h);i=i.add(f)}).next(()=>i)}containsKey(t,e){const n=Ct(e.path),s=IDBKeyRange.bound([n],[Bh(n)],!1,!0);let i=0;return Te(t).ee({index:Ia,X:!0,range:s},([o,u],c,h)=>{o!==0&&(i++,h.done())}).next(()=>i>0)}At(t,e){return Rn(t).get(e).next(n=>n?Cr(n):null)}}function Rn(r){return yt(r,Fn)}function xl(r){return yt(r,nn)}function Te(r){return yt(r,Ln)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nl="LruGarbageCollector",af=1048576;function kl([r,t],[e,n]){const s=$(r,e);return s===0?$(t,n):s}class ly{constructor(t){this.Ir=t,this.buffer=new et(kl),this.Er=0}dr(){return++this.Er}Ar(t){const e=[t,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(e);else{const n=this.buffer.last();kl(e,n)<0&&(this.buffer=this.buffer.delete(n).add(e))}}get maxValue(){return this.buffer.last()[0]}}class uf{constructor(t,e,n){this.garbageCollector=t,this.asyncQueue=e,this.localStore=n,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(t){C(Nl,`Garbage collection scheduled in ${t}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){Me(e)?C(Nl,"Ignoring IndexedDB error during garbage collection: ",e):await Oe(e)}await this.Vr(3e5)})}}class hy{constructor(t,e){this.mr=t,this.params=e}calculateTargetCount(t,e){return this.mr.gr(t).next(n=>Math.floor(e/100*n))}nthSequenceNumber(t,e){if(e===0)return A.resolve(Ot.ce);const n=new ly(e);return this.mr.forEachTarget(t,s=>n.Ar(s.sequenceNumber)).next(()=>this.mr.pr(t,s=>n.Ar(s))).next(()=>n.maxValue)}removeTargets(t,e,n){return this.mr.removeTargets(t,e,n)}removeOrphanedDocuments(t,e){return this.mr.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(C("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(Dl)):this.getCacheSize(t).next(n=>n<this.params.cacheSizeCollectionThreshold?(C("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Dl):this.yr(t,e))}getCacheSize(t){return this.mr.getCacheSize(t)}yr(t,e){let n,s,i,o,u,c,h;const f=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(C("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(t,s))).next(p=>(n=p,u=Date.now(),this.removeTargets(t,n,e))).next(p=>(i=p,c=Date.now(),this.removeOrphanedDocuments(t,n))).next(p=>(h=Date.now(),bn()<=J.DEBUG&&C("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(u-o)+`ms
	Removed ${i} targets in `+(c-u)+`ms
	Removed ${p} documents in `+(h-c)+`ms
Total Duration: ${h-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p})))}}function cf(r,t){return new hy(r,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dy{constructor(t,e){this.db=t,this.garbageCollector=cf(this,e)}gr(t){const e=this.wr(t);return this.db.getTargetCache().getTargetCount(t).next(n=>e.next(s=>n+s))}wr(t){let e=0;return this.pr(t,n=>{e++}).next(()=>e)}forEachTarget(t,e){return this.db.getTargetCache().forEachTarget(t,e)}pr(t,e){return this.Sr(t,(n,s)=>e(s))}addReference(t,e,n){return Bs(t,n)}removeReference(t,e,n){return Bs(t,n)}removeTargets(t,e,n){return this.db.getTargetCache().removeTargets(t,e,n)}markPotentiallyOrphaned(t,e){return Bs(t,e)}br(t,e){return function(s,i){let o=!1;return of(s).te(u=>sf(s,u,i).next(c=>(c&&(o=!0),A.resolve(!c)))).next(()=>o)}(t,e)}removeOrphanedDocuments(t,e){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Sr(t,(o,u)=>{if(u<=e){const c=this.br(t,o).next(h=>{if(!h)return i++,n.getEntry(t,o).next(()=>(n.removeEntry(o,U.min()),Te(t).delete(function(p){return[0,Ct(p.path)]}(o))))});s.push(c)}}).next(()=>A.waitFor(s)).next(()=>n.apply(t)).next(()=>i)}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(t,n)}updateLimboDocument(t,e){return Bs(t,e)}Sr(t,e){const n=Te(t);let s,i=Ot.ce;return n.ee({index:Ia},([o,u],{path:c,sequenceNumber:h})=>{o===0?(i!==Ot.ce&&e(new O(Jt(s)),i),i=h,s=c):i=Ot.ce}).next(()=>{i!==Ot.ce&&e(new O(Jt(s)),i)})}getCacheSize(t){return this.db.getRemoteDocumentCache().getSize(t)}}function Bs(r,t){return Te(r).put(function(n,s){return{targetId:0,path:Ct(n.path),sequenceNumber:s}}(t,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lf{constructor(){this.changes=new ue(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,ot.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return n!==void 0?A.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fy{constructor(t){this.serializer=t}setIndexManager(t){this.indexManager=t}addEntry(t,e,n){return Ke(t).put(n)}removeEntry(t,e,n){return Ke(t).delete(function(i,o){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],fi(o),u[u.length-1]]}(e,n))}updateMetadata(t,e){return this.getMetadata(t).next(n=>(n.byteSize+=e,this.Dr(t,n)))}getEntry(t,e){let n=ot.newInvalidDocument(e);return Ke(t).ee({index:Hs,range:IDBKeyRange.only(vr(e))},(s,i)=>{n=this.Cr(e,i)}).next(()=>n)}vr(t,e){let n={size:0,document:ot.newInvalidDocument(e)};return Ke(t).ee({index:Hs,range:IDBKeyRange.only(vr(e))},(s,i)=>{n={document:this.Cr(e,i),size:pi(i)}}).next(()=>n)}getEntries(t,e){let n=Ut();return this.Fr(t,e,(s,i)=>{const o=this.Cr(s,i);n=n.insert(s,o)}).next(()=>n)}Mr(t,e){let n=Ut(),s=new rt(O.comparator);return this.Fr(t,e,(i,o)=>{const u=this.Cr(i,o);n=n.insert(i,u),s=s.insert(i,pi(o))}).next(()=>({documents:n,Or:s}))}Fr(t,e,n){if(e.isEmpty())return A.resolve();let s=new et(Fl);e.forEach(c=>s=s.add(c));const i=IDBKeyRange.bound(vr(s.first()),vr(s.last())),o=s.getIterator();let u=o.getNext();return Ke(t).ee({index:Hs,range:i},(c,h,f)=>{const p=O.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;u&&Fl(u,p)<0;)n(u,null),u=o.getNext();u&&u.isEqual(p)&&(n(u,h),u=o.hasNext()?o.getNext():null),u?f.j(vr(u)):f.done()}).next(()=>{for(;u;)n(u,null),u=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(t,e,n,s,i){const o=e.path,u=[o.popLast().toArray(),o.lastSegment(),fi(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],c=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Ke(t).J(IDBKeyRange.bound(u,c,!0)).next(h=>{i==null||i.incrementDocumentReadCount(h.length);let f=Ut();for(const p of h){const g=this.Cr(O.fromSegments(p.prefixPath.concat(p.collectionGroup,p.documentId)),p);g.isFoundDocument()&&(fs(e,g)||s.has(g.key))&&(f=f.insert(g.key,g))}return f})}getAllFromCollectionGroup(t,e,n,s){let i=Ut();const o=Ml(e,n),u=Ml(e,zt.max());return Ke(t).ee({index:Wh,range:IDBKeyRange.bound(o,u,!0)},(c,h,f)=>{const p=this.Cr(O.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);i=i.insert(p.key,p),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(t){return new my(this,!!t&&t.trackRemovals)}getSize(t){return this.getMetadata(t).next(e=>e.byteSize)}getMetadata(t){return Ol(t).get(Uo).next(e=>(L(!!e,20021),e))}Dr(t,e){return Ol(t).put(Uo,e)}Cr(t,e){if(e){const n=Z_(this.serializer,e);if(!(n.isNoDocument()&&n.version.isEqual(U.min())))return n}return ot.newInvalidDocument(t)}}function hf(r){return new fy(r)}class my extends lf{constructor(t,e){super(),this.Nr=t,this.trackRemovals=e,this.Br=new ue(n=>n.toString(),(n,s)=>n.isEqual(s))}applyChanges(t){const e=[];let n=0,s=new et((i,o)=>$(i.canonicalString(),o.canonicalString()));return this.changes.forEach((i,o)=>{const u=this.Br.get(i);if(e.push(this.Nr.removeEntry(t,i,u.readTime)),o.isValidDocument()){const c=yl(this.Nr.serializer,o);s=s.add(i.path.popLast());const h=pi(c);n+=h-u.size,e.push(this.Nr.addEntry(t,i,c))}else if(n-=u.size,this.trackRemovals){const c=yl(this.Nr.serializer,o.convertToNoDocument(U.min()));e.push(this.Nr.addEntry(t,i,c))}}),s.forEach(i=>{e.push(this.Nr.indexManager.addToCollectionParentIndex(t,i))}),e.push(this.Nr.updateMetadata(t,n)),A.waitFor(e)}getFromCache(t,e){return this.Nr.vr(t,e).next(n=>(this.Br.set(e,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(t,e){return this.Nr.Mr(t,e).next(({documents:n,Or:s})=>(s.forEach((i,o)=>{this.Br.set(i,{size:o,readTime:n.get(i).readTime})}),n))}}function Ol(r){return yt(r,Qr)}function Ke(r){return yt(r,ai)}function vr(r){const t=r.path.toArray();return[t.slice(0,t.length-2),t[t.length-2],t[t.length-1]]}function Ml(r,t){const e=t.documentKey.path.toArray();return[r,fi(t.readTime),e.slice(0,e.length-2),e.length>0?e[e.length-1]:""]}function Fl(r,t){const e=r.path.toArray(),n=t.path.toArray();let s=0;for(let i=0;i<e.length-2&&i<n.length-2;++i)if(s=$(e[i],n[i]),s)return s;return s=$(e.length,n.length),s||(s=$(e[e.length-2],n[n.length-2]),s||$(e[e.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class py{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class df{constructor(t,e,n,s){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=s}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(s=>(n=s,this.remoteDocumentCache.getEntry(t,e))).next(s=>(n!==null&&Br(n.mutation,s,Mt.empty(),Z.now()),s))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.getLocalViewOfDocuments(t,n,H()).next(()=>n))}getLocalViewOfDocuments(t,e,n=H()){const s=Yt();return this.populateOverlays(t,s,e).next(()=>this.computeViews(t,e,s,n).next(i=>{let o=Pr();return i.forEach((u,c)=>{o=o.insert(u,c.overlayedDocument)}),o}))}getOverlayedDocuments(t,e){const n=Yt();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,H()))}populateOverlays(t,e,n){const s=[];return n.forEach(i=>{e.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(t,s).next(i=>{i.forEach((o,u)=>{e.set(o,u)})})}computeViews(t,e,n,s){let i=Ut();const o=Lr(),u=function(){return Lr()}();return e.forEach((c,h)=>{const f=n.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof ce)?i=i.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Br(f.mutation,h,f.mutation.getFieldMask(),Z.now())):o.set(h.key,Mt.empty())}),this.recalculateAndSaveOverlays(t,i).next(c=>(c.forEach((h,f)=>o.set(h,f)),e.forEach((h,f)=>u.set(h,new py(f,o.get(h)??null))),u))}recalculateAndSaveOverlays(t,e){const n=Lr();let s=new rt((o,u)=>o-u),i=H();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(o=>{for(const u of o)u.keys().forEach(c=>{const h=e.get(c);if(h===null)return;let f=n.get(c)||Mt.empty();f=u.applyToLocalView(h,f),n.set(c,f);const p=(s.get(u.batchId)||H()).add(c);s=s.insert(u.batchId,p)})}).next(()=>{const o=[],u=s.getReverseIterator();for(;u.hasNext();){const c=u.getNext(),h=c.key,f=c.value,p=Vd();f.forEach(g=>{if(!i.has(g)){const b=Od(e.get(g),n.get(g));b!==null&&p.set(g,b),i=i.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(t,h,p))}return A.waitFor(o)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.recalculateAndSaveOverlays(t,n))}getDocumentsMatchingQuery(t,e,n,s){return function(o){return O.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):wd(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,s):this.getDocumentsMatchingCollectionQuery(t,e,n,s)}getNextDocuments(t,e,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,s-i.size):A.resolve(Yt());let u=On,c=i;return o.next(h=>A.forEach(h,(f,p)=>(u<p.largestBatchId&&(u=p.largestBatchId),i.get(f)?A.resolve():this.remoteDocumentCache.getEntry(t,f).next(g=>{c=c.insert(f,g)}))).next(()=>this.populateOverlays(t,h,i)).next(()=>this.computeViews(t,c,h,H())).next(f=>({batchId:u,changes:Pd(f)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new O(e)).next(n=>{let s=Pr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s})}getDocumentsMatchingCollectionGroupQuery(t,e,n,s){const i=e.collectionGroup;let o=Pr();return this.indexManager.getCollectionParents(t,i).next(u=>A.forEach(u,c=>{const h=function(p,g){return new hs(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(e,c.child(i));return this.getDocumentsMatchingCollectionQuery(t,h,n,s).next(f=>{f.forEach((p,g)=>{o=o.insert(p,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(t,e,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,i,s))).next(o=>{i.forEach((c,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,ot.newInvalidDocument(f)))});let u=Pr();return o.forEach((c,h)=>{const f=i.get(c);f!==void 0&&Br(f.mutation,h,Mt.empty(),Z.now()),fs(e,h)&&(u=u.insert(c,h))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gy{constructor(t){this.serializer=t,this.Lr=new Map,this.kr=new Map}getBundleMetadata(t,e){return A.resolve(this.Lr.get(e))}saveBundleMetadata(t,e){return this.Lr.set(e.id,function(s){return{id:s.id,version:s.version,createTime:wt(s.createTime)}}(e)),A.resolve()}getNamedQuery(t,e){return A.resolve(this.kr.get(e))}saveNamedQuery(t,e){return this.kr.set(e.name,function(s){return{name:s.name,query:Zd(s.bundledQuery),readTime:wt(s.readTime)}}(e)),A.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _y{constructor(){this.overlays=new rt(O.comparator),this.qr=new Map}getOverlay(t,e){return A.resolve(this.overlays.get(e))}getOverlays(t,e){const n=Yt();return A.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((s,i)=>{this.St(t,e,i)}),A.resolve()}removeOverlaysForBatchId(t,e,n){const s=this.qr.get(n);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.qr.delete(n)),A.resolve()}getOverlaysForCollection(t,e,n){const s=Yt(),i=e.length+1,o=new O(e.child("")),u=this.overlays.getIteratorFrom(o);for(;u.hasNext();){const c=u.getNext().value,h=c.getKey();if(!e.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>n&&s.set(c.getKey(),c)}return A.resolve(s)}getOverlaysForCollectionGroup(t,e,n,s){let i=new rt((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===e&&h.largestBatchId>n){let f=i.get(h.largestBatchId);f===null&&(f=Yt(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const u=Yt(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((h,f)=>u.set(h,f)),!(u.size()>=s)););return A.resolve(u)}St(t,e,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.qr.get(s.largestBatchId).delete(n.key);this.qr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new xa(e,n));let i=this.qr.get(e);i===void 0&&(i=H(),this.qr.set(e,i)),this.qr.set(e,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yy{constructor(){this.sessionToken=mt.EMPTY_BYTE_STRING}getSessionToken(t){return A.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,A.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class La{constructor(){this.Qr=new et(Tt.$r),this.Ur=new et(Tt.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(t,e){const n=new Tt(t,e);this.Qr=this.Qr.add(n),this.Ur=this.Ur.add(n)}Wr(t,e){t.forEach(n=>this.addReference(n,e))}removeReference(t,e){this.Gr(new Tt(t,e))}zr(t,e){t.forEach(n=>this.removeReference(n,e))}jr(t){const e=new O(new Y([])),n=new Tt(e,t),s=new Tt(e,t+1),i=[];return this.Ur.forEachInRange([n,s],o=>{this.Gr(o),i.push(o.key)}),i}Jr(){this.Qr.forEach(t=>this.Gr(t))}Gr(t){this.Qr=this.Qr.delete(t),this.Ur=this.Ur.delete(t)}Hr(t){const e=new O(new Y([])),n=new Tt(e,t),s=new Tt(e,t+1);let i=H();return this.Ur.forEachInRange([n,s],o=>{i=i.add(o.key)}),i}containsKey(t){const e=new Tt(t,0),n=this.Qr.firstAfterOrEqual(e);return n!==null&&t.isEqual(n.key)}}class Tt{constructor(t,e){this.key=t,this.Yr=e}static $r(t,e){return O.comparator(t.key,e.key)||$(t.Yr,e.Yr)}static Kr(t,e){return $(t.Yr,e.Yr)||O.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iy{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.tr=1,this.Zr=new et(Tt.$r)}checkEmpty(t){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,n,s){const i=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Ca(i,e,n,s);this.mutationQueue.push(o);for(const u of s)this.Zr=this.Zr.add(new Tt(u.key,i)),this.indexManager.addToCollectionParentIndex(t,u.key.path.popLast());return A.resolve(o)}lookupMutationBatch(t,e){return A.resolve(this.Xr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=this.ei(n),i=s<0?0:s;return A.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?en:this.tr-1)}getAllMutationBatches(t){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new Tt(e,0),s=new Tt(e,Number.POSITIVE_INFINITY),i=[];return this.Zr.forEachInRange([n,s],o=>{const u=this.Xr(o.Yr);i.push(u)}),A.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new et($);return e.forEach(s=>{const i=new Tt(s,0),o=new Tt(s,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([i,o],u=>{n=n.add(u.Yr)})}),A.resolve(this.ti(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1;let i=n;O.isDocumentKey(i)||(i=i.child(""));const o=new Tt(new O(i),0);let u=new et($);return this.Zr.forEachWhile(c=>{const h=c.key.path;return!!n.isPrefixOf(h)&&(h.length===s&&(u=u.add(c.Yr)),!0)},o),A.resolve(this.ti(u))}ti(t){const e=[];return t.forEach(n=>{const s=this.Xr(n);s!==null&&e.push(s)}),e}removeMutationBatch(t,e){L(this.ni(e.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.Zr;return A.forEach(e.mutations,s=>{const i=new Tt(s.key,e.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(t,s.key)}).next(()=>{this.Zr=n})}ir(t){}containsKey(t,e){const n=new Tt(e,0),s=this.Zr.firstAfterOrEqual(n);return A.resolve(e.isEqual(s&&s.key))}performConsistencyCheck(t){return this.mutationQueue.length,A.resolve()}ni(t,e){return this.ei(t)}ei(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Xr(t){const e=this.ei(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ty{constructor(t){this.ri=t,this.docs=function(){return new rt(O.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,s=this.docs.get(n),i=s?s.size:0,o=this.ri(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return A.resolve(n?n.document.mutableCopy():ot.newInvalidDocument(e))}getEntries(t,e){let n=Ut();return e.forEach(s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():ot.newInvalidDocument(s))}),A.resolve(n)}getDocumentsMatchingQuery(t,e,n,s){let i=Ut();const o=e.path,u=new O(o.child("__id-9223372036854775808__")),c=this.docs.getIteratorFrom(u);for(;c.hasNext();){const{key:h,value:{document:f}}=c.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||_a(zh(f),n)<=0||(s.has(f.key)||fs(e,f))&&(i=i.insert(f.key,f.mutableCopy()))}return A.resolve(i)}getAllFromCollectionGroup(t,e,n,s){M(9500)}ii(t,e){return A.forEach(this.docs,n=>e(n))}newChangeBuffer(t){return new Ey(this)}getSize(t){return A.resolve(this.size)}}class Ey extends lf{constructor(t){super(),this.Nr=t}applyChanges(t){const e=[];return this.changes.forEach((n,s)=>{s.isValidDocument()?e.push(this.Nr.addEntry(t,s)):this.Nr.removeEntry(n)}),A.waitFor(e)}getFromCache(t,e){return this.Nr.getEntry(t,e)}getAllFromCache(t,e){return this.Nr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wy{constructor(t){this.persistence=t,this.si=new ue(e=>un(e),ls),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.oi=0,this._i=new La,this.targetCount=0,this.ai=hn.ur()}forEachTarget(t,e){return this.si.forEach((n,s)=>e(s)),A.resolve()}getLastRemoteSnapshotVersion(t){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return A.resolve(this.oi)}allocateTargetId(t){return this.highestTargetId=this.ai.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.oi&&(this.oi=e),A.resolve()}Pr(t){this.si.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.ai=new hn(e),this.highestTargetId=e),t.sequenceNumber>this.oi&&(this.oi=t.sequenceNumber)}addTargetData(t,e){return this.Pr(e),this.targetCount+=1,A.resolve()}updateTargetData(t,e){return this.Pr(e),A.resolve()}removeTargetData(t,e){return this.si.delete(e.target),this._i.jr(e.targetId),this.targetCount-=1,A.resolve()}removeTargets(t,e,n){let s=0;const i=[];return this.si.forEach((o,u)=>{u.sequenceNumber<=e&&n.get(u.targetId)===null&&(this.si.delete(o),i.push(this.removeMatchingKeysForTargetId(t,u.targetId)),s++)}),A.waitFor(i).next(()=>s)}getTargetCount(t){return A.resolve(this.targetCount)}getTargetData(t,e){const n=this.si.get(e)||null;return A.resolve(n)}addMatchingKeys(t,e,n){return this._i.Wr(e,n),A.resolve()}removeMatchingKeys(t,e,n){this._i.zr(e,n);const s=this.persistence.referenceDelegate,i=[];return s&&e.forEach(o=>{i.push(s.markPotentiallyOrphaned(t,o))}),A.waitFor(i)}removeMatchingKeysForTargetId(t,e){return this._i.jr(e),A.resolve()}getMatchingKeysForTargetId(t,e){const n=this._i.Hr(e);return A.resolve(n)}containsKey(t,e){return A.resolve(this._i.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ba{constructor(t,e){this.ui={},this.overlays={},this.ci=new Ot(0),this.li=!1,this.li=!0,this.hi=new yy,this.referenceDelegate=t(this),this.Pi=new wy(this),this.indexManager=new ay,this.remoteDocumentCache=function(s){return new Ty(s)}(n=>this.referenceDelegate.Ti(n)),this.serializer=new Jd(e),this.Ii=new gy(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new _y,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this.ui[t.toKey()];return n||(n=new Iy(e,this.referenceDelegate),this.ui[t.toKey()]=n),n}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(t,e,n){C("MemoryPersistence","Starting transaction:",t);const s=new Ay(this.ci.next());return this.referenceDelegate.Ei(),n(s).next(i=>this.referenceDelegate.di(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ai(t,e){return A.or(Object.values(this.ui).map(n=>()=>n.containsKey(t,e)))}}class Ay extends Gh{constructor(t){super(),this.currentSequenceNumber=t}}class Mi{constructor(t){this.persistence=t,this.Ri=new La,this.Vi=null}static mi(t){return new Mi(t)}get fi(){if(this.Vi)return this.Vi;throw M(60996)}addReference(t,e,n){return this.Ri.addReference(n,e),this.fi.delete(n.toString()),A.resolve()}removeReference(t,e,n){return this.Ri.removeReference(n,e),this.fi.add(n.toString()),A.resolve()}markPotentiallyOrphaned(t,e){return this.fi.add(e.toString()),A.resolve()}removeTarget(t,e){this.Ri.jr(e.targetId).forEach(s=>this.fi.add(s.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(s=>{s.forEach(i=>this.fi.add(i.toString()))}).next(()=>n.removeTargetData(t,e))}Ei(){this.Vi=new Set}di(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.fi,n=>{const s=O.fromPath(n);return this.gi(t,s).next(i=>{i||e.removeEntry(s,U.min())})}).next(()=>(this.Vi=null,e.apply(t)))}updateLimboDocument(t,e){return this.gi(t,e).next(n=>{n?this.fi.delete(e.toString()):this.fi.add(e.toString())})}Ti(t){return 0}gi(t,e){return A.or([()=>A.resolve(this.Ri.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ai(t,e)])}}class gi{constructor(t,e){this.persistence=t,this.pi=new ue(n=>Ct(n.path),(n,s)=>n.isEqual(s)),this.garbageCollector=cf(this,e)}static mi(t,e){return new gi(t,e)}Ei(){}di(t){return A.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}gr(t){const e=this.wr(t);return this.persistence.getTargetCache().getTargetCount(t).next(n=>e.next(s=>n+s))}wr(t){let e=0;return this.pr(t,n=>{e++}).next(()=>e)}pr(t,e){return A.forEach(this.pi,(n,s)=>this.br(t,n,s).next(i=>i?A.resolve():e(s)))}removeTargets(t,e,n){return this.persistence.getTargetCache().removeTargets(t,e,n)}removeOrphanedDocuments(t,e){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ii(t,o=>this.br(t,o,e).next(u=>{u||(n++,i.removeEntry(o,U.min()))})).next(()=>i.apply(t)).next(()=>n)}markPotentiallyOrphaned(t,e){return this.pi.set(e,t.currentSequenceNumber),A.resolve()}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,n)}addReference(t,e,n){return this.pi.set(n,t.currentSequenceNumber),A.resolve()}removeReference(t,e,n){return this.pi.set(n,t.currentSequenceNumber),A.resolve()}updateLimboDocument(t,e){return this.pi.set(e,t.currentSequenceNumber),A.resolve()}Ti(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=Ws(t.data.value)),e}br(t,e,n){return A.or([()=>this.persistence.Ai(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const s=this.pi.get(e);return A.resolve(s!==void 0&&s>n)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vy{constructor(t){this.serializer=t}k(t,e,n,s){const i=new Ri("createOrUpgrade",e);n<1&&s>=1&&(function(c){c.createObjectStore(cs)}(t),function(c){c.createObjectStore(Hr,{keyPath:Og}),c.createObjectStore(Gt,{keyPath:Qc,autoIncrement:!0}).createIndex(tn,Wc,{unique:!0}),c.createObjectStore(Mn)}(t),Ll(t),function(c){c.createObjectStore(We)}(t));let o=A.resolve();return n<3&&s>=3&&(n!==0&&(function(c){c.deleteObjectStore(Ln),c.deleteObjectStore(Fn),c.deleteObjectStore(nn)}(t),Ll(t)),o=o.next(()=>function(c){const h=c.store(nn),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:U.min().toTimestamp(),targetCount:0};return h.put(ui,f)}(i))),n<4&&s>=4&&(n!==0&&(o=o.next(()=>function(c,h){return h.store(Gt).J().next(p=>{c.deleteObjectStore(Gt),c.createObjectStore(Gt,{keyPath:Qc,autoIncrement:!0}).createIndex(tn,Wc,{unique:!0});const g=h.store(Gt),b=p.map(D=>g.put(D));return A.waitFor(b)})}(t,i))),o=o.next(()=>{(function(c){c.createObjectStore(Bn,{keyPath:$g})})(t)})),n<5&&s>=5&&(o=o.next(()=>this.yi(i))),n<6&&s>=6&&(o=o.next(()=>(function(c){c.createObjectStore(Qr)}(t),this.wi(i)))),n<7&&s>=7&&(o=o.next(()=>this.Si(i))),n<8&&s>=8&&(o=o.next(()=>this.bi(t,i))),n<9&&s>=9&&(o=o.next(()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(t)})),n<10&&s>=10&&(o=o.next(()=>this.Di(i))),n<11&&s>=11&&(o=o.next(()=>{(function(c){c.createObjectStore(bi,{keyPath:Gg})})(t),function(c){c.createObjectStore(Si,{keyPath:Kg})}(t)})),n<12&&s>=12&&(o=o.next(()=>{(function(c){const h=c.createObjectStore(Pi,{keyPath:Zg});h.createIndex(jo,t_,{unique:!1}),h.createIndex(Zh,e_,{unique:!1})})(t)})),n<13&&s>=13&&(o=o.next(()=>function(c){const h=c.createObjectStore(ai,{keyPath:Fg});h.createIndex(Hs,Lg),h.createIndex(Wh,Bg)}(t)).next(()=>this.Ci(t,i)).next(()=>t.deleteObjectStore(We))),n<14&&s>=14&&(o=o.next(()=>this.Fi(t,i))),n<15&&s>=15&&(o=o.next(()=>function(c){c.createObjectStore(Ta,{keyPath:Hg,autoIncrement:!0}).createIndex(qo,Qg,{unique:!1}),c.createObjectStore(kr,{keyPath:Wg}).createIndex(Jh,Xg,{unique:!1}),c.createObjectStore(Or,{keyPath:Jg}).createIndex(Yh,Yg,{unique:!1})}(t))),n<16&&s>=16&&(o=o.next(()=>{e.objectStore(kr).clear()}).next(()=>{e.objectStore(Or).clear()})),n<17&&s>=17&&(o=o.next(()=>{(function(c){c.createObjectStore(Ea,{keyPath:n_})})(t)})),n<18&&s>=18&&Th()&&(o=o.next(()=>{e.objectStore(kr).clear()}).next(()=>{e.objectStore(Or).clear()})),o}wi(t){let e=0;return t.store(We).ee((n,s)=>{e+=pi(s)}).next(()=>{const n={byteSize:e};return t.store(Qr).put(Uo,n)})}yi(t){const e=t.store(Hr),n=t.store(Gt);return e.J().next(s=>A.forEach(s,i=>{const o=IDBKeyRange.bound([i.userId,en],[i.userId,i.lastAcknowledgedBatchId]);return n.J(tn,o).next(u=>A.forEach(u,c=>{L(c.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:c.batchId});const h=Je(this.serializer,c);return rf(t,i.userId,h).next(()=>{})}))}))}Si(t){const e=t.store(Ln),n=t.store(We);return t.store(nn).get(ui).next(s=>{const i=[];return n.ee((o,u)=>{const c=new Y(o),h=function(p){return[0,Ct(p)]}(c);i.push(e.get(h).next(f=>f?A.resolve():(p=>e.put({targetId:0,path:Ct(p),sequenceNumber:s.highestListenSequenceNumber}))(c)))}).next(()=>A.waitFor(i))})}bi(t,e){t.createObjectStore(Wr,{keyPath:zg});const n=e.store(Wr),s=new Fa,i=o=>{if(s.add(o)){const u=o.lastSegment(),c=o.popLast();return n.put({collectionId:u,parent:Ct(c)})}};return e.store(We).ee({X:!0},(o,u)=>{const c=new Y(o);return i(c.popLast())}).next(()=>e.store(Mn).ee({X:!0},([o,u,c],h)=>{const f=Jt(u);return i(f.popLast())}))}Di(t){const e=t.store(Fn);return e.ee((n,s)=>{const i=Cr(s),o=Yd(this.serializer,i);return e.put(o)})}Ci(t,e){const n=e.store(We),s=[];return n.ee((i,o)=>{const u=e.store(ai),c=function(p){return p.document?new O(Y.fromString(p.document.name).popFirst(5)):p.noDocument?O.fromSegments(p.noDocument.path):p.unknownDocument?O.fromSegments(p.unknownDocument.path):M(36783)}(o).path.toArray(),h={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(u.put(h))}).next(()=>A.waitFor(s))}Fi(t,e){const n=e.store(Gt),s=hf(this.serializer),i=new Ba(Mi.mi,this.serializer.yt);return n.J().next(o=>{const u=new Map;return o.forEach(c=>{let h=u.get(c.userId)??H();Je(this.serializer,c).keys().forEach(f=>h=h.add(f)),u.set(c.userId,h)}),A.forEach(u,(c,h)=>{const f=new Et(h),p=ki.wt(this.serializer,f),g=i.getIndexManager(f),b=Oi.wt(f,this.serializer,g,i.referenceDelegate);return new df(s,b,p,g).recalculateAndSaveOverlaysForDocumentKeys(new zo(e,Ot.ce),c).next()})})}}function Ll(r){r.createObjectStore(Ln,{keyPath:qg}).createIndex(Ia,jg,{unique:!0}),r.createObjectStore(Fn,{keyPath:"targetId"}).createIndex(Xh,Ug,{unique:!0}),r.createObjectStore(nn)}const ye="IndexedDbPersistence",Ao=18e5,vo=5e3,Ro="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",Ry="main";class Ua{constructor(t,e,n,s,i,o,u,c,h,f,p=18){if(this.allowTabSynchronization=t,this.persistenceKey=e,this.clientId=n,this.Mi=i,this.window=o,this.document=u,this.xi=h,this.Oi=f,this.Ni=p,this.ci=null,this.li=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Bi=null,this.inForeground=!1,this.Li=null,this.ki=null,this.qi=Number.NEGATIVE_INFINITY,this.Qi=g=>Promise.resolve(),!Ua.v())throw new N(P.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new dy(this,s),this.$i=e+Ry,this.serializer=new Jd(c),this.Ui=new Pe(this.$i,this.Ni,new vy(this.serializer)),this.hi=new ey,this.Pi=new cy(this.referenceDelegate,this.serializer),this.remoteDocumentCache=hf(this.serializer),this.Ii=new ty,this.window&&this.window.localStorage?this.Ki=this.window.localStorage:(this.Ki=null,f===!1&&ft(ye,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Wi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new N(P.FAILED_PRECONDITION,Ro);return this.Gi(),this.zi(),this.ji(),this.runTransaction("getHighestListenSequenceNumber","readonly",t=>this.Pi.getHighestSequenceNumber(t))}).then(t=>{this.ci=new Ot(t,this.xi)}).then(()=>{this.li=!0}).catch(t=>(this.Ui&&this.Ui.close(),Promise.reject(t)))}Ji(t){return this.Qi=async e=>{if(this.started)return t(e)},t(this.isPrimary)}setDatabaseDeletedListener(t){this.Ui.$(async e=>{e.newVersion===null&&await t()})}setNetworkEnabled(t){this.networkEnabled!==t&&(this.networkEnabled=t,this.Mi.enqueueAndForget(async()=>{this.started&&await this.Wi()}))}Wi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",t=>Us(t).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Hi(t).next(e=>{e||(this.isPrimary=!1,this.Mi.enqueueRetryable(()=>this.Qi(!1)))})}).next(()=>this.Yi(t)).next(e=>this.isPrimary&&!e?this.Zi(t).next(()=>!1):!!e&&this.Xi(t).next(()=>!0))).catch(t=>{if(Me(t))return C(ye,"Failed to extend owner lease: ",t),this.isPrimary;if(!this.allowTabSynchronization)throw t;return C(ye,"Releasing owner lease after error during lease refresh",t),!1}).then(t=>{this.isPrimary!==t&&this.Mi.enqueueRetryable(()=>this.Qi(t)),this.isPrimary=t})}Hi(t){return Rr(t).get(Tn).next(e=>A.resolve(this.es(e)))}ts(t){return Us(t).delete(this.clientId)}async ns(){if(this.isPrimary&&!this.rs(this.qi,Ao)){this.qi=Date.now();const t=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",e=>{const n=yt(e,Bn);return n.J().next(s=>{const i=this.ss(s,Ao),o=s.filter(u=>i.indexOf(u)===-1);return A.forEach(o,u=>n.delete(u.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Ki)for(const e of t)this.Ki.removeItem(this._s(e.clientId))}}ji(){this.ki=this.Mi.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.Wi().then(()=>this.ns()).then(()=>this.ji()))}es(t){return!!t&&t.ownerId===this.clientId}Yi(t){return this.Oi?A.resolve(!0):Rr(t).get(Tn).next(e=>{if(e!==null&&this.rs(e.leaseTimestampMs,vo)&&!this.us(e.ownerId)){if(this.es(e)&&this.networkEnabled)return!0;if(!this.es(e)){if(!e.allowTabSynchronization)throw new N(P.FAILED_PRECONDITION,Ro);return!1}}return!(!this.networkEnabled||!this.inForeground)||Us(t).J().next(n=>this.ss(n,vo).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||o&&u)return!0}return!1})===void 0)}).next(e=>(this.isPrimary!==e&&C(ye,`Client ${e?"is":"is not"} eligible for a primary lease.`),e))}async shutdown(){this.li=!1,this.cs(),this.ki&&(this.ki.cancel(),this.ki=null),this.ls(),this.hs(),await this.Ui.runTransaction("shutdown","readwrite",[cs,Bn],t=>{const e=new zo(t,Ot.ce);return this.Zi(e).next(()=>this.ts(e))}),this.Ui.close(),this.Ps()}ss(t,e){return t.filter(n=>this.rs(n.updateTimeMs,e)&&!this.us(n.clientId))}Ts(){return this.runTransaction("getActiveClients","readonly",t=>Us(t).J().next(e=>this.ss(e,Ao).map(n=>n.clientId)))}get started(){return this.li}getGlobalsCache(){return this.hi}getMutationQueue(t,e){return Oi.wt(t,this.serializer,e,this.referenceDelegate)}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(t){return new uy(t,this.serializer.yt.databaseId)}getDocumentOverlayCache(t){return ki.wt(this.serializer,t)}getBundleCache(){return this.Ii}runTransaction(t,e,n){C(ye,"Starting transaction:",t);const s=e==="readonly"?"readonly":"readwrite",i=function(c){return c===18?i_:c===17?rd:c===16?s_:c===15?wa:c===14?nd:c===13?ed:c===12?r_:c===11?td:void M(60245)}(this.Ni);let o;return this.Ui.runTransaction(t,s,i,u=>(o=new zo(u,this.ci?this.ci.next():Ot.ce),e==="readwrite-primary"?this.Hi(o).next(c=>!!c||this.Yi(o)).next(c=>{if(!c)throw ft(`Failed to obtain primary lease for action '${t}'.`),this.isPrimary=!1,this.Mi.enqueueRetryable(()=>this.Qi(!1)),new N(P.FAILED_PRECONDITION,$h);return n(o)}).next(c=>this.Xi(o).next(()=>c)):this.Is(o).next(()=>n(o)))).then(u=>(o.raiseOnCommittedEvent(),u))}Is(t){return Rr(t).get(Tn).next(e=>{if(e!==null&&this.rs(e.leaseTimestampMs,vo)&&!this.us(e.ownerId)&&!this.es(e)&&!(this.Oi||this.allowTabSynchronization&&e.allowTabSynchronization))throw new N(P.FAILED_PRECONDITION,Ro)})}Xi(t){const e={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Rr(t).put(Tn,e)}static v(){return Pe.v()}Zi(t){const e=Rr(t);return e.get(Tn).next(n=>this.es(n)?(C(ye,"Releasing primary lease."),e.delete(Tn)):A.resolve())}rs(t,e){const n=Date.now();return!(t<n-e)&&(!(t>n)||(ft(`Detected an update time that is in the future: ${t} > ${n}`),!1))}Gi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Li=()=>{this.Mi.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.Wi()))},this.document.addEventListener("visibilitychange",this.Li),this.inForeground=this.document.visibilityState==="visible")}ls(){this.Li&&(this.document.removeEventListener("visibilitychange",this.Li),this.Li=null)}zi(){var t;typeof((t=this.window)==null?void 0:t.addEventListener)=="function"&&(this.Bi=()=>{this.cs();const e=/(?:Version|Mobile)\/1[456]/;Ih()&&(navigator.appVersion.match(e)||navigator.userAgent.match(e))&&this.Mi.enterRestrictedMode(!0),this.Mi.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Bi))}hs(){this.Bi&&(this.window.removeEventListener("pagehide",this.Bi),this.Bi=null)}us(t){var e;try{const n=((e=this.Ki)==null?void 0:e.getItem(this._s(t)))!==null;return C(ye,`Client '${t}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return ft(ye,"Failed to get zombied client id.",n),!1}}cs(){if(this.Ki)try{this.Ki.setItem(this._s(this.clientId),String(Date.now()))}catch(t){ft("Failed to set zombie client id.",t)}}Ps(){if(this.Ki)try{this.Ki.removeItem(this._s(this.clientId))}catch{}}_s(t){return`firestore_zombie_${this.persistenceKey}_${t}`}}function Rr(r){return yt(r,cs)}function Us(r){return yt(r,Bn)}function ff(r,t){let e=r.projectId;return r.isDefaultDatabase||(e+="."+r.database),"firestore/"+t+"/"+e+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qa{constructor(t,e,n,s){this.targetId=t,this.fromCache=e,this.Es=n,this.ds=s}static As(t,e){let n=H(),s=H();for(const i of e.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new qa(t,e.fromCache,n,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class by{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mf{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=function(){return Ih()?8:Kh(ri())>0?6:4}()}initialize(t,e){this.ps=t,this.indexManager=e,this.Rs=!0}getDocumentsMatchingQuery(t,e,n,s){const i={result:null};return this.ys(t,e).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ws(t,e,s,n).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new by;return this.Ss(t,e,o).next(u=>{if(i.result=u,this.Vs)return this.bs(t,e,o,u.size)})}).next(()=>i.result)}bs(t,e,n,s){return n.documentReadCount<this.fs?(bn()<=J.DEBUG&&C("QueryEngine","SDK will not create cache indexes for query:",Sn(e),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),A.resolve()):(bn()<=J.DEBUG&&C("QueryEngine","Query:",Sn(e),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.gs*s?(bn()<=J.DEBUG&&C("QueryEngine","The SDK decides to create cache indexes for query:",Sn(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,jt(e))):A.resolve())}ys(t,e){if(ul(e))return A.resolve(null);let n=jt(e);return this.indexManager.getIndexType(t,n).next(s=>s===0?null:(e.limit!==null&&s===1&&(e=di(e,null,"F"),n=jt(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(i=>{const o=H(...i);return this.ps.getDocuments(t,o).next(u=>this.indexManager.getMinOffset(t,n).next(c=>{const h=this.Ds(e,u);return this.Cs(e,h,o,c.readTime)?this.ys(t,di(e,null,"F")):this.vs(t,h,e,c)}))})))}ws(t,e,n,s){return ul(e)||s.isEqual(U.min())?A.resolve(null):this.ps.getDocuments(t,n).next(i=>{const o=this.Ds(e,i);return this.Cs(e,o,n,s)?A.resolve(null):(bn()<=J.DEBUG&&C("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Sn(e)),this.vs(t,o,e,jh(s,On)).next(u=>u))})}Ds(t,e){let n=new et(bd(t));return e.forEach((s,i)=>{fs(t,i)&&(n=n.add(i))}),n}Cs(t,e,n,s){if(t.limit===null)return!1;if(n.size!==e.size)return!0;const i=t.limitType==="F"?e.last():e.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Ss(t,e,n){return bn()<=J.DEBUG&&C("QueryEngine","Using full collection scan to execute query:",Sn(e)),this.ps.getDocumentsMatchingQuery(t,e,zt.min(),n)}vs(t,e,n,s){return this.ps.getDocumentsMatchingQuery(t,n,s).next(i=>(e.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ja="LocalStore",Sy=3e8;class Py{constructor(t,e,n,s){this.persistence=t,this.Fs=e,this.serializer=s,this.Ms=new rt($),this.xs=new ue(i=>un(i),ls),this.Os=new Map,this.Ns=t.getRemoteDocumentCache(),this.Pi=t.getTargetCache(),this.Ii=t.getBundleCache(),this.Bs(n)}Bs(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new df(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.Ms))}}function pf(r,t,e,n){return new Py(r,t,e,n)}async function gf(r,t){const e=F(r);return await e.persistence.runTransaction("Handle user change","readonly",n=>{let s;return e.mutationQueue.getAllMutationBatches(n).next(i=>(s=i,e.Bs(t),e.mutationQueue.getAllMutationBatches(n))).next(i=>{const o=[],u=[];let c=H();for(const h of s){o.push(h.batchId);for(const f of h.mutations)c=c.add(f.key)}for(const h of i){u.push(h.batchId);for(const f of h.mutations)c=c.add(f.key)}return e.localDocuments.getDocuments(n,c).next(h=>({Ls:h,removedBatchIds:o,addedBatchIds:u}))})})}function Vy(r,t){const e=F(r);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const s=t.batch.keys(),i=e.Ns.newChangeBuffer({trackRemovals:!0});return function(u,c,h,f){const p=h.batch,g=p.keys();let b=A.resolve();return g.forEach(D=>{b=b.next(()=>f.getEntry(c,D)).next(x=>{const V=h.docVersions.get(D);L(V!==null,48541),x.version.compareTo(V)<0&&(p.applyToRemoteDocument(x,h),x.isValidDocument()&&(x.setReadTime(h.commitVersion),f.addEntry(x)))})}),b.next(()=>u.mutationQueue.removeMutationBatch(c,p))}(e,n,t,i).next(()=>i.apply(n)).next(()=>e.mutationQueue.performConsistencyCheck(n)).next(()=>e.documentOverlayCache.removeOverlaysForBatchId(n,s,t.batch.batchId)).next(()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(u){let c=H();for(let h=0;h<u.mutationResults.length;++h)u.mutationResults[h].transformResults.length>0&&(c=c.add(u.batch.mutations[h].key));return c}(t))).next(()=>e.localDocuments.getDocuments(n,s))})}function _f(r){const t=F(r);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.Pi.getLastRemoteSnapshotVersion(e))}function Cy(r,t){const e=F(r),n=t.snapshotVersion;let s=e.Ms;return e.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=e.Ns.newChangeBuffer({trackRemovals:!0});s=e.Ms;const u=[];t.targetChanges.forEach((f,p)=>{const g=s.get(p);if(!g)return;u.push(e.Pi.removeMatchingKeys(i,f.removedDocuments,p).next(()=>e.Pi.addMatchingKeys(i,f.addedDocuments,p)));let b=g.withSequenceNumber(i.currentSequenceNumber);t.targetMismatches.get(p)!==null?b=b.withResumeToken(mt.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):f.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(f.resumeToken,n)),s=s.insert(p,b),function(x,V,j){return x.resumeToken.approximateByteSize()===0||V.snapshotVersion.toMicroseconds()-x.snapshotVersion.toMicroseconds()>=Sy?!0:j.addedDocuments.size+j.modifiedDocuments.size+j.removedDocuments.size>0}(g,b,f)&&u.push(e.Pi.updateTargetData(i,b))});let c=Ut(),h=H();if(t.documentUpdates.forEach(f=>{t.resolvedLimboDocuments.has(f)&&u.push(e.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push(Dy(i,o,t.documentUpdates).next(f=>{c=f.ks,h=f.qs})),!n.isEqual(U.min())){const f=e.Pi.getLastRemoteSnapshotVersion(i).next(p=>e.Pi.setTargetsMetadata(i,i.currentSequenceNumber,n));u.push(f)}return A.waitFor(u).next(()=>o.apply(i)).next(()=>e.localDocuments.getLocalViewOfDocuments(i,c,h)).next(()=>c)}).then(i=>(e.Ms=s,i))}function Dy(r,t,e){let n=H(),s=H();return e.forEach(i=>n=n.add(i)),t.getEntries(r,n).next(i=>{let o=Ut();return e.forEach((u,c)=>{const h=i.get(u);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(u)),c.isNoDocument()&&c.version.isEqual(U.min())?(t.removeEntry(u,c.readTime),o=o.insert(u,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(t.addEntry(c),o=o.insert(u,c)):C(ja,"Ignoring outdated watch update for ",u,". Current version:",h.version," Watch version:",c.version)}),{ks:o,qs:s}})}function xy(r,t){const e=F(r);return e.persistence.runTransaction("Get next mutation batch","readonly",n=>(t===void 0&&(t=en),e.mutationQueue.getNextMutationBatchAfterBatchId(n,t)))}function _i(r,t){const e=F(r);return e.persistence.runTransaction("Allocate target","readwrite",n=>{let s;return e.Pi.getTargetData(n,t).next(i=>i?(s=i,A.resolve(s)):e.Pi.allocateTargetId(n).next(o=>(s=new re(t,o,"TargetPurposeListen",n.currentSequenceNumber),e.Pi.addTargetData(n,s).next(()=>s))))}).then(n=>{const s=e.Ms.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(e.Ms=e.Ms.insert(n.targetId,n),e.xs.set(t,n.targetId)),n})}async function Hn(r,t,e){const n=F(r),s=n.Ms.get(t),i=e?"readwrite":"readwrite-primary";try{e||await n.persistence.runTransaction("Release target",i,o=>n.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!Me(o))throw o;C(ja,`Failed to update sequence numbers for target ${t}: ${o}`)}n.Ms=n.Ms.remove(t),n.xs.delete(s.target)}function ra(r,t,e){const n=F(r);let s=U.min(),i=H();return n.persistence.runTransaction("Execute query","readwrite",o=>function(c,h,f){const p=F(c),g=p.xs.get(f);return g!==void 0?A.resolve(p.Ms.get(g)):p.Pi.getTargetData(h,f)}(n,o,jt(t)).next(u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,n.Pi.getMatchingKeysForTargetId(o,u.targetId).next(c=>{i=c})}).next(()=>n.Fs.getDocumentsMatchingQuery(o,t,e?s:U.min(),e?i:H())).next(u=>(Tf(n,Rd(t),u),{documents:u,Qs:i})))}function yf(r,t){const e=F(r),n=F(e.Pi),s=e.Ms.get(t);return s?Promise.resolve(s.target):e.persistence.runTransaction("Get target data","readonly",i=>n.At(i,t).next(o=>o?o.target:null))}function If(r,t){const e=F(r),n=e.Os.get(t)||U.min();return e.persistence.runTransaction("Get new document changes","readonly",s=>e.Ns.getAllFromCollectionGroup(s,t,jh(n,On),Number.MAX_SAFE_INTEGER)).then(s=>(Tf(e,t,s),s))}function Tf(r,t,e){let n=r.Os.get(t)||U.min();e.forEach((s,i)=>{i.readTime.compareTo(n)>0&&(n=i.readTime)}),r.Os.set(t,n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ef="firestore_clients";function Bl(r,t){return`${Ef}_${r}_${t}`}const wf="firestore_mutations";function Ul(r,t,e){let n=`${wf}_${r}_${e}`;return t.isAuthenticated()&&(n+=`_${t.uid}`),n}const Af="firestore_targets";function bo(r,t){return`${Af}_${r}_${t}`}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xt="SharedClientState";class yi{constructor(t,e,n,s){this.user=t,this.batchId=e,this.state=n,this.error=s}static Ws(t,e,n){const s=JSON.parse(n);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new N(s.error.code,s.error.message))),o?new yi(t,e,s.state,i):(ft(Xt,`Failed to parse mutation state for ID '${e}': ${n}`),null)}Gs(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class Ur{constructor(t,e,n){this.targetId=t,this.state=e,this.error=n}static Ws(t,e){const n=JSON.parse(e);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new N(n.error.code,n.error.message))),i?new Ur(t,n.state,s):(ft(Xt,`Failed to parse target state for ID '${t}': ${e}`),null)}Gs(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class Ii{constructor(t,e){this.clientId=t,this.activeTargetIds=e}static Ws(t,e){const n=JSON.parse(e);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=Sa();for(let o=0;s&&o<n.activeTargetIds.length;++o)s=Hh(n.activeTargetIds[o]),i=i.add(n.activeTargetIds[o]);return s?new Ii(t,i):(ft(Xt,`Failed to parse client data for instance '${t}': ${e}`),null)}}class za{constructor(t,e){this.clientId=t,this.onlineState=e}static Ws(t){const e=JSON.parse(t);return typeof e=="object"&&["Unknown","Online","Offline"].indexOf(e.onlineState)!==-1&&typeof e.clientId=="string"?new za(e.clientId,e.onlineState):(ft(Xt,`Failed to parse online state: ${t}`),null)}}class sa{constructor(){this.activeTargetIds=Sa()}zs(t){this.activeTargetIds=this.activeTargetIds.add(t)}js(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Gs(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class So{constructor(t,e,n,s,i){this.window=t,this.Mi=e,this.persistenceKey=n,this.Js=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.Hs=this.Ys.bind(this),this.Zs=new rt($),this.started=!1,this.Xs=[];const o=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.eo=Bl(this.persistenceKey,this.Js),this.no=function(c){return`firestore_sequence_number_${c}`}(this.persistenceKey),this.Zs=this.Zs.insert(this.Js,new sa),this.ro=new RegExp(`^${Ef}_${o}_([^_]*)$`),this.io=new RegExp(`^${wf}_${o}_(\\d+)(?:_(.*))?$`),this.so=new RegExp(`^${Af}_${o}_(\\d+)$`),this.oo=function(c){return`firestore_online_state_${c}`}(this.persistenceKey),this._o=function(c){return`firestore_bundle_loaded_v2_${c}`}(this.persistenceKey),this.window.addEventListener("storage",this.Hs)}static v(t){return!(!t||!t.localStorage)}async start(){const t=await this.syncEngine.Ts();for(const n of t){if(n===this.Js)continue;const s=this.getItem(Bl(this.persistenceKey,n));if(s){const i=Ii.Ws(n,s);i&&(this.Zs=this.Zs.insert(i.clientId,i))}}this.ao();const e=this.storage.getItem(this.oo);if(e){const n=this.uo(e);n&&this.co(n)}for(const n of this.Xs)this.Ys(n);this.Xs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(t){this.setItem(this.no,JSON.stringify(t))}getAllActiveQueryTargets(){return this.lo(this.Zs)}isActiveQueryTarget(t){let e=!1;return this.Zs.forEach((n,s)=>{s.activeTargetIds.has(t)&&(e=!0)}),e}addPendingMutation(t){this.ho(t,"pending")}updateMutationState(t,e,n){this.ho(t,e,n),this.Po(t)}addLocalQueryTarget(t,e=!0){let n="not-current";if(this.isActiveQueryTarget(t)){const s=this.storage.getItem(bo(this.persistenceKey,t));if(s){const i=Ur.Ws(t,s);i&&(n=i.state)}}return e&&this.To.zs(t),this.ao(),n}removeLocalQueryTarget(t){this.To.js(t),this.ao()}isLocalQueryTarget(t){return this.To.activeTargetIds.has(t)}clearQueryState(t){this.removeItem(bo(this.persistenceKey,t))}updateQueryState(t,e,n){this.Io(t,e,n)}handleUserChange(t,e,n){e.forEach(s=>{this.Po(s)}),this.currentUser=t,n.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(t){this.Eo(t)}notifyBundleLoaded(t){this.Ao(t)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.Hs),this.removeItem(this.eo),this.started=!1)}getItem(t){const e=this.storage.getItem(t);return C(Xt,"READ",t,e),e}setItem(t,e){C(Xt,"SET",t,e),this.storage.setItem(t,e)}removeItem(t){C(Xt,"REMOVE",t),this.storage.removeItem(t)}Ys(t){const e=t;if(e.storageArea===this.storage){if(C(Xt,"EVENT",e.key,e.newValue),e.key===this.eo)return void ft("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Mi.enqueueRetryable(async()=>{if(this.started){if(e.key!==null){if(this.ro.test(e.key)){if(e.newValue==null){const n=this.Ro(e.key);return this.Vo(n,null)}{const n=this.mo(e.key,e.newValue);if(n)return this.Vo(n.clientId,n)}}else if(this.io.test(e.key)){if(e.newValue!==null){const n=this.fo(e.key,e.newValue);if(n)return this.po(n)}}else if(this.so.test(e.key)){if(e.newValue!==null){const n=this.yo(e.key,e.newValue);if(n)return this.wo(n)}}else if(e.key===this.oo){if(e.newValue!==null){const n=this.uo(e.newValue);if(n)return this.co(n)}}else if(e.key===this.no){const n=function(i){let o=Ot.ce;if(i!=null)try{const u=JSON.parse(i);L(typeof u=="number",30636,{So:i}),o=u}catch(u){ft(Xt,"Failed to read sequence number from WebStorage",u)}return o}(e.newValue);n!==Ot.ce&&this.sequenceNumberHandler(n)}else if(e.key===this._o){const n=this.bo(e.newValue);await Promise.all(n.map(s=>this.syncEngine.Do(s)))}}}else this.Xs.push(e)})}}get To(){return this.Zs.get(this.Js)}ao(){this.setItem(this.eo,this.To.Gs())}ho(t,e,n){const s=new yi(this.currentUser,t,e,n),i=Ul(this.persistenceKey,this.currentUser,t);this.setItem(i,s.Gs())}Po(t){const e=Ul(this.persistenceKey,this.currentUser,t);this.removeItem(e)}Eo(t){const e={clientId:this.Js,onlineState:t};this.storage.setItem(this.oo,JSON.stringify(e))}Io(t,e,n){const s=bo(this.persistenceKey,t),i=new Ur(t,e,n);this.setItem(s,i.Gs())}Ao(t){const e=JSON.stringify(Array.from(t));this.setItem(this._o,e)}Ro(t){const e=this.ro.exec(t);return e?e[1]:null}mo(t,e){const n=this.Ro(t);return Ii.Ws(n,e)}fo(t,e){const n=this.io.exec(t),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return yi.Ws(new Et(i),s,e)}yo(t,e){const n=this.so.exec(t),s=Number(n[1]);return Ur.Ws(s,e)}uo(t){return za.Ws(t)}bo(t){return JSON.parse(t)}async po(t){if(t.user.uid===this.currentUser.uid)return this.syncEngine.Co(t.batchId,t.state,t.error);C(Xt,`Ignoring mutation for non-active user ${t.user.uid}`)}wo(t){return this.syncEngine.vo(t.targetId,t.state,t.error)}Vo(t,e){const n=e?this.Zs.insert(t,e):this.Zs.remove(t),s=this.lo(this.Zs),i=this.lo(n),o=[],u=[];return i.forEach(c=>{s.has(c)||o.push(c)}),s.forEach(c=>{i.has(c)||u.push(c)}),this.syncEngine.Fo(o,u).then(()=>{this.Zs=n})}co(t){this.Zs.get(t.clientId)&&this.onlineStateHandler(t.onlineState)}lo(t){let e=Sa();return t.forEach((n,s)=>{e=e.unionWith(s.activeTargetIds)}),e}}class vf{constructor(){this.Mo=new sa,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.Mo.zs(t),this.xo[t]||"not-current"}updateQueryState(t,e,n){this.xo[t]=e}removeLocalQueryTarget(t){this.Mo.js(t)}isLocalQueryTarget(t){return this.Mo.activeTargetIds.has(t)}clearQueryState(t){delete this.xo[t]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(t){return this.Mo.activeTargetIds.has(t)}start(){return this.Mo=new sa,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ny{Oo(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ql="ConnectivityMonitor";class jl{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(t){this.qo.push(t)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){C(ql,"Network connectivity changed: AVAILABLE");for(const t of this.qo)t(0)}ko(){C(ql,"Network connectivity changed: UNAVAILABLE");for(const t of this.qo)t(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qs=null;function ia(){return qs===null?qs=function(){return 268435456+Math.round(2147483648*Math.random())}():qs++,"0x"+qs.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Po="RestConnection",ky={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class Oy{get $o(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Uo=e+"://"+t.host,this.Ko=`projects/${n}/databases/${s}`,this.Wo=this.databaseId.database===Jr?`project_id=${n}`:`project_id=${n}&database_id=${s}`}Go(t,e,n,s,i){const o=ia(),u=this.zo(t,e.toUriEncodedString());C(Po,`Sending RPC '${t}' ${o}:`,u,n);const c={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(c,s,i);const{host:h}=new URL(u),f=Jn(h);return this.Jo(t,u,c,n,f).then(p=>(C(Po,`Received RPC '${t}' ${o}: `,p),p),p=>{throw Nn(Po,`RPC '${t}' ${o} failed with error: `,p,"url: ",u,"request:",n),p})}Ho(t,e,n,s,i,o){return this.Go(t,e,n,s,i)}jo(t,e,n){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Yn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((s,i)=>t[i]=s),n&&n.headers.forEach((s,i)=>t[i]=s)}zo(t,e){const n=ky[t];return`${this.Uo}/v1/${e}:${n}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class My{constructor(t){this.Yo=t.Yo,this.Zo=t.Zo}Xo(t){this.e_=t}t_(t){this.n_=t}r_(t){this.i_=t}onMessage(t){this.s_=t}close(){this.Zo()}send(t){this.Yo(t)}o_(){this.e_()}__(){this.n_()}a_(t){this.i_(t)}u_(t){this.s_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const St="WebChannelConnection";class Fy extends Oy{constructor(t){super(t),this.c_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}Jo(t,e,n,s,i){const o=ia();return new Promise((u,c)=>{const h=new xh;h.setWithCredentials(!0),h.listenOnce(Nh.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case $s.NO_ERROR:const p=h.getResponseJson();C(St,`XHR for RPC '${t}' ${o} received:`,JSON.stringify(p)),u(p);break;case $s.TIMEOUT:C(St,`RPC '${t}' ${o} timed out`),c(new N(P.DEADLINE_EXCEEDED,"Request time out"));break;case $s.HTTP_ERROR:const g=h.getStatus();if(C(St,`RPC '${t}' ${o} failed with status:`,g,"response text:",h.getResponseText()),g>0){let b=h.getResponseJson();Array.isArray(b)&&(b=b[0]);const D=b==null?void 0:b.error;if(D&&D.status&&D.message){const x=function(j){const q=j.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(q)>=0?q:P.UNKNOWN}(D.status);c(new N(x,D.message))}else c(new N(P.UNKNOWN,"Server responded with status "+h.getStatus()))}else c(new N(P.UNAVAILABLE,"Connection failed."));break;default:M(9055,{l_:t,streamId:o,h_:h.getLastErrorCode(),P_:h.getLastError()})}}finally{C(St,`RPC '${t}' ${o} completed.`)}});const f=JSON.stringify(s);C(St,`RPC '${t}' ${o} sending request:`,s),h.send(e,"POST",f,n,15)})}T_(t,e,n){const s=ia(),i=[this.Uo,"/","google.firestore.v1.Firestore","/",t,"/channel"],o=Mh(),u=Oh(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(c.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(c.useFetchStreams=!0),this.jo(c.initMessageHeaders,e,n),c.encodeInitMessageHeaders=!0;const f=i.join("");C(St,`Creating RPC '${t}' stream ${s}: ${f}`,c);const p=o.createWebChannel(f,c);this.I_(p);let g=!1,b=!1;const D=new My({Yo:V=>{b?C(St,`Not sending because RPC '${t}' stream ${s} is closed:`,V):(g||(C(St,`Opening RPC '${t}' stream ${s} transport.`),p.open(),g=!0),C(St,`RPC '${t}' stream ${s} sending:`,V),p.send(V))},Zo:()=>p.close()}),x=(V,j,q)=>{V.listen(j,B=>{try{q(B)}catch(z){setTimeout(()=>{throw z},0)}})};return x(p,Sr.EventType.OPEN,()=>{b||(C(St,`RPC '${t}' stream ${s} transport opened.`),D.o_())}),x(p,Sr.EventType.CLOSE,()=>{b||(b=!0,C(St,`RPC '${t}' stream ${s} transport closed`),D.a_(),this.E_(p))}),x(p,Sr.EventType.ERROR,V=>{b||(b=!0,Nn(St,`RPC '${t}' stream ${s} transport errored. Name:`,V.name,"Message:",V.message),D.a_(new N(P.UNAVAILABLE,"The operation could not be completed")))}),x(p,Sr.EventType.MESSAGE,V=>{var j;if(!b){const q=V.data[0];L(!!q,16349);const B=q,z=(B==null?void 0:B.error)||((j=B[0])==null?void 0:j.error);if(z){C(St,`RPC '${t}' stream ${s} received error:`,z);const W=z.status;let K=function(I){const w=pt[I];if(w!==void 0)return Ld(w)}(W),T=z.message;K===void 0&&(K=P.INTERNAL,T="Unknown error status: "+W+" with message "+z.message),b=!0,D.a_(new N(K,T)),p.close()}else C(St,`RPC '${t}' stream ${s} received:`,q),D.u_(q)}}),x(u,kh.STAT_EVENT,V=>{V.stat===Fo.PROXY?C(St,`RPC '${t}' stream ${s} detected buffering proxy`):V.stat===Fo.NOPROXY&&C(St,`RPC '${t}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{D.__()},0),D}terminate(){this.c_.forEach(t=>t.close()),this.c_=[]}I_(t){this.c_.push(t)}E_(t){this.c_=this.c_.filter(e=>e===t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rf(){return typeof window<"u"?window:null}function ti(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fi(r){return new q_(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a{constructor(t,e,n=1e3,s=1.5,i=6e4){this.Mi=t,this.timerId=e,this.d_=n,this.A_=s,this.R_=i,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(t){this.cancel();const e=Math.floor(this.V_+this.y_()),n=Math.max(0,Date.now()-this.f_),s=Math.max(0,e-n);s>0&&C("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.V_} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,s,()=>(this.f_=Date.now(),t())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zl="PersistentStream";class bf{constructor(t,e,n,s,i,o,u,c){this.Mi=t,this.S_=n,this.b_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=u,this.listener=c,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new $a(t,e)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(t){this.Q_(),this.stream.send(t)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,t!==4?this.M_.reset():e&&e.code===P.RESOURCE_EXHAUSTED?(ft(e.toString()),ft("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):e&&e.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.r_(e)}K_(){}auth(){this.state=1;const t=this.W_(this.D_),e=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,s])=>{this.D_===e&&this.G_(n,s)},n=>{t(()=>{const s=new N(P.UNKNOWN,"Fetching auth token failed: "+n.message);return this.z_(s)})})}G_(t,e){const n=this.W_(this.D_);this.stream=this.j_(t,e),this.stream.Xo(()=>{n(()=>this.listener.Xo())}),this.stream.t_(()=>{n(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(s=>{n(()=>this.z_(s))}),this.stream.onMessage(s=>{n(()=>++this.F_==1?this.J_(s):this.onNext(s))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(t){return C(zl,`close with error: ${t}`),this.stream=null,this.close(4,t)}W_(t){return e=>{this.Mi.enqueueAndForget(()=>this.D_===t?e():(C(zl,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Ly extends bf{constructor(t,e,n,s,i,o){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,s,o),this.serializer=i}j_(t,e){return this.connection.T_("Listen",t,e)}J_(t){return this.onNext(t)}onNext(t){this.M_.reset();const e=G_(this.serializer,t),n=function(i){if(!("targetChange"in i))return U.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?U.min():o.readTime?wt(o.readTime):U.min()}(t);return this.listener.H_(e,n)}Y_(t){const e={};e.database=Yo(this.serializer),e.addTarget=function(i,o){let u;const c=o.target;if(u=li(c)?{documents:Kd(i,c)}:{query:Oa(i,c).ft},u.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){u.resumeToken=qd(i,o.resumeToken);const h=Xo(i,o.expectedCount);h!==null&&(u.expectedCount=h)}else if(o.snapshotVersion.compareTo(U.min())>0){u.readTime=Kn(i,o.snapshotVersion.toTimestamp());const h=Xo(i,o.expectedCount);h!==null&&(u.expectedCount=h)}return u}(this.serializer,t);const n=Q_(this.serializer,t);n&&(e.labels=n),this.q_(e)}Z_(t){const e={};e.database=Yo(this.serializer),e.removeTarget=t,this.q_(e)}}class By extends bf{constructor(t,e,n,s,i,o){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,s,o),this.serializer=i}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(t,e){return this.connection.T_("Write",t,e)}J_(t){return L(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,L(!t.writeResults||t.writeResults.length===0,55816),this.listener.ta()}onNext(t){L(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.M_.reset();const e=K_(t.writeResults,t.commitTime),n=wt(t.commitTime);return this.listener.na(n,e)}ra(){const t={};t.database=Yo(this.serializer),this.q_(t)}ea(t){const e={streamToken:this.lastStreamToken,writes:t.map(n=>ss(this.serializer,n))};this.q_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uy{}class qy extends Uy{constructor(t,e,n,s){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new N(P.FAILED_PRECONDITION,"The client has already been terminated.")}Go(t,e,n,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Go(t,Jo(e,n),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new N(P.UNKNOWN,i.toString())})}Ho(t,e,n,s,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,u])=>this.connection.Ho(t,Jo(e,n),s,o,u,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(P.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class jy{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(t){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ca("Offline")))}set(t){this.Pa(),this.oa=0,t==="Online"&&(this.aa=!1),this.ca(t)}ca(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}la(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(ft(e),this.aa=!1):C("OnlineStateTracker",e)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn="RemoteStore";class zy{constructor(t,e,n,s,i){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=i,this.Aa.Oo(o=>{n.enqueueAndForget(async()=>{pn(this)&&(C(dn,"Restarting streams for network reachability change."),await async function(c){const h=F(c);h.Ea.add(4),await gs(h),h.Ra.set("Unknown"),h.Ea.delete(4),await Li(h)}(this))})}),this.Ra=new jy(n,s)}}async function Li(r){if(pn(r))for(const t of r.da)await t(!0)}async function gs(r){for(const t of r.da)await t(!1)}function Bi(r,t){const e=F(r);e.Ia.has(t.targetId)||(e.Ia.set(t.targetId,t),Ha(e)?Ka(e):nr(e).O_()&&Ga(e,t))}function Qn(r,t){const e=F(r),n=nr(e);e.Ia.delete(t),n.O_()&&Sf(e,t),e.Ia.size===0&&(n.O_()?n.L_():pn(e)&&e.Ra.set("Unknown"))}function Ga(r,t){if(r.Va.Ue(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(U.min())>0){const e=r.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}nr(r).Y_(t)}function Sf(r,t){r.Va.Ue(t),nr(r).Z_(t)}function Ka(r){r.Va=new F_({getRemoteKeysForTarget:t=>r.remoteSyncer.getRemoteKeysForTarget(t),At:t=>r.Ia.get(t)||null,ht:()=>r.datastore.serializer.databaseId}),nr(r).start(),r.Ra.ua()}function Ha(r){return pn(r)&&!nr(r).x_()&&r.Ia.size>0}function pn(r){return F(r).Ea.size===0}function Pf(r){r.Va=void 0}async function $y(r){r.Ra.set("Online")}async function Gy(r){r.Ia.forEach((t,e)=>{Ga(r,t)})}async function Ky(r,t){Pf(r),Ha(r)?(r.Ra.ha(t),Ka(r)):r.Ra.set("Unknown")}async function Hy(r,t,e){if(r.Ra.set("Online"),t instanceof Ud&&t.state===2&&t.cause)try{await async function(s,i){const o=i.cause;for(const u of i.targetIds)s.Ia.has(u)&&(await s.remoteSyncer.rejectListen(u,o),s.Ia.delete(u),s.Va.removeTarget(u))}(r,t)}catch(n){C(dn,"Failed to remove targets %s: %s ",t.targetIds.join(","),n),await Ti(r,n)}else if(t instanceof Ys?r.Va.Ze(t):t instanceof Bd?r.Va.st(t):r.Va.tt(t),!e.isEqual(U.min()))try{const n=await _f(r.localStore);e.compareTo(n)>=0&&await function(i,o){const u=i.Va.Tt(o);return u.targetChanges.forEach((c,h)=>{if(c.resumeToken.approximateByteSize()>0){const f=i.Ia.get(h);f&&i.Ia.set(h,f.withResumeToken(c.resumeToken,o))}}),u.targetMismatches.forEach((c,h)=>{const f=i.Ia.get(c);if(!f)return;i.Ia.set(c,f.withResumeToken(mt.EMPTY_BYTE_STRING,f.snapshotVersion)),Sf(i,c);const p=new re(f.target,c,h,f.sequenceNumber);Ga(i,p)}),i.remoteSyncer.applyRemoteEvent(u)}(r,e)}catch(n){C(dn,"Failed to raise snapshot:",n),await Ti(r,n)}}async function Ti(r,t,e){if(!Me(t))throw t;r.Ea.add(1),await gs(r),r.Ra.set("Offline"),e||(e=()=>_f(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{C(dn,"Retrying IndexedDB access"),await e(),r.Ea.delete(1),await Li(r)})}function Vf(r,t){return t().catch(e=>Ti(r,e,t))}async function er(r){const t=F(r),e=Ne(t);let n=t.Ta.length>0?t.Ta[t.Ta.length-1].batchId:en;for(;Qy(t);)try{const s=await xy(t.localStore,n);if(s===null){t.Ta.length===0&&e.L_();break}n=s.batchId,Wy(t,s)}catch(s){await Ti(t,s)}Cf(t)&&Df(t)}function Qy(r){return pn(r)&&r.Ta.length<10}function Wy(r,t){r.Ta.push(t);const e=Ne(r);e.O_()&&e.X_&&e.ea(t.mutations)}function Cf(r){return pn(r)&&!Ne(r).x_()&&r.Ta.length>0}function Df(r){Ne(r).start()}async function Xy(r){Ne(r).ra()}async function Jy(r){const t=Ne(r);for(const e of r.Ta)t.ea(e.mutations)}async function Yy(r,t,e){const n=r.Ta.shift(),s=Da.from(n,t,e);await Vf(r,()=>r.remoteSyncer.applySuccessfulWrite(s)),await er(r)}async function Zy(r,t){t&&Ne(r).X_&&await async function(n,s){if(function(o){return Fd(o)&&o!==P.ABORTED}(s.code)){const i=n.Ta.shift();Ne(n).B_(),await Vf(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await er(n)}}(r,t),Cf(r)&&Df(r)}async function $l(r,t){const e=F(r);e.asyncQueue.verifyOperationInProgress(),C(dn,"RemoteStore received new credentials");const n=pn(e);e.Ea.add(3),await gs(e),n&&e.Ra.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.Ea.delete(3),await Li(e)}async function oa(r,t){const e=F(r);t?(e.Ea.delete(2),await Li(e)):t||(e.Ea.add(2),await gs(e),e.Ra.set("Unknown"))}function nr(r){return r.ma||(r.ma=function(e,n,s){const i=F(e);return i.sa(),new Ly(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Xo:$y.bind(null,r),t_:Gy.bind(null,r),r_:Ky.bind(null,r),H_:Hy.bind(null,r)}),r.da.push(async t=>{t?(r.ma.B_(),Ha(r)?Ka(r):r.Ra.set("Unknown")):(await r.ma.stop(),Pf(r))})),r.ma}function Ne(r){return r.fa||(r.fa=function(e,n,s){const i=F(e);return i.sa(),new By(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Xo:()=>Promise.resolve(),t_:Xy.bind(null,r),r_:Zy.bind(null,r),ta:Jy.bind(null,r),na:Yy.bind(null,r)}),r.da.push(async t=>{t?(r.fa.B_(),await er(r)):(await r.fa.stop(),r.Ta.length>0&&(C(dn,`Stopping write stream with ${r.Ta.length} pending writes`),r.Ta=[]))})),r.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qa{constructor(t,e,n,s,i){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new $t,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,s,i){const o=Date.now()+n,u=new Qa(t,e,o,s,i);return u.start(n),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(P.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Wa(r,t){if(ft("AsyncQueue",`${t}: ${r}`),Me(r))return new N(P.UNAVAILABLE,`${t}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{static emptySet(t){return new Dn(t.comparator)}constructor(t){this.comparator=t?(e,n)=>t(e,n)||O.comparator(e.key,n.key):(e,n)=>O.comparator(e.key,n.key),this.keyedMap=Pr(),this.sortedSet=new rt(this.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof Dn)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const n=new Dn;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gl{constructor(){this.ga=new rt(O.comparator)}track(t){const e=t.doc.key,n=this.ga.get(e);n?t.type!==0&&n.type===3?this.ga=this.ga.insert(e,t):t.type===3&&n.type!==1?this.ga=this.ga.insert(e,{type:n.type,doc:t.doc}):t.type===2&&n.type===2?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):t.type===2&&n.type===0?this.ga=this.ga.insert(e,{type:0,doc:t.doc}):t.type===1&&n.type===0?this.ga=this.ga.remove(e):t.type===1&&n.type===2?this.ga=this.ga.insert(e,{type:1,doc:n.doc}):t.type===0&&n.type===1?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):M(63341,{Rt:t,pa:n}):this.ga=this.ga.insert(e,t)}ya(){const t=[];return this.ga.inorderTraversal((e,n)=>{t.push(n)}),t}}class Wn{constructor(t,e,n,s,i,o,u,c,h){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=u,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(t,e,n,s,i){const o=[];return e.forEach(u=>{o.push({type:0,doc:u})}),new Wn(t,e,Dn.emptySet(e),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&Di(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let s=0;s<e.length;s++)if(e[s].type!==n[s].type||!e[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tI{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(t=>t.Da())}}class eI{constructor(){this.queries=Kl(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(e,n){const s=F(e),i=s.queries;s.queries=Kl(),i.forEach((o,u)=>{for(const c of u.Sa)c.onError(n)})})(this,new N(P.ABORTED,"Firestore shutting down"))}}function Kl(){return new ue(r=>vd(r),Di)}async function Xa(r,t){const e=F(r);let n=3;const s=t.query;let i=e.queries.get(s);i?!i.ba()&&t.Da()&&(n=2):(i=new tI,n=t.Da()?0:1);try{switch(n){case 0:i.wa=await e.onListen(s,!0);break;case 1:i.wa=await e.onListen(s,!1);break;case 2:await e.onFirstRemoteStoreListen(s)}}catch(o){const u=Wa(o,`Initialization of query '${Sn(t.query)}' failed`);return void t.onError(u)}e.queries.set(s,i),i.Sa.push(t),t.va(e.onlineState),i.wa&&t.Fa(i.wa)&&Ya(e)}async function Ja(r,t){const e=F(r),n=t.query;let s=3;const i=e.queries.get(n);if(i){const o=i.Sa.indexOf(t);o>=0&&(i.Sa.splice(o,1),i.Sa.length===0?s=t.Da()?0:1:!i.ba()&&t.Da()&&(s=2))}switch(s){case 0:return e.queries.delete(n),e.onUnlisten(n,!0);case 1:return e.queries.delete(n),e.onUnlisten(n,!1);case 2:return e.onLastRemoteStoreUnlisten(n);default:return}}function nI(r,t){const e=F(r);let n=!1;for(const s of t){const i=s.query,o=e.queries.get(i);if(o){for(const u of o.Sa)u.Fa(s)&&(n=!0);o.wa=s}}n&&Ya(e)}function rI(r,t,e){const n=F(r),s=n.queries.get(t);if(s)for(const i of s.Sa)i.onError(e);n.queries.delete(t)}function Ya(r){r.Ca.forEach(t=>{t.next()})}var aa,Hl;(Hl=aa||(aa={})).Ma="default",Hl.Cache="cache";class Za{constructor(t,e,n){this.query=t,this.xa=e,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=n||{}}Fa(t){if(!this.options.includeMetadataChanges){const n=[];for(const s of t.docChanges)s.type!==3&&n.push(s);t=new Wn(t.query,t.docs,t.oldDocs,n,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.Oa?this.Ba(t)&&(this.xa.next(t),e=!0):this.La(t,this.onlineState)&&(this.ka(t),e=!0),this.Na=t,e}onError(t){this.xa.error(t)}va(t){this.onlineState=t;let e=!1;return this.Na&&!this.Oa&&this.La(this.Na,t)&&(this.ka(this.Na),e=!0),e}La(t,e){if(!t.fromCache||!this.Da())return!0;const n=e!=="Offline";return(!this.options.qa||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}Ba(t){if(t.docChanges.length>0)return!0;const e=this.Na&&this.Na.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}ka(t){t=Wn.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.Oa=!0,this.xa.next(t)}Da(){return this.options.source!==aa.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xf{constructor(t){this.key=t}}class Nf{constructor(t){this.key=t}}class sI{constructor(t,e){this.query=t,this.Ya=e,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=H(),this.mutatedKeys=H(),this.eu=bd(t),this.tu=new Dn(this.eu)}get nu(){return this.Ya}ru(t,e){const n=e?e.iu:new Gl,s=e?e.tu:this.tu;let i=e?e.mutatedKeys:this.mutatedKeys,o=s,u=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(t.inorderTraversal((f,p)=>{const g=s.get(f),b=fs(this.query,p)?p:null,D=!!g&&this.mutatedKeys.has(g.key),x=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let V=!1;g&&b?g.data.isEqual(b.data)?D!==x&&(n.track({type:3,doc:b}),V=!0):this.su(g,b)||(n.track({type:2,doc:b}),V=!0,(c&&this.eu(b,c)>0||h&&this.eu(b,h)<0)&&(u=!0)):!g&&b?(n.track({type:0,doc:b}),V=!0):g&&!b&&(n.track({type:1,doc:g}),V=!0,(c||h)&&(u=!0)),V&&(b?(o=o.add(b),i=x?i.add(f):i.delete(f)):(o=o.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),i=i.delete(f.key),n.track({type:1,doc:f})}return{tu:o,iu:n,Cs:u,mutatedKeys:i}}su(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,s){const i=this.tu;this.tu=t.tu,this.mutatedKeys=t.mutatedKeys;const o=t.iu.ya();o.sort((f,p)=>function(b,D){const x=V=>{switch(V){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return M(20277,{Rt:V})}};return x(b)-x(D)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(n),s=s??!1;const u=e&&!s?this._u():[],c=this.Xa.size===0&&this.current&&!s?1:0,h=c!==this.Za;return this.Za=c,o.length!==0||h?{snapshot:new Wn(this.query,t.tu,i,o,t.mutatedKeys,c===0,h,!1,!!n&&n.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Gl,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(t){return!this.Ya.has(t)&&!!this.tu.has(t)&&!this.tu.get(t).hasLocalMutations}ou(t){t&&(t.addedDocuments.forEach(e=>this.Ya=this.Ya.add(e)),t.modifiedDocuments.forEach(e=>{}),t.removedDocuments.forEach(e=>this.Ya=this.Ya.delete(e)),this.current=t.current)}_u(){if(!this.current)return[];const t=this.Xa;this.Xa=H(),this.tu.forEach(n=>{this.uu(n.key)&&(this.Xa=this.Xa.add(n.key))});const e=[];return t.forEach(n=>{this.Xa.has(n)||e.push(new Nf(n))}),this.Xa.forEach(n=>{t.has(n)||e.push(new xf(n))}),e}cu(t){this.Ya=t.Qs,this.Xa=H();const e=this.ru(t.documents);return this.applyChanges(e,!0)}lu(){return Wn.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const rr="SyncEngine";class iI{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class oI{constructor(t){this.key=t,this.hu=!1}}class aI{constructor(t,e,n,s,i,o){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new ue(u=>vd(u),Di),this.Iu=new Map,this.Eu=new Set,this.du=new rt(O.comparator),this.Au=new Map,this.Ru=new La,this.Vu={},this.mu=new Map,this.fu=hn.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function uI(r,t,e=!0){const n=Ui(r);let s;const i=n.Tu.get(t);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lu()):s=await kf(n,t,e,!0),s}async function cI(r,t){const e=Ui(r);await kf(e,t,!0,!1)}async function kf(r,t,e,n){const s=await _i(r.localStore,jt(t)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,e);let u;return n&&(u=await tu(r,t,i,o==="current",s.resumeToken)),r.isPrimaryClient&&e&&Bi(r.remoteStore,s),u}async function tu(r,t,e,n,s){r.pu=(p,g,b)=>async function(x,V,j,q){let B=V.view.ru(j);B.Cs&&(B=await ra(x.localStore,V.query,!1).then(({documents:T})=>V.view.ru(T,B)));const z=q&&q.targetChanges.get(V.targetId),W=q&&q.targetMismatches.get(V.targetId)!=null,K=V.view.applyChanges(B,x.isPrimaryClient,z,W);return ua(x,V.targetId,K.au),K.snapshot}(r,p,g,b);const i=await ra(r.localStore,t,!0),o=new sI(t,i.Qs),u=o.ru(i.documents),c=ps.createSynthesizedTargetChangeForCurrentChange(e,n&&r.onlineState!=="Offline",s),h=o.applyChanges(u,r.isPrimaryClient,c);ua(r,e,h.au);const f=new iI(t,e,o);return r.Tu.set(t,f),r.Iu.has(e)?r.Iu.get(e).push(t):r.Iu.set(e,[t]),h.snapshot}async function lI(r,t,e){const n=F(r),s=n.Tu.get(t),i=n.Iu.get(s.targetId);if(i.length>1)return n.Iu.set(s.targetId,i.filter(o=>!Di(o,t))),void n.Tu.delete(t);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Hn(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),e&&Qn(n.remoteStore,s.targetId),Xn(n,s.targetId)}).catch(Oe)):(Xn(n,s.targetId),await Hn(n.localStore,s.targetId,!0))}async function hI(r,t){const e=F(r),n=e.Tu.get(t),s=e.Iu.get(n.targetId);e.isPrimaryClient&&s.length===1&&(e.sharedClientState.removeLocalQueryTarget(n.targetId),Qn(e.remoteStore,n.targetId))}async function dI(r,t,e){const n=su(r);try{const s=await function(o,u){const c=F(o),h=Z.now(),f=u.reduce((b,D)=>b.add(D.key),H());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",b=>{let D=Ut(),x=H();return c.Ns.getEntries(b,f).next(V=>{D=V,D.forEach((j,q)=>{q.isValidDocument()||(x=x.add(j))})}).next(()=>c.localDocuments.getOverlayedDocuments(b,D)).next(V=>{p=V;const j=[];for(const q of u){const B=x_(q,p.get(q.key).overlayedDocument);B!=null&&j.push(new ce(q.key,B,fd(B.value.mapValue),ut.exists(!0)))}return c.mutationQueue.addMutationBatch(b,h,j,u)}).next(V=>{g=V;const j=V.applyToLocalDocumentSet(p,x);return c.documentOverlayCache.saveOverlays(b,V.batchId,j)})}).then(()=>({batchId:g.batchId,changes:Pd(p)}))}(n.localStore,t);n.sharedClientState.addPendingMutation(s.batchId),function(o,u,c){let h=o.Vu[o.currentUser.toKey()];h||(h=new rt($)),h=h.insert(u,c),o.Vu[o.currentUser.toKey()]=h}(n,s.batchId,e),await Le(n,s.changes),await er(n.remoteStore)}catch(s){const i=Wa(s,"Failed to persist write");e.reject(i)}}async function Of(r,t){const e=F(r);try{const n=await Cy(e.localStore,t);t.targetChanges.forEach((s,i)=>{const o=e.Au.get(i);o&&(L(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.hu=!0:s.modifiedDocuments.size>0?L(o.hu,14607):s.removedDocuments.size>0&&(L(o.hu,42227),o.hu=!1))}),await Le(e,n,t)}catch(n){await Oe(n)}}function Ql(r,t,e){const n=F(r);if(n.isPrimaryClient&&e===0||!n.isPrimaryClient&&e===1){const s=[];n.Tu.forEach((i,o)=>{const u=o.view.va(t);u.snapshot&&s.push(u.snapshot)}),function(o,u){const c=F(o);c.onlineState=u;let h=!1;c.queries.forEach((f,p)=>{for(const g of p.Sa)g.va(u)&&(h=!0)}),h&&Ya(c)}(n.eventManager,t),s.length&&n.Pu.H_(s),n.onlineState=t,n.isPrimaryClient&&n.sharedClientState.setOnlineState(t)}}async function fI(r,t,e){const n=F(r);n.sharedClientState.updateQueryState(t,"rejected",e);const s=n.Au.get(t),i=s&&s.key;if(i){let o=new rt(O.comparator);o=o.insert(i,ot.newNoDocument(i,U.min()));const u=H().add(i),c=new ms(U.min(),new Map,new rt($),o,u);await Of(n,c),n.du=n.du.remove(i),n.Au.delete(t),ru(n)}else await Hn(n.localStore,t,!1).then(()=>Xn(n,t,e)).catch(Oe)}async function mI(r,t){const e=F(r),n=t.batch.batchId;try{const s=await Vy(e.localStore,t);nu(e,n,null),eu(e,n),e.sharedClientState.updateMutationState(n,"acknowledged"),await Le(e,s)}catch(s){await Oe(s)}}async function pI(r,t,e){const n=F(r);try{const s=await function(o,u){const c=F(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return c.mutationQueue.lookupMutationBatch(h,u).next(p=>(L(p!==null,37113),f=p.keys(),c.mutationQueue.removeMutationBatch(h,p))).next(()=>c.mutationQueue.performConsistencyCheck(h)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(h,f,u)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>c.localDocuments.getDocuments(h,f))})}(n.localStore,t);nu(n,t,e),eu(n,t),n.sharedClientState.updateMutationState(t,"rejected",e),await Le(n,s)}catch(s){await Oe(s)}}function eu(r,t){(r.mu.get(t)||[]).forEach(e=>{e.resolve()}),r.mu.delete(t)}function nu(r,t,e){const n=F(r);let s=n.Vu[n.currentUser.toKey()];if(s){const i=s.get(t);i&&(e?i.reject(e):i.resolve(),s=s.remove(t)),n.Vu[n.currentUser.toKey()]=s}}function Xn(r,t,e=null){r.sharedClientState.removeLocalQueryTarget(t);for(const n of r.Iu.get(t))r.Tu.delete(n),e&&r.Pu.yu(n,e);r.Iu.delete(t),r.isPrimaryClient&&r.Ru.jr(t).forEach(n=>{r.Ru.containsKey(n)||Mf(r,n)})}function Mf(r,t){r.Eu.delete(t.path.canonicalString());const e=r.du.get(t);e!==null&&(Qn(r.remoteStore,e),r.du=r.du.remove(t),r.Au.delete(e),ru(r))}function ua(r,t,e){for(const n of e)n instanceof xf?(r.Ru.addReference(n.key,t),gI(r,n)):n instanceof Nf?(C(rr,"Document no longer in limbo: "+n.key),r.Ru.removeReference(n.key,t),r.Ru.containsKey(n.key)||Mf(r,n.key)):M(19791,{wu:n})}function gI(r,t){const e=t.key,n=e.path.canonicalString();r.du.get(e)||r.Eu.has(n)||(C(rr,"New document in limbo: "+e),r.Eu.add(n),ru(r))}function ru(r){for(;r.Eu.size>0&&r.du.size<r.maxConcurrentLimboResolutions;){const t=r.Eu.values().next().value;r.Eu.delete(t);const e=new O(Y.fromString(t)),n=r.fu.next();r.Au.set(n,new oI(e)),r.du=r.du.insert(e,n),Bi(r.remoteStore,new re(jt(ds(e.path)),n,"TargetPurposeLimboResolution",Ot.ce))}}async function Le(r,t,e){const n=F(r),s=[],i=[],o=[];n.Tu.isEmpty()||(n.Tu.forEach((u,c)=>{o.push(n.pu(c,t,e).then(h=>{var f;if((h||e)&&n.isPrimaryClient){const p=h?!h.fromCache:(f=e==null?void 0:e.targetChanges.get(c.targetId))==null?void 0:f.current;n.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(h){s.push(h);const p=qa.As(c.targetId,h);i.push(p)}}))}),await Promise.all(o),n.Pu.H_(s),await async function(c,h){const f=F(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>A.forEach(h,g=>A.forEach(g.Es,b=>f.persistence.referenceDelegate.addReference(p,g.targetId,b)).next(()=>A.forEach(g.ds,b=>f.persistence.referenceDelegate.removeReference(p,g.targetId,b)))))}catch(p){if(!Me(p))throw p;C(ja,"Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const b=f.Ms.get(g),D=b.snapshotVersion,x=b.withLastLimboFreeSnapshotVersion(D);f.Ms=f.Ms.insert(g,x)}}}(n.localStore,i))}async function _I(r,t){const e=F(r);if(!e.currentUser.isEqual(t)){C(rr,"User change. New user:",t.toKey());const n=await gf(e.localStore,t);e.currentUser=t,function(i,o){i.mu.forEach(u=>{u.forEach(c=>{c.reject(new N(P.CANCELLED,o))})}),i.mu.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await Le(e,n.Ls)}}function yI(r,t){const e=F(r),n=e.Au.get(t);if(n&&n.hu)return H().add(n.key);{let s=H();const i=e.Iu.get(t);if(!i)return s;for(const o of i){const u=e.Tu.get(o);s=s.unionWith(u.view.nu)}return s}}async function II(r,t){const e=F(r),n=await ra(e.localStore,t.query,!0),s=t.view.cu(n);return e.isPrimaryClient&&ua(e,t.targetId,s.au),s}async function TI(r,t){const e=F(r);return If(e.localStore,t).then(n=>Le(e,n))}async function EI(r,t,e,n){const s=F(r),i=await function(u,c){const h=F(u),f=F(h.mutationQueue);return h.persistence.runTransaction("Lookup mutation documents","readonly",p=>f.er(p,c).next(g=>g?h.localDocuments.getDocuments(p,g):A.resolve(null)))}(s.localStore,t);i!==null?(e==="pending"?await er(s.remoteStore):e==="acknowledged"||e==="rejected"?(nu(s,t,n||null),eu(s,t),function(u,c){F(F(u).mutationQueue).ir(c)}(s.localStore,t)):M(6720,"Unknown batchState",{Su:e}),await Le(s,i)):C(rr,"Cannot apply mutation batch with id: "+t)}async function wI(r,t){const e=F(r);if(Ui(e),su(e),t===!0&&e.gu!==!0){const n=e.sharedClientState.getAllActiveQueryTargets(),s=await Wl(e,n.toArray());e.gu=!0,await oa(e.remoteStore,!0);for(const i of s)Bi(e.remoteStore,i)}else if(t===!1&&e.gu!==!1){const n=[];let s=Promise.resolve();e.Iu.forEach((i,o)=>{e.sharedClientState.isLocalQueryTarget(o)?n.push(o):s=s.then(()=>(Xn(e,o),Hn(e.localStore,o,!0))),Qn(e.remoteStore,o)}),await s,await Wl(e,n),function(o){const u=F(o);u.Au.forEach((c,h)=>{Qn(u.remoteStore,h)}),u.Ru.Jr(),u.Au=new Map,u.du=new rt(O.comparator)}(e),e.gu=!1,await oa(e.remoteStore,!1)}}async function Wl(r,t,e){const n=F(r),s=[],i=[];for(const o of t){let u;const c=n.Iu.get(o);if(c&&c.length!==0){u=await _i(n.localStore,jt(c[0]));for(const h of c){const f=n.Tu.get(h),p=await II(n,f);p.snapshot&&i.push(p.snapshot)}}else{const h=await yf(n.localStore,o);u=await _i(n.localStore,h),await tu(n,Ff(h),o,!1,u.resumeToken)}s.push(u)}return n.Pu.H_(i),s}function Ff(r){return Ed(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function AI(r){return function(e){return F(F(e).persistence).Ts()}(F(r).localStore)}async function vI(r,t,e,n){const s=F(r);if(s.gu)return void C(rr,"Ignoring unexpected query state notification.");const i=s.Iu.get(t);if(i&&i.length>0)switch(e){case"current":case"not-current":{const o=await If(s.localStore,Rd(i[0])),u=ms.createSynthesizedRemoteEventForCurrentChange(t,e==="current",mt.EMPTY_BYTE_STRING);await Le(s,o,u);break}case"rejected":await Hn(s.localStore,t,!0),Xn(s,t,n);break;default:M(64155,e)}}async function RI(r,t,e){const n=Ui(r);if(n.gu){for(const s of t){if(n.Iu.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){C(rr,"Adding an already active target "+s);continue}const i=await yf(n.localStore,s),o=await _i(n.localStore,i);await tu(n,Ff(i),o.targetId,!1,o.resumeToken),Bi(n.remoteStore,o)}for(const s of e)n.Iu.has(s)&&await Hn(n.localStore,s,!1).then(()=>{Qn(n.remoteStore,s),Xn(n,s)}).catch(Oe)}}function Ui(r){const t=F(r);return t.remoteStore.remoteSyncer.applyRemoteEvent=Of.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=yI.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=fI.bind(null,t),t.Pu.H_=nI.bind(null,t.eventManager),t.Pu.yu=rI.bind(null,t.eventManager),t}function su(r){const t=F(r);return t.remoteStore.remoteSyncer.applySuccessfulWrite=mI.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=pI.bind(null,t),t}class is{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=Fi(t.databaseInfo.databaseId),this.sharedClientState=this.Du(t),this.persistence=this.Cu(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Fu(t,this.localStore),this.indexBackfillerScheduler=this.Mu(t,this.localStore)}Fu(t,e){return null}Mu(t,e){return null}vu(t){return pf(this.persistence,new mf,t.initialUser,this.serializer)}Cu(t){return new Ba(Mi.mi,this.serializer)}Du(t){return new vf}async terminate(){var t,e;(t=this.gcScheduler)==null||t.stop(),(e=this.indexBackfillerScheduler)==null||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}is.provider={build:()=>new is};class bI extends is{constructor(t){super(),this.cacheSizeBytes=t}Fu(t,e){L(this.persistence.referenceDelegate instanceof gi,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new uf(n,t.asyncQueue,e)}Cu(t){const e=this.cacheSizeBytes!==void 0?Pt.withCacheSize(this.cacheSizeBytes):Pt.DEFAULT;return new Ba(n=>gi.mi(n,e),this.serializer)}}class Lf extends is{constructor(t,e,n){super(),this.xu=t,this.cacheSizeBytes=e,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(t){await super.initialize(t),await this.xu.initialize(this,t),await su(this.xu.syncEngine),await er(this.xu.remoteStore),await this.persistence.Ji(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}vu(t){return pf(this.persistence,new mf,t.initialUser,this.serializer)}Fu(t,e){const n=this.persistence.referenceDelegate.garbageCollector;return new uf(n,t.asyncQueue,e)}Mu(t,e){const n=new Ng(e,this.persistence);return new xg(t.asyncQueue,n)}Cu(t){const e=ff(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?Pt.withCacheSize(this.cacheSizeBytes):Pt.DEFAULT;return new Ua(this.synchronizeTabs,e,t.clientId,n,t.asyncQueue,Rf(),ti(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Du(t){return new vf}}class SI extends Lf{constructor(t,e){super(t,e,!1),this.xu=t,this.cacheSizeBytes=e,this.synchronizeTabs=!0}async initialize(t){await super.initialize(t);const e=this.xu.syncEngine;this.sharedClientState instanceof So&&(this.sharedClientState.syncEngine={Co:EI.bind(null,e),vo:vI.bind(null,e),Fo:RI.bind(null,e),Ts:AI.bind(null,e),Do:TI.bind(null,e)},await this.sharedClientState.start()),await this.persistence.Ji(async n=>{await wI(this.xu.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())})}Du(t){const e=Rf();if(!So.v(e))throw new N(P.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=ff(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey);return new So(e,t.asyncQueue,n,t.clientId,t.initialUser)}}class os{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Ql(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=_I.bind(null,this.syncEngine),await oa(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new eI}()}createDatastore(t){const e=Fi(t.databaseInfo.databaseId),n=function(i){return new Fy(i)}(t.databaseInfo);return function(i,o,u,c){return new qy(i,o,u,c)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return function(n,s,i,o,u){return new zy(n,s,i,o,u)}(this.localStore,this.datastore,t.asyncQueue,e=>Ql(this.syncEngine,e,0),function(){return jl.v()?new jl:new Ny}())}createSyncEngine(t,e){return function(s,i,o,u,c,h,f){const p=new aI(s,i,o,u,c,h);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(s){const i=F(s);C(dn,"RemoteStore shutting down."),i.Ea.add(5),await gs(i),i.Aa.shutdown(),i.Ra.set("Unknown")}(this.remoteStore),(t=this.datastore)==null||t.terminate(),(e=this.eventManager)==null||e.terminate()}}os.provider={build:()=>new os};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iu{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ou(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ou(this.observer.error,t):ft("Uncaught Error in snapshot listener:",t.toString()))}Nu(){this.muted=!0}Ou(t,e){setTimeout(()=>{this.muted||t(e)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PI{constructor(t){this.datastore=t,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(t){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new N(P.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const e=await async function(s,i){const o=F(s),u={documents:i.map(p=>rs(o.serializer,p))},c=await o.Ho("BatchGetDocuments",o.serializer.databaseId,Y.emptyPath(),u,i.length),h=new Map;c.forEach(p=>{const g=$_(o.serializer,p);h.set(g.key.toString(),g)});const f=[];return i.forEach(p=>{const g=h.get(p.toString());L(!!g,55234,{key:p}),f.push(g)}),f}(this.datastore,t);return e.forEach(n=>this.recordVersion(n)),e}set(t,e){this.write(e.toMutation(t,this.precondition(t))),this.writtenDocs.add(t.toString())}update(t,e){try{this.write(e.toMutation(t,this.preconditionForUpdate(t)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(t.toString())}delete(t){this.write(new tr(t,this.precondition(t))),this.writtenDocs.add(t.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const t=this.readVersions;this.mutations.forEach(e=>{t.delete(e.key.toString())}),t.forEach((e,n)=>{const s=O.fromPath(n);this.mutations.push(new Va(s,this.precondition(s)))}),await async function(n,s){const i=F(n),o={writes:s.map(u=>ss(i.serializer,u))};await i.Go("Commit",i.serializer.databaseId,Y.emptyPath(),o)}(this.datastore,this.mutations),this.committed=!0}recordVersion(t){let e;if(t.isFoundDocument())e=t.version;else{if(!t.isNoDocument())throw M(50498,{Gu:t.constructor.name});e=U.min()}const n=this.readVersions.get(t.key.toString());if(n){if(!e.isEqual(n))throw new N(P.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(t.key.toString(),e)}precondition(t){const e=this.readVersions.get(t.toString());return!this.writtenDocs.has(t.toString())&&e?e.isEqual(U.min())?ut.exists(!1):ut.updateTime(e):ut.none()}preconditionForUpdate(t){const e=this.readVersions.get(t.toString());if(!this.writtenDocs.has(t.toString())&&e){if(e.isEqual(U.min()))throw new N(P.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return ut.updateTime(e)}return ut.exists(!0)}write(t){this.ensureCommitNotCalled(),this.mutations.push(t)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VI{constructor(t,e,n,s,i){this.asyncQueue=t,this.datastore=e,this.options=n,this.updateFunction=s,this.deferred=i,this.zu=n.maxAttempts,this.M_=new $a(this.asyncQueue,"transaction_retry")}ju(){this.zu-=1,this.Ju()}Ju(){this.M_.p_(async()=>{const t=new PI(this.datastore),e=this.Hu(t);e&&e.then(n=>{this.asyncQueue.enqueueAndForget(()=>t.commit().then(()=>{this.deferred.resolve(n)}).catch(s=>{this.Yu(s)}))}).catch(n=>{this.Yu(n)})})}Hu(t){try{const e=this.updateFunction(t);return!us(e)&&e.catch&&e.then?e:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(e){return this.deferred.reject(e),null}}Yu(t){this.zu>0&&this.Zu(t)?(this.zu-=1,this.asyncQueue.enqueueAndForget(()=>(this.Ju(),Promise.resolve()))):this.deferred.reject(t)}Zu(t){if((t==null?void 0:t.name)==="FirebaseError"){const e=t.code;return e==="aborted"||e==="failed-precondition"||e==="already-exists"||!Fd(e)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ke="FirestoreClient";class CI{constructor(t,e,n,s,i){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=s,this.user=Et.UNAUTHENTICATED,this.clientId=ga.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,async o=>{C(ke,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(n,o=>(C(ke,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new $t;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Wa(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function Vo(r,t){r.asyncQueue.verifyOperationInProgress(),C(ke,"Initializing OfflineComponentProvider");const e=r.configuration;await t.initialize(e);let n=e.initialUser;r.setCredentialChangeListener(async s=>{n.isEqual(s)||(await gf(t.localStore,s),n=s)}),t.persistence.setDatabaseDeletedListener(()=>r.terminate()),r._offlineComponents=t}async function Xl(r,t){r.asyncQueue.verifyOperationInProgress();const e=await DI(r);C(ke,"Initializing OnlineComponentProvider"),await t.initialize(e,r.configuration),r.setCredentialChangeListener(n=>$l(t.remoteStore,n)),r.setAppCheckTokenChangeListener((n,s)=>$l(t.remoteStore,s)),r._onlineComponents=t}async function DI(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){C(ke,"Using user provided OfflineComponentProvider");try{await Vo(r,r._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(s){return s.name==="FirebaseError"?s.code===P.FAILED_PRECONDITION||s.code===P.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(e))throw e;Nn("Error using user provided cache. Falling back to memory cache: "+e),await Vo(r,new is)}}else C(ke,"Using default OfflineComponentProvider"),await Vo(r,new bI(void 0));return r._offlineComponents}async function ou(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(C(ke,"Using user provided OnlineComponentProvider"),await Xl(r,r._uninitializedComponentsProvider._online)):(C(ke,"Using default OnlineComponentProvider"),await Xl(r,new os))),r._onlineComponents}function xI(r){return ou(r).then(t=>t.syncEngine)}function Bf(r){return ou(r).then(t=>t.datastore)}async function Ei(r){const t=await ou(r),e=t.eventManager;return e.onListen=uI.bind(null,t.syncEngine),e.onUnlisten=lI.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=cI.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=hI.bind(null,t.syncEngine),e}function NI(r,t,e={}){const n=new $t;return r.asyncQueue.enqueueAndForget(async()=>function(i,o,u,c,h){const f=new iu({next:g=>{f.Nu(),o.enqueueAndForget(()=>Ja(i,p));const b=g.docs.has(u);!b&&g.fromCache?h.reject(new N(P.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&g.fromCache&&c&&c.source==="server"?h.reject(new N(P.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new Za(ds(u.path),f,{includeMetadataChanges:!0,qa:!0});return Xa(i,p)}(await Ei(r),r.asyncQueue,t,e,n)),n.promise}function kI(r,t,e={}){const n=new $t;return r.asyncQueue.enqueueAndForget(async()=>function(i,o,u,c,h){const f=new iu({next:g=>{f.Nu(),o.enqueueAndForget(()=>Ja(i,p)),g.fromCache&&c.source==="server"?h.reject(new N(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new Za(u,f,{includeMetadataChanges:!0,qa:!0});return Xa(i,p)}(await Ei(r),r.asyncQueue,t,e,n)),n.promise}function OI(r,t,e){const n=new $t;return r.asyncQueue.enqueueAndForget(async()=>{try{const s=await Bf(r);n.resolve(async function(o,u,c){var x;const h=F(o),{request:f,gt:p,parent:g}=H_(h.serializer,I_(u),c);h.connection.$o||delete f.parent;const b=(await h.Ho("RunAggregationQuery",h.serializer.databaseId,g,f,1)).filter(V=>!!V.result);L(b.length===1,64727);const D=(x=b[0].result)==null?void 0:x.aggregateFields;return Object.keys(D).reduce((V,j)=>(V[p[j]]=D[j],V),{})}(s,t,e))}catch(s){n.reject(s)}}),n.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uf(r){const t={};return r.timeoutSeconds!==void 0&&(t.timeoutSeconds=r.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jl=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qf="firestore.googleapis.com",Yl=!0;class Zl{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new N(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=qf,this.ssl=Yl}else this.host=t.host,this.ssl=t.ssl??Yl;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=nf;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<af)throw new N(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}Vg("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Uf(t.experimentalLongPollingOptions??{}),function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new N(P.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new N(P.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new N(P.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(n,s){return n.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class qi{constructor(t,e,n,s){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Zl({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new N(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Zl(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new Ig;switch(n.type){case"firstParty":return new Ag(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new N(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const n=Jl.get(e);n&&(C("ComponentProvider","Removing Datastore"),Jl.delete(e),n.terminate())}(this),Promise.resolve()}}function MI(r,t,e,n={}){var h;r=Vt(r,qi);const s=Jn(t),i=r._getSettings(),o={...i,emulatorOptions:r._getEmulatorOptions()},u=`${t}:${e}`;s&&(da(`https://${u}`),_h("Firestore",!0)),i.host!==qf&&i.host!==u&&Nn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...i,host:u,ssl:s,emulatorOptions:n};if(!jr(c,o)&&(r._setSettings(c),n.mockUserToken)){let f,p;if(typeof n.mockUserToken=="string")f=n.mockUserToken,p=Et.MOCK_USER;else{f=gh(n.mockUserToken,(h=r._app)==null?void 0:h.options.projectId);const g=n.mockUserToken.sub||n.mockUserToken.user_id;if(!g)throw new N(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Et(g)}r._authCredentials=new Tg(new Lh(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new Be(this.firestore,t,this._query)}}class ct{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ve(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new ct(this.firestore,t,this._key)}toJSON(){return{type:ct._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,n){if(as(e,ct._jsonSchema))return new ct(t,n||null,new O(Y.fromString(e.referencePath)))}}ct._jsonSchemaVersion="firestore/documentReference/1.0",ct._jsonSchema={type:gt("string",ct._jsonSchemaVersion),referencePath:gt("string")};class Ve extends Be{constructor(t,e,n){super(t,e,ds(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new ct(this.firestore,null,new O(t))}withConverter(t){return new Ve(this.firestore,t,this._path)}}function gE(r,t,...e){if(r=At(r),Uh("collection","path",t),r instanceof qi){const n=Y.fromString(t,...e);return zc(n),new Ve(r,null,n)}{if(!(r instanceof ct||r instanceof Ve))throw new N(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(Y.fromString(t,...e));return zc(n),new Ve(r.firestore,null,n)}}function _E(r,t,...e){if(r=At(r),arguments.length===1&&(t=ga.newId()),Uh("doc","path",t),r instanceof qi){const n=Y.fromString(t,...e);return jc(n),new ct(r,null,new O(n))}{if(!(r instanceof ct||r instanceof Ve))throw new N(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(Y.fromString(t,...e));return jc(n),new ct(r.firestore,r instanceof Ve?r.converter:null,new O(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const th="AsyncQueue";class eh{constructor(t=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new $a(this,"async_queue_retry"),this._c=()=>{const n=ti();n&&C(th,"Visibility state changed to "+n.visibilityState),this.M_.w_()},this.ac=t;const e=ti();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.uc(),this.cc(t)}enterRestrictedMode(t){if(!this.ec){this.ec=!0,this.sc=t||!1;const e=ti();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this._c)}}enqueue(t){if(this.uc(),this.ec)return new Promise(()=>{});const e=new $t;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Xu.push(t),this.lc()))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(t){if(!Me(t))throw t;C(th,"Operation failed with retryable error: "+t)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(t){const e=this.ac.then(()=>(this.rc=!0,t().catch(n=>{throw this.nc=n,this.rc=!1,ft("INTERNAL UNHANDLED ERROR: ",nh(n)),n}).then(n=>(this.rc=!1,n))));return this.ac=e,e}enqueueAfterDelay(t,e,n){this.uc(),this.oc.indexOf(t)>-1&&(e=0);const s=Qa.createAndSchedule(this,t,e,n,i=>this.hc(i));return this.tc.push(s),s}uc(){this.nc&&M(47125,{Pc:nh(this.nc)})}verifyOperationInProgress(){}async Tc(){let t;do t=this.ac,await t;while(t!==this.ac)}Ic(t){for(const e of this.tc)if(e.timerId===t)return!0;return!1}Ec(t){return this.Tc().then(()=>{this.tc.sort((e,n)=>e.targetTimeMs-n.targetTimeMs);for(const e of this.tc)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.Tc()})}dc(t){this.oc.push(t)}hc(t){const e=this.tc.indexOf(t);this.tc.splice(e,1)}}function nh(r){let t=r.message||"";return r.stack&&(t=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rh(r){return function(e,n){if(typeof e!="object"||e===null)return!1;const s=e;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1}(r,["next","error","complete"])}class Kt extends qi{constructor(t,e,n,s){super(t,e,n,s),this.type="firestore",this._queue=new eh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new eh(t),this._firestoreClient=void 0,await t}}}function yE(r,t,e){e||(e=Jr);const n=ma(r,"firestore");if(n.isInitialized(e)){const s=n.getImmediate({identifier:e}),i=n.getOptions(e);if(jr(i,t))return s;throw new N(P.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(t.cacheSizeBytes!==void 0&&t.localCache!==void 0)throw new N(P.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(t.cacheSizeBytes!==void 0&&t.cacheSizeBytes!==-1&&t.cacheSizeBytes<af)throw new N(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return t.host&&Jn(t.host)&&da(t.host),n.initialize({options:t,instanceIdentifier:e})}function IE(r,t){const e=typeof r=="object"?r:Ph(),n=typeof r=="string"?r:Jr,s=ma(e,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=mh("firestore");i&&MI(s,...i)}return s}function gn(r){if(r._terminated)throw new N(P.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||FI(r),r._firestoreClient}function FI(r){var n,s,i;const t=r._freezeSettings(),e=function(u,c,h,f){return new u_(u,c,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Uf(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,t);r._componentsProvider||(s=t.localCache)!=null&&s._offlineComponentProvider&&((i=t.localCache)!=null&&i._onlineComponentProvider)&&(r._componentsProvider={_offline:t.localCache._offlineComponentProvider,_online:t.localCache._onlineComponentProvider}),r._firestoreClient=new CI(r._authCredentials,r._appCheckCredentials,r._queue,e,r._componentsProvider&&function(u){const c=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(c),_online:c}}(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LI{constructor(t="count",e){this._internalFieldPath=e,this.type="AggregateField",this.aggregateType=t}}class BI{constructor(t,e,n){this._userDataWriter=e,this._data=n,this.type="AggregateQuerySnapshot",this.query=t}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Bt(mt.fromBase64String(t))}catch(e){throw new N(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new Bt(mt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Bt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(as(t,Bt._jsonSchema))return Bt.fromBase64String(t.bytes)}}Bt._jsonSchemaVersion="firestore/bytes/1.0",Bt._jsonSchema={type:gt("string",Bt._jsonSchemaVersion),bytes:gt("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sr{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new N(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new at(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new N(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new N(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return $(this._lat,t._lat)||$(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:te._jsonSchemaVersion}}static fromJSON(t){if(as(t,te._jsonSchema))return new te(t.latitude,t.longitude)}}te._jsonSchemaVersion="firestore/geoPoint/1.0",te._jsonSchema={type:gt("string",te._jsonSchemaVersion),latitude:gt("number"),longitude:gt("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ee{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0}(this._values,t._values)}toJSON(){return{type:ee._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(as(t,ee._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(e=>typeof e=="number"))return new ee(t.vectorValues);throw new N(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}ee._jsonSchemaVersion="firestore/vectorValue/1.0",ee._jsonSchema={type:gt("string",ee._jsonSchemaVersion),vectorValues:gt("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UI=/^__.*__$/;class qI{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return this.fieldMask!==null?new ce(t,this.data,this.fieldMask,e,this.fieldTransforms):new Zn(t,this.data,e,this.fieldTransforms)}}class jf{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return new ce(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function zf(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw M(40011,{Ac:r})}}class uu{constructor(t,e,n,s,i,o){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.Rc(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(t){return new uu({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(t){var s;const e=(s=this.path)==null?void 0:s.child(t),n=this.Vc({path:e,fc:!1});return n.gc(t),n}yc(t){var s;const e=(s=this.path)==null?void 0:s.child(t),n=this.Vc({path:e,fc:!1});return n.Rc(),n}wc(t){return this.Vc({path:void 0,fc:!0})}Sc(t){return wi(t,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}Rc(){if(this.path)for(let t=0;t<this.path.length;t++)this.gc(this.path.get(t))}gc(t){if(t.length===0)throw this.Sc("Document fields must not be empty");if(zf(this.Ac)&&UI.test(t))throw this.Sc('Document fields cannot begin and end with "__"')}}class jI{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||Fi(t)}Cc(t,e,n,s=!1){return new uu({Ac:t,methodName:e,Dc:n,path:at.emptyPath(),fc:!1,bc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function _s(r){const t=r._freezeSettings(),e=Fi(r._databaseId);return new jI(r._databaseId,!!t.ignoreUndefinedProperties,e)}function cu(r,t,e,n,s,i={}){const o=r.Cc(i.merge||i.mergeFields?2:0,t,e,s);du("Data must be an object, but it was:",o,n);const u=$f(n,o);let c,h;if(i.merge)c=new Mt(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const p of i.mergeFields){const g=ca(t,p,e);if(!o.contains(g))throw new N(P.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);Kf(f,g)||f.push(g)}c=new Mt(f),h=o.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,h=o.fieldTransforms;return new qI(new Rt(u),c,h)}class ji extends au{_toFieldTransform(t){if(t.Ac!==2)throw t.Ac===1?t.Sc(`${this._methodName}() can only appear at the top level of your update data`):t.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof ji}}function lu(r,t,e,n){const s=r.Cc(1,t,e);du("Data must be an object, but it was:",s,n);const i=[],o=Rt.empty();Fe(n,(c,h)=>{const f=fu(t,c,e);h=At(h);const p=s.yc(f);if(h instanceof ji)i.push(f);else{const g=ys(h,p);g!=null&&(i.push(f),o.set(f,g))}});const u=new Mt(i);return new jf(o,u,s.fieldTransforms)}function hu(r,t,e,n,s,i){const o=r.Cc(1,t,e),u=[ca(t,n,e)],c=[s];if(i.length%2!=0)throw new N(P.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)u.push(ca(t,i[g])),c.push(i[g+1]);const h=[],f=Rt.empty();for(let g=u.length-1;g>=0;--g)if(!Kf(h,u[g])){const b=u[g];let D=c[g];D=At(D);const x=o.yc(b);if(D instanceof ji)h.push(b);else{const V=ys(D,x);V!=null&&(h.push(b),f.set(b,V))}}const p=new Mt(h);return new jf(f,p,o.fieldTransforms)}function zI(r,t,e,n=!1){return ys(e,r.Cc(n?4:3,t))}function ys(r,t){if(Gf(r=At(r)))return du("Unsupported field value:",t,r),$f(r,t);if(r instanceof au)return function(n,s){if(!zf(s.Ac))throw s.Sc(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Sc(`${n._methodName}() is not currently supported inside arrays`);const i=n._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(r,t),null;if(r===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),r instanceof Array){if(t.settings.fc&&t.Ac!==4)throw t.Sc("Nested arrays are not supported");return function(n,s){const i=[];let o=0;for(const u of n){let c=ys(u,s.wc(o));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),o++}return{arrayValue:{values:i}}}(r,t)}return function(n,s){if((n=At(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return R_(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const i=Z.fromDate(n);return{timestampValue:Kn(s.serializer,i)}}if(n instanceof Z){const i=new Z(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:Kn(s.serializer,i)}}if(n instanceof te)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof Bt)return{bytesValue:qd(s.serializer,n._byteString)};if(n instanceof ct){const i=s.databaseId,o=n.firestore._databaseId;if(!o.isEqual(i))throw s.Sc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:ka(n.firestore._databaseId||s.databaseId,n._key.path)}}if(n instanceof ee)return function(o,u){return{mapValue:{fields:{[va]:{stringValue:Ra},[Un]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw u.Sc("VectorValues must only contain numeric values.");return Pa(u.serializer,h)})}}}}}}(n,s);throw s.Sc(`Unsupported field value: ${vi(n)}`)}(r,t)}function $f(r,t){const e={};return sd(r)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Fe(r,(n,s)=>{const i=ys(s,t.mc(n));i!=null&&(e[n]=i)}),{mapValue:{fields:e}}}function Gf(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof Z||r instanceof te||r instanceof Bt||r instanceof ct||r instanceof au||r instanceof ee)}function du(r,t,e){if(!Gf(e)||!qh(e)){const n=vi(e);throw n==="an object"?t.Sc(r+" a custom object"):t.Sc(r+" "+n)}}function ca(r,t,e){if((t=At(t))instanceof sr)return t._internalPath;if(typeof t=="string")return fu(r,t);throw wi("Field path arguments must be of type string or ",r,!1,void 0,e)}const $I=new RegExp("[~\\*/\\[\\]]");function fu(r,t,e){if(t.search($I)>=0)throw wi(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,e);try{return new sr(...t.split("."))._internalPath}catch{throw wi(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,e)}}function wi(r,t,e,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let u=`Function ${t}() called with invalid data`;e&&(u+=" (via `toFirestore()`)"),u+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${n}`),o&&(c+=` in document ${s}`),c+=")"),new N(P.INVALID_ARGUMENT,u+r+c)}function Kf(r,t){return r.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai{constructor(t,e,n,s,i){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ct(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new GI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(mu("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class GI extends Ai{data(){return super.data()}}function mu(r,t){return typeof t=="string"?fu(r,t):t instanceof sr?t._internalPath:t._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hf(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new N(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class pu{}class Qf extends pu{}function TE(r,t,...e){let n=[];t instanceof pu&&n.push(t),n=n.concat(e),function(i){const o=i.filter(c=>c instanceof gu).length,u=i.filter(c=>c instanceof zi).length;if(o>1||o>0&&u>0)throw new N(P.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const s of n)r=s._apply(r);return r}class zi extends Qf{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new zi(t,e,n)}_apply(t){const e=this._parse(t);return Wf(t._query,e),new Be(t.firestore,t.converter,Wo(t._query,e))}_parse(t){const e=_s(t.firestore);return function(i,o,u,c,h,f,p){let g;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new N(P.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){ih(p,f);const D=[];for(const x of p)D.push(sh(c,i,x));g={arrayValue:{values:D}}}else g=sh(c,i,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||ih(p,f),g=zI(u,o,p,f==="in"||f==="not-in");return Q.create(h,f,g)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function EE(r,t,e){const n=t,s=mu("where",r);return zi._create(s,n,e)}class gu extends pu{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new gu(t,e)}_parse(t){const e=this._queryConstraints.map(n=>n._parse(t)).filter(n=>n.getFilters().length>0);return e.length===1?e[0]:tt.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(s,i){let o=s;const u=i.getFlattenedFilters();for(const c of u)Wf(o,c),o=Wo(o,c)}(t._query,e),new Be(t.firestore,t.converter,Wo(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class _u extends Qf{constructor(t,e,n){super(),this.type=t,this._limit=e,this._limitType=n}static _create(t,e,n){return new _u(t,e,n)}_apply(t){return new Be(t.firestore,t.converter,di(t._query,this._limit,this._limitType))}}function wE(r){return _u._create("limit",r,"F")}function sh(r,t,e){if(typeof(e=At(e))=="string"){if(e==="")throw new N(P.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!wd(t)&&e.indexOf("/")!==-1)throw new N(P.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const n=t.path.child(Y.fromString(e));if(!O.isDocumentKey(n))throw new N(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Zr(r,new O(n))}if(e instanceof ct)return Zr(r,e._key);throw new N(P.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${vi(e)}.`)}function ih(r,t){if(!Array.isArray(r)||r.length===0)throw new N(P.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Wf(r,t){const e=function(s,i){for(const o of s)for(const u of o.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(r.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new N(P.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new N(P.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}class Xf{convertValue(t,e="none"){switch(De(t)){case 0:return null;case 1:return t.booleanValue;case 2:return it(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(ae(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw M(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return Fe(t,(s,i)=>{n[s]=this.convertValue(i,e)}),n}convertVectorValue(t){var n,s,i;const e=(i=(s=(n=t.fields)==null?void 0:n[Un].arrayValue)==null?void 0:s.values)==null?void 0:i.map(o=>it(o.doubleValue));return new ee(e)}convertGeoPoint(t){return new te(it(t.latitude),it(t.longitude))}convertArray(t,e){return(t.values||[]).map(n=>this.convertValue(n,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=Vi(t);return n==null?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(Xr(t));default:return null}}convertTimestamp(t){const e=oe(t);return new Z(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=Y.fromString(t);L(Xd(n),9688,{name:t});const s=new an(n.get(1),n.get(3)),i=new O(n.popFirst(5));return s.isEqual(e)||ft(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yu(r,t,e){let n;return n=r?e&&(e.merge||e.mergeFields)?r.toFirestore(t,e):r.toFirestore(t):t,n}class KI extends Xf{constructor(t){super(),this.firestore=t}convertBytes(t){return new Bt(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new ct(this.firestore,null,e)}}function HI(){return new LI("count")}class Cn{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Ce extends Ai{constructor(t,e,n,s,i,o){super(t,e,n,s,o),this._firestore=t,this._firestoreImpl=t,this.metadata=i}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new ei(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(mu("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new N(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=Ce._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?e:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e)}}Ce._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ce._jsonSchema={type:gt("string",Ce._jsonSchemaVersion),bundleSource:gt("string","DocumentSnapshot"),bundleName:gt("string"),bundle:gt("string")};class ei extends Ce{data(t={}){return super.data(t)}}class rn{constructor(t,e,n,s){this._firestore=t,this._userDataWriter=e,this._snapshot=s,this.metadata=new Cn(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new ei(this._firestore,this._userDataWriter,n.key,n,new Cn(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new N(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(u=>{const c=new ei(s._firestore,s._userDataWriter,u.doc.key,u.doc,new Cn(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{const c=new ei(s._firestore,s._userDataWriter,u.doc.key,u.doc,new Cn(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return u.type!==0&&(h=o.indexOf(u.doc.key),o=o.delete(u.doc.key)),u.type!==1&&(o=o.add(u.doc),f=o.indexOf(u.doc.key)),{type:QI(u.type),doc:c,oldIndex:h,newIndex:f}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new N(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=rn._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=ga.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],n=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(e.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function QI(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return M(61501,{type:r})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AE(r){r=Vt(r,ct);const t=Vt(r.firestore,Kt);return NI(gn(t),r._key).then(e=>Jf(t,r,e))}rn._jsonSchemaVersion="firestore/querySnapshot/1.0",rn._jsonSchema={type:gt("string",rn._jsonSchemaVersion),bundleSource:gt("string","QuerySnapshot"),bundleName:gt("string"),bundle:gt("string")};class Is extends Xf{constructor(t){super(),this.firestore=t}convertBytes(t){return new Bt(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new ct(this.firestore,null,e)}}function vE(r){r=Vt(r,Be);const t=Vt(r.firestore,Kt),e=gn(t),n=new Is(t);return Hf(r._query),kI(e,r._query).then(s=>new rn(t,n,r,s))}function RE(r,t,e){r=Vt(r,ct);const n=Vt(r.firestore,Kt),s=yu(r.converter,t,e);return $i(n,[cu(_s(n),"setDoc",r._key,s,r.converter!==null,e).toMutation(r._key,ut.none())])}function bE(r,t,e,...n){r=Vt(r,ct);const s=Vt(r.firestore,Kt),i=_s(s);let o;return o=typeof(t=At(t))=="string"||t instanceof sr?hu(i,"updateDoc",r._key,t,e,n):lu(i,"updateDoc",r._key,t),$i(s,[o.toMutation(r._key,ut.exists(!0))])}function SE(r){return $i(Vt(r.firestore,Kt),[new tr(r._key,ut.none())])}function PE(r,...t){var c,h,f;r=At(r);let e={includeMetadataChanges:!1,source:"default"},n=0;typeof t[n]!="object"||rh(t[n])||(e=t[n++]);const s={includeMetadataChanges:e.includeMetadataChanges,source:e.source};if(rh(t[n])){const p=t[n];t[n]=(c=p.next)==null?void 0:c.bind(p),t[n+1]=(h=p.error)==null?void 0:h.bind(p),t[n+2]=(f=p.complete)==null?void 0:f.bind(p)}let i,o,u;if(r instanceof ct)o=Vt(r.firestore,Kt),u=ds(r._key.path),i={next:p=>{t[n]&&t[n](Jf(o,r,p))},error:t[n+1],complete:t[n+2]};else{const p=Vt(r,Be);o=Vt(p.firestore,Kt),u=p._query;const g=new Is(o);i={next:b=>{t[n]&&t[n](new rn(o,g,p,b))},error:t[n+1],complete:t[n+2]},Hf(r._query)}return function(g,b,D,x){const V=new iu(x),j=new Za(b,V,D);return g.asyncQueue.enqueueAndForget(async()=>Xa(await Ei(g),j)),()=>{V.Nu(),g.asyncQueue.enqueueAndForget(async()=>Ja(await Ei(g),j))}}(gn(o),u,s,i)}function $i(r,t){return function(n,s){const i=new $t;return n.asyncQueue.enqueueAndForget(async()=>dI(await xI(n),s,i)),i.promise}(gn(r),t)}function Jf(r,t,e){const n=e.docs.get(t._key),s=new Is(r);return new Ce(r,s,t._key,n,new Cn(e.hasPendingWrites,e.fromCache),t.converter)}function VE(r){return WI(r,{count:HI()})}function WI(r,t){const e=Vt(r.firestore,Kt),n=gn(e),s=o_(t,(i,o)=>new N_(o,i.aggregateType,i._internalFieldPath));return OI(n,r._query,s).then(i=>function(u,c,h){const f=new Is(u);return new BI(c,f,h)}(e,r,i))}class XI{constructor(t){let e;this.kind="persistent",t!=null&&t.tabManager?(t.tabManager._initialize(t),e=t.tabManager):(e=ZI(void 0),e._initialize(t)),this._onlineComponentProvider=e._onlineComponentProvider,this._offlineComponentProvider=e._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function CE(r){return new XI(r)}class JI{constructor(t){this.forceOwnership=t,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(t){this._onlineComponentProvider=os.provider,this._offlineComponentProvider={build:e=>new Lf(e,t==null?void 0:t.cacheSizeBytes,this.forceOwnership)}}}class YI{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(t){this._onlineComponentProvider=os.provider,this._offlineComponentProvider={build:e=>new SI(e,t==null?void 0:t.cacheSizeBytes)}}}function ZI(r){return new JI(r==null?void 0:r.forceOwnership)}function DE(){return new YI}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tT={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eT{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=_s(t)}set(t,e,n){this._verifyNotCommitted();const s=Ae(t,this._firestore),i=yu(s.converter,e,n),o=cu(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(o.toMutation(s._key,ut.none())),this}update(t,e,n,...s){this._verifyNotCommitted();const i=Ae(t,this._firestore);let o;return o=typeof(e=At(e))=="string"||e instanceof sr?hu(this._dataReader,"WriteBatch.update",i._key,e,n,s):lu(this._dataReader,"WriteBatch.update",i._key,e),this._mutations.push(o.toMutation(i._key,ut.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=Ae(t,this._firestore);return this._mutations=this._mutations.concat(new tr(e._key,ut.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new N(P.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Ae(r,t){if((r=At(r)).firestore!==t)throw new N(P.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nT{constructor(t,e){this._firestore=t,this._transaction=e,this._dataReader=_s(t)}get(t){const e=Ae(t,this._firestore),n=new KI(this._firestore);return this._transaction.lookup([e._key]).then(s=>{if(!s||s.length!==1)return M(24041);const i=s[0];if(i.isFoundDocument())return new Ai(this._firestore,n,i.key,i,e.converter);if(i.isNoDocument())return new Ai(this._firestore,n,e._key,null,e.converter);throw M(18433,{doc:i})})}set(t,e,n){const s=Ae(t,this._firestore),i=yu(s.converter,e,n),o=cu(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,o),this}update(t,e,n,...s){const i=Ae(t,this._firestore);let o;return o=typeof(e=At(e))=="string"||e instanceof sr?hu(this._dataReader,"Transaction.update",i._key,e,n,s):lu(this._dataReader,"Transaction.update",i._key,e),this._transaction.update(i._key,o),this}delete(t){const e=Ae(t,this._firestore);return this._transaction.delete(e._key),this}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rT extends nT{constructor(t,e){super(t,e),this._firestore=t}get(t){const e=Ae(t,this._firestore),n=new Is(this._firestore);return super.get(t).then(s=>new Ce(this._firestore,n,e._key,s._document,new Cn(!1,!1),e.converter))}}function xE(r,t,e){r=Vt(r,Kt);const n={...tT,...e};return function(i){if(i.maxAttempts<1)throw new N(P.INVALID_ARGUMENT,"Max attempts must be at least 1")}(n),function(i,o,u){const c=new $t;return i.asyncQueue.enqueueAndForget(async()=>{const h=await Bf(i);new VI(i.asyncQueue,h,u,o,c).ju()}),c.promise}(gn(r),s=>t(new rT(r,s)),n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NE(r){return gn(r=Vt(r,Kt)),new eT(r,t=>$i(r,t))}(function(t,e=!0){(function(s){Yn=s})(Sh),zr(new xn("firestore",(n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),u=new Kt(new Eg(n.getProvider("auth-internal")),new vg(o,n.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new N(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new an(h.options.projectId,f)}(o,s),o);return i={useFetchStreams:e,...i},u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),be(Lc,Bc,t),be(Lc,Bc,"esm2020")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yf="firebasestorage.googleapis.com",Zf="storageBucket",sT=2*60*1e3,iT=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt extends mn{constructor(t,e,n=0){super(Co(t),`Firebase Storage: ${e} (${Co(t)})`),this.status_=n,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,dt.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return Co(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var ht;(function(r){r.UNKNOWN="unknown",r.OBJECT_NOT_FOUND="object-not-found",r.BUCKET_NOT_FOUND="bucket-not-found",r.PROJECT_NOT_FOUND="project-not-found",r.QUOTA_EXCEEDED="quota-exceeded",r.UNAUTHENTICATED="unauthenticated",r.UNAUTHORIZED="unauthorized",r.UNAUTHORIZED_APP="unauthorized-app",r.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",r.INVALID_CHECKSUM="invalid-checksum",r.CANCELED="canceled",r.INVALID_EVENT_NAME="invalid-event-name",r.INVALID_URL="invalid-url",r.INVALID_DEFAULT_BUCKET="invalid-default-bucket",r.NO_DEFAULT_BUCKET="no-default-bucket",r.CANNOT_SLICE_BLOB="cannot-slice-blob",r.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",r.NO_DOWNLOAD_URL="no-download-url",r.INVALID_ARGUMENT="invalid-argument",r.INVALID_ARGUMENT_COUNT="invalid-argument-count",r.APP_DELETED="app-deleted",r.INVALID_ROOT_OPERATION="invalid-root-operation",r.INVALID_FORMAT="invalid-format",r.INTERNAL_ERROR="internal-error",r.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(ht||(ht={}));function Co(r){return"storage/"+r}function Iu(){const r="An unknown error occurred, please check the error payload for server response.";return new dt(ht.UNKNOWN,r)}function oT(r){return new dt(ht.OBJECT_NOT_FOUND,"Object '"+r+"' does not exist.")}function aT(r){return new dt(ht.QUOTA_EXCEEDED,"Quota for bucket '"+r+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function uT(){const r="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new dt(ht.UNAUTHENTICATED,r)}function cT(){return new dt(ht.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function lT(r){return new dt(ht.UNAUTHORIZED,"User does not have permission to access '"+r+"'.")}function hT(){return new dt(ht.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function dT(){return new dt(ht.CANCELED,"User canceled the upload/download.")}function fT(r){return new dt(ht.INVALID_URL,"Invalid URL '"+r+"'.")}function mT(r){return new dt(ht.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+r+"'.")}function pT(){return new dt(ht.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Zf+"' property when initializing the app?")}function gT(){return new dt(ht.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function _T(){return new dt(ht.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function yT(r){return new dt(ht.UNSUPPORTED_ENVIRONMENT,`${r} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function la(r){return new dt(ht.INVALID_ARGUMENT,r)}function tm(){return new dt(ht.APP_DELETED,"The Firebase app was deleted.")}function IT(r){return new dt(ht.INVALID_ROOT_OPERATION,"The operation '"+r+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function qr(r,t){return new dt(ht.INVALID_FORMAT,"String does not match format '"+r+"': "+t)}function br(r){throw new dt(ht.INTERNAL_ERROR,"Internal error: "+r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(t,e){this.bucket=t,this.path_=e}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,e){let n;try{n=qt.makeFromUrl(t,e)}catch{return new qt(t,"")}if(n.path==="")return n;throw mT(t)}static makeFromUrl(t,e){let n=null;const s="([A-Za-z0-9.\\-_]+)";function i(z){z.path.charAt(z.path.length-1)==="/"&&(z.path_=z.path_.slice(0,-1))}const o="(/(.*))?$",u=new RegExp("^gs://"+s+o,"i"),c={bucket:1,path:3};function h(z){z.path_=decodeURIComponent(z.path)}const f="v[A-Za-z0-9_]+",p=e.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",b=new RegExp(`^https?://${p}/${f}/b/${s}/o${g}`,"i"),D={bucket:1,path:3},x=e===Yf?"(?:storage.googleapis.com|storage.cloud.google.com)":e,V="([^?#]*)",j=new RegExp(`^https?://${x}/${s}/${V}`,"i"),B=[{regex:u,indices:c,postModify:i},{regex:b,indices:D,postModify:h},{regex:j,indices:{bucket:1,path:2},postModify:h}];for(let z=0;z<B.length;z++){const W=B[z],K=W.regex.exec(t);if(K){const T=K[W.indices.bucket];let _=K[W.indices.path];_||(_=""),n=new qt(T,_),W.postModify(n);break}}if(n==null)throw fT(t);return n}}class TT{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ET(r,t,e){let n=1,s=null,i=null,o=!1,u=0;function c(){return u===2}let h=!1;function f(...V){h||(h=!0,t.apply(null,V))}function p(V){s=setTimeout(()=>{s=null,r(b,c())},V)}function g(){i&&clearTimeout(i)}function b(V,...j){if(h){g();return}if(V){g(),f.call(null,V,...j);return}if(c()||o){g(),f.call(null,V,...j);return}n<64&&(n*=2);let B;u===1?(u=2,B=0):B=(n+Math.random())*1e3,p(B)}let D=!1;function x(V){D||(D=!0,g(),!h&&(s!==null?(V||(u=2),clearTimeout(s),p(0)):V||(u=1)))}return p(0),i=setTimeout(()=>{o=!0,x(!0)},e),x}function wT(r){r(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AT(r){return r!==void 0}function vT(r){return typeof r=="object"&&!Array.isArray(r)}function Tu(r){return typeof r=="string"||r instanceof String}function oh(r){return Eu()&&r instanceof Blob}function Eu(){return typeof Blob<"u"}function ah(r,t,e,n){if(n<t)throw la(`Invalid value for '${r}'. Expected ${t} or greater.`);if(n>e)throw la(`Invalid value for '${r}'. Expected ${e} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gi(r,t,e){let n=t;return e==null&&(n=`https://${t}`),`${e}://${n}/v0${r}`}function em(r){const t=encodeURIComponent;let e="?";for(const n in r)if(r.hasOwnProperty(n)){const s=t(n)+"="+t(r[n]);e=e+s+"&"}return e=e.slice(0,-1),e}var sn;(function(r){r[r.NO_ERROR=0]="NO_ERROR",r[r.NETWORK_ERROR=1]="NETWORK_ERROR",r[r.ABORT=2]="ABORT"})(sn||(sn={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function RT(r,t){const e=r>=500&&r<600,s=[408,429].indexOf(r)!==-1,i=t.indexOf(r)!==-1;return e||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bT{constructor(t,e,n,s,i,o,u,c,h,f,p,g=!0,b=!1){this.url_=t,this.method_=e,this.headers_=n,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=u,this.errorCallback_=c,this.timeout_=h,this.progressCallback_=f,this.connectionFactory_=p,this.retry=g,this.isUsingEmulator=b,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((D,x)=>{this.resolve_=D,this.reject_=x,this.start_()})}start_(){const t=(n,s)=>{if(s){n(!1,new js(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=u=>{const c=u.loaded,h=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,h)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const u=i.getErrorCode()===sn.NO_ERROR,c=i.getStatus();if(!u||RT(c,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===sn.ABORT;n(!1,new js(!1,null,f));return}const h=this.successCodes_.indexOf(c)!==-1;n(!0,new js(h,i))})},e=(n,s)=>{const i=this.resolve_,o=this.reject_,u=s.connection;if(s.wasSuccessCode)try{const c=this.callback_(u,u.getResponse());AT(c)?i(c):i()}catch(c){o(c)}else if(u!==null){const c=Iu();c.serverResponse=u.getErrorText(),this.errorCallback_?o(this.errorCallback_(u,c)):o(c)}else if(s.canceled){const c=this.appDelete_?tm():dT();o(c)}else{const c=hT();o(c)}};this.canceled_?e(!1,new js(!1,null,!0)):this.backoffId_=ET(t,e,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&wT(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class js{constructor(t,e,n){this.wasSuccessCode=t,this.connection=e,this.canceled=!!n}}function ST(r,t){t!==null&&t.length>0&&(r.Authorization="Firebase "+t)}function PT(r,t){r["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function VT(r,t){t&&(r["X-Firebase-GMPID"]=t)}function CT(r,t){t!==null&&(r["X-Firebase-AppCheck"]=t)}function DT(r,t,e,n,s,i,o=!0,u=!1){const c=em(r.urlParams),h=r.url+c,f=Object.assign({},r.headers);return VT(f,t),ST(f,e),PT(f,i),CT(f,n),new bT(h,r.method,f,r.body,r.successCodes,r.additionalRetryCodes,r.handler,r.errorHandler,r.timeout,r.progressCallback,s,o,u)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xT(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function NT(...r){const t=xT();if(t!==void 0){const e=new t;for(let n=0;n<r.length;n++)e.append(r[n]);return e.getBlob()}else{if(Eu())return new Blob(r);throw new dt(ht.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function kT(r,t,e){return r.webkitSlice?r.webkitSlice(t,e):r.mozSlice?r.mozSlice(t,e):r.slice?r.slice(t,e):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OT(r){if(typeof atob>"u")throw yT("base-64");return atob(r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Do{constructor(t,e){this.data=t,this.contentType=e||null}}function MT(r,t){switch(r){case Zt.RAW:return new Do(nm(t));case Zt.BASE64:case Zt.BASE64URL:return new Do(rm(r,t));case Zt.DATA_URL:return new Do(LT(t),BT(t))}throw Iu()}function nm(r){const t=[];for(let e=0;e<r.length;e++){let n=r.charCodeAt(e);if(n<=127)t.push(n);else if(n<=2047)t.push(192|n>>6,128|n&63);else if((n&64512)===55296)if(!(e<r.length-1&&(r.charCodeAt(e+1)&64512)===56320))t.push(239,191,189);else{const i=n,o=r.charCodeAt(++e);n=65536|(i&1023)<<10|o&1023,t.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|n&63)}else(n&64512)===56320?t.push(239,191,189):t.push(224|n>>12,128|n>>6&63,128|n&63)}return new Uint8Array(t)}function FT(r){let t;try{t=decodeURIComponent(r)}catch{throw qr(Zt.DATA_URL,"Malformed data URL.")}return nm(t)}function rm(r,t){switch(r){case Zt.BASE64:{const s=t.indexOf("-")!==-1,i=t.indexOf("_")!==-1;if(s||i)throw qr(r,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case Zt.BASE64URL:{const s=t.indexOf("+")!==-1,i=t.indexOf("/")!==-1;if(s||i)throw qr(r,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let e;try{e=OT(t)}catch(s){throw s.message.includes("polyfill")?s:qr(r,"Invalid character found")}const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}class sm{constructor(t){this.base64=!1,this.contentType=null;const e=t.match(/^data:([^,]+)?,/);if(e===null)throw qr(Zt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const n=e[1]||null;n!=null&&(this.base64=UT(n,";base64"),this.contentType=this.base64?n.substring(0,n.length-7):n),this.rest=t.substring(t.indexOf(",")+1)}}function LT(r){const t=new sm(r);return t.base64?rm(Zt.BASE64,t.rest):FT(t.rest)}function BT(r){return new sm(r).contentType}function UT(r,t){return r.length>=t.length?r.substring(r.length-t.length)===t:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(t,e){let n=0,s="";oh(t)?(this.data_=t,n=t.size,s=t.type):t instanceof ArrayBuffer?(e?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),n=this.data_.length):t instanceof Uint8Array&&(e?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),n=t.length),this.size_=n,this.type_=s}size(){return this.size_}type(){return this.type_}slice(t,e){if(oh(this.data_)){const n=this.data_,s=kT(n,t,e);return s===null?null:new Ee(s)}else{const n=new Uint8Array(this.data_.buffer,t,e-t);return new Ee(n,!0)}}static getBlob(...t){if(Eu()){const e=t.map(n=>n instanceof Ee?n.data_:n);return new Ee(NT.apply(null,e))}else{const e=t.map(o=>Tu(o)?MT(Zt.RAW,o).data:o.data_);let n=0;e.forEach(o=>{n+=o.byteLength});const s=new Uint8Array(n);let i=0;return e.forEach(o=>{for(let u=0;u<o.length;u++)s[i++]=o[u]}),new Ee(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function im(r){let t;try{t=JSON.parse(r)}catch{return null}return vT(t)?t:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qT(r){if(r.length===0)return null;const t=r.lastIndexOf("/");return t===-1?"":r.slice(0,t)}function jT(r,t){const e=t.split("/").filter(n=>n.length>0).join("/");return r.length===0?e:r+"/"+e}function om(r){const t=r.lastIndexOf("/",r.length-2);return t===-1?r:r.slice(t+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zT(r,t){return t}class Nt{constructor(t,e,n,s){this.server=t,this.local=e||t,this.writable=!!n,this.xform=s||zT}}let zs=null;function $T(r){return!Tu(r)||r.length<2?r:om(r)}function am(){if(zs)return zs;const r=[];r.push(new Nt("bucket")),r.push(new Nt("generation")),r.push(new Nt("metageneration")),r.push(new Nt("name","fullPath",!0));function t(i,o){return $T(o)}const e=new Nt("name");e.xform=t,r.push(e);function n(i,o){return o!==void 0?Number(o):o}const s=new Nt("size");return s.xform=n,r.push(s),r.push(new Nt("timeCreated")),r.push(new Nt("updated")),r.push(new Nt("md5Hash",null,!0)),r.push(new Nt("cacheControl",null,!0)),r.push(new Nt("contentDisposition",null,!0)),r.push(new Nt("contentEncoding",null,!0)),r.push(new Nt("contentLanguage",null,!0)),r.push(new Nt("contentType",null,!0)),r.push(new Nt("metadata","customMetadata",!0)),zs=r,zs}function GT(r,t){function e(){const n=r.bucket,s=r.fullPath,i=new qt(n,s);return t._makeStorageReference(i)}Object.defineProperty(r,"ref",{get:e})}function KT(r,t,e){const n={};n.type="file";const s=e.length;for(let i=0;i<s;i++){const o=e[i];n[o.local]=o.xform(n,t[o.server])}return GT(n,r),n}function um(r,t,e){const n=im(t);return n===null?null:KT(r,n,e)}function HT(r,t,e,n){const s=im(t);if(s===null||!Tu(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(h=>{const f=r.bucket,p=r.fullPath,g="/b/"+o(f)+"/o/"+o(p),b=Gi(g,e,n),D=em({alt:"media",token:h});return b+D})[0]}function QT(r,t){const e={},n=t.length;for(let s=0;s<n;s++){const i=t[s];i.writable&&(e[i.server]=r[i.local])}return JSON.stringify(e)}class wu{constructor(t,e,n,s){this.url=t,this.method=e,this.handler=n,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cm(r){if(!r)throw Iu()}function WT(r,t){function e(n,s){const i=um(r,s,t);return cm(i!==null),i}return e}function XT(r,t){function e(n,s){const i=um(r,s,t);return cm(i!==null),HT(i,s,r.host,r._protocol)}return e}function lm(r){function t(e,n){let s;return e.getStatus()===401?e.getErrorText().includes("Firebase App Check token is invalid")?s=cT():s=uT():e.getStatus()===402?s=aT(r.bucket):e.getStatus()===403?s=lT(r.path):s=n,s.status=e.getStatus(),s.serverResponse=n.serverResponse,s}return t}function hm(r){const t=lm(r);function e(n,s){let i=t(n,s);return n.getStatus()===404&&(i=oT(r.path)),i.serverResponse=s.serverResponse,i}return e}function JT(r,t,e){const n=t.fullServerUrl(),s=Gi(n,r.host,r._protocol),i="GET",o=r.maxOperationRetryTime,u=new wu(s,i,XT(r,e),o);return u.errorHandler=hm(t),u}function YT(r,t){const e=t.fullServerUrl(),n=Gi(e,r.host,r._protocol),s="DELETE",i=r.maxOperationRetryTime;function o(c,h){}const u=new wu(n,s,o,i);return u.successCodes=[200,204],u.errorHandler=hm(t),u}function ZT(r,t){return r&&r.contentType||t&&t.type()||"application/octet-stream"}function tE(r,t,e){const n=Object.assign({},e);return n.fullPath=r.path,n.size=t.size(),n.contentType||(n.contentType=ZT(null,t)),n}function eE(r,t,e,n,s){const i=t.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function u(){let B="";for(let z=0;z<2;z++)B=B+Math.random().toString().slice(2);return B}const c=u();o["Content-Type"]="multipart/related; boundary="+c;const h=tE(t,n,s),f=QT(h,e),p="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+c+`\r
Content-Type: `+h.contentType+`\r
\r
`,g=`\r
--`+c+"--",b=Ee.getBlob(p,n,g);if(b===null)throw gT();const D={name:h.fullPath},x=Gi(i,r.host,r._protocol),V="POST",j=r.maxUploadRetryTime,q=new wu(x,V,WT(r,e),j);return q.urlParams=D,q.headers=o,q.body=b.uploadData(),q.errorHandler=lm(t),q}class nE{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=sn.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=sn.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=sn.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,e,n,s,i){if(this.sent_)throw br("cannot .send() more than once");if(Jn(t)&&n&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(e,t,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw br("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw br("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw br("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw br("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class rE extends nE{initXhr(){this.xhr_.responseType="text"}}function Au(){return new rE}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(t,e){this._service=t,e instanceof qt?this._location=e:this._location=qt.makeFromUrl(e,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,e){return new fn(t,e)}get root(){const t=new qt(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return om(this._location.path)}get storage(){return this._service}get parent(){const t=qT(this._location.path);if(t===null)return null;const e=new qt(this._location.bucket,t);return new fn(this._service,e)}_throwIfRoot(t){if(this._location.path==="")throw IT(t)}}function sE(r,t,e){r._throwIfRoot("uploadBytes");const n=eE(r.storage,r._location,am(),new Ee(t,!0),e);return r.storage.makeRequestWithTokens(n,Au).then(s=>({metadata:s,ref:r}))}function iE(r){r._throwIfRoot("getDownloadURL");const t=JT(r.storage,r._location,am());return r.storage.makeRequestWithTokens(t,Au).then(e=>{if(e===null)throw _T();return e})}function oE(r){r._throwIfRoot("deleteObject");const t=YT(r.storage,r._location);return r.storage.makeRequestWithTokens(t,Au)}function aE(r,t){const e=jT(r._location.path,t),n=new qt(r._location.bucket,e);return new fn(r.storage,n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uE(r){return/^[A-Za-z]+:\/\//.test(r)}function cE(r,t){return new fn(r,t)}function dm(r,t){if(r instanceof vu){const e=r;if(e._bucket==null)throw pT();const n=new fn(e,e._bucket);return t!=null?dm(n,t):n}else return t!==void 0?aE(r,t):r}function lE(r,t){if(t&&uE(t)){if(r instanceof vu)return cE(r,t);throw la("To use ref(service, url), the first argument must be a Storage instance.")}else return dm(r,t)}function uh(r,t){const e=t==null?void 0:t[Zf];return e==null?null:qt.makeFromBucketSpec(e,r)}function hE(r,t,e,n={}){r.host=`${t}:${e}`;const s=Jn(t);s&&(da(`https://${r.host}/b`),_h("Storage",!0)),r._isUsingEmulator=!0,r._protocol=s?"https":"http";const{mockUserToken:i}=n;i&&(r._overrideAuthToken=typeof i=="string"?i:gh(i,r.app.options.projectId))}class vu{constructor(t,e,n,s,i,o=!1){this.app=t,this._authProvider=e,this._appCheckProvider=n,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=Yf,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=sT,this._maxUploadRetryTime=iT,this._requests=new Set,s!=null?this._bucket=qt.makeFromBucketSpec(s,this._host):this._bucket=uh(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=qt.makeFromBucketSpec(this._url,t):this._bucket=uh(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){ah("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){ah("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const e=await t.getToken();if(e!==null)return e.accessToken}return null}async _getAppCheckToken(){if(bh(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new fn(this,t)}_makeRequest(t,e,n,s,i=!0){if(this._deleted)return new TT(tm());{const o=DT(t,this._appId,n,s,e,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(t,e){const[n,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,e,n,s).getPromise()}}const ch="@firebase/storage",lh="0.14.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fm="storage";function kE(r,t,e){return r=At(r),sE(r,t,e)}function OE(r){return r=At(r),iE(r)}function ME(r){return r=At(r),oE(r)}function FE(r,t){return r=At(r),lE(r,t)}function LE(r=Ph(),t){r=At(r);const n=ma(r,fm).getImmediate({identifier:t}),s=mh("storage");return s&&dE(n,...s),n}function dE(r,t,e,n={}){hE(r,t,e,n)}function fE(r,{instanceIdentifier:t}){const e=r.getProvider("app").getImmediate(),n=r.getProvider("auth-internal"),s=r.getProvider("app-check-internal");return new vu(e,n,s,t,Sh)}function mE(){zr(new xn(fm,fE,"PUBLIC").setMultipleInstances(!0)),be(ch,lh,""),be(ch,lh,"esm2020")}mE();export{FE as A,kE as B,xn as C,OE as D,ME as E,mn as F,TE as G,EE as H,Se as I,vE as J,xE as K,Ah as L,wE as M,VE as N,Sh as S,zr as _,bh as a,J as b,Ph as c,ma as d,mh as e,jr as f,At as g,gh as h,Jn as i,og as j,yE as k,CE as l,DE as m,IE as n,LE as o,da as p,_E as q,be as r,AE as s,gE as t,_h as u,PE as v,RE as w,bE as x,SE as y,NE as z};
