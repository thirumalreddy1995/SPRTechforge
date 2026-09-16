import{L as Ln,_ as Mn,C as Un,r as wt,a as $n,F as jn,b as He,g as x,c as zn,d as Bn,e as Qn,i as Gt,p as Gn,u as Kn,f as Jn,h as Wn,I as Hn,S as Yn}from"./vendor-firebase-DNXZDMoq.js";const Et="4.9.2";/**
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
 */class v{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}v.UNAUTHENTICATED=new v(null),v.GOOGLE_CREDENTIALS=new v("google-credentials-uid"),v.FIRST_PARTY=new v("first-party-uid"),v.MOCK_USER=new v("mock-user");/**
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
 */let Z="12.3.0";/**
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
 */const X=new Ln("@firebase/firestore");function B(n,...e){if(X.logLevel<=He.DEBUG){const t=e.map(Ye);X.debug(`Firestore (${Z}): ${n}`,...t)}}function be(n,...e){if(X.logLevel<=He.ERROR){const t=e.map(Ye);X.error(`Firestore (${Z}): ${n}`,...t)}}function Kt(n,...e){if(X.logLevel<=He.WARN){const t=e.map(Ye);X.warn(`Firestore (${Z}): ${n}`,...t)}}function Ye(n){if(typeof n=="string")return n;try{/**
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
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
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
 */function _(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Jt(n,r,t)}function Jt(n,e,t){let r=`FIRESTORE (${Z}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw be(r),new Error(r)}function F(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Jt(e,s,r)}function he(n,e){return n}/**
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
 */const $e="ok",Xe="cancelled",Y="unknown",d="invalid-argument",Wt="deadline-exceeded",Ht="not-found",Xn="already-exists",Yt="permission-denied",we="unauthenticated",Xt="resource-exhausted",j="failed-precondition",Ze="aborted",Zt="out-of-range",et="unimplemented",en="internal",tn="unavailable",Zn="data-loss";class h extends jn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class tt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
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
 */class nn{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class er{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(v.UNAUTHENTICATED))}shutdown(){}}class tr{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class nr{constructor(e){this.auth=null,e.onInit(t=>{this.auth=t})}getToken(){return this.auth?this.auth.getToken().then(e=>e?(F(typeof e.accessToken=="string",42297,{t:e}),new nn(e.accessToken,new v(this.auth.getUid()))):null):Promise.resolve(null)}invalidateToken(){}start(e,t){}shutdown(){}}class rr{constructor(e,t,r){this.i=e,this.o=t,this.u=r,this.type="FirstParty",this.user=v.FIRST_PARTY,this.l=new Map}h(){return this.u?this.u():null}get headers(){this.l.set("X-Goog-AuthUser",this.i);const e=this.h();return e&&this.l.set("Authorization",e),this.o&&this.l.set("X-Goog-Iam-Authorization-Token",this.o),this.l}}class sr{constructor(e,t,r){this.i=e,this.o=t,this.u=r}getToken(){return Promise.resolve(new rr(this.i,this.o,this.u))}start(e,t){e.enqueueRetryable(()=>t(v.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Vt{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ir{constructor(e,t){this.m=t,this.appCheck=null,this.T=null,$n(e)&&e.settings.appCheckToken&&(this.T=e.settings.appCheckToken),t.onInit(r=>{this.appCheck=r})}getToken(){return this.T?Promise.resolve(new Vt(this.T)):this.appCheck?this.appCheck.getToken().then(e=>e?(F(typeof e.token=="string",3470,{tokenResult:e}),new Vt(e.token)):null):Promise.resolve(null)}invalidateToken(){}start(e,t){}shutdown(){}}/**
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
 */class or{constructor(e,t,r,s,i,o,a,u,l,c){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=u,this.useFetchStreams=l,this.isUsingEmulator=c}}const je="(default)";class oe{constructor(e,t){this.projectId=e,this.database=t||je}static empty(){return new oe("","")}get isDefaultDatabase(){return this.database===je}isEqual(e){return e instanceof oe&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */function ar(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class ur{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=ar(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function T(n,e){return n<e?-1:n>e?1:0}function ze(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return qe(s)===qe(i)?T(s,i):qe(s)?1:-1}return T(n.length,e.length)}const lr=55296,cr=57343;function qe(n){const e=n.charCodeAt(0);return e>=lr&&e<=cr}function rn(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
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
 */const It="__name__";class C{constructor(e,t,r){t===void 0?t=0:t>e.length&&_(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&_(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return C.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof C?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=C.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return T(e.length,t.length)}static compareSegments(e,t){const r=C.isNumericId(e),s=C.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?C.extractNumericId(e).compare(C.extractNumericId(t)):ze(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Hn.fromString(e.substring(4,e.length-2))}}class g extends C{construct(e,t,r){return new g(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new h(d,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new g(t)}static emptyPath(){return new g([])}}const hr=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class P extends C{construct(e,t,r){return new P(e,t,r)}static isValidIdentifier(e){return hr.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),P.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===It}static keyField(){return new P([It])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new h(d,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const a=e[s];if(a==="\\"){if(s+1===e.length)throw new h(d,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new h(d,"Path has invalid escape sequence: "+e);r+=u,s+=2}else a==="`"?(o=!o,s++):a!=="."||o?(r+=a,s++):(i(),s++)}if(i(),o)throw new h(d,"Unterminated ` in path: "+e);return new P(t)}static emptyPath(){return new P([])}}/**
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
 */class I{constructor(e){this.path=e}static fromPath(e){return new I(g.fromString(e))}static fromName(e){return new I(g.fromString(e).popFirst(5))}static empty(){return new I(g.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&g.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return g.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new I(new g(e.slice()))}}/**
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
 */function sn(n,e,t){if(!t)throw new h(d,`Function ${n}() cannot be called with an empty ${e}.`)}function At(n){if(!I.isDocumentKey(n))throw new h(d,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function vt(n){if(I.isDocumentKey(n))throw new h(d,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function on(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function ke(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":_(12329,{type:typeof n})}function ee(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new h(d,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ke(n);throw new h(d,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */function an(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */let ge=null;function dr(){return ge===null?ge=function(){return 268435456+Math.round(2147483648*Math.random())}():ge++,"0x"+ge.toString(16)}/**
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
 */function un(n){return n==null}function Ee(n){return n===0&&1/n==-1/0}/**
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
 */const Le="RestConnection",fr={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class mr{get P(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.A=t+"://"+e.host,this.R=`projects/${r}/databases/${s}`,this.V=this.databaseId.database===je?`project_id=${r}`:`project_id=${r}&database_id=${s}`}I(e,t,r,s,i){const o=dr(),a=this.p(e,t.toUriEncodedString());B(Le,`Sending RPC '${e}' ${o}:`,a,r);const u={"google-cloud-resource-prefix":this.R,"x-goog-request-params":this.V};this.F(u,s,i);const{host:l}=new URL(a),c=Gt(l);return this.v(e,a,u,r,c).then(f=>(B(Le,`Received RPC '${e}' ${o}: `,f),f),f=>{throw Kt(Le,`RPC '${e}' ${o} failed with error: `,f,"url: ",a,"request:",r),f})}D(e,t,r,s,i,o){return this.I(e,t,r,s,i)}F(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Z}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s)}p(e,t){const r=fr[e];return`${this.A}/v1/${t}:${r}`}terminate(){}}/**
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
 */var Pt,p;function Rt(n){if(n===void 0)return be("RPC_ERROR","HTTP error has no status"),Y;switch(n){case 200:return $e;case 400:return j;case 401:return we;case 403:return Yt;case 404:return Ht;case 409:return Ze;case 416:return Zt;case 429:return Xt;case 499:return Xe;case 500:return Y;case 501:return et;case 503:return tn;case 504:return Wt;default:return n>=200&&n<300?$e:n>=400&&n<500?j:n>=500&&n<600?en:Y}}/**
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
 */(p=Pt||(Pt={}))[p.OK=0]="OK",p[p.CANCELLED=1]="CANCELLED",p[p.UNKNOWN=2]="UNKNOWN",p[p.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",p[p.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",p[p.NOT_FOUND=5]="NOT_FOUND",p[p.ALREADY_EXISTS=6]="ALREADY_EXISTS",p[p.PERMISSION_DENIED=7]="PERMISSION_DENIED",p[p.UNAUTHENTICATED=16]="UNAUTHENTICATED",p[p.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",p[p.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",p[p.ABORTED=10]="ABORTED",p[p.OUT_OF_RANGE=11]="OUT_OF_RANGE",p[p.UNIMPLEMENTED=12]="UNIMPLEMENTED",p[p.INTERNAL=13]="INTERNAL",p[p.UNAVAILABLE=14]="UNAVAILABLE",p[p.DATA_LOSS=15]="DATA_LOSS";class pr extends mr{S(e,t){throw new Error("Not supported by FetchConnection")}async v(e,t,r,s,i){var u;const o=JSON.stringify(s);let a;try{const l={method:"POST",headers:r,body:o};i&&(l.credentials="include"),a=await fetch(t,l)}catch(l){const c=l;throw new h(Rt(c.status),"Request failed with error: "+c.statusText)}if(!a.ok){let l=await a.json();Array.isArray(l)&&(l=l[0]);const c=(u=l==null?void 0:l.error)==null?void 0:u.message;throw new h(Rt(a.status),`Request failed with error: ${c??a.statusText}`)}return a.json()}}/**
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
 */function St(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function de(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}/**
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
 */class _r extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class U{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new _r("Invalid base64 string: "+i):i}}(e);return new U(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new U(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return T(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}U.EMPTY_BYTE_STRING=new U("");const gr=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Q(n){if(F(!!n,39018),typeof n=="string"){let e=0;const t=gr.exec(n);if(F(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:w(n.seconds),nanos:w(n.nanos)}}function w(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function ae(n){return typeof n=="string"?U.fromBase64String(n):U.fromUint8Array(n)}/**
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
 */function D(n,e){const t={typeString:n};return e&&(t.value=e),t}function fe(n,e){if(!on(n))throw new h(d,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new h(d,t);return!0}/**
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
 */const bt=-62135596800,kt=1e6;class V{static now(){return V.fromMillis(Date.now())}static fromDate(e){return V.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*kt);return new V(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new h(d,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new h(d,"Timestamp nanoseconds out of range: "+t);if(e<bt)throw new h(d,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new h(d,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/kt}_compareTo(e){return this.seconds===e.seconds?T(this.nanoseconds,e.nanoseconds):T(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:V._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(fe(e,V._jsonSchema))return new V(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-bt;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}V._jsonSchemaVersion="firestore/timestamp/1.0",V._jsonSchema={type:D("string",V._jsonSchemaVersion),seconds:D("number"),nanoseconds:D("number")};function ln(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{}).__type__)==null?void 0:r.stringValue)==="server_timestamp"}function cn(n){const e=n.mapValue.fields.__previous_value__;return ln(e)?cn(e):e}function ue(n){const e=Q(n.mapValue.fields.__local_write_time__.timestampValue);return new V(e.seconds,e.nanos)}/**
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
 */const hn="__type__",yr="__max__",ye={},dn="__vector__",Ve="value";function G(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ln(n)?4:function(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===yr}(n)?9007199254740991:function(t){var s,i;return((i=(((s=t==null?void 0:t.mapValue)==null?void 0:s.fields)||{})[hn])==null?void 0:i.stringValue)===dn}(n)?10:11:_(28295,{value:n})}function Ie(n,e){if(n===e)return!0;const t=G(n);if(t!==G(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return ue(n).isEqual(ue(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=Q(s.timestampValue),a=Q(i.timestampValue);return o.seconds===a.seconds&&o.nanos===a.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return ae(s.bytesValue).isEqual(ae(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return w(s.geoPointValue.latitude)===w(i.geoPointValue.latitude)&&w(s.geoPointValue.longitude)===w(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return w(s.integerValue)===w(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=w(s.doubleValue),a=w(i.doubleValue);return o===a?Ee(o)===Ee(a):isNaN(o)&&isNaN(a)}return!1}(n,e);case 9:return rn(n.arrayValue.values||[],e.arrayValue.values||[],Ie);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},a=i.mapValue.fields||{};if(St(o)!==St(a))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(a[u]===void 0||!Ie(o[u],a[u])))return!1;return!0}(n,e);default:return _(52216,{left:n})}}function le(n,e){return(n.values||[]).find(t=>Ie(t,e))!==void 0}function Ae(n,e){if(n===e)return 0;const t=G(n),r=G(e);if(t!==r)return T(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return T(n.booleanValue,e.booleanValue);case 2:return function(i,o){const a=w(i.integerValue||i.doubleValue),u=w(o.integerValue||o.doubleValue);return a<u?-1:a>u?1:a===u?0:isNaN(a)?isNaN(u)?0:-1:1}(n,e);case 3:return Ft(n.timestampValue,e.timestampValue);case 4:return Ft(ue(n),ue(e));case 5:return ze(n.stringValue,e.stringValue);case 6:return function(i,o){const a=ae(i),u=ae(o);return a.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const a=i.split("/"),u=o.split("/");for(let l=0;l<a.length&&l<u.length;l++){const c=T(a[l],u[l]);if(c!==0)return c}return T(a.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const a=T(w(i.latitude),w(o.latitude));return a!==0?a:T(w(i.longitude),w(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Nt(n.arrayValue,e.arrayValue);case 10:return function(i,o){var m,R,S,W;const a=i.fields||{},u=o.fields||{},l=(m=a[Ve])==null?void 0:m.arrayValue,c=(R=u[Ve])==null?void 0:R.arrayValue,f=T(((S=l==null?void 0:l.values)==null?void 0:S.length)||0,((W=c==null?void 0:c.values)==null?void 0:W.length)||0);return f!==0?f:Nt(l,c)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===ye&&o===ye)return 0;if(i===ye)return 1;if(o===ye)return-1;const a=i.fields||{},u=Object.keys(a),l=o.fields||{},c=Object.keys(l);u.sort(),c.sort();for(let f=0;f<u.length&&f<c.length;++f){const m=ze(u[f],c[f]);if(m!==0)return m;const R=Ae(a[u[f]],l[c[f]]);if(R!==0)return R}return T(u.length,c.length)}(n.mapValue,e.mapValue);default:throw _(23264,{C:t})}}function Ft(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return T(n,e);const t=Q(n),r=Q(e),s=T(t.seconds,r.seconds);return s!==0?s:T(t.nanos,r.nanos)}function Nt(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Ae(t[s],r[s]);if(i)return i}return T(t.length,r.length)}function Dt(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function fn(n){return!!n&&"arrayValue"in n}function xt(n){return!!n&&"nullValue"in n}function Ot(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Me(n){return!!n&&"mapValue"in n}function re(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return de(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=re(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=re(n.arrayValue.values[t]);return e}return{...n}}class Ct{constructor(e,t){this.position=e,this.inclusive=t}}/**
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
 */class mn{}class O extends mn{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new Tr(e,t,r):t==="array-contains"?new Vr(e,r):t==="in"?new Ir(e,r):t==="not-in"?new Ar(e,r):t==="array-contains-any"?new vr(e,r):new O(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new wr(e,r):new Er(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Ae(t,this.value)):t!==null&&G(this.value)===G(t)&&this.matchesComparison(Ae(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return _(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class me extends mn{constructor(e,t){super(),this.filters=e,this.op=t,this.N=null}static create(e,t){return new me(e,t)}matches(e){return function(r){return r.op==="and"}(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.N!==null||(this.N=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.N}getFilters(){return Object.assign([],this.filters)}}class Tr extends O{constructor(e,t,r){super(e,t,r),this.key=I.fromName(r.referenceValue)}matches(e){const t=I.comparator(e.key,this.key);return this.matchesComparison(t)}}class wr extends O{constructor(e,t){super(e,"in",t),this.keys=pn("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Er extends O{constructor(e,t){super(e,"not-in",t),this.keys=pn("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function pn(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>I.fromName(r.referenceValue))}class Vr extends O{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return fn(t)&&le(t.arrayValue,this.value)}}class Ir extends O{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&le(this.value.arrayValue,t)}}class Ar extends O{constructor(e,t){super(e,"not-in",t)}matches(e){if(le(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!le(this.value.arrayValue,t)}}class vr extends O{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!fn(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>le(this.value.arrayValue,r))}}/**
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
 */class Be{constructor(e,t="asc"){this.field=e,this.dir=t}}/**
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
 */class y{static fromTimestamp(e){return new y(e)}static min(){return new y(new V(0,0))}static max(){return new y(new V(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class ve{constructor(e,t){this.comparator=e,this.root=t||A.EMPTY}insert(e,t){return new ve(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,A.BLACK,null,null))}remove(e){return new ve(this.comparator,this.root.remove(e,this.comparator).copy(null,null,A.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Te(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Te(this.root,e,this.comparator,!1)}getReverseIterator(){return new Te(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Te(this.root,e,this.comparator,!0)}}class Te{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class A{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??A.RED,this.left=s??A.EMPTY,this.right=i??A.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new A(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return A.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return A.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,A.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,A.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw _(43730,{key:this.key,value:this.value});if(this.right.isRed())throw _(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw _(27949);return e+(this.isRed()?0:1)}}A.EMPTY=null,A.RED=!0,A.BLACK=!1;A.EMPTY=new class{constructor(){this.size=0}get key(){throw _(57766)}get value(){throw _(16141)}get color(){throw _(16727)}get left(){throw _(29726)}get right(){throw _(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new A(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class ce{constructor(e){this.comparator=e,this.data=new ve(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new qt(this.data.getIterator())}getIteratorFrom(e){return new qt(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof ce)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ce(this.comparator);return t.data=e,t}}class qt{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class K{constructor(e){this.fields=e,e.sort(P.comparator)}static empty(){return new K([])}unionWith(e){let t=new ce(P.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new K(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return rn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class b{constructor(e){this.value=e}static empty(){return new b({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Me(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=re(t)}setAll(e){let t=P.emptyPath(),r={},s=[];e.forEach((o,a)=>{if(!t.isImmediateParentOf(a)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=a.popLast()}o?r[a.lastSegment()]=re(o):s.push(a.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Me(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ie(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Me(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){de(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new b(re(this.value))}}/**
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
 */class q{constructor(e,t,r,s,i,o,a){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new q(e,0,y.min(),y.min(),y.min(),b.empty(),0)}static newFoundDocument(e,t,r,s){return new q(e,1,t,y.min(),r,s,0)}static newNoDocument(e,t){return new q(e,2,t,y.min(),y.min(),b.empty(),0)}static newUnknownDocument(e,t){return new q(e,3,t,y.min(),y.min(),b.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(y.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=b.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=b.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=y.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof q&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new q(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Pr{constructor(e,t=null,r=[],s=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=a,this.O=null}}function Lt(n,e=null,t=[],r=[],s=null,i=null,o=null){return new Pr(n,e,t,r,s,i,o)}/**
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
 */class nt{constructor(e,t=null,r=[],s=[],i=null,o="F",a=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=u,this.q=null,this.B=null,this.$=null,this.startAt,this.endAt}}function Rr(n){return n.collectionGroup!==null}function Sr(n){const e=he(n);if(e.q===null){e.q=[];const t=new Set;for(const i of e.explicitOrderBy)e.q.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new ce(P.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(l=>{l.isInequality()&&(a=a.add(l.field))})}),a})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.q.push(new Be(i,r))}),t.has(P.keyField().canonicalString())||e.q.push(new Be(P.keyField(),r))}return e.q}function br(n){const e=he(n);return e.B||(e.B=kr(e,Sr(n))),e.B}function kr(n,e){if(n.limitType==="F")return Lt(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Be(s.field,i)});const t=n.endAt?new Ct(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Ct(n.startAt.position,n.startAt.inclusive):null;return Lt(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Qe(n,e){const t=n.filters.concat([e]);return new nt(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}/**
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
 */function _n(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ee(e)?"-0":e}}function gn(n,e){return function(r){return typeof r=="number"&&Number.isInteger(r)&&!Ee(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}(e)?function(r){return{integerValue:""+r}}(e):_n(n,e)}/**
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
 */class Fe{constructor(){this._=void 0}}class Fr extends Fe{}class Nr extends Fe{constructor(e){super(),this.elements=e}}class Dr extends Fe{constructor(e){super(),this.elements=e}}class yn extends Fe{constructor(e,t){super(),this.serializer=e,this.k=t}}/**
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
 */class xr{constructor(e,t){this.field=e,this.transform=t}}class k{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new k}static exists(e){return new k(void 0,e)}static updateTime(e){return new k(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}class Ne{}class Tn extends Ne{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class rt extends Ne{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}class st extends Ne{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class wn extends Ne{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */const Or={asc:"ASCENDING",desc:"DESCENDING"},Cr={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},qr={and:"AND",or:"OR"};class Lr{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ge(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Mr(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Ur(n,e){return Ge(n,e.toTimestamp())}function se(n){return F(!!n,49232),y.fromTimestamp(function(t){const r=Q(t);return new V(r.seconds,r.nanos)}(n))}function it(n,e){return Ke(n,e).canonicalString()}function Ke(n,e){const t=function(s){return new g(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function Pe(n,e){return it(n.databaseId,e.path)}function Je(n,e){const t=function(s){const i=g.fromString(s);return F(Vn(i),10190,{key:i.toString()}),i}(e);if(t.get(1)!==n.databaseId.projectId)throw new h(d,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new h(d,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new I(function(s){return F(s.length>4&&s.get(4)==="documents",29091,{key:s.toString()}),s.popFirst(5)}(t))}function Mt(n,e,t){return{name:Pe(n,e),fields:t.value.mapValue.fields}}function $r(n,e){return"found"in e?function(r,s){F(!!s.found,43571),s.found.name,s.found.updateTime;const i=Je(r,s.found.name),o=se(s.found.updateTime),a=s.found.createTime?se(s.found.createTime):y.min(),u=new b({mapValue:{fields:s.found.fields}});return q.newFoundDocument(i,o,a,u)}(n,e):"missing"in e?function(r,s){F(!!s.missing,3894),F(!!s.readTime,22933);const i=Je(r,s.missing),o=se(s.readTime);return q.newNoDocument(i,o)}(n,e):_(7234,{result:e})}function jr(n,e){let t;if(e instanceof Tn)t={update:Mt(n,e.key,e.value)};else if(e instanceof st)t={delete:Pe(n,e.key)};else if(e instanceof rt)t={update:Mt(n,e.key,e.data),updateMask:Kr(e.fieldMask)};else{if(!(e instanceof wn))return _(16599,{L:e.type});t={verify:Pe(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const a=o.transform;if(a instanceof Fr)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof Nr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof Dr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof yn)return{fieldPath:o.field.canonicalString(),increment:a.k};throw _(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:Ur(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:_(27497)}(n,e.precondition)),t}function zr(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=function(l,c){return it(l.databaseId,c)}(n,s);const i=function(l){if(l.length!==0)return En(me.create(l,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(l){if(l.length!==0)return l.map(c=>function(m){return{field:H(m.field),direction:Br(m.dir)}}(c))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=function(l,c){return l.useProto3Json||un(c)?c:{value:c}}(n,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=function(l){return{before:l.inclusive,values:l.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(l){return{before:!l.inclusive,values:l.position}}(e.endAt)),{M:t,parent:s}}function Br(n){return Or[n]}function Qr(n){return Cr[n]}function Gr(n){return qr[n]}function H(n){return{fieldPath:n.canonicalString()}}function En(n){return n instanceof O?function(t){if(t.op==="=="){if(Ot(t.value))return{unaryFilter:{field:H(t.field),op:"IS_NAN"}};if(xt(t.value))return{unaryFilter:{field:H(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Ot(t.value))return{unaryFilter:{field:H(t.field),op:"IS_NOT_NAN"}};if(xt(t.value))return{unaryFilter:{field:H(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:H(t.field),op:Qr(t.op),value:t.value}}}(n):n instanceof me?function(t){const r=t.getFilters().map(s=>En(s));return r.length===1?r[0]:{compositeFilter:{op:Gr(t.op),filters:r}}}(n):_(54877,{filter:n})}function Kr(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Vn(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */function ot(n){return new Lr(n,!0)}/**
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
 */class In{constructor(e,t,r=1e3,s=1.5,i=6e4){this.U=e,this.timerId=t,this.j=r,this.W=s,this.K=i,this.G=0,this.J=null,this.H=Date.now(),this.reset()}reset(){this.G=0}Y(){this.G=this.K}Z(e){this.cancel();const t=Math.floor(this.G+this.X()),r=Math.max(0,Date.now()-this.H),s=Math.max(0,t-r);s>0&&B("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.G} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.J=this.U.enqueueAfterDelay(this.timerId,s,()=>(this.H=Date.now(),e())),this.G*=this.W,this.G<this.j&&(this.G=this.j),this.G>this.K&&(this.G=this.K)}tt(){this.J!==null&&(this.J.skipDelay(),this.J=null)}cancel(){this.J!==null&&(this.J.cancel(),this.J=null)}X(){return(Math.random()-.5)*this.G}}/**
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
 */class Jr{}class Wr extends Jr{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.et=!1}rt(){if(this.et)throw new h(j,"The client has already been terminated.")}I(e,t,r,s){return this.rt(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.I(e,Ke(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===we&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new h(Y,i.toString())})}D(e,t,r,s,i){return this.rt(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.D(e,Ke(t,r),s,o,a,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===we&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new h(Y,o.toString())})}terminate(){this.et=!0,this.connection.terminate()}}async function at(n,e){const t=he(n),r={writes:e.map(s=>jr(t.serializer,s))};await t.I("Commit",t.serializer.databaseId,g.emptyPath(),r)}async function An(n,e){const t=he(n),r={documents:e.map(a=>Pe(t.serializer,a))},s=await t.D("BatchGetDocuments",t.serializer.databaseId,g.emptyPath(),r,e.length),i=new Map;s.forEach(a=>{const u=$r(t.serializer,a);i.set(u.key.toString(),u)});const o=[];return e.forEach(a=>{const u=i.get(a.toString());F(!!u,55234,{key:a}),o.push(u)}),o}async function Hr(n,e){const t=he(n),{M:r,parent:s}=zr(t.serializer,br(e));return(await t.D("RunQuery",t.serializer.databaseId,s,{structuredQuery:r.structuredQuery})).filter(i=>!!i.document).map(i=>function(a,u,l){const c=Je(a,u.name),f=se(u.updateTime),m=u.createTime?se(u.createTime):y.min(),R=new b({mapValue:{fields:u.fields}}),S=q.newFoundDocument(c,f,m,R);return l?S.setHasCommittedMutations():S}(t.serializer,i.document,void 0))}/**
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
 */const vn="ComponentProvider",ie=new Map;function pe(n){if(n._terminated)throw new h(j,"The client has already been terminated.");if(!ie.has(n)){B(vn,"Initializing Datastore");const e=function(i){return new pr(i)}(function(i,o,a,u){return new or(i,o,a,u.host,u.ssl,u.experimentalForceLongPolling,u.experimentalAutoDetectLongPolling,an(u.experimentalLongPollingOptions),u.useFetchStreams,u.isUsingEmulator)}(n._databaseId,n.app.options.appId||"",n._persistenceKey,n._freezeSettings())),t=ot(n._databaseId),r=function(i,o,a,u){return new Wr(i,o,a,u)}(n._authCredentials,n._appCheckCredentials,e,t);ie.set(n,r)}return ie.get(n)}/**
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
 */const Yr=1048576,Pn="firestore.googleapis.com",Ut=!0;/**
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
 */class $t{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new h(d,"Can't provide ssl option if host option is not set");this.host=Pn,this.ssl=Ut}else this.host=e.host,this.ssl=e.ssl??Ut;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Yr)throw new h(d,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}(function(r,s,i,o){if(s===!0&&o===!0)throw new h(d,`${r} and ${i} cannot be used together.`)})("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=an(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new h(d,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new h(d,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new h(d,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class te{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new $t({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new h(j,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new h(j,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new $t(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new er;switch(r.type){case"firstParty":return new sr(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new h(d,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=ie.get(t);r&&(B(vn,"Removing Datastore"),ie.delete(t),r.terminate())}(this),Promise.resolve()}}function ms(n,e){const t=typeof n=="object"?n:zn(),r=typeof n=="string"?n:"(default)",s=Bn(t,"firestore/lite").getImmediate({identifier:r});if(!s._initialized){const i=Qn("firestore");i&&Xr(s,...i)}return s}function Xr(n,e,t,r={}){var l;n=ee(n,te);const s=Gt(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},a=`${e}:${t}`;s&&(Gn(`https://${a}`),Kn("Firestore",!0)),i.host!==Pn&&i.host!==a&&Kt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:a,ssl:s,emulatorOptions:r};if(!Jn(u,o)&&(n._setSettings(u),r.mockUserToken)){let c,f;if(typeof r.mockUserToken=="string")c=r.mockUserToken,f=v.MOCK_USER;else{c=Wn(r.mockUserToken,(l=n._app)==null?void 0:l.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new h(d,"mockUserToken must contain 'sub' or 'user_id' field!");f=new v(m)}n._authCredentials=new tr(new nn(c,f))}}/**
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
 */class J{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new J(this.firestore,e,this._query)}}class E{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new $(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new E(this.firestore,e,this._key)}toJSON(){return{type:E._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(fe(t,E._jsonSchema))return new E(e,r||null,new I(g.fromString(t.referencePath)))}}E._jsonSchemaVersion="firestore/documentReference/1.0",E._jsonSchema={type:D("string",E._jsonSchemaVersion),referencePath:D("string")};class $ extends J{constructor(e,t,r){super(e,t,function(i){return new nt(i)}(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new E(this.firestore,null,new I(e))}withConverter(e){return new $(this.firestore,e,this._path)}}function ps(n,e,...t){if(n=x(n),sn("collection","path",e),n instanceof te){const r=g.fromString(e,...t);return vt(r),new $(n,null,r)}{if(!(n instanceof E||n instanceof $))throw new h(d,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(g.fromString(e,...t));return vt(r),new $(n.firestore,null,r)}}function _s(n,e,...t){if(n=x(n),arguments.length===1&&(e=ur.newId()),sn("doc","path",e),n instanceof te){const r=g.fromString(e,...t);return At(r),new E(n,null,new I(r))}{if(!(n instanceof E||n instanceof $))throw new h(d,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(g.fromString(e,...t));return At(r),new E(n.firestore,n instanceof $?n.converter:null,new I(r))}}/**
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
 */class N{constructor(e){this._byteString=e}static fromBase64String(e){try{return new N(U.fromBase64String(e))}catch(t){throw new h(d,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new N(U.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:N._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(fe(e,N._jsonSchema))return N.fromBase64String(e.bytes)}}N._jsonSchemaVersion="firestore/bytes/1.0",N._jsonSchema={type:D("string",N._jsonSchemaVersion),bytes:D("string")};/**
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
 */class ne{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new h(d,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new P(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class De{constructor(e){this._methodName=e}}/**
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
 */class L{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new h(d,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new h(d,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return T(this._lat,e._lat)||T(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:L._jsonSchemaVersion}}static fromJSON(e){if(fe(e,L._jsonSchema))return new L(e.latitude,e.longitude)}}L._jsonSchemaVersion="firestore/geoPoint/1.0",L._jsonSchema={type:D("string",L._jsonSchemaVersion),latitude:D("number"),longitude:D("number")};/**
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
 */class M{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){/**
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
*/return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:M._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(fe(e,M._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new M(e.vectorValues);throw new h(d,"Expected 'vectorValues' field to be a number array")}}}M._jsonSchemaVersion="firestore/vectorValue/1.0",M._jsonSchema={type:D("string",M._jsonSchemaVersion),vectorValues:D("object")};/**
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
 */const Zr=/^__.*__$/;class es{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new rt(e,this.data,this.fieldMask,t,this.fieldTransforms):new Tn(e,this.data,t,this.fieldTransforms)}}class Rn{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new rt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Sn(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw _(40011,{it:n})}}class ut{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.st(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get it(){return this.settings.it}ot(e){return new ut({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}ut(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.ot({path:t,_t:!1});return r.ct(e),r}lt(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.ot({path:t,_t:!1});return r.st(),r}ht(e){return this.ot({path:void 0,_t:!0})}ft(e){return Re(e,this.settings.methodName,this.settings.dt||!1,this.path,this.settings.Et)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}st(){if(this.path)for(let e=0;e<this.path.length;e++)this.ct(this.path.get(e))}ct(e){if(e.length===0)throw this.ft("Document fields must not be empty");if(Sn(this.it)&&Zr.test(e))throw this.ft('Document fields cannot begin and end with "__"')}}class ts{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||ot(e)}Tt(e,t,r,s=!1){return new ut({it:e,methodName:t,Et:r,path:P.emptyPath(),_t:!1,dt:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function xe(n){const e=n._freezeSettings(),t=ot(n._databaseId);return new ts(n._databaseId,!!e.ignoreUndefinedProperties,t)}function bn(n,e,t,r,s,i={}){const o=n.Tt(i.merge||i.mergeFields?2:0,e,t,s);dt("Data must be an object, but it was:",o,r);const a=kn(r,o);let u,l;if(i.merge)u=new K(o.fieldMask),l=o.fieldTransforms;else if(i.mergeFields){const c=[];for(const f of i.mergeFields){const m=We(e,f,t);if(!o.contains(m))throw new h(d,`Field '${m}' is specified in your field mask but missing from your input data.`);Nn(c,m)||c.push(m)}u=new K(c),l=o.fieldTransforms.filter(f=>u.covers(f.field))}else u=null,l=o.fieldTransforms;return new es(new b(a),u,l)}class Oe extends De{_toFieldTransform(e){if(e.it!==2)throw e.it===1?e.ft(`${this._methodName}() can only appear at the top level of your update data`):e.ft(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Oe}}class lt extends De{constructor(e,t){super(e),this.At=t}_toFieldTransform(e){const t=new yn(e.serializer,gn(e.serializer,this.At));return new xr(e.path,t)}isEqual(e){return e instanceof lt&&this.At===e.At}}function ct(n,e,t,r){const s=n.Tt(1,e,t);dt("Data must be an object, but it was:",s,r);const i=[],o=b.empty();de(r,(u,l)=>{const c=ft(e,u,t);l=x(l);const f=s.lt(c);if(l instanceof Oe)i.push(c);else{const m=_e(l,f);m!=null&&(i.push(c),o.set(c,m))}});const a=new K(i);return new Rn(o,a,s.fieldTransforms)}function ht(n,e,t,r,s,i){const o=n.Tt(1,e,t),a=[We(e,r,t)],u=[s];if(i.length%2!=0)throw new h(d,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<i.length;m+=2)a.push(We(e,i[m])),u.push(i[m+1]);const l=[],c=b.empty();for(let m=a.length-1;m>=0;--m)if(!Nn(l,a[m])){const R=a[m];let S=u[m];S=x(S);const W=o.lt(R);if(S instanceof Oe)l.push(R);else{const Tt=_e(S,W);Tt!=null&&(l.push(R),c.set(R,Tt))}}const f=new K(l);return new Rn(c,f,o.fieldTransforms)}function ns(n,e,t,r=!1){return _e(t,n.Tt(r?4:3,e))}function _e(n,e){if(Fn(n=x(n)))return dt("Unsupported field value:",e,n),kn(n,e);if(n instanceof De)return function(r,s){if(!Sn(s.it))throw s.ft(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.ft(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings._t&&e.it!==4)throw e.ft("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const a of r){let u=_e(a,s.ht(o));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),o++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=x(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return gn(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=V.fromDate(r);return{timestampValue:Ge(s.serializer,i)}}if(r instanceof V){const i=new V(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Ge(s.serializer,i)}}if(r instanceof L)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof N)return{bytesValue:Mr(s.serializer,r._byteString)};if(r instanceof E){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.ft(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:it(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof M)return function(o,a){return{mapValue:{fields:{[hn]:{stringValue:dn},[Ve]:{arrayValue:{values:o.toArray().map(l=>{if(typeof l!="number")throw a.ft("VectorValues must only contain numeric values.");return _n(a.serializer,l)})}}}}}}(r,s);throw s.ft(`Unsupported field value: ${ke(r)}`)}(n,e)}function kn(n,e){const t={};return function(s){for(const i in s)if(Object.prototype.hasOwnProperty.call(s,i))return!1;return!0}(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):de(n,(r,s)=>{const i=_e(s,e.ut(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Fn(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof V||n instanceof L||n instanceof N||n instanceof E||n instanceof De||n instanceof M)}function dt(n,e,t){if(!Fn(t)||!on(t)){const r=ke(t);throw r==="an object"?e.ft(n+" a custom object"):e.ft(n+" "+r)}}function We(n,e,t){if((e=x(e))instanceof ne)return e._internalPath;if(typeof e=="string")return ft(n,e);throw Re("Field path arguments must be of type string or ",n,!1,void 0,t)}const rs=new RegExp("[~\\*/\\[\\]]");function ft(n,e,t){if(e.search(rs)>=0)throw Re(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ne(...e.split("."))._internalPath}catch{throw Re(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Re(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new h(d,a+n+u)}function Nn(n,e){return n.some(t=>t.isEqual(e))}/**
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
 */class Se{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new E(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Dn(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(xn("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Dn extends Se{data(){return super.data()}}class ss{constructor(e,t){this._docs=t,this.query=e}get docs(){return[...this._docs]}get size(){return this.docs.length}get empty(){return this.docs.length===0}forEach(e,t){this._docs.forEach(e,t)}}function xn(n,e){return typeof e=="string"?ft(n,e):e instanceof ne?e._internalPath:e._delegate._internalPath}/**
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
 */class mt{}class On extends mt{}function gs(n,e,...t){let r=[];e instanceof mt&&r.push(e),r=r.concat(t),function(i){const o=i.filter(u=>u instanceof pt).length,a=i.filter(u=>u instanceof Ce).length;if(o>1||o>0&&a>0)throw new h(d,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class Ce extends On{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Ce(e,t,r)}_apply(e){const t=this._parse(e);return Cn(e._query,t),new J(e.firestore,e.converter,Qe(e._query,t))}_parse(e){const t=xe(e.firestore);return function(i,o,a,u,l,c,f){let m;if(l.isKeyField()){if(c==="array-contains"||c==="array-contains-any")throw new h(d,`Invalid Query. You can't perform '${c}' queries on documentId().`);if(c==="in"||c==="not-in"){zt(f,c);const S=[];for(const W of f)S.push(jt(u,i,W));m={arrayValue:{values:S}}}else m=jt(u,i,f)}else c!=="in"&&c!=="not-in"&&c!=="array-contains-any"||zt(f,c),m=ns(a,o,f,c==="in"||c==="not-in");return O.create(l,c,m)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function ys(n,e,t){const r=e,s=xn("where",n);return Ce._create(s,r,t)}class pt extends mt{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new pt(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:me.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let o=s;const a=i.getFlattenedFilters();for(const u of a)Cn(o,u),o=Qe(o,u)}(e._query,t),new J(e.firestore,e.converter,Qe(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class _t extends On{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new _t(e,t,r)}_apply(e){return new J(e.firestore,e.converter,function(r,s,i){return new nt(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),s,i,r.startAt,r.endAt)}(e._query,this._limit,this._limitType))}}function Ts(n){return _t._create("limit",n,"F")}function jt(n,e,t){if(typeof(t=x(t))=="string"){if(t==="")throw new h(d,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Rr(e)&&t.indexOf("/")!==-1)throw new h(d,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(g.fromString(t));if(!I.isDocumentKey(r))throw new h(d,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Dt(n,new I(r))}if(t instanceof E)return Dt(n,t._key);throw new h(d,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ke(t)}.`)}function zt(n,e){if(!Array.isArray(n)||n.length===0)throw new h(d,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Cn(n,e){const t=function(s,i){for(const o of s)for(const a of o.getFlattenedFilters())if(i.indexOf(a.op)>=0)return a.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new h(d,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new h(d,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class is{convertValue(e,t="none"){switch(G(e)){case 0:return null;case 1:return e.booleanValue;case 2:return w(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(ae(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw _(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return de(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[Ve].arrayValue)==null?void 0:s.values)==null?void 0:i.map(o=>w(o.doubleValue));return new M(t)}convertGeoPoint(e){return new L(w(e.latitude),w(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=cn(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(ue(e));default:return null}}convertTimestamp(e){const t=Q(e);return new V(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=g.fromString(e);F(Vn(r),9688,{name:e});const s=new oe(r.get(1),r.get(3)),i=new I(r.popFirst(5));return s.isEqual(t)||be(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */function qn(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class gt extends is{constructor(e){super(),this.firestore=e}convertBytes(e){return new N(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new E(this.firestore,null,t)}}function ws(n){const e=pe((n=ee(n,E)).firestore),t=new gt(n.firestore);return An(e,[n._key]).then(r=>{F(r.length===1,15618);const s=r[0];return new Se(n.firestore,t,n._key,s.isFoundDocument()?s:null,n.converter)})}function Es(n){(function(s){if(s.limitType==="L"&&s.explicitOrderBy.length===0)throw new h(et,"limitToLast() queries require specifying at least one orderBy() clause")})((n=ee(n,J))._query);const e=pe(n.firestore),t=new gt(n.firestore);return Hr(e,n._query).then(r=>{const s=r.map(i=>new Dn(n.firestore,t,i.key,i,n.converter));return n._query.limitType==="L"&&s.reverse(),new ss(n,s)})}function Vs(n,e,t,...r){const s=xe((n=ee(n,E)).firestore);let i;return i=typeof(e=x(e))=="string"||e instanceof ne?ht(s,"updateDoc",n._key,e,t,r):ct(s,"updateDoc",n._key,e),at(pe(n.firestore),[i.toMutation(n._key,k.exists(!0))])}function Is(n){return new lt("increment",n)}/**
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
 */class os{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=xe(e)}set(e,t,r){this._verifyNotCommitted();const s=z(e,this._firestore),i=qn(s.converter,t,r),o=bn(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,k.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=z(e,this._firestore);let o;return o=typeof(t=x(t))=="string"||t instanceof ne?ht(this._dataReader,"WriteBatch.update",i._key,t,r,s):ct(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,k.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=z(e,this._firestore);return this._mutations=this._mutations.concat(new st(t._key,k.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new h(j,"A write batch can no longer be used after commit() has been called.")}}function z(n,e){if((n=x(n)).firestore!==e)throw new h(d,"Provided document reference is from a different Firestore instance.");return n}function As(n){const e=pe(n=ee(n,te));return new os(n,t=>at(e,t))}/**
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
 */class as{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new h(d,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await An(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new st(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{const s=I.fromPath(r);this.mutations.push(new wn(s,this.precondition(s)))}),await at(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw _(50498,{Rt:e.constructor.name});t=y.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new h(Ze,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(y.min())?k.exists(!1):k.updateTime(t):k.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(y.min()))throw new h(d,"Can't update a document that doesn't exist.");return k.updateTime(t)}return k.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
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
 */const us={maxAttempts:5};/**
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
 */class ls{constructor(e,t,r,s,i){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=s,this.deferred=i,this.Vt=r.maxAttempts,this.It=new In(this.asyncQueue,"transaction_retry")}yt(){this.Vt-=1,this.gt()}gt(){this.It.Z(async()=>{const e=new as(this.datastore),t=this.wt(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(s=>{this.Ft(s)}))}).catch(r=>{this.Ft(r)})})}wt(e){try{const t=this.updateFunction(e);return!un(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Ft(e){this.Vt>0&&this.vt(e)?(this.Vt-=1,this.asyncQueue.enqueueAndForget(()=>(this.gt(),Promise.resolve()))):this.deferred.reject(e)}vt(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!function(s){switch(s){case $e:return _(64938);case Xe:case Y:case Wt:case Xt:case en:case tn:case we:return!1;case d:case Ht:case Xn:case Yt:case j:case Ze:case Zt:case et:case Zn:return!0;default:return _(15467,{code:s})}}(t)}return!1}}/**
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
 */function Ue(){return typeof document<"u"?document:null}/**
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
 */class yt{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new tt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,a=new yt(e,t,o,s,i);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new h(Xe,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}/**
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
 */const Bt="AsyncQueue";class cs{constructor(e=Promise.resolve()){this.Dt=[],this.bt=!1,this.St=[],this.Ct=null,this.Nt=!1,this.Ot=!1,this.qt=[],this.It=new In(this,"async_queue_retry"),this.Bt=()=>{const r=Ue();r&&B(Bt,"Visibility state changed to "+r.visibilityState),this.It.tt()},this.$t=e;const t=Ue();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Bt)}get isShuttingDown(){return this.bt}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Qt(),this.kt(e)}enterRestrictedMode(e){if(!this.bt){this.bt=!0,this.Ot=e||!1;const t=Ue();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Bt)}}enqueue(e){if(this.Qt(),this.bt)return new Promise(()=>{});const t=new tt;return this.kt(()=>this.bt&&this.Ot?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Dt.push(e),this.Lt()))}async Lt(){if(this.Dt.length!==0){try{await this.Dt[0](),this.Dt.shift(),this.It.reset()}catch(e){if(!function(r){return r.name==="IndexedDbTransactionError"}(e))throw e;B(Bt,"Operation failed with retryable error: "+e)}this.Dt.length>0&&this.It.Z(()=>this.Lt())}}kt(e){const t=this.$t.then(()=>(this.Nt=!0,e().catch(r=>{throw this.Ct=r,this.Nt=!1,be("INTERNAL UNHANDLED ERROR: ",Qt(r)),r}).then(r=>(this.Nt=!1,r))));return this.$t=t,t}enqueueAfterDelay(e,t,r){this.Qt(),this.qt.indexOf(e)>-1&&(t=0);const s=yt.createAndSchedule(this,e,t,r,i=>this.Mt(i));return this.St.push(s),s}Qt(){this.Ct&&_(47125,{xt:Qt(this.Ct)})}verifyOperationInProgress(){}async Ut(){let e;do e=this.$t,await e;while(e!==this.$t)}jt(e){for(const t of this.St)if(t.timerId===e)return!0;return!1}zt(e){return this.Ut().then(()=>{this.St.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.St)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Ut()})}Wt(e){this.qt.push(e)}Mt(e){const t=this.St.indexOf(e);this.St.splice(t,1)}}function Qt(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
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
 */class hs{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=xe(e)}get(e){const t=z(e,this._firestore),r=new gt(this._firestore);return this._transaction.lookup([t._key]).then(s=>{if(!s||s.length!==1)return _(24041);const i=s[0];if(i.isFoundDocument())return new Se(this._firestore,r,i.key,i,t.converter);if(i.isNoDocument())return new Se(this._firestore,r,t._key,null,t.converter);throw _(18433,{doc:i})})}set(e,t,r){const s=z(e,this._firestore),i=qn(s.converter,t,r),o=bn(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,r);return this._transaction.set(s._key,o),this}update(e,t,r,...s){const i=z(e,this._firestore);let o;return o=typeof(t=x(t))=="string"||t instanceof ne?ht(this._dataReader,"Transaction.update",i._key,t,r,s):ct(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=z(e,this._firestore);return this._transaction.delete(t._key),this}}function vs(n,e,t){const r=pe(n=ee(n,te)),s={...us,...t};(function(a){if(a.maxAttempts<1)throw new h(d,"Max attempts must be at least 1")})(s);const i=new tt;return new ls(function(){return new cs}(),r,s,o=>e(new hs(n,o)),i).yt(),i.promise}(function(){(function(t){Z=t})(`${Yn}_lite`),Mn(new Un("firestore/lite",(e,{instanceIdentifier:t,options:r})=>{const s=e.getProvider("app").getImmediate(),i=new te(new nr(e.getProvider("auth-internal")),new ir(s,e.getProvider("app-check-internal")),function(a,u){if(!Object.prototype.hasOwnProperty.apply(a.options,["projectId"]))throw new h(d,'"projectId" not provided in firebase.initializeApp.');return new oe(a.options.projectId,u)}(s,t),s);return r&&i._setSettings(r),i},"PUBLIC").setMultipleInstances(!0)),wt("firestore-lite",Et,""),wt("firestore-lite",Et,"esm2020")})();export{ms as a,Es as b,ps as c,_s as d,As as e,ws as g,Is as i,Ts as l,gs as q,vs as r,Vs as u,ys as w};
