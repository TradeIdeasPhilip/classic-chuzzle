(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();var i={};Object.defineProperty(i,"__esModule",{value:!0});i.permutations=i.polarToRectangular=i.makeBoundedLinear=b=i.makeLinear=i.sum=i.countMap=I=i.initializedArray=i.count=i.zip=i.FIGURE_SPACE=i.NON_BREAKING_SPACE=i.dateIsValid=i.MIN_DATE=i.MAX_DATE=i.makePromise=i.filterMap=A=i.pick=i.pickAny=i.csvStringToArray=i.parseTimeT=i.parseIntX=i.parseFloatX=i.getAttribute=i.followPath=i.parseXml=i.testXml=i.sleep=P=i.assertClass=void 0;function N(t,e,n="Assertion Failed."){const r=o=>{throw new Error(`${n}  Expected type:  ${e.name}.  Found type:  ${o}.`)};if(t===null)r("null");else if(typeof t!="object")r(typeof t);else if(!(t instanceof e))r(t.constructor.name);else return t;throw new Error("wtf")}var P=i.assertClass=N;function z(t){return new Promise(e=>setTimeout(e,t))}i.sleep=z;function S(t){const n=new DOMParser().parseFromString(t,"application/xml");for(const r of Array.from(n.querySelectorAll("parsererror")))if(r instanceof HTMLElement)return{error:r};return{parsed:n}}i.testXml=S;function X(t){if(t!==void 0)return S(t)?.parsed?.documentElement}i.parseXml=X;function B(t,...e){for(const n of e){if(t===void 0)return;if(typeof n=="number")t=t.children[n];else{const r=t.getElementsByTagName(n);if(r.length!=1)return;t=r[0]}}return t}i.followPath=B;function _(t,e,...n){if(e=B(e,...n),e!==void 0&&e.hasAttribute(t))return e.getAttribute(t)??void 0}i.getAttribute=_;function L(t){if(t==null)return;const e=parseFloat(t);if(isFinite(e))return e}i.parseFloatX=L;function G(t){const e=L(t);if(e!==void 0)return e>Number.MAX_SAFE_INTEGER||e<Number.MIN_SAFE_INTEGER||e!=Math.floor(e)?void 0:e}i.parseIntX=G;function D(t){if(typeof t=="string"&&(t=G(t)),t!=null&&!(t<=0))return new Date(t*1e3)}i.parseTimeT=D;const O=t=>{const e=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,n=[[]];let r;for(;r=e.exec(t);)r[1].length&&r[1]!==","&&n.push([]),n[n.length-1].push(r[2]!==void 0?r[2].replace(/""/g,'"'):r[3]);return n};i.csvStringToArray=O;function x(t){const e=t.values().next();if(!e.done)return e.value}i.pickAny=x;function U(t){return t[Math.random()*t.length|0]}var A=i.pick=U;function H(t,e){const n=[];return t.forEach((r,o)=>{const s=e(r,o);s!==void 0&&n.push(s)}),n}i.filterMap=H;function $(){let t,e;return{promise:new Promise((r,o)=>{t=r,e=o}),resolve:t,reject:e}}i.makePromise=$;i.MAX_DATE=new Date(864e13);i.MIN_DATE=new Date(-864e13);function V(t){return isFinite(t.getTime())}i.dateIsValid=V;i.NON_BREAKING_SPACE=" ";i.FIGURE_SPACE=" ";function*Z(...t){const e=t.map(n=>n[Symbol.iterator]());for(;;){const n=e.map(r=>r.next());if(n.some(({done:r})=>r))break;yield n.map(({value:r})=>r)}}i.zip=Z;function*j(t=0,e=1/0,n=1){for(let r=t;r<e;r+=n)yield r}i.count=j;function k(t,e){const n=[];for(let r=0;r<t;r++)n.push(e(r));return n}var I=i.initializedArray=k;i.countMap=k;function q(t){return t.reduce((e,n)=>e+n,0)}i.sum=q;function K(t,e,n,r){const o=(r-e)/(n-t);return function(s){return(s-t)*o+e}}var b=i.makeLinear=K;function Q(t,e,n,r){n<t&&([t,e,n,r]=[n,r,t,e]);const o=(r-e)/(n-t);return function(s){return s<=t?e:s>=n?r:(s-t)*o+e}}i.makeBoundedLinear=Q;function Y(t,e){return{x:Math.sin(e)*t,y:Math.cos(e)*t}}i.polarToRectangular=Y;function*R(t,e=[]){if(t.length==0)yield e;else for(let n=0;n<t.length;n++){const r=t[n],o=[...e,r],s=[...t.slice(0,n),...t.slice(n+1)];yield*R(s,o)}}i.permutations=R;var u={};Object.defineProperty(u,"__esModule",{value:!0});u.download=u.createElementFromHTML=u.getHashInfo=u.getAudioBalanceControl=u.getBlobFromCanvas=u.loadDateTimeLocal=g=u.getById=void 0;const F=i;function J(t,e){const n=document.getElementById(t);if(!n)throw new Error("Could not find element with id "+t+".  Expected type:  "+e.name);if(n instanceof e)return n;throw new Error("Element with id "+t+" has type "+n.constructor.name+".  Expected type:  "+e.name)}var g=u.getById=J;function W(t,e,n="milliseconds"){let r;switch(n){case"minutes":{r=e.getSeconds()*1e3+e.getMilliseconds();break}case"seconds":{r=e.getMilliseconds();break}case"milliseconds":{r=0;break}default:throw new Error("wtf")}t.valueAsNumber=+e-e.getTimezoneOffset()*6e4-r}u.loadDateTimeLocal=W;function ee(t){const{reject:e,resolve:n,promise:r}=(0,F.makePromise)();return t.toBlob(o=>{o?n(o):e(new Error("blob is null!"))}),r}u.getBlobFromCanvas=ee;function te(t){const e=new AudioContext,n=e.createMediaElementSource(t),r=new StereoPannerNode(e,{pan:0});return n.connect(r).connect(e.destination),o=>{r.pan.value=o}}u.getAudioBalanceControl=te;function ne(){const t=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(r=>{const o=r.split("=",2);if(o.length==2){const s=decodeURIComponent(o[0]),a=decodeURIComponent(o[1]);t.set(s,a)}}),t}u.getHashInfo=ne;function re(t,e){var n=document.createElement("div");return n.innerHTML=t.trim(),(0,F.assertClass)(n.firstChild,e,"createElementFromHTML:")}u.createElementFromHTML=re;function oe(t,e){var n=document.createElement("a");if(n.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(e)),n.setAttribute("download",t),document.createEvent){var r=document.createEvent("MouseEvents");r.initEvent("click",!0,!0),n.dispatchEvent(r)}else n.click()}u.download=oe;{let t="☆";setInterval(()=>{document.title=`${t} Classic Chuzzle`,t=t=="☆"?"★":"☆"},1e3)}function y(t,e){const n=t%e;return n<0?n+Math.abs(e):n}const T=["red","green","blue","yellow","orange","violet"];class w{constructor(e){this.piece=e;const n=P(w.#t.cloneNode(!0),SVGGElement);this.element=n,n.setAttribute("fill",e.color),w.#e.appendChild(n)}static#e=g("board",SVGElement);static#t=g("piece",HTMLTemplateElement).content.querySelector("g");element;setPosition(e,n){this.element.setAttribute("transform",`translate(${n}, ${e})`)}remove(){this.element.remove()}}function ie(t,e){if((e|0)!=e)throw new Error(`invalid input: ${e}`);return e=y(e,t.length),e==0?t:[...t.slice(e),...t.slice(0,e)]}class E{constructor(e,n,r){this.row=e,this.column=n,this.piece=r,this.#e=new M(this)}#e;get color(){return this.piece.color}static createAll(e){return e.map((n,r)=>n.map((o,s)=>new E(r,s,o)))}tryCombine(e){if(this.#e!=e.#e&&this.color==e.color&&(this.#e.consume(e.#e).forEach(r=>r.#e=this.#e),!this.#e.valid))throw window.showGreen(),new Error("wtf")}static combineAll(e){window.showGreen=()=>{const n=[],r=[];e.forEach(o=>{o.forEach(s=>{s.color=="green"&&(n.push(s.#e.debugInfo()),r.push(s.#e))})}),console.table(n),console.log(r)},e.forEach((n,r)=>{n.forEach((o,s)=>{if(r){const a=r-1,c=e[a][s];o.tryCombine(c)}if(s){const a=s-1,c=n[a];o.tryCombine(c)}})}),delete window.showGreen}static findBigGroups(e){const n=new Map;e.forEach(o=>o.forEach(s=>{const a=s.#e,c=n.get(a)??0;n.set(a,c+1)}));const r=[];for(const[o,s]of n)s>=3&&r.push(o);return r}static findActionable(e){const n=this.createAll(e);return this.combineAll(n),this.findBigGroups(n)}}class M{#e=new Set;get contents(){return this.#e}static#t=0;#n=M.#t++;debugInitialGroup;debugInfo(){return{row:this.debugInitialGroup.row,column:this.debugInitialGroup.column,contents:this.valid?this.#e.size:"invalid",id:this.#n}}constructor(e){this.debugInitialGroup=e,this.#e.add(e)}consume(e){const n=this.#e,r=e.#e;return r.forEach(o=>n.add(o)),e.#e=void 0,r}get valid(){return!!this.#e?.has(this.debugInitialGroup)}}class f{constructor(e){this.allPieces=e}static SIZE=6;static createRandom(){const e=I(f.SIZE,()=>I(f.SIZE,()=>({weight:1,color:A(T)})));return E.findActionable(e).forEach(r=>{r.contents.forEach(({row:o,column:s})=>{const a=new Set;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([c,l])=>{const p=e[o+c];if(p){const d=p[s+l];d&&a.add(d.color)}}),e[o][s]={color:A(T.filter(c=>!a.has(c))),weight:1}})}),new this(e)}static QUICK=this.createRandom();rotateLeft(e,n){const r=this.allPieces[e],o=ie(r,n);return r==o?this:new f(this.allPieces.map(s=>s==r?o:s))}rotateUp(e,n){const r=this.allPieces.length;return n=y(n,r),n==0?this:new f(this.allPieces.map((o,s)=>{const a=[...o];return a[e]=this.allPieces[(s+n)%r][e],a}))}}class h{constructor(){throw h.#n,new Error("wtf")}static#e=[];static#t=f.createRandom();static get currentBoard(){return this.#t}static set currentBoard(e){this.#t=e,this.draw(e),this.hideTemporaries()}static hideTemporaries(){}static draw(e){this.resetAll(),this.#e=e.allPieces.map((n,r)=>n.map((o,s)=>{const a=new w(o);return a.setPosition(r,s),a}))}static resetAll(){this.#e.forEach(e=>{e.forEach(n=>{n.remove()})}),this.#e=[],this.hideTemporaries()}static#n=(()=>{this.draw(this.#t);const e=g("board",SVGElement);function n(c){const l=e.getBoundingClientRect(),p=b(l.top,0,l.bottom,f.SIZE),d=b(l.left,0,l.right,f.SIZE);return{row:p(c.clientY),column:d(c.clientX)}}let r="none",o=-1,s=-1,a=-1;e.addEventListener("pointerdown",c=>{if(r=="none"){c.stopPropagation(),r="started",e.setPointerCapture(c.pointerId);const l=n(c);o=l.row,s=l.column,e.style.cursor="move"}}),e.addEventListener("pointermove",c=>{if(r=="none")return;c.stopPropagation();const l=n(c);if(r=="started"){const d=Math.abs(l.row-o),m=Math.abs(l.column-s);if(Math.max(d,m)<.05)return;if(d>m)r="vertical",e.style.cursor="ns-resize",a=Math.floor(s);else if(m>d)r="horizontal",e.style.cursor="ew-resize",a=Math.floor(o);else return;a=Math.max(0,Math.min(f.SIZE,a))}const p=d=>y(d+.5,f.SIZE)-.5;if(r=="horizontal"){const d=s-l.column;this.#e[a].forEach((v,C)=>{v.setPosition(a,p(C-d))})}else if(r=="vertical"){const d=o-l.row;this.#e.forEach((m,v)=>{m[a].setPosition(p(v-d),a)})}}),e.addEventListener("lostpointercapture",c=>{if(r=="none")return;const l=n(c);r=="horizontal"?this.currentBoard=this.currentBoard.rotateLeft(a,Math.round(s-l.column)):r=="vertical"?this.currentBoard=this.currentBoard.rotateUp(a,Math.round(o-l.row)):r=="started"&&this.draw(this.currentBoard),r="none",e.style.cursor=""})})()}function se(){const t=E.findActionable(h.currentBoard.allPieces);console.log(t)}window.checkGroups=se;window.rotateLeft=(t,e)=>{h.currentBoard=h.currentBoard.rotateLeft(t,e)};window.rotateUp=(t,e)=>{h.currentBoard=h.currentBoard.rotateUp(t,e)};{const t=["pointerover","pointerenter","pointerdown","pointermove","pointerup","pointercancel","pointerout","pointerleave","gotpointercapture","lostpointercapture"],e=document.createElement("div");document.body.appendChild(e);const n=document.querySelector("svg");t.forEach(r=>{let o=document.createElement("div");o.innerText=r,o.style.color="lightgrey",e.appendChild(o),n.addEventListener(r,s=>{o.remove(),o=document.createElement("div"),o.innerText=r,o.classList.add("event-fired"),e.insertBefore(o,e.firstElementChild)})})}
